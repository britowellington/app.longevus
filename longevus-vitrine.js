(function () {
  const { useState, useEffect, useRef } = React;
  const h = React.createElement;
  // No app do aluno o rodapé fica por cima das telas da vitrine; as telas terminam logo acima dele.
  const navAluno = () => (window.__lvAlunoNav ? "calc(64px + env(safe-area-inset-bottom))" : 0);
  const SUPA_URL = "https://jpduxfbigcdxmtcozqpp.supabase.co";
  const SUPA_KEY = "sb_publishable_VZSgcxu5ps3eR9UAjuRr4Q_B65WTx_h";
  const supa = () => window.__LV_SUPA;
  const COR = { escuro: "#0F172A", escuro2: "#18233A", laranja: "#FF5603", laranjaTxt: "#C2410C", verde: "#0F6E56", cinza: "#64748B", borda: "#E2E8F0", fundo: "#F4F5F7" };

  const PUBLICOS = [["todos", "Todos"], ["mulheres", "Mulheres"], ["homens", "Homens"], ["50mais", "50 anos ou mais"], ["menos50", "Menos de 50"], ["sem360", "Quem não tem o 360"]];
  const CATEGORIAS = [["nutricao", "Nutrição", "#E9F5F2", "#0F6E56"], ["fisio", "Fisioterapia", "#E6F1FB", "#185FA5"], ["farmacia", "Farmácia", "#FAEEDA", "#854F0B"], ["exames", "Exames e saúde", "#FBEAF0", "#993556"], ["loja", "Loja", "#EEEDFE", "#534AB7"], ["outro", "Outro", "#F1EFE8", "#5F5E5A"]];
  const MSG_PARCEIRO = "Olá, {parceiro}! Tudo bem?\n\nSou {aluno}, {aluno_a} do {personal}, personal trainer (Longevus), e vim por indicação dele.\n\nGostaria de saber mais sobre {servico}.{cupom_frase}\n\nPode me passar mais informações?";
  const MSG_PROPRIO = "Oi, {personal_nome}! Vi no app a oferta \"{titulo}\" e quero saber mais.";

  const hojeISO = () => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };
  const idade = (dob) => {
    if (!dob) return null;
    const a = String(dob).slice(0, 10).split("-").map(Number), b = hojeISO().split("-").map(Number);
    if (!a[0]) return null;
    let i = b[0] - a[0];
    if (b[1] < a[1] || (b[1] === a[1] && b[2] < a[2])) i--;
    return i > 0 && i < 120 ? i : null;
  };
  const novoId = (p) => p + "_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  const categoria = (k) => CATEGORIAS.find((c) => c[0] === k) || CATEGORIAS[CATEGORIAS.length - 1];
  const primeiroNome = (n) => String(n || "").trim().split(/\s+/)[0] || "";

  const waLink = (numero, texto) => {
    let d = String(numero || "").replace(/\D/g, "");
    if (!d) return null;
    if (!(d.length >= 12 && d.indexOf("55") === 0)) d = "55" + d;
    return "https://wa.me/" + d + (texto ? "?text=" + encodeURIComponent(texto) : "");
  };
  const montarMensagem = (item, ctx) => {
    const d = item || {};
    const base = (d.mensagem && String(d.mensagem).trim()) || (d.tipo === "parceiro" ? MSG_PARCEIRO : MSG_PROPRIO);
    const sexo = ctx && ctx.sexo;
    const troca = {
      parceiro: d.parceiro || d.titulo || "",
      aluno: (ctx && ctx.aluno) || "",
      aluno_a: sexo === "F" ? "aluna" : sexo === "M" ? "aluno" : "aluno(a)",
      personal: (ctx && ctx.personal) || "Wellington Brito",
      personal_nome: primeiroNome((ctx && ctx.personal) || "Wellington"),
      servico: d.servico || d.titulo || "o atendimento",
      titulo: d.titulo || "",
      cupom: d.cupom || "",
      cupom_frase: d.cupom ? " Tenho o cupom " + d.cupom + " de aluno Longevus." : ""
    };
    return base.replace(/\{(\w+)\}/g, (m, k) => (k in troca ? troca[k] : m));
  };
  const linkPlano = (slug) => window.location.origin + window.location.pathname.replace(/[^/]*$/, "") + "aluno.html?cadastro=1&plano=" + encodeURIComponent(slug || "");
  const ehPlano = (d) => d && d.tipo !== "parceiro" && d.cobranca === "plano" && d.planoSlug;
  const linkDoItem = (item, ctx) => {
    const d = item || {};
    if (ehPlano(d)) return null;
    if (d.tipo !== "parceiro" && d.destino === "link" && d.link) return d.link;
    const numero = d.tipo === "parceiro" ? d.whatsapp : (d.whatsapp || (ctx && ctx.personalWhats));
    return waLink(numero, montarMensagem(d, ctx));
  };
  const valorNum = (v) => { const n = parseFloat(String(v || "").replace(/[^0-9,\.]/g, "").replace(/\.(?=\d{3})/g, "").replace(",", ".")); return isFinite(n) && n > 0 ? n : 0; };
  const valorPix = (d) => (d && d.cobranca === "plano" && Number(d.planoValor) > 0) ? Number(d.planoValor) : valorNum((d && d.valor) || (d && d.preco));
  // Todo serviço próprio com valor pode ser pago no app (para si ou de presente)
  const ehPix = (d) => d && d.tipo !== "parceiro" && d.produto !== "indique" && d.produto !== "elo" && valorPix(d) > 0;
  const fmtReal = (n) => "R$ " + n.toFixed(2).replace(".", ",");
  const fmtWhats = (v) => {
    const d = String(v || "").replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  };
  const IcPresente = ({ cor, tam }) => h("svg", { width: tam || 16, height: tam || 16, viewBox: "0 0 24 24", fill: "none", stroke: cor || "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
    h("rect", { x: 3, y: 8, width: 18, height: 4, rx: 1 }), h("path", { d: "M12 8v13M19 12v9H5v-9M7.5 8a2.5 2.5 0 1 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 1 1 0 5" }));
  const msgVale = (item, ctx, pr) => {
    const quem = primeiroNome(pr.nome);
    const pers = primeiroNome(ctx.personal) || "Wellington";
    return quem + ", você ganhou um presente! 🎁\n\n" + (item.titulo || "Um atendimento") + " com o " + pers + ", meu personal trainer." + (pr.mensagem ? "\n\n" + pr.mensagem : "") + "\n\nJá está pago. Ele vai te chamar para agendar.";
  };
  const quebrar = (cx, txt, larg) => {
    const out = [];
    String(txt || "").split("\n").forEach((par) => {
      let linha = "";
      par.split(/\s+/).forEach((p) => {
        const t = linha ? linha + " " + p : p;
        if (cx.measureText(t).width > larg && linha) { out.push(linha); linha = p; } else linha = t;
      });
      out.push(linha);
    });
    return out;
  };
  const desenharVale = (item, ctx, pr, alturaFinal) => {
    const W = 1080, H = alturaFinal || 1600, P = 90, cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const c = cv.getContext("2d");
    const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#1B2538"); g.addColorStop(1, "#0F1623");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = "rgba(255,86,3,0.16)"; c.beginPath(); c.arc(W - 60, 80, 260, 0, Math.PI * 2); c.fill();
    const F = "-apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
    let y = 150;
    c.font = "800 34px " + F; const tag = "VALE-PRESENTE"; const tw = c.measureText(tag).width + 56;
    c.fillStyle = "rgba(255,86,3,0.22)"; c.beginPath(); if (c.roundRect) c.roundRect(P, y - 44, tw, 64, 32); else c.rect(P, y - 44, tw, 64); c.fill();
    c.fillStyle = "#FDBA74"; c.fillText(tag, P + 28, y);
    y += 120; c.fillStyle = "#fff"; c.font = "800 80px " + F;
    quebrar(c, item.titulo || "Presente", W - 2 * P).forEach((l) => { c.fillText(l, P, y); y += 92; });
    c.font = "500 38px " + F; c.fillStyle = "#CBD5E1";
    quebrar(c, ["com " + (item.profissional || ctx.personal || "Wellington Brito"), item.especialidade].filter(Boolean).join(" · "), W - 2 * P).forEach((l) => { c.fillText(l, P, y); y += 50; });
    y += 70; c.font = "500 38px " + F; c.fillStyle = "#94A3B8"; c.fillText("Para", P, y);
    y += 74; c.font = "800 64px " + F; c.fillStyle = "#fff"; c.fillText(pr.nome, P, y);
    if (pr.mensagem) {
      y += 60; c.font = "italic 500 42px " + F;
      const ls = quebrar(c, pr.mensagem, W - 2 * P - 70).slice(0, 5);
      const bh = ls.length * 56 + 50;
      c.fillStyle = "rgba(255,255,255,0.07)"; c.fillRect(P, y, W - 2 * P, bh);
      c.fillStyle = "#FF5603"; c.fillRect(P, y, 8, bh);
      c.fillStyle = "#F1F5F9"; ls.forEach((l, i) => c.fillText(l, P + 40, y + 66 + i * 56));
      y += bh;
    }
    y += 80; c.font = "500 40px " + F; c.fillStyle = "#CBD5E1"; c.fillText("Com carinho, " + primeiroNome(ctx.aluno), P, y);
    c.fillStyle = "rgba(255,255,255,0.14)"; c.fillRect(P, H - 170, W - 2 * P, 2);
    c.font = "500 34px " + F; c.fillStyle = "#94A3B8"; c.fillText("Já está pago. É só agendar.", P, H - 100);
    c.font = "800 42px " + F; c.fillStyle = "#FF5603"; c.textAlign = "right"; c.fillText("Longevus", W - P, H - 100);
    if (!alturaFinal) return desenharVale(item, ctx, pr, Math.max(1080, Math.ceil(y + 280)));
    return cv;
  };
  const Vale = ({ item, ctx, pr, onFechar }) => {
    const [salvo, setSalvo] = useState("");
    const msg = msgVale(item, ctx, pr);
    const wa = waLink(pr.whatsapp, msg) || "https://wa.me/?text=" + encodeURIComponent(msg);
    const avisoPersonal = waLink(item.whatsapp || ctx.personalWhats, "Oi, " + (primeiroNome(ctx.personal) || "Wellington") + "! Acabei de pagar pelo app: " + (item.titulo || "serviço") + ", de presente para " + pr.nome + ".");
    const salvar = () => {
      try {
        const cv = desenharVale(item, ctx, pr);
        cv.toBlob(async (blob) => {
          if (!blob) return;
          const nome = "vale-presente-" + primeiroNome(pr.nome).toLowerCase() + ".png";
          try {
            const file = new File([blob], nome, { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: msg }); setSalvo("ok"); return; }
          } catch (e) { if (e && e.name === "AbortError") return; }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 4000);
          setSalvo("ok");
        }, "image/png");
      } catch (e) {}
    };
    return h("div", { style: { position: "fixed", inset: 0, bottom: navAluno(), zIndex: 320, background: COR.fundo, overflowY: "auto", WebkitOverflowScrolling: "touch", color: COR.escuro, padding: "calc(22px + env(safe-area-inset-top)) 18px calc(26px + env(safe-area-inset-bottom))" } },
      h("div", { style: { textAlign: "center", marginBottom: 16 } },
        h("div", { style: { width: 52, height: 52, borderRadius: "50%", background: "#DCFCE7", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center" } }, h("svg", { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none", stroke: "#16A34A", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" }, h("path", { d: "M5 12l5 5L20 7" }))),
        h("div", { style: { fontSize: 19, fontWeight: 800 } }, "Pronto, " + (primeiroNome(ctx.aluno) || "tudo certo") + "!"),
        h("div", { style: { fontSize: 13.5, color: COR.cinza, marginTop: 3 } }, "Seu personal já recebeu o aviso. Agora é só entregar o presente.")),
      h("div", { style: { borderRadius: 22, background: "linear-gradient(160deg,#1B2538,#0F1623)", color: "#fff", padding: "22px 20px", position: "relative", overflow: "hidden" } },
        h("div", { style: { position: "absolute", right: -40, top: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,86,3,0.18)" } }),
        h("span", { style: { position: "relative", display: "inline-block", background: "rgba(255,86,3,0.18)", color: "#FDBA74", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", padding: "5px 10px", borderRadius: 20 } }, "VALE-PRESENTE"),
        h("div", { style: { position: "relative", fontSize: 23, fontWeight: 800, lineHeight: 1.2, margin: "14px 0 4px" } }, item.titulo),
        h("div", { style: { position: "relative", fontSize: 12.5, color: "#CBD5E1" } }, ["com " + (item.profissional || ctx.personal || "Wellington Brito"), item.especialidade].filter(Boolean).join(" · ")),
        h("div", { style: { marginTop: 18, fontSize: 12.5, color: "#94A3B8" } }, "Para", h("div", { style: { color: "#fff", fontSize: 20, fontWeight: 800, marginTop: 2 } }, pr.nome)),
        pr.mensagem ? h("div", { style: { marginTop: 12, background: "rgba(255,255,255,0.07)", borderLeft: "3px solid " + COR.laranja, borderRadius: 8, padding: "10px 12px", fontSize: 14.5, fontStyle: "italic", color: "#F1F5F9", whiteSpace: "pre-wrap" } }, pr.mensagem) : null,
        h("div", { style: { marginTop: 14, fontSize: 13, color: "#CBD5E1" } }, "Com carinho, ", h("b", { style: { color: "#fff" } }, primeiroNome(ctx.aluno))),
        h("div", { style: { height: 1, background: "rgba(255,255,255,0.12)", margin: "16px 0 10px" } }),
        h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#94A3B8" } }, h("span", null, "Já está pago. É só agendar."), h("b", { style: { color: COR.laranja, fontSize: 14 } }, "Longevus"))),
      h("div", { style: { marginTop: 14, background: "#E9F5F2", borderRadius: 12, padding: 12, fontSize: 13, lineHeight: 1.5, color: COR.verde, whiteSpace: "pre-wrap" } }, h("div", { style: { fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", marginBottom: 4 } }, "VAI JUNTO NO WHATSAPP"), msg),
      h("a", { href: wa, target: "_blank", rel: "noopener noreferrer", style: { display: "block", marginTop: 14, height: 50, lineHeight: "50px", textAlign: "center", borderRadius: 25, background: "#16A34A", color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none" } }, "Enviar vale pelo WhatsApp"),
      h("button", { type: "button", onClick: salvar, style: { display: "block", width: "100%", marginTop: 8, height: 46, borderRadius: 23, border: "1.5px solid " + COR.borda, background: "#fff", color: COR.escuro, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, salvo ? "Imagem do vale pronta" : "Salvar imagem do vale"),
      avisoPersonal ? h("a", { href: avisoPersonal, target: "_blank", rel: "noopener noreferrer", style: { display: "block", marginTop: 12, textAlign: "center", fontSize: 13, color: COR.cinza, fontWeight: 600 } }, "Falar com meu personal") : null,
      h("button", { type: "button", onClick: onFechar, style: { display: "block", margin: "8px auto 0", background: "transparent", border: "none", color: COR.cinza, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: 8 } }, "Concluir"));
  };
  const PixPagamento = ({ item, ctx, ownerId, studentId, soPresente }) => {
    const qr = useRef(null);
    const [copiado, setCopiado] = useState(false);
    const [avisado, setAvisado] = useState(false);
    const [para, setPara] = useState(soPresente ? "presente" : "mim");
    const [pr, setPr] = useState({ nome: "", whatsapp: "", mensagem: "" });
    const [erro, setErro] = useState("");
    const [vale, setVale] = useState(null);
    const [valeAberto, setValeAberto] = useState(false);
    const aceita = soPresente || item.cobranca === "plano" || item.aceitaPresente !== false;
    const presente = aceita && para === "presente";
    const px = window.__LV_PIX;
    const valor = valorPix(item);
    const prof = px && px.prof;
    const payload = prof && prof.pix_key && px.build ? px.build({ pixKey: prof.pix_key, merchantName: prof.pix_merchant_name || prof.nome, merchantCity: prof.pix_merchant_city, amount: valor, txid: ("SV" + String(item.titulo || "").replace(/[^A-Za-z0-9]/g, "")).slice(0, 20) }) : null;
    useEffect(() => {
      if (payload && qr.current && window.QRCode) {
        qr.current.innerHTML = "";
        new window.QRCode(qr.current, { text: payload, width: 160, height: 160, colorDark: "#0f172a", colorLight: "#ffffff" });
      }
    }, [payload]);
    const copiar = () => { try { navigator.clipboard.writeText(payload).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 2500); }); } catch (e) {} };
    const msg = "Oi, " + primeiroNome(ctx.personal) + "! Acabei de pagar pelo app: " + (item.titulo || "serviço") + ". Quando podemos agendar?";
    const wa = waLink(item.whatsapp || ctx.personalWhats, msg);
    const enviarAviso = (dadosPresente) => {
      api.registrar(ownerId, item.id, studentId, dadosPresente ? "presente" : "pagou");
      (async () => {
        try {
          const hd = { ...(await api.headers()), Prefer: "return=minimal" };
          const corpo = { id: novoId("av"), owner_id: String(ownerId), student_id: String(studentId), servico: item.produto === "mente" ? "Mente Ativa" : item.produto === "l360" ? (item.titulo || "Longevus 360") : (item.titulo || "Serviço") };
          const comItem = item.produto ? corpo : { ...corpo, item_id: item.id };
          let r = await fetch(SUPA_URL + "/rest/v1/l360_avisos", { method: "POST", headers: hd, body: JSON.stringify(dadosPresente ? { ...comItem, presente: dadosPresente } : comItem) });
          if (!r.ok && !item.produto) r = await fetch(SUPA_URL + "/rest/v1/l360_avisos", { method: "POST", headers: hd, body: JSON.stringify(dadosPresente ? { ...corpo, presente: dadosPresente } : corpo) });
          if (!r.ok && dadosPresente) await fetch(SUPA_URL + "/rest/v1/l360_avisos", { method: "POST", headers: hd, body: JSON.stringify({ ...corpo, servico: corpo.servico + " (presente para " + dadosPresente.nome + (dadosPresente.whatsapp ? ", " + dadosPresente.whatsapp : "") + ")" }) });
        } catch (e) {}
      })();
    };
    const avisar = () => { setAvisado(true); enviarAviso(null); };
    const avisarPresente = () => {
      const nome = pr.nome.trim().replace(/\s+/g, " ");
      if (!nome) return setErro("Escreva o nome de quem vai ganhar.");
      const dg = pr.whatsapp.replace(/\D/g, "");
      if (dg && dg.length < 10) return setErro("Confira o WhatsApp, faltam números.");
      setErro("");
      const wf = dg ? fmtWhats(dg) : "";
      if (vale && vale.nome === nome && vale.whatsapp === wf) { setVale({ ...vale, mensagem: pr.mensagem.trim() }); setValeAberto(true); return; }
      const dados = { nome, whatsapp: dg ? fmtWhats(dg) : "", mensagem: pr.mensagem.trim() };
      enviarAviso(dados);
      setAvisado(true);
      setVale(dados);
      setValeAberto(true);
    };
    const tit = (t) => h("div", { style: { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", color: COR.cinza, textTransform: "uppercase", margin: "18px 0 8px" } }, t);
    const inp = { width: "100%", boxSizing: "border-box", border: "1.5px solid #CBD5E1", borderRadius: 10, padding: "11px 12px", fontSize: 15, color: COR.escuro, background: "#F8FAFC", fontFamily: "inherit", outline: "none" };
    const rot = (t) => h("div", { style: { fontSize: 12, fontWeight: 700, color: COR.cinza, marginBottom: 5 } }, t);
    const segBtn = (k, rotulo, icone) => h("button", { type: "button", onClick: () => { setPara(k); setErro(""); }, style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 9, border: "none", background: para === k ? "#fff" : "transparent", color: para === k ? COR.laranja : "#475569", boxShadow: para === k ? "0 1px 3px rgba(0,0,0,0.1)" : "none", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, icone, rotulo);
    return h("div", null,
      aceita ? h("div", null,
        soPresente ? null : tit("Para quem é?"),
        soPresente ? null : h("div", { style: { display: "flex", background: COR.borda, borderRadius: 12, padding: 4 } }, segBtn("mim", "Para mim"), segBtn("presente", "Presente", h(IcPresente, { cor: para === "presente" ? COR.laranja : "#475569" }))),
        presente ? h("div", { style: { background: "#fff", border: "1.5px solid " + COR.borda, borderRadius: 16, padding: 14, marginTop: 12 } },
          h("div", { style: { marginBottom: 12 } }, rot("Nome de quem vai ganhar"), h("input", { value: pr.nome, onChange: (e) => setPr({ ...pr, nome: e.target.value }), placeholder: "Ex.: Maria Souza", autoComplete: "off", style: inp })),
          h("div", { style: { marginBottom: 12 } }, rot("WhatsApp dessa pessoa"), h("input", { value: pr.whatsapp, onChange: (e) => setPr({ ...pr, whatsapp: fmtWhats(e.target.value) }), placeholder: "(11) 90000-0000", inputMode: "tel", autoComplete: "off", style: inp })),
          h("div", null, rot("Mensagem no vale (opcional)"), h("textarea", { value: pr.mensagem, onChange: (e) => setPr({ ...pr, mensagem: e.target.value.slice(0, 160) }), rows: 2, placeholder: "Ex.: Feliz aniversário, mãe!", style: { ...inp, resize: "none", lineHeight: 1.4 } })),
          h("div", { style: { fontSize: 12, color: COR.cinza, lineHeight: 1.45, marginTop: 8 } }, "Depois do pagamento você recebe um vale-presente para enviar pelo WhatsApp.")) : null) : null,
      tit(presente ? "Pagamento do presente" : item.produto === "mente" || item.cobranca === "plano" ? "Assinatura mensal" : "Pagamento"),
      h("div", { style: { background: "#fff", border: "1.5px solid " + COR.borda, borderRadius: 16, padding: 14, textAlign: "center" } },
        h("div", { style: { fontSize: 12, color: COR.cinza } }, "Valor"),
        h("div", { style: { fontSize: 26, fontWeight: 800, color: COR.escuro, marginBottom: 10 } }, fmtReal(valor)),
        payload ? h("div", null,
          h("div", { ref: qr, style: { display: "flex", justifyContent: "center", marginBottom: 10 } }),
          h("button", { type: "button", onClick: copiar, style: { width: "100%", height: 44, borderRadius: 22, border: "none", background: copiado ? "#16A34A" : COR.laranja, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, copiado ? "Código copiado" : "Copiar código Pix"),
          h("div", { style: { fontSize: 11.5, color: "#94A3B8", marginTop: 8 } }, "Escaneie no app do banco ou cole o código no Pix copia e cola."))
          : h("div", { style: { fontSize: 12.5, color: "#92400E", background: "#FEF9C3", borderRadius: 10, padding: "9px 10px" } }, "O Pix ainda não está configurado. Fale com seu personal pelo WhatsApp."),
        item.posPagamento ? h("div", { style: { fontSize: 12.5, color: "#334155", marginTop: 12, lineHeight: 1.5, textAlign: "left", background: COR.fundo, borderRadius: 10, padding: "9px 11px" } }, presente ? "Assim que o pagamento for confirmado, seu personal chama " + (primeiroNome(pr.nome) || "a pessoa") + " para agendar." : item.posPagamento) : null),
      erro ? h("div", { role: "alert", style: { marginTop: 10, fontSize: 13, color: "#B91C1C", background: "#FEF2F2", borderRadius: 10, padding: "9px 11px" } }, erro) : null,
      presente
        ? h("button", { type: "button", onClick: avisarPresente, style: { display: "block", width: "100%", marginTop: 10, height: 46, borderRadius: 23, border: "none", background: "#16A34A", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, avisado && vale ? "Ver vale-presente" : "Já paguei, gerar o vale")
        : (wa ? h("a", { href: wa, target: "_blank", rel: "noopener noreferrer", onClick: avisar, style: { display: "block", marginTop: 10, height: 46, lineHeight: "46px", textAlign: "center", borderRadius: 23, background: avisado ? "#F0FDF4" : "#16A34A", color: avisado ? "#15803D" : "#fff", border: avisado ? "1.5px solid #BBF7D0" : "none", fontWeight: 800, fontSize: 14, textDecoration: "none" } }, avisado ? "Aviso enviado ao seu personal" : "Avisar que já paguei") : null),
      item.produto === "mente" ? h("a", { href: "longevus-hub.html?aluno=1", style: { display: "flex", alignItems: "center", gap: 10, marginTop: 14, background: "#fff", border: "1.5px solid " + COR.borda, borderRadius: 14, padding: "11px 13px", textDecoration: "none", color: COR.escuro } },
        h("span", { style: { width: 38, height: 38, borderRadius: 12, background: "linear-gradient(145deg,#FFB37A,#FF5603)", boxShadow: "0 5px 12px rgba(255,86,3,0.33), inset 0 2px 0 rgba(255,255,255,0.5), inset 0 -3px 0 rgba(0,0,0,0.12)", fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, "🎨"),
        h("span", { style: { flex: 1 } }, h("span", { style: { display: "block", fontSize: 13.5, fontWeight: 800 } }, "Quer conhecer antes?"), h("span", { style: { display: "block", fontSize: 11.5, color: COR.cinza } }, "Jogue o Gênio das Cores grátis")),
        h("span", { style: { color: COR.laranjaTxt || "#C2410C", fontWeight: 800, fontSize: 13 } }, "Jogar ›")) : null,
      vale && valeAberto ? h(Vale, { item, ctx, pr: vale, onFechar: () => setValeAberto(false) }) : null);
  };
  const publicoOk = (d, ctx) => {
    if (d.validade && d.validade < hojeISO()) return false;
    if (d.produto === "mente" && !ctx.menteBloq) return false;
    const p = d.publico || "todos";
    if (p === "todos") return true;
    if (p === "mulheres") return ctx.sexo === "F";
    if (p === "homens") return ctx.sexo === "M";
    if (p === "50mais") return ctx.idade !== null && ctx.idade >= 50;
    if (p === "menos50") return ctx.idade !== null && ctx.idade < 50;
    if (p === "sem360") return !!ctx.sem360;
    return true;
  };

  const api = {
    async headers() {
      let token = SUPA_KEY;
      try {
        const r = await supa().auth.getSession();
        token = (r && r.data && r.data.session && r.data.session.access_token) || SUPA_KEY;
      } catch (e) {}
      return { apikey: SUPA_KEY, Authorization: "Bearer " + token, "Content-Type": "application/json" };
    },
    async uid() {
      try {
        const r = await supa().auth.getSession();
        return (r && r.data && r.data.session && r.data.session.user && r.data.session.user.id) || null;
      } catch (e) {
        return null;
      }
    },
    async listar(ownerId, soAtivos) {
      try {
        const hd = await this.headers();
        let url = SUPA_URL + "/rest/v1/vitrine_itens?select=id,data,ativo,ordem,updated_at&owner_id=eq." + encodeURIComponent(ownerId) + "&order=ordem.asc,updated_at.desc";
        if (soAtivos) url += "&ativo=eq.true";
        const r = await fetch(url, { headers: hd });
        if (!r.ok) return null;
        const rows = await r.json();
        return (rows || []).map((x) => ({ ...(x.data || {}), id: x.id, ativo: x.ativo, ordem: x.ordem }));
      } catch (e) {
        return null;
      }
    },
    async salvar(ownerId, item) {
      try {
        const hd = { ...(await this.headers()), Prefer: "resolution=merge-duplicates" };
        const { id, ativo, ordem, ...data } = item;
        const r = await fetch(SUPA_URL + "/rest/v1/vitrine_itens", { method: "POST", headers: hd, body: JSON.stringify({ id, owner_id: String(ownerId), data, ativo: ativo !== false, ordem: ordem || 0, updated_at: new Date().toISOString() }) });
        return r.ok;
      } catch (e) {
        return false;
      }
    },
    async remover(id) {
      try {
        const hd = { ...(await this.headers()), Prefer: "return=representation" };
        const r = await fetch(SUPA_URL + "/rest/v1/vitrine_itens?id=eq." + encodeURIComponent(id), { method: "DELETE", headers: hd });
        if (!r.ok) return false;
        const rows = await r.json().catch(() => []);
        return Array.isArray(rows) && rows.length > 0;
      } catch (e) {
        return false;
      }
    },
    async registrar(ownerId, itemId, studentId, tipo) {
      if (!ownerId || !studentId || !itemId) return;
      try {
        const hd = { ...(await this.headers()), Prefer: "return=minimal" };
        await fetch(SUPA_URL + "/rest/v1/vitrine_cliques", { method: "POST", headers: hd, body: JSON.stringify({ id: novoId("vc"), owner_id: String(ownerId), item_id: String(itemId), student_id: String(studentId), tipo }) });
      } catch (e) {}
    },
    async metricas(ownerId, desdeISO) {
      try {
        const hd = await this.headers();
        const r = await fetch(SUPA_URL + "/rest/v1/vitrine_cliques?select=item_id,tipo,student_id&owner_id=eq." + encodeURIComponent(ownerId) + "&created_at=gte." + desdeISO + "&limit=5000", { headers: hd });
        if (!r.ok) return null;
        const rows = await r.json();
        const out = {};
        (rows || []).forEach((x) => {
          const m = out[x.item_id] || (out[x.item_id] = { viram: {}, abriram: {}, cliques: 0 });
          if (x.tipo === "view") m.viram[x.student_id] = true;
          else if (x.tipo === "abriu") m.abriram[x.student_id] = true;
          else m.cliques++;
        });
        Object.keys(out).forEach((k) => { out[k].viram = Object.keys(out[k].viram).length; out[k].abriram = Object.keys(out[k].abriram).length; });
        return out;
      } catch (e) {
        return null;
      }
    }
  };

  const registrarVisto = (ownerId, studentId, itemId) => {
    const chave = "lv_vit_" + itemId + "_" + hojeISO();
    try {
      if (window.localStorage.getItem(chave)) return;
      window.localStorage.setItem(chave, "1");
    } catch (e) {}
    api.registrar(ownerId, itemId, studentId, "view");
  };

  const Selo = ({ tipo }) => h("span", { style: { alignSelf: "flex-start", fontSize: 10.5, fontWeight: 800, borderRadius: 10, padding: "3px 9px", background: tipo === "parceiro" ? "#E9F5F2" : "#3A2418", color: tipo === "parceiro" ? COR.verde : "#F5A37C" } }, tipo === "parceiro" ? "Parceiro" : "Do seu personal");
  const Icone = ({ item, tam }) => {
    const c = item.tipo === "parceiro" ? categoria(item.categoria) : [null, null, "#FFF4EE", COR.laranja];
    const s = tam || 36;
    if (item.foto) return h("img", { src: item.foto, alt: "", style: { width: s, height: s, borderRadius: Math.round(s * 0.32), objectFit: "cover", flexShrink: 0, background: c[2] } });
    return h("span", { "aria-hidden": "true", style: { width: s, height: s, borderRadius: Math.round(s * 0.32), background: c[2], color: c[3], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: Math.round(s * 0.42), flexShrink: 0 } }, (item.titulo || "?").trim().charAt(0).toUpperCase());
  };

  const BotaoVoltar = ({ onClick, rotulo }) => h("button", { type: "button", onClick, style: { display: "inline-flex", alignItems: "center", gap: 6, height: 40, padding: "0 16px 0 10px", borderRadius: 20, border: "1.5px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.10)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } },
    h("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, h("path", { d: "M15 18l-6-6 6-6" })), rotulo || "Voltar");
  const ATENDIMENTO = [["presencial", "Presencial"], ["online", "Online"], ["ambos", "Presencial e online"]];
  const instaLink = (v) => {
    const t = String(v || "").trim();
    if (!t) return null;
    if (/^https?:\/\//.test(t)) return t;
    return "https://instagram.com/" + t.replace(/^@/, "");
  };
  const liberado = (ctx, d) => {
    if (!d || d.tipo === "parceiro" || d.produto || !ctx || !ctx.servicos) return null;
    const s = ctx.servicos[d.id];
    return s && (s.status === "bonus" || s.status === "pago") ? s.status : null;
  };
  const Liberado = ({ item, ctx, status, onClique }) => {
    const pers = primeiroNome(ctx.personal) || "Wellington";
    const msg = status === "bonus" ? "Oi, " + pers + "! Vi no app que ganhei de bônus: " + (item.titulo || "um serviço") + ". Quando podemos agendar?" : "Oi, " + pers + "! Quero agendar: " + (item.titulo || "meu serviço") + ". Quais horários você tem?";
    const wa = waLink(item.whatsapp || ctx.personalWhats, msg);
    return h("div", { style: { marginTop: 18, background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 16, padding: 16, textAlign: "center" } },
      h("div", { style: { fontSize: 30, lineHeight: 1, marginBottom: 8 } }, status === "bonus" ? "🎁" : "✅"),
      h("div", { style: { fontSize: 17, fontWeight: 800, color: "#14532D" } }, status === "bonus" ? "Presente do seu personal" : "Pagamento confirmado"),
      h("div", { style: { fontSize: 13, color: "#166534", lineHeight: 1.5, marginTop: 4 } }, status === "bonus" ? "Este serviço é um bônus para você. Não precisa pagar nada." : "Este serviço já é seu."),
      h("div", { style: { fontSize: 13, color: "#166534", lineHeight: 1.5 } }, "Agora é só combinar o melhor dia."),
      wa ? h("a", { href: wa, target: "_blank", rel: "noopener noreferrer", onClick: onClique, style: { display: "block", marginTop: 14, height: 48, lineHeight: "48px", borderRadius: 24, background: "#16A34A", color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none" } }, "Agendar pelo WhatsApp") : null);
  };
  const MSG_INDIQUE = "Oi, {amigo}! Tudo bem?\n\nEstou treinando com o {personal}, meu personal trainer, e tenho gostado muito dos resultados. Lembrei de você!\n\nPor indicação minha, você ganha {beneficio} para conhecer o trabalho dele, sem compromisso.\n\nPassei seu contato para ele, tá? Ele vai te chamar aqui no WhatsApp para combinar o melhor horário. 😊";
  const msgIndique = (tpl, v) => String(tpl && tpl.trim() ? tpl : MSG_INDIQUE).replace(/\{(amigo|aluno|personal|beneficio)\}/g, (m, k) => (k === "beneficio" ? (v.beneficio ? "*" + v.beneficio + "*" : "um presente") : (v[k] || "")));
  const ST_INDIC = { enviado: ["Convite enviado", "#F1F5F9", "#64748B"], conversa: ["Em conversa", "#FFEDD5", "#C2410C"], aluno: ["🎁 Prêmio liberado", "#DCFCE7", "#15803D"], descartado: ["Não fechou", "#F1F5F9", "#94A3B8"] };
  const IndiqueTela = ({ item, ctx, ownerId, studentId, onFechar }) => {
    const [lista, setLista] = useState(null);
    const [f, setF] = useState({ nome: "", whatsapp: "" });
    const [erro, setErro] = useState("");
    const [enviado, setEnviado] = useState("");
    const premio = (item.premio && item.premio.nome) || "um prêmio";
    const benef = (item.beneficio && item.beneficio.nome) || "";
    const pers = primeiroNome(ctx.personal) || "Wellington";
    const carregar = async () => {
      try {
        const r = await fetch(SUPA_URL + "/rest/v1/indicacoes?select=id,nome,status,created_at&student_id=eq." + encodeURIComponent(studentId) + "&order=created_at.desc&limit=50", { headers: await api.headers() });
        setLista(r.ok ? await r.json() : []);
      } catch (e) { setLista([]); }
    };
    useEffect(() => { carregar(); }, []);
    const enviar = () => {
      const nome = f.nome.trim().replace(/\s+/g, " ");
      const dg = f.whatsapp.replace(/\D/g, "");
      if (!nome) return setErro("Escreva o nome de quem você quer indicar.");
      if (dg.length < 10) return setErro("Confira o WhatsApp, faltam números.");
      setErro("");
      const row = { id: novoId("in"), owner_id: String(ownerId), student_id: String(studentId), nome, whatsapp: fmtWhats(dg), status: "enviado", premio: item.premio || null };
      (async () => { try { await fetch(SUPA_URL + "/rest/v1/indicacoes", { method: "POST", headers: { ...(await api.headers()), Prefer: "return=minimal" }, body: JSON.stringify(row) }); } catch (e) {} })();
      setLista((p) => [{ ...row, created_at: new Date().toISOString() }].concat(p || []));
      const msg = msgIndique(item.mensagem, { amigo: primeiroNome(nome), aluno: primeiroNome(ctx.aluno), personal: ctx.personal || "Wellington Brito", beneficio: benef });
      const wa = waLink(dg, msg);
      setEnviado(primeiroNome(nome));
      setF({ nome: "", whatsapp: "" });
      if (wa) window.open(wa, "_blank");
    };
    const inp = { width: "100%", boxSizing: "border-box", border: "1.5px solid #CBD5E1", borderRadius: 10, padding: "11px 12px", fontSize: 15, color: COR.escuro, background: "#F8FAFC", fontFamily: "inherit", outline: "none", marginBottom: 10 };
    const sec = (t) => h("div", { style: { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", color: COR.cinza, textTransform: "uppercase", margin: "18px 0 8px" } }, t);
    const card = { background: "#fff", borderRadius: 16, padding: 14, boxShadow: "0 1px 3px rgba(15,23,42,0.08)" };
    const passo = (n, t) => h("div", { style: { display: "flex", gap: 11, alignItems: "flex-start", padding: "7px 0", fontSize: 13.5, lineHeight: 1.45, color: "#334155" } }, h("b", { style: { width: 26, height: 26, borderRadius: 13, background: "#FFF4EE", color: COR.laranja, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 } }, n), h("span", null, t));
    return h("div", { style: { position: "fixed", inset: 0, bottom: navAluno(), zIndex: 310, background: COR.fundo, overflowY: "auto", WebkitOverflowScrolling: "touch", color: COR.escuro } },
      h("div", { style: { background: COR.escuro, color: "#F8FAFC", padding: "calc(14px + env(safe-area-inset-top)) 18px 20px", borderRadius: "0 0 26px 26px" } },
        h(BotaoVoltar, { onClick: onFechar }),
        h("div", { style: { display: "flex", gap: 12, alignItems: "center", marginTop: 14 } },
          h("span", { style: { width: 56, height: 56, borderRadius: 17, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0, background: "linear-gradient(145deg,#FFB37A,#FF5603)", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -4px 0 rgba(0,0,0,0.12), 0 6px 14px rgba(255,86,3,0.35)" } }, "🎁"),
          h("div", null, h("div", { style: { fontSize: 21, fontWeight: 800, lineHeight: 1.15 } }, "Indique e ganhe"), h("div", { style: { fontSize: 12.5, color: "#CBD5E1", marginTop: 2 } }, "Quem cuida de si indica quem gosta"))),
        h("div", { style: { display: "flex", gap: 8, marginTop: 14 } },
          h("div", { style: { flex: 1, background: COR.escuro2, border: "1.5px solid " + COR.laranja, borderRadius: 12, padding: "9px 11px" } }, h("div", { style: { fontSize: 10.5, color: "#94A3B8" } }, "VOCÊ GANHA"), h("div", { style: { fontSize: 14, fontWeight: 800, color: "#FDBA74", lineHeight: 1.25 } }, premio)),
          benef ? h("div", { style: { flex: 1, background: COR.escuro2, borderRadius: 12, padding: "9px 11px" } }, h("div", { style: { fontSize: 10.5, color: "#94A3B8" } }, "SEU AMIGO GANHA"), h("div", { style: { fontSize: 14, fontWeight: 800, lineHeight: 1.25 } }, benef)) : null)),
      h("div", { style: { padding: "2px 16px calc(30px + env(safe-area-inset-bottom))" } },
        sec("Como funciona"),
        h("div", { style: { ...card, padding: "6px 14px" } },
          passo(1, "Você coloca o nome e o WhatsApp de quem quer indicar."),
          passo(2, "O convite vai pelo seu WhatsApp, e o " + pers + " entra em contato."),
          passo(3, "Quando seu amigo virar aluno, seu prêmio é liberado no app.")),
        sec("Indicar alguém"),
        h("div", { style: card },
          h("input", { value: f.nome, onChange: (e) => setF({ ...f, nome: e.target.value }), placeholder: "Nome do seu amigo", autoComplete: "off", style: inp }),
          h("input", { value: f.whatsapp, onChange: (e) => setF({ ...f, whatsapp: fmtWhats(e.target.value) }), placeholder: "WhatsApp: (11) 90000-0000", inputMode: "tel", autoComplete: "off", style: inp }),
          erro ? h("div", { role: "alert", style: { fontSize: 13, color: "#B91C1C", background: "#FEF2F2", borderRadius: 10, padding: "9px 11px", marginBottom: 10 } }, erro) : null,
          enviado ? h("div", { style: { fontSize: 13, color: "#15803D", background: "#F0FDF4", borderRadius: 10, padding: "9px 11px", marginBottom: 10 } }, "Convite para " + enviado + " registrado. Pode indicar mais alguém!") : null,
          h("button", { type: "button", onClick: enviar, style: { width: "100%", height: 50, borderRadius: 14, border: "none", background: "#16A34A", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" } }, "Enviar convite pelo WhatsApp")),
        lista && lista.length ? h("div", null, sec("Suas indicações"),
          h("div", { style: { ...card, padding: "2px 14px" } }, lista.map((x, i) => { const st = ST_INDIC[x.status] || ST_INDIC.enviado; return h("div", { key: x.id, style: { display: "flex", alignItems: "center", gap: 10, padding: "11px 0", borderTop: i ? "1px solid #F1F5F9" : "none", fontSize: 14 } }, h("b", null, x.nome), h("span", { style: { marginLeft: "auto", fontSize: 11.5, fontWeight: 800, borderRadius: 10, padding: "4px 9px", whiteSpace: "nowrap", background: st[1], color: st[2] } }, st[0])); }))) : null));
  };
  const linkElo = (entrar) => window.location.origin + window.location.pathname.replace(/[^/]*$/, "") + "elo60.html" + (entrar ? "?entrar=1" : "");
  const EloTela = ({ item, ctx, onFechar, onClique, ownerId, studentId }) => {
    const d = item;
    const [eloPresente, setEloPresente] = useState(false);
    const [jornada, setJornada] = useState(undefined);
    const [linkOk, setLinkOk] = useState(false);
    useEffect(() => {
      let vivo = true;
      (async () => {
        try {
          const r = await fetch(SUPA_URL + "/rest/v1/rpc/ma_minha_jornada", { method: "POST", headers: await api.headers(), body: "{}" });
          const j = r.ok ? await r.json() : null;
          if (vivo) setJornada(j && j.matricula_id ? j : null);
        } catch (e) { if (vivo) setJornada(null); }
      })();
      return () => { vivo = false; };
    }, []);
    const lista = String(d.inclui || "").split("\n").map((x) => x.trim()).filter(Boolean);
    const preco = d.preco || "R$ 19,90";
    const pers = primeiroNome(ctx.personal) || "Wellington";
    const textoPresente = "Olha que legal! O " + (d.titulo || "Elo 60+") + " do " + pers + ", meu personal: 30 dias de exercícios e jogos para a mente, em casa, 15 minutos por dia, por " + preco + ". Começa por aqui: " + linkElo(false);
    const presentear = async () => {
      if (onClique) onClique();
      try { if (navigator.share) { await navigator.share({ title: d.titulo || "Elo 60+", text: textoPresente }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
      window.location.href = "https://wa.me/?text=" + encodeURIComponent(textoPresente);
    };
    const copiar = async () => { try { await navigator.clipboard.writeText(linkElo(false)); setLinkOk(true); setTimeout(() => setLinkOk(false), 2500); } catch (e) { window.prompt("Copie o link:", linkElo(false)); } };
    const secao = (t) => h("div", { style: { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", color: COR.cinza, textTransform: "uppercase", margin: "18px 0 8px" } }, t);
    const botao = { display: "block", width: "100%", boxSizing: "border-box", height: 50, lineHeight: "50px", textAlign: "center", borderRadius: 25, fontWeight: 800, fontSize: 15, textDecoration: "none", cursor: "pointer", fontFamily: "inherit" };
    const dia = jornada ? Math.min(30, Number(jornada.dias_concluidos || 0) + 1) : null;
    return h("div", { style: { position: "fixed", inset: 0, bottom: navAluno(), zIndex: 310, background: COR.fundo, overflowY: "auto", WebkitOverflowScrolling: "touch", color: COR.escuro } },
      h("div", { style: { background: COR.escuro, color: "#F8FAFC", padding: "calc(14px + env(safe-area-inset-top)) 18px 20px", borderRadius: "0 0 26px 26px" } },
        h(BotaoVoltar, { onClick: onFechar }),
        h("div", { style: { display: "flex", alignItems: "center", gap: 14, marginTop: 10 } },
          h(Icone, { item: d, tam: 64 }),
          h("div", { style: { minWidth: 0 } },
            h(Selo, { tipo: "proprio" }),
            h("div", { style: { fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginTop: 6 } }, d.titulo || "Elo 60+"),
            h("div", { style: { fontSize: 13, color: "#CBD5E1", marginTop: 2 } }, d.texto || "Corpo e mente em casa, 15 minutos por dia."))),
        h("div", { style: { marginTop: 14, background: COR.escuro2, border: "1.5px solid " + COR.laranja, borderRadius: 14, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 } },
          h("div", null, h("div", { style: { fontSize: 11, color: "#94A3B8" } }, "Jornada completa"), h("div", { style: { fontSize: 18, fontWeight: 800, color: "#FDBA74" } }, "30 dias")),
          h("div", { style: { fontSize: 20, fontWeight: 800 } }, preco))),
      h("div", { style: { padding: "2px 18px calc(30px + env(safe-area-inset-bottom))" } },
        d.sobre ? h("div", null, secao("Sobre"), h("div", { style: { fontSize: 14.5, lineHeight: 1.6, color: "#334155", whiteSpace: "pre-wrap" } }, d.sobre)) : null,
        lista.length ? h("div", null, secao("O que está incluso"), lista.map((x, i) => h("div", { key: i, style: { display: "flex", gap: 9, alignItems: "flex-start", fontSize: 14.5, lineHeight: 1.45, marginBottom: 7 } }, h("span", { "aria-hidden": "true", style: { color: COR.laranja, fontWeight: 800 } }, "✓"), h("span", null, x)))) : null,
        h("div", { style: { marginTop: 18, display: "flex", flexDirection: "column", gap: 10 } },
          jornada === undefined ? h("div", { style: { textAlign: "center", color: "#94A3B8", fontSize: 13.5, padding: 10 } }, "Carregando...") :
          jornada ? h("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
            h("div", { style: { background: "#F0FDF4", color: "#15803D", borderRadius: 14, padding: "12px 14px", fontSize: 14.5, fontWeight: 700, lineHeight: 1.45 } }, Number(jornada.dias_concluidos || 0) >= 30 ? "Você já concluiu os 30 dias do " + (d.titulo || "Elo 60+") + "." : "Você já está no " + (d.titulo || "Elo 60+") + ". Seu próximo é o dia " + dia + "."),
            h("a", { href: linkElo(false) + "?ctx=aluno", onClick: onClique, style: { ...botao, background: COR.laranja, color: "#fff" } }, "Continuar no " + (d.titulo || "Elo 60+"))) :
          h("div", { style: { marginTop: -18 } },
            h(PixPagamento, { item: { ...d, produto: "elo", valor: valorNum(preco), aceitaPresente: true, posPagamento: d.posPagamento || "Assim que eu confirmar o pagamento, o seu acesso ao Elo 60+ é liberado. Depois é só tocar em Entrar no Elo 60+." }, ctx, ownerId, studentId }),
            h("a", { href: linkElo(true) + "&ctx=aluno", onClick: onClique, style: { ...botao, marginTop: 10, border: "1.5px solid " + COR.borda, background: "#fff", color: COR.escuro } }, "Entrar no " + (d.titulo || "Elo 60+")),
            h("div", { style: { fontSize: 12, color: COR.cinza, lineHeight: 1.5, textAlign: "center", marginTop: 6 } }, "Use o mesmo e-mail e senha do seu app."),
            h("button", { type: "button", onClick: presentear, style: { background: "transparent", border: "none", color: COR.cinza, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", padding: 8, width: "100%", textDecoration: "underline" } }, "Prefere mandar o link para a pessoa comprar?")),
          h("button", { type: "button", onClick: copiar, style: { background: "transparent", border: "none", color: COR.laranjaTxt, fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit", padding: 6 } }, linkOk ? "Link copiado" : "Copiar o link do " + (d.titulo || "Elo 60+")))));
  };
  const Detalhe = ({ item, ctx, onFechar, onClique, ownerId, studentId }) => {
    if (item && item.produto === "indique") return h(IndiqueTela, { item, ctx, ownerId, studentId, onFechar });
    if (item && item.produto === "elo") return h(EloTela, { item, ctx, onFechar, onClique, ownerId, studentId });
    const d = item;
    const parceiro = d.tipo === "parceiro";
    const lib = liberado(ctx, d);
    const pix = ehPix(d) && !lib;
    const plano = ehPlano(d) && !lib;
    const href = pix || lib || plano ? null : linkDoItem(d, ctx);
    const [copiado, setCopiado] = useState(false);
    const [linkOk, setLinkOk] = useState(false);
    const enviarAmigo = async () => {
      const url = linkPlano(d.planoSlug);
      try { if (navigator.share) { await navigator.share({ title: d.titulo, text: "Conheça " + (d.titulo || "este plano") + " com " + (ctx.personal || "meu personal") + ":", url }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
      try { await navigator.clipboard.writeText(url); setLinkOk(true); setTimeout(() => setLinkOk(false), 3000); } catch (e) { window.prompt("Copie o link:", url); }
    };
    const lista = String(d.inclui || "").split("\n").map((x) => x.trim()).filter(Boolean);
    const insta = instaLink(d.instagram);
    const at = (ATENDIMENTO.find((a) => a[0] === d.atendimento) || [null, null])[1];
    const secao = (t) => h("div", { style: { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", color: COR.cinza, textTransform: "uppercase", margin: "18px 0 8px" } }, t);
    const copiar = () => { try { navigator.clipboard.writeText(d.cupom).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 2000); }); } catch (e) {} };
    return h("div", { style: { position: "fixed", inset: 0, bottom: navAluno(), zIndex: 310, background: COR.fundo, overflowY: "auto", WebkitOverflowScrolling: "touch", color: COR.escuro } },
      h("div", { style: { background: COR.escuro, color: "#F8FAFC", padding: "calc(14px + env(safe-area-inset-top)) 18px 20px", borderRadius: "0 0 26px 26px" } },
        h(BotaoVoltar, { onClick: onFechar }),
        h("div", { style: { display: "flex", alignItems: "center", gap: 14, marginTop: 10 } },
          h(Icone, { item: d, tam: 64 }),
          h("div", { style: { minWidth: 0 } },
            h(Selo, { tipo: d.tipo }),
            h("div", { style: { fontSize: 20, fontWeight: 800, lineHeight: 1.2, marginTop: 6 } }, parceiro ? (d.profissional || d.titulo) : d.titulo),
            h("div", { style: { fontSize: 12.5, color: "#CBD5E1", marginTop: 2 } }, (parceiro ? [d.especialidade || categoria(d.categoria)[1], d.registro] : [d.profissional ? "com " + d.profissional : null, d.registro]).filter(Boolean).join(" · ")),
            !parceiro && d.especialidade ? h("div", { style: { fontSize: 12, color: "#94A3B8", marginTop: 1 } }, d.especialidade) : null)),
        d.beneficio ? h("div", { style: { marginTop: 14, background: COR.escuro2, border: "1.5px solid " + COR.laranja, borderRadius: 14, padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 } },
          h("div", null, h("div", { style: { fontSize: 11, color: "#94A3B8" } }, parceiro ? "Benefício para aluno Longevus" : "Destaque"), h("div", { style: { fontSize: 18, fontWeight: 800, color: "#FDBA74" } }, d.beneficio)),
          d.cupom ? h("button", { type: "button", onClick: copiar, style: { border: "1.5px dashed #FDBA74", background: "transparent", color: "#FDBA74", borderRadius: 10, padding: "7px 10px", fontWeight: 800, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" } }, copiado ? "Copiado" : d.cupom) : null) : null),
      h("div", { style: { padding: "2px 18px " + (pix ? "calc(40px + env(safe-area-inset-bottom))" : "calc(110px + env(safe-area-inset-bottom))") } },
        d.sobre ? h("div", null, secao(parceiro ? "Quem é" : "Sobre"), h("div", { style: { fontSize: 14, lineHeight: 1.6, color: "#334155", whiteSpace: "pre-wrap" } }, d.sobre)) : (d.texto ? h("div", { style: { fontSize: 14, lineHeight: 1.6, color: "#334155", marginTop: 16 } }, d.texto) : null),
        lista.length ? h("div", null, secao(parceiro ? "O que oferece" : "O que está incluso"), lista.map((x, i) => h("div", { key: i, style: { display: "flex", gap: 9, alignItems: "flex-start", fontSize: 14, lineHeight: 1.45, marginBottom: 7 } }, h("span", { "aria-hidden": "true", style: { color: COR.laranja, fontWeight: 800 } }, "✓"), h("span", null, x)))) : null,
        (at || d.local || (d.preco && !pix && !lib && !ehPix(d)) || insta) ? h("div", null, secao("Informações"), h("div", { style: { background: "#fff", border: "1.5px solid " + COR.borda, borderRadius: 14, padding: "4px 14px" } },
          [["Atendimento", at], ["Onde", d.local], ["Valor", pix || lib || ehPix(d) ? null : d.preco]].filter((x) => x[1]).map((x, i) => h("div", { key: x[0], style: { display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: i ? "1px solid #F1F5F9" : "none", fontSize: 13.5 } }, h("span", { style: { color: COR.cinza } }, x[0]), h("span", { style: { fontWeight: 700, textAlign: "right" } }, x[1]))),
          insta ? h("a", { href: insta, target: "_blank", rel: "noopener noreferrer", style: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: (at || d.local || (d.preco && !pix && !lib && !ehPix(d))) ? "1px solid #F1F5F9" : "none", fontSize: 13.5, textDecoration: "none", color: COR.escuro } }, h("span", { style: { color: COR.cinza } }, "Instagram"), h("span", { style: { fontWeight: 700, color: COR.laranjaTxt } }, (String(d.instagram).indexOf("http") === 0 ? "Ver perfil" : "@" + String(d.instagram).replace(/^@/, "")) + " ›")) : null)) : null,
        lib ? h(Liberado, { item: d, ctx, status: lib, onClique }) : pix ? h(PixPagamento, { item: d, ctx, ownerId, studentId }) : plano ? h("div", { style: { marginTop: 18, background: "#fff", border: "1.5px solid " + COR.borda, borderRadius: 16, padding: "14px 16px" } },
          h("div", { style: { fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", color: COR.laranjaTxt, textTransform: "uppercase" } }, "Plano mensal"),
          h("div", { style: { fontSize: 22, fontWeight: 800, marginTop: 2 } }, d.planoValor ? "R$ " + Number(d.planoValor).toFixed(2).replace(".", ",") + (/consult/i.test(d.planoNome || "") ? "" : "/mês") : (d.planoNome || "")),
          h("a", { href: waLink(d.whatsapp || ctx.personalWhats, "Oi, " + primeiroNome(ctx.personal) + "! Vi " + (d.titulo || "o plano") + " no app e quero saber como contratar."), target: "_blank", rel: "noopener noreferrer", onClick: onClique, style: { display: "block", marginTop: 12, height: 48, lineHeight: "48px", textAlign: "center", borderRadius: 24, background: COR.laranja, color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none" } }, "Quero para mim"),
          h("button", { type: "button", onClick: enviarAmigo, style: { width: "100%", marginTop: 8, height: 46, borderRadius: 23, border: "1.5px solid " + COR.borda, background: "#fff", color: COR.escuro, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, linkOk ? "Link copiado" : "Enviar para um amigo"),
          h("div", { style: { fontSize: 12, color: COR.cinza, marginTop: 8, lineHeight: 1.5 } }, "O amigo recebe o link para criar a conta e pagar o plano pelo Pix.")) : null,
        parceiro ? h("div", { style: { fontSize: 11.5, color: "#94A3B8", lineHeight: 1.5, marginTop: 16 } }, "Parceiro indicado pelo seu personal. O atendimento é feito diretamente com o parceiro.") : null),
      href ? h("div", { style: { position: "fixed", left: 0, right: 0, bottom: navAluno(), padding: "12px 18px calc(12px + env(safe-area-inset-bottom))", background: "linear-gradient(rgba(244,245,247,0), " + COR.fundo + " 30%)" } },
        h("a", { href, target: "_blank", rel: "noopener noreferrer", onClick: onClique, style: { display: "block", height: 50, lineHeight: "50px", textAlign: "center", borderRadius: 25, background: COR.laranja, color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none" } }, d.botao || (parceiro ? "Chamar no WhatsApp" : "Quero saber mais"))) : null);
  };
  const svgIc = (d, cor, tam) => h("svg", { width: tam || 20, height: tam || 20, viewBox: "0 0 24 24", fill: "none", stroke: cor || "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, d.map((x, k) => h("path", { key: k, d: x })));
  const IC_PRESENTE = ["M20 12v9H4v-9", "M2 7h20v5H2z", "M12 21V7", "M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7z", "M12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"];
  const FaixaIndique = ({ onAbrir }) => h("div", { onClick: onAbrir, role: "button", style: { cursor: "pointer", margin: "0 16px 12px", borderRadius: 16, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, color: "#fff", background: "linear-gradient(120deg,#FF5603,#FF8A3D)", boxShadow: "0 6px 16px rgba(255,86,3,0.22)" } },
    h("span", { style: { width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, svgIc(IC_PRESENTE, "#fff", 21)),
    h("div", { style: { flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 800, lineHeight: 1.25 } }, "Indique um amigo e ganhe prêmios"),
    h("span", { style: { flexShrink: 0, fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" } }, "Indicar ›"));
  const CartaoOferta = ({ item, ctx, onClique, especial, onAbrir }) => {
    const proprio = item.tipo !== "parceiro";
    const sub = item.beneficio ? txtBenef(item.beneficio) : item.texto || "";
    const rotulo = especial ? (item.botao || "Conhecer") : "Conhecer";
    const lib = especial ? null : liberado(ctx, item);
    const tag = especial ? "Plano mensal" : lib === "bonus" ? "Bônus do seu personal" : lib === "pago" ? "Já é seu" : proprio ? "Do seu personal" : "Parceiro";
    return h("div", { onClick: especial ? () => onClique && onClique() : onAbrir, style: { cursor: "pointer", flex: "0 0 76%", minWidth: 0, scrollSnapAlign: "start", boxSizing: "border-box", borderRadius: 16, padding: "13px 14px 12px", background: "#fff", color: COR.escuro, boxShadow: "0 1px 2px rgba(15,23,42,0.05), 0 6px 18px rgba(15,23,42,0.05)", display: "flex", gap: 12, alignItems: "center" } },
      h("div", { style: { flex: 1, minWidth: 0 } },
      h("div", { style: { fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", color: proprio || especial ? COR.laranjaTxt : COR.verde, textTransform: "uppercase" } }, tag),
      h("div", { style: { fontSize: 15, fontWeight: 800, lineHeight: 1.2, marginTop: 3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } }, item.titulo),
      h("div", { style: { fontSize: 12, color: COR.cinza, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minHeight: 15 } }, sub),
      h("div", { style: { fontSize: 13, fontWeight: 800, color: COR.laranjaTxt, marginTop: 9 } }, rotulo + " ›")),
      item.foto ? h("img", { src: item.foto, alt: "", loading: "lazy", style: { width: 64, height: 64, borderRadius: 14, objectFit: "cover", flexShrink: 0, background: "#F5F3EE" } }) : null);
  };

  const contexto = (p) => {
    const sd = p.studentData || {};
    const sem360 = !!(p.l360 && p.l360.ativo && p.l360.bloqueado);
    return { servicos: sd.servicos || {}, menteBloq: !!(p.mente && p.mente.ativo && p.mente.bloqueado), aluno: sd.name || p.studentName || "", sexo: sd.sex || null, idade: idade(sd.dob), sem360, anuncia360: sem360 && !(p.l360.cfg && p.l360.cfg.anunciar === false), personal: p.profNome || "Wellington Brito", personalWhats: p.profWhats || "" };
  };

  const useItens = (ownerId) => {
    const [itens, setItens] = useState(null);
    useEffect(() => {
      if (!ownerId) return;
      let vivo = true;
      api.listar(ownerId, true).then((l) => { if (vivo) setItens(l || []); });
      return () => { vivo = false; };
    }, [ownerId]);
    return itens;
  };

  const txtBenef = (b) => (b && typeof b === "object" ? b.nome || "" : b || "");
  const ClubeTela = (p) => {
    const ctx = contexto(p);
    const [copiado, setCopiado] = useState(null);
    const [detalhe, setDetalhe] = useState(null);
    const lista = (p.itens || []).filter((d) => publicoOk(d, ctx));
    const proprios = lista.filter((d) => d.tipo !== "parceiro").sort((a, b) => (b.produto === "indique") - (a.produto === "indique"));
    const parceiros = lista.filter((d) => d.tipo === "parceiro");
    const copiar = (d) => {
      try { navigator.clipboard.writeText(d.cupom).then(() => { setCopiado(d.id); setTimeout(() => setCopiado(null), 2000); }); } catch (e) {}
    };
    const linha = (d) => {
      if (d.produto === "indique") return h("div", { key: d.id, onClick: () => { setDetalhe(d); api.registrar(p.ownerId, d.id, p.studentId, "abriu"); }, style: { cursor: "pointer", borderRadius: 16, padding: "12px 13px", marginBottom: 8, display: "flex", alignItems: "center", gap: 11, color: "#fff", background: "linear-gradient(120deg,#FF5603,#FF8A3D)", boxShadow: "0 6px 14px rgba(255,86,3,0.25)" } },
        h("div", { style: { width: 44, height: 44, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, svgIc(IC_PRESENTE, "#FF5603", 22)),
        h("div", { style: { flex: 1, minWidth: 0 } },
          h("div", { style: { fontSize: 14, fontWeight: 800 } }, "Indique um amigo e ganhe prêmios"),
          h("div", { style: { fontSize: 12, opacity: 0.92, marginTop: 1 } }, "Você ganha " + (txtBenef(d.premio) || "um prêmio"))),
        h("span", { style: { background: "#fff", color: COR.laranjaTxt, borderRadius: 10, padding: "7px 11px", fontWeight: 800, fontSize: 12.5, whiteSpace: "nowrap" } }, "Indicar"));
      const href = linkDoItem(d, ctx);
      return h("div", { key: d.id, style: { background: "#fff", border: "1.5px solid " + COR.borda, borderRadius: 16, padding: "12px 13px", marginBottom: 8 } },
        h("div", { onClick: () => { setDetalhe(d); api.registrar(p.ownerId, d.id, p.studentId, "abriu"); }, style: { display: "flex", alignItems: "center", gap: 11, cursor: "pointer" } },
          h(Icone, { item: d }),
          h("div", { style: { flex: 1, minWidth: 0 } },
            h("div", { style: { fontSize: 14, fontWeight: 800 } }, d.titulo),
            d.profissional ? h("div", { style: { fontSize: 12, fontWeight: 700, color: "#334155" } }, d.profissional + (d.especialidade ? " · " + d.especialidade : "")) : null,
            h("div", { style: { fontSize: 12, color: COR.cinza, lineHeight: 1.4 } }, d.texto || (d.tipo === "parceiro" ? categoria(d.categoria)[1] : "")),
            h("div", { style: { fontSize: 12, fontWeight: 800, color: COR.laranjaTxt, marginTop: 2 } }, "Saiba mais ›")),
          d.beneficio ? h("span", { style: { fontSize: 12, fontWeight: 800, color: d.tipo === "parceiro" ? COR.verde : COR.laranjaTxt, whiteSpace: "nowrap" } }, txtBenef(d.beneficio)) : null),
        h("div", { style: { display: "flex", gap: 8, marginTop: 10 } },
          d.cupom ? h("button", { type: "button", onClick: () => copiar(d), style: { flex: 1, height: 38, borderRadius: 10, border: "1.5px dashed #FDBA74", background: "#FFF7ED", color: COR.laranjaTxt, fontWeight: 800, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" } }, copiado === d.id ? "Cupom copiado" : "Cupom " + d.cupom) : null,
          d.produto === "elo" ? h("button", { type: "button", onClick: () => { setDetalhe(d); api.registrar(p.ownerId, d.id, p.studentId, "abriu"); }, style: { flex: 1, height: 38, borderRadius: 10, border: "none", background: COR.laranja, color: "#fff", fontWeight: 800, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" } }, "Conhecer o " + (d.titulo || "Elo 60+"))
          : ehPix(d) ? h("button", { type: "button", onClick: () => { setDetalhe(d); api.registrar(p.ownerId, d.id, p.studentId, "abriu"); }, style: { flex: 1, height: 38, borderRadius: 10, border: "none", background: COR.laranja, color: "#fff", fontWeight: 800, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" } }, "Ver e pagar · " + fmtReal(valorPix(d)))
          : href ? h("a", { href, target: "_blank", rel: "noopener noreferrer", onClick: () => api.registrar(p.ownerId, d.id, p.studentId, "clique"), style: { flex: 1, height: 38, lineHeight: "38px", textAlign: "center", borderRadius: 10, background: COR.laranja, color: "#fff", fontWeight: 800, fontSize: 12.5, textDecoration: "none" } }, d.botao || (d.tipo === "parceiro" ? "Chamar no WhatsApp" : "Quero saber mais")) : null));
    };
    const secao = (t) => h("div", { style: { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", color: COR.cinza, textTransform: "uppercase", margin: "16px 2px 8px" } }, t);
    return h("div", { style: { position: "fixed", inset: 0, bottom: navAluno(), zIndex: 300, background: COR.fundo, overflowY: "auto", WebkitOverflowScrolling: "touch" } },
      h("div", { style: { background: COR.escuro, color: "#F8FAFC", padding: "calc(14px + env(safe-area-inset-top)) 18px 18px", borderRadius: "0 0 24px 24px" } },
        h(BotaoVoltar, { onClick: p.onFechar }),
        h("div", { style: { fontSize: 21, fontWeight: 800, marginTop: 6 } }, "Clube Longevus"),
        h("div", { style: { fontSize: 12.5, color: "#CBD5E1", marginTop: 2 } }, "Vantagens para quem treina com o " + primeiroNome(ctx.personal))),
      h("div", { style: { padding: "4px 16px calc(24px + env(safe-area-inset-bottom))" } },
        ctx.anuncia360 ? h("div", null, secao("Do seu personal"), h("div", { style: { background: COR.escuro, color: "#F8FAFC", border: "1.5px solid " + COR.laranja, borderRadius: 16, padding: "12px 13px", marginBottom: 8, display: "flex", alignItems: "center", gap: 11 } }, h(Icone, { item: { titulo: "L", foto: (p.l360.cfg && p.l360.cfg.foto) || "" } }), h("div", { style: { flex: 1 } }, h("div", { style: { fontSize: 14, fontWeight: 800 } }, (p.l360.cfg && p.l360.cfg.nome) || "Longevus 360"), h("div", { style: { fontSize: 12, color: "#CBD5E1" } }, "Treino e alimentação juntos")), h("button", { type: "button", onClick: () => { p.onFechar(); p.onIr && p.onIr("alimentacao"); }, style: { border: "none", background: COR.laranja, color: "#fff", borderRadius: 10, padding: "8px 12px", fontWeight: 800, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" } }, "Conhecer"))) : (proprios.length ? secao("Do seu personal") : null),
        proprios.map(linha),
        parceiros.length ? secao("Parceiros") : null,
        parceiros.map(linha),
        !lista.length && !ctx.anuncia360 ? h("div", { style: { textAlign: "center", color: "#94A3B8", fontSize: 13, padding: 30 } }, "Em breve, novidades por aqui.") : null,
        parceiros.length ? h("div", { style: { fontSize: 11, color: "#94A3B8", lineHeight: 1.5, marginTop: 10 } }, "Os parceiros atendem de forma independente. O desconto vale com o cupom informado.") : null),
      detalhe ? h(Detalhe, { item: detalhe, ctx, ownerId: p.ownerId, studentId: p.studentId, onFechar: () => setDetalhe(null), onClique: () => api.registrar(p.ownerId, detalhe.id, p.studentId, "clique") }) : null);
  };

  const Faixa = ({ cards, rotulo, render, atraso }) => {
    const trilho = useRef(null);
    const [ativo, setAtivo] = useState(0);
    const pausaAte = useRef(0);
    const n = cards.length;
    useEffect(() => {
      if (n < 2) return;
      let reduz = false;
      try { reduz = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
      if (reduz) return;
      let timer = null;
      const passo = () => {
        const el = trilho.current;
        if (el && el.children.length && Date.now() > pausaAte.current && !document.hidden) {
          const w = el.children[0].getBoundingClientRect().width + 10;
          const atual = Math.round(el.scrollLeft / w);
          const prox = atual >= n - 1 || el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 ? 0 : atual + 1;
          try { el.scrollTo({ left: prox * w, behavior: "smooth" }); } catch (e) { el.scrollLeft = prox * w; }
        }
      };
      const inicio = setTimeout(() => { passo(); timer = setInterval(passo, 4000); }, 4000 + (atraso || 0));
      return () => { clearTimeout(inicio); if (timer) clearInterval(timer); };
    }, [n]);
    const pausar = () => { pausaAte.current = Date.now() + 10000; };
    const aoRolar = () => {
      const el = trilho.current;
      if (!el || !el.children.length) return;
      const w = el.children[0].getBoundingClientRect().width + 10;
      setAtivo(Math.max(0, Math.min(n - 1, Math.round(el.scrollLeft / w))));
    };
    if (!n) return null;
    return h("div", { style: { marginBottom: 6 } },
      rotulo ? h("div", { style: { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", color: COR.cinza, textTransform: "uppercase", padding: "6px 18px 0", marginBottom: 9 } }, rotulo) : null,
      h("div", { ref: trilho, onScroll: aoRolar, onTouchStart: pausar, onMouseDown: pausar, onWheel: pausar, style: { display: "flex", gap: 10, overflowX: "auto", scrollSnapType: "x mandatory", padding: "2px 16px 10px", scrollPaddingLeft: 16, scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } },
        cards.map(render)));
  };
  const Carrossel = (p) => {
    const itens = useItens(p.ownerId);
    const ctx = contexto(p);
    const [clube, setClube] = useState(false);
    const [detalhe, setDetalhe] = useState(null);
    useEffect(() => { const fechar = () => { setDetalhe(null); setClube(false); }; window.addEventListener("lv-nav", fechar); return () => window.removeEventListener("lv-nav", fechar); }, []);
    const abrir = (d) => { setDetalhe(d); api.registrar(p.ownerId, d.id, p.studentId, "abriu"); };
    const lista = (itens || []).filter((d) => publicoOk(d, ctx));
    const cards = lista.filter((d) => d.produto === "indique");
    const anunciaMente = false;
    if (ctx.anuncia360) cards.push({ id: "__360", especial: true, tipo: "proprio", foto: (p.l360.cfg && p.l360.cfg.foto) || "", titulo: (p.l360.cfg && p.l360.cfg.nome) || "Longevus 360", texto: "Treino e alimentação conversando todos os dias.", botao: p.l360.vencido ? "Renovar" : "Conhecer" });
    if (anunciaMente) cards.push({ id: "__mente", especial: true, tipo: "proprio", titulo: (p.mente.cfg && p.mente.cfg.nome) || "Mente Ativa", texto: "Memória e atenção, 10 minutos por dia.", botao: p.mente.vencido ? "Renovar" : "Conhecer" });
    lista.forEach((d) => { if (d.produto !== "indique") cards.push(d); });
    useEffect(() => {
      lista.forEach((d) => registrarVisto(p.ownerId, p.studentId, d.id));
      if (itens && ctx.anuncia360) registrarVisto(p.ownerId, p.studentId, "__360");
      if (itens && anunciaMente) registrarVisto(p.ownerId, p.studentId, "__mente");
    }, [itens]);
    if (itens === null) return null;
    if (!cards.length) return null;
    const indique = cards.find((d) => d.produto === "indique");
    const meus = cards.filter((d) => d.tipo !== "parceiro" && d.produto !== "indique");
    const parc = cards.filter((d) => d.tipo === "parceiro");
    const render = (d) => h(CartaoOferta, { key: d.id, item: d, ctx, especial: d.especial, onAbrir: () => abrir(d), onClique: d.id === "__mente" ? () => { api.registrar(p.ownerId, "__mente", p.studentId, "abriu"); window.location.href = "longevus-hub.html"; } : d.especial ? () => { api.registrar(p.ownerId, "__360", p.studentId, "abriu"); p.onIr && p.onIr("alimentacao"); } : () => api.registrar(p.ownerId, d.id, p.studentId, "clique") });
    return h("div", { style: { flexShrink: 0 } },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 18px", marginBottom: 9 } },
        h("span", { style: { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", color: COR.cinza, textTransform: "uppercase" } }, "Para você"),
        h("button", { type: "button", onClick: () => setClube(true), style: { background: "transparent", border: "none", padding: 0, fontSize: 12.5, fontWeight: 800, color: COR.laranjaTxt, cursor: "pointer", fontFamily: "inherit" } }, "Ver tudo ›")),
      indique ? h(FaixaIndique, { onAbrir: () => abrir(indique) }) : null,
      h(Faixa, { cards: meus, render, atraso: 0 }),
      h(Faixa, { cards: parc, rotulo: meus.length ? "Parceiros" : null, render, atraso: 2000 }),
      clube ? h(ClubeTela, { ...p, itens: itens, onFechar: () => setClube(false) }) : null,
      detalhe ? h(Detalhe, { item: detalhe, ctx, ownerId: p.ownerId, studentId: p.studentId, onFechar: () => setDetalhe(null), onClique: () => api.registrar(p.ownerId, detalhe.id, p.studentId, "clique") }) : null);
  };

  const Campo = ({ rotulo, children, dica }) => h("label", { style: { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 12 } }, h("span", null, rotulo), children, dica ? h("span", { style: { fontSize: 11, fontWeight: 400, color: "#94A3B8" } }, dica) : null);
  const estiloInput = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 9, border: "1.5px solid " + COR.borda, fontSize: 14, fontFamily: "inherit", color: COR.escuro, background: "#fff" };
  const Pilulas = ({ opcoes, valor, onChange }) => h("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, opcoes.map((o) => h("button", { key: o[0], type: "button", onClick: () => onChange(o[0]), style: { padding: "7px 11px", borderRadius: 18, border: "1.5px solid " + (valor === o[0] ? COR.escuro : COR.borda), background: valor === o[0] ? COR.escuro : "#fff", color: valor === o[0] ? "#fff" : COR.escuro, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, o[1])));

  const FormItem = ({ inicial, profNome, onSalvar, onCancelar, onApagar }) => {
    const [d, setD] = useState(() => ({ tipo: "parceiro", categoria: "nutricao", publico: "todos", destino: "whatsapp", ativo: true, ...(inicial || {}) }));
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const set = (k) => (v) => setD((x) => ({ ...x, [k]: v }));
    const parceiro = d.tipo === "parceiro";
    const exemplo = { aluno: "Maria Souza", sexo: "F", personal: profNome || "Wellington Brito" };
    const salvar = async () => {
      setErro("");
      if (!String(d.titulo || "").trim()) return setErro("Dê um título para a oferta.");
      if (parceiro && !String(d.whatsapp || "").replace(/\D/g, "")) return setErro("Informe o WhatsApp do parceiro.");
      if (!parceiro && d.cobranca === "pix" && !valorPix(d)) return setErro("Informe o valor para o Pix.");
      if (!parceiro && d.cobranca !== "pix" && d.cobranca !== "plano" && d.destino === "link" && !String(d.link || "").trim()) return setErro("Informe o link.");
      let extra = {};
      if (!parceiro && d.cobranca === "plano") {
        if (!d.planoId) return setErro("Escolha o plano que este card vende.");
        const slug = window.__lvSlugPlano ? window.__lvSlugPlano(d.planoId) : null;
        if (!slug) return setErro("Não encontrei esse plano. Abra a tela Planos e tente de novo.");
        const pl = (window.__lvPlanos || []).find((x) => x.id === d.planoId) || {};
        const v = Number(pl.modoCobranca === "porSessao" ? pl.valorSessao : pl.valor) || 0;
        extra = { planoSlug: slug, planoNome: pl.nome || d.planoNome, planoValor: v, valor: "", aceitaPresente: false };
      }
      setSalvando(true);
      const ok = await onSalvar({ ...d, ...extra, id: d.id || novoId("vi"), titulo: String(d.titulo).trim(), atualizadoEm: new Date().toISOString() });
      setSalvando(false);
      if (!ok) setErro("Não consegui salvar. Confira se o SQL da vitrine foi rodado.");
    };
    return h("div", { style: { paddingBottom: 90 } },
      h("div", { style: { fontWeight: 800, fontSize: 17, marginBottom: 12 } }, d.id ? "Editar oferta" : "Nova oferta"),
      d.produto === "mente" ? h("div", { style: { background: "#FFF7ED", border: "1.5px solid #FDE7D3", borderRadius: 14, padding: "12px 14px", marginBottom: 12 } },
        h("div", { style: { fontWeight: 800, fontSize: 14 } }, "Mente Ativa · assinatura mensal"),
        h("div", { style: { fontSize: 12, color: "#7C2D12", lineHeight: 1.5, margin: "3px 0 10px" } }, "Ao confirmar o Pix no seu Início, o aluno ganha 30 dias de acesso. Também dá para liberar na ficha do aluno (bônus ou pago)."),
        h(Campo, { rotulo: "Cadeado nos jogos", dica: "Sim: quem não tem a Mente Ativa vê o cadeado e 1 jogo grátis. Não: os jogos ficam livres para todos e a oferta some do app." }, h(Pilulas, { opcoes: [["sim", "Sim, cobrar"], ["nao", "Não, livre para todos"]], valor: d.cadeado === false ? "nao" : "sim", onChange: (v) => set("cadeado")(v === "sim") }))) : null,
      h("div", { style: { background: "#fff", border: "1.5px solid " + COR.borda, borderRadius: 16, padding: "14px 16px" } },
        h(Campo, { rotulo: "Tipo" }, h(Pilulas, { opcoes: [["parceiro", "Parceiro"], ["proprio", "Meu serviço"]], valor: d.tipo, onChange: set("tipo") })),
        parceiro ? h(Campo, { rotulo: "Categoria" }, h(Pilulas, { opcoes: CATEGORIAS.map((c) => [c[0], c[1]]), valor: d.categoria, onChange: set("categoria") })) : null,
        h(Campo, { rotulo: "Título no app", dica: parceiro ? "Ex.: Nutricionista parceira" : "Ex.: Renove 2027 com 15% off" }, h("input", { value: d.titulo || "", onChange: (e) => set("titulo")(e.target.value), style: estiloInput })),
        h(Campo, { rotulo: "Texto curto", dica: "Uma frase. Aparece embaixo do título." }, h("input", { value: d.texto || "", onChange: (e) => set("texto")(e.target.value), style: estiloInput })),
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 } },
          h(Campo, { rotulo: "Benefício", dica: "Ex.: 20% off" }, h("input", { value: d.beneficio || "", onChange: (e) => set("beneficio")(e.target.value), style: estiloInput })),
          h(Campo, { rotulo: "Cupom", dica: "Opcional" }, h("input", { value: d.cupom || "", onChange: (e) => set("cupom")(e.target.value.toUpperCase().replace(/\s/g, "")), style: { ...estiloInput, fontWeight: 800 } }))),
        parceiro ? h("div", null,
          h(Campo, { rotulo: "Nome do parceiro na mensagem", dica: "Ex.: Dra. Paula" }, h("input", { value: d.parceiro || "", onChange: (e) => set("parceiro")(e.target.value), style: estiloInput })),
          h(Campo, { rotulo: "WhatsApp do parceiro" }, h("input", { inputMode: "tel", value: d.whatsapp || "", onChange: (e) => set("whatsapp")(e.target.value), placeholder: "(11) 90000-0000", style: estiloInput })),
          h(Campo, { rotulo: "Serviço que o aluno vai pedir", dica: "Ex.: o acompanhamento nutricional" }, h("input", { value: d.servico || "", onChange: (e) => set("servico")(e.target.value), style: estiloInput })))
          : d.produto === "elo" ? h("div", { style: { background: "#FFF7ED", border: "1.5px solid #FDE7D3", borderRadius: 14, padding: "12px 14px", marginBottom: 12, fontSize: 12.5, color: "#7C2D12", lineHeight: 1.5 } },
            h("div", { style: { fontWeight: 800, fontSize: 14, color: COR.escuro, marginBottom: 3 } }, "Elo 60+ · jornada de 30 dias"),
            "O aluno toca em \"Quero para mim\" e entra no Elo 60+ com o mesmo login do app. O Pix e a confirmação ficam no painel do Elo 60+. Quem já está na jornada vê em que dia está. O campo Valor abaixo é só o preço exibido no card.")
          : h("div", null,
            h(Campo, { rotulo: "Como o aluno paga" }, h(Pilulas, { opcoes: [["whatsapp", "Combina comigo no WhatsApp"], ["pix", "Paga pelo app (Pix)"]].concat(d.produto ? [] : [["plano", "É um dos meus planos"]]), valor: d.cobranca || "whatsapp", onChange: set("cobranca") })),
            d.cobranca === "plano" ? h(Campo, { rotulo: "Vincular a um plano", dica: "O card usa o valor e o link de contratação do plano: o cliente cria a conta e paga a mensalidade. Assim não fica duplicado." },
              h("select", { value: d.planoId || "", onChange: (e) => { const pl = (window.__lvPlanos || []).find((x) => x.id === e.target.value); setD((x) => ({ ...x, planoId: pl ? pl.id : "", planoNome: pl ? pl.nome : "", planoValor: pl ? Number(pl.modoCobranca === "porSessao" ? pl.valorSessao : pl.valor) || 0 : 0 })); }, style: estiloInput },
                h("option", { value: "" }, "Escolha o plano"),
                (window.__lvPlanos || []).filter((x) => x.ativo !== false || x.id === d.planoId).map((x) => h("option", { key: x.id, value: x.id }, x.nome + " · R$ " + Number(x.modoCobranca === "porSessao" ? x.valorSessao : x.valor || 0).toFixed(2).replace(".", ","))))) : null,
            d.cobranca === "pix" ? h("div", { style: { display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 0 } },
              h(Campo, { rotulo: "Valor (R$)", dica: "Entra no Pix com a sua chave do Meu Perfil." }, h("input", { inputMode: "decimal", value: d.valor || "", onChange: (e) => set("valor")(e.target.value.replace(/[^0-9.,]/g, "")), placeholder: "Ex.: 80,00", style: estiloInput })),
              h(Campo, { rotulo: "O que acontece depois do pagamento", dica: "Aparece embaixo do Pix. Ex.: Assim que confirmar, te chamo para agendar." }, h("input", { value: d.posPagamento || "", onChange: (e) => set("posPagamento")(e.target.value), style: estiloInput })),
              d.produto ? null : h(Campo, { rotulo: "Pode ser comprado de presente?", dica: "O aluno escolhe \"Presente\" e recebe um vale para enviar a quem vai ganhar." }, h(Pilulas, { opcoes: [["sim", "Sim"], ["nao", "Não"]], valor: d.aceitaPresente === false ? "nao" : "sim", onChange: (v) => set("aceitaPresente")(v === "sim") }))) : null,
            d.cobranca === "pix" || d.cobranca === "plano" ? null : h(Campo, { rotulo: "Quando o aluno tocar" }, h(Pilulas, { opcoes: [["whatsapp", "Abrir meu WhatsApp"], ["link", "Abrir um link"]], valor: d.destino, onChange: set("destino") })),
            d.cobranca === "plano" ? null : d.cobranca !== "pix" && d.destino === "link" ? h(Campo, { rotulo: "Link" }, h("input", { value: d.link || "", onChange: (e) => set("link")(e.target.value), placeholder: "https://", style: estiloInput }))
              : h(Campo, { rotulo: "Seu WhatsApp", dica: "Em branco, usa o WhatsApp do seu perfil." }, h("input", { inputMode: "tel", value: d.whatsapp || "", onChange: (e) => set("whatsapp")(e.target.value), style: estiloInput }))),
        h("div", { style: { fontSize: 13, fontWeight: 800, color: COR.escuro, margin: "6px 0 10px", paddingTop: 12, borderTop: "1px solid #F1F5F9" } }, "Página de detalhe (Saiba mais)"),
        h(Campo, { rotulo: "Foto (link da imagem)", dica: "Opcional. Cole o link de uma foto. Sem foto, aparece a inicial." }, h("input", { value: d.foto || "", onChange: (e) => set("foto")(e.target.value.trim()), placeholder: "https://", style: estiloInput })),
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 } },
          h(Campo, { rotulo: parceiro ? "Nome do profissional" : "Nome no destaque", dica: parceiro ? "Ex.: Dra. Paula Lima" : "Opcional" }, h("input", { value: d.profissional || "", onChange: (e) => set("profissional")(e.target.value), style: estiloInput })),
          h(Campo, { rotulo: "Registro", dica: parceiro ? "Ex.: CRN-3 12345" : "Ex.: CREF 089836-G/SP" }, h("input", { value: d.registro || "", onChange: (e) => set("registro")(e.target.value), style: estiloInput }))),
        h(Campo, { rotulo: "Especialidade", dica: parceiro ? "Ex.: Nutrição clínica e esportiva para 50+" : "Ex.: Treino em grupo para 50+" }, h("input", { value: d.especialidade || "", onChange: (e) => set("especialidade")(e.target.value), style: estiloInput })),
        h(Campo, { rotulo: parceiro ? "Quem é" : "Sobre o serviço", dica: "Um parágrafo sobre a formação, a experiência e o jeito de atender." }, h("textarea", { rows: 4, value: d.sobre || "", onChange: (e) => set("sobre")(e.target.value), style: { ...estiloInput, resize: "vertical", lineHeight: 1.45 } })),
        h(Campo, { rotulo: parceiro ? "O que oferece (um por linha)" : "O que está incluso (um por linha)" }, h("textarea", { rows: 4, value: d.inclui || "", onChange: (e) => set("inclui")(e.target.value), placeholder: parceiro ? "Consulta com bioimpedância\nPlano alimentar individual\nRetorno em 30 dias" : "Avaliação inicial\n2 aulas por semana\nAcompanhamento pelo app", style: { ...estiloInput, resize: "vertical", lineHeight: 1.45 } })),
        h(Campo, { rotulo: "Atendimento" }, h(Pilulas, { opcoes: ATENDIMENTO, valor: d.atendimento, onChange: set("atendimento") })),
        h("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 } },
          h(Campo, { rotulo: "Onde", dica: "Ex.: Centro, São Bernardo" }, h("input", { value: d.local || "", onChange: (e) => set("local")(e.target.value), style: estiloInput })),
          !parceiro && d.cobranca === "pix" ? null : h(Campo, { rotulo: "Valor", dica: "Opcional. Ex.: R$ 180" }, h("input", { value: d.preco || "", onChange: (e) => set("preco")(e.target.value), style: estiloInput }))),
        h(Campo, { rotulo: "Instagram", dica: "Ex.: @drapaulanutri" }, h("input", { value: d.instagram || "", onChange: (e) => set("instagram")(e.target.value.trim()), style: estiloInput })),
        h(Campo, { rotulo: "Texto do botão", dica: parceiro ? "Padrão: Quero o desconto" : "Padrão: Quero saber mais" }, h("input", { value: d.botao || "", onChange: (e) => set("botao")(e.target.value), style: estiloInput })),
        h(Campo, { rotulo: "Mostrar para" }, h(Pilulas, { opcoes: PUBLICOS, valor: d.publico || "todos", onChange: set("publico") })),
        h(Campo, { rotulo: "Válido até", dica: "Opcional. Depois dessa data, some do app sozinho." }, h("input", { type: "date", value: d.validade || "", onChange: (e) => set("validade")(e.target.value), style: estiloInput }))),
      (parceiro || (d.cobranca !== "pix" && d.destino !== "link" && d.produto !== "elo")) ? h("div", { style: { background: "#fff", border: "1.5px solid " + COR.borda, borderRadius: 16, padding: "14px 16px", marginTop: 12 } },
        h(Campo, { rotulo: "Mensagem do WhatsApp", dica: "Pode editar. Códigos que o app troca sozinho: {aluno}, {aluno_a}, {personal}, {personal_nome}, {parceiro}, {servico}, {cupom}, {cupom_frase}." }, h("textarea", { rows: 6, value: d.mensagem || (parceiro ? MSG_PARCEIRO : MSG_PROPRIO), onChange: (e) => set("mensagem")(e.target.value), style: { ...estiloInput, resize: "vertical", lineHeight: 1.45 } })),
        h("div", { style: { fontSize: 11.5, fontWeight: 700, color: COR.cinza, margin: "2px 0 6px" } }, "Prévia com uma aluna de exemplo"),
        h("div", { style: { background: "#ECE5DD", borderRadius: 12, padding: 10 } }, h("div", { style: { background: "#DCF8C6", borderRadius: "12px 12px 2px 12px", padding: "9px 11px", fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap", color: "#111827" } }, montarMensagem(d, exemplo)))) : null,
      erro ? h("div", { style: { fontSize: 13, color: "#DC2626", textAlign: "center", margin: "12px 0 0" } }, erro) : null,
      h("div", { style: { display: "flex", gap: 8, marginTop: 14 } },
        h("button", { type: "button", onClick: onCancelar, style: { flex: 1, height: 48, borderRadius: 24, border: "1.5px solid " + COR.borda, background: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, "Cancelar"),
        h("button", { type: "button", onClick: salvar, disabled: salvando, style: { flex: 1.4, height: 48, borderRadius: 24, border: "none", background: COR.laranja, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", opacity: salvando ? 0.6 : 1 } }, salvando ? "Salvando..." : "Salvar oferta")),
      d.id && onApagar ? h("button", { type: "button", onClick: () => onApagar(d), style: { width: "100%", height: 44, marginTop: 10, borderRadius: 22, border: "1.5px solid #FECACA", background: "#fff", color: "#DC2626", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" } }, "Excluir esta oferta") : null);
  };

  const MENTE_MODELO = { produto: "mente", tipo: "proprio", categoria: "outro", ativo: true, cadeado: true, publico: "todos", cobranca: "pix", aceitaPresente: false,
    titulo: "Mente Ativa", texto: "Memória e atenção, 10 minutos por dia.", beneficio: "Jogue em casa", profissional: "Wellington Brito", registro: "CREF 089836-G/SP", especialidade: "Especialista em Gerontologia",
    sobre: "O corpo você treina comigo. A mente, você treina em casa. São jogos rápidos de memória, atenção e linguagem, pensados para quem tem 50 anos ou mais, com um desafio novo a cada dia e a sua evolução registrada.",
    inclui: "8 jogos de memória, atenção e linguagem\nDesafio do dia, sem precisar escolher\nSua evolução em cada jogo\nSeu personal acompanha os resultados",
    atendimento: "online", local: "No app, quando quiser", posPagamento: "Assim que eu confirmar o pagamento, todos os jogos são liberados por 30 dias." };
  const ELO_MODELO = { produto: "elo", tipo: "proprio", categoria: "outro", ativo: true, publico: "todos", cobranca: "elo",
    titulo: "Elo 60+", texto: "Corpo e mente em casa, 15 minutos por dia.", beneficio: "30 dias", preco: "R$ 19,90", profissional: "Wellington Brito", registro: "CREF 089836-G/SP", especialidade: "Especialista em Gerontologia",
    sobre: "30 dias para ligar o corpo e a mente. Todo dia, uma aula guiada em casa, com vídeo e cronômetro, um exercício de dupla tarefa e um desafio de memória e atenção. Nos dias 1, 15 e 30 você faz testes rápidos e vê a sua evolução.",
    inclui: "Aula do dia guiada, com vídeo e cronômetro\nExercícios de corpo e mente juntos\nJogos da Mente Ativa liberados\nTestes de força, equilíbrio e memória nos dias 1, 15 e 30\nTudo em casa, cerca de 15 minutos por dia",
    atendimento: "online", local: "Em casa, pelo app" };
  const PRODUTOS = [
    { col: "l360", nome: "Longevus 360", sigla: "360", met: "__360", aviso: null, quem: "Quem não tem o 360", nBenef: 5,
      ph: "Registro da refeição por foto\nMetas diárias para o seu objetivo\nDéficit dividido entre alimentação e treino\nCardápios práticos com o que tem em casa\nAcompanhamento direto do seu personal",
      dicaValor: "Entra no Pix da tela de oferta. Para quem ganha de bônus, aparece riscado como referência.",
      ligarTxt: "A aba Calorias fica com cadeado para quem não tem o 360. Libere por aluno na ficha dele (bônus ou pago).",
      desligadoTxt: "A aba Calorias está livre para todos e nada é anunciado.",
      desligarTxt: "Encerra o produto para todos: a aba Calorias volta a ficar livre, sem cadeado, e o cartão do 360 some da home, inclusive de quem pagou." },
    { col: "mente", nome: "Mente Ativa", sigla: "MA", met: "__mente", aviso: "Mente Ativa", quem: "Quem não tem a Mente Ativa", nBenef: 4,
      ph: "8 jogos de memória, atenção e linguagem\nDesafio do dia, sem precisar escolher\nSua evolução em cada jogo\nSeu personal acompanha os resultados",
      dicaValor: "Entra no Pix da tela de oferta da Mente Ativa.",
      ligarTxt: "Os jogos ficam com cadeado para quem não tem a Mente Ativa, com 1 jogo grátis para experimentar. Libere por aluno na ficha dele (bônus ou pago).",
      desligadoTxt: "Os jogos estão livres para todos os alunos e nada é anunciado.",
      desligarTxt: "Encerra o produto: os jogos ficam livres para todos e a oferta some do app. Os resultados já salvos continuam guardados." }
  ];
  const cfgApi = {
    async ler(uid, col) {
      try {
        const r = await fetch(SUPA_URL + "/rest/v1/professionals?select=" + col + "&id=eq." + encodeURIComponent(uid), { headers: await api.headers() });
        if (!r.ok) return null;
        const rows = await r.json();
        return (rows && rows[0] && rows[0][col]) || {};
      } catch (e) { return null; }
    },
    async gravar(uid, col, cfg) {
      try {
        const corpo = {}; corpo[col] = cfg;
        const r = await fetch(SUPA_URL + "/rest/v1/professionals?id=eq." + encodeURIComponent(uid), { method: "PATCH", headers: { ...(await api.headers()), Prefer: "return=representation" }, body: JSON.stringify(corpo) });
        if (!r.ok) return false;
        const rows = await r.json().catch(() => []);
        return Array.isArray(rows) && rows.length > 0;
      } catch (e) { return false; }
    },
    async avisos(desdeISO) {
      try {
        const r = await fetch(SUPA_URL + "/rest/v1/l360_avisos?select=student_id,servico&created_at=gte." + desdeISO + "&limit=2000", { headers: await api.headers() });
        if (!r.ok) return [];
        return await r.json();
      } catch (e) { return []; }
    }
  };
  const contarPagaram = (avisos, prod) => { const v = {}; (avisos || []).forEach((x) => { if ((x.servico || null) === prod.aviso) v[x.student_id] = true; }); return Object.keys(v).length; };
  const contarAcesso = (students, col) => {
    const hoje = hojeISO();
    let bonus = 0, pago = 0;
    (students || []).forEach((st) => {
      if ((st.status || "ativo") !== "ativo") return;
      const l = st[col] || {};
      if (l.status === "bonus") bonus++;
      else if (l.status === "pago" && l.vencimento && l.vencimento >= hoje) pago++;
    });
    return { bonus, pago, total: bonus + pago };
  };
  const Toggle = ({ on, onClick, rotulo }) => h("button", { type: "button", onClick, "aria-label": rotulo, "aria-pressed": !!on, style: { width: 44, height: 24, borderRadius: 12, border: "none", background: on ? COR.laranja : "#CBD5E1", position: "relative", cursor: "pointer", flexShrink: 0 } }, h("span", { style: { position: "absolute", top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: 9, background: "#fff", transition: "left 0.2s" } }));
  const fmtValor360 = (v) => { const n = valorNum(v); return n ? fmtReal(n) : ""; };
  const Cartao360 = ({ prod, cfg, cont, m, pagaram, onAbrir, onAnunciar }) => {
    const ligado = !!cfg.ativo;
    const anuncia = ligado && cfg.anunciar !== false;
    const caixa = (n, t) => h("div", { style: { flex: 1, background: "#F8FAFC", borderRadius: 10, padding: "7px 10px", fontSize: 11.5, color: COR.cinza } }, h("b", { style: { display: "block", fontSize: 16, color: COR.escuro } }, n), t);
    return h("div", { style: { background: ligado ? "linear-gradient(180deg,#FFF7ED,#fff 60%)" : "#fff", border: "1.5px solid " + (ligado ? "#FDBA74" : COR.borda), borderRadius: 14, padding: "12px 14px", marginBottom: 8 } },
      h("div", { style: { display: "flex", alignItems: "center", gap: 11 } },
        h("span", { "aria-hidden": "true", style: { width: 36, height: 36, borderRadius: 12, background: COR.escuro, color: "#FDBA74", fontWeight: 800, fontSize: 11.5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, prod.sigla),
        h("div", { style: { flex: 1, minWidth: 0, cursor: "pointer" }, onClick: onAbrir },
          h("span", { style: { display: "inline-block", fontSize: 10, fontWeight: 800, background: COR.escuro, color: "#FDBA74", borderRadius: 8, padding: "2px 7px", marginBottom: 3 } }, "PLANO MENSAL"),
          h("div", { style: { fontSize: 14, fontWeight: 800 } }, cfg.nome || prod.nome),
          h("div", { style: { fontSize: 12, color: COR.cinza } }, ligado ? [fmtValor360(cfg.valor) ? fmtValor360(cfg.valor) + "/mês" : "Defina o valor", prod.quem].join(" · ") : "Desligado. Toque para configurar")),
        ligado ? h(Toggle, { on: anuncia, onClick: onAnunciar, rotulo: anuncia ? "Parar de anunciar" : "Anunciar no app" }) : null),
      ligado ? h("div", { style: { display: "flex", gap: 8, marginTop: 10 } }, caixa(cont.total, "com acesso"), caixa(cont.bonus, "bônus"), caixa(cont.pago, "pago")) : null,
      ligado ? h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: COR.cinza, marginTop: 8, paddingTop: 8, borderTop: "1px solid #F1F5F9" } },
        h("span", null, anuncia ? "No app" : "Anúncio pausado"),
        h("span", null, h("b", { style: { color: COR.escuro } }, m.viram), " viram · ", h("b", { style: { color: COR.escuro } }, m.abriram || 0), " abriram · ", h("b", { style: { color: COR.escuro } }, pagaram), pagaram === 1 ? " pagou" : " pagaram")) : null);
  };
  const Config360 = ({ prod, cfg, onSalvar, onVoltar }) => {
    const [f, setF] = useState({ nome: cfg.nome || prod.nome, valor: cfg.valor ? String(cfg.valor).replace(".", ",") : "", beneficios: Array.isArray(cfg.beneficios) ? cfg.beneficios.join("\n") : "", anunciar: cfg.anunciar !== false, foto: cfg.foto || "" });
    const [msg, setMsg] = useState("");
    const [salvando, setSalvando] = useState(false);
    const ligado = !!cfg.ativo;
    const nome = f.nome || prod.nome;
    const estiloInput = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 9, border: "1.5px solid " + COR.borda, fontSize: 14, fontFamily: "inherit", background: "#fff" };
    const montar = (extra) => ({ ...cfg, nome: f.nome.trim() || prod.nome, valor: valorNum(f.valor), beneficios: f.beneficios.split("\n").map((x) => x.trim()).filter(Boolean), anunciar: f.anunciar, foto: String(f.foto || "").trim(), ...(extra || {}) });
    const salvar = async (extra, aviso) => {
      setSalvando(true); setMsg("");
      const ok = await onSalvar(montar(extra));
      setSalvando(false);
      setMsg(ok ? (aviso || "Salvo!") : "Erro ao salvar. Tente de novo.");
    };
    const desligar = () => { if (window.confirm("Desligar " + nome + " para todos?\n\n" + prod.desligarTxt)) salvar({ ativo: false }, nome + " desligado."); };
    const ligar = () => { if (window.confirm("Ligar " + nome + "?\n\n" + prod.ligarTxt)) salvar({ ativo: true }, nome + " ligado."); };
    const card = { background: "#fff", border: "1.5px solid " + COR.borda, borderRadius: 14, padding: "14px 16px", marginBottom: 12 };
    return h("div", { style: { paddingBottom: 90 } },
      h("button", { type: "button", onClick: onVoltar, style: { background: "transparent", border: "none", padding: "4px 0", color: COR.cinza, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, "‹ Vitrine"),
      h("div", { style: { fontWeight: 800, fontSize: 20, margin: "4px 0 14px" } }, nome),
      ligado ? h("div", { style: { ...card, display: "flex", alignItems: "center", gap: 12 } },
        h("div", { style: { flex: 1 } }, h("div", { style: { fontWeight: 800, fontSize: 14 } }, "Anunciar no app"), h("div", { style: { fontSize: 12, color: COR.cinza, lineHeight: 1.45, marginTop: 2 } }, "Aparece no carrossel e no Clube Longevus para quem ainda não tem. Desligado, quem já tem continua usando.")),
        h(Toggle, { on: f.anunciar, onClick: () => setF({ ...f, anunciar: !f.anunciar }), rotulo: "Anunciar no app" }))
        : h("div", { style: { ...card, background: "#F8FAFC" } },
          h("div", { style: { fontWeight: 800, fontSize: 14 } }, nome + " está desligado"),
          h("div", { style: { fontSize: 12, color: COR.cinza, lineHeight: 1.45, margin: "3px 0 10px" } }, prod.desligadoTxt),
          h("button", { type: "button", onClick: ligar, disabled: salvando, style: { width: "100%", height: 42, borderRadius: 11, border: "none", background: COR.laranja, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, "Ligar " + nome)),
      h("div", { style: card },
        h(Campo, { rotulo: "Nome do plano" }, h("input", { value: f.nome, onChange: (e) => setF({ ...f, nome: e.target.value }), style: estiloInput })),
        h(Campo, { rotulo: "Foto (link da imagem)", dica: "Opcional. Aparece no card do app e na tela de oferta. Ex.: https://britowellington.github.io/app.longevus/longevus-360.jpg" }, h("div", { style: { display: "flex", gap: 10, alignItems: "center" } },
          f.foto ? h("img", { src: f.foto, alt: "", style: { width: 44, height: 44, borderRadius: 12, objectFit: "cover", flexShrink: 0, background: "#F1F5F9" } }) : null,
          h("input", { value: f.foto, onChange: (e) => setF({ ...f, foto: e.target.value.trim() }), placeholder: "https://", style: estiloInput }))),
        h(Campo, { rotulo: "Valor mensal (R$)", dica: prod.dicaValor }, h("input", { inputMode: "decimal", placeholder: "Ex: 29,90", value: f.valor, onChange: (e) => setF({ ...f, valor: e.target.value.replace(/[^0-9.,]/g, "") }), style: estiloInput })),
        h(Campo, { rotulo: "Benefícios (um por linha)", dica: "Em branco, o app usa os " + prod.nBenef + " benefícios padrão." }, h("textarea", { rows: 5, value: f.beneficios, placeholder: prod.ph, onChange: (e) => setF({ ...f, beneficios: e.target.value }), style: { ...estiloInput, resize: "vertical", lineHeight: 1.5 } }))),
      msg ? h("div", { style: { fontSize: 12.5, color: msg.indexOf("Erro") === 0 ? "#DC2626" : "#16A34A", marginBottom: 10 } }, msg) : null,
      h("button", { type: "button", onClick: () => salvar(), disabled: salvando, style: { width: "100%", height: 46, borderRadius: 12, border: "none", background: COR.laranja, color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer", fontFamily: "inherit", marginBottom: 18, opacity: salvando ? 0.7 : 1 } }, salvando ? "Salvando..." : "Salvar"),
      ligado ? h("div", { style: { background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 14, padding: "14px 16px" } },
        h("div", { style: { fontWeight: 800, fontSize: 14, color: "#991B1B" } }, "Desligar " + nome),
        h("div", { style: { fontSize: 12.5, color: "#7F1D1D", lineHeight: 1.5, marginTop: 4 } }, prod.desligarTxt),
        h("button", { type: "button", onClick: desligar, disabled: salvando, style: { width: "100%", marginTop: 10, height: 40, borderRadius: 10, border: "1.5px solid #FCA5A5", background: "#fff", color: "#B91C1C", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" } }, "Desligar para todos")) : null);
  };
  const comGratis = (o) => (o && o.tipo === "servico" && !/grátis$/i.test(o.nome)) ? { ...o, nome: o.nome + " grátis" } : o;
  const FormIndique = ({ inicial, opcoes, onSalvar, onCancelar, onApagar }) => {
    const [d, setD] = useState(() => ({ id: "vi_indique", produto: "indique", tipo: "proprio", categoria: "outro", titulo: "Indique e ganhe", publico: "todos", ativo: true, premio: opcoes[0] || null, beneficio: comGratis(opcoes.find((o) => /avalia/i.test(o.nome)) || opcoes[2] || opcoes[0] || null), ...(inicial || {}) }));
    const [outro, setOutro] = useState(() => (inicial && inicial.beneficio && inicial.beneficio.tipo === "texto") ? inicial.beneficio.nome : "");
    const [mensagem, setMensagem] = useState(() => (inicial && inicial.mensagem) || MSG_INDIQUE);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const chip = (o, sel, onClick) => h("button", { key: o.tipo + o.id, type: "button", onClick, style: { padding: "9px 12px", borderRadius: 11, border: "1.5px solid " + (sel ? COR.laranja : COR.borda), background: sel ? "#FFF4EE" : "#fff", color: sel ? COR.laranjaTxt : "#334155", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", textAlign: "left" } }, (sel ? "● " : "○ ") + o.nome);
    const igual = (a, b) => a && b && a.tipo === b.tipo && a.id === b.id;
    const salvar = async () => {
      setErro("");
      const benef = d.beneficio && d.beneficio.tipo === "texto" ? { tipo: "texto", id: "texto", nome: outro.trim() } : d.beneficio;
      if (!d.premio) return setErro("Escolha o prêmio de quem indica.");
      if (!benef || !benef.nome) return setErro("Escolha ou escreva o benefício do amigo.");
      setSalvando(true);
      const ok = await onSalvar({ ...d, beneficio: benef, mensagem: mensagem.trim() || MSG_INDIQUE, atualizadoEm: new Date().toISOString() });
      setSalvando(false);
      if (!ok) setErro("Não consegui salvar. Confira se o SQL da vitrine foi rodado.");
    };
    const card = { background: "#fff", border: "1.5px solid " + COR.borda, borderRadius: 16, padding: "14px 16px", marginBottom: 12 };
    return h("div", { style: { paddingBottom: 90 } },
      h("button", { type: "button", onClick: onCancelar, style: { background: "transparent", border: "none", padding: "4px 0", color: COR.cinza, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, "‹ Vitrine"),
      h("div", { style: { fontWeight: 800, fontSize: 20, margin: "4px 0 4px" } }, "Indique e ganhe"),
      h("div", { style: { fontSize: 12.5, color: COR.cinza, lineHeight: 1.5, marginBottom: 14 } }, "Fica sempre em primeiro lugar no \"Para você\". As indicações chegam no seu Início e entram nos Leads."),
      h("div", { style: card },
        h("div", { style: { fontWeight: 800, fontSize: 14, marginBottom: 3 } }, "Prêmio de quem indica"),
        h("div", { style: { fontSize: 12, color: COR.cinza, marginBottom: 10 } }, "Liberado como bônus quando o amigo virar aluno. Produtos mensais valem por 30 dias."),
        h("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, opcoes.map((o) => chip(o, igual(d.premio, o), () => setD({ ...d, premio: o }))))),
      h("div", { style: card },
        h("div", { style: { fontWeight: 800, fontSize: 14, marginBottom: 3 } }, "Benefício do amigo"),
        h("div", { style: { fontSize: 12, color: COR.cinza, marginBottom: 10 } }, "Vai na mensagem do convite. Você entrega quando ele vier."),
        h("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
          opcoes.map((o) => chip(comGratis(o), igual(d.beneficio, o), () => setD({ ...d, beneficio: comGratis(o) }))),
          chip({ tipo: "texto", id: "texto", nome: "Outro (escrever)" }, d.beneficio && d.beneficio.tipo === "texto", () => setD({ ...d, beneficio: { tipo: "texto", id: "texto", nome: outro } }))),
        d.beneficio && d.beneficio.tipo === "texto" ? h("input", { value: outro, onChange: (e) => setOutro(e.target.value), placeholder: "Ex.: Aula experimental grátis", style: { width: "100%", boxSizing: "border-box", marginTop: 8, padding: "10px 12px", borderRadius: 9, border: "1.5px solid " + COR.borda, fontSize: 14, fontFamily: "inherit" } }) : null),
      h("div", { style: card },
        h("div", { style: { fontWeight: 800, fontSize: 14, marginBottom: 3 } }, "Mensagem do convite"),
        h("div", { style: { fontSize: 12, color: COR.cinza, marginBottom: 8, lineHeight: 1.5 } }, "É o texto que o aluno manda para o amigo. Use {amigo}, {aluno}, {personal} e {beneficio}: o app troca pelos nomes certos. O benefício aparece em negrito no WhatsApp."),
        h("textarea", { rows: 9, value: mensagem, onChange: (e) => setMensagem(e.target.value), style: { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 9, border: "1.5px solid " + COR.borda, fontSize: 13.5, fontFamily: "inherit", lineHeight: 1.5, resize: "vertical" } }),
        h("button", { type: "button", onClick: () => setMensagem(MSG_INDIQUE), style: { marginTop: 6, background: "transparent", border: "none", padding: 0, color: COR.laranjaTxt || "#C2410C", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, "Voltar ao texto padrão"),
        h("div", { style: { marginTop: 10, background: "#E9F5F2", borderRadius: 12, padding: 12, fontSize: 13, lineHeight: 1.5, color: "#0F6E56", whiteSpace: "pre-wrap" } },
          h("div", { style: { fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", marginBottom: 4 } }, "EXEMPLO: COMO O AMIGO RECEBE"),
          msgIndique(mensagem, { amigo: "Maria", aluno: "Karina", personal: "Wellington Brito", beneficio: d.beneficio ? (d.beneficio.tipo === "texto" ? outro : d.beneficio.nome) : "" }))),
      h("div", { style: { ...card, background: "#FFF7ED", borderColor: "#FDE7D3" } },
        h("div", { style: { fontSize: 11, fontWeight: 700, color: "#9A3412", letterSpacing: "0.06em", marginBottom: 6 } }, "COMO O ALUNO VÊ"),
        h("div", { style: { fontSize: 13.5, color: "#7C2D12", lineHeight: 1.5 } }, "Você ganha: ", h("b", null, (d.premio && d.premio.nome) || "—"), h("br"), "Seu amigo ganha: ", h("b", null, d.beneficio ? (d.beneficio.tipo === "texto" ? (outro || "—") : d.beneficio.nome) : "—"))),
      erro ? h("div", { role: "alert", style: { fontSize: 13, color: "#DC2626", marginBottom: 10 } }, erro) : null,
      h("button", { type: "button", onClick: salvar, disabled: salvando, style: { width: "100%", height: 46, borderRadius: 12, border: "none", background: COR.laranja, color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer", fontFamily: "inherit", opacity: salvando ? 0.7 : 1 } }, salvando ? "Salvando..." : "Salvar"),
      inicial && inicial.id && onApagar ? h("button", { type: "button", onClick: () => onApagar(d), style: { width: "100%", marginTop: 10, height: 40, borderRadius: 10, border: "1.5px solid #FCA5A5", background: "#fff", color: "#B91C1C", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, "Remover da vitrine") : null);
  };
  const Painel = ({ profNome, students }) => {
    const [cfgs, setCfgs] = useState({});
    const [avisos, setAvisos] = useState([]);
    const [verProd, setVerProd] = useState(null);
    const [uid, setUid] = useState(null);
    const [itens, setItens] = useState(null);
    const [met, setMet] = useState({});
    const [editando, setEditando] = useState(null);
    const carregar = async () => {
      const u = await api.uid();
      setUid(u);
      if (!u) { setItens([]); return; }
      const desde = new Date(Date.now() - 30 * 86400000).toISOString();
      const [l, m, av, c1, c2] = await Promise.all([api.listar(u, false), api.metricas(u, desde), cfgApi.avisos(desde), cfgApi.ler(u, "l360"), cfgApi.ler(u, "mente")]);
      setItens(l);
      setMet(m || {});
      setAvisos(av || []);
      setCfgs({ l360: c1, mente: c2 });
    };
    useEffect(() => { carregar(); }, []);
    const salvar = async (item) => {
      const ok = await api.salvar(uid, item);
      if (ok && item.produto === "mente") {
        const atual = cfgs.mente || {};
        const novoCfg = { ...atual, ativo: item.cadeado !== false, nome: item.titulo || "Mente Ativa", valor: valorPix(item), beneficios: String(item.inclui || "").split("\n").map((x) => x.trim()).filter(Boolean) };
        if (await cfgApi.gravar(uid, "mente", novoCfg)) setCfgs((p) => ({ ...p, mente: novoCfg }));
      }
      if (ok) {
        setItens((p) => { const sem = (p || []).filter((x) => x.id !== item.id); return [item].concat(sem); });
        setEditando(null);
      }
      return ok;
    };
    const apagar = async (item) => {
      if (!window.confirm("Excluir a oferta \"" + item.titulo + "\"? Ela some do app dos alunos.")) return;
      const ok = await api.remover(item.id);
      if (ok) { setItens((p) => (p || []).filter((x) => x.id !== item.id)); setEditando(null); }
      else alert("Não consegui excluir. Tente de novo.");
    };
    const alternar = async (item) => {
      const novo = { ...item, ativo: !(item.ativo !== false) };
      setItens((p) => p.map((x) => (x.id === item.id ? novo : x)));
      const ok = await api.salvar(uid, novo);
      if (!ok) { setItens((p) => p.map((x) => (x.id === item.id ? item : x))); alert("Não consegui alterar. Tente de novo."); }
    };
    const salvarProd = async (col, novo) => {
      const ok = await cfgApi.gravar(uid, col, novo);
      if (ok) setCfgs((p) => ({ ...p, [col]: novo }));
      return ok;
    };
    const anunciarProd = async (col) => {
      const antes = cfgs[col];
      const novo = { ...antes, anunciar: antes.anunciar === false };
      setCfgs((p) => ({ ...p, [col]: novo }));
      const ok = await cfgApi.gravar(uid, col, novo);
      if (!ok) { setCfgs((p) => ({ ...p, [col]: antes })); alert("Não consegui alterar. Tente de novo."); }
    };
    const prodAberto = verProd && PRODUTOS.find((x) => x.col === verProd);
    if (prodAberto && cfgs[verProd]) return h(Config360, { prod: prodAberto, cfg: cfgs[verProd], onSalvar: (novo) => salvarProd(verProd, novo), onVoltar: () => setVerProd(null) });
    const opcoesPremio = [{ tipo: "mente", id: "mente", nome: "1 mês de Mente Ativa" }, { tipo: "l360", id: "l360", nome: "1 mês de Longevus 360" }].concat((itens || []).filter((x) => x.tipo !== "parceiro" && !x.produto && x.cobranca === "pix").map((x) => ({ tipo: "servico", id: x.id, nome: x.titulo })));
    if (editando && (editando.produto === "indique" || editando === "indique")) return h(FormIndique, { inicial: editando === "indique" ? null : editando, opcoes: opcoesPremio, onSalvar: salvar, onCancelar: () => setEditando(null), onApagar: apagar });
    if (editando) return h(FormItem, { inicial: editando === "novo" ? null : editando, profNome, onSalvar: salvar, onCancelar: () => setEditando(null), onApagar: apagar });
    if (itens === null) return h("div", { style: { textAlign: "center", padding: 30, color: "#94A3B8" } }, "Carregando a vitrine...");
    const totalCliques = Object.keys(met).reduce((s, k) => s + met[k].cliques, 0);
    return h("div", null,
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 4 } },
        h("div", { style: { fontWeight: 800, fontSize: 18 } }, "Vitrine do app"),
        h("button", { type: "button", onClick: () => setEditando("novo"), style: { height: 38, padding: "0 16px", borderRadius: 10, border: "none", background: COR.laranja, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, "+ Nova oferta")),
      h("div", { style: { fontSize: 12.5, color: COR.cinza, marginBottom: 14, lineHeight: 1.5 } }, "O que aparece no carrossel \"Para você\" e no Clube Longevus do app do aluno. Últimos 30 dias: " + totalCliques + (totalCliques === 1 ? " toque" : " toques") + " em ofertas."),
      itens && !itens.some((x) => x.produto === "indique") ? h("button", { type: "button", onClick: () => setEditando("indique"), style: { width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer", background: "#fff", border: "1.5px dashed #FDBA74", borderRadius: 14, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 11 } },
        h("span", { style: { width: 36, height: 36, borderRadius: 12, background: "linear-gradient(145deg,#FFB37A,#FF5603)", fontSize: 19, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, "🎁"),
        h("span", { style: { flex: 1 } }, h("span", { style: { display: "block", fontSize: 14, fontWeight: 800, color: COR.escuro } }, "Adicionar Indique e ganhe"), h("span", { style: { display: "block", fontSize: 12, color: COR.cinza } }, "Você escolhe o prêmio de quem indica e o do amigo.")),
        h("span", { style: { color: "#C2410C", fontWeight: 800, fontSize: 13 } }, "+")) : null,
      cfgs.mente && !(itens || []).some((x) => x.produto === "mente") ? h("button", { type: "button", onClick: () => setEditando({ ...MENTE_MODELO, valor: cfgs.mente.valor ? String(cfgs.mente.valor).replace(".", ",") : "" }), style: { width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer", background: "#fff", border: "1.5px dashed #FDBA74", borderRadius: 14, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 11 } },
        h("span", { style: { width: 36, height: 36, borderRadius: 12, background: COR.escuro, color: "#FDBA74", fontWeight: 800, fontSize: 11.5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, "MA"),
        h("span", { style: { flex: 1 } }, h("span", { style: { display: "block", fontSize: 14, fontWeight: 800, color: COR.escuro } }, "Adicionar a Mente Ativa à vitrine"), h("span", { style: { display: "block", fontSize: 12, color: COR.cinza } }, "Já vem preenchida. Você só confere e salva.")),
        h("span", { style: { color: "#C2410C", fontWeight: 800, fontSize: 13 } }, "+")) : null,
      itens && !itens.some((x) => x.produto === "elo") ? h("button", { type: "button", onClick: () => setEditando({ ...ELO_MODELO }), style: { width: "100%", textAlign: "left", fontFamily: "inherit", cursor: "pointer", background: "#fff", border: "1.5px dashed #FDBA74", borderRadius: 14, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 11 } },
        h("span", { style: { width: 36, height: 36, borderRadius: 12, background: COR.escuro, color: "#FDBA74", fontWeight: 800, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, "60+"),
        h("span", { style: { flex: 1 } }, h("span", { style: { display: "block", fontSize: 14, fontWeight: 800, color: COR.escuro } }, "Adicionar o Elo 60+ à vitrine"), h("span", { style: { display: "block", fontSize: 12, color: COR.cinza } }, "Já vem preenchido. Você só confere e salva.")),
        h("span", { style: { color: "#C2410C", fontWeight: 800, fontSize: 13 } }, "+")) : null,
      PRODUTOS.filter((pr) => pr.col === "l360").map((pr) => cfgs[pr.col] ? h(Cartao360, { key: pr.col, prod: pr, cfg: cfgs[pr.col], cont: contarAcesso(students, pr.col), m: met[pr.met] || { viram: 0, abriram: 0 }, pagaram: contarPagaram(avisos, pr), onAbrir: () => setVerProd(pr.col), onAnunciar: () => anunciarProd(pr.col) }) : null),
      itens.length === 0 ? h("div", { style: { background: "#fff", border: "1.5px solid " + COR.borda, borderRadius: 14, padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13, lineHeight: 1.5 } }, "Nenhuma oferta ainda. Cadastre um parceiro ou um serviço seu para aparecer no app.") : null,
      itens.map((d) => {
        const m = met[d.id] || { viram: 0, abriram: 0, cliques: 0 };
        const on = d.ativo !== false;
        const vencida = d.validade && d.validade < hojeISO();
        return h("div", { key: d.id, style: { background: "#fff", border: "1.5px solid " + COR.borda, borderRadius: 14, padding: "12px 14px", marginBottom: 8, opacity: on && !vencida ? 1 : 0.6 } },
          h("div", { style: { display: "flex", alignItems: "center", gap: 11 } },
            h(Icone, { item: d }),
            h("div", { style: { flex: 1, minWidth: 0, cursor: "pointer" }, onClick: () => setEditando(d) },
              h("div", { style: { fontSize: 14, fontWeight: 800 } }, d.titulo),
              h("div", { style: { fontSize: 12, color: COR.cinza } }, (d.tipo === "parceiro" ? "Parceiro" : "Seu serviço") + (d.beneficio ? " · " + txtBenef(d.beneficio) : "") + (d.cupom ? " · " + d.cupom : "") + " · " + (PUBLICOS.find((x) => x[0] === (d.publico || "todos")) || PUBLICOS[0])[1])),
            h("button", { type: "button", onClick: () => alternar(d), "aria-label": on ? "Tirar do app" : "Mostrar no app", style: { width: 44, height: 24, borderRadius: 12, border: "none", background: on ? COR.laranja : "#CBD5E1", position: "relative", cursor: "pointer", flexShrink: 0 } }, h("span", { style: { position: "absolute", top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: 9, background: "#fff", transition: "left 0.2s" } }))),
          h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: COR.cinza, marginTop: 8, paddingTop: 8, borderTop: "1px solid #F1F5F9" } },
            h("span", null, vencida ? "Vencida em " + d.validade.split("-").reverse().join("/") : on ? "No app" : "Pausada"),
            h("span", null, h("b", { style: { color: COR.escuro } }, m.viram), " viram · ", h("b", { style: { color: COR.escuro } }, m.abriram || 0), " abriram · ", h("b", { style: { color: COR.escuro } }, m.cliques), m.cliques === 1 ? " chamou" : " chamaram")));
      }));
  };

  window.LongevusVitrine = { Carrossel, Clube: ClubeTela, Painel, montarMensagem, linkDoItem, PixPagamento };
})();
