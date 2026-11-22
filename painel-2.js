// Painel do professor (longevus-app.html) · parte 2 de 4. Código já convertido (sem Babel no navegador).
const Students = ({ students, setStudents, planos, setPagamentos, nav, abrirNovo }) => {
  const [modal, setModal] = useState(!!abrirNovo);
  const [cardioModal, setCardioModal] = useState(false);
  const [selCardioSt, setSelCardioSt] = useState("");
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", dob: "", sex: "", phone: "", email: "", whatsapp: "", responsibleName: "", responsiblePhone: "", doctorName: "", doctorPhone: "", planoId: "", primeiroVencimento: "" });
  const [search, setSearch] = useState("");
  const [appLinkModal, setAppLinkModal] = useState(null);
  const [aba, setAba] = useState("ativo");
  const open = (s = null) => {
    setForm(s ? { name: s.name, dob: s.dob || "", sex: s.sex || "", phone: s.phone || "", email: s.email || "", whatsapp: s.whatsapp || "", responsibleName: s.responsibleName || "", responsiblePhone: s.responsiblePhone || "", doctorName: s.doctorName || "", doctorPhone: s.doctorPhone || "", notes: s.notes || "", planoId: "" } : { name: "", dob: "", sex: "", phone: "", email: "", whatsapp: "", responsibleName: "", responsiblePhone: "", doctorName: "", doctorPhone: "", notes: "", planoId: "", primeiroVencimento: "" });
    setEditId(s?.id || null);
    setModal(true);
  };
  const save = () => {
    if (!form.name.trim()) return;
    const { planoId, primeiroVencimento, ...dados } = form;
    if (editId) {
      setStudents((p) => p.map((s) => s.id === editId ? { ...s, ...dados } : s));
    } else {
      const pl = planoId ? (planos || []).find((p) => p.id === planoId) : null;
      const novoAluno = { id: uid(), ...dados, status: "ativo", createdAt: todayStr() };
      if (pl) novoAluno.billing = { ativo: true, tipo: "mensal", modoCobranca: pl.modoCobranca || "fixo", plano: pl.nome, valor: pl.valor || "", valorSessao: pl.valorSessao || "", regraVencimento: pl.regraVencimento || "30dias", toleranciaDias: pl.toleranciaDias ?? "", vencimento: primeiroVencimento || "" };
      setStudents((p) => [...p, novoAluno]);
      if (pl && pl.modoCobranca !== "porSessao" && primeiroVencimento && setPagamentos) setPagamentos((p) => [...p, novoPagamentoMensal(novoAluno, primeiroVencimento, todayStr())]);
    }
    setModal(false);
  };
  const del = async (id) => {
    if (!window.confirm("Remover aluno? Isso apaga também avaliações, pagamentos, check-ins e todo o histórico dele.")) return;
    try {
      const headers = await DB.authHeaders();
      const r = await fetch(SUPA_URL + "/rest/v1/rpc/rpc_excluir_aluno_completo", { method: "POST", headers, body: JSON.stringify({ p_student_id: id }) });
      if (!r.ok) {
        const t = await r.text();
        alert("Não foi possível excluir esse aluno.\n\nDetalhe técnico: " + t.slice(0, 300));
        return;
      }
      setStudents((p) => p.filter((s) => s.id !== id));
    } catch (e) {
      alert("Erro de conexão ao excluir aluno.");
    }
  };
  const toggleStatus = async (s) => {
    const novo = (s.status || "ativo") === "ativo" ? "inativo" : "ativo";
    if (!window.confirm(novo === "inativo" ? `Marcar ${s.name} como inativo? Ele deixará de aparecer na lista de ativos, mas o histórico é mantido.` : `Reativar ${s.name}?`)) return;
    const atualizado = { ...s, status: novo };
    const ok = await DB.save("students", s.id, atualizado);
    if (!ok) {
      alert("Não foi possível salvar essa alteração agora. Verifique sua conexão e tente de novo.");
      return;
    }
    setStudents((p) => p.map((x) => x.id === s.id ? atualizado : x));
  };
  const ativos = students.filter((s) => (s.status || "ativo") === "ativo");
  const inativos = students.filter((s) => (s.status || "ativo") === "inativo");
  const genAppLink = (s) => {
    const base = window.location.origin + window.location.pathname.replace(/[^/]+$/, "");
    setAppLinkModal({ name: s.name, url: base + "aluno.html" });
  };
  const copyAppLink = () => {
    if (!appLinkModal) return;
    navigator.clipboard?.writeText(appLinkModal.url).then(() => window.alert("Link copiado!")).catch(() => {
    });
  };
  const listaAba = aba === "ativo" ? ativos : inativos;
  const filtered = listaAba.filter((s) => s.name?.toLowerCase().includes(search.toLowerCase()));
  return React.createElement("div", null, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 20 } }, "Alunos"), React.createElement(Btn, { icon: "plus", sm: true, onClick: () => open() }, "Novo")), React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 14, background: "#f1f5f9", borderRadius: 11, padding: 4 } }, React.createElement("button", { onClick: () => setAba("ativo"), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", background: aba === "ativo" ? O : "transparent", color: aba === "ativo" ? "#fff" : "#64748b" } }, "Ativos (", ativos.length, ")"), React.createElement("button", { onClick: () => setAba("inativo"), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", background: aba === "inativo" ? O : "transparent", color: aba === "inativo" ? "#fff" : "#64748b" } }, "Inativos (", inativos.length, ")")), React.createElement("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Buscar...", style: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, boxSizing: "border-box", marginBottom: 14 } }), filtered.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 40 } }, React.createElement(I, { n: "users", c: "#cbd5e1", s: 36 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, aba === "ativo" ? "Nenhum aluno ativo." : "Nenhum aluno inativo."), aba === "ativo" && React.createElement("div", { style: { marginTop: 14 } }, React.createElement(Btn, { icon: "plus", onClick: () => open() }, "Cadastrar"))) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, filtered.map((s) => React.createElement(Card, { key: s.id, onClick: () => nav("studentDetail", { studentId: s.id }), style: { padding: "14px 16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, React.createElement("div", { style: { width: 44, height: 44, borderRadius: 12, background: "#fff4ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: O, flexShrink: 0 } }, s.name?.[0]?.toUpperCase()), React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 15 } }, s.name), React.createElement("div", { style: { fontSize: 12, color: "#94a3b8" } }, calcAge(s.dob), " anos · ", s.sex === "M" ? "Masc" : s.sex === "F" ? "Fem" : "—", s.phone ? " · " + s.phone : ""))), React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 10 }, onClick: (e) => e.stopPropagation() }, aba === "ativo" ? React.createElement(Btn, { sm: true, variant: "primary", icon: "clip", onClick: () => nav("newAssessment", { studentId: s.id }) }, "Avaliar") : React.createElement("span", null), React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 2, background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 11, padding: 2 } }, React.createElement(Btn, { sm: true, variant: "ghost", icon: "download", onClick: () => genAppLink(s) }), React.createElement(Btn, { sm: true, variant: "ghost", icon: "edit", onClick: () => open(s) }), React.createElement(Btn, { sm: true, variant: "ghost", icon: aba === "ativo" ? "x" : "check", onClick: () => toggleStatus(s), style: { color: aba === "ativo" ? "#d97706" : "#16a34a" } }), React.createElement("div", { style: { width: 1, height: 20, background: "#e2e8f0", margin: "0 2px" } }), React.createElement(Btn, { sm: true, variant: "ghost", icon: "trash", onClick: () => del(s.id), style: { color: "#dc2626" } }))), aba === "inativo" && React.createElement("div", { style: { marginTop: 8 } }, React.createElement(Badge, { color: "#d97706", bg: "#fff7ed" }, "Inativo")), (s.email || s.whatsapp || s.responsibleName || s.doctorName) && React.createElement("div", { style: { marginTop: 8, paddingTop: 8, borderTop: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", gap: 6 } }, s.email && React.createElement("span", { style: { fontSize: 11, color: "#64748b" } }, "✉️ ", s.email), s.whatsapp && React.createElement("span", { style: { fontSize: 11, color: "#64748b" } }, "💬 ", s.whatsapp), s.responsibleName && React.createElement("span", { style: { fontSize: 11, color: "#64748b" } }, "👤 ", s.responsibleName, " ", s.responsiblePhone ? "(" + s.responsiblePhone + ")" : ""), s.doctorName && React.createElement("span", { style: { fontSize: 11, color: "#64748b" } }, "🩺 ", s.doctorName, " ", s.doctorPhone ? "(" + s.doctorPhone + ")" : ""))))), modal && React.createElement(Modal, { title: editId ? "Editar Aluno" : "Novo Aluno", onClose: () => setModal(false) }, React.createElement(Inp, { label: "Nome completo *", value: form.name, onChange: (v) => setForm((f) => ({ ...f, name: v })), placeholder: "Nome do aluno" }), !editId && React.createElement(Inp, { label: "Plano (opcional)", value: form.planoId, onChange: (v) => setForm((f) => ({ ...f, planoId: v })), opts: [{ v: "", l: "Sem plano definido ainda" }, ...(planos || []).filter((pl) => pl.ativo !== false).map((pl) => ({ v: pl.id, l: pl.nome + " · " + (pl.modoCobranca === "porSessao" ? "R$ " + Number(pl.valorSessao || 0).toFixed(2).replace(".", ",") + "/sessão" : "R$ " + Number(pl.valor || 0).toFixed(2).replace(".", ",")) }))], note: "Define logo de cara em qual plano esse aluno entra. Dá pra trocar depois em Cobrança." }), !editId && form.planoId && (planos || []).find((pl) => pl.id === form.planoId)?.modoCobranca !== "porSessao" && React.createElement(Inp, { label: "Primeiro vencimento", type: "date", value: form.primeiroVencimento, onChange: (v) => setForm((f) => ({ ...f, primeiroVencimento: v })), note: "Os próximos seguem a regra do plano (30 dias ou 5º dia útil)." }), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Nascimento", type: "date", value: form.dob, onChange: (v) => setForm((f) => ({ ...f, dob: v })) }), React.createElement(Inp, { label: "Sexo", value: form.sex, onChange: (v) => setForm((f) => ({ ...f, sex: v })), opts: [{ v: "", l: "Selecione" }, { v: "M", l: "Masculino" }, { v: "F", l: "Feminino" }] })), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Telefone", value: form.phone, onChange: (v) => setForm((f) => ({ ...f, phone: v })), placeholder: "(00) 00000-0000" }), React.createElement(Inp, { label: "Email", type: "email", value: form.email, onChange: (v) => setForm((f) => ({ ...f, email: v })), placeholder: "email@exemplo.com" })), React.createElement(Inp, { label: "WhatsApp", value: form.whatsapp, onChange: (v) => setForm((f) => ({ ...f, whatsapp: v })), placeholder: "(00) 00000-0000" }), React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#FF5603", marginBottom: 8, marginTop: 4, paddingTop: 10, borderTop: "1px solid #f1f5f9" } }, "👤 Contato do Responsável (opcional)"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Nome do responsável", value: form.responsibleName, onChange: (v) => setForm((f) => ({ ...f, responsibleName: v })), placeholder: "Nome completo" }), React.createElement(Inp, { label: "WhatsApp do responsável", value: form.responsiblePhone, onChange: (v) => setForm((f) => ({ ...f, responsiblePhone: v })), placeholder: "(00) 00000-0000" })), React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#FF5603", marginBottom: 8, marginTop: 4, paddingTop: 10, borderTop: "1px solid #f1f5f9" } }, "🩺 Médico de Confiança (opcional)"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Nome do médico", value: form.doctorName, onChange: (v) => setForm((f) => ({ ...f, doctorName: v })), placeholder: "Dr(a). Nome" }), React.createElement(Inp, { label: "Contato do médico", value: form.doctorPhone, onChange: (v) => setForm((f) => ({ ...f, doctorPhone: v })), placeholder: "(00) 00000-0000" })), React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 8 } }, React.createElement(Btn, { variant: "secondary", full: true, onClick: () => setModal(false) }, "Cancelar"), React.createElement(Btn, { full: true, onClick: save }, "Salvar"))), appLinkModal && React.createElement(Modal, { title: "Link do Aplicativo", onClose: () => setAppLinkModal(null) }, React.createElement("div", { style: { fontSize: 13, color: "#475569", marginBottom: 12 } }, "Envie este link para ", React.createElement("b", null, appLinkModal.name), " baixar/abrir o aplicativo do aluno. No primeiro acesso ela cria a senha (com o e-mail que você cadastrou) e já cai direto no questionário — nenhuma etapa extra necessária."), React.createElement("div", { style: { background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 12px", fontSize: 12, wordBreak: "break-all", color: "#334155", marginBottom: 14 } }, appLinkModal.url), React.createElement("div", { style: { display: "flex", gap: 10 } }, React.createElement(Btn, { variant: "secondary", full: true, onClick: () => setAppLinkModal(null) }, "Fechar"), React.createElement(Btn, { full: true, icon: "download", onClick: copyAppLink }, "Copiar Link"))));
};
const StudentDetail = ({ studentId, students, setStudents, assessments, setAssessments, programs, setPrograms, dailyLogs, documents, checkins, sessions, setSessions, exerciciosBiblioteca, planos, professorFeedbacks, setProfessorFeedbacks, agendaEntries, setAgendaEntries, pagamentos, setPagamentos, ultimoAcesso, initialTab, nav }) => {
  const st = students.find((s) => s.id === studentId);
  const [tab, setTab] = useState(initialTab || "aval");
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState(null);
  const [agendaMonthRef, setAgendaMonthRef] = useState(() => new Date());
  const [agendaEditId, setAgendaEditId] = useState(null);
  const [agendaEditForm, setAgendaEditForm] = useState(null);
  const [baixaAberta, setBaixaAberta] = useState(false);
  const [gerandoSenha, setGerandoSenha] = useState(false);
  const [senhaMsg, setSenhaMsg] = useState("");
  const gerarSenhaTemporaria = async () => {
    if (!st.whatsapp) {
      setSenhaMsg("Cadastre o WhatsApp do aluno antes de gerar a senha.");
      return;
    }
    setGerandoSenha(true);
    setSenhaMsg("");
    const senha = String(Math.floor(1e5 + Math.random() * 9e5));
    const { data, error } = await supa.rpc("rpc_gerar_senha_temporaria", { p_student_id: st.id, p_nova_senha: senha });
    setGerandoSenha(false);
    if (error) {
      console.error("rpc_gerar_senha_temporaria erro:", error);
      setSenhaMsg("Erro: " + (error.message || JSON.stringify(error)));
      return;
    }
    if (!data?.ok) {
      setSenhaMsg(data && data.error || "Erro ao gerar senha. Tente novamente.");
      return;
    }
    const numeroLimpo = st.whatsapp.replace(/\D/g, "");
    const numeroCompleto = numeroLimpo.length <= 11 ? "55" + numeroLimpo : numeroLimpo;
    const primeiroNome = (st.name || "").split(" ")[0];
    const texto = "Oi " + primeiroNome + "! Pra acessar seu treino no app, entra com o e-mail " + st.portalEmail + " e essa senha temporária: " + senha + ". Assim que entrar, o app vai pedir pra você criar sua senha definitiva.";
    window.open("https://wa.me/" + numeroCompleto + "?text=" + encodeURIComponent(texto), "_blank");
    setSenhaMsg("Senha gerada. WhatsApp aberto com o e-mail e a senha prontos pra enviar.");
  };
  const openAgendaEdit = (entry) => {
    setAgendaEditId(entry.id);
    setAgendaEditForm({ date: entry.date, time: entry.time || "", status: entry.status, obs: entry.obs || "" });
  };
  const saveAgendaEdit = () => {
    const original = agendaEntries.find((e) => e.id === agendaEditId) || {};
    const atualizado = marcarReagendamento(original, { ...original, ...agendaEditForm, id: agendaEditId });
    setAgendaEntries((p) => p.map((e) => e.id === agendaEditId ? atualizado : e));
    atualizarFinanceiroPelaAgenda(atualizado, students, agendaEntries, setPagamentos, setStudents);
    setAgendaEditId(null);
  };
  const delAgendaEntry = async (id) => {
    if (window.confirm("Remover este compromisso da agenda?")) {
      await DB.remove("agenda", id);
      setAgendaEntries((p) => p.filter((e) => e.id !== id));
      removerPagamentoDaAgenda(id, setPagamentos);
      setAgendaEditId(null);
    }
  };
  if (!st) return React.createElement("div", { style: { textAlign: "center", padding: 40, color: "#94a3b8" } }, "Aluno não encontrado.");
  const stAssessments = assessments.filter((a) => a.studentId === studentId).sort((a, b) => b.date?.localeCompare(a.date));
  const stPrograms = programs.filter((p) => p.studentId === studentId).sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""));
  const currentProgram = stPrograms[0];
  const stLogs = dailyLogs.filter((l) => l.studentId === studentId).sort((a, b) => b.date?.localeCompare(a.date));
  const stDocs = documents.filter((d) => d.studentId === studentId).sort((a, b) => b.date?.localeCompare(a.date));
  const stCheckins = (checkins || []).filter((c) => c.student_id === studentId).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  const stFeedbacks = (professorFeedbacks || []).filter((f) => f.studentId === studentId).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const stAgenda = (agendaEntries || []).filter((e) => e.studentId === studentId);
  const agendaMesRef = toISODateLocal(agendaMonthRef).slice(0, 7);
  const stAgendaMes = stAgenda.filter((e) => e.date && e.date.slice(0, 7) === agendaMesRef).sort((a, b) => (b.date || "").localeCompare(a.date || "") || (a.time || "").localeCompare(b.time || ""));
  const agendaContagemMes = { agendado: 0, confirmada: 0, realizada: 0, falta: 0 };
  stAgendaMes.forEach((e) => {
    if (agendaContagemMes[e.status] !== void 0) agendaContagemMes[e.status]++;
  });
  const stCheckinsPre = (checkins || []).filter((c) => c.student_id === studentId && c.type === "pre_treino").map((c) => ({ date: c.data?.date || (c.created_at || "").slice(0, 10), ...c.data })).filter((c) => c.date).sort((a, b) => a.date.localeCompare(b.date));
  const stCheckinsPos = (checkins || []).filter((c) => c.student_id === studentId && c.type === "pos_treino").map((c) => ({ date: c.data?.date || (c.created_at || "").slice(0, 10), ...c.data })).filter((c) => c.date).sort((a, b) => a.date.localeCompare(b.date));
  const DOR_NUM = { nenhuma: 0, leve: 1, moderada: 2, alta: 3 };
  const BEMESTAR_METRICAS = [
    { id: "disposicao", label: "Disposição", fonte: stCheckinsPre, get: (c) => c.disposicao, max: 5 },
    { id: "sono", label: "Sono", fonte: stCheckinsPre, get: (c) => c.sono, max: 4 },
    { id: "hidratacao", label: "Hidratação", fonte: stCheckinsPre, get: (c) => c.hidratacao, max: 5 },
    { id: "alimentacao", label: "Alimentação", fonte: stCheckinsPre, get: (c) => c.alimentacao, max: 4 },
    { id: "esforco", label: "Esforço no treino", fonte: stCheckinsPos, get: (c) => c.esforco, max: 5 },
    { id: "dorpos", label: "Dor pós-treino", fonte: stCheckinsPos, get: (c) => DOR_NUM[c.dor], max: 3 }
  ];
  const extrairCargas = (s) => {
    const out = [];
    if (!s) return out;
    if (s.cargas) Object.values(s.cargas).forEach((c) => {
      if (c && c.carga && !isNaN(parseFloat(c.carga))) out.push({ date: s.date, name: c.nome || "Exercício", load: parseFloat(c.carga) });
    });
    if (Array.isArray(s.exercises)) s.exercises.forEach((e) => {
      if (e && e.load && !isNaN(parseFloat(e.load))) out.push({ date: s.date, name: e.name || "Exercício", load: parseFloat(e.load) });
    });
    return out;
  };
  const stCargas = (sessions || []).filter((s) => s && s.studentId === studentId).flatMap(extrairCargas).filter((c) => c.date).sort((a, b) => a.date.localeCompare(b.date));
  const exerciciosDoPrograma = new Set();
  if (currentProgram?.prescricao) {
    Object.values(currentProgram.prescricao).forEach((porTreino) => {
      Object.values(porTreino).forEach((sessaoB) => {
        MOMENTOS.forEach(([mk]) => {
          (sessaoB[mk] || []).forEach((it) => {
            if (it && it.exId && it.exId !== "cognitivo") {
              const ex = (exerciciosBiblioteca || []).find((e) => e.id === it.exId) || EXERCISES.find((e) => e.id === it.exId);
              if (ex) exerciciosDoPrograma.add(ex.nome);
            }
          });
        });
      });
    });
  }
  const exerciciosComCarga = [...new Set([...stCargas.map((c) => c.name), ...exerciciosDoPrograma])].sort();
  const stSessions = (sessions || []).filter((s) => s && s.studentId === studentId).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const blocosAtivosPres = blocosPara(currentProgram);
  const semanasPorBlocoPadraoPres = currentProgram?.origem === "consultoria" ? 8 : 6;
  const sessionsPerBloco = (key) => stSessions.filter((s) => s.blocoKey === key).length;
  const requiredParaBlocoPres = (idx) => (blocosAtivosPres[idx]?.semanasCount || semanasPorBlocoPadraoPres) * (currentProgram?.freq || 3);
  let maxUnlockedIdx = 0;
  for (let i = 1; i < blocosAtivosPres.length; i++) {
    if (sessionsPerBloco(blocosAtivosPres[i - 1].key) >= requiredParaBlocoPres(i - 1)) maxUnlockedIdx = i;
    else break;
  }
  const treinosUnicosInicial = currentProgram ? blocosAtivosPres[maxUnlockedIdx]?.treinos || [...new Set(currentProgram.divisao?.sequencia || ["A"])] : [];
  let treinoDeHojeCalc = treinosUnicosInicial[0];
  if (stSessions.length > 0 && treinosUnicosInicial.length > 0) {
    const idxUltimo = treinosUnicosInicial.indexOf(stSessions[0].treinoKey);
    if (idxUltimo !== -1) treinoDeHojeCalc = treinosUnicosInicial[(idxUltimo + 1) % treinosUnicosInicial.length];
  }
  const [presBlocoIdx, setPresBlocoIdx] = useState(maxUnlockedIdx);
  const [presTreinoIdx, setPresTreinoIdx] = useState(() => {
    const i = treinosUnicosInicial.indexOf(treinoDeHojeCalc);
    return i === -1 ? 0 : i;
  });
  const [presDone, setPresDone] = useState(() => new Set());
  const [presCargasTreino, setPresCargasTreino] = useState({});
  const [presTreinoSalvo, setPresTreinoSalvo] = useState(false);
  const blocoAtivoPres = blocosAtivosPres[presBlocoIdx] || blocosAtivosPres[0];
  const requiredPerBlock = requiredParaBlocoPres(presBlocoIdx);
  const treinosUnicos = blocoAtivoPres?.treinos || treinosUnicosInicial;
  const treinoAtivoPres = treinosUnicos[presTreinoIdx] || treinosUnicos[0] || "A";
  const tdPres = TREINO_DEFS[treinoAtivoPres];
  const sessaoPres = ((currentProgram?.prescricao || {})[blocoAtivoPres.key] || {})[treinoAtivoPres] || { inicial: [], principal: [], final: [] };
  const chavePrefixoPres = blocoAtivoPres.key + "-" + treinoAtivoPres + "-";
  const presDoneAtual = [...presDone].filter((k) => k.startsWith(chavePrefixoPres)).length;
  const allKeysPres = [];
  MOMENTOS.forEach(([mk]) => {
    (sessaoPres[mk] || []).forEach((_, idx) => allKeysPres.push(chavePrefixoPres + mk + "-" + idx));
  });
  const togglePresDone = (k) => setPresDone((prev) => {
    const n = new Set(prev);
    if (n.has(k)) n.delete(k);
    else n.add(k);
    return n;
  });
  const setPresCarga = (k, val) => setPresCargasTreino((prev) => ({ ...prev, [k]: val }));
  const getLastCargaPres = (exId) => {
    if (!exId) return null;
    for (const s of stSessions) {
      if (!s.cargas) continue;
      const found = Object.values(s.cargas).find((c) => c && c.exId === exId && c.carga);
      if (found) return found.carga;
    }
    return null;
  };
  const salvarTreinoPresencial = () => {
    const cargasPreenchidas = {};
    allKeysPres.forEach((k) => {
      const v = presCargasTreino[k];
      if (!v) return;
      const [, , mk, idxStr] = k.split("-");
      const it = (sessaoPres[mk] || [])[parseInt(idxStr, 10)];
      if (!it || it.exId === "cognitivo") return;
      const ex = (exerciciosBiblioteca || []).find((e) => e.id === it.exId) || EXERCISES.find((e) => e.id === it.exId);
      cargasPreenchidas[k] = { exId: it.exId, nome: ex?.nome || "Exercício", carga: v };
    });
    const novaSessao = { id: uid(), studentId, programId: currentProgram?.id, blocoKey: blocoAtivoPres.key, treinoKey: treinoAtivoPres, date: todayStr(), totalEx: allKeysPres.length, completedEx: presDoneAtual, cargas: cargasPreenchidas, source: "professor_presencial", createdAt: (new Date()).toISOString() };
    setSessions((prev) => [...prev, novaSessao]);
    setPresTreinoSalvo(true);
    setPresDone((prev) => new Set([...prev].filter((k) => !k.startsWith(chavePrefixoPres))));
    setPresCargasTreino((prev) => {
      const n = { ...prev };
      Object.keys(n).forEach((k) => {
        if (k.startsWith(chavePrefixoPres)) delete n[k];
      });
      return n;
    });
  };
  const stEvolAssessments = [...stAssessments].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const TESTES_METRICAS = [
    { id: "sppbChair", label: "Sentar e Levantar (seg)", get: (a) => a.physical?.sppbChair ? parseFloat(a.physical.sppbChair) : void 0 },
    { id: "grip", label: "Preensão Manual (kg)", get: (a) => a.physical?.grip ? parseFloat(a.physical.grip) : void 0 },
    { id: "tug", label: "Timed Up and Go (seg)", get: (a) => a.physical?.tug ? parseFloat(a.physical.tug) : void 0 },
    { id: "sitreach", label: "Flexibilidade (cm)", get: (a) => a.physical?.sitreach !== void 0 && a.physical?.sitreach !== "" ? parseFloat(a.physical.sitreach) : void 0 },
    { id: "sppbBalance", label: "Equilíbrio (SPPB)", get: (a) => a.physical?.sppbBalanceScore },
    { id: "global", label: "Índice Global", get: (a) => a.globalScore },
    { id: "aha", label: "Cardiovascular (AHA)", get: (a) => a.aha?.score },
    { id: "functional", label: "Funcional", get: (a) => a.functional?.score },
    { id: "physical", label: "Aptidão Física", get: (a) => a.physical?.score }
  ];
  const MultiLineChart = ({ series }) => {
    const valid = (series || []).filter((s) => s.data && s.data.length > 0);
    if (valid.length === 0) return React.createElement("div", { style: { textAlign: "center", color: "#cbd5e1", fontSize: 12, padding: "28px 0" } }, "Sem dados suficientes ainda.");
    const w = 300, laneH = 54, gap = 22, padX = 18;
    const h = valid.length * laneH + (valid.length - 1) * gap + 6;
    return React.createElement("div", null, React.createElement("svg", { width: "100%", viewBox: `0 0 ${w} ${h}`, style: { overflow: "visible" } }, valid.map((s, si) => {
      const laneY0 = si * (laneH + gap) + 3;
      const vals = s.data.map((d) => d.y);
      const min = Math.min(...vals), max = Math.max(...vals);
      const range = max - min || 1;
      const stepX = s.data.length > 1 ? (w - padX * 2) / (s.data.length - 1) : 0;
      const pts = s.data.map((d, i) => ({ ...d, px: padX + i * stepX, py: laneY0 + laneH - (d.y - min) / range * laneH }));
      const pathD = pts.map((p, i) => (i === 0 ? "M" : "L") + p.px.toFixed(1) + "," + p.py.toFixed(1)).join(" ");
      return React.createElement("g", { key: si }, React.createElement("line", { x1: padX, y1: laneY0 + laneH + gap / 2, x2: w - padX, y2: laneY0 + laneH + gap / 2, stroke: "#f1f5f9", strokeWidth: "1" }), React.createElement("path", { d: pathD, fill: "none", stroke: s.color, strokeWidth: "2.2" }), pts.map((p, i) => React.createElement("circle", { key: i, cx: p.px, cy: p.py, r: "2.8", fill: s.color })));
    })), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 7, marginTop: 12 } }, valid.map((s, si) => {
      const first = s.data[0], last = s.data[s.data.length - 1];
      return React.createElement("div", { key: si, style: { display: "flex", alignItems: "center", gap: 6, fontSize: 11 } }, React.createElement("span", { style: { width: 8, height: 8, borderRadius: 99, background: s.color, flexShrink: 0 } }), React.createElement("span", { style: { fontWeight: 700, color: "#334155", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, s.label), React.createElement("span", { style: { color: "#94a3b8", flexShrink: 0 } }, fmt(first.x), " · ", first.y, " → ", fmt(last.x), " · ", last.y));
    })));
  };
  const [evolSubTab, setEvolSubTab] = useState("bemestar");
  const [evolMetricasSel, setEvolMetricasSel] = useState(["sono"]);
  const toggleEvolMetrica = (id) => setEvolMetricasSel((p) => p.includes(id) ? p.filter((n) => n !== id) : [...p, id]);
  const [evolTestesSel, setEvolTestesSel] = useState(["global"]);
  const toggleEvolTeste = (id) => setEvolTestesSel((p) => p.includes(id) ? p.filter((n) => n !== id) : [...p, id]);
  const exerciciosBenchmark = new Set();
  if (currentProgram?.prescricao) {
    Object.values(currentProgram.prescricao).forEach((porTreino) => {
      Object.values(porTreino).forEach((sessaoB) => {
        MOMENTOS.forEach(([mk]) => {
          (sessaoB[mk] || []).forEach((it) => {
            if (it && it.benchmark && it.exId && it.exId !== "cognitivo") {
              const ex = (exerciciosBiblioteca || []).find((e) => e.id === it.exId) || EXERCISES.find((e) => e.id === it.exId);
              if (ex) exerciciosBenchmark.add(ex.nome);
            }
          });
        });
      });
    });
  }
  const exerciciosCargaExibir = exerciciosBenchmark.size > 0 ? [...exerciciosBenchmark] : exerciciosComCarga;
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState(null);
  const openNewFeedback = () => {
    setFeedbackForm({ date: (new Date()).toISOString().slice(0, 10), text: "" });
    setFeedbackModal(true);
  };
  const saveFeedback = () => {
    if (!feedbackForm.text.trim()) return;
    const novo = { id: uid(), studentId, date: feedbackForm.date, text: feedbackForm.text.trim(), createdAt: (new Date()).toISOString() };
    setProfessorFeedbacks((p) => [novo, ...p]);
    setFeedbackModal(false);
  };
  const delFeedback = async (id) => {
    if (window.confirm("Remover este feedback?")) {
      await DB.remove("professor_feedbacks", id);
      setProfessorFeedbacks((p) => p.filter((f) => f.id !== id));
    }
  };
  const delAssessment = async (id) => {
    const av = assessments.find((a) => a.id === id);
    if (!window.confirm("Excluir a avaliação" + (av && av.date ? " de " + fmt(av.date) : "") + "? Não dá para desfazer.")) return;
    const ok = await DB.remove("assessments", id);
    if (ok) setAssessments((p) => p.filter((a) => a.id !== id));
    else alert("Não consegui excluir a avaliação. Confira a conexão e tente de novo.");
  };
  const openEdit = () => {
    setForm({ name: st.name, dob: st.dob || "", sex: st.sex || "", phone: st.phone || "", email: st.email || "", whatsapp: st.whatsapp || "", responsibleName: st.responsibleName || "", responsiblePhone: st.responsiblePhone || "", doctorName: st.doctorName || "", doctorPhone: st.doctorPhone || "", billing: { ativo: st.billing?.ativo || false, tipo: st.billing?.tipo || "mensal", modoCobranca: st.billing?.modoCobranca || "fixo", plano: st.billing?.plano || "", valor: st.billing?.valor || "", valorSessao: st.billing?.valorSessao || "", valorAula: st.billing?.valorAula || "", vencimento: st.billing?.vencimento || "", regraVencimento: st.billing?.regraVencimento || "30dias", toleranciaDias: st.billing?.toleranciaDias ?? "" }, checkinConfig: { pre: { disposicao: st.checkinConfig?.pre?.disposicao ?? true, hidratacao: st.checkinConfig?.pre?.hidratacao ?? true, alimentacao: st.checkinConfig?.pre?.alimentacao ?? true, sono: st.checkinConfig?.pre?.sono ?? true, dor: st.checkinConfig?.pre?.dor ?? false, pa: st.checkinConfig?.pre?.pa ?? false, fc: st.checkinConfig?.pre?.fc ?? false, glicemia: st.checkinConfig?.pre?.glicemia ?? false }, post: { esforco: st.checkinConfig?.post?.esforco ?? true, completude: st.checkinConfig?.post?.completude ?? true, dor: st.checkinConfig?.post?.dor ?? true, pa: st.checkinConfig?.post?.pa ?? false, fc: st.checkinConfig?.post?.fc ?? false, glicemia: st.checkinConfig?.post?.glicemia ?? false, obs: st.checkinConfig?.post?.obs ?? true } } });
    setEditModal(true);
  };
  const saveEdit = () => {
    if (!form.name.trim()) return;
    const mudAbertos = mudancasAbertosMensal(pagamentos, studentId, form.billing);
    const aplicarAbertos = mudAbertos.length > 0 && window.confirm("Atualizar também " + (mudAbertos.length > 1 ? "as " + mudAbertos.length + " cobranças" : "a cobrança") + " em aberto com o plano novo?\n\n" + mudAbertos.map((m) => m.txt).join("\n\n") + "\n\nOK atualiza. Cancelar mantém como está (o plano novo vale a partir da próxima cobrança).");
    setStudents((p) => p.map((s) => s.id === studentId ? { ...s, ...form } : s));
    if (aplicarAbertos) setPagamentos((p) => p.map((pg) => {
      const m = mudAbertos.find((x) => x.id === pg.id);
      return m ? { ...pg, ...m.patch } : pg;
    }));
    if (form.billing?.ativo && form.billing?.tipo !== "avulso" && form.billing?.modoCobranca !== "porSessao" && form.billing?.vencimento) {
      const jaTem = pagamentos.some((pg) => pg.studentId === studentId && pg.status === "previsto" && pg.tipo === "mensal");
      if (!jaTem) setPagamentos((p) => [...p, novoPagamentoMensal({ ...st, ...form }, form.billing.vencimento, todayStr())]);
    }
    setEditModal(false);
  };
  const stAbertos = pagamentos.filter((pg) => pg.studentId === studentId && pg.status === "previsto");
  const openNewProgram = () => {
    window.open("longevus-programa.html", "_self");
  };
  const openViewProgram = (prog) => {
    window.open("longevus-programa.html?ver=" + encodeURIComponent(prog.id), "_self");
  };
  const ccfg = st.checkinConfig || { pre: { disposicao: true, hidratacao: true, alimentacao: true, sono: true, dor: false, pa: false, fc: false, glicemia: false }, post: { esforco: true, completude: true, dor: true, pa: false, fc: false, glicemia: false, obs: true } };
  const emptyPresPre = () => ({ disposicao: null, hidratacao: null, alimentacao: null, sono: null, dor: "nenhuma", pas: "", pad: "", fc: "", glicemia: "" });
  const emptyPresPos = () => ({ esforco: null, completude: null, dor: "nenhuma", pas: "", pad: "", fc: "", glicemia: "", obs: "", duracao: null });
  const [presTab, setPresTab] = useState("pre");
  const [presPre, setPresPre] = useState(emptyPresPre());
  const [presPos, setPresPos] = useState(emptyPresPos());
  const [presSaving, setPresSaving] = useState(false);
  const [presMsg, setPresMsg] = useState("");
  const [showHistoricoProgramas, setShowHistoricoProgramas] = useState(false);
  const submeterCheckin = async (type, data) => {
    try {
      const headers = await DB.authHeaders();
      const { data: sess } = await supa.auth.getSession();
      const ownerId = sess?.session?.user?.id;
      const body = { id: uid(), owner_id: ownerId, student_id: studentId, type, data };
      const r = await fetch(SUPA_URL + "/rest/v1/checkins", { method: "POST", headers, body: JSON.stringify(body) });
      return r.ok;
    } catch (e) {
      return false;
    }
  };
  const salvarPresPre = async () => {
    setPresSaving(true);
    setPresMsg("");
    const data = { ...presPre, date: todayStr(), source: "professor_presencial", createdAt: (new Date()).toISOString() };
    const ok = await submeterCheckin("pre_treino", data);
    setPresSaving(false);
    setPresMsg(ok ? "Check-in registrado!" : "Erro ao salvar. Tente novamente.");
    if (ok) setPresPre(emptyPresPre());
  };
  const salvarPresPos = async () => {
    setPresSaving(true);
    setPresMsg("");
    const LA = window.LongevusAlimentacao;
    const pesoKg = LA && LA.peso ? await LA.peso(st.id) : null;
    const durMin = parseFloat(presPos.duracao) || 0;
    const metEsf = { 1: 3.5, 2: 4, 3: 4.5, 4: 5.5, 5: 6 }[presPos.esforco] || 4;
    const kcalTreino = pesoKg && durMin ? Math.max(0, Math.round((metEsf - 1) * pesoKg * durMin / 60)) : null;
    const data = { duracao: presPos.duracao, esforco: presPos.esforco, completude: presPos.completude, dor: presPos.dor, pas: presPos.pas, pad: presPos.pad, fc: presPos.fc, glicemia: presPos.glicemia, obs: presPos.obs, musculacaoKcal: kcalTreino, date: todayStr(), source: "professor_presencial", createdAt: (new Date()).toISOString() };
    const ok = await submeterCheckin("pos_treino", data);
    setPresSaving(false);
    setPresMsg(!ok ? "Erro ao salvar. Tente novamente." : kcalTreino ? "Check-out registrado! Déficit do treino: cerca de " + kcalTreino + " kcal (" + durMin + " min, " + ({ 1: "leve", 2: "leve a moderado", 3: "moderado", 4: "moderado a intenso", 5: "intenso" }[presPos.esforco] || "esforço moderado") + ")." : !durMin ? "Check-out registrado! Informe a duração para calcular o déficit do treino." : "Check-out registrado! Cadastre o peso do aluno para calcular o déficit do treino.");
    if (ok) setPresPos(emptyPresPos());
  };
  const TABS = [{ id: "aval", label: "Avaliações" }, { id: "vitrine", label: "Vitrine" }, { id: "treino", label: "Treino" }, { id: "agenda", label: "Agenda" }, { id: "checkin", label: "Check-in" }, { id: "alim", label: "Alimentação" }, { id: "antro", label: "Antropometria" }, { id: "cardio", label: "Cardio" }, { id: "historico", label: "Histórico" }, { id: "presencial", label: "Presencial" }, { id: "evolucao", label: "Evolução" }, { id: "mon", label: "Monitoramento" }, { id: "doc", label: "Documentos" }];
  return React.createElement("div", null, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 } }, React.createElement("button", { onClick: () => nav("students"), style: { background: "#f1f5f9", border: "none", borderRadius: 9, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 } }, React.createElement(I, { n: "back", s: 17 })), React.createElement("div", { style: { width: 44, height: 44, borderRadius: 12, background: "#fff4ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: O, flexShrink: 0 } }, st.name?.[0]?.toUpperCase()), React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 17 } }, st.name), React.createElement("div", { style: { fontSize: 12, color: "#94a3b8" } }, calcAge(st.dob), " anos · ", st.sex === "M" ? "Masc" : st.sex === "F" ? "Fem" : "—", st.phone ? " · " + st.phone : ""), (() => {
    const ua = ultimoAcesso?.[studentId];
    return React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 2 } }, ua ? "Último acesso ao app: " + new Date(ua).toLocaleDateString("pt-BR") + " às " + new Date(ua).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : st.portalEmail ? "Ainda não acessou o app" : "Sem acesso ao portal");
  })()), React.createElement(Btn, { sm: true, variant: "ghost", icon: "edit", onClick: openEdit })), (st.email || st.whatsapp || st.responsibleName || st.doctorName) && React.createElement(Card, { style: { padding: "12px 14px", marginBottom: 16 } }, React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, st.email && React.createElement("span", { style: { fontSize: 11, color: "#64748b" } }, "✉️ ", st.email), st.whatsapp && React.createElement("span", { style: { fontSize: 11, color: "#64748b" } }, "💬 ", st.whatsapp), st.responsibleName && React.createElement("span", { style: { fontSize: 11, color: "#64748b" } }, "👤 ", st.responsibleName, st.responsiblePhone ? " (" + st.responsiblePhone + ")" : ""), st.doctorName && React.createElement("span", { style: { fontSize: 11, color: "#64748b" } }, "🩺 ", st.doctorName, st.doctorPhone ? " (" + st.doctorPhone + ")" : ""))), st.portalEmail && React.createElement(Card, { style: { padding: "12px 14px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" } }, React.createElement("div", { style: { flex: 1, minWidth: 180 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#334155" } }, "Acesso ao portal"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 2 } }, senhaMsg || "Gere uma senha temporária e envie pro WhatsApp do aluno.")), React.createElement(Btn, { sm: true, variant: "secondary", onClick: gerarSenhaTemporaria, disabled: gerandoSenha }, gerandoSenha ? "Gerando..." : "Gerar senha temporária")), st.billing?.ativo && (() => {
    const hoje = todayStr();
    const isAvulso = st.billing?.tipo === "avulso";
    const isPorSessao = !isAvulso && st.billing?.modoCobranca === "porSessao";
    const abertosVencidos = stAbertos.filter((pg) => pg.dataPrevista && pg.dataPrevista <= hoje);
    const proxAberto = stAbertos.map((pg) => pg.dataPrevista).filter(Boolean).sort()[0] || null;
    const vencimentoExibido = isPorSessao ? proxAberto : st.billing.vencimento;
    const vencido = !isAvulso && (isPorSessao ? abertosVencidos.some((pg) => pg.dataPrevista < hoje) : st.billing.vencimento && st.billing.vencimento < hoje);
    const alerta = isAvulso ? abertosVencidos.length > 0 : vencido;
    return React.createElement(Card, { style: { padding: "12px 14px", marginBottom: 16, background: alerta ? "#fef2f2" : "#f0fdf4", borderColor: alerta ? "#fecaca" : "#bbf7d0" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 } }, React.createElement("div", null, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: alerta ? "#dc2626" : "#16a34a" } }, isAvulso ? abertosVencidos.length > 0 ? "⚠️ " + abertosVencidos.length + " cobrança(s) em aberto" : "✅ Sem pendências" : vencido ? "⚠️ Mensalidade vencida" : "✅ Mensalidade em dia"), React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 2 } }, isAvulso ? st.billing.valorAula ? "R$ " + Number(st.billing.valorAula).toFixed(2).replace(".", ",") + " / aula" : "Aula avulsa" : (st.billing.plano || "Plano") + (st.billing.modoCobranca === "porSessao" ? st.billing.valorSessao ? " · R$ " + Number(st.billing.valorSessao).toFixed(2).replace(".", ",") + "/sessão" : "" : st.billing.valor ? " · R$ " + Number(st.billing.valor).toFixed(2).replace(".", ",") : "") + (vencimentoExibido ? " · " + (isPorSessao ? "próxima sessão " : "vence ") + fmt(vencimentoExibido) : "")), isAvulso && (st.billing?.creditosAvulso || 0) > 0 && React.createElement("div", { style: { fontSize: 11, color: "#166534", fontWeight: 700, marginTop: 3 } }, "💳 ", st.billing.creditosAvulso, " aula(s) já paga(s) adiantado")), React.createElement(Btn, { sm: true, onClick: () => setBaixaAberta(true) }, "Dar baixa")));
  })(), baixaAberta && React.createElement(PagamentoModal, { student: st, pagamentos, setPagamentos, setStudents, onClose: () => setBaixaAberta(false) }), React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" } }, TABS.map((t) => React.createElement("button", { key: t.id, onClick: () => setTab(t.id), style: { flex: "1 0 auto", padding: "9px 10px", borderRadius: 10, border: "1.5px solid", borderColor: tab === t.id ? "#FF5603" : "#e2e8f0", background: tab === t.id ? "#FF5603" : "#f8fafc", color: tab === t.id ? "#fff" : "#64748b", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" } }, t.label))), tab === "vitrine" && React.createElement("div", null, React.createElement("div", { style: { fontSize: 12, color: "#64748b", lineHeight: 1.5, marginBottom: 12 } }, "O que este aluno tem liberado. Bloqueado: ele vê o preço e o Pix. Bônus ou Pago: aparece como liberado no app dele."), (() => {
    const l = st.l360 || {};
    const status = l.status || "bloqueado";
    const hoje = todayStr();
    const vencido = status === "pago" && (!l.vencimento || l.vencimento < hoje);
    const mais30 = (base) => {
      const d = new Date((base && base > hoje ? base : hoje) + "T12:00:00");
      d.setDate(d.getDate() + 30);
      return toISODateLocal(d);
    };
    const set360 = (novo) => setStudents((p) => p.map((x) => x.id === st.id ? { ...x, l360: { ...x.l360 || {}, ...novo, atualizadoEm: (new Date()).toISOString() } } : x));
    const escolher = async (k) => {
      if (k === status) return;
      const pr = (await precosVitrine()).l360 || {};
      if (k === "pago") {
        const v = pedirValorVit(pr.titulo || "o Longevus 360", pr.valor);
        if (v === null) return;
        set360({ status: "pago", vencimento: mais30(hoje), bonusAte: null });
        registrarVitrine(setStudents, st, "venda", "l360", pr.titulo || "Longevus 360", v);
      } else {
        set360({ status: k, bonusAte: null });
        if (k === "bonus") registrarVitrine(setStudents, st, "bonus", "l360", pr.titulo || "Longevus 360", pr.valor);
      }
    };
    const renovar360 = async () => {
      const pr = (await precosVitrine()).l360 || {};
      const v = pedirValorVit("a renovação do " + (pr.titulo || "Longevus 360"), pr.valor);
      if (v === null) return;
      set360({ status: "pago", vencimento: mais30(l.vencimento) });
      registrarVitrine(setStudents, st, "venda", "l360", pr.titulo || "Longevus 360", v);
    };
    const sub = status === "bonus" ? l.bonusAte ? l.bonusAte < hoje ? "Bônus da indicação venceu em " + fmt(l.bonusAte) + "." : "Bônus da indicação até " + fmt(l.bonusAte) + "." : "Liberado de bônus enquanto o plano principal estiver ativo." : status === "pago" ? vencido ? "Venceu em " + fmt(l.vencimento) + ". O cadeado voltou para o aluno." : "Pago · acesso até " + fmt(l.vencimento) + "." : "O aluno vê o cadeado e a oferta com o Pix.";
    return React.createElement(Card, { style: { padding: "12px 14px", marginBottom: 16 } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 8 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#334155" } }, "Longevus 360"), React.createElement("div", { style: { fontSize: 11, color: vencido ? "#dc2626" : "#64748b", textAlign: "right" } }, sub)), React.createElement("div", { style: { display: "flex", gap: 6 } }, [["bloqueado", "Bloqueado"], ["bonus", "Bônus"], ["pago", "Pago"]].map(([k, lb]) => React.createElement("button", { key: k, onClick: () => escolher(k), style: { flex: 1, padding: "8px 4px", borderRadius: 9, border: "1.5px solid " + (status === k ? "#FF5603" : "#e2e8f0"), background: status === k ? "#fff4ee" : "#fff", color: status === k ? "#c2410c" : "#64748b", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, lb))), status === "pago" && React.createElement("button", { onClick: renovar360, style: { width: "100%", marginTop: 8, padding: "8px", borderRadius: 9, border: "1.5px dashed #fed7aa", background: "#fff", color: "#c2410c", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, "Renovar +30 dias"));
  })(), React.createElement(MenteAtivaFicha, { st, setStudents }), React.createElement(EloFicha, { st, setStudents }), React.createElement(ServicosVitrineFicha, { st, setStudents }), (() => {
    const hs = [...st.vitrineHist || []].reverse();
    if (!hs.length) return null;
    const tv = hs.filter((h) => h.tipo === "venda").reduce((a, h) => a + h.valor, 0), tb = hs.filter((h) => h.tipo === "bonus").reduce((a, h) => a + h.valor, 0);
    return React.createElement(Card, { style: { padding: "12px 14px", marginBottom: 16 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#334155" } }, "Histórico na vitrine"), React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2, marginBottom: 6 } }, "Já comprou ", React.createElement("b", { style: { color: "#0f172a" } }, fmtR(tv)), " · ganhou em bônus ", React.createElement("b", { style: { color: "#c2410c" } }, fmtR(tb))), hs.slice(0, 20).map((h) => React.createElement("div", { key: h.id, style: { display: "flex", justifyContent: "space-between", gap: 8, padding: "7px 0", borderTop: "1px solid #f1f5f9", fontSize: 12 } }, React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, color: "#0f172a" } }, h.titulo), React.createElement("div", { style: { color: "#94a3b8" } }, fmt(h.data), " · ", h.tipo === "venda" ? "Venda" : "Bônus")), React.createElement("div", { style: { fontWeight: 800, color: h.tipo === "venda" ? "#15803d" : "#c2410c", whiteSpace: "nowrap" } }, h.tipo === "venda" ? fmtR(h.valor) : h.valor ? "vale " + fmtR(h.valor) : "bônus"))));
  })()), tab === "aval" && React.createElement("div", null, React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 10 } }, React.createElement(Btn, { sm: true, icon: "plus", onClick: () => nav("newAssessment", { studentId }) }, "Nova Avaliação")), stAssessments.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 32 } }, React.createElement(I, { n: "clip", c: "#cbd5e1", s: 32 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhuma avaliação ainda.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, stAssessments.map((a) => {
    const gc = classifyGlobal(a.globalScore || 0);
    const ahaCl = classifyAHA(a.aha?.score || 0);
    return React.createElement(Card, { key: a.id, onClick: () => nav("result", { id: a.id }), style: { padding: "14px 16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 } }, React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 5 } }, fmt(a.date)), React.createElement("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" } }, a.globalScore > 0 && React.createElement(Badge, { color: gc.color, bg: gc.bg }, "Global: ", a.globalScore), React.createElement(Badge, { color: ahaCl.color, bg: ahaCl.bg }, ahaCl.label))), React.createElement("button", { onClick: (e) => {
      e.stopPropagation();
      delAssessment(a.id);
    }, style: { background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 9, cursor: "pointer", color: "#dc2626", padding: "6px 7px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }, "aria-label": "Excluir avaliação", title: "Excluir avaliação" }, React.createElement(I, { n: "trash", s: 15 }))));
  }))), tab === "treino" && React.createElement("div", null, !currentProgram ? React.createElement(Card, { style: { textAlign: "center", padding: 32 } }, React.createElement(I, { n: "zap", c: "#cbd5e1", s: 32 }), React.createElement("div", { style: { color: "#94a3b8", margin: "10px 0 14px" } }, "Nenhum programa gerado para este aluno."), React.createElement(Btn, { icon: "zap", onClick: () => openNewProgram() }, "Gerar Programa de Treinamento")) : React.createElement(Card, { style: { padding: 16 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 15 } }, currentProgram.titulo || "Programa de Treino"), currentProgram.divisao?.label && React.createElement(Badge, { color: "#6366f1", bg: "#eef2ff" }, currentProgram.divisao.label)), React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 12 } }, currentProgram.freq, "x/semana · ", currentProgram.semanas || 24, " semanas · criado em ", fmt(currentProgram.criadoEm)), React.createElement("button", { onClick: () => {
    const ocultar = currentProgram.ocultoAluno !== true;
    if (!window.confirm(ocultar ? "Ocultar este treino do aluno? Ele continua vendo calorias, avaliação e o resto do app." : "Liberar este treino para o aluno ver no app dele?")) return;
    setPrograms((prev) => prev.map((p) => p.id === currentProgram.id ? { ...p, ocultoAluno: ocultar } : p));
  }, style: { width: "100%", display: "flex", alignItems: "center", gap: 10, border: "1.5px solid " + (currentProgram.ocultoAluno === true ? "#fed7aa" : "#bbf7d0"), background: currentProgram.ocultoAluno === true ? "#fff7ed" : "#f0fdf4", borderRadius: 10, padding: "10px 12px", marginBottom: 14, cursor: "pointer", textAlign: "left", fontFamily: "inherit" } }, React.createElement(I, { n: "eye", c: currentProgram.ocultoAluno === true ? "#ea580c" : "#16a34a", s: 18 }), React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: currentProgram.ocultoAluno === true ? "#9a3412" : "#166534" } }, currentProgram.ocultoAluno === true ? "Visível só para você" : "Visível para o aluno"), React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 1 } }, currentProgram.ocultoAluno === true ? "Toque para liberar o treino no app do aluno" : "Toque para ocultar o treino do aluno")), React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: "#fff", background: currentProgram.ocultoAluno === true ? "#ea580c" : "#16a34a", borderRadius: 7, padding: "4px 9px", flexShrink: 0 } }, currentProgram.ocultoAluno === true ? "Liberar" : "Ocultar")), React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 } }, (currentProgram.divisao?.sequencia || []).map((t, i) => React.createElement("span", { key: i, style: { fontSize: 11, fontWeight: 700, color: "#64748b", background: "#f1f5f9", borderRadius: 7, padding: "4px 9px" } }, "D", i + 1, ": ", t))), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, React.createElement(Btn, { full: true, icon: "eye", onClick: () => openViewProgram(currentProgram) }, "Ver Treino Atual"), React.createElement(Btn, { full: true, variant: "secondary", icon: "zap", onClick: () => openNewProgram() }, "Gerar Novo Programa"))), stPrograms.length > 1 && React.createElement("div", { style: { marginTop: 10 } }, React.createElement("button", { onClick: () => setShowHistoricoProgramas((v) => !v), style: { width: "100%", border: "none", background: "transparent", color: "#64748b", fontSize: 11, fontWeight: 700, cursor: "pointer", padding: "4px 0", textDecoration: "underline" } }, showHistoricoProgramas ? "Ocultar" : "Ver", " histórico · +", stPrograms.length - 1, " programa(s) anterior(es)"), showHistoricoProgramas && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6, marginTop: 6 } }, stPrograms.slice(1).map((p) => React.createElement(Card, { key: p.id, onClick: () => openViewProgram(p), style: { padding: "10px 12px", cursor: "pointer" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } }, React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 13 } }, p.titulo || "Programa de Treino"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 1 } }, p.divisao?.label || "—", " · ", p.freq, "x/semana · criado em ", fmt(p.criadoEm))), React.createElement("div", { style: { display: "flex", gap: 4, flexShrink: 0 } }, React.createElement("button", { onClick: (e) => {
    e.stopPropagation();
    const ocultar = p.ocultoAluno !== true;
    setPrograms((prev) => prev.map((x) => x.id === p.id ? { ...x, ocultoAluno: ocultar } : x));
  }, title: p.ocultoAluno === true ? "Liberar para o aluno" : "Ocultar do aluno", style: { border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 700, borderRadius: 7, padding: "3px 8px", color: p.ocultoAluno === true ? "#ea580c" : "#16a34a", background: p.ocultoAluno === true ? "#fff7ed" : "#f0fdf4" } }, p.ocultoAluno === true ? "Oculto" : "Visível"), p.origem === "consultoria" && React.createElement(Badge, { color: "#7c3aed", bg: "#f5f3ff" }, "Consultoria")))))))), tab === "agenda" && React.createElement("div", null, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 } }, React.createElement("button", { onClick: () => setAgendaMonthRef((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)), style: { border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#475569" } }, "‹"), React.createElement("div", { style: { fontSize: 14, fontWeight: 800 } }, MESES_NOME[agendaMonthRef.getMonth()], " de ", agendaMonthRef.getFullYear()), React.createElement("button", { onClick: () => setAgendaMonthRef((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)), style: { border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#475569" } }, "›")), React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 } }, Object.entries(STATUS_AGENDA).map(([k, v]) => React.createElement("div", { key: k, style: { flex: "1 1 40%", background: v.bg, borderRadius: 10, padding: "10px 12px", textAlign: "center" } }, React.createElement("div", { style: { fontSize: 20, fontWeight: 800, color: v.color } }, agendaContagemMes[k] || 0), React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: v.color } }, v.label)))), stAgendaMes.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 32 } }, React.createElement(I, { n: "calendar", c: "#cbd5e1", s: 32 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhuma aula agendada neste mês.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, stAgendaMes.map((e) => {
    const cfg = STATUS_AGENDA[e.status] || STATUS_AGENDA.agendado;
    return React.createElement(Card, { key: e.id, onClick: () => openAgendaEdit(e), style: { padding: "14px 16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 } }, React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 } }, React.createElement("span", { style: { fontWeight: 700, fontSize: 14 } }, fmt(e.date), e.time ? " · " + e.time : ""), React.createElement(Badge, { color: cfg.color, bg: cfg.bg }, cfg.label)), e.obs && React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2, whiteSpace: "pre-wrap" } }, e.obs), e.dataOriginal && React.createElement("div", { style: { fontSize: 11, color: "#c2410c", marginTop: 4 } }, "↻ Remarcada — combinada originalmente pra ", fmt(e.dataOriginal))), React.createElement("button", { onClick: (ev) => {
      ev.stopPropagation();
      delAgendaEntry(e.id);
    }, style: { background: "none", border: "none", cursor: "pointer", color: "#e2e8f0", padding: 4, flexShrink: 0 } }, React.createElement(I, { n: "trash", s: 15 }))));
  })), agendaEditId && agendaEditForm && React.createElement(Modal, { title: "Compromisso", onClose: () => setAgendaEditId(null) }, React.createElement(Inp, { label: "Data", type: "date", value: agendaEditForm.date, onChange: (v) => setAgendaEditForm((f) => ({ ...f, date: v })) }), React.createElement(Inp, { label: "Horário", type: "time", value: agendaEditForm.time, onChange: (v) => setAgendaEditForm((f) => ({ ...f, time: v })) }), React.createElement("div", { style: { marginBottom: 13 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 } }, "Status"), React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, Object.entries(STATUS_AGENDA).map(([k, v]) => React.createElement("button", { key: k, onClick: () => setAgendaEditForm((f) => ({ ...f, status: k })), style: { flex: "1 1 45%", border: agendaEditForm.status === k ? `1.5px solid ${v.color}` : "1.5px solid #e2e8f0", background: agendaEditForm.status === k ? v.bg : "#f8fafc", color: agendaEditForm.status === k ? v.color : "#64748b", borderRadius: 9, padding: "9px 4px", fontSize: 12, fontWeight: 700, cursor: "pointer" } }, v.label)))), React.createElement("div", { style: { marginBottom: 13 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 } }, "Observação / justificativa (opcional)"), React.createElement("textarea", { value: agendaEditForm.obs, onChange: (e) => setAgendaEditForm((f) => ({ ...f, obs: e.target.value })), rows: 4, style: { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, color: "#0f172a", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" } })), React.createElement("div", { style: { display: "flex", gap: 8 } }, React.createElement(Btn, { variant: "danger", onClick: () => delAgendaEntry(agendaEditId) }, "Excluir"), React.createElement(Btn, { full: true, onClick: saveAgendaEdit }, "Salvar")))), tab === "checkin" && React.createElement("div", null, React.createElement(Card, { style: { padding: "14px 16px", marginBottom: 14 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: stFeedbacks.length ? 10 : 0 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 13, color: "#0f172a" } }, "📝 Feedbacks do professor"), React.createElement(Btn, { sm: true, icon: "plus", onClick: openNewFeedback }, "Novo feedback")), stFeedbacks.length > 0 && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, stFeedbacks.map((f) => React.createElement("div", { key: f.id, style: { background: "#fff4ee", border: "1.5px solid #fed7aa", borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#c2410c" } }, fmt(f.date)), React.createElement("button", { onClick: () => delFeedback(f.id), style: { background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", padding: 2 } }, React.createElement(I, { n: "trash", s: 13 }))), React.createElement("div", { style: { fontSize: 13, color: "#334155", whiteSpace: "pre-wrap" } }, f.text))))), stCheckins.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 32 } }, React.createElement(I, { n: "act", c: "#cbd5e1", s: 32 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhum check-in respondido ainda.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, stCheckins.slice(0, 30).map((c) => {
    const d = c.data || {};
    const isPre = c.type === "pre_treino";
    const dt = c.created_at ? new Date(c.created_at) : null;
    const dtLabel = dt ? dt.toLocaleDateString("pt-BR") + " às " + dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
    const escalaDisposicao = { 1: "😣 Exausto", 2: "😴 Cansado", 3: "😐 Neutro", 4: "🙂 Disposto", 5: "😁 Animado" };
    const escalaHidra = { 1: "💧 Muito pouco", 2: "💧💧 Pouco", 3: "💧💧💧 Regular", 4: "💧💧💧💧 Bom", 5: "💧💧💧💧💧 Ótimo" };
    const escalaAlim = { 1: "🍔 Ruim", 2: "🥪 Regular", 3: "🥗 Boa", 4: "🥦 Ótima" };
    const escalaSono = { 1: "🌑 Ruim", 2: "🌗 Regular", 3: "🌖 Boa", 4: "🌕 Ótima" };
    const escalaEsforco = { 1: "😌 Leve", 2: "Leve a moderado", 3: "🙂 Moderado", 4: "Moderado a intenso", 5: "😓 Intenso" };
    const escalaDor = { nenhuma: "😊 Nenhuma", leve: "😕 Leve", moderada: "😣 Moderada", alta: "😖 Alta" };
    const escalaCompletude = { sim: "✅ Completo", parcial: "⚠️ Parcial", nao: "❌ Não conseguiu" };
    const alerta = isPre === false && (d.dor === "alta" || d.dor === "moderada") || isPre === false && d.completude === "nao";
    return React.createElement(Card, { key: c.id, style: { padding: "14px 16px", border: alerta ? "1.5px solid #fecaca" : void 0, background: alerta ? "#fffbfa" : void 0 } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } }, React.createElement(Badge, { color: isPre ? "#3b82f6" : O, bg: isPre ? "#eff6ff" : "#fff4ee" }, isPre ? "Antes do treino" : "Depois do treino"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, dtLabel)), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, d.disposicao != null && React.createElement("div", { style: { fontSize: 13, color: "#334155" } }, "Disposição: ", React.createElement("b", null, escalaDisposicao[d.disposicao])), d.hidratacao != null && React.createElement("div", { style: { fontSize: 13, color: "#334155" } }, "Hidratação: ", React.createElement("b", null, escalaHidra[d.hidratacao])), d.alimentacao != null && React.createElement("div", { style: { fontSize: 13, color: "#334155" } }, "Alimentação: ", React.createElement("b", null, escalaAlim[d.alimentacao])), d.sono != null && React.createElement("div", { style: { fontSize: 13, color: "#334155" } }, "Sono: ", React.createElement("b", null, escalaSono[d.sono])), (d.pas || d.pad || d.fc) && React.createElement("div", { style: { fontSize: 13, color: "#334155" } }, "❤️ PA/FC: ", React.createElement("b", null, d.pas || "—", "/", d.pad || "—", " mmHg · ", d.fc || "—", " bpm")), d.glicemia && React.createElement("div", { style: { fontSize: 13, color: "#334155" } }, "🩸 Glicemia: ", React.createElement("b", null, d.glicemia, " mg/dL")), d.esforco != null && React.createElement("div", { style: { fontSize: 13, color: "#334155" } }, "Esforço: ", React.createElement("b", null, escalaEsforco[d.esforco])), d.completude && React.createElement("div", { style: { fontSize: 13, color: "#334155" } }, "Completude: ", React.createElement("b", null, escalaCompletude[d.completude])), d.dor && React.createElement("div", { style: { fontSize: 13, color: d.dor === "alta" || d.dor === "moderada" ? "#dc2626" : "#334155" } }, "Dor: ", React.createElement("b", null, escalaDor[d.dor])), d.obs && React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 4, fontStyle: "italic" } }, '📝 "', d.obs, '"')));
  }), stCheckins.length > 30 && React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", textAlign: "center" } }, "Mostrando os 30 mais recentes de ", stCheckins.length))), tab === "presencial" && React.createElement("div", null, React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 14 } }, React.createElement("button", { onClick: () => {
    setPresTab("pre");
    setPresMsg("");
  }, style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: presTab === "pre" ? O : "#f1f5f9", color: presTab === "pre" ? "#fff" : "#64748b" } }, "Antes"), React.createElement("button", { onClick: () => {
    setPresTab("treino");
    setPresMsg("");
  }, style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: presTab === "treino" ? O : "#f1f5f9", color: presTab === "treino" ? "#fff" : "#64748b" } }, "Treino do dia"), React.createElement("button", { onClick: () => {
    setPresTab("pos");
    setPresMsg("");
  }, style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: presTab === "pos" ? O : "#f1f5f9", color: presTab === "pos" ? "#fff" : "#64748b" } }, "Depois")), React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 16, lineHeight: 1.5 } }, "Exatamente as mesmas perguntas que aparecem no app de ", (st.name || "").split(" ")[0], ". Preencha como se fosse ele(a), durante o atendimento presencial."), presTab === "pre" && React.createElement(React.Fragment, null, ccfg.pre?.disposicao && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 10 } }, "Como você está disposto?"), React.createElement("div", { style: { display: "flex", gap: 8 } }, [{ v: 1, e: "😣", l: "Exausto" }, { v: 2, e: "😴", l: "Cansado" }, { v: 3, e: "😐", l: "Neutro" }, { v: 4, e: "🙂", l: "Disposto" }, { v: 5, e: "😁", l: "Animado" }].map((o) => React.createElement("button", { key: o.v, onClick: () => setPresPre((c) => ({ ...c, disposicao: o.v })), style: { flex: 1, padding: "10px 2px", borderRadius: 10, border: presPre.disposicao === o.v ? "1.5px solid #FF5603" : "1.5px solid #e2e8f0", background: presPre.disposicao === o.v ? "#fff4ee" : "#fff", cursor: "pointer", textAlign: "center", fontFamily: "inherit" } }, React.createElement("div", { style: { fontSize: 20 } }, o.e), React.createElement("div", { style: { fontSize: 8, fontWeight: 700, color: presPre.disposicao === o.v ? "#FF5603" : "#94a3b8", marginTop: 2 } }, o.l))))), ccfg.pre?.hidratacao && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 10 } }, "Como foi seu consumo de água ontem?"), React.createElement("div", { style: { display: "flex", gap: 8 } }, [{ v: 1, l: "Muito pouco" }, { v: 2, l: "Pouco" }, { v: 3, l: "Regular" }, { v: 4, l: "Bom" }, { v: 5, l: "Ótimo" }].map((o) => React.createElement("button", { key: o.v, onClick: () => setPresPre((c) => ({ ...c, hidratacao: o.v })), style: { flex: 1, padding: "10px 2px", borderRadius: 10, border: presPre.hidratacao === o.v ? "1.5px solid #3b82f6" : "1.5px solid #e2e8f0", background: presPre.hidratacao === o.v ? "#eff6ff" : "#fff", cursor: "pointer", textAlign: "center", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 } }, React.createElement("span", { style: { fontSize: 16 } }, "💧"), React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" } }, Array.from({ length: o.v }).map((_, i) => React.createElement("div", { key: i, style: { width: 7, height: presPre.hidratacao === o.v ? 5 : 4, background: presPre.hidratacao === o.v ? "#3b82f6" : "#cbd5e1", borderRadius: 2, marginBottom: 1 } }))), React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: presPre.hidratacao === o.v ? "#3b82f6" : "#94a3b8", marginTop: 2 } }, o.l))))), ccfg.pre?.alimentacao && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 10 } }, "Como foi sua alimentação hoje?"), React.createElement("div", { style: { display: "flex", gap: 8 } }, [{ v: 1, e: "🍔", l: "Ruim" }, { v: 2, e: "🥪", l: "Regular" }, { v: 3, e: "🥗", l: "Boa" }, { v: 4, e: "🥦", l: "Ótima" }].map((o) => React.createElement("button", { key: o.v, onClick: () => setPresPre((c) => ({ ...c, alimentacao: o.v })), style: { flex: 1, padding: "10px 2px", borderRadius: 10, border: presPre.alimentacao === o.v ? "1.5px solid #16a34a" : "1.5px solid #e2e8f0", background: presPre.alimentacao === o.v ? "#f0fdf4" : "#fff", cursor: "pointer", textAlign: "center", fontFamily: "inherit" } }, React.createElement("div", { style: { fontSize: 19 } }, o.e), React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: presPre.alimentacao === o.v ? "#16a34a" : "#94a3b8", marginTop: 2 } }, o.l))))), ccfg.pre?.sono && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 10 } }, "Como foi seu sono essa noite?"), React.createElement("div", { style: { display: "flex", gap: 8 } }, [{ v: 1, e: "🌑", l: "Ruim" }, { v: 2, e: "🌗", l: "Regular" }, { v: 3, e: "🌖", l: "Boa" }, { v: 4, e: "🌕", l: "Ótima" }].map((o) => React.createElement("button", { key: o.v, onClick: () => setPresPre((c) => ({ ...c, sono: o.v })), style: { flex: 1, padding: "10px 2px", borderRadius: 10, border: presPre.sono === o.v ? "1.5px solid #7e22ce" : "1.5px solid #e2e8f0", background: presPre.sono === o.v ? "#fdf4ff" : "#fff", cursor: "pointer", textAlign: "center", fontFamily: "inherit" } }, React.createElement("div", { style: { fontSize: 19 } }, o.e), React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: presPre.sono === o.v ? "#7e22ce" : "#94a3b8", marginTop: 2 } }, o.l))))), ccfg.pre?.dor && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 10 } }, "Dor ou desconforto agora"), React.createElement("div", { style: { display: "flex", gap: 6 } }, [{ v: "nenhuma", e: "😊", l: "Nenhuma" }, { v: "leve", e: "😕", l: "Leve" }, { v: "moderada", e: "😣", l: "Moderada" }, { v: "alta", e: "😖", l: "Alta" }].map((o) => React.createElement("button", { key: o.v, onClick: () => setPresPre((c) => ({ ...c, dor: o.v })), style: { flex: 1, padding: "10px 2px", borderRadius: 10, border: presPre.dor === o.v ? "1.5px solid #FF5603" : "1.5px solid #e2e8f0", background: presPre.dor === o.v ? "#fff4ee" : "#fff", cursor: "pointer", textAlign: "center", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 } }, React.createElement("span", { style: { fontSize: 19 } }, o.e), React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: presPre.dor === o.v ? "#FF5603" : "#94a3b8" } }, o.l))))), ccfg.pre?.pa && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 10 } }, "❤️ Pressão arterial"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, React.createElement("input", { value: presPre.pas, onChange: (e) => setPresPre((c) => ({ ...c, pas: e.target.value })), placeholder: "PAS", inputMode: "numeric", style: { padding: "9px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" } }), React.createElement("input", { value: presPre.pad, onChange: (e) => setPresPre((c) => ({ ...c, pad: e.target.value })), placeholder: "PAD", inputMode: "numeric", style: { padding: "9px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" } }))), ccfg.pre?.fc && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 10 } }, "💓 Frequência cardíaca"), React.createElement("input", { value: presPre.fc, onChange: (e) => setPresPre((c) => ({ ...c, fc: e.target.value })), placeholder: "FC (bpm)", inputMode: "numeric", style: { width: "100%", padding: "9px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" } })), ccfg.pre?.glicemia && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 10 } }, "🩸 Glicemia (mg/dL)"), React.createElement("input", { value: presPre.glicemia, onChange: (e) => setPresPre((c) => ({ ...c, glicemia: e.target.value })), placeholder: "100", inputMode: "numeric", style: { width: "100%", padding: "9px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" } })), React.createElement(Btn, { full: true, onClick: salvarPresPre, disabled: presSaving || ccfg.pre?.disposicao && presPre.disposicao === null || ccfg.pre?.hidratacao && presPre.hidratacao === null || ccfg.pre?.alimentacao && presPre.alimentacao === null || ccfg.pre?.sono && presPre.sono === null }, presSaving ? "Salvando..." : "Registrar check-in")), presTab === "treino" && React.createElement(React.Fragment, null, !currentProgram ? React.createElement(Card, { style: { textAlign: "center", padding: 32 } }, React.createElement(I, { n: "clip", c: "#cbd5e1", s: 32 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Este aluno ainda não tem um programa montado.")) : React.createElement(React.Fragment, null, React.createElement("div", { style: { display: "flex", gap: 4, marginBottom: 10, background: "#f1f5f9", borderRadius: 10, padding: 3, overflowX: "auto", WebkitOverflowScrolling: "touch" } }, blocosAtivosPres.map((b, i) => {
    const locked = i > maxUnlockedIdx;
    return React.createElement("button", { key: b.key, onClick: () => {
      if (!locked) {
        setPresBlocoIdx(i);
      }
    }, disabled: locked, style: { flex: "0 0 auto", minWidth: 44, border: "none", borderRadius: 8, padding: "6px 6px", fontSize: 10, fontWeight: 700, cursor: locked ? "default" : "pointer", background: presBlocoIdx === i ? b.cor.bg : "transparent", color: locked ? "#cbd5e1" : presBlocoIdx === i ? b.cor.texto : "#94a3b8", lineHeight: 1.3 } }, React.createElement("div", null, locked ? "🔒" : "B" + (i + 1)), React.createElement("div", { style: { fontSize: 8, marginTop: 1, whiteSpace: "nowrap" } }, b.semanas));
  })), treinoDeHojeCalc && TREINO_DEFS[treinoDeHojeCalc] && React.createElement("div", { style: { background: TREINO_DEFS[treinoDeHojeCalc].bg, border: `2px solid ${TREINO_DEFS[treinoDeHojeCalc].cor}`, borderRadius: 10, padding: "10px 12px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" } }, React.createElement("div", null, React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: TREINO_DEFS[treinoDeHojeCalc].cor, textTransform: "uppercase", letterSpacing: 0.3 } }, "📅 Treino de hoje"), React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: TREINO_DEFS[treinoDeHojeCalc].cor } }, TREINO_DEFS[treinoDeHojeCalc].label)), treinoAtivoPres !== treinoDeHojeCalc && React.createElement(Btn, { sm: true, onClick: () => {
    const idx = treinosUnicos.indexOf(treinoDeHojeCalc);
    if (idx !== -1) setPresTreinoIdx(idx);
  } }, "Ir para hoje")), React.createElement("div", { style: { background: blocoAtivoPres.cor.bg, border: `1.5px solid ${blocoAtivoPres.cor.border}`, borderRadius: 9, padding: "10px 12px", marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: blocoAtivoPres.cor.texto } }, blocoAtivoPres.label, " · sem. ", blocoAtivoPres.semanas), presBlocoIdx < blocosAtivosPres.length - 1 && React.createElement("div", { style: { marginTop: 8 } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: blocoAtivoPres.cor.texto, marginBottom: 4, fontWeight: 700 } }, React.createElement("span", null, "🔒 Progresso do bloco (libera o próximo)"), React.createElement("span", null, sessionsPerBloco(blocoAtivoPres.key), "/", requiredPerBlock)), React.createElement("div", { style: { height: 8, background: "rgba(255,255,255,0.6)", borderRadius: 99, overflow: "hidden" } }, React.createElement("div", { style: { height: "100%", width: Math.min(100, Math.round(sessionsPerBloco(blocoAtivoPres.key) / requiredPerBlock * 100)) + "%", background: blocoAtivoPres.cor.dot, borderRadius: 99, transition: "width 0.3s" } })))), React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" } }, treinosUnicos.map((t, i) => {
    const d = TREINO_DEFS[t] || { label: "Treino " + t, cor: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" };
    return React.createElement("button", { key: t + i, onClick: () => setPresTreinoIdx(i), style: { flex: 1, minWidth: 70, border: `1.5px solid ${presTreinoIdx === i ? d.cor : d.border}`, borderRadius: 9, padding: "8px 6px", fontSize: 11, fontWeight: 700, cursor: "pointer", background: presTreinoIdx === i ? d.bg : "#fff", color: presTreinoIdx === i ? d.cor : "#64748b", textAlign: "center", boxShadow: presTreinoIdx === i ? "0 2px 6px rgba(15,23,42,0.08)" : "none" } }, d.label);
  })), React.createElement("div", { style: { background: tdPres?.bg, border: `1.5px solid ${tdPres?.border}`, borderRadius: 9, padding: "8px 12px", marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: tdPres?.cor } }, tdPres?.desc)), allKeysPres.length > 0 && React.createElement("div", { style: { marginBottom: 16 } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 5, fontWeight: 700 } }, React.createElement("span", null, "Progresso"), React.createElement("span", null, presDoneAtual, "/", allKeysPres.length)), React.createElement("div", { style: { height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" } }, React.createElement("div", { style: { height: "100%", width: (allKeysPres.length ? Math.round(presDoneAtual / allKeysPres.length * 100) : 0) + "%", background: O, borderRadius: 99, transition: "width 0.2s" } }))), MOMENTOS.map(([mk, mlabel, mcor]) => {
    const itens = sessaoPres[mk] || [];
    if (itens.length === 0) return null;
    return React.createElement("div", { key: mk, style: { marginBottom: 18 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 800, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.3 } }, React.createElement("span", { style: { width: 8, height: 8, borderRadius: 99, background: mcor, flexShrink: 0 } }), mlabel), itens.map((it, idx) => {
      const key = chavePrefixoPres + mk + "-" + idx;
      const isCog = it.isCognitivo || it.exId === "cognitivo";
      const ex = !isCog ? (exerciciosBiblioteca || []).find((e) => e.id === it.exId) || EXERCISES.find((e) => e.id === it.exId) : null;
      const nome = isCog ? "Atividade Cognitiva" : ex?.nome || "Exercício";
      const done = presDone.has(key);
      const lastCarga = !isCog ? getLastCargaPres(it.exId) : null;
      const ytId = ex && getYtId(ex.video);
      const capaImg = !isCog ? ytId ? "https://img.youtube.com/vi/" + ytId + "/hqdefault.jpg" : ex?.foto || null : null;
      if (capaImg) {
        return React.createElement(Card, { key, style: { padding: 0, marginBottom: 8, overflow: "hidden", background: done ? "#f0fdf4" : "#fff", borderColor: done ? "#bbf7d0" : "#e2e8f0" } }, React.createElement("div", { style: { position: "relative", background: "#0f172a" } }, React.createElement("img", { src: capaImg, alt: nome, style: { width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block", opacity: done ? 0.65 : 1 } }), React.createElement("button", { onClick: () => togglePresDone(key), style: { position: "absolute", top: 10, left: 10, width: 32, height: 32, borderRadius: 9, border: "none", background: done ? "#16a34a" : "rgba(255,255,255,0.92)", color: done ? "#fff" : "#0f172a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.3)", fontSize: 15, fontWeight: 800 } }, done ? "✓" : "")), React.createElement("div", { style: { padding: "14px 16px" } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 15, lineHeight: 1.3, textDecoration: done ? "line-through" : "none", opacity: done ? 0.7 : 1, marginBottom: 8 } }, nome), React.createElement("div", { style: { display: "flex", gap: 14, fontSize: 12, color: "#94a3b8", flexWrap: "wrap", rowGap: 6 } }, React.createElement("span", null, "Séries: ", React.createElement("b", { style: { color: "#475569" } }, it.series)), React.createElement("span", null, "Reps: ", React.createElement("b", { style: { color: "#475569" } }, it.reps)), React.createElement("span", null, "Descanso: ", React.createElement("b", { style: { color: "#475569" } }, it.descanso))), React.createElement("div", { style: { marginTop: 10, display: "flex", alignItems: "center", gap: 6 } }, React.createElement("span", { style: { fontSize: 11, color: "#94a3b8" } }, "Carga:"), React.createElement("input", { type: "text", inputMode: "decimal", value: presCargasTreino[key] || "", onChange: (e) => setPresCarga(key, e.target.value), placeholder: lastCarga ? lastCarga + "kg" : "kg", style: { width: 56, padding: "5px 7px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 12, fontWeight: 700, color: "#0f172a", fontFamily: "inherit", textAlign: "center", background: "#f8fafc" } }), React.createElement("span", { style: { fontSize: 11, color: "#94a3b8" } }, "kg")), it.obs && React.createElement("div", { style: { marginTop: 10, fontSize: 12, color: "#64748b", fontStyle: "italic", padding: "8px 10px", background: "#f8fafc", borderRadius: 8 } }, it.obs)));
      }
      return React.createElement(Card, { key, style: { padding: "12px 14px", marginBottom: 8, background: done ? "#f0fdf4" : "#fff", borderColor: done ? "#bbf7d0" : "#e2e8f0" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, React.createElement("button", { onClick: () => togglePresDone(key), style: { width: 26, height: 26, borderRadius: 8, border: done ? "none" : "1.5px solid #cbd5e1", background: done ? "#16a34a" : "#fff", color: "#fff", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 } }, done ? "✓" : ""), React.createElement("div", { style: { width: 38, height: 38, borderRadius: 10, background: "#fff4ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 } }, isCog ? "🧠" : ex?.icone || "🏋️"), React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, textDecoration: done ? "line-through" : "none", opacity: done ? 0.7 : 1 } }, nome), !isCog ? React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 2, fontSize: 11, color: "#94a3b8", flexWrap: "wrap", rowGap: 5 } }, React.createElement("span", null, "Séries: ", React.createElement("b", { style: { color: "#475569" } }, it.series)), React.createElement("span", null, "Reps: ", React.createElement("b", { style: { color: "#475569" } }, it.reps)), React.createElement("span", null, "Descanso: ", React.createElement("b", { style: { color: "#475569" } }, it.descanso))) : React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8", marginTop: 2 } }, "⏱ ", it.reps))), !isCog && React.createElement("div", { style: { marginTop: 8, marginLeft: 48, display: "flex", alignItems: "center", gap: 6 } }, React.createElement("span", { style: { fontSize: 11, color: "#94a3b8" } }, "Carga:"), React.createElement("input", { type: "text", inputMode: "decimal", value: presCargasTreino[key] || "", onChange: (e) => setPresCarga(key, e.target.value), placeholder: lastCarga ? lastCarga + "kg" : "kg", style: { width: 56, padding: "5px 7px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 12, fontWeight: 700, color: "#0f172a", fontFamily: "inherit", textAlign: "center", background: "#f8fafc" } }), React.createElement("span", { style: { fontSize: 11, color: "#94a3b8" } }, "kg")), it.obs && React.createElement("div", { style: { marginTop: 8, marginLeft: 48, fontSize: 11, color: "#64748b", fontStyle: "italic" } }, it.obs));
    }));
  }), allKeysPres.length === 0 && React.createElement("div", { style: { textAlign: "center", color: "#cbd5e1", fontSize: 12, padding: "20px 0" } }, "Não há exercícios prescritos para este bloco/treino."), React.createElement(Btn, { full: true, onClick: salvarTreinoPresencial, disabled: allKeysPres.length === 0 }, "Concluir treino de hoje"), presTreinoSalvo && React.createElement("div", { style: { marginTop: 14, textAlign: "center", fontSize: 12, fontWeight: 700, color: "#16a34a" } }, "Treino registrado! Já aparece na aba Evolução."))), presTab === "pos" && React.createElement(React.Fragment, null, React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 10 } }, "Duração do treino"), React.createElement("div", { style: { display: "flex", gap: 6 } }, [30, 45, 60, 75, 90].map((m) => React.createElement("button", { key: m, onClick: () => setPresPos((c) => ({ ...c, duracao: c.duracao === m ? null : m })), style: { flex: 1, padding: "12px 2px", borderRadius: 10, border: presPos.duracao === m ? "1.5px solid #FF5603" : "1.5px solid #e2e8f0", background: presPos.duracao === m ? "#fff4ee" : "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: presPos.duracao === m ? "#FF5603" : "#475569" } }, m + " min")))), ccfg.post?.esforco && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 10 } }, "Esforço do treino"), React.createElement("div", { style: { display: "flex", gap: 6 } }, [{ v: 1, e: "😌", l: "Leve" }, { v: 3, e: "🙂", l: "Moderado" }, { v: 5, e: "😓", l: "Intenso" }].map((o) => React.createElement("button", { key: o.v, onClick: () => setPresPos((c) => ({ ...c, esforco: o.v })), style: { flex: 1, padding: "10px 2px", borderRadius: 10, border: presPos.esforco === o.v ? "1.5px solid #FF5603" : "1.5px solid #e2e8f0", background: presPos.esforco === o.v ? "#fff4ee" : "#fff", cursor: "pointer", textAlign: "center", fontFamily: "inherit" } }, React.createElement("div", { style: { fontSize: 20 } }, o.e), React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: presPos.esforco === o.v ? "#FF5603" : "#94a3b8", marginTop: 2 } }, o.l))))), ccfg.post?.completude && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 10 } }, "Conseguiu completar o treino como planejado?"), React.createElement("div", { style: { display: "flex", gap: 8 } }, [{ v: "sim", e: "✅", l: "Sim, completo" }, { v: "parcial", e: "⚠️", l: "Parcialmente" }, { v: "nao", e: "❌", l: "Não consegui" }].map((o) => React.createElement("button", { key: o.v, onClick: () => setPresPos((c) => ({ ...c, completude: o.v })), style: { flex: 1, padding: "12px 4px", borderRadius: 10, border: presPos.completude === o.v ? "1.5px solid #FF5603" : "1.5px solid #e2e8f0", background: presPos.completude === o.v ? "#fff4ee" : "#fff", cursor: "pointer", textAlign: "center", fontFamily: "inherit" } }, React.createElement("div", { style: { fontSize: 22 } }, o.e), React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: presPos.completude === o.v ? "#FF5603" : "#94a3b8", marginTop: 3 } }, o.l))))), ccfg.post?.dor && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 10 } }, "Dor ou desconforto"), React.createElement("div", { style: { display: "flex", gap: 6 } }, [{ v: "nenhuma", e: "😊", l: "Nenhuma" }, { v: "leve", e: "😕", l: "Leve" }, { v: "moderada", e: "😣", l: "Moderada" }, { v: "alta", e: "😖", l: "Alta" }].map((o) => React.createElement("button", { key: o.v, onClick: () => setPresPos((c) => ({ ...c, dor: o.v })), style: { flex: 1, padding: "10px 2px", borderRadius: 10, border: presPos.dor === o.v ? "1.5px solid #FF5603" : "1.5px solid #e2e8f0", background: presPos.dor === o.v ? "#fff4ee" : "#fff", cursor: "pointer", textAlign: "center", fontFamily: "inherit", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 } }, React.createElement("span", { style: { fontSize: 19 } }, o.e), React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: presPos.dor === o.v ? "#FF5603" : "#94a3b8" } }, o.l))))), ccfg.post?.pa && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 10 } }, "❤️ Pressão arterial"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, React.createElement("input", { value: presPos.pas, onChange: (e) => setPresPos((c) => ({ ...c, pas: e.target.value })), placeholder: "PAS", inputMode: "numeric", style: { padding: "9px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" } }), React.createElement("input", { value: presPos.pad, onChange: (e) => setPresPos((c) => ({ ...c, pad: e.target.value })), placeholder: "PAD", inputMode: "numeric", style: { padding: "9px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" } }))), ccfg.post?.fc && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 10 } }, "💓 Frequência cardíaca"), React.createElement("input", { value: presPos.fc, onChange: (e) => setPresPos((c) => ({ ...c, fc: e.target.value })), placeholder: "FC (bpm)", inputMode: "numeric", style: { width: "100%", padding: "9px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" } })), ccfg.post?.glicemia && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 10 } }, "🩸 Glicemia (mg/dL)"), React.createElement("input", { value: presPos.glicemia, onChange: (e) => setPresPos((c) => ({ ...c, glicemia: e.target.value })), placeholder: "100", inputMode: "numeric", style: { width: "100%", padding: "9px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" } })), ccfg.post?.obs && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 4 } }, "Teve dificuldade em algum exercício específico?"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 8 } }, "Pode ser bem curto — ajuda a ajustar o próximo treino."), React.createElement("textarea", { value: presPos.obs, onChange: (e) => setPresPos((c) => ({ ...c, obs: e.target.value })), placeholder: "Ex: sentiu dificuldade no agachamento, reduzimos o peso do supino...", style: { width: "100%", minHeight: 70, padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", resize: "vertical" } })), React.createElement(Btn, { full: true, onClick: salvarPresPos, disabled: presSaving || ccfg.post?.esforco && presPos.esforco === null || ccfg.post?.completude && presPos.completude === null || ccfg.post?.obs && !presPos.obs.trim() }, presSaving ? "Salvando..." : "Registrar check-out")), presMsg && React.createElement("div", { style: { marginTop: 14, textAlign: "center", fontSize: 12, fontWeight: 700, color: presMsg.startsWith("Erro") ? "#dc2626" : "#16a34a" } }, presMsg)), tab === "evolucao" && React.createElement("div", null, React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 16 } }, [["bemestar", "Bem-estar"], ["carga", "Carga"], ["testes", "Testes Físicos"]].map(([k, l]) => React.createElement("button", { key: k, onClick: () => setEvolSubTab(k), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: evolSubTab === k ? O : "#f1f5f9", color: evolSubTab === k ? "#fff" : "#64748b" } }, l))), evolSubTab === "bemestar" && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 14, lineHeight: 1.5 } }, "Evolução baseada nas respostas de check-in (antes do treino) e check-out (depois do treino). Escolha um ou mais indicadores pra comparar."), React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 } }, BEMESTAR_METRICAS.map((m, i) => React.createElement("button", { key: m.id, onClick: () => toggleEvolMetrica(m.id), style: { border: evolMetricasSel.includes(m.id) ? `1.5px solid ${O}` : "1.5px solid #e2e8f0", background: evolMetricasSel.includes(m.id) ? "#fff4ee" : "#f8fafc", color: evolMetricasSel.includes(m.id) ? O : "#64748b", borderRadius: 99, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" } }, m.label))), evolMetricasSel.length === 0 ? React.createElement("div", { style: { textAlign: "center", color: "#cbd5e1", fontSize: 12, padding: "20px 0" } }, "Escolha ao menos um indicador acima.") : (() => {
    const CORES = ["#FF5603", "#2563eb", "#16a34a", "#7c3aed", "#d97706", "#dc2626"];
    const seriesData = evolMetricasSel.map((id, i) => {
      const m = BEMESTAR_METRICAS.find((x) => x.id === id);
      const dados = m.fonte.map((c) => ({ x: c.date, y: m.get(c) })).filter((d) => d.y !== void 0 && d.y !== null && !isNaN(d.y));
      return { label: m.label, color: CORES[i % CORES.length], data: dados };
    });
    return React.createElement(Card, { style: { padding: "16px 14px" } }, React.createElement(MultiLineChart, { series: seriesData }));
  })()), evolSubTab === "carga" && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 14, lineHeight: 1.5 } }, exerciciosBenchmark.size > 0 ? "Evolução dos exercícios marcados como teste de referência na prescrição do treino." : "Nenhum exercício foi marcado como teste de referência ainda — mostrando todos os que já têm carga registrada. Marque um ⭐ na prescrição do treino pra deixar essa lista mais objetiva."), exerciciosCargaExibir.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 32 } }, React.createElement(I, { n: "bar", c: "#cbd5e1", s: 32 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhum registro de carga ainda.")) : (() => {
    const CORES = ["#FF5603", "#2563eb", "#16a34a", "#7c3aed", "#d97706", "#dc2626"];
    const seriesData = exerciciosCargaExibir.map((nome, i) => ({ label: nome, color: CORES[i % CORES.length], data: stCargas.filter((c) => c.name === nome).map((c) => ({ x: c.date, y: c.load })) }));
    return React.createElement(Card, { style: { padding: "16px 14px" } }, React.createElement(MultiLineChart, { series: seriesData }));
  })()), evolSubTab === "testes" && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 14, lineHeight: 1.5 } }, "Evolução dos testes físicos e índices calculados a cada avaliação. Escolha um ou mais pra comparar."), React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 } }, TESTES_METRICAS.map((m) => React.createElement("button", { key: m.id, onClick: () => toggleEvolTeste(m.id), style: { border: evolTestesSel.includes(m.id) ? "1.5px solid #7c3aed" : "1.5px solid #e2e8f0", background: evolTestesSel.includes(m.id) ? "#f5f3ff" : "#f8fafc", color: evolTestesSel.includes(m.id) ? "#7c3aed" : "#64748b", borderRadius: 99, padding: "7px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" } }, m.label))), evolTestesSel.length === 0 ? React.createElement("div", { style: { textAlign: "center", color: "#cbd5e1", fontSize: 12, padding: "20px 0" } }, "Escolha ao menos um teste acima.") : (() => {
    const CORES = ["#7c3aed", "#FF5603", "#2563eb", "#16a34a", "#d97706", "#dc2626", "#0891b2", "#db2777", "#65a30d"];
    const seriesData = evolTestesSel.map((id, i) => {
      const m = TESTES_METRICAS.find((x) => x.id === id);
      const dados = stEvolAssessments.map((a) => ({ x: a.date, y: m.get(a) })).filter((d) => d.y !== void 0 && d.y !== null && !isNaN(d.y));
      return { label: m.label, color: CORES[i % CORES.length], data: dados };
    });
    return React.createElement(Card, { style: { padding: "16px 14px" } }, React.createElement(MultiLineChart, { series: seriesData }));
  })())), tab === "mon" && React.createElement("div", null, React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 10 } }, React.createElement(Btn, { sm: true, icon: "plus", onClick: () => nav("daily", { studentId }) }, "Registrar")), stLogs.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 32 } }, React.createElement(I, { n: "act", c: "#cbd5e1", s: 32 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhum registro ainda.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, stLogs.slice(0, 10).map((l) => React.createElement(Card, { key: l.id, style: { padding: "14px 16px" } }, React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 8 } }, fmt(l.date)), React.createElement(MomentCard, { label: "Pré-exercício", color: "#6366f1", m: l.pre }), React.createElement(MomentCard, { label: "Durante", color: O, m: l.during }), React.createElement(MomentCard, { label: "Pós-exercício", color: "#16a34a", m: l.post }), l.notes && React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 6 } }, "📝 ", l.notes))), stLogs.length > 10 && React.createElement("div", { style: { textAlign: "center" } }, React.createElement(Btn, { variant: "ghost", sm: true, onClick: () => nav("daily", { studentId }) }, "Ver todos (", stLogs.length, ")")))), tab === "alim" && (window.LongevusAlimentacao ? React.createElement(window.LongevusAlimentacao.Painel, { st, assessments }) : React.createElement(Card, { style: { textAlign: "center", padding: 32, color: "#94a3b8" } }, "Módulo de alimentação não carregou. Confira se o arquivo longevus-alimentacao.js está no repositório.")), tab === "historico" && (window.LongevusCardio && window.LongevusCardio.Historico ? React.createElement(window.LongevusCardio.Historico, { st }) : React.createElement(Card, { style: { textAlign: "center", padding: 32, color: "#94a3b8" } }, "Módulo de histórico não carregou. Confira se o arquivo longevus-cardio.js está atualizado no repositório.")), tab === "cardio" && (window.LongevusCardio ? React.createElement(window.LongevusCardio.Painel, { st }) : React.createElement(Card, { style: { textAlign: "center", padding: 32, color: "#94a3b8" } }, "Módulo de cardio não carregou. Confira se o arquivo longevus-cardio.js está no repositório.")), tab === "antro" && (window.LongevusAntropometria ? React.createElement(window.LongevusAntropometria.Painel, { st, nav }) : React.createElement(Card, { style: { textAlign: "center", padding: 32, color: "#94a3b8" } }, "Módulo de antropometria não carregou. Confira se o arquivo longevus-antropometria.js está no repositório.")), tab === "doc" && React.createElement("div", null, React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 10 } }, React.createElement(Btn, { sm: true, icon: "plus", onClick: () => nav("documents", { studentId }) }, "Adicionar")), stDocs.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 32 } }, React.createElement(I, { n: "clip", c: "#cbd5e1", s: 32 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhum documento anexado.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, stDocs.map((d) => React.createElement(Card, { key: d.id, onClick: () => nav("documents", { studentId }), style: { padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 } }, React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, d.label), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, fmt(d.date))))))), editModal && form && React.createElement(Modal, { title: "Editar Aluno", onClose: () => setEditModal(false) }, React.createElement(Inp, { label: "Nome completo *", value: form.name, onChange: (v) => setForm((f) => ({ ...f, name: v })), placeholder: "Nome do aluno" }), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Nascimento", type: "date", value: form.dob, onChange: (v) => setForm((f) => ({ ...f, dob: v })) }), React.createElement(Inp, { label: "Sexo", value: form.sex, onChange: (v) => setForm((f) => ({ ...f, sex: v })), opts: [{ v: "", l: "Selecione" }, { v: "M", l: "Masculino" }, { v: "F", l: "Feminino" }] })), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Telefone", value: form.phone, onChange: (v) => setForm((f) => ({ ...f, phone: v })), placeholder: "(00) 00000-0000" }), React.createElement(Inp, { label: "Email", type: "email", value: form.email, onChange: (v) => setForm((f) => ({ ...f, email: v })), placeholder: "email@exemplo.com" })), React.createElement(Inp, { label: "WhatsApp", value: form.whatsapp, onChange: (v) => setForm((f) => ({ ...f, whatsapp: v })), placeholder: "(00) 00000-0000" }), React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#FF5603", marginBottom: 8, marginTop: 4, paddingTop: 10, borderTop: "1px solid #f1f5f9" } }, "👤 Contato do Responsável (opcional)"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Nome do responsável", value: form.responsibleName, onChange: (v) => setForm((f) => ({ ...f, responsibleName: v })), placeholder: "Nome completo" }), React.createElement(Inp, { label: "WhatsApp do responsável", value: form.responsiblePhone, onChange: (v) => setForm((f) => ({ ...f, responsiblePhone: v })), placeholder: "(00) 00000-0000" })), React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#FF5603", marginBottom: 8, marginTop: 4, paddingTop: 10, borderTop: "1px solid #f1f5f9" } }, "🩺 Médico de Confiança (opcional)"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Nome do médico", value: form.doctorName, onChange: (v) => setForm((f) => ({ ...f, doctorName: v })), placeholder: "Dr(a). Nome" }), React.createElement(Inp, { label: "Contato do médico", value: form.doctorPhone, onChange: (v) => setForm((f) => ({ ...f, doctorPhone: v })), placeholder: "(00) 00000-0000" })), React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#FF5603", marginBottom: 8, marginTop: 4, paddingTop: 10, borderTop: "1px solid #f1f5f9" } }, "💰 Cobrança"), React.createElement("div", { onClick: () => setForm((f) => ({ ...f, billing: { ...f.billing, ativo: !f.billing.ativo } })), style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12, cursor: "pointer", background: "#f8fafc", borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { width: 38, height: 22, borderRadius: 99, background: form.billing.ativo ? "#FF5603" : "#cbd5e1", position: "relative", transition: "background 0.15s", flexShrink: 0 } }, React.createElement("div", { style: { width: 18, height: 18, borderRadius: 99, background: "#fff", position: "absolute", top: 2, left: form.billing.ativo ? 18 : 2, transition: "left 0.15s" } })), React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "#334155" } }, "Cobrança ativa (bloqueia o app do aluno quando vencer)")), form.billing.ativo && React.createElement(React.Fragment, null, React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 12 } }, React.createElement("button", { onClick: () => setForm((f) => ({ ...f, billing: { ...f.billing, tipo: "mensal" } })), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: form.billing.tipo !== "avulso" ? "#FF5603" : "#f1f5f9", color: form.billing.tipo !== "avulso" ? "#fff" : "#64748b" } }, "Mensal"), React.createElement("button", { onClick: () => setForm((f) => ({ ...f, billing: { ...f.billing, tipo: "avulso" } })), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: form.billing.tipo === "avulso" ? "#FF5603" : "#f1f5f9", color: form.billing.tipo === "avulso" ? "#fff" : "#64748b" } }, "Avulso / por aula")), form.billing.tipo !== "avulso" && React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: -6, marginBottom: 12 } }, "Escolha embaixo se a mensalidade é valor fixo ou calculada por sessão."), form.billing.tipo === "avulso" ? React.createElement(Inp, { label: "Valor por aula (R$)", type: "number", value: form.billing.valorAula, onChange: (v) => setForm((f) => ({ ...f, billing: { ...f.billing, valorAula: v } })), placeholder: "60.00" }) : React.createElement(React.Fragment, null, (planos || []).filter((pl) => pl.ativo !== false).length > 0 && React.createElement(Inp, { label: "Escolher de um plano salvo", value: "", onChange: (v) => {
    const pl = (planos || []).find((p) => p.id === v);
    if (pl) setForm((f) => ({ ...f, billing: { ...f.billing, plano: pl.nome, modoCobranca: pl.modoCobranca || "fixo", valor: pl.valor, valorSessao: pl.valorSessao || "", regraVencimento: pl.regraVencimento || "30dias", toleranciaDias: pl.toleranciaDias ?? "" } }));
  }, opts: [{ v: "", l: "Selecionar..." }, ...(planos || []).filter((pl) => pl.ativo !== false).map((pl) => ({ v: pl.id, l: pl.nome + " · " + (pl.modoCobranca === "porSessao" ? "R$ " + Number(pl.valorSessao || 0).toFixed(2).replace(".", ",") + "/sessão" : "R$ " + Number(pl.valor || 0).toFixed(2).replace(".", ",")) }))] }), React.createElement(Inp, { label: "Plano", value: form.billing.plano, onChange: (v) => setForm((f) => ({ ...f, billing: { ...f.billing, plano: v } })), placeholder: "Ex: Mensal - 3x/semana" }), React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 12 } }, React.createElement("button", { onClick: () => setForm((f) => ({ ...f, billing: { ...f.billing, modoCobranca: "fixo" } })), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: form.billing.modoCobranca !== "porSessao" ? "#FF5603" : "#f1f5f9", color: form.billing.modoCobranca !== "porSessao" ? "#fff" : "#64748b" } }, "Valor fixo"), React.createElement("button", { onClick: () => setForm((f) => ({ ...f, billing: { ...f.billing, modoCobranca: "porSessao" } })), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: form.billing.modoCobranca === "porSessao" ? "#FF5603" : "#f1f5f9", color: form.billing.modoCobranca === "porSessao" ? "#fff" : "#64748b" } }, "Por sessão")), form.billing.modoCobranca === "porSessao" ? React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Valor por sessão (R$)", type: "number", value: form.billing.valorSessao, onChange: (v) => setForm((f) => ({ ...f, billing: { ...f.billing, valorSessao: v } })), placeholder: "60.00" }), React.createElement(Inp, { label: "Próximo vencimento", type: "date", value: form.billing.vencimento, onChange: (v) => setForm((f) => ({ ...f, billing: { ...f.billing, vencimento: v } })) })) : React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Valor mensal (R$)", type: "number", value: form.billing.valor, onChange: (v) => setForm((f) => ({ ...f, billing: { ...f.billing, valor: v } })), placeholder: "150.00" }), React.createElement(Inp, { label: "Próximo vencimento", type: "date", value: form.billing.vencimento, onChange: (v) => setForm((f) => ({ ...f, billing: { ...f.billing, vencimento: v } })) })), form.billing.modoCobranca !== "porSessao" && React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Vencimentos seguintes", value: form.billing.regraVencimento, onChange: (v) => setForm((f) => ({ ...f, billing: { ...f.billing, regraVencimento: v } })), opts: REGRA_VENC_OPTS }), React.createElement(Inp, { label: "Dias de tolerância", type: "number", value: form.billing.toleranciaDias, onChange: (v) => setForm((f) => ({ ...f, billing: { ...f.billing, toleranciaDias: v } })), placeholder: "Padrão do Perfil" })), form.billing.modoCobranca !== "porSessao" && React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: -6, marginBottom: 13 } }, "Tolerância: dias que o aluno ainda acessa o app depois de vencer, vendo um aviso de atraso. Em branco, usa o valor de Meu Perfil."), form.billing.modoCobranca === "porSessao" && React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: -6, marginBottom: 13 } }, "Cada aula agendada já gera a cobrança dela sozinha (igual avulso). A data acima é só a âncora do ciclo de 30 dias — as cobranças de cada ciclo se agrupam nela."))), React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#FF5603", marginBottom: 8, marginTop: 4, paddingTop: 10, borderTop: "1px solid #f1f5f9" } }, "📋 Check-in do Aluno (App)"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 10 } }, "Antes do treino"), [
    { k: "disposicao", label: "Disposição" },
    { k: "hidratacao", label: "Hidratação" },
    { k: "alimentacao", label: "Alimentação" },
    { k: "sono", label: "Qualidade do sono" },
    { k: "dor", label: "Dor rápida" },
    { k: "pa", label: "Pressão arterial" },
    { k: "fc", label: "Frequência cardíaca" },
    { k: "glicemia", label: "Glicemia" }
  ].map((item) => React.createElement("div", { key: item.k, onClick: () => setForm((f) => ({ ...f, checkinConfig: { ...f.checkinConfig, pre: { ...f.checkinConfig.pre, [item.k]: !f.checkinConfig.pre[item.k] } } })), style: { display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: "#f8fafc", borderRadius: 9, padding: "9px 12px", marginBottom: 6 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#334155" } }, item.label), React.createElement("div", { style: { width: 36, height: 20, borderRadius: 99, background: form.checkinConfig.pre[item.k] ? "#FF5603" : "#cbd5e1", position: "relative", transition: "background 0.15s", flexShrink: 0 } }, React.createElement("div", { style: { width: 16, height: 16, borderRadius: 99, background: "#fff", position: "absolute", top: 2, left: form.checkinConfig.pre[item.k] ? 18 : 2, transition: "left 0.15s" } })))), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 10, marginTop: 12 } }, "Depois do treino"), [
    { k: "esforco", label: "Esforço (PSE 0-10)" },
    { k: "completude", label: "Completude do treino" },
    { k: "dor", label: "Dor rápida" },
    { k: "pa", label: "Pressão arterial" },
    { k: "fc", label: "Frequência cardíaca" },
    { k: "glicemia", label: "Glicemia" },
    { k: "obs", label: "Observação livre" }
  ].map((item) => React.createElement("div", { key: item.k, onClick: () => setForm((f) => ({ ...f, checkinConfig: { ...f.checkinConfig, post: { ...f.checkinConfig.post, [item.k]: !f.checkinConfig.post[item.k] } } })), style: { display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: "#f8fafc", borderRadius: 9, padding: "9px 12px", marginBottom: 6 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#334155" } }, item.label), React.createElement("div", { style: { width: 36, height: 20, borderRadius: 99, background: form.checkinConfig.post[item.k] ? "#FF5603" : "#cbd5e1", position: "relative", transition: "background 0.15s", flexShrink: 0 } }, React.createElement("div", { style: { width: 16, height: 16, borderRadius: 99, background: "#fff", position: "absolute", top: 2, left: form.checkinConfig.post[item.k] ? 18 : 2, transition: "left 0.15s" } })))), React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 8 } }, React.createElement(Btn, { variant: "secondary", full: true, onClick: () => setEditModal(false) }, "Cancelar"), React.createElement(Btn, { full: true, onClick: saveEdit }, "Salvar"))), feedbackModal && feedbackForm && React.createElement(Modal, { title: "Novo feedback", onClose: () => setFeedbackModal(false) }, React.createElement(Inp, { label: "Data", type: "date", value: feedbackForm.date, onChange: (v) => setFeedbackForm((f) => ({ ...f, date: v })) }), React.createElement(Inp, { label: "Resumo do que foi conversado", rows: 5, value: feedbackForm.text, onChange: (v) => setFeedbackForm((f) => ({ ...f, text: v })), placeholder: "Ex: Conversamos sobre a dor no joelho, ajustei a carga do agachamento e reforcei a hidratação..." }), React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 8 } }, React.createElement(Btn, { variant: "secondary", full: true, onClick: () => setFeedbackModal(false) }, "Cancelar"), React.createElement(Btn, { full: true, onClick: saveFeedback }, "Salvar"))));
};
const NewAssessment = ({ students, setAssessments, nav, prefillStudentId }) => {
  const [step, setStep] = useState(0);
  const [sid, setSid] = useState(prefillStudentId || "");
  const [modAtivos, setModAtivos] = useState({ questionarios: true, fisico: true, cognitivo: true });
  const [anamnese, setAnamnese] = useState({
    pathologies: "",
    medications: "",
    allergies: "",
    surgeries: "",
    physActivityHistory: "",
    physActivityFreq: "",
    physActivityType: "",
    sleepHours: "",
    sleepQuality: "",
    dietQuality: "",
    stressLevel: "",
    smoking: "nao",
    alcohol: "nao",
    alcoholFreq: "",
    mainComplaints: "",
    painLocation: "",
    goals: "",
    observations: ""
  });
  const [parqEnabled, setParqEnabled] = useState(false);
  const [parq, setParq] = useState({ q1: null, q2: null, q3: null, q4: null, q5: null, q6: null, q7: null });
  const [aha, setAha] = useState({ weight: "", height: "", bmi: "", sbp: "", dbp: "", hr: "", waist: "", hip: "", calf: "", smoker: false, diabetes: false, hypertension: false, hyperlipid: false, family: false });
  const [avd, setAvd] = useState({ eating: 2, bathing: 2, dressing: 2, toileting: 2, transferring: 2 });
  const [aivd, setAivd] = useState({ shopping: 2, finance: 2, transport: 2, medication: 2, housework: 2, telephone: 2 });
  const [funcRisk, setFuncRisk] = useState({ falls: false, balance: false, physlim: false, selfhealth: 2 });
  const [phys, setPhys] = useState({ sppbSide: "", sppbSemi: "", sppbTandem: "", sppbChair: "", sppbChairUnable: false, grip: "", tug: "", sitreach: "", march: "", selected: { sppbBalance: true, sppbChair: true, grip: true, tug: true, sitreach: true, march: true }, obs_sppbBalance: "", obs_sppbChair: "", obs_grip: "", obs_tug: "", obs_sitreach: "", obs_march: "" });
  const [cardioMode, setCardioMode] = useState("");
  const [cognitiveData, setCognitiveData] = useState({
    mmse: { q1: "", q2: "", q3: "", q4: "", q5: "", q6: "", q7: "", q8: "", q9: "", q10: "", total: "" },
    dualTask: { single: "", dual: "" },
    verbalFluency: { score: "", words: "" },
    digitSpan: { direct: "", inverse: "" },
    selected: { mmse: true, dualTask: true, verbalFluency: true, digitSpan: true },
    notes: ""
  });
  const [cardioAssessment, setCardioAssessment] = useState({ ergo: { fcRest: "", fcMax: "", pasSit: "", padSit: "", pasPeak: "", padPeak: "", mets: "", vo2max: "", vo2measured: false, fcSymptom: "", symptomType: "", fcIschemic: "", ecgObs: "", arrythmias: [], arrObs: "", medications: [] }, pred: { age: "", sex: "", fcRest: "", pasSit: "", padSit: "", diabetes: false, hypertension: false, obesity: false, cardioDisease: false, sedentary: false, symptoms: false, formula: "tanaka", medications: [], functionalTest: "", ftValue: "" } });
  const student = students.find((s) => s.id === sid);
  const sex = student?.sex || "";
  const [medidasOrigem, setMedidasOrigem] = useState("");
  useEffect(() => {
    if (!sid || !window.LongevusAntropometria || !window.LongevusAntropometria.medidas) return;
    let vivo = true;
    window.LongevusAntropometria.medidas(sid).then((m) => {
      if (!vivo || !m) return;
      let usou = false;
      setAha((a) => {
        const n = { ...a };
        const put = (k, f) => {
          if (!n[k] && m[f]) {
            n[k] = String(m[f].v);
            usou = true;
          }
        };
        put("weight", "peso");
        put("height", "altura");
        put("waist", "cintura");
        put("hip", "quadril");
        put("calf", "panturrilha");
        if (n.weight && n.height && !n.bmi) n.bmi = (parseFloat(n.weight) / Math.pow(parseFloat(n.height) / 100, 2)).toFixed(1);
        return n;
      });
      const ref = m.peso || m.altura || m.cintura;
      if (ref && ref.date) {
        const p = String(ref.date).slice(0, 10).split("-");
        setMedidasOrigem(p[2] + "/" + p[1] + "/" + p[0]);
      }
    }).catch(() => {
    });
    return () => {
      vivo = false;
    };
  }, [sid]);
  useEffect(() => {
    if (!sid) return;
    const prefill = LS.get("longevus_prefill_" + sid, null);
    if (!prefill) return;
    if (prefill.anamnese) setAnamnese((a) => ({ ...a, ...prefill.anamnese }));
    if (prefill.parq) {
      setParq((p) => ({ ...p, ...prefill.parq }));
      setParqEnabled(true);
    }
    if (prefill.avd) setAvd((a) => ({ ...a, ...prefill.avd }));
    if (prefill.aivd) setAivd((a) => ({ ...a, ...prefill.aivd }));
    if (prefill.funcRisk) setFuncRisk((f) => ({ ...f, ...prefill.funcRisk }));
    window.localStorage.removeItem("longevus_prefill_" + sid);
  }, [sid]);
  const parqQs = ["Médico disse que tem problema cardíaco?", "Sente dor no peito durante atividade física?", "Sentiu dor no peito no último mês (sem atividade)?", "Perde equilíbrio por tontura ou já desmaiou?", "Tem problema ósseo/articular que piora com exercício?", "Toma medicamento para pressão ou coração?", "Existe outro motivo pelo qual não deveria se exercitar?"];
  const calcAHA = () => {
    let s = 0;
    const bmi = parseFloat(aha.bmi);
    if (bmi >= 25 && bmi < 30) s += 1;
    if (bmi >= 30) s += 2;
    const sbp = parseFloat(aha.sbp);
    if (sbp >= 130 && sbp < 140) s += 1;
    if (sbp >= 140) s += 2;
    if (aha.smoker) s += 2;
    if (aha.diabetes) s += 3;
    if (aha.hypertension) s += 2;
    if (aha.hyperlipid) s += 1;
    if (aha.family) s += 1;
    return s;
  };
  const calcFunc = () => {
    const avdScore = Object.values(avd).reduce((a, v) => a + v, 0) / 5;
    const aivdScore = Object.values(aivd).reduce((a, v) => a + v, 0) / 6;
    const risks = (funcRisk.falls ? 10 : 0) + (funcRisk.balance ? 5 : 0) + (funcRisk.physlim ? 5 : 0);
    const self = funcRisk.selfhealth;
    const score = avdScore / 2 * 35 + aivdScore / 2 * 30 + self / 2 * 15 - risks + 20;
    return Math.round(Math.max(0, Math.min(100, score)));
  };
  const calcPhys = () => {
    let pts = 0, tot = 0;
    const semiS = phys.sppbSemi ? parseInt(phys.sppbSemi) || 0 : 0, tandemS = phys.sppbTandem ? parseInt(phys.sppbTandem) || 0 : 0;
    if (phys.sppbSide !== "") {
      tot += 20;
      const sc = (parseInt(phys.sppbSide) || 0) === 0 ? 0 : semiS + tandemS;
      pts += Math.round(sc / 3 * 20);
    }
    if (phys.sppbChair || phys.sppbChairUnable) {
      tot += 25;
      const cl = classifySPPBChairStand(phys.sppbChairUnable ? "unable" : phys.sppbChair);
      pts += cl ? Math.round(cl.score / 4 * 25) : 0;
    }
    if (phys.grip) {
      tot += 25;
      const v = parseFloat(phys.grip);
      pts += v >= 30 ? 25 : v >= 24 ? 20 : v >= 18 ? 14 : v >= 12 ? 8 : 3;
    }
    if (phys.tug) {
      tot += 20;
      const v = parseFloat(phys.tug);
      pts += v <= 10 ? 20 : v <= 13.5 ? 15 : v <= 16 ? 10 : 4;
    }
    if (phys.sitreach !== "") {
      tot += 10;
      const v = parseFloat(phys.sitreach);
      pts += v >= 20 ? 10 : v >= 10 ? 7 : v >= 0 ? 4 : 1;
    }
    return tot > 0 ? Math.round(pts / tot * 100) : 0;
  };
  const finish = () => {
    const ahaScore = calcAHA(), funcScore = calcFunc(), physScore = calcPhys();
    const cvScore = Math.max(0, Math.round(100 - ahaScore / 13 * 100));
    let globalWeighted = 0, globalWeightSum = 0;
    if (modAtivos.questionarios) {
      globalWeighted += cvScore * 0.35 + funcScore * 0.35;
      globalWeightSum += 0.7;
    }
    if (modAtivos.fisico) {
      globalWeighted += physScore * 0.3;
      globalWeightSum += 0.3;
    }
    const global = globalWeightSum > 0 ? Math.round(globalWeighted / globalWeightSum) : 0;
    const cogScore = modAtivos.cognitivo ? calcCognitiveScore(
      cognitiveData.selected?.mmse !== false ? cognitiveData.mmse.total : "",
      cognitiveData.selected?.dualTask !== false ? cognitiveData.dualTask.single : "",
      cognitiveData.selected?.dualTask !== false ? cognitiveData.dualTask.dual : "",
      cognitiveData.selected?.verbalFluency !== false ? cognitiveData.verbalFluency.score : "",
      cognitiveData.selected?.digitSpan !== false ? cognitiveData.digitSpan.direct : "",
      cognitiveData.selected?.digitSpan !== false ? cognitiveData.digitSpan.inverse : ""
    ) : null;
    const a = { id: uid(), studentId: sid, date: todayStr(), modAtivos, anamnese, parqFailed: parqEnabled && Object.values(parq).some((v) => v === true), parqApplied: parqEnabled, parq, aha: { ...aha, score: ahaScore }, avd, aivd, functional: { ...funcRisk, score: funcScore }, physical: { ...phys, score: physScore, sppbBalanceScore: phys.sppbSide === "0" ? 0 : (parseInt(phys.sppbSemi) || 0) + (parseInt(phys.sppbTandem) || 0), sppbChairScore: classifySPPBChairStand(phys.sppbChairUnable ? "unable" : phys.sppbChair)?.score || 0 }, globalScore: global, cardioMode, cardioAssessment, cognitiveData: { ...cognitiveData, score: cogScore } };
    setAssessments((p) => [...p, a]);
    nav("result", { id: a.id });
  };
  const steps = ["Aluno", "Anamnese", "PAR-Q", "Cardiovascular", "AVDs", "AIVDs", "Testes Físicos", "Teste Ergométrico", "Avaliação Cognitiva"];
  const STEP_MAP = [
    0,
    ...modAtivos.questionarios ? [1, 2, 3, 4, 5] : [],
    ...modAtivos.fisico ? [6, 7] : [],
    ...modAtivos.cognitivo ? [8] : []
  ];
  const realStep = STEP_MAP[Math.min(step, STEP_MAP.length - 1)];
  return React.createElement("div", null, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 18 } }, React.createElement("button", { onClick: () => step > 0 ? setStep((s) => s - 1) : nav("assessments"), style: { background: "#f1f5f9", border: "none", borderRadius: 9, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } }, React.createElement(I, { n: "back", s: 17 })), React.createElement("div", { style: { flex: 1 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 17 } }, "Nova Avaliação"), React.createElement("div", { style: { fontSize: 12, color: "#64748b" } }, "Etapa ", step + 1, "/", STEP_MAP.length, ": ", steps[realStep]))), React.createElement("div", { style: { height: 6, background: "#e2e8f0", borderRadius: 99, marginBottom: 22 } }, React.createElement("div", { style: { height: 6, background: O, borderRadius: 99, width: `${(step + 1) / STEP_MAP.length * 100}%`, transition: "width .3s" } })), realStep === 0 && React.createElement(Card, null, React.createElement("div", { style: { fontWeight: 700, marginBottom: 16 } }, "Selecionar Aluno"), React.createElement(Inp, { label: "Aluno", value: sid, onChange: setSid, opts: [{ v: "", l: "Selecione..." }, ...students.map((s) => ({ v: s.id, l: `${s.name} (${calcAge(s.dob)} anos)` }))] }), student && React.createElement("div", { style: { background: "#f8fafc", borderRadius: 10, padding: 12, marginBottom: 12 } }, React.createElement("div", { style: { fontWeight: 700 } }, student.name), React.createElement("div", { style: { fontSize: 13, color: "#64748b" } }, calcAge(student.dob), " anos · ", student.sex === "M" ? "Masculino" : student.sex === "F" ? "Feminino" : "—"), student.notes && React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 4 } }, student.notes)), React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginTop: 18, marginBottom: 10 } }, "Módulos desta avaliação"), [
    { k: "questionarios", label: "Questionários", desc: "Anamnese, PAR-Q, Cardiovascular, AVDs, AIVDs" },
    { k: "fisico", label: "Testes Físicos", desc: "SPPB, preensão, TUG, sentar-alcançar, marcha, ergométrico" },
    { k: "cognitivo", label: "Testes Cognitivos", desc: "MMSE, Dual Task, Fluência Verbal, Span de Dígitos" }
  ].map((m) => React.createElement("div", { key: m.k, style: { display: "flex", alignItems: "center", justifyContent: "space-between", background: modAtivos[m.k] ? "#fff4ee" : "#f8fafc", border: "1.5px solid " + (modAtivos[m.k] ? "#FF560344" : "#e2e8f0"), borderRadius: 12, padding: "12px 14px", marginBottom: 10 } }, React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: modAtivos[m.k] ? "#FF5603" : "#0f172a" } }, m.label), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 2 } }, m.desc)), React.createElement("button", { onClick: () => setModAtivos((x) => ({ ...x, [m.k]: !x[m.k] })), style: { width: 48, height: 26, borderRadius: 99, border: "none", background: modAtivos[m.k] ? "#FF5603" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 } }, React.createElement("div", { style: { width: 20, height: 20, borderRadius: 99, background: "#fff", position: "absolute", top: 3, left: modAtivos[m.k] ? 25 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px #0002" } })))), !modAtivos.questionarios && !modAtivos.fisico && !modAtivos.cognitivo && React.createElement("div", { style: { background: "#fee2e2", borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 12, color: "#dc2626", fontWeight: 600 } }, "⚠️ Ative pelo menos um módulo pra continuar."), React.createElement(Btn, { full: true, disabled: !sid || !modAtivos.questionarios && !modAtivos.fisico && !modAtivos.cognitivo, onClick: () => setStep((s) => s + 1) }, "Próximo →")), realStep === 1 && React.createElement(Card, null, React.createElement("div", { style: { fontWeight: 700, marginBottom: 4 } }, "Anamnese"), React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 18 } }, "Histórico de saúde, hábitos e objetivos do aluno"), React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", marginBottom: 10, paddingBottom: 6, borderBottom: "1.5px solid #fff4ee" } }, "🏥 Saúde"), React.createElement(Inp, { label: "Patologias / Doenças diagnosticadas", value: anamnese.pathologies, onChange: (v) => setAnamnese((a) => ({ ...a, pathologies: v })), placeholder: "Ex: hipertensão, diabetes, artrose..." }), React.createElement(Inp, { label: "Medicamentos em uso", value: anamnese.medications, onChange: (v) => setAnamnese((a) => ({ ...a, medications: v })), placeholder: "Ex: losartana 50mg, metformina..." }), React.createElement(Inp, { label: "Alergias", value: anamnese.allergies, onChange: (v) => setAnamnese((a) => ({ ...a, allergies: v })), placeholder: "Medicamentos, alimentos, outros..." }), React.createElement(Inp, { label: "Cirurgias / Procedimentos anteriores", value: anamnese.surgeries, onChange: (v) => setAnamnese((a) => ({ ...a, surgeries: v })), placeholder: "Ex: cirurgia de joelho (2020)..." }), React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", marginBottom: 10, paddingBottom: 6, borderBottom: "1.5px solid #fff4ee", marginTop: 8 } }, "🏃 Histórico de Atividade Física"), React.createElement(Inp, { label: "Pratica ou praticou atividade física?", value: anamnese.physActivityHistory, onChange: (v) => setAnamnese((a) => ({ ...a, physActivityHistory: v })), opts: [{ v: "", l: "Selecione..." }, { v: "nunca", l: "Nunca praticou" }, { v: "passado", l: "Praticou no passado" }, { v: "irregular", l: "Pratica irregularmente" }, { v: "regular", l: "Pratica regularmente" }] }), anamnese.physActivityHistory && anamnese.physActivityHistory !== "nunca" && React.createElement(React.Fragment, null, React.createElement(Inp, { label: "Modalidade(s)", value: anamnese.physActivityType, onChange: (v) => setAnamnese((a) => ({ ...a, physActivityType: v })), placeholder: "Ex: caminhada, musculação, natação..." }), React.createElement(Inp, { label: "Frequência semanal", value: anamnese.physActivityFreq, onChange: (v) => setAnamnese((a) => ({ ...a, physActivityFreq: v })), opts: [{ v: "", l: "Selecione..." }, { v: "1x", l: "1x por semana" }, { v: "2x", l: "2x por semana" }, { v: "3x", l: "3x por semana" }, { v: "4x", l: "4x ou mais" }] })), React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", marginBottom: 10, paddingBottom: 6, borderBottom: "1.5px solid #fff4ee", marginTop: 8 } }, "🌙 Hábitos de Vida"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Horas de sono/noite", value: anamnese.sleepHours, onChange: (v) => setAnamnese((a) => ({ ...a, sleepHours: v })), opts: [{ v: "", l: "Selecione..." }, { v: "<5", l: "Menos de 5h" }, { v: "5-6", l: "5 a 6h" }, { v: "7-8", l: "7 a 8h" }, { v: ">8", l: "Mais de 8h" }] }), React.createElement(Inp, { label: "Qualidade do sono", value: anamnese.sleepQuality, onChange: (v) => setAnamnese((a) => ({ ...a, sleepQuality: v })), opts: [{ v: "", l: "Selecione..." }, { v: "ruim", l: "Ruim" }, { v: "regular", l: "Regular" }, { v: "boa", l: "Boa" }, { v: "otima", l: "Ótima" }] }), React.createElement(Inp, { label: "Qualidade da alimentação", value: anamnese.dietQuality, onChange: (v) => setAnamnese((a) => ({ ...a, dietQuality: v })), opts: [{ v: "", l: "Selecione..." }, { v: "ruim", l: "Ruim" }, { v: "regular", l: "Regular" }, { v: "boa", l: "Boa" }, { v: "otima", l: "Ótima" }] }), React.createElement(Inp, { label: "Nível de estresse", value: anamnese.stressLevel, onChange: (v) => setAnamnese((a) => ({ ...a, stressLevel: v })), opts: [{ v: "", l: "Selecione..." }, { v: "baixo", l: "Baixo" }, { v: "moderado", l: "Moderado" }, { v: "alto", l: "Alto" }, { v: "muito_alto", l: "Muito alto" }] }), React.createElement(Inp, { label: "Tabagismo", value: anamnese.smoking, onChange: (v) => setAnamnese((a) => ({ ...a, smoking: v })), opts: [{ v: "nao", l: "Não fuma" }, { v: "ex", l: "Ex-fumante" }, { v: "sim", l: "Fumante" }] }), React.createElement(Inp, { label: "Consumo de álcool", value: anamnese.alcohol, onChange: (v) => setAnamnese((a) => ({ ...a, alcohol: v })), opts: [{ v: "nao", l: "Não consome" }, { v: "ocasional", l: "Ocasional" }, { v: "regular", l: "Regular" }] })), React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", marginBottom: 10, paddingBottom: 6, borderBottom: "1.5px solid #fff4ee", marginTop: 8 } }, "🎯 Queixas e Objetivos"), React.createElement(Inp, { label: "Queixas principais / Sintomas", value: anamnese.mainComplaints, onChange: (v) => setAnamnese((a) => ({ ...a, mainComplaints: v })), placeholder: "Ex: dor no joelho, cansaço fácil, tontura..." }), React.createElement(Inp, { label: "Localização de dores", value: anamnese.painLocation, onChange: (v) => setAnamnese((a) => ({ ...a, painLocation: v })), placeholder: "Ex: lombar, joelho direito, ombro..." }), React.createElement(Inp, { label: "Objetivos com o exercício físico", value: anamnese.goals, onChange: (v) => setAnamnese((a) => ({ ...a, goals: v })), placeholder: "Ex: perda de peso, condicionamento, qualidade de vida..." }), React.createElement(Inp, { label: "Observações adicionais", value: anamnese.observations, onChange: (v) => setAnamnese((a) => ({ ...a, observations: v })), placeholder: "Qualquer informação relevante..." }), React.createElement("div", { style: { marginTop: 16, display: "flex", gap: 10 } }, React.createElement(Btn, { variant: "secondary", full: true, onClick: () => setStep(0) }, "Voltar"), React.createElement(Btn, { full: true, onClick: () => setStep((s) => s + 1) }, "Próximo →"))), realStep === 2 && React.createElement(Card, null, React.createElement("div", { style: { fontWeight: 700, marginBottom: 4 } }, "PAR-Q"), React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 16 } }, "Questionário de prontidão para atividade física — opcional"), React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", background: parqEnabled ? "#fff4ee" : "#f8fafc", border: `1.5px solid ${parqEnabled ? "#FF560344" : "#e2e8f0"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 } }, React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: parqEnabled ? "#FF5603" : "#0f172a" } }, "Aplicar PAR-Q nesta avaliação?"), React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 2 } }, "Se não aplicado, o PAR-Q será ignorado no resultado")), React.createElement("button", { onClick: () => setParqEnabled((e) => !e), style: { width: 52, height: 28, borderRadius: 99, border: "none", background: parqEnabled ? "#FF5603" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s" } }, React.createElement("div", { style: { width: 22, height: 22, borderRadius: 99, background: "#fff", position: "absolute", top: 3, left: parqEnabled ? 27 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px #0002" } }))), parqEnabled && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 18 } }, "Prontidão para atividade física"), parqQs.map((q, i) => {
    const k = `q${i + 1}`;
    return React.createElement("div", { key: i, style: { paddingBottom: 14, marginBottom: 14, borderBottom: i < 6 ? "1px solid #f1f5f9" : "none" } }, React.createElement("div", { style: { fontSize: 14, color: "#334155", marginBottom: 8 } }, i + 1, ". ", q), React.createElement("div", { style: { display: "flex", gap: 8 } }, [true, false].map((v) => React.createElement("button", { key: String(v), onClick: () => setParq((p) => ({ ...p, [k]: v })), style: { flex: 1, padding: "8px 0", borderRadius: 9, border: "1.5px solid", borderColor: parq[k] === v ? v ? "#dc2626" : "#16a34a" : "#e2e8f0", background: parq[k] === v ? v ? "#fee2e2" : "#dcfce7" : "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", color: parq[k] === v ? v ? "#dc2626" : "#16a34a" : "#94a3b8" } }, v ? "SIM" : "NÃO"))));
  }), Object.values(parq).some((v) => v === true) && React.createElement("div", { style: { background: "#fee2e2", borderRadius: 10, padding: 12, marginBottom: 14 } }, React.createElement("div", { style: { color: "#dc2626", fontWeight: 700, fontSize: 13 } }, "⚠️ PAR-Q Positivo — avaliação médica recomendada."))), React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 8 } }, React.createElement(Btn, { variant: "secondary", full: true, onClick: () => setStep((s) => s - 1) }, "Voltar"), React.createElement(Btn, { full: true, onClick: () => setStep((s) => s + 1) }, "Próximo →"))), realStep === 3 && React.createElement(Card, null, React.createElement("div", { style: { fontWeight: 700, marginBottom: 16 } }, "Risco Cardiovascular (AHA)"), medidasOrigem && React.createElement("div", { style: { fontSize: 12, color: "#c2410c", background: "#fff4ee", borderRadius: 10, padding: "8px 12px", marginBottom: 10 } }, "Medidas preenchidas do último registro (" + medidasOrigem + "). Confira e atualize o que mudou."), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Peso (kg)", type: "number", value: aha.weight, onChange: (v) => {
    const bmi = v && aha.height ? (parseFloat(v) / (parseFloat(aha.height) / 100) ** 2).toFixed(1) : "";
    setAha((a) => ({ ...a, weight: v, bmi }));
  }, placeholder: "ex: 72" }), React.createElement(Inp, { label: "Altura (cm)", type: "number", value: aha.height, onChange: (v) => {
    const bmi = aha.weight && v ? (parseFloat(aha.weight) / (parseFloat(v) / 100) ** 2).toFixed(1) : "";
    setAha((a) => ({ ...a, height: v, bmi }));
  }, placeholder: "ex: 168" })), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "PAS (mmHg)", type: "number", value: aha.sbp, onChange: (v) => setAha((a) => ({ ...a, sbp: v })), placeholder: "ex: 120" }), React.createElement(Inp, { label: "PAD (mmHg)", type: "number", value: aha.dbp, onChange: (v) => setAha((a) => ({ ...a, dbp: v })), placeholder: "ex: 80" }), React.createElement(Inp, { label: "FC rep. (bpm)", type: "number", value: aha.hr, onChange: (v) => setAha((a) => ({ ...a, hr: v })), placeholder: "ex: 70" })), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Cintura (cm)", type: "number", value: aha.waist, onChange: (v) => setAha((a) => ({ ...a, waist: v })), placeholder: "ex: 92" }), React.createElement(Inp, { label: "Quadril (cm)", type: "number", value: aha.hip, onChange: (v) => setAha((a) => ({ ...a, hip: v })), placeholder: "ex: 100" }), React.createElement(Inp, { label: "Panturrilha (cm)", type: "number", value: aha.calf, onChange: (v) => setAha((a) => ({ ...a, calf: v })), placeholder: "ex: 33" })), React.createElement("div", { style: { marginTop: 16, display: "flex", flexDirection: "column", gap: 8 } }, aha.bmi && React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 3 } }, "📊 IMC — ", aha.bmi, " kg/m²"), React.createElement(TestResult, { cl: classifyBMI(aha.bmi) })), aha.waist && aha.hip && React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 3 } }, "📐 RCQ — Relação Cintura-Quadril"), React.createElement(TestResult, { cl: classifyRCQ(aha.waist, aha.hip, sex) })), aha.calf && React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 3 } }, "🦵 Panturrilha — Risco de Sarcopenia"), React.createElement(TestResult, { cl: classifyCalf(aha.calf, sex) }))), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 } }, [["smoker", "Tabagismo"], ["diabetes", "Diabetes"], ["hypertension", "Hipertensão"], ["hyperlipid", "Dislipidemia"], ["family", "Hist. Familiar DCV"]].map(([k, l]) => React.createElement("label", { key: k, style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, border: `1.5px solid ${aha[k] ? O : "#e2e8f0"}`, background: aha[k] ? "#fff4ee" : "#f8fafc", cursor: "pointer" } }, React.createElement("input", { type: "checkbox", checked: aha[k], onChange: (e) => setAha((a) => ({ ...a, [k]: e.target.checked })) }), React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: aha[k] ? O : "#475569" } }, l)))), React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 16 } }, React.createElement(Btn, { variant: "secondary", full: true, onClick: () => setStep((s) => s - 1) }, "Voltar"), React.createElement(Btn, { full: true, onClick: () => setStep((s) => s + 1) }, "Próximo →"))), realStep === 4 && React.createElement(Card, null, React.createElement("div", { style: { fontWeight: 700, marginBottom: 4 } }, "Atividades da Vida Diária (AVDs)"), React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 6 } }, "Avaliação de Spirduso — Cuidados pessoais básicos"), React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 16 } }, ["0 = incapaz", "1 = com ajuda", "2 = independente"].map((l, i) => React.createElement("div", { key: i, style: { flex: 1, background: "#f8fafc", borderRadius: 8, padding: "6px 4px", fontSize: 10, fontWeight: 600, color: "#64748b", textAlign: "center" } }, l))), [["eating", "🍽️ Alimentação"], ["bathing", "🚿 Banho"], ["dressing", "👕 Vestuário"], ["toileting", "🪥 Higiene pessoal"], ["transferring", "🪑 Transferência (sentar/levantar)"]].map(([k, l]) => React.createElement("div", { key: k, style: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #f1f5f9" } }, React.createElement("span", { style: { fontSize: 14, color: "#334155" } }, l), React.createElement("div", { style: { display: "flex", gap: 6 } }, [0, 1, 2].map((v) => React.createElement("button", { key: v, onClick: () => setAvd((f) => ({ ...f, [k]: v })), style: { width: 36, height: 36, borderRadius: 8, border: "1.5px solid", borderColor: avd[k] === v ? O : "#e2e8f0", background: avd[k] === v ? O : "#fff", color: avd[k] === v ? "#fff" : "#94a3b8", fontWeight: 700, cursor: "pointer", fontSize: 13 } }, v))))), React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 8 } }, React.createElement(Btn, { variant: "secondary", full: true, onClick: () => setStep((s) => s - 1) }, "Voltar"), React.createElement(Btn, { full: true, onClick: () => setStep((s) => s + 1) }, "Próximo →"))), realStep === 5 && React.createElement(Card, null, React.createElement("div", { style: { fontWeight: 700, marginBottom: 4 } }, "Atividades Instrumentais da Vida Diária (AIVDs)"), React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 6 } }, "Avaliação de Spirduso — Participação social e autonomia"), React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 16 } }, ["0 = incapaz", "1 = com ajuda", "2 = independente"].map((l, i) => React.createElement("div", { key: i, style: { flex: 1, background: "#f8fafc", borderRadius: 8, padding: "6px 4px", fontSize: 10, fontWeight: 600, color: "#64748b", textAlign: "center" } }, l))), [["shopping", "🛒 Fazer compras"], ["finance", "💰 Gerenciar finanças"], ["transport", "🚌 Usar transporte"], ["medication", "💊 Administrar medicamentos"], ["housework", "🏠 Tarefas domésticas"], ["telephone", "📱 Usar telefone/celular"]].map(([k, l]) => React.createElement("div", { key: k, style: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #f1f5f9" } }, React.createElement("span", { style: { fontSize: 14, color: "#334155" } }, l), React.createElement("div", { style: { display: "flex", gap: 6 } }, [0, 1, 2].map((v) => React.createElement("button", { key: v, onClick: () => setAivd((f) => ({ ...f, [k]: v })), style: { width: 36, height: 36, borderRadius: 8, border: "1.5px solid", borderColor: aivd[k] === v ? O : "#e2e8f0", background: aivd[k] === v ? O : "#fff", color: aivd[k] === v ? "#fff" : "#94a3b8", fontWeight: 700, cursor: "pointer", fontSize: 13 } }, v))))), React.createElement("div", { style: { marginTop: 4, marginBottom: 14 } }, React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 10 } }, "Fatores adicionais:"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 } }, [["falls", "Quedas (12m)"], ["balance", "Lim. equilíbrio"], ["physlim", "Lim. física"]].map(([k, l]) => React.createElement("label", { key: k, style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 6px", borderRadius: 9, border: `1.5px solid ${funcRisk[k] ? "#ea580c" : "#e2e8f0"}`, background: funcRisk[k] ? "#ffedd5" : "#f8fafc", cursor: "pointer", textAlign: "center" } }, React.createElement("input", { type: "checkbox", checked: !!funcRisk[k], onChange: (e) => setFuncRisk((f) => ({ ...f, [k]: e.target.checked })) }), React.createElement("span", { style: { fontSize: 11, fontWeight: 600, color: funcRisk[k] ? "#ea580c" : "#475569" } }, l)))), React.createElement(Inp, { label: "Saúde autorreferida", value: funcRisk.selfhealth, onChange: (v) => setFuncRisk((f) => ({ ...f, selfhealth: parseInt(v) || 0 })), opts: [{ v: 0, l: "0 — Muito ruim" }, { v: 1, l: "1 — Regular" }, { v: 2, l: "2 — Boa/Excelente" }] })), React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 8 } }, React.createElement(Btn, { variant: "secondary", full: true, onClick: () => setStep((s) => s - 1) }, "Voltar"), step >= STEP_MAP.length - 1 ? React.createElement(Btn, { full: true, icon: "check", onClick: finish }, "Finalizar Avaliação ✓") : React.createElement(Btn, { full: true, onClick: () => setStep((s) => s + 1) }, "Próximo →"))), realStep === 6 && React.createElement(Card, null, React.createElement("div", { style: { fontWeight: 700, marginBottom: 4 } }, "Testes Físicos"), React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 16 } }, "Selecione os testes realizados. O resultado aparece automaticamente."), phys.selected?.sppbBalance !== false && React.createElement("div", { style: { marginBottom: 14, border: "1.5px solid #6366f133", borderRadius: 12, padding: 14 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 } }, React.createElement("input", { type: "checkbox", checked: phys.selected?.sppbBalance !== false, onChange: (e) => setPhys((p) => ({ ...p, selected: { ...p.selected, sppbBalance: e.target.checked } })), style: { width: 18, height: 18, accentColor: "#FF5603", cursor: "pointer" } }), React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a" } }, "⚖️ SPPB — Teste de Equilíbrio"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, "Cada posição mantida por 10 segundos"))), React.createElement("div", { style: { marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 600, fontSize: 13, color: "#475569", marginBottom: 6 } }, "1. Side-by-side (pés juntos)"), React.createElement("div", { style: { display: "flex", gap: 8 } }, [{ v: "1", l: "≥10s ✓ (0 pt base)  " }, { v: "0", l: "<10s ✗ (0 pt)" }].map((o) => React.createElement("button", { key: o.v, onClick: () => setPhys((p) => ({ ...p, sppbSide: o.v })), style: { flex: 1, padding: "9px 8px", borderRadius: 9, border: "1.5px solid", borderColor: phys.sppbSide === o.v ? "#6366f1" : "#e2e8f0", background: phys.sppbSide === o.v ? "#eef2ff" : "#f8fafc", fontWeight: 700, fontSize: 12, cursor: "pointer", color: phys.sppbSide === o.v ? "#6366f1" : "#94a3b8" } }, o.l)))), phys.sppbSide === "1" && React.createElement("div", { style: { marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 600, fontSize: 13, color: "#475569", marginBottom: 6 } }, "2. Semi-tandem (calcanhar ao lado do hálux)"), React.createElement("div", { style: { display: "flex", gap: 8 } }, [{ v: "1", l: "≥10s ✓ (1 pt)" }, { v: "0", l: "<10s ✗ (0 pt — parar)" }].map((o) => React.createElement("button", { key: o.v, onClick: () => setPhys((p) => ({ ...p, sppbSemi: o.v })), style: { flex: 1, padding: "9px 8px", borderRadius: 9, border: "1.5px solid", borderColor: phys.sppbSemi === o.v ? "#6366f1" : "#e2e8f0", background: phys.sppbSemi === o.v ? "#eef2ff" : "#f8fafc", fontWeight: 700, fontSize: 12, cursor: "pointer", color: phys.sppbSemi === o.v ? "#6366f1" : "#94a3b8" } }, o.l)))), phys.sppbSide === "1" && phys.sppbSemi === "1" && React.createElement("div", { style: { marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 600, fontSize: 13, color: "#475569", marginBottom: 6 } }, "3. Tandem (calcanhar na ponta do pé)"), React.createElement("div", { style: { display: "flex", gap: 8 } }, [{ v: "2", l: "≥10s ✓ (2 pts)" }, { v: "1", l: "3–9.99s (1 pt)" }, { v: "0", l: "<3s ✗ (0 pt)" }].map((o) => React.createElement("button", { key: o.v, onClick: () => setPhys((p) => ({ ...p, sppbTandem: o.v })), style: { flex: 1, padding: "9px 8px", borderRadius: 9, border: "1.5px solid", borderColor: phys.sppbTandem === o.v ? "#6366f1" : "#e2e8f0", background: phys.sppbTandem === o.v ? "#eef2ff" : "#f8fafc", fontWeight: 700, fontSize: 12, cursor: "pointer", color: phys.sppbTandem === o.v ? "#6366f1" : "#94a3b8" } }, o.l)))), phys.sppbSide && React.createElement("div", { style: { marginTop: 8 } }, (() => {
    const sc = (parseInt(phys.sppbSide) || 0) === 0 ? 0 : (parseInt(phys.sppbSemi) || 0) + (parseInt(phys.sppbTandem) || 0);
    const cl = classifySPPBBalance(phys.sppbSide, phys.sppbSemi, phys.sppbTandem);
    return cl ? React.createElement("div", { style: { background: cl.bg, border: "1.5px solid " + cl.color + "33", borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 } }, React.createElement("span", { style: { fontWeight: 700, fontSize: 13, color: cl.color } }, sc, "/3 pts"), React.createElement("span", { style: { fontWeight: 800, fontSize: 13, color: cl.color } }, cl.label)), React.createElement("div", { style: { fontSize: 12, color: "#475569", lineHeight: 1.5 } }, cl.desc)) : null;
  })()), React.createElement("textarea", { value: phys.obs_sppbBalance || "", onChange: (e) => setPhys((p) => ({ ...p, obs_sppbBalance: e.target.value })), placeholder: "Observações (dificuldade, apoio necessário, medo de cair...)", style: { width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 12, color: "#334155", resize: "none", minHeight: 48, fontFamily: "inherit", boxSizing: "border-box", marginTop: 8 } })), phys.selected?.sppbChair !== false && React.createElement("div", { style: { marginBottom: 14, border: "1.5px solid #FF560333", borderRadius: 12, padding: 14 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 } }, React.createElement("input", { type: "checkbox", checked: phys.selected?.sppbChair !== false, onChange: (e) => setPhys((p) => ({ ...p, selected: { ...p.selected, sppbChair: e.target.checked } })), style: { width: 18, height: 18, accentColor: "#FF5603", cursor: "pointer" } }), React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a" } }, "🪑 SPPB — Chair Stand Test"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, "5 repetições — braços cruzados no peito — cronometrado"))), React.createElement("div", { style: { background: "#f8fafc", borderRadius: 9, padding: "10px 12px", marginBottom: 10, fontSize: 12, color: "#64748b" } }, React.createElement("strong", null, "Instrução:"), " Peça ao aluno para cruzar os braços no peito e levantar da cadeira 5 vezes o mais rápido possível sem usar os braços. Cronometrar o tempo total."), React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, border: "1.5px solid " + (phys.sppbChairUnable ? "#dc2626" : "#e2e8f0"), background: phys.sppbChairUnable ? "#fee2e2" : "#f8fafc", cursor: "pointer", marginBottom: 8 } }, React.createElement("input", { type: "checkbox", checked: !!phys.sppbChairUnable, onChange: (e) => setPhys((p) => ({ ...p, sppbChairUnable: e.target.checked, sppbChair: "" })) }), React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: phys.sppbChairUnable ? "#dc2626" : "#475569" } }, "Incapaz de realizar (0 pt)")), !phys.sppbChairUnable && React.createElement(Inp, { label: "Tempo para 5 repetições (segundos)", type: "number", step: "0.01", value: phys.sppbChair, onChange: (v) => setPhys((p) => ({ ...p, sppbChair: v })), placeholder: "ex: 12.50" }), (phys.sppbChair || phys.sppbChairUnable) && React.createElement(TestResult, { cl: classifySPPBChairStand(phys.sppbChairUnable ? "unable" : phys.sppbChair) }), React.createElement("textarea", { value: phys.obs_sppbChair || "", onChange: (e) => setPhys((p) => ({ ...p, obs_sppbChair: e.target.value })), placeholder: "Observações (usou braços, dor, instabilidade...)", style: { width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 12, color: "#334155", resize: "none", minHeight: 48, fontFamily: "inherit", boxSizing: "border-box", marginTop: 8 } })), [
    { key: "grip", label: "Força de Preensão Manual", unit: "kgf", placeholder: "ex: 24", note: "Dinamômetro — mão dominante", clFn: (v) => classifyHandGrip(v, sex) },
    { key: "tug", label: "TUG — Timed Up and Go", unit: "segundos", placeholder: "ex: 12", note: "Levantar, caminhar 3m, voltar e sentar", clFn: classifyTUG },
    { key: "sitreach", label: "Sentar e Alcançar", unit: "cm", placeholder: "ex: -5 ou 10", note: "Negativos = não alcança o pé", clFn: classifySitReach, allowNeg: true },
    { key: "march", label: "Marcha Estacionária 2min", unit: "passos", placeholder: "ex: 80", note: "Elevações do joelho direito em 2 minutos", clFn: (v) => classifyMarch(v, sex) }
  ].map((t) => {
    const isSelected = phys.selected?.[t.key] !== false && (phys.selected?.[t.key] === true || phys.selected === void 0);
    const enabled = phys.selected ? !!phys.selected[t.key] : true;
    return React.createElement("div", { key: t.key, style: { marginBottom: 14, border: `1.5px solid ${enabled ? "#FF560333" : "#e2e8f0"}`, borderRadius: 12, padding: 14, background: enabled ? "#fff" : "#f8fafc" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: enabled ? 12 : 0 } }, React.createElement(
      "input",
      {
        type: "checkbox",
        checked: enabled,
        onChange: (e) => setPhys((p) => ({ ...p, selected: { ...p.selected || { chair: true, grip: true, balance: true, tug: true, sitreach: true, march: true }, [t.key]: e.target.checked } })),
        style: { width: 18, height: 18, accentColor: "#FF5603", cursor: "pointer" }
      }
    ), React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: enabled ? "#0f172a" : "#94a3b8" } }, t.label), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, t.note))), enabled && React.createElement(React.Fragment, null, React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr", gap: 8 } }, React.createElement(Inp, { label: t.unit, type: t.allowNeg ? "text" : "number", value: phys[t.key] || "", onChange: (v) => setPhys((p) => ({ ...p, [t.key]: v })), placeholder: t.placeholder })), phys[t.key] && React.createElement(TestResult, { cl: t.clFn(phys[t.key]) }), React.createElement("div", { style: { marginTop: 8 } }, React.createElement(
      "textarea",
      {
        value: phys["obs_" + t.key] || "",
        onChange: (e) => setPhys((p) => ({ ...p, ["obs_" + t.key]: e.target.value })),
        placeholder: "Observações (ex: aluno não conseguiu realizar, dor, adaptação usada...)",
        style: { width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 12, color: "#334155", resize: "none", minHeight: 56, fontFamily: "inherit", boxSizing: "border-box" }
      }
    ))), !enabled && React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 6, fontStyle: "italic" } }, "Teste não realizado"));
  }), React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 8 } }, React.createElement(Btn, { variant: "secondary", full: true, onClick: () => setStep((s) => s - 1) }, "Voltar"), React.createElement(Btn, { full: true, onClick: () => setStep((s) => s + 1) }, "Próximo →"))), realStep === 7 && React.createElement(Card, null, React.createElement("div", { style: { fontWeight: 700, marginBottom: 4 } }, "Avaliação Cardiorrespiratória"), React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 16 } }, "Etapa opcional — baseada em teste ergométrico ou predição clínica"), React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 18 } }, [{ v: "ergo", label: "🟢 Teste Ergométrico", sub: "Dados reais do teste" }, { v: "pred", label: "🟡 Predição Clínica", sub: "Sem teste disponível" }, { v: "skip", label: "⏭️ Pular", sub: "Adicionar depois" }].map((m) => React.createElement("button", { key: m.v, onClick: () => setCardioMode(m.v), style: { flex: 1, padding: "10px 6px", borderRadius: 11, border: `2px solid ${cardioMode === m.v ? "#FF5603" : "#e2e8f0"}`, background: cardioMode === m.v ? "#fff4ee" : "#f8fafc", cursor: "pointer", textAlign: "left" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: cardioMode === m.v ? "#FF5603" : "#0f172a" } }, m.label), React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", marginTop: 2 } }, m.sub)))), cardioMode === "ergo" && React.createElement("div", null, React.createElement("div", { style: { fontWeight: 600, fontSize: 12, color: "#FF5603", marginBottom: 8 } }, "Dados do Teste"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 } }, React.createElement(Inp, { label: "FC repouso (bpm)", type: "number", value: cardioAssessment.ergo.fcRest, onChange: (v) => setCardioAssessment((c) => ({ ...c, ergo: { ...c.ergo, fcRest: v } })), placeholder: "72" }), React.createElement(Inp, { label: "FC máxima atingida", type: "number", value: cardioAssessment.ergo.fcMax, onChange: (v) => setCardioAssessment((c) => ({ ...c, ergo: { ...c.ergo, fcMax: v } })), placeholder: "148" }), React.createElement(Inp, { label: "METs atingidos", type: "number", value: cardioAssessment.ergo.mets, onChange: (v) => setCardioAssessment((c) => ({ ...c, ergo: { ...c.ergo, mets: v } })), step: "0.5", placeholder: "7.5" })), React.createElement("div", { style: { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 14px", marginBottom: 10 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#16a34a", marginBottom: 8 } }, "🫁 VO₂máx"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, React.createElement(Inp, { label: "VO₂máx medido (ml/kg/min)", type: "number", value: cardioAssessment.ergo.vo2max, onChange: (v) => setCardioAssessment((c) => ({ ...c, ergo: { ...c.ergo, vo2max: v, vo2measured: true } })), placeholder: "ex: 32.5", step: "0.1" }), React.createElement("div", { style: { paddingTop: 18 } }, cardioAssessment.ergo.mets && !cardioAssessment.ergo.vo2max && React.createElement("div", { style: { background: "#f8fafc", borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700 } }, "VO₂ ESTIMADO (METs×3.5)"), React.createElement("div", { style: { fontSize: 20, fontWeight: 900, color: "#16a34a" } }, (parseFloat(cardioAssessment.ergo.mets) * 3.5).toFixed(1)), React.createElement("div", { style: { fontSize: 10, color: "#64748b" } }, "ml/kg/min")))), (cardioAssessment.ergo.vo2max || cardioAssessment.ergo.mets) && (() => {
    const vo2val = cardioAssessment.ergo.vo2max || (parseFloat(cardioAssessment.ergo.mets) * 3.5).toFixed(1);
    const age2 = calcAge(student?.dob);
    const cl = classifyVO2(vo2val, age2, student?.sex);
    return cl ? React.createElement(TestResult, { cl }) : null;
  })()), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, React.createElement(Inp, { label: "PAS repouso", type: "number", value: cardioAssessment.ergo.pasSit, onChange: (v) => setCardioAssessment((c) => ({ ...c, ergo: { ...c.ergo, pasSit: v } })), placeholder: "120" }), React.createElement(Inp, { label: "PAD repouso", type: "number", value: cardioAssessment.ergo.padSit, onChange: (v) => setCardioAssessment((c) => ({ ...c, ergo: { ...c.ergo, padSit: v } })), placeholder: "80" }), React.createElement(Inp, { label: "PAS pico esforço", type: "number", value: cardioAssessment.ergo.pasPeak, onChange: (v) => setCardioAssessment((c) => ({ ...c, ergo: { ...c.ergo, pasPeak: v } })), placeholder: "180" }), React.createElement(Inp, { label: "PAD pico esforço", type: "number", value: cardioAssessment.ergo.padPeak, onChange: (v) => setCardioAssessment((c) => ({ ...c, ergo: { ...c.ergo, padPeak: v } })), placeholder: "90" })), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, React.createElement(Inp, { label: "FC início sintomas", type: "number", value: cardioAssessment.ergo.fcSymptom, onChange: (v) => setCardioAssessment((c) => ({ ...c, ergo: { ...c.ergo, fcSymptom: v } })), placeholder: "130" }), React.createElement(Inp, { label: "Tipo sintoma", value: cardioAssessment.ergo.symptomType, onChange: (v) => setCardioAssessment((c) => ({ ...c, ergo: { ...c.ergo, symptomType: v } })), opts: [{ v: "", l: "Nenhum" }, { v: "chest", l: "Dor torácica" }, { v: "dyspnea", l: "Dispneia" }, { v: "fatigue", l: "Fadiga" }, { v: "dizziness", l: "Tontura" }, { v: "palp", l: "Palpitação" }, { v: "other", l: "Outro" }] }), React.createElement(Inp, { label: "FC limiar isquêmico", type: "number", value: cardioAssessment.ergo.fcIschemic, onChange: (v) => setCardioAssessment((c) => ({ ...c, ergo: { ...c.ergo, fcIschemic: v } })), placeholder: "140" }), React.createElement(Inp, { label: "Obs ECG", value: cardioAssessment.ergo.ecgObs, onChange: (v) => setCardioAssessment((c) => ({ ...c, ergo: { ...c.ergo, ecgObs: v } })), placeholder: "Alterações..." })), React.createElement("div", { style: { fontWeight: 600, fontSize: 12, color: "#FF5603", marginBottom: 8, marginTop: 4 } }, "Arritmias"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 } }, [{ v: "none", l: "Sem arritmia" }, { v: "ectopic", l: "Extrassístoles" }, { v: "tvns", l: "TVNS" }, { v: "af", l: "Fibrilação atrial" }, { v: "svt", l: "Arr. supraventricular" }, { v: "other", l: "Outra" }].map((o) => React.createElement("label", { key: o.v, style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 9, border: `1.5px solid ${cardioAssessment.ergo.arrythmias?.includes(o.v) ? "#dc2626" : "#e2e8f0"}`, background: cardioAssessment.ergo.arrythmias?.includes(o.v) ? "#fee2e2" : "#f8fafc", cursor: "pointer" } }, React.createElement("input", { type: "checkbox", checked: cardioAssessment.ergo.arrythmias?.includes(o.v), onChange: () => setCardioAssessment((c) => ({ ...c, ergo: { ...c.ergo, arrythmias: c.ergo.arrythmias.includes(o.v) ? c.ergo.arrythmias.filter((x) => x !== o.v) : [...c.ergo.arrythmias.filter((x) => x !== "none"), o.v] } })) }), React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: cardioAssessment.ergo.arrythmias?.includes(o.v) ? "#dc2626" : "#475569" } }, o.l)))), React.createElement("div", { style: { fontWeight: 600, fontSize: 12, color: "#FF5603", marginBottom: 8 } }, "Medicações"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 } }, [{ v: "beta", l: "Beta-bloqueador" }, { v: "antihyp", l: "Anti-hipertensivo" }, { v: "vasodil", l: "Vasodilatador" }, { v: "antiarr", l: "Antiarrítmico" }, { v: "antidiab", l: "Antidiabético" }, { v: "insulin", l: "Insulina" }].map((o) => React.createElement("label", { key: o.v, style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 9, border: `1.5px solid ${cardioAssessment.ergo.medications?.includes(o.v) ? "#6366f1" : "#e2e8f0"}`, background: cardioAssessment.ergo.medications?.includes(o.v) ? "#eef2ff" : "#f8fafc", cursor: "pointer" } }, React.createElement("input", { type: "checkbox", checked: cardioAssessment.ergo.medications?.includes(o.v), onChange: () => setCardioAssessment((c) => ({ ...c, ergo: { ...c.ergo, medications: c.ergo.medications.includes(o.v) ? c.ergo.medications.filter((x) => x !== o.v) : [...c.ergo.medications, o.v] } })) }), React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: cardioAssessment.ergo.medications?.includes(o.v) ? "#6366f1" : "#475569" } }, o.l)))), cardioAssessment.ergo.fcMax && React.createElement("div", { style: { background: "#f8fafc", borderRadius: 12, padding: 14, marginTop: 12 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 10 } }, "⚡ Cálculos Automáticos"), (() => {
    const fcMax = parseFloat(cardioAssessment.ergo.fcMax);
    const fcRest = parseFloat(cardioAssessment.ergo.fcRest);
    const fcIsch = parseFloat(cardioAssessment.ergo.fcIschemic);
    const fcRes = fcRest ? fcMax - fcRest : null;
    const dp = cardioAssessment.ergo.pasPeak ? Math.round(fcMax * parseFloat(cardioAssessment.ergo.pasPeak)) : null;
    const hasBeta = cardioAssessment.ergo.medications?.includes("beta");
    const vo2 = cardioAssessment.ergo.vo2max || (cardioAssessment.ergo.mets ? (parseFloat(cardioAssessment.ergo.mets) * 3.5).toFixed(1) : null);
    const vo2cl = vo2 ? classifyVO2(vo2, calcAge(student?.dob), student?.sex) : null;
    return React.createElement("div", null, vo2 && React.createElement("div", { style: { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px", marginBottom: 10 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#16a34a" } }, "🫁 VO₂máx — ", cardioAssessment.ergo.vo2measured ? "Medido" : "Estimado (METs×3.5)"), React.createElement("div", { style: { fontWeight: 900, fontSize: 20, color: "#16a34a" } }, parseFloat(vo2).toFixed(1), " ml/kg/min")), vo2cl && React.createElement("div", { style: { background: vo2cl.bg, borderRadius: 8, padding: "8px 12px", marginBottom: 6 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: vo2cl.color } }, vo2cl.label), React.createElement("div", { style: { fontSize: 11, color: "#475569", lineHeight: 1.5 } }, vo2cl.desc)), React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 6 } }, "Zonas de VO₂R: ", vo2 ? ["40%→" + (parseFloat(vo2) * 0.4).toFixed(1), "50%→" + (parseFloat(vo2) * 0.5).toFixed(1), "60%→" + (parseFloat(vo2) * 0.6).toFixed(1), "70%→" + (parseFloat(vo2) * 0.7).toFixed(1), "80%→" + (parseFloat(vo2) * 0.8).toFixed(1)].join(" · ") : "", " ml/kg/min")), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 } }, fcRes && React.createElement("div", { style: { textAlign: "center", background: "#fff", borderRadius: 9, padding: "10px 6px" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700 } }, "FC RESERVA"), React.createElement("div", { style: { fontSize: 20, fontWeight: 900, color: "#FF5603" } }, fcRes), React.createElement("div", { style: { fontSize: 10, color: "#64748b" } }, "bpm")), dp && React.createElement("div", { style: { textAlign: "center", background: "#fff", borderRadius: 9, padding: "10px 6px" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700 } }, "DUPLO PRODUTO"), React.createElement("div", { style: { fontSize: 16, fontWeight: 900, color: dp >= 28e3 ? "#dc2626" : dp >= 2e4 ? "#d97706" : "#16a34a" } }, dp.toLocaleString("pt-BR"))), fcIsch && React.createElement("div", { style: { textAlign: "center", background: "#fef9c3", borderRadius: 9, padding: "10px 6px" } }, React.createElement("div", { style: { fontSize: 10, color: "#d97706", fontWeight: 700 } }, "ZONA SEGURA"), React.createElement("div", { style: { fontSize: 20, fontWeight: 900, color: "#d97706" } }, "<", fcIsch - 10), React.createElement("div", { style: { fontSize: 10, color: "#d97706" } }, "bpm"))), hasBeta && React.createElement("div", { style: { background: "#eef2ff", borderRadius: 9, padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "#6366f1", marginBottom: 8 } }, "💊 Beta-bloqueador: priorizar PSE/Borg + sintomas"), React.createElement("div", { style: { overflowX: "auto" } }, React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 11 } }, React.createElement("thead", null, React.createElement("tr", { style: { background: "#e2e8f0" } }, ["Intensidade", fcRest ? "FC Karvonen" : null, "%FCmáx", "PSE (0–10)"].filter(Boolean).map((h) => React.createElement("th", { key: h, style: { padding: "6px 8px", textAlign: "left", fontWeight: 700, color: "#475569" } }, h)))), React.createElement("tbody", null, [0.4, 0.5, 0.6, 0.7, 0.8].map((p) => {
      const karv = fcRest ? Math.round((fcMax - fcRest) * p + fcRest) : null;
      const pctFc = Math.round(fcMax * p);
      const safe = fcIsch ? (karv || pctFc) < fcIsch - 10 : true;
      const borg = p <= 0.5 ? "2–3" : p <= 0.65 ? "4–5" : p <= 0.75 ? "5–6" : "6–7";
      return React.createElement("tr", { key: p, style: { borderBottom: "1px solid #f1f5f9", background: safe ? "#fff" : "#fff5f5" } }, React.createElement("td", { style: { padding: "6px 8px", fontWeight: 700 } }, Math.round(p * 100), "%"), fcRest && React.createElement("td", { style: { padding: "6px 8px", fontWeight: 800, color: safe ? "#16a34a" : "#dc2626" } }, karv, " bpm", !safe ? " ⚠️" : ""), React.createElement("td", { style: { padding: "6px 8px", color: "#475569" } }, pctFc, " bpm"), React.createElement("td", { style: { padding: "6px 8px", color: "#64748b" } }, borg));
    })))));
  })())), cardioMode === "pred" && React.createElement("div", null, React.createElement("div", { style: { fontWeight: 600, fontSize: 12, color: "#FF5603", marginBottom: 8 } }, "Dados para Predição"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 } }, React.createElement(Inp, { label: "Idade", type: "number", value: cardioAssessment.pred.age || calcAge(student?.dob) || "", onChange: (v) => setCardioAssessment((c) => ({ ...c, pred: { ...c.pred, age: v } })), placeholder: String(calcAge(student?.dob) || "") }), React.createElement(Inp, { label: "Sexo", value: cardioAssessment.pred.sex || sex, onChange: (v) => setCardioAssessment((c) => ({ ...c, pred: { ...c.pred, sex: v } })), opts: [{ v: "", l: "..." }, { v: "M", l: "Masculino" }, { v: "F", l: "Feminino" }] }), React.createElement(Inp, { label: "FC repouso (bpm)", type: "number", value: cardioAssessment.pred.fcRest, onChange: (v) => setCardioAssessment((c) => ({ ...c, pred: { ...c.pred, fcRest: v } })), placeholder: "72" })), React.createElement("div", { style: { fontWeight: 600, fontSize: 12, color: "#FF5603", marginBottom: 8, marginTop: 4 } }, "Fórmula FCmáx"), React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 12 } }, [{ v: "tanaka", l: "Tanaka: 208 − 0.7×idade" }, { v: "traditional", l: "Tradicional: 220 − idade" }].map((f) => React.createElement("button", { key: f.v, onClick: () => setCardioAssessment((c) => ({ ...c, pred: { ...c.pred, formula: f.v } })), style: { flex: 1, padding: "9px 8px", borderRadius: 9, border: `1.5px solid ${cardioAssessment.pred.formula === f.v ? "#FF5603" : "#e2e8f0"}`, background: cardioAssessment.pred.formula === f.v ? "#fff4ee" : "#f8fafc", fontWeight: 700, fontSize: 11, cursor: "pointer", color: cardioAssessment.pred.formula === f.v ? "#FF5603" : "#64748b" } }, f.l))), React.createElement("div", { style: { fontWeight: 600, fontSize: 12, color: "#FF5603", marginBottom: 8 } }, "Comorbidades"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 } }, [["cardioDisease", "Cardiopatia conhecida", "#dc2626"], ["symptoms", "Sintomas atuais", "#dc2626"], ["hypertension", "Hipertensão", "#ea580c"], ["diabetes", "Diabetes", "#d97706"], ["obesity", "Obesidade", "#d97706"], ["sedentary", "Sedentário", "#64748b"]].map(([k, l, c2]) => React.createElement("label", { key: k, style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 9, border: `1.5px solid ${cardioAssessment.pred[k] ? c2 : "#e2e8f0"}`, background: cardioAssessment.pred[k] ? c2 + "18" : "#f8fafc", cursor: "pointer" } }, React.createElement("input", { type: "checkbox", checked: !!cardioAssessment.pred[k], onChange: (e) => setCardioAssessment((c) => ({ ...c, pred: { ...c.pred, [k]: e.target.checked } })) }), React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: cardioAssessment.pred[k] ? c2 : "#475569" } }, l)))), (cardioAssessment.pred.age || calcAge(student?.dob)) && (() => {
    const age2 = parseFloat(cardioAssessment.pred.age || calcAge(student?.dob));
    const fcMax2 = cardioAssessment.pred.formula === "tanaka" ? Math.round(208 - 0.7 * age2) : 220 - age2;
    const fcRest2 = parseFloat(cardioAssessment.pred.fcRest);
    const risk = riskStratify(cardioAssessment.pred);
    const hasBeta2 = cardioAssessment.pred.medications?.includes("beta");
    return React.createElement("div", { style: { background: "#f8fafc", borderRadius: 12, padding: 14, marginTop: 4 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 10 } }, "⚡ Predição Calculada"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 } }, React.createElement("div", { style: { textAlign: "center", background: risk.bg, borderRadius: 9, padding: "10px 6px", border: `1px solid ${risk.color}33` } }, React.createElement("div", { style: { fontSize: 10, color: risk.color, fontWeight: 700 } }, "ESTRATIFICAÇÃO"), React.createElement("div", { style: { fontSize: 14, fontWeight: 900, color: risk.color } }, risk.label), React.createElement("div", { style: { fontSize: 10, color: risk.color } }, risk.fcr)), React.createElement("div", { style: { textAlign: "center", background: "#fff", borderRadius: 9, padding: "10px 6px" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700 } }, "FCmáx ESTIMADA"), React.createElement("div", { style: { fontSize: 20, fontWeight: 900, color: "#FF5603" } }, fcMax2), React.createElement("div", { style: { fontSize: 10, color: "#64748b" } }, "bpm"))), hasBeta2 && React.createElement("div", { style: { background: "#eef2ff", borderRadius: 9, padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "#6366f1", marginBottom: 8 } }, "💊 Beta-bloqueador: FC pode estar atenuada. Usar PSE/Borg."), risk.alert && React.createElement("div", { style: { background: "#fee2e2", borderRadius: 9, padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "#dc2626" } }, "⚠️ ", risk.alert));
  })()), cardioMode === "skip" && React.createElement("div", { style: { textAlign: "center", padding: "24px 0", color: "#94a3b8" } }, React.createElement("div", { style: { fontSize: 28, marginBottom: 8 } }, "⏭️"), React.createElement("div", { style: { fontSize: 13 } }, "Avaliação cardiorrespiratória não realizada. Pode ser adicionada depois no Monitoramento.")), React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 16 } }, React.createElement(Btn, { variant: "secondary", full: true, onClick: () => setStep((s) => s - 1) }, "Voltar"), step >= STEP_MAP.length - 1 ? React.createElement(Btn, { full: true, icon: "check", onClick: finish }, "Finalizar Avaliação ✓") : React.createElement(Btn, { full: true, onClick: () => setStep((s) => s + 1) }, "Próximo →"))), realStep === 8 && React.createElement(Card, null, React.createElement("div", { style: { fontWeight: 700, marginBottom: 4 } }, "🧠 Avaliação Cognitiva"), React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 16 } }, "Bateria Longevus — ~15 minutos · Aplicação verbal, sem equipamento"), React.createElement("div", { style: { background: "#eef2ff", border: "1.5px solid #c7d2fe", borderRadius: 12, padding: 14, marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#6366f1", marginBottom: 4 } }, "1. MMSE — Triagem Cognitiva Geral"), React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer" } }, React.createElement("input", { type: "checkbox", checked: cognitiveData.selected?.mmse !== false, onChange: (e) => setCognitiveData((d) => ({ ...d, selected: { ...d.selected, mmse: e.target.checked } })), style: { width: 16, height: 16, accentColor: "#6366f1", cursor: "pointer" } }), React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: "#475569" } }, "Aplicar este teste")), cognitiveData.selected?.mmse !== false && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginBottom: 12 } }, "Faça cada pergunta verbalmente. Marque acerto (1) ou erro (0)."), [
    { k: "q1", l: "Orientação temporal", desc: "Qual é o ano? Mês? Dia da semana? Dia do mês? Período do dia? (1 ponto cada = máx. 5)", max: 5 },
    { k: "q2", l: "Orientação espacial", desc: "Qual país? Estado? Cidade? Local? Andar/ambiente? (1 ponto cada = máx. 5)", max: 5 },
    { k: "q3", l: "Registro de memória", desc: "Fale 3 palavras (ex: maçã, mesa, bola). Peça para repetir. (1 ponto cada = máx. 3)", max: 3 },
    { k: "q4", l: "Atenção e cálculo", desc: "Subtraia 7 de 100 sucessivamente 5 vezes (100, 93, 86, 79, 72, 65). (1 ponto cada = máx. 5)", max: 5 },
    { k: "q5", l: "Evocação", desc: "Peça para lembrar as 3 palavras registradas. (1 ponto cada = máx. 3)", max: 3 },
    { k: "q6", l: "Nomeação", desc: "Mostre um relógio e uma caneta. Peça para nomear. (máx. 2)", max: 2 },
    { k: "q7", l: "Repetição", desc: "Repita a frase: 'Nem aqui, nem ali, nem lá.' (máx. 1)", max: 1 },
    { k: "q8", l: "Comando", desc: "Siga 3 etapas: pegue o papel com a mão direita, dobre ao meio, coloque no chão. (máx. 3)", max: 3 },
    { k: "q9", l: "Leitura e escrita", desc: "Escreva 'FECHE OS OLHOS' — peça para ler e obedecer. Peça para escrever uma frase. (máx. 2)", max: 2 },
    { k: "q10", l: "Cópia", desc: "Peça para copiar dois pentágonos entrelaçados. (máx. 1)", max: 1 }
  ].map((q) => {
    const val = parseInt(cognitiveData.mmse[q.k]) || 0;
    const total = Object.keys(cognitiveData.mmse).filter((k) => k !== "total").reduce((s, k) => s + (parseInt(cognitiveData.mmse[k]) || 0), 0);
    return React.createElement("div", { key: q.k, style: { marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #e2e8f0" } }, React.createElement("div", { style: { fontWeight: 600, fontSize: 13, color: "#0f172a", marginBottom: 3 } }, q.l, " ", React.createElement("span", { style: { color: "#94a3b8", fontWeight: 400 } }, "(máx. ", q.max, ")")), React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginBottom: 8 } }, q.desc), React.createElement("div", { style: { display: "flex", gap: 6 } }, Array.from({ length: q.max + 1 }, (_, i) => React.createElement("button", { key: i, onClick: () => {
      const newMmse = { ...cognitiveData.mmse, [q.k]: String(i) };
      const t = Object.keys(newMmse).filter((k) => k !== "total").reduce((s, k) => s + (parseInt(newMmse[k]) || 0), 0);
      setCognitiveData((d) => ({ ...d, mmse: { ...newMmse, total: String(t) } }));
    }, style: { width: 36, height: 36, borderRadius: 8, border: "1.5px solid", borderColor: cognitiveData.mmse[q.k] === String(i) ? "#6366f1" : "#e2e8f0", background: cognitiveData.mmse[q.k] === String(i) ? "#6366f1" : "#fff", color: cognitiveData.mmse[q.k] === String(i) ? "#fff" : "#94a3b8", fontWeight: 700, cursor: "pointer", fontSize: 13 } }, i))));
  }), React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 } }, React.createElement("span", { style: { fontWeight: 700, fontSize: 14, color: "#6366f1" } }, "Total MMSE: ", cognitiveData.mmse.total || 0, "/30"), cognitiveData.mmse.total && React.createElement(TestResult, { cl: classifyMMSE(cognitiveData.mmse.total) })))), React.createElement("div", { style: { background: "#fff4ee", border: "1.5px solid #FF560344", borderRadius: 12, padding: 14, marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#FF5603", marginBottom: 4 } }, "2. Dual Task Cost — Cognitivo-Motor"), React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer" } }, React.createElement("input", { type: "checkbox", checked: cognitiveData.selected?.dualTask !== false, onChange: (e) => setCognitiveData((d) => ({ ...d, selected: { ...d.selected, dualTask: e.target.checked } })), style: { width: 16, height: 16, accentColor: "#FF5603", cursor: "pointer" } }), React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: "#475569" } }, "Aplicar este teste")), cognitiveData.selected?.dualTask !== false && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginBottom: 12 } }, React.createElement("strong", null, "Passo 1:"), " Marcha estacionária 20 seg sozinho → conte os passos e registre.", React.createElement("br", null), React.createElement("strong", null, "Passo 2:"), " Marcha estacionária 20 seg contando de 3 em 3 → conte os passos e registre."), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 } }, React.createElement(Inp, { label: "Passos — Tarefa Simples", type: "number", value: cognitiveData.dualTask.single, onChange: (v) => setCognitiveData((d) => ({ ...d, dualTask: { ...d.dualTask, single: v } })), placeholder: "ex: 42" }), React.createElement(Inp, { label: "Passos — Dual Task", type: "number", value: cognitiveData.dualTask.dual, onChange: (v) => setCognitiveData((d) => ({ ...d, dualTask: { ...d.dualTask, dual: v } })), placeholder: "ex: 31" })), cognitiveData.dualTask.single && cognitiveData.dualTask.dual && (() => {
    const cl = classifyDualTask(cognitiveData.dualTask.single, cognitiveData.dualTask.dual);
    if (!cl) return null;
    return React.createElement("div", null, React.createElement("div", { style: { background: "#f8fafc", borderRadius: 9, padding: "10px 12px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" } }, React.createElement("span", { style: { fontSize: 12, color: "#64748b" } }, "Dual Task Cost:"), React.createElement("span", { style: { fontWeight: 900, fontSize: 20, color: cl.color } }, cl.cost, "%")), React.createElement(TestResult, { cl }));
  })())), React.createElement("div", { style: { background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12, padding: 14, marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#16a34a", marginBottom: 4 } }, "3. Fluência Verbal por Categorias"), React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer" } }, React.createElement("input", { type: "checkbox", checked: cognitiveData.selected?.verbalFluency !== false, onChange: (e) => setCognitiveData((d) => ({ ...d, selected: { ...d.selected, verbalFluency: e.target.checked } })), style: { width: 16, height: 16, accentColor: "#16a34a", cursor: "pointer" } }), React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: "#475569" } }, "Aplicar este teste")), cognitiveData.selected?.verbalFluency !== false && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginBottom: 12 } }, "Diga: ", React.createElement("em", null, '"Fale o máximo de animais que conseguir em 1 minuto."'), React.createElement("br", null), "Conte as palavras válidas (sem repetições) e registre abaixo."), React.createElement(Inp, { label: "Total de palavras (1 minuto)", type: "number", value: cognitiveData.verbalFluency.score, onChange: (v) => setCognitiveData((d) => ({ ...d, verbalFluency: { ...d.verbalFluency, score: v } })), placeholder: "ex: 14" }), React.createElement(Inp, { label: "Palavras ditas (opcional)", value: cognitiveData.verbalFluency.words, onChange: (v) => setCognitiveData((d) => ({ ...d, verbalFluency: { ...d.verbalFluency, words: v } })), placeholder: "cachorro, gato, leão..." }), cognitiveData.verbalFluency.score && React.createElement(TestResult, { cl: classifyVerbalFluency(cognitiveData.verbalFluency.score) }))), React.createElement("div", { style: { background: "#fdf4ff", border: "1.5px solid #e9d5ff", borderRadius: 12, padding: 14, marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#7c3aed", marginBottom: 4 } }, "4. Span de Dígitos"), React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer" } }, React.createElement("input", { type: "checkbox", checked: cognitiveData.selected?.digitSpan !== false, onChange: (e) => setCognitiveData((d) => ({ ...d, selected: { ...d.selected, digitSpan: e.target.checked } })), style: { width: 16, height: 16, accentColor: "#7c3aed", cursor: "pointer" } }), React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: "#475569" } }, "Aplicar este teste")), cognitiveData.selected?.digitSpan !== false && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginBottom: 8 } }, React.createElement("strong", null, "Direto:"), " Fale sequências de números crescentes (3, 4, 5... dígitos). Registre quantos dígitos o aluno repetiu corretamente.", React.createElement("br", null), React.createElement("strong", null, "Inverso:"), " Peça para repetir na ordem inversa. Registre o máximo alcançado."), React.createElement("div", { style: { background: "#f8fafc", borderRadius: 9, padding: "10px 12px", marginBottom: 10, fontSize: 11, color: "#64748b" } }, React.createElement("strong", null, "Sequências sugeridas:"), React.createElement("br", null), "3 dígitos: 4-7-2 · 1-9-5", React.createElement("br", null), "4 dígitos: 3-8-2-6 · 7-1-5-4", React.createElement("br", null), "5 dígitos: 2-9-4-7-1 · 6-3-8-2-5", React.createElement("br", null), "6 dígitos: 4-1-7-3-9-2 · 8-5-2-6-1-4", React.createElement("br", null), "7 dígitos: 3-7-1-5-9-2-6"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Span Direto (máx. dígitos)", type: "number", value: cognitiveData.digitSpan.direct, onChange: (v) => setCognitiveData((d) => ({ ...d, digitSpan: { ...d.digitSpan, direct: v } })), placeholder: "ex: 5" }), React.createElement(Inp, { label: "Span Inverso (máx. dígitos)", type: "number", value: cognitiveData.digitSpan.inverse, onChange: (v) => setCognitiveData((d) => ({ ...d, digitSpan: { ...d.digitSpan, inverse: v } })), placeholder: "ex: 3" })), cognitiveData.digitSpan.direct && React.createElement(TestResult, { cl: classifyDigitSpan(cognitiveData.digitSpan.direct, cognitiveData.digitSpan.inverse) }))), React.createElement(Inp, { label: "Observações cognitivas", value: cognitiveData.notes, onChange: (v) => setCognitiveData((d) => ({ ...d, notes: v })), placeholder: "Comportamento durante os testes, ansiedade, queixas relatadas..." }), (cognitiveData.selected?.mmse !== false && cognitiveData.mmse.total || cognitiveData.selected?.dualTask !== false && cognitiveData.dualTask.single || cognitiveData.selected?.verbalFluency !== false && cognitiveData.verbalFluency.score || cognitiveData.selected?.digitSpan !== false && cognitiveData.digitSpan.direct) && (() => {
    const cs = calcCognitiveScore(
      cognitiveData.selected?.mmse !== false ? cognitiveData.mmse.total : "",
      cognitiveData.selected?.dualTask !== false ? cognitiveData.dualTask.single : "",
      cognitiveData.selected?.dualTask !== false ? cognitiveData.dualTask.dual : "",
      cognitiveData.selected?.verbalFluency !== false ? cognitiveData.verbalFluency.score : "",
      cognitiveData.selected?.digitSpan !== false ? cognitiveData.digitSpan.direct : "",
      cognitiveData.selected?.digitSpan !== false ? cognitiveData.digitSpan.inverse : ""
    );
    const cl = cs >= 80 ? { label: "Excelente", color: "#16a34a", bg: "#dcfce7" } : cs >= 65 ? { label: "Bom", color: "#65a30d", bg: "#ecfccb" } : cs >= 50 ? { label: "Regular", color: "#d97706", bg: "#fef9c3" } : { label: "Comprometido", color: "#dc2626", bg: "#fee2e2" };
    return React.createElement("div", { style: { background: cl.bg, border: "1.5px solid " + cl.color + "33", borderRadius: 12, padding: "14px 16px", marginTop: 8 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a" } }, "🧠 Score Cognitivo Longevus"), React.createElement("div", { style: { fontWeight: 900, fontSize: 26, color: cl.color } }, cs)), React.createElement(Badge, { color: cl.color, bg: cl.bg }, cl.label));
  })(), React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 16 } }, React.createElement(Btn, { variant: "secondary", full: true, onClick: () => setStep((s) => s - 1) }, "Voltar"), React.createElement(Btn, { full: true, icon: "check", onClick: finish }, "Finalizar Avaliação ✓"))));
};
const getFunctionalLevel = (a, st) => {
  const global = a?.globalScore || 0;
  const func = a?.functional?.score || 0;
  const phys = a?.physical?.score || 0;
  const cv = Math.max(0, 100 - (a?.aha?.score || 0) * 8);
  const ahaScore = a?.aha?.score || 0;
  const hasFalls = a?.functional?.falls;
  const tug = parseFloat(a?.physical?.tug);
  const parq = a?.parqFailed;
  if (global < 30 || func < 25 || tug > 16 || hasFalls && func < 40) return {
    level: 1,
    label: "Nível 1 — Fragilidade / Baixa Capacidade",
    short: "Fragilidade",
    color: "#dc2626",
    bg: "#fee2e2",
    desc: "Capacidade funcional muito comprometida. Prioridade máxima para segurança, aprendizagem motora e tolerância ao exercício. Iniciar com exercícios assistidos e de baixíssima complexidade.",
    arch: "Recondicionamento Clínico",
    archIcon: "🏥"
  };
  if (global < 45 || func < 40 || phys < 35 || tug > 13.5) return {
    level: 2,
    label: "Nível 2 — Independente / Baixa Aptidão",
    short: "Baixa Aptidão",
    color: "#ea580c",
    bg: "#ffedd5",
    desc: "Independência preservada mas com limitações significativas de aptidão física. Foco em adaptação progressiva, força funcional e equilíbrio.",
    arch: "Full Body Essencial",
    archIcon: "🔰"
  };
  if (global < 60 || func >= 40 && phys < 55) return {
    level: 3,
    label: "Nível 3 — Independente / Aptidão Moderada",
    short: "Moderado",
    color: "#d97706",
    bg: "#fef9c3",
    desc: "Boa independência funcional com capacidade física moderada. Progressão gradual com foco em desenvolvimento de força, cardio e funcionalidade integrada.",
    arch: "A/B Balanceado",
    archIcon: "⚖️"
  };
  if (global < 78) return {
    level: 4,
    label: "Nível 4 — Ativo Funcional",
    short: "Ativo",
    color: "#65a30d",
    bg: "#ecfccb",
    desc: "Boa capacidade física e funcional. Programa pode incluir maior complexidade, carga e componentes neurofuncionais integrados.",
    arch: "Força Funcional 50+",
    archIcon: "💪"
  };
  return {
    level: 5,
    label: "Nível 5 — Performance Funcional",
    short: "Performance",
    color: "#16a34a",
    bg: "#dcfce7",
    desc: "Excelente capacidade física e funcional. Programa avançado com componentes de performance, potência, complexidade neurofuncional e dual task.",
    arch: "Performance Funcional 60+",
    archIcon: "🏆"
  };
};
const getRankedPriorities = (a, st) => {
  const priorities = [];
  const func = a?.functional?.score || 0;
  const phys = a?.physical?.score || 0;
  const cv = Math.max(0, 100 - (a?.aha?.score || 0) * 8);
  const ahaScore = a?.aha?.score || 0;
  const hasFalls = a?.functional?.falls;
  const tug = parseFloat(a?.physical?.tug);
  const balance = parseFloat(a?.physical?.balance);
  const grip = parseFloat(a?.physical?.grip);
  const chairStand = parseFloat(a?.physical?.chair);
  const calfCirc = parseFloat(a?.aha?.calf);
  const bmi = parseFloat(a?.aha?.bmi);
  if (hasFalls || tug > 13.5 || balance && balance < 10) {
    priorities.push({
      rank: 1,
      domain: "Prevenção de Quedas",
      icon: "🛡️",
      color: "#dc2626",
      reason: (hasFalls ? "Histórico de quedas. " : "") + (tug > 13.5 ? `TUG ${a?.physical?.tug}s (risco elevado). ` : "") + (balance < 10 ? `Equilíbrio ${balance}s (comprometido).` : ""),
      exercises: ["Apoio Unipodal", "Tandem", "Transferência de Peso", "Marcha Obstáculo", "Step-Up Baixo"],
      arch: "Prevenção Quedas"
    });
  }
  const hasLegWeakness = chairStand && classifyChairStand(chairStand, st?.sex)?.label === "Fraco" || calfCirc && calfCirc < 31 || func < 50;
  if (hasLegWeakness) {
    priorities.push({
      rank: priorities.length + 1,
      domain: "Força MMII",
      icon: "🦵",
      color: "#FF5603",
      reason: (chairStand && classifyChairStand(chairStand, st?.sex)?.label === "Fraco" ? `Levantar/Sentar: ${chairStand} reps (Fraco). ` : "") + (calfCirc && calfCirc < 31 ? `Panturrilha ${calfCirc}cm — risco sarcopenia. ` : "") + (func < 50 ? `Score funcional ${func}/100.` : ""),
      exercises: ["Sit-to-Stand", "Box Squat", "Ponte Glútea", "Hip Thrust", "Step-Up"],
      arch: "Força Funcional 50+"
    });
  }
  if (cv < 50 || ahaScore >= 3) {
    priorities.push({
      rank: priorities.length + 1,
      domain: "Cardiorrespiratório",
      icon: "❤️",
      color: "#6366f1",
      reason: `Índice cardiovascular ${cv} (${classifyAHA(a?.aha?.score || 0).label}).`,
      exercises: ["Caminhada Contínua", "Marcha Estacionária", "Bike", "Cardio Funcional", "Marcha Dinâmica"],
      arch: "Cardiometabólico"
    });
  }
  if (!hasFalls && balance && balance < 20 && tug > 10) {
    priorities.push({
      rank: priorities.length + 1,
      domain: "Equilíbrio e Mobilidade",
      icon: "⚖️",
      color: "#8b5cf6",
      reason: `Equilíbrio unipodal ${balance}s. TUG ${a?.physical?.tug}s.`,
      exercises: ["Semi-Tandem", "Tandem", "Apoio Unipodal Assistido", "Transferência Peso", "Alcance Funcional"],
      arch: "Prevenção Quedas"
    });
  }
  if (grip && classifyHandGrip(grip, st?.sex)?.label === "Fraco") {
    priorities.push({
      rank: priorities.length + 1,
      domain: "Força MMSS",
      icon: "💪",
      color: "#0891b2",
      reason: `Preensão manual ${grip}kgf (${classifyHandGrip(grip, st?.sex)?.label}) — indicativo de sarcopenia.`,
      exercises: ["Remada Elástico", "Wall Push-Up", "Face Pull", "Shoulder Press Sentado", "Pull Apart"],
      arch: "Full Body Essencial"
    });
  }
  if (func < 60) {
    priorities.push({
      rank: priorities.length + 1,
      domain: "Funcionalidade / AVDs",
      icon: "🏠",
      color: "#0369a1",
      reason: `Score funcional ${func}/100 — ${classifyFunctional(func).label}.`,
      exercises: ["Transferências", "Step-Up", "Farmer Carry Leve", "Subida Assistida", "Deslocamentos"],
      arch: "A/B Balanceado"
    });
  }
  const hasNeuroPriority = a?.functional?.balance || tug > 12 || func < 50;
  if (hasNeuroPriority || priorities.length < 3) {
    priorities.push({
      rank: priorities.length + 1,
      domain: "Neurofuncional / Dual Task",
      icon: "🧠",
      color: "#7c3aed",
      reason: "Componente neurofuncional recomendado para manutenção cognitivo-motora em 50+.",
      exercises: ["Marcha + Contagem", "Step + Decisão", "Toque Alvo", "Shadow Boxing", "Marcha + Comando"],
      arch: "Neurofuncional Integrado"
    });
  }
  if (priorities.length < 4) {
    priorities.push({
      rank: priorities.length + 1,
      domain: "Core e Estabilidade",
      icon: "🔩",
      color: "#64748b",
      reason: "Estabilidade central essencial para segurança e eficiência em todos os movimentos.",
      exercises: ["Dead Bug", "Bird Dog", "Prancha Joelhos", "Pallof Press", "Carry Anti-Rotação"],
      arch: "Full Body Essencial"
    });
  }
  return priorities.slice(0, 5);
};
const getTrainingArchitecture = (level, priorities, freq, env) => {
  const hasFalls = priorities.some((p) => p.domain === "Prevenção de Quedas");
  const hasCardio = priorities.some((p) => p.domain === "Cardiorrespiratório");
  const hasCognition = priorities.some((p) => p.domain === "Neurofuncional / Dual Task");
  const f = parseInt(freq) || 3;
  let arch, rationale, days;
  if (level.level <= 2 || hasFalls) {
    arch = "Recondicionamento Clínico / Prevenção Quedas";
    rationale = "Nível funcional reduzido ou risco de quedas. Foco em segurança, adaptação e aprendizagem motora. Exercícios assistidos e de baixa complexidade.";
    days = f <= 2 ? ["Full Body A", "Full Body B"] : ["Full Body A", "Full Body B", "Mobilidade + Equilíbrio"];
  } else if (f === 1) {
    arch = "Full Body Essencial";
    rationale = "Frequência semanal única. Sessão full body cobrindo todos os domínios prioritários.";
    days = ["Full Body"];
  } else if (f === 2) {
    arch = "A/B Balanceado";
    rationale = "2 sessões semanais com divisão A (MMII + Cardio + Dual Task) e B (MMSS + Equilíbrio + Cognição).";
    days = ["Dia A — MMII + Cardio + Dual Task", "Dia B — MMSS + Equilíbrio + Cognição"];
  } else if (f === 3) {
    arch = hasCognition ? "Neurofuncional Integrado" : "Força Funcional 50+";
    rationale = f === 3 ? "3 sessões com divisão A/B/C cobrindo força, cardio e neurofuncional." : "";
    days = ["Dia A — Força MMII + Core", "Dia B — Cardio + Equilíbrio", "Dia C — MMSS + Neurofuncional"];
  } else {
    arch = level.level >= 4 ? "Performance Funcional 60+" : "A/B/C Funcional";
    rationale = "Alta frequência permite divisão A/B/C com maior volume e especificidade.";
    days = ["Dia A — Força MMII", "Dia B — Cardio + Equilíbrio", "Dia C — MMSS + Core", f >= 4 ? "Dia D — Neurofuncional + Potência" : null].filter(Boolean);
  }
  const phases = [
    { block: 1, weeks: "1–4", name: "Adaptação", goal: "Segurança, aprendizagem, tolerância e adesão", color: "#6366f1", bg: "#eef2ff" },
    { block: 2, weeks: "5–12", name: "Desenvolvimento", goal: "Progressão gradual, aumento de capacidade física e cognitiva", color: "#FF5603", bg: "#fff4ee" },
    { block: 3, weeks: "13–20", name: "Consolidação", goal: "Integração funcional e neurofuncional", color: "#16a34a", bg: "#dcfce7" },
    { block: 4, weeks: "21–24", name: "Otimização", goal: "Refinamento e preparação para reavaliação", color: "#d97706", bg: "#fef9c3" }
  ];
  return { arch, rationale, days, phases };
};
const FunctionalProfile = ({ assessment: a, student: st }) => {
  const [expanded, setExpanded] = useState(true);
  const [freqModal, setFreqModal] = useState(false);
  const [freq, setFreq] = useState(st?.frequency || "3");
  const [env, setEnv] = useState(st?.environment || "gym");
  if (!a) return null;
  const level = getFunctionalLevel(a, st);
  const priorities = getRankedPriorities(a, st);
  const training = getTrainingArchitecture(level, priorities, freq, env);
  const progressionOrder = ["Técnica", "Amplitude", "Repetições", "Séries", "Tempo sob tensão", "Carga", "Complexidade", "Potência"];
  return React.createElement("div", { style: { marginTop: 16 } }, React.createElement("button", { onClick: () => setExpanded((e) => !e), style: { width: "100%", background: "linear-gradient(135deg,#fff4ee,#fff)", border: "1.5px solid #FF560333", borderRadius: 14, padding: "16px 18px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, React.createElement("div", { style: { width: 44, height: 44, borderRadius: 12, background: level.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 } }, level.archIcon), React.createElement("div", null, React.createElement("div", { style: { fontWeight: 800, fontSize: 15, color: "#0f172a" } }, "Perfil Funcional Automático"), React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2 } }, "Motor de Decisão Longevus · ", level.short))), React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, React.createElement(Badge, { color: level.color, bg: level.bg }, "Nível ", level.level), React.createElement("span", { style: { fontSize: 18, color: "#94a3b8" } }, expanded ? "▲" : "▼"))), expanded && React.createElement("div", { style: { border: "1.5px solid #FF560322", borderTop: "none", borderRadius: "0 0 14px 14px", padding: "18px", background: "#fff" } }, React.createElement("div", { style: { background: level.bg, border: "1.5px solid " + level.color + "33", borderRadius: 12, padding: "14px 16px", marginBottom: 16 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 16, color: level.color, marginBottom: 6 } }, level.label), React.createElement("div", { style: { fontSize: 13, color: "#334155", lineHeight: 1.6 } }, level.desc), React.createElement("div", { style: { marginTop: 10, display: "flex", alignItems: "center", gap: 8 } }, React.createElement("span", { style: { fontSize: 12, color: "#64748b" } }, "Arquitetura sugerida:"), React.createElement(Badge, { color: level.color, bg: level.bg }, level.archIcon, " ", level.arch))), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 } }, React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 } }, "Frequência semanal"), React.createElement("div", { style: { display: "flex", gap: 6 } }, ["1", "2", "3", "4", "5"].map((f) => React.createElement("button", { key: f, onClick: () => setFreq(f), style: { flex: 1, padding: "7px 0", borderRadius: 8, border: "1.5px solid", borderColor: freq === f ? "#FF5603" : "#e2e8f0", background: freq === f ? "#FF5603" : "#f8fafc", color: freq === f ? "#fff" : "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer" } }, f, "x")))), React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 } }, "Ambiente"), React.createElement("div", { style: { display: "flex", gap: 6 } }, [{ v: "home", l: "🏠 Casa" }, { v: "gym", l: "🏋️ Academia" }, { v: "hybrid", l: "🔄 Híbrido" }].map((e) => React.createElement("button", { key: e.v, onClick: () => setEnv(e.v), style: { flex: 1, padding: "7px 4px", borderRadius: 8, border: "1.5px solid", borderColor: env === e.v ? "#FF5603" : "#e2e8f0", background: env === e.v ? "#fff4ee" : "#f8fafc", color: env === e.v ? "#FF5603" : "#64748b", fontWeight: 700, fontSize: 10, cursor: "pointer" } }, e.l))))), React.createElement("div", { style: { marginBottom: 16 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 10 } }, "🎯 Prioridades de Treinamento"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, priorities.map((p, i) => React.createElement("div", { key: i, style: { background: "#f8fafc", border: "1.5px solid " + p.color + "22", borderRadius: 11, padding: "12px 14px" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 } }, React.createElement("div", { style: { width: 26, height: 26, borderRadius: 99, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff", flexShrink: 0 } }, i + 1), React.createElement("span", { style: { fontSize: 14, fontWeight: 700, color: "#0f172a" } }, p.icon, " ", p.domain)), React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginBottom: 8, lineHeight: 1.5 } }, p.reason), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 5 } }, p.exercises.slice(0, 4).map((ex, j) => React.createElement("span", { key: j, style: { background: p.color + "18", color: p.color, padding: "3px 9px", borderRadius: 99, fontSize: 11, fontWeight: 600 } }, ex))))))), React.createElement("div", { style: { marginBottom: 16 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 10 } }, "🏗️ Arquitetura de Treino Sugerida"), React.createElement("div", { style: { background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 12, padding: "14px" } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 15, color: "#16a34a", marginBottom: 6 } }, training.arch), React.createElement("div", { style: { fontSize: 12, color: "#475569", marginBottom: 10, lineHeight: 1.6 } }, training.rationale), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, training.days.map((d, i) => React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 9, padding: "9px 12px" } }, React.createElement("div", { style: { width: 24, height: 24, borderRadius: 99, background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", flexShrink: 0 } }, i + 1), React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: "#0f172a" } }, d)))))), React.createElement("div", { style: { marginBottom: 16 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 10 } }, "📅 Periodização — 24 Semanas"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, training.phases.map((ph) => React.createElement("div", { key: ph.block, style: { background: ph.bg, border: "1.5px solid " + ph.color + "33", borderRadius: 10, padding: "10px 12px" } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 12, color: ph.color } }, "Bloco ", ph.block, " — Sem. ", ph.weeks), React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#0f172a", margin: "3px 0" } }, ph.name), React.createElement("div", { style: { fontSize: 11, color: "#475569", lineHeight: 1.4 } }, ph.goal))))), React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 10 } }, "⬆️ Ordem Oficial de Progressão"), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, progressionOrder.map((p, i) => React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 5 } }, React.createElement("span", { style: { background: i < 3 ? "#dcfce7" : i < 6 ? "#fef9c3" : "#fff4ee", color: i < 3 ? "#16a34a" : i < 6 ? "#d97706" : "#ea580c", padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700 } }, i + 1, ". ", p), i < progressionOrder.length - 1 && React.createElement("span", { style: { color: "#cbd5e1", fontSize: 12 } }, "→"))), React.createElement("div", { style: { marginTop: 18, marginBottom: 8 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 10 } }, "Recomendacoes Complementares — Longevus 50+"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, [
    { color: "#6366f1", title: "Autonomia no Cotidiano", text: "Incentivar participacao ativa em atividades domesticas leves e seguras." },
    { color: "#8B5CF6", title: "Estimulacao Cognitiva", text: "Estimular leitura, jogos de raciocinio e musica." },
    { color: "#dc2626", title: "Prevencao de Quedas", text: "Evitar tapetes soltos e usar calcados estaveis." },
    { color: "#10B981", title: "Vinculo Social", text: "Estimular grupos de convivencia e atividades comunitarias." },
    { color: "#0EA5E9", title: "Hidratacao e Nutricao", text: "Hidratacao adequada e alimentacao rica em proteinas." },
    { color: "#d97706", title: "Qualidade do Sono", text: "Rotinas de sono regulares para recuperacao e cognicao." },
    { color: "#FF5603", title: "Acompanhamento Medico", text: "Consultas periodicas e controle de pressao e glicemia." }
  ].map((r, i) => React.createElement("div", { key: i, style: { display: "flex", gap: 10, padding: "10px 12px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", borderLeft: "4px solid " + r.color } }, React.createElement("div", { style: { width: 10, height: 10, borderRadius: 99, background: r.color, marginTop: 5, flexShrink: 0 } }), React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#0f172a", marginBottom: 2 } }, r.title), React.createElement("div", { style: { fontSize: 11, color: "#475569", lineHeight: 1.5 } }, r.text))))))), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 8, fontStyle: "italic" } }, "Ref: ACSM Guidelines · Blueprint Longevus v1.0"))));
};
const classifyMMSE = (score) => {
  const n = parseInt(score);
  if (isNaN(n)) return null;
  if (n >= 27) return { label: "Normal", desc: "Sem indicativo de comprometimento cognitivo.", impact: "Cognição preservada para as exigências do dia a dia: gerenciar compromissos, medicamentos, finanças e seguir conversas e instruções sem dificuldade.", color: "#16a34a", bg: "#dcfce7" };
  if (n >= 24) return { label: "Comprometimento Leve", desc: "Possível comprometimento cognitivo leve. Recomendar avaliação neurológica.", impact: "Pode começar a apresentar pequenos esquecimentos do dia a dia, como esquecer onde guardou objetos, repetir perguntas ou ter mais dificuldade para aprender coisas novas. Ainda mantém independência, mas exige atenção a sinais de progressão.", color: "#d97706", bg: "#fef9c3" };
  if (n >= 18) return { label: "Comprometimento Moderado", desc: "Comprometimento cognitivo moderado. Encaminhamento médico recomendado. Priorizar treino neurofuncional supervisionado.", impact: "Pode afetar a capacidade de seguir sequências de exercícios, memorizar orientações e manter atenção. No cotidiano, pode dificultar o controle de medicamentos, lembrar compromissos, seguir receitas ou instruções com várias etapas, e aumenta o risco de se perder em ambientes pouco familiares. Exige comandos simples, supervisão constante e comunicação com médico.", color: "#ea580c", bg: "#ffedd5" };
  return { label: "Comprometimento Grave", desc: "Comprometimento cognitivo grave. Avaliação médica urgente. Exercício supervisionado com baixíssima complexidade.", impact: "Indica perda significativa de autonomia: dificuldade para reconhecer pessoas e lugares familiares, lembrar informações recentes, tomar decisões simples e realizar atividades básicas sem auxílio. Necessita supervisão próxima e contínua em praticamente todas as atividades.", color: "#dc2626", bg: "#fee2e2" };
};
const classifyDualTask = (single, dual) => {
  const s = parseFloat(single), d = parseFloat(dual);
  if (!s || !d) return null;
  const cost = Math.round((s - d) / s * 100);
  if (cost < 0) return { cost: Math.abs(cost), label: "Sem custo (melhora)", desc: "Desempenho igual ou superior com dupla tarefa. Excelente controle cognitivo-motor.", impact: "Consegue realizar tarefas simultâneas no dia a dia (como caminhar e conversar, ou andar carregando objetos) sem perda de equilíbrio ou atenção. Baixo risco de quedas em ambientes com distrações.", color: "#16a34a", bg: "#dcfce7" };
  if (cost < 10) return { cost, label: "Baixo Custo (<10%)", desc: "Boa capacidade de divisão atencional. Pode progredir para dual tasks moderadas.", impact: "Boa capacidade de fazer mais de uma coisa ao mesmo tempo, como andar e conversar, ou atravessar a rua observando o trânsito. Baixo risco de quedas em situações do cotidiano que exigem atenção dividida.", color: "#16a34a", bg: "#dcfce7" };
  if (cost < 20) return { cost, label: "Custo Moderado (10–20%)", desc: "Atenção dividida comprometida. Incluir dual task progressiva na prescrição.", impact: "Pode ter dificuldade em situações que exigem atenção dividida, como caminhar enquanto conversa, carrega objetos ou observa o ambiente. Aumenta um pouco o risco de tropeços em ambientes movimentados ou com obstáculos.", color: "#d97706", bg: "#fef9c3" };
  if (cost < 35) return { cost, label: "Custo Elevado (20–35%)", desc: "Dificuldade significativa de divisão atencional. Risco de queda em ambientes complexos. Treino neurofuncional prioritário.", impact: "Dificuldade significativa em realizar duas tarefas ao mesmo tempo — por exemplo, andar e conversar, ou caminhar enquanto procura algo na bolsa. Aumenta o risco de quedas em ambientes movimentados, como supermercados, ruas com trânsito ou ao atender o celular enquanto caminha.", color: "#ea580c", bg: "#ffedd5" };
  return { cost, label: "Custo Muito Elevado (>35%)", desc: "Comprometimento grave da atenção dividida. Alto risco de queda. Iniciar dual task apenas no nível básico com supervisão constante.", impact: "Comprometimento importante: tarefas simultâneas como caminhar e conversar, ou andar enquanto carrega algo, tornam-se perigosas. Alto risco de quedas em qualquer ambiente com distrações, mesmo dentro de casa (ex: andar e atender alguém, desviar de um móvel enquanto fala).", color: "#dc2626", bg: "#fee2e2" };
};
const classifyVerbalFluency = (score) => {
  const n = parseInt(score);
  if (isNaN(n)) return null;
  if (n >= 18) return { label: "Excelente", desc: "Fluência verbal e memória semântica muito preservadas.", impact: "Facilidade para se comunicar, encontrar as palavras certas em conversas e participar ativamente de discussões e atividades sociais.", color: "#16a34a", bg: "#dcfce7" };
  if (n >= 13) return { label: "Normal", desc: "Fluência verbal dentro do esperado para a faixa etária.", impact: "Boa capacidade de se comunicar no dia a dia, participar de conversas, contar histórias e se expressar sem dificuldades relevantes.", color: "#65a30d", bg: "#ecfccb" };
  if (n >= 9) return { label: "Limítrofe", desc: "Fluência verbal abaixo do esperado. Atenção a possível declínio de memória semântica.", impact: "Pode começar a sentir mais dificuldade para encontrar palavras durante conversas, o que às vezes leva a pausas, repetições ou frases incompletas. No cotidiano, pode gerar certa frustração em conversas mais longas ou em grupo.", color: "#d97706", bg: "#fef9c3" };
  return { label: "Reduzida", desc: "Fluência verbal significativamente reduzida. Indicativo de comprometimento de memória e função executiva. Avaliar com especialista.", impact: "Dificuldade significativa para manter conversas, expressar necessidades e participar de grupos sociais. Pode levar a isolamento social, já que a comunicação se torna mais cansativa tanto para a pessoa quanto para quem conversa com ela. Também pode dificultar seguir instruções verbais durante o treino.", color: "#dc2626", bg: "#fee2e2" };
};
const classifyDigitSpan = (direct, inverse) => {
  const d = parseInt(direct), i = parseInt(inverse);
  if (isNaN(d)) return null;
  let label, desc, impact, color, bg;
  if (d >= 7 && (!i || i >= 5)) {
    label = "Excelente";
    desc = "Memória de trabalho e curto prazo muito preservadas.";
    impact = "Excelente capacidade de reter e manipular informações no dia a dia, como lembrar listas de compras, números de telefone, sequências de instruções e gerenciar várias informações ao mesmo tempo.";
    color = "#16a34a";
    bg = "#dcfce7";
  } else if (d >= 5 && (!i || i >= 3)) {
    label = "Normal";
    desc = "Memória de trabalho adequada para a faixa etária.";
    impact = "Boa capacidade de reter informações de curto prazo no cotidiano, como lembrar uma lista de tarefas, seguir instruções com poucos passos e acompanhar conversas sem perder o fio.";
    color = "#65a30d";
    bg = "#ecfccb";
  } else if (d >= 4 && (!i || i >= 2)) {
    label = "Limítrofe";
    desc = "Memória de trabalho ligeiramente reduzida. Incluir exercícios de memória sequencial.";
    impact = "Pode ter mais dificuldade em lembrar sequências de informações, como uma lista de compras maior, números de telefone ou instruções com várias etapas. No cotidiano, pode esquecer parte do que precisa fazer ao realizar tarefas com múltiplos passos.";
    color = "#d97706";
    bg = "#fef9c3";
  } else {
    label = "Reduzida";
    desc = "Memória de trabalho comprometida. Treino cognitivo e neurofuncional prioritário.";
    impact = "Dificuldade significativa para reter e manipular informações temporariamente. Afeta a capacidade de memorizar sequências de exercícios, lembrar instruções recentes, gerenciar a tomada correta de medicamentos e realizar tarefas com múltiplos passos, como seguir uma receita ou usar transporte público.";
    color = "#dc2626";
    bg = "#fee2e2";
  }
  return { label, desc, impact, color, bg };
};
const calcCognitiveScore = (mmse, dtSingle, dtDual, verbal, digitD, digitI) => {
  let total = 0, count = 0;
  const mmseN = parseInt(mmse);
  if (!isNaN(mmseN)) {
    total += mmseN / 30 * 100;
    count++;
  }
  const dtCl = classifyDualTask(dtSingle, dtDual);
  if (dtCl) {
    const dtScore = dtCl.cost < 0 ? 100 : Math.max(0, 100 - dtCl.cost * 2);
    total += dtScore;
    count++;
  }
  const vN = parseInt(verbal);
  if (!isNaN(vN)) {
    total += Math.min(100, vN / 18 * 100);
    count++;
  }
  const dN = parseInt(digitD);
  if (!isNaN(dN)) {
    total += Math.min(100, dN / 9 * 100);
    count++;
  }
  return count > 0 ? Math.round(total / count) : 0;
};
