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
    }, style: { height: 38, padding: "0 16px", borderRadius: 10, border: "none", background: ANTRO_LARANJA, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, "+ Nova antropométrica")), falhou && /* @__PURE__ */ React.createElement(AntroCard, { style: { padding: 12, marginBottom: 10, color: "#dc2626", fontSize: 13 } }, "Não consegui carregar. Confira se os SQLs da avaliação antropométrica foram rodados."), pendentes.map((r) => /* @__PURE__ */ React.createElement("button", { key: r.id, type: "button", onClick: () => abrir(r), style: { width: "100%", textAlign: "left", background: "#fff4ee", border: "1.5px solid #fed7aa", borderRadius: 14, padding: "12px 14px", marginBottom: 10, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#7c2d12" } }, "Laudo do aluno para conferir"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#7c2d12" } }, "Bioimpedância de " + antroData(r.date) + (r.bio && r.bio.aparelho ? " · " + r.bio.aparelho : ""))), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: ANTRO_LARANJA_TXT, whiteSpace: "nowrap" } }, "Conferir ›"))), lista.length === 0 ? /* @__PURE__ */ React.createElement(AntroCard, { style: { textAlign: "center", padding: 28, color: "#94a3b8", fontSize: 13, lineHeight: 1.5 } }, "Nenhuma avaliação antropométrica ainda. Use o botão acima, ou peça para o aluno lançar a bioimpedância pelo app dele.") : /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(AntroEvolucao, { lista, papel: "professor" }), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 15, margin: "18px 0 8px" } }, "Histórico"), recentes.map((r) => /* @__PURE__ */ React.createElement(AntroCard, { key: r.id, onClick: () => abrir(r), style: { padding: "12px 14px", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, antroData(r.date)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b" } }, antroTipos(r) + " · " + (r.origem === "aluno" ? "lançada pelo aluno" : "lançada por você"))), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, borderRadius: 10, padding: "3px 8px", whiteSpace: "nowrap", color: r.status === "pendente" ? "#fff" : ANTRO_VERDE, background: r.status === "pendente" ? "#c2410c" : "#ecfdf5" } }, r.status === "pendente" ? "pendente" : "conferida"), r.status !== "pendente" && nav ? /* @__PURE__ */ React.createElement("button", { type: "button", onClick: (e) => {
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
  const antroClGordura = (g, sexo, idade) => {
    if (!g || !sexo) return null;
    const i = idade || 40;
    const t = sexo === "F" ? (i < 40 ? [21, 33, 39] : i < 60 ? [23, 34, 40] : [24, 36, 42]) : (i < 40 ? [8, 20, 25] : i < 60 ? [11, 22, 28] : [13, 25, 30]);
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
    const i = idade || 40;
    const t = sexo === "F" ? (i < 40 ? [24.3, 30.3] : i < 60 ? [24.1, 30.1] : [23.9, 29.9]) : (i < 40 ? [33.3, 39.3] : i < 60 ? [33.1, 39.1] : [32.9, 38.9]);
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
  const AntroRelLinha = ({ rotulo, valor, cl }) => antroRelH("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f1f5f9" } },
    antroRelH("span", { style: { fontSize: 12, color: "#475569" } }, rotulo),
    antroRelH("span", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#0f172a", textAlign: "right" } }, valor || "—",
      cl ? antroRelH("span", { style: { fontSize: 10, fontWeight: 700, color: cl.color, background: cl.bg, borderRadius: 6, padding: "2px 6px" } }, cl.label) : null));
  const AntroRelSecao = ({ titulo, children }) => antroRelH("div", { className: "report-section", style: { marginBottom: 20 } }, antroRelH("div", { style: ANTRO_REL_SEC }, titulo), children);
  const antroTh = { textAlign: "left", fontSize: 11, color: "#64748b", fontWeight: 700, padding: "6px 4px", borderBottom: "1.5px solid #e2e8f0" };
  const antroTd = { fontSize: 12, padding: "6px 4px", borderBottom: "1px solid #f1f5f9", color: "#0f172a" };
  const AntroRelatorio = ({ st, rec, anterior, Header, Footer }) => {
    const [textos, setTextos] = useState(() => !rec ? { significado: "", recomendacoes: "" } : rec.relatorio && (rec.relatorio.significado || rec.relatorio.recomendacoes) ? { significado: rec.relatorio.significado || "", recomendacoes: rec.relatorio.recomendacoes || "" } : antroTextos(rec, st));
    const [salvo, setSalvo] = useState("");
    const [editando, setEditando] = useState(false);
    if (!rec || !st) return null;
    const a = antroAnalise(rec, st);
    const salvarTextos = async () => {
      setSalvo("salvando");
      const uid = await antroApi.usuarioId();
      const ok = await antroApi.salvar(st.id, uid, { ...rec, relatorio: { ...rec.relatorio || {}, ...textos, editadoEm: (/* @__PURE__ */ new Date()).toISOString() } });
      setSalvo(ok ? "ok" : "erro");
      if (ok) setEditando(false);
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
      antroRelH("div", { className: "no-print", style: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", margin: "0 0 12px" } },
        editando ? btn(salvo === "salvando" ? "Salvando..." : "Salvar textos", salvarTextos, true) : btn("✏️ Editar textos", () => { setEditando(true); setSalvo(""); }),
        editando ? btn("Gerar de novo", () => setTextos(antroTextos(rec, st))) : null,
        editando ? btn("Cancelar", () => { setEditando(false); setTextos(rec.relatorio && rec.relatorio.significado ? { significado: rec.relatorio.significado, recomendacoes: rec.relatorio.recomendacoes || "" } : antroTextos(rec, st)); }) : null,
        salvo === "ok" ? antroRelH("span", { style: { fontSize: 12, color: ANTRO_VERDE, fontWeight: 700 } }, "Textos salvos") : null,
        salvo === "erro" ? antroRelH("span", { style: { fontSize: 12, color: "#dc2626", fontWeight: 700 } }, "Não consegui salvar") : null),
      antroRelH("div", { className: "print-page", style: { padding: 20, background: "#fff" } },
        Header ? antroRelH(Header) : null,
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
            antroRelH("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 16 } },
              ANTRO_DOBRAS.filter((d) => antroNum((rec.dobras.valores || {})[d[0]])).map((d) => antroRelH(AntroRelLinha, { key: d[0], rotulo: d[1], valor: antroFmt(antroNum(rec.dobras.valores[d[0]]), 1) + " mm" })),
              rec.dobras.soma ? antroRelH(AntroRelLinha, { rotulo: "Soma das dobras", valor: antroFmt(rec.dobras.soma, 1) + " mm" }) : null,
              antroRelH(AntroRelLinha, { rotulo: "Gordura corporal", valor: a.gDob.v ? antroFmt(a.gDob.v, 1) + "%" : null, cl: a.gDob.cl }),
              rec.dobras.massaGorda ? antroRelH(AntroRelLinha, { rotulo: "Massa de gordura", valor: antroFmt(rec.dobras.massaGorda, 1) + " kg" }) : null,
              rec.dobras.massaMagra ? antroRelH(AntroRelLinha, { rotulo: "Massa magra", valor: antroFmt(rec.dobras.massaMagra, 1) + " kg" }) : null)),
          rec.bio && antroRelH("div", null,
            antroRelH("div", { style: { fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4 } }, "Bioimpedância" + (rec.bio.aparelho ? " · " + rec.bio.aparelho : "") + (rec.origem === "aluno" ? " · laudo enviado pelo aluno" : "")),
            antroRelH("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 16 } },
              ANTRO_BIO_TODOS.filter((b) => antroNum(rec.bio[b[0]])).map((b) => {
                const v = antroNum(rec.bio[b[0]]);
                const dec = b[0] === "visceral" || b[0] === "tmb" || b[0] === "idadeCorporal" ? 0 : 1;
                const cl = b[0] === "gordura" ? a.gBio.cl : b[0] === "visceral" ? a.visceral.cl : b[0] === "mmePct" ? a.mmePct.cl : b[0] === "idadeCorporal" ? a.idadeCorporal.cl : null;
                const rot = rec.bio.modo === "omron" ? (ANTRO_BIO_OMRON.find((o) => o[0] === b[0]) || b)[1] : b[1];
                return antroRelH(AntroRelLinha, { key: b[0], rotulo: rot, valor: antroFmt(v, dec) + (b[2] === "%" ? "%" : b[2] === "nível" ? "" : " " + b[2]), cl });
              })))),
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
        antroRelH("div", { style: { fontSize: 10, color: "#94a3b8", lineHeight: 1.5 } }, "Referências: IMC (OMS; OPAS para 60 anos ou mais), circunferência da cintura e RCQ (OMS), relação cintura/estatura (Ashwell), percentual de gordura (Gallagher et al., 2000), dobras cutâneas (Jackson & Pollock com equação de Siri)."),
        Footer ? antroRelH(Footer, { extra: "Avaliação antropométrica · " + antroMetodo(rec) }) : null));
  };
  const antroAnteriorDe = (lista, rec) => {
    const ok = (lista || []).filter((x) => x.id !== rec.id && x.status !== "pendente" && (x.date || "") < (rec.date || "")).sort((x, y) => (x.date || "").localeCompare(y.date || ""));
    return ok.slice(-1)[0] || null;
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
  window.LongevusAntropometria = { Painel: AntroPainel, Relatorio: AntroRelatorio, Seletor: AntroSeletor, textos: antroTextos, analise: antroAnalise, medidas: function(id) {
    return antroApi.medidas(id);
  } };
})();
