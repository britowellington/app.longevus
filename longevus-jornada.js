// Longevus · Jornada semanal do aluno (painel do professor). Sem Babel.
(function() {
  const { useState, useEffect } = React;
  const h = React.createElement;
  const SUPA_URL = "https://jpduxfbigcdxmtcozqpp.supabase.co";
  const SUPA_KEY = "sb_publishable_VZSgcxu5ps3eR9UAjuRr4Q_B65WTx_h";
  const supa = () => window.__LV_SUPA;
  const LAR = "#FF5603";
  const NOMES = { A: "Treino A", B: "Treino B", C: "Treino C", D: "Treino D", FB: "Full Body", FBA: "Full Body A", FBB: "Full Body B", FBC: "Full Body C", FBD: "Full Body D", FBE: "Full Body E", SUP: "Superior", INF: "Inferior", PUSH: "Push", PULL: "Pull", LEGS: "Legs", PEITO: "Peito", COSTAS: "Costas", PERNA: "Perna", OMBRO: "Ombro", EMP: "Empurrar", PUX: "Puxar", X1: "Treino extra", X2: "Treino extra", X3: "Treino extra", X4: "Treino extra" };
  const ERGOS = { esteira: "Esteira", bike: "Bike", eliptico: "Elíptico" };
  const ESF = { 1: "leve", 2: "leve a moderado", 3: "moderado", 4: "moderado a intenso", 5: "intenso" };
  const DSEM = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const pad = (n) => String(n).padStart(2, "0");
  const isoDe = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const hojeISO = () => isoDe(new Date());
  const maisDias = (s, n) => {
    const d = new Date(s + "T12:00:00");
    d.setDate(d.getDate() + n);
    return isoDe(d);
  };
  const segundaDe = (s) => {
    const d = new Date(s + "T12:00:00");
    d.setDate(d.getDate() - (d.getDay() + 6) % 7);
    return isoDe(d);
  };
  const semanaPassada = () => maisDias(segundaDe(hojeISO()), -7);
  const dm = (s) => s ? s.slice(8, 10) + "/" + s.slice(5, 7) : "";
  const diaSem = (s) => DSEM[new Date(s + "T12:00:00").getDay()];
  const num = (v) => {
    const n = parseFloat(String(v == null ? "" : v).replace(",", "."));
    return isNaN(n) ? 0 : n;
  };
  const fmtKg = (v) => (Math.round(v * 10) / 10).toFixed(1).replace(".", ",");
  const plural = (n, a, b) => n === 1 ? a : b;
  const primeiroNome = (st) => String(st && st.name || "").trim().split(/\s+/)[0] || "";

  const api = {
    async headers() {
      const r = await supa().auth.getSession();
      const token = r && r.data && r.data.session && r.data.session.access_token || SUPA_KEY;
      return { "apikey": SUPA_KEY, "Authorization": "Bearer " + token };
    },
    async carregar(studentId) {
      const hd = await this.headers();
      const q = (path) => fetch(SUPA_URL + "/rest/v1/" + path, { headers: hd }).then((r) => r.ok ? r.json() : []).catch(() => []);
      const id = encodeURIComponent(studentId);
      const [rp, rs, rc, rq] = await Promise.all([
        q("programs?select=data&student_id=eq." + id + "&limit=50"),
        q("sessions?select=id,data&student_id=eq." + id + "&limit=1000"),
        q("checkins?select=id,data&student_id=eq." + id + "&type=eq.pos_treino&limit=500"),
        q("checkins?select=id,data&student_id=eq." + id + "&type=eq.pre_treino&limit=500")
      ]);
      const dados = (l) => (l || []).filter((x) => x && x.data).map((x) => ({ ...x.data, __id: x.id }));
      return { progs: (rp || []).map((x) => x && x.data).filter(Boolean), sess: dados(rs), ckPos: dados(rc), ckPre: dados(rq) };
    }
  };

  // ---------- leitura da semana ----------
  const programaDa = (progs, fim) => {
    const l = (progs || []).slice().sort((a, b) => String(b.criadoEm || "").localeCompare(String(a.criadoEm || "")));
    return l.find((p) => String(p.criadoEm || "").slice(0, 10) <= fim) || l[0] || null;
  };
  const nomeTreino = (prog, t) => (prog && prog.nomesTreinos && prog.nomesTreinos[t] || "").trim() || NOMES[t] || t || "Treino";
  const treinosSemana = (d, ini, fim) => {
    const prog = programaDa(d.progs, fim);
    const dentro = (s) => s && s.date >= ini && s.date <= fim;
    const seq = prog ? [...new Set(prog.divisao && prog.divisao.sequencia || [])] : [];
    const cfg = prog && prog.cardio && prog.cardio.treinos || {};
    const comCardio = Object.keys(cfg).filter((t) => cfg[t] && ERGOS[cfg[t].ergo]);
    const freq = prog ? parseInt(prog.freq) || seq.length || 0 : 0;
    const ckDe = (s) => d.ckPos.find((k) => k.date === s.date && k.treinoKey && k.treinoKey === s.treinoKey) || d.ckPos.find((k) => k.date === s.date && k.source === "professor_presencial") || d.ckPos.find((k) => k.date === s.date && !k.treinoKey);
    const musc = d.sess.filter((s) => dentro(s) && s.treinoKey && s.source !== "cardio_separado" && s.source !== "atividade_extra").sort((a, b) => (a.date + (a.createdAt || "")).localeCompare(b.date + (b.createdAt || ""))).map((s) => {
      const ck = ckDe(s) || {};
      const tot = parseInt(s.totalEx) || 0, feitos = parseInt(s.completedEx) || 0;
      const parcial = ck.completude === "parcial" || ck.completude === "nao" || tot && feitos < tot;
      return {
        date: s.date, treinoKey: s.treinoKey, nome: nomeTreino(prog, s.treinoKey), status: parcial ? "parcial" : "completo",
        presencial: s.source === "professor_presencial" || ck.source === "professor_presencial",
        duracao: num(ck.duracao), esforco: ESF[ck.esforco] || "", tot, feitos,
        kcal: num(ck.musculacaoKcal), relogio: ck.musculacaoKcalFonte === "relogio",
        dor: ck.dor && ck.dor !== "nenhuma" ? ck.dor : "", obs: String(ck.obs || "").trim()
      };
    });
    const cardios = d.sess.filter((s) => dentro(s) && s.source === "cardio_separado").map((s) => {
      const c = s.cardio || {};
      const fr = c.fracao != null ? num(c.fracao) : 1;
      const tot = num(c.total);
      const min = num(s.cardioMin) || tot;
      return {
        date: s.date, treinoKey: s.cardioTreinoKey, ergo: ERGOS[c.ergo || s.cardioErgo] || "Cardio", min, total: tot,
        status: fr < 0.95 ? "parcial" : "completo", texto: c.texto || "", kcal: num(s.cardioKcal),
        relogio: s.cardioKcalFonte === "relogio", fc: num(s.cardioFcMedia), createdAt: s.createdAt || ""
      };
    });
    d.ckPos.filter((k) => dentro(k) && k.source === "professor_presencial" && num(k.cardioMin)).forEach((k) => {
      cardios.push({ date: k.date, treinoKey: null, ergo: ERGOS[k.cardioErgo] || "Cardio", min: num(k.cardioMin), total: num(k.cardioMin), status: "completo", texto: "presencial", kcal: num(k.cardioKcal), relogio: k.cardioKcalFonte === "relogio", fc: num(k.cardioFcMedia), createdAt: k.createdAt || "" });
    });
    cardios.sort((a, b) => (a.date + a.createdAt).localeCompare(b.date + b.createdAt));
    const naoFeitos = [];
    musc.forEach((m) => {
      const tr = cfg[m.treinoKey];
      if (!tr || !ERGOS[tr.ergo] || tr.onde === "separado") return;
      if (cardios.some((c) => c.date === m.date)) return;
      naoFeitos.push({ date: m.date, ergo: ERGOS[tr.ergo], obs: "previsto junto do " + m.nome });
    });
    const cardioPrev = seq.length && comCardio.length ? Math.round(freq * comCardio.length / seq.length) : 0;
    const resto = Math.max(0, cardioPrev - cardios.length - naoFeitos.length);
    const minCardio = Math.round(cardios.reduce((s, c) => s + c.min, 0));
    const pre = d.ckPre.filter((k) => dentro(k));
    const media = (f) => {
      const v = pre.map(f).map(num).filter((x) => x > 0);
      return v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0;
    };
    return { prog, freq, musc, cardios, naoFeitos, resto, cardioPrev, minCardio, disp: media((k) => k.disposicao), sono: media((k) => k.sono), nPre: pre.length };
  };
  const DISP = (v) => v >= 4.5 ? "animado" : v >= 3.5 ? "disposto" : v >= 2.5 ? "neutro" : "cansado";
  const SONO = (v) => v >= 3.5 ? "ótimo" : v >= 2.5 ? "bom" : v >= 1.5 ? "regular" : "ruim";

  const destaques = (t, a) => {
    const out = [];
    const ok = (x) => out.push(["ok", x]), at = (x) => out.push(["at", x]);
    const nm = t.musc.length, np = t.freq;
    if (np) nm >= np ? ok("Fez " + (nm > 1 ? "os " + nm + " treinos" : "o treino") + " de musculação previsto" + (nm > 1 ? "s" : "")) : at("Musculação: " + nm + " de " + np + " treinos");
    const parc = t.musc.filter((m) => m.status === "parcial");
    if (parc.length) at(parc.length + " " + plural(parc.length, "treino ficou parcial", "treinos ficaram parciais") + (parc.some((m) => m.obs) ? ", com observação do aluno" : ""));
    const dores = t.musc.filter((m) => m.dor === "moderada" || m.dor === "alta");
    if (dores.length) at("Relatou dor " + dores.map((m) => m.dor).join(" e ") + " em " + dores.length + " " + plural(dores.length, "treino", "treinos"));
    const nc = t.cardios.length, cp = t.cardioPrev;
    if (cp) nc >= cp ? ok("Fez " + nc + " de " + cp + " cardios previstos") : at("Cardio: " + nc + " de " + cp + " previstos");
    if (nc) t.minCardio >= 150 ? ok(t.minCardio + " min de cardio, acima dos 150 min recomendados") : at("Cardio somou " + t.minCardio + " de 150 min recomendados");
    if (a) {
      if (a.registrados >= 5) ok("Registrou a alimentação em " + a.registrados + " de 7 dias");
      else at("Alimentação registrada em " + a.registrados + " de 7 dias");
      if (a.deficitMedio != null && a.metaDeficit) a.deficitMedio >= a.metaDeficit * 0.8 ? ok("Déficit médio de " + a.deficitMedio + " kcal, perto da meta de " + a.metaDeficit) : at("Déficit médio de " + a.deficitMedio + " kcal, abaixo da meta de " + a.metaDeficit);
      if (a.protMedia != null && a.metaProt) a.protMedia >= a.metaProt ? ok("Proteína média de " + a.protMedia + " g, dentro da meta") : at("Proteína média de " + a.protMedia + " g, abaixo da meta de " + a.metaProt + " g");
      if (a.aguaMeta) a.aguaReg ? a.aguaDiasMeta >= 5 ? ok("Bateu a meta de água em " + a.aguaDiasMeta + " dias") : at("Meta de água em " + a.aguaDiasMeta + " de 7 dias") : at("Não registrou a água na semana");
      if (a.pesoVar != null && a.pesoVar < 0) ok("Peso " + fmtKg(Math.abs(a.pesoVar)) + " kg menor desde a última pesagem");
    }
    return out;
  };

  const focoAluno = (t, a) => {
    const f = [];
    if (a && a.protMedia != null && a.metaProt && a.protMedia < a.metaProt) f.push("caprichar na proteína (a meta é " + a.metaProt + " g e a média foi " + a.protMedia + " g)");
    const faltaC = t.cardioPrev - t.cardios.length;
    if (faltaC > 0) f.push("encaixar " + (faltaC === 1 ? "mais 1 cardio" : "mais " + faltaC + " cardios"));
    if (t.freq && t.musc.length < t.freq) f.push("completar os " + t.freq + " treinos de musculação");
    if (a && a.registrados < 5) f.push("registrar a alimentação todos os dias");
    else if (a && a.deficitMedio != null && a.metaDeficit && a.deficitMedio < a.metaDeficit * 0.8) f.push("chegar mais perto do déficit de " + a.metaDeficit + " kcal");
    if (a && a.aguaMeta && a.aguaDiasMeta < 5) f.push("beber mais água ao longo do dia");
    return f.slice(0, 2);
  };
  const mensagem = (st, t, a, tom) => {
    const nome = primeiroNome(st);
    const nm = t.musc.length, np = t.freq, nc = t.cardios.length, cp = t.cardioPrev;
    const parc = t.musc.filter((m) => m.status === "parcial");
    if (tom === "d") {
      const l = [];
      if (np) l.push("• Musculação: " + nm + " de " + np + (parc.length ? " (" + parc.length + " " + plural(parc.length, "parcial", "parciais") + ")" : ""));
      if (cp || nc) l.push("• Cardio: " + nc + (cp ? " de " + cp : "") + (nc ? " · " + t.minCardio + " min" : ""));
      if (a) {
        l.push("• Alimentação registrada: " + a.registrados + " de 7 dias");
        if (a.deficitMedio != null) l.push("• Déficit médio: " + a.deficitMedio + " kcal" + (a.metaDeficit ? " (meta " + a.metaDeficit + ")" : ""));
        if (a.protMedia != null) l.push("• Proteína média: " + a.protMedia + " g" + (a.metaProt ? " (meta " + a.metaProt + " g)" : ""));
        if (a.aguaMeta) l.push("• Água na meta: " + a.aguaDiasMeta + " de 7 dias");
        if (a.pesoVar != null) l.push("• Peso: " + (a.pesoVar > 0 ? "+" : a.pesoVar < 0 ? "−" : "") + fmtKg(Math.abs(a.pesoVar)) + " kg");
      }
      const foco = focoAluno(t, a);
      return nome + ", resumo da semana:\n\n" + l.join("\n") + (foco.length ? "\n\nFoco desta semana: " + foco.join(" e ") + "." : "\n\nSemana redonda. Vamos manter!");
    }
    const p = [];
    p.push("Oi, " + nome + "! Passando para fechar a sua semana 💪");
    const t1 = [];
    if (np) t1.push(nm >= np ? "Você fez " + (nm > 1 ? "os " + nm + " treinos" : "o treino") + " de musculação" : "Você fez " + nm + " de " + np + " treinos de musculação");
    if (cp || nc) t1.push(nc >= cp && nc ? nc + " " + plural(nc, "cardio", "cardios") + " (" + t.minCardio + " min)" : nc + " de " + cp + " cardios");
    if (t1.length) p.push(t1.join(" e ") + (nm >= np && (!cp || nc >= cp) ? ". Isso é constância de verdade!" : "."));
    if (parc.some((m) => m.obs || m.dor)) p.push("Vi o que você comentou no treino. Vamos ajustar juntos para você treinar com segurança.");
    if (a) {
      const t2 = [];
      if (a.registrados) t2.push("registrou as refeições em " + a.registrados + " de 7 dias");
      if (a.deficitMedio != null) t2.push("seu déficit ficou em " + a.deficitMedio + " kcal por dia" + (a.metaDeficit ? a.deficitMedio >= a.metaDeficit * 0.8 ? ", bem perto da meta" : " (a meta é " + a.metaDeficit + ")" : ""));
      if (t2.length) p.push("Você " + t2.join(" e ") + ".");
      if (a.pesoVar != null && a.pesoVar < 0) p.push("Na balança, foram " + fmtKg(Math.abs(a.pesoVar)) + " kg a menos. 👏");
    }
    const foco = focoAluno(t, a);
    if (foco.length) p.push("Para esta semana, " + (foco.length > 1 ? "dois ajustes: " : "um ajuste: ") + foco.join(" e ") + ".");
    p.push("Sigo com você. Qualquer dúvida, me chama!");
    return p.join("\n\n");
  };

  // ---------- visual ----------
  const Caixa = ({ children, style }) => h("div", { style: { background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "12px 14px", marginBottom: 12, ...style || {} } }, children);
  const Rot = ({ children, cor }) => h("div", { style: { fontSize: 11, fontWeight: 800, color: cor || "#64748b", letterSpacing: 0.4, textTransform: "uppercase" } }, children);
  const Met = ({ k, v, s, sc, pct, cor }) => h("div", { style: { background: "#f8fafc", borderRadius: 10, padding: "8px 10px", minWidth: 0 } },
    h("div", { style: { fontSize: 11.5, color: "#64748b" } }, k),
    h("div", { style: { fontSize: 18, fontWeight: 800, color: "#0f172a" } }, v),
    pct != null && h("div", { style: { height: 6, background: "#e2e8f0", borderRadius: 3, marginTop: 5 } }, h("div", { style: { width: Math.max(0, Math.min(100, pct)) + "%", height: 6, borderRadius: 3, background: cor || LAR } })),
    s && h("div", { style: { fontSize: 11, color: sc || "#64748b", marginTop: pct != null ? 4 : 0 } }, s));
  const g2 = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginTop: 8 };
  const ST = { completo: ["✓", "#DCFCE7", "#15803D", "completo"], parcial: ["!", "#FEF3C7", "#B45309", "parcial"], nao: ["✕", "#FEE2E2", "#B91C1C", "não feito"] };
  const Item = ({ st, titulo, det, obs }) => {
    const c = ST[st];
    return h("div", { style: { display: "flex", gap: 10, padding: "9px 0", borderTop: "1px solid #f1f5f9" } },
      h("div", { style: { width: 26, height: 26, borderRadius: 8, background: c[1], color: c[2], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 } }, c[0]),
      h("div", { style: { flex: 1, minWidth: 0 } },
        h("div", { style: { display: "flex", justifyContent: "space-between", gap: 6, alignItems: "baseline" } },
          h("span", { style: { fontWeight: 800, fontSize: 13, color: "#0f172a" } }, titulo),
          h("span", { style: { fontSize: 10.5, fontWeight: 800, borderRadius: 99, padding: "2px 8px", background: c[1], color: c[2], whiteSpace: "nowrap" } }, c[3])),
        det && h("div", { style: { fontSize: 11.5, color: "#64748b", marginTop: 1 } }, det),
        obs && h("div", { style: { fontSize: 11.5, color: "#475569", background: "#f8fafc", borderRadius: 8, padding: "5px 8px", marginTop: 4, lineHeight: 1.4 } }, obs)));
  };
  const Sub = ({ children }) => h("div", { style: { fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.3, margin: "12px 0 0" } }, children);
  const btn = (prim, extra) => ({ flex: 1, height: 44, borderRadius: 12, border: prim ? "none" : "1.5px solid #e2e8f0", background: prim || "#fff", color: prim ? "#fff" : "#475569", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit", ...extra || {} });

  const Aba = ({ st, setStudents, assessments }) => {
    const [dados, setDados] = useState(null);
    const [erro, setErro] = useState(false);
    const [ini, setIni] = useState(semanaPassada());
    const [alim, setAlim] = useState(undefined);
    const [tom, setTom] = useState("a");
    const [msg, setMsg] = useState("");
    const [editada, setEditada] = useState(false);
    const [aviso, setAviso] = useState("");
    const fim = maisDias(ini, 6);
    const hoje = hojeISO();
    const atual = ini === segundaDe(hoje);
    useEffect(() => {
      let vivo = true;
      if (!st || !st.id || !supa()) {
        setErro(true);
        return;
      }
      api.carregar(st.id).then((d) => vivo && setDados(d)).catch(() => vivo && setErro(true));
      return () => {
        vivo = false;
      };
    }, [st && st.id]);
    useEffect(() => {
      let vivo = true;
      setAlim(undefined);
      const LA = window.LongevusAlimentacao;
      if (!LA || !LA.resumoAlimentar) {
        setAlim(null);
        return;
      }
      LA.resumoAlimentar(st, ini, atual ? hoje : fim, assessments).then((r) => vivo && setAlim(r || null)).catch(() => vivo && setAlim(null));
      return () => {
        vivo = false;
      };
    }, [st && st.id, ini]);
    const t = dados ? treinosSemana(dados, ini, fim) : null;
    useEffect(() => {
      if (t && alim !== undefined && !editada) setMsg(mensagem(st, t, alim, tom));
    }, [dados, alim, tom, ini, editada]);
    if (erro) return h(Caixa, { style: { textAlign: "center", color: "#94a3b8" } }, "Não foi possível carregar a jornada agora.");
    if (!t || alim === undefined) return h(Caixa, { style: { textAlign: "center", color: "#94a3b8" } }, "Montando a semana...");
    const envios = st.jornadaEnvios || {};
    const env = envios[ini];
    const trocar = (n) => {
      const nv = maisDias(ini, n * 7);
      if (nv > segundaDe(hoje)) return;
      setIni(nv);
      setEditada(false);
      setAviso("");
    };
    const marcar = (modo) => {
      if (!setStudents) return;
      setStudents((p) => p.map((s) => s.id === st.id ? { ...s, jornadaEnvios: { ...s.jornadaEnvios || {}, [ini]: { em: new Date().toISOString(), modo } } } : s));
    };
    const enviarWhats = () => {
      let tel = String(st.phone || "").replace(/\D/g, "");
      if (tel && tel.length <= 11) tel = "55" + tel;
      const url = (tel ? "https://wa.me/" + tel : "https://wa.me/") + "?text=" + encodeURIComponent(msg);
      window.open(url, "_blank");
      marcar("whatsapp");
      setAviso(tel ? "Mensagem aberta no WhatsApp. Semana marcada como enviada." : "O aluno não tem telefone cadastrado. Escolha o contato no WhatsApp.");
    };
    const copiar = () => {
      try {
        navigator.clipboard.writeText(msg);
        setAviso("Mensagem copiada.");
      } catch (e) {
        setAviso("Não consegui copiar. Selecione o texto e copie.");
      }
    };
    const a = alim;
    const dest = destaques(t, a);
    const nm = t.musc.length, nc = t.cardios.length;
    const parc = t.musc.filter((m) => m.status === "parcial").length;
    const cardPrevTxt = t.cardioPrev ? nc + " de " + t.cardioPrev : String(nc);
    return h("div", null,
      h(Caixa, { style: { borderColor: "#FED7AA" } },
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } },
          h("button", { type: "button", onClick: () => trocar(-1), "aria-label": "Semana anterior", style: { border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: 9, width: 36, height: 36, cursor: "pointer", fontSize: 16 } }, "‹"),
          h("div", { style: { textAlign: "center" } },
            h("div", { style: { fontWeight: 800, fontSize: 15, color: "#0f172a" } }, "Semana " + dm(ini) + " a " + dm(fim)),
            h("div", { style: { fontSize: 11.5, color: "#64748b" } }, atual ? "semana atual · em andamento" : ini === semanaPassada() ? "semana passada · completa" : "semana completa")),
          h("button", { type: "button", onClick: () => trocar(1), "aria-label": "Próxima semana", style: { border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: 9, width: 36, height: 36, cursor: "pointer", fontSize: 16, opacity: atual ? 0.3 : 1 } }, "›")),
        h("div", { style: { fontSize: 12, marginTop: 10, color: env ? "#15803d" : "#9a3412", fontWeight: 700, textAlign: "center" } }, env ? "Feedback enviado em " + dm(env.em.slice(0, 10)) + (env.modo === "manual" ? " (marcado por você)" : " pelo WhatsApp") : "Feedback desta semana ainda não enviado")),
      h(Caixa, null,
        h(Rot, null, "Treinos"),
        h("div", { style: g2 },
          h(Met, { k: "Musculação", v: t.freq ? nm + " de " + t.freq : String(nm), pct: t.freq ? nm / t.freq * 100 : null, s: nm ? (nm - parc) + " " + plural(nm - parc, "completo", "completos") + (parc ? " · " + parc + " " + plural(parc, "parcial", "parciais") : "") : "nenhum na semana" }),
          h(Met, { k: "Cardio", v: cardPrevTxt, pct: t.cardioPrev ? nc / t.cardioPrev * 100 : null, cor: "#e11d48", s: t.minCardio + " de 150 min na semana" })),
        t.musc.length > 0 && h(Sub, null, "Musculação"),
        t.musc.map((m, i) => h(Item, { key: "m" + i, st: m.status, titulo: diaSem(m.date) + " " + m.date.slice(8, 10) + " · " + m.nome,
          det: [m.duracao ? Math.round(m.duracao) + " min" : null, m.esforco || null, m.tot ? m.feitos + " de " + m.tot + " exercícios" : null, m.kcal ? m.kcal + " kcal" + (m.relogio ? " (relógio)" : "") : null, m.presencial ? "presencial" : "app"].filter(Boolean).join(" · "),
          obs: m.obs || m.dor ? (m.obs ? "“" + m.obs + "”" : "") + (m.obs && m.dor ? " · " : "") + (m.dor ? "dor " + m.dor : "") : null })),
        (t.cardios.length > 0 || t.naoFeitos.length > 0 || t.resto > 0) && h(Sub, null, "Cardio"),
        t.cardios.map((c, i) => h(Item, { key: "c" + i, st: c.status, titulo: diaSem(c.date) + " " + c.date.slice(8, 10) + " · " + c.ergo + " · " + (c.status === "parcial" && c.total ? Math.round(c.min) + " de " + Math.round(c.total) : Math.round(c.min)) + " min",
          det: [c.texto || null, c.kcal ? c.kcal + " kcal" + (c.relogio ? " (relógio)" : "") : null, c.fc ? "FC média " + c.fc : null].filter(Boolean).join(" · ") })),
        t.naoFeitos.map((c, i) => h(Item, { key: "n" + i, st: "nao", titulo: diaSem(c.date) + " " + c.date.slice(8, 10) + " · " + c.ergo, det: c.obs })),
        t.resto > 0 && h(Item, { key: "r", st: "nao", titulo: t.resto + " " + plural(t.resto, "cardio previsto", "cardios previstos"), det: atual ? "ainda dá tempo nesta semana" : "não registrados na semana" }),
        !t.musc.length && !t.cardios.length && h("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 8 } }, "Nenhum treino registrado nesta semana.")),
      h(Caixa, null,
        h(Rot, null, "Alimentação"),
        !a ? h("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 6 } }, "Sem dados de alimentação para esta semana.") :
        h("div", { style: g2 },
          h(Met, { k: "Dias registrados", v: a.registrados + " de " + a.dias, s: a.registrados >= 5 ? "adesão boa" : a.registrados >= 3 ? "adesão média" : "adesão baixa", sc: a.registrados >= 5 ? "#15803d" : a.registrados >= 3 ? "#b45309" : "#c2410c" }),
          h(Met, { k: "Déficit médio", v: a.deficitMedio != null ? a.deficitMedio + " kcal" : "—", s: a.metaDeficit ? "meta " + a.metaDeficit : "sem meta de déficit" }),
          h(Met, { k: "Proteína média", v: a.protMedia != null ? a.protMedia + " g" : "—", s: a.metaProt ? "meta " + a.metaProt + " g" : "sem meta" }),
          h(Met, { k: "Água", v: a.aguaMeta ? a.aguaDiasMeta + " de " + a.dias : "—", s: a.aguaMeta ? "dias na meta" : "sem meta" }))),
      h(Caixa, null,
        h(Rot, null, "Corpo e bem-estar"),
        h("div", { style: g2 },
          h(Met, { k: "Peso", v: a && a.peso ? fmtKg(a.peso) + " kg" : "—", s: a && a.pesoVar != null ? (a.pesoVar > 0 ? "+" : a.pesoVar < 0 ? "−" : "") + fmtKg(Math.abs(a.pesoVar)) + " kg desde " + dm(a.pesoAntesData) : "sem nova pesagem", sc: a && a.pesoVar < 0 ? "#15803d" : "#64748b" }),
          h(Met, { k: "Disposição e sono", v: t.nPre ? DISP(t.disp) : "—", s: t.nPre ? (t.sono ? "sono " + SONO(t.sono) + " · " : "") + t.nPre + " check-in" + (t.nPre > 1 ? "s" : "") : "sem check-in na semana" }))),
      dest.length > 0 && h(Caixa, null, h(Rot, null, "Destaques e atenção"), h("div", { style: { marginTop: 6, fontSize: 12.5, lineHeight: 1.6, color: "#0f172a" } }, dest.map((x, i) => h("div", { key: i }, (x[0] === "ok" ? "✅ " : "⚠️ ") + x[1])))),
      h(Caixa, { style: { borderColor: LAR } },
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } },
          h(Rot, { cor: "#c2410c" }, "Mensagem da semana"),
          h("div", { style: { display: "flex", gap: 4 } }, [["a", "Acolhedora"], ["d", "Direta"]].map(([k, l]) => h("button", { key: k, type: "button", onClick: () => {
            setTom(k);
            setEditada(false);
          }, style: { fontSize: 11.5, fontWeight: 800, padding: "5px 10px", borderRadius: 99, border: "1.5px solid " + (tom === k ? LAR : "#e2e8f0"), background: tom === k ? "#fff4ee" : "#fff", color: tom === k ? "#c2410c" : "#64748b", cursor: "pointer", fontFamily: "inherit" } }, l)))),
        h("textarea", { value: msg, onChange: (e) => {
          setMsg(e.target.value);
          setEditada(true);
        }, style: { width: "100%", boxSizing: "border-box", minHeight: 190, marginTop: 8, border: "1.5px solid #e2e8f0", borderRadius: 10, padding: 10, fontFamily: "inherit", fontSize: 13, lineHeight: 1.5, color: "#0f172a", resize: "vertical" } }),
        h("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 4 } }, editada ? "Editada por você. Trocar o tom ou a semana gera de novo." : "Gerada com os números da semana. Você pode editar antes de enviar."),
        h("div", { style: { display: "flex", gap: 8, marginTop: 10 } },
          h("button", { type: "button", onClick: enviarWhats, style: btn("#16A34A", { flex: 1.4 }) }, "Enviar pelo WhatsApp"),
          h("button", { type: "button", onClick: copiar, style: btn(null) }, "Copiar")),
        !env && h("button", { type: "button", onClick: () => {
          marcar("manual");
          setAviso("Semana marcada como feita.");
        }, style: btn(null, { width: "100%", marginTop: 8, height: 40, fontSize: 12.5 }) }, "Já mandei (áudio ou outro canal)"),
        aviso && h("div", { style: { fontSize: 12, fontWeight: 700, color: "#15803d", marginTop: 8, textAlign: "center" } }, aviso)));
  };

  const Lembrete = ({ students, nav }) => {
    const ini = semanaPassada();
    const pend = (students || []).filter((s) => s && (s.status || "ativo") === "ativo" && !(s.jornadaEnvios && s.jornadaEnvios[ini]));
    if (!pend.length) return null;
    const mostra = pend.slice(0, 3);
    return h("div", { style: { background: "#FFF7ED", border: "1.5px solid #FED7AA", borderRadius: 14, padding: "12px 14px", marginBottom: 14 } },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } },
        h("div", null,
          h("div", { style: { fontWeight: 800, fontSize: 14, color: "#0f172a" } }, pend.length + " " + plural(pend.length, "aluno sem feedback da semana", "alunos sem feedback da semana")),
          h("div", { style: { fontSize: 11.5, color: "#9A3412", marginTop: 2 } }, "semana " + dm(ini) + " a " + dm(maisDias(ini, 6)))),
        h("span", { style: { fontSize: 20 } }, "💬")),
      h("div", { style: { marginTop: 8 } }, mostra.map((s) => h("button", { key: s.id, type: "button", onClick: () => nav("studentDetail", { studentId: s.id, initialTab: "jornada" }), style: { display: "flex", justifyContent: "space-between", width: "100%", background: "transparent", border: "none", padding: "6px 0", fontSize: 13, color: "#0f172a", cursor: "pointer", fontFamily: "inherit", borderTop: "1px solid #fde2c8" } }, h("span", null, s.name), h("span", { style: { color: "#C2410C", fontWeight: 800 } }, "Abrir ›")))),
      pend.length > 3 && h("div", { style: { fontSize: 12, color: "#9A3412", fontWeight: 700, marginTop: 4 } }, "e mais " + (pend.length - 3)),
      h("div", { style: { fontSize: 11, color: "#9A3412", marginTop: 6 } }, "Some quando você envia ou marca como feito na aba Jornada."));
  };

  window.LongevusJornada = { Aba, Lembrete, _treinosSemana: treinosSemana, _mensagem: mensagem, _destaques: destaques };
})();
