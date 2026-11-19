(function () {
  const { useState, useEffect } = React;
  const h = React.createElement;
  const SUPA_URL = "https://jpduxfbigcdxmtcozqpp.supabase.co";
  const SUPA_KEY = "sb_publishable_VZSgcxu5ps3eR9UAjuRr4Q_B65WTx_h";
  const supa = () => window.__LV_SUPA;
  const LS_LOCAL = "lv_materiais_local";
  const LS_SEED = "lv_materiais_seed_v1";

  const COR = { escuro: "#0F172A", laranja: "#FF5603", laranjaTxt: "#C2410C", cinza: "#64748B", borda: "#E2E8F0", fundo: "#F8FAFC" };

  const CATS = [
    ["apresentacoes", "Apresentações", "#FFF1EA", "#C2410C"],
    ["app", "Links do app", "#EEF2FF", "#4338CA"],
    ["site", "Site e redes", "#E6F1FB", "#185FA5"],
    ["parceiros", "Parceiros", "#E9F5F2", "#0F6E56"],
    ["orientacoes", "Orientações", "#FAEEDA", "#854F0B"],
    ["outros", "Outros", "#F1F5F9", "#475569"]
  ];
  const cat = (k) => CATS.find((c) => c[0] === k) || CATS[CATS.length - 1];

  const base = () => window.location.origin + window.location.pathname.replace(/[^/]*$/, "");
  const novoId = () => "mat_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

  const SUGERIDOS = () => [
    { titulo: "Apresentação Wellington Brito", url: base() + "apresentacao.html", categoria: "apresentacoes", descricao: "Livro digital para alunos, síndicos e indicações.", mensagem: "Oi! Preparei uma apresentação rápida sobre o meu trabalho com treino para um envelhecimento saudável. Dá uma olhada:\n\n{link}", fixo: true },
    { titulo: "Academia Assistida", url: base() + "academia-assistida.html", categoria: "apresentacoes", descricao: "Apresentação do formato academia assistida.", mensagem: "Oi! Segue a apresentação da Academia Assistida:\n\n{link}", fixo: false },
    { titulo: "Planos", url: base() + "wellington-brito-planos-v5.html", categoria: "app", descricao: "Página com os planos de personal.", mensagem: "Oi! Aqui estão os meus planos, com valores e o que cada um inclui:\n\n{link}", fixo: true },
    { titulo: "App do aluno (Meu Treino)", url: base() + "aluno.html", categoria: "app", descricao: "Acesso do aluno ao treino, avaliações e vitrine.", mensagem: "Oi! Este é o link do seu app de treino. Abra no celular e, no menu do navegador, toque em \"Instalar app\" ou \"Adicionar à tela inicial\":\n\n{link}", fixo: true },
    { titulo: "Scanner de risco de queda", url: base() + "longevus-scanner-sarcf.html", categoria: "app", descricao: "Questionário rápido de risco de queda.", mensagem: "Oi! Responda este questionário rápido, leva poucos minutos:\n\n{link}", fixo: false },
    { titulo: "Site Personal Longevus", url: "https://britowellington.github.io/personal-longevus/", categoria: "site", descricao: "Site com serviços e agendamento de avaliação.", mensagem: "Oi! Conheça o meu trabalho e agende sua avaliação física:\n\n{link}", fixo: false },
    { titulo: "Instagram @britowellington", url: "https://www.instagram.com/britowellington/", categoria: "site", descricao: "Perfil no Instagram.", mensagem: "Me acompanhe no Instagram:\n\n{link}", fixo: false }
  ];

  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

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
      } catch (e) { return null; }
    },
    async listar(ownerId) {
      try {
        const hd = await this.headers();
        const r = await fetch(SUPA_URL + "/rest/v1/materiais_apoio?select=id,data,fixo,ordem,updated_at&owner_id=eq." + encodeURIComponent(ownerId) + "&order=ordem.asc,updated_at.desc", { headers: hd });
        if (!r.ok) return null;
        const rows = await r.json();
        return (rows || []).map((x) => ({ ...(x.data || {}), id: x.id, fixo: !!x.fixo, ordem: x.ordem || 0 }));
      } catch (e) { return null; }
    },
    async salvar(ownerId, item) {
      try {
        const hd = { ...(await this.headers()), Prefer: "resolution=merge-duplicates" };
        const { id, fixo, ordem, ...data } = item;
        const r = await fetch(SUPA_URL + "/rest/v1/materiais_apoio", { method: "POST", headers: hd, body: JSON.stringify({ id, owner_id: String(ownerId), data, fixo: !!fixo, ordem: ordem || 0, updated_at: new Date().toISOString() }) });
        return r.ok;
      } catch (e) { return false; }
    },
    async remover(id) {
      try {
        const hd = { ...(await this.headers()), Prefer: "return=representation" };
        const r = await fetch(SUPA_URL + "/rest/v1/materiais_apoio?id=eq." + encodeURIComponent(id), { method: "DELETE", headers: hd });
        return r.ok;
      } catch (e) { return false; }
    }
  };

  const montarMsg = (m) => {
    const t = (m.mensagem && String(m.mensagem).trim()) || "{link}";
    return t.indexOf("{link}") >= 0 ? t.split("{link}").join(m.url) : t + "\n\n" + m.url;
  };
  const waHref = (m) => "https://wa.me/?text=" + encodeURIComponent(montarMsg(m));

  const copiar = async (txt) => {
    try { await navigator.clipboard.writeText(txt); return true; } catch (e) {}
    try {
      const ta = document.createElement("textarea");
      ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      return true;
    } catch (e) { return false; }
  };

  const Svg = (d, size) => h("svg", { width: size || 16, height: size || 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }, d.map((p, i) => h("path", { key: i, d: p })));
  const IC = {
    abrir: ["M14 3h7v7", "M10 14L21 3", "M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"],
    copiar: ["M9 9h11v11H9z", "M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"],
    wa: ["M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.6A8.5 8.5 0 1 1 21 11.5z"],
    editar: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"],
    mais: ["M12 5v14", "M5 12h14"],
    busca: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M21 21l-4.3-4.3"],
    pin: ["M12 17v5", "M9 10.76V6h6v4.76l2 3.24H7z", "M8 2h8"]
  };

  const btn = (extra) => ({ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 11px", borderRadius: 10, border: "1px solid " + COR.borda, background: "#fff", color: COR.escuro, fontSize: 12.5, fontWeight: 600, cursor: "pointer", textDecoration: "none", ...(extra || {}) });
  const inp = { width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: "1px solid " + COR.borda, fontSize: 14, fontFamily: "inherit", background: "#fff", color: COR.escuro };
  const lbl = { fontSize: 12, fontWeight: 700, color: "#475569", margin: "12px 0 6px", display: "block" };

  const Editor = ({ item, onSalvar, onExcluir, onFechar }) => {
    const [f, setF] = useState(item);
    const [erro, setErro] = useState("");
    const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setErro(""); };
    const salvar = () => {
      const t = String(f.titulo || "").trim();
      let u = String(f.url || "").trim();
      if (!t) return setErro("Dê um nome ao material.");
      if (!u) return setErro("Cole o link do material.");
      if (!/^https?:\/\//i.test(u)) u = "https://" + u;
      onSalvar({ ...f, titulo: t, url: u });
    };
    return h("div", { style: { position: "fixed", inset: 0, background: "rgba(15,23,42,.45)", zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center" }, onClick: onFechar },
      h("div", { style: { background: "#fff", width: "100%", maxWidth: 520, borderRadius: "18px 18px 0 0", padding: "18px 18px 24px", maxHeight: "90vh", overflowY: "auto" }, onClick: (e) => e.stopPropagation() },
        h("div", { style: { fontSize: 17, fontWeight: 800, color: COR.escuro } }, item._novo ? "Novo material" : "Editar material"),
        h("label", { style: lbl }, "Nome"),
        h("input", { style: inp, value: f.titulo || "", placeholder: "Apresentação para síndicos", onChange: (e) => set("titulo", e.target.value) }),
        h("label", { style: lbl }, "Link"),
        h("input", { style: inp, value: f.url || "", placeholder: "https://...", inputMode: "url", onChange: (e) => set("url", e.target.value) }),
        h("label", { style: lbl }, "Categoria"),
        h("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, CATS.map((c) => h("button", { key: c[0], type: "button", onClick: () => set("categoria", c[0]), style: btn({ background: f.categoria === c[0] ? c[2] : "#fff", color: f.categoria === c[0] ? c[3] : COR.cinza, borderColor: f.categoria === c[0] ? c[3] : COR.borda }) }, c[1]))),
        h("label", { style: lbl }, "Descrição (opcional)"),
        h("input", { style: inp, value: f.descricao || "", placeholder: "Para que serve este material", onChange: (e) => set("descricao", e.target.value) }),
        h("label", { style: lbl }, "Mensagem do WhatsApp"),
        h("textarea", { style: { ...inp, minHeight: 96, resize: "vertical" }, value: f.mensagem || "", placeholder: "Oi! Segue o link:\n\n{link}", onChange: (e) => set("mensagem", e.target.value) }),
        h("div", { style: { fontSize: 11.5, color: COR.cinza, marginTop: 4 } }, "Use {link} onde o link deve aparecer. Sem ele, o link vai no final."),
        h("label", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13.5, color: COR.escuro, cursor: "pointer" } },
          h("input", { type: "checkbox", checked: !!f.fixo, onChange: (e) => set("fixo", e.target.checked) }), "Fixar no topo"),
        erro ? h("div", { style: { color: "#B91C1C", fontSize: 13, marginTop: 10 } }, erro) : null,
        h("div", { style: { display: "flex", gap: 8, marginTop: 18 } },
          !item._novo ? h("button", { type: "button", onClick: () => { if (window.confirm("Excluir \"" + (item.titulo || "") + "\"?")) onExcluir(item); }, style: btn({ color: "#B91C1C", borderColor: "#FECACA" }) }, "Excluir") : null,
          h("div", { style: { flex: 1 } }),
          h("button", { type: "button", onClick: onFechar, style: btn() }, "Cancelar"),
          h("button", { type: "button", onClick: salvar, style: btn({ background: COR.laranja, color: "#fff", borderColor: COR.laranja }) }, "Salvar")
        )
      )
    );
  };

  const Card = ({ m, onEditar, onCopiado }) => {
    const c = cat(m.categoria);
    return h("div", { style: { background: "#fff", border: "1px solid " + COR.borda, borderRadius: 14, padding: "13px 14px" } },
      h("div", { style: { display: "flex", alignItems: "flex-start", gap: 8 } },
        h("div", { style: { flex: 1, minWidth: 0 } },
          h("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },
            h("span", { style: { fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: c[2], color: c[3] } }, c[1]),
            m.fixo ? h("span", { style: { color: COR.laranjaTxt, display: "inline-flex" }, title: "Fixado" }, Svg(IC.pin, 13)) : null
          ),
          h("div", { style: { fontSize: 15, fontWeight: 700, color: COR.escuro, marginTop: 6 } }, m.titulo),
          m.descricao ? h("div", { style: { fontSize: 12.5, color: COR.cinza, marginTop: 2, lineHeight: 1.45 } }, m.descricao) : null,
          h("div", { style: { fontSize: 11.5, color: "#94A3B8", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, m.url.replace(/^https?:\/\//, ""))
        ),
        h("button", { type: "button", "aria-label": "Editar", onClick: () => onEditar(m), style: { border: "none", background: "transparent", color: COR.cinza, padding: 4, cursor: "pointer" } }, Svg(IC.editar, 17))
      ),
      h("div", { style: { display: "flex", gap: 6, marginTop: 11, flexWrap: "wrap" } },
        h("a", { href: m.url, target: "_blank", rel: "noopener", style: btn() }, Svg(IC.abrir, 15), "Abrir"),
        h("button", { type: "button", onClick: async () => { onCopiado(await copiar(m.url) ? "Link copiado" : "Não deu para copiar"); }, style: btn() }, Svg(IC.copiar, 15), "Copiar link"),
        h("a", { href: waHref(m), target: "_blank", rel: "noopener", style: btn({ background: "#E9F7EF", color: "#166534", borderColor: "#BBF7D0" }) }, Svg(IC.wa, 15), "Enviar")
      )
    );
  };

  const Page = ({ session }) => {
    const [itens, setItens] = useState(null);
    const [local, setLocal] = useState(false);
    const [busca, setBusca] = useState("");
    const [filtro, setFiltro] = useState("todos");
    const [edit, setEdit] = useState(null);
    const [toast, setToast] = useState("");
    const [owner, setOwner] = useState(null);

    const avisar = (t) => { setToast(t); setTimeout(() => setToast(""), 1800); };

    useEffect(() => {
      let vivo = true;
      (async () => {
        const uid = (session && session.user && session.user.id) || (await api.uid());
        if (!vivo) return;
        setOwner(uid);
        let lista = uid ? await api.listar(uid) : null;
        if (lista === null) {
          setLocal(true);
          lista = lsGet(LS_LOCAL, null);
          if (!lista) { lista = SUGERIDOS().map((x, i) => ({ ...x, id: novoId(), ordem: i })); lsSet(LS_LOCAL, lista); }
        } else if (lista.length === 0 && !lsGet(LS_SEED, false)) {
          const sug = SUGERIDOS().map((x, i) => ({ ...x, id: novoId(), ordem: i }));
          for (const s of sug) await api.salvar(uid, s);
          lsSet(LS_SEED, true);
          lista = sug;
        }
        if (vivo) setItens(lista);
      })();
      return () => { vivo = false; };
    }, []);

    const persistir = async (novaLista, alterado, removido) => {
      setItens(novaLista);
      if (local) { lsSet(LS_LOCAL, novaLista); return true; }
      if (removido) return api.remover(removido.id);
      return api.salvar(owner, alterado);
    };

    const salvar = async (f) => {
      const { _novo, ...item } = f;
      const existe = (itens || []).some((x) => x.id === item.id);
      const lista = existe ? itens.map((x) => (x.id === item.id ? item : x)) : [...(itens || []), { ...item, ordem: (itens || []).length }];
      setEdit(null);
      const ok = await persistir(lista, item);
      avisar(ok ? "Salvo" : "Não foi possível salvar. Tente de novo.");
    };
    const excluir = async (item) => {
      setEdit(null);
      const ok = await persistir(itens.filter((x) => x.id !== item.id), null, item);
      avisar(ok ? "Excluído" : "Não foi possível excluir.");
    };

    const q = busca.trim().toLowerCase();
    const visiveis = (itens || [])
      .filter((m) => filtro === "todos" || m.categoria === filtro)
      .filter((m) => !q || [m.titulo, m.descricao, m.url].join(" ").toLowerCase().indexOf(q) >= 0)
      .sort((a, b) => (b.fixo ? 1 : 0) - (a.fixo ? 1 : 0) || (a.ordem || 0) - (b.ordem || 0));
    const fixos = visiveis.filter((m) => m.fixo);
    const outros = visiveis.filter((m) => !m.fixo);
    const catsUsadas = CATS.filter((c) => (itens || []).some((m) => m.categoria === c[0]));

    const secao = (titulo, lista) => lista.length ? h("div", { style: { marginTop: 16 } },
      h("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".04em" } }, titulo),
      h("div", { style: { display: "grid", gap: 10 } }, lista.map((m) => h(Card, { key: m.id, m, onEditar: setEdit, onCopiado: avisar })))
    ) : null;

    return h("div", { style: { padding: "4px 0 90px" } },
      h("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
        h("div", { style: { flex: 1 } },
          h("div", { style: { fontSize: 22, fontWeight: 800, color: COR.escuro } }, "Materiais de apoio"),
          h("div", { style: { fontSize: 13, color: COR.cinza, marginTop: 2 } }, "Links e apresentações prontos para enviar")
        ),
        h("button", { type: "button", onClick: () => setEdit({ _novo: true, id: novoId(), titulo: "", url: "", categoria: "outros", descricao: "", mensagem: "", fixo: false }), style: btn({ background: COR.laranja, color: "#fff", borderColor: COR.laranja, padding: "10px 13px" }) }, Svg(IC.mais, 15), "Novo")
      ),
      local ? h("div", { style: { marginTop: 12, fontSize: 12.5, background: "#FEF3C7", color: "#92400E", padding: "9px 12px", borderRadius: 10, lineHeight: 1.45 } }, "Salvando só neste aparelho. Rode o SQL dos materiais no Supabase para sincronizar entre celular e computador.") : null,
      h("div", { style: { position: "relative", marginTop: 14 } },
        h("span", { style: { position: "absolute", left: 11, top: 11, color: "#94A3B8" } }, Svg(IC.busca, 16)),
        h("input", { style: { ...inp, paddingLeft: 34 }, value: busca, placeholder: "Buscar material", onChange: (e) => setBusca(e.target.value) })
      ),
      catsUsadas.length > 1 ? h("div", { style: { display: "flex", gap: 6, marginTop: 10, overflowX: "auto", paddingBottom: 2 } },
        [["todos", "Todos", "#FFF1EA", "#C2410C"]].concat(catsUsadas).map((c) => h("button", { key: c[0], type: "button", onClick: () => setFiltro(c[0]), style: btn({ flexShrink: 0, borderRadius: 999, background: filtro === c[0] ? c[2] : "#fff", color: filtro === c[0] ? c[3] : COR.cinza, borderColor: filtro === c[0] ? c[3] : COR.borda }) }, c[1]))
      ) : null,
      itens === null ? h("div", { style: { marginTop: 30, textAlign: "center", color: "#94A3B8", fontSize: 14 } }, "Carregando...") :
      visiveis.length === 0 ? h("div", { style: { marginTop: 30, textAlign: "center", color: COR.cinza, fontSize: 14 } }, q ? "Nenhum material encontrado." : "Adicione seu primeiro link em Novo.") :
      h("div", null, secao("Fixados", fixos), secao(fixos.length ? "Todos os materiais" : "Materiais", outros)),
      edit ? h(Editor, { item: edit, onSalvar: salvar, onExcluir: excluir, onFechar: () => setEdit(null) }) : null,
      toast ? h("div", { style: { position: "fixed", left: "50%", bottom: 90, transform: "translateX(-50%)", background: COR.escuro, color: "#fff", padding: "9px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600, zIndex: 10000 } }, toast) : null
    );
  };

  window.LongevusMateriais = { Page };
})();
