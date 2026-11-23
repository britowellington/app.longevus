// Longevus · Cardio e Histórico (painel do professor). Gerado a partir de JSX, sem Babel.
(function() {
  const { useState, useEffect } = React;
  const SUPA_URL = "https://jpduxfbigcdxmtcozqpp.supabase.co";
  const SUPA_KEY = "sb_publishable_VZSgcxu5ps3eR9UAjuRr4Q_B65WTx_h";
  const supa = () => window.__LV_SUPA;
  const ERGOS = { esteira: { nome: "Esteira", icone: "🚶" }, bike: { nome: "Bike", icone: "🚴" }, eliptico: { nome: "Elíptico", icone: "🏃" } };
  const RETESTE = [8, 16, 24];
  const ERG_ALIAS = ERGOS;
  const NOMES = { A: "Treino A", B: "Treino B", C: "Treino C", D: "Treino D", FB: "Full Body", FBA: "Full Body A", FBB: "Full Body B", FBC: "Full Body C", FBD: "Full Body D", FBE: "Full Body E", SUP: "Superior", INF: "Inferior", PUSH: "Push", PULL: "Pull", LEGS: "Legs", PEITO: "Peito", COSTAS: "Costas", PERNA: "Perna", OMBRO: "Ombro", EMP: "Empurrar", PUX: "Puxar", X1: "Treino extra", X2: "Treino extra", X3: "Treino extra", X4: "Treino extra" };
  const CARDIO_ERGOS = ERGOS;
  const CARDIO_ZONAS = {};
  const CARDIO_VOL = [1, 1.15, 1.25, 1.25, 1.3, 1.4, 1.4, 1.4, 1.3, 1.25, 1.2, 1.2, 1.2, 1.15, 1.1, 1.1, 1, 0.95, 0.9, 0.9, 0.9, 0.85, 0.8, 0.8];
  const CARDIO_MICRO_PADRAO = ["O", "O", "C", "R"];
  const CARDIO_MICRO_NOME = { O: "Ordinário", C: "Choque", R: "Recuperativo" };
  const CARDIO_ZK = ["", "Z1", "Z2", "Z3", "Z4"];
  const CARDIO_INTENS = [[1, "Leve", "2 a 3"], [2, "Base", "4 a 5"], [3, "Moderado", "6"]];
  const CARDIO_RETESTE = [8, 16, 24];
  const CARDIO_DELOAD = [4, 8, 12, 16, 20, 24];
  const cardioSeparado = (cfg, treinoKey) => !!(cfg && cfg.treinos && cfg.treinos[treinoKey] && cfg.treinos[treinoKey].onde === "separado");
  const cardioFase = (s) => s <= 8 ? "Volume" : s <= 16 ? "Transição" : "Pico";
  const cardioFmtSeg = (s) => s < 60 ? s + " s" : s % 60 === 0 ? s / 60 + " min" : Math.floor(s / 60) + " min " + s % 60 + " s";
  const cardioTemErgo = (cfg) => !!(cfg && cfg.treinos && Object.keys(cfg.treinos).some((k) => cfg.treinos[k] && CARDIO_ERGOS[cfg.treinos[k].ergo]));
  const cardioIntervaladoKey = (cfg) => {
    if (!cfg || !cfg.treinos) return null;
    if (cfg.intervalado && cfg.treinos[cfg.intervalado] && CARDIO_ERGOS[cfg.treinos[cfg.intervalado].ergo]) return cfg.intervalado;
    return Object.keys(cfg.treinos).find((k) => cfg.treinos[k] && CARDIO_ERGOS[cfg.treinos[k].ergo]) || null;
  };
  const cardioFC = (cfg, zona) => {
    if (!cfg || cfg.soPSE) return null;
    const rep = parseFloat(cfg.fcRepouso), idade = parseFloat(cfg.idade);
    const max = parseFloat(cfg.fcMax) || (idade ? Math.round(208 - 0.7 * idade) : 0);
    if (!rep || !max || max <= rep) return null;
    const z = CARDIO_ZONAS[zona];
    const r = max - rep;
    return [Math.round(rep + r * z.fcr[0]), Math.round(rep + r * z.fcr[1])];
  };
  const cardioMicro = (cfg, s) => cfg && cfg.micro && cfg.micro[s] || CARDIO_MICRO_PADRAO[(s - 1) % 4];
  const cardioTetoMin = (sep) => sep ? 45 : 30;
  const cardioTempoIni = (tr) => {
    const sep = tr && tr.onde === "separado";
    return Math.max(5, Math.min(cardioTetoMin(sep), parseInt(tr && tr.tempo) || (sep ? 25 : 20)));
  };
  const cardioZonaIni = (tr) => Math.max(1, Math.min(3, parseInt(tr && tr.zona) || 2));
  const cardioSemanaBase = (cfg, treinoKey, s, fator, offZ) => {
    const tr = cfg.treinos[treinoKey];
    const i = s - 1, meso = Math.floor(i / 8), k = i % 8;
    const sep = tr.onde === "separado", tempo = cardioTempoIni(tr), z0 = cardioZonaIni(tr);
    const forte = cardioIntervaladoKey(cfg) === treinoKey;
    const mt = cardioMicro(cfg, s);
    const cap = cardioTetoMin(sep), aq = sep ? 5 : 3, vc = sep ? 5 : 2;
    let V = Math.max(5, Math.min(cap, Math.round(tempo * CARDIO_VOL[i] * (mt === "C" ? 0.9 : mt === "R" ? 0.7 : 1) * (fator || 1))));
    let z, inter;
    if (mt === "R") {
      z = Math.min(z0, 2);
      inter = false;
    } else {
      if (meso === 0) {
        z = forte ? z0 + 1 : z0;
        inter = forte;
      } else if (meso === 1) {
        z = z0 + 1;
        inter = true;
      } else {
        z = forte ? z0 + 2 : z0 + 1;
        inter = true;
      }
      if (mt === "C") {
        z += 1;
        inter = true;
      }
    }
    let zmax = meso === 0 ? 3 : 4;
    if (cfg.nivel === "iniciante" || cfg.quedas && tr.ergo === "esteira") zmax = Math.min(zmax, 3);
    z = Math.max(1, Math.min(zmax, z));
    if (offZ && mt !== "R") {
      z = Math.max(1, Math.min(4, z + offZ));
    }
    if (z <= z0) inter = false;
    else if (mt !== "R" && offZ) inter = true;
    const base = { ergo: tr.ergo, separado: sep, aqMin: aq, vcMin: vc, semana: s, meso: meso + 1, fase: cardioFase(s), micro: mt, deload: mt === "R", choque: mt === "C", reteste: CARDIO_RETESTE.includes(s), vplan: V, zn: z };
    if (!inter || V - aq - vc < 4) return { ...base, tipo: "continuo", zona: CARDIO_ZK[z], total: V, texto: V + " min contínuo" };
    let on, off;
    if (z >= 4) {
      on = [30, 30, 45, 45, 45, 60, 60, 60][k];
      off = on;
    } else if (meso === 0) {
      on = 60;
      off = 120;
    } else if (meso === 1) {
      on = [60, 60, 90, 90, 120, 120, 120, 120][k];
      off = [120, 120, 120, 120, 120, 90, 90, 90][k];
      if (forte) {
        on = Math.round(on * 1.5);
        off = Math.max(60, off - 30);
      }
    } else {
      on = [120, 120, 150, 150, 150, 180, 180, 180][k];
      off = Math.min(on, [90, 90, 90, 90, 60, 60, 60, 60][k]);
    }
    const W = (V - aq - vc) * 60;
    const n = Math.max(3, Math.min(10, Math.floor((W + off) / (on + off))));
    const total = Math.round((aq * 60 + n * on + (n - 1) * off + vc * 60) / 60);
    return { ...base, tipo: "intervalado", series: n, on, off, zona: CARDIO_ZK[z], total, texto: n + "x (" + cardioFmtSeg(on) + " forte / " + cardioFmtSeg(off) + " leve)" };
  };
  const cardioSemana = (cfg, treinoKey, semana) => {
    const tr = cfg && cfg.treinos && cfg.treinos[treinoKey];
    if (!tr || !CARDIO_ERGOS[tr.ergo]) return null;
    const s = Math.max(1, Math.min(24, parseInt(semana) || 1));
    const ajs = cfg.ajustes && cfg.ajustes[treinoKey] || {};
    const semAj = Object.keys(ajs).map(Number).filter((w) => w >= 1 && w <= s && ajs[w]).sort((a, b) => a - b);
    let fator = 1, offZ = 0;
    semAj.forEach((w) => {
      const b = cardioSemanaBase(cfg, treinoKey, w, fator, offZ), aj = ajs[w];
      if (aj.V && b.vplan) fator = fator * (Math.max(5, parseInt(aj.V)) / b.vplan);
      if (aj.z && b.micro !== "R") offZ = offZ + (Math.max(1, Math.min(4, parseInt(aj.z))) - b.zn);
    });
    const r = cardioSemanaBase(cfg, treinoKey, s, fator, offZ);
    const desde = semAj.length ? semAj[0] : null;
    return { ...r, ajustado: !!ajs[s], ajusteDesde: desde && desde < s ? semAj[semAj.length - 1] : null };
  };
  const fase = (s) => cardioFase(s);
  const temErgo = cardioTemErgo;
  const intKey = cardioIntervaladoKey;
  const semanaInfo = (cfg, t, semana) => cardioSemana(cfg, t, semana);
  const api = {
    async headers() {
      const r = await supa().auth.getSession();
      const token = r && r.data && r.data.session && r.data.session.access_token || SUPA_KEY;
      return { "apikey": SUPA_KEY, "Authorization": "Bearer " + token };
    },
    // Exclui registros (só o professor usa). Retorna quantas linhas saíram: 0 indica bloqueio de permissão.
    async excluir(tabela, ids) {
      const h = await this.headers();
      let n = 0;
      for (const id of ids) {
        const r = await fetch(SUPA_URL + "/rest/v1/" + tabela + "?id=eq." + encodeURIComponent(id), { method: "DELETE", headers: { ...h, "Prefer": "return=representation" } });
        if (r.ok) {
          const rows = await r.json().catch(() => []);
          n += (rows || []).length;
        }
      }
      return n;
    },
    async carregar(studentId) {
      const h = await this.headers();
      const [rp, rs] = await Promise.all([
        fetch(SUPA_URL + "/rest/v1/programs?select=data&student_id=eq." + encodeURIComponent(studentId) + "&limit=50", { headers: h }),
        fetch(SUPA_URL + "/rest/v1/sessions?select=id,data&student_id=eq." + encodeURIComponent(studentId) + "&limit=1000", { headers: h })
      ]);
      const progs = rp.ok ? (await rp.json()).map((x) => x && x.data).filter(Boolean) : [];
      const sess = rs.ok ? (await rs.json()).filter((x) => x && x.data).map((x) => ({ ...x.data, __id: x.id })) : [];
      return { progs, sess };
    }
  };
  const hojeISO = () => {
    const d = /* @__PURE__ */ new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };
  const diasAtras = (iso) => {
    if (!iso) return 9999;
    return Math.floor((/* @__PURE__ */ new Date(hojeISO() + "T12:00:00") - /* @__PURE__ */ new Date(iso + "T12:00:00")) / 864e5);
  };
  const fmtData = (iso) => iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) : "";
  const Caixa = ({ children, style }) => /* @__PURE__ */ React.createElement("div", { style: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 14, marginBottom: 12, ...style || {} } }, children);
  const Stat = ({ valor, rotulo, sub, cor }) => /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 92, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "10px 8px", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: cor || "#e11d48" } }, valor), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginTop: 2 } }, rotulo), sub && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", marginTop: 2 } }, sub));
  const Painel = ({ st }) => {
    const [dados, setDados] = useState(null);
    const [erro, setErro] = useState(false);
    useEffect(() => {
      let vivo = true;
      if (!st || !st.id || !supa()) {
        setErro(true);
        return;
      }
      api.carregar(st.id).then((d) => {
        if (vivo) setDados(d);
      }).catch(() => {
        if (vivo) setErro(true);
      });
      return () => {
        vivo = false;
      };
    }, [st && st.id]);
    if (erro) return /* @__PURE__ */ React.createElement(Caixa, { style: { textAlign: "center", color: "#94a3b8" } }, "Não foi possível carregar o cardio agora.");
    if (!dados) return /* @__PURE__ */ React.createElement(Caixa, { style: { textAlign: "center", color: "#94a3b8" } }, "Carregando cardio...");
    const prog = dados.progs.filter((p) => temErgo(p.cardio)).sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""))[0];
    if (!prog) return /* @__PURE__ */ React.createElement(Caixa, { style: { textAlign: "center", padding: 28 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 28 } }, "❤️"), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, color: "#0f172a", marginTop: 6 } }, "Nenhum cardio configurado"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 4, lineHeight: 1.5 } }, "Abra o programa do aluno, toque em Editar e escolha o ergômetro de cada treino no card Cardio · 24 semanas."));
    const cfg = prog.cardio;
    const nomeT = (t) => (prog.nomesTreinos && prog.nomesTreinos[t] || "").trim() || NOMES[t] || t;
    const treinos = Object.keys(cfg.treinos).filter((t) => cfg.treinos[t] && ERGOS[cfg.treinos[t].ergo]);
    const doProg = dados.sess.filter((s) => s.programId === prog.id);
    const musc = doProg.filter((s) => s.source !== "cardio_separado" && s.source !== "atividade_extra" && s.treinoKey);
    const sep = doProg.filter((s) => s.source === "cardio_separado").sort((a, b) => (b.createdAt || b.date || "").localeCompare(a.createdAt || a.date || ""));
    const hoje = hojeISO();
    const linhas = treinos.map((t) => {
      const separado = cfg.treinos[t].onde === "separado";
      const lista = separado || sep.some((s) => s.cardioTreinoKey === t) ? sep.filter((s) => s.cardioTreinoKey === t) : musc.filter((s) => s.treinoKey === t);
      const ordenada = [...lista].sort((a, b) => (a.createdAt || a.date || "").localeCompare(b.createdAt || b.date || ""));
      const semana = ordenada.filter((s) => s.date !== hoje).length + 1;
      const ultima = ordenada.length ? ordenada[ordenada.length - 1].date : null;
      return { t, separado, ergo: cfg.treinos[t].ergo, semana: Math.min(24, semana), info: semanaInfo(cfg, t, semana), ultima, ordenada };
    });
    let min7 = 0;
    linhas.forEach((l) => {
      l.ordenada.forEach((s, i) => {
        if (diasAtras(s.date) > 6) return;
        if (s.source === "cardio_separado") min7 += s.cardio && (s.cardio.min || s.cardio.total) || 0;
        else {
          const inf = semanaInfo(cfg, l.t, i + 1);
          min7 += inf ? inf.total : 0;
        }
      });
    });
    const treinosSep = linhas;
    const feitos28 = sep.filter((s) => diasAtras(s.date) <= 27).length;
    const esperado28 = treinosSep.length * 4;
    const adesao = esperado28 ? Math.min(100, Math.round(feitos28 / esperado28 * 100)) : null;
    const corAdesao = adesao === null ? "#94a3b8" : adesao >= 75 ? "#16a34a" : adesao >= 50 ? "#d97706" : "#dc2626";
    const reteste = linhas.some((l) => RETESTE.includes(l.semana));
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Caixa, { style: { padding: "12px 14px", border: "1.5px solid #fecdd3" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#be123c", textTransform: "uppercase", letterSpacing: 0.3 } }, "Cardio · 24 semanas"), /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, color: "#0f172a", fontSize: 15, marginTop: 2 } }, prog.titulo || "Programa"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11.5, color: "#64748b", marginTop: 2 } }, "Nível ", cfg.nivel === "iniciante" ? "iniciante" : "padrão", cfg.soPSE ? " · só PSE (betabloqueador)" : "", cfg.quedas ? " · risco de quedas" : "")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(Stat, { valor: min7 + " min", rotulo: "Últimos 7 dias", sub: "meta de 150 min/sem.", cor: min7 >= 150 ? "#16a34a" : "#e11d48" }), /* @__PURE__ */ React.createElement(Stat, { valor: adesao === null ? "—" : adesao + "%", rotulo: "Adesão 4 sem.", sub: esperado28 ? feitos28 + " de " + esperado28 + " cardios" : "sem cardio", cor: corAdesao })), reteste && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#7e22ce", background: "#fdf4ff", border: "1.5px solid #e9d5ff", borderRadius: 10, padding: "9px 12px", marginBottom: 12 } }, "Semana de reteste em pelo menos um treino: agende a reavaliação cardio."), /* @__PURE__ */ React.createElement(Caixa, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 8 } }, "Por treino"), linhas.map((l, i) => /* @__PURE__ */ React.createElement("div", { key: l.t, style: { paddingTop: i ? 10 : 0, marginTop: i ? 10 : 0, borderTop: i ? "1px solid #f1f5f9" : "none" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 13.5, color: "#0f172a" } }, nomeT(l.t), " · ", ERGOS[l.ergo].icone, " ", ERGOS[l.ergo].nome), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, fontWeight: 700, color: l.separado ? "#be123c" : "#475569", background: l.separado ? "#fff1f2" : "#f1f5f9", borderRadius: 99, padding: "3px 8px", whiteSpace: "nowrap" } }, l.separado ? "Outro horário" : "Fim do treino")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#475569", marginTop: 4 } }, "Semana ", l.semana, " de 24 · ", fase(l.semana), intKey(cfg) === l.t ? " · intervalado" : ""), /* @__PURE__ */ React.createElement("div", { style: { height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginTop: 5 } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: Math.round((l.semana - 1) / 24 * 100) + "%", background: "#e11d48", borderRadius: 99 } })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#0f172a", marginTop: 6 } }, /* @__PURE__ */ React.createElement("b", null, "Próximo:"), " ", l.info ? l.info.texto.indexOf("contínuo") >= 0 ? l.info.texto : l.info.texto + " · " + l.info.total + " min" : "—"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 2 } }, l.ultima ? "Última vez em " + fmtData(l.ultima) + (diasAtras(l.ultima) > 10 ? " · há " + diasAtras(l.ultima) + " dias" : "") : "Ainda não realizado")))), treinosSep.length > 0 && /* @__PURE__ */ React.createElement(Caixa, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 8 } }, "Cardios realizados"), sep.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#94a3b8" } }, "Nenhum cardio concluído ainda."), sep.slice(0, 10).map((s, i) => {
      const eg = ERGOS[s.cardio && s.cardio.ergo || ""];
      return /* @__PURE__ */ React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", gap: 8, padding: "7px 0", borderTop: i ? "1px solid #f1f5f9" : "none" } }, /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700, color: "#0f172a" } }, nomeT(s.cardioTreinoKey), eg ? " · " + eg.icone + " " + eg.nome : "", s.momento === "pos_treino" ? " · pós-treino" : ""), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#64748b" } }, s.cardio ? "Sem. " + s.cardio.semana + " · " + s.cardio.texto : "Cardio concluído")), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right", flexShrink: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569" } }, fmtData(s.date)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, s.cardio && s.cardio.total ? s.cardio.total + " min" : "")));
    })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10.5, color: "#94a3b8", lineHeight: 1.5, padding: "0 4px 8px" } }, "Cada cardio conta quando o aluno conclui o cardio no app, seja logo após a musculação ou em outro horário."));
  };
  const ESF = { 1: "Leve", 2: "Leve a moderado", 3: "Moderado", 4: "Moderado a intenso", 5: "Intenso" };
  const num = (v) => {
    const n = parseFloat(String(v || "").replace(",", "."));
    return isNaN(n) ? null : n;
  };
  const Historico = ({ st }) => {
    const [dados, setDados] = useState(null);
    const [erro, setErro] = useState(false);
    const [filtro, setFiltro] = useState("tudo");
    const [confirmar, setConfirmar] = useState(null);
    const [excluindo, setExcluindo] = useState(false);
    const [aviso, setAviso] = useState("");
    const excluirItem = async (it, ck) => {
      setExcluindo(true);
      setAviso("");
      try {
        const tabela = it.t === "r" ? "refeicoes_registro" : it.t === "g" ? "gasto_atividades" : "sessions";
        const n = await api.excluir(tabela, [it.s.__id]);
        if (!n) {
          setAviso("Não foi possível excluir. O Supabase não liberou a exclusão desse registro.");
        } else {
          let saiuCk = [];
          if (it.t === "m" && ck && ck.__id && ck.source !== "professor_presencial") {
            const n2 = await api.excluir("checkins", [ck.__id]);
            if (n2) saiuCk = [ck.__id];
          }
          setDados((d) => ({ ...d, sess: d.sess.filter((x) => x.__id !== it.s.__id), checks: d.checks.filter((x) => !saiuCk.includes(x.__id)), refeicoes: (d.refeicoes || []).filter((x) => x.__id !== it.s.__id), atividades: (d.atividades || []).filter((x) => x.__id !== it.s.__id) }));
          setAviso({ m: "Treino excluído. O déficit dele também saiu da aba Calorias.", c: "Cardio excluído. O déficit dele também saiu da aba Calorias.", g: "Atividade excluída. O gasto dela saiu da aba Calorias.", a: "Atividade extra excluída.", r: "Refeição excluída. As calorias dela saíram do dia." }[it.t] || "Registro excluído.");
        }
      } catch (e) {
        setAviso("Erro ao excluir. Tente novamente.");
      }
      setExcluindo(false);
      setConfirmar(null);
    };
    const BotaoExcluir = ({ it, ck }) => {
      const k = it.s.__id;
      if (!k) return null;
      if (confirmar !== k) return /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setConfirmar(k), style: { background: "transparent", border: "none", color: "#94a3b8", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", padding: "2px 0" } }, "Excluir");
      return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, padding: "7px 9px" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "#991b1b", fontWeight: 700 } }, "Excluir este registro do aluno?"), /* @__PURE__ */ React.createElement("button", { type: "button", disabled: excluindo, onClick: () => excluirItem(it, ck), style: { background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, padding: "6px 11px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" } }, excluindo ? "Excluindo..." : "Sim, excluir"), /* @__PURE__ */ React.createElement("button", { type: "button", disabled: excluindo, onClick: () => setConfirmar(null), style: { background: "#fff", color: "#475569", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 11px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, "Cancelar"));
    };
    useEffect(() => {
      let vivo = true;
      if (!st || !st.id || !supa()) {
        setErro(true);
        return;
      }
      (async () => {
        try {
          const h = await api.headers();
          const [d, rc, rr, ra] = await Promise.all([
            api.carregar(st.id),
            fetch(SUPA_URL + "/rest/v1/checkins?select=id,data&student_id=eq." + encodeURIComponent(st.id) + "&type=eq.pos_treino&limit=500", { headers: h }),
            fetch(SUPA_URL + "/rest/v1/refeicoes_registro?select=id,data&student_id=eq." + encodeURIComponent(st.id) + "&order=created_at.desc&limit=300", { headers: h }).catch(() => null),
            fetch(SUPA_URL + "/rest/v1/gasto_atividades?select=id,data&student_id=eq." + encodeURIComponent(st.id) + "&limit=300", { headers: h }).catch(() => null)
          ]);
          const linhasDeRows = async (resp) => resp && resp.ok ? (await resp.json()).filter((x) => x && x.data).map((x) => ({ ...x.data, __id: x.id })) : [];
          const [refeicoes, atividades] = await Promise.all([linhasDeRows(rr), linhasDeRows(ra)]);
          const checks = rc.ok ? (await rc.json()).filter((x) => x && x.data).map((x) => ({ ...x.data, __id: x.id })) : [];
          const ids = /* @__PURE__ */ new Set();
          d.sess.forEach((s) => {
            if (s.exercicios && s.exercicios.length) return;
            const p = d.progs.find((x) => x.id === s.programId);
            const pr = p && p.prescricao && p.prescricao[s.blocoKey] && p.prescricao[s.blocoKey][s.treinoKey];
            if (!pr) return;
            ["inicial", "principal", "final"].forEach((mk) => (pr[mk] || []).forEach((it) => {
              if (it && it.exId && !it.isCognitivo && it.exId !== "cognitivo") ids.add(it.exId);
            }));
          });
          let nomesEx = {};
          if (ids.size) {
            try {
              const lista = [...ids].map((x) => '"' + String(x).replace(/"/g, "") + '"').join(",");
              const re = await fetch(SUPA_URL + "/rest/v1/exercises?select=id,nome&id=in.(" + encodeURIComponent(lista) + ")", { headers: h });
              if (re.ok) (await re.json()).forEach((e) => {
                nomesEx[e.id] = e.nome;
              });
            } catch (e2) {
            }
          }
          if (vivo) setDados({ ...d, checks, nomesEx, refeicoes, atividades });
        } catch (e) {
          if (vivo) setErro(true);
        }
      })();
      return () => {
        vivo = false;
      };
    }, [st && st.id]);
    if (erro) return /* @__PURE__ */ React.createElement(Caixa, { style: { textAlign: "center", color: "#94a3b8" } }, "Não foi possível carregar o histórico agora.");
    if (!dados) return /* @__PURE__ */ React.createElement(Caixa, { style: { textAlign: "center", color: "#94a3b8" } }, "Carregando histórico...");
    const progNome = {};
    dados.progs.forEach((p) => {
      progNome[p.id] = p;
    });
    const nomeT = (s, t) => {
      const p = progNome[s.programId];
      return (p && p.nomesTreinos && p.nomesTreinos[t] || "").trim() || NOMES[t] || t || "Treino";
    };
    const musc = dados.sess.filter((s) => s.treinoKey && s.source !== "cardio_separado" && s.source !== "atividade_extra");
    const extrasSess = dados.sess.filter((s) => s.source === "atividade_extra");
    const ativs = dados.atividades || [];
    const refs = dados.refeicoes || [];
    const cardios = dados.sess.filter((s) => s.source === "cardio_separado");
    const musc30 = musc.filter((s) => diasAtras(s.date) <= 29).length, card30 = cardios.filter((s) => diasAtras(s.date) <= 29).length;
    const ordMusc = [...musc].sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.createdAt || "").localeCompare(b.createdAt || ""));
    const antes = (s, exId) => {
      const i = ordMusc.indexOf(s);
      for (let j = i - 1; j >= 0; j--) {
        const o = ordMusc[j];
        const l = (o.exercicios || []).find((x) => x.exId === exId && x.carga) || Object.values(o.cargas || {}).find((x) => x.exId === exId && x.carga);
        if (l) return l.carga;
      }
      return null;
    };
    const linhasDe = (s) => {
      if (s.exercicios && s.exercicios.length) return s.exercicios;
      const p = progNome[s.programId];
      const pr = p && p.prescricao && p.prescricao[s.blocoKey] && p.prescricao[s.blocoKey][s.treinoKey];
      if (!pr) return Object.values(s.cargas || {}).map((c) => ({ exId: c.exId, nome: c.nome, carga: c.carga }));
      const out = [];
      ["inicial", "principal", "final"].forEach((mk) => (pr[mk] || []).forEach((it, idx) => {
        if (!it || it.isCognitivo || it.exId === "cognitivo") return;
        const c = (s.cargas || {})[mk + "-" + idx];
        const nomePers = p.nomesExercicios && (p.nomesExercicios[it.exId] || "").trim();
        out.push({ exId: it.exId, nome: nomePers || c && c.nome || (dados.nomesEx || {})[it.exId] || "Exercício", series: it.series || "", reps: it.reps || "", carga: c ? c.carga : "" });
      }));
      return out;
    };
    const ckDe = (s) => dados.checks.find((k) => k.date === s.date && k.treinoKey === s.treinoKey) || dados.checks.find((k) => k.date === s.date && k.source === "professor_presencial");
    const itens = [
      ...filtro === "tudo" || filtro === "musc" ? musc.map((s) => ({ t: "m", s })) : [],
      ...filtro === "tudo" || filtro === "cardio" ? cardios.map((s) => ({ t: "c", s })) : [],
      ...filtro === "tudo" || filtro === "ativ" ? [...extrasSess.map((s) => ({ t: "a", s })), ...ativs.map((s) => ({ t: "g", s }))] : [],
      ...filtro === "tudo" || filtro === "alim" ? refs.map((s) => ({ t: "r", s })) : []
    ].sort((a, b) => (b.s.date || "").localeCompare(a.s.date || "") || (b.s.createdAt || "").localeCompare(a.s.createdAt || "")).slice(0, 60);
    const chip = (k, l) => /* @__PURE__ */ React.createElement("button", { key: k, type: "button", onClick: () => setFiltro(k), style: { background: filtro === k ? "#0f172a" : "#f1f5f9", color: filtro === k ? "#fff" : "#475569", border: "none", borderRadius: 99, padding: "7px 12px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" } }, l);
    const th = { padding: "5px 4px", textAlign: "left", color: "#94a3b8", fontSize: 10.5, textTransform: "uppercase", fontWeight: 800 };
    const td = { padding: "5px 4px", textAlign: "left", borderTop: "1px solid #f1f5f9", fontSize: 12, color: "#0f172a" };
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement(Stat, { valor: musc30, rotulo: "Treinos", sub: "últimos 30 dias", cor: "#FF5603" }), /* @__PURE__ */ React.createElement(Stat, { valor: card30, rotulo: "Cardios", sub: "últimos 30 dias", cor: "#e11d48" })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" } }, chip("tudo", "Tudo"), chip("musc", "Musculação"), chip("cardio", "Cardio"), chip("ativ", "Atividades"), chip("alim", "Alimentação")), aviso && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: /exclu[ií]d/.test(aviso) ? "#15803d" : "#b91c1c", background: /exclu[ií]d/.test(aviso) ? "#f0fdf4" : "#fef2f2", border: "1px solid " + (/exclu[ií]d/.test(aviso) ? "#bbf7d0" : "#fecaca"), borderRadius: 10, padding: "8px 11px", marginBottom: 10 } }, aviso), itens.length === 0 && /* @__PURE__ */ React.createElement(Caixa, { style: { textAlign: "center", color: "#94a3b8" } }, "Nenhum registro ainda."), itens.map((it, i) => {
      const s = it.s;
      if (it.t === "r") {
        const tipoNome = { cafe: "Café da manhã", lanche_manha: "Lanche da manhã", almoco: "Almoço", lanche_tarde: "Lanche da tarde", jantar: "Jantar", ceia: "Ceia", extra: "Extras" }[s.tipo] || "Refeição";
        const kc = s.totais && s.totais.kcal;
        const nomes = (s.itens || []).map((x) => x && x.nome).filter(Boolean);
        return /* @__PURE__ */ React.createElement(Caixa, { key: i, style: { border: "1.5px solid #bbf7d0", padding: "11px 13px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 13.5 } }, "🍽️ ", fmtData(s.date), " · ", tipoNome, s.hora ? " · " + s.hora : ""), confirmar !== s.__id && /* @__PURE__ */ React.createElement(BotaoExcluir, { it })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2 } }, kc ? "cerca de " + kc + " kcal" : "", nomes.length ? (kc ? " · " : "") + nomes.slice(0, 3).join(", ") + (nomes.length > 3 ? " e mais " + (nomes.length - 3) : "") : ""), confirmar === s.__id && /* @__PURE__ */ React.createElement(BotaoExcluir, { it }));
      }
      if (it.t === "g" || it.t === "a") {
        const tit = it.t === "g" ? (s.rotulo || s.tipo || "Atividade") + (s.minutos ? " · " + s.minutos + " min" : "") : "Atividade extra · " + (s.completedEx || 0) + " de " + (s.totalEx || 0) + " exercícios";
        const det2 = it.t === "g" ? [s.kcal ? "cerca de " + s.kcal + " kcal" : null, s.fonte === "relogio" ? "pelo relógio" : null, s.intensidade ? "intensidade " + s.intensidade : null].filter(Boolean).join(" · ") : "";
        return /* @__PURE__ */ React.createElement(Caixa, { key: i, style: { border: "1.5px solid #c7d2fe", padding: "11px 13px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 13.5 } }, "🏃 ", fmtData(s.date), " · ", tit), confirmar !== s.__id && /* @__PURE__ */ React.createElement(BotaoExcluir, { it })), det2 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2 } }, det2), confirmar === s.__id && /* @__PURE__ */ React.createElement(BotaoExcluir, { it }));
      }
      if (it.t === "c") {
        const eg = ERGOS[s.cardioErgo || s.cardio && s.cardio.ergo];
        const parcial = s.cardio && s.cardio.fracao != null && s.cardio.fracao < 0.95;
        return /* @__PURE__ */ React.createElement(Caixa, { key: i, style: { border: "1.5px solid #fecdd3", padding: "11px 13px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 13.5 } }, "❤️ ", fmtData(s.date), " · Cardio", eg ? " · " + eg.icone + " " + eg.nome : "", s.momento === "pos_treino" ? " · pós-treino" : ""), confirmar !== s.__id && /* @__PURE__ */ React.createElement(BotaoExcluir, { it })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2 } }, [s.cardio && s.cardio.texto, s.cardio && s.cardio.semana ? "semana " + s.cardio.semana : null, parcial ? s.cardioMin + " min feitos · parcial" : "completo", s.cardioKcal ? (s.cardioKcalFonte === "relogio" ? s.cardioKcal + " kcal (relógio)" : "cerca de " + s.cardioKcal + " kcal") : null, s.cardioFcMedia ? "FC média " + s.cardioFcMedia : null].filter(Boolean).join(" · ")), confirmar === s.__id && /* @__PURE__ */ React.createElement(BotaoExcluir, { it }));
      }
      const ck = ckDe(s);
      const linhas = linhasDe(s);
      const det = [ck && ck.duracao ? ck.duracao + " min" : null, ck && ck.esforco ? ESF[ck.esforco] : null, ck && ck.musculacaoKcal ? (ck.musculacaoKcalFonte === "relogio" ? ck.musculacaoKcal + " kcal (relógio)" : "cerca de " + ck.musculacaoKcal + " kcal") : null, ck && ck.cardioMin ? "cardio " + ck.cardioMin + " min" + (ck.cardioKcal ? ", " + ck.cardioKcal + " kcal" + (ck.cardioKcalFonte === "relogio" ? " (relógio)" : "") : "") : null, s.totalEx ? s.completedEx + " de " + s.totalEx + " exercícios" : null, ck && ck.dor && ck.dor !== "nenhuma" ? "dor: " + ck.dor : null].filter(Boolean).join(" · ");
      return /* @__PURE__ */ React.createElement(Caixa, { key: i, style: { border: "1.5px solid #fed7aa", padding: "11px 13px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 800, fontSize: 13.5 } }, "💪 ", fmtData(s.date), " · ", nomeT(s, s.treinoKey)), confirmar !== s.__id && /* @__PURE__ */ React.createElement(BotaoExcluir, { it, ck })), det && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2 } }, det), confirmar === s.__id && /* @__PURE__ */ React.createElement(BotaoExcluir, { it, ck }), linhas.length > 0 && /* @__PURE__ */ React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", marginTop: 7 } }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { style: th }, "Exercício"), /* @__PURE__ */ React.createElement("th", { style: th }, "S x R"), /* @__PURE__ */ React.createElement("th", { style: th }, "Carga"), /* @__PURE__ */ React.createElement("th", { style: th }, "Antes"))), /* @__PURE__ */ React.createElement("tbody", null, linhas.map((l, j) => {
        const ant = l.exId ? antes(s, l.exId) : null;
        const a = num(ant), c = num(l.carga);
        const comp = a == null || c == null ? null : c > a ? ["↑ " + ant, "#16a34a"] : c < a ? ["↓ " + ant, "#dc2626"] : ["= " + ant, "#64748b"];
        return /* @__PURE__ */ React.createElement("tr", { key: j }, /* @__PURE__ */ React.createElement("td", { style: { ...td, color: l.feito === false ? "#94a3b8" : "#0f172a", textDecoration: l.feito === false ? "line-through" : "none" } }, l.nome), /* @__PURE__ */ React.createElement("td", { style: td }, l.feito === false ? "—" : (l.series || "") && (l.reps || "") ? l.series + "x" + l.reps : "—"), /* @__PURE__ */ React.createElement("td", { style: { ...td, fontWeight: 800 } }, l.carga ? l.carga : "—"), /* @__PURE__ */ React.createElement("td", { style: { ...td, color: comp ? comp[1] : "#cbd5e1", fontWeight: 700 } }, comp ? comp[0] : "—"));
      }))));
    }));
  };
  window.LongevusCardio = { Painel, Historico };
})();
