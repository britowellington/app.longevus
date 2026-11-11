(function() {
  const { useState, useEffect, useRef } = React;
  const SUPA_URL = "https://jpduxfbigcdxmtcozqpp.supabase.co";
  const SUPA_KEY = "sb_publishable_VZSgcxu5ps3eR9UAjuRr4Q_B65WTx_h";
  const nutriSupa = () => window.__LV_SUPA;
  const antroSupa = () => window.__LV_SUPA;
  const NUTRI_MACROS = [
    { k: "prot", nome: "Proteína", curto: "P" },
    { k: "carb", nome: "Carboidratos", curto: "C" },
    { k: "gord", nome: "Gorduras", curto: "G" },
    { k: "fibra", nome: "Fibras", curto: "F" }
  ];
  const NUTRI_TIPOS = [
    ["cafe", "Café da manhã"],
    ["lanche_manha", "Lanche da manhã"],
    ["almoco", "Almoço"],
    ["lanche_tarde", "Lanche da tarde"],
    ["jantar", "Jantar"],
    ["ceia", "Ceia"]
  ];
  const NUTRI_TIPOS_FIXOS = ["cafe", "almoco", "lanche_tarde", "jantar"];
  const NUTRI_LIMITE_DIA = 15;
  const NUTRI_OBJETIVOS = [["manter", "Manter"], ["massa", "Ganhar massa"], ["gordura", "Perder gordura"]];
  const NUTRI_FATORES = { manter: { prot: 1.2, carb: 3, gord: 0.9 }, massa: { prot: 1.6, carb: 3.5, gord: 1 }, gordura: { prot: 1.5, carb: 2, gord: 0.8 } };
  const nutriSugerirMacros = (peso, objetivo, kcalRef) => {
    if (!peso) return null;
    const fx = NUTRI_FATORES[objetivo] || NUTRI_FATORES.manter;
    const prot = Math.round(peso * fx.prot / 5) * 5;
    const kcal = nutriNum(kcalRef);
    let gord, carb;
    if (kcal) {
      gord = Math.max(Math.round(peso * 0.6 / 5) * 5, Math.round(kcal * (objetivo === "massa" ? 0.25 : 0.28) / 9 / 5) * 5);
      carb = Math.max(Math.round(peso * 1.5 / 10) * 10, Math.round((kcal - prot * 4 - gord * 9) / 4 / 10) * 10);
    } else {
      gord = Math.round(peso * fx.gord / 5) * 5;
      carb = Math.round(peso * fx.carb / 10) * 10;
    }
    const total = kcal || prot * 4 + carb * 4 + gord * 9;
    return { prot, carb, gord, fibra: Math.max(25, Math.round(total / 1e3 * 14)), kcalBase: kcal ? Math.round(kcal) : null };
  };
  const NUTRI_ESCURO = "#0f172a";
  const NUTRI_LARANJA = "#FF5603";
  const NUTRI_LARANJA_TXT = "#c2410c";
  const nutriTipoNome = (k) => (NUTRI_TIPOS.find((t) => t[0] === k) || [k, "Refeição"])[1];
  const nutriISO = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const nutriHoje = () => nutriISO(/* @__PURE__ */ new Date());
  const nutriDiaMais = (iso, n) => {
    const p = iso.split("-").map(Number);
    return nutriISO(new Date(p[0], p[1] - 1, p[2] + n));
  };
  const nutriNum = (v) => {
    const n = parseFloat(String(v == null ? "" : v).replace(",", "."));
    return isFinite(n) && n > 0 ? n : 0;
  };
  const nutriFmt = (n) => {
    const v = Math.round(nutriNum(n));
    return v.toLocaleString("pt-BR");
  };
  const nutriId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const nutriZero = () => ({ kcal: 0, prot: 0, carb: 0, gord: 0, fibra: 0 });
  const nutriSomar = (lista) => (lista || []).reduce((t, i) => ({
    kcal: t.kcal + nutriNum(i.kcal),
    prot: t.prot + nutriNum(i.prot),
    carb: t.carb + nutriNum(i.carb),
    gord: t.gord + nutriNum(i.gord),
    fibra: t.fibra + nutriNum(i.fibra)
  }), nutriZero());
  const nutriDataCurta = (iso) => {
    if (!iso) return "";
    const p = iso.slice(0, 10).split("-");
    return p[2] + "/" + p[1];
  };
  const nutriDiaSemana = (iso) => {
    const p = iso.split("-").map(Number);
    return ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][new Date(p[0], p[1] - 1, p[2]).getDay()];
  };
  const nutriApi = {
    async headers() {
      var _a;
      const { data } = await nutriSupa().auth.getSession();
      const token = ((_a = data == null ? void 0 : data.session) == null ? void 0 : _a.access_token) || SUPA_KEY;
      return { "apikey": SUPA_KEY, "Authorization": "Bearer " + token, "Content-Type": "application/json" };
    },
    async usuarioId() {
      var _a, _b;
      const { data } = await nutriSupa().auth.getSession();
      return ((_b = (_a = data == null ? void 0 : data.session) == null ? void 0 : _a.user) == null ? void 0 : _b.id) || null;
    },
    async listar(studentId, desde, ate) {
      try {
        const h = await this.headers();
        const q = "select=id,data&student_id=eq." + encodeURIComponent(studentId) + "&data->>date=gte." + desde + "&data->>date=lte." + ate + "&order=created_at.asc&limit=500";
        const r = await fetch(SUPA_URL + "/rest/v1/refeicoes_registro?" + q, { headers: h });
        if (!r.ok) return null;
        const rows = await r.json();
        return (rows || []).filter((x) => x && x.data).map((x) => ({ ...x.data, id: x.id }));
      } catch (e) {
        return null;
      }
    },
    async salvar(studentId, ownerId, refeicao) {
      try {
        const h = { ...await this.headers(), "Prefer": "resolution=merge-duplicates" };
        const { id, ...data } = refeicao;
        const body = { id, data, owner_id: ownerId, student_id: studentId, updated_at: (/* @__PURE__ */ new Date()).toISOString() };
        const r = await fetch(SUPA_URL + "/rest/v1/refeicoes_registro", { method: "POST", headers: h, body: JSON.stringify(body) });
        return r.ok;
      } catch (e) {
        return false;
      }
    },
    async remover(id) {
      try {
        const h = await this.headers();
        const r = await fetch(SUPA_URL + "/rest/v1/refeicoes_registro?id=eq." + encodeURIComponent(id), { method: "DELETE", headers: h });
        return r.ok;
      } catch (e) {
        return false;
      }
    },
    async metas(studentId) {
      try {
        const h = await this.headers();
        const r = await fetch(SUPA_URL + "/rest/v1/metas_alimentares?select=data&student_id=eq." + encodeURIComponent(studentId) + "&limit=1", { headers: h });
        if (!r.ok) return null;
        const rows = await r.json();
        return rows && rows.length ? rows[0].data || {} : {};
      } catch (e) {
        return null;
      }
    },
    async salvarMetas(studentId, ownerId, metas) {
      try {
        const h = { ...await this.headers(), "Prefer": "resolution=merge-duplicates" };
        const body = { id: "meta_" + studentId, data: metas, owner_id: ownerId, student_id: studentId, updated_at: (/* @__PURE__ */ new Date()).toISOString() };
        const r = await fetch(SUPA_URL + "/rest/v1/metas_alimentares", { method: "POST", headers: h, body: JSON.stringify(body) });
        return r.ok;
      } catch (e) {
        return false;
      }
    },
    async analisar(payload) {
      const h = await this.headers();
      let r;
      const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
      const timer = setTimeout(() => {
        if (ctrl) ctrl.abort();
      }, 45e3);
      try {
        r = await fetch(SUPA_URL + "/functions/v1/analisar-refeicao", { method: "POST", headers: h, body: JSON.stringify(payload), signal: ctrl ? ctrl.signal : void 0 });
      } catch (e) {
        clearTimeout(timer);
        if (e && e.name === "AbortError") throw new Error("A análise demorou demais. Tente de novo, descreva a refeição em texto ou preencha manualmente.");
        throw new Error("Não consegui conectar ao serviço de análise. Tente de novo em instantes ou preencha manualmente.");
      }
      clearTimeout(timer);
      let j = null;
      try {
        j = await r.json();
      } catch (e) {
      }
      if (!r.ok || !j || j.erro) {
        const msg = j && j.erro || "Falha na análise (HTTP " + r.status + ")";
        const det = j && j.detalhe ? String(j.detalhe).slice(0, 220) : "";
        throw new Error(det ? msg + "\n\nDetalhe técnico: " + det : msg);
      }
      return j;
    }
  };
  const nutriComprimirFoto = (file) => new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("Não consegui ler a foto."));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Formato de foto não suportado."));
      img.onload = () => {
        const max = 1024;
        const esc = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * esc), h = Math.round(img.height * esc);
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        const url = c.toDataURL("image/jpeg", 0.72);
        c.width = 0;
        c.height = 0;
        resolve(url.split(",")[1]);
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
  const nutriUsoHoje = {
    chave: () => "nutri_uso_" + nutriHoje(),
    get() {
      try {
        return parseInt(localStorage.getItem(this.chave()) || "0", 10) || 0;
      } catch (e) {
        return 0;
      }
    },
    somar() {
      try {
        localStorage.setItem(this.chave(), String(this.get() + 1));
      } catch (e) {
      }
    }
  };
  const NutriBarra = ({ valor, meta, cor, fundo, altura }) => {
    const pct = meta ? Math.min(100, Math.round(nutriNum(valor) / meta * 100)) : 0;
    return /* @__PURE__ */ React.createElement("div", { style: { height: altura || 8, borderRadius: 99, background: fundo || "#e2e8f0", overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: pct + "%", height: "100%", borderRadius: 99, background: cor || NUTRI_LARANJA, transition: "width 0.3s" } }));
  };
  const NutriResumoDia = ({ totais, metas, qtd, energia }) => {
    const m = metas || {};
    const eOk = energia && !energia.semTmb;
    const resta = eOk ? energia.meta - Math.round(totais.kcal) : 0;
    const faltaProt = m.prot ? Math.max(0, Math.round(m.prot - totais.prot)) : null;
    return /* @__PURE__ */ React.createElement("div", { style: { background: NUTRI_ESCURO, color: "#f8fafc", borderRadius: 18, padding: 18, marginBottom: 14 } }, eOk ? /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 10, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#cbd5e1" } }, resta >= 0 ? "Ainda pode consumir" : "Passou da meta em"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 34, fontWeight: 800, color: "#fb923c" } }, nutriFmt(Math.abs(resta)), " kcal")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#cbd5e1", textAlign: "right" } }, "meta", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("b", { style: { color: "#f8fafc" } }, nutriFmt(energia.meta), " kcal"))), /* @__PURE__ */ React.createElement(NutriBarra, { valor: totais.kcal, meta: energia.meta, cor: "#fb923c", fundo: "#334155", altura: 10 }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8 } }, /* @__PURE__ */ React.createElement("span", null, "Consumido ", /* @__PURE__ */ React.createElement("b", null, nutriFmt(totais.kcal), " kcal")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "#cbd5e1" } }, qtd, " ", qtd === 1 ? "refeição" : "refeições"))) : /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 34, fontWeight: 800 } }, nutriFmt(totais.kcal)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "#cbd5e1" } }, "kcal", m.kcal ? " de " + nutriFmt(m.kcal) : "")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "#cbd5e1" } }, qtd, " ", qtd === 1 ? "refeição" : "refeições")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700 } }, "Proteína"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", { style: { color: "#fb923c" } }, nutriFmt(totais.prot), " g"), /* @__PURE__ */ React.createElement("span", { style: { color: "#cbd5e1" } }, m.prot ? " de " + nutriFmt(m.prot) + " g" : ""))), /* @__PURE__ */ React.createElement(NutriBarra, { valor: totais.prot, meta: m.prot || 0, cor: "#fb923c", fundo: "#334155", altura: 10 }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#cbd5e1", marginTop: 6, marginBottom: 14 } }, m.prot ? faltaProt > 0 ? "Faltam " + faltaProt + " g para a meta de hoje" : "Meta de proteína atingida" : "Defina suas metas para acompanhar o progresso"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 } }, NUTRI_MACROS.slice(1).map((mc) => /* @__PURE__ */ React.createElement("div", { key: mc.k, style: { background: "#1e293b", borderRadius: 12, padding: "9px 10px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#cbd5e1" } }, mc.nome), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700, margin: "2px 0 6px" } }, nutriFmt(totais[mc.k]), " g", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 500, color: "#94a3b8" } }, m[mc.k] ? " / " + nutriFmt(m[mc.k]) : "")), /* @__PURE__ */ React.createElement(NutriBarra, { valor: totais[mc.k], meta: m[mc.k] || 0, cor: "#e2e8f0", fundo: "#334155", altura: 4 })))));
  };
  const NutriStepper = ({ nome, dica, valor, un, passo, onChange, compacto, primeiro }) => {
    const b = compacto ? 34 : 40;
    const caixa = compacto ? { padding: "7px 0", borderTop: primeiro ? "none" : "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } : { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "8px 10px 8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 };
    const bt = { width: b, height: b, borderRadius: b / 2, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: compacto ? 18 : 20, lineHeight: 1, padding: 0, cursor: "pointer", color: "#0f172a", flexShrink: 0 };
    return /* @__PURE__ */ React.createElement("div", { style: caixa }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: compacto ? 13.5 : 14, fontWeight: 700 } }, nome), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, dica)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: compacto ? 2 : 4, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("button", { type: "button", "aria-label": "Diminuir " + nome, onClick: () => onChange(Math.max(0, nutriNum(valor) - passo)), style: bt }, "−"), /* @__PURE__ */ React.createElement("input", { inputMode: "decimal", value: valor === "" || valor == null ? "" : String(valor), onChange: (e) => onChange(e.target.value.replace(/[^0-9.,]/g, "")), placeholder: "—", style: { width: compacto ? 50 : 62, height: b, textAlign: "center", border: "none", background: "transparent", fontSize: compacto ? 15 : 16, fontWeight: 800, fontFamily: "inherit", color: "#0f172a", padding: 0 } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11.5, color: "#64748b", width: compacto ? 22 : 26 } }, un), /* @__PURE__ */ React.createElement("button", { type: "button", "aria-label": "Aumentar " + nome, onClick: () => onChange(nutriNum(valor) + passo), style: bt }, "+")));
  };
  const NUTRI_AJUSTE_KCAL = { manter: 0, massa: 250, gordura: -400 };
  const NutriMetasEditor = ({ studentId, ownerId, metas, papel, pesoSugerido, kcalRef, objetivoPlano, tmbRef, onSalvo, onCancelar, compacto }) => {
    const ini = metas || {};
    const kcalSug = (obj) => tmbRef && tmbRef.v ? Math.max(tmbRef.v, Math.round((tmbRef.v * 1.35 + (NUTRI_AJUSTE_KCAL[obj] || 0)) / 50) * 50) : null;
    const objPlano = objetivoPlano === "emagrecer" ? "gordura" : objetivoPlano === "massa" ? "massa" : objetivoPlano === "manter" ? "manter" : null;
    const [f, setF] = useState(() => {
      const b = {
        peso: String(pesoSugerido && pesoSugerido.v || ini.peso || "").replace(".", ","),
        objetivo: ini.objetivo || objPlano || "manter",
        kcal: ini.kcal || "",
        prot: ini.prot || "",
        carb: ini.carb || "",
        gord: ini.gord || "",
        fibra: ini.fibra || ""
      };
      if (!kcalRef && !nutriNum(b.kcal)) {
        const k = kcalSug(b.objetivo);
        if (k) {
          b.kcal = k;
          b.sugerido = true;
        }
      }
      const sug = nutriSugerirMacros(nutriNum(b.peso), b.objetivo, kcalRef || nutriNum(b.kcal));
      if (sug) ["prot", "carb", "gord", "fibra"].forEach((k) => {
        if (!nutriNum(b[k])) {
          b[k] = sug[k];
          b.sugerido = true;
        }
      });
      return b;
    });
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
    const peso = nutriNum(f.peso);
    const aplicarSugestao = (objetivo) => {
      const k = kcalRef ? null : kcalSug(objetivo) || nutriNum(f.kcal) || null;
      const sug = nutriSugerirMacros(peso, objetivo, kcalRef || k);
      if (!sug) {
        setF((p) => ({ ...p, objetivo, kcal: k || p.kcal }));
        setErro("Informe o peso para calcular a sugestão.");
        return;
      }
      setErro("");
      setF((p) => ({ ...p, objetivo, kcal: k || p.kcal, prot: sug.prot, carb: sug.carb, gord: sug.gord, fibra: sug.fibra, sugerido: true }));
    };
    const usarBase = () => aplicarSugestao(f.objetivo);
    const gpk = (k) => peso && nutriNum(f[k]) ? (Math.round(nutriNum(f[k]) / peso * 10) / 10).toString().replace(".", ",") + " g por kg" : "por dia";
    const nomeObj = (NUTRI_OBJETIVOS.find((o) => o[0] === f.objetivo) || ["", "Manter"])[1];
    const salvar = async () => {
      setSalvando(true);
      setErro("");
      const limpo = { ...ini, peso: nutriNum(f.peso) || null, objetivo: f.objetivo };
      ["kcal", "prot", "carb", "gord", "fibra"].forEach((k) => {
        limpo[k] = nutriNum(f[k]) || null;
      });
      limpo.atualizadoPor = papel;
      limpo.atualizadoEm = (/* @__PURE__ */ new Date()).toISOString();
      const ok = await nutriApi.salvarMetas(studentId, ownerId, limpo);
      setSalvando(false);
      if (!ok) {
        setErro("Não consegui salvar. Confira a conexão e tente de novo.");
        return;
      }
      onSalvo && onSalvo(limpo);
    };
    const porKg = peso && nutriNum(f.prot) ? (Math.round(nutriNum(f.prot) / peso * 10) / 10).toString().replace(".", ",") + " g por kg" : "por dia";
    const quem = ini.atualizadoPor ? "Atualizado " + (ini.atualizadoPor === papel ? "por você" : ini.atualizadoPor === "aluno" ? "pelo aluno" : "pelo professor") + " em " + nutriDataCurta(ini.atualizadoEm) : "";
    const temPlano = !!(ini.energia && ini.energia.objetivo);
    if (compacto) return /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 auto", minHeight: 0, overflowY: "auto", padding: "12px 18px 6px", display: "flex", flexDirection: "column", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", borderRadius: 16, boxShadow: "0 1px 2px rgba(15,23,42,0.06)", padding: "10px 14px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "baseline", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "#64748b" } }, "Peso"), /* @__PURE__ */ React.createElement("input", { inputMode: "decimal", value: String(f.peso || ""), onChange: (e) => set("peso")(e.target.value.replace(/[^0-9.,]/g, "")), placeholder: "—", style: { width: 54, border: "none", borderBottom: "1.5px solid #e2e8f0", fontSize: 17, fontWeight: 800, fontFamily: "inherit", padding: "2px 0", color: "#0f172a", background: "transparent" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "#64748b" } }, "kg")), pesoSugerido && pesoSugerido.v ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "#64748b", textAlign: "right" } }, "último: " + String(pesoSugerido.v).replace(".", ",") + " kg" + (pesoSugerido.date ? " em " + nutriDataCurta(pesoSugerido.date) : "")) : null), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 4, background: "#F1F5F9", borderRadius: 12, padding: 3, marginTop: 10 } }, NUTRI_OBJETIVOS.map((o) => {
      const ativo = f.objetivo === o[0];
      return /* @__PURE__ */ React.createElement("button", { key: o[0], type: "button", onClick: () => aplicarSugestao(o[0]), style: { height: 32, borderRadius: 9, border: "none", background: ativo ? NUTRI_ESCURO : "transparent", color: ativo ? "#fff" : "#475569", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", padding: 0 } }, o[1]);
    })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "#64748b", lineHeight: 1.35 } }, f.sugerido ? kcalRef ? "Macros fechando a meta de calorias." : "Sugestão pelo seu peso e objetivo." : "Ajuste o que precisar."), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: usarBase, style: { background: "transparent", border: "none", padding: "6px 0", color: NUTRI_LARANJA_TXT, fontSize: 12.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", textDecoration: "underline" } }, "Recalcular"))), /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", borderRadius: 16, boxShadow: "0 1px 2px rgba(15,23,42,0.06)", padding: "2px 12px 2px 14px" } }, temPlano ? /* @__PURE__ */ React.createElement("div", { style: { padding: "9px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13.5, fontWeight: 700 } }, "Calorias"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#64748b" } }, "do seu plano, muda com o treino")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800, whiteSpace: "nowrap" } }, kcalRef ? nutriFmt(kcalRef) + " kcal" : "—")) : /* @__PURE__ */ React.createElement(NutriStepper, { compacto: true, primeiro: true, nome: "Calorias", dica: tmbRef && tmbRef.v ? "TMB " + nutriFmt(tmbRef.v) : "opcional", valor: f.kcal, un: "kcal", passo: 50, onChange: set("kcal") }), /* @__PURE__ */ React.createElement(NutriStepper, { compacto: true, nome: "Proteína", dica: porKg, valor: f.prot, un: "g", passo: 5, onChange: set("prot") }), /* @__PURE__ */ React.createElement(NutriStepper, { compacto: true, nome: "Carboidratos", dica: gpk("carb"), valor: f.carb, un: "g", passo: 10, onChange: set("carb") }), /* @__PURE__ */ React.createElement(NutriStepper, { compacto: true, nome: "Gorduras", dica: gpk("gord"), valor: f.gord, un: "g", passo: 5, onChange: set("gord") }), /* @__PURE__ */ React.createElement(NutriStepper, { compacto: true, nome: "Fibras", dica: "referência 25 a 30 g", valor: f.fibra, un: "g", passo: 1, onChange: set("fibra") })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: "#94a3b8", textAlign: "center", lineHeight: 1.4 } }, "Ponto de partida. Com nutricionista, vale a meta definida por ele.")), /* @__PURE__ */ React.createElement("div", { style: { padding: "6px 18px 10px", flexShrink: 0 } }, erro && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, color: "#dc2626", textAlign: "center", marginBottom: 6 } }, erro), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, onCancelar && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: onCancelar, style: { flex: 1, height: 46, borderRadius: 23, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#0f172a" } }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: salvar, disabled: salvando, style: { flex: 1.4, height: 46, borderRadius: 23, border: "none", background: NUTRI_LARANJA, color: "#fff", fontSize: 14.5, fontWeight: 800, cursor: "pointer", opacity: salvando ? 0.6 : 1, fontFamily: "inherit" } }, salvando ? "Salvando..." : "Salvar metas"))));
    return /* @__PURE__ */ React.createElement("div", null, quem && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginBottom: 12 } }, quem), /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 14, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b" } }, "Peso atual"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 4 } }, /* @__PURE__ */ React.createElement("input", { inputMode: "decimal", value: String(f.peso || ""), onChange: (e) => set("peso")(e.target.value.replace(/[^0-9.,]/g, "")), placeholder: "—", style: { width: 70, border: "none", borderBottom: "1.5px solid #e2e8f0", fontSize: 18, fontWeight: 800, fontFamily: "inherit", padding: "2px 0", color: "#0f172a", background: "transparent" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "#64748b" } }, "kg"))), pesoSugerido && pesoSugerido.v ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "#64748b", textAlign: "right" } }, "Último registro: " + String(pesoSugerido.v).replace(".", ",") + " kg" + (pesoSugerido.date ? " (" + nutriDataCurta(pesoSugerido.date) + ")" : "")) : null), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginBottom: 6 } }, "Objetivo"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 } }, NUTRI_OBJETIVOS.map((o) => {
      const ativo = f.objetivo === o[0];
      return /* @__PURE__ */ React.createElement("button", { key: o[0], type: "button", onClick: () => aplicarSugestao(o[0]), style: { height: 36, padding: "0 14px", borderRadius: 18, border: "1.5px solid " + (ativo ? NUTRI_ESCURO : "#e2e8f0"), background: ativo ? NUTRI_ESCURO : "#fff", color: ativo ? "#fff" : "#0f172a", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, o[1]);
    })), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: usarBase, style: { width: "100%", height: 42, borderRadius: 21, border: "1.5px solid " + NUTRI_LARANJA, background: "#fff", color: NUTRI_LARANJA_TXT, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, "Recalcular sugestão"), f.sugerido && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 8, lineHeight: 1.45 } }, "Sugestão para " + nomeObj.toLowerCase() + (kcalRef ? ", fechando " + nutriFmt(kcalRef) + " kcal do plano energético" : tmbRef && tmbRef.v ? ", a partir da TMB de " + nutriFmt(tmbRef.v) + " kcal (" + tmbRef.rotulo.toLowerCase() + ")" : ", pelo peso") + ". Ajuste o que precisar.")), ini.energia && ini.energia.objetivo ? /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "10px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 700 } }, "Calorias"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b" } }, "Do plano energético. Sobe nos dias de treino.")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 800, whiteSpace: "nowrap" } }, kcalRef ? nutriFmt(kcalRef) + " kcal" : "—")) : /* @__PURE__ */ React.createElement(NutriStepper, { nome: "Calorias", dica: tmbRef && tmbRef.v ? "TMB " + nutriFmt(tmbRef.v) + " (" + tmbRef.rotulo + ")" : "opcional", valor: f.kcal, un: "kcal", passo: 50, onChange: set("kcal") }), /* @__PURE__ */ React.createElement(NutriStepper, { nome: "Proteína", dica: porKg, valor: f.prot, un: "g", passo: 5, onChange: set("prot") }), /* @__PURE__ */ React.createElement(NutriStepper, { nome: "Carboidratos", dica: gpk("carb"), valor: f.carb, un: "g", passo: 10, onChange: set("carb") }), /* @__PURE__ */ React.createElement(NutriStepper, { nome: "Gorduras", dica: gpk("gord"), valor: f.gord, un: "g", passo: 5, onChange: set("gord") }), /* @__PURE__ */ React.createElement(NutriStepper, { nome: "Fibras", dica: "referência geral 25 a 30 g", valor: f.fibra, un: "g", passo: 1, onChange: set("fibra") }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", textAlign: "center", margin: "10px 0 12px", lineHeight: 1.5 } }, "A base sugerida é só um ponto de partida. Se houver acompanhamento com nutricionista, use as metas definidas por ele."), erro && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#dc2626", textAlign: "center", marginBottom: 10 } }, erro), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, onCancelar && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: onCancelar, style: { flex: 1, height: 48, borderRadius: 24, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#0f172a" } }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: salvar, disabled: salvando, style: { flex: 1.4, height: 48, borderRadius: 24, border: "none", background: NUTRI_LARANJA, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: salvando ? 0.6 : 1, fontFamily: "inherit" } }, salvando ? "Salvando..." : "Salvar metas")));
  };
  const ANTRO_MEMBROS = [["bracoRelaxado", "Braço relaxado"], ["bracoContraido", "Braço contraído"], ["antebraco", "Antebraço"], ["coxa", "Coxa"], ["panturrilha", "Panturrilha"]];
  const ANTRO_TRONCO = [["torax", "Tórax"], ["cintura", "Cintura"], ["abdomen", "Abdômen"], ["quadril", "Quadril"]];
  const ANTRO_DOBRAS = [["peitoral", "Peitoral"], ["axilar", "Axilar média"], ["triceps", "Tríceps"], ["subescapular", "Subescapular"], ["abdominal", "Abdominal"], ["suprailiaca", "Suprailíaca"], ["coxa", "Coxa"]];
  const ANTRO_BIO = [["gordura", "Gordura corporal", "%"], ["massaGorda", "Massa de gordura", "kg"], ["massaMagra", "Massa magra", "kg"], ["mme", "Massa muscular esquelética", "kg"], ["agua", "Água corporal", "L"], ["visceral", "Gordura visceral", "nível"], ["tmb", "Taxa metabólica basal", "kcal"]];
  const ANTRO_LARANJA = "#FF5603";
  const ANTRO_LARANJA_TXT = "#c2410c";
  const ANTRO_ESCURO = "#0f172a";
  const ANTRO_VERDE = "#0f766e";
  const antroNum = (v) => {
    if (v === null || v === void 0 || v === "") return null;
    if (typeof v === "number") return isFinite(v) && v > 0 ? v : null;
    let t = String(v).trim();
    if (t.indexOf(",") >= 0) t = t.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, "");
    const n = parseFloat(t);
    return isFinite(n) && n > 0 ? n : null;
  };
  const antroFmt = (n, d) => {
    if (n === null || n === void 0 || !isFinite(n)) return "—";
    return Number(n).toLocaleString("pt-BR", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  };
  const antroInput = (n) => n === null || n === void 0 ? "" : String(n).replace(".", ",");
  const antroISO = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const antroHoje = () => antroISO(/* @__PURE__ */ new Date());
  const antroData = (iso) => {
    if (!iso) return "";
    const p = String(iso).slice(0, 10).split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  };
  const antroDataCurta = (iso) => {
    if (!iso) return "";
    const p = String(iso).slice(0, 10).split("-");
    return p[2] + "/" + p[1];
  };
  const antroId = () => "an_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const antroIdade = (dob, ref) => {
    if (!dob) return null;
    const a = String(dob).slice(0, 10).split("-").map(Number), b = String(ref || antroHoje()).slice(0, 10).split("-").map(Number);
    if (a.length < 3 || !a[0]) return null;
    let id = b[0] - a[0];
    if (b[1] < a[1] || b[1] === a[1] && b[2] < a[2]) id--;
    return id > 0 && id < 120 ? id : null;
  };
  const antroSitios = (protocolo, sexo) => {
    if (protocolo === 7) return ANTRO_DOBRAS.map((x) => x[0]);
    return sexo === "F" ? ["triceps", "suprailiaca", "coxa"] : ["peitoral", "abdominal", "coxa"];
  };
  const antroCalcDobras = (protocolo, sexo, idade, valores, peso) => {
    if (!sexo || !idade) return null;
    const sitios = antroSitios(protocolo, sexo);
    let S = 0;
    for (let i = 0; i < sitios.length; i++) {
      const v = antroNum(valores[sitios[i]]);
      if (!v) return null;
      S += v;
    }
    let D;
    if (protocolo === 7) D = sexo === "F" ? 1.097 - 46971e-8 * S + 56e-8 * S * S - 12828e-8 * idade : 1.112 - 43499e-8 * S + 55e-8 * S * S - 28826e-8 * idade;
    else D = sexo === "F" ? 1.0994921 - 9929e-7 * S + 23e-7 * S * S - 1392e-7 * idade : 1.10938 - 8267e-7 * S + 16e-7 * S * S - 2574e-7 * idade;
    const g = 495 / D - 450;
    if (!isFinite(g) || g <= 0 || g > 70) return null;
    const r = { soma: Math.round(S * 10) / 10, gordura: Math.round(g * 10) / 10 };
    if (peso) {
      r.massaGorda = Math.round(peso * g / 10) / 10;
      r.massaMagra = Math.round(peso * (100 - g) / 10) / 10;
    }
    return r;
  };
  const antroCalcBase = (peso, altura, cintura, quadril) => {
    const r = {};
    if (peso && altura) r.imc = Math.round(peso / Math.pow(altura / 100, 2) * 10) / 10;
    if (cintura && quadril) r.rcq = Math.round(cintura / quadril * 100) / 100;
    if (cintura && altura) r.rcest = Math.round(cintura / altura * 100) / 100;
    return r;
  };
  const antroTipos = (r) => {
    const t = [];
    if (r.membros || r.tronco) t.push("Medidas");
    if (r.dobras) t.push("Dobras");
    if (r.bio) t.push("Bioimpedância");
    return t.length ? t.join(" · ") : "Peso e altura";
  };
  const antroMedia = (o) => {
    if (!o) return null;
    const d = antroNum(o.d), e = antroNum(o.e);
    if (d && e) return (d + e) / 2;
    return d || e || null;
  };
  const antroMedidas = (antroLista, avalLista, metas) => {
    const cands = [];
    (antroLista || []).forEach((r2) => cands.push({ date: r2.date, fonte: "antropometria", peso: r2.peso, altura: r2.altura, cintura: r2.tronco && r2.tronco.cintura, quadril: r2.tronco && r2.tronco.quadril, panturrilha: antroMedia(r2.membros && r2.membros.panturrilha) }));
    (avalLista || []).forEach((a) => {
      const h = a && a.aha || {};
      cands.push({ date: a && a.date, fonte: "avaliacao", peso: h.weight, altura: h.height, cintura: h.waist, quadril: h.hip, panturrilha: h.calf });
    });
    if (metas && metas.peso) cands.push({ date: String(metas.atualizadoEm || "").slice(0, 10), fonte: "metas", peso: metas.peso });
    const r = {};
    ["peso", "altura", "cintura", "quadril", "panturrilha"].forEach((k) => {
      let best = null;
      cands.forEach((c) => {
        const v = antroNum(c[k]);
        if (v && (!best || String(c.date || "") > String(best.date || ""))) best = { v: Math.round(v * 10) / 10, date: c.date || "", fonte: c.fonte };
      });
      if (best) r[k] = best;
    });
    return r;
  };
  const antroApi = {
    async headers() {
      var _a;
      const { data } = await antroSupa().auth.getSession();
      const token = ((_a = data == null ? void 0 : data.session) == null ? void 0 : _a.access_token) || SUPA_KEY;
      return { "apikey": SUPA_KEY, "Authorization": "Bearer " + token, "Content-Type": "application/json" };
    },
    async usuarioId() {
      var _a, _b;
      const { data } = await antroSupa().auth.getSession();
      return ((_b = (_a = data == null ? void 0 : data.session) == null ? void 0 : _a.user) == null ? void 0 : _b.id) || null;
    },
    async listar(studentId) {
      try {
        const h = await this.headers();
        const r = await fetch(SUPA_URL + "/rest/v1/avaliacoes_antropometricas?select=id,data&student_id=eq." + encodeURIComponent(studentId) + "&limit=200", { headers: h });
        if (!r.ok) return null;
        const rows = await r.json();
        return (rows || []).filter((x) => x && x.data).map((x) => ({ ...x.data, id: x.id })).sort((a, b) => ((a.date || "") + (a.criadoEm || "")).localeCompare((b.date || "") + (b.criadoEm || "")));
      } catch (e) {
        return null;
      }
    },
    async salvar(studentId, ownerId, rec) {
      try {
        const h = { ...await this.headers(), "Prefer": "resolution=merge-duplicates" };
        const { id, ...data } = rec;
        const body = { id, data, owner_id: ownerId, student_id: studentId, updated_at: (/* @__PURE__ */ new Date()).toISOString() };
        const r = await fetch(SUPA_URL + "/rest/v1/avaliacoes_antropometricas", { method: "POST", headers: h, body: JSON.stringify(body) });
        return r.ok;
      } catch (e) {
        return false;
      }
    },
    async fontesMedidas(studentId) {
      const out = { aval: [], metas: null };
      try {
        const h = await this.headers();
        const [ra, rm] = await Promise.all([
          fetch(SUPA_URL + "/rest/v1/assessments?select=data&student_id=eq." + encodeURIComponent(studentId) + "&limit=50", { headers: h }),
          fetch(SUPA_URL + "/rest/v1/metas_alimentares?select=data&student_id=eq." + encodeURIComponent(studentId) + "&limit=1", { headers: h })
        ]);
        if (ra.ok) out.aval = (await ra.json() || []).map((x) => x.data).filter(Boolean);
        if (rm.ok) {
          const m = await rm.json();
          out.metas = m && m.length ? m[0].data : null;
        }
      } catch (e) {
      }
      return out;
    },
    async medidas(studentId) {
      const [l, f] = await Promise.all([this.listar(studentId), this.fontesMedidas(studentId)]);
      return antroMedidas(l || [], f.aval, f.metas);
    },
    async remover(id) {
      try {
        const h = await this.headers();
        const r = await fetch(SUPA_URL + "/rest/v1/avaliacoes_antropometricas?id=eq." + encodeURIComponent(id), { method: "DELETE", headers: h });
        return r.ok;
      } catch (e) {
        return false;
      }
    }
  };
  const antroParaForm = (r) => {
    const f = { date: r.date || antroHoje(), peso: antroInput(r.peso), altura: antroInput(r.altura), protocolo: r.dobras && r.dobras.protocolo || 7, aparelho: r.bio && r.bio.aparelho || "" };
    ANTRO_MEMBROS.forEach((m) => {
      const o = (r.membros || {})[m[0]] || {};
      f["m_" + m[0] + "_d"] = antroInput(o.d);
      f["m_" + m[0] + "_e"] = antroInput(o.e);
    });
    ANTRO_TRONCO.forEach((t) => {
      f["t_" + t[0]] = antroInput((r.tronco || {})[t[0]]);
    });
    ANTRO_DOBRAS.forEach((d) => {
      f["d_" + d[0]] = antroInput(((r.dobras || {}).valores || {})[d[0]]);
    });
    ANTRO_BIO.forEach((b) => {
      f["b_" + b[0]] = antroInput((r.bio || {})[b[0]]);
    });
    return f;
  };
  const AntroCampo = ({ rotulo, valor, onChange, largura, un, destaque }) => /* @__PURE__ */ React.createElement("label", { style: { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#64748b", minWidth: 0 } }, /* @__PURE__ */ React.createElement("span", null, rotulo, un ? " (" + un + ")" : ""), /* @__PURE__ */ React.createElement(
    "input",
    {
      inputMode: "decimal",
      value: valor || "",
      onChange: (e) => onChange(e.target.value.replace(/[^0-9.,]/g, "")),
      placeholder: "—",
      style: { width: largura || "100%", boxSizing: "border-box", height: 42, borderRadius: 10, border: "1.5px solid " + (destaque ? ANTRO_LARANJA : "#e2e8f0"), padding: "0 10px", fontSize: 16, fontWeight: 700, fontFamily: "inherit", color: ANTRO_ESCURO, background: "#fff" }
    }
  ));
  const AntroBloco = ({ titulo, extra, children, escuro }) => /* @__PURE__ */ React.createElement("div", { style: { background: escuro ? ANTRO_ESCURO : "#fff", color: escuro ? "#f8fafc" : ANTRO_ESCURO, border: escuro ? "none" : "1.5px solid #e2e8f0", borderRadius: 16, padding: "14px 16px", marginBottom: 12 } }, (titulo || extra) && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800 } }, titulo), extra ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: escuro ? "#cbd5e1" : "#64748b", textAlign: "right" } }, extra) : null), children);
  const AntroBotao = ({ children, onClick, tipo, disabled, style }) => {
    const s = tipo === "sec" ? { border: "1.5px solid #e2e8f0", background: "#fff", color: ANTRO_ESCURO } : tipo === "perigo" ? { border: "1.5px solid #fecaca", background: "#fff", color: "#dc2626" } : { border: "none", background: ANTRO_LARANJA, color: "#fff" };
    return /* @__PURE__ */ React.createElement("button", { type: "button", onClick: disabled ? void 0 : onClick, disabled, style: { height: 50, borderRadius: 25, fontSize: 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1, fontFamily: "inherit", width: "100%", ...s, ...style || {} } }, children);
  };
  const AntroForm = ({ rec, papel, sexo, dob, onSalvar, onCancelar, onApagar, abaInicial, prefill }) => {
    const [f, setF] = useState(() => {
      const b = antroParaForm(rec || {});
      if (prefill && !(rec && rec.id)) {
        if (!b.peso && prefill.peso) b.peso = antroInput(prefill.peso.v);
        if (!b.altura && prefill.altura) b.altura = antroInput(prefill.altura.v);
      }
      return b;
    });
    const veioDoUltimo = !!(prefill && !(rec && rec.id) && (prefill.peso || prefill.altura));
    const dataUltimo = veioDoUltimo ? antroDataCurta((prefill.peso || prefill.altura).date) : "";
    const [aba, setAba] = useState(papel === "aluno" ? "bio" : abaInicial || "medidas");
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
    const peso = antroNum(f.peso), altura = antroNum(f.altura);
    const base = antroCalcBase(peso, altura, antroNum(f.t_cintura), antroNum(f.t_quadril));
    const idade = antroIdade(dob, f.date);
    const valoresDobras = {};
    ANTRO_DOBRAS.forEach((d) => {
      valoresDobras[d[0]] = f["d_" + d[0]];
    });
    const calcDob = antroCalcDobras(f.protocolo, sexo, idade, valoresDobras, peso);
    const pendente = rec && rec.status === "pendente";
    const montar = () => {
      const r = { ...rec || {}, id: rec && rec.id || antroId(), date: f.date || antroHoje(), peso, altura };
      if (papel === "professor") {
        const membros = {};
        let temM = false;
        ANTRO_MEMBROS.forEach((m) => {
          const d = antroNum(f["m_" + m[0] + "_d"]), e = antroNum(f["m_" + m[0] + "_e"]);
          if (d || e) {
            membros[m[0]] = { d, e };
            temM = true;
          }
        });
        const tronco = {};
        let temT = false;
        ANTRO_TRONCO.forEach((t) => {
          const v = antroNum(f["t_" + t[0]]);
          if (v) {
            tronco[t[0]] = v;
            temT = true;
          }
        });
        r.membros = temM ? membros : null;
        r.tronco = temT ? tronco : null;
        const valores = {};
        let temD = false;
        antroSitios(f.protocolo, sexo || "M").forEach((k) => {
          const v = antroNum(f["d_" + k]);
          if (v) {
            valores[k] = v;
            temD = true;
          }
        });
        r.dobras = temD ? { protocolo: f.protocolo, valores, ...calcDob || {} } : null;
      }
      const bio = { aparelho: (f.aparelho || "").trim() || null };
      let temB = false;
      ANTRO_BIO.forEach((b) => {
        const v = antroNum(f["b_" + b[0]]);
        if (v) {
          bio[b[0]] = v;
          temB = true;
        }
      });
      r.bio = temB ? bio : null;
      Object.assign(r, { imc: base.imc || null, rcq: base.rcq || null, rcest: base.rcest || null });
      const agora = (/* @__PURE__ */ new Date()).toISOString();
      if (!r.criadoEm) r.criadoEm = agora;
      r.atualizadoEm = agora;
      r.atualizadoPor = papel;
      if (papel === "aluno") {
        r.origem = r.origem || "aluno";
        r.status = "pendente";
      } else {
        r.origem = r.origem || "professor";
        r.status = "conferido";
        r.conferidoEm = agora;
      }
      return r;
    };
    const salvar = async () => {
      setErro("");
      if (!f.date) {
        setErro("Informe a data.");
        return;
      }
      if (papel === "aluno") {
        if (!peso || !altura) {
          setErro("Peso e altura são obrigatórios.");
          return;
        }
        if (!ANTRO_BIO.some((b) => antroNum(f["b_" + b[0]]))) {
          setErro("Preencha pelo menos um resultado do laudo.");
          return;
        }
      } else if (!peso && !altura && !ANTRO_TRONCO.some((t) => antroNum(f["t_" + t[0]])) && !ANTRO_MEMBROS.some((m) => antroNum(f["m_" + m[0] + "_d"]) || antroNum(f["m_" + m[0] + "_e"])) && !ANTRO_DOBRAS.some((d) => antroNum(f["d_" + d[0]])) && !ANTRO_BIO.some((b) => antroNum(f["b_" + b[0]]))) {
        setErro("Preencha pelo menos uma medida.");
        return;
      }
      setSalvando(true);
      const ok = await onSalvar(montar());
      setSalvando(false);
      if (!ok) setErro("Não consegui salvar. Confira a conexão e tente de novo.");
    };
    const abas = papel === "aluno" ? [] : [["medidas", "Medidas"], ["dobras", "Dobras"], ["bio", "Bioimpedância"]];
    const sitios = antroSitios(f.protocolo, sexo || "M");
    const nomeDobra = (k) => (ANTRO_DOBRAS.find((d) => d[0] === k) || [k, k])[1];
    const rcqAlto = base.rcq && (sexo === "F" ? base.rcq > 0.85 : base.rcq > 0.9);
    return /* @__PURE__ */ React.createElement("div", null, abas.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 4, background: "#f1f5f9", borderRadius: 14, padding: 4, marginBottom: 12 } }, abas.map((a) => /* @__PURE__ */ React.createElement("button", { key: a[0], type: "button", onClick: () => setAba(a[0]), style: { height: 40, borderRadius: 10, border: "none", background: aba === a[0] ? ANTRO_ESCURO : "transparent", color: aba === a[0] ? "#fff" : ANTRO_ESCURO, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, a[1]))), /* @__PURE__ */ React.createElement(AntroBloco, { titulo: papel === "aluno" ? "Seus dados" : "Básico", extra: veioDoUltimo ? "do último registro (" + dataUltimo + ")" : papel === "aluno" ? "obrigatório" : null }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 } }, /* @__PURE__ */ React.createElement(AntroCampo, { rotulo: "Peso", un: "kg", valor: f.peso, onChange: set("peso"), destaque: papel === "aluno" && !peso }), /* @__PURE__ */ React.createElement(AntroCampo, { rotulo: "Altura", un: "cm", valor: f.altura, onChange: set("altura"), destaque: papel === "aluno" && !altura }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#64748b" } }, /* @__PURE__ */ React.createElement("span", null, "IMC"), /* @__PURE__ */ React.createElement("div", { style: { height: 42, borderRadius: 10, background: "#f8fafc", display: "flex", alignItems: "center", padding: "0 10px", fontSize: 16, fontWeight: 700, color: ANTRO_ESCURO } }, base.imc ? antroFmt(base.imc, 1) : "—"))), /* @__PURE__ */ React.createElement("label", { style: { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#64748b", marginTop: 10 } }, /* @__PURE__ */ React.createElement("span", null, papel === "aluno" ? "Data do exame" : "Data da avaliação"), /* @__PURE__ */ React.createElement("input", { type: "date", value: f.date, onChange: (e) => set("date")(e.target.value), style: { height: 42, borderRadius: 10, border: "1.5px solid #e2e8f0", padding: "0 10px", fontSize: 15, fontFamily: "inherit", color: ANTRO_ESCURO, background: "#fff" } }))), aba === "medidas" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(AntroBloco, { titulo: "Membros (cm)", extra: "direito · esquerdo · diferença" }, ANTRO_MEMBROS.map((m) => {
      const d = antroNum(f["m_" + m[0] + "_d"]), e = antroNum(f["m_" + m[0] + "_e"]);
      const dif = d && e ? Math.abs(d - e) : null;
      return /* @__PURE__ */ React.createElement("div", { key: m[0], style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { flex: 1, fontSize: 14, minWidth: 0 } }, m[1]), /* @__PURE__ */ React.createElement("input", { inputMode: "decimal", "aria-label": m[1] + " direito", placeholder: "D", value: f["m_" + m[0] + "_d"] || "", onChange: (ev) => set("m_" + m[0] + "_d")(ev.target.value.replace(/[^0-9.,]/g, "")), style: { width: 58, height: 40, borderRadius: 10, border: "1.5px solid #e2e8f0", textAlign: "center", fontSize: 15, fontWeight: 700, fontFamily: "inherit", color: ANTRO_ESCURO } }), /* @__PURE__ */ React.createElement("input", { inputMode: "decimal", "aria-label": m[1] + " esquerdo", placeholder: "E", value: f["m_" + m[0] + "_e"] || "", onChange: (ev) => set("m_" + m[0] + "_e")(ev.target.value.replace(/[^0-9.,]/g, "")), style: { width: 58, height: 40, borderRadius: 10, border: "1.5px solid #e2e8f0", textAlign: "center", fontSize: 15, fontWeight: 700, fontFamily: "inherit", color: ANTRO_ESCURO } }), /* @__PURE__ */ React.createElement("span", { style: { width: 34, textAlign: "right", fontSize: 12, fontWeight: dif > 2 ? 700 : 500, color: dif > 2 ? ANTRO_LARANJA_TXT : "#64748b" } }, dif !== null ? antroFmt(dif, 1) : ""));
    }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#64748b" } }, "Diferença em laranja quando passa de 2 cm entre os lados.")), /* @__PURE__ */ React.createElement(AntroBloco, { titulo: "Tronco (cm)" }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 } }, ANTRO_TRONCO.map((t) => /* @__PURE__ */ React.createElement(AntroCampo, { key: t[0], rotulo: t[1], valor: f["t_" + t[0]], onChange: set("t_" + t[0]) })))), /* @__PURE__ */ React.createElement(AntroBloco, { titulo: "Calculado", escuro: true }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "#1e293b", borderRadius: 12, padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#cbd5e1" } }, "Cintura / quadril"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800 } }, base.rcq ? antroFmt(base.rcq, 2) : "—"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: rcqAlto ? "#fdba74" : "#94a3b8" } }, base.rcq ? rcqAlto ? "acima de " + (sexo === "F" ? "0,85" : "0,90") : "dentro da referência" : "informe cintura e quadril")), /* @__PURE__ */ React.createElement("div", { style: { background: "#1e293b", borderRadius: 12, padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#cbd5e1" } }, "Cintura / estatura"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800 } }, base.rcest ? antroFmt(base.rcest, 2) : "—"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: base.rcest > 0.5 ? "#fdba74" : "#94a3b8" } }, base.rcest ? base.rcest > 0.5 ? "acima de 0,50" : "até 0,50" : "informe cintura e altura"))))), aba === "dobras" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(AntroBloco, { titulo: "Protocolo", extra: (sexo === "F" ? "Feminino" : sexo === "M" ? "Masculino" : "Sexo não informado") + (idade ? " · " + idade + " anos" : "") }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, [3, 7].map((n) => /* @__PURE__ */ React.createElement("button", { key: n, type: "button", onClick: () => set("protocolo")(n), style: { flex: 1, height: 44, borderRadius: 22, border: "1.5px solid " + (f.protocolo === n ? ANTRO_ESCURO : "#e2e8f0"), background: f.protocolo === n ? ANTRO_ESCURO : "#fff", color: f.protocolo === n ? "#fff" : ANTRO_ESCURO, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, "Jackson & Pollock ", n))), (!sexo || !idade) && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#dc2626", marginTop: 10 } }, "Para calcular o % de gordura, preencha sexo e data de nascimento na ficha do aluno.")), /* @__PURE__ */ React.createElement(AntroBloco, { titulo: "Dobras (mm)", extra: "lado direito" }, sitios.map((k) => /* @__PURE__ */ React.createElement("div", { key: k, style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { flex: 1, fontSize: 14 } }, nomeDobra(k)), /* @__PURE__ */ React.createElement("input", { inputMode: "decimal", "aria-label": nomeDobra(k) + " em milímetros", value: f["d_" + k] || "", onChange: (ev) => set("d_" + k)(ev.target.value.replace(/[^0-9.,]/g, "")), placeholder: "—", style: { width: 72, height: 42, borderRadius: 10, border: "1.5px solid #e2e8f0", textAlign: "center", fontSize: 16, fontWeight: 700, fontFamily: "inherit", color: ANTRO_ESCURO } })))), /* @__PURE__ */ React.createElement(AntroBloco, { escuro: true }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 34, fontWeight: 800, color: "#fdba74" } }, calcDob ? antroFmt(calcDob.gordura, 1) + "%" : "—"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "#cbd5e1" } }, "de gordura corporal")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 } }, [["Soma", calcDob ? antroFmt(calcDob.soma, 1) + " mm" : "—"], ["Massa gorda", calcDob && calcDob.massaGorda ? antroFmt(calcDob.massaGorda, 1) + " kg" : "—"], ["Massa magra", calcDob && calcDob.massaMagra ? antroFmt(calcDob.massaMagra, 1) + " kg" : "—"]].map((x) => /* @__PURE__ */ React.createElement("div", { key: x[0], style: { background: "#1e293b", borderRadius: 12, padding: "9px 10px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#cbd5e1" } }, x[0]), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800 } }, x[1])))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 10 } }, "Jackson & Pollock ", f.protocolo, " dobras, equação de Siri.", peso ? "" : " Informe o peso para ver massa gorda e magra."))), aba === "bio" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(AntroBloco, { titulo: papel === "aluno" ? "Resultado do laudo" : "Bioimpedância", extra: "preencha o que tiver" }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#64748b", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("span", null, "Aparelho"), /* @__PURE__ */ React.createElement("input", { value: f.aparelho || "", onChange: (e) => set("aparelho")(e.target.value), placeholder: "Ex.: InBody 270, Tanita BC-601", style: { height: 42, borderRadius: 10, border: "1.5px solid #e2e8f0", padding: "0 10px", fontSize: 15, fontFamily: "inherit", color: ANTRO_ESCURO } })), ANTRO_BIO.map((b) => /* @__PURE__ */ React.createElement("div", { key: b[0], style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { flex: 1, fontSize: 14, minWidth: 0 } }, b[1]), /* @__PURE__ */ React.createElement("input", { inputMode: "decimal", "aria-label": b[1], value: f["b_" + b[0]] || "", onChange: (ev) => set("b_" + b[0])(ev.target.value.replace(/[^0-9.,]/g, "")), placeholder: "—", style: { width: 84, height: 42, borderRadius: 10, border: "1.5px solid #e2e8f0", textAlign: "center", fontSize: 16, fontWeight: 700, fontFamily: "inherit", color: ANTRO_ESCURO } }), /* @__PURE__ */ React.createElement("span", { style: { width: 36, fontSize: 12, color: "#64748b" } }, b[2]))), papel === "aluno" && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b" } }, "O nome do aparelho fica no topo do laudo. Ajuda a comparar os próximos exames.")), papel === "aluno" && /* @__PURE__ */ React.createElement("div", { style: { background: "#fff4ee", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#7c2d12", lineHeight: 1.45, marginBottom: 12 } }, 'Os números já aparecem na sua evolução, marcados como "aguardando conferência" até seu personal revisar.')), erro && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#dc2626", textAlign: "center", marginBottom: 10 } }, erro), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, onCancelar && /* @__PURE__ */ React.createElement(AntroBotao, { tipo: "sec", onClick: onCancelar, style: { flex: 1 } }, "Cancelar"), /* @__PURE__ */ React.createElement(AntroBotao, { onClick: salvar, disabled: salvando, style: { flex: 1.4 } }, salvando ? "Salvando..." : papel === "aluno" ? "Enviar para o personal" : pendente ? "Salvar e confirmar" : "Salvar avaliação")), onApagar && rec && rec.id && /* @__PURE__ */ React.createElement(AntroBotao, { tipo: "perigo", onClick: onApagar, style: { marginTop: 10, height: 44, fontSize: 14 } }, "Apagar esta avaliação"));
  };
  const ANTRO_INDICADORES = [
    { k: "peso", nome: "Peso", un: " kg", d: 1, bom: null, get: (r) => r.peso, curto: "de peso" },
    { k: "cintura", nome: "Cintura", un: " cm", d: 1, bom: "cai", get: (r) => r.tronco && r.tronco.cintura, curto: "de cintura" },
    { k: "gBio", nome: "Gordura corporal (bioimpedância)", un: "%", d: 1, bom: "cai", get: (r) => r.bio && r.bio.gordura, curto: "de gordura" },
    { k: "gDob", nome: "Gordura corporal (dobras)", un: "%", d: 1, bom: "cai", get: (r) => r.dobras && r.dobras.gordura, curto: "de gordura" },
    { k: "mme", nome: "Massa muscular esquelética", un: " kg", d: 1, bom: "sobe", get: (r) => r.bio && r.bio.mme, curto: "de massa muscular" },
    { k: "pant", nome: "Panturrilha (média dos lados)", un: " cm", d: 1, bom: "sobe", get: (r) => antroMedia(r.membros && r.membros.panturrilha), curto: "de panturrilha" },
    { k: "braco", nome: "Braço contraído (média dos lados)", un: " cm", d: 1, bom: "sobe", get: (r) => antroMedia(r.membros && r.membros.bracoContraido), curto: "de braço" },
    { k: "rcest", nome: "Cintura / estatura", un: "", d: 2, bom: "cai", get: (r) => r.rcest, curto: "na cintura/estatura" },
    { k: "visceral", nome: "Gordura visceral", un: "", d: 0, bom: "cai", get: (r) => r.bio && r.bio.visceral, curto: "níveis de gordura visceral" }
  ];
  const AntroEvolucao = ({ lista, papel }) => {
    const ord = (lista || []).slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    if (!ord.length) return null;
    const pendentes = ord.filter((r) => r.status === "pendente");
    const linhas = ANTRO_INDICADORES.map((ind) => {
      const pts = ord.map((r) => ({ v: antroNum(ind.get(r)), r })).filter((p) => p.v);
      if (!pts.length) return null;
      const ini = pts[0], fim = pts[pts.length - 1];
      const dif = pts.length > 1 ? fim.v - ini.v : 0;
      const melhorou = ind.bom === "cai" ? dif < 0 : ind.bom === "sobe" ? dif > 0 : null;
      return { ind, pts, ini, fim, dif, melhorou, rel: ini.v ? Math.abs(dif) / ini.v : 0 };
    }).filter(Boolean);
    const destaques = linhas.filter((l) => l.pts.length > 1 && l.melhorou === true).sort((a, b) => b.rel - a.rel).filter((l, i, arr) => arr.findIndex((x) => x.ind.curto === l.ind.curto) === i).slice(0, 3);
    const aparelhos = {};
    ord.forEach((r) => {
      if (r.bio && r.bio.aparelho) aparelhos[r.bio.aparelho.trim().toLowerCase()] = true;
    });
    const variosAparelhos = Object.keys(aparelhos).length > 1;
    const corDe = (l) => l.melhorou === true ? ANTRO_VERDE : l.melhorou === false ? ANTRO_LARANJA_TXT : "#64748b";
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 10 } }, ord.length, " ", ord.length === 1 ? "avaliação" : "avaliações", " · ", ord.length > 1 ? "de " + antroDataCurta(ord[0].date) + " a " + antroDataCurta(ord[ord.length - 1].date) : antroData(ord[0].date)), pendentes.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { background: "#fff4ee", border: "1.5px solid #fed7aa", borderRadius: 12, padding: "10px 12px", marginBottom: 12, fontSize: 13, color: "#7c2d12", lineHeight: 1.45 } }, papel === "aluno" ? "Seu laudo de " + antroDataCurta(pendentes[pendentes.length - 1].date) + " está aguardando a conferência do seu personal." : pendentes.length + " " + (pendentes.length === 1 ? "laudo lançado pelo aluno aguardando" : "laudos lançados pelo aluno aguardando") + " sua conferência."), destaques.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { background: ANTRO_ESCURO, color: "#f8fafc", borderRadius: 18, padding: 16, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#cbd5e1", marginBottom: 10 } }, "Desde a primeira avaliação"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(" + destaques.length + ", minmax(0, 1fr))", gap: 8 } }, destaques.map((l) => /* @__PURE__ */ React.createElement("div", { key: l.ind.k, style: { background: "#1e293b", borderRadius: 12, padding: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 19, fontWeight: 800, color: "#fdba74" } }, (l.dif > 0 ? "+" : "") + antroFmt(l.dif, l.ind.d) + l.ind.un), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#e2e8f0", lineHeight: 1.3 } }, l.ind.curto))))), linhas.map((l) => {
      const ult = l.pts.slice(-6);
      const vals = ult.map((p) => p.v);
      const min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
      return /* @__PURE__ */ React.createElement("div", { key: l.ind.k, style: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b" } }, l.ind.nome), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: ANTRO_ESCURO } }, antroFmt(l.fim.v, l.ind.d) + l.ind.un, l.fim.r.status === "pendente" ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: ANTRO_LARANJA_TXT, marginLeft: 6 } }, "aguardando conferência") : null), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: corDe(l) } }, l.pts.length > 1 ? (l.dif > 0 ? "+" : "") + antroFmt(l.dif, l.ind.d) + l.ind.un + " desde " + antroDataCurta(l.ini.r.date) : "primeiro registro em " + antroDataCurta(l.fim.r.date))), /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", style: { display: "flex", alignItems: "flex-end", gap: 4, height: 44, width: 92 } }, ult.map((p, i) => {
        const h = max === min ? 28 : Math.round(12 + (p.v - min) / (max - min) * 32);
        const ultima = i === ult.length - 1;
        const cor = !ultima ? "#cbd5e1" : l.melhorou === true ? ANTRO_VERDE : l.melhorou === false ? "#ea580c" : "#64748b";
        return /* @__PURE__ */ React.createElement("div", { key: i, style: { flex: 1, height: h, borderRadius: "4px 4px 0 0", background: cor, opacity: p.r.status === "pendente" ? 0.55 : 1 } });
      })));
    }), variosAparelhos && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", margin: "6px 2px 0", lineHeight: 1.45 } }, "Há laudos de aparelhos diferentes. Valores de bioimpedância de marcas diferentes não se comparam bem."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 14, fontSize: 11, color: "#64748b", margin: "10px 2px 0", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: 3, background: ANTRO_VERDE } }), "melhorou"), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: 3, background: "#ea580c" } }), "piorou"), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: 3, background: "#64748b" } }), "sem direção (peso)")));
  };
  const ENERGIA_ATIVIDADES = [
    ["caminhada", "Caminhada", 3.5],
    ["caminhada_rapida", "Caminhada rápida", 4.3],
    ["hidro", "Hidroginástica", 4],
    ["natacao", "Natação", 6],
    ["bicicleta", "Bicicleta", 5.5],
    ["danca", "Dança", 4.5],
    ["pilates", "Pilates", 3],
    ["yoga", "Yoga / alongamento", 2.5],
    ["corrida", "Corrida leve", 7],
    ["corrida_moderada", "Corrida moderada", 9],
    ["corrida_intensa", "Corrida intensa", 11],
    ["outra", "Outra atividade moderada", 4]
  ];
  const ENERGIA_DURACOES = [30, 45, 60, 75, 90];
  const ENERGIA_MET_ESFORCO = { 1: 3, 2: 3.5, 3: 4.5, 4: 5.5, 5: 6 };
  const ENERGIA_FATORES = [[1.2, "Sedentária"], [1.35, "Leve"], [1.5, "Ativa"]];
  const ENERGIA_OBJETIVOS = [["manter", "Manter"], ["emagrecer", "Emagrecer"], ["massa", "Ganhar massa"]];
  const ENERGIA_AJUSTES = { emagrecer: [300, 400, 500], massa: [150, 250, 350], manter: [] };
  const energiaKcal = (met, peso, minutos) => met && peso && minutos ? Math.max(0, Math.round((met - 1) * peso * minutos / 60)) : 0;
  const energiaApi = {
    async checkins(studentId, desde, ate) {
      try {
        const h = await nutriApi.headers();
        const q = "select=data&student_id=eq." + encodeURIComponent(studentId) + "&type=eq.pos_treino&data->>date=gte." + desde + "&data->>date=lte." + ate + "&limit=200";
        const r = await fetch(SUPA_URL + "/rest/v1/checkins?" + q, { headers: h });
        if (!r.ok) return [];
        const rows = await r.json();
        return (rows || []).map((x) => x.data).filter(Boolean);
      } catch (e) {
        return [];
      }
    },
    async atividades(studentId, desde, ate) {
      try {
        const h = await nutriApi.headers();
        const q = "select=id,data&student_id=eq." + encodeURIComponent(studentId) + "&data->>date=gte." + desde + "&data->>date=lte." + ate + "&limit=200";
        const r = await fetch(SUPA_URL + "/rest/v1/gasto_atividades?" + q, { headers: h });
        if (!r.ok) return [];
        const rows = await r.json();
        return (rows || []).filter((x) => x && x.data).map((x) => ({ ...x.data, id: x.id }));
      } catch (e) {
        return [];
      }
    },
    async salvarAtividade(studentId, ownerId, a) {
      try {
        const h = { ...await nutriApi.headers(), "Prefer": "resolution=merge-duplicates" };
        const { id, ...data } = a;
        const r = await fetch(SUPA_URL + "/rest/v1/gasto_atividades", { method: "POST", headers: h, body: JSON.stringify({ id, data, owner_id: ownerId, student_id: studentId, updated_at: (/* @__PURE__ */ new Date()).toISOString() }) });
        return r.ok;
      } catch (e) {
        return false;
      }
    },
    async removerAtividade(id) {
      try {
        const h = await nutriApi.headers();
        const r = await fetch(SUPA_URL + "/rest/v1/gasto_atividades?id=eq." + encodeURIComponent(id), { method: "DELETE", headers: h });
        return r.ok;
      } catch (e) {
        return false;
      }
    }
  };
  const energiaBase = (sd, antroLista, med) => {
    const l = (antroLista || []).slice().sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    const ultimo = (f) => {
      for (let i = l.length - 1; i >= 0; i--) {
        const v = f(l[i]);
        if (v) return { v, r: l[i] };
      }
      return null;
    };
    const peso = med && med.peso && med.peso.v || null;
    const altura = med && med.altura && med.altura.v || null;
    const sexo = sd && sd.sex, idade = antroIdade(sd && sd.dob, nutriHoje());
    const opcoes = [];
    const conferidos = l.filter((r) => r.status !== "pendente");
    let bio = null;
    for (let i = conferidos.length - 1; i >= 0 && !bio; i--) {
      const v = antroNum(conferidos[i].bio && conferidos[i].bio.tmb);
      if (v) bio = { v, r: conferidos[i] };
    }
    if (!bio) bio = ultimo((r) => antroNum(r.bio && r.bio.tmb));
    if (bio) opcoes.push({ k: "bio", rotulo: "Bioimpedância", sub: "laudo de " + nutriDataCurta(bio.r.date) + (bio.r.status === "pendente" ? " (aguardando conferência)" : ""), v: Math.round(bio.v) });
    const magra = ultimo((r) => antroNum(r.dobras && r.dobras.massaMagra || r.bio && r.bio.massaMagra));
    if (magra) opcoes.push({ k: "km", rotulo: "Katch-McArdle", sub: "massa magra de " + nutriFmt(magra.v) + " kg (" + nutriDataCurta(magra.r.date) + ")", v: Math.round(370 + 21.6 * magra.v) });
    if (peso && altura && idade && (sexo === "M" || sexo === "F")) opcoes.push({ k: "mif", rotulo: "Mifflin-St Jeor", sub: "peso, altura, idade e sexo", v: Math.round(10 * peso + 6.25 * altura - 5 * idade + (sexo === "M" ? 5 : -161)) });
    return { opcoes, peso, altura, sexo, idade };
  };
  const energiaTmb = (base, fonte) => {
    if (!base || !base.opcoes.length) return null;
    return base.opcoes.find((o) => o.k === fonte) || base.opcoes[0];
  };
  const energiaExercicio = (checkins, atividades, peso) => {
    const porDia = {};
    const comPresencial = {};
    (checkins || []).forEach((c) => {
      if (c.source === "professor_presencial") comPresencial[c.date] = true;
    });
    const add = (date, item) => {
      if (!date) return;
      const d = porDia[date] || (porDia[date] = { kcal: 0, itens: [] });
      d.kcal += item.kcal;
      d.itens.push(item);
    };
    (checkins || []).forEach((c) => {
      if (c.source !== "professor_presencial" && comPresencial[c.date]) return;
      const min = nutriNum(c.duracao), met = ENERGIA_MET_ESFORCO[c.esforco] || 4;
      const presencial = c.source === "professor_presencial";
      add(c.date, { rotulo: (presencial ? "Treino presencial" : "Treino") + (min ? " · " + Math.round(min) + " min" : ""), kcal: energiaKcal(met, peso, min), semDuracao: !min, tipo: "treino" });
    });
    (atividades || []).forEach((a) => {
      const def = ENERGIA_ATIVIDADES.find((x) => x[0] === a.tipo) || [a.tipo, a.rotulo || "Atividade", a.met || 4];
      add(a.date, { id: a.id, rotulo: def[1] + " · " + Math.round(nutriNum(a.minutos)) + " min", kcal: energiaKcal(def[2], peso, nutriNum(a.minutos)), tipo: "extra" });
    });
    return porDia;
  };
  const energiaDia = (plano, base, exercicioKcal) => {
    if (!plano || !plano.objetivo) return null;
    const t = energiaTmb(base, plano.fonte);
    if (!t) return { semTmb: true };
    const fator = nutriNum(plano.fator) || 1.2;
    const rotina = Math.round(t.v * fator);
    const ex = Math.round(exercicioKcal || 0);
    const gasto = rotina + ex;
    const sinal = plano.objetivo === "emagrecer" ? -1 : plano.objetivo === "massa" ? 1 : 0;
    const ajuste = sinal ? nutriNum(plano.ajuste) || 0 : 0;
    const fixa = plano.metaFixa ? nutriNum(plano.metaFixa) : null;
    if (fixa) return { tmb: t, fator, rotina, rotinaExtra: rotina - t.v, exercicio: ex, gasto, sinal: 0, ajuste: 0, meta: Math.round(fixa), travou: false, fixa: true };
    let meta = gasto + sinal * ajuste;
    const travou = meta < t.v;
    if (travou) meta = t.v;
    return { tmb: t, fator, rotina, rotinaExtra: rotina - t.v, exercicio: ex, gasto, sinal, ajuste, meta: Math.round(meta), travou };
  };
  const EnergiaChip = ({ ativo, onClick, children, style }) => /* @__PURE__ */ React.createElement("button", { type: "button", onClick, style: { minHeight: 44, padding: "0 10px", borderRadius: 12, border: "1.5px solid " + (ativo ? NUTRI_ESCURO : "#e2e8f0"), background: ativo ? NUTRI_ESCURO : "#fff", color: ativo ? "#fff" : NUTRI_ESCURO, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", ...style || {} } }, children);
  const EnergiaPlanoEditor = ({ base, metas, studentId, ownerId, exercicioMedio, onSalvo, onCancelar }) => {
    const ini = metas && metas.energia || {};
    const [p, setP] = useState({ fonte: ini.fonte || ((base.opcoes[0] || {}).k || "bio"), fator: ini.fator || 1.2, objetivo: ini.objetivo || "emagrecer", ajuste: ini.ajuste || 400, metaFixa: ini.metaFixa || null });
    const [usarFixa, setUsarFixa] = useState(!!ini.metaFixa);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const semTreino = energiaDia(p, base, 0);
    const comTreino = energiaDia(p, base, exercicioMedio || 0);
    const opcoesAjuste = ENERGIA_AJUSTES[p.objetivo] || [];
    const salvar = async () => {
      if (!base.opcoes.length && !usarFixa) {
        setErro("Sem dados para calcular a TMB. Lance uma avaliação com peso e altura.");
        return;
      }
      if (usarFixa && !nutriNum(p.metaFixa)) {
        setErro("Informe a meta calórica do nutricionista.");
        return;
      }
      if (!usarFixa && p.objetivo !== "manter" && !nutriNum(p.ajuste)) {
        setErro("Informe o valor do ajuste por dia.");
        return;
      }
      setSalvando(true);
      setErro("");
      const energia = { ...p, metaFixa: usarFixa ? nutriNum(p.metaFixa) : null, atualizadoEm: (/* @__PURE__ */ new Date()).toISOString() };
      const novas = { ...metas || {}, energia };
      const ok = await nutriApi.salvarMetas(studentId, ownerId, novas);
      setSalvando(false);
      if (!ok) {
        setErro("Não consegui salvar. Confira a conexão e tente de novo.");
        return;
      }
      onSalvo(novas);
    };
    const bloco = { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 16, padding: "14px 16px", marginBottom: 12 };
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: bloco }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800, marginBottom: 10 } }, "1. Metabolismo em repouso (TMB)"), base.opcoes.length === 0 ? /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#dc2626", lineHeight: 1.5 } }, "Sem dados para calcular. É preciso uma bioimpedância, ou dobras, ou peso e altura com sexo e data de nascimento na ficha.") : base.opcoes.map((o) => {
      const ativo = p.fonte === o.k;
      return /* @__PURE__ */ React.createElement("button", { key: o.k, type: "button", onClick: () => setP((x) => ({ ...x, fonte: o.k })), style: { width: "100%", textAlign: "left", borderRadius: 12, padding: "10px 12px", marginBottom: 6, border: "1.5px solid " + (ativo ? NUTRI_ESCURO : "#e2e8f0"), background: ativo ? NUTRI_ESCURO : "#fff", color: ativo ? "#fff" : NUTRI_ESCURO, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontSize: 14, fontWeight: 700 } }, o.rotulo), /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontSize: 11, color: ativo ? "#cbd5e1" : "#64748b" } }, o.sub)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 16, fontWeight: 800, whiteSpace: "nowrap" } }, nutriFmt(o.v), " kcal"));
    })), /* @__PURE__ */ React.createElement("div", { style: bloco }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800, marginBottom: 10 } }, "2. Rotina fora do treino"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, ENERGIA_FATORES.map((f) => /* @__PURE__ */ React.createElement(EnergiaChip, { key: f[0], ativo: p.fator === f[0], onClick: () => setP((x) => ({ ...x, fator: f[0] })), style: { flex: 1, padding: "6px 4px" } }, /* @__PURE__ */ React.createElement("span", { style: { display: "block" } }, f[1]), /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontSize: 11, fontWeight: 500 } }, "x " + String(f[0]).replace(".", ","))))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 8 } }, "Sem contar o exercício, que entra separado, dia a dia.")), /* @__PURE__ */ React.createElement("div", { style: bloco }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800, marginBottom: 10 } }, "3. Objetivo"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: opcoesAjuste.length ? 8 : 0 } }, ENERGIA_OBJETIVOS.map((o) => /* @__PURE__ */ React.createElement(EnergiaChip, { key: o[0], ativo: p.objetivo === o[0], onClick: () => setP((x) => ({ ...x, objetivo: o[0], ajuste: o[0] === "emagrecer" ? 400 : o[0] === "massa" ? 250 : 0 })), style: { flex: 1 } }, o[1]))), opcoesAjuste.length > 0 && !usarFixa && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, opcoesAjuste.map((v) => /* @__PURE__ */ React.createElement(EnergiaChip, { key: v, ativo: p.ajuste === v, onClick: () => setP((x) => ({ ...x, ajuste: v })), style: { flex: 1, borderRadius: 22 } }, (p.objetivo === "emagrecer" ? "- " : "+ ") + v + " kcal"))), /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 10, fontSize: 13, color: "#475569" } }, /* @__PURE__ */ React.createElement("span", null, p.objetivo === "emagrecer" ? "Outro déficit por dia" : "Outro superávit por dia"), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("input", { inputMode: "numeric", value: p.ajuste ? String(p.ajuste) : "", onChange: (e) => {
      const v = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
      setP((x) => ({ ...x, ajuste: isFinite(v) ? Math.min(v, 1500) : 0 }));
    }, placeholder: "—", style: { width: 76, height: 42, borderRadius: 10, border: "1.5px solid " + (opcoesAjuste.indexOf(p.ajuste) < 0 && p.ajuste ? NUTRI_LARANJA : "#e2e8f0"), textAlign: "center", fontSize: 16, fontWeight: 800, fontFamily: "inherit", color: NUTRI_ESCURO } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "#64748b" } }, "kcal")))), /* @__PURE__ */ React.createElement("div", { style: { borderTop: "1px solid #f1f5f9", marginTop: 12, paddingTop: 12 } }, /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: usarFixa, onChange: (e) => {
      const on = e.target.checked;
      setUsarFixa(on);
      if (!on) setP((x) => ({ ...x, metaFixa: null }));
    }, style: { width: 20, height: 20 } }), "Usar meta definida pelo nutricionista"), usarFixa && /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 10, fontSize: 13, color: "#475569" } }, /* @__PURE__ */ React.createElement("span", null, "Meta calórica diária"), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("input", { inputMode: "numeric", value: p.metaFixa ? String(p.metaFixa) : "", onChange: (e) => {
      const v = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
      setP((x) => ({ ...x, metaFixa: isFinite(v) ? v : null }));
    }, placeholder: "Ex.: 1800", style: { width: 90, height: 42, borderRadius: 10, border: "1.5px solid " + NUTRI_LARANJA, textAlign: "center", fontSize: 16, fontWeight: 800, fontFamily: "inherit", color: NUTRI_ESCURO } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "#64748b" } }, "kcal"))), usarFixa && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 8, lineHeight: 1.45 } }, "A meta fica fixa todos os dias, sem somar o exercício. O gasto estimado continua aparecendo para você acompanhar."))), semTreino && !semTreino.semTmb && /* @__PURE__ */ React.createElement("div", { style: { background: NUTRI_ESCURO, color: "#f8fafc", borderRadius: 18, padding: 16, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "#1e293b", borderRadius: 12, padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#cbd5e1" } }, "Meta em dia sem treino"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: "#fdba74" } }, nutriFmt(semTreino.meta), " kcal")), /* @__PURE__ */ React.createElement("div", { style: { background: "#1e293b", borderRadius: 12, padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#cbd5e1" } }, "Em dia de treino"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: "#fdba74" } }, exercicioMedio ? nutriFmt(comTreino.meta) + " kcal" : "—"))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#e2e8f0", marginTop: 10, lineHeight: 1.45 } }, usarFixa ? "Meta fixa do nutricionista: " + nutriFmt(nutriNum(p.metaFixa) || 0) + " kcal por dia. Gasto estimado em dia sem treino: " + nutriFmt(semTreino.gasto) + " kcal." : p.objetivo === "emagrecer" ? "Déficit de " + p.ajuste + " kcal por dia. Tendência estimada de cerca de " + (p.ajuste * 7 / 7700).toFixed(2).replace(".", ",") + " kg por semana, mantendo a proteína." : p.objetivo === "massa" ? "Superávit de " + p.ajuste + " kcal por dia, junto com a meta de proteína e o treino de força." : "Meta igual ao gasto estimado do dia.", exercicioMedio ? "" : " A meta de dia de treino aparece quando houver treinos com duração registrada."), semTreino.travou && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#fdba74", marginTop: 8, lineHeight: 1.45 } }, "A meta foi limitada à TMB. Um déficit maior exigiria comer abaixo do metabolismo em repouso.")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", textAlign: "center", marginBottom: 12, lineHeight: 1.5 } }, "Se o aluno tem nutricionista, use a meta calórica definida por ele. O app faz a conta e acompanha."), erro && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#dc2626", textAlign: "center", marginBottom: 10 } }, erro), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: onCancelar, style: { flex: 1, height: 48, borderRadius: 24, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: NUTRI_ESCURO } }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: salvar, disabled: salvando, style: { flex: 1.4, height: 48, borderRadius: 24, border: "none", background: NUTRI_LARANJA, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: salvando ? 0.6 : 1, fontFamily: "inherit" } }, salvando ? "Salvando..." : "Salvar plano")), ini.objetivo && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: async () => {
      if (!window.confirm("Desligar o plano energético deste aluno?")) return;
      const novas = { ...metas || {} };
      delete novas.energia;
      const ok = await nutriApi.salvarMetas(studentId, ownerId, novas);
      if (ok) onSalvo(novas);
      else alert("Não consegui salvar.");
    }, style: { display: "block", margin: "12px auto 0", background: "transparent", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 8 } }, "Desligar plano energético"));
  };
  const EnergiaComoCalculado = ({ e, itens, onApagarAtividade }) => {
    const [aberto, setAberto] = useState(false);
    if (!e || e.semTmb) return null;
    const linha = (rot, val, cor, forte, borda) => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 0", borderTop: borda ? "1px solid #f1f5f9" : "none", fontSize: forte ? 15 : 14 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: forte ? 800 : 500 } }, rot), /* @__PURE__ */ React.createElement("b", { style: { color: cor || NUTRI_ESCURO, whiteSpace: "nowrap" } }, val));
    return /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "12px 14px", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setAberto((a) => !a), "aria-expanded": aberto, style: { width: "100%", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center", color: NUTRI_ESCURO } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 800 } }, "Como sua meta foi calculada"), /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true", style: { fontSize: 12, color: "#64748b" } }, aberto ? "▲" : "▼")), aberto && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8 } }, linha("Metabolismo em repouso", nutriFmt(e.tmb.v)), linha("Rotina do dia a dia", "+ " + nutriFmt(e.rotinaExtra)), (itens || []).map((it, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "6px 0", fontSize: 14 } }, /* @__PURE__ */ React.createElement("span", null, it.rotulo, it.semDuracao ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "#64748b" } }, " · sem duração") : null), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("b", { style: { color: "#0f766e", whiteSpace: "nowrap" } }, "+ " + nutriFmt(it.kcal)), it.tipo === "extra" && onApagarAtividade && /* @__PURE__ */ React.createElement("button", { type: "button", "aria-label": "Remover " + it.rotulo, onClick: () => onApagarAtividade(it.id), style: { width: 28, height: 28, borderRadius: 14, border: "none", background: "#f1f5f9", color: "#64748b", cursor: "pointer", fontSize: 14 } }, "×")))), linha("Gasto estimado", nutriFmt(e.gasto), null, false, true), e.sinal !== 0 && linha(e.sinal < 0 ? "Déficit definido pelo seu personal" : "Superávit definido pelo seu personal", (e.sinal < 0 ? "- " : "+ ") + nutriFmt(e.ajuste), NUTRI_LARANJA_TXT), e.fixa && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", padding: "4px 0" } }, "Sua meta foi definida pelo seu nutricionista e não muda com o exercício."), linha("Meta do dia", nutriFmt(e.meta) + " kcal", null, true, true), e.travou && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 4 } }, "A meta nunca fica abaixo do seu metabolismo em repouso."), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 6, lineHeight: 1.45 } }, "Nos dias com treino a meta sobe. Todos os valores são estimativas.")));
  };
  const EnergiaAtividadeForm = ({ dia, peso, studentId, ownerId, onSalvo, onCancelar }) => {
    const [tipo, setTipo] = useState("caminhada");
    const [min, setMin] = useState(30);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const def = ENERGIA_ATIVIDADES.find((x) => x[0] === tipo);
    const kcal = energiaKcal(def[2], peso, min);
    const salvar = async () => {
      setSalvando(true);
      setErro("");
      const a = { id: "at_" + nutriId(), date: dia, tipo, rotulo: def[1], minutos: min, met: def[2], kcal, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      const ok = await energiaApi.salvarAtividade(studentId, ownerId, a);
      setSalvando(false);
      if (!ok) {
        setErro("Não consegui salvar. Confira a conexão e tente de novo.");
        return;
      }
      onSalvo(a);
    };
    return /* @__PURE__ */ React.createElement("div", { style: { padding: "18px 16px 24px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, marginBottom: 2 } }, "Outra atividade"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 14 } }, "O que você fez fora do treino com o personal."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6, marginBottom: 14 } }, ENERGIA_ATIVIDADES.map((a) => /* @__PURE__ */ React.createElement(EnergiaChip, { key: a[0], ativo: tipo === a[0], onClick: () => setTipo(a[0]) }, a[1]))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 700, marginBottom: 6 } }, "Por quanto tempo?"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 14 } }, [15, 20, 30, 45, 60, 90].map((m) => /* @__PURE__ */ React.createElement(EnergiaChip, { key: m, ativo: min === m, onClick: () => setMin(m), style: { flex: 1, padding: "0 2px" } }, m + " min"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", background: "#ecfdf5", borderRadius: 12, padding: "12px 14px", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "#065f46" } }, "Gasto estimado"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 20, fontWeight: 800, color: "#065f46" } }, peso ? nutriFmt(kcal) + " kcal" : "—")), !peso && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#dc2626", marginBottom: 10 } }, "Precisamos do seu peso para calcular. Peça ao seu personal para registrar uma avaliação."), erro && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#dc2626", textAlign: "center", marginBottom: 10 } }, erro), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: onCancelar, style: { flex: 1, height: 50, borderRadius: 25, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: NUTRI_ESCURO } }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: salvar, disabled: salvando || !peso, style: { flex: 1.4, height: 50, borderRadius: 25, border: "none", background: NUTRI_LARANJA, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: salvando || !peso ? 0.55 : 1, fontFamily: "inherit" } }, salvando ? "Salvando..." : "Salvar atividade")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 12 } }, "Cálculo pelo seu peso e pela intensidade típica da atividade. É uma estimativa."));
  };
  const EnergiaSemana = ({ dias, plano }) => {
    const comReg = dias.filter((d) => d.consumido > 0 && d.e && !d.e.semTmb && !d.hoje);
    const deficits = comReg.map((d) => d.e.gasto - d.consumido);
    const medio = deficits.length ? Math.round(deficits.reduce((a, b) => a + b, 0) / deficits.length) : null;
    const acumulado = deficits.reduce((a, b) => a + b, 0);
    const exTotal = dias.reduce((s, d) => s + (d.e ? d.e.exercicio : 0), 0);
    const sessoes = dias.reduce((s, d) => s + d.sessoes, 0);
    const semDur = dias.reduce((s, d) => s + d.semDuracao, 0);
    const max = Math.max(1, ...dias.map((d) => Math.max(d.consumido, d.e && !d.e.semTmb ? d.e.meta : 0)));
    const alvoTxt = plano.objetivo === "emagrecer" ? "déficit de " + plano.ajuste + " kcal/dia" : plano.objetivo === "massa" ? "superávit de " + plano.ajuste + " kcal/dia" : "manter o peso";
    const card = (tit, val, sub, escuro) => /* @__PURE__ */ React.createElement("div", { style: { background: escuro ? NUTRI_ESCURO : "#fff", color: escuro ? "#f8fafc" : NUTRI_ESCURO, border: escuro ? "none" : "1.5px solid #e2e8f0", borderRadius: 14, padding: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: escuro ? "#cbd5e1" : "#64748b" } }, tit), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 19, fontWeight: 800, color: escuro ? "#fdba74" : NUTRI_ESCURO } }, val), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: escuro ? "#cbd5e1" : "#64748b" } }, sub));
    return /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 6 } }, "Balanço energético · objetivo: ", alvoTxt), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 10 } }, card(plano.objetivo === "massa" ? "Saldo médio" : "Déficit médio", medio === null ? "—" : nutriFmt(Math.abs(medio)), medio === null ? "sem dias completos" : medio >= 0 ? "kcal/dia abaixo do gasto" : "kcal/dia acima do gasto", true), card("Exercício", nutriFmt(exTotal), "kcal · " + sessoes + " " + (sessoes === 1 ? "registro" : "registros")), card("Dias completos", String(comReg.length), "com refeições")), /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 15 } }, "Consumido x meta do dia"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, "kcal")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 6, height: 130, borderBottom: "1px solid #e2e8f0" } }, dias.map((d) => {
      const meta = d.e && !d.e.semTmb ? d.e.meta : 0;
      const acima = meta && d.consumido > meta;
      return /* @__PURE__ */ React.createElement("div", { key: d.date, style: { flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 2, height: "100%" } }, /* @__PURE__ */ React.createElement("div", { title: "Meta " + nutriFmt(meta), style: { width: "45%", height: meta ? Math.max(3, Math.round(meta / max * 120)) : 3, background: "#e2e8f0", borderRadius: "4px 4px 0 0" } }), /* @__PURE__ */ React.createElement("div", { title: "Consumido " + nutriFmt(d.consumido), style: { width: "45%", height: d.consumido ? Math.max(3, Math.round(d.consumido / max * 120)) : 3, background: !d.consumido ? "#f1f5f9" : acima ? NUTRI_LARANJA_TXT : NUTRI_LARANJA, opacity: d.hoje ? 0.55 : 1, borderRadius: "4px 4px 0 0" } }));
    })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 6 } }, dias.map((d) => /* @__PURE__ */ React.createElement("div", { key: d.date, style: { flex: 1, textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#64748b" } }, nutriDiaSemana(d.date)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: "#0f766e", minHeight: 12 } }, d.sessoes ? "treino" : "")))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, fontSize: 11, color: "#64748b", marginTop: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: 3, background: "#e2e8f0" } }), "meta"), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: 3, background: NUTRI_LARANJA } }), "consumido"), /* @__PURE__ */ React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 5 } }, /* @__PURE__ */ React.createElement("span", { style: { width: 10, height: 10, borderRadius: 3, background: NUTRI_LARANJA_TXT } }), "acima da meta")), comReg.length > 0 && plano.objetivo !== "manter" && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#475569", marginTop: 10, lineHeight: 1.5 } }, (acumulado >= 0 ? "Déficit" : "Superávit") + " acumulado estimado de " + nutriFmt(Math.abs(acumulado)) + " kcal em " + comReg.length + " " + (comReg.length === 1 ? "dia" : "dias") + ", perto de " + (Math.abs(acumulado) / 7700).toFixed(1).replace(".", ",") + " kg."), semDur > 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: NUTRI_LARANJA_TXT, marginTop: 6 } }, semDur + " " + (semDur === 1 ? "treino sem duração registrada, não entrou" : "treinos sem duração registrada, não entraram") + " na conta.")));
  };
  const NutriCard = ({ children, style, onClick }) => /* @__PURE__ */ React.createElement("div", { onClick, style: { background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", boxShadow: "0 1px 6px #0001", padding: 18, cursor: onClick ? "pointer" : void 0, ...style || {} } }, children);
  const NutriPainel = ({ st, assessments }) => {
    const [carregando, setCarregando] = useState(true);
    const [falhou, setFalhou] = useState(false);
    const [refeicoes, setRefeicoes] = useState([]);
    const [metas, setMetas] = useState(null);
    const [sel, setSel] = useState("prot");
    const [editando, setEditando] = useState(false);
    const [ownerId, setOwnerId] = useState(null);
    const [aberta, setAberta] = useState(null);
    const [antroLista, setAntroLista] = useState([]);
    const [ckSemana, setCkSemana] = useState([]);
    const [atSemana, setAtSemana] = useState([]);
    const [planoAberto, setPlanoAberto] = useState(false);
    const hoje = nutriHoje();
    const inicio = nutriDiaMais(hoje, -6);
    useEffect(() => {
      (async () => {
        setCarregando(true);
        const [lista, m2, uidProf, al, ck, at] = await Promise.all([nutriApi.listar(st.id, inicio, hoje), nutriApi.metas(st.id), nutriApi.usuarioId(), antroApi.listar(st.id), energiaApi.checkins(st.id, inicio, hoje), energiaApi.atividades(st.id, inicio, hoje)]);
        setAntroLista(al || []);
        setCkSemana(ck);
        setAtSemana(at);
        setFalhou(lista === null);
        setRefeicoes(lista || []);
        setMetas(m2 || {});
        setOwnerId(uidProf);
        setCarregando(false);
      })();
    }, [st.id]);
    const pesoAval = (() => {
      const l = (assessments || []).filter((a) => a.studentId === st.id && a.aha && nutriNum(a.aha.weight)).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      return l.length ? nutriNum(l[0].aha.weight) : null;
    })();
    if (carregando) return /* @__PURE__ */ React.createElement(NutriCard, { style: { textAlign: "center", padding: 32, color: "#94a3b8" } }, "Carregando alimentação...");
    const alturaAval = (() => {
      const l = (assessments || []).filter((a) => a.studentId === st.id && a.aha && nutriNum(a.aha.height)).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      return l.length ? nutriNum(l[0].aha.height) : null;
    })();
    const med = antroMedidas(antroLista, (assessments || []).filter((a) => a.studentId === st.id), metas);
    const eBase = energiaBase(st, antroLista, med);
    const eExSemana = energiaExercicio(ckSemana, atSemana, eBase.peso);
    const eDiasTreino = Object.keys(eExSemana).filter((d) => eExSemana[d].kcal > 0);
    const eExMedio = eDiasTreino.length ? Math.round(eDiasTreino.reduce((s, d) => s + eExSemana[d].kcal, 0) / eDiasTreino.length) : 0;
    const ePlano = metas && metas.energia && metas.energia.objetivo ? metas.energia : null;
    if (planoAberto) {
      return /* @__PURE__ */ React.createElement(NutriCard, { style: { padding: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 16, marginBottom: 4 } }, "Plano energético"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 12 } }, "TMB da avaliação, rotina, exercício do dia e objetivo. O aluno vê a meta e quanto ainda pode consumir."), /* @__PURE__ */ React.createElement(
        EnergiaPlanoEditor,
        {
          base: eBase,
          metas,
          studentId: st.id,
          ownerId,
          exercicioMedio: eExMedio,
          onCancelar: () => setPlanoAberto(false),
          onSalvo: (m2) => {
            setMetas(m2);
            setPlanoAberto(false);
          }
        }
      ));
    }
    if (editando) {
      return /* @__PURE__ */ React.createElement(NutriCard, { style: { padding: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 16, marginBottom: 4 } }, "Metas diárias"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 12 } }, "O aluno também pode ajustar pelo app dele."), /* @__PURE__ */ React.createElement(
        NutriMetasEditor,
        {
          studentId: st.id,
          ownerId,
          metas,
          papel: "professor",
          pesoSugerido: med.peso,
          kcalRef: (function() {
            const r = energiaDia(ePlano, eBase, 0);
            return r && !r.semTmb ? r.meta : null;
          })(),
          objetivoPlano: ePlano && ePlano.objetivo,
          tmbRef: energiaTmb(eBase, ePlano && ePlano.fonte),
          onCancelar: () => setEditando(false),
          onSalvo: (m2) => {
            setMetas(m2);
            setEditando(false);
          }
        }
      ));
    }
    const m = metas || {};
    const dias = Array.from({ length: 7 }, (_, i) => nutriDiaMais(inicio, i));
    const porDia = {};
    dias.forEach((d) => {
      porDia[d] = { ...nutriZero(), n: 0 };
    });
    refeicoes.forEach((r) => {
      const d = porDia[r.date];
      if (!d) return;
      const t = r.totais || {};
      ["kcal", "prot", "carb", "gord", "fibra"].forEach((k) => {
        d[k] += nutriNum(t[k]);
      });
      d.n += 1;
    });
    const comRegistro = dias.filter((d) => porDia[d].n > 0);
    const completos = comRegistro.filter((d) => d !== hoje);
    const baseMedia = completos.length ? completos : comRegistro;
    const media = (k) => baseMedia.length ? Math.round(baseMedia.reduce((s, d) => s + porDia[d][k], 0) / baseMedia.length) : 0;
    const macroSel = NUTRI_MACROS.find((x) => x.k === sel);
    const metaSel = nutriNum(m[sel]);
    const maxSerie = Math.max(metaSel * 1.15, ...dias.map((d) => porDia[d][sel]), 1);
    const alturaGraf = 120;
    const bateuMeta = metaSel ? completos.filter((d) => porDia[d][sel] >= metaSel).length : 0;
    const ultimos = refeicoes.slice().sort((a, b) => ((b.date || "") + (b.hora || "")).localeCompare((a.date || "") + (a.hora || ""))).slice(0, 6);
    const quem = m.atualizadoPor ? "Metas atualizadas " + (m.atualizadoPor === "aluno" ? "pelo aluno" : "por você") + " em " + nutriDataCurta(m.atualizadoEm) : "Metas ainda não definidas";
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#94a3b8" } }, "Últimos 7 dias · ", comRegistro.length, " de 7 com registro"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: m.atualizadoPor === "aluno" ? NUTRI_LARANJA_TXT : "#94a3b8", marginTop: 2 } }, quem)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setPlanoAberto(true), style: { height: 36, padding: "0 14px", borderRadius: 10, border: "none", background: NUTRI_LARANJA, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, "Plano energético"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setEditando(true), style: { height: 36, padding: "0 14px", borderRadius: 10, border: "1.5px solid " + NUTRI_LARANJA, background: "transparent", color: NUTRI_LARANJA_TXT, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, "Ajustar metas"))), ePlano && /* @__PURE__ */ React.createElement(EnergiaSemana, { plano: ePlano, dias: dias.map((d) => {
      const ex = eExSemana[d] || { kcal: 0, itens: [] };
      return { date: d, hoje: d === hoje, consumido: Math.round(porDia[d].kcal), e: energiaDia(ePlano, eBase, ex.kcal), sessoes: ex.itens.length, semDuracao: ex.itens.filter((i) => i.semDuracao).length };
    }) }), !ePlano && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setPlanoAberto(true), style: { width: "100%", textAlign: "left", background: "#fff4ee", border: "1.5px solid #fed7aa", borderRadius: 14, padding: "12px 14px", marginBottom: 12, cursor: "pointer", fontFamily: "inherit" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: NUTRI_LARANJA_TXT } }, "Ativar plano energético"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2 } }, "Meta de calorias diária a partir da TMB da avaliação e do gasto dos treinos.")), falhou && /* @__PURE__ */ React.createElement(NutriCard, { style: { padding: 12, marginBottom: 10, color: "#dc2626", fontSize: 13 } }, "Não consegui carregar os registros. Confira se os SQLs do registro alimentar foram rodados."), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 6 } }, "Média diária", completos.length ? " (dias completos)" : "", media("kcal") ? " · " + nutriFmt(media("kcal")) + " kcal" + (m.kcal ? " de " + nutriFmt(m.kcal) : "") : ""), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 12 } }, NUTRI_MACROS.map((mc) => {
      const ativo = mc.k === sel;
      const md = media(mc.k);
      const mt = nutriNum(m[mc.k]);
      return /* @__PURE__ */ React.createElement("button", { key: mc.k, type: "button", onClick: () => setSel(mc.k), style: { textAlign: "left", borderRadius: 14, padding: 12, cursor: "pointer", fontFamily: "inherit", border: "1.5px solid " + (ativo ? NUTRI_ESCURO : "#e2e8f0"), background: ativo ? NUTRI_ESCURO : "#fff", color: ativo ? "#f8fafc" : "#0f172a" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: ativo ? "#cbd5e1" : "#64748b" } }, mc.nome), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, margin: "2px 0 6px" } }, md, " g"), /* @__PURE__ */ React.createElement(NutriBarra, { valor: md, meta: mt || 0, cor: NUTRI_LARANJA, fundo: ativo ? "#334155" : "#f1f5f9", altura: 4 }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, marginTop: 5, color: ativo ? "#cbd5e1" : "#64748b" } }, mt ? "meta " + nutriFmt(mt) + " g" : "sem meta definida"));
    })), /* @__PURE__ */ React.createElement(NutriCard, { style: { padding: 16, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 15 } }, macroSel.nome, " por dia (g)"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", textAlign: "right" } }, metaSel ? "linha = meta · bateu em " + bateuMeta + " de " + completos.length : "defina a meta para ver a linha")), /* @__PURE__ */ React.createElement("div", { style: { position: "relative", height: alturaGraf + 20, display: "flex", alignItems: "flex-end", gap: 6, borderBottom: "1px solid #e2e8f0" } }, metaSel ? /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, right: 0, bottom: Math.round(metaSel / maxSerie * alturaGraf), borderTop: "1.5px dashed " + NUTRI_ESCURO, zIndex: 1 } }) : null, dias.map((d) => {
      const v = porDia[d][sel];
      const ehHoje = d === hoje;
      const bateu = metaSel && v >= metaSel;
      const cor = !porDia[d].n ? "#e2e8f0" : ehHoje ? "#fdba74" : bateu ? NUTRI_LARANJA_TXT : NUTRI_LARANJA;
      const h = porDia[d].n ? Math.max(4, Math.round(v / maxSerie * alturaGraf)) : 4;
      return /* @__PURE__ */ React.createElement("div", { key: d, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 3, height: "100%" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: "#64748b" } }, porDia[d].n ? Math.round(v) : "·"), /* @__PURE__ */ React.createElement("div", { style: { width: "100%", height: h, background: cor, borderRadius: "6px 6px 0 0" } }));
    })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 6 } }, dias.map((d) => /* @__PURE__ */ React.createElement("span", { key: d, style: { flex: 1, textAlign: "center", fontSize: 11, color: "#64748b" } }, nutriDiaSemana(d)))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 8 } }, "Hoje aparece mais claro porque o dia ainda não terminou.")), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 15, marginBottom: 8 } }, "Últimos registros"), ultimos.length === 0 ? /* @__PURE__ */ React.createElement(NutriCard, { style: { textAlign: "center", padding: 24, color: "#94a3b8", fontSize: 13 } }, "Nenhuma refeição registrada nos últimos 7 dias.") : ultimos.map((r) => {
      const t = r.totais || {};
      const aberto = aberta === r.id;
      return /* @__PURE__ */ React.createElement(NutriCard, { key: r.id, onClick: () => setAberta(aberto ? null : r.id), style: { padding: "12px 14px", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, (r.date === hoje ? "Hoje" : nutriDiaSemana(r.date) + " " + nutriDataCurta(r.date)) + " · " + nutriTipoNome(r.tipo)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b" } }, "P " + nutriFmt(t.prot) + " · C " + nutriFmt(t.carb) + " · G " + nutriFmt(t.gord) + " · F " + nutriFmt(t.fibra) + " g · " + (r.origem === "foto" ? "por foto" : r.origem === "texto" ? "por descrição" : "manual"))), /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" } }, nutriFmt(t.kcal), " kcal")), aberto && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, borderTop: "1px solid #f1f5f9", paddingTop: 8 } }, (r.itens || []).map((i, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, style: { display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#334155" } }, i.nome, nutriNum(i.gramas) ? " (" + nutriFmt(i.gramas) + " g)" : ""), /* @__PURE__ */ React.createElement("span", { style: { color: "#64748b", whiteSpace: "nowrap" } }, nutriFmt(i.kcal), " kcal · P ", nutriFmt(i.prot))))));
    }));
  };
  window.LongevusAlimentacao = { Painel: NutriPainel };
})();
