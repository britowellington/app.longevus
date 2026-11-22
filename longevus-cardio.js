// Longevus · Cardio e Histórico (painel do professor). Gerado a partir de JSX, sem Babel.
"use strict";
(function () {
    const { useState, useEffect } = React;
    const SUPA_URL = "https://jpduxfbigcdxmtcozqpp.supabase.co";
    const SUPA_KEY = "sb_publishable_VZSgcxu5ps3eR9UAjuRr4Q_B65WTx_h";
    const supa = () => window.__LV_SUPA;
    // ── Mesmas regras do longevus-programa.html e do aluno.html ──
    const ERGOS = { esteira: { nome: "Esteira", icone: "🚶" }, bike: { nome: "Bike", icone: "🚴" }, eliptico: { nome: "Elíptico", icone: "🏃" } };
    const CONT = [10, 12, 15, 10, 15, 18, 20, 12, 20, 20, 20, 15, 20, 20, 20, 15, 20, 22, 22, 15, 25, 25, 25, 15];
    const INT = { 10: [4, 60, 120], 11: [5, 60, 120], 13: [4, 120, 120], 14: [5, 120, 120], 15: [5, 120, 90], 17: [6, 30, 60], 18: [8, 30, 60], 19: [6, 45, 90], 21: [8, 45, 90], 22: [6, 60, 120], 23: [7, 60, 120] };
    const SEP_CONT = [20, 22, 25, 18, 25, 28, 30, 20, 30, 30, 32, 25, 32, 35, 35, 25, 35, 38, 40, 25, 40, 40, 40, 25];
    const SEP_INT = { 10: [6, 60, 120], 11: [8, 60, 120], 13: [5, 120, 120], 14: [6, 120, 120], 15: [6, 180, 120], 17: [8, 30, 60], 18: [10, 30, 60], 19: [8, 45, 90], 21: [10, 45, 90], 22: [8, 60, 120], 23: [9, 60, 120] };
    const RETESTE = [8, 16, 24];
    const NOMES = { A: "Treino A", B: "Treino B", C: "Treino C", D: "Treino D", FB: "Full Body", FBA: "Full Body A", FBB: "Full Body B", FBC: "Full Body C", FBD: "Full Body D", FBE: "Full Body E", SUP: "Superior", INF: "Inferior", PUSH: "Push", PULL: "Pull", LEGS: "Legs", PEITO: "Peito", COSTAS: "Costas", PERNA: "Perna", OMBRO: "Ombro", EMP: "Empurrar", PUX: "Puxar" };
    const fase = (s) => s <= 8 ? "Base" : (s <= 16 ? "Desenvolvimento" : "Consolidação");
    const fmtSeg = (s) => s < 60 ? s + " s" : (s % 60 === 0 ? (s / 60) + " min" : Math.floor(s / 60) + " min " + (s % 60) + " s");
    const temErgo = (cfg) => !!(cfg && cfg.treinos && Object.keys(cfg.treinos).some((k) => cfg.treinos[k] && ERGOS[cfg.treinos[k].ergo]));
    const intKey = (cfg) => {
        if (cfg.intervalado && cfg.treinos[cfg.intervalado] && ERGOS[cfg.treinos[cfg.intervalado].ergo])
            return cfg.intervalado;
        return Object.keys(cfg.treinos).find((k) => cfg.treinos[k] && ERGOS[cfg.treinos[k].ergo]) || null;
    };
    const semanaInfo = (cfg, t, semana) => {
        const tr = cfg.treinos[t];
        if (!tr || !ERGOS[tr.ergo])
            return null;
        const s = Math.max(1, Math.min(24, semana || 1));
        const sep = tr.onde === "separado";
        const tabI = sep ? SEP_INT : INT, tabC = sep ? SEP_CONT : CONT;
        const aq = sep ? 300 : 180, vc = sep ? 300 : 120;
        if (intKey(cfg) === t && tabI[s]) {
            const d = tabI[s];
            return { semana: s, texto: d[0] + "x (" + fmtSeg(d[1]) + " forte / " + fmtSeg(d[2]) + " leve)", total: Math.round((aq + d[0] * d[1] + (d[0] - 1) * d[2] + vc) / 60) };
        }
        let min = tabC[s - 1];
        if (cfg.nivel === "iniciante" && s <= 8)
            min = Math.max(sep ? 12 : 7, Math.round(min * 0.7));
        return { semana: s, texto: min + " min contínuo", total: min };
    };
    const api = {
        async headers() {
            const r = await supa().auth.getSession();
            const token = (r && r.data && r.data.session && r.data.session.access_token) || SUPA_KEY;
            return { "apikey": SUPA_KEY, "Authorization": "Bearer " + token };
        },
        async carregar(studentId) {
            const h = await this.headers();
            const [rp, rs] = await Promise.all([
                fetch(SUPA_URL + "/rest/v1/programs?select=data&student_id=eq." + encodeURIComponent(studentId) + "&limit=50", { headers: h }),
                fetch(SUPA_URL + "/rest/v1/sessions?select=data&student_id=eq." + encodeURIComponent(studentId) + "&limit=1000", { headers: h })
            ]);
            const progs = rp.ok ? (await rp.json()).map((x) => x && x.data).filter(Boolean) : [];
            const sess = rs.ok ? (await rs.json()).map((x) => x && x.data).filter(Boolean) : [];
            return { progs, sess };
        }
    };
    const hojeISO = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
    const diasAtras = (iso) => { if (!iso)
        return 9999; return Math.floor((new Date(hojeISO() + "T12:00:00") - new Date(iso + "T12:00:00")) / 86400000); };
    const fmtData = (iso) => iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) : "";
    const Caixa = ({ children, style }) => (React.createElement("div", { style: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 14, marginBottom: 12, ...(style || {}) } }, children));
    const Stat = ({ valor, rotulo, sub, cor }) => (React.createElement("div", { style: { flex: 1, minWidth: 92, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "10px 8px", textAlign: "center" } },
        React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: cor || "#e11d48" } }, valor),
        React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginTop: 2 } }, rotulo),
        sub && React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", marginTop: 2 } }, sub)));
    const Painel = ({ st }) => {
        const [dados, setDados] = useState(null);
        const [erro, setErro] = useState(false);
        useEffect(() => {
            let vivo = true;
            if (!st || !st.id || !supa()) {
                setErro(true);
                return;
            }
            api.carregar(st.id).then((d) => { if (vivo)
                setDados(d); }).catch(() => { if (vivo)
                setErro(true); });
            return () => { vivo = false; };
        }, [st && st.id]);
        if (erro)
            return React.createElement(Caixa, { style: { textAlign: "center", color: "#94a3b8" } }, "N\u00E3o foi poss\u00EDvel carregar o cardio agora.");
        if (!dados)
            return React.createElement(Caixa, { style: { textAlign: "center", color: "#94a3b8" } }, "Carregando cardio...");
        const prog = dados.progs.filter((p) => temErgo(p.cardio)).sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""))[0];
        if (!prog)
            return (React.createElement(Caixa, { style: { textAlign: "center", padding: 28 } },
                React.createElement("div", { style: { fontSize: 28 } }, "\u2764\uFE0F"),
                React.createElement("div", { style: { fontWeight: 800, color: "#0f172a", marginTop: 6 } }, "Nenhum cardio configurado"),
                React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 4, lineHeight: 1.5 } }, "Abra o programa do aluno, toque em Editar e escolha o erg\u00F4metro de cada treino no card Cardio \u00B7 24 semanas.")));
        const cfg = prog.cardio;
        const nomeT = (t) => ((prog.nomesTreinos && prog.nomesTreinos[t]) || "").trim() || NOMES[t] || t;
        const treinos = Object.keys(cfg.treinos).filter((t) => cfg.treinos[t] && ERGOS[cfg.treinos[t].ergo]);
        const doProg = dados.sess.filter((s) => s.programId === prog.id);
        const musc = doProg.filter((s) => s.source !== "cardio_separado" && s.source !== "atividade_extra" && s.treinoKey);
        const sep = doProg.filter((s) => s.source === "cardio_separado").sort((a, b) => (b.createdAt || b.date || "").localeCompare(a.createdAt || a.date || ""));
        const hoje = hojeISO();
        // Uma linha por treino: semana atual, próximo cardio e última vez feito
        const linhas = treinos.map((t) => {
            const separado = cfg.treinos[t].onde === "separado";
            // Desde o registro em etapa própria, todo cardio vira sessão de cardio. Treinos antigos (antes disso) contam pela musculação.
            const lista = separado || sep.some((s) => s.cardioTreinoKey === t) ? sep.filter((s) => s.cardioTreinoKey === t) : musc.filter((s) => s.treinoKey === t);
            const ordenada = [...lista].sort((a, b) => (a.createdAt || a.date || "").localeCompare(b.createdAt || b.date || ""));
            const semana = ordenada.filter((s) => s.date !== hoje).length + 1;
            const ultima = ordenada.length ? ordenada[ordenada.length - 1].date : null;
            return { t, separado, ergo: cfg.treinos[t].ergo, semana: Math.min(24, semana), info: semanaInfo(cfg, t, semana), ultima, ordenada };
        });
        // Minutos nos últimos 7 dias (cardio final conta junto com o treino concluído)
        let min7 = 0;
        linhas.forEach((l) => {
            l.ordenada.forEach((s, i) => {
                if (diasAtras(s.date) > 6)
                    return;
                if (s.source === "cardio_separado")
                    min7 += (s.cardio && (s.cardio.min || s.cardio.total)) || 0;
                else {
                    const inf = semanaInfo(cfg, l.t, i + 1);
                    min7 += inf ? inf.total : 0;
                }
            });
        });
        // Adesão do cardio em outro horário nas últimas 4 semanas
        const treinosSep = linhas;
        const feitos28 = sep.filter((s) => diasAtras(s.date) <= 27).length;
        const esperado28 = treinosSep.length * 4;
        const adesao = esperado28 ? Math.min(100, Math.round(feitos28 / esperado28 * 100)) : null;
        const corAdesao = adesao === null ? "#94a3b8" : (adesao >= 75 ? "#16a34a" : (adesao >= 50 ? "#d97706" : "#dc2626"));
        const reteste = linhas.some((l) => RETESTE.includes(l.semana));
        return (React.createElement("div", null,
            React.createElement(Caixa, { style: { padding: "12px 14px", border: "1.5px solid #fecdd3" } },
                React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#be123c", textTransform: "uppercase", letterSpacing: 0.3 } }, "Cardio \u00B7 24 semanas"),
                React.createElement("div", { style: { fontWeight: 800, color: "#0f172a", fontSize: 15, marginTop: 2 } }, prog.titulo || "Programa"),
                React.createElement("div", { style: { fontSize: 11.5, color: "#64748b", marginTop: 2 } },
                    "N\u00EDvel ",
                    cfg.nivel === "iniciante" ? "iniciante" : "padrão",
                    cfg.soPSE ? " · só PSE (betabloqueador)" : "",
                    cfg.quedas ? " · risco de quedas" : "")),
            React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" } },
                React.createElement(Stat, { valor: min7 + " min", rotulo: "\u00DAltimos 7 dias", sub: "meta de 150 min/sem.", cor: min7 >= 150 ? "#16a34a" : "#e11d48" }),
                React.createElement(Stat, { valor: adesao === null ? "—" : adesao + "%", rotulo: "Ades\u00E3o 4 sem.", sub: esperado28 ? (feitos28 + " de " + esperado28 + " cardios") : "sem cardio", cor: corAdesao })),
            reteste && React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#7e22ce", background: "#fdf4ff", border: "1.5px solid #e9d5ff", borderRadius: 10, padding: "9px 12px", marginBottom: 12 } }, "Semana de reteste em pelo menos um treino: agende a reavalia\u00E7\u00E3o cardio."),
            React.createElement(Caixa, null,
                React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 8 } }, "Por treino"),
                linhas.map((l, i) => (React.createElement("div", { key: l.t, style: { paddingTop: i ? 10 : 0, marginTop: i ? 10 : 0, borderTop: i ? "1px solid #f1f5f9" : "none" } },
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } },
                        React.createElement("div", { style: { fontWeight: 800, fontSize: 13.5, color: "#0f172a" } },
                            nomeT(l.t),
                            " \u00B7 ",
                            ERGOS[l.ergo].icone,
                            " ",
                            ERGOS[l.ergo].nome),
                        React.createElement("div", { style: { fontSize: 10.5, fontWeight: 700, color: l.separado ? "#be123c" : "#475569", background: l.separado ? "#fff1f2" : "#f1f5f9", borderRadius: 99, padding: "3px 8px", whiteSpace: "nowrap" } }, l.separado ? "Outro horário" : "Fim do treino")),
                    React.createElement("div", { style: { fontSize: 12, color: "#475569", marginTop: 4 } },
                        "Semana ",
                        l.semana,
                        " de 24 \u00B7 ",
                        fase(l.semana),
                        intKey(cfg) === l.t ? " · intervalado" : ""),
                    React.createElement("div", { style: { height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden", marginTop: 5 } },
                        React.createElement("div", { style: { height: "100%", width: Math.round((l.semana - 1) / 24 * 100) + "%", background: "#e11d48", borderRadius: 99 } })),
                    React.createElement("div", { style: { fontSize: 12, color: "#0f172a", marginTop: 6 } },
                        React.createElement("b", null, "Pr\u00F3ximo:"),
                        " ",
                        l.info ? (l.info.texto.indexOf("contínuo") >= 0 ? l.info.texto : l.info.texto + " · " + l.info.total + " min") : "—"),
                    React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 2 } }, l.ultima ? ("Última vez em " + fmtData(l.ultima) + (diasAtras(l.ultima) > 10 ? " · há " + diasAtras(l.ultima) + " dias" : "")) : "Ainda não realizado"))))),
            treinosSep.length > 0 && (React.createElement(Caixa, null,
                React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 8 } }, "Cardios realizados"),
                sep.length === 0 && React.createElement("div", { style: { fontSize: 12, color: "#94a3b8" } }, "Nenhum cardio conclu\u00EDdo ainda."),
                sep.slice(0, 10).map((s, i) => {
                    const eg = ERGOS[(s.cardio && s.cardio.ergo) || ""];
                    return (React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", gap: 8, padding: "7px 0", borderTop: i ? "1px solid #f1f5f9" : "none" } },
                        React.createElement("div", { style: { minWidth: 0 } },
                            React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700, color: "#0f172a" } },
                                nomeT(s.cardioTreinoKey),
                                eg ? " · " + eg.icone + " " + eg.nome : "",
                                s.momento === "pos_treino" ? " · pós-treino" : ""),
                            React.createElement("div", { style: { fontSize: 11, color: "#64748b" } }, s.cardio ? ("Sem. " + s.cardio.semana + " · " + s.cardio.texto) : "Cardio concluído")),
                        React.createElement("div", { style: { textAlign: "right", flexShrink: 0 } },
                            React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569" } }, fmtData(s.date)),
                            React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, s.cardio && s.cardio.total ? s.cardio.total + " min" : ""))));
                }))),
            React.createElement("div", { style: { fontSize: 10.5, color: "#94a3b8", lineHeight: 1.5, padding: "0 4px 8px" } }, "Cada cardio conta quando o aluno conclui o cardio no app, seja logo ap\u00F3s a muscula\u00E7\u00E3o ou em outro hor\u00E1rio.")));
    };
    // ── Histórico do aluno no painel (musculação e cardio) ──
    const ESF = { 1: "Leve", 2: "Leve a moderado", 3: "Moderado", 4: "Moderado a intenso", 5: "Intenso" };
    const num = (v) => { const n = parseFloat(String(v || "").replace(",", ".")); return isNaN(n) ? null : n; };
    const Historico = ({ st }) => {
        const [dados, setDados] = useState(null);
        const [erro, setErro] = useState(false);
        const [filtro, setFiltro] = useState("tudo");
        useEffect(() => {
            let vivo = true;
            if (!st || !st.id || !supa()) {
                setErro(true);
                return;
            }
            (async () => {
                try {
                    const h = await api.headers();
                    const [d, rc] = await Promise.all([
                        api.carregar(st.id),
                        fetch(SUPA_URL + "/rest/v1/checkins?select=data&student_id=eq." + encodeURIComponent(st.id) + "&type=eq.pos_treino&limit=500", { headers: h })
                    ]);
                    const checks = rc.ok ? (await rc.json()).map((x) => x && x.data).filter(Boolean) : [];
                    if (vivo)
                        setDados({ ...d, checks });
                }
                catch (e) {
                    if (vivo)
                        setErro(true);
                }
            })();
            return () => { vivo = false; };
        }, [st && st.id]);
        if (erro)
            return React.createElement(Caixa, { style: { textAlign: "center", color: "#94a3b8" } }, "N\u00E3o foi poss\u00EDvel carregar o hist\u00F3rico agora.");
        if (!dados)
            return React.createElement(Caixa, { style: { textAlign: "center", color: "#94a3b8" } }, "Carregando hist\u00F3rico...");
        const progNome = {};
        dados.progs.forEach((p) => { progNome[p.id] = p; });
        const nomeT = (s, t) => { const p = progNome[s.programId]; return ((p && p.nomesTreinos && p.nomesTreinos[t]) || "").trim() || NOMES[t] || t || "Treino"; };
        const musc = dados.sess.filter((s) => s.treinoKey && s.source !== "cardio_separado" && s.source !== "atividade_extra");
        const cardios = dados.sess.filter((s) => s.source === "cardio_separado");
        const musc30 = musc.filter((s) => diasAtras(s.date) <= 29).length, card30 = cardios.filter((s) => diasAtras(s.date) <= 29).length;
        const ordMusc = [...musc].sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.createdAt || "").localeCompare(b.createdAt || ""));
        const antes = (s, exId) => { const i = ordMusc.indexOf(s); for (let j = i - 1; j >= 0; j--) {
            const o = ordMusc[j];
            const l = (o.exercicios || []).find((x) => x.exId === exId && x.carga) || Object.values(o.cargas || {}).find((x) => x.exId === exId && x.carga);
            if (l)
                return l.carga;
        } return null; };
        const ckDe = (s) => dados.checks.find((k) => k.date === s.date && k.treinoKey === s.treinoKey) || dados.checks.find((k) => k.date === s.date && k.source === "professor_presencial");
        const itens = [
            ...(filtro !== "cardio" ? musc.map((s) => ({ t: "m", s })) : []),
            ...(filtro !== "musc" ? cardios.map((s) => ({ t: "c", s })) : [])
        ].sort((a, b) => (b.s.date || "").localeCompare(a.s.date || "") || (b.s.createdAt || "").localeCompare(a.s.createdAt || "")).slice(0, 40);
        const chip = (k, l) => React.createElement("button", { key: k, type: "button", onClick: () => setFiltro(k), style: { background: filtro === k ? "#0f172a" : "#f1f5f9", color: filtro === k ? "#fff" : "#475569", border: "none", borderRadius: 99, padding: "7px 12px", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" } }, l);
        const th = { padding: "5px 4px", textAlign: "left", color: "#94a3b8", fontSize: 10.5, textTransform: "uppercase", fontWeight: 800 };
        const td = { padding: "5px 4px", textAlign: "left", borderTop: "1px solid #f1f5f9", fontSize: 12, color: "#0f172a" };
        return (React.createElement("div", null,
            React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" } },
                React.createElement(Stat, { valor: musc30, rotulo: "Treinos", sub: "\u00FAltimos 30 dias", cor: "#FF5603" }),
                React.createElement(Stat, { valor: card30, rotulo: "Cardios", sub: "\u00FAltimos 30 dias", cor: "#e11d48" })),
            React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 12 } },
                chip("tudo", "Tudo"),
                chip("musc", "Musculação"),
                chip("cardio", "Cardio")),
            itens.length === 0 && React.createElement(Caixa, { style: { textAlign: "center", color: "#94a3b8" } }, "Nenhum registro ainda."),
            itens.map((it, i) => {
                const s = it.s;
                if (it.t === "c") {
                    const eg = ERGOS[s.cardioErgo || (s.cardio && s.cardio.ergo)];
                    const parcial = s.cardio && s.cardio.fracao != null && s.cardio.fracao < 0.95;
                    return (React.createElement(Caixa, { key: i, style: { border: "1.5px solid #fecdd3", padding: "11px 13px" } },
                        React.createElement("div", { style: { fontWeight: 800, fontSize: 13.5 } },
                            "\u2764\uFE0F ",
                            fmtData(s.date),
                            " \u00B7 Cardio",
                            eg ? " · " + eg.icone + " " + eg.nome : "",
                            s.momento === "pos_treino" ? " · pós-treino" : ""),
                        React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2 } }, [s.cardio && s.cardio.texto, s.cardio && s.cardio.semana ? "semana " + s.cardio.semana : null, parcial ? (s.cardioMin + " min feitos · parcial") : "completo", s.cardioKcal ? "cerca de " + s.cardioKcal + " kcal" : null].filter(Boolean).join(" · "))));
                }
                const ck = ckDe(s);
                const linhas = s.exercicios && s.exercicios.length ? s.exercicios : Object.values(s.cargas || {}).map((c) => ({ exId: c.exId, nome: c.nome, carga: c.carga, feito: true }));
                const det = [ck && ck.duracao ? ck.duracao + " min" : null, ck && ck.esforco ? ESF[ck.esforco] : null, s.totalEx ? (s.completedEx + " de " + s.totalEx + " exercícios") : null, ck && ck.dor && ck.dor !== "nenhuma" ? "dor: " + ck.dor : null].filter(Boolean).join(" · ");
                return (React.createElement(Caixa, { key: i, style: { border: "1.5px solid #fed7aa", padding: "11px 13px" } },
                    React.createElement("div", { style: { fontWeight: 800, fontSize: 13.5 } },
                        "\uD83D\uDCAA ",
                        fmtData(s.date),
                        " \u00B7 ",
                        nomeT(s, s.treinoKey)),
                    det && React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2 } }, det),
                    linhas.length > 0 && (React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", marginTop: 7 } },
                        React.createElement("thead", null,
                            React.createElement("tr", null,
                                React.createElement("th", { style: th }, "Exerc\u00EDcio"),
                                React.createElement("th", { style: th }, "S x R"),
                                React.createElement("th", { style: th }, "Carga"),
                                React.createElement("th", { style: th }, "Antes"))),
                        React.createElement("tbody", null, linhas.map((l, j) => {
                            const ant = l.exId ? antes(s, l.exId) : null;
                            const a = num(ant), c = num(l.carga);
                            const comp = a == null || c == null ? null : (c > a ? ["↑ " + ant, "#16a34a"] : (c < a ? ["↓ " + ant, "#dc2626"] : ["= " + ant, "#64748b"]));
                            return (React.createElement("tr", { key: j },
                                React.createElement("td", { style: { ...td, color: l.feito === false ? "#94a3b8" : "#0f172a", textDecoration: l.feito === false ? "line-through" : "none" } }, l.nome),
                                React.createElement("td", { style: td }, l.feito === false ? "—" : ((l.series || "") && (l.reps || "") ? l.series + "x" + l.reps : "—")),
                                React.createElement("td", { style: { ...td, fontWeight: 800 } }, l.carga ? l.carga : "—"),
                                React.createElement("td", { style: { ...td, color: comp ? comp[1] : "#cbd5e1", fontWeight: 700 } }, comp ? comp[0] : "—")));
                        }))))));
            })));
    };
    window.LongevusCardio = { Painel, Historico };
})();
