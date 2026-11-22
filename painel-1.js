// Painel do professor (longevus-app.html) · parte 1 de 4. Código já convertido (sem Babel no navegador).
const SenhaInput = ({ style, ...rest }) => {
  const [ver, setVer] = React.useState(false);
  return React.createElement("div", { style: { position: "relative", width: "100%" } }, React.createElement("input", { ...rest, type: ver ? "text" : "password", autoCapitalize: "none", autoCorrect: "off", spellCheck: false, style: { ...style, paddingRight: 46 } }), React.createElement("button", { type: "button", onClick: () => setVer((v) => !v), "aria-label": ver ? "Ocultar senha" : "Mostrar senha", style: { position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", width: 38, height: 38, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, color: "#64748B" } }, React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("path", { d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" }), React.createElement("circle", { cx: "12", cy: "12", r: "3" }), ver && React.createElement("line", { x1: "3", y1: "3", x2: "21", y2: "21" }))));
};
const { useState, useEffect, useCallback, useRef } = React;
const SUPA_URL = "https://jpduxfbigcdxmtcozqpp.supabase.co";
const SUPA_KEY = "sb_publishable_VZSgcxu5ps3eR9UAjuRr4Q_B65WTx_h";
const supa = window.supabase.createClient(SUPA_URL, SUPA_KEY, { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } });
window.__LV_SUPA = supa;
const SUPPORT_WHATSAPP = "5511977431011";
const pixAscii = (str, max) => {
  const semAcento = String(str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const limpo = semAcento.replace(/[^A-Za-z0-9 ]/g, "").trim();
  return max ? limpo.slice(0, max) : limpo;
};
const pixCRC16 = (payload) => {
  let crc = 65535;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 32768 ? (crc << 1 ^ 4129) & 65535 : crc << 1 & 65535;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};
const pixTLV = (id, value) => id + String(value).length.toString().padStart(2, "0") + value;
const buildPixPayload = ({ pixKey, merchantName, merchantCity, amount, txid }) => {
  if (!pixKey) return null;
  const gui = pixTLV("00", "br.gov.bcb.pix");
  const key = pixTLV("01", pixKey);
  const merchantAccountInfo = pixTLV("26", gui + key);
  const mcc = pixTLV("52", "0000");
  const currency = pixTLV("53", "986");
  const amountField = amount ? pixTLV("54", Number(amount).toFixed(2)) : "";
  const country = pixTLV("58", "BR");
  const name = pixTLV("59", pixAscii(merchantName, 25) || "LONGEVUS");
  const city = pixTLV("60", pixAscii(merchantCity, 15) || "BRASIL");
  const txidClean = pixAscii(txid, 25).replace(/\s/g, "") || "***";
  const addData = pixTLV("62", pixTLV("05", txidClean));
  const semCRC = pixTLV("00", "01") + merchantAccountInfo + mcc + currency + amountField + country + name + city + addData + "6304";
  return semCRC + pixCRC16(semCRC);
};
const DB = {
  async authHeaders() {
    let { data } = await supa.auth.getSession();
    if (!data?.session?.access_token) {
      const refreshed = await supa.auth.refreshSession().catch(() => null);
      if (refreshed?.data?.session) data = refreshed.data;
    }
    const token = data?.session?.access_token || SUPA_KEY;
    if (!data?.session?.access_token) console.error("DB.authHeaders: sem sessão válida, usando chave anônima — escritas serão bloqueadas pelo RLS.");
    return { "apikey": SUPA_KEY, "Authorization": "Bearer " + token, "Content-Type": "application/json", "Prefer": "resolution=merge-duplicates" };
  },
  async load(table) {
    try {
      const headers = await this.authHeaders();
      const rows = [];
      let from = 0;
      while (true) {
        const r = await fetch(SUPA_URL + "/rest/v1/" + table + "?select=*&order=created_at.asc", { headers: { ...headers, "Range": from + "-" + (from + 999) } });
        if (!r.ok) return from === 0 ? null : rows.map((row) => row.data);
        const page = await r.json();
        rows.push(...page);
        if (page.length < 1e3) break;
        from += 1e3;
      }
      return rows.map((row) => row.data);
    } catch (e) {
      return null;
    }
  },
  async loadRaw(table, query) {
    try {
      const headers = await this.authHeaders();
      const baseQuery = query || "select=*&order=created_at.desc";
      const rows = [];
      let from = 0;
      while (true) {
        const r = await fetch(SUPA_URL + "/rest/v1/" + table + "?" + baseQuery, { headers: { ...headers, "Range": from + "-" + (from + 999) } });
        if (!r.ok) return from === 0 ? null : rows;
        const page = await r.json();
        rows.push(...page);
        if (page.length < 1e3) break;
        from += 1e3;
      }
      return rows;
    } catch (e) {
      return null;
    }
  },
  async save(table, id, data, studentId) {
    try {
      const headers = await this.authHeaders();
      const { data: sess } = await supa.auth.getSession();
      const ownerId = sess?.session?.user?.id;
      const body = { id, data, owner_id: ownerId, updated_at: (new Date()).toISOString(), ...studentId ? { student_id: studentId } : {} };
      const r = await fetch(SUPA_URL + "/rest/v1/" + table, { method: "POST", headers, body: JSON.stringify(body) });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        console.error("DB.save falhou:", table, id, r.status, t);
        return false;
      }
      return true;
    } catch (e) {
      console.error("DB.save erro de rede:", table, id, e);
      return false;
    }
  },
  async remove(table, id) {
    try {
      const headers = await this.authHeaders();
      const r = await fetch(SUPA_URL + "/rest/v1/" + table + "?id=eq." + id, { method: "DELETE", headers });
      if (!r.ok) console.error("DB.remove failed", table, id, r.status);
      return r.ok;
    } catch (e) {
      console.error("DB.remove error", table, id, e);
      return false;
    }
  }
};
const LS = {
  get: (k, d) => {
    try {
      const v = window.localStorage.getItem(k);
      return v ? JSON.parse(v) : d;
    } catch {
      return d;
    }
  },
  set: (k, v) => {
    try {
      window.localStorage.setItem(k, JSON.stringify(v));
    } catch {
    }
  }
};
const uid = () => Math.random().toString(36).slice(2, 10);
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const DIAS_SEMANA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES_NOME = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const toISODateLocal = (d) => {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};
const getMonthDates = (year, month) => {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: lastDay }, (_, i) => new Date(year, month, i + 1));
};
const calcAge = (dob) => {
  if (!dob) return "—";
  const d = new Date(dob), now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) a--;
  return a;
};
const fmt = (d) => d ? (new Date(d + "T00:00:00")).toLocaleDateString("pt-BR") : "—";
const O = "#FF5603";
const fmtR = (v) => "R$ " + Number(v || 0).toFixed(2).replace(".", ",");
const valorBR = (v) => {
  if (typeof v === "number") return v;
  const t = String(v || "").replace(/[^\d,.-]/g, "");
  if (!t) return 0;
  const n = t.includes(",") ? Number(t.replace(/\./g, "").replace(",", ".")) : Number(t);
  return isNaN(n) ? 0 : n;
};
let _precosVit = null;
const precosVitrine = async () => {
  if (_precosVit) return _precosVit;
  const m = { l360: { titulo: "Longevus 360", valor: 0 }, mente: { titulo: "Mente Ativa", valor: 0 } };
  try {
    const headers = await DB.authHeaders();
    const { data } = await supa.auth.getSession();
    const id = data?.session?.user?.id;
    const [rp, ri] = await Promise.all([
      id ? fetch(SUPA_URL + "/rest/v1/professionals?select=l360,mente&id=eq." + id, { headers }) : Promise.resolve(null),
      fetch(SUPA_URL + "/rest/v1/vitrine_itens?select=id,data&order=ordem.asc", { headers })
    ]);
    const pf = rp && rp.ok ? (await rp.json())[0] || {} : {};
    if (pf.l360) m.l360 = { titulo: pf.l360.nome || "Longevus 360", valor: valorBR(pf.l360.valor) };
    if (pf.mente) m.mente = { titulo: pf.mente.nome || "Mente Ativa", valor: valorBR(pf.mente.valor) };
    const itens = ri && ri.ok ? await ri.json() : [];
    (itens || []).forEach((x) => {
      const d = x.data || {};
      if (d.tipo === "parceiro" || d.produto === "indique") return;
      if (d.produto === "mente") {
        if (!m.mente.valor) m.mente.valor = valorBR(d.valor || d.preco);
        return;
      }
      if (d.produto === "elo") {
        m.elo = { titulo: d.titulo || "Elo 60+", valor: valorBR(d.valor || d.preco) };
        return;
      }
      m[x.id] = { titulo: d.titulo || "Serviço", valor: valorBR(d.valor || d.preco) };
    });
    _precosVit = m;
    setTimeout(() => {
      _precosVit = null;
    }, 6e4);
  } catch (e) {
  }
  return m;
};
const pedirValorVit = (titulo, sugerido) => {
  const r = window.prompt("Quanto você recebeu por " + titulo + "? (R$)\n\nEsse valor entra no Financeiro.", sugerido ? String(Number(sugerido).toFixed(2)).replace(".", ",") : "");
  if (r === null) return null;
  return valorBR(r);
};
const registrarVitrine = (setStudents, st, tipo, produto, titulo, valor) => {
  const v = Number(valor) || 0;
  const hoje = todayStr();
  setStudents((p) => p.map((x) => String(x.id) !== String(st.id) ? x : { ...x, vitrineHist: [...x.vitrineHist || [], { id: uid(), tipo, produto, titulo, valor: v, data: hoje }] }));
  if (tipo === "venda" && v > 0 && window.__lvAddReceita) window.__lvAddReceita({ id: uid(), descricao: titulo + " · " + (st.name || "aluno"), categoria: "vitrine", recorrente: false, frequencia: null, status: "recebido", dataPrevista: hoje, valorPrevisto: v, dataPagamento: hoje, valorPago: v, obs: "", createdAt: hoje, studentId: st.id, produto, produtoTitulo: titulo, origem: "vitrine" });
};
const mesChave = (d) => (d || "").slice(0, 7);
const novoPagamentoMensal = (student, dataPrevista, periodoInicio) => ({
  id: uid(),
  studentId: student.id,
  tipo: "mensal",
  plano: student.billing?.plano || "",
  modoCobranca: "fixo",
  valorSessao: 0,
  sessoes: null,
  periodoInicio: periodoInicio || (() => {
    const d = new Date(dataPrevista + "T00:00:00");
    d.setDate(d.getDate() - 30);
    return toISODateLocal(d);
  })(),
  periodoFim: dataPrevista,
  dataPrevista,
  valorPrevisto: Number(student.billing?.valor) || 0,
  dataPagamento: null,
  valorPago: null,
  status: "previsto",
  origem: "ciclo",
  agendaEntryId: null,
  obs: "",
  createdAt: todayStr()
});
const mudancasAbertosMensal = (pagamentos, studentId, billing) => {
  if (!billing || !billing.ativo || billing.tipo === "avulso" || billing.modoCobranca === "porSessao") return [];
  const abertos = (pagamentos || []).filter((pg) => pg.studentId === studentId && pg.status === "previsto" && pg.tipo === "mensal" && pg.modoCobranca !== "porSessao").sort((a, b) => (a.dataPrevista || "").localeCompare(b.dataPrevista || ""));
  const novoPlano = billing.plano || "", novoValor = Number(billing.valor) || 0;
  return abertos.map((pg, i) => {
    const patch = {};
    if ((pg.plano || "") !== novoPlano) patch.plano = novoPlano;
    if (Number(pg.valorPrevisto || 0) !== novoValor) patch.valorPrevisto = novoValor;
    if (i === 0 && billing.vencimento && pg.dataPrevista !== billing.vencimento) {
      patch.dataPrevista = billing.vencimento;
      patch.periodoFim = billing.vencimento;
    }
    if (!Object.keys(patch).length) return null;
    const antes = fmt(pg.dataPrevista) + " · " + (pg.plano || "sem nome") + " · " + fmtR(pg.valorPrevisto);
    const depois = fmt(patch.dataPrevista || pg.dataPrevista) + " · " + (novoPlano || "sem nome") + " · " + fmtR(novoValor);
    return { id: pg.id, patch, txt: "De: " + antes + "\nPara: " + depois };
  }).filter(Boolean);
};
const novoPagamentoAvulso = (student, dataPrevista, agendaEntryId, valor) => ({
  id: uid(),
  studentId: student.id,
  tipo: "avulso",
  plano: "Aula avulsa",
  dataPrevista,
  valorPrevisto: valor != null && valor !== "" ? Number(valor) : Number(student.billing?.valorAula) || 0,
  dataPagamento: null,
  valorPago: null,
  status: "previsto",
  origem: agendaEntryId ? "agenda" : "manual",
  agendaEntryId: agendaEntryId || null,
  obs: "",
  createdAt: todayStr()
});
const feriadosNacionais = (ano) => {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mesP = Math.floor((h + l - 7 * m + 114) / 31), diaP = (h + l - 7 * m + 114) % 31 + 1;
  const sextaSanta = new Date(ano, mesP - 1, diaP - 2);
  return new Set(["01-01", "04-21", "05-01", "09-07", "10-12", "11-02", "11-15", "11-20", "12-25", String(sextaSanta.getMonth() + 1).padStart(2, "0") + "-" + String(sextaSanta.getDate()).padStart(2, "0")]);
};
const quintoDiaUtil = (ano, mes) => {
  const fer = feriadosNacionais(ano);
  let d = new Date(ano, mes, 1), cont = 0;
  while (true) {
    const dow = d.getDay();
    const chave = String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    if (dow !== 0 && dow !== 6 && !fer.has(chave)) {
      cont++;
      if (cont === 5) return toISODateLocal(d);
    }
    d.setDate(d.getDate() + 1);
  }
};
const proximoVencimentoMensal = (billing, baseISO) => {
  const base = new Date((baseISO || todayStr()) + "T00:00:00");
  if (billing?.regraVencimento === "quintoDiaUtil") return quintoDiaUtil(base.getMonth() === 11 ? base.getFullYear() + 1 : base.getFullYear(), (base.getMonth() + 1) % 12);
  base.setDate(base.getDate() + 30);
  return toISODateLocal(base);
};
const REGRA_VENC_OPTS = [{ v: "30dias", l: "A cada 30 dias" }, { v: "quintoDiaUtil", l: "5º dia útil de cada mês" }];
const vencimentoDoCiclo = (anchorISO, dataAula) => {
  if (!anchorISO) return dataAula;
  let d = new Date(anchorISO + "T00:00:00");
  const alvo = new Date(dataAula + "T00:00:00");
  let guard = 0;
  while (d < alvo && guard < 600) {
    d.setDate(d.getDate() + 30);
    guard++;
  }
  return toISODateLocal(d);
};
const novoPagamentoPorSessao = (student, entryDate, agendaEntryId) => ({
  id: uid(),
  studentId: student.id,
  tipo: "mensal",
  plano: student.billing?.plano || "",
  modoCobranca: "porSessao",
  valorSessao: Number(student.billing?.valorSessao) || 0,
  sessoes: 1,
  dataPrevista: entryDate,
  valorPrevisto: Number(student.billing?.valorSessao) || 0,
  dataPagamento: null,
  valorPago: null,
  status: "previsto",
  origem: agendaEntryId ? "agenda" : "manual",
  agendaEntryId: agendaEntryId || null,
  obs: "",
  createdAt: todayStr()
});
const STATUS_NAO_COBRAM = ["cancelada_professor", "cancelada_aluno_prazo"];
const STATUS_CONTAM = ["realizada", "falta", "cancelada_aluno_sem_prazo"];
const atualizarFinanceiroPelaAgenda = (entry, students, agendaEntries, setPagamentos, setStudents) => {
  if (!entry) return;
  const st = students.find((s) => s.id === entry.studentId);
  if (!st || !st.billing?.ativo) return;
  const ehAvulso = st.billing?.tipo === "avulso";
  const ehPorSessao = !ehAvulso && st.billing?.modoCobranca === "porSessao";
  if (!ehAvulso && !ehPorSessao) return;
  const criarRegistro = () => ehAvulso ? novoPagamentoAvulso(st, entry.date, entry.id) : novoPagamentoPorSessao(st, entry.date, entry.id);
  if (STATUS_NAO_COBRAM.includes(entry.status)) {
    setPagamentos((p) => p.filter((pg) => !(pg.agendaEntryId === entry.id && pg.status === "previsto")));
    return;
  }
  if (STATUS_CONTAM.includes(entry.status) && ehAvulso) {
    let consumiuCredito = false;
    setPagamentos((p) => {
      const existente = p.find((x) => x.agendaEntryId === entry.id);
      const temCredito = (st.billing?.creditosAvulso || 0) > 0;
      if (existente) {
        if (existente.status === "pago") return p;
        if (temCredito) {
          consumiuCredito = true;
          return p.map((x) => x.id === existente.id ? { ...x, status: "pago", valorPago: 0, dataPagamento: entry.date, origem: "credito", obs: "Coberta por aula paga adiantado" } : x);
        }
        return p;
      }
      if (temCredito) {
        consumiuCredito = true;
        return [...p, { ...criarRegistro(), status: "pago", valorPago: 0, dataPagamento: entry.date, origem: "credito", obs: "Coberta por aula paga adiantado" }];
      }
      return [...p, criarRegistro()];
    });
    if (consumiuCredito && setStudents) setStudents((p) => p.map((s) => s.id === st.id ? { ...s, billing: { ...s.billing || {}, creditosAvulso: Math.max(0, (s.billing?.creditosAvulso || 0) - 1) } } : s));
    return;
  }
  setPagamentos((p) => {
    const existente = p.find((x) => x.agendaEntryId === entry.id);
    if (!existente) return [...p, criarRegistro()];
    if (existente.status === "previsto" && existente.dataPrevista !== entry.date) return p.map((x) => x.id === existente.id ? { ...x, dataPrevista: entry.date } : x);
    return p;
  });
};
const removerPagamentoDaAgenda = (entryId, setPagamentos) => {
  setPagamentos((p) => p.filter((pg) => !(pg.agendaEntryId === entryId && pg.status === "previsto")));
};
const marcarReagendamento = (original, atualizado) => {
  if (!original?.date || !atualizado?.date || original.date === atualizado.date) return atualizado;
  return { ...atualizado, dataOriginal: original.dataOriginal || original.date };
};
const EXERCISES = [
  { id: "ex01", nome: "Sentar e Levantar da Cadeira", cat: "Fortalecimento", grupo: "MMII", foco: "Pernas e Glúteos", nivel: "Basico", icone: "🪑", momento: "principal" },
  { id: "ex02", nome: "Elevação de Calcanhares", cat: "Fortalecimento", grupo: "MMII", foco: "Panturrilha", nivel: "Basico", icone: "🦵", momento: "principal" },
  { id: "ex03", nome: "Extensão de Perna para Trás", cat: "Fortalecimento", grupo: "MMII", foco: "Glúteos e Extensores do Quadril", nivel: "Basico", icone: "🏋️", momento: "principal" },
  { id: "ex04", nome: "Elevação de Perna à Frente", cat: "Fortalecimento", grupo: "MMII", foco: "Quadríceps e Flexores do Quadril", nivel: "Basico", icone: "🦿", momento: "principal" },
  { id: "ex05", nome: "Agachamento Assistido", cat: "Fortalecimento", grupo: "MMII", foco: "Quadríceps, Glúteos e Core", nivel: "Intermediario", icone: "⬇️", momento: "principal" },
  { id: "ex06", nome: "Agachamento Livre", cat: "Fortalecimento", grupo: "MMII", foco: "Cadeia Posterior e Core", nivel: "Avancado", icone: "🏆", momento: "principal" },
  { id: "ex07", nome: "Flexão de Parede", cat: "Fortalecimento", grupo: "MMSS", foco: "Peito e Tríceps", nivel: "Basico", icone: "🤲", momento: "principal" },
  { id: "ex08", nome: "Elevação Lateral dos Braços", cat: "Fortalecimento", grupo: "MMSS", foco: "Ombros", nivel: "Intermediario", icone: "💪", momento: "principal" },
  { id: "ex09", nome: "Remada com Elástico", cat: "Fortalecimento", grupo: "MMSS", foco: "Costas e Bíceps", nivel: "Intermediario", icone: "🎗️", momento: "principal" },
  { id: "ex10", nome: "Rosca Direta com Peso Leve", cat: "Fortalecimento", grupo: "MMSS", foco: "Bíceps", nivel: "Basico", icone: "💪", momento: "principal" },
  { id: "ex11", nome: "Tocar o Joelho Oposto (Sentado)", cat: "Core", grupo: "Core", foco: "Abdome e Oblíquos", nivel: "Basico", icone: "🎯", momento: "principal" },
  { id: "ex12", nome: "Extensão de Tronco na Cadeira", cat: "Core", grupo: "Core", foco: "Extensores da Coluna", nivel: "Basico", icone: "🪑", momento: "principal" },
  { id: "ex13", nome: "Contração Abdominal Sentado", cat: "Core", grupo: "Core", foco: "Core Profundo", nivel: "Basico", icone: "🔒", momento: "principal" },
  { id: "ex14", nome: "Pés Unidos — Equilíbrio Estático", cat: "Equilíbrio", grupo: "Equilíbrio", foco: "Equilíbrio Estático", nivel: "Basico", icone: "⚖️", momento: "principal" },
  { id: "ex15", nome: "Equilíbrio em Uma Perna", cat: "Equilíbrio", grupo: "Equilíbrio", foco: "Estabilidade do Tornozelo", nivel: "Basico", icone: "🦶", momento: "principal" },
  { id: "ex16", nome: "Deslocamento de Tronco A/P", cat: "Equilíbrio", grupo: "Equilíbrio", foco: "Equilíbrio Anteroposterior", nivel: "Basico", icone: "↕️", momento: "principal" },
  { id: "ex17", nome: "Caminhada Tandem", cat: "Equilíbrio", grupo: "Equilíbrio", foco: "Equilíbrio Dinâmico", nivel: "Intermediario", icone: "👣", momento: "principal" },
  { id: "ex18", nome: "Equilíbrio com Tarefa Dual", cat: "Equilíbrio", grupo: "Equilíbrio", foco: "Atenção Dividida", nivel: "Avancado", icone: "🧠", momento: "principal" },
  { id: "ex19", nome: "Rotação de Tornozelos e Punhos", cat: "Mobilidade", grupo: "Mobilidade", foco: "Articulações Distais", nivel: "Basico", icone: "🔁", momento: "inicial" },
  { id: "ex20", nome: "Rotação de Quadril em Círculos", cat: "Mobilidade", grupo: "Mobilidade", foco: "Quadril e Lombar", nivel: "Basico", icone: "🌀", momento: "inicial" },
  { id: "ex21", nome: "Marcha com Elevação de Joelhos", cat: "Mobilidade", grupo: "Mobilidade", foco: "Flexores do Quadril", nivel: "Basico", icone: "🚶", momento: "inicial" },
  { id: "ex22", nome: "Rotação do Pescoço", cat: "Mobilidade", grupo: "Mobilidade", foco: "Coluna Cervical", nivel: "Basico", icone: "🔄", momento: "inicial" },
  { id: "ex23", nome: "Alongamento da Panturrilha na Parede", cat: "Alongamento", grupo: "Alongamento", foco: "Panturrilha e Tornozelo", nivel: "Basico", icone: "🧘", momento: "final" },
  { id: "ex24", nome: "Alongamento Lateral do Tronco", cat: "Alongamento", grupo: "Alongamento", foco: "Tronco e Intercostais", nivel: "Basico", icone: "🙆", momento: "final" },
  { id: "ex25", nome: "Alongamento de Quadril e Glúteo", cat: "Alongamento", grupo: "Alongamento", foco: "Quadril e Glúteos", nivel: "Basico", icone: "🏃", momento: "final" },
  { id: "ex26", nome: "Alongamento de Isquiotibiais", cat: "Alongamento", grupo: "Alongamento", foco: "Posterior da Coxa", nivel: "Basico", icone: "🦵", momento: "final" },
  { id: "ex27", nome: "Alongamento de Ombros com Toalha", cat: "Alongamento", grupo: "Alongamento", foco: "Peito e Ombros", nivel: "Basico", icone: "🤸", momento: "final" },
  { id: "ex28", nome: "Respiração Diafragmática", cat: "Relaxamento", grupo: "Alongamento", foco: "Sistema Nervoso e Relaxamento", nivel: "Basico", icone: "🌬️", momento: "final" },
  { id: "ex29", nome: "Marcha no Lugar com Apoio", cat: "Cardio", grupo: "Cardio", foco: "Resistência Cardiovascular", nivel: "Basico", icone: "🏃", momento: "principal" },
  { id: "ex30", nome: "Caminhada com Variações", cat: "Cardio", grupo: "Cardio", foco: "Marcha e Coordenação", nivel: "Basico", icone: "👟", momento: "principal" },
  { id: "ex31", nome: "Subida e Descida de Degrau", cat: "Funcional", grupo: "Funcional", foco: "MMII e Equilíbrio Dinâmico", nivel: "Intermediario", icone: "🪜", momento: "principal" },
  { id: "ex32", nome: "Lançar e Pegar Bola", cat: "Coordenação", grupo: "Coordenação", foco: "Coordenação e Tarefa Dual", nivel: "Intermediario", icone: "🏀", momento: "principal" },
  { id: "ex33", nome: "Sequência de Passos Laterais", cat: "Coordenação", grupo: "Coordenação", foco: "Padrão Motor", nivel: "Intermediario", icone: "👣", momento: "principal" }
];
const TREINO_DEFS = {
  X1: { label: "Treino extra 1", cor: "#9333ea", bg: "#faf5ff", border: "#e9d5ff", desc: "Treino adicional" },
  X2: { label: "Treino extra 2", cor: "#0d9488", bg: "#f0fdfa", border: "#99f6e4", desc: "Treino adicional" },
  X3: { label: "Treino extra 3", cor: "#db2777", bg: "#fdf2f8", border: "#fbcfe8", desc: "Treino adicional" },
  X4: { label: "Treino extra 4", cor: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe", desc: "Treino adicional" },
  A: { label: "Treino A", cor: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", desc: "MMII + Equilíbrio + Mobilidade" },
  B: { label: "Treino B", cor: "#d97706", bg: "#fffbeb", border: "#fde68a", desc: "MMSS + Core + Alongamento" },
  C: { label: "Treino C", cor: "#7e22ce", bg: "#fdf4ff", border: "#e9d5ff", desc: "Funcional + Cardio + Coordenação" },
  D: { label: "Treino D", cor: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", desc: "Full Body + Mobilidade Geral" },
  FB: { label: "Full Body", cor: "#0d9488", bg: "#f0fdfa", border: "#99f6e4", desc: "Corpo todo — Pernas, Peito, Costas, Ombros, Braços" },
  SUP: { label: "Superior", cor: "#be185d", bg: "#fdf2f8", border: "#fbcfe8", desc: "Peito, Costas, Ombros, Bíceps, Tríceps" },
  INF: { label: "Inferior", cor: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", desc: "Quadríceps, Posterior, Glúteos, Panturrilha" },
  PUSH: { label: "Push", cor: "#c2410c", bg: "#fff7ed", border: "#fed7aa", desc: "Peito, Ombros, Tríceps" },
  PULL: { label: "Pull", cor: "#0369a1", bg: "#f0f9ff", border: "#bae6fd", desc: "Costas, Bíceps" },
  LEGS: { label: "Legs", cor: "#65a30d", bg: "#f7fee7", border: "#d9f99d", desc: "Quadríceps, Posterior, Glúteos, Panturrilha" },
  PEITO: { label: "Peito", cor: "#dc2626", bg: "#fef2f2", border: "#fecaca", desc: "Peito e Tríceps" },
  COSTAS: { label: "Costas", cor: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", desc: "Costas e Bíceps" },
  PERNA: { label: "Perna", cor: "#4d7c0f", bg: "#f7fee7", border: "#d9f99d", desc: "Quadríceps, Posterior, Glúteos, Panturrilha" },
  OMBRO: { label: "Ombro", cor: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", desc: "Ombros e Abdômen" },
  EMP: { label: "Empurrar", cor: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", desc: "Full body alternado — Peito, Abdômen, Quadríceps, Tríceps" },
  PUX: { label: "Puxar", cor: "#9333ea", bg: "#faf5ff", border: "#e9d5ff", desc: "Full body alternado — Costas, Lombar, Posterior, Bíceps, Panturrilha" }
};
const blocosPara = (prog) => prog?.blocosConfig && prog.blocosConfig.length ? prog.blocosConfig : BLOCOS;
const BLOCOS = [
  { key: "b1", label: "Bloco 1 — Adaptação", semanas: "1–6", cor: { bg: "#eff6ff", border: "#bfdbfe", texto: "#1d4ed8", dot: "#3b82f6" } },
  { key: "b2", label: "Bloco 2 — Desenvolvimento", semanas: "7–12", cor: { bg: "#fff7ed", border: "#fed7aa", texto: "#c2410c", dot: "#FF5603" } },
  { key: "b3", label: "Bloco 3 — Intensificação", semanas: "13–18", cor: { bg: "#fdf4ff", border: "#e9d5ff", texto: "#7e22ce", dot: "#a855f7" } },
  { key: "b4", label: "Bloco 4 — Consolidação", semanas: "19–24", cor: { bg: "#f0fdf4", border: "#bbf7d0", texto: "#15803d", dot: "#22c55e" } }
];
const MOMENTOS = [["inicial", "Aquecimento", "#22c55e"], ["principal", "Principal", "#3b82f6"], ["final", "Volta à calma", "#a855f7"]];
const getYtId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1] : null;
};
const baixarContratoHTML = (assinatura) => {
  const d = assinatura.data || {};
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;
  try {
    const logoH = 20;
    const logoWBW = logoH * (400 / 366);
    doc.addImage(__LOGO_WB__, "PNG", (pageWidth - logoWBW) / 2, y, logoWBW, logoH);
    y += logoH + 6;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  } catch (e) {
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Contrato de Prestação de Serviços", pageWidth / 2, y, { align: "center" });
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  const dataFormatada = assinatura.created_at ? new Date(assinatura.created_at).toLocaleString("pt-BR") : "";
  doc.text("Assinado eletronicamente por " + (d.nomeDigitado || "") + (d.cpf ? " · CPF " + d.cpf : ""), margin, y);
  y += 5;
  doc.text(dataFormatada, margin, y);
  y += 10;
  doc.setTextColor(20);
  doc.setFontSize(10.5);
  const linhas = doc.splitTextToSize(d.textoAssinado || "", maxWidth);
  const lineHeight = 5;
  linhas.forEach((linha) => {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(linha, margin, y);
    y += lineHeight;
  });
  if (d.assinaturaImg) {
    const imgWidth = 60, imgHeight = 28;
    if (y + imgHeight + 14 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Assinatura:", margin, y);
    y += 4;
    try {
      doc.addImage(d.assinaturaImg, "PNG", margin, y, imgWidth, imgHeight);
    } catch (e) {
    }
  }
  doc.save("contrato-" + (d.nomeDigitado || "aluno").trim().replace(/\s+/g, "-").toLowerCase() + ".pdf");
};
const CONTRATO_MODELO_PADRAO_TEXTO = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PERSONAL TRAINER

Pelo presente instrumento, de um lado:

CONTRATADO: Wellington Fabiano Brito, Personal Trainer, CREF nº ____________, CPF nº ____________;

e, de outro:

CONTRATANTE: {nome}, CPF nº {cpf};

têm entre si justo e contratado o presente Contrato de Prestação de Serviços de Personal Trainer, mediante as condições abaixo.

1. OBJETO

1.1. O presente contrato tem como objeto a prestação de serviços de Personal Trainer, incluindo planejamento, orientação, acompanhamento e supervisão individualizada de exercícios físicos, de acordo com os objetivos e características do(a) CONTRATANTE.

1.2. O(A) CONTRATANTE compromete-se a fornecer informações verdadeiras sobre seu estado de saúde, limitações, lesões, medicamentos e demais condições relevantes para a prática de exercícios físicos.

2. PLANO, FREQUÊNCIA E HORÁRIOS

2.1. O plano contratado corresponde a: {plano}, em dias e horários previamente acordados entre as partes.

2.2. Os horários definidos ficam reservados ao(à) CONTRATANTE durante a vigência do contrato.

2.3. A contratação corresponde a uma mensalidade fixa de acompanhamento, não se caracterizando como aquisição de quantidade determinada de aulas ou sessões mensais.

2.4. A quantidade de sessões realizadas poderá variar de um mês para outro em razão do calendário, feriados, quantidade de semanas ou outros fatores, sem alteração automática do valor da mensalidade.

2.5. Dessa forma, poderão existir meses com quantidade inferior ou superior à média mensal do plano contratado, mantendo-se o mesmo valor mensal contratado.

3. VALOR E PAGAMENTO

3.1. Pela prestação dos serviços, o(a) CONTRATANTE pagará ao CONTRATADO o valor mensal de: {valor}.

3.2. O pagamento será realizado até o dia ______ de cada mês, por meio de __________________________________.

3.3. A mensalidade contempla o acompanhamento profissional, planejamento dos treinamentos e a reserva dos horários contratados.

3.4. Não haverá cobrança adicional caso a quantidade de sessões realizadas em determinado mês seja superior à média do plano contratado.

3.5. Da mesma forma, não haverá redução automática da mensalidade em razão de feriados ou de quantidade inferior de sessões decorrente do calendário.

4. AUSÊNCIAS E REPOSIÇÕES

4.1. A ausência do(a) CONTRATANTE em sessão previamente agendada não gera desconto ou abatimento proporcional da mensalidade, uma vez que o horário permanece reservado e disponível.

4.2. Viagens, férias, compromissos pessoais ou outras ausências do(a) CONTRATANTE não implicam, por si só, suspensão ou redução da mensalidade.

4.3. Eventuais reposições poderão ser realizadas mediante disponibilidade de horário do CONTRATADO, não constituindo obrigação de reposição em caso de ausência do(a) CONTRATANTE.

4.4. Caso o CONTRATADO não possa realizar uma sessão previamente agendada, deverá, sempre que possível, comunicar o(a) CONTRATANTE e realizar a reposição em horário previamente acordado entre as partes.

5. SAÚDE E SEGURANÇA

5.1. O(A) CONTRATANTE declara estar ciente dos riscos inerentes à prática de exercícios físicos e compromete-se a comunicar ao CONTRATADO qualquer alteração em seu estado de saúde.

5.2. O CONTRATADO poderá adaptar, interromper ou modificar o treinamento sempre que identificar necessidade relacionada à segurança ou às condições apresentadas pelo(a) CONTRATANTE.

5.3. Quando necessário, o CONTRATADO poderá recomendar avaliação médica ou de outro profissional de saúde antes da continuidade ou progressão do treinamento.

6. RESPONSABILIDADES DO(A) CONTRATANTE

6.1. O(A) CONTRATANTE compromete-se a seguir as orientações fornecidas pelo CONTRATADO e comunicar imediatamente qualquer dor, desconforto, tontura, mal-estar ou outro sintoma apresentado durante a atividade.

6.2. O(A) CONTRATANTE é responsável pela veracidade e atualização das informações fornecidas ao CONTRATADO.

7. USO DE IMAGEM

7.1. O(A) CONTRATANTE autoriza expressamente e gratuitamente o CONTRATADO a utilizar sua imagem, voz e depoimentos eventualmente registrados durante a prestação dos serviços, para fins de divulgação profissional, institucional, publicitária e de conteúdo relacionado ao trabalho do CONTRATADO.

7.2. A autorização compreende a utilização das imagens e conteúdos em redes sociais, site, materiais digitais, materiais impressos, apresentações, portfólio e demais canais de divulgação profissional do CONTRATADO.

7.3. O uso da imagem deverá estar relacionado à divulgação do trabalho profissional do CONTRATADO, não podendo ser utilizado de forma que possa causar constrangimento, exposição indevida ou prejuízo à imagem do(a) CONTRATANTE.

8. DADOS E CONFIDENCIALIDADE

8.1. Os dados pessoais fornecidos pelo(a) CONTRATANTE serão utilizados para fins relacionados à prestação, acompanhamento e gestão dos serviços contratados, observada a legislação aplicável.

8.2. O CONTRATADO compromete-se a manter sigilo sobre informações pessoais e informações relacionadas ao acompanhamento do(a) CONTRATANTE, ressalvadas as hipóteses previstas em lei.

9. CANCELAMENTO E RESCISÃO

9.1. O presente contrato poderá ser encerrado por qualquer das partes mediante comunicação prévia de ______ dias.

9.2. O encerramento do contrato não elimina eventuais valores já vencidos ou obrigações constituídas durante sua vigência.

9.3. Em caso de inadimplência, o CONTRATADO poderá suspender a prestação dos serviços até a regularização dos valores pendentes.

10. DISPOSIÇÕES GERAIS

10.1. Eventuais concessões ou flexibilizações realizadas pelo CONTRATADO em situações específicas não implicam alteração permanente das condições deste contrato.

10.2. Qualquer alteração nas condições contratadas deverá ser previamente acordada entre as partes.

10.3. A prestação dos serviços possui caráter individualizado e constitui obrigação de meio, não havendo garantia de resultado específico, uma vez que os resultados dependem também da adesão do(a) CONTRATANTE aos treinamentos e de outros fatores individuais.

11. FORO

11.1. Fica eleito o foro da comarca de ________________________________, respeitadas as regras legais de competência aplicáveis, para dirimir eventuais questões decorrentes deste contrato.

Ao assinar eletronicamente este documento em {data}, o(a) CONTRATANTE declara ter lido, compreendido e concordado com todos os termos acima descritos, valendo esta assinatura eletrônica (nome digitado + assinatura manuscrita capturada em tela) como manifestação de vontade válida entre as partes.`;
const CONTRATO_MODELO_AVULSO_TEXTO = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PERSONAL TRAINER — AULA AVULSA (PRESENCIAL)

Pelo presente instrumento, de um lado:

CONTRATADO: Wellington Fabiano Brito, Personal Trainer, CREF nº ____________, CPF nº ____________;

e, de outro:

CONTRATANTE: {nome}, CPF nº {cpf};

têm entre si justo e contratado o presente Contrato de Prestação de Serviços de Personal Trainer na modalidade de aula avulsa, mediante as condições abaixo.

1. OBJETO

1.1. O presente contrato tem como objeto a prestação de serviços de Personal Trainer na modalidade de aula avulsa presencial, incluindo planejamento, orientação e supervisão individualizada de exercícios físicos na sessão contratada.

1.2. A contratação ocorre por aula avulsa, sem vínculo de mensalidade fixa, plano recorrente ou reserva permanente de horário, podendo o(a) CONTRATANTE contratar novas aulas avulsas a qualquer momento, mediante disponibilidade de agenda do CONTRATADO.

1.3. O(A) CONTRATANTE compromete-se a fornecer informações verdadeiras sobre seu estado de saúde, limitações, lesões, medicamentos e demais condições relevantes para a prática de exercícios físicos.

2. AGENDAMENTO

2.1. Modalidade contratada: {plano}.

2.2. Cada aula avulsa é agendada individualmente, mediante prévio acordo entre as partes quanto a dia e horário, não havendo reserva fixa e recorrente de horário como ocorre em planos mensais.

2.3. A confirmação do agendamento de uma aula avulsa não gera obrigação de contratação de novas aulas, tampouco caracteriza início de plano mensal.

3. VALOR E PAGAMENTO

3.1. Pela prestação de cada aula avulsa, o(a) CONTRATANTE pagará ao CONTRATADO o valor de: {valor}.

3.2. O pagamento deverá ser realizado antes do início da aula ou no próprio dia, por meio de Pix, salvo acordo diverso entre as partes.

3.3. Cada aula avulsa é cobrada individualmente, não havendo desconto automático por eventual contratação de múltiplas aulas, exceto quando expressamente acordado entre as partes.

4. CANCELAMENTO E REMARCAÇÃO DA AULA

4.1. O(A) CONTRATANTE poderá cancelar ou remarcar a aula agendada sem custo, desde que comunique o CONTRATADO com antecedência mínima de 24 (vinte e quatro) horas do horário marcado.

4.2. Cancelamentos ou faltas comunicados com menos de 24 (vinte e quatro) horas de antecedência, ou a ausência não comunicada (no-show), poderão ser cobrados integralmente, uma vez que o horário foi reservado exclusivamente para o(a) CONTRATANTE.

4.3. Caso o CONTRATADO não possa realizar a aula previamente agendada, deverá comunicar o(a) CONTRATANTE e propor nova data, sem custo adicional.

5. SAÚDE E SEGURANÇA

5.1. O(A) CONTRATANTE declara estar ciente dos riscos inerentes à prática de exercícios físicos e compromete-se a comunicar ao CONTRATADO qualquer alteração em seu estado de saúde.

5.2. O CONTRATADO poderá adaptar, interromper ou modificar a aula sempre que identificar necessidade relacionada à segurança ou às condições apresentadas pelo(a) CONTRATANTE.

5.3. Quando necessário, o CONTRATADO poderá recomendar avaliação médica ou de outro profissional de saúde antes da continuidade do treinamento.

6. RESPONSABILIDADES DO(A) CONTRATANTE

6.1. O(A) CONTRATANTE compromete-se a seguir as orientações fornecidas pelo CONTRATADO e comunicar imediatamente qualquer dor, desconforto, tontura, mal-estar ou outro sintoma apresentado durante a atividade.

6.2. O(A) CONTRATANTE é responsável pela veracidade e atualização das informações fornecidas ao CONTRATADO.

7. USO DE IMAGEM

7.1. O(A) CONTRATANTE autoriza expressamente e gratuitamente o CONTRATADO a utilizar sua imagem, voz e depoimentos eventualmente registrados durante a prestação dos serviços, para fins de divulgação profissional, institucional, publicitária e de conteúdo relacionado ao trabalho do CONTRATADO.

7.2. A autorização compreende a utilização das imagens e conteúdos em redes sociais, site, materiais digitais, materiais impressos, apresentações, portfólio e demais canais de divulgação profissional do CONTRATADO.

7.3. O uso da imagem deverá estar relacionado à divulgação do trabalho profissional do CONTRATADO, não podendo ser utilizado de forma que possa causar constrangimento, exposição indevida ou prejuízo à imagem do(a) CONTRATANTE.

8. DADOS E CONFIDENCIALIDADE

8.1. Os dados pessoais fornecidos pelo(a) CONTRATANTE serão utilizados para fins relacionados à prestação, acompanhamento e gestão dos serviços contratados, observada a legislação aplicável.

8.2. O CONTRATADO compromete-se a manter sigilo sobre informações pessoais e informações relacionadas ao acompanhamento do(a) CONTRATANTE, ressalvadas as hipóteses previstas em lei.

9. VALIDADE

9.1. Este contrato regula os termos gerais aplicáveis a toda aula avulsa contratada entre as partes, permanecendo válido para as aulas avulsas subsequentes, nos mesmos termos, até que seja rescindido por qualquer das partes ou substituído por outro instrumento contratual, como um contrato de plano mensal.

9.2. Em caso de inadimplência relativa a aula(s) já realizada(s), o CONTRATADO poderá suspender o agendamento de novas aulas até a regularização dos valores pendentes.

10. DISPOSIÇÕES GERAIS

10.1. Eventuais concessões ou flexibilizações realizadas pelo CONTRATADO em situações específicas não implicam alteração permanente das condições deste contrato.

10.2. Qualquer alteração nas condições contratadas deverá ser previamente acordada entre as partes.

10.3. A prestação dos serviços possui caráter individualizado e constitui obrigação de meio, não havendo garantia de resultado específico, uma vez que os resultados dependem também da adesão do(a) CONTRATANTE aos treinamentos e de outros fatores individuais.

11. FORO

11.1. Fica eleito o foro da comarca de ________________________________, respeitadas as regras legais de competência aplicáveis, para dirimir eventuais questões decorrentes deste contrato.

Ao assinar eletronicamente este documento em {data}, o(a) CONTRATANTE declara ter lido, compreendido e concordado com todos os termos acima descritos, valendo esta assinatura eletrônica (nome digitado + assinatura manuscrita capturada em tela) como manifestação de vontade válida entre as partes.`;
const classifyAHA = (s) => s <= 1 ? { label: "Baixo Risco", color: "#16a34a", bg: "#dcfce7" } : s <= 4 ? { label: "Risco Moderado", color: "#d97706", bg: "#fef9c3" } : { label: "Alto Risco", color: "#dc2626", bg: "#fee2e2" };
const classifyCV = (pct) => pct >= 92 ? { label: "Baixo Risco", color: "#16a34a", bg: "#dcfce7" } : pct >= 69 ? { label: "Risco Moderado", color: "#d97706", bg: "#fef9c3" } : { label: "Alto Risco", color: "#dc2626", bg: "#fee2e2" };
const classifyFunctional = (s) => s >= 80 ? { label: "Fisicamente Elite", color: "#16a34a", bg: "#dcfce7" } : s >= 60 ? { label: "Fisicamente Ativo", color: "#65a30d", bg: "#ecfccb" } : s >= 40 ? { label: "Fisicamente Independente", color: "#d97706", bg: "#fef9c3" } : s >= 20 ? { label: "Fisicamente Frágil", color: "#ea580c", bg: "#ffedd5" } : { label: "Fisicamente Dependente", color: "#dc2626", bg: "#fee2e2" };
const classifyFitness = (s) => s >= 80 ? { label: "Excelente", color: "#16a34a", bg: "#dcfce7" } : s >= 60 ? { label: "Bom", color: "#65a30d", bg: "#ecfccb" } : s >= 40 ? { label: "Regular", color: "#d97706", bg: "#fef9c3" } : { label: "Fraco", color: "#dc2626", bg: "#fee2e2" };
const classifyCognitive = (s) => s >= 80 ? { label: "Excelente", color: "#16a34a", bg: "#dcfce7" } : s >= 65 ? { label: "Bom", color: "#65a30d", bg: "#ecfccb" } : s >= 50 ? { label: "Regular", color: "#d97706", bg: "#fef9c3" } : { label: "Comprometido", color: "#dc2626", bg: "#fee2e2" };
const classifyGlobal = (s) => s >= 75 ? { label: "Ótimo", color: "#16a34a", bg: "#dcfce7" } : s >= 55 ? { label: "Bom", color: "#65a30d", bg: "#ecfccb" } : s >= 35 ? { label: "Regular", color: "#d97706", bg: "#fef9c3" } : { label: "Crítico", color: "#dc2626", bg: "#fee2e2" };
const classifyChairStand = (v, sex) => {
  const n = parseFloat(v);
  if (!n) return null;
  const isMale = sex === "M";
  if (n >= (isMale ? 15 : 13)) return { label: "Excelente", desc: "Força de membros inferiores muito acima da média para a faixa etária.", color: "#16a34a", bg: "#dcfce7" };
  if (n >= (isMale ? 12 : 10)) return { label: "Bom", desc: "Força de MMII adequada. Bom preditor de mobilidade e prevenção de quedas.", color: "#65a30d", bg: "#ecfccb" };
  if (n >= (isMale ? 9 : 7)) return { label: "Regular", desc: "Força de MMII abaixo do esperado. Indica necessidade de treino de fortalecimento.", color: "#d97706", bg: "#fef9c3" };
  return { label: "Fraco", desc: "Força de MMII significativamente reduzida. Alto risco de quedas e perda de independência funcional.", color: "#dc2626", bg: "#fee2e2" };
};
const classifyHandGrip = (v, sex) => {
  const n = parseFloat(v);
  if (!n) return null;
  const isMale = sex === "M";
  if (n >= (isMale ? 35 : 23)) return { label: "Excelente", desc: "Força de preensão excelente. Indicador de força muscular global acima da média.", color: "#16a34a", bg: "#dcfce7" };
  if (n >= (isMale ? 27 : 18)) return { label: "Bom", desc: "Força de preensão adequada. Associada a menor risco de mortalidade cardiovascular.", color: "#65a30d", bg: "#ecfccb" };
  if (n >= (isMale ? 20 : 14)) return { label: "Regular", desc: "Força de preensão reduzida. Possível indicativo de sarcopenia inicial.", color: "#d97706", bg: "#fef9c3" };
  return { label: "Fraco", desc: "Força de preensão muito baixa. Forte indicador de sarcopenia e fragilidade. Intervenção prioritária.", color: "#dc2626", bg: "#fee2e2" };
};
const classifyBalance1Leg = (v) => {
  const n = parseFloat(v);
  if (!n && v !== "0") return null;
  if (n >= 30) return { label: "Excelente", desc: "Equilíbrio estático excelente. Baixo risco de quedas.", color: "#16a34a", bg: "#dcfce7" };
  if (n >= 20) return { label: "Bom", desc: "Equilíbrio adequado para a faixa etária.", color: "#65a30d", bg: "#ecfccb" };
  if (n >= 10) return { label: "Regular", desc: "Equilíbrio reduzido. Risco moderado de quedas. Treino de equilíbrio indicado.", color: "#d97706", bg: "#fef9c3" };
  if (n >= 5) return { label: "Fraco", desc: "Equilíbrio comprometido. Risco elevado de quedas. Intervenção urgente.", color: "#ea580c", bg: "#ffedd5" };
  return { label: "Crítico", desc: "Incapaz de manter equilíbrio unipodal. Risco muito alto de quedas.", color: "#dc2626", bg: "#fee2e2" };
};
const classifyTUG = (v) => {
  const n = parseFloat(v);
  if (!n) return null;
  if (n <= 10) return { label: "Normal", desc: "Mobilidade e equilíbrio dinâmico dentro do esperado para adultos 50+. Risco baixo de quedas.", color: "#16a34a", bg: "#dcfce7" };
  if (n <= 13.5) return { label: "Risco Leve", desc: "Mobilidade levemente comprometida. Atenção redobrada em ambientes com obstáculos.", color: "#65a30d", bg: "#ecfccb" };
  if (n <= 16) return { label: "Risco Moderado", desc: "Comprometimento de marcha e equilíbrio dinâmico. Risco moderado de quedas. Fisioterapia indicada.", color: "#d97706", bg: "#fef9c3" };
  return { label: "Risco Alto", desc: "TUG > 16s. Alto risco de quedas. Mobilidade significativamente comprometida. Avaliação especializada urgente.", color: "#dc2626", bg: "#fee2e2" };
};
const classifySitReach = (v) => {
  const n = parseFloat(v);
  if (v === "" || v === void 0 || v === null) return null;
  if (n >= 20) return { label: "Excelente", desc: "Flexibilidade de cadeia posterior excelente.", color: "#16a34a", bg: "#dcfce7" };
  if (n >= 10) return { label: "Boa", desc: "Flexibilidade adequada. Manter com exercícios de mobilidade.", color: "#65a30d", bg: "#ecfccb" };
  if (n >= 0) return { label: "Regular", desc: "Flexibilidade abaixo da média. Risco de dores lombares e lesões.", color: "#d97706", bg: "#fef9c3" };
  return { label: "Reduzida", desc: "Flexibilidade muito limitada. Encurtamento de isquiotibiais e lombar. Alongamento diário recomendado.", color: "#dc2626", bg: "#fee2e2" };
};
const classifyMarch = (v, sex) => {
  const n = parseFloat(v);
  if (!n) return null;
  const isMale = sex === "M";
  if (n >= (isMale ? 107 : 100)) return { label: "Excelente", desc: "Resistência aeróbica e coordenação motora excelentes para a faixa etária. Ótima capacidade funcional cardiorrespiratória.", color: "#16a34a", bg: "#dcfce7" };
  if (n >= (isMale ? 89 : 83)) return { label: "Bom", desc: "Boa resistência aeróbica. Capacidade funcional preservada. Manter programa de caminhada e exercício aeróbico.", color: "#65a30d", bg: "#ecfccb" };
  if (n >= (isMale ? 71 : 65)) return { label: "Regular", desc: "Resistência aeróbica abaixo da média. Indica início de declínio cardiorrespiratório. Treino aeróbico progressivo recomendado.", color: "#d97706", bg: "#fef9c3" };
  return { label: "Fraco", desc: "Resistência aeróbica significativamente comprometida. Alto risco de limitação funcional. Encaminhamento para avaliação médica e reabilitação indicado.", color: "#dc2626", bg: "#fee2e2" };
};
const classifyVO2 = (vo2, age, sex) => {
  const n = parseFloat(vo2);
  if (!n) return null;
  const isMale = sex === "M";
  const a = parseFloat(age);
  let excellent, good, aboveAvg, avg, belowAvg;
  if (isMale) {
    if (a < 30) {
      excellent = 55.9;
      good = 51;
      aboveAvg = 45.2;
      avg = 41;
      belowAvg = 37.1;
    } else if (a < 40) {
      excellent = 54;
      good = 48.3;
      aboveAvg = 43.8;
      avg = 39.5;
      belowAvg = 35.5;
    } else if (a < 50) {
      excellent = 52.5;
      good = 46.5;
      aboveAvg = 41;
      avg = 36.8;
      belowAvg = 33;
    } else if (a < 60) {
      excellent = 48.9;
      good = 43.4;
      aboveAvg = 38.3;
      avg = 34.6;
      belowAvg = 30.2;
    } else {
      excellent = 45;
      good = 39.5;
      aboveAvg = 34.6;
      avg = 31;
      belowAvg = 26.4;
    }
  } else {
    if (a < 30) {
      excellent = 49.6;
      good = 43.9;
      aboveAvg = 39.5;
      avg = 35.4;
      belowAvg = 31.6;
    } else if (a < 40) {
      excellent = 47.4;
      good = 42.4;
      aboveAvg = 37.8;
      avg = 33.8;
      belowAvg = 29.9;
    } else if (a < 50) {
      excellent = 45.2;
      good = 39.7;
      aboveAvg = 35.7;
      avg = 31.6;
      belowAvg = 27.5;
    } else if (a < 60) {
      excellent = 40;
      good = 35.7;
      aboveAvg = 31.6;
      avg = 28.7;
      belowAvg = 24.5;
    } else {
      excellent = 37.8;
      good = 32.3;
      aboveAvg = 28.7;
      avg = 25.8;
      belowAvg = 22;
    }
  }
  if (n >= excellent) return { label: "Excelente", desc: "VO₂máx muito acima da média para sexo e faixa etária. Excelente aptidão cardiorrespiratória.", color: "#16a34a", bg: "#dcfce7" };
  if (n >= good) return { label: "Bom", desc: "Boa aptidão cardiorrespiratória. Risco reduzido de doenças cardiovasculares.", color: "#65a30d", bg: "#ecfccb" };
  if (n >= aboveAvg) return { label: "Acima da Média", desc: "Capacidade aeróbica acima da média. Manter programa de exercícios regulares.", color: "#84cc16", bg: "#f7fee7" };
  if (n >= avg) return { label: "Média", desc: "Aptidão cardiorrespiratória dentro da média. Exercício aeróbico regular recomendado.", color: "#d97706", bg: "#fef9c3" };
  if (n >= belowAvg) return { label: "Abaixo da Média", desc: "Capacidade aeróbica abaixo da média. Programa aeróbico progressivo indicado (ACSM).", color: "#ea580c", bg: "#ffedd5" };
  return { label: "Fraco", desc: "VO₂máx significativamente baixo. Risco aumentado de doenças cardiovasculares. Intervenção prioritária.", color: "#dc2626", bg: "#fee2e2" };
};
const classifySPPBBalance = (sideScore, semiScore, tandemScore) => {
  const s = parseInt(sideScore) || 0;
  const semi = parseInt(semiScore) || 0;
  const tandem = parseInt(tandemScore) || 0;
  const total = s === 0 ? 0 : semi + tandem;
  if (total === 3) return { label: "Excelente (3/3)", desc: "Equilíbrio estático preservado em todos os níveis. Baixo risco de quedas (SPPB).", color: "#16a34a", bg: "#dcfce7", score: total };
  if (total === 2) return { label: "Bom (2/3)", desc: "Bom equilíbrio. Tandem com tempo parcial.", color: "#65a30d", bg: "#ecfccb", score: total };
  if (total === 1) return { label: "Regular (1/3)", desc: "Equilíbrio reduzido. Dificuldade no tandem. Treino de equilíbrio indicado.", color: "#d97706", bg: "#fef9c3", score: total };
  return { label: "Muito Comprometido (0/3)", desc: "Incapaz de manter posições de equilíbrio. Risco muito alto de quedas.", color: "#dc2626", bg: "#fee2e2", score: 0 };
};
const classifySPPBBalanceScore = (totalScore) => {
  const total = parseInt(totalScore) || 0;
  if (total === 3) return { label: "Excelente (3/3)", desc: "Equilíbrio estático preservado em todos os níveis. Baixo risco de quedas (SPPB).", color: "#16a34a", bg: "#dcfce7", score: total };
  if (total === 2) return { label: "Bom (2/3)", desc: "Bom equilíbrio. Tandem com tempo parcial.", color: "#65a30d", bg: "#ecfccb", score: total };
  if (total === 1) return { label: "Regular (1/3)", desc: "Equilíbrio reduzido. Dificuldade no tandem. Treino de equilíbrio indicado.", color: "#d97706", bg: "#fef9c3", score: total };
  return { label: "Muito Comprometido (0/3)", desc: "Incapaz de manter posições de equilíbrio. Risco muito alto de quedas.", color: "#dc2626", bg: "#fee2e2", score: 0 };
};
const classifySPPBChairStand = (v) => {
  if (v === "unable" || v === "0" || v === "") return { label: "Incapaz (0 pt)", desc: "Incapaz de completar 5 repetições. Fraqueza severa de MMII. Intervenção imediata necessária.", color: "#dc2626", bg: "#fee2e2", score: 0 };
  const n = parseFloat(v);
  if (!n) return null;
  if (n <= 11.19) return { label: "Excelente (4 pts)", desc: "Força de MMII excelente. ≤11.19s — máxima pontuação SPPB.", color: "#16a34a", bg: "#dcfce7", score: 4 };
  if (n <= 13.69) return { label: "Bom (3 pts)", desc: "Boa força de MMII. 11.20–13.69s.", color: "#65a30d", bg: "#ecfccb", score: 3 };
  if (n <= 16.69) return { label: "Regular (2 pts)", desc: "Força de MMII moderada. 13.70–16.69s.", color: "#d97706", bg: "#fef9c3", score: 2 };
  return { label: "Fraco (1 pt)", desc: "Força de MMII reduzida. >16.69s — risco funcional aumentado.", color: "#ea580c", bg: "#ffedd5", score: 1 };
};
const classifyBMI = (v) => {
  const n = parseFloat(v);
  if (!n) return null;
  if (n < 18.5) return { label: "Baixo Peso", desc: "IMC abaixo do esperado. Risco de desnutrição e sarcopenia. Avaliar composição corporal.", color: "#6366f1", bg: "#eef2ff" };
  if (n < 25) return { label: "Peso Normal", desc: "IMC dentro da faixa saudável. Manter hábitos de vida ativos e alimentação equilibrada.", color: "#16a34a", bg: "#dcfce7" };
  if (n < 30) return { label: "Sobrepeso", desc: "IMC entre 25-29,9. Risco moderado de doenças metabólicas. Exercício aeróbico e controle alimentar indicados.", color: "#d97706", bg: "#fef9c3" };
  if (n < 35) return { label: "Obesidade Grau I", desc: "IMC entre 30-34,9. Risco elevado de DCV, diabetes e síndrome metabólica. Intervenção prioritária (ACSM/AHA).", color: "#ea580c", bg: "#ffedd5" };
  if (n < 40) return { label: "Obesidade Grau II", desc: "IMC entre 35-39,9. Risco muito elevado. Avaliação médica obrigatória antes de exercícios de alta intensidade.", color: "#dc2626", bg: "#fee2e2" };
  return { label: "Obesidade Grau III", desc: "IMC ≥ 40. Risco extremo. Encaminhamento médico urgente. Exercício supervisionado com baixíssima intensidade inicial.", color: "#7f1d1d", bg: "#fee2e2" };
};
const classifyRCQ = (waist, hip, sex) => {
  const w = parseFloat(waist), h = parseFloat(hip);
  if (!w || !h) return null;
  const rcq = (w / h).toFixed(2);
  const isMale = sex === "M";
  let label, desc, color, bg;
  if (isMale) {
    if (w / h < 0.9) {
      label = "Baixo Risco";
      desc = "RCQ " + rcq + " — distribuição de gordura sem risco cardiovascular aumentado.";
      color = "#16a34a";
      bg = "#dcfce7";
    } else if (w / h < 1) {
      label = "Risco Moderado";
      desc = "RCQ " + rcq + " — risco cardiovascular moderado. Exercício aeróbico e controle alimentar indicados (AHA).";
      color = "#d97706";
      bg = "#fef9c3";
    } else {
      label = "Risco Alto";
      desc = "RCQ " + rcq + " — distribuição androide de gordura com risco cardiovascular elevado. Intervenção prioritária (AHA).";
      color = "#dc2626";
      bg = "#fee2e2";
    }
  } else {
    if (w / h < 0.8) {
      label = "Baixo Risco";
      desc = "RCQ " + rcq + " — distribuição de gordura sem risco cardiovascular aumentado.";
      color = "#16a34a";
      bg = "#dcfce7";
    } else if (w / h < 0.85) {
      label = "Risco Moderado";
      desc = "RCQ " + rcq + " — risco cardiovascular moderado. Exercício aeróbico e controle alimentar indicados (AHA).";
      color = "#d97706";
      bg = "#fef9c3";
    } else {
      label = "Risco Alto";
      desc = "RCQ " + rcq + " — distribuição androide de gordura com risco cardiovascular elevado. Intervenção prioritária (AHA).";
      color = "#dc2626";
      bg = "#fee2e2";
    }
  }
  return { label, desc, color, bg, rcq };
};
const classifyCalf = (v, sex) => {
  const n = parseFloat(v);
  if (!n) return null;
  const cutoff = sex === "M" ? 34 : 33;
  if (n < 31) return { label: "Risco Alto de Sarcopenia", desc: `Circunferência < 31 cm. Forte indicativo de sarcopenia. Intervenção prioritária com treino de força e acompanhamento nutricional (proteína ≥ 1,2g/kg/dia).`, color: "#dc2626", bg: "#fee2e2" };
  if (n < cutoff) return { label: "Atenção — Risco Moderado", desc: `Circunferência ${n} cm (referência: ≥ ${cutoff} cm para ${sex === "M" ? "homens" : "mulheres"}). Risco aumentado de sarcopenia. Monitorar e intensificar exercícios de resistência.`, color: "#d97706", bg: "#fef9c3" };
  return { label: "Normal", desc: `Circunferência adequada. Baixo risco de sarcopenia. Manter exercícios de fortalecimento muscular regularmente.`, color: "#16a34a", bg: "#dcfce7" };
};
const getRecommendations = (pre, during, post) => {
  const recs = [];
  const pas = parseFloat(pre?.pas), pad = parseFloat(pre?.pad);
  const fc = parseFloat(pre?.fc), spo2 = parseFloat(pre?.spo2);
  const gly = parseFloat(pre?.glycemia);
  const dp = during?.pas && during?.fc ? Math.round(parseFloat(during.pas) * parseFloat(during.fc)) : null;
  const pasDuring = parseFloat(during?.pas), padDuring = parseFloat(during?.pad);
  const pasPost = parseFloat(post?.pas), padPost = parseFloat(post?.pad);
  if (pas >= 180 || pad >= 110)
    return [{ level: "stop", icon: "🚫", title: "HAS Grau 3 / Crise Hipertensiva", text: "PAS ≥ 180 ou PAD ≥ 110 mmHg. Suspender exercício imediatamente e encaminhar para avaliação médica urgente.", ref: "Zonas Longevus — PA Grau 3", color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" }];
  if (pas >= 160 || pad >= 100)
    recs.push({ level: "stop", icon: "⛔", title: "HAS Grau 2 — Suspender; Avaliar com Médico", text: "PAS 160–179 ou PAD 100–109 mmHg. Suspender atividade. Agendar avaliação médica antes de retomar exercícios.", ref: "Zonas Longevus — PA Grau 5", color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" });
  else if (pas >= 140 || pad >= 90)
    recs.push({ level: "caution", icon: "⚠️", title: "HAS Grau 1 — Exercício Leve; Acompanhar", text: "PAS 140–159 ou PAD 90–99 mmHg. Exercício de baixa intensidade (40–50% FCmáx). Caminhada leve, resistência com carga mínima. Monitorar PA a cada sessão.", ref: "Zonas Longevus — PA Grau 4", color: "#d97706", bg: "#fef9c3", border: "#fde68a" });
  else if (pas >= 130 || pad >= 85)
    recs.push({ level: "info", icon: "ℹ️", title: "Pré-hipertensão — Monitorar a Cada Sessão", text: "PAS 130–139 ou PAD 85–89 mmHg. Exercício recomendado com monitoramento. Aeróbico 60–70% FCmáx. Resistência 50–70% 1RM. Exercício regular pode reduzir PA.", ref: "Zonas Longevus — PA Grau 3", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" });
  else if (pas >= 120 || pad >= 80 && pad < 85)
    recs.push({ level: "ok", icon: "✅", title: "PA Normal — Continuar Normalmente", text: "PAS 120–129 mmHg. Sem restrição hemodinâmica. Intensidade conforme protocolo Longevus.", ref: "Zonas Longevus — PA Grau 2", color: "#16a34a", bg: "#dcfce7", border: "#86efac" });
  else if (pas > 0 && pas < 120 && pad > 0 && pad < 80)
    recs.push({ level: "ok", icon: "✅", title: "PA Ótima — Continuar Normalmente", text: "PA < 120/80 mmHg. Pressão arterial ideal. Sem restrições hemodinâmicas.", ref: "Zonas Longevus — PA Grau 1", color: "#16a34a", bg: "#dcfce7", border: "#86efac" });
  if (fc > 150)
    recs.push({ level: "stop", icon: "🚫", title: "FC Crítica — Encaminhar Imediatamente", text: "FC repouso > 150 bpm. Zona crítica. Não iniciar exercício. Verificar sintomas e acionar suporte médico.", ref: "Zonas Longevus — FC Grau 5", color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" });
  else if (fc > 110)
    recs.push({ level: "stop", icon: "⛔", title: "Taquicardia — Interromper Exercício", text: "FC repouso > 110 bpm. Taquicardia em repouso. Não iniciar exercício. Investigar causa (desidratação, estresse, medicamento, arritmia).", ref: "Zonas Longevus — FC Grau 4", color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" });
  else if (fc >= 100 && fc <= 110)
    recs.push({ level: "caution", icon: "⚠️", title: "Limite Superior FC — Monitorar com Atenção", text: "FC repouso 100–110 bpm. Iniciar com baixa intensidade (< 50% FCmáx). Monitorar FC durante toda a sessão. Verificar hidratação e medicamentos.", ref: "Zonas Longevus — FC Grau 3", color: "#d97706", bg: "#fef9c3", border: "#fde68a" });
  else if (fc >= 60 && fc <= 100)
    recs.push({ level: "ok", icon: "✅", title: "FC Normal — Zona Aeróbica Ideal", text: "FC repouso 60–100 bpm. Frequência cardíaca normal. Intensidade 50–85% FCmáx conforme protocolo.", ref: "Zonas Longevus — FC Grau 2", color: "#16a34a", bg: "#dcfce7", border: "#86efac" });
  else if (fc > 0 && fc < 60)
    recs.push({ level: "caution", icon: "⚠️", title: "Bradicardia — Investigar se Sintomático", text: "FC repouso < 60 bpm. Verificar se aluno usa beta-bloqueador (esperado). Se sintomático (tontura, cansaço): investigar antes de exercitar.", ref: "Zonas Longevus — FC Grau 1", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" });
  if (gly > 0 && gly >= 300)
    return [{ level: "stop", icon: "🚫", title: "Hiperglicemia Grave — Suspender; Encaminhar", text: "Glicemia ≥ 300 mg/dL. Risco de cetoacidose diabética. Não iniciar exercício. Encaminhar para avaliação médica.", ref: "Zonas Longevus — Glicemia Grau 6", color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" }];
  if (gly > 0 && gly < 70)
    return [{ level: "stop", icon: "🚫", title: "Hipoglicemia — Suspender; Oferecer Carboidrato", text: "Glicemia < 70 mg/dL. Hipoglicemia. Não iniciar exercício. Oferecer 15g de carboidrato de rápida absorção (suco, gel, glicose). Reavaliar em 15 min.", ref: "Zonas Longevus — Glicemia Grau 1", color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" }];
  if (gly >= 200 && gly < 300)
    recs.push({ level: "caution", icon: "⚠️", title: "Hiperglicemia — Adiar ou Reduzir Exercício", text: "Glicemia 200–299 mg/dL. Adiar exercício ou realizar apenas atividade muito leve (caminhada < 20 min). Monitorar glicemia a cada 30 min.", ref: "Zonas Longevus — Glicemia Grau 5", color: "#d97706", bg: "#fef9c3", border: "#fde68a" });
  else if (gly >= 140 && gly < 200)
    recs.push({ level: "caution", icon: "⚠️", title: "Pré-diabetes / Hiperglicemia Leve — Orientar", text: "Glicemia 140–199 mg/dL. Exercício de intensidade moderada com monitoramento. Orientar redução da intensidade. Reavaliar glicemia pós-exercício.", ref: "Zonas Longevus — Glicemia Grau 4", color: "#d97706", bg: "#fef9c3", border: "#fde68a" });
  else if (gly >= 100 && gly < 140)
    recs.push({ level: "ok", icon: "✅", title: "Glicemia Normal — Continuar Normalmente", text: "Glicemia 100–139 mg/dL. Dentro da faixa normal para exercício. Monitorar conforme protocolo Longevus.", ref: "Zonas Longevus — Glicemia Grau 3", color: "#16a34a", bg: "#dcfce7", border: "#86efac" });
  else if (gly >= 70 && gly < 100)
    recs.push({ level: "info", icon: "ℹ️", title: "Glicemia Limite Baixo — Monitorar; Lanche Pré-Sessão", text: "Glicemia 70–99 mg/dL. Oferecer pequeno lanche pré-exercício (15–20g carboidrato). Monitorar sinais de hipoglicemia durante a sessão.", ref: "Zonas Longevus — Glicemia Grau 2", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" });
  if (spo2 > 0 && spo2 < 90)
    return [{ level: "stop", icon: "🚫", title: "SpO₂ Crítica — Interromper Imediatamente", text: "Saturação < 90%. Interromper exercício. Posicionar aluno sentado ou em decúbito elevado. Acionar suporte médico.", ref: "ACSM — Critério de parada SpO₂", color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" }];
  if (spo2 >= 90 && spo2 < 94)
    recs.push({ level: "caution", icon: "⚠️", title: "SpO₂ Reduzida — Reduzir Intensidade", text: "Saturação 90–93%. Reduzir intensidade imediatamente. Exercícios de baixo consumo de O₂. Monitorar continuamente. Interromper se cair abaixo de 90%.", ref: "ACSM — SpO₂ zona de atenção", color: "#d97706", bg: "#fef9c3", border: "#fde68a" });
  if (dp && dp >= 28e3)
    recs.push({ level: "stop", icon: "⛔", title: "Duplo Produto Crítico — Interromper", text: "DP = " + dp.toLocaleString("pt-BR") + " mmHg·bpm. Carga cardiovascular excessiva. Interromper sessão imediatamente.", ref: "ACSM — DP > 28.000", color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" });
  else if (dp && dp >= 2e4)
    recs.push({ level: "caution", icon: "⚠️", title: "Duplo Produto — Zona de Atenção", text: "DP = " + dp.toLocaleString("pt-BR") + " mmHg·bpm. Manter intensidade. Monitorar sinais e sintomas continuamente.", ref: "ACSM — DP 20.000–28.000", color: "#d97706", bg: "#fef9c3", border: "#fde68a" });
  if (pasDuring >= 220 || padDuring >= 105)
    recs.push({ level: "stop", icon: "⛔", title: "PA Crítica Durante Exercício", text: "PAS ≥ 220 ou PAD ≥ 105 mmHg durante esforço. Critério de parada imediata (ACSM).", ref: "ACSM — Critério de parada", color: "#dc2626", bg: "#fee2e2", border: "#fca5a5" });
  if (pasPost > 0 && pas > 0 && pasPost > pas + 20)
    recs.push({ level: "caution", icon: "⚠️", title: "Resposta Pressórica Pós-Exercício", text: "PAS pós-exercício significativamente acima do valor pré. Prolongar volta à calma. Não interromper abruptamente. Monitorar por 20–30 min.", ref: "ACSM", color: "#d97706", bg: "#fef9c3", border: "#fde68a" });
  return recs;
};
const I = ({ n, s = 20, c = "currentColor" }) => {
  const paths = {
    home: ["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
    users: ["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"],
    clip: ["M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2", "M9 3h6v4H9z", "M9 12h6", "M9 16h4"],
    act: ["M22 12h-4l-3 9L9 3l-3 9H2"],
    bar: ["M18 20V10", "M12 20V4", "M6 20v-6"],
    plus: ["M12 5v14", "M5 12h14"],
    back: ["M15 18l-6-6 6-6"],
    check: ["M20 6L9 17l-5-5"],
    trash: ["M3 6h18", "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6", "M10 11v6", "M14 11v6", "M9 6V4h6v2"],
    edit: ["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"],
    eye: ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
    x: ["M18 6L6 18", "M6 6l12 12"],
    zap: ["M13 2L3 14h9l-1 8 10-12h-9z"],
    user: ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
    link: ["M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71", "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"],
    inbox: ["M22 12h-6l-2 3h-4l-2-3H2", "M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"],
    calendar: ["M8 2v4", "M16 2v4", "M3 10h18", "M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"],
    money: ["M12 1v22", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"],
    bell: ["M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 0 1-3.46 0"],
    download: ["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"],
    timer: ["M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M12 9v4l2 2", "M10 2h4"],
    store: ["M3 9l1.5-5h15L21 9", "M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z", "M5 12v8h14v-8"],
    building: ["M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16", "M16 9h3a1 1 0 0 1 1 1v11", "M8 7h4", "M8 11h4", "M8 15h4", "M2 21h20"],
    folder: ["M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M12 10v6", "M9 13l3 3 3-3"],
    send: ["M22 2L11 13", "M22 2l-7 20-4-9-9-4z"],
    play: ["M7 4l13 8-13 8z"]
  };
  return React.createElement("svg", { width: s, height: s, fill: "none", stroke: c, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24" }, (paths[n] || []).map((d, i) => React.createElement("path", { key: i, d })));
};
const Badge = ({ children, color, bg }) => React.createElement("span", { style: { color, background: bg, padding: "2px 9px", borderRadius: 99, fontSize: 11, fontWeight: 700, border: `1px solid ${color}33`, whiteSpace: "nowrap" } }, children);
const Card = ({ children, style = {}, onClick }) => React.createElement("div", { onClick, style: { background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", boxShadow: "0 1px 6px #0001", padding: 18, cursor: onClick ? "pointer" : void 0, ...style } }, children);
const Btn = ({ children, onClick, variant = "primary", sm, icon, disabled, full, style = {} }) => {
  const v = { primary: { background: O, color: "#fff", boxShadow: "0 3px 12px #FF560330" }, secondary: { background: "#f1f5f9", color: "#334155" }, ghost: { background: "transparent", color: "#64748b" }, outline: { background: "transparent", color: O, border: `1.5px solid ${O}` }, danger: { background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5" } };
  return React.createElement("button", { onClick: !disabled ? onClick : void 0, style: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", border: "none", fontSize: sm ? 12 : 14, padding: sm ? "7px 13px" : "11px 20px", opacity: disabled ? 0.5 : 1, width: full ? "100%" : void 0, ...v[variant], ...style } }, icon && React.createElement(I, { n: icon, s: sm ? 14 : 16, c: v[variant].color }), children);
};
const HORAS_OPTS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTOS_OPTS = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const Inp = ({ label, value, onChange, type = "text", placeholder, min, max, step, opts, note }) => React.createElement("div", { style: { marginBottom: 13 } }, label && React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 } }, label), opts ? React.createElement("select", { value, onChange: (e) => onChange(e.target.value), style: { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, color: "#0f172a" } }, opts.map((o) => React.createElement("option", { key: o.v, value: o.v }, o.l))) : type === "time" ? (() => {
  const [h, m] = (value || "").split(":");
  const selStyle = { flex: 1, padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, color: "#0f172a" };
  return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, React.createElement("select", { value: h || "", onChange: (e) => onChange(`${e.target.value}:${m || "00"}`), style: selStyle }, React.createElement("option", { value: "" }, "--"), HORAS_OPTS.map((hh) => React.createElement("option", { key: hh, value: hh }, hh))), React.createElement("span", { style: { fontWeight: 800, color: "#94a3b8" } }, ":"), React.createElement("select", { value: m && MINUTOS_OPTS.includes(m) ? m : m || "", onChange: (e) => onChange(`${h || "00"}:${e.target.value}`), style: selStyle }, React.createElement("option", { value: "" }, "--"), MINUTOS_OPTS.map((mm) => React.createElement("option", { key: mm, value: mm }, mm))));
})() : React.createElement("input", { type, value, onChange: (e) => onChange(e.target.value), placeholder, min, max, step, style: { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, color: "#0f172a", boxSizing: "border-box" } }), note && React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 4 } }, note));
const Modal = ({ title, onClose, children }) => React.createElement("div", { style: { position: "fixed", inset: 0, background: "#0009", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 999 } }, React.createElement("div", { style: { background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 600, maxHeight: "85vh", overflowY: "auto", paddingBottom: 80 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff", zIndex: 10 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 17, color: "#0f172a" } }, title), React.createElement("button", { onClick: onClose, style: { background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" } }, React.createElement(I, { n: "x", s: 15 }))), React.createElement("div", { style: { padding: "18px 20px 20px" } }, children)));
const ScoreRing = ({ score, label, size = 88, color: colorProp }) => {
  const r = size / 2 - 8, circ = 2 * Math.PI * r, offset = circ - Math.min(100, Math.max(0, score)) / 100 * circ;
  const color = colorProp || (score >= 75 ? "#16a34a" : score >= 55 ? "#65a30d" : score >= 35 ? "#d97706" : "#dc2626");
  return React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4 } }, React.createElement("div", { style: { position: "relative", width: size, height: size } }, React.createElement("svg", { width: size, height: size, style: { position: "absolute", top: 0, left: 0 } }, React.createElement("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: "#e2e8f0", strokeWidth: "7" }), React.createElement("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: color, strokeWidth: "7", strokeDasharray: circ, strokeDashoffset: offset, strokeLinecap: "round", transform: "rotate(-90 " + size / 2 + " " + size / 2 + ")" })), React.createElement("div", { style: { position: "absolute", top: 0, left: 0, width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 17, color: "#0f172a" } }, Math.round(score))), React.createElement("div", { style: { fontSize: 11, fontWeight: 600, color: "#64748b", textAlign: "center" } }, label));
};
const Met = ({ lbl, val, unit, c }) => React.createElement("div", { style: { background: c + "14", borderRadius: 8, padding: "6px 10px", textAlign: "center", minWidth: 58 } }, React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: c, textTransform: "uppercase" } }, lbl), React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: "#0f172a" } }, val), React.createElement("div", { style: { fontSize: 9, color: "#94a3b8" } }, unit));
const RecBox = ({ recs }) => {
  if (!recs || recs.length === 0) return null;
  return React.createElement("div", { style: { marginTop: 14 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" } }, "📋 Recomendações ACSM / AHA"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, recs.map((r, i) => React.createElement("div", { key: i, style: { background: r.bg, border: `1.5px solid ${r.border}`, borderRadius: 12, padding: "12px 14px" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 7, marginBottom: 5 } }, React.createElement("span", { style: { fontSize: 15 } }, r.icon), React.createElement("span", { style: { fontWeight: 700, fontSize: 13, color: r.color } }, r.title)), React.createElement("div", { style: { fontSize: 13, color: "#334155", lineHeight: 1.55 } }, r.text), React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", marginTop: 5, fontStyle: "italic" } }, "Ref: ", r.ref)))));
};
const TestResult = ({ cl }) => {
  if (!cl) return null;
  return React.createElement("div", { style: { background: cl.bg, border: `1.5px solid ${cl.color}33`, borderRadius: 9, padding: "9px 12px", marginTop: 4, marginBottom: 8 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: cl.color, marginBottom: 3 } }, cl.label), React.createElement("div", { style: { fontSize: 12, color: "#475569", lineHeight: 1.5 } }, cl.desc));
};
const IndicacoesInicio = ({ students, setStudents, setLeads }) => {
  const [lista, setLista] = useState([]);
  const carregar = async () => {
    try {
      const headers = await DB.authHeaders();
      const r = await fetch(SUPA_URL + "/rest/v1/indicacoes?select=*&status=in.(enviado,conversa)&order=created_at.desc&limit=60", { headers });
      if (!r.ok) return;
      const rows = await r.json();
      setLista(rows || []);
      const novos = (rows || []).filter((x) => !x.lead_criado);
      if (novos.length && setLeads) {
        const agora = (new Date()).toISOString();
        setLeads((p) => {
          let out = [...p];
          novos.forEach((x) => {
            const st = students.find((z) => String(z.id) === String(x.student_id));
            const num = String(x.whatsapp || "").replace(/\D/g, "");
            if (num && out.some((l) => String(l.whatsapp || "").replace(/\D/g, "").slice(-9) === num.slice(-9))) return;
            out.push({ id: uid(), name: x.nome, whatsapp: x.whatsapp || "", instagram: "", idade: "", sexo: "", origem: "Indicação de aluno", indicadoPor: st ? st.name : "", objetivo: "", necessidade: "Indique e ganhe", temperatura: "quente", etapa: "novo", status: "ativo", obs: "", proximaAcaoTipo: "Enviar mensagem", proximaAcaoData: todayStr(), proximaAcaoHorario: "", proximaAcaoObs: "Chamar a indicação", motivoNaoFechamento: "", motivoObs: "", valorPotencial: "", createdAt: todayStr(), historico: [{ ts: agora, texto: "Indicação de " + (st ? st.name : "aluno") + " pelo app" }] });
          });
          return out;
        });
        for (const x of novos) {
          try {
            await fetch(SUPA_URL + "/rest/v1/indicacoes?id=eq." + encodeURIComponent(x.id), { method: "PATCH", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify({ lead_criado: true }) });
          } catch (e) {
          }
        }
      }
    } catch (e) {
    }
  };
  useEffect(() => {
    carregar();
  }, []);
  const patch = async (x, corpo) => {
    try {
      const headers = await DB.authHeaders();
      await fetch(SUPA_URL + "/rest/v1/indicacoes?id=eq." + encodeURIComponent(x.id), { method: "PATCH", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify({ ...corpo, atualizado_em: (new Date()).toISOString() }) });
    } catch (e) {
    }
  };
  const aplicarPremio = (x) => {
    const pr = x.premio || {};
    const hoje = todayStr();
    const mais30 = (base) => {
      const d = new Date((base && base > hoje ? base : hoje) + "T12:00:00");
      d.setDate(d.getDate() + 30);
      return toISODateLocal(d);
    };
    setStudents((p) => p.map((z) => {
      if (String(z.id) !== String(x.student_id)) return z;
      if (pr.tipo === "mente" || pr.tipo === "l360") {
        const k = pr.tipo;
        const l = z[k] || {};
        if (l.status === "pago" && l.vencimento && l.vencimento >= hoje) return { ...z, [k]: { ...l, vencimento: mais30(l.vencimento), atualizadoEm: (new Date()).toISOString() } };
        if (l.status === "bonus" && !l.bonusAte) return z;
        return { ...z, [k]: { ...l, status: "bonus", bonusAte: mais30(l.status === "bonus" ? l.bonusAte : null), origem: "indicacao", atualizadoEm: (new Date()).toISOString() } };
      }
      if (pr.tipo === "servico" && pr.id) return { ...z, servicos: { ...z.servicos || {}, [pr.id]: { status: "bonus", em: hoje, titulo: pr.nome || "", origem: "indicacao" } } };
      return z;
    }));
  };
  const virouAluno = (x, st) => {
    const pr = x.premio || {};
    if (!window.confirm(x.nome + " virou aluno?\n\n" + (st ? st.name.split(" ")[0] : "Quem indicou") + " recebe agora: " + (pr.nome || "o prêmio") + ".")) return;
    aplicarPremio(x);
    if (st) {
      const pr2 = x.premio || {};
      precosVitrine().then((m) => {
        const k = pr2.tipo === "servico" ? pr2.id : pr2.tipo;
        const it = m[k] || {};
        registrarVitrine(setStudents, st, "bonus", k || "indique", (it.titulo || pr2.nome || "Prêmio") + " (indicação)", it.valor);
      });
    }
    patch(x, { status: "aluno" });
    setLista((p) => p.filter((y) => y.id !== x.id));
  };
  const marcar = (x, status) => {
    patch(x, { status });
    setLista((p) => status === "descartado" ? p.filter((y) => y.id !== x.id) : p.map((y) => y.id === x.id ? { ...y, status } : y));
  };
  if (!lista.length) return null;
  const waNum = (n) => {
    let d = String(n || "").replace(/\D/g, "");
    if (!d) return null;
    if (!(d.length >= 12 && d.indexOf("55") === 0)) d = "55" + d;
    return d;
  };
  return React.createElement("div", { style: { marginBottom: 16 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 } }, "Indicações pelo app"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, lista.map((x) => {
    const st = students.find((z) => String(z.id) === String(x.student_id));
    const n = waNum(x.whatsapp);
    const first = String(x.nome || "").split(" ")[0];
    return React.createElement(Card, { key: x.id, style: { padding: "10px 14px", background: "#fff7ed", border: "1.5px solid #fed7aa" } }, React.createElement("div", { style: { display: "inline-block", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", color: "#C2410C", background: "#ffedd5", borderRadius: 10, padding: "3px 8px", marginBottom: 5 } }, "🎁 INDIQUE E GANHE", x.status === "conversa" ? " · EM CONVERSA" : ""), React.createElement("div", { style: { fontSize: 13.5, color: "#0f172a" } }, React.createElement("b", null, x.nome), x.whatsapp ? " · " + x.whatsapp : ""), React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2 } }, "Indicado por ", React.createElement("b", { style: { color: "#0f172a" } }, st ? st.name : "aluno"), x.premio && x.premio.nome ? " · prêmio: " + x.premio.nome : ""), React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 8 } }, n && React.createElement("a", { href: "https://wa.me/" + n + "?text=" + encodeURIComponent("Oi, " + first + "! Aqui é o Wellington Brito, personal trainer. " + (st ? st.name.split(" ")[0] + " me indicou você" : "Você foi indicado por um aluno meu") + " e eu tenho um presente para você. Posso te contar como funciona?"), target: "_blank", rel: "noopener noreferrer", onClick: () => {
      if (x.status === "enviado") marcar(x, "conversa");
    }, style: { flex: 1, padding: "8px", borderRadius: 9, background: "#E9F5F2", color: "#0F6E56", fontWeight: 700, fontSize: 12, textAlign: "center", textDecoration: "none" } }, "Chamar " + first), React.createElement("button", { onClick: () => virouAluno(x, st), style: { flex: 1, padding: "8px", borderRadius: 9, border: "none", background: "#FF5603", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, "Virou aluno"), React.createElement("button", { onClick: () => {
      if (window.confirm("Marcar que " + first + " não fechou?")) marcar(x, "descartado");
    }, style: { padding: "8px 10px", borderRadius: 9, border: "1px solid #e2e8f0", background: "#fff", color: "#94a3b8", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, "Não fechou")));
  })));
};
const MENTE_JOGOS = { genio: "Gênio das Cores", pares: "Memória de Pares", sequencia: "Sequência Numérica", baloes: "Estourar Balões", caca: "Caça-Palavras", padroes: "Copiar Padrões", listar: "Listar Palavras", completar: "Completar Letra" };
const ServicosVitrineFicha = ({ st, setStudents }) => {
  const [itens, setItens] = useState(null);
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const headers = await DB.authHeaders();
        const r = await fetch(SUPA_URL + "/rest/v1/vitrine_itens?select=id,data,ativo&order=ordem.asc", { headers });
        const rows = r.ok ? await r.json() : [];
        if (vivo) setItens((rows || []).filter((x) => x.data && x.data.tipo !== "parceiro" && !x.data.produto));
      } catch (e) {
        if (vivo) setItens([]);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);
  if (!itens || !itens.length) return null;
  const mapa = st.servicos || {};
  const setS = async (id, titulo, k) => {
    if (k !== "bloqueado") {
      const pr = (await precosVitrine())[id] || {};
      if (k === "pago") {
        const v = pedirValorVit(titulo, pr.valor);
        if (v === null) return;
        registrarVitrine(setStudents, st, "venda", id, titulo, v);
      } else registrarVitrine(setStudents, st, "bonus", id, titulo, pr.valor);
    }
    setSRaw(id, titulo, k);
  };
  const setSRaw = (id, titulo, k) => setStudents((p) => p.map((x) => {
    if (x.id !== st.id) return x;
    const m = { ...x.servicos || {} };
    if (k === "bloqueado") delete m[id];
    else m[id] = { status: k, em: todayStr(), titulo };
    return { ...x, servicos: m };
  }));
  return React.createElement(Card, { style: { padding: "12px 14px", marginBottom: 16 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#334155" } }, "Serviços da vitrine"), React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 2, marginBottom: 4, lineHeight: 1.45 } }, "Bloqueado: o aluno vê o preço e o Pix. Bônus ou Pago: aparece como liberado, com o botão para agendar."), itens.map((it, i) => {
    const v = mapa[it.id] || {};
    const status = v.status || "bloqueado";
    return React.createElement("div", { key: it.id, style: { padding: "10px 0", borderTop: i ? "1px solid #f1f5f9" : "none" } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 6 } }, React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#0f172a" } }, it.data.titulo, it.ativo === false ? React.createElement("span", { style: { fontSize: 11, color: "#94a3b8", fontWeight: 500 } }, " · fora do app") : null), React.createElement("div", { style: { fontSize: 11, color: "#64748b" } }, status === "bonus" ? "Bônus desde " + fmt(v.em) : status === "pago" ? "Pago em " + fmt(v.em) : "")), React.createElement("div", { style: { display: "flex", gap: 6 } }, [["bloqueado", "Bloqueado"], ["bonus", "Bônus"], ["pago", "Pago"]].map(([k, lb]) => React.createElement("button", { key: k, onClick: () => {
      if (k !== status) setS(it.id, it.data.titulo, k);
    }, style: { flex: 1, padding: "8px 4px", borderRadius: 9, border: "1.5px solid " + (status === k ? "#FF5603" : "#e2e8f0"), background: status === k ? "#fff4ee" : "#fff", color: status === k ? "#c2410c" : "#64748b", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, lb))));
  }), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 4, lineHeight: 1.45 } }, "Depois de atender, volte para Bloqueado se o aluno puder comprar de novo."));
};
const ELO_MODELO_ID = "mente-ativa-30";
const digElo = (t) => String(t || "").replace(/\D/g, "");
const acharMatriculaElo = (rows, st) => {
  const email = String(st.portalEmail || st.email || "").trim().toLowerCase();
  const tel = digElo(st.whatsapp || st.phone || st.telefone).slice(-9);
  return (rows || []).find((m) => {
    const vals = Object.values(m || {});
    if (email && vals.some((v) => typeof v === "string" && v.trim().toLowerCase() === email)) return true;
    if (tel.length >= 8) {
      const w = digElo(m.whatsapp || m.telefone || m.phone).slice(-9);
      if (w && w === tel) return true;
    }
    return false;
  }) || null;
};
const eloLerMatriculas = async () => {
  const headers = await DB.authHeaders();
  const r = await fetch(SUPA_URL + "/rest/v1/ma_jornada_matriculas?select=*&modelo_id=eq." + ELO_MODELO_ID, { headers });
  return r.ok ? await r.json() : [];
};
const eloAcao = async (matriculaId, acao) => {
  const headers = await DB.authHeaders();
  const r = await fetch(SUPA_URL + "/rest/v1/rpc/ma_definir_pagamento", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ p_matricula: matriculaId, p_acao: acao }) });
  return r.ok;
};
const eloStatusDe = (m) => !m ? null : m.status === "bloqueado" ? "bloqueado" : m.pagamento_status === "isento" ? "bonus" : m.pagamento_status === "pago" ? "pago" : "aguardando";
const eloAplicar = async (m, alvo) => {
  const atual = eloStatusDe(m);
  if (atual === alvo) return true;
  if (alvo === "bloqueado") return eloAcao(m.id || m.matricula_id, "bloquear");
  const ok = await eloAcao(m.id || m.matricula_id, alvo === "bonus" ? "isentar" : "confirmar");
  if (ok && m.status === "bloqueado") await eloAcao(m.id || m.matricula_id, "desbloquear");
  return ok;
};
const sincronizarElo = async (students, setStudents) => {
  const pend = (students || []).filter((s) => s.eloAcesso && s.eloAcesso.pendente && s.eloAcesso.status !== "bloqueado");
  if (!pend.length) return;
  try {
    const rows = await eloLerMatriculas();
    for (const s of pend) {
      const m = acharMatriculaElo(rows, s);
      if (!m) continue;
      if (await eloAplicar(m, s.eloAcesso.status)) setStudents((p) => p.map((x) => x.id !== s.id ? x : { ...x, eloAcesso: { ...x.eloAcesso || {}, pendente: false, aplicadoEm: todayStr() } }));
    }
  } catch (e) {
  }
};
const EloFicha = ({ st, setStudents }) => {
  const [mat, setMat] = useState(void 0);
  const [salvando, setSalvando] = useState(false);
  const carregar = async () => {
    try {
      const rows = await eloLerMatriculas();
      const m = acharMatriculaElo(rows, st);
      setMat(m);
      if (m && st.eloAcesso && st.eloAcesso.pendente && st.eloAcesso.status !== "bloqueado") {
        if (await eloAplicar(m, st.eloAcesso.status)) {
          setStudents((p) => p.map((x) => x.id !== st.id ? x : { ...x, eloAcesso: { ...x.eloAcesso || {}, pendente: false, aplicadoEm: todayStr() } }));
          const rows2 = await eloLerMatriculas();
          setMat(acharMatriculaElo(rows2, st));
        }
      }
    } catch (e) {
      setMat(null);
    }
  };
  useEffect(() => {
    carregar();
  }, [st.id]);
  const pre = st.eloAcesso || {};
  const atual = mat ? eloStatusDe(mat) : pre.status || "bloqueado";
  const escolher = async (k) => {
    if (salvando || k === atual) return;
    const pr = (await precosVitrine()).elo || { titulo: "Elo 60+", valor: 19.9 };
    const titulo = pr.titulo || "Elo 60+";
    let v = null;
    if (k === "pago") {
      v = pedirValorVit("o " + titulo, pr.valor);
      if (v === null) return;
    }
    setSalvando(true);
    let ok = true;
    if (mat) ok = await eloAplicar(mat, k);
    if (ok) {
      setStudents((p) => p.map((x) => x.id !== st.id ? x : { ...x, eloAcesso: { status: k, pendente: !mat, em: todayStr() } }));
      if (k === "pago") registrarVitrine(setStudents, st, "venda", "elo", titulo, v);
      if (k === "bonus") registrarVitrine(setStudents, st, "bonus", "elo", titulo, pr.valor);
      if (mat) {
        try {
          const rows = await eloLerMatriculas();
          setMat(acharMatriculaElo(rows, st));
        } catch (e) {
        }
      }
    } else window.alert("Não consegui mudar o acesso no Elo 60+. Tente de novo ou use o painel do Elo 60+.");
    setSalvando(false);
  };
  const sub = mat === void 0 ? "Carregando..." : !mat ? pre.status && pre.status !== "bloqueado" ? "Ainda não entrou. Fica " + (pre.status === "bonus" ? "de bônus" : "como pago") + " quando ele entrar." : "Ainda não entrou no Elo 60+." : atual === "aguardando" ? "Entrou e está aguardando o pagamento." + (mat.pagamento_prazo ? " Prazo: " + fmt(String(mat.pagamento_prazo).slice(0, 10)) + "." : "") : atual === "bonus" ? "Liberado de bônus." : atual === "pago" ? "Pago." : "Acesso bloqueado.";
  return React.createElement(Card, { style: { padding: "12px 14px", marginBottom: 16 } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 8 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#334155" } }, "Elo 60+"), React.createElement("div", { style: { fontSize: 11, color: atual === "aguardando" ? "#b45309" : "#64748b", textAlign: "right" } }, sub)), React.createElement("div", { style: { display: "flex", gap: 6, opacity: salvando ? 0.6 : 1 } }, [["bloqueado", "Bloqueado"], ["bonus", "Bônus"], ["pago", "Pago"]].map(([k, lb]) => React.createElement("button", { key: k, disabled: salvando || mat === void 0, onClick: () => escolher(k), style: { flex: 1, padding: "8px 4px", borderRadius: 9, border: "1.5px solid " + (atual === k ? "#FF5603" : "#e2e8f0"), background: atual === k ? "#fff4ee" : "#fff", color: atual === k ? "#c2410c" : "#64748b", fontWeight: 700, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" } }, lb))), mat && mat.inicio && React.createElement("div", { style: { marginTop: 8, fontSize: 11.5, color: "#64748b" } }, "Começou a jornada em " + fmt(String(mat.inicio).slice(0, 10)) + "."));
};
const MenteAtivaFicha = ({ st, setStudents }) => {
  const [res, setRes] = useState(null);
  const [aberto, setAberto] = useState(false);
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const headers = await DB.authHeaders();
        const r = await fetch(SUPA_URL + "/rest/v1/mente_resultados?select=id,jogo,pontos,data,created_at&student_id=eq." + encodeURIComponent(st.id) + "&order=created_at.desc&limit=200", { headers });
        const rows = r.ok ? await r.json() : [];
        if (vivo) setRes(rows || []);
      } catch (e) {
        if (vivo) setRes([]);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [st.id]);
  const l = st.mente || {};
  const status = l.status || "bloqueado";
  const hoje = todayStr();
  const vencido = status === "pago" && (!l.vencimento || l.vencimento < hoje);
  const mais30 = (base) => {
    const d = new Date((base && base > hoje ? base : hoje) + "T12:00:00");
    d.setDate(d.getDate() + 30);
    return toISODateLocal(d);
  };
  const setM = (novo) => setStudents((p) => p.map((x) => x.id === st.id ? { ...x, mente: { ...x.mente || {}, ...novo, atualizadoEm: (new Date()).toISOString() } } : x));
  const escolher = async (k) => {
    if (k === status) return;
    const pr = (await precosVitrine()).mente || {};
    if (k === "pago") {
      const v = pedirValorVit(pr.titulo || "a Mente Ativa", pr.valor);
      if (v === null) return;
      setM({ status: "pago", vencimento: mais30(hoje), bonusAte: null });
      registrarVitrine(setStudents, st, "venda", "mente", pr.titulo || "Mente Ativa", v);
    } else {
      setM({ status: k, bonusAte: null });
      if (k === "bonus") registrarVitrine(setStudents, st, "bonus", "mente", pr.titulo || "Mente Ativa", pr.valor);
    }
  };
  const renovarM = async () => {
    const pr = (await precosVitrine()).mente || {};
    const v = pedirValorVit("a renovação da " + (pr.titulo || "Mente Ativa"), pr.valor);
    if (v === null) return;
    setM({ status: "pago", vencimento: mais30(l.vencimento) });
    registrarVitrine(setStudents, st, "venda", "mente", pr.titulo || "Mente Ativa", v);
  };
  const sub = status === "bonus" ? l.bonusAte ? l.bonusAte < hoje ? "Bônus da indicação venceu em " + fmt(l.bonusAte) + "." : "Bônus da indicação até " + fmt(l.bonusAte) + "." : "Liberado de bônus." : status === "pago" ? vencido ? "Venceu em " + fmt(l.vencimento) + ". O cadeado voltou." : "Pago · acesso até " + fmt(l.vencimento) + "." : "O aluno vê o cadeado, 1 jogo grátis e o Pix.";
  const d30 = new Date(Date.now() - 30 * 864e5).toISOString();
  const ult30 = (res || []).filter((r) => r.created_at >= d30);
  const diasAtivos = new Set(ult30.map((r) => String(r.created_at).slice(0, 10))).size;
  const ultima = (res || [])[0];
  return React.createElement(Card, { style: { padding: "12px 14px", marginBottom: 16 } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, marginBottom: 8 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#334155" } }, "Mente Ativa"), React.createElement("div", { style: { fontSize: 11, color: vencido ? "#dc2626" : "#64748b", textAlign: "right" } }, sub)), React.createElement("div", { style: { display: "flex", gap: 6 } }, [["bloqueado", "Bloqueado"], ["bonus", "Bônus"], ["pago", "Pago"]].map(([k, lb]) => React.createElement("button", { key: k, onClick: () => escolher(k), style: { flex: 1, padding: "8px 4px", borderRadius: 9, border: "1.5px solid " + (status === k ? "#FF5603" : "#e2e8f0"), background: status === k ? "#fff4ee" : "#fff", color: status === k ? "#c2410c" : "#64748b", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, lb))), status === "pago" && React.createElement("button", { onClick: renovarM, style: { width: "100%", marginTop: 8, padding: "8px", borderRadius: 9, border: "1.5px dashed #fed7aa", background: "#fff", color: "#c2410c", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, "Renovar +30 dias"), React.createElement("div", { style: { marginTop: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9" } }, res === null ? React.createElement("div", { style: { fontSize: 12, color: "#94a3b8" } }, "Carregando resultados...") : res.length === 0 ? React.createElement("div", { style: { fontSize: 12, color: "#94a3b8" } }, "Nenhum jogo feito ainda.") : React.createElement("div", null, React.createElement("div", { onClick: () => setAberto(!aberto), style: { display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" } }, React.createElement("div", { style: { fontSize: 12, color: "#334155" } }, React.createElement("b", null, ult30.length), " ", ult30.length === 1 ? "jogo" : "jogos", " em ", React.createElement("b", null, diasAtivos), " ", diasAtivos === 1 ? "dia" : "dias", " (30 dias)", ultima ? " · último em " + fmt(String(ultima.created_at).slice(0, 10)) : ""), React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#c2410c" } }, aberto ? "Fechar" : "Ver")), aberto && React.createElement("div", { style: { marginTop: 8 } }, res.slice(0, 15).map((r) => React.createElement("div", { key: r.id, style: { display: "flex", justifyContent: "space-between", gap: 8, padding: "7px 0", borderBottom: "1px solid #f8fafc", fontSize: 12 } }, React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, color: "#0f172a" } }, MENTE_JOGOS[r.jogo] || r.jogo), React.createElement("div", { style: { color: "#94a3b8" } }, fmt(String(r.created_at).slice(0, 10)), r.data && r.data.extra ? " · " + r.data.extra : "")), React.createElement("div", { style: { fontWeight: 800, color: "#FF5603", whiteSpace: "nowrap" } }, r.data && r.data.rotulo || r.pontos)))))));
};
const Avisos360 = ({ students, setStudents, setLeads, nav }) => {
  const [avisos, setAvisos] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const headers = await DB.authHeaders();
        let r = await fetch(SUPA_URL + "/rest/v1/l360_avisos?select=id,student_id,created_at,servico,presente,item_id&visto=eq.false&order=created_at.desc&limit=50", { headers });
        if (!r.ok) r = await fetch(SUPA_URL + "/rest/v1/l360_avisos?select=id,student_id,created_at,servico,presente&visto=eq.false&order=created_at.desc&limit=50", { headers });
        if (!r.ok) r = await fetch(SUPA_URL + "/rest/v1/l360_avisos?select=id,student_id,created_at,servico&visto=eq.false&order=created_at.desc&limit=50", { headers });
        if (!r.ok) r = await fetch(SUPA_URL + "/rest/v1/l360_avisos?select=id,student_id,created_at&visto=eq.false&order=created_at.desc&limit=50", { headers });
        if (r.ok) {
          const rows = await r.json();
          setAvisos(rows || []);
        }
      } catch (e) {
      }
    })();
  }, []);
  const chave = (a) => String(a.student_id) + "|" + (a.servico || "") + "|" + (a.presente && a.presente.nome || "");
  const waNum = (n) => {
    let d = String(n || "").replace(/\D/g, "");
    if (!d) return null;
    if (!(d.length >= 12 && d.indexOf("55") === 0)) d = "55" + d;
    return d;
  };
  const virarLead = (a, st) => {
    const pr = a.presente;
    if (!pr || !pr.nome || !setLeads) return;
    const num = String(pr.whatsapp || "").replace(/\D/g, "");
    const agora = (new Date()).toISOString();
    setLeads((p) => {
      if (num && p.some((l) => String(l.whatsapp || "").replace(/\D/g, "").slice(-9) === num.slice(-9))) return p;
      return [...p, { id: uid(), name: pr.nome, whatsapp: pr.whatsapp || "", instagram: "", idade: "", sexo: "", origem: "Presente de aluno", indicadoPor: st.name, objetivo: "", necessidade: "Ganhou de presente: " + (a.servico || "serviço"), temperatura: "quente", etapa: "novo", status: "ativo", obs: pr.mensagem ? 'Mensagem do vale: "' + pr.mensagem + '"' : "", proximaAcaoTipo: "Enviar mensagem", proximaAcaoData: todayStr(), proximaAcaoHorario: "", proximaAcaoObs: "Agendar " + (a.servico || "o serviço"), motivoNaoFechamento: "", motivoObs: "", valorPotencial: "", createdAt: todayStr(), historico: [{ ts: agora, texto: "Presente de " + st.name + ": " + (a.servico || "serviço") }] }];
    });
  };
  const confirmarServ = async (a, st) => {
    const pmap = await precosVitrine();
    const sv = String(a.servico || "");
    const pr = pmap[a.item_id] || (sv === "Mente Ativa" ? pmap.mente : /360/.test(sv) ? pmap.l360 : /elo/i.test(sv) ? pmap.elo : null) || {};
    const titulo = a.servico || pr.titulo || "Serviço";
    const v = pedirValorVit(titulo, pr.valor);
    if (v === null) return false;
    if (a.item_id && !(a.presente && a.presente.nome)) {
      const hojeM = todayStr();
      setStudents((p) => p.map((x) => String(x.id) !== String(a.student_id) ? x : { ...x, servicos: { ...x.servicos || {}, [a.item_id]: { status: "pago", em: hojeM, titulo: a.servico || "" } } }));
    }
    registrarVitrine(setStudents, st, "venda", a.item_id || titulo, a.presente && a.presente.nome ? titulo + " (presente)" : titulo, v);
    if (/elo/i.test(sv) && !(a.presente && a.presente.nome) && st) {
      const ea = { status: "pago", pendente: true, em: todayStr() };
      setStudents((p) => p.map((x) => String(x.id) !== String(st.id) ? x : { ...x, eloAcesso: ea }));
      sincronizarElo([{ ...st, eloAcesso: ea }], setStudents);
    }
    marcar(a);
  };
  const marcar = async (a) => {
    const k = chave(a);
    const ids = avisos.filter((x) => chave(x) === k).map((x) => x.id);
    setAvisos((p) => p.filter((x) => chave(x) !== k));
    try {
      const headers = await DB.authHeaders();
      for (const id of ids) await fetch(SUPA_URL + "/rest/v1/l360_avisos?id=eq." + encodeURIComponent(id), { method: "PATCH", headers: { ...headers, "Prefer": "return=minimal" }, body: JSON.stringify({ visto: true }) });
    } catch (e) {
    }
  };
  const liberar = async (a, st) => {
    const kk = a.servico === "Mente Ativa" ? "mente" : "l360";
    const pr = (await precosVitrine())[kk] || {};
    const v = pedirValorVit(pr.titulo || a.servico || "o plano", pr.valor);
    if (v === null) return false;
    registrarVitrine(setStudents, st, "venda", kk, pr.titulo || (kk === "mente" ? "Mente Ativa" : "Longevus 360"), v);
    const sid = a.student_id;
    const hoje = todayStr();
    const k = a.servico === "Mente Ativa" ? "mente" : "l360";
    setStudents((p) => p.map((x) => {
      if (String(x.id) !== String(sid)) return x;
      const l = x[k] || {};
      const base = l.status === "pago" && l.vencimento && l.vencimento > hoje ? l.vencimento : hoje;
      const d = new Date(base + "T12:00:00");
      d.setDate(d.getDate() + 30);
      return { ...x, [k]: { ...l, status: "pago", vencimento: toISODateLocal(d), atualizadoEm: (new Date()).toISOString() } };
    }));
    marcar(a);
  };
  const vistos = {};
  const lista = avisos.filter((a) => {
    const k = chave(a);
    if (vistos[k]) return false;
    vistos[k] = true;
    return true;
  }).map((a) => ({ a, st: students.find((s) => String(s.id) === String(a.student_id)) })).filter((x) => x.st);
  if (!lista.length) return null;
  return React.createElement("div", { style: { marginBottom: 22 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 8 } }, "Pagamentos avisados pelo app"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, lista.map(({ a, st }) => {
    const ehPlano = String(a.servico || "").startsWith("Plano: ");
    if (ehPlano) return React.createElement(Card, { key: a.id, style: { padding: "10px 14px", background: "#fff7ed", border: "1.5px solid #fed7aa" } }, React.createElement("div", { onClick: () => nav("studentDetail", { studentId: st.id }), style: { fontSize: 13, fontWeight: 700, color: "#9a3412", cursor: "pointer" } }, st.name + " avisou que pagou o " + String(a.servico).replace("Plano: ", "plano ")), React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 2 } }, "Em " + new Date(a.created_at).toLocaleDateString("pt-BR") + " às " + new Date(a.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + ". Novo aluno pelo link do plano. Confira no banco e marque a mensalidade como paga para liberar o acesso."), React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 8 } }, React.createElement("button", { onClick: () => {
      marcar(a);
      nav("studentDetail", { studentId: st.id });
    }, style: { flex: 1, padding: "8px", borderRadius: 9, border: "none", background: "#FF5603", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, "Abrir aluno"), React.createElement("button", { onClick: () => marcar(a), style: { flex: 0.7, padding: "8px", borderRadius: 9, border: "1.5px solid #fed7aa", background: "#fff", color: "#9a3412", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, "Dispensar")));
    const ehMente = a.servico === "Mente Ativa";
    const pr = a.presente && a.presente.nome ? a.presente : null;
    const servico = ehMente && !pr ? null : a.servico;
    const prWa = pr && waNum(pr.whatsapp);
    return React.createElement(Card, { key: a.id, style: { padding: "10px 14px", background: "#fff7ed", border: "1.5px solid #fed7aa" } }, pr && React.createElement("div", { style: { display: "inline-block", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em", color: "#C2410C", background: "#ffedd5", borderRadius: 10, padding: "3px 8px", marginBottom: 5 } }, "🎁 PRESENTE"), React.createElement("div", { onClick: () => nav("studentDetail", { id: st.id }), style: { fontSize: 13, fontWeight: 700, color: "#9a3412", cursor: "pointer" } }, servico ? st.name + " avisou que pagou: " + servico : st.name + " avisou que pagou " + (ehMente ? "a Mente Ativa" : "o 360")), React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 2 } }, "Em " + new Date(a.created_at).toLocaleDateString("pt-BR") + " às " + new Date(a.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + ". " + (servico ? "Confira no banco e combine a data com o aluno." : "Confira no banco antes de liberar.")), pr && React.createElement("div", { style: { marginTop: 8, background: "#fff", border: "1px solid #fed7aa", borderRadius: 9, padding: "8px 10px", fontSize: 12.5, color: "#334155", lineHeight: 1.5 } }, React.createElement("div", null, "Para ", React.createElement("b", null, pr.nome), pr.whatsapp ? " · " + pr.whatsapp : ""), pr.mensagem && React.createElement("div", { style: { fontStyle: "italic", color: "#64748b" } }, '"', pr.mensagem, '"'), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 2 } }, "Ao confirmar, ", pr.nome.split(" ")[0], " entra nos seus Leads.")), React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 8 } }, prWa && React.createElement("a", { href: "https://wa.me/" + prWa + "?text=" + encodeURIComponent("Oi, " + pr.nome.split(" ")[0] + "! Aqui é o Wellington Brito, personal trainer. " + st.name.split(" ")[0] + " te deu de presente: " + (servico || "um atendimento") + ". Vamos agendar? Qual dia e horário ficam bons para você?"), target: "_blank", rel: "noopener noreferrer", style: { flex: 1, padding: "8px", borderRadius: 9, background: "#E9F5F2", color: "#0F6E56", fontWeight: 700, fontSize: 12, textAlign: "center", textDecoration: "none" } }, "Chamar " + pr.nome.split(" ")[0]), React.createElement("button", { onClick: async () => {
      const ok = servico ? await confirmarServ(a, st) : await liberar(a, st);
      if (ok !== false && pr) virarLead(a, st);
    }, style: { flex: 1, padding: "8px", borderRadius: 9, border: "none", background: "#FF5603", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, servico ? "Confirmar pagamento" : "Confirmar e liberar 30 dias"), React.createElement("button", { onClick: () => marcar(a), style: { flex: 0.7, padding: "8px", borderRadius: 9, border: "1.5px solid #fed7aa", background: "#fff", color: "#9a3412", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, "Ainda não caiu")));
  })));
};
const Dashboard = ({ students, setStudents, setLeads, assessments, dailyLogs, pagamentos, receitasExtras, nav, programs, pendenciasLogin, pendingQCount }) => {
  useEffect(() => {
    if (setStudents && students && students.length) sincronizarElo(students, setStudents);
  }, [students && students.length]);
  const [turmas, setTurmas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("circuito_turmas") || "[]");
    } catch (e) {
      return [];
    }
  });
  const [bioPend, setBioPend] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const hd = await DB.authHeaders();
        const [rt, rb] = await Promise.all([
          fetch(SUPA_URL + "/rest/v1/circuito_turmas?select=data", { headers: hd }),
          fetch(SUPA_URL + "/rest/v1/avaliacoes_antropometricas?select=id,student_id&data->>status=eq.pendente", { headers: hd })
        ]);
        if (rt.ok) {
          const t = await rt.json();
          setTurmas((t || []).map((x) => x.data).filter(Boolean));
        }
        if (rb.ok) {
          setBioPend(await rb.json());
        }
      } catch (e) {
      }
    })();
  }, []);
  const [ocultarFin, setOcultarFin] = useState(() => {
    try {
      return localStorage.getItem("lv_ocultar_fin") === "1";
    } catch (e) {
      return false;
    }
  });
  const trocarOcultar = () => setOcultarFin((v) => {
    const n = !v;
    try {
      localStorage.setItem("lv_ocultar_fin", n ? "1" : "0");
    } catch (e) {
    }
    return n;
  });
  const valFin = (v) => ocultarFin ? "R$ •••••" : fmtR(v);
  const recent = [...assessments].sort((a, b) => b.date?.localeCompare(a.date)).slice(0, 4);
  const hoje = todayStr();
  const anoMes = hoje.slice(0, 7);
  const mesStart = anoMes + "-01";
  const mesLastDay = new Date(Number(anoMes.slice(0, 4)), Number(anoMes.slice(5, 7)), 0).getDate();
  const mesEnd = anoMes + "-" + String(mesLastDay).padStart(2, "0");
  const pg = pagamentos || [], rx = receitasExtras || [];
  const previstoMes = pg.filter((p) => p.dataPrevista && p.dataPrevista >= mesStart && p.dataPrevista <= mesEnd && p.status !== "cancelado").reduce((a, p) => a + (Number(p.valorPrevisto) || 0), 0) + rx.filter((r) => r.dataPrevista && r.dataPrevista >= mesStart && r.dataPrevista <= mesEnd).reduce((a, r) => a + (Number(r.valorPrevisto) || 0), 0);
  const recebidoMes = pg.filter((p) => p.status === "pago" && p.dataPagamento && p.dataPagamento >= mesStart && p.dataPagamento <= mesEnd).reduce((a, p) => a + (Number(p.valorPago) || 0), 0) + rx.filter((r) => r.status === "recebido" && r.dataPagamento && r.dataPagamento >= mesStart && r.dataPagamento <= mesEnd).reduce((a, r) => a + (Number(r.valorPago) || 0), 0);
  const abertosMes = pg.filter((p) => p.status === "previsto" && p.dataPrevista && p.dataPrevista >= mesStart && p.dataPrevista <= mesEnd && p.dataPrevista <= hoje);
  const emAbertoMes = abertosMes.reduce((a, p) => a + (Number(p.valorPrevisto) || 0), 0);
  const vencidosCount = pg.filter((p) => p.status === "previsto" && p.dataPrevista && p.dataPrevista < hoje).length;
  const ativos = students.filter((s) => (s.status || "ativo") === "ativo");
  const criticos = ativos.filter((s) => {
    const ult = [...assessments].filter((a) => a.studentId === s.id).sort((a, b) => b.date?.localeCompare(a.date))[0];
    return ult && ult.globalScore > 0 && classifyGlobal(ult.globalScore).label === "Crítico";
  });
  const temAlertas = criticos.length > 0 || vencidosCount > 0;
  return React.createElement("div", null, React.createElement("div", { style: { marginBottom: 22 } }, React.createElement("div", { style: { fontSize: 22, fontWeight: 800, color: "#0f172a" } }, "Olá, Professor 👋"), React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginTop: 3 } }, (new Date()).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }))), setStudents && React.createElement(Avisos360, { students, setStudents, setLeads, nav }), setStudents && React.createElement(IndicacoesInicio, { students, setStudents, setLeads }), setStudents && React.createElement(ComprasPublicasInicio, { students, setStudents, setLeads, nav }), (() => {
    const DIAS_C = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const dIdx = (() => {
      const d = (new Date()).getDay();
      return d === 0 ? 6 : d - 1;
    })();
    const agoraHM = (new Date()).toTimeString().slice(0, 5);
    const doDia = (turmas || []).filter((t) => (t.dias || []).indexOf(DIAS_C[dIdx]) >= 0).sort((x, y) => (x.horaInicio || "").localeCompare(y.horaInicio || ""));
    const proxTurma = doDia.find((t) => !t.horaFim || t.horaFim >= agoraHM) || null;
    const reav = ativos.filter((s) => {
      const ult = [...assessments].filter((a) => a.studentId === s.id).sort((a, b) => b.date?.localeCompare(a.date))[0];
      if (!ult) return false;
      return (new Date(hoje) - new Date(ult.date)) / 864e5 >= 75;
    });
    const ocultos = ativos.filter((s) => {
      const pr = (programs || []).filter((p) => p.studentId === s.id).sort((a, b) => (b.criadoEm || "").localeCompare(a.criadoEm || ""))[0];
      return pr && pr.ocultoAluno === true;
    });
    const bioIds = [...new Set((bioPend || []).map((x) => x.student_id).filter(Boolean))];
    const abrirLista = (ids, fallback) => ids.length === 1 ? nav("studentDetail", { studentId: ids[0] }) : nav(fallback);
    const pend = [
      (pendenciasLogin || []).length > 0 && { k: "cad", ic: "user", t: "Cadastros para aprovar", n: (pendenciasLogin || []).length, go: () => nav("vincular") },
      pendingQCount > 0 && { k: "q", ic: "inbox", t: "Questionários para revisar", n: pendingQCount, go: () => nav("questionarios") },
      bioIds.length > 0 && { k: "bio", ic: "act", t: "Bioimpedância para conferir", n: bioIds.length, go: () => abrirLista(bioIds, "students") },
      ocultos.length > 0 && { k: "oc", ic: "eye", t: "Treinos ocultos para liberar", n: ocultos.length, go: () => abrirLista(ocultos.map((x) => x.id), "students") },
      reav.length > 0 && { k: "rv", ic: "clip", t: "Reavaliar", n: reav.length, go: () => abrirLista(reav.map((x) => x.id), "students") },
      vencidosCount > 0 && { k: "pg", ic: "money", t: "Pagamentos em atraso", n: vencidosCount, go: () => nav("financeiro") },
      ...criticos.map((c) => ({ k: "cr" + c.id, ic: "bell", t: c.name + " em status crítico", n: "!", go: () => nav("studentDetail", { studentId: c.id }) }))
    ].filter(Boolean);
    if (!proxTurma && !pend.length) return null;
    return React.createElement(Card, { style: { padding: "14px 16px", marginBottom: 14 } }, proxTurma && React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: pend.length ? 8 : 0 } }, React.createElement("div", { style: { width: 40, height: 40, borderRadius: 11, background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, React.createElement(I, { n: "timer", c: "#0F6E56", s: 20 })), React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { fontSize: 11.5, color: "#64748b" } }, "Hoje · ", doDia.length > 1 ? "próxima turma" : "turma"), React.createElement("div", { style: { fontSize: 14.5, fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, proxTurma.nome || "Circuito", proxTurma.horaInicio ? " · " + proxTurma.horaInicio : ""), proxTurma.local && React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, proxTurma.local)), React.createElement("button", { type: "button", onClick: () => {
      window.location.href = "longevus-circuito.html";
    }, style: { display: "flex", alignItems: "center", gap: 5, border: "none", background: "#0F6E56", color: "#fff", borderRadius: 10, padding: "9px 12px", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 } }, React.createElement(I, { n: "play", c: "#fff", s: 14 }), "Iniciar")), !proxTurma && React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4 } }, "Hoje"), pend.map((it) => React.createElement("div", { key: it.k, onClick: it.go, style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: "1px solid #f1f5f9", cursor: "pointer" } }, React.createElement(I, { n: it.ic, c: "#64748b", s: 17 }), React.createElement("div", { style: { flex: 1, fontSize: 13.5, color: "#0f172a" } }, it.t), React.createElement("span", { style: { fontSize: 11.5, fontWeight: 800, background: "#FFF1EA", color: "#C2410C", borderRadius: 99, padding: "2px 9px" } }, it.n))));
  })(), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 } }, [["Nova avaliação", "plus", () => nav("newAssessment")], ["Novo aluno", "user", () => nav("students", { novo: true })], ["Iniciar circuito", "timer", () => {
    window.location.href = "longevus-circuito.html";
  }], ["Enviar material", "send", () => nav("materiais")]].map(([l, ic, fn]) => React.createElement("button", { key: l, type: "button", onClick: fn, style: { display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid #e2e8f0", background: "#fff", borderRadius: 99, padding: "8px 12px", fontSize: 12.5, fontWeight: 600, color: "#0f172a", cursor: "pointer" } }, React.createElement(I, { n: ic, c: "#FF5603", s: 15 }), l))), React.createElement(Card, { onClick: () => nav("financeiro"), style: { padding: "11px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 } }, React.createElement("div", { style: { fontSize: 11.5, fontWeight: 700, color: "#64748b" } }, MESES_NOME[Number(anoMes.slice(5, 7)) - 1].slice(0, 3)), React.createElement("div", { style: { flex: 1, display: "flex", justifyContent: "space-between", gap: 6, minWidth: 0 } }, [["Previsto", previstoMes, "#4f46e5"], ["Recebido", recebidoMes, "#16a34a"], ["Aberto", emAbertoMes, "#d97706"]].map(([l, v, c]) => React.createElement("div", { key: l, style: { minWidth: 0 } }, React.createElement("div", { style: { fontSize: 10.5, color: c, fontWeight: 700 } }, l), React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap" } }, valFin(v))))), React.createElement("button", { type: "button", onClick: (e) => {
    e.stopPropagation();
    trocarOcultar();
  }, "aria-label": ocultarFin ? "Mostrar valores" : "Ocultar valores", style: { border: "none", background: "#f1f5f9", borderRadius: 99, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#475569", flexShrink: 0 } }, React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("path", { d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" }), React.createElement("circle", { cx: "12", cy: "12", r: "3" }), ocultarFin && React.createElement("line", { x1: "3", y1: "3", x2: "21", y2: "21" })))), (() => {
    const rv = resumoVitrine(rx, students, mesStart, mesEnd);
    if (!rv.vendas.length && !rv.bonus.length) return null;
    return React.createElement(Card, { onClick: () => nav("financeiro"), style: { padding: "10px 12px", marginTop: -6, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } }, React.createElement("div", { style: { fontSize: 12, color: "#334155" } }, "Vitrine no mês: ", React.createElement("b", null, valFin(rv.totalV)), " vendidos"), React.createElement("div", { style: { fontSize: 12, color: "#c2410c", fontWeight: 700, whiteSpace: "nowrap" } }, valFin(rv.totalB), " em bônus"));
  })(), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 } }, (() => {
    const avMes = assessments.filter((a) => a.date && a.date >= mesStart && a.date <= mesEnd).length;
    return [
      { label: "Alunos", sub: ativos.length + " ativo" + (ativos.length === 1 ? "" : "s"), icon: "users", color: "#FF5603", go: () => nav("students") },
      { label: "Avaliações", sub: avMes + " no mês", icon: "clip", color: "#6366f1", go: () => nav("assessments") },
      { label: "Circuito", sub: "Turmas e aulas", icon: "timer", color: "#0F6E56", go: () => {
        window.location.href = "longevus-circuito.html";
      } },
      { label: "Vitrine", sub: "Serviços e parceiros", icon: "store", color: "#be185d", go: () => nav("vitrine") },
      { label: "Condomínios", sub: "Prospecção", icon: "building", color: "#185FA5", go: () => nav("condominios") },
      { label: "Materiais", sub: "Links e apresentações", icon: "folder", color: "#b45309", go: () => nav("materiais") }
    ];
  })().map((m) => React.createElement(Card, { key: m.label, onClick: m.go, style: { display: "flex", alignItems: "center", gap: 11, padding: "13px 12px" } }, React.createElement("div", { style: { width: 38, height: 38, borderRadius: 11, background: m.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, React.createElement(I, { n: m.icon, c: m.color, s: 19 })), React.createElement("div", { style: { minWidth: 0 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a" } }, m.label), React.createElement("div", { style: { fontSize: 11.5, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, m.sub))))), recent.length > 0 && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontWeight: 700, fontSize: 15, marginBottom: 10 } }, "Recentes"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 9 } }, recent.map((a) => {
    const st = students.find((s) => s.id === a.studentId);
    const gc = classifyGlobal(a.globalScore || 0);
    return React.createElement(Card, { key: a.id, onClick: () => nav("result", { id: a.id }), style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" } }, React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, st?.name || "Aluno"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, fmt(a.date))), a.globalScore > 0 && React.createElement(Badge, { color: gc.color, bg: gc.bg }, gc.label));
  }))));
};
const ChartWrap = ({ series, labels }) => {
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  return React.createElement(Card, { style: { padding: "14px 12px" } }, React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 10, height: 120, marginBottom: 8 } }, labels.map((lbl, i) => React.createElement("div", { key: i, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" } }, React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 3, height: "100%", width: "100%", justifyContent: "center" } }, series.map((s, si) => React.createElement("div", { key: si, title: s.name + ": " + fmtR(s.values[i]), style: { width: 10, borderRadius: "3px 3px 0 0", height: Math.max(2, s.values[i] / max * 100) + "%", background: s.color } }))), React.createElement("div", { style: { fontSize: 9, color: "#94a3b8", marginTop: 4 } }, lbl)))), React.createElement("div", { style: { display: "flex", gap: 14, justifyContent: "center" } }, series.map((s, si) => React.createElement("div", { key: si, style: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" } }, React.createElement("span", { style: { width: 8, height: 8, borderRadius: 2, background: s.color, display: "inline-block" } }), s.name))));
};
const PagamentoModal = ({ student, pagamentos, setPagamentos, setStudents, onClose }) => {
  const abertos = pagamentos.filter((p) => p.studentId === student.id && p.status === "previsto").sort((a, b) => (a.dataPrevista || "").localeCompare(b.dataPrevista || ""));
  const abertosMensal = abertos.filter((p) => p.tipo === "mensal");
  const abertosAvulso = abertos.filter((p) => p.tipo === "avulso");
  const tipoPrincipal = student.billing?.tipo === "avulso" ? "avulso" : "mensal";
  const grupoPrincipal = abertos.filter((p) => p.tipo === tipoPrincipal);
  const [valores, setValores] = useState(() => Object.fromEntries(abertos.map((p) => [p.id, p.valorPrevisto])));
  const [datas, setDatas] = useState(() => Object.fromEntries(abertos.map((p) => [p.id, todayStr()])));
  const [sessoesMap, setSessoesMap] = useState(() => Object.fromEntries(abertos.map((p) => [p.id, p.sessoes != null ? p.sessoes : ""])));
  const [selecionados, setSelecionados] = useState(() => grupoPrincipal.length === 1 ? new Set([grupoPrincipal[0].id]) : new Set());
  useEffect(() => {
    setValores((vs) => {
      const n = { ...vs };
      let mudou = false;
      abertos.forEach((p) => {
        if (!(p.id in n)) {
          n[p.id] = p.valorPrevisto;
          mudou = true;
        }
      });
      return mudou ? n : vs;
    });
    setDatas((ds) => {
      const n = { ...ds };
      let mudou = false;
      abertos.forEach((p) => {
        if (!(p.id in n)) {
          n[p.id] = todayStr();
          mudou = true;
        }
      });
      return mudou ? n : ds;
    });
    setSessoesMap((sm) => {
      const n = { ...sm };
      let mudou = false;
      abertos.forEach((p) => {
        if (!(p.id in n)) {
          n[p.id] = p.sessoes != null ? p.sessoes : "";
          mudou = true;
        }
      });
      return mudou ? n : sm;
    });
  }, [pagamentos.length]);
  const alterarSessoes = (pg, qtd) => {
    setSessoesMap((sm) => ({ ...sm, [pg.id]: qtd }));
    const valorSessao = pg.valorSessao || student.billing?.valorSessao || 0;
    if (qtd !== "" && !isNaN(Number(qtd))) setValores((vs) => ({ ...vs, [pg.id]: Number(qtd) * Number(valorSessao) }));
  };
  const toggleSel = (id) => setSelecionados((prev) => {
    const n = new Set(prev);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });
  const [novoValor, setNovoValor] = useState("");
  const [novaData, setNovaData] = useState(todayStr());
  const adicionarLancamento = () => {
    if (!novoValor) return;
    setPagamentos((p) => [...p, novoPagamentoAvulso(student, novaData, null, novoValor)]);
    setNovoValor("");
  };
  const [adiantQtd, setAdiantQtd] = useState("");
  const [adiantValor, setAdiantValor] = useState("");
  const [adiantData, setAdiantData] = useState(todayStr());
  const registrarAdiantamento = () => {
    const qtd = Number(adiantQtd), valor = Number(adiantValor);
    if (!qtd || qtd <= 0 || !valor || valor <= 0 || !setStudents) return;
    setPagamentos((p) => [...p, {
      id: uid(),
      studentId: student.id,
      tipo: "avulso",
      plano: qtd + " aula(s) pagas adiantado",
      dataPrevista: adiantData,
      valorPrevisto: valor,
      dataPagamento: adiantData,
      valorPago: valor,
      qtdCreditos: qtd,
      status: "pago",
      origem: "adiantamento",
      agendaEntryId: null,
      obs: "",
      createdAt: todayStr()
    }]);
    setStudents((p) => p.map((s) => s.id === student.id ? { ...s, billing: { ...s.billing || {}, creditosAvulso: (s.billing?.creditosAvulso || 0) + qtd, creditoValorUnitario: valor / qtd } } : s));
    setAdiantQtd("");
    setAdiantValor("");
  };
  const totalSelecionado = abertos.filter((p) => selecionados.has(p.id)).reduce((a, p) => a + (Number(valores[p.id]) || 0), 0);
  const totalCheioSelecionado = abertos.filter((p) => selecionados.has(p.id)).reduce((a, p) => a + (Number(p.valorPrevisto) || 0), 0);
  const [descontoTipo, setDescontoTipo] = useState("pct");
  const [descontoValor, setDescontoValor] = useState("");
  const aplicarDesconto = () => {
    const selArr = abertos.filter((p) => selecionados.has(p.id));
    if (selArr.length === 0 || !descontoValor) return;
    const totalAtual = selArr.reduce((a, p) => a + (Number(valores[p.id]) || 0), 0);
    if (totalAtual <= 0) return;
    let descontoTotal = descontoTipo === "pct" ? totalAtual * (Number(descontoValor) / 100) : Number(descontoValor);
    descontoTotal = Math.min(Math.max(descontoTotal, 0), totalAtual);
    setValores((vs) => {
      const n = { ...vs };
      selArr.forEach((p) => {
        const proporcao = (Number(vs[p.id]) || 0) / totalAtual;
        n[p.id] = Math.max(0, Number((Number(vs[p.id]) - descontoTotal * proporcao).toFixed(2)));
      });
      return n;
    });
  };
  const limparDesconto = () => {
    const selArr = abertos.filter((p) => selecionados.has(p.id));
    setValores((vs) => {
      const n = { ...vs };
      selArr.forEach((p) => {
        n[p.id] = p.valorPrevisto;
      });
      return n;
    });
    setDescontoValor("");
  };
  const registrarPagamentoMes = () => {
    const hoje = todayStr();
    const base = student.billing?.vencimento || hoje;
    if (!window.confirm("Registrar pagamento de " + fmtR(student.billing?.valor) + " referente ao vencimento de " + fmt(base) + "?")) return;
    const proxIso = proximoVencimentoMensal(student.billing, base);
    setPagamentos((p) => [
      ...p,
      { ...novoPagamentoMensal(student, base), status: "pago", valorPago: Number(student.billing?.valor) || 0, dataPagamento: hoje, origem: "manual" },
      novoPagamentoMensal(student, proxIso, base)
    ]);
    if (setStudents) setStudents((p) => p.map((s) => s.id === student.id ? { ...s, billing: { ...s.billing || {}, ultimoPagamento: hoje, vencimento: proxIso } } : s));
    onClose();
  };
  const confirmarBaixa = () => {
    const hoje = todayStr();
    const pagos = abertos.filter((p) => selecionados.has(p.id));
    if (pagos.length === 0) return;
    if (pagos.length > 1) {
      const ok = window.confirm("Confirmar baixa de " + pagos.length + " lançamento(s), totalizando " + fmtR(totalSelecionado) + "?");
      if (!ok) return;
    }
    setPagamentos((p) => p.map((pg) => selecionados.has(pg.id) ? { ...pg, status: "pago", valorPago: Number(valores[pg.id]) || 0, dataPagamento: datas[pg.id] || hoje, sessoes: sessoesMap[pg.id] !== "" && sessoesMap[pg.id] != null ? Number(sessoesMap[pg.id]) : pg.sessoes } : pg));
    const pagosMensais = pagos.filter((p) => p.tipo === "mensal");
    if (student.billing?.tipo !== "avulso" && setStudents && pagosMensais.length > 0) {
      if (student.billing?.modoCobranca === "porSessao") {
        setStudents((p) => p.map((s) => s.id === student.id ? { ...s, billing: { ...s.billing || {}, ultimoPagamento: hoje } } : s));
      } else {
        const base = pagosMensais[pagosMensais.length - 1].dataPrevista || hoje;
        const proxIso = proximoVencimentoMensal(student.billing, base);
        setPagamentos((p) => [...p, novoPagamentoMensal(student, proxIso, base)]);
        setStudents((p) => p.map((s) => s.id === student.id ? { ...s, billing: { ...s.billing || {}, ultimoPagamento: hoje, vencimento: proxIso } } : s));
      }
    }
    onClose();
  };
  const renderLancamento = (pg) => {
    const vencido = pg.dataPrevista && pg.dataPrevista < todayStr();
    const sel = selecionados.has(pg.id);
    return React.createElement("div", { key: pg.id, style: { border: "1.5px solid " + (sel ? O : "#e2e8f0"), borderRadius: 10, padding: "10px 12px", background: sel ? "#fff7f2" : "#fff" } }, React.createElement("div", { onClick: () => toggleSel(pg.id), style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, cursor: "pointer", marginBottom: sel ? 8 : 0 } }, React.createElement("div", null, React.createElement("div", { style: { fontSize: 13, fontWeight: 700 } }, pg.tipo === "mensal" ? pg.plano || "Mensalidade" : "Aula avulsa"), React.createElement("div", { style: { fontSize: 11, color: vencido ? "#dc2626" : "#94a3b8" } }, "Previsto: ", fmt(pg.dataPrevista), " · ", pg.modoCobranca === "porSessao" && !pg.valorPrevisto ? "a calcular" : fmtR(pg.valorPrevisto), vencido ? " · vencido" : "")), React.createElement("div", { style: { width: 20, height: 20, borderRadius: 6, border: "1.5px solid " + (sel ? O : "#cbd5e1"), background: sel ? O : "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, flexShrink: 0 } }, sel ? "✓" : "")), sel && React.createElement(React.Fragment, null, (pg.modoCobranca === "porSessao" || !pg.modoCobranca && student.billing?.modoCobranca === "porSessao" && pg.tipo === "mensal") && React.createElement("div", { style: { marginBottom: 8 } }, React.createElement(Inp, { label: "Sessões no mês — contadas da agenda (R$ " + Number(pg.valorSessao || student.billing?.valorSessao || 0).toFixed(2).replace(".", ",") + "/sessão)", type: "number", value: sessoesMap[pg.id], onChange: (v) => alterarSessoes(pg, v), placeholder: "Ex: 12" })), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, React.createElement(Inp, { label: "Valor pago (R$)", type: "number", value: valores[pg.id], onChange: (v) => setValores((vs) => ({ ...vs, [pg.id]: v })) }), React.createElement(Inp, { label: "Data pagto", type: "date", value: datas[pg.id], onChange: (v) => setDatas((vs) => ({ ...vs, [pg.id]: v })) }))));
  };
  return React.createElement(Modal, { title: "💰 " + student.name, onClose }, student.billing?.tipo === "avulso" && (student.billing?.creditosAvulso || 0) > 0 && React.createElement("div", { style: { background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 10, padding: "10px 12px", marginBottom: 14, fontSize: 12, color: "#166534", fontWeight: 700 } }, "✅ ", student.billing.creditosAvulso, " aula(s) já paga(s) adiantado, disponíveis pra abater"), abertos.length === 0 ? React.createElement("div", { style: { marginBottom: 16 } }, React.createElement("div", { style: { fontSize: 13, color: "#94a3b8", marginBottom: student.billing?.tipo !== "avulso" && student.billing?.modoCobranca !== "porSessao" ? 10 : 0 } }, "Nenhuma cobrança em aberto no momento."), student.billing?.tipo !== "avulso" && student.billing?.modoCobranca !== "porSessao" && React.createElement(Btn, { full: true, variant: "secondary", onClick: registrarPagamentoMes }, "Registrar pagamento do mês (", fmtR(student.billing?.valor), ")")) : React.createElement(React.Fragment, null, tipoPrincipal === "mensal" ? React.createElement(React.Fragment, null, abertosMensal.length > 0 && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginBottom: abertosAvulso.length > 0 ? 16 : 8 } }, abertosMensal.map(renderLancamento)), abertosAvulso.length > 0 && React.createElement("div", { style: { marginBottom: 16 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#c2410c", textTransform: "uppercase", marginBottom: 8 } }, "Aulas avulsas — pendência de antes de virar mensal"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 8 } }, "Ficam separadas da mensalidade por padrão. Marque só se quiser quitar junto agora."), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, abertosAvulso.map(renderLancamento)))) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 } }, abertos.map(renderLancamento))), abertos.length > 1 && React.createElement("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 10 } }, React.createElement("button", { onClick: () => setSelecionados(selecionados.size === abertos.length ? new Set() : new Set(abertos.map((p) => p.id))), style: { border: "none", background: "none", color: O, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 } }, selecionados.size === abertos.length ? "Limpar seleção" : "Marcar todos (" + abertos.length + ")")), selecionados.size > 0 && React.createElement("div", { style: { marginBottom: 12 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" } }, "Aplicar desconto (", selecionados.size, " selecionada", selecionados.size > 1 ? "s" : "", ")"), React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 6 } }, React.createElement("button", { onClick: () => setDescontoTipo("pct"), style: { flex: 1, border: "none", borderRadius: 8, padding: "7px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: descontoTipo === "pct" ? "#0f172a" : "#f1f5f9", color: descontoTipo === "pct" ? "#fff" : "#64748b" } }, "%"), React.createElement("button", { onClick: () => setDescontoTipo("valor"), style: { flex: 1, border: "none", borderRadius: 8, padding: "7px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: descontoTipo === "valor" ? "#0f172a" : "#f1f5f9", color: descontoTipo === "valor" ? "#fff" : "#64748b" } }, "R$")), React.createElement("div", { style: { display: "flex", gap: 8 } }, React.createElement(Inp, { label: descontoTipo === "pct" ? "Desconto (%)" : "Desconto (R$)", type: "number", value: descontoValor, onChange: setDescontoValor, placeholder: descontoTipo === "pct" ? "10" : "50.00" })), React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 6 } }, React.createElement(Btn, { variant: "secondary", full: true, onClick: aplicarDesconto, disabled: !descontoValor }, "Aplicar"), totalSelecionado < totalCheioSelecionado && React.createElement(Btn, { variant: "secondary", full: true, onClick: limparDesconto }, "Remover desconto"))), abertos.length > 0 && React.createElement("div", { style: { marginBottom: 14 } }, totalSelecionado < totalCheioSelecionado && React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", textDecoration: "line-through", marginBottom: 2 } }, React.createElement("span", null, "Valor cheio"), React.createElement("span", null, fmtR(totalCheioSelecionado))), React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 700, color: "#0f172a", borderTop: "1px solid #f1f5f9", paddingTop: 10 } }, React.createElement("span", null, "Total selecionado (", selecionados.size, ")"), React.createElement("span", null, fmtR(totalSelecionado)))), student.billing?.tipo === "avulso" && React.createElement("div", { style: { borderTop: "1px solid #f1f5f9", paddingTop: 12, marginBottom: 14 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 } }, "+ Nova cobrança avulsa"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 } }, React.createElement(Inp, { label: "Valor (R$)", type: "number", value: novoValor, onChange: setNovoValor, placeholder: String(student.billing?.valorAula || "") }), React.createElement(Inp, { label: "Data", type: "date", value: novaData, onChange: setNovaData })), React.createElement(Btn, { variant: "secondary", full: true, onClick: adicionarLancamento, disabled: !novoValor }, "Adicionar à lista")), student.billing?.tipo === "avulso" && React.createElement("div", { style: { borderTop: "1px solid #f1f5f9", paddingTop: 12, marginBottom: 14 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 } }, "💳 Registrar aulas pagas adiantado"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 8 } }, "Aluno pagou antes de acontecer. Conforme as aulas forem realizadas, elas são quitadas sozinhas — sem gerar cobrança nova."), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 } }, React.createElement(Inp, { label: "Aulas", type: "number", value: adiantQtd, onChange: setAdiantQtd, placeholder: "4" }), React.createElement(Inp, { label: "Valor total (R$)", type: "number", value: adiantValor, onChange: setAdiantValor, placeholder: "260.00" }), React.createElement(Inp, { label: "Data pagto", type: "date", value: adiantData, onChange: setAdiantData })), React.createElement(Btn, { variant: "secondary", full: true, onClick: registrarAdiantamento, disabled: !adiantQtd || !adiantValor }, "Registrar adiantamento")), React.createElement("div", { style: { display: "flex", gap: 10 } }, React.createElement(Btn, { variant: "secondary", full: true, onClick: onClose }, "Fechar"), abertos.length > 0 && React.createElement(Btn, { full: true, onClick: confirmarBaixa, disabled: selecionados.size === 0 }, "Confirmar pagamento", selecionados.size > 1 ? "s" : "")));
};
const linkComprar = (id) => window.location.origin + window.location.pathname.replace(/[^/]*$/, "") + "comprar.html?i=" + encodeURIComponent(id);
const copiarLinkPublico = async (url, titulo) => {
  let ok = false;
  try {
    await navigator.clipboard.writeText(url);
    ok = true;
  } catch (e) {
  }
  if (!ok) {
    window.prompt("Copie o link:", url);
    return false;
  }
  try {
    if (navigator.share) await navigator.share({ title: titulo, text: titulo + ": contrate por este link", url });
  } catch (e) {
  }
  return true;
};
const ServicosVitrinePlanos = ({ nav }) => {
  const [itens, setItens] = useState(null);
  const [copiado, setCopiado] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const headers = await DB.authHeaders();
        const { data: ses } = await supa.auth.getSession();
        const uid2 = ses?.session?.user?.id;
        const [r, rp] = await Promise.all([fetch(SUPA_URL + "/rest/v1/vitrine_itens?select=id,ativo,data&order=ordem.asc", { headers }), uid2 ? fetch(SUPA_URL + "/rest/v1/professionals?select=l360&id=eq." + uid2, { headers }) : Promise.resolve(null)]);
        const rows = r.ok ? await r.json() : [];
        const pf = rp && rp.ok ? (await rp.json())[0] || {} : {};
        const lista = [];
        if (pf.l360 && valorBR(pf.l360.valor) > 0) lista.push({ id: "l360:" + uid2, ativo: pf.l360.ativo !== false, venda: "mensal", data: { titulo: pf.l360.nome || "Longevus 360", valor: pf.l360.valor, texto: "Treino e alimentação conversando no app." } });
        (rows || []).forEach((x) => {
          const d = x.data || {};
          if (d.tipo === "parceiro" || d.cobranca === "plano" || d.produto === "indique" || d.produto === "l360") return;
          if (d.produto === "elo") lista.push({ ...x, venda: "elo" });
          else if (d.produto === "mente") {
            if (valorBR(d.valor || d.preco) > 0) lista.push({ ...x, venda: "mensal" });
          } else if (!d.produto && valorBR(d.valor || d.preco) > 0) lista.push({ ...x, venda: "avulso" });
        });
        setItens(lista);
      } catch (e) {
        setItens([]);
      }
    })();
  }, []);
  if (itens === null) return null;
  return React.createElement("div", { style: { marginTop: 22 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 4 } }, "Serviços da vitrine"), React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 10 } }, "Tudo o que você vende na vitrine, avulso ou mensal. O link abre uma página de compra com Pix."), itens.length === 0 ? React.createElement(Card, { style: { padding: 16, fontSize: 12.5, color: "#94a3b8" } }, "Nenhum serviço seu com valor na vitrine. ", React.createElement("span", { onClick: () => nav("vitrine"), style: { color: O, fontWeight: 700, cursor: "pointer" } }, "Abrir vitrine ›")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, itens.map((x) => {
    const d = x.data || {};
    return React.createElement(Card, { key: x.id, style: { padding: "14px 16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 } }, React.createElement("div", { style: { flex: 1, minWidth: 0 }, onClick: () => nav("vitrine") }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 } }, React.createElement("span", { style: { fontWeight: 700, fontSize: 14 } }, d.titulo || "Serviço"), React.createElement(Badge, { color: "#c2410c", bg: "#fff4ee" }, "vitrine"), x.ativo === false && React.createElement(Badge, { color: "#64748b", bg: "#f1f5f9" }, "Fora do app")), React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: O } }, x.venda === "elo" ? fmtR(valorBR(d.valor || d.preco) || 49.9) + " · 1º mês, depois R$ 39,90" : fmtR(valorBR(d.valor || d.preco)) + (x.venda === "mensal" ? "/mês" : " · avulso")), d.texto && React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2 } }, d.texto), copiado === x.id && React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#15803d", marginTop: 6 } }, "✓ Link copiado. Cole no WhatsApp.")), React.createElement("button", { onClick: () => window.open(x.link || linkComprar(x.id), "_blank", "noopener"), "aria-label": "Abrir a página no navegador", title: "Abrir a página no navegador", style: { background: "#eef2ff", border: "none", borderRadius: 10, cursor: "pointer", color: "#4f46e5", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("circle", { cx: "12", cy: "12", r: "10" }), React.createElement("path", { d: "M2 12h20" }), React.createElement("path", { d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" }))), React.createElement("button", { onClick: async () => {
      if (x.ativo === false && !window.confirm("Este serviço está desligado na vitrine, e o link não abre enquanto ele estiver desligado. Copiar mesmo assim?")) return;
      if (await copiarLinkPublico(x.link || linkComprar(x.id), d.titulo || "Serviço")) {
        setCopiado(x.id);
        setTimeout(() => setCopiado((c) => c === x.id ? null : c), 4e3);
      }
    }, "aria-label": "Gerar link de compra", title: "Gerar link de compra", style: { background: "#fff4ee", border: "none", borderRadius: 10, cursor: "pointer", color: O, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }), React.createElement("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" })))));
  })));
};
const ComprasPublicasInicio = ({ students, setStudents, setLeads, nav }) => {
  const [lista, setLista] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const headers = await DB.authHeaders();
        const r = await fetch(SUPA_URL + "/rest/v1/compras_publicas?select=*&visto=eq.false&order=created_at.desc&limit=30", { headers });
        if (r.ok) setLista(await r.json());
      } catch (e) {
      }
    })();
  }, []);
  const patch = async (c, corpo) => {
    setLista((p) => p.filter((x) => x.id !== c.id));
    try {
      const headers = await DB.authHeaders();
      await fetch(SUPA_URL + "/rest/v1/compras_publicas?id=eq." + c.id, { method: "PATCH", headers: { ...headers, Prefer: "return=minimal" }, body: JSON.stringify(corpo) });
    } catch (e) {
    }
  };
  const dig = (t) => String(t || "").replace(/\D/g, "");
  const confirmar = async (c) => {
    const titulo = c.titulo || "Serviço";
    const v = pedirValorVit(titulo, c.valor);
    if (v === null) return;
    const hoje = todayStr();
    const num = dig(c.whatsapp);
    const aluno = num.length >= 10 ? students.find((s) => dig(s.whatsapp || s.phone).slice(-9) === num.slice(-9)) : null;
    const pr = c.presente && c.presente.nome ? c.presente : null;
    if (aluno && !pr) {
      setStudents((p) => p.map((x) => x.id !== aluno.id ? x : { ...x, servicos: { ...x.servicos || {}, [c.item_id]: { status: "pago", em: hoje, titulo } } }));
      registrarVitrine(setStudents, aluno, "venda", c.item_id, titulo, v);
    } else if (window.__lvAddReceita) window.__lvAddReceita({ id: uid(), descricao: titulo + (pr ? " (presente)" : "") + " · " + c.nome, categoria: "vitrine", recorrente: false, frequencia: null, status: "recebido", dataPrevista: hoje, valorPrevisto: v, dataPagamento: hoje, valorPago: v, obs: "Compra pelo link", createdAt: hoje, produto: c.item_id, produtoTitulo: titulo, origem: "link" });
    const novoLead = (n, w, necessidade, obs) => ({ id: uid(), name: n, whatsapp: w || "", instagram: "", idade: "", sexo: "", origem: "Link da vitrine", indicadoPor: pr ? c.nome : "", objetivo: "", necessidade, temperatura: "quente", etapa: "novo", status: "ativo", obs: obs || "", proximaAcaoTipo: "Enviar mensagem", proximaAcaoData: hoje, proximaAcaoHorario: "", proximaAcaoObs: "Agendar " + titulo, motivoNaoFechamento: "", motivoObs: "", valorPotencial: "", createdAt: hoje, historico: [{ ts: (new Date()).toISOString(), texto: (pr ? "Ganhou de presente de " + c.nome + ": " : "Comprou pelo link: ") + titulo }] });
    if (setLeads) {
      const alvo = pr ? { n: pr.nome, w: pr.whatsapp } : aluno ? null : { n: c.nome, w: c.whatsapp };
      if (alvo) setLeads((p) => {
        const wn = dig(alvo.w);
        if (wn && p.some((l) => dig(l.whatsapp).slice(-9) === wn.slice(-9))) return p;
        return [...p, novoLead(alvo.n, alvo.w, pr ? "Ganhou de presente: " + titulo : "Comprou: " + titulo, pr && pr.mensagem ? 'Mensagem do presente: "' + pr.mensagem + '"' : "")];
      });
    }
    patch(c, { visto: true, status: "pago" });
  };
  if (!lista.length) return null;
  return React.createElement("div", { style: { marginBottom: 16 } }, lista.map((c) => {
    const pr = c.presente && c.presente.nome ? c.presente : null;
    const w = dig(pr && pr.whatsapp ? pr.whatsapp : c.whatsapp);
    const quem = pr ? pr.nome : c.nome;
    return React.createElement(Card, { key: c.id, style: { padding: "10px 14px", background: "#fff7ed", border: "1.5px solid #fed7aa", marginBottom: 8 } }, React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#9a3412" } }, c.nome + " pagou pelo link: " + (c.titulo || "serviço") + (c.valor ? " (" + fmtR(c.valor) + ")" : "")), React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 2 } }, (pr ? "Presente para " + pr.nome + ". " : "") + "Em " + new Date(c.created_at).toLocaleDateString("pt-BR") + " às " + new Date(c.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + ". Confira no banco antes de confirmar."), React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 8 } }, w.length >= 10 && React.createElement("a", { href: "https://wa.me/" + (w.length <= 11 ? "55" + w : w) + "?text=" + encodeURIComponent("Oi, " + String(quem).split(" ")[0] + "! Aqui é o Wellington Brito. " + (pr ? c.nome.split(" ")[0] + " te deu de presente: " + (c.titulo || "um atendimento") + "." : "Recebi seu pagamento de " + (c.titulo || "serviço") + ", obrigado!") + " Vamos agendar? Qual dia e horário ficam bons para você?"), target: "_blank", rel: "noopener noreferrer", style: { flex: 1, padding: "8px", borderRadius: 9, background: "#E9F5F2", color: "#0F6E56", fontWeight: 700, fontSize: 12, textAlign: "center", textDecoration: "none" } }, "Chamar " + String(quem).split(" ")[0]), React.createElement("button", { onClick: () => confirmar(c), style: { flex: 1, padding: "8px", borderRadius: 9, border: "none", background: "#FF5603", color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, "Confirmar pagamento"), React.createElement("button", { onClick: () => patch(c, { visto: true, status: "nao_caiu" }), style: { flex: 0.7, padding: "8px", borderRadius: 9, border: "1.5px solid #fed7aa", background: "#fff", color: "#9a3412", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" } }, "Não caiu")));
  }));
};
const resumoVitrine = (receitasExtras, students, inicio, fim) => {
  const vendas = (receitasExtras || []).filter((r) => r.categoria === "vitrine" && r.status === "recebido" && r.dataPagamento && r.dataPagamento >= inicio && r.dataPagamento <= fim);
  const bonus = (students || []).flatMap((s) => (s.vitrineHist || []).filter((h) => h.tipo === "bonus" && h.data >= inicio && h.data <= fim).map((h) => ({ ...h, aluno: s.name })));
  const grupo = {};
  vendas.forEach((r) => {
    const k = r.produtoTitulo || String(r.descricao || "").split(" · ")[0] || "Outro";
    grupo[k] = grupo[k] || { nome: k, n: 0, v: 0, nb: 0, vb: 0 };
    grupo[k].n++;
    grupo[k].v += Number(r.valorPago) || 0;
  });
  bonus.forEach((h) => {
    const k = String(h.titulo || "Outro").replace(" (indicação)", "");
    grupo[k] = grupo[k] || { nome: k, n: 0, v: 0, nb: 0, vb: 0 };
    grupo[k].nb++;
    grupo[k].vb += Number(h.valor) || 0;
  });
  return { vendas, bonus, totalV: vendas.reduce((a, r) => a + (Number(r.valorPago) || 0), 0), totalB: bonus.reduce((a, h) => a + (Number(h.valor) || 0), 0), linhas: Object.values(grupo).sort((a, b) => b.v + b.vb - (a.v + a.vb)) };
};
const VitrineResumo = ({ receitasExtras, students, inicio, fim, nav }) => {
  const r = resumoVitrine(receitasExtras, students, inicio, fim);
  return React.createElement(Card, { style: { padding: "14px 16px", marginBottom: 18 } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569" } }, "Vitrine no período"), React.createElement("button", { onClick: () => nav("vitrine"), style: { border: "none", background: "none", padding: 0, fontSize: 12, fontWeight: 700, color: "#c2410c", cursor: "pointer", fontFamily: "inherit" } }, "Abrir vitrine ›")), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement("div", { style: { background: "#dcfce7", borderRadius: 12, padding: "10px 12px" } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#15803d" } }, "Vendido"), React.createElement("div", { style: { fontSize: 17, fontWeight: 800, color: "#0f172a" } }, fmtR(r.totalV)), React.createElement("div", { style: { fontSize: 11, color: "#64748b" } }, r.vendas.length, " ", r.vendas.length === 1 ? "venda" : "vendas", " · entra no recebido")), React.createElement("div", { style: { background: "#fff4ee", borderRadius: 12, padding: "10px 12px" } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#c2410c" } }, "Dado em bônus"), React.createElement("div", { style: { fontSize: 17, fontWeight: 800, color: "#0f172a" } }, fmtR(r.totalB)), React.createElement("div", { style: { fontSize: 11, color: "#64748b" } }, r.bonus.length, " ", r.bonus.length === 1 ? "bônus" : "bônus", " · não soma na receita"))), r.linhas.length === 0 ? React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 10 } }, "Nenhuma venda ou bônus da vitrine nesse período.") : React.createElement("div", { style: { marginTop: 10 } }, r.linhas.map((l) => React.createElement("div", { key: l.nome, style: { display: "flex", justifyContent: "space-between", gap: 8, padding: "8px 0", borderTop: "1px solid #f1f5f9", fontSize: 12.5 } }, React.createElement("div", { style: { minWidth: 0 } }, React.createElement("div", { style: { fontWeight: 700, color: "#0f172a" } }, l.nome), React.createElement("div", { style: { color: "#94a3b8", fontSize: 11 } }, [l.n ? l.n + (l.n === 1 ? " venda" : " vendas") : null, l.nb ? l.nb + " bônus (" + fmtR(l.vb) + ")" : null].filter(Boolean).join(" · "))), React.createElement("div", { style: { fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap" } }, fmtR(l.v))))));
};
const Financeiro = ({ students, setStudents, planos, setPlanos, pagamentos, setPagamentos, receitasExtras, setReceitasExtras, nav, agendaEntries }) => {
  const [finView, setFinView] = useState("alunos");
  const [planoModal, setPlanoModal] = useState(false);
  const [planoEditId, setPlanoEditId] = useState(null);
  const [linkCopiado, setLinkCopiado] = useState(null);
  const slugDe = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  const urlPlano = (pl) => {
    let slug = pl.slugVenda;
    const dup = slug && planos.some((o) => o.id !== pl.id && o.slugVenda === slug);
    if (!slug || dup) {
      const base = slugDe(pl.nome) || "plano";
      let novo = base, n = 2;
      while (planos.some((o) => o.id !== pl.id && o.slugVenda === novo)) novo = base + n++;
      if (dup && !window.confirm('Outro plano já usa o identificador "' + slug + '". Para o link abrir o plano certo, este passa a usar "' + novo + '".\n\nContinuar?')) return null;
      slug = novo;
      setPlanos((p) => p.map((x) => x.id === pl.id ? { ...x, slugVenda: slug } : x));
    }
    return window.location.origin + window.location.pathname.replace(/[^/]*$/, "") + "aluno.html?cadastro=1&plano=" + encodeURIComponent(slug);
  };
  const abrirPlano = (pl) => {
    const url = urlPlano(pl);
    if (url) window.open(url + "&ver=1", "_blank", "noopener");
  };
  const gerarLinkPlano = async (pl) => {
    if (pl.ativo === false && !window.confirm("Este plano está inativo. Gerar o link mesmo assim?")) return;
    let slug = pl.slugVenda;
    const dup = slug && planos.some((o) => o.id !== pl.id && o.slugVenda === slug);
    if (!slug || dup) {
      const base = slugDe(pl.nome) || "plano";
      let novo = base, n = 2;
      while (planos.some((o) => o.id !== pl.id && o.slugVenda === novo)) novo = base + n++;
      if (dup && !window.confirm('Outro plano já usa o identificador "' + slug + '". Para o link abrir o plano certo, este passa a usar "' + novo + '".\n\nContinuar?')) return;
      slug = novo;
      setPlanos((p) => p.map((x) => x.id === pl.id ? { ...x, slugVenda: slug } : x));
    }
    const url = window.location.origin + window.location.pathname.replace(/[^/]*$/, "") + "aluno.html?cadastro=1&plano=" + encodeURIComponent(slug);
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch (e) {
    }
    if (!ok) {
      window.prompt("Copie o link do plano:", url);
      return;
    }
    setLinkCopiado(pl.id);
    setTimeout(() => setLinkCopiado((c) => c === pl.id ? null : c), 4e3);
    try {
      if (navigator.share) await navigator.share({ title: pl.nome, text: "Contrate o plano " + pl.nome + " por este link:", url });
    } catch (e) {
    }
  };
  const emptyPlano = () => ({ nome: "", modoCobranca: "fixo", valor: "", valorSessao: "", frequencia: "", descricao: "", ativo: true, slugVenda: "", regraVencimento: "30dias", toleranciaDias: "" });
  const [planoForm, setPlanoForm] = useState(emptyPlano());
  const openNovoPlano = () => {
    setPlanoEditId(null);
    setPlanoForm(emptyPlano());
    setPlanoModal(true);
  };
  const openEditPlano = (pl) => {
    setPlanoEditId(pl.id);
    setPlanoForm({ nome: pl.nome, modoCobranca: pl.modoCobranca || "fixo", valor: pl.valor, valorSessao: pl.valorSessao || "", frequencia: pl.frequencia || "", descricao: pl.descricao || "", ativo: pl.ativo !== false, slugVenda: pl.slugVenda || "", regraVencimento: pl.regraVencimento || "30dias", toleranciaDias: pl.toleranciaDias ?? "" });
    setPlanoModal(true);
  };
  const salvarPlano = () => {
    if (!planoForm.nome.trim()) return;
    if (planoEditId) {
      const antigo = (planos || []).find((pl) => pl.id === planoEditId);
      const nomeNovo = planoForm.nome.trim();
      const mudou = antigo && (antigo.nome !== nomeNovo || String(antigo.valor || "") !== String(planoForm.valor || "") || String(antigo.valorSessao || "") !== String(planoForm.valorSessao || ""));
      const usam = mudou ? (students || []).filter((s) => s.billing?.ativo && s.billing?.tipo !== "avulso" && (s.billing?.plano || "") === antigo.nome) : [];
      if (usam.length && window.confirm(usam.length + ' aluno(s) usam o plano "' + antigo.nome + '": ' + usam.map((s) => s.name).join(", ") + ".\n\nAtualizar o plano deles e as cobranças em aberto para:\n" + nomeNovo + " · " + (planoForm.modoCobranca === "porSessao" ? fmtR(planoForm.valorSessao) + "/sessão" : fmtR(planoForm.valor)) + "?\n\nOK atualiza. Cancelar muda só o catálogo; os alunos continuam como estão.")) {
        const ids = new Set(usam.map((s) => s.id));
        const billingNovo = (b) => ({ ...b, plano: nomeNovo, valor: planoForm.modoCobranca === "porSessao" ? b.valor : planoForm.valor, valorSessao: planoForm.modoCobranca === "porSessao" ? planoForm.valorSessao : b.valorSessao });
        setStudents((p) => p.map((s) => ids.has(s.id) ? { ...s, billing: billingNovo(s.billing) } : s));
        setPagamentos((p) => p.map((pg) => {
          if (!ids.has(pg.studentId) || pg.status !== "previsto" || pg.tipo !== "mensal" || (pg.plano || "") !== antigo.nome) return pg;
          if (pg.modoCobranca === "porSessao") return { ...pg, plano: nomeNovo, valorSessao: Number(planoForm.valorSessao) || 0, valorPrevisto: (Number(planoForm.valorSessao) || 0) * (Number(pg.sessoes) || 1) };
          return { ...pg, plano: nomeNovo, valorPrevisto: Number(planoForm.valor) || 0 };
        }));
      }
      setPlanos((p) => p.map((pl) => pl.id === planoEditId ? { ...pl, ...planoForm, nome: nomeNovo } : pl));
    } else setPlanos((p) => [...p, { id: uid(), ...planoForm, nome: planoForm.nome.trim(), createdAt: todayStr() }]);
    setPlanoModal(false);
  };
  const excluirPlano = async (id) => {
    const pl = (planos || []).find((x) => x.id === id);
    const usam = pl ? (students || []).filter((s) => s.billing?.ativo && (s.billing?.plano || "") === pl.nome) : [];
    if (!window.confirm(usam.length ? 'Excluir o plano "' + pl.nome + '" do catálogo?\n\n' + usam.length + " aluno(s) usam este plano: " + usam.map((s) => s.name).join(", ") + ". Eles continuam com o nome e o valor atuais, e as cobranças deles não mudam. Para trocar o plano de um aluno, use Editar Aluno → Cobrança." : "Excluir este plano do catálogo? Nenhum aluno usa este plano.")) return;
    await DB.remove("planos", id);
    setPlanos((p) => p.filter((pl2) => pl2.id !== id));
  };
  const CATEGORIAS_EXTRA = [{ v: "produto", l: "Produto" }, { v: "servico", l: "Serviço" }, { v: "vitrine", l: "Vitrine" }, { v: "outro", l: "Outro" }];
  const FREQ_EXTRA = [{ v: "semanal", l: "Semanal", dias: 7 }, { v: "quinzenal", l: "Quinzenal", dias: 15 }, { v: "mensal", l: "Mensal", dias: 30 }];
  const proximaDataRecorrente = (dataStr, frequencia) => {
    const dias = (FREQ_EXTRA.find((f) => f.v === frequencia) || FREQ_EXTRA[2]).dias;
    const d = new Date((dataStr || todayStr()) + "T00:00:00");
    d.setDate(d.getDate() + dias);
    return toISODateLocal(d);
  };
  const [extraModal, setExtraModal] = useState(false);
  const [extraEditId, setExtraEditId] = useState(null);
  const emptyExtra = () => ({ descricao: "", categoria: "produto", recorrente: false, frequencia: "mensal", valor: "", data: todayStr(), obs: "" });
  const [extraForm, setExtraForm] = useState(emptyExtra());
  const openNovaExtra = () => {
    setExtraEditId(null);
    setExtraForm(emptyExtra());
    setExtraModal(true);
  };
  const openEditExtra = (r) => {
    setExtraEditId(r.id);
    setExtraForm({
      descricao: r.descricao,
      categoria: r.categoria || "outro",
      recorrente: !!r.recorrente,
      frequencia: r.frequencia || "mensal",
      valor: r.status === "previsto" ? r.valorPrevisto : r.valorPago,
      data: r.status === "previsto" ? r.dataPrevista : r.dataPagamento,
      obs: r.obs || ""
    });
    setExtraModal(true);
  };
  const salvarExtra = () => {
    if (!extraForm.descricao.trim() || !extraForm.valor) return;
    const valor = Number(extraForm.valor);
    if (extraEditId) {
      setReceitasExtras((p) => p.map((r) => {
        if (r.id !== extraEditId) return r;
        const base = { ...r, descricao: extraForm.descricao, categoria: extraForm.categoria, recorrente: extraForm.recorrente, frequencia: extraForm.recorrente ? extraForm.frequencia : null, obs: extraForm.obs };
        return r.status === "previsto" ? { ...base, dataPrevista: extraForm.data, valorPrevisto: valor } : { ...base, dataPagamento: extraForm.data, valorPago: valor, dataPrevista: extraForm.data, valorPrevisto: valor };
      }));
    } else if (extraForm.recorrente) {
      setReceitasExtras((p) => [...p, {
        id: uid(),
        descricao: extraForm.descricao,
        categoria: extraForm.categoria,
        recorrente: true,
        frequencia: extraForm.frequencia,
        status: "previsto",
        dataPrevista: extraForm.data,
        valorPrevisto: valor,
        dataPagamento: null,
        valorPago: null,
        obs: extraForm.obs,
        createdAt: todayStr()
      }]);
    } else {
      setReceitasExtras((p) => [...p, {
        id: uid(),
        descricao: extraForm.descricao,
        categoria: extraForm.categoria,
        recorrente: false,
        frequencia: null,
        status: "recebido",
        dataPrevista: extraForm.data,
        valorPrevisto: valor,
        dataPagamento: extraForm.data,
        valorPago: valor,
        obs: extraForm.obs,
        createdAt: todayStr()
      }]);
    }
    setExtraModal(false);
  };
  const confirmarRecebimentoExtra = (r) => {
    const hoje2 = todayStr();
    setReceitasExtras((p) => {
      const atualizado = p.map((x) => x.id === r.id ? { ...x, status: "recebido", valorPago: x.valorPrevisto, dataPagamento: hoje2 } : x);
      if (!r.recorrente) return atualizado;
      const proxima = proximaDataRecorrente(r.dataPrevista, r.frequencia);
      return [...atualizado, {
        id: uid(),
        descricao: r.descricao,
        categoria: r.categoria,
        recorrente: true,
        frequencia: r.frequencia,
        status: "previsto",
        dataPrevista: proxima,
        valorPrevisto: r.valorPrevisto,
        dataPagamento: null,
        valorPago: null,
        obs: r.obs,
        createdAt: todayStr()
      }];
    });
  };
  const excluirExtra = async (id) => {
    if (!window.confirm("Excluir essa receita extra?")) return;
    await DB.remove("receitas_extras", id);
    setReceitasExtras((p) => p.filter((r) => r.id !== id));
  };
  const alunosPorPlano = (nome) => students.filter((s) => s.billing?.ativo && s.billing?.plano === nome).length;
  const hoje = todayStr();
  const comCobranca = students.filter((s) => s.billing?.ativo).map((s) => {
    let venc = s.billing.vencimento;
    if (s.billing?.tipo !== "avulso" && s.billing?.modoCobranca === "porSessao") {
      const ab = pagamentos.filter((p) => p.studentId === s.id && p.status === "previsto" && p.dataPrevista).map((p) => p.dataPrevista).sort();
      venc = ab[0] || null;
    }
    const vencido = venc && venc < hoje;
    const diasDiff = venc ? Math.round((new Date(venc) - new Date(hoje)) / 864e5) : null;
    return { ...s, _vencido: vencido, _diasDiff: diasDiff };
  }).sort((a, b) => (a.billing.vencimento || "").localeCompare(b.billing.vencimento || ""));
  const mensalistas = comCobranca.filter((s) => s.billing?.tipo !== "avulso");
  const avulsos = comCobranca.filter((s) => s.billing?.tipo === "avulso");
  const aguardandoConfirmacao = students.filter((s) => !s.billing?.ativo && s.billing?.pendente);
  const semCobranca = students.filter((s) => !s.billing?.ativo && !s.billing?.pendente);
  const [baixaStudentId, setBaixaStudentId] = useState(null);
  const [detalheCard, setDetalheCard] = useState(null);
  const baixaStudent = baixaStudentId ? students.find((s) => s.id === baixaStudentId) : null;
  const abertosDe = (studentId) => pagamentos.filter((p) => p.studentId === studentId && p.status === "previsto" && p.dataPrevista && p.dataPrevista <= todayStr());
  const confirmarPagamentoInicial = (studentId) => {
    const st = students.find((s) => s.id === studentId);
    const proxIso = proximoVencimentoMensal(st?.billing, hoje);
    setStudents((p) => p.map((s) => s.id === studentId ? { ...s, billing: { ...s.billing || {}, ativo: true, pendente: false, ultimoPagamento: hoje, vencimento: proxIso } } : s));
    if (st) setPagamentos((p) => [
      ...p,
      { ...novoPagamentoMensal(st, hoje), status: "pago", valorPago: Number(st.billing?.valor) || 0, dataPagamento: hoje, origem: "manual" },
      novoPagamentoMensal(st, proxIso, hoje)
    ]);
  };
  const PERIODOS = [{ id: "mes", label: "Mês" }, { id: "15d", label: "15 dias" }, { id: "2m", label: "2 meses" }, { id: "3m", label: "3 meses" }, { id: "6m", label: "6 meses" }];
  const [periodo, setPeriodo] = useState("mes");
  const [mesOffset, setMesOffset] = useState(0);
  const mesSelD = (() => {
    const d = new Date(hoje + "T00:00:00");
    return new Date(d.getFullYear(), d.getMonth() + mesOffset, 1);
  })();
  const mesSelLabel = MESES_NOME[mesSelD.getMonth()] + " " + mesSelD.getFullYear();
  const [periodoInicio, periodoFimSel] = (() => {
    const fimD = new Date(hoje + "T00:00:00");
    if (periodo === "mes") {
      const y = mesSelD.getFullYear(), m = mesSelD.getMonth();
      return [toISODateLocal(new Date(y, m, 1)), toISODateLocal(new Date(y, m + 1, 0))];
    }
    const dias = { "15d": 15, "2m": 60, "3m": 90, "6m": 180 }[periodo] || 30;
    const inicioD = new Date(fimD);
    inicioD.setDate(inicioD.getDate() - dias);
    return [toISODateLocal(inicioD), hoje];
  })();
  const projecoes = (() => {
    const out = [];
    (students || []).filter((s) => s.billing?.ativo && (s.status || "ativo") === "ativo").forEach((s) => {
      const b = s.billing;
      if (b.tipo === "avulso") {
        const valorAula = Number(b.valorAula) || 0;
        (agendaEntries || []).filter((e) => e.studentId === s.id && e.date >= hoje && e.date >= periodoInicio && e.date <= periodoFimSel && (e.status === "agendado" || e.status === "confirmada" || !e.status) && !pagamentos.some((p) => p.agendaEntryId === e.id)).forEach((e) => out.push({ sid: s.id, v: valorAula, data: e.date, tipo: "aula" }));
        return;
      }
      if (b.modoCobranca === "porSessao") return;
      const datas = pagamentos.filter((p) => p.studentId === s.id && p.tipo === "mensal" && p.modoCobranca !== "porSessao" && p.status !== "cancelado" && p.dataPrevista).map((p) => p.dataPrevista).sort();
      let ancora = datas.length ? datas[datas.length - 1] : b.vencimento || null;
      if (!ancora) return;
      if (!datas.length && ancora >= periodoInicio && ancora <= periodoFimSel && ancora >= hoje) out.push({ sid: s.id, v: Number(b.valor) || 0, data: ancora, tipo: "mensal" });
      let prox = proximoVencimentoMensal(b, ancora), guarda = 0;
      while (prox <= periodoFimSel && guarda < 40) {
        if (prox >= periodoInicio && prox > ancora) out.push({ sid: s.id, v: Number(b.valor) || 0, data: prox, tipo: "mensal" });
        prox = proximoVencimentoMensal(b, prox);
        guarda++;
      }
    });
    return out;
  })();
  const projTotal = projecoes.reduce((a, x) => a + x.v, 0);
  const previstoAlunosMes = projTotal + pagamentos.filter((p) => p.dataPrevista && p.dataPrevista >= periodoInicio && p.dataPrevista <= periodoFimSel && p.status !== "cancelado").reduce((a, p) => a + (Number(p.valorPrevisto) || 0), 0);
  const previstoExtrasMes = receitasExtras.filter((r) => r.dataPrevista && r.dataPrevista >= periodoInicio && r.dataPrevista <= periodoFimSel).reduce((a, r) => a + (Number(r.valorPrevisto) || 0), 0);
  const previstoMes = previstoAlunosMes + previstoExtrasMes;
  const recebidoAlunosMes = pagamentos.filter((p) => p.status === "pago" && p.dataPagamento && p.dataPagamento >= periodoInicio && p.dataPagamento <= periodoFimSel).reduce((a, p) => a + (Number(p.valorPago) || 0), 0);
  const recebidoExtrasMes = receitasExtras.filter((r) => r.status === "recebido" && r.dataPagamento && r.dataPagamento >= periodoInicio && r.dataPagamento <= periodoFimSel).reduce((a, r) => a + (Number(r.valorPago) || 0), 0);
  const recebidoMes = recebidoAlunosMes + recebidoExtrasMes;
  const emAberto = pagamentos.filter((p) => p.status === "previsto" && p.dataPrevista && p.dataPrevista >= periodoInicio && p.dataPrevista <= periodoFimSel && p.dataPrevista <= hoje).sort((a, b) => (a.dataPrevista || "").localeCompare(b.dataPrevista || ""));
  const emAbertoVencidos = emAberto.filter((p) => p.dataPrevista && p.dataPrevista < hoje);
  const emAbertoTotal = emAberto.reduce((a, p) => a + (Number(p.valorPrevisto) || 0), 0);
  const pctRealizado = previstoMes > 0 ? Math.round(recebidoMes / previstoMes * 100) : recebidoMes > 0 ? 100 : 0;
  const pagosRecentes = pagamentos.filter((p) => p.status === "pago" && p.origem !== "credito").sort((a, b) => (b.dataPagamento || "").localeCompare(a.dataPagamento || "") || (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 8);
  const cobrPer = pagamentos.filter((p) => p.dataPrevista && p.dataPrevista >= periodoInicio && p.dataPrevista <= periodoFimSel && p.status !== "cancelado");
  const extPer = receitasExtras.filter((r) => r.dataPrevista && r.dataPrevista >= periodoInicio && r.dataPrevista <= periodoFimSel);
  const partes = { pago: [], desconto: [], avencer: projecoes.map((x) => ({ sid: x.sid, v: x.v, proj: true })), atraso: [] };
  cobrPer.forEach((p) => {
    const prev = Number(p.valorPrevisto) || 0;
    if (p.status === "pago") {
      const pg = Number(p.valorPago) || 0;
      partes.pago.push({ sid: p.studentId, v: pg });
      if (prev > pg) partes.desconto.push({ sid: p.studentId, v: prev - pg });
    } else if (p.dataPrevista >= hoje) partes.avencer.push({ sid: p.studentId, v: prev });
    else partes.atraso.push({ sid: p.studentId, v: prev });
  });
  extPer.forEach((r) => {
    const prev = Number(r.valorPrevisto) || 0;
    if (r.status === "recebido") {
      const pg = Number(r.valorPago) || 0;
      partes.pago.push({ sid: null, v: pg });
      if (prev > pg) partes.desconto.push({ sid: null, v: prev - pg });
    } else if (r.dataPrevista >= hoje) partes.avencer.push({ sid: null, v: prev });
    else partes.atraso.push({ sid: null, v: prev });
  });
  const somaParte = (k) => partes[k].reduce((a, x) => a + x.v, 0);
  const qtdAlunosParte = (k) => new Set(partes[k].filter((x) => x.sid).map((x) => x.sid)).size;
  const totPartes = somaParte("pago") + somaParte("desconto") + somaParte("avencer") + somaParte("atraso");
  const pctParte = (k) => totPartes > 0 ? somaParte(k) / totPartes * 100 : 0;
  const ativosCob = students.filter((s) => s.billing?.ativo && (s.status || "ativo") === "ativo");
  const fixos = ativosCob.filter((s) => s.billing?.tipo !== "avulso" && s.billing?.modoCobranca !== "porSessao");
  const semCobrancaAberta = fixos.filter((s) => s.billing?.vencimento && !pagamentos.some((p) => p.studentId === s.id && p.status === "previsto"));
  const lancarCobranca = (s) => {
    setPagamentos((p) => [...p, novoPagamentoMensal(s, s.billing.vencimento, todayStr())]);
  };
  const receitaContratada = fixos.reduce((a, s) => a + (Number(s.billing?.valor) || 0), 0);
  const ticketMedio = fixos.length ? receitaContratada / fixos.length : 0;
  const situacaoAluno = (s) => {
    const abertos = pagamentos.filter((p) => p.studentId === s.id && p.status === "previsto" && p.dataPrevista).sort((a, b) => a.dataPrevista.localeCompare(b.dataPrevista));
    if (abertos.length && abertos[0].dataPrevista < hoje) return { txt: "em atraso", bg: "#fee2e2", cor: "#991b1b" };
    const pagoPer = pagamentos.some((p) => p.studentId === s.id && p.status === "pago" && p.dataPrevista >= periodoInicio && p.dataPrevista <= periodoFimSel);
    if (pagoPer) return { txt: "pago", bg: "#dcfce7", cor: "#166534" };
    if (abertos.length) return { txt: "vence " + abertos[0].dataPrevista.slice(8, 10) + "/" + abertos[0].dataPrevista.slice(5, 7), bg: "#dbeafe", cor: "#1e40af" };
    return { txt: "sem cobrança", bg: "#fef3c7", cor: "#92400e" };
  };
  const gruposPlano = (() => {
    const mapa = {};
    ativosCob.forEach((s) => {
      const av = s.billing?.tipo === "avulso", ps = !av && s.billing?.modoCobranca === "porSessao";
      const nome = av ? "Avulso / por aula" : (s.billing?.plano || "").trim() || "Sem nome de plano";
      const k = (av ? "av|" : ps ? "ps|" : "fx|") + nome;
      if (!mapa[k]) mapa[k] = { k, nome, tipo: av ? "avulso" : ps ? "porSessao" : "fixo", alunos: [], total: 0 };
      mapa[k].alunos.push(s);
      if (!av && !ps) mapa[k].total += Number(s.billing?.valor) || 0;
    });
    return Object.values(mapa).sort((a, b) => b.total - a.total || b.alunos.length - a.alunos.length);
  })();
  const [planoAbertoDash, setPlanoAbertoDash] = useState(null);
  const TITULOS_DETALHE = { previsto: "Previsto no período", recebido: "Recebido no período", aberto: "Em aberto no período", pago: "Recebido das cobranças do período", desconto: "Descontos e ajustes na baixa", avencer: "A vencer no período", atraso: "Em atraso" };
  const agruparPorAluno = (tipo) => {
    const mapa = {};
    if (tipo === "previsto") {
      projecoes.forEach((x) => {
        mapa[x.sid] = (mapa[x.sid] || 0) + x.v;
      });
      pagamentos.filter((p) => p.dataPrevista && p.dataPrevista >= periodoInicio && p.dataPrevista <= periodoFimSel && p.status !== "cancelado").forEach((p) => {
        mapa[p.studentId] = (mapa[p.studentId] || 0) + (Number(p.valorPrevisto) || 0);
      });
    } else if (tipo === "recebido") {
      pagamentos.filter((p) => p.status === "pago" && p.dataPagamento && p.dataPagamento >= periodoInicio && p.dataPagamento <= periodoFimSel).forEach((p) => {
        mapa[p.studentId] = (mapa[p.studentId] || 0) + (Number(p.valorPago) || 0);
      });
    } else if (partes[tipo]) {
      partes[tipo].filter((x) => x.sid).forEach((x) => {
        mapa[x.sid] = (mapa[x.sid] || 0) + x.v;
      });
    } else if (tipo === "aberto") {
      pagamentos.filter((p) => p.status === "previsto" && p.dataPrevista && p.dataPrevista >= periodoInicio && p.dataPrevista <= periodoFimSel && p.dataPrevista <= hoje).forEach((p) => {
        mapa[p.studentId] = (mapa[p.studentId] || 0) + (Number(p.valorPrevisto) || 0);
      });
    }
    const linhas = Object.entries(mapa).map(([sid, total]) => ({ studentId: sid, nome: students.find((s) => s.id === sid)?.name || "Aluno", total })).sort((a, b) => b.total - a.total);
    let extrasTotal = 0;
    if (tipo === "previsto") extrasTotal = receitasExtras.filter((r) => r.dataPrevista >= periodoInicio && r.dataPrevista <= periodoFimSel).reduce((a, r) => a + (Number(r.valorPrevisto) || 0), 0);
    if (tipo === "recebido") extrasTotal = receitasExtras.filter((r) => r.status === "recebido" && r.dataPagamento >= periodoInicio && r.dataPagamento <= periodoFimSel).reduce((a, r) => a + (Number(r.valorPago) || 0), 0);
    if (partes[tipo]) extrasTotal = partes[tipo].filter((x) => !x.sid).reduce((a, x) => a + x.v, 0);
    if (tipo === "aberto") extrasTotal = receitasExtras.filter((r) => r.status === "previsto" && r.dataPrevista >= periodoInicio && r.dataPrevista <= periodoFimSel).reduce((a, r) => a + (Number(r.valorPrevisto) || 0), 0);
    if (extrasTotal > 0) linhas.push({ studentId: null, nome: "Outras receitas (extras)", total: extrasTotal });
    return linhas;
  };
  const desfazerBaixa = (pg) => {
    const st = students.find((s) => s.id === pg.studentId);
    if (!window.confirm("Desfazer o pagamento de " + (st?.name || "aluno") + " (" + fmtR(pg.valorPago) + ")? O lançamento volta pra em aberto.")) return;
    if (pg.origem === "adiantamento") {
      setStudents((p) => p.map((s) => s.id === pg.studentId ? { ...s, billing: { ...s.billing || {}, creditosAvulso: Math.max(0, (s.billing?.creditosAvulso || 0) - (pg.qtdCreditos || 0)) } } : s));
      setPagamentos((p) => p.filter((x) => x.id !== pg.id));
    } else {
      setPagamentos((p) => p.map((x) => x.id === pg.id ? { ...x, status: "previsto", valorPago: null, dataPagamento: null } : x));
    }
  };
  const ultimosMeses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return mesChave(d.toISOString().slice(0, 10));
  });
  const previstoPorMes = ultimosMeses.map(
    (m) => pagamentos.filter((p) => mesChave(p.dataPrevista) === m && p.status !== "cancelado").reduce((a, p) => a + (Number(p.valorPrevisto) || 0), 0) + receitasExtras.filter((r) => mesChave(r.dataPrevista) === m).reduce((a, r) => a + (Number(r.valorPrevisto) || 0), 0)
  );
  const pagoPorMes = ultimosMeses.map(
    (m) => pagamentos.filter((p) => p.status === "pago" && mesChave(p.dataPagamento) === m).reduce((a, p) => a + (Number(p.valorPago) || 0), 0) + receitasExtras.filter((r) => r.status === "recebido" && mesChave(r.dataPagamento) === m).reduce((a, r) => a + (Number(r.valorPago) || 0), 0)
  );
  const labelsMeses = ultimosMeses.map((m) => {
    const [y, mo] = m.split("-");
    return MESES_NOME[parseInt(mo, 10) - 1].slice(0, 3);
  });
  return React.createElement("div", null, React.createElement("div", { style: { fontWeight: 800, fontSize: 20, marginBottom: 4 } }, "💰 Financeiro"), React.createElement("div", { style: { fontSize: 13, color: "#94a3b8", marginBottom: 14 } }, "Previsibilidade e cobranças via Pix dos seus alunos"), React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 18 } }, React.createElement("button", { onClick: () => setFinView("dashboard"), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: finView === "dashboard" ? O : "#f1f5f9", color: finView === "dashboard" ? "#fff" : "#64748b" } }, "Dashboard"), React.createElement("button", { onClick: () => setFinView("alunos"), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: finView === "alunos" ? O : "#f1f5f9", color: finView === "alunos" ? "#fff" : "#64748b" } }, "Alunos"), React.createElement("button", { onClick: () => setFinView("planos"), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: finView === "planos" ? O : "#f1f5f9", color: finView === "planos" ? "#fff" : "#64748b" } }, "Planos"), React.createElement("button", { onClick: () => setFinView("extras"), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: finView === "extras" ? O : "#f1f5f9", color: finView === "extras" ? "#fff" : "#64748b" } }, "Extras")), finView === "dashboard" && React.createElement(React.Fragment, null, detalheCard ? React.createElement("div", null, React.createElement("button", { onClick: () => setDetalheCard(null), style: { border: "none", background: "none", color: "#64748b", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, marginBottom: 14, display: "flex", alignItems: "center", gap: 4 } }, "← Voltar"), React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 4 } }, TITULOS_DETALHE[detalheCard]), React.createElement("div", { style: { fontWeight: 900, fontSize: 22, color: "#0f172a", marginBottom: 16 } }, fmtR(agruparPorAluno(detalheCard).reduce((a, l) => a + l.total, 0))), agruparPorAluno(detalheCard).length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 28 } }, React.createElement("div", { style: { color: "#94a3b8", fontSize: 13 } }, "Nada aqui nesse período.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, agruparPorAluno(detalheCard).map((l) => React.createElement(Card, { key: l.studentId || "extras", onClick: () => l.studentId ? nav("studentDetail", { studentId: l.studentId }) : setFinView("extras"), style: { padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 } }, React.createElement("span", { style: { fontSize: 13, fontWeight: 700 } }, l.nome), React.createElement("span", { style: { fontSize: 14, fontWeight: 800, color: "#0f172a" } }, fmtR(l.total)))))) : React.createElement(React.Fragment, null, React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 2 } }, PERIODOS.map((pr) => React.createElement("button", { key: pr.id, onClick: () => {
    setPeriodo(pr.id);
    if (pr.id !== "mes") setMesOffset(0);
  }, style: { flexShrink: 0, border: "none", borderRadius: 99, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", background: periodo === pr.id ? "#0f172a" : "#f1f5f9", color: periodo === pr.id ? "#fff" : "#64748b" } }, pr.label))), periodo === "mes" && React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "6px 8px", marginBottom: 14 } }, React.createElement("button", { onClick: () => setMesOffset((o) => o - 1), "aria-label": "Mês anterior", style: { border: "none", background: "#f1f5f9", borderRadius: 9, width: 36, height: 36, fontSize: 18, fontWeight: 800, color: "#334155", cursor: "pointer" } }, "‹"), React.createElement("div", { style: { textAlign: "center", flex: 1 } }, React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: "#0f172a" } }, mesSelLabel), mesOffset !== 0 && React.createElement("button", { onClick: () => setMesOffset(0), style: { border: "none", background: "none", padding: 0, marginTop: 2, fontSize: 11, fontWeight: 700, color: O, cursor: "pointer" } }, "Voltar ao mês atual")), React.createElement("button", { onClick: () => setMesOffset((o) => o + 1), "aria-label": "Mês seguinte", style: { border: "none", background: "#f1f5f9", borderRadius: 9, width: 36, height: 36, fontSize: 18, fontWeight: 800, color: "#334155", cursor: "pointer" } }, "›")), React.createElement(Card, { style: { padding: "14px 16px", marginBottom: 10 } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 } }, React.createElement("div", { onClick: () => setDetalheCard("previsto"), style: { cursor: "pointer" } }, React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 } }, periodo === "mes" ? "Previsto no mês" : "Previsto no período"), React.createElement("div", { style: { fontWeight: 900, fontSize: 22, color: "#0f172a" } }, fmtR(previstoMes)), previstoExtrasMes > 0 && React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", marginTop: 3 } }, "Alunos ", fmtR(previstoAlunosMes), " · Extras ", fmtR(previstoExtrasMes))), React.createElement("div", { style: { textAlign: "right" } }, React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 } }, "Realizado"), React.createElement("div", { style: { fontWeight: 900, fontSize: 22, color: "#16a34a" } }, (totPartes > 0 ? Math.round(somaParte("pago") / totPartes * 100) : 0) + "%"))), React.createElement("div", { style: { display: "flex", height: 14, borderRadius: 7, overflow: "hidden", margin: "12px 0 6px", background: "#f1f5f9" } }, React.createElement("div", { style: { width: pctParte("pago") + "%", background: "#16a34a" } }), React.createElement("div", { style: { width: pctParte("desconto") + "%", background: "#cbd5e1" } }), React.createElement("div", { style: { width: pctParte("avencer") + "%", background: "#3b82f6" } }), React.createElement("div", { style: { width: pctParte("atraso") + "%", background: "#dc2626" } })), [["pago", "Recebido", "#16a34a"], ["desconto", "Descontos e ajustes na baixa", "#cbd5e1"], ["avencer", "A vencer" + (periodo === "mes" ? " até " + fmt(periodoFimSel).slice(0, 5) : ""), "#3b82f6"], ["atraso", "Em atraso", "#dc2626"]].map((x) => {
    const n = qtdAlunosParte(x[0]);
    return React.createElement("div", { key: x[0], onClick: () => somaParte(x[0]) > 0 && setDetalheCard(x[0]), style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "6px 0", cursor: somaParte(x[0]) > 0 ? "pointer" : "default" } }, React.createElement("span", { style: { width: 10, height: 10, borderRadius: 3, background: x[2], flexShrink: 0 } }), React.createElement("span", { style: { color: x[0] === "atraso" && somaParte("atraso") > 0 ? "#dc2626" : "#334155" } }, x[1] + (n > 0 && x[0] !== "pago" ? " (" + n + ")" : "")), React.createElement("b", { style: { marginLeft: "auto", color: x[0] === "atraso" && somaParte("atraso") > 0 ? "#dc2626" : "#0f172a" } }, fmtR(somaParte(x[0]))), somaParte(x[0]) > 0 && React.createElement("span", { style: { color: "#cbd5e1", fontSize: 14 } }, "›"));
  }), projecoes.length > 0 && React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 4, lineHeight: 1.45 } }, "A vencer inclui " + projecoes.length + (projecoes.length > 1 ? " cobranças projetadas" : " cobrança projetada") + " (" + fmtR(projTotal) + "): próximas mensalidades e aulas avulsas já agendadas. Elas viram cobrança de verdade na hora certa."), React.createElement("div", { onClick: () => setDetalheCard("recebido"), style: { fontSize: 11, color: "#94a3b8", marginTop: 6, borderTop: "1px solid #f1f5f9", paddingTop: 8, cursor: "pointer" } }, "Entrou no caixa no período (pela data do pagamento): ", React.createElement("b", { style: { color: "#16a34a" } }, fmtR(recebidoMes)), " ›")), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 } }, React.createElement(Card, { style: { padding: "10px 10px" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 } }, "Receita mensal"), React.createElement("div", { style: { fontWeight: 900, fontSize: 15 } }, fmtR(receitaContratada).replace(",00", "")), React.createElement("div", { style: { fontSize: 10, color: "#94a3b8" } }, "mensalidades fixas")), React.createElement(Card, { style: { padding: "10px 10px" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 } }, "Pagantes"), React.createElement("div", { style: { fontWeight: 900, fontSize: 15 } }, ativosCob.length), React.createElement("div", { style: { fontSize: 10, color: "#94a3b8" } }, "com cobrança ativa")), React.createElement(Card, { style: { padding: "10px 10px" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 } }, "Ticket médio"), React.createElement("div", { style: { fontWeight: 900, fontSize: 15 } }, fmtR(Math.round(ticketMedio)).replace(",00", "")), React.createElement("div", { style: { fontSize: 10, color: "#94a3b8" } }, "mensalidade fixa"))), semCobrancaAberta.length > 0 && React.createElement(Card, { style: { padding: "12px 14px", marginBottom: 10, background: "#fffbeb", borderColor: "#fde68a" } }, React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#92400e", marginBottom: 6 } }, "⚠ " + semCobrancaAberta.length + (semCobrancaAberta.length > 1 ? " alunos com mensalidade ativa e nenhuma cobrança em aberto" : " aluno com mensalidade ativa e nenhuma cobrança em aberto")), semCobrancaAberta.map((s) => React.createElement("div", { key: s.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "5px 0", borderTop: "1px solid #fde68a" } }, React.createElement("span", { onClick: () => nav("studentDetail", { studentId: s.id }), style: { fontSize: 12, color: "#92400e", cursor: "pointer" } }, s.name + " · " + (s.billing.vencimento < hoje ? "venceu " : "vence ") + fmt(s.billing.vencimento) + " · " + fmtR(s.billing.valor)), React.createElement("button", { onClick: () => lancarCobranca(s), style: { border: "none", background: "none", color: "#C2410C", fontSize: 12, fontWeight: 800, textDecoration: "underline", cursor: "pointer", flexShrink: 0, padding: 0 } }, "Lançar cobrança")))), gruposPlano.length > 0 && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", margin: "16px 0 8px", textTransform: "uppercase" } }, "Alunos por plano"), gruposPlano.map((g) => {
    const aberto = planoAbertoDash === g.k;
    const pct = g.tipo === "fixo" && receitaContratada > 0 ? Math.round(g.total / receitaContratada * 100) : null;
    const larg = pct !== null ? pct : Math.round(g.alunos.length / Math.max(1, ativosCob.length) * 100);
    const valores = Array.from(new Set(g.alunos.map((s) => g.tipo === "fixo" ? Number(s.billing?.valor) || 0 : g.tipo === "porSessao" ? Number(s.billing?.valorSessao) || 0 : Number(s.billing?.valorAula) || 0)));
    const sub = g.alunos.length + (g.alunos.length > 1 ? " alunos" : " aluno") + (valores.length === 1 && valores[0] > 0 ? " · " + fmtR(valores[0]).replace(",00", "") + (g.tipo === "fixo" ? " cada" : g.tipo === "porSessao" ? " por sessão" : " por aula") : "");
    return React.createElement(Card, { key: g.k, style: { padding: "12px 14px", marginBottom: 8 } }, React.createElement("div", { onClick: () => setPlanoAbertoDash(aberto ? null : g.k), style: { cursor: "pointer" } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 8 } }, React.createElement("span", { style: { fontSize: 14, fontWeight: 800, minWidth: 0 } }, g.nome), React.createElement("span", { style: { fontSize: 14, fontWeight: 800, whiteSpace: "nowrap" } }, g.tipo === "fixo" ? fmtR(g.total).replace(",00", "") + "/mês" : g.tipo === "porSessao" ? "por sessão" : "por aula")), React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12, color: "#64748b", marginTop: 2 } }, React.createElement("span", null, sub), React.createElement("span", null, (pct !== null ? pct + "% da receita " : "") + (aberto ? "▴" : "▾"))), React.createElement("div", { style: { height: 8, borderRadius: 4, background: "#f1f5f9", marginTop: 8 } }, React.createElement("div", { style: { width: larg + "%", height: 8, borderRadius: 4, background: O } }))), aberto && React.createElement("div", { style: { marginTop: 8 } }, g.alunos.slice().sort((a, b) => a.name.localeCompare(b.name)).map((s) => {
      const sit = situacaoAluno(s);
      const val = g.tipo === "fixo" ? Number(s.billing?.valor) || 0 : g.tipo === "porSessao" ? Number(s.billing?.valorSessao) || 0 : Number(s.billing?.valorAula) || 0;
      return React.createElement("div", { key: s.id, onClick: () => nav("studentDetail", { studentId: s.id }), style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 13, padding: "8px 0", borderTop: "1px solid #f1f5f9", cursor: "pointer" } }, React.createElement("span", { style: { minWidth: 0 } }, s.name), React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 } }, React.createElement("span", { style: { fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: sit.bg, color: sit.cor } }, sit.txt), React.createElement("span", { style: { fontWeight: 700 } }, fmtR(val).replace(",00", ""))));
    })));
  })), React.createElement(VitrineResumo, { receitasExtras, students, inicio: periodoInicio, fim: periodoFimSel, nav }), (previstoPorMes.some((v) => v > 0) || pagoPorMes.some((v) => v > 0)) && React.createElement("div", { style: { marginBottom: 18 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 } }, "Previsto x Recebido — últimos 6 meses"), React.createElement(ChartWrap, { series: [{ name: "Previsto", values: previstoPorMes, color: "#cbd5e1" }, { name: "Recebido", values: pagoPorMes, color: O }], labels: labelsMeses })), React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 10, textTransform: "uppercase" } }, "Em aberto no período ", emAberto.length > 0 ? `(${emAberto.length})` : ""), emAberto.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 28 } }, React.createElement(I, { n: "money", c: "#cbd5e1", s: 28 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 8, fontSize: 13 } }, "Nada em aberto nesse período.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, emAberto.map((pg) => {
    const st = students.find((s) => s.id === pg.studentId);
    const vencido = pg.dataPrevista && pg.dataPrevista < hoje;
    return React.createElement(Card, { key: pg.id, onClick: () => setBaixaStudentId(pg.studentId), style: { padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 } }, React.createElement("div", { style: { minWidth: 0 } }, React.createElement("div", { style: { fontSize: 13, fontWeight: 700 } }, st?.name || "Aluno"), React.createElement("div", { style: { fontSize: 11, color: vencido ? "#dc2626" : "#94a3b8" } }, pg.tipo === "mensal" ? "Mensalidade" : "Aula avulsa", " · ", fmt(pg.dataPrevista), " · ", pg.modoCobranca === "porSessao" && !pg.valorPrevisto ? "a calcular" : fmtR(pg.valorPrevisto), vencido ? " · vencido" : "")), React.createElement("div", { style: { fontSize: 11, color: "#cbd5e1", flexShrink: 0 } }, "Dar baixa →"));
  })), pagosRecentes.length > 0 && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", marginTop: 20, marginBottom: 10, textTransform: "uppercase" } }, "Pagamentos recentes"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, pagosRecentes.map((pg) => {
    const st = students.find((s) => s.id === pg.studentId);
    return React.createElement(Card, { key: pg.id, style: { padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 } }, React.createElement("div", { style: { minWidth: 0 } }, React.createElement("div", { style: { fontSize: 13, fontWeight: 700 } }, st?.name || "Aluno"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, pg.plano || (pg.tipo === "mensal" ? "Mensalidade" : "Aula avulsa"), " · pago em ", fmt(pg.dataPagamento), " · ", fmtR(pg.valorPago))), React.createElement("button", { onClick: () => desfazerBaixa(pg), style: { border: "none", background: "none", color: "#dc2626", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0 } }, "↩ Desfazer"));
  }))))), finView === "alunos" && React.createElement(React.Fragment, null, mensalistas.length === 0 && avulsos.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 32 } }, React.createElement(I, { n: "money", c: "#cbd5e1", s: 32 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhum aluno com cobrança ativa ainda."), React.createElement("div", { style: { fontSize: 12, color: "#cbd5e1", marginTop: 4 } }, 'Ative em "Editar Aluno" → Cobrança.')) : React.createElement(React.Fragment, null, mensalistas.length > 0 && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 10 } }, "Mensalistas"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 } }, mensalistas.map((s) => React.createElement(Card, { key: s.id, style: { padding: "14px 16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 } }, React.createElement("div", { onClick: () => nav("studentDetail", { studentId: s.id }), style: { flex: 1, minWidth: 0, cursor: "pointer" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, s.name), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 2 } }, s.billing.plano || "Plano", s.billing.modoCobranca === "porSessao" ? s.billing.valorSessao ? " · R$ " + Number(s.billing.valorSessao).toFixed(2).replace(".", ",") + "/sessão" : "" : s.billing.valor ? " · " + fmtR(s.billing.valor) : ""), React.createElement("div", { style: { marginTop: 5 } }, React.createElement(Badge, { color: s._vencido ? "#dc2626" : "#16a34a", bg: s._vencido ? "#fee2e2" : "#dcfce7" }, s._diasDiff === null ? "Sem vencimento" : s._vencido ? "Vencido há " + Math.abs(s._diasDiff) + " dia(s)" : s._diasDiff === 0 ? "Vence hoje" : "Vence em " + s._diasDiff + " dia(s)"))), React.createElement(Btn, { sm: true, onClick: () => setBaixaStudentId(s.id) }, "Dar baixa")))))), avulsos.length > 0 && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 10 } }, "Avulsos / por aula"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 } }, avulsos.map((s) => {
    const abertosSt = abertosDe(s.id);
    const totalAberto = abertosSt.reduce((a, p) => a + (Number(p.valorPrevisto) || 0), 0);
    return React.createElement(Card, { key: s.id, style: { padding: "14px 16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 } }, React.createElement("div", { onClick: () => nav("studentDetail", { studentId: s.id }), style: { flex: 1, minWidth: 0, cursor: "pointer" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, s.name), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 2 } }, s.billing.valorAula ? fmtR(s.billing.valorAula) + " / aula" : "Avulso"), React.createElement("div", { style: { marginTop: 5, display: "flex", gap: 6, flexWrap: "wrap" } }, abertosSt.length > 0 ? React.createElement(Badge, { color: "#c2410c", bg: "#fff7ed" }, abertosSt.length, " em aberto · ", fmtR(totalAberto)) : React.createElement(Badge, { color: "#16a34a", bg: "#dcfce7" }, "Em dia"), (s.billing?.creditosAvulso || 0) > 0 && React.createElement(Badge, { color: "#166534", bg: "#f0fdf4" }, "💳 ", s.billing.creditosAvulso, " paga(s) adiantado"))), React.createElement(Btn, { sm: true, onClick: () => setBaixaStudentId(s.id) }, "Dar baixa")));
  })))), aguardandoConfirmacao.length > 0 && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#c2410c", textTransform: "uppercase", marginBottom: 10 } }, "⏳ Aguardando confirmação de pagamento"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 } }, aguardandoConfirmacao.map((s) => React.createElement(Card, { key: s.id, style: { padding: "14px 16px", background: "#fff7ed", borderColor: "#fed7aa" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 } }, React.createElement("div", { onClick: () => nav("studentDetail", { studentId: s.id }), style: { flex: 1, minWidth: 0, cursor: "pointer" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, s.name), React.createElement("div", { style: { fontSize: 11, color: "#9a3412", marginTop: 2 } }, s.billing.plano || "Plano", s.billing.valor ? " · " + fmtR(s.billing.valor) : "", " · cadastro público")), React.createElement(Btn, { sm: true, onClick: () => confirmarPagamentoInicial(s.id) }, "Confirmar pagamento")))))), semCobranca.length > 0 && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 } }, "Sem cobrança ativa"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, semCobranca.map((s) => React.createElement(Card, { key: s.id, onClick: () => nav("studentDetail", { studentId: s.id }), style: { padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" } }, React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "#64748b" } }, s.name), React.createElement("div", { style: { fontSize: 11, color: "#cbd5e1" } }, "Ativar →"))))), baixaStudent && React.createElement(PagamentoModal, { student: baixaStudent, pagamentos, setPagamentos, setStudents, onClose: () => setBaixaStudentId(null) })), finView === "planos" && React.createElement(React.Fragment, null, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 } }, React.createElement("div", { style: { fontSize: 13, color: "#94a3b8" } }, "Seus planos e valores pré-definidos, pra usar na hora de vincular um aluno.")), React.createElement(Btn, { full: true, icon: "plus", onClick: openNovoPlano, style: { marginBottom: 16 } }, "Novo Plano"), planos.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 32 } }, React.createElement(I, { n: "money", c: "#cbd5e1", s: 32 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhum plano cadastrado ainda.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, planos.map((pl) => React.createElement(Card, { key: pl.id, onClick: () => openEditPlano(pl), style: { padding: "14px 16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 } }, React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 } }, React.createElement("span", { style: { fontWeight: 700, fontSize: 14 } }, pl.nome), pl.ativo === false && React.createElement(Badge, { color: "#64748b", bg: "#f1f5f9" }, "Inativo"), pl.slugVenda && React.createElement(Badge, { color: "#0891b2", bg: "#ecfeff" }, "🔗 ", pl.slugVenda)), React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: O, marginBottom: 2 } }, pl.modoCobranca === "porSessao" ? "R$ " + Number(pl.valorSessao || 0).toFixed(2).replace(".", ",") + " / sessão" : "R$ " + Number(pl.valor || 0).toFixed(2).replace(".", ","), pl.frequencia ? " · " + pl.frequencia : ""), pl.descricao && React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2 } }, pl.descricao), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 6 } }, alunosPorPlano(pl.nome), " aluno(s) neste plano"), linkCopiado === pl.id && React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#15803d", marginTop: 6 } }, "✓ Link copiado. Cole no WhatsApp do aluno.")), React.createElement("button", { onClick: (ev) => {
    ev.stopPropagation();
    abrirPlano(pl);
  }, "aria-label": "Abrir a página no navegador", title: "Abrir a página no navegador", style: { background: "#eef2ff", border: "none", borderRadius: 10, cursor: "pointer", color: "#4f46e5", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("circle", { cx: "12", cy: "12", r: "10" }), React.createElement("path", { d: "M2 12h20" }), React.createElement("path", { d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" }))), React.createElement("button", { onClick: (ev) => {
    ev.stopPropagation();
    gerarLinkPlano(pl);
  }, "aria-label": "Gerar link de contratação", title: "Gerar link de contratação", style: { background: "#fff4ee", border: "none", borderRadius: 10, cursor: "pointer", color: O, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } }, React.createElement("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" }, React.createElement("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }), React.createElement("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" }))), React.createElement("button", { onClick: (ev) => {
    ev.stopPropagation();
    excluirPlano(pl.id);
  }, style: { background: "none", border: "none", cursor: "pointer", color: "#e2e8f0", padding: 4, flexShrink: 0 } }, React.createElement(I, { n: "trash", s: 15 })))))), React.createElement(ServicosVitrinePlanos, { nav }), planoModal && React.createElement(Modal, { title: planoEditId ? "Editar Plano" : "Novo Plano", onClose: () => setPlanoModal(false) }, React.createElement(Inp, { label: "Nome do plano *", value: planoForm.nome, onChange: (v) => setPlanoForm((f) => ({ ...f, nome: v })), placeholder: "Ex: 3x por semana" }), React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 13 } }, React.createElement("button", { onClick: () => setPlanoForm((f) => ({ ...f, modoCobranca: "fixo" })), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: planoForm.modoCobranca !== "porSessao" ? O : "#f1f5f9", color: planoForm.modoCobranca !== "porSessao" ? "#fff" : "#64748b" } }, "Valor fixo mensal"), React.createElement("button", { onClick: () => setPlanoForm((f) => ({ ...f, modoCobranca: "porSessao" })), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: planoForm.modoCobranca === "porSessao" ? O : "#f1f5f9", color: planoForm.modoCobranca === "porSessao" ? "#fff" : "#64748b" } }, "Por sessão")), planoForm.modoCobranca === "porSessao" ? React.createElement(Inp, { label: "Valor por sessão (R$)", type: "number", value: planoForm.valorSessao, onChange: (v) => setPlanoForm((f) => ({ ...f, valorSessao: v })), placeholder: "60.00" }) : React.createElement(Inp, { label: "Valor mensal (R$)", type: "number", value: planoForm.valor, onChange: (v) => setPlanoForm((f) => ({ ...f, valor: v })), placeholder: "250.00" }), planoForm.modoCobranca !== "porSessao" && React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: "Vencimento recorrente", value: planoForm.regraVencimento, onChange: (v) => setPlanoForm((f) => ({ ...f, regraVencimento: v })), opts: REGRA_VENC_OPTS }), React.createElement(Inp, { label: "Dias de tolerância", type: "number", value: planoForm.toleranciaDias, onChange: (v) => setPlanoForm((f) => ({ ...f, toleranciaDias: v })), placeholder: "Padrão do Perfil" })), React.createElement(Inp, { label: "Frequência", value: planoForm.frequencia, onChange: (v) => setPlanoForm((f) => ({ ...f, frequencia: v })), placeholder: "Ex: 3x/semana, 2x/mês, Consultoria" }), React.createElement(Inp, { label: "Identificador de venda (opcional)", value: planoForm.slugVenda, onChange: (v) => setPlanoForm((f) => ({ ...f, slugVenda: v.toLowerCase().replace(/[^a-z0-9]/g, "") })), placeholder: "Ex: presencial, hibrido, consultoria" }), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: -8, marginBottom: 13, lineHeight: 1.4 } }, "Use o mesmo valor do link da página de vendas (?plano=...). Assim o nome e o preço mostrados lá vêm direto deste plano."), React.createElement("div", { style: { marginBottom: 13 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 } }, "Descrição (opcional)"), React.createElement("textarea", { value: planoForm.descricao, onChange: (e) => setPlanoForm((f) => ({ ...f, descricao: e.target.value })), placeholder: "O que está incluso nesse plano...", rows: 3, style: { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, color: "#0f172a", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" } })), React.createElement("div", { onClick: () => setPlanoForm((f) => ({ ...f, ativo: !f.ativo })), style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16, cursor: "pointer", background: "#f8fafc", borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { width: 38, height: 22, borderRadius: 99, background: planoForm.ativo ? "#FF5603" : "#cbd5e1", position: "relative", transition: "background 0.15s", flexShrink: 0 } }, React.createElement("div", { style: { width: 18, height: 18, borderRadius: 99, background: "#fff", position: "absolute", top: 2, left: planoForm.ativo ? 18 : 2, transition: "left 0.15s" } })), React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "#334155" } }, "Plano ativo (aparece na hora de vincular aluno)")), React.createElement("div", { style: { display: "flex", gap: 8 } }, planoEditId && React.createElement(Btn, { variant: "danger", onClick: () => {
    excluirPlano(planoEditId);
    setPlanoModal(false);
  } }, "Excluir"), React.createElement(Btn, { full: true, onClick: salvarPlano, disabled: !planoForm.nome.trim() }, "Salvar")))), finView === "extras" && React.createElement(React.Fragment, null, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 } }, React.createElement("div", { style: { fontSize: 13, color: "#94a3b8" } }, "Vendas de produtos, serviços avulsos, ou receitas recorrentes (aluguel, assinaturas etc.) — separado da mensalidade dos alunos.")), React.createElement(Btn, { full: true, icon: "plus", onClick: openNovaExtra, style: { marginBottom: 16 } }, "Nova Receita Extra"), receitasExtras.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 32 } }, React.createElement(I, { n: "money", c: "#cbd5e1", s: 32 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhuma receita extra registrada ainda.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, [...receitasExtras].sort((a, b) => ((b.status === "previsto" ? b.dataPrevista : b.dataPagamento) || "").localeCompare((a.status === "previsto" ? a.dataPrevista : a.dataPagamento) || "")).map((r) => {
    const previsto = r.status === "previsto";
    const vencido = previsto && r.dataPrevista && r.dataPrevista < hoje;
    return React.createElement(Card, { key: r.id, style: { padding: "14px 16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 } }, React.createElement("div", { onClick: () => openEditExtra(r), style: { flex: 1, minWidth: 0, cursor: "pointer" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 } }, React.createElement("span", { style: { fontWeight: 700, fontSize: 14 } }, r.descricao), React.createElement(Badge, { color: "#6366f1", bg: "#eef2ff" }, CATEGORIAS_EXTRA.find((c) => c.v === r.categoria)?.l || "Outro"), r.recorrente && React.createElement(Badge, { color: "#7c3aed", bg: "#f3e8ff" }, "↻ ", FREQ_EXTRA.find((f) => f.v === r.frequencia)?.l || "Recorrente"), previsto && React.createElement(Badge, { color: vencido ? "#dc2626" : "#c2410c", bg: vencido ? "#fee2e2" : "#fff7ed" }, vencido ? "Vencido" : "Previsto")), React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: previsto ? "#0f172a" : "#16a34a" } }, fmtR(previsto ? r.valorPrevisto : r.valorPago)), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 4 } }, previsto ? "Previsto: " + fmt(r.dataPrevista) : "Recebido: " + fmt(r.dataPagamento), r.obs ? " · " + r.obs : "")), React.createElement("button", { onClick: (ev) => {
      ev.stopPropagation();
      excluirExtra(r.id);
    }, style: { background: "none", border: "none", cursor: "pointer", color: "#e2e8f0", padding: 4, flexShrink: 0 } }, React.createElement(I, { n: "trash", s: 15 }))), previsto && React.createElement(Btn, { sm: true, full: true, onClick: () => confirmarRecebimentoExtra(r), style: { marginTop: 10 } }, "Confirmar recebimento"));
  })), extraModal && React.createElement(Modal, { title: extraEditId ? "Editar Receita Extra" : "Nova Receita Extra", onClose: () => setExtraModal(false) }, React.createElement(Inp, { label: "Descrição *", value: extraForm.descricao, onChange: (v) => setExtraForm((f) => ({ ...f, descricao: v })), placeholder: "Ex: Venda de whey, Aluguel de sala..." }), React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 13 } }, CATEGORIAS_EXTRA.map((c) => React.createElement("button", { key: c.v, onClick: () => setExtraForm((f) => ({ ...f, categoria: c.v })), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: extraForm.categoria === c.v ? O : "#f1f5f9", color: extraForm.categoria === c.v ? "#fff" : "#64748b" } }, c.l))), React.createElement("div", { onClick: () => setExtraForm((f) => ({ ...f, recorrente: !f.recorrente })), style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 13, cursor: "pointer", background: "#f8fafc", borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { width: 38, height: 22, borderRadius: 99, background: extraForm.recorrente ? "#FF5603" : "#cbd5e1", position: "relative", transition: "background 0.15s", flexShrink: 0 } }, React.createElement("div", { style: { width: 18, height: 18, borderRadius: 99, background: "#fff", position: "absolute", top: 2, left: extraForm.recorrente ? 18 : 2, transition: "left 0.15s" } })), React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "#334155" } }, "É uma receita recorrente")), extraForm.recorrente && React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 13 } }, FREQ_EXTRA.map((f) => React.createElement("button", { key: f.v, onClick: () => setExtraForm((ff) => ({ ...ff, frequencia: f.v })), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: extraForm.frequencia === f.v ? "#0f172a" : "#f1f5f9", color: extraForm.frequencia === f.v ? "#fff" : "#64748b" } }, f.l))), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, React.createElement(Inp, { label: extraForm.recorrente ? "Valor esperado (R$) *" : "Valor (R$) *", type: "number", value: extraForm.valor, onChange: (v) => setExtraForm((f) => ({ ...f, valor: v })), placeholder: "50.00" }), React.createElement(Inp, { label: extraForm.recorrente ? "Próxima cobrança prevista" : "Data do recebimento", type: "date", value: extraForm.data, onChange: (v) => setExtraForm((f) => ({ ...f, data: v })) })), extraForm.recorrente && React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: -6, marginBottom: 13 } }, "Entra como previsto. Quando você confirmar o recebimento, a próxima ocorrência já é criada sozinha."), React.createElement("div", { style: { marginBottom: 13 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 } }, "Observação (opcional)"), React.createElement("textarea", { value: extraForm.obs, onChange: (e) => setExtraForm((f) => ({ ...f, obs: e.target.value })), placeholder: "Detalhes adicionais...", rows: 2, style: { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, color: "#0f172a", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" } })), React.createElement("div", { style: { display: "flex", gap: 8 } }, extraEditId && React.createElement(Btn, { variant: "danger", onClick: () => {
    excluirExtra(extraEditId);
    setExtraModal(false);
  } }, "Excluir"), React.createElement(Btn, { full: true, onClick: salvarExtra, disabled: !extraForm.descricao.trim() || !extraForm.valor }, "Salvar")))));
};
