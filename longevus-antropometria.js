(function() {
  const { useState, useEffect } = React;
  const SUPA_URL = "https://jpduxfbigcdxmtcozqpp.supabase.co";
  const SUPA_KEY = "sb_publishable_VZSgcxu5ps3eR9UAjuRr4Q_B65WTx_h";
  const nutriSupa = () => window.__LV_SUPA;
  const antroSupa = () => window.__LV_SUPA;
  const ANTRO_MEMBROS = [["bracoRelaxado", "Braço relaxado"], ["bracoContraido", "Braço contraído"], ["antebraco", "Antebraço"], ["coxa", "Coxa"], ["panturrilha", "Panturrilha"]];
  const ANTRO_TRONCO = [["torax", "Tórax"], ["cintura", "Cintura"], ["abdomen", "Abdômen"], ["quadril", "Quadril"]];
  const ANTRO_DOBRAS = [["peitoral", "Peitoral"], ["axilar", "Axilar média"], ["triceps", "Tríceps"], ["subescapular", "Subescapular"], ["abdominal", "Abdominal"], ["suprailiaca", "Suprailíaca"], ["coxa", "Coxa"]];
  const ANTRO_BIO = [["gordura", "Gordura corporal", "%"], ["massaGorda", "Massa de gordura", "kg"], ["massaMagra", "Massa magra", "kg"], ["mme", "Massa muscular esquelética", "kg"], ["agua", "Água corporal", "L"], ["visceral", "Gordura visceral", "nível"], ["tmb", "Taxa metabólica basal", "kcal"]];
  const ANTRO_BIO_OMRON = [["gordura", "Gordura corporal", "%"], ["mmePct", "Músculo esquelético", "%"], ["visceral", "Gordura visceral", "nível"], ["tmb", "Metabolismo de repouso", "kcal"], ["idadeCorporal", "Idade corporal", "anos"]];
  const ANTRO_BIO_TODOS = ANTRO_BIO.concat([["mmePct", "Músculo esquelético", "%"], ["idadeCorporal", "Idade corporal", "anos"]]);
  const antroBioOmron = (peso, gPct, mPct) => {
    const r = {};
    if (peso && gPct) {
      r.massaGorda = Math.round(peso * gPct / 10) / 10;
      r.massaMagra = Math.round((peso - peso * gPct / 100) * 10) / 10;
    }
    if (peso && mPct) r.mme = Math.round(peso * mPct / 10) / 10;
    return r;
  };
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
    const f = { date: r.date || antroHoje(), peso: antroInput(r.peso), altura: antroInput(r.altura), protocolo: r.dobras && r.dobras.protocolo || 7, aparelho: r.bio && r.bio.aparelho || "", modoBio: r.bio && r.bio.modo || "" };
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
    ANTRO_BIO_TODOS.forEach((b) => {
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
  const AntroForm = ({ rec, papel, sexo, dob, onSalvar, onCancelar, onApagar, abaInicial, prefill, modoBioPadrao }) => {
    const [f, setF] = useState(() => {
      const b = antroParaForm(rec || {});
      if (!b.modoBio) b.modoBio = modoBioPadrao || "kg";
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
    const omron = f.modoBio === "omron";
    const calcOmron = omron ? antroBioOmron(peso, antroNum(f.b_gordura), antroNum(f.b_mmePct)) : {};
    const listaBio = omron ? ANTRO_BIO_OMRON : ANTRO_BIO;
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
      const bio = { aparelho: (f.aparelho || "").trim() || (omron ? "Omron HBF-514C" : null), modo: omron ? "omron" : "kg" };
      let temB = false;
      listaBio.forEach((b) => {
        const v = antroNum(f["b_" + b[0]]);
        if (v) {
          bio[b[0]] = v;
          temB = true;
        }
      });
      if (omron && temB) Object.assign(bio, calcOmron);
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
        if (!listaBio.some((b) => antroNum(f["b_" + b[0]]))) {
          setErro("Preencha pelo menos um resultado do laudo.");
          return;
        }
      } else if (!peso && !altura && !ANTRO_TRONCO.some((t) => antroNum(f["t_" + t[0]])) && !ANTRO_MEMBROS.some((m) => antroNum(f["m_" + m[0] + "_d"]) || antroNum(f["m_" + m[0] + "_e"])) && !ANTRO_DOBRAS.some((d) => antroNum(f["d_" + d[0]])) && !listaBio.some((b) => antroNum(f["b_" + b[0]]))) {
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
    }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#64748b" } }, "Diferença em laranja quando passa de 2 cm entre os lados.")), /* @__PURE__ */ React.createElement(AntroBloco, { titulo: "Tronco (cm)" }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 } }, ANTRO_TRONCO.map((t) => /* @__PURE__ */ React.createElement(AntroCampo, { key: t[0], rotulo: t[1], valor: f["t_" + t[0]], onChange: set("t_" + t[0]) })))), /* @__PURE__ */ React.createElement(AntroBloco, { titulo: "Calculado", escuro: true }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "#1e293b", borderRadius: 12, padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#cbd5e1" } }, "Cintura / quadril"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800 } }, base.rcq ? antroFmt(base.rcq, 2) : "—"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: rcqAlto ? "#fdba74" : "#94a3b8" } }, base.rcq ? rcqAlto ? "acima de " + (sexo === "F" ? "0,85" : "0,90") : "dentro da referência" : "informe cintura e quadril")), /* @__PURE__ */ React.createElement("div", { style: { background: "#1e293b", borderRadius: 12, padding: "10px 12px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#cbd5e1" } }, "Cintura / estatura"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 18, fontWeight: 800 } }, base.rcest ? antroFmt(base.rcest, 2) : "—"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: base.rcest > 0.5 ? "#fdba74" : "#94a3b8" } }, base.rcest ? base.rcest > 0.5 ? "acima de 0,50" : "até 0,50" : "informe cintura e altura"))))), aba === "dobras" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(AntroBloco, { titulo: "Protocolo", extra: (sexo === "F" ? "Feminino" : sexo === "M" ? "Masculino" : "Sexo não informado") + (idade ? " · " + idade + " anos" : "") }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, [3, 7].map((n) => /* @__PURE__ */ React.createElement("button", { key: n, type: "button", onClick: () => set("protocolo")(n), style: { flex: 1, height: 44, borderRadius: 22, border: "1.5px solid " + (f.protocolo === n ? ANTRO_ESCURO : "#e2e8f0"), background: f.protocolo === n ? ANTRO_ESCURO : "#fff", color: f.protocolo === n ? "#fff" : ANTRO_ESCURO, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, "Jackson & Pollock ", n))), (!sexo || !idade) && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#dc2626", marginTop: 10 } }, "Para calcular o % de gordura, preencha sexo e data de nascimento na ficha do aluno.")), /* @__PURE__ */ React.createElement(AntroBloco, { titulo: "Dobras (mm)", extra: "lado direito" }, sitios.map((k) => /* @__PURE__ */ React.createElement("div", { key: k, style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { flex: 1, fontSize: 14 } }, nomeDobra(k)), /* @__PURE__ */ React.createElement("input", { inputMode: "decimal", "aria-label": nomeDobra(k) + " em milímetros", value: f["d_" + k] || "", onChange: (ev) => set("d_" + k)(ev.target.value.replace(/[^0-9.,]/g, "")), placeholder: "—", style: { width: 72, height: 42, borderRadius: 10, border: "1.5px solid #e2e8f0", textAlign: "center", fontSize: 16, fontWeight: 700, fontFamily: "inherit", color: ANTRO_ESCURO } })))), /* @__PURE__ */ React.createElement(AntroBloco, { escuro: true }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 34, fontWeight: 800, color: "#fdba74" } }, calcDob ? antroFmt(calcDob.gordura, 1) + "%" : "—"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "#cbd5e1" } }, "de gordura corporal")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 } }, [["Soma", calcDob ? antroFmt(calcDob.soma, 1) + " mm" : "—"], ["Massa gorda", calcDob && calcDob.massaGorda ? antroFmt(calcDob.massaGorda, 1) + " kg" : "—"], ["Massa magra", calcDob && calcDob.massaMagra ? antroFmt(calcDob.massaMagra, 1) + " kg" : "—"]].map((x) => /* @__PURE__ */ React.createElement("div", { key: x[0], style: { background: "#1e293b", borderRadius: 12, padding: "9px 10px" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#cbd5e1" } }, x[0]), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 800 } }, x[1])))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 10 } }, "Jackson & Pollock ", f.protocolo, " dobras, equação de Siri.", peso ? "" : " Informe o peso para ver massa gorda e magra."))), aba === "bio" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(AntroBloco, { titulo: papel === "aluno" ? "Resultado do laudo" : "Bioimpedância", extra: "preencha o que tiver" }, papel !== "aluno" && React.createElement("div", { style: { display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 12, padding: 4, marginBottom: 10 } }, [["omron", "Omron (em %)"], ["kg", "InBody e outros (kg)"]].map((o) => React.createElement("button", { key: o[0], type: "button", onClick: () => set("modoBio")(o[0]), style: { flex: 1, height: 38, borderRadius: 9, border: "none", background: f.modoBio === o[0] ? ANTRO_ESCURO : "transparent", color: f.modoBio === o[0] ? "#fff" : ANTRO_ESCURO, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, o[1]))), /* @__PURE__ */ React.createElement("label", { style: { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#64748b", marginBottom: 10 } }, /* @__PURE__ */ React.createElement("span", null, "Aparelho"), /* @__PURE__ */ React.createElement("input", { value: f.aparelho || "", onChange: (e) => set("aparelho")(e.target.value), placeholder: omron ? "Omron HBF-514C" : "Ex.: InBody 270, Tanita BC-601", style: { height: 42, borderRadius: 10, border: "1.5px solid #e2e8f0", padding: "0 10px", fontSize: 15, fontFamily: "inherit", color: ANTRO_ESCURO } })), (papel === "aluno" ? ANTRO_BIO : listaBio).map((b) => /* @__PURE__ */ React.createElement("div", { key: b[0], style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { flex: 1, fontSize: 14, minWidth: 0 } }, b[1]), /* @__PURE__ */ React.createElement("input", { inputMode: "decimal", "aria-label": b[1], value: f["b_" + b[0]] || "", onChange: (ev) => set("b_" + b[0])(ev.target.value.replace(/[^0-9.,]/g, "")), placeholder: "—", style: { width: 84, height: 42, borderRadius: 10, border: "1.5px solid #e2e8f0", textAlign: "center", fontSize: 16, fontWeight: 700, fontFamily: "inherit", color: ANTRO_ESCURO } }), /* @__PURE__ */ React.createElement("span", { style: { width: 36, fontSize: 12, color: "#64748b" } }, b[2]))), omron && papel !== "aluno" && React.createElement("div", { style: { background: "#fff4ee", border: "1.5px solid #fed7aa", borderRadius: 12, padding: "10px 12px", marginTop: 4 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: ANTRO_LARANJA_TXT, marginBottom: 4 } }, peso ? "Calculado a partir do peso (" + antroFmt(peso, 1) + " kg)" : "Informe o peso no bloco Básico para calcular em kg"), [["Massa de gordura", calcOmron.massaGorda], ["Massa magra", calcOmron.massaMagra], ["Massa muscular esquelética", calcOmron.mme]].map((x) => React.createElement("div", { key: x[0], style: { display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0", color: ANTRO_ESCURO } }, React.createElement("span", null, x[0]), React.createElement("b", null, x[1] ? antroFmt(x[1], 1) + " kg" : "—"))), React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 4 } }, "O IMC fica no bloco Básico, calculado pelo peso e pela altura.")), papel === "aluno" && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b" } }, "O nome do aparelho fica no topo do laudo. Ajuda a comparar os próximos exames.")), papel === "aluno" && /* @__PURE__ */ React.createElement("div", { style: { background: "#fff4ee", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#7c2d12", lineHeight: 1.45, marginBottom: 12 } }, 'Os números já aparecem na sua evolução, marcados como "aguardando conferência" até seu personal revisar.')), erro && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#dc2626", textAlign: "center", marginBottom: 10 } }, erro), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, onCancelar && /* @__PURE__ */ React.createElement(AntroBotao, { tipo: "sec", onClick: onCancelar, style: { flex: 1 } }, "Cancelar"), /* @__PURE__ */ React.createElement(AntroBotao, { onClick: salvar, disabled: salvando, style: { flex: 1.4 } }, salvando ? "Salvando..." : papel === "aluno" ? "Enviar para o personal" : pendente ? "Salvar e confirmar" : "Salvar avaliação")), onApagar && rec && rec.id && /* @__PURE__ */ React.createElement(AntroBotao, { tipo: "perigo", onClick: onApagar, style: { marginTop: 10, height: 44, fontSize: 14 } }, "Apagar esta avaliação"));
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
    { k: "visceral", nome: "Gordura visceral", un: "", d: 0, bom: "cai", get: (r) => r.bio && r.bio.visceral, curto: "níveis de gordura visceral" },
    { k: "idadeCorporal", nome: "Idade corporal", un: " anos", d: 0, bom: "cai", get: (r) => r.bio && r.bio.idadeCorporal, curto: "anos de idade corporal" }
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
  const AntroRevisao = ({ rec, anterior, onEditar, onConfirmar, onVoltar }) => {
    const [conf, setConf] = useState(false);
    const linhas = [["peso", "Peso", "kg", 1, (r) => r.peso], ["altura", "Altura", "cm", 0, (r) => r.altura]].concat(ANTRO_BIO_TODOS.map((b) => [b[0], b[1], b[2], b[0] === "visceral" || b[0] === "tmb" || b[0] === "idadeCorporal" ? 0 : 1, (r) => r.bio && r.bio[b[0]]]));
    const apA = anterior && anterior.bio && anterior.bio.aparelho, apN = rec.bio && rec.bio.aparelho;
    const outroAparelho = apA && apN && apA.trim().toLowerCase() !== apN.trim().toLowerCase();
    const confirmar = async () => {
      setConf(true);
      await onConfirmar();
      setConf(false);
    };
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { background: "#fff4ee", border: "1.5px solid #fed7aa", borderRadius: 14, padding: "12px 14px", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, fontWeight: 800, color: "#7c2d12" } }, "Bioimpedância lançada pelo aluno"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "#fff", background: "#c2410c", borderRadius: 10, padding: "3px 8px" } }, "pendente")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#7c2d12", marginTop: 4 } }, (rec.criadoEm ? "Enviada em " + antroDataCurta(rec.criadoEm.slice(0, 10)) + " · " : "") + "exame de " + antroDataCurta(rec.date) + (apN ? " · " + apN : ""))), /* @__PURE__ */ React.createElement(AntroBloco, null, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) repeat(2, minmax(0, 1fr))", gap: 6, fontSize: 11, fontWeight: 700, color: "#64748b", paddingBottom: 6, borderBottom: "1px solid #f1f5f9" } }, /* @__PURE__ */ React.createElement("span", null, "Indicador"), /* @__PURE__ */ React.createElement("span", { style: { textAlign: "right" } }, "Anterior"), /* @__PURE__ */ React.createElement("span", { style: { textAlign: "right" } }, "Agora")), linhas.map((l) => {
      const a = anterior ? antroNum(l[4](anterior)) : null, n = antroNum(l[4](rec));
      if (!a && !n) return null;
      const alerta = a && n && Math.abs(n - a) / a > 0.05;
      return /* @__PURE__ */ React.createElement("div", { key: l[0], style: { display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) repeat(2, minmax(0, 1fr))", gap: 6, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f8fafc" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13 } }, l[1]), /* @__PURE__ */ React.createElement("span", { style: { textAlign: "right", fontSize: 13, color: "#64748b" } }, a ? antroFmt(a, l[3]) + " " + l[2] : "—"), /* @__PURE__ */ React.createElement("span", { style: { textAlign: "right", fontSize: 14, fontWeight: 800, color: alerta ? ANTRO_LARANJA_TXT : ANTRO_ESCURO } }, n ? antroFmt(n, l[3]) + " " + l[2] : "—"));
    }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", paddingTop: 8 } }, anterior ? "Anterior: bioimpedância de " + antroData(anterior.date) + ". Em laranja: mudança acima de 5%, vale conferir com o laudo." : "Primeira bioimpedância deste aluno.")), outroAparelho && /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", border: "1.5px dashed #fdba74", borderRadius: 12, padding: "10px 12px", fontSize: 12, color: "#7c2d12", marginBottom: 12, lineHeight: 1.45 } }, "Aparelho diferente do anterior (" + apA + "). Valores de marcas diferentes não se comparam bem."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement(AntroBotao, { tipo: "sec", onClick: onEditar, style: { flex: 1 } }, "Editar valores"), /* @__PURE__ */ React.createElement(AntroBotao, { onClick: confirmar, disabled: conf, style: { flex: 1.2 } }, conf ? "Confirmando..." : "Confirmar laudo")), /* @__PURE__ */ React.createElement(AntroBotao, { tipo: "sec", onClick: onVoltar, style: { marginTop: 10, height: 44, fontSize: 14 } }, "Voltar"));
  };
  const AntroCard = ({ children, style, onClick }) => /* @__PURE__ */ React.createElement("div", { onClick, style: { background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", boxShadow: "0 1px 6px #0001", padding: 18, cursor: onClick ? "pointer" : void 0, ...style || {} } }, children);
  const AntroPainel = ({ st, nav }) => {
    const [lista, setLista] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [falhou, setFalhou] = useState(false);
    const [modo, setModo] = useState("inicio");
    const [atual, setAtual] = useState(null);
    const [abaForm, setAbaForm] = useState("medidas");
    const [ownerId, setOwnerId] = useState(null);
    const [fontes, setFontes] = useState({ aval: [], metas: null });
    const carregar = async () => {
      setCarregando(true);
      const [l, uid, fm] = await Promise.all([antroApi.listar(st.id), antroApi.usuarioId(), antroApi.fontesMedidas(st.id)]);
      setFontes(fm);
      setFalhou(l === null);
      setLista(l || []);
      setOwnerId(uid);
      setCarregando(false);
    };
    useEffect(() => {
      carregar();
    }, [st.id]);
    const salvar = async (rec) => {
      const ok = await antroApi.salvar(st.id, ownerId, rec);
      if (ok) {
        setLista((p) => {
          const sem = p.filter((x) => x.id !== rec.id);
          return sem.concat([rec]).sort((a, b) => (a.date || "").localeCompare(b.date || ""));
        });
        setModo("inicio");
        setAtual(null);
      }
      return ok;
    };
    const apagar = async () => {
      if (!atual || !window.confirm("Apagar esta avaliação antropométrica?")) return;
      const ok = await antroApi.remover(atual.id);
      if (ok) {
        setLista((p) => p.filter((x) => x.id !== atual.id));
        setModo("inicio");
        setAtual(null);
      } else alert("Não consegui apagar. Tente de novo.");
    };
    const abrir = (r) => {
      setAtual(r);
      if (r.status === "pendente") {
        setModo("revisao");
      } else {
        setAbaForm(r.bio && !r.membros && !r.tronco && !r.dobras ? "bio" : r.dobras && !r.membros && !r.tronco ? "dobras" : "medidas");
        setModo("form");
      }
    };
    if (carregando) return /* @__PURE__ */ React.createElement(AntroCard, { style: { textAlign: "center", padding: 32, color: "#94a3b8" } }, "Carregando avaliações antropométricas...");
    if (modo === "form") {
      return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 17, marginBottom: 4 } }, atual && atual.id ? "Avaliação de " + antroData(atual.date) : "Nova avaliação antropométrica"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 12 } }, "Medidas, dobras e bioimpedância podem ser usadas juntas ou sozinhas."), /* @__PURE__ */ React.createElement(
        AntroForm,
        {
          rec: atual,
          papel: "professor",
          sexo: st.sex,
          dob: st.dob,
          abaInicial: abaForm,
          prefill: antroMedidas(lista, fontes.aval, fontes.metas),
          modoBioPadrao: (lista.filter((x) => x.bio && x.bio.modo).slice(-1)[0] || { bio: {} }).bio.modo || "kg",
          onSalvar: salvar,
          onCancelar: () => {
            setModo(atual && atual.status === "pendente" ? "revisao" : "inicio");
            if (!(atual && atual.status === "pendente")) setAtual(null);
          },
          onApagar: atual && atual.id ? apagar : null
        }
      ));
    }
    if (modo === "revisao" && atual) {
      const anterior = lista.filter((x) => x.id !== atual.id && x.bio && (x.date || "") <= (atual.date || "")).slice(-1)[0] || null;
      return /* @__PURE__ */ React.createElement(
        AntroRevisao,
        {
          rec: atual,
          anterior,
          onVoltar: () => {
            setModo("inicio");
            setAtual(null);
          },
          onEditar: () => {
            setAbaForm("bio");
            setModo("form");
          },
          onConfirmar: async () => {
            const agora = (/* @__PURE__ */ new Date()).toISOString();
            const ok = await salvar({ ...atual, status: "conferido", conferidoEm: agora, atualizadoEm: agora, atualizadoPor: "professor" });
            if (!ok) alert("Não consegui confirmar. Tente de novo.");
          }
        }
      );
    }
    const pendentes = lista.filter((r) => r.status === "pendente");
    const recentes = lista.slice().reverse();
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 17 } }, "Composição corporal"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      setAtual(null);
      setAbaForm("medidas");
      setModo("form");
    }, style: { height: 38, padding: "0 16px", borderRadius: 10, border: "none", background: ANTRO_LARANJA, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, "+ Nova antropométrica")), falhou && /* @__PURE__ */ React.createElement(AntroCard, { style: { padding: 12, marginBottom: 10, color: "#dc2626", fontSize: 13 } }, "Não consegui carregar. Confira se os SQLs da avaliação antropométrica foram rodados."), pendentes.map((r) => /* @__PURE__ */ React.createElement("button", { key: r.id, type: "button", onClick: () => abrir(r), style: { width: "100%", textAlign: "left", background: "#fff4ee", border: "1.5px solid #fed7aa", borderRadius: 14, padding: "12px 14px", marginBottom: 10, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#7c2d12" } }, "Laudo do aluno para conferir"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#7c2d12" } }, "Bioimpedância de " + antroData(r.date) + (r.bio && r.bio.aparelho ? " · " + r.bio.aparelho : ""))), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: ANTRO_LARANJA_TXT, whiteSpace: "nowrap" } }, "Conferir ›"))), lista.length === 0 ? /* @__PURE__ */ React.createElement(AntroCard, { style: { textAlign: "center", padding: 28, color: "#94a3b8", fontSize: 13, lineHeight: 1.5 } }, "Nenhuma avaliação antropométrica ainda. Use o botão acima, ou peça para o aluno lançar a bioimpedância pelo app dele.") : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(AntroEvolucao, { lista, papel: "professor" }), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 15, margin: "18px 0 8px" } }, "Histórico"), recentes.map((r) => /* @__PURE__ */ React.createElement(AntroCard, { key: r.id, onClick: () => abrir(r), style: { padding: "12px 14px", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, antroData(r.date)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b" } }, antroTipos(r) + " · " + (r.origem === "aluno" ? "lançada pelo aluno" : "lançada por você") + (r.liberadoAluno ? " · liberada ao aluno" : ""))), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, borderRadius: 10, padding: "3px 8px", whiteSpace: "nowrap", color: r.status === "pendente" ? "#fff" : ANTRO_VERDE, background: r.status === "pendente" ? "#c2410c" : "#ecfdf5" } }, r.status === "pendente" ? "pendente" : "conferida"), r.status !== "pendente" && nav ? /* @__PURE__ */ React.createElement("button", { type: "button", onClick: (e) => {
      e.stopPropagation();
      nav("reports", { studentId: st.id, tipo: "antro", antroId: r.id });
    }, style: { height: 30, padding: "0 10px", borderRadius: 8, border: "1.5px solid " + ANTRO_LARANJA, background: "#fff", color: ANTRO_LARANJA, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" } }, "Resultado") : null)))));
  };
  const antroRelH = React.createElement;
  const ANTRO_REL_SEC = { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 };
  const ANTRO_REL_OK = { label: "Adequado", color: "#0f766e", bg: "#ccfbf1" };
  const ANTRO_REL_ATENCAO = { label: "Atenção", color: "#b45309", bg: "#fef3c7" };
  const ANTRO_REL_ALTO = { label: "Elevado", color: "#dc2626", bg: "#fee2e2" };
  const antroRelCl = (label, base) => ({ ...base, label });
  const antroClIMC = (imc, idade) => {
    if (!imc) return null;
    if (idade && idade >= 60) {
      if (imc < 23) return antroRelCl("Baixo peso", ANTRO_REL_ATENCAO);
      if (imc < 28) return antroRelCl("Adequado", ANTRO_REL_OK);
      if (imc < 30) return antroRelCl("Pré-obesidade", ANTRO_REL_ATENCAO);
      return antroRelCl("Obesidade", ANTRO_REL_ALTO);
    }
    if (imc < 18.5) return antroRelCl("Baixo peso", ANTRO_REL_ATENCAO);
    if (imc < 25) return antroRelCl("Adequado", ANTRO_REL_OK);
    if (imc < 30) return antroRelCl("Sobrepeso", ANTRO_REL_ATENCAO);
    if (imc < 35) return antroRelCl("Obesidade grau I", ANTRO_REL_ALTO);
    if (imc < 40) return antroRelCl("Obesidade grau II", ANTRO_REL_ALTO);
    return antroRelCl("Obesidade grau III", ANTRO_REL_ALTO);
  };
  const antroFaixaGordura = (sexo, idade) => {
    const i = idade || 40;
    return sexo === "F" ? (i < 40 ? [21, 33, 39] : i < 60 ? [23, 34, 40] : [24, 36, 42]) : (i < 40 ? [8, 20, 25] : i < 60 ? [11, 22, 28] : [13, 25, 30]);
  };
  const antroFaixaMusculo = (sexo, idade) => {
    const i = idade || 40;
    return sexo === "F" ? (i < 40 ? [24.3, 30.3] : i < 60 ? [24.1, 30.1] : [23.9, 29.9]) : (i < 40 ? [33.3, 39.3] : i < 60 ? [33.1, 39.1] : [32.9, 38.9]);
  };
  const antroClGordura = (g, sexo, idade) => {
    if (!g || !sexo) return null;
    const t = antroFaixaGordura(sexo, idade);
    if (g < t[0]) return antroRelCl("Abaixo do esperado", ANTRO_REL_ATENCAO);
    if (g < t[1]) return antroRelCl("Adequado", ANTRO_REL_OK);
    if (g < t[2]) return antroRelCl("Acima do ideal", ANTRO_REL_ATENCAO);
    return antroRelCl("Elevado", ANTRO_REL_ALTO);
  };
  const antroClCintura = (c, sexo) => {
    if (!c || !sexo) return null;
    const t = sexo === "F" ? [80, 88] : [94, 102];
    if (c < t[0]) return antroRelCl("Adequado", ANTRO_REL_OK);
    if (c < t[1]) return antroRelCl("Risco aumentado", ANTRO_REL_ATENCAO);
    return antroRelCl("Risco muito aumentado", ANTRO_REL_ALTO);
  };
  const antroClRCQ = (v, sexo) => {
    if (!v || !sexo) return null;
    return v < (sexo === "F" ? 0.85 : 0.9) ? antroRelCl("Adequado", ANTRO_REL_OK) : antroRelCl("Risco aumentado", ANTRO_REL_ALTO);
  };
  const antroClRCEst = (v) => {
    if (!v) return null;
    if (v < 0.5) return antroRelCl("Adequado", ANTRO_REL_OK);
    if (v < 0.6) return antroRelCl("Risco aumentado", ANTRO_REL_ATENCAO);
    return antroRelCl("Risco alto", ANTRO_REL_ALTO);
  };
  const antroClPant = (v) => {
    if (!v) return null;
    return v >= 31 ? antroRelCl("Adequado", ANTRO_REL_OK) : antroRelCl("Baixa (atenção à massa muscular)", ANTRO_REL_ALTO);
  };
  const antroClVisceral = (v) => {
    if (!v) return null;
    if (v < 10) return antroRelCl("Normal", ANTRO_REL_OK);
    if (v < 15) return antroRelCl("Alto", ANTRO_REL_ATENCAO);
    return antroRelCl("Muito alto", ANTRO_REL_ALTO);
  };
  const antroClMusculoPct = (v, sexo, idade) => {
    if (!v || !sexo) return null;
    const t = antroFaixaMusculo(sexo, idade);
    if (v < t[0]) return antroRelCl("Baixo", ANTRO_REL_ALTO);
    if (v <= t[1]) return antroRelCl("Normal", ANTRO_REL_OK);
    return antroRelCl("Alto", ANTRO_REL_OK);
  };
  const antroClIdadeCorp = (v, idade) => {
    if (!v || !idade) return null;
    return v <= idade ? antroRelCl("Igual ou abaixo da idade real", ANTRO_REL_OK) : antroRelCl("Acima da idade real", ANTRO_REL_ATENCAO);
  };
  const antroAnalise = (rec, st) => {
    const sexo = st && st.sex, idade = antroIdade(st && st.dob, rec.date);
    const cint = antroNum(rec.tronco && rec.tronco.cintura);
    const gDob = antroNum(rec.dobras && rec.dobras.gordura), gBio = antroNum(rec.bio && rec.bio.gordura);
    const pant = antroMedia(rec.membros && rec.membros.panturrilha);
    const assim = [];
    ANTRO_MEMBROS.forEach((m) => {
      const o = (rec.membros || {})[m[0]];
      const d = antroNum(o && o.d), e = antroNum(o && o.e);
      if (d && e && Math.abs(d - e) > 2) assim.push(m[1].toLowerCase());
    });
    const a = {
      sexo, idade,
      imc: { v: antroNum(rec.imc), cl: antroClIMC(antroNum(rec.imc), idade) },
      gDob: { v: gDob, cl: antroClGordura(gDob, sexo, idade) },
      gBio: { v: gBio, cl: antroClGordura(gBio, sexo, idade) },
      cintura: { v: cint, cl: antroClCintura(cint, sexo) },
      rcq: { v: antroNum(rec.rcq), cl: antroClRCQ(antroNum(rec.rcq), sexo) },
      rcest: { v: antroNum(rec.rcest), cl: antroClRCEst(antroNum(rec.rcest)) },
      pant: { v: pant, cl: antroClPant(pant) },
      visceral: { v: antroNum(rec.bio && rec.bio.visceral), cl: antroClVisceral(antroNum(rec.bio && rec.bio.visceral)) },
      mmePct: { v: antroNum(rec.bio && rec.bio.mmePct), cl: antroClMusculoPct(antroNum(rec.bio && rec.bio.mmePct), sexo, idade) },
      idadeCorporal: { v: antroNum(rec.bio && rec.bio.idadeCorporal), cl: antroClIdadeCorp(antroNum(rec.bio && rec.bio.idadeCorporal), idade) },
      assim
    };
    return a;
  };
  const antroNaoOk = (x) => x && x.cl && x.cl.color !== ANTRO_REL_OK.color;
  const antroTextos = (rec, st) => {
    const a = antroAnalise(rec, st);
    const sig = [];
    const gord = a.gDob.v ? a.gDob : a.gBio;
    if (antroNaoOk(a.cintura) || antroNaoOk(a.rcest) || antroNaoOk(a.rcq)) sig.push("• Gordura abdominal: a gordura concentrada na barriga é a mais ligada a pressão alta, diabetes e doenças do coração. Reduzir a cintura também alivia a lombar e melhora o fôlego em caminhadas e escadas.");
    if (gord.cl && (gord.cl.label === "Acima do ideal" || gord.cl.label === "Elevado")) sig.push("• Percentual de gordura acima do ideal: no dia a dia isso aparece como mais cansaço ao caminhar e subir escadas e mais carga sobre joelhos e quadril.");
    if (gord.cl && gord.cl.label === "Abaixo do esperado") sig.push("• Percentual de gordura abaixo do esperado: reservas baixas deixam o corpo mais vulnerável em períodos de doença e dificultam o ganho de força.");
    if (antroNaoOk(a.visceral)) sig.push("• Gordura visceral alta: é a gordura em volta dos órgãos, a mais ligada a inflamação e alterações de glicose e colesterol.");
    if (a.imc.cl && a.imc.cl.label === "Baixo peso") sig.push("• Peso abaixo do adequado para a idade: aumenta o risco de perda de força e de recuperação mais lenta após doenças ou internações.");
    if (antroNaoOk(a.pant) || (a.mmePct.cl && a.mmePct.cl.label === "Baixo")) sig.push("• Sinais de pouca massa muscular: menos força para levantar da cadeira, carregar sacolas e se equilibrar, o que aumenta o risco de quedas. É o ponto que mais responde ao treino de força.");
    if (a.assim.length) sig.push("• Diferença entre os lados (" + a.assim.join(", ") + "): pode refletir o lado dominante ou um desequilíbrio que influencia a postura e a sobrecarga em um dos lados.");
    if (antroNaoOk(a.idadeCorporal)) sig.push("• Idade corporal acima da idade real: a composição do corpo está mais próxima da de pessoas mais velhas. Ganhar músculo e reduzir gordura tende a baixar esse número.");
    if (!sig.length) sig.push("• Os indicadores avaliados estão dentro das faixas adequadas. O foco agora é manter a massa muscular e acompanhar a evolução nas próximas reavaliações.");
    const rec2 = [];
    const peso = antroNum(rec.peso);
    rec2.push("• Treino de força de 2 a 3 vezes por semana, priorizando grandes grupos musculares e membros inferiores, base para preservar músculo e autonomia.");
    if (antroNaoOk(a.cintura) || antroNaoOk(a.rcest) || antroNaoOk(a.visceral) || (gord.cl && (gord.cl.label === "Acima do ideal" || gord.cl.label === "Elevado"))) rec2.push("• Atividade aeróbia somando cerca de 150 minutos por semana (caminhada, bicicleta), em intensidade moderada, e acompanhamento nutricional para reduzir a gordura corporal.");
    if (antroNaoOk(a.pant) || (a.mmePct.cl && a.mmePct.cl.label === "Baixo") || (a.imc.cl && a.imc.cl.label === "Baixo peso")) rec2.push("• Atenção à ingestão de proteína distribuída nas refeições, com orientação de nutricionista, para apoiar o ganho de massa muscular.");
    if (a.assim.length) rec2.push("• Incluir exercícios unilaterais para equilibrar os dois lados.");
    if (peso) rec2.push("• Hidratação: cerca de " + antroFmt(peso * 0.03, 1) + " L de água por dia (aprox. 30 ml/kg), distribuídos ao longo do dia.");
    rec2.push("• Reavaliar em 8 a 12 semanas, no mesmo horário e com o mesmo método." + (rec.bio ? " Na bioimpedância, usar o mesmo aparelho, sem exercício nas 12 horas anteriores, bexiga vazia e sem refeição pesada nas 4 horas anteriores." : ""));
    return { significado: sig.join("\n"), recomendacoes: rec2.join("\n") };
  };
  const antroMetodo = (rec) => {
    const t = [];
    if (rec.membros || rec.tronco) t.push("Perímetros");
    if (rec.dobras) t.push("Dobras cutâneas (Jackson & Pollock " + (rec.dobras.protocolo === 3 ? "3" : "7") + ")");
    if (rec.bio) t.push("Bioimpedância" + (rec.bio.aparelho ? " (" + rec.bio.aparelho + ")" : ""));
    return t.length ? t.join(" · ") : "Peso e altura";
  };
  const AntroRelLinha = ({ rotulo, valor, cl, refTxt }) => antroRelH("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f1f5f9" } },
    antroRelH("span", { style: { fontSize: 12, color: "#475569", minWidth: 0 } }, rotulo, refTxt ? antroRelH("span", { style: { display: "block", fontSize: 10.5, color: "#94a3b8", marginTop: 1, lineHeight: 1.35 } }, refTxt) : null),
    antroRelH("span", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#0f172a", textAlign: "right" } }, valor || "—",
      cl ? antroRelH("span", { style: { fontSize: 10, fontWeight: 700, color: cl.color, background: cl.bg, borderRadius: 6, padding: "2px 6px", whiteSpace: "nowrap" } }, cl.label) : null));
  const AntroRelSecao = ({ titulo, children }) => antroRelH("div", { className: "report-section", style: { marginBottom: 20 } }, antroRelH("div", { style: ANTRO_REL_SEC }, titulo), children);
  const antroTh = { textAlign: "left", fontSize: 11, color: "#64748b", fontWeight: 700, padding: "6px 4px", borderBottom: "1.5px solid #e2e8f0" };
  const antroTd = { fontSize: 12, padding: "6px 4px", borderBottom: "1px solid #f1f5f9", color: "#0f172a" };
  const ANTRO_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+VemSAABPdklEQVR42u1deZwdRbX+TtWpvndmskx2CCAg+6KCIMqiSXB58gRBZBAkJKjIA5UH6lPxuSRxe6K4iwuKQBJEMiqioIhiEhAEDfsmq+yRLJN9Zu7tqjrvj66e6bm5M5nJMpkk9f1+Y+Tevt3VVfXVWerUOUBERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERMSmgLb3FxQBtZ4KNW4JaDIATK5z0SMQHAihWfBxSkREbE3CzoCaPwksLdCxNyKiBN5GSIsFUFgARwQpfrf0/Q0TjU93qTi1myGa4CGjvNAoUjJCBAkJrSLgKRJ392pt79nzKnTGaRGxrYC35cbPC1KWZsEB8CDg3+8tvbKB/TFO0RQRei2s38NCjxiZAKWEAEWodArWpviXCO4g4Cml6T7vzbN7tNs0TomIKIEHgbgtBZt15dTS3l7JO0A40QsdOSJBWQB0WEATUNbAmhRVD5nPoF+Lw59Gza38q5fbq94Efc2/ERGRwANWlTOJ6wGgbVr5TUT+QyJ04vASytYD61LACyqsUGoywLpUXtBEc531vxg9N72/SNTz94ZZnYJKY+F+cjfSfjJTFUguAHwkdUQk8AbaOX8S9JSFsACwdFppChM+oRWOK2XSFd7DAvBaIRlhgHVW/iUeP1jTUf3ZK1rRlkvuxfeCdz4U9tRWuDrPGV0uY5j3SVlEygBARCkRVSqVygoAK3sha05qH/4iIiKBc6mbS9wlZyb7lhTNJIXTEwWsqkKI4CEgEKQ5gW63WA3IxUvS6vf3vRqrAWDegUj+3AC57G4UbdzdtdaHAjhMKXq1iOxNROMBDAeQ1PSNBbBCRJYT0XOAPC1Cj4nI/c65BwEsqyEzRcm8BecEkLkqZ4LwSBinJT3n8gIAk8dn24OYBaHt1PwZ0gSePwk8ZSHs/EngQ/dMPk5Cn2kwGL6yAgHBE6C9wBsF1chAh8W1axw++4q5lSdz4rY+AteKTNqWStjDOT6RCCcBOAJA42Zo5jIR/B3ADdbaPwB4pvAdI3t2JPKmkHVGIOoSECbDb+x+vbRAYwkI4yFohaftYFxoqJP3xenJ/k3A5cMTOmplFbAeTlHmfRaBbTJg57Gqav2FY+emVwLAosNgPn43ZGEmOcHMbwJwHhFOANBUeExOLir81eubogNLCv9dtIcBYJ0IForIlc653wKoRCJvJGlboBYsAeVmU4/vz4FZUmkcI5KOV9DN5P1oUjTKI5sXSuBJ+XYhtVxZv6Szkr40sRVL6xIawLZMZhqKg9faAnVqK9zSM817y6wuZYXm1VVYImgKbRaBbS6BOyweaLf+jJ3npg9JC/TMJaBZC7uIezQRPgPguBp1mAqq7mZocpdE6AoeEZFHAbrcWnsFkNngkch9j/uCSdBLx0OK/okZM6A+9myylwUOIUeHOZJDCNgLQhNAGF7WgFbZbkMRXgAnQKcDvJeVRPS8UvgnQf4upO4clXbeS3OxrigwFkyGn7WNRePRUBvEmQDNAvzS6aWvDGd8ut0BqYdTRXIAdnQJvCbFjUvTynv3vRqrZRKYFnYRdLgx+osA/Xd4x5xkagu/c/6cfIGAiLwA0A+stZcBWF4guou0DVuCAKhA2jVTMd6q5E2k8DYvdKQX7DfMwLAiWC+oesD6jKAi8CBIrQQNdjIRQTEBRgNGAYqy7UXr5TkFzCfCr9pt9S87BzJLC/S2JJGHDIFnAGomIDNngP77X8nlzSU6q60C5wVKUXc7c/KuqsiVY2ZX3w9ApAWaWjOVmJmPAeQnRLR/gVBbI6wyd2Ll6v6LAL5lrf0xgLUF1XuH81rnKnKRKP8+DRNKSek/hXCCQN7UxDRGUyZBKw7wRXMnc1oS9XP+CiAQCCj8C+iSBjVwtgh0WHmaSK4Wp386ek7nczmRqXXoL7I0VAZ0JkAtLeCdG0rXNpdw0vJOWKKekWI5eVdW5EdjZ1fPkxlQrY+ATu0ir/oIkfpWUFUt+h9pJlg/UIN6+XdjpLLL2yIiTxLJzDT1V+9oanWuJhft2rb3lScp8Wc5wQnDDY0RAO0pkEroE4EaCFkH0BgvBBEBlRmqiYF1qbSB5Aer1qbfekUr2mQG1EwAQ1mtpqEwqK0tUC2t8MvPLP16dANOWtaBlAimHnlXVOSqcbOrZ81rgX64FTIrSDFj9MUAfbJARtUPVVfqOKL6kqh+E+znGiLjRiL6dJqmD27vanUucXOJ9uI5aBzWad4jij6oiI4s6ywAJ5AWyDTdQZubItnYsgKPSIB1qTzrIV8YdWX6s6Eujbc6gXNv89Izk5+NLtP7lneuT14vcKNK0Ksr+MOYOZV3tLZABfISAGeM/gFA5wWpq/t4L1frbApYJyJLAawmQgcAL4IygDIRjQYwts5vfEE9H0g/FlXrDhFcbK39GoCO7VEaFyf/s+/FqBFJ8j4IzmsytLf1wJo07OUPMmn7ULVdicENGmhP8bv2lM6f+PPOZ4OPxUYCFzssdMrLU82scQ3q88srSIH1yOubDFTq8Ghbe+ORr2xdsTp4qQmANUZ/Jzir1vttDWlQkLSrRHAHgPkissg59ziyYIxKze8UgKYkwUTn9N5EdAgRjgTwOgDjaxYG6qckL/4m2MfyoAgucM7N316k8bwW6JZg4y59P4azS84h4IJhCe3WboFOB5c7mYbcohMkcnMJ3GllcYej902YU/ljLmwigQsr80vTklNGG2pdm8J6dG8T5SsiE7wm2NXWv363uen94XcEwDLzRUT4vz7IW+PEkr8CckWa+j8AWNxHn9AGnEujtNZHEeHdRHRCkNA5KQeiXvdQqwH5epq6zwPoLNjx27S6vOqs8nTAf7bJ0N5rU6DqYAGooUjcOkS2JQ0mglQcPjxuduWHQ02d3ioElhlQmAVZ/N7yKxqNvx9Ew6sOqB1UL3CjS9DLOuWCnedWvxsktgBwWuvjlaLf9aE2+26JKH/3Hl9wzt1YI10VegZnSC/9QzXELpJ7J2aeBsg5RLRX+GxDqnw9DYEAkIjcB9CHrbV3YBvzVBcnd3BOfamB6ZiKAzpt1idE29gBGoFXBIxMoFZU5PPj51S/OJTUabVVFo1HQAQIs/9pA9PIiofUklcANzKBbqvIgp3nVr87fxJ45sIu+3GiUnRFwQlFddRTBaBdBJ9IU3dUIC8FyZYT0YZre4tbloIUd+H6nGw6/P3bWvs1a90hIrhABM8XnuEGMA4EwAY1/VZm/kyNnT2kpW6XRtWCcavOSn6oIQsSTcesqsJ1Wngi8LZGXiATKl5Aq6qwo0v0hZenJZ+ihbAyaWicpR90AktQr14+s3T+mBK9ZVUKq2omqACiAap4dFqL8wBg6fgup5Vn5u8HtdXXeQcLQIvIQwAdY629pEACCd/Lps9ZuILtywDWWmu/a6091Hv5MoA14ZkDOaHE+TsR4UvMfCOAiT3V7CEodQGhVrgV05J3DWtK/tFk6NyKhaxN4SiTugrbMIhAHtArU9iRhr760tTyNAox+juUCp2rzsunNUxU5B4h0LBU1t/j84AbU4Je3oHvTJhbubAYqKG1Pkkpuq7oBKohLwO4JU3tuwGsCrZxOkh9qXO7NUmwr/d6BhG9t6ZtA7KNRfCCiJzjnPvDUFKpBSBMgqaFsP+ajuZRlHwtUfTBVICKXX8Pf3uAF0ii4BXBV1N39Lir7T+Kp+W2fwkcVGcn7qvDDY1IBb6WvAJIQlCrqrLCo/IVAai1tWtSl4lwCboPIKxHXhH8IU3t8YG8epDIi4J0JwBcreJxa90Z3suJIvJkQbr6fi4GDMARYVel6Pda65lDRaWel0vdhbDLppXeNkaV/t5k6INrU/hKUJcHeTHJFzwrAivZONgQDt31mQAOsvFkUwRKBdAEo1ld09aCkV2L2fYugee1QJ/aCrfiLPNaBbWo6usHW+QBG22d/pLxc9JP1IRJfogIl9aRvuG/5a9p6t6KzIurtrKkUgU7uNkY/WWAPrQR0rhrC0wEv7PWng1gCbaSlzp34Dz+dpTGji992Wh8HAA6BlHqSu6XyMIildFQJQVwiHUO0hJewrYGZSFXVoCqAyrZLx020hvuBXZsGbykQ36689zqB7emZ3rQ1ZyqVZ9vLoM6q/CqzsBogl5dRQcb/X1BGrgLj+zs7qfqSF8fbN5nrHXvCuQdCvuoxRNKK9PUfVhrfSMRvhu81f3dcsq7yRLhBGZ9B0DTgpd60AI/RECYCaJZsEunm8MMqR8PMzisrQIPAQaDvOHggtcEbmRoo7KDCRUny9o9HvfAMyT0NAFLQH6tCCogNRLwI0SwqwIO8IT9jKJdhxlwpwXaM41BaABajSJwWwVuREJnLzmzPJfmdC7cWiQeFAmcS9+2qeY1pNU9VrqevZ4aPMKAV6a4fsLsyknBvlAArDHqNEBdUyN9cw+xF8EbrbV3YWjun+ZBHg7AaGb+JhGm99Qe+oVccldF/IXW+h+if/vWm+6oCpNzxbTko1rTV5hQXptueambS1sRqGEGlChgdRWdRHIHCPNB6jalOh9svrzryGafWDwVTQZ8MDG9g0Sd0sA4AABWVzNzrr+ecgHcMIZeU5V7xz9fPQIL4WkraHyDIoFb8plK9JFmA7WiCkt1ni0ASSZOZwtACxYU1WA6t46kCdIXM4cweYtOKQ2gzVp7ljHqL4D6HoARA1Cpczs6IVI/MIYOTlN3YbDzt4jWIZPA1Ar7UsuwceXG9EfDEpy8qgJ0ZvY5b0niCuA1oIcn0NXsVNLdVuQa7en65rnVJ9dzqrVAhawdwIKQVgfZ/yxYAEzOsnmsA+xdAO6SFnxpTVNynPc4f0RCb+60WTx2f6QxAXqNhRtVpkOX7m5OHo903taI1KJBmLlEgLx4OsYmJnmCiZpTgdRzXhkFSq0s58bqXqMvw6oWQLcCLkmwjwg/XJjkucRRInKfte7wAqGHehxxlzQ2BgcD+gqADsfAoriKEVwL0tROBfDi5lzAeiRWmFo6tsTy0zLTniurISBjy80d8YA3BD08AdZUUSHI9SD68agrK/Pz8RUBYTL0QNPj5Cl6FiyAKpJt2bTS+4zCN41G85q05/nzPuAaGWptKvf84JXVI2bOWv9c8rbvhZ6UdUQpKZ04MqHmarbCUZ1Z7RoZANH80Zdh1bwW6NZwnfd8ErLtIFc7wUXwiYLk2RYOAXSRL03xUJq6N4nIT9AduTUQL7UFMJlZ387MRxQk+SaRK9/bPbUVbum05FMJ408g2nNlJdOcthR5JYzv6ARaEVauS/Ft7+XQUVdV3zPqyspfAMj8SWCZAUWUecGpFW4gpCFk+cSnLITNA1BkBtTY2ZUrqqm8oepw96gEWqRfC6Fel0IamQ778JPloymcTd++CDw5m5Dey3u8dGUHrDurFQAluAkAtSzpnsxEeHuNxpBLqz875/6MbTP434Z36LDWnQP4DyA7kaQGIEXDVhPtToQFxqhp6JkyaGNVZvfISRjTdlbpl6NK9NWqB3Vswe0hEXgv8CMMtFGwa1P5sa/SIc1XVj46dk710Xkt0DkxpiyE3Vz7rnkACs2ClxngcVdXH3vGViatq8pNzSWwl37MKYIva4CUn7611LktJ2rCJvfS92Mi0tITSqHR1VGfc8mpCJKm/pCdfp4+OGMSOOS2GmsMPwGgueCB9gCU9/K2QGCFbff0TpdKzcyHAzKbiA7AwLea8rjvb6ap+3jBA96vfikGZiydbg4rkbq6gbHfigosaMupzF7gGhg6yTzKv4X3M0fNSe8FsqOmkzchC+XGOuvmT0f5NZL8qdHQMas2oE6LQBINqjhZjM7qvhNasTY3G7d9CZw5oeCsOXZECY2uF/UZWYQLOZGXqmn6JAAsWBhmoNaHBPLmMcgu2L73O+duKUjkbRVdKrW1dpG17mgRXFdwWEk/xzHchz7GzL8DMAr9DMHsqnixEHbZNDOtROpWpTLyEm0ZlVkEXgR+dBnaezzR6eTUUVdVThw1J71XWqBnzMhs1MGMcqJWuHkt0FOuQmdnR/XkDivPNWgo6SP4gwhUdfBNhnZWjaXDg9d20AKk1JblbyCh0LGqDxtVCJJoQAmeeEUrOmbMgFrY1UH0qoKUKdyDrsI2EOg/QJVaA1hhrT3Ze5mFnsEg/ZHkGtl+8fHM+tYkwQYl+bwWaJoFPxOgtumlbwxL1FWpoHFdukVVZltmqCYD1Z7K95bYyuHNV1Zb5wV7lFrhtlYam1Nb4WQSeGIrllYcna0oiwPpjxotXt4EYL0k81sSW3QbacpCWJkBtexpOqKShRuoXl5NWAECPAUAMxdAzer+6tU9jwhn+6Ba2+ut7UHs7QG5k46cczO11g+K0E+DBjKQrSZLRAeL8F+1ljOcczehTtCHAEStcE9ObRo/htM5IwzetrwChyyRoNoCxBVQdlC+I5Vn2x3OHze3+rtcXZ7SOjS2APPTRjS38qeXzyxdM6qE01dU+1SlyQmgQIcBAMYPnjN1i0ngXC176enyrgLsVckUYOrdAANAsjg4vtDtwKLdCxImkFXuqVTwNLZwAMNWVKk9AK5W3a8AOkZEHsDAtohyso5Win7PzP9d+K0qjs/L0/nocZzeV1L0tuWdsLSFzuwK4FiBRhjoditzl66uHjFubvV30gItqJ/AfatiMrxkM/Zz6yw6NUFJb+aMgKoO8IT9cjt6sOKjt5wKHWrWMMn+TQZl59c/uNDDHSgAES0r6N75Pu/4AoHzDiymntleYQFwmqYPW+veWLCL+xs6qbsXQXwnyxvWFRjT1W/Ko0JCa2kLTjcR2GEGmglr1qb+/c1XVs/c+zosySf7UMzBTLPg0QI1YXblqU4r140wIOrNlCGQzU6OT3ixjObBbOeWI3CwAzTkgCTb4fR9GW/Z7jytAYC713YRvQxkJz4Kl8J73IU+bOrtjMQawGpr7cmAfBUD2y9W3feh84zhm5Dl8nIhRBXj5thFT62sHFFxuGFMGRxO8GyWfg3RVG5UGZxa+cc6648aOzu9Ipe620LeZQFIK/Wjig8mYG+2T9ZjTUZKowAAM7Z1CTy5y/O0V3+pJuSrAHB3QRUkoqRGqjit9aM7CIGLdrFKU/dpwE9Hlnyvv1tnxaCPtzDz7caY1wKZujyvBfrQ67Gy+crKCauq+NbIBFohSya4iVLXKwDNCfS6qlx2D6pv2nlu+lC+z7xNVD4IEV7jOjrvbE/lmRLX90gTQCKAVjCAb9o+JPAj2QARaBcvfdi/NYNep31cJKsIllSr1Zd2IAL3sIvT1M8WwbEieA6FBAL9d25hb0AWJok+BYA9tRVoCRJx9FWVj62u4txEwTYwlN/I7TkPuBJDGQW3KsVHmq+q/teUq9A5ryXbZ95WOp26q35UNeHOsgaoF01SAFEEOBIDAK2PbOsS+MCcXDLO95dmohoA4LCe0qfak6yyFFlpkh2JwD3sYmvtHdbaowG5tSBdpZ8kdgCGiVArM/8vANfaCncqoGQSeNzsyo87Pb1FRF4YmUB7GRjhvMCOTKABebGa2reOu6py6fxJYAHo1NZtcL8+mIJOcL/qQ20ggLwA2pEFgJYDt/FAjnwDXkAjXGbgU1/iJTPqZFTNVxUR6SiSlQgrtvjis23YxS+kqXuLiFweiCkDcG4JAE+ELzPzlQBKrYCjhRCZBB4/u/PWJR3qqE4rt44tZwvEhuziYO/aMWVwRyp3rLXqqHFXuwUSTuhsq+U7F3QRVP7Vm2tZACECnMCmmtq3eRU6f88Qv1oW6ccPiKBAmcf5sC7brUrUdc4zD+DoQEQeC26tdWeL4JMYeNCHCir1dGP0LeUyXoGMxJAW6H2u7Xz+5nXVt65O5UcjE7Ci3u1iyVIjYVQCXl2Ry5e+XD12lzmdz8k2pjLXdeWEPV2BWmk9IL04srIM/VhLtprN11nbQSjlE2vAgCQbehOi7MQ2AbsBwGErumN7RejFHVRd7oepmc0da+3XvZeT0Z0HbEB2MUBHW6vv0FpPBmCpFTSvBfo9raiOurJ63qoKPpwQbGPmxLG19m6ioRIFrKrKx0bPrp69702o5BFV240TQtC7JShZIBIILz/+ElZuH04sAPu8Ar6fScTIekBI9sm9f3nbiOSxmmvLkbs9rA8HgJ1z1wH2jVlh8YEHfRDRLkrRzczqQ8G55U9Bdgpo3JzKD9ak7s1e5F/NJXBOYhHY4QytSJZXvLxj7Ozqt7q2iGZtXwE2mqSRs9wnUkefEZMx6fEpC2HzpH/bPIGxMxxAKW14FqqKB0Ro7xfOxBgC5LDgyXJO7i2ofRCR5hoJFFk8I/dQ40Fr3TEiuAEbF/TBROpSY/SlALgVcNSaHTHc5Wp7W7s1b2i3uGF02C9uLoGrDg8ut3jj+NnVP2xTW0QDdGIBtLOmXjVByRLqyV0A0DKIsdBbhMCE7NwvzYInQruiDV5P1sE3MpoTKh8EAOfk4oF5UZAmofYRTQDQVCT1Dix+SSSTdoHEecqeEwC5BBsf9PEhY/SfymXsVrSLd567bkm2X+y/1GSg16X47fL2yhv3nFN9dP4Qrd63GbE/ej/Mrtot4KAyn9f2EAvt8yNqkJWqN9Wj2AcE38CAEj+p248FqlarT4nIw/lEJMK4JEkm7ugElhlQlHk/ZdkZyYE0K8uk2pKRVqWp+0RIEpAHffSHXIWgD5pkrf6b1vrYYBejJVMNMeaq9HPtVfe65vbKyXu1ZtlTpmyv5F2Y2fFCckTqMmFTaxuXGarTytPj2zv/AQDUOnja4RaPhRahZbp/NKOqBzzwnwBw2KKu7RJPhN+Ha9Jg7x28IxNYJoFpFvwdLWhoOyu5rLFM9y6bnnyGAGkF3LyWjIhp6n8mgiki8vQm2MV/Ylb/g7BfLMiO/I2bYxflQfuntm6nhcnDItl2ZvkViuiQDpeZezVLng+poH5FraiGmknbvgTGgYHAhOdVFuwsG1j6dXsK0USHLTkz2ZcIMmNSVzN/jkIQvlJ4045IYAEoV1UXn2YOOqipdOtwQx9cl4KbE/pS27TkmodaMOzUVrj5Wd+xtfZv1rojRfA7DKw6RG4XE5H6OjPPQ3as0dEsqHm5s2p73h0ICSks/MkjEzQ4ga2RwEKAXlNFmqbyMwBdKaQGa36qLfjy2RsInhTp36t4wI0swSjCuwFgZmhjmqYPITuBxEFteRu2gyLYAyJv8GxOyVLenNFUVrcbjcNXdGbJ2do6YYeX6LRdm0q3vnBGst+U7ExrTsQl1tp3ei9fQHdZVTeA+WGJ0MKs72Dm1yGEYG7nqydhMry0QIvQOZUs1q1eBU1Kvfxml2uq/5SQHKFAXtl2CZwb8gr/3NBJjqIzoNMCDnSmzABjIdyk0Ebv5WvhKkdEBzLz6wuSYvtXmVvhHmrBsLbpyY+GsZprgZFr0yw3c0hIzm2dsInGoSMMbl86NTmBsoQKktvFzrkZ3suJAJai//vFXXYxER0QSp+ei24P93bZ//MnZWRcXi5PbS7jgHYHVyzDEqqIULuF1SJfECCvIlIk75gt3T9bjMAzQyzoOqsfa7dYx6qPA9H5WxNUu4MbYXDAsqeS4wiQmZkUUc65mwHc0t0hci628+AOmQElM6BoIeyyM/gNuzWW7hiR0H+tTeGsW78ciCLwmhTOg8aUDf122bTk0zQLvmgXO+d+q5Q9EpC/YmBbTbn6XSbCD5n1XACj0Z13a7sRyDNmQE2eDL9iOpqV8l/ptJDaUGARuOYEuuJw6Zi56UMIObTRnZ9sV631UeiOmtu2CDwr84rSHle3LyaRx0p6w3ZwEY5wEZDVBe6eHPSx4MjyRHRKqYQ9Ub9G8PahMs/KMjIun5580rC+VWu8qq2z70r3CtBVB9/p4JtL9JUVZyXXLH0/hodcTwDAlQqeSlN3LCDfR/dWU39Vagla0BnM+i6t9RTUZPvY1nHC4qzvrSTfHmZoYqeHL0pfL/BNBryyisfRWfmszIAKwUdd6XyN0Rc55x7qFtjbmgoNdCV1F8Ltic7yIfVDX9NrUriRCR3176nJSae2wklWm0WnafqACL4Y2t3gnP4CUL/K4TZLXOmudv/M1NKeK6eXfj8yoYurAtPfRHOUpX+htk7YYYZOS3zptsVTzcG0EFZaulRqm6bufMBPxcBCMAvJ82hvpegWrfUsdO83b9N1geUcmMMvQ/ry1NKHRyQ0fWVNLiwvEKMhXmCros6c0Iq1ednc3NQI/QEA/0L34ZFtkMC5HSy42XpQv+zg7HqyHsKKvvZcCxoAYEawt6y1XwLwp2yi0hla6//EwHIoD22pS1my8bZpZuooxl0NBse1VbLTQANJNFe0i1nhNY1G3b5smplGrXBBpVbZouivJlJHAnIXBualzq+FUvR5Y/RfkgQHYhMTy29Np9Wiw2DoMqT/nmrOaDT43tq0p/orAtEE18TQ61Kcu/Psjr8XCr8xgFRr/Val6H/S1H1pMBxZW7aTw4a2UdW/rkmx3PTDDu6yhS18cwn7lErmM9QKN3NGd6GzNLWnh5hfIqKfIDsEYbdVh8qMGVD5RHh5euNOK89K5jQaNccD41ZW4TalnIki8DoL5zxGDDPqqhVnJT+8owUNQaUOxcirj6apexMg30C3l9r2c/4QQuCHCN/JzBeikIBgW7CNJet/dfjdSJdMM2cPS9TcqodYD0VdIbzwSsE3Zyeu/mfnuZXLZUbmXMw1kiRJ9lWKbgxRcP/GINSo3vLFzcLEXDqtNG9kglNWVfuZbDzz8nmjIOucOrqw2uWTY1dmfSMRvRqQO9PUvQXAOmxj20vFinbLp5nTWdPXGzXtsqIKJ1l6180yRnlK19El6HWpLFqXYvrEq6uPFIjoAUBr/U4iupQIuxYWxf60oatMqghuIbIXpCkeDt8N2THp2f+lLzQafG5dCu8ElPe9B1xC0CUGVlfl4zvNqX6z8Lv83SYaw7cDwmnq9kGWiKK/Z7SHqAQGsCAEdnuRX3gB+X6q0ZSdUCIFcIn8nGVnYARa4WVGV7tfsNZNyQL36Q3MfD2AEvpZjWAorPp59YHF7yntseKs0rVNRv1chHZpq2QlLtVmTO9KBCJAt3XCGk2HNzFuW3Jm6YPSgmRG92LOzrnfWmuPKGTB7K+DS3c7uPBmgO9k5v9Bt6e7vwvBoCBPIj9lIexz0xp2WTm99NsRCT63JoX3yMgryGzd4QZaE1avrcqpvZB3fCZMsIf3+BCyIvODsg88aOVFX27BMJSTx8pME6uu/55jL3CjStCrq7hh7OzKCdICHZKNdQXpM/P/EuHLInKPte44AEsKE2pInVrK69jmZ2XbppXOU0q+2Mg0ZuVmlrq9aTYCpOMbkCxrl7tXd1bf/MpWrA6TQYrSklmdR6S+iu4axgOWxoAs8h6fdM7NL9jODltnC5CkBQoHZhUKAaBtujlTE11cZtq54LASH2oTjyoDaypyT4eT6V1J+RZ2+VwsgFcw6+uVokO8l19Y604fTI1DDcIKIfMngSe0Yq0CXdnEdZPX9WXD6ZUV2FElHL9sWnIptcJhErR0Z+Iha+1XADqUiJYZw3cbo94TOnBIkXf+JHBeEW/lmXz4qvcltwxL8AMBjVmxBaRuncXQawKNSpC0dcgPxjZUj9yrFasK5M3JRwCUtf6HRPb1IvjTxkpjgA5Xiv7CrIu+ikENAJEZUPNDjHJejXD59PLRq85K/tjIarYgkFdA4awzjUqgjUbnmoq/5Mnl1TfuPDd9qJBhhAFYY8zBzLyAiA4RwWJr3YXo3mobnBVpsDqQZsG3vbe8O4w8IkBDyC80kOfb5gS8quIvHjsnvWheC3TLPPhQt6ZrxdNaTyGi84jkJUDNSdP0AfQ/6dsW9QMAwEstw8aVm9L/VcBHSjoLvIBAEW3hSpEC22jAXtDZafHf4+dUflLUkPrwNNug5ZxPhC8iy9M9kGLk+f4oAVgmgq9Ya3+A7JRUV2XGLTHnFizIAjJyaTuvBfrNDcnbFNG5RHhnSQNrqkjzRaekoRoNsDZFlUSucRX5+phfpA8X5nDXO2mt36EUXQlgLADvvbwjlLAZVHufBnsSv3xm8tPRJfpAXvlugLexzSXwyop8b9zs6n/XkEMVJgySJNnHObevc+4RAM90a5CDS9w8t/C8Fui3NZXOhshnhyW064pKFktLW1gSSRY+40aVwOss/pmmbtq4q+0/im3rh5YmACRJsK/3/A0iHJ+PxwD8DQUnlzxIJF9NU39NYUzywxOyCe9KYUXqcY+295d31+JPdp7O0ITDWAFrbbZwNjKorIFUgI5UntGKfuW8v2LM7EDc7n7ShcXsc0T4Arqqh+CT1tqvY2AnvrYxAs+AwizI0rOSvY3Qgx4wTkAbsT1iR5XAa6q49qnllfcffgPaZQaYZnV13Fa1fXMbt0iOtmnJO4nw2WGGXrfOAlUHS7TlnTpe4BVBjSoBa6oyb3VaPXf3n2OFbNzh+67JaYyaKkJfJqJXFPpa9697itfKnUT4RrXqritIrYHsRdfFonNg9mw3+4mmYxXhnSJ07OjGLKNzNdSd8ADWpUgV4TGC3C6EGyu2+ped52JdF3EzW7nLbDAGB4nwt4nwlqBBlAD5cZq6c7cGeQeVwEVpueTM5Aejy3Te8k44RQOXQCIZidst7q6k/pzxV6f31DqHtqR61kubaMHkngfb285KTlCCTySa3ijIVn0aBHU576MGAxYPm3r59JjZ1Utq1flN8Jl4AGON0TMA+lChn/sbwOGLdrCI3Esk309T/wsA7YWFGP2RyrkZsOyMhl0T9sdVIVMIeIMIjfNZTeolQtJGQsuY5HkhLAbhfuXpoZF7Vv5VzN81fxJ46XjIqa09nt3AzBcS4TPIssF0Isu2eq219nR0b8PJ9k1gQEEgS87CBEbpEQ2MrG6cFIYXuOEGOvXotF4+N2Z29RsIqmpLwcu4pTGvBboFWXFoAJC3o7RigjlFEX3EKHoDEbC22lVkTA1CHwsAP6oE3ZHiMevo7NFzOv+aa0Cb6fxuwVPNRxHhy+gqpjMgb3UtkZ9UiuYQ2Z9XKniy5nkbJLOcA7MCaFyzFqqcIl21Buk+wyE4sO9C4cHBhR8shLR2BaZk/DBGnSZCnyGig8JnFQClQN73FjSLreJjGfR9uS5beGrpI2PK+F5bFZY2ct/WC7xWUCMNsM7K7SL02VFXVRZ0qeyPgPpp5w1MRZ4BwoLslFD++dL3N0xkcVMh9L5Gxv7WA+vSLBWposEJKxTAaYIenvXH1aur1fM3QWXuz9xR3eqlOjNM9P02lcgA2kVwo4jMcc4tALCmRgtQBXVcBjJuwbGFBQuygzKXtoIWdrc3R6NS6mSt6XyAjgifpeFdWER+Zq37QNE/sLUcpINP4IKNuHRacusIQ8esSvssnrxBiSOAH87QVgDnZR6J/0bzbPv3Hs4kICv3MkAp1GPgx2fbEMXvl0/no1mpM51Hy/CERndaoMPBQUKu+sHqV4EdloCtw5pU8D9jrqpcthlU5v6q1fkkbmLmDwH4KBF23kgi9zgQISLPA/ijCK5zzt0B1M273OP+k+pcsHB9W7y2TzQzH04kJ4rgVCLaq9Amh5BU0XuZ5ZybORTIu1UIXHDJ+6VnJPslhu72QDktxJ1urDQmAo1MQO1Z1uKbycvlvpz+cfRl2V5n8fn5SowF3eUzAKD42YLJ8LNqVC85B2Z1yq91Xr0NQidphdc2MrAmBVIPRxhc4ubvPboEak/lzvaqnLPTz9MHB+Bl3lwobp+MN0Z/RIQ+RIQxBS90f23kXLrWXv8ygLtFcAuA2621TwJYvgkLzy5a60OUwiQR/AcRHVzjNZeCY22p9/Jh51zrUCHvViNwUTL8+wxz9phG9ZOVFaToSh27aWokkKmRBKDdyotO8CdF8kdHdPe4pPoMXda197dBvNyCYdxgdveC1wI0RREdoxX2aTJA1QHrbNdqrmkwvfphe6jJgFMP8R4X/7mjMuPUkFhtK6V47TpqGP57F631OUR0NhEmFoiRE2ggUlnVIX+biDwD0L+I5HkReo7Iv+Q9rQPQSUQVACQiZaWkWUSNJ5LdRWhfQPYmoj0ANNaRzHkYZK4J3KSU/VClgn9tLW/zkCMwEFLFLIRdemby09EN9IFlHbCKNk8ccyAyEgXdyIAXYHUKSyLPgvCEAM8I8ByBlhJ8pwBV8jCk1CgSP9YT7UbAK0WwD4h2GZFkndXpsj8ANgRgDPqxuXz/eFQJWJvi7oqjCyfM6fxrUbsZAvOqSOQxzDwNkA8UnEG5eq3Q/4hAqbGXN8f8zSVtsbZUnnttMYAvhcCTWi0jEji3h59YAx49PvnL8ISOWlnZfCQOD/GgLDuIAnSigUQFcUkEL1maEAkV2XTIZu1F4CSTslXfRRqRrUTaotQdloBTj6p1+OrijsqXD25Fdf4k8OSFQ64qQi2RE631iUR0FhHeWtC4+pKyGyK01KizVPiX6lxX/K72+9wPs8Z7+ZFz7hJkcfU9goQigXuOgCLAL56K8WWd3F5i2nvNJji1+kEACUnmpRBH2CNVaPFzElAoTr5V+8oDjgl6ZAKsTXF7mqqPjru64x9AtpU1xHMz1xIZxpiDAH+6CN5NRPvXXG9rSEabfyp0SfKisFgGyNVKue9VKnhqqErdIUXg4gR8/vRknxElzGdFu6xNNy7IY3tDfvCjuQTVYWWVB770p3XVb4Xcz0NR6m5ovhW3gHKpPFkpnCCCt9Qhc1HN3RhS10ppwnrCQRaJ0Fxr7bXIDuLnxN0qwRnbHIGLTq3Fp5mDGkt0s9E0cU26mdXpbYm4QV1uNGACUHVybbWTPjPh2spT+dbWNl4BsF7mD8PMhwA4BsCbADmEiHbvY556rO8NpprFoh7WAnK/CN0M4PfW2kWF74bkMdQhT2CgOzvCC2ck+w03+H2J6ZWrKjseib3AGQU9PAHaU7m/4vDZ8XOqNxT7aDt6XUKP1Dw9UDbG7A24QwE6FKDXiMheRDQawPB+3n+tiCwnose9l38AuMs5dw+AF2qu25rnlLcPAhcl8fNnNOw6wrhfDTN0xPJOWNDgbtNsJanrAKhRCWidlRUi+OrSl6vf2fcmVArB9dtzWVWqUbPr2Z5lAM3GmJ289xO0xggRKQO6BLgqEXU4hw4AHUqpZWmaLgHQhiwEsp5dvkkHJyKB+yDxQy0Ytktj6bJhCU5fVYE4GVhmxm2KuAIakUB1OghErvBafWH0zzqfLfbHDmhJUI0qvClkK4ZgCraT+tJDVqIV9zOXTU8uNERf0wpmXZodxdsOpLEI4CFQIxKQFcB63OgcfXnMnM6/5eryNuakGsw525czSwr/Ss1n22VnDFXJRK2hZMXLU/moMusfNxkcPFiH4beUc0oArwA9IglBISI3VYUuGXdV5ZZc4s48EDJr+1aXI7Z3AndN+hCxNb8Fww5tMJ8jpT5a1jCrqvCg9WsEDVFx6wF4VuDhBlhj4RT8dd7r742e3XlrrnUAAEXiRmxPBAZ6BissnW4OM1AzjcbxioA1gcjAph2I2BLSFoAXgWoyoJIG1qVYAUhr1cmPxs9J7+0i7iOgHdTOjdgRCJyr1MWsG8unl96uIBclmiZpAtamgN+KMcqhkV2hm0ZBNzFQcYDzuEcgP3dWXzv26o4XcuK2PrL9VriPiASuz5EaVXPZWaW3suBcDxw/3CDpdECHywIhKEvQvcUks2RV2n0IvNAlBjXo7IN1VpZo4AbRNLf5Z5UFuTNqB9kSiogE3gB5as68LjsjOVCzTBWokzVhv0YDpBmZYT08AR4EQnd8c79T2wogJBDJbG4JLk1tFKikAKOBDgukTp4B6DZDcr3n6vzmy9GW32P+JPDkBXC1WRMjInZIAvcgckGiySRw2x7l1yty/yGe3ixEr2lkNBkFOA+kPksj6nx2IB5FUgZqdR1yCJk1VKgwZjRgQq91OCD1slwEjxFkvoG+eU25c9Eul3UlZuvKBhLt24hI4H6o1gsWZPVuip+vO7th10rFHUJaXue9erUQ9hEvOwuoudFAMeXHC/MukbBJC1ifbfV4QbtA2gh4DoLHtKK7GXQfSp2PjbgMy9ZbUAAMckaMiEjg7YTIYf+4ZQkIdQIhBKDnWzCqsZxMUKTGCdxOHmqUFySahD3giagD4ttJ1L+d8suGCS9dWe5YUZSuxfthEjTGQyJpIyK6w976+uv34pPX35UZ4C7puLGLg4DmTwLLpOxesp3HZ0dECTwkJXTGbBAeAS1YApoMdGc2BroS200eD8GBkJkAZm6+vMoREdsdgfNEYk3GmD2Y01UdHV0HsIupUHypVCoBUJVK5ak4hBE7MobaOVsCMELEX2Atv8eYLnW3mLuInLNLALkYwNOFzyMiIobMysL8MWNY6vytMwYHF2zliIgdFkORABqAUkrdhJ65jEKNX3k4TfEQug9jR0REFXoIIRwAEK6x0fOzn3nGwkjeiEjgIdw26cNOFmw+B1wxJ1Pt8zc2c0O9hG3Fz4sYSJaJ3toK9F3sqz+J2vrqB7+B8djY8aQBjnv+5/rZV1To443p0yGfbmeHzPhYM3BuAxOiv1kKVeF+tQNfzL3ke3nGhial7kdbUWNa5IuF20z94AZAuE1dpOul0pEN9D8VtLP+pIQdSJ+6SOChZfvnVeeaQirTKUSyU/i+A5B/pKm/A93ZC3sbRK4lbZIkB4jY16apbw1S2AFAqYRXeq/e4D3tpxQIkCeU8n8NNXdoAxPaIaug91oiOgTw+yOrbOBE6BkA91lr70HPUpwOALTW7wJQdc7dWHj32n4wzPyG0A/jACgR+jeAhdbavyMrak01xEsAjAWwqo+2Jw0NaOzowL/RXbBMkBXKHglgdXh+AmAYsgR0HXUWzQZjzD4i0mitvbMXaVlE2RhzIACbpukDdfqXCu/9egBHE8mEMJ7tgDwJ6L+lafowEOPYB0ouGGNeVeN9ttm/+m8DVN3qraYAMEJrPYtZP2MMC7P6nTHqLGPUqcbo74ZnrmHmq40xB9f8dj2USqW9mfkCY/QCY7hqDEupVNojJ5AxepExLEmynld9LTN/ukZirqcGMvN5zPr+7t/pb2mtT2Hmi4zhzuwd9DNa6y8jK9g1Smv9n8w8L0mMMOtrwz1NzbuUmPmjzPqRcI+5xqjTjFFnaa0XhM8eZ+YP15F2Y7TWX2HWzzLz8+HvhfD3HDM/b4xeFEqOloq/TZJkf2P0t5n1E8bwYmP0P4zRF5dK2APAaGY+whj1HmP0xcbwH5k5jJN+sSB48jkwrFQq7a21Po6ZZxjDNzDrp0M/Lajp20KfqvOZ9WNh/FuNUR9QSp3KzBcw81Ph93cZo96PzVeLKRJ4EwisAxmOYdaP5/fWWl+y3oVa/0fh2e3M/F+Fe+SToJGZP2WMviMnUbG9SZK0MPPVGfH0xcz8EWa+MhC8agyn3debs+ssEqG9+rLivQMhulUA5sOLz2fWjzLzNcbovzHre43RtzKrCwv3VJmmgP0z4nTd9/PrqRfMNxa+/0VYAHrYjBnh6275SZD+9RanvJ8vZdbPA9i18MxJzPrBevdj1o8Unq0AkNb6WGb9aC9t+H3NoqMAKGZ9Vfi+ysxvrNO0RmZ9X5KwMOsXCuMSSbyVCKzC5HiDMbw2HzxjeDWAceF7EwbKZG3Qt4Xn2jCBP1FjejQw87nM+snC/awx7IxhFyTSR2obYoy+tPBONlz7ZHgu1Sw2F4RrO8N9lwZVU4d25G293Rj2xnB7mOiz++qHJEkONIZfDvdOjeHFQa3N71sK5HhLuG8u5X9Ss5BxaOevQvuqxX+TRL+7cM8e3dC9OJkPFj7LiT4s9GtaXOyY9b29OMJ2M4aXFK6thjH7baG9Oiwa/5f3P7P+acEcyK9Jwhx8dTY++h9Dmiw7iMMKAMYAmBcmaiWbMHI/gKXh+xSFOjze45aio4MIX9NaT0F31fmKtfZHAJ2J7up2uRNJAfi+tfb7NaTQ3uN3teooEfY0xuxXuI8DMIIIn0GPyn3yTwBrw2e24JG/J/xrsrbSVGPMqwskK3plR3jvfg1gfLBtWURuBbAufG9DX4hz7tFgk5YApER0dugDV5g/SkQuDf+ti9JOhKYXfATF8UgBNBHhoDRNf4PuLUIf7rGWiPJ6vF0Sn6grQXuP6DwAz4vIi3U0BFvoZwdgN6XoY/kYEmFtjU3sAFQBcJqmD4jINSIYNlT5sqMQWAHwxujPEWG3MHlylehh1K+jIwAeqlVrifCdMEm6CmURUXsv92gvTGhbcGilNfaYAFDe+12Kz9NaHxm0g64JK0JL6zxLROjlmraTiExGz7zIeT9cRET7hXYEyUj3YP2SmwCwWgSrivcmoo/UOMrEObdQRB4sOMbyPnsLgFcUFqGi6vt2EbwQFlBV01YCpF7B9846GlgvRcvWIzCMMccGCeuzfsMJyMq0VEJf6IInm7R2MwHcvhk87pHAmyB9HYDRAE1DTUlJEXq+zsBIRlZ6qdBPOki2V2mtJxcmpOujHzX6V2+n6NXtmpxKyW7re2OlHfX3wTvXe3GSib30w7moKZJN5J/rpZ0WEFtjR74hOMpcz/eknxQ8wrlEbWDmljrzTYjoFO/lOvS+B1+nX6nSRx/WIbBUei6Asnvh3kJErzRG/4mZX1dYYPN+UJUKnrLWfSQSeCu/o9Z6EoBRhcmVY3lvhCKiVQWydIV1KoUT66hxfRFzoKp+b1sjfdn+tZNXvEe19nut9ZsL/dClanpPKwragq75K27BCBHGlkrYuWZhgLX2GgArwgJZWGRkamGxy68fSyR7eu9/j9732VU/tov66oN6Y9BZq5kB9Hoi/I2Zr0sSfVLYGvOFBaoSbeCtbP8qhUNRp5I7kV/Xa+eotKOg7hZV3tf0YzJtCrL0XKIeq1WXiWh4nYlJRNJcp50Prv9OOALrl+SEUmpxwf5zRXWfiBrRM2Ip8d401pF+ywCZV1CtNbLsJocwc/5cA4CMUSeJ4DFk+8AavUeQ9XfRUxu4Ph+r22tMhS6VnwgnidB1xvCjzPwbY9R7CovRkOTKDhPIIYJdiOpKr2pvv6lUYI3psYkf1DCMw5aNzvEAyFq7iFk/RUR75baciOyKnrHgEmy5vbKcXvCBJP92zv2xIPFUaPvuNf0QJqZczMzLa2xRAGgI6nLRYdaRpunKXpa9HwPywQKZPABFJGcCuLPbZlcnKiU/3owChjZwvQegrLV3GMN/AvDWMPYGPYuOU6Yd4ERAnchM94ngY865+egZBBMJPFjcDf+W6446kd/AoNeTDKUw8J1bsM0KQEUEFxDhhmAfp0S0D4AJyCrJJ0FDMET0hkAyEyTy+QXpVlhoqFzfi0u/AuQ+rH/KyxPZTxWvJYJFd4SaL0hclabpvcbo2wCaVJDCAOhkAJ8GsLpcxu7OyYRq1f0Zfcc2F/de+xMW2S/CG2OnV6v6ZiI6uODoKqZq6or/JqJDiHAzoI9zzv0ZQyyscnsncFFV6qgvmUX18/e1Ujvt58TaWDgAyjl3o1LqNEB9G8BOyEL/vmGtnZ5rD8bozwPYLfxuDeAvrFb9L3uZbJ01C1vusf6ntXZT9zuDhJIfBQIXbeSdjFHHp6m/xlo+nUjuDm1hrH/oI5gQUEQDevaGCOwBUHs7FgNukjH6/wCaju4osSKZdeG/mQg/AXAwsp2FLTnu0Qau58Agwou9dHrS249Lpa7AjhrnFpb2lC5btP06Tf11AB71Xr4GyN+IcCKzXsSsZxvDfwHoAkDu8l4uJrKHpan/WR3yBptfFtezDYn8vmE+JOhfUsHeFh1KU/9bEXm+IM2Dmq+mZlJNjvMe126kU2pTCFy8b1uauv8isq/1XmYBche6t9WKqjIDsES0R5Lo/0Cv3u4ogTcnNACvtX4nsiD+PxDhfpH19zlFVFNvc0gkKQPe1BBKADwwSAugAuCY+XcAjnDOHesySo5j5t1FZASA1dbaZxGCUcL3fah56qFeTvYdgL5PTPVn4c+36NpFcBURPovuPWEiwpFa6xOzdrq/YsPnugdoA5Pq56KYe8OpWsUjgJvpHGYmSXKA9/4kAOcSrbd3LSJ4PYBfD6WJvr1K4Hy756KcsNWq+yuyUzO1TpoxvXk2vfcj0fP8MSGL0LpxkBYhx8wfI8JxALTW+pRAkKXW2kXOub9YaxcF8upg55teNA0PAEqltwTVWxe9qyJ4c63W0tfiuAE1FczuZ0FFLkqr4UT0UxG6Gd3RbBt61sZIYOptrmdx1vy6ms85I3P1UWvt/1lrDxHB9TWSOI9yQyTwlp/4kh2NozcopZ4Lny8RkXm1ThMi2aWXAYdSXYEQ+Z6gEpEngjOjvwfLN1ryAhhHhM+H55eVolZm/TAzX6+1/mKS6JZwUqopXN8Z1ECP9bdVPABdqeBpEfwBPb3TnogO0VofFz4roef5Wio4iZwx5lV9TOb8Of8Swe9r+kkRYaxS9lf9UJ+B+vuv9YJYcnJtyJ8BAAcSyQ8L9ymGpObx8Custe9HtqdN3doaPRMJPDAH1Ma+kwD43yBx8n1eZa37YsEzm0+eA7F+IEGQtHRAYaL5zNmDi8LEKkpyGuA7bOjz/AjhAcjOzBZsedqXCO9Uij4rQvMAuT+cxLnFGP0tY9QZAPYpLDq1ZgMR0eexfmoiIcIPAewV3s+jZ04yB8Az88dF5DPY8N4oicgPaxYkAuSv1Sr+ib63ZFR415frjE2pYIcyuvdpV/TH4aWULCWiw7TWx4c2cc3ik4bntwHyeLHvlLJ/7OfCs0MTmMIks+iZzqX419f7pFrryUQ4HsDaSqVrn1cBeN57OSs8I2zB0KHIIm+A7tNIFJwtby1IDwPIN51zvy7YmPneY7WXttoaAlEmhSit805S8IBm7k9rn0B3PHVOyDzIIg+0UES0G4BjAboQUHON4QeY+c9B5ZYaaaOyIH1/QUGqSva+tDsz38bMF5RK2AvZ/i8jy9V9KDNfRyQftdaeX5BavarRzrkFIvIQusMqIUKt/Zh7uVp/U7Hd4XmHAtgjEC0/dEHMfEFhsaPeFkURMZlTCt9AFgNtC+OuCyaIFsEEdO2ry3erVTyGIZZMcSgS2AEQ7/070TP6hwv/9marETMfToSrC6pbR+G+2jl3nfdySrbCwgAYYYz+RGH1dWEReBtAb8oH1Xv5Upq6j9c4iDyyBHzH1bQ1HAuUN4V2poX2eCJ5R0Et7Xo3pfC2Qjs0gMXO+Q8BWIaeIY5cUO1sDbEdgDIR3pyp3PwLZMcPi/mktLX+ByL+w6F/ug5cEGFnInzbe36AWT/ErO9n5qcAuQeQ/Znd67H+4YO63vOsPfSTQp9UrbXX90OKOWSBLFeIyBPoPnxgAYxk1n9m5v81xpyTHfjXC0VklIg8VbguRx4119mtGYCJaF9j+NrQl2mhD1MAYoz+IhHtEcymK9PUfQJDMJCDhmBbJjDrLxHRSaizDysiawC6r+4NCMMBHBScOU5E/m2tOxw99+40AJcFE+hPiNC7ibCTCK4n8r8kog4RHAnQx5EFUvxZRC5xzi2oM2mHGaM/BdAHC6SqsdXkmjR1nwOwEsBIY/Tnwt4j6lwvgMxNUzcrXM8AUmPU2YD6BoBFAA4AuuKQ6018FCaaB2BEZK617syaCagzexavFtH/S0QnBIlb7M+8EHKbCL5jrf1KQUvw/RhPCR7z+0If/8Fae3w/f59fs58x+nKAju7ZNoKIAJA7ROgia+1txuhbAao9nG9F5NfWuo8DeDEbM3UqoM4AMEVEngToCqXkIQCJ97QfkbwToCMAuY0I361W3S9r3ikSuA80lMsY39mJ1b0NbLncc6IVJpzv6EBHwTnjgs1b18Mb/v/ocGzvKCJMQBYTuwKQe5Xyt1cqXdUf6m3NmFKptEulUlnd28CWShhZqWBxsCuTUqk0sVKprOrt5Uul0shKpfJSLhGSRL9bhOaK4FPW2u8CaDbG7A64gzP1n14jgv2JujNa1CwKHoBPU7sXgOfrkTi0cw8RfZj3dEDIDUYi9LJS8kC16hYGhw42UgrtkiQYXq1iSdB8+kuErutC1oxjiGRXAJ0i9DQR/TVN0/vzd2HmI4n8Lt5TGxGtJaJ1SqXrRKCrVbyI7vPO+di80nt1FECvEsHoMIfaCvd+uIYnsQLIEHPg6c143WZfWENWkg5jeHmw13ozeZqMwcHGmPcz8/WFLCY+ZMeQQtoY3cf2y4a8+7Sx77IFzTzCwE3B/r4LYQgFbWxLoM34199B4jp/ajO1daDXh8PnfHOWk6krLUwxr1OvbTRGnVFI7eMDgV/XC4FrF6raPtCbiYRqE+7T2xipOs/hgq9gQ89Vmzj2ERH1JU6SYL+Q18kz67kbkAZUM3nBrO8LUjjPozVyCJtNEduRFzpqHwCc069A18kimrgB+yu3dYtbO7kTSwFyFbIoNB3tuIiIQVhUS6XS3oXMlWvQfdoowfpRUrkqGLIp4qCsiiMLs34YQPMmqrAREREDdLKAWV9ecEjdgOxwfZ8ol7Ebs34opOC9vVzuIn7UtiIiBlGNVgDKxugfZ/mVWZj188z8yeCQ2hVZWtiJWf5idTqzvtoYrhjDi5n5U+g+KhnJuz3bWxFDG8aYwwB/KoA3A7Q/sjjjtejOX+WRRVQ9oBR+Va26P6B7z3PIRQ8NkgbTn+JmkcARW3x8as/MlgGMKpezmN3OTqTIglXad9RJXKfPoqNuiE3genuq1Mf1fS1O1Me9qc59ert/bwthf/eCVS+f13tW15nVPvoqPwpXPFa3ofb2d++8v3vqG7q2P/3X21j2e39fa/12ZAceMID3Guhci9hBFyRdR1LSALSkjZlYG2sD6zrP6yuJfe0zB3qcclPalue9Pt4YXh3yX/fVXtpeJtRQtmOasX5N1zXB9huDLCl7MU51ePi3M/x2WZ37jgn3SNB9tjS/d66ONgWJVxuznOdkLtbgzeva5rHCzVj/rHA7eibVY2SZJZej+5SMQRZssQJdFRTQWaMaF2s8rUS27zs8tKHeewwLbVldUC0ZwIjw+2FYP4MHIau9lBZU9wmhTct6sauLauu48K5r6/R9QxjXtTVEbw59mvbS13lq2/wZq9Adl17MmCLG4DAirK5W8UThu3HhN2nNu44ojM/IOr6CleH75vD/Y53g/koLY8xBxvAyY3SbMbw8+/+8Mkn0f2bf8xJmfWWBRGDWVzDzzwE0GMPLkkSfEgYgr7R3HDMvBTAilPlcYQwvze9tDN+U3Vt/K0sW10N9BTPPY+a54fMSACSJfocx/O9gmzYaw08aw3mblxrDq4pVDY3RXw5V9FYy6yXG6O8AGBWqBS5PkmTf8C73M+v787YX2vB5Y3h5KMYNZr62j/f4sjH8ArJD+rlD7FUhMmtXY/g34fr8t0uy/1bvCe92cqgbvCr7XP+dmY+pkep55YuTmPU/w/7zWmP4lnCmuEsaG6PvYNZPB0Lmi9FYY/jlIDG7xjJJ+Bpmvjb8/0+FPl1iDLcx88vG6B8hqzBRlPZsjL6LWd8d7pMnRvgds/pljabQyMzPa63fqbX+z3D/pWHcVoT483FJgn2yuZTst4nazBbBUE5ql2SSRk4XoadzdShN3aMAhosgIaLpxqi/pqn/afa9jCDC2CAB7hPBxwD8Et05fj8G4H4Aq4nkABH6B4DPhH4QIloHACIYDki9XFmj0J1PKv9rDBIqX+33JMJnQ2XDsBjZF6wFspBIOgnw/w3ou4j8ASI0yxhzFVF1tQiPLoxJg1K0jzHqjJBl0gOYQIRPAmgSkTIAEMkevb0HsnzRuzDreda6o4IESgCMLZVQFrGf8p5HEMm7APqYCCYBgLX+8STRp4hQK5FcCtAVIpIAdCERbmPmo621d6A7JewopWieCK4TwZlEfn8R9d6CLSmZXUqvIQIZY6amafqTggQdj5rsoCIYha6D/TJeBJ1E6gQRMUR+TxH1TWZ9hLXu6DAm3hh1MkCvJoIyRr0rTf28rI/8XED9AvATALycLSbqXQB2tdbdZIyaBlBjeP9iQoAVImYiIGNEhKNsHZgEPsQY9sOGDRtXj0hhFV4YAvUPDyvtr4zhPweJ8BZjWADsGX4z0Rj2Wutjg3S6K6zi68EY/SNj9KI6EvgmZm4tXlsq6bcYw2mQKmVjOC2V9JT1VkrmY0JbX1//meY1xrBPkuSAIIEfySSe/mdYJGCM/hazfpJZv6S1/o/w2d/7eI/vhRq7y5j1z0I7XpcVH8c+3depacZwW1ElziSRvrTOe/yRWd9XI83GhKivn/Y+nvrvWuuLmfkiZn6u8P04YzgNjqcuCWwM38CcFec2Rn8jFPYuYkLoz3O726YfZeZPG6O/WnO9CZL7E+g66aXvzLUpZj7fGF7Wy7gcEsblwKEogYfyBr8AoM7OzjuzRG76UWbOk7GlRBjtPb4ogmsB5Kd1KuEAOpxz80XkBWP0f4VBOlsEz4eD+RChNoBOC1knHmbWjyaJPj6s/hxS0NbArwMwxRi+0Rj+szF8k3O4JEj8PJxxnfc0p7vN+oGgBh8JYIm19i70PDHD9TznRDQakEuzpvO0zFalj4ScXGm3dKKVfbzHMCJ6VgTHE9H7tNYnMNuXC8TLT+uUi/8mCfYGMFqEZqO7iHgJgCbyVxHRQeiuTqgBLBfxHyei9xnDHczql8x8VN5pWeI9OsQ591Vr7SVE2CksQNSLFljPE1wsvJZkklRuB3AsskwsbySiPa21X09TdzER7RcWy+ATkKsAOS/Mq70Aej2AbwcJ3ZkJBf0Qs34wyzGmv9MPZ1xUoTfoZSP5tQgtBsBEvq042bVGQ7Vqp2W2i/6eiHRSd2YzB9BlAM4DcBEgZwH0I3QlMkcpS8FCs/NVX8Q+U1w80H2sLNT3VQqQNQAeQXfB6xTA3vlkRZYB45aQNcSgO9BibZj0+b5uvk9re3EoJt7TMqXkSyL4jNZ6fxF50Dl3nTF8hYi40D8lEfT2HqmIjLXW3WmM/ppS9Gvv9WnBaVN0RPU4AFGtYq0xgIiMDu3Ly7E4ETWeCNVCu31Qu78J+F8x8/EAnU2Ehcw82Vp7u4h8EpAXmPnVIkIi8jgRfQLAH9GdW6yYqK66ga036TZ1sDb89ydF5AlmPjqo3c8C9AkApwCAUu5S7/lCALsz83tF5BFr3aLCvasAXZE7+rzvSmgXniW6MB8sdrzgmAGr0K8JqmmpzjUjjOH2JNEtQV0+NsQLLw05oPJBmWgMr9RazzSGX0ZWmiRXoe4orLL1VOg76qiPfyjcP1ehpxjDnUGFLhnDVWa8rva3pRL2CCrf52tUtFcjSxp3kDGcJkmyf1AhFxtjpobnvmgMS1D/yRhepbV+a8EU6O09fmiM/kdBjb3NGF6dOcuwb0GFPjs4bbjQP38L2gPX9PuSgiPPZE4m7Jer9N33ZGHmT2eOJV7HzC8FR9kyZn7BGLalEl4JQBnDa7TWX6tR4Zcao78d2nIJs+5RaVFr/bbwjCMBjM76nV8oPONFY7gdwMRCf9yeOTr1Az1Vb3VemB+9qdBpU1PThCiBB76NxMx8FZEsyT8ToWuttXcCaAh1jcg59xci/h+l6BIR11CwpV4SwQ1aqxne+8vRXRCsCkCJ4GRjtMsll/dY7pybkdXkoUON0V8P3/k0dZ8UkQYiKod+KwGoeC87AVQq7PEaIv4/Y+Sh7r1KubNS8XOZ/XlE6ofG6LcDWATQfoC8yRhzDFG6VoS54CwZLSL5VsrXALzDOfeXsPUzouD06es9mgrbI5Sm7jRj+OGwRSUFh1GJKEspkxNIKTfVez0/q46IeUGFnyoiz1nrLihKSGvVa7Sma5XStwN4CMDhAJzWep6IfBFAp7X2gIJkVcz6Aef4W4A9UQQXKUXfJ+L9iORxEbxLRFJr3be6LQo60Bh9Sfa+shsRnQLId6x1f2Pmq0XkRWvdq9AdfZYw85PM+ovWug9k98DXAPqNCJZaa+cWtBAFYLwx+rtFDY85+aq1NgXAlUrlm8boxZlmhN+EsdjqYapDNl1IkiSJ934XIjQDNAGg0QCNE5FHROQhpdSBAP3Be/9CpvL425Wi8YB6yHt/e74Xq7V+Nqudq77uvV+aq7BK6TEAaSLaBaAxAI3LBkd+rTWNECEmol0B2gmgMd77a7XWowE85b2/LZ+7SulGAMO997/OVDU1kQiN4XejARovIi97L3/zXhYppW4EsC8R9hfBYoDOy8qIlkZ4LxONMb+x1q5RSu0B4Bbv/bPe+7u893Pyya+U2k0pdbP3/mWl9FiAVC/vMYaIlngvf873tYnoboDKSeKvS9MsXppIjQBIvPfX5xPaObR5Lz8jUmUivDHre3+5tf6/wt5snuGSRORhpdRNWV4u2k8E/wLow2ma3q+1Po3IX+q9LEJ3GtgqkXqaiPbx3t/gvb+TiP5BRK8lwj5EuM1a9z4Az4X2DQeIs/S5tBOAVSK4yFr3fQBGKXqHCL4lIg+iO91sRWs8D6i9vPc3AvDOyTNKqT0BzAlzhAF4ItUE0LDQh+PzfhTBzUmStlmr9sgWOJoA0ATv5VEReRh9Z+aM2F7Ng63pUthMbaWNeN6GQks35jmqD+cXbca+GLo+oiHettrKgLkDyIfV09WsgIz1i3Pl96m9VhVW0GI0l6vzXfFz1Ll/ngET6BniV9vmes/tqvpQ086+DiMUv9PoGY1U+x61JWAKTrle36G274pRXq6PNlGdPst/7+uQj2r6rfjc3voMNffHAJ6RzxHB+pUbNdZPCp+/K/cxnhERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERFbA/8P0bNiEW1ed/wAAAAASUVORK5CYII=";
  const ANTRO_PROF = { nome: "Wellington Brito", cargo: "Personal Trainer · CREF 089836-G/SP", esp: "Envelhecimento e Longevidade" };
  const AntroCab = () => antroRelH("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, borderBottom: "2px solid #FF5603", paddingBottom: 14, marginBottom: 20 } },
    antroRelH("img", { src: ANTRO_LOGO, alt: "Longevus", style: { height: 48, width: "auto" } }),
    antroRelH("div", { style: { textAlign: "right" } },
      antroRelH("div", { style: { fontWeight: 700, fontSize: 13, color: "#0f172a" } }, ANTRO_PROF.nome),
      antroRelH("div", { style: { fontSize: 11, color: "#64748b" } }, ANTRO_PROF.cargo),
      antroRelH("div", { style: { fontSize: 11, color: "#FF5603", fontWeight: 700 } }, ANTRO_PROF.esp)));
  const ANTRO_LOGO_PERSONAL = "data:image/png;base64,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";
  const AntroRodape = ({ extra }) => antroRelH("div", { className: "prof-footer", style: { borderTop: "1.5px solid #e2e8f0", marginTop: 32, paddingTop: 22, textAlign: "center" } },
    antroRelH("img", { src: ANTRO_LOGO_PERSONAL, alt: "Wellington Brito Personal Trainer", style: { height: 56, width: "auto", display: "block", margin: "0 auto 8px" } }),
    antroRelH("div", { style: { width: 240, maxWidth: "100%", margin: "0 auto" } },
      antroRelH("div", { style: { fontSize: 11.5, color: "#475569", fontWeight: 600, whiteSpace: "nowrap" } }, "CREF 089836-G/SP"),
      antroRelH("div", { style: { fontSize: 11, color: "#FF5603", fontWeight: 600, whiteSpace: "nowrap", marginTop: 1 } }, ANTRO_PROF.esp)),
    antroRelH("div", { style: { marginTop: 18, paddingTop: 10, borderTop: "1px solid #f1f5f9", fontSize: 10.5, color: "#94a3b8", lineHeight: 1.6 } },
      antroRelH("div", null, "Gerado pelo sistema Longevus em " + (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR")),
      extra ? antroRelH("div", null, extra) : null));
  const antroRefBio = (k, v, rec, a, mg) => {
    const peso = antroNum(rec.peso), alt = antroNum(rec.altura);
    const mm = antroNum(rec.bio && rec.bio.massaMagra) || (peso && antroNum(rec.bio && rec.bio.massaGorda) ? peso - antroNum(rec.bio.massaGorda) : null);
    if (k === "gordura") return { txt: mg ? "Ref.: " + antroFmt(mg.min, 0) + " a " + antroFmt(mg.padrao, 1) + "%" + (mg.custom ? " · meta " + antroFmt(mg.meta, 1) + "%" : "") : null };
    if (k === "massaGorda") return { txt: mg && mm ? (mg.custom ? "Meta" : "Ideal") + ": até " + antroFmt(mm * mg.meta / (100 - mg.meta), 1) + " kg" : null };
    if (k === "massaMagra") return { txt: peso ? antroFmt(v / peso * 100, 0) + "% do peso · quanto mais, melhor" : null };
    if (k === "mme") {
      if (!alt || !a.sexo) return { txt: null };
      const imm = v / Math.pow(alt / 100, 2), lim = a.sexo === "F" ? 6.76 : 10.76;
      return { txt: "Índice muscular " + antroFmt(imm, 1) + " kg/m² · ref. " + antroFmt(lim, 1) + " ou mais", cl: imm >= lim ? antroRelCl("Adequado", ANTRO_REL_OK) : antroRelCl("Baixo", ANTRO_REL_ALTO) };
    }
    if (k === "agua") {
      if (!mm) return { txt: null };
      const pct = v / mm * 100;
      return { txt: antroFmt(pct, 0) + "% da massa magra · ref. 71 a 75%", cl: pct >= 71 && pct <= 75 ? antroRelCl("Adequada", ANTRO_REL_OK) : antroRelCl(pct < 71 ? "Baixa" : "Alta", ANTRO_REL_ATENCAO) };
    }
    if (k === "visceral") return { txt: "Ref.: 1 a 9 · acima de 10 pede atenção" };
    if (k === "tmb") return { txt: "Energia gasta em repouso, base do plano alimentar" };
    if (k === "mmePct" && a.sexo) {
      const t = antroFaixaMusculo(a.sexo, a.idade);
      return { txt: "Ref.: " + antroFmt(t[0], 1) + " a " + antroFmt(t[1], 1) + "%" };
    }
    if (k === "idadeCorporal" && a.idade) return { txt: "Ref.: até " + a.idade + " anos (idade real)" };
    return { txt: null };
  };
  const antroMetaGordura = (rec, a, anterior) => {
    if (!a.sexo) return null;
    const t = antroFaixaGordura(a.sexo, a.idade);
    const padrao = t[1] - 0.1;
    const rel = rec && rec.relatorio, relAnt = anterior && anterior.relatorio;
    const custom = antroNum(rel && rel.metaGordura) || antroNum(relAnt && relAnt.metaGordura) || null;
    return { min: t[0], padrao, meta: custom || padrao, custom: !!custom };
  };
  const antroIdeais = (rec, a, mg) => {
    const sexo = a.sexo, idade = a.idade;
    const gord = a.gDob.v ? a.gDob : a.gBio;
    const cards = [], linhas = [];
    let pesoMeta = null;
    if (gord.v && sexo && mg) {
      const max = mg.meta;
      cards.push({ k: "gordura", nome: "Gordura corporal", atual: gord.v, ideal: max, rotIdeal: mg.custom ? "Meta (até)" : "Ideal (até)", modo: "max", un: "%", d: 1, cl: gord.cl, faixa: mg.custom ? "Referência: " + antroFmt(mg.min, 0) + " a " + antroFmt(mg.padrao, 1) + "% · meta individual definida pelo professor" : "Faixa adequada: " + antroFmt(mg.min, 0) + " a " + antroFmt(mg.padrao, 1) + "%" });
      if (gord.v > max && rec.peso) {
        const mm = antroNum(rec.dobras && rec.dobras.massaMagra) || antroNum(rec.bio && rec.bio.massaMagra) || antroNum(rec.peso) * (1 - gord.v / 100);
        const meta = mm / (1 - max / 100);
        pesoMeta = { meta, perder: antroNum(rec.peso) - meta, mm, max };
      }
    }
    if (a.visceral.v) cards.push({ k: "visceral", nome: "Gordura visceral", atual: a.visceral.v, ideal: 9, rotIdeal: "Ideal (até)", modo: "max", un: "", d: 0, cl: a.visceral.cl, faixa: "Faixa normal: 1 a 9" });
    if (a.mmePct.v && sexo) {
      const t = antroFaixaMusculo(sexo, idade);
      cards.push({ k: "musculo", nome: "Músculo esquelético", atual: a.mmePct.v, ideal: t[0], rotIdeal: "Ideal (mín.)", modo: "min", un: "%", d: 1, cl: a.mmePct.cl, faixa: "Faixa normal: " + antroFmt(t[0], 1) + " a " + antroFmt(t[1], 1) + "%" });
    }
    if (a.imc.v) {
      const max = idade && idade >= 60 ? 27.9 : 24.9;
      linhas.push({ nome: "IMC", atual: antroFmt(a.imc.v, 1), meta: "até " + antroFmt(max, 1), dif: a.imc.v > max ? a.imc.v - max : 0, d: 1, un: "" });
    }
    if (a.idadeCorporal.v && idade) linhas.push({ nome: "Idade corporal", atual: antroFmt(a.idadeCorporal.v, 0) + " anos", meta: "até " + idade, dif: a.idadeCorporal.v > idade ? a.idadeCorporal.v - idade : 0, d: 0, un: "" });
    if (a.cintura.v && sexo) {
      const lim = sexo === "F" ? 80 : 94;
      linhas.push({ nome: "Cintura", atual: antroFmt(a.cintura.v, 1) + " cm", meta: "abaixo de " + lim, dif: a.cintura.v >= lim ? a.cintura.v - lim + 0.1 : 0, d: 1, un: " cm" });
    }
    if (a.rcest.v) linhas.push({ nome: "Cintura / estatura", atual: antroFmt(a.rcest.v, 2), meta: "abaixo de 0,50", dif: a.rcest.v >= 0.5 ? a.rcest.v - 0.49 : 0, d: 2, un: "" });
    return { cards, linhas, pesoMeta };
  };
  const AntroIdeal = ({ rec, a, mg }) => {
    const { cards, linhas, pesoMeta } = antroIdeais(rec, a, mg);
    if (!cards.length && !linhas.length) return null;
    const verde = "#0f766e", laranja = "#c2410c";
    const faixaTxt = a.sexo ? "Faixas de referência para " + (a.sexo === "F" ? "mulheres" : "homens") + (a.idade ? (a.idade < 40 ? " de até 39 anos." : a.idade < 60 ? " de 40 a 59 anos." : " de 60 anos ou mais.") : ".") : "";
    return antroRelH(AntroRelSecao, { titulo: "Seu resultado × o ideal" },
      faixaTxt ? antroRelH("div", { style: { fontSize: 12, color: "#64748b", margin: "-4px 0 12px" } }, faixaTxt) : null,
      pesoMeta && pesoMeta.perder > 0.2 ? antroRelH("div", { style: { background: "#fff4ee", border: "1.5px solid #fed7aa", borderRadius: 12, padding: "12px 14px", marginBottom: 12 } },
        antroRelH("div", { style: { fontSize: 12, color: "#9a3412" } }, "Peso meta estimado"),
        antroRelH("div", { style: { display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginTop: 2 } },
          antroRelH("span", { style: { fontSize: 22, fontWeight: 800, color: laranja } }, antroFmt(pesoMeta.meta, 1) + " kg"),
          antroRelH("span", { style: { fontSize: 13, color: "#9a3412" } }, "perder " + antroFmt(pesoMeta.perder, 1) + " kg de gordura")),
        antroRelH("div", { style: { fontSize: 11.5, color: "#9a3412", marginTop: 4, lineHeight: 1.5 } }, "Mantendo os " + antroFmt(pesoMeta.mm, 1) + " kg de massa magra e chegando a " + antroFmt(pesoMeta.max, 1) + "% de gordura.")) : null,
      cards.map((c) => {
        const ok = c.modo === "max" ? c.atual <= c.ideal : c.atual >= c.ideal;
        const dif = c.atual - c.ideal;
        const pct = c.modo === "max" ? Math.min(100, (c.ideal / c.atual) * 100) : Math.min(100, (c.atual / c.ideal) * 100);
        const num = (v, cor, rot) => antroRelH("div", null, antroRelH("div", { style: { fontSize: 18, fontWeight: 800, color: cor } }, v), antroRelH("div", { style: { fontSize: 11, color: "#64748b" } }, rot));
        return antroRelH("div", { key: c.k, className: "report-section", style: { border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 14px", marginBottom: 10 } },
          antroRelH("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } },
            antroRelH("span", { style: { fontSize: 13, color: "#475569" } }, c.nome),
            c.cl ? antroRelH("span", { style: { fontSize: 11, fontWeight: 700, color: c.cl.color, background: c.cl.bg, borderRadius: 6, padding: "2px 7px" } }, c.cl.label) : null),
          antroRelH("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6, marginTop: 8, textAlign: "center" } },
            num(antroFmt(c.atual, c.d) + c.un, ok ? verde : "#dc2626", "Atual"),
            num(antroFmt(c.ideal, c.d) + c.un, verde, c.rotIdeal),
            ok ? num("✓", verde, "Na faixa") : num((dif > 0 ? "−" : "+") + antroFmt(Math.abs(dif), c.d), c.modo === "max" ? laranja : verde, c.modo === "max" ? "Diferença" : "A ganhar")),
          antroRelH("div", { style: { height: 6, background: "#f1f5f9", borderRadius: 3, marginTop: 10, overflow: "hidden", display: "flex" } },
            antroRelH("div", { style: { width: (ok ? 100 : pct) + "%", background: "#14b8a6" } }),
            ok ? null : antroRelH("div", { style: { flex: 1, background: c.modo === "max" ? "#fdba74" : "#e2e8f0" } })),
          antroRelH("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 5 } }, c.faixa));
      }),
      linhas.length ? antroRelH("div", { style: { fontSize: 12, color: "#64748b", margin: "12px 0 4px" } }, "Outros indicadores") : null,
      linhas.map((l, i) => antroRelH("div", { key: l.nome, style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: i < linhas.length - 1 ? "1px solid #f1f5f9" : "none", fontSize: 12.5 } },
        antroRelH("span", { style: { color: "#475569" } }, l.nome),
        antroRelH("span", { style: { textAlign: "right" } },
          antroRelH("b", { style: { color: "#0f172a" } }, l.atual),
          antroRelH("span", { style: { color: "#94a3b8" } }, " → " + l.meta + " "),
          l.dif > 0 ? antroRelH("b", { style: { color: laranja } }, "−" + antroFmt(l.dif, l.d)) : antroRelH("b", { style: { color: verde } }, "✓")))));
  };
  const AntroRelatorio = ({ st, rec, anterior, Header, Footer, papel }) => {
    const [r0, setR0] = useState(rec);
    const [liberando, setLiberando] = useState(false);
    const aluno = papel === "aluno";
    const Cab = Header || AntroCab, Rod = AntroRodape;
    const [textos, setTextos] = useState(() => !rec ? { significado: "", recomendacoes: "" } : rec.relatorio && (rec.relatorio.significado || rec.relatorio.recomendacoes) ? { significado: rec.relatorio.significado || "", recomendacoes: rec.relatorio.recomendacoes || "" } : antroTextos(rec, st));
    const [salvo, setSalvo] = useState("");
    const [editando, setEditando] = useState(false);
    const a = antroAnalise(rec, st);
    const salvarTextos = async () => {
      setSalvo("salvando");
      const uid = await antroApi.usuarioId();
      const novo = { ...r0, relatorio: { ...r0.relatorio || {}, ...textos, editadoEm: (/* @__PURE__ */ new Date()).toISOString() } };
      const ok = await antroApi.salvar(st.id, uid, novo);
      if (ok) setR0(novo);
      setSalvo(ok ? "ok" : "erro");
      if (ok) setEditando(false);
    };
    const mg = antroMetaGordura(r0, a, anterior);
    const [metaTxt, setMetaTxt] = useState(mg && mg.custom ? String(mg.meta).replace(".", ",") : "");
    const [metaMsg, setMetaMsg] = useState("");
    const salvarMeta = async (valor) => {
      setMetaMsg("salvando");
      const uid = await antroApi.usuarioId();
      const novo = { ...r0, relatorio: { ...r0.relatorio || {}, metaGordura: valor } };
      const ok = await antroApi.salvar(st.id, uid, novo);
      if (ok) {
        setR0(novo);
        if (!valor) setMetaTxt("");
      }
      setMetaMsg(ok ? "ok" : "erro");
    };
    const alternarLiberado = async () => {
      setLiberando(true);
      const uid = await antroApi.usuarioId();
      const novo = { ...r0, liberadoAluno: !r0.liberadoAluno, liberadoEm: !r0.liberadoAluno ? (/* @__PURE__ */ new Date()).toISOString() : null };
      const ok = await antroApi.salvar(st.id, uid, novo);
      if (ok) setR0(novo);
      else alert("Não consegui salvar. Tente de novo.");
      setLiberando(false);
    };
    const gord = a.gDob.v ? a.gDob : a.gBio;
    const cards = [
      ["Peso", rec.peso ? antroFmt(rec.peso, 1) + " kg" : "—", null],
      ["Altura", rec.altura ? antroFmt(rec.altura, 0) + " cm" : "—", null],
      ["IMC", a.imc.v ? antroFmt(a.imc.v, 1) : "—", a.imc.cl],
      ["Gordura", gord.v ? antroFmt(gord.v, 1) + "%" : "—", gord.cl]
    ];
    const risco = [
      ["Cintura", a.cintura.v ? antroFmt(a.cintura.v, 1) + " cm" : null, a.cintura.cl],
      ["Relação cintura/quadril", a.rcq.v ? antroFmt(a.rcq.v, 2) : null, a.rcq.cl],
      ["Relação cintura/estatura", a.rcest.v ? antroFmt(a.rcest.v, 2) : null, a.rcest.cl],
      ["Panturrilha (média dos lados)", a.pant.v ? antroFmt(a.pant.v, 1) + " cm" : null, a.pant.cl]
    ].filter((x) => x[1]);
    const comp = anterior ? ANTRO_INDICADORES.concat([{ k: "imc", nome: "IMC", un: "", d: 1, bom: "cai", get: (r) => r.imc }]).map((ind) => {
      const x = antroNum(ind.get(anterior)), y = antroNum(ind.get(rec));
      if (!x || !y) return null;
      const dif = y - x;
      const melhorou = Math.abs(dif) < 1e-9 ? null : ind.bom === "cai" ? dif < 0 : ind.bom === "sobe" ? dif > 0 : null;
      return { ind, x, y, dif, melhorou };
    }).filter(Boolean) : [];
    const caixaTexto = (k) => editando ? antroRelH("textarea", { value: textos[k], onChange: (e) => setTextos({ ...textos, [k]: e.target.value }), rows: 7, style: { width: "100%", boxSizing: "border-box", fontSize: 13, lineHeight: 1.6, border: "1.5px solid #FF5603", borderRadius: 10, padding: 10, fontFamily: "inherit" } }) : antroRelH("div", { style: { fontSize: 12.5, color: "#334155", lineHeight: 1.7, whiteSpace: "pre-wrap" } }, textos[k]);
    const btn = (rot, onClick, cheio) => antroRelH("button", { type: "button", onClick, style: { background: cheio ? "#FF5603" : "#f1f5f9", color: cheio ? "#fff" : "#0f172a", border: "none", borderRadius: 9, padding: "9px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, rot);
    return antroRelH("div", null,
      !aluno && antroRelH("div", { className: "no-print", style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: r0.liberadoAluno ? "#ecfdf5" : "#f8fafc", border: "1.5px solid " + (r0.liberadoAluno ? "#99f6e4" : "#e2e8f0"), borderRadius: 12, padding: "10px 12px", marginBottom: 10 } },
        antroRelH("div", { style: { fontSize: 13, color: r0.liberadoAluno ? ANTRO_VERDE : "#475569", fontWeight: 700 } }, r0.liberadoAluno ? "Visível no app do aluno" : "Oculto do aluno"),
        btn(liberando ? "Salvando..." : r0.liberadoAluno ? "Ocultar do aluno" : "Liberar para o aluno", alternarLiberado, !r0.liberadoAluno)),
      !aluno && mg && antroRelH("div", { className: "no-print", style: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "10px 12px", marginBottom: 10 } },
        antroRelH("div", { style: { fontSize: 13, fontWeight: 700, color: "#0f172a" } }, "Meta de gordura corporal"),
        antroRelH("div", { style: { fontSize: 11.5, color: "#64748b", margin: "2px 0 8px", lineHeight: 1.4 } }, "Referência para a idade e o sexo: até " + antroFmt(mg.padrao, 1) + "%. Ajuste se a estratégia pedir uma meta menor."),
        antroRelH("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } },
          antroRelH("input", { type: "text", inputMode: "decimal", value: metaTxt, placeholder: antroFmt(mg.padrao, 1), onChange: (e) => { setMetaTxt(e.target.value); setMetaMsg(""); }, style: { width: 80, height: 36, border: "1.5px solid #e2e8f0", borderRadius: 9, padding: "0 10px", fontSize: 14, fontWeight: 700, fontFamily: "inherit" } }),
          antroRelH("span", { style: { fontSize: 14, color: "#475569", fontWeight: 700 } }, "%"),
          btn(metaMsg === "salvando" ? "Salvando..." : "Salvar meta", () => {
            const v = antroNum(metaTxt);
            if (!v || v < 5 || v > 50) { setMetaMsg("invalida"); return; }
            salvarMeta(Math.round(v * 10) / 10);
          }, true),
          mg.custom ? btn("Usar referência", () => salvarMeta(null)) : null),
        metaMsg === "ok" ? antroRelH("div", { style: { fontSize: 12, color: ANTRO_VERDE, fontWeight: 700, marginTop: 6 } }, "Meta salva. O aluno vê a mesma meta.") : null,
        metaMsg === "erro" ? antroRelH("div", { style: { fontSize: 12, color: "#dc2626", fontWeight: 700, marginTop: 6 } }, "Não consegui salvar. Tente de novo.") : null,
        metaMsg === "invalida" ? antroRelH("div", { style: { fontSize: 12, color: "#dc2626", fontWeight: 700, marginTop: 6 } }, "Digite um valor entre 5 e 50.") : null),
      !aluno && antroRelH("div", { className: "no-print", style: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", margin: "0 0 12px" } },
        editando ? btn(salvo === "salvando" ? "Salvando..." : "Salvar textos", salvarTextos, true) : btn("✏️ Editar textos", () => { setEditando(true); setSalvo(""); }),
        editando ? btn("Gerar de novo", () => setTextos(antroTextos(rec, st))) : null,
        editando ? btn("Cancelar", () => { setEditando(false); setTextos(r0.relatorio && r0.relatorio.significado ? { significado: r0.relatorio.significado, recomendacoes: r0.relatorio.recomendacoes || "" } : antroTextos(rec, st)); }) : null,
        salvo === "ok" ? antroRelH("span", { style: { fontSize: 12, color: ANTRO_VERDE, fontWeight: 700 } }, "Textos salvos") : null,
        salvo === "erro" ? antroRelH("span", { style: { fontSize: 12, color: "#dc2626", fontWeight: 700 } }, "Não consegui salvar") : null),
      antroRelH("div", { className: "print-page", style: { padding: 20, background: "#fff", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } },
        antroRelH(Cab),
        antroRelH("div", { style: { background: "linear-gradient(135deg,#fff4ee,#fff)", border: "1.5px solid #FF560322", borderRadius: 12, padding: "14px 18px", marginBottom: 20 } },
          antroRelH("div", { style: { fontWeight: 800, fontSize: 17, color: "#0f172a", marginBottom: 4 } }, "Relatório de Avaliação Antropométrica"),
          antroRelH("div", { style: { fontSize: 12, color: "#64748b" } }, "Data: " + antroData(rec.date) + " · " + antroMetodo(rec))),
        antroRelH(AntroRelSecao, { titulo: "Identificação do Aluno" },
          antroRelH("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 16 } },
            antroRelH(AntroRelLinha, { rotulo: "Nome", valor: st.name }),
            antroRelH(AntroRelLinha, { rotulo: "Idade na avaliação", valor: a.idade ? a.idade + " anos" : null }),
            antroRelH(AntroRelLinha, { rotulo: "Sexo", valor: a.sexo === "F" ? "Feminino" : a.sexo === "M" ? "Masculino" : null }),
            antroRelH(AntroRelLinha, { rotulo: "Data da avaliação", valor: antroData(rec.date) }))),
        antroRelH(AntroRelSecao, { titulo: "Resumo" },
          antroRelH("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 } }, cards.map((c) => antroRelH("div", { key: c[0], style: { background: c[2] ? c[2].bg : "#f8fafc", border: "1.5px solid " + (c[2] ? c[2].color + "33" : "#e2e8f0"), borderRadius: 10, padding: "10px 6px", textAlign: "center" } },
            antroRelH("div", { style: { fontSize: 18, fontWeight: 900, color: c[2] ? c[2].color : "#0f172a" } }, c[1]),
            c[2] ? antroRelH("div", { style: { fontSize: 10, fontWeight: 700, color: c[2].color } }, c[2].label) : null,
            antroRelH("div", { style: { fontSize: 10, color: "#64748b", marginTop: 2 } }, c[0]))))),
        (rec.dobras || rec.bio) && antroRelH(AntroRelSecao, { titulo: "Composição Corporal" },
          rec.dobras && antroRelH("div", { style: { marginBottom: rec.bio ? 14 : 0 } },
            antroRelH("div", { style: { fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4 } }, "Dobras cutâneas · Jackson & Pollock " + (rec.dobras.protocolo === 3 ? "3" : "7") + " dobras (lado direito)"),
            antroRelH("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", columnGap: 16 } },
              ANTRO_DOBRAS.filter((d) => antroNum((rec.dobras.valores || {})[d[0]])).map((d) => antroRelH(AntroRelLinha, { key: d[0], rotulo: d[1], valor: antroFmt(antroNum(rec.dobras.valores[d[0]]), 1) + " mm" })),
              rec.dobras.soma ? antroRelH(AntroRelLinha, { rotulo: "Soma das dobras", valor: antroFmt(rec.dobras.soma, 1) + " mm" }) : null,
              antroRelH(AntroRelLinha, { rotulo: "Gordura corporal", valor: a.gDob.v ? antroFmt(a.gDob.v, 1) + "%" : null, cl: a.gDob.cl, refTxt: mg ? "Ref.: " + antroFmt(mg.min, 0) + " a " + antroFmt(mg.padrao, 1) + "%" + (mg.custom ? " · meta " + antroFmt(mg.meta, 1) + "%" : "") : null }),
              rec.dobras.massaGorda ? antroRelH(AntroRelLinha, { rotulo: "Massa de gordura", valor: antroFmt(rec.dobras.massaGorda, 1) + " kg" }) : null,
              rec.dobras.massaMagra ? antroRelH(AntroRelLinha, { rotulo: "Massa magra", valor: antroFmt(rec.dobras.massaMagra, 1) + " kg" }) : null)),
          rec.bio && antroRelH("div", null,
            antroRelH("div", { style: { fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4 } }, "Bioimpedância" + (rec.bio.aparelho ? " · " + rec.bio.aparelho : "") + (rec.origem === "aluno" ? " · laudo enviado pelo aluno" : "")),
            antroRelH("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", columnGap: 16 } },
              ANTRO_BIO_TODOS.filter((b) => antroNum(rec.bio[b[0]])).map((b) => {
                const v = antroNum(rec.bio[b[0]]);
                const dec = b[0] === "visceral" || b[0] === "tmb" || b[0] === "idadeCorporal" ? 0 : 1;
                const cl = b[0] === "gordura" ? a.gBio.cl : b[0] === "visceral" ? a.visceral.cl : b[0] === "mmePct" ? a.mmePct.cl : b[0] === "idadeCorporal" ? a.idadeCorporal.cl : null;
                const rot = rec.bio.modo === "omron" ? (ANTRO_BIO_OMRON.find((o) => o[0] === b[0]) || b)[1] : b[1];
                const r = antroRefBio(b[0], v, rec, a, mg);
                return antroRelH(AntroRelLinha, { key: b[0], rotulo: rot, valor: antroFmt(v, dec) + (b[2] === "%" ? "%" : b[2] === "nível" ? "" : " " + b[2]), cl: cl || r.cl, refTxt: r.txt });
              })))),
        antroRelH(AntroIdeal, { rec, a, mg }),
        (rec.membros || rec.tronco) && antroRelH(AntroRelSecao, { titulo: "Perímetros" },
          rec.membros && antroRelH("table", { style: { width: "100%", borderCollapse: "collapse", marginBottom: rec.tronco ? 10 : 0 } },
            antroRelH("thead", null, antroRelH("tr", null, ["Medida", "Direito", "Esquerdo", "Diferença"].map((t, i) => antroRelH("th", { key: t, style: { ...antroTh, textAlign: i ? "right" : "left" } }, t)))),
            antroRelH("tbody", null, ANTRO_MEMBROS.filter((m) => rec.membros[m[0]]).map((m) => {
              const o = rec.membros[m[0]];
              const d = antroNum(o.d), e = antroNum(o.e);
              const dif = d && e ? Math.abs(d - e) : null;
              return antroRelH("tr", { key: m[0] },
                antroRelH("td", { style: antroTd }, m[1]),
                antroRelH("td", { style: { ...antroTd, textAlign: "right" } }, d ? antroFmt(d, 1) + " cm" : "—"),
                antroRelH("td", { style: { ...antroTd, textAlign: "right" } }, e ? antroFmt(e, 1) + " cm" : "—"),
                antroRelH("td", { style: { ...antroTd, textAlign: "right", fontWeight: 700, color: dif !== null && dif > 2 ? ANTRO_LARANJA_TXT : "#64748b" } }, dif !== null ? antroFmt(dif, 1) + " cm" : "—"));
            }))),
          rec.tronco && antroRelH("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 16 } },
            ANTRO_TRONCO.filter((t) => antroNum(rec.tronco[t[0]])).map((t) => antroRelH(AntroRelLinha, { key: t[0], rotulo: t[1], valor: antroFmt(antroNum(rec.tronco[t[0]]), 1) + " cm" }))),
          rec.membros && antroRelH("div", { style: { fontSize: 11, color: "#64748b", marginTop: 6 } }, "Diferença em laranja quando passa de 2 cm entre os lados.")),
        risco.length > 0 && antroRelH(AntroRelSecao, { titulo: "Indicadores de Risco" },
          risco.map((r) => antroRelH(AntroRelLinha, { key: r[0], rotulo: r[0], valor: r[1], cl: r[2] }))),
        comp.length > 0 && antroRelH(AntroRelSecao, { titulo: "Comparação com " + antroData(anterior.date) },
          antroRelH("table", { style: { width: "100%", borderCollapse: "collapse" } },
            antroRelH("thead", null, antroRelH("tr", null, ["Indicador", "Anterior", "Atual", "Variação"].map((t, i) => antroRelH("th", { key: t, style: { ...antroTh, textAlign: i ? "right" : "left" } }, t)))),
            antroRelH("tbody", null, comp.map((c) => antroRelH("tr", { key: c.ind.k },
              antroRelH("td", { style: antroTd }, c.ind.nome),
              antroRelH("td", { style: { ...antroTd, textAlign: "right", color: "#64748b" } }, antroFmt(c.x, c.ind.d) + c.ind.un),
              antroRelH("td", { style: { ...antroTd, textAlign: "right", fontWeight: 700 } }, antroFmt(c.y, c.ind.d) + c.ind.un),
              antroRelH("td", { style: { ...antroTd, textAlign: "right", fontWeight: 700, color: c.melhorou === true ? ANTRO_VERDE : c.melhorou === false ? ANTRO_LARANJA_TXT : "#64748b" } }, (c.dif > 0 ? "+" : "") + antroFmt(c.dif, c.ind.d) + c.ind.un)))))),
        antroRelH(AntroRelSecao, { titulo: "O que os resultados significam" }, caixaTexto("significado")),
        antroRelH(AntroRelSecao, { titulo: "Recomendações Gerais" }, caixaTexto("recomendacoes")),
        antroRelH("div", { style: { fontSize: 10, color: "#94a3b8", lineHeight: 1.5 } }, "Referências: IMC (OMS; OPAS para 60 anos ou mais), circunferência da cintura e RCQ (OMS), relação cintura/estatura (Ashwell), percentual de gordura (Gallagher et al., 2000), índice muscular (Janssen et al., 2004), dobras cutâneas (Jackson & Pollock com equação de Siri)."),
        antroRelH(Rod, { extra: "Avaliação antropométrica · " + antroMetodo(rec) })));
  };
  const antroAnteriorDe = (lista, rec) => {
    const ok = (lista || []).filter((x) => x.id !== rec.id && x.status !== "pendente" && (x.date || "") < (rec.date || "")).sort((x, y) => (x.date || "").localeCompare(y.date || ""));
    const ant = ok.slice(-1)[0] || null;
    if (!ant || antroNum(ant.relatorio && ant.relatorio.metaGordura)) return ant;
    const comMeta = ok.slice().reverse().find((x) => antroNum(x.relatorio && x.relatorio.metaGordura));
    return comMeta ? { ...ant, relatorio: { ...ant.relatorio || {}, metaGordura: comMeta.relatorio.metaGordura } } : ant;
  };
  const AntroSeletor = ({ st, autoId, onAbrir }) => {
    const [lista, setLista] = useState(null);
    useEffect(() => {
      let vivo = true;
      setLista(null);
      antroApi.listar(st.id).then((l) => {
        if (!vivo) return;
        const ls = l || [];
        setLista(ls);
        const alvo = autoId && ls.find((x) => x.id === autoId);
        if (alvo) onAbrir(alvo, antroAnteriorDe(ls, alvo));
      });
      return () => { vivo = false; };
    }, [st.id]);
    if (lista === null) return antroRelH("div", { style: { fontSize: 13, color: "#94a3b8", padding: "8px 0" } }, "Carregando avaliações antropométricas...");
    const conf = lista.filter((x) => x.status !== "pendente").slice().reverse();
    const pend = lista.filter((x) => x.status === "pendente").length;
    if (!conf.length) return antroRelH("div", { style: { fontSize: 13, color: "#94a3b8", padding: "8px 0", lineHeight: 1.5 } }, pend ? "Há bioimpedância aguardando sua conferência. Confira na aba Antropometria do aluno para gerar o relatório." : "Nenhuma avaliação antropométrica registrada. Lance na aba Antropometria do aluno.");
    return antroRelH("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
      conf.map((r) => {
        const g = antroNum(r.dobras && r.dobras.gordura) || antroNum(r.bio && r.bio.gordura);
        return antroRelH("button", { key: r.id, type: "button", onClick: () => onAbrir(r, antroAnteriorDe(lista, r)), style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 11, border: "1.5px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", textAlign: "left", fontFamily: "inherit" } },
          antroRelH("div", null,
            antroRelH("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a" } }, antroData(r.date)),
            antroRelH("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 2 } }, antroTipos(r) + (r.peso ? " · " + antroFmt(r.peso, 1) + " kg" : "") + (g ? " · " + antroFmt(g, 1) + "% gordura" : ""))),
          antroRelH("span", { style: { fontSize: 13, fontWeight: 700, color: ANTRO_LARANJA } }, "Gerar ›"));
      }),
      pend ? antroRelH("div", { style: { fontSize: 12, color: "#94a3b8" } }, pend + (pend === 1 ? " bioimpedância aguardando" : " bioimpedâncias aguardando") + " conferência não aparece aqui.") : null);
  };
  const antroImprimir = (props) => {
    let root = document.getElementById("lv-antro-print");
    if (!root) {
      root = document.createElement("div");
      root.id = "lv-antro-print";
      document.body.appendChild(root);
    }
    if (!document.getElementById("lv-antro-print-css")) {
      const css = document.createElement("style");
      css.id = "lv-antro-print-css";
      css.textContent = "#lv-antro-print{display:none;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a}@media print{body>*:not(#lv-antro-print){display:none!important}#lv-antro-print{display:block!important;background:#fff}.no-print{display:none!important}@page{margin:12mm 15mm;size:A4}.report-section,.prof-footer{page-break-inside:avoid}table,tr{page-break-inside:avoid}*{box-shadow:none!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}}";
      document.head.appendChild(css);
    }
    if (window.__lvAntroRoot) {
      try { window.__lvAntroRoot.unmount(); } catch (e) {}
    }
    const r = ReactDOM.createRoot(root);
    window.__lvAntroRoot = r;
    r.render(antroRelH(AntroRelatorio, { ...props, papel: "aluno" }));
    setTimeout(() => window.print(), 500);
  };
  window.LongevusAntropometria = { Painel: AntroPainel, Relatorio: AntroRelatorio, imprimir: antroImprimir, anteriorDe: antroAnteriorDe, Seletor: AntroSeletor, textos: antroTextos, analise: antroAnalise, medidas: function(id) {
    return antroApi.medidas(id);
  } };
})();
