(function() {
  const { useState, useEffect } = React;
  const SUPA_URL = "https://jpduxfbigcdxmtcozqpp.supabase.co";
  const SUPA_KEY = "sb_publishable_VZSgcxu5ps3eR9UAjuRr4Q_B65WTx_h";
  const nutriSupa = () => window.__LV_SUPA;
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
      const r = await fetch(SUPA_URL + "/functions/v1/analisar-refeicao", { method: "POST", headers: h, body: JSON.stringify(payload) });
      let j = null;
      try {
        j = await r.json();
      } catch (e) {
      }
      if (!r.ok || !j || j.erro) throw new Error(j && j.erro || "Falha na análise (HTTP " + r.status + ")");
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
  const NutriResumoDia = ({ totais, metas, qtd }) => {
    const m = metas || {};
    const faltaProt = m.prot ? Math.max(0, Math.round(m.prot - totais.prot)) : null;
    return /* @__PURE__ */ React.createElement("div", { style: { background: NUTRI_ESCURO, color: "#f8fafc", borderRadius: 18, padding: 18, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 34, fontWeight: 800 } }, nutriFmt(totais.kcal)), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "#cbd5e1" } }, "kcal", m.kcal ? " de " + nutriFmt(m.kcal) : "")), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "#cbd5e1" } }, qtd, " ", qtd === 1 ? "refeição" : "refeições")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 700 } }, "Proteína"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", { style: { color: "#fb923c" } }, nutriFmt(totais.prot), " g"), /* @__PURE__ */ React.createElement("span", { style: { color: "#cbd5e1" } }, m.prot ? " de " + nutriFmt(m.prot) + " g" : ""))), /* @__PURE__ */ React.createElement(NutriBarra, { valor: totais.prot, meta: m.prot || 0, cor: "#fb923c", fundo: "#334155", altura: 10 }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#cbd5e1", marginTop: 6, marginBottom: 14 } }, m.prot ? faltaProt > 0 ? "Faltam " + faltaProt + " g para a meta de hoje" : "Meta de proteína atingida" : "Defina suas metas para acompanhar o progresso"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 } }, NUTRI_MACROS.slice(1).map((mc) => /* @__PURE__ */ React.createElement("div", { key: mc.k, style: { background: "#1e293b", borderRadius: 12, padding: "9px 10px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#cbd5e1" } }, mc.nome), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700, margin: "2px 0 6px" } }, nutriFmt(totais[mc.k]), " g", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 500, color: "#94a3b8" } }, m[mc.k] ? " / " + nutriFmt(m[mc.k]) : "")), /* @__PURE__ */ React.createElement(NutriBarra, { valor: totais[mc.k], meta: m[mc.k] || 0, cor: "#e2e8f0", fundo: "#334155", altura: 4 })))));
  };
  const NutriStepper = ({ nome, dica, valor, un, passo, onChange }) => /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "8px 10px 8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 700 } }, nome), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#64748b" } }, dica)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, flexShrink: 0 } }, /* @__PURE__ */ React.createElement("button", { type: "button", "aria-label": "Diminuir " + nome, onClick: () => onChange(Math.max(0, nutriNum(valor) - passo)), style: { width: 40, height: 40, borderRadius: 20, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 20, cursor: "pointer", color: "#0f172a" } }, "−"), /* @__PURE__ */ React.createElement("input", { inputMode: "decimal", value: valor === "" || valor == null ? "" : String(valor), onChange: (e) => onChange(e.target.value.replace(/[^0-9.,]/g, "")), placeholder: "—", style: { width: 62, height: 40, textAlign: "center", border: "none", background: "transparent", fontSize: 16, fontWeight: 800, fontFamily: "inherit", color: "#0f172a" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "#64748b", width: 26 } }, un), /* @__PURE__ */ React.createElement("button", { type: "button", "aria-label": "Aumentar " + nome, onClick: () => onChange(nutriNum(valor) + passo), style: { width: 40, height: 40, borderRadius: 20, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 20, cursor: "pointer", color: "#0f172a" } }, "+")));
  const NutriMetasEditor = ({ studentId, ownerId, metas, papel, pesoSugerido, onSalvo, onCancelar }) => {
    const ini = metas || {};
    const [f, setF] = useState({
      peso: ini.peso || pesoSugerido || "",
      objetivo: ini.objetivo || "manter",
      kcal: ini.kcal || "",
      prot: ini.prot || "",
      carb: ini.carb || "",
      gord: ini.gord || "",
      fibra: ini.fibra || ""
    });
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
    const peso = nutriNum(f.peso);
    const usarBase = () => {
      if (!peso) {
        setErro("Informe o peso para calcular a base sugerida.");
        return;
      }
      setErro("");
      const fator = f.objetivo === "massa" ? 1.4 : 1.2;
      setF((p) => ({ ...p, prot: Math.round(peso * fator / 5) * 5, fibra: nutriNum(p.fibra) || 25 }));
    };
    const salvar = async () => {
      setSalvando(true);
      setErro("");
      const limpo = { peso: nutriNum(f.peso) || null, objetivo: f.objetivo };
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
    return /* @__PURE__ */ React.createElement("div", null, quem && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginBottom: 12 } }, quem), /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 14, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b" } }, "Peso atual"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 4 } }, /* @__PURE__ */ React.createElement("input", { inputMode: "decimal", value: String(f.peso || ""), onChange: (e) => set("peso")(e.target.value.replace(/[^0-9.,]/g, "")), placeholder: "—", style: { width: 70, border: "none", borderBottom: "1.5px solid #e2e8f0", fontSize: 18, fontWeight: 800, fontFamily: "inherit", padding: "2px 0", color: "#0f172a", background: "transparent" } }), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "#64748b" } }, "kg"))), pesoSugerido ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "#64748b", textAlign: "right" } }, "Última avaliação: ", String(pesoSugerido).replace(".", ","), " kg") : null), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginBottom: 6 } }, "Objetivo"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 } }, NUTRI_OBJETIVOS.map((o) => {
      const ativo = f.objetivo === o[0];
      return /* @__PURE__ */ React.createElement("button", { key: o[0], type: "button", onClick: () => set("objetivo")(o[0]), style: { height: 36, padding: "0 14px", borderRadius: 18, border: "1.5px solid " + (ativo ? NUTRI_ESCURO : "#e2e8f0"), background: ativo ? NUTRI_ESCURO : "#fff", color: ativo ? "#fff" : "#0f172a", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, o[1]);
    })), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: usarBase, style: { width: "100%", height: 42, borderRadius: 21, border: "1.5px solid " + NUTRI_LARANJA, background: "#fff", color: NUTRI_LARANJA_TXT, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, "Preencher com base sugerida")), /* @__PURE__ */ React.createElement(NutriStepper, { nome: "Calorias", dica: "opcional", valor: f.kcal, un: "kcal", passo: 50, onChange: set("kcal") }), /* @__PURE__ */ React.createElement(NutriStepper, { nome: "Proteína", dica: porKg, valor: f.prot, un: "g", passo: 5, onChange: set("prot") }), /* @__PURE__ */ React.createElement(NutriStepper, { nome: "Carboidratos", dica: "por dia", valor: f.carb, un: "g", passo: 10, onChange: set("carb") }), /* @__PURE__ */ React.createElement(NutriStepper, { nome: "Gorduras", dica: "por dia", valor: f.gord, un: "g", passo: 5, onChange: set("gord") }), /* @__PURE__ */ React.createElement(NutriStepper, { nome: "Fibras", dica: "referência geral 25 a 30 g", valor: f.fibra, un: "g", passo: 1, onChange: set("fibra") }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", textAlign: "center", margin: "10px 0 12px", lineHeight: 1.5 } }, "A base sugerida é só um ponto de partida. Se houver acompanhamento com nutricionista, use as metas definidas por ele."), erro && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#dc2626", textAlign: "center", marginBottom: 10 } }, erro), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, onCancelar && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: onCancelar, style: { flex: 1, height: 48, borderRadius: 24, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: "#0f172a" } }, "Cancelar"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: salvar, disabled: salvando, style: { flex: 1.4, height: 48, borderRadius: 24, border: "none", background: NUTRI_LARANJA, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", opacity: salvando ? 0.6 : 1, fontFamily: "inherit" } }, salvando ? "Salvando..." : "Salvar metas")));
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
    const hoje = nutriHoje();
    const inicio = nutriDiaMais(hoje, -6);
    useEffect(() => {
      (async () => {
        setCarregando(true);
        const [lista, m2, uidProf] = await Promise.all([nutriApi.listar(st.id, inicio, hoje), nutriApi.metas(st.id), nutriApi.usuarioId()]);
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
    if (editando) {
      return /* @__PURE__ */ React.createElement(NutriCard, { style: { padding: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 16, marginBottom: 4 } }, "Metas diárias"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 12 } }, "O aluno também pode ajustar pelo app dele."), /* @__PURE__ */ React.createElement(
        NutriMetasEditor,
        {
          studentId: st.id,
          ownerId,
          metas,
          papel: "professor",
          pesoSugerido: pesoAval,
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
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#94a3b8" } }, "Últimos 7 dias · ", comRegistro.length, " de 7 com registro"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: m.atualizadoPor === "aluno" ? NUTRI_LARANJA_TXT : "#94a3b8", marginTop: 2 } }, quem)), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setEditando(true), style: { height: 36, padding: "0 14px", borderRadius: 10, border: "1.5px solid " + NUTRI_LARANJA, background: "transparent", color: NUTRI_LARANJA_TXT, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, "Ajustar metas")), falhou && /* @__PURE__ */ React.createElement(NutriCard, { style: { padding: 12, marginBottom: 10, color: "#dc2626", fontSize: 13 } }, "Não consegui carregar os registros. Confira se os SQLs do registro alimentar foram rodados."), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 6 } }, "Média diária", completos.length ? " (dias completos)" : "", media("kcal") ? " · " + nutriFmt(media("kcal")) + " kcal" + (m.kcal ? " de " + nutriFmt(m.kcal) : "") : ""), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 12 } }, NUTRI_MACROS.map((mc) => {
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
