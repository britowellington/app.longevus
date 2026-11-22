// Longevus · Cardio (painel do professor). Gerado a partir de JSX, sem Babel.
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
            const lista = separado ? sep.filter((s) => s.cardioTreinoKey === t) : musc.filter((s) => s.treinoKey === t);
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
                if (l.separado)
                    min7 += (s.cardio && s.cardio.total) || 0;
                else {
                    const inf = semanaInfo(cfg, l.t, i + 1);
                    min7 += inf ? inf.total : 0;
                }
            });
        });
        // Adesão do cardio em outro horário nas últimas 4 semanas
        const treinosSep = linhas.filter((l) => l.separado);
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
                React.createElement(Stat, { valor: adesao === null ? "—" : adesao + "%", rotulo: "Ades\u00E3o 4 sem.", sub: esperado28 ? (feitos28 + " de " + esperado28 + " em outro horário") : "sem cardio em outro horário", cor: corAdesao })),
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
                React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 8 } }, "Cardios em outro hor\u00E1rio"),
                sep.length === 0 && React.createElement("div", { style: { fontSize: 12, color: "#94a3b8" } }, "Nenhum cardio conclu\u00EDdo ainda."),
                sep.slice(0, 10).map((s, i) => {
                    const eg = ERGOS[(s.cardio && s.cardio.ergo) || ""];
                    return (React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", gap: 8, padding: "7px 0", borderTop: i ? "1px solid #f1f5f9" : "none" } },
                        React.createElement("div", { style: { minWidth: 0 } },
                            React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700, color: "#0f172a" } },
                                nomeT(s.cardioTreinoKey),
                                eg ? " · " + eg.icone + " " + eg.nome : ""),
                            React.createElement("div", { style: { fontSize: 11, color: "#64748b" } }, s.cardio ? ("Sem. " + s.cardio.semana + " · " + s.cardio.texto) : "Cardio concluído")),
                        React.createElement("div", { style: { textAlign: "right", flexShrink: 0 } },
                            React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569" } }, fmtData(s.date)),
                            React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, s.cardio && s.cardio.total ? s.cardio.total + " min" : ""))));
                }))),
            React.createElement("div", { style: { fontSize: 10.5, color: "#94a3b8", lineHeight: 1.5, padding: "0 4px 8px" } }, "O cardio no fim do treino \u00E9 contado junto com o treino conclu\u00EDdo. O cardio em outro hor\u00E1rio conta quando o aluno toca em Concluir cardio.")));
    };
    window.LongevusCardio = { Painel };
})();
