(function () {
  const { useState, useEffect, useRef } = React;
  const h = React.createElement;
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
  const linkDoItem = (item, ctx) => {
    const d = item || {};
    if (d.tipo !== "parceiro" && d.destino === "link" && d.link) return d.link;
    const numero = d.tipo === "parceiro" ? d.whatsapp : (d.whatsapp || (ctx && ctx.personalWhats));
    return waLink(numero, montarMensagem(d, ctx));
  };
  const valorNum = (v) => { const n = parseFloat(String(v || "").replace(/[^0-9,\.]/g, "").replace(/\.(?=\d{3})/g, "").replace(",", ".")); return isFinite(n) && n > 0 ? n : 0; };
  const ehPix = (d) => d && d.tipo !== "parceiro" && d.cobranca === "pix" && valorNum(d.valor) > 0;
  const fmtReal = (n) => "R$ " + n.toFixed(2).replace(".", ",");
  const PixPagamento = ({ item, ctx, ownerId, studentId }) => {
    const qr = useRef(null);
    const [copiado, setCopiado] = useState(false);
    const [avisado, setAvisado] = useState(false);
    const px = window.__LV_PIX;
    const valor = valorNum(item.valor);
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
    const avisar = () => {
      setAvisado(true);
      api.registrar(ownerId, item.id, studentId, "pagou");
      (async () => {
        try {
          const hd = { ...(await api.headers()), Prefer: "return=minimal" };
          await fetch(SUPA_URL + "/rest/v1/l360_avisos", { method: "POST", headers: hd, body: JSON.stringify({ id: novoId("av"), owner_id: String(ownerId), student_id: String(studentId), servico: item.titulo || "Serviço" }) });
        } catch (e) {}
      })();
    };
    return h("div", null,
      h("div", { style: { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", color: COR.cinza, textTransform: "uppercase", margin: "18px 0 8px" } }, "Pagamento"),
      h("div", { style: { background: "#fff", border: "1.5px solid " + COR.borda, borderRadius: 16, padding: 14, textAlign: "center" } },
        h("div", { style: { fontSize: 12, color: COR.cinza } }, "Valor"),
        h("div", { style: { fontSize: 26, fontWeight: 800, color: COR.escuro, marginBottom: 10 } }, fmtReal(valor)),
        payload ? h("div", null,
          h("div", { ref: qr, style: { display: "flex", justifyContent: "center", marginBottom: 10 } }),
          h("button", { type: "button", onClick: copiar, style: { width: "100%", height: 44, borderRadius: 22, border: "none", background: copiado ? "#16A34A" : COR.laranja, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, copiado ? "Código copiado" : "Copiar código Pix"),
          h("div", { style: { fontSize: 11.5, color: "#94A3B8", marginTop: 8 } }, "Escaneie no app do banco ou cole o código no Pix copia e cola."))
          : h("div", { style: { fontSize: 12.5, color: "#92400E", background: "#FEF9C3", borderRadius: 10, padding: "9px 10px" } }, "O Pix ainda não está configurado. Fale com seu personal pelo WhatsApp."),
        item.posPagamento ? h("div", { style: { fontSize: 12.5, color: "#334155", marginTop: 12, lineHeight: 1.5, textAlign: "left", background: COR.fundo, borderRadius: 10, padding: "9px 11px" } }, item.posPagamento) : null),
      wa ? h("a", { href: wa, target: "_blank", rel: "noopener noreferrer", onClick: avisar, style: { display: "block", marginTop: 10, height: 46, lineHeight: "46px", textAlign: "center", borderRadius: 23, background: avisado ? "#F0FDF4" : "#16A34A", color: avisado ? "#15803D" : "#fff", border: avisado ? "1.5px solid #BBF7D0" : "none", fontWeight: 800, fontSize: 14, textDecoration: "none" } }, avisado ? "Aviso enviado ao seu personal" : "Avisar que já paguei") : null);
  };
  const publicoOk = (d, ctx) => {
    if (d.validade && d.validade < hojeISO()) return false;
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

  const ATENDIMENTO = [["presencial", "Presencial"], ["online", "Online"], ["ambos", "Presencial e online"]];
  const instaLink = (v) => {
    const t = String(v || "").trim();
    if (!t) return null;
    if (/^https?:\/\//.test(t)) return t;
    return "https://instagram.com/" + t.replace(/^@/, "");
  };
  const Detalhe = ({ item, ctx, onFechar, onClique, ownerId, studentId }) => {
    const d = item;
    const parceiro = d.tipo === "parceiro";
    const pix = ehPix(d);
    const href = pix ? null : linkDoItem(d, ctx);
    const [copiado, setCopiado] = useState(false);
    const lista = String(d.inclui || "").split("\n").map((x) => x.trim()).filter(Boolean);
    const insta = instaLink(d.instagram);
    const at = (ATENDIMENTO.find((a) => a[0] === d.atendimento) || [null, null])[1];
    const secao = (t) => h("div", { style: { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", color: COR.cinza, textTransform: "uppercase", margin: "18px 0 8px" } }, t);
    const copiar = () => { try { navigator.clipboard.writeText(d.cupom).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 2000); }); } catch (e) {} };
    return h("div", { style: { position: "fixed", inset: 0, zIndex: 70, background: COR.fundo, overflowY: "auto", WebkitOverflowScrolling: "touch", color: COR.escuro } },
      h("div", { style: { background: COR.escuro, color: "#F8FAFC", padding: "calc(14px + env(safe-area-inset-top)) 18px 20px", borderRadius: "0 0 26px 26px" } },
        h("button", { type: "button", onClick: onFechar, style: { background: "transparent", border: "none", padding: "4px 0", color: "#CBD5E1", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, "‹ Voltar"),
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
      h("div", { style: { padding: "2px 18px " + (pix ? "calc(30px + env(safe-area-inset-bottom))" : "calc(110px + env(safe-area-inset-bottom))") } },
        d.sobre ? h("div", null, secao(parceiro ? "Quem é" : "Sobre"), h("div", { style: { fontSize: 14, lineHeight: 1.6, color: "#334155", whiteSpace: "pre-wrap" } }, d.sobre)) : (d.texto ? h("div", { style: { fontSize: 14, lineHeight: 1.6, color: "#334155", marginTop: 16 } }, d.texto) : null),
        lista.length ? h("div", null, secao(parceiro ? "O que oferece" : "O que está incluso"), lista.map((x, i) => h("div", { key: i, style: { display: "flex", gap: 9, alignItems: "flex-start", fontSize: 14, lineHeight: 1.45, marginBottom: 7 } }, h("span", { "aria-hidden": "true", style: { color: COR.laranja, fontWeight: 800 } }, "✓"), h("span", null, x)))) : null,
        (at || d.local || (d.preco && !pix) || insta) ? h("div", null, secao("Informações"), h("div", { style: { background: "#fff", border: "1.5px solid " + COR.borda, borderRadius: 14, padding: "4px 14px" } },
          [["Atendimento", at], ["Onde", d.local], ["Valor", pix ? null : d.preco]].filter((x) => x[1]).map((x, i) => h("div", { key: x[0], style: { display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: i ? "1px solid #F1F5F9" : "none", fontSize: 13.5 } }, h("span", { style: { color: COR.cinza } }, x[0]), h("span", { style: { fontWeight: 700, textAlign: "right" } }, x[1]))),
          insta ? h("a", { href: insta, target: "_blank", rel: "noopener noreferrer", style: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: (at || d.local || (d.preco && !pix)) ? "1px solid #F1F5F9" : "none", fontSize: 13.5, textDecoration: "none", color: COR.escuro } }, h("span", { style: { color: COR.cinza } }, "Instagram"), h("span", { style: { fontWeight: 700, color: COR.laranjaTxt } }, (String(d.instagram).indexOf("http") === 0 ? "Ver perfil" : "@" + String(d.instagram).replace(/^@/, "")) + " ›")) : null)) : null,
        pix ? h(PixPagamento, { item: d, ctx, ownerId, studentId }) : null,
        parceiro ? h("div", { style: { fontSize: 11.5, color: "#94A3B8", lineHeight: 1.5, marginTop: 16 } }, "Parceiro indicado pelo seu personal. O atendimento é feito diretamente com o parceiro.") : null),
      href ? h("div", { style: { position: "fixed", left: 0, right: 0, bottom: 0, padding: "12px 18px calc(12px + env(safe-area-inset-bottom))", background: "linear-gradient(rgba(244,245,247,0), " + COR.fundo + " 30%)" } },
        h("a", { href, target: "_blank", rel: "noopener noreferrer", onClick: onClique, style: { display: "block", height: 50, lineHeight: "50px", textAlign: "center", borderRadius: 25, background: COR.laranja, color: "#fff", fontWeight: 800, fontSize: 15, textDecoration: "none" } }, d.botao || (parceiro ? "Chamar no WhatsApp" : "Quero saber mais"))) : null);
  };
  const CartaoOferta = ({ item, ctx, onClique, especial, onAbrir }) => {
    const proprio = item.tipo !== "parceiro";
    const escuro = proprio || especial;
    const pix = ehPix(item);
    const href = especial || pix ? null : linkDoItem(item, ctx);
    const rotulo = item.botao || (pix ? "Quero fazer · " + fmtReal(valorNum(item.valor)) : proprio ? "Quero saber mais" : "Quero o desconto");
    const btnStyle = { display: "block", textAlign: "center", borderRadius: 12, padding: "9px 10px", fontSize: 13, fontWeight: 800, textDecoration: "none", background: COR.laranja, color: "#fff", border: "none", fontFamily: "inherit", cursor: "pointer", marginTop: "auto" };
    return h("div", { onClick: especial ? void 0 : onAbrir, style: { cursor: especial ? "default" : "pointer", flex: "0 0 84%", scrollSnapAlign: "start", boxSizing: "border-box", borderRadius: 18, padding: "13px 14px", display: "flex", flexDirection: "column", gap: 6, minHeight: 150, background: escuro ? COR.escuro : "#fff", color: escuro ? "#F8FAFC" : COR.escuro, border: "1.5px solid " + (escuro ? COR.laranja : COR.borda) } },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } }, h(Selo, { tipo: item.tipo }), item.beneficio ? h("span", { style: { fontSize: 11, fontWeight: 800, color: escuro ? "#FDBA74" : COR.laranjaTxt, whiteSpace: "nowrap" } }, item.beneficio) : null),
      h("div", { style: { fontSize: 16, fontWeight: 800, lineHeight: 1.2 } }, item.titulo),
      item.texto ? h("div", { style: { fontSize: 12, lineHeight: 1.45, color: escuro ? "#CBD5E1" : COR.cinza } }, item.texto) : null,
      !especial ? h("span", { style: { fontSize: 12, fontWeight: 800, color: escuro ? "#FDBA74" : COR.laranjaTxt } }, "Saiba mais ›") : null,
      especial ? h("button", { type: "button", onClick: onClique, style: btnStyle }, rotulo)
        : pix ? h("button", { type: "button", onClick: (e) => { e.stopPropagation(); onAbrir && onAbrir(); }, style: btnStyle }, rotulo)
        : href ? h("a", { href, target: "_blank", rel: "noopener noreferrer", onClick: (e) => { e.stopPropagation(); onClique && onClique(); }, style: btnStyle }, rotulo)
        : h("span", { style: { ...btnStyle, background: "#cbd5e1", cursor: "default" } }, "Em breve"));
  };

  const contexto = (p) => {
    const sd = p.studentData || {};
    return { aluno: sd.name || p.studentName || "", sexo: sd.sex || null, idade: idade(sd.dob), sem360: !!(p.l360 && p.l360.ativo && p.l360.bloqueado), personal: p.profNome || "Wellington Brito", personalWhats: p.profWhats || "" };
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

  const ClubeTela = (p) => {
    const ctx = contexto(p);
    const [copiado, setCopiado] = useState(null);
    const [detalhe, setDetalhe] = useState(null);
    const lista = (p.itens || []).filter((d) => publicoOk(d, ctx));
    const proprios = lista.filter((d) => d.tipo !== "parceiro");
    const parceiros = lista.filter((d) => d.tipo === "parceiro");
    const copiar = (d) => {
      try { navigator.clipboard.writeText(d.cupom).then(() => { setCopiado(d.id); setTimeout(() => setCopiado(null), 2000); }); } catch (e) {}
    };
    const linha = (d) => {
      const href = linkDoItem(d, ctx);
      return h("div", { key: d.id, style: { background: "#fff", border: "1.5px solid " + COR.borda, borderRadius: 16, padding: "12px 13px", marginBottom: 8 } },
        h("div", { onClick: () => { setDetalhe(d); api.registrar(p.ownerId, d.id, p.studentId, "abriu"); }, style: { display: "flex", alignItems: "center", gap: 11, cursor: "pointer" } },
          h(Icone, { item: d }),
          h("div", { style: { flex: 1, minWidth: 0 } },
            h("div", { style: { fontSize: 14, fontWeight: 800 } }, d.titulo),
            d.profissional ? h("div", { style: { fontSize: 12, fontWeight: 700, color: "#334155" } }, d.profissional + (d.especialidade ? " · " + d.especialidade : "")) : null,
            h("div", { style: { fontSize: 12, color: COR.cinza, lineHeight: 1.4 } }, d.texto || (d.tipo === "parceiro" ? categoria(d.categoria)[1] : "")),
            h("div", { style: { fontSize: 12, fontWeight: 800, color: COR.laranjaTxt, marginTop: 2 } }, "Saiba mais ›")),
          d.beneficio ? h("span", { style: { fontSize: 12, fontWeight: 800, color: d.tipo === "parceiro" ? COR.verde : COR.laranjaTxt, whiteSpace: "nowrap" } }, d.beneficio) : null),
        h("div", { style: { display: "flex", gap: 8, marginTop: 10 } },
          d.cupom ? h("button", { type: "button", onClick: () => copiar(d), style: { flex: 1, height: 38, borderRadius: 10, border: "1.5px dashed #FDBA74", background: "#FFF7ED", color: COR.laranjaTxt, fontWeight: 800, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" } }, copiado === d.id ? "Cupom copiado" : "Cupom " + d.cupom) : null,
          ehPix(d) ? h("button", { type: "button", onClick: () => { setDetalhe(d); api.registrar(p.ownerId, d.id, p.studentId, "abriu"); }, style: { flex: 1, height: 38, borderRadius: 10, border: "none", background: COR.laranja, color: "#fff", fontWeight: 800, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" } }, "Ver e pagar · " + fmtReal(valorNum(d.valor)))
          : href ? h("a", { href, target: "_blank", rel: "noopener noreferrer", onClick: () => api.registrar(p.ownerId, d.id, p.studentId, "clique"), style: { flex: 1, height: 38, lineHeight: "38px", textAlign: "center", borderRadius: 10, background: COR.laranja, color: "#fff", fontWeight: 800, fontSize: 12.5, textDecoration: "none" } }, d.botao || (d.tipo === "parceiro" ? "Chamar no WhatsApp" : "Quero saber mais")) : null));
    };
    const secao = (t) => h("div", { style: { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", color: COR.cinza, textTransform: "uppercase", margin: "16px 2px 8px" } }, t);
    return h("div", { style: { position: "fixed", inset: 0, zIndex: 60, background: COR.fundo, overflowY: "auto", WebkitOverflowScrolling: "touch" } },
      h("div", { style: { background: COR.escuro, color: "#F8FAFC", padding: "calc(14px + env(safe-area-inset-top)) 18px 18px", borderRadius: "0 0 24px 24px" } },
        h("button", { type: "button", onClick: p.onFechar, style: { background: "transparent", border: "none", padding: "4px 0", color: "#CBD5E1", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" } }, "‹ Voltar"),
        h("div", { style: { fontSize: 21, fontWeight: 800, marginTop: 6 } }, "Clube Longevus"),
        h("div", { style: { fontSize: 12.5, color: "#CBD5E1", marginTop: 2 } }, "Vantagens para quem treina com o " + primeiroNome(ctx.personal))),
      h("div", { style: { padding: "4px 16px calc(24px + env(safe-area-inset-bottom))" } },
        p.l360 && p.l360.ativo && p.l360.bloqueado ? h("div", null, secao("Do seu personal"), h("div", { style: { background: COR.escuro, color: "#F8FAFC", border: "1.5px solid " + COR.laranja, borderRadius: 16, padding: "12px 13px", marginBottom: 8, display: "flex", alignItems: "center", gap: 11 } }, h(Icone, { item: { titulo: "L" } }), h("div", { style: { flex: 1 } }, h("div", { style: { fontSize: 14, fontWeight: 800 } }, (p.l360.cfg && p.l360.cfg.nome) || "Longevus 360"), h("div", { style: { fontSize: 12, color: "#CBD5E1" } }, "Treino e alimentação juntos")), h("button", { type: "button", onClick: () => { p.onFechar(); p.onIr && p.onIr("alimentacao"); }, style: { border: "none", background: COR.laranja, color: "#fff", borderRadius: 10, padding: "8px 12px", fontWeight: 800, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" } }, "Conhecer"))) : (proprios.length ? secao("Do seu personal") : null),
        proprios.map(linha),
        parceiros.length ? secao("Parceiros") : null,
        parceiros.map(linha),
        !lista.length && !(p.l360 && p.l360.bloqueado) ? h("div", { style: { textAlign: "center", color: "#94A3B8", fontSize: 13, padding: 30 } }, "Em breve, novidades por aqui.") : null,
        parceiros.length ? h("div", { style: { fontSize: 11, color: "#94A3B8", lineHeight: 1.5, marginTop: 10 } }, "Os parceiros atendem de forma independente. O desconto vale com o cupom informado.") : null),
      detalhe ? h(Detalhe, { item: detalhe, ctx, ownerId: p.ownerId, studentId: p.studentId, onFechar: () => setDetalhe(null), onClique: () => api.registrar(p.ownerId, detalhe.id, p.studentId, "clique") }) : null);
  };

  const Carrossel = (p) => {
    const itens = useItens(p.ownerId);
    const ctx = contexto(p);
    const [ativo, setAtivo] = useState(0);
    const [clube, setClube] = useState(false);
    const [detalhe, setDetalhe] = useState(null);
    const trilho = useRef(null);
    const abrir = (d) => { setDetalhe(d); api.registrar(p.ownerId, d.id, p.studentId, "abriu"); };
    const lista = (itens || []).filter((d) => publicoOk(d, ctx));
    const cards = [];
    if (ctx.sem360) cards.push({ id: "__360", especial: true, tipo: "proprio", titulo: (p.l360.cfg && p.l360.cfg.nome) || "Longevus 360", texto: "Seu treino e sua alimentação conversando todos os dias.", botao: p.l360.vencido ? "Renovar o 360" : "Conhecer o 360" });
    lista.forEach((d) => cards.push(d));
    useEffect(() => {
      lista.forEach((d) => registrarVisto(p.ownerId, p.studentId, d.id));
    }, [itens]);
    if (itens === null) return null;
    if (!cards.length) return null;
    const aoRolar = () => {
      const el = trilho.current;
      if (!el || !el.children.length) return;
      const w = el.children[0].getBoundingClientRect().width + 10;
      setAtivo(Math.max(0, Math.min(cards.length - 1, Math.round(el.scrollLeft / w))));
    };
    return h("div", { style: { flexShrink: 0 } },
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 18px", marginBottom: 7 } },
        h("span", { style: { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", color: COR.cinza, textTransform: "uppercase" } }, "Para você"),
        h("button", { type: "button", onClick: () => setClube(true), style: { background: "transparent", border: "none", padding: 0, fontSize: 12.5, fontWeight: 800, color: COR.laranjaTxt, cursor: "pointer", fontFamily: "inherit" } }, "Clube Longevus ›")),
      h("div", { ref: trilho, onScroll: aoRolar, style: { display: "flex", gap: 10, overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 18px", scrollPaddingLeft: 18, scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } },
        cards.map((d) => h(CartaoOferta, { key: d.id, item: d, ctx, especial: d.especial, onAbrir: () => abrir(d), onClique: d.especial ? () => p.onIr && p.onIr("alimentacao") : () => api.registrar(p.ownerId, d.id, p.studentId, "clique") }))),
      cards.length > 1 ? h("div", { "aria-hidden": "true", style: { display: "flex", gap: 5, justifyContent: "center", marginTop: 8 } }, cards.map((d, i) => h("span", { key: d.id, style: { width: i === ativo ? 16 : 6, height: 6, borderRadius: 3, background: i === ativo ? COR.laranja : "#CBD5E1", transition: "width 0.2s" } }))) : null,
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
      if (!parceiro && d.cobranca === "pix" && !valorNum(d.valor)) return setErro("Informe o valor para o Pix.");
      if (!parceiro && d.cobranca !== "pix" && d.destino === "link" && !String(d.link || "").trim()) return setErro("Informe o link.");
      setSalvando(true);
      const ok = await onSalvar({ ...d, id: d.id || novoId("vi"), titulo: String(d.titulo).trim(), atualizadoEm: new Date().toISOString() });
      setSalvando(false);
      if (!ok) setErro("Não consegui salvar. Confira se o SQL da vitrine foi rodado.");
    };
    return h("div", null,
      h("div", { style: { fontWeight: 800, fontSize: 17, marginBottom: 12 } }, d.id ? "Editar oferta" : "Nova oferta"),
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
          : h("div", null,
            h(Campo, { rotulo: "Como o aluno paga" }, h(Pilulas, { opcoes: [["whatsapp", "Combina comigo no WhatsApp"], ["pix", "Paga pelo app (Pix)"]], valor: d.cobranca || "whatsapp", onChange: set("cobranca") })),
            d.cobranca === "pix" ? h("div", { style: { display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 0 } },
              h(Campo, { rotulo: "Valor (R$)", dica: "Entra no Pix com a sua chave do Meu Perfil." }, h("input", { inputMode: "decimal", value: d.valor || "", onChange: (e) => set("valor")(e.target.value.replace(/[^0-9.,]/g, "")), placeholder: "Ex.: 80,00", style: estiloInput })),
              h(Campo, { rotulo: "O que acontece depois do pagamento", dica: "Aparece embaixo do Pix. Ex.: Assim que confirmar, te chamo para agendar." }, h("input", { value: d.posPagamento || "", onChange: (e) => set("posPagamento")(e.target.value), style: estiloInput }))) : null,
            d.cobranca === "pix" ? null : h(Campo, { rotulo: "Quando o aluno tocar" }, h(Pilulas, { opcoes: [["whatsapp", "Abrir meu WhatsApp"], ["link", "Abrir um link"]], valor: d.destino, onChange: set("destino") })),
            d.cobranca !== "pix" && d.destino === "link" ? h(Campo, { rotulo: "Link" }, h("input", { value: d.link || "", onChange: (e) => set("link")(e.target.value), placeholder: "https://", style: estiloInput }))
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
          h(Campo, { rotulo: "Valor", dica: "Opcional. Ex.: R$ 180" }, h("input", { value: d.preco || "", onChange: (e) => set("preco")(e.target.value), style: estiloInput }))),
        h(Campo, { rotulo: "Instagram", dica: "Ex.: @drapaulanutri" }, h("input", { value: d.instagram || "", onChange: (e) => set("instagram")(e.target.value.trim()), style: estiloInput })),
        h(Campo, { rotulo: "Texto do botão", dica: parceiro ? "Padrão: Quero o desconto" : "Padrão: Quero saber mais" }, h("input", { value: d.botao || "", onChange: (e) => set("botao")(e.target.value), style: estiloInput })),
        h(Campo, { rotulo: "Mostrar para" }, h(Pilulas, { opcoes: PUBLICOS, valor: d.publico || "todos", onChange: set("publico") })),
        h(Campo, { rotulo: "Válido até", dica: "Opcional. Depois dessa data, some do app sozinho." }, h("input", { type: "date", value: d.validade || "", onChange: (e) => set("validade")(e.target.value), style: estiloInput }))),
      (parceiro || (d.cobranca !== "pix" && d.destino !== "link")) ? h("div", { style: { background: "#fff", border: "1.5px solid " + COR.borda, borderRadius: 16, padding: "14px 16px", marginTop: 12 } },
        h(Campo, { rotulo: "Mensagem do WhatsApp", dica: "Pode editar. Códigos que o app troca sozinho: {aluno}, {aluno_a}, {personal}, {personal_nome}, {parceiro}, {servico}, {cupom}, {cupom_frase}." }, h("textarea", { rows: 6, value: d.mensagem || (parceiro ? MSG_PARCEIRO : MSG_PROPRIO), onChange: (e) => set("mensagem")(e.target.value), style: { ...estiloInput, resize: "vertical", lineHeight: 1.45 } })),
        h("div", { style: { fontSize: 11.5, fontWeight: 700, color: COR.cinza, margin: "2px 0 6px" } }, "Prévia com uma aluna de exemplo"),
        h("div", { style: { background: "#ECE5DD", borderRadius: 12, padding: 10 } }, h("div", { style: { background: "#DCF8C6", borderRadius: "12px 12px 2px 12px", padding: "9px 11px", fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap", color: "#111827" } }, montarMensagem(d, exemplo)))) : null,
      erro ? h("div", { style: { fontSize: 13, color: "#DC2626", textAlign: "center", margin: "12px 0 0" } }, erro) : null,
      h("div", { style: { display: "flex", gap: 8, marginTop: 14 } },
        h("button", { type: "button", onClick: onCancelar, style: { flex: 1, height: 48, borderRadius: 24, border: "1.5px solid " + COR.borda, background: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" } }, "Cancelar"),
        h("button", { type: "button", onClick: salvar, disabled: salvando, style: { flex: 1.4, height: 48, borderRadius: 24, border: "none", background: COR.laranja, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit", opacity: salvando ? 0.6 : 1 } }, salvando ? "Salvando..." : "Salvar oferta")),
      d.id && onApagar ? h("button", { type: "button", onClick: () => onApagar(d), style: { width: "100%", height: 44, marginTop: 10, borderRadius: 22, border: "1.5px solid #FECACA", background: "#fff", color: "#DC2626", fontWeight: 700, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" } }, "Excluir esta oferta") : null);
  };

  const Painel = ({ profNome }) => {
    const [uid, setUid] = useState(null);
    const [itens, setItens] = useState(null);
    const [met, setMet] = useState({});
    const [editando, setEditando] = useState(null);
    const carregar = async () => {
      const u = await api.uid();
      setUid(u);
      if (!u) { setItens([]); return; }
      const desde = new Date(Date.now() - 30 * 86400000).toISOString();
      const [l, m] = await Promise.all([api.listar(u, false), api.metricas(u, desde)]);
      setItens(l);
      setMet(m || {});
    };
    useEffect(() => { carregar(); }, []);
    const salvar = async (item) => {
      const ok = await api.salvar(uid, item);
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
    if (editando) return h(FormItem, { inicial: editando === "novo" ? null : editando, profNome, onSalvar: salvar, onCancelar: () => setEditando(null), onApagar: apagar });
    if (itens === null) return h("div", { style: { textAlign: "center", padding: 30, color: "#94A3B8" } }, "Carregando a vitrine...");
    const totalCliques = Object.keys(met).reduce((s, k) => s + met[k].cliques, 0);
    return h("div", null,
      h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 4 } },
        h("div", { style: { fontWeight: 800, fontSize: 18 } }, "Vitrine do app"),
        h("button", { type: "button", onClick: () => setEditando("novo"), style: { height: 38, padding: "0 16px", borderRadius: 10, border: "none", background: COR.laranja, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, "+ Nova oferta")),
      h("div", { style: { fontSize: 12.5, color: COR.cinza, marginBottom: 14, lineHeight: 1.5 } }, "O que aparece no carrossel \"Para você\" e no Clube Longevus do app do aluno. Últimos 30 dias: " + totalCliques + (totalCliques === 1 ? " toque" : " toques") + " em ofertas."),
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
              h("div", { style: { fontSize: 12, color: COR.cinza } }, (d.tipo === "parceiro" ? "Parceiro" : "Seu serviço") + (d.beneficio ? " · " + d.beneficio : "") + (d.cupom ? " · " + d.cupom : "") + " · " + (PUBLICOS.find((x) => x[0] === (d.publico || "todos")) || PUBLICOS[0])[1])),
            h("button", { type: "button", onClick: () => alternar(d), "aria-label": on ? "Tirar do app" : "Mostrar no app", style: { width: 44, height: 24, borderRadius: 12, border: "none", background: on ? COR.laranja : "#CBD5E1", position: "relative", cursor: "pointer", flexShrink: 0 } }, h("span", { style: { position: "absolute", top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: 9, background: "#fff", transition: "left 0.2s" } }))),
          h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: COR.cinza, marginTop: 8, paddingTop: 8, borderTop: "1px solid #F1F5F9" } },
            h("span", null, vencida ? "Vencida em " + d.validade.split("-").reverse().join("/") : on ? "No app" : "Pausada"),
            h("span", null, h("b", { style: { color: COR.escuro } }, m.viram), " viram · ", h("b", { style: { color: COR.escuro } }, m.abriram || 0), " abriram · ", h("b", { style: { color: COR.escuro } }, m.cliques), m.cliques === 1 ? " chamou" : " chamaram")));
      }));
  };

  window.LongevusVitrine = { Carrossel, Clube: ClubeTela, Painel, montarMensagem, linkDoItem };
})();
