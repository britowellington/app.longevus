// Painel do professor (longevus-app.html) · parte 3 de 4. Código já convertido (sem Babel no navegador).
const Result = ({ assessmentId, assessments, setAssessments, students, nav }) => {
  const a = assessments.find((x) => x.id === assessmentId);
  if (!a) return React.createElement("div", { style: { textAlign: "center", padding: 40, color: "#94a3b8" } }, "Avaliação não encontrada.");
  const st = students.find((s) => s.id === a.studentId);
  const gc = classifyGlobal(a.globalScore || 0);
  const ahaCl = classifyAHA(a.aha?.score || 0);
  const funcCl = classifyFunctional(a.functional?.score || 0);
  const fitCl = classifyFitness(a.physical?.score || 0);
  const cvScore = Math.max(0, Math.round(100 - (a.aha?.score || 0) / 13 * 100));
  const sex = st?.sex || "";
  const [activeTab, setActiveTab] = React.useState("resultado");
  const modAtivos = a.modAtivos || { questionarios: true, fisico: true, cognitivo: true };
  const TABS = [
    { id: "resultado", label: "Resultado" },
    ...modAtivos.questionarios ? [{ id: "anamnese", label: "Anamnese" }, { id: "aha", label: "Risco CV" }, { id: "parq", label: "PAR-Q" }, { id: "avds", label: "AVDs" }] : [],
    ...modAtivos.fisico ? [{ id: "testes", label: "Testes" }, { id: "cardio", label: "Cardio" }] : [],
    ...modAtivos.cognitivo ? [{ id: "cognitivo", label: "Cognitivo" }] : []
  ];
  return React.createElement("div", null, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 } }, React.createElement("button", { onClick: () => nav("assessments"), style: { background: "#f1f5f9", border: "none", borderRadius: 9, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } }, React.createElement(I, { n: "back", s: 17 })), React.createElement("div", { style: { fontWeight: 800, fontSize: 17, flex: 1 } }, st?.name || "Avaliação"), React.createElement(Badge, { color: gc.color, bg: gc.bg }, gc.label)), React.createElement("div", { style: { display: "flex", gap: 3, overflowX: "auto", marginBottom: 14, paddingBottom: 2 } }, TABS.map((t) => React.createElement("button", { key: t.id, onClick: () => setActiveTab(t.id), style: { padding: "7px 12px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap", flexShrink: 0, background: activeTab === t.id ? "#FF5603" : "#f1f5f9", color: activeTab === t.id ? "#fff" : "#64748b" } }, t.label))), activeTab === "anamnese" && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#FF5603", marginBottom: 14, borderBottom: "1px solid #fee", paddingBottom: 8 } }, "Anamnese Clínica"), [
    ["Patologias / Doenças", a.anamnese?.pathologies],
    ["Medicamentos em uso", a.anamnese?.medications],
    ["Alergias", a.anamnese?.allergies],
    ["Cirurgias / Procedimentos", a.anamnese?.surgeries],
    ["Atividade física anterior", a.anamnese?.physActivityHistory],
    ["Modalidade(s)", a.anamnese?.physActivityType],
    ["Frequência semanal", a.anamnese?.physActivityFreq],
    ["Horas de sono/noite", a.anamnese?.sleepHours],
    ["Qualidade do sono", a.anamnese?.sleepQuality],
    ["Qualidade da alimentação", a.anamnese?.dietQuality],
    ["Nível de estresse", a.anamnese?.stressLevel],
    ["Tabagismo", a.anamnese?.smoking],
    ["Consumo de álcool", a.anamnese?.alcohol],
    ["Queixas / Sintomas", a.anamnese?.mainComplaints],
    ["Localização de dores", a.anamnese?.painLocation],
    ["Objetivos", a.anamnese?.goals],
    ["Observações", a.anamnese?.observations]
  ].filter(([, v]) => v && String(v).trim()).map(([label, val]) => React.createElement("div", { key: label, style: { marginBottom: 10, borderBottom: "1px solid #f1f5f9", paddingBottom: 8 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 3 } }, label), React.createElement("div", { style: { fontSize: 14, color: "#0f172a", fontWeight: 500 } }, val))), [["Patologias", "anamnese.pathologies"], ["Medicamentos", "anamnese.medications"]].every(([, k]) => !a.anamnese?.[k.split(".")[1]]) && React.createElement("div", { style: { color: "#94a3b8", fontSize: 13 } }, "Nenhum dado de anamnese registrado.")), activeTab === "parq" && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#FF5603", marginBottom: 14, borderBottom: "1px solid #fee", paddingBottom: 8 } }, "PAR-Q — Prontidão para Atividade Física"), a.parqApplied ? React.createElement("div", null, React.createElement("div", { style: { padding: "12px 14px", borderRadius: 10, background: a.parqFailed ? "#fef2f2" : "#f0fdf4", border: "1.5px solid " + (a.parqFailed ? "#fca5a5" : "#86efac"), marginBottom: 12 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: a.parqFailed ? "#dc2626" : "#16a34a" } }, a.parqFailed ? "PAR-Q Positivo — Avaliação médica recomendada antes do início" : "PAR-Q Negativo — Liberado para atividade física"))) : React.createElement("div", { style: { color: "#94a3b8", fontSize: 13 } }, "PAR-Q não aplicado nesta avaliação.")), activeTab === "avds" && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#FF5603", marginBottom: 14, borderBottom: "1px solid #fee", paddingBottom: 8 } }, "AVDs e AIVDs — Funcionalidade"), React.createElement("div", { style: { marginBottom: 14, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, fontWeight: 700, fontSize: 14 } }, "Score Funcional: ", a.functional?.score || "—", "/100"), a.avd && React.createElement("div", { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#475569" } }, "AVDs — Atividades Básicas (Índice de Barthel simplificado)"), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, [["Alimentação", a.avd.eating], ["Banho", a.avd.bathing], ["Vestuário", a.avd.dressing], ["Higiene pessoal", a.avd.toileting], ["Transferência", a.avd.transferring]].map(([k, v]) => React.createElement("div", { key: k, style: { background: "#f8fafc", borderRadius: 8, padding: "6px 10px", fontSize: 13 } }, React.createElement("span", { style: { color: "#94a3b8" } }, k, ": "), React.createElement("span", { style: { fontWeight: 700, color: v === 2 ? "#16a34a" : v === 1 ? "#d97706" : "#dc2626" } }, v === 2 ? "Independente" : v === 1 ? "Com auxílio" : "Dependente"))))), a.aivd && React.createElement("div", { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#475569" } }, "AIVDs — Atividades Instrumentais (Escala de Lawton)"), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, [["Compras", a.aivd.shopping], ["Finanças", a.aivd.finance], ["Transporte", a.aivd.transport], ["Medicação", a.aivd.medication], ["Tarefas domésticas", a.aivd.housework], ["Telefone/Celular", a.aivd.telephone]].map(([k, v]) => React.createElement("div", { key: k, style: { background: "#f8fafc", borderRadius: 8, padding: "6px 10px", fontSize: 13 } }, React.createElement("span", { style: { color: "#94a3b8" } }, k, ": "), React.createElement("span", { style: { fontWeight: 700, color: v === 2 ? "#16a34a" : v === 1 ? "#d97706" : "#dc2626" } }, v === 2 ? "Independente" : v === 1 ? "Com auxílio" : "Dependente"))))), a.functional && (a.functional.falls || a.functional.balance || a.functional.physlim || a.functional.selfhealth) && React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#475569" } }, "Fatores de Risco Funcional"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, a.functional.falls && React.createElement("div", { style: { background: "#fee2e2", borderRadius: 8, padding: "7px 10px", fontSize: 13, fontWeight: 700, color: "#dc2626" } }, "⚠️ Quedas nos últimos 12 meses"), a.functional.balance && React.createElement("div", { style: { background: "#fee2e2", borderRadius: 8, padding: "7px 10px", fontSize: 13, fontWeight: 700, color: "#dc2626" } }, "⚠️ Limitação de equilíbrio"), a.functional.physlim && React.createElement("div", { style: { background: "#ffedd5", borderRadius: 8, padding: "7px 10px", fontSize: 13, fontWeight: 700, color: "#ea580c" } }, "⚠️ Limitação física relatada"), a.functional.selfhealth !== void 0 && React.createElement("div", { style: { background: "#f8fafc", borderRadius: 8, padding: "7px 10px", fontSize: 13 } }, React.createElement("span", { style: { color: "#94a3b8" } }, "Autopercepção de saúde: "), React.createElement("span", { style: { fontWeight: 700 } }, ["Ruim", "Regular", "Boa"][a.functional.selfhealth] || a.functional.selfhealth)))), !a.avd && !a.aivd && React.createElement("div", { style: { color: "#94a3b8", fontSize: 13 } }, "AVDs/AIVDs não registradas.")), activeTab === "testes" && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#FF5603", marginBottom: 14, borderBottom: "1px solid #fee", paddingBottom: 8 } }, "Testes Físicos"), [
    ["Peso", a.aha?.weight, "kg"],
    ["Altura", a.aha?.height, "cm"],
    ["IMC", a.aha?.imc, "kg/m²"],
    ["Circ. Abdominal", a.physical?.waist, "cm"],
    ["Circ. Panturrilha", a.aha?.calf, "cm"],
    ["SPPB Equilíbrio", a.physical?.sppbBalanceScore !== void 0 ? String(a.physical.sppbBalanceScore) : "", "pts"],
    ["SPPB — Teste de Sentar e Levantar", a.physical?.sppbChairUnable ? "Incapaz" : a.physical?.sppbChair || "", "seg"],
    ["TUG", a.physical?.tug, "seg"],
    ["Preensão Manual", a.physical?.grip, "kgf"],
    ["Sentar e Alcançar", a.physical?.sitreach, "cm"],
    ["Marcha Estacionária", a.physical?.march, "passos"]
  ].filter(([, v]) => v).map(([label, val, unit]) => React.createElement("div", { key: label, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" } }, React.createElement("div", { style: { fontSize: 13, color: "#475569" } }, label), React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a" } }, val, unit ? " " + unit : "")))), activeTab === "cardio" && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#FF5603", marginBottom: 14, borderBottom: "1px solid #fee", paddingBottom: 8 } }, "Avaliação Cardiorrespiratória"), a.cardioMode && a.cardioMode !== "skip" ? React.createElement("div", null, React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 12 } }, "Modalidade: ", React.createElement("strong", { style: { color: "#0f172a" } }, a.cardioMode === "ergo" ? "Ergoespirometria / Teste Ergométrico" : "Predição Clínica (VO2 Predito)")), a.cardioMode === "ergo" && a.cardioAssessment?.ergo && (() => {
    const e = a.cardioAssessment.ergo;
    const vo2 = e.vo2max || (e.mets ? (parseFloat(e.mets) * 3.5).toFixed(1) : null);
    const vo2cl = vo2 ? classifyVO2(vo2, calcAge(st?.dob), sex) : null;
    const fcMax = parseFloat(e.fcMax), fcRest = parseFloat(e.fcRest);
    const fcRes = fcMax && fcRest ? fcMax - fcRest : null;
    const dp = fcMax && e.pasPeak ? Math.round(fcMax * parseFloat(e.pasPeak)) : null;
    const metCl = metClass(e.mets);
    const hasBeta = e.medications?.includes("beta");
    const hasArr = e.arrythmias?.length > 0 && !e.arrythmias.includes("none");
    return React.createElement("div", null, [["FC Repouso", e.fcRest, "bpm"], ["FC Máxima", e.fcMax, "bpm"], ["METs", e.mets, "METs"], ["PAS Repouso", e.pasSit, "mmHg"], ["PAS Pico", e.pasPeak, "mmHg"], ["FC Reserva", fcRes, fcRes ? "bpm" : null], ["Duplo Produto", dp ? dp.toLocaleString("pt-BR") : null, dp ? "mmHg·bpm" : null], ["FC Limiar Isq.", e.fcIschemic ? e.fcIschemic + " bpm" : null, null], ["Zona Segura", e.fcIschemic ? parseFloat(e.fcIschemic) - 10 + " bpm" : null, null]].filter(([, v]) => v).map(([label, val, unit]) => React.createElement("div", { key: label, style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13 } }, React.createElement("span", { style: { color: "#475569" } }, label), React.createElement("span", { style: { fontWeight: 700, color: "#0f172a" } }, val, unit ? " " + unit : ""))), vo2 && React.createElement("div", { style: { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: 12, marginTop: 10 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#16a34a" } }, "🫁 VO₂máx — ", e.vo2measured ? "Medido" : "Estimado (METs×3.5)"), React.createElement("div", { style: { fontWeight: 900, fontSize: 18, color: "#16a34a" } }, parseFloat(vo2).toFixed(1), " ml/kg/min")), vo2cl && React.createElement("div", { style: { background: vo2cl.bg, borderRadius: 8, padding: "8px 12px" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: vo2cl.color } }, vo2cl.label), React.createElement("div", { style: { fontSize: 11, color: "#475569" } }, vo2cl.desc)), metCl && React.createElement("div", { style: { marginTop: 8 } }, React.createElement(TestResult, { cl: metCl }))), fcMax > 0 && React.createElement("div", { style: { marginTop: 10 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#475569", marginBottom: 8 } }, "Zonas de Treinamento Aeróbio"), hasBeta && React.createElement("div", { style: { background: "#eef2ff", borderRadius: 8, padding: "7px 12px", marginBottom: 8, fontSize: 11, fontWeight: 700, color: "#6366f1" } }, "💊 Beta-bloqueador: priorizar PSE/Borg + sintomas"), React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 11 } }, React.createElement("thead", null, React.createElement("tr", { style: { background: "#f8fafc" } }, ["Intensidade", fcRes ? "FC Karvonen" : null, "%FCmáx", "PSE (0–10)", "Zona"].filter(Boolean).map((h) => React.createElement("th", { key: h, style: { padding: "6px 8px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "1.5px solid #e2e8f0" } }, h)))), React.createElement("tbody", null, [0.4, 0.5, 0.6, 0.7, 0.8].map((pc) => {
      const karv = fcRes ? Math.round(fcRes * pc + fcRest) : null;
      const pctFc = Math.round(fcMax * pc);
      const safe = e.fcIschemic ? (karv || pctFc) < parseFloat(e.fcIschemic) - 10 : true;
      const borg = pc <= 0.5 ? "2–3" : pc <= 0.6 ? "4–5" : pc <= 0.7 ? "5–6" : "6–7";
      const zona = pc <= 0.5 ? "Leve" : pc <= 0.6 ? "Moderada" : pc <= 0.7 ? "Mod-Vigorosa" : "Vigorosa";
      const color = safe ? "#16a34a" : "#dc2626";
      return React.createElement("tr", { key: pc, style: { borderBottom: "1px solid #f1f5f9" } }, React.createElement("td", { style: { padding: "6px 8px", fontWeight: 800 } }, Math.round(pc * 100), "%"), fcRes && React.createElement("td", { style: { padding: "6px 8px", fontWeight: 800, color } }, karv, " bpm", !safe ? " ⚠️" : ""), React.createElement("td", { style: { padding: "6px 8px", color } }, pctFc, " bpm", !fcRes && !safe ? " ⚠️" : ""), React.createElement("td", { style: { padding: "6px 8px", color: "#64748b" } }, borg), React.createElement("td", { style: { padding: "6px 8px" } }, React.createElement("span", { style: { background: "#16a34a18", color: "#16a34a", padding: "2px 7px", borderRadius: 99, fontSize: 11, fontWeight: 700 } }, zona)));
    })))), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 } }, hasBeta && React.createElement(Badge, { color: "#6366f1", bg: "#eef2ff" }, "💊 Beta-bloqueador"), hasArr && React.createElement(Badge, { color: "#dc2626", bg: "#fee2e2" }, "⚠️ Arritmia detectada"), e.symptomType && e.symptomType !== "" && React.createElement(Badge, { color: "#ea580c", bg: "#ffedd5" }, "🚩 ", { chest: "Dor torácica", dyspnea: "Dispneia", fatigue: "Fadiga", dizziness: "Tontura", palp: "Palpitação", other: "Outro" }[e.symptomType])), e.ecgObs && React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 8 } }, "ECG: ", e.ecgObs));
  })(), a.cardioMode === "pred" && a.cardioAssessment?.pred && (() => {
    const p = a.cardioAssessment.pred;
    const age3 = parseFloat(p.age || calcAge(st?.dob));
    const fcMax2 = p.formula === "tanaka" ? Math.round(208 - 0.7 * age3) : 220 - age3;
    const fcRes2 = p.fcRest ? fcMax2 - parseFloat(p.fcRest) : null;
    const risk = riskStratify(p);
    const hasBeta2 = p.medications?.includes("beta");
    return React.createElement("div", null, React.createElement("div", { style: { background: risk.bg, border: `1.5px solid ${risk.color}33`, borderRadius: 10, padding: 12, marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 14, color: risk.color, marginBottom: 4 } }, risk.label), React.createElement("div", { style: { fontSize: 12, color: "#334155" } }, "Zona recomendada: ", React.createElement("strong", null, risk.fcr), " · Borg: ", React.createElement("strong", null, risk.borg)), risk.alert && React.createElement("div", { style: { fontSize: 11, color: risk.color, fontWeight: 700, marginTop: 4 } }, "⚠️ ", risk.alert)), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6, marginBottom: 10 } }, React.createElement("div", { style: { background: "#f8fafc", borderRadius: 8, padding: "8px 10px" } }, React.createElement("div", { style: { fontSize: 9, color: "#94a3b8", fontWeight: 700 } }, "FCmáx ESTIMADA"), React.createElement("div", { style: { fontSize: 16, fontWeight: 900, color: "#FF5603" } }, fcMax2, " bpm"), React.createElement("div", { style: { fontSize: 9, color: "#64748b" } }, p.formula === "tanaka" ? "Tanaka" : "Tradicional")), fcRes2 && React.createElement("div", { style: { background: "#f8fafc", borderRadius: 8, padding: "8px 10px" } }, React.createElement("div", { style: { fontSize: 9, color: "#94a3b8", fontWeight: 700 } }, "FC RESERVA"), React.createElement("div", { style: { fontSize: 16, fontWeight: 900, color: "#6366f1" } }, fcRes2, " bpm"))), React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#475569", marginBottom: 8 } }, "Zonas de Treinamento Estimadas"), hasBeta2 && React.createElement("div", { style: { background: "#eef2ff", borderRadius: 8, padding: "7px 12px", marginBottom: 8, fontSize: 11, fontWeight: 700, color: "#6366f1" } }, "💊 Beta-bloqueador: priorizar PSE/Borg + sintomas"), React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 11 } }, React.createElement("thead", null, React.createElement("tr", { style: { background: "#f8fafc" } }, ["Intensidade", fcRes2 ? "FC Karvonen" : null, "%FCmáx", "PSE (0–10)", "Zona"].filter(Boolean).map((h) => React.createElement("th", { key: h, style: { padding: "6px 8px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "1.5px solid #e2e8f0" } }, h)))), React.createElement("tbody", null, [0.4, 0.5, 0.6, 0.7, 0.8].map((p2) => {
      const karv2 = fcRes2 ? Math.round(fcRes2 * p2 + parseFloat(p.fcRest)) : null;
      const pctFc2 = Math.round(fcMax2 * p2);
      const borg2 = p2 <= 0.5 ? "2–3" : p2 <= 0.6 ? "4–5" : p2 <= 0.7 ? "5–6" : "6–7";
      const zona2 = p2 <= 0.5 ? "Leve" : p2 <= 0.6 ? "Moderada" : p2 <= 0.7 ? "Mod-Vig." : "Vigorosa";
      return React.createElement("tr", { key: p2, style: { borderBottom: "1px solid #f1f5f9" } }, React.createElement("td", { style: { padding: "6px 8px", fontWeight: 800, color: "#16a34a" } }, Math.round(p2 * 100), "%"), fcRes2 && React.createElement("td", { style: { padding: "6px 8px", fontWeight: 800, color: "#16a34a" } }, karv2, " bpm"), React.createElement("td", { style: { padding: "6px 8px", color: "#475569" } }, pctFc2, " bpm"), React.createElement("td", { style: { padding: "6px 8px", color: "#64748b" } }, borg2), React.createElement("td", { style: { padding: "6px 8px" } }, React.createElement("span", { style: { background: "#16a34a18", color: "#16a34a", padding: "2px 7px", borderRadius: 99, fontSize: 11, fontWeight: 700 } }, zona2)));
    }))));
  })()) : React.createElement("div", { style: { color: "#94a3b8", fontSize: 13 } }, "Avaliação cardiorrespiratória não realizada.")), activeTab === "cognitivo" && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#FF5603", marginBottom: 14, borderBottom: "1px solid #fee", paddingBottom: 8 } }, "Avaliação Cognitiva"), a.cognitiveData && a.cognitiveData.score > 0 ? React.createElement("div", null, React.createElement("div", { style: { marginBottom: 14, padding: "8px 12px", background: "#f8fafc", borderRadius: 8, fontWeight: 700, fontSize: 14 } }, "Score Cognitivo: ", a.cognitiveData.score, "/100"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, a.cognitiveData.mmse?.total && (() => {
    const cl = classifyMMSE(a.cognitiveData.mmse.total);
    return cl ? React.createElement("div", { style: { background: cl.bg, borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } }, React.createElement("span", { style: { fontSize: 11, color: cl.color, fontWeight: 700, textTransform: "uppercase" } }, "MMSE"), React.createElement("span", { style: { fontSize: 18, fontWeight: 900, color: cl.color } }, a.cognitiveData.mmse.total, "/30")), React.createElement("div", { style: { fontSize: 11, color: cl.color, fontWeight: 700, marginBottom: 4 } }, cl.label), React.createElement("div", { style: { fontSize: 12, color: "#475569", lineHeight: 1.4, marginBottom: 8 } }, cl.desc), cl.impact && React.createElement("div", { style: { fontSize: 12, color: "#334155", lineHeight: 1.4, marginBottom: 8, paddingTop: 6, borderTop: "1px solid " + cl.color + "22" } }, React.createElement("strong", null, "Impacto no cotidiano:"), " ", cl.impact), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, [
      { k: "q1", l: "Orientação temporal", max: 5 },
      { k: "q2", l: "Orientação espacial", max: 5 },
      { k: "q3", l: "Registro de memória", max: 3 },
      { k: "q4", l: "Atenção e cálculo", max: 5 },
      { k: "q5", l: "Evocação", max: 3 },
      { k: "q6", l: "Nomeação", max: 2 },
      { k: "q7", l: "Repetição", max: 1 },
      { k: "q8", l: "Comando", max: 3 },
      { k: "q9", l: "Leitura e escrita", max: 2 },
      { k: "q10", l: "Cópia", max: 1 }
    ].map((q) => React.createElement("div", { key: q.k, style: { display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", borderTop: "1px solid " + cl.color + "22" } }, React.createElement("span", { style: { color: "#475569" } }, q.l), React.createElement("span", { style: { fontWeight: 700, color: "#0f172a" } }, a.cognitiveData.mmse[q.k] || 0, "/", q.max))))) : null;
  })(), a.cognitiveData.dualTask?.single && a.cognitiveData.dualTask?.dual && (() => {
    const cl = classifyDualTask(a.cognitiveData.dualTask.single, a.cognitiveData.dualTask.dual);
    return cl ? React.createElement("div", { style: { background: cl.bg, borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } }, React.createElement("span", { style: { fontSize: 11, color: cl.color, fontWeight: 700, textTransform: "uppercase" } }, "Dual Task Cost"), React.createElement("span", { style: { fontSize: 18, fontWeight: 900, color: cl.color } }, cl.cost, "%")), React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginBottom: 4 } }, "Simples: ", a.cognitiveData.dualTask.single, " passos · Dupla: ", a.cognitiveData.dualTask.dual, " passos"), React.createElement("div", { style: { fontSize: 11, color: cl.color, fontWeight: 700, marginBottom: 4 } }, cl.label), React.createElement("div", { style: { fontSize: 12, color: "#475569", lineHeight: 1.4, marginBottom: 8 } }, cl.desc), cl.impact && React.createElement("div", { style: { fontSize: 12, color: "#334155", lineHeight: 1.4, paddingTop: 6, borderTop: "1px solid " + cl.color + "22" } }, React.createElement("strong", null, "Impacto no cotidiano:"), " ", cl.impact)) : null;
  })(), a.cognitiveData.verbalFluency?.score && (() => {
    const cl = classifyVerbalFluency(a.cognitiveData.verbalFluency.score);
    return cl ? React.createElement("div", { style: { background: cl.bg, borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } }, React.createElement("span", { style: { fontSize: 11, color: cl.color, fontWeight: 700, textTransform: "uppercase" } }, "Fluência Verbal"), React.createElement("span", { style: { fontSize: 18, fontWeight: 900, color: cl.color } }, a.cognitiveData.verbalFluency.score, " palavras/min")), React.createElement("div", { style: { fontSize: 11, color: cl.color, fontWeight: 700, marginBottom: 4 } }, cl.label), React.createElement("div", { style: { fontSize: 12, color: "#475569", lineHeight: 1.4, marginBottom: 8 } }, cl.desc), cl.impact && React.createElement("div", { style: { fontSize: 12, color: "#334155", lineHeight: 1.4, paddingTop: 6, borderTop: "1px solid " + cl.color + "22" } }, React.createElement("strong", null, "Impacto no cotidiano:"), " ", cl.impact), a.cognitiveData.verbalFluency.words && React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 6, fontStyle: "italic" } }, "Palavras ditas: ", a.cognitiveData.verbalFluency.words)) : null;
  })(), a.cognitiveData.digitSpan?.direct && (() => {
    const cl = classifyDigitSpan(a.cognitiveData.digitSpan.direct, a.cognitiveData.digitSpan.inverse);
    return cl ? React.createElement("div", { style: { background: cl.bg, borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } }, React.createElement("span", { style: { fontSize: 11, color: cl.color, fontWeight: 700, textTransform: "uppercase" } }, "Span de Dígitos"), React.createElement("span", { style: { fontSize: 18, fontWeight: 900, color: cl.color } }, a.cognitiveData.digitSpan.direct, "↑ ", a.cognitiveData.digitSpan.inverse ? a.cognitiveData.digitSpan.inverse + "↓" : "")), React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginBottom: 4 } }, "Direto: ", a.cognitiveData.digitSpan.direct, " dígitos", a.cognitiveData.digitSpan.inverse ? " · Inverso: " + a.cognitiveData.digitSpan.inverse + " dígitos" : ""), React.createElement("div", { style: { fontSize: 11, color: cl.color, fontWeight: 700, marginBottom: 4 } }, cl.label), React.createElement("div", { style: { fontSize: 12, color: "#475569", lineHeight: 1.4, marginBottom: 8 } }, cl.desc), cl.impact && React.createElement("div", { style: { fontSize: 12, color: "#334155", lineHeight: 1.4, paddingTop: 6, borderTop: "1px solid " + cl.color + "22" } }, React.createElement("strong", null, "Impacto no cotidiano:"), " ", cl.impact)) : null;
  })()), a.cognitiveData.notes && React.createElement("div", { style: { marginTop: 12, padding: "10px 12px", background: "#f8fafc", borderRadius: 8 } }, React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", fontWeight: 700, marginBottom: 4 } }, "OBSERVAÇÕES"), React.createElement("div", { style: { fontSize: 13, color: "#475569" } }, a.cognitiveData.notes))) : React.createElement("div", { style: { color: "#94a3b8", fontSize: 13 } }, "Avaliação cognitiva não registrada.")), activeTab === "aha" && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#FF5603", marginBottom: 14, borderBottom: "1px solid #fee", paddingBottom: 8 } }, "Risco Cardiovascular (AHA)"), React.createElement("div", { style: { marginBottom: 14 } }, [
    ["Peso", a.aha?.weight, "kg"],
    ["Altura", a.aha?.height, "cm"],
    ["IMC", a.aha?.bmi, "kg/m²"],
    ["PAS (repouso)", a.aha?.sbp, "mmHg"],
    ["PAD (repouso)", a.aha?.dbp, "mmHg"],
    ["FC (repouso)", a.aha?.hr, "bpm"],
    ["Cintura", a.aha?.waist, "cm"],
    ["Quadril", a.aha?.hip, "cm"],
    ["Panturrilha", a.aha?.calf, "cm"]
  ].filter(([, v]) => v).map(([label, val, unit]) => React.createElement("div", { key: label, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" } }, React.createElement("div", { style: { fontSize: 13, color: "#475569" } }, label), React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a" } }, val, unit ? " " + unit : "")))), React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#475569", marginBottom: 10, marginTop: 4 } }, "Fatores de Risco"), [
    ["Tabagismo", "smoker"],
    ["Diabetes", "diabetes"],
    ["Hipertensão", "hypertension"],
    ["Dislipidemia", "hyperlipid"],
    ["Histórico familiar", "familyHistory"],
    ["Sedentarismo", "sedentary"],
    ["Obesidade", "obese"]
  ].map(([label, key]) => React.createElement("div", { key, style: { display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #f1f5f9" } }, React.createElement("div", { style: { width: 22, height: 22, borderRadius: 6, background: a.aha?.[key] ? "#fef2f2" : "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 } }, a.aha?.[key] ? "⚠️" : "✅"), React.createElement("div", { style: { fontSize: 13, color: "#475569" } }, label), React.createElement("div", { style: { marginLeft: "auto", fontWeight: 700, fontSize: 12, color: a.aha?.[key] ? "#dc2626" : "#16a34a" } }, a.aha?.[key] ? "Sim" : "Não"))), React.createElement("div", { style: { marginTop: 14, padding: "12px 14px", borderRadius: 10, background: (a.aha?.score || 0) >= 4 ? "#fef2f2" : (a.aha?.score || 0) >= 2 ? "#fff7ed" : "#f0fdf4", border: "1.5px solid " + ((a.aha?.score || 0) >= 4 ? "#fca5a5" : (a.aha?.score || 0) >= 2 ? "#fed7aa" : "#86efac") } }, React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", fontWeight: 700, marginBottom: 4 } }, "SCORE DE RISCO AHA"), React.createElement("div", { style: { fontWeight: 800, fontSize: 22, color: (a.aha?.score || 0) >= 4 ? "#dc2626" : (a.aha?.score || 0) >= 2 ? "#d97706" : "#16a34a" } }, a.aha?.score || 0, " pontos"), React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2 } }, (a.aha?.score || 0) >= 4 ? "Alto risco cardiovascular" : (a.aha?.score || 0) >= 2 ? "Risco moderado" : "Baixo risco"))), activeTab === "resultado" && React.createElement("div", null, React.createElement(Card, { style: { marginBottom: 14, background: "linear-gradient(135deg,#fff4ee,#fff)", border: "1.5px solid #FF560320" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14 } }, React.createElement("div", { style: { width: 50, height: 50, borderRadius: 14, background: O, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", flexShrink: 0 } }, st?.name?.[0]), React.createElement("div", { style: { flex: 1 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 17 } }, st?.name), React.createElement("div", { style: { fontSize: 12, color: "#64748b" } }, calcAge(st?.dob), " anos · ", st?.sex === "M" ? "Masc" : "Fem", " · ", fmt(a.date))), React.createElement(Badge, { color: gc.color, bg: gc.bg }, gc.label))), a.parqApplied && React.createElement(Card, { style: { marginBottom: 14, border: `1.5px solid ${a.parqFailed ? "#fca5a5" : "#86efac"}`, background: a.parqFailed ? "#fee2e2" : "#f0fdf4" } }, a.parqFailed ? React.createElement("div", { style: { color: "#dc2626", fontWeight: 700, fontSize: 14 } }, "⚠️ PAR-Q Positivo — avaliação médica recomendada antes de iniciar programa de exercícios.") : React.createElement("div", { style: { color: "#16a34a", fontWeight: 700, fontSize: 14 } }, "✅ PAR-Q Negativo — Sem contraindicações identificadas pelo questionário.")), React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, marginBottom: 16 } }, "Índices Longevus"), React.createElement("div", { style: { display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 8 } }, modAtivos.questionarios && React.createElement(ScoreRing, { score: cvScore, label: "Risco Cardiovascular", color: classifyCV(cvScore).color }), modAtivos.questionarios && React.createElement(ScoreRing, { score: a.functional?.score || 0, label: "Capacidade Funcional", color: funcCl.color }), modAtivos.fisico && React.createElement(ScoreRing, { score: a.physical?.score || 0, label: "Aptidão Física", color: fitCl.color }), a.cognitiveData?.score > 0 && React.createElement(ScoreRing, { score: a.cognitiveData.score, label: "Capacidade Cognitiva", color: classifyCognitive(a.cognitiveData.score).color }), React.createElement(ScoreRing, { score: a.globalScore || 0, label: "Índice Global", size: 100, color: gc.color }))), modAtivos.questionarios && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 } }, React.createElement("div", { style: { fontWeight: 700 } }, "Risco Cardiovascular"), React.createElement(Badge, { color: ahaCl.color, bg: ahaCl.bg }, ahaCl.label)), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 } }, [["Peso", a.aha?.weight ? a.aha.weight + " kg" : "—"], ["Altura", a.aha?.height ? a.aha.height + " cm" : "—"], ["IMC", a.aha?.bmi ? a.aha.bmi + " kg/m²" : "—"], ["PAS", a.aha?.sbp ? a.aha.sbp + " mmHg" : "—"], ["PAD", a.aha?.dbp ? a.aha.dbp + " mmHg" : "—"], ["FC", a.aha?.hr ? a.aha.hr + " bpm" : "—"], ["Cintura", a.aha?.waist ? a.aha.waist + " cm" : "—"], ["Quadril", a.aha?.hip ? a.aha.hip + " cm" : "—"], ["Panturrilha", a.aha?.calf ? a.aha.calf + " cm" : "—"], ["Score AHA", a.aha?.score]].map(([k, v]) => React.createElement("div", { key: k, style: { background: "#f8fafc", borderRadius: 9, padding: "9px 10px" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 600 } }, k), React.createElement("div", { style: { fontSize: 14, fontWeight: 700 } }, v || "—"))))), modAtivos.questionarios && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 700 } }, "Capacidade Funcional (Spirduso)"), React.createElement(Badge, { color: funcCl.color, bg: funcCl.bg }, funcCl.label)), React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 10 } }, "Score: ", React.createElement("strong", { style: { color: "#0f172a" } }, a.functional?.score, "/100")), a.avd && React.createElement("div", { style: { marginBottom: 8 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 } }, "AVDs — Atividades Básicas:"), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, [["Alimentação", a.avd.eating], ["Banho", a.avd.bathing], ["Vestuário", a.avd.dressing], ["Higiene", a.avd.toileting], ["Transferência", a.avd.transferring]].map(([k, v]) => React.createElement("div", { key: k, style: { background: "#f8fafc", borderRadius: 8, padding: "5px 10px", fontSize: 12 } }, React.createElement("span", { style: { color: "#94a3b8" } }, k, ": "), React.createElement("span", { style: { fontWeight: 700, color: v === 2 ? "#16a34a" : v === 1 ? "#d97706" : "#dc2626" } }, v === 2 ? "Indep." : v === 1 ? "Auxílio" : "Depend."))))), a.aivd && React.createElement("div", null, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 } }, "AIVDs — Atividades Instrumentais:"), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, [["Compras", a.aivd.shopping], ["Finanças", a.aivd.finance], ["Transporte", a.aivd.transport], ["Medicação", a.aivd.medication], ["Dom.", a.aivd.housework], ["Telefone", a.aivd.telephone]].map(([k, v]) => React.createElement("div", { key: k, style: { background: "#f8fafc", borderRadius: 8, padding: "5px 10px", fontSize: 12 } }, React.createElement("span", { style: { color: "#94a3b8" } }, k, ": "), React.createElement("span", { style: { fontWeight: 700, color: v === 2 ? "#16a34a" : v === 1 ? "#d97706" : "#dc2626" } }, v === 2 ? "Indep." : v === 1 ? "Auxílio" : "Depend.")))))), modAtivos.fisico && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 } }, React.createElement("div", { style: { fontWeight: 700 } }, "Testes Físicos"), React.createElement(Badge, { color: fitCl.color, bg: fitCl.bg }, fitCl.label)), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, [
    ...a.physical?.sppbSide !== void 0 ? [["SPPB Equilíbrio", String(a.physical.sppbSide === "0" ? 0 : (parseInt(a.physical.sppbSemi) || 0) + (parseInt(a.physical.sppbTandem) || 0)), () => classifySPPBBalance(a.physical.sppbSide, a.physical.sppbSemi, a.physical.sppbTandem), "/ 3 pts"]] : [],
    ...a.physical?.sppbChair || a.physical?.sppbChairUnable ? [["SPPB — Teste de Sentar e Levantar", a.physical.sppbChairUnable ? "Incapaz" : a.physical.sppbChair, (v) => classifySPPBChairStand(a.physical.sppbChairUnable ? "unable" : v), a.physical.sppbChairUnable ? "" : "seg"]] : [],
    ["Preensão Manual", a.physical?.grip, (v) => classifyHandGrip(v, sex), "kgf"],
    ["TUG", a.physical?.tug, classifyTUG, "seg"],
    ["Sentar e Alcançar", a.physical?.sitreach, classifySitReach, "cm"],
    ["Marcha Estacionária", a.physical?.march, (v) => classifyMarch(v, sex), "passos"]
  ].map(([name, val, clFn, unit]) => {
    if (!val && val !== "0") return null;
    const cl = clFn(val);
    return cl ? React.createElement("div", { key: name, style: { background: "#f8fafc", borderRadius: 10, padding: "10px 12px" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 } }, React.createElement("span", { style: { fontSize: 13, fontWeight: 600, color: "#334155" } }, name), React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, React.createElement("span", { style: { fontWeight: 800, color: "#0f172a" } }, val, " ", unit), React.createElement(Badge, { color: cl.color, bg: cl.bg }, cl.label))), React.createElement("div", { style: { fontSize: 12, color: "#64748b", lineHeight: 1.5 } }, cl.desc)) : null;
  }))), a?.cognitiveData?.score > 0 && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 } }, React.createElement("div", { style: { fontWeight: 700 } }, "🧠 Avaliação Cognitiva"), (() => {
    const cs = a.cognitiveData.score;
    const cl = cs >= 80 ? { label: "Excelente", color: "#16a34a", bg: "#dcfce7" } : cs >= 65 ? { label: "Bom", color: "#65a30d", bg: "#ecfccb" } : cs >= 50 ? { label: "Regular", color: "#d97706", bg: "#fef9c3" } : { label: "Comprometido", color: "#dc2626", bg: "#fee2e2" };
    return React.createElement(Badge, { color: cl.color, bg: cl.bg }, "Score ", cs, " — ", cl.label);
  })()), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, a.cognitiveData.mmse?.total && (() => {
    const cl = classifyMMSE(a.cognitiveData.mmse.total);
    return cl ? React.createElement("div", { style: { background: cl.bg, borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { fontSize: 10, color: cl.color, fontWeight: 700, textTransform: "uppercase" } }, "MMSE"), React.createElement("div", { style: { fontSize: 18, fontWeight: 900, color: cl.color } }, a.cognitiveData.mmse.total, "/30"), React.createElement("div", { style: { fontSize: 11, color: cl.color, fontWeight: 700, marginBottom: 4 } }, cl.label), React.createElement("div", { style: { fontSize: 11, color: "#475569", lineHeight: 1.4, marginBottom: 6 } }, cl.desc), cl.impact && React.createElement("div", { style: { fontSize: 11, color: "#334155", lineHeight: 1.4, paddingTop: 5, borderTop: "1px solid " + cl.color + "22" } }, React.createElement("strong", null, "Impacto no cotidiano:"), " ", cl.impact)) : null;
  })(), a.cognitiveData.dualTask?.single && a.cognitiveData.dualTask?.dual && (() => {
    const cl = classifyDualTask(a.cognitiveData.dualTask.single, a.cognitiveData.dualTask.dual);
    return cl ? React.createElement("div", { style: { background: cl.bg, borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { fontSize: 10, color: cl.color, fontWeight: 700, textTransform: "uppercase" } }, "DUAL TASK COST"), React.createElement("div", { style: { fontSize: 18, fontWeight: 900, color: cl.color } }, cl.cost, "%"), React.createElement("div", { style: { fontSize: 11, color: cl.color, fontWeight: 700, marginBottom: 4 } }, cl.label), React.createElement("div", { style: { fontSize: 11, color: "#475569", lineHeight: 1.4, marginBottom: 6 } }, cl.desc), cl.impact && React.createElement("div", { style: { fontSize: 11, color: "#334155", lineHeight: 1.4, paddingTop: 5, borderTop: "1px solid " + cl.color + "22" } }, React.createElement("strong", null, "Impacto no cotidiano:"), " ", cl.impact)) : null;
  })(), a.cognitiveData.verbalFluency?.score && (() => {
    const cl = classifyVerbalFluency(a.cognitiveData.verbalFluency.score);
    return cl ? React.createElement("div", { style: { background: cl.bg, borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { fontSize: 10, color: cl.color, fontWeight: 700, textTransform: "uppercase" } }, "FLUÊNCIA VERBAL"), React.createElement("div", { style: { fontSize: 18, fontWeight: 900, color: cl.color } }, a.cognitiveData.verbalFluency.score, " palavras"), React.createElement("div", { style: { fontSize: 11, color: cl.color, fontWeight: 700, marginBottom: 4 } }, cl.label), React.createElement("div", { style: { fontSize: 11, color: "#475569", lineHeight: 1.4, marginBottom: 6 } }, cl.desc), cl.impact && React.createElement("div", { style: { fontSize: 11, color: "#334155", lineHeight: 1.4, paddingTop: 5, borderTop: "1px solid " + cl.color + "22" } }, React.createElement("strong", null, "Impacto no cotidiano:"), " ", cl.impact)) : null;
  })(), a.cognitiveData.digitSpan?.direct && (() => {
    const cl = classifyDigitSpan(a.cognitiveData.digitSpan.direct, a.cognitiveData.digitSpan.inverse);
    return cl ? React.createElement("div", { style: { background: cl.bg, borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { fontSize: 10, color: cl.color, fontWeight: 700, textTransform: "uppercase" } }, "SPAN DÍGITOS"), React.createElement("div", { style: { fontSize: 18, fontWeight: 900, color: cl.color } }, a.cognitiveData.digitSpan.direct, "↑ ", a.cognitiveData.digitSpan.inverse ? a.cognitiveData.digitSpan.inverse + "↓" : ""), React.createElement("div", { style: { fontSize: 11, color: cl.color, fontWeight: 700, marginBottom: 4 } }, cl.label), React.createElement("div", { style: { fontSize: 11, color: "#475569", lineHeight: 1.4, marginBottom: 6 } }, cl.desc), cl.impact && React.createElement("div", { style: { fontSize: 11, color: "#334155", lineHeight: 1.4, paddingTop: 5, borderTop: "1px solid " + cl.color + "22" } }, React.createElement("strong", null, "Impacto no cotidiano:"), " ", cl.impact)) : null;
  })()), a.cognitiveData.notes && React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 10 } }, "📝 ", a.cognitiveData.notes), (() => {
    const cd = a.cognitiveData;
    const mmseVal = cd.mmse?.total ? Math.round(parseInt(cd.mmse.total) / 30 * 100) : null;
    const dtCl = cd.dualTask?.single && cd.dualTask?.dual ? classifyDualTask(cd.dualTask.single, cd.dualTask.dual) : null;
    const dtVal = dtCl ? Math.max(0, 100 - dtCl.cost * 2) : null;
    const vfVal = cd.verbalFluency?.score ? Math.min(100, Math.round(parseInt(cd.verbalFluency.score) / 18 * 100)) : null;
    const dsVal = cd.digitSpan?.direct ? Math.min(100, Math.round(parseInt(cd.digitSpan.direct) / 9 * 100)) : null;
    const domains = [
      { label: "MMSE", value: mmseVal, color: "#6366f1" },
      { label: "Dual Task", value: dtVal, color: "#FF5603" },
      { label: "Fluência", value: vfVal, color: "#16a34a" },
      { label: "Span", value: dsVal, color: "#7c3aed" }
    ].filter((d) => d.value !== null);
    if (domains.length < 2) return null;
    const cx = 140, cy = 110, r = 70, n = domains.length;
    const pts = domains.map((d, i) => {
      const angle = i / n * 2 * Math.PI - Math.PI / 2;
      const val = d.value / 100 * r;
      return { x: cx + Math.cos(angle) * val, y: cy + Math.sin(angle) * val, lx: cx + Math.cos(angle) * (r + 28), ly: cy + Math.sin(angle) * (r + 28), ...d };
    });
    const bgPoly = domains.map((_, i) => {
      const a2 = i / n * 2 * Math.PI - Math.PI / 2;
      return `${cx + Math.cos(a2) * r},${cy + Math.sin(a2) * r}`;
    }).join(" ");
    const dataPoly = pts.map((p) => `${p.x},${p.y}`).join(" ");
    return React.createElement("div", { style: { marginTop: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 8 } }, "📊 Perfil Cognitivo"), React.createElement("div", { style: { display: "flex", justifyContent: "center" } }, React.createElement("svg", { width: "280", height: "230", viewBox: "0 0 280 230" }, [25, 50, 75, 100].map((pct) => React.createElement("polygon", { key: pct, points: domains.map((_, i) => {
      const a2 = i / n * 2 * Math.PI - Math.PI / 2;
      const rv = pct / 100 * r;
      return `${cx + Math.cos(a2) * rv},${cy + Math.sin(a2) * rv}`;
    }).join(" "), fill: "none", stroke: "#e2e8f0", strokeWidth: "1" })), domains.map((_, i) => {
      const a2 = i / n * 2 * Math.PI - Math.PI / 2;
      return React.createElement("line", { key: i, x1: cx, y1: cy, x2: cx + Math.cos(a2) * r, y2: cy + Math.sin(a2) * r, stroke: "#e2e8f0", strokeWidth: "1" });
    }), React.createElement("polygon", { points: bgPoly, fill: "#f8fafc", stroke: "#e2e8f0", strokeWidth: "1" }), React.createElement("polygon", { points: dataPoly, fill: "#6366f128", stroke: "#6366f1", strokeWidth: "2" }), pts.map((p, i) => React.createElement("circle", { key: i, cx: p.x, cy: p.y, r: 5, fill: p.color, stroke: "#fff", strokeWidth: "2" })), pts.map((p, i) => React.createElement("text", { key: "l" + i, x: p.lx, y: p.ly + 4, textAnchor: "middle", fontSize: "11", fontWeight: "700", fill: "#475569" }, p.label)), pts.map((p, i) => React.createElement("text", { key: "v" + i, x: p.x, y: p.y - 8, textAnchor: "middle", fontSize: "10", fontWeight: "800", fill: p.color }, p.value)), React.createElement("text", { x: cx, y: cy + 5, textAnchor: "middle", fontSize: "20", fontWeight: "900", fill: "#0f172a" }, cd.score), React.createElement("text", { x: cx, y: cy + 18, textAnchor: "middle", fontSize: "9", fill: "#94a3b8" }, "SCORE"))));
  })()), React.createElement("div", { style: { marginBottom: 14 } }, React.createElement(Btn, { full: true, icon: "zap", onClick: () => nav("extprograma") }, "⚡ Gerar Programa de Treinamento")), a?.cardioMode && a.cardioMode !== "skip" && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 } }, React.createElement("div", { style: { fontWeight: 700 } }, "Avaliação Cardiorrespiratória"), React.createElement(Badge, { color: a.cardioMode === "ergo" ? "#16a34a" : "#d97706", bg: a.cardioMode === "ergo" ? "#dcfce7" : "#fef9c3" }, a.cardioMode === "ergo" ? "🟢 Teste Ergométrico" : "🟡 Predição Clínica")), a.cardioMode === "ergo" && a.cardioAssessment?.ergo && (() => {
    const e = a.cardioAssessment.ergo;
    const vo2 = e.vo2max || (e.mets ? (parseFloat(e.mets) * 3.5).toFixed(1) : null);
    const vo2cl = vo2 ? classifyVO2(vo2, calcAge(st?.dob), sex) : null;
    const fcMax = parseFloat(e.fcMax), fcRest = parseFloat(e.fcRest);
    const fcRes = fcMax && fcRest ? fcMax - fcRest : null;
    const dp = fcMax && e.pasPeak ? Math.round(fcMax * parseFloat(e.pasPeak)) : null;
    const metCl = metClass(e.mets);
    const hasBeta = e.medications?.includes("beta");
    const hasArr = e.arrythmias?.length > 0 && !e.arrythmias.includes("none");
    return React.createElement("div", null, React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 } }, [
      ["FC Rep.", e.fcRest, "bpm"],
      ["FC Máx.", e.fcMax, "bpm"],
      ["METs", e.mets, "METs"],
      ["PAS Rep.", e.pasSit, "mmHg"],
      ["PAS Pico", e.pasPeak, "mmHg"],
      ["FC Reserva", fcRes, fcRes ? "bpm" : null],
      ["Duplo Prod.", dp ? dp.toLocaleString("pt-BR") : null, dp ? "" : null],
      ["Limiar Isq.", e.fcIschemic ? e.fcIschemic + " bpm" : null, null],
      ["Zona Seg.", "< " + (e.fcIschemic ? parseFloat(e.fcIschemic) - 10 + " bpm" : null), e.fcIschemic ? null : null]
    ].filter(([, v]) => v).map(([k, v, u]) => React.createElement("div", { key: k, style: { background: "#f8fafc", borderRadius: 9, padding: "8px 10px" } }, React.createElement("div", { style: { fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" } }, k), React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#0f172a" } }, v, u ? " " + u : "")))), vo2 && React.createElement("div", { style: { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px", marginBottom: 10 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#16a34a" } }, "🫁 VO₂máx — ", e.vo2measured ? "Medido" : "Est. (METs×3.5)"), React.createElement("div", { style: { fontWeight: 900, fontSize: 18, color: "#16a34a" } }, parseFloat(vo2).toFixed(1), " ", React.createElement("span", { style: { fontSize: 10 } }, "ml/kg/min"))), vo2cl && React.createElement(TestResult, { cl: vo2cl }), metCl && React.createElement("div", { style: { marginTop: 6 } }, React.createElement(TestResult, { cl: metCl }))), fcMax > 0 && React.createElement("div", { style: { marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#475569", marginBottom: 6 } }, "🏃 Zonas de Treinamento Aeróbio"), hasBeta && React.createElement("div", { style: { background: "#eef2ff", borderRadius: 8, padding: "7px 10px", marginBottom: 8, fontSize: 11, fontWeight: 700, color: "#6366f1" } }, "💊 Beta-bloqueador: priorizar PSE/Borg"), React.createElement("div", { style: { overflowX: "auto" } }, React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 11 } }, React.createElement("thead", null, React.createElement("tr", { style: { background: "#f8fafc" } }, ["Int.", fcRes ? "FC Karvonen" : null, "%FCmáx", "PSE (0–10)", "Zona"].filter(Boolean).map((h) => React.createElement("th", { key: h, style: { padding: "6px 8px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "1.5px solid #e2e8f0" } }, h)))), React.createElement("tbody", null, [0.4, 0.5, 0.6, 0.7, 0.8].map((p) => {
      const karv = fcRes ? Math.round(fcRes * p + fcRest) : null;
      const pctFc = Math.round(fcMax * p);
      const safe = e.fcIschemic ? (karv || pctFc) < parseFloat(e.fcIschemic) - 10 : true;
      const borg = p <= 0.5 ? "2–3" : p <= 0.6 ? "4–5" : p <= 0.7 ? "5–6" : "6–7";
      const zona = p <= 0.5 ? "Leve" : p <= 0.6 ? "Moderada" : p <= 0.7 ? "Mod-Vig." : "Vigorosa";
      const cor = safe ? "#16a34a" : "#dc2626";
      return React.createElement("tr", { key: p, style: { borderBottom: "1px solid #f1f5f9", opacity: safe ? 1 : 0.5 } }, React.createElement("td", { style: { padding: "6px 8px", fontWeight: 800, color: cor } }, Math.round(p * 100), "%"), fcRes && React.createElement("td", { style: { padding: "6px 8px", fontWeight: 800, color: cor } }, karv, " bpm", !safe ? " ⚠️" : ""), React.createElement("td", { style: { padding: "6px 8px", color: "#475569" } }, pctFc, " bpm"), React.createElement("td", { style: { padding: "6px 8px", color: "#64748b" } }, borg), React.createElement("td", { style: { padding: "6px 8px" } }, React.createElement("span", { style: { background: cor + "18", color: cor, padding: "2px 7px", borderRadius: 99, fontSize: 11, fontWeight: 700 } }, safe ? zona : "Restrita")));
    }))))), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 } }, hasBeta && React.createElement(Badge, { color: "#6366f1", bg: "#eef2ff" }, "💊 Beta-bloqueador"), hasArr && React.createElement(Badge, { color: "#dc2626", bg: "#fee2e2" }, "⚠️ Arritmia"), e.symptomType && e.symptomType !== "" && React.createElement(Badge, { color: "#ea580c", bg: "#ffedd5" }, "🚩 ", { chest: "Dor torácica", dyspnea: "Dispneia", fatigue: "Fadiga", dizziness: "Tontura", palp: "Palpitação", other: "Outro" }[e.symptomType])), e.ecgObs && React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 8 } }, "📋 ECG: ", e.ecgObs));
  })(), a.cardioMode === "pred" && a.cardioAssessment?.pred && (() => {
    const p = a.cardioAssessment.pred;
    const age3 = parseFloat(p.age || calcAge(st?.dob));
    const fcMax2 = p.formula === "tanaka" ? Math.round(208 - 0.7 * age3) : 220 - age3;
    const fcRes2 = p.fcRest ? fcMax2 - parseFloat(p.fcRest) : null;
    const risk = riskStratify(p);
    const hasBeta2 = p.medications?.includes("beta");
    return React.createElement("div", null, React.createElement("div", { style: { background: risk.bg, border: "1.5px solid " + risk.color + "33", borderRadius: 10, padding: "12px", marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 15, color: risk.color, marginBottom: 4 } }, risk.label), React.createElement("div", { style: { fontSize: 12, color: "#334155" } }, "Zona: ", React.createElement("strong", null, risk.fcr), " · Borg: ", React.createElement("strong", null, risk.borg)), risk.alert && React.createElement("div", { style: { fontSize: 11, color: risk.color, fontWeight: 700, marginTop: 4 } }, "⚠️ ", risk.alert)), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 } }, React.createElement("div", { style: { background: "#f8fafc", borderRadius: 9, padding: "10px" } }, React.createElement("div", { style: { fontSize: 9, color: "#94a3b8", fontWeight: 700 } }, "FCmáx EST. (", p.formula === "tanaka" ? "Tanaka" : "Trad.", ")"), React.createElement("div", { style: { fontSize: 20, fontWeight: 900, color: "#FF5603" } }, fcMax2, " bpm")), fcRes2 && React.createElement("div", { style: { background: "#f8fafc", borderRadius: 9, padding: "10px" } }, React.createElement("div", { style: { fontSize: 9, color: "#94a3b8", fontWeight: 700 } }, "FC RESERVA EST."), React.createElement("div", { style: { fontSize: 20, fontWeight: 900, color: "#6366f1" } }, fcRes2, " bpm"))), hasBeta2 && React.createElement("div", { style: { background: "#eef2ff", borderRadius: 9, padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "#6366f1", marginBottom: 10 } }, "💊 Beta-bloqueador: usar PSE/Borg como guia"), React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#475569", marginBottom: 6 } }, "🏃 Zonas Estimadas"), React.createElement("div", { style: { overflowX: "auto" } }, React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 11 } }, React.createElement("thead", null, React.createElement("tr", { style: { background: "#f8fafc" } }, ["Int.", fcRes2 ? "FC Karvonen" : null, "%FCmáx", "PSE (0–10)", "Zona"].filter(Boolean).map((h) => React.createElement("th", { key: h, style: { padding: "6px 8px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "1.5px solid #e2e8f0" } }, h)))), React.createElement("tbody", null, [0.4, 0.5, 0.6, 0.7, 0.8].map((p2) => {
      const karv2 = fcRes2 ? Math.round(fcRes2 * p2 + parseFloat(p.fcRest)) : null;
      const pctFc2 = Math.round(fcMax2 * p2);
      const borg2 = p2 <= 0.5 ? "2–3" : p2 <= 0.6 ? "4–5" : p2 <= 0.7 ? "5–6" : "6–7";
      const zona2 = p2 <= 0.5 ? "Leve" : p2 <= 0.6 ? "Moderada" : p2 <= 0.7 ? "Mod-Vig." : "Vigorosa";
      return React.createElement("tr", { key: p2, style: { borderBottom: "1px solid #f1f5f9" } }, React.createElement("td", { style: { padding: "6px 8px", fontWeight: 800, color: "#16a34a" } }, Math.round(p2 * 100), "%"), fcRes2 && React.createElement("td", { style: { padding: "6px 8px", fontWeight: 800, color: "#16a34a" } }, karv2, " bpm"), React.createElement("td", { style: { padding: "6px 8px", color: "#475569" } }, pctFc2, " bpm"), React.createElement("td", { style: { padding: "6px 8px", color: "#64748b" } }, borg2), React.createElement("td", { style: { padding: "6px 8px" } }, React.createElement("span", { style: { background: "#16a34a18", color: "#16a34a", padding: "2px 7px", borderRadius: 99, fontSize: 11, fontWeight: 700 } }, zona2)));
    })))));
  })())));
};
const AssessmentsList = ({ assessments, students, setAssessments, nav }) => {
  const [filter, setFilter] = useState("");
  const del = async (id) => {
    const av = assessments.find((a) => a.id === id);
    const nm = av && (students.find((s) => s.id === av.studentId) || {}).name;
    if (!window.confirm("Excluir a avaliação" + (nm ? " de " + nm : "") + (av && av.date ? " (" + fmt(av.date) + ")" : "") + "? Não dá para desfazer.")) return;
    const ok = await DB.remove("assessments", id);
    if (ok) setAssessments((p) => p.filter((a) => a.id !== id));
    else alert("Não consegui excluir a avaliação. Confira a conexão e tente de novo.");
  };
  const sorted = [...assessments].filter((a) => {
    const st = students.find((s) => s.id === a.studentId);
    return !filter || st?.name?.toLowerCase().includes(filter.toLowerCase());
  }).sort((a, b) => b.date?.localeCompare(a.date));
  return React.createElement("div", null, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 20 } }, "Avaliações"), React.createElement(Btn, { sm: true, icon: "plus", onClick: () => nav("newAssessment") }, "Nova")), React.createElement("input", { value: filter, onChange: (e) => setFilter(e.target.value), placeholder: "Filtrar por aluno...", style: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, boxSizing: "border-box", marginBottom: 14 } }), sorted.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 40 } }, React.createElement(I, { n: "clip", c: "#cbd5e1", s: 36 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhuma avaliação ainda."), React.createElement("div", { style: { marginTop: 14 } }, React.createElement(Btn, { icon: "plus", onClick: () => nav("newAssessment") }, "Nova Avaliação"))) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, sorted.map((a) => {
    const st = students.find((s) => s.id === a.studentId);
    const gc = classifyGlobal(a.globalScore || 0);
    const ahaCl = classifyAHA(a.aha?.score || 0);
    return React.createElement(Card, { key: a.id, style: { padding: "14px 16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, React.createElement("div", { style: { width: 42, height: 42, borderRadius: 11, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: O, flexShrink: 0 } }, st?.name?.[0]), React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 15 } }, st?.name || "Aluno"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 5 } }, fmt(a.date)), React.createElement("div", { style: { display: "flex", gap: 5, flexWrap: "wrap" } }, a.globalScore > 0 && React.createElement(Badge, { color: gc.color, bg: gc.bg }, "Global: ", a.globalScore), React.createElement(Badge, { color: ahaCl.color, bg: ahaCl.bg }, ahaCl.label))), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, React.createElement(Btn, { sm: true, variant: "ghost", icon: "eye", onClick: () => nav("result", { id: a.id }) }, "Ver"), React.createElement(Btn, { sm: true, variant: "ghost", icon: "trash", onClick: () => del(a.id), style: { color: "#dc2626" } }))));
  })));
};
const emptyMoment = () => ({ pas: "", pad: "", fc: "", spo2: "", glycemia: "", pse: "" });
const dpClassify = (dp) => {
  if (!dp) return null;
  if (dp < 2e4) return { label: "Normal", c: "#16a34a", bg: "#dcfce7" };
  if (dp < 28e3) return { label: "Atenção", c: "#d97706", bg: "#fef9c3" };
  return { label: "Alto — Interromper", c: "#dc2626", bg: "#fee2e2" };
};
const bpStatus = (s, d) => {
  const sp = parseFloat(s), dp = parseFloat(d);
  if (!sp || !dp) return null;
  if (sp >= 160 || dp >= 100) return { label: "HAS Grau 2", c: "#dc2626" };
  if (sp >= 140 || dp >= 90) return { label: "HAS Grau 1", c: "#ea580c" };
  if (sp >= 130 || dp >= 80) return { label: "Pré-hipertensão", c: "#d97706" };
  if (sp < 90) return { label: "Hipotensão", c: "#6366f1" };
  return { label: "Normal", c: "#16a34a" };
};
const classifyPSE = (v) => {
  const n = parseInt(v);
  if (isNaN(n)) return null;
  if (n <= 1) return { label: "Repouso / Muito Leve", color: "#16a34a", bg: "#dcfce7", rec: "Abaixo da zona terapêutica." };
  if (n <= 2) return { label: "Muito Leve", color: "#16a34a", bg: "#dcfce7", rec: "Intensidade muito baixa. Boa para aquecimento e recuperação." };
  if (n <= 4) return { label: "Leve", color: "#65a30d", bg: "#ecfccb", rec: "Zona aeróbica leve. Ideal para iniciantes e alto risco cardiovascular." };
  if (n <= 6) return { label: "Moderado", color: "#d97706", bg: "#fef9c3", rec: "Zona aeróbica ideal para 50+. Conversa possível com esforço." };
  if (n <= 8) return { label: "Intenso", color: "#ea580c", bg: "#ffedd5", rec: "Alta intensidade. Monitorar sinais e sintomas continuamente." };
  return { label: "Muito Intenso / Máximo", color: "#dc2626", bg: "#fee2e2", rec: "Zona de risco. Reduzir intensidade imediatamente." };
};
const MomentBlock = ({ title, color, data, onChange, showDP }) => {
  const dp = showDP && data.pas && data.fc ? Math.round(parseFloat(data.pas) * parseFloat(data.fc)) : null;
  const dpCl = dpClassify(dp);
  return React.createElement("div", { style: { border: `1.5px solid ${color}33`, borderRadius: 12, padding: 14, marginBottom: 14 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 } }, React.createElement("div", { style: { width: 10, height: 10, borderRadius: 99, background: color } }), React.createElement("span", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a" } }, title), dp && dpCl && React.createElement(Badge, { color: dpCl.c, bg: dpCl.bg }, "DP: ", dp.toLocaleString("pt-BR"))), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 } }, React.createElement(Inp, { label: "PAS (mmHg)", type: "number", value: data.pas, onChange: (v) => onChange({ ...data, pas: v }), placeholder: "120" }), React.createElement(Inp, { label: "PAD (mmHg)", type: "number", value: data.pad, onChange: (v) => onChange({ ...data, pad: v }), placeholder: "80" }), React.createElement(Inp, { label: "FC (bpm)", type: "number", value: data.fc, onChange: (v) => onChange({ ...data, fc: v }), placeholder: "70" })), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, React.createElement(Inp, { label: "SpO₂ (%)", type: "number", value: data.spo2, onChange: (v) => onChange({ ...data, spo2: v }), placeholder: "98" }), React.createElement(Inp, { label: "Glicemia (mg/dL)", type: "number", value: data.glycemia, onChange: (v) => onChange({ ...data, glycemia: v }), placeholder: "100" })), React.createElement("div", { style: { marginTop: 10 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 } }, "PSE — Percepção Subjetiva de Esforço (0–10)"), React.createElement("div", { style: { display: "flex", gap: 4, marginBottom: 6 } }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
    const cl = classifyPSE(n);
    const sel = data.pse === String(n) || data.pse === n;
    return React.createElement(
      "button",
      {
        key: n,
        onClick: () => onChange({ ...data, pse: String(n) }),
        style: {
          flex: 1,
          padding: "8px 0",
          borderRadius: 7,
          border: "1.5px solid",
          borderColor: sel ? cl?.color || "#FF5603" : "#e2e8f0",
          background: sel ? cl?.bg || "#fff4ee" : "#f8fafc",
          color: sel ? cl?.color || "#FF5603" : "#94a3b8",
          fontWeight: sel ? 900 : 500,
          fontSize: 12,
          cursor: "pointer"
        }
      },
      n
    );
  })), data.pse !== "" && data.pse !== void 0 && (() => {
    const cl = classifyPSE(data.pse);
    return cl ? React.createElement("div", { style: { background: cl.bg, border: "1px solid " + cl.color + "33", borderRadius: 8, padding: "7px 10px", fontSize: 12 } }, React.createElement("span", { style: { fontWeight: 700, color: cl.color } }, cl.label), React.createElement("span", { style: { color: "#475569", marginLeft: 6 } }, cl.rec)) : null;
  })()));
};
const MomentCard = ({ label, color, m }) => {
  if (!m) return null;
  const hasData = m.pas || m.fc || m.spo2 || m.glycemia || m.pse !== void 0 && m.pse !== "";
  if (!hasData) return null;
  const dp = m.pas && m.fc ? Math.round(parseFloat(m.pas) * parseFloat(m.fc)) : null;
  const dpCl = dpClassify(dp);
  const bp = m.pas && m.pad ? bpStatus(m.pas, m.pad) : null;
  const spo2Low = m.spo2 && parseFloat(m.spo2) < 95;
  return React.createElement("div", { style: { borderLeft: `3px solid ${color}`, paddingLeft: 10, marginBottom: 10 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color, marginBottom: 6, textTransform: "uppercase" } }, label), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 4 } }, m.pas && m.pad && React.createElement(Met, { lbl: "PA", val: `${m.pas}/${m.pad}`, unit: "mmHg", c: "#6366f1" }), m.fc && React.createElement(Met, { lbl: "FC", val: m.fc, unit: "bpm", c: "#dc2626" }), m.spo2 && React.createElement(Met, { lbl: "SpO₂", val: m.spo2, unit: "%", c: spo2Low ? "#dc2626" : "#16a34a" }), m.glycemia && React.createElement(Met, { lbl: "Glicemia", val: m.glycemia, unit: "mg/dL", c: "#d97706" }), m.pse !== void 0 && m.pse !== "" && (() => {
    const cl = classifyPSE(m.pse);
    return cl ? React.createElement(Met, { lbl: "PSE", val: m.pse + " — " + cl.label, unit: "", c: cl.color }) : null;
  })(), m.weight && React.createElement(Met, { lbl: "Peso", val: m.weight, unit: "kg", c: "#64748b" }), m.temp && React.createElement(Met, { lbl: "Temp", val: m.temp, unit: "°C", c: "#ea580c" }), dp && React.createElement(Met, { lbl: "D.Produto", val: dp.toLocaleString("pt-BR"), unit: "mmHg·bpm", c: dpCl?.c || "#6366f1" })), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 5 } }, bp && React.createElement(Badge, { color: bp.c, bg: bp.c + "18" }, bp.label), spo2Low && React.createElement(Badge, { color: "#dc2626", bg: "#fee2e2" }, "SpO₂ ↓"), dp && dpCl && React.createElement(Badge, { color: dpCl.c, bg: dpCl.bg }, "DP ", dpCl.label)));
};
const VincularAlunos = ({ students, setStudents }) => {
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState({});
  const [savedId, setSavedId] = useState("");
  const [vinculados, setVinculados] = useState([]);
  const [pendencias, setPendencias] = useState([]);
  const [loadingPend, setLoadingPend] = useState(true);
  const [escolha, setEscolha] = useState({});
  const [busyUid, setBusyUid] = useState("");
  const [erro, setErro] = useState("");
  const carregarStatus = async () => {
    setLoadingPend(true);
    setErro("");
    try {
      const headers = await DB.authHeaders();
      const [rVinc, rPend] = await Promise.all([
        fetch(SUPA_URL + "/rest/v1/rpc/rpc_listar_vinculados", { method: "POST", headers, body: "{}" }),
        fetch(SUPA_URL + "/rest/v1/rpc/rpc_listar_pendencias", { method: "POST", headers, body: "{}" })
      ]);
      if (rVinc.ok) setVinculados((await rVinc.json()).map((r) => r.student_id));
      if (rPend.ok) setPendencias(await rPend.json());
      if (!rVinc.ok || !rPend.ok) setErro("Não consegui carregar o status de vínculo. Confira se o SQL de vínculo automático já foi rodado no Supabase.");
    } catch (e) {
      setErro("Não consegui carregar o status de vínculo. Confira se o SQL de vínculo automático já foi rodado no Supabase.");
    }
    setLoadingPend(false);
  };
  useEffect(() => {
    carregarStatus();
  }, []);
  const getEmail = (s) => drafts[s.id] !== void 0 ? drafts[s.id] : s.portalEmail || "";
  const setEmail = (id, v) => setDrafts((d) => ({ ...d, [id]: v }));
  const salvar = (s) => {
    const val = getEmail(s).trim().toLowerCase();
    setStudents((prev) => prev.map((x) => x.id === s.id ? { ...x, portalEmail: val } : x));
    setSavedId(s.id);
    setTimeout(() => setSavedId(""), 2e3);
  };
  const vincularManual = async (uid2) => {
    const studentId = escolha[uid2];
    if (!studentId) return;
    setBusyUid(uid2);
    setErro("");
    try {
      const headers = await DB.authHeaders();
      const r = await fetch(SUPA_URL + "/rest/v1/rpc/rpc_vincular_aluno_manual", {
        method: "POST",
        headers,
        body: JSON.stringify({ target_student_id: studentId, pending_user_id: uid2 })
      });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(t);
      }
      await carregarStatus();
    } catch (e) {
      setErro("Erro ao vincular: " + (e.message || e));
    }
    setBusyUid("");
  };
  const ignorarPendencia = async (uid2) => {
    setBusyUid(uid2);
    try {
      const headers = await DB.authHeaders();
      await fetch(SUPA_URL + "/rest/v1/rpc/rpc_ignorar_pendencia", {
        method: "POST",
        headers,
        body: JSON.stringify({ pending_user_id: uid2 })
      });
      await carregarStatus();
    } catch (e) {
    }
    setBusyUid("");
  };
  const alunosDisponiveis = students.filter((s) => !vinculados.includes(s.id));
  const filtered = students.filter((s) => (s.name || "").toLowerCase().includes(search.toLowerCase()));
  return React.createElement("div", null, React.createElement("div", { style: { fontWeight: 800, fontSize: 20, marginBottom: 6 } }, "🔗 Vincular Alunos ao Portal"), React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 1.5 } }, 'Digite o e-mail de cada aluno pra liberar o acesso dele ao "Meu Treino" (aluno.html). Quando ele criar a senha usando esse e-mail, o vínculo acontece sozinho.'), erro && React.createElement("div", { style: { background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 9, padding: "10px 12px", fontSize: 12, color: "#dc2626", marginBottom: 14 } }, erro), !loadingPend && pendencias.length > 0 && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#c2410c", textTransform: "uppercase", marginBottom: 10 } }, "⏳ Pendências de aprovação (", pendencias.length, ")"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, pendencias.map((p) => React.createElement(Card, { key: p.user_id, style: { padding: "14px 16px", border: "1.5px solid #fed7aa" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 2 } }, p.email), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 10 } }, "Criou login em ", new Date(p.created_at).toLocaleDateString("pt-BR"), " — não bateu com nenhum e-mail cadastrado."), React.createElement("div", { style: { display: "flex", gap: 8 } }, React.createElement("select", { value: escolha[p.user_id] || "", onChange: (e) => setEscolha((x) => ({ ...x, [p.user_id]: e.target.value })), style: { flex: 1, padding: "9px 10px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", background: "#fff" } }, React.createElement("option", { value: "" }, "Selecionar aluno..."), alunosDisponiveis.map((s) => React.createElement("option", { key: s.id, value: s.id }, s.name || "Aluno sem nome"))), React.createElement(Btn, { sm: true, onClick: () => vincularManual(p.user_id), disabled: !escolha[p.user_id] || busyUid === p.user_id }, busyUid === p.user_id ? "..." : "Vincular")), React.createElement("button", { onClick: () => ignorarPendencia(p.user_id), disabled: busyUid === p.user_id, style: { marginTop: 8, background: "none", border: "none", color: "#94a3b8", fontSize: 11, textDecoration: "underline", cursor: "pointer", padding: 0 } }, "Ignorar"))))), React.createElement("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Buscar aluno...", style: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 14, fontFamily: "inherit", marginBottom: 14, boxSizing: "border-box" } }), filtered.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 40 } }, React.createElement("div", { style: { color: "#94a3b8" } }, "Nenhum aluno encontrado.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, filtered.map((s) => {
    const changed = getEmail(s) !== (s.portalEmail || "");
    const vinculado = vinculados.includes(s.id);
    return React.createElement(Card, { key: s.id, style: { padding: "14px 16px" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 8 } }, s.name || "Aluno sem nome"), React.createElement("div", { style: { display: "flex", gap: 8 } }, React.createElement("input", { type: "email", value: getEmail(s), onChange: (e) => setEmail(s.id, e.target.value), placeholder: "email-do-aluno@exemplo.com", style: { flex: 1, padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" } }), React.createElement(Btn, { sm: true, onClick: () => salvar(s), disabled: !changed || !getEmail(s).trim() }, savedId === s.id ? "✓ Salvo" : "Salvar")), vinculado && React.createElement("div", { style: { fontSize: 11, color: "#16a34a", marginTop: 6 } }, "✅ Vinculado e ativo", getEmail(s) ? " — " + getEmail(s) : ""), !vinculado && s.portalEmail && !changed && React.createElement("div", { style: { fontSize: 11, color: "#d97706", marginTop: 6 } }, "🕒 E-mail cadastrado, aguardando o aluno criar a senha"), !vinculado && !s.portalEmail && React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 6 } }, "Ainda sem acesso ao portal."));
  })));
};
const Documents = ({ students, documents, setDocuments, prefillStudentId }) => {
  const [selSt, setSelSt] = useState(prefillStudentId || "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef(null);
  const [analyzing, setAnalyzing] = useState(null);
  const [modal, setModal] = useState(false);
  const [docForm, setDocForm] = useState({ type: "", label: "", notes: "" });
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [error, setError] = useState("");
  const stDocs = documents.filter((d) => d.studentId === selSt).sort((a, b) => b.date?.localeCompare(a.date));
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo 5MB.");
      return;
    }
    setError("");
    setFileName(file.name);
    setFileType(file.type);
    const reader = new FileReader();
    reader.onload = (ev) => setFileData(ev.target.result);
    reader.readAsDataURL(file);
  };
  const saveDoc = () => {
    if (!selSt || !fileData) return;
    const doc = {
      id: uid(),
      studentId: selSt,
      date: todayStr(),
      label: docForm.label || fileName,
      type: docForm.type || "outro",
      notes: docForm.notes,
      fileName,
      fileType,
      fileData,
      aiAnalysis: ""
    };
    setDocuments((p) => [...p, doc]);
    setModal(false);
    setFileData(null);
    setFileName("");
    setFileType("");
    setDocForm({ type: "", label: "", notes: "" });
  };
  const analyzeDoc = async (doc) => {
    setAnalyzing(doc.id);
    setError("");
    try {
      const st = students.find((s) => s.id === doc.studentId);
      const nome = st?.name || "o aluno";
      const age = calcAge(st?.dob);
      const sex = st?.sex === "M" ? "masculino" : "feminino";
      const isImage = doc.fileType && doc.fileType.startsWith("image/");
      const isPDF = doc.fileType === "application/pdf";
      const base64Data = doc.fileData ? doc.fileData.split(",")[1] : null;
      const systemPrompt = "Voce e um assistente clinico especializado em saude e educacao fisica para adultos 50+. Analise o documento de " + nome + ", " + age + " anos, sexo " + sex + ". Tipo: " + (doc.label || doc.type || "documento") + ". Retorne SOMENTE JSON valido sem markdown com estes campos: resumo (2-3 frases), valoresAlterados (array de alteracoes com referencia), diagnosticos (array), medicamentos (array), fatoresRisco (array), contraindicacoes (array de restricoes para exercicio), cuidadosExercicio (array de cuidados para prescricao), intensidadeRecomendada (baixa/moderada/alta), monitoramentoEspecial (array de parametros a monitorar), analiseCompleta (texto clinico detalhado). Use aspas duplas no JSON. Escreva em portugues do Brasil.";
      let messages = [];
      if (base64Data && (isImage || isPDF)) {
        const mediaType = isPDF ? "application/pdf" : doc.fileType;
        messages = [{ role: "user", content: [
          { type: isPDF ? "document" : "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
          { type: "text", text: systemPrompt }
        ] }];
      } else {
        messages = [{ role: "user", content: systemPrompt }];
      }
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2e3, messages })
      });
      if (!res.ok) throw new Error("API error " + res.status);
      const data = await res.json();
      const rawText = data.content?.map((i) => i.text || "").join("") || "";
      let structured = null;
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) structured = JSON.parse(jsonMatch[0]);
      } catch (e) {
        structured = null;
      }
      if (structured) {
        setDocuments((prev) => prev.map((d) => d.id === doc.id ? {
          ...d,
          aiAnalysis: structured.analiseCompleta || rawText,
          aiStructured: structured
        } : d));
      } else {
        setDocuments((prev) => prev.map((d) => d.id === doc.id ? { ...d, aiAnalysis: rawText } : d));
      }
    } catch (e) {
      const st2 = students.find((s) => s.id === doc.studentId);
      const fallback = generateDocAnalysis(doc, st2);
      setDocuments((prev) => prev.map((d) => d.id === doc.id ? { ...d, aiAnalysis: fallback } : d));
    }
    setAnalyzing(null);
  };
  const delDoc = (id) => {
    if (window.confirm("Remover documento?")) setDocuments((p) => p.filter((d) => d.id !== id));
  };
  const docTypes = [
    { v: "exame_lab", l: "🧪 Exame Laboratorial" },
    { v: "laudo_medico", l: "📋 Laudo Médico" },
    { v: "ecg", l: "❤️ ECG / Eletrocardiograma" },
    { v: "imagem", l: "🩻 Imagem (Raio-X, Densitometria)" },
    { v: "receita", l: "💊 Receita / Prescrição" },
    { v: "outro", l: "📎 Outro" }
  ];
  return React.createElement("div", null, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 20 } }, "Documentos"), selSt && React.createElement(Btn, { sm: true, icon: "plus", onClick: () => {
    setModal(true);
    setError("");
  } }, "Anexar")), React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement(
    Inp,
    {
      label: "Selecionar Aluno",
      value: selSt,
      onChange: setSelSt,
      opts: [{ v: "", l: "Selecione o aluno..." }, ...students.map((s) => ({ v: s.id, l: s.name }))]
    }
  )), selSt && React.createElement(React.Fragment, null, stDocs.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 40 } }, React.createElement("div", { style: { fontSize: 32, marginBottom: 8 } }, "📎"), React.createElement("div", { style: { color: "#94a3b8", marginBottom: 14 } }, "Nenhum documento anexado ainda."), React.createElement(Btn, { icon: "plus", onClick: () => setModal(true) }, "Anexar Documento")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, stDocs.map((doc) => {
    const typeInfo = docTypes.find((t) => t.v === doc.type);
    return React.createElement(Card, { key: doc.id, style: { padding: "14px 16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 } }, React.createElement("div", { style: { flex: 1 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 } }, React.createElement("span", { style: { fontSize: 18 } }, typeInfo?.l?.split(" ")[0] || "📎"), React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a" } }, doc.label || doc.fileName), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, fmt(doc.date), " · ", doc.fileName))), doc.notes && React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginBottom: 8 } }, "📝 ", doc.notes), doc.aiAnalysis ? React.createElement("details", null, React.createElement("summary", { style: { fontSize: 12, fontWeight: 700, color: "#6366f1", cursor: "pointer", marginBottom: 4 } }, "🤖 Ver análise IA"), React.createElement("div", { style: { marginTop: 8 } }, doc.aiStructured && React.createElement(React.Fragment, null, doc.aiStructured.resumo && React.createElement("div", { style: { background: "#eef2ff", borderRadius: 9, padding: "10px 12px", fontSize: 12, color: "#334155", marginBottom: 8, lineHeight: 1.5 } }, React.createElement("strong", null, "📋 Resumo:"), " ", doc.aiStructured.resumo), doc.aiStructured.valoresAlterados?.length > 0 && React.createElement("div", { style: { marginBottom: 8 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#dc2626", marginBottom: 4 } }, "⚠️ Valores Alterados"), doc.aiStructured.valoresAlterados.map((v, i) => React.createElement("div", { key: i, style: { background: "#fee2e2", borderRadius: 7, padding: "5px 10px", fontSize: 11, color: "#dc2626", marginBottom: 3 } }, "• ", v))), doc.aiStructured.cuidadosExercicio?.length > 0 && React.createElement("div", { style: { marginBottom: 8 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#FF5603", marginBottom: 4 } }, "🏋️ Cuidados para o Exercício"), doc.aiStructured.cuidadosExercicio.map((v, i) => React.createElement("div", { key: i, style: { background: "#fff4ee", borderRadius: 7, padding: "5px 10px", fontSize: 11, color: "#FF5603", marginBottom: 3 } }, "• ", v))), doc.aiStructured.monitoramentoEspecial?.length > 0 && React.createElement("div", { style: { marginBottom: 8 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#6366f1", marginBottom: 4 } }, "📊 Monitoramento Especial"), doc.aiStructured.monitoramentoEspecial.map((v, i) => React.createElement("div", { key: i, style: { background: "#eef2ff", borderRadius: 7, padding: "5px 10px", fontSize: 11, color: "#6366f1", marginBottom: 3 } }, "• ", v))), doc.aiStructured.contraindicacoes?.length > 0 && React.createElement("div", { style: { marginBottom: 8 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#dc2626", marginBottom: 4 } }, "🚫 Contraindicações"), doc.aiStructured.contraindicacoes.map((v, i) => React.createElement("div", { key: i, style: { background: "#fee2e2", borderRadius: 7, padding: "5px 10px", fontSize: 11, color: "#dc2626", marginBottom: 3 } }, "• ", v))), React.createElement("details", null, React.createElement("summary", { style: { fontSize: 11, color: "#94a3b8", cursor: "pointer" } }, "Ver análise completa"), React.createElement("div", { style: { background: "#f8fafc", borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "#334155", lineHeight: 1.6, whiteSpace: "pre-wrap", marginTop: 6 } }, doc.aiAnalysis))), !doc.aiStructured && React.createElement("div", { style: { background: "#eef2ff", borderRadius: 9, padding: "10px 12px", fontSize: 12, color: "#334155", lineHeight: 1.6, whiteSpace: "pre-wrap" } }, doc.aiAnalysis))) : React.createElement(Btn, { sm: true, variant: "outline", onClick: () => analyzeDoc(doc), disabled: analyzing === doc.id, style: { borderColor: "#6366f1", color: "#6366f1" } }, analyzing === doc.id ? "⏳ Lendo documento..." : doc.aiAnalysis ? "🔄 Reanalisar" : "🤖 Ler e Analisar com IA")), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, doc.fileData && React.createElement("a", { href: doc.fileData, download: doc.fileName, style: { background: "#f1f5f9", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, color: "#334155", textDecoration: "none" } }, "⬇️"), React.createElement("button", { onClick: () => delDoc(doc.id), style: { background: "none", border: "none", cursor: "pointer", color: "#fca5a5", padding: 4 } }, React.createElement(I, { n: "trash", s: 15 })))));
  }))), modal && React.createElement(Modal, { title: "Anexar Documento", onClose: () => setModal(false) }, React.createElement(
    Inp,
    {
      label: "Tipo de documento",
      value: docForm.type,
      onChange: (v) => setDocForm((f) => ({ ...f, type: v })),
      opts: [{ v: "", l: "Selecione..." }, ...docTypes]
    }
  ), React.createElement(Inp, { label: "Nome / Descrição", value: docForm.label, onChange: (v) => setDocForm((f) => ({ ...f, label: v })), placeholder: "Ex: Hemograma completo - jan/2026" }), React.createElement("div", { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 } }, "Arquivo (PDF, imagem, até 5MB)"), React.createElement(
    "input",
    {
      ref: fileInputRef,
      type: "file",
      accept: ".pdf,.jpg,.jpeg,.png,.gif,.webp",
      onChange: handleFile,
      style: { display: "none" }
    }
  ), fileData ? React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 11, border: "2px solid #16a34a", background: "#f0fdf4" } }, React.createElement("span", { style: { fontSize: 22 } }, "✅"), React.createElement("div", { style: { flex: 1 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#16a34a" } }, fileName), React.createElement("div", { style: { fontSize: 11, color: "#64748b" } }, "Arquivo selecionado")), React.createElement("button", { onClick: () => {
    setFileData(null);
    setFileName("");
    setFileType("");
  }, style: { background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 4, fontSize: 18 } }, "✕")) : React.createElement(
    "button",
    {
      onClick: () => fileInputRef.current && fileInputRef.current.click(),
      style: { width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "22px", borderRadius: 11, border: "2px dashed #e2e8f0", background: "#f8fafc", cursor: "pointer" }
    },
    React.createElement("span", { style: { fontSize: 28 } }, "📎"),
    React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: "#64748b" } }, "Toque para selecionar arquivo"),
    React.createElement("span", { style: { fontSize: 11, color: "#94a3b8" } }, "PDF, JPG, PNG — máx. 5MB")
  ), error && React.createElement("div", { style: { color: "#dc2626", fontSize: 12, marginTop: 6 } }, error)), React.createElement(Inp, { label: "Observações", value: docForm.notes, onChange: (v) => setDocForm((f) => ({ ...f, notes: v })), placeholder: "Contexto, data do exame, médico responsável..." }), React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 8 } }, React.createElement(Btn, { variant: "secondary", full: true, onClick: () => setModal(false) }, "Cancelar"), React.createElement(Btn, { full: true, disabled: !fileData, onClick: saveDoc }, "Salvar"))));
};
const generateDocAnalysis = (doc, student) => {
  const nome = student?.name || "o aluno";
  const age = calcAge(student?.dob);
  const sex = student?.sex === "M" ? "masculino" : "feminino";
  const NL = "\n";
  const tipo = doc.type;
  const label = doc.label || doc.fileName;
  const lines = [
    "ANÁLISE DO DOCUMENTO — " + label.toUpperCase(),
    "Aluno: " + nome + " | " + age + " anos | Sexo: " + sex,
    "Data do registro: " + fmt(doc.date),
    ""
  ];
  if (tipo === "exame_lab") {
    lines.push("ORIENTAÇÕES PARA EXAMES LABORATORIAIS");
    lines.push("Para interpretar os resultados laboratoriais, compare os valores com as referências normais do laboratório (indicadas no próprio laudo). Os parâmetros mais relevantes para a prescrição de exercício físico incluem:");
    lines.push("");
    lines.push("• Glicemia em jejum: normal < 100 mg/dL. Entre 100-125 = pré-diabetes (exercício aeróbico especialmente indicado). ≥ 126 = diabetes (monitorar durante exercício, ACSM).");
    lines.push("• Hemoglobina/Hematócrito: anemia compromete capacidade aeróbica — reduzir intensidade e monitorar fadiga.");
    lines.push("• Colesterol total/LDL/HDL/Triglicérides: dislipidemia é fator de risco AHA. Exercício aeróbico regular eleva HDL e reduz triglicérides.");
    lines.push("• Creatinina/Ureia: alterações renais podem limitar exercícios de alta intensidade.");
    lines.push("• TSH/T4: hipotireoidismo reduz tolerância ao exercício; hipertireoidismo aumenta FC basal.");
    lines.push("");
    lines.push("RECOMENDAÇÃO: Registre os valores numéricos encontrados no exame na observação do aluno e consulte o médico responsável para liberação em casos alterados.");
  } else if (tipo === "ecg") {
    lines.push("ORIENTAÇÕES PARA ECG");
    lines.push("O eletrocardiograma em repouso fornece informações essenciais para a prescrição segura do exercício:");
    lines.push("");
    lines.push("• Ritmo sinusal: normal. Indica ausência de arritmias significativas em repouso.");
    lines.push("• Frequência cardíaca de repouso: valores > 100 bpm (taquicardia) ou < 60 bpm (bradicardia) merecem atenção médica.");
    lines.push("• Alterações de ST/T: podem indicar isquemia miocárdica — contraindicação relativa para exercício de alta intensidade até avaliação médica.");
    lines.push("• Bloqueios de ramo: consultar cardiologista antes de exercícios de alta intensidade.");
    lines.push("• Hipertrofia ventricular esquerda: comum em hipertensos — monitorar PA durante o exercício.");
    lines.push("");
    lines.push("RECOMENDAÇÃO: Encaminhar ao cardiologista se houver alterações. Manter o laudo no prontuário do aluno.");
  } else if (tipo === "imagem") {
    lines.push("ORIENTAÇÕES PARA EXAMES DE IMAGEM");
    lines.push("Exames de imagem (densitometria, raio-X, ressonância) fornecem informações sobre a estrutura musculoesquelética:");
    lines.push("");
    lines.push("• Densitometria óssea (DEXA): T-score ≥ -1,0 = normal. Entre -1,0 e -2,5 = osteopenia. ≤ -2,5 = osteoporose. Exercícios de impacto e resistência são indicados para osteopenia/osteoporose com supervisão.");
    lines.push("• Raio-X de coluna/articulações: identificar artrose, espondilose, escoliose — adaptar exercícios para evitar sobrecarga articular.");
    lines.push("• Composição corporal (DEXA): índice de massa magra abaixo do normal confirma sarcopenia — treino de força é prioridade.");
    lines.push("");
    lines.push("RECOMENDAÇÃO: Adaptar o programa de exercícios conforme os achados. Exercícios de impacto devem ser avaliados individualmente.");
  } else if (tipo === "laudo_medico") {
    lines.push("ORIENTAÇÕES PARA LAUDO MÉDICO");
    lines.push("Laudos e pareceres médicos devem ser lidos integralmente. Atenção especial a:");
    lines.push("");
    lines.push("• Liberação ou restrição para atividade física: respeitar rigorosamente as indicações do médico responsável.");
    lines.push("• Diagnósticos mencionados: registrar na anamnese e considerar nas limitações do programa.");
    lines.push("• Medicamentos prescritos: beta-bloqueadores alteram a FC (não usar FC como único parâmetro de intensidade), diuréticos aumentam risco de desidratação, estatinas podem causar mialgia.");
    lines.push("• Recomendações específicas: seguir orientações do especialista para adaptação do programa.");
    lines.push("");
    lines.push("RECOMENDAÇÃO: Em caso de dúvida sobre a liberação para exercício, contatar o médico antes de iniciar ou progredir o programa.");
  } else {
    lines.push("DOCUMENTO REGISTRADO");
    lines.push("Documento anexado ao prontuário digital de " + nome + ".");
    lines.push("");
    lines.push("Para análise específica, selecione o tipo correto do documento (Exame Laboratorial, ECG, Imagem ou Laudo Médico) ao anexar.");
    lines.push("");
    lines.push("RECOMENDAÇÃO: Revisar o documento com atenção e registrar na anamnese as informações relevantes para a prescrição do exercício físico.");
  }
  if (doc.notes) {
    lines.push("");
    lines.push("OBSERVAÇÕES REGISTRADAS: " + doc.notes);
  }
  return lines.join(NL);
};
const calcKarvonen = (fcMax, fcRest, pct) => Math.round((fcMax - fcRest) * pct + fcRest);
const calcPctFcMax = (fcMax, pct) => Math.round(fcMax * pct);
const calcDP = (fc, pas) => fc && pas ? Math.round(parseFloat(fc) * parseFloat(pas)) : null;
const metClass = (v) => {
  const n = parseFloat(v);
  if (!n) return null;
  if (n < 5) return { label: "Baixa (<5 METs)", color: "#dc2626", bg: "#fee2e2" };
  if (n < 7) return { label: "Moderada (5–7 METs)", color: "#d97706", bg: "#fef9c3" };
  if (n < 10) return { label: "Boa (7–10 METs)", color: "#65a30d", bg: "#ecfccb" };
  return { label: "Muito boa (>10 METs)", color: "#16a34a", bg: "#dcfce7" };
};
const riskStratify = (fields) => {
  const { cardioDisease, symptoms, hypertension, diabetes, obesity, sedentary } = fields;
  if (cardioDisease || symptoms) return {
    level: "high",
    label: "Alto Risco",
    color: "#dc2626",
    bg: "#fee2e2",
    fcr: "40–60% FCR",
    borg: "2–3",
    alert: "Considerar avaliação médica e/ou teste ergométrico antes de progredir."
  };
  if (hypertension || diabetes || obesity || sedentary) return {
    level: "moderate",
    label: "Risco Moderado",
    color: "#d97706",
    bg: "#fef9c3",
    fcr: "50–70% FCR",
    borg: "3–5",
    alert: ""
  };
  return {
    level: "low",
    label: "Baixo Risco",
    color: "#16a34a",
    bg: "#dcfce7",
    fcr: "60–80% FCR",
    borg: "5–6",
    alert: ""
  };
};
const ZoneTable = ({ fcMax, fcRest, ischemicFC, betaBlocker }) => {
  if (!fcMax) return null;
  const hasRest = !!fcRest;
  const pcts = [0.4, 0.5, 0.6, 0.7, 0.8];
  const safe = ischemicFC ? parseFloat(ischemicFC) - 10 : null;
  return React.createElement("div", { style: { overflowX: "auto", marginTop: 12 } }, ischemicFC && React.createElement("div", { style: { background: "#fef9c3", border: "1.5px solid #fde68a", borderRadius: 9, padding: "8px 12px", marginBottom: 10, fontSize: 12, fontWeight: 700, color: "#d97706" } }, "🎯 Zona segura sugerida: FC abaixo de ", safe, " bpm (10 bpm abaixo do limiar isquêmico)"), betaBlocker && React.createElement("div", { style: { background: "#eef2ff", border: "1.5px solid #c7d2fe", borderRadius: 9, padding: "8px 12px", marginBottom: 10, fontSize: 12, fontWeight: 700, color: "#6366f1" } }, "💊 Beta-bloqueador: resposta cronotrópica reduzida. Priorizar Borg/PSE + sintomas, não apenas FC."), React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 } }, React.createElement("thead", null, React.createElement("tr", { style: { background: "#f8fafc" } }, React.createElement("th", { style: { padding: "8px 10px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "2px solid #e2e8f0" } }, "Intensidade"), hasRest && React.createElement("th", { style: { padding: "8px 10px", textAlign: "center", fontWeight: 700, color: "#475569", borderBottom: "2px solid #e2e8f0" } }, "FC Karvonen"), React.createElement("th", { style: { padding: "8px 10px", textAlign: "center", fontWeight: 700, color: "#475569", borderBottom: "2px solid #e2e8f0" } }, "%FCmáx"), React.createElement("th", { style: { padding: "8px 10px", textAlign: "center", fontWeight: 700, color: "#475569", borderBottom: "2px solid #e2e8f0" } }, "Borg"), React.createElement("th", { style: { padding: "8px 10px", textAlign: "center", fontWeight: 700, color: "#475569", borderBottom: "2px solid #e2e8f0" } }, "Zona"))), React.createElement("tbody", null, pcts.map((p) => {
    const karv = hasRest ? calcKarvonen(parseFloat(fcMax), parseFloat(fcRest), p) : null;
    const pctFc = calcPctFcMax(parseFloat(fcMax), p);
    const isSafe = safe ? (karv || pctFc) < safe : true;
    const borg = p <= 0.5 ? "2–3" : p <= 0.6 ? "4–5" : p <= 0.7 ? "12–13" : p <= 0.75 ? "13–14" : "6–7";
    const zona = p <= 0.5 ? "Leve" : p <= 0.65 ? "Moderado" : p <= 0.75 ? "Mod-Vigoroso" : "Vigoroso";
    const color = isSafe ? "#16a34a" : "#dc2626";
    return React.createElement("tr", { key: p, style: { borderBottom: "1px solid #f1f5f9", background: isSafe ? "#fff" : "#fff5f5" } }, React.createElement("td", { style: { padding: "8px 10px", fontWeight: 700, color: "#0f172a" } }, Math.round(p * 100), "%"), hasRest && React.createElement("td", { style: { padding: "8px 10px", textAlign: "center", fontWeight: 800, color } }, karv, " bpm"), React.createElement("td", { style: { padding: "8px 10px", textAlign: "center", color: "#475569" } }, pctFc, " bpm"), React.createElement("td", { style: { padding: "8px 10px", textAlign: "center", color: "#64748b" } }, borg), React.createElement("td", { style: { padding: "8px 10px", textAlign: "center" } }, React.createElement(Badge, { color, bg: color + "18" }, zona, !isSafe ? " ⚠️" : "")));
  }))));
};
const CardioModule = ({ student, assessment, cardioData, setCardioData }) => {
  const [mode, setMode] = useState(cardioData?.mode || "");
  const [ergo, setErgo] = useState(cardioData?.ergo || {
    fcRest: "",
    fcMax: "",
    pasSit: "",
    padSit: "",
    pasPeak: "",
    padPeak: "",
    mets: "",
    fcSymptom: "",
    symptomType: "",
    fcIschemic: "",
    ecgObs: "",
    arrythmias: [],
    arrObs: "",
    medications: []
  });
  const [pred, setPred] = useState(cardioData?.pred || {
    age: (student ? calcAge(student.dob) : "") || "",
    sex: student?.sex || "",
    fcRest: "",
    pasSit: "",
    padSit: "",
    diabetes: false,
    hypertension: false,
    obesity: false,
    cardioDisease: false,
    sedentary: false,
    symptoms: false,
    formula: "tanaka",
    medications: [],
    activityLevel: "",
    functionalTest: "",
    ftValue: "",
    ftRecovery: ""
  });
  const [talkTest, setTalkTest] = useState("");
  const [saved, setSaved] = useState(false);
  const save = () => {
    setCardioData({ mode, ergo, pred, talkTest });
    setSaved(true);
    setTimeout(() => setSaved(false), 2e3);
  };
  const ergoFcMax = parseFloat(ergo.fcMax);
  const ergoFcRest = parseFloat(ergo.fcRest);
  const ergoDP = calcDP(ergo.fcMax, ergo.pasPeak);
  const ergoFcReserve = ergoFcMax && ergoFcRest ? ergoFcMax - ergoFcRest : null;
  const ergoMetCl = metClass(ergo.mets);
  const hasBetaBlocker = ergo.medications?.includes("beta");
  const hasArrythmia = ergo.arrythmias?.length > 0 && !ergo.arrythmias.includes("none");
  const pasPeakN = parseFloat(ergo.pasPeak);
  const pressureAlert = ergo.pasPeak && (pred.sex === "M" && pasPeakN >= 210 || pred.sex === "F" && pasPeakN >= 190);
  const predAge = parseFloat(pred.age);
  const predFcRest = parseFloat(pred.fcRest);
  const predFcMax = predAge ? pred.formula === "tanaka" ? Math.round(208 - 0.7 * predAge) : 220 - predAge : null;
  const predFcReserve = predFcMax && predFcRest ? predFcMax - predFcRest : null;
  const predRisk = riskStratify(pred);
  const arrythmiaOpts = [
    { v: "none", l: "Sem arritmia" },
    { v: "ectopic", l: "Extrassístoles" },
    { v: "tvns", l: "TVNS" },
    { v: "af", l: "Fibrilação atrial" },
    { v: "svt", l: "Arritmia supraventricular" },
    { v: "other", l: "Outra" }
  ];
  const medOpts = [
    { v: "beta", l: "Beta-bloqueador" },
    { v: "antihyp", l: "Anti-hipertensivo" },
    { v: "vasodil", l: "Vasodilatador" },
    { v: "antiarr", l: "Antiarrítmico" },
    { v: "antidiab", l: "Antidiabético" },
    { v: "insulin", l: "Insulina" },
    { v: "other", l: "Outro" }
  ];
  if (!student) return null;
  const toggleArr = (v) => setErgo((e) => ({ ...e, arrythmias: e.arrythmias.includes(v) ? e.arrythmias.filter((x) => x !== v) : [...e.arrythmias.filter((x) => x !== "none"), v] }));
  const toggleMed = (v) => setErgo((e) => ({ ...e, medications: e.medications.includes(v) ? e.medications.filter((x) => x !== v) : [...e.medications, v] }));
  const toggleMedPred = (v) => setPred((p) => ({ ...p, medications: (p.medications || []).includes(v) ? (p.medications || []).filter((x) => x !== v) : [...p.medications || [], v] }));
  return React.createElement("div", { style: { marginTop: 20 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 4 } }, "💓 Prescrição Cardiovascular"), React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginBottom: 16 } }, "Módulo híbrido — Teste Ergométrico ou Predição Clínica"), React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 20 } }, [
    { v: "ergo", label: "🟢 Teste Ergométrico", sub: "Dados reais do teste" },
    { v: "pred", label: "🟡 Predição Clínica", sub: "Sem teste disponível" }
  ].map((m) => React.createElement("button", { key: m.v, onClick: () => setMode(m.v), style: { flex: 1, padding: "12px 10px", borderRadius: 12, border: `2px solid ${mode === m.v ? "#FF5603" : "#e2e8f0"}`, background: mode === m.v ? "#fff4ee" : "#f8fafc", cursor: "pointer", textAlign: "left" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: mode === m.v ? "#FF5603" : "#0f172a" } }, m.label), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 2 } }, m.sub)))), mode === "ergo" && React.createElement(React.Fragment, null, React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 14 } }, "📋 Card 1 — Dados do Teste"), React.createElement("div", { style: { fontWeight: 600, fontSize: 12, color: "#FF5603", marginBottom: 8 } }, "Dados Cardiovasculares"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 } }, React.createElement(Inp, { label: "FC repouso (bpm)", type: "number", value: ergo.fcRest, onChange: (v) => setErgo((e) => ({ ...e, fcRest: v })), placeholder: "ex: 72" }), React.createElement(Inp, { label: "FC máxima teste", type: "number", value: ergo.fcMax, onChange: (v) => setErgo((e) => ({ ...e, fcMax: v })), placeholder: "ex: 148" }), React.createElement(Inp, { label: "METs atingidos", type: "number", value: ergo.mets, onChange: (v) => setErgo((e) => ({ ...e, mets: v })), step: "0.5", placeholder: "ex: 7.5" })), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, React.createElement(Inp, { label: "PAS repouso (mmHg)", type: "number", value: ergo.pasSit, onChange: (v) => setErgo((e) => ({ ...e, pasSit: v })), placeholder: "120" }), React.createElement(Inp, { label: "PAD repouso (mmHg)", type: "number", value: ergo.padSit, onChange: (v) => setErgo((e) => ({ ...e, padSit: v })), placeholder: "80" }), React.createElement(Inp, { label: "PAS pico esforço", type: "number", value: ergo.pasPeak, onChange: (v) => setErgo((e) => ({ ...e, pasPeak: v })), placeholder: "ex: 180" }), React.createElement(Inp, { label: "PAD pico esforço", type: "number", value: ergo.padPeak, onChange: (v) => setErgo((e) => ({ ...e, padPeak: v })), placeholder: "ex: 90" })), React.createElement("div", { style: { fontWeight: 600, fontSize: 12, color: "#FF5603", marginBottom: 8, marginTop: 4 } }, "Limiar Clínico"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, React.createElement(Inp, { label: "FC início sintomas", type: "number", value: ergo.fcSymptom, onChange: (v) => setErgo((e) => ({ ...e, fcSymptom: v })), placeholder: "ex: 130" }), React.createElement(Inp, { label: "Tipo de sintoma", value: ergo.symptomType, onChange: (v) => setErgo((e) => ({ ...e, symptomType: v })), opts: [{ v: "", l: "Nenhum" }, { v: "chest", l: "Dor torácica" }, { v: "dyspnea", l: "Dispneia" }, { v: "fatigue", l: "Fadiga" }, { v: "dizziness", l: "Tontura" }, { v: "palp", l: "Palpitação" }, { v: "other", l: "Outro" }] }), React.createElement(Inp, { label: "FC limiar isquêmico", type: "number", value: ergo.fcIschemic, onChange: (v) => setErgo((e) => ({ ...e, fcIschemic: v })), placeholder: "ex: 140" }), React.createElement(Inp, { label: "Obs ECG", value: ergo.ecgObs, onChange: (v) => setErgo((e) => ({ ...e, ecgObs: v })), placeholder: "Alterações..." })), React.createElement("div", { style: { fontWeight: 600, fontSize: 12, color: "#FF5603", marginBottom: 8, marginTop: 4 } }, "Arritmias"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 } }, arrythmiaOpts.map((o) => React.createElement("label", { key: o.v, style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 9, border: `1.5px solid ${ergo.arrythmias?.includes(o.v) ? "#dc2626" : "#e2e8f0"}`, background: ergo.arrythmias?.includes(o.v) ? "#fee2e2" : "#f8fafc", cursor: "pointer" } }, React.createElement("input", { type: "checkbox", checked: ergo.arrythmias?.includes(o.v), onChange: () => toggleArr(o.v) }), React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: ergo.arrythmias?.includes(o.v) ? "#dc2626" : "#475569" } }, o.l)))), React.createElement(Inp, { label: "Obs arritmias", value: ergo.arrObs, onChange: (v) => setErgo((e) => ({ ...e, arrObs: v })), placeholder: "Detalhes..." }), React.createElement("div", { style: { fontWeight: 600, fontSize: 12, color: "#FF5603", marginBottom: 8, marginTop: 4 } }, "Medicações em uso"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 } }, medOpts.map((o) => React.createElement("label", { key: o.v, style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 9, border: `1.5px solid ${ergo.medications?.includes(o.v) ? "#6366f1" : "#e2e8f0"}`, background: ergo.medications?.includes(o.v) ? "#eef2ff" : "#f8fafc", cursor: "pointer" } }, React.createElement("input", { type: "checkbox", checked: ergo.medications?.includes(o.v), onChange: () => toggleMed(o.v) }), React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: ergo.medications?.includes(o.v) ? "#6366f1" : "#475569" } }, o.l))))), ergo.fcMax && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 14 } }, "⚡ Card 2 — Cálculos Automáticos"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 } }, ergoFcReserve && React.createElement("div", { style: { background: "#f8fafc", borderRadius: 10, padding: "10px 12px", textAlign: "center" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" } }, "FC Reserva"), React.createElement("div", { style: { fontSize: 22, fontWeight: 900, color: "#FF5603" } }, ergoFcReserve), React.createElement("div", { style: { fontSize: 10, color: "#64748b" } }, "bpm")), ergoDP && React.createElement("div", { style: { background: "#f8fafc", borderRadius: 10, padding: "10px 12px", textAlign: "center" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" } }, "Duplo Produto"), React.createElement("div", { style: { fontSize: 22, fontWeight: 900, color: ergoDP >= 28e3 ? "#dc2626" : ergoDP >= 2e4 ? "#d97706" : "#16a34a" } }, ergoDP.toLocaleString("pt-BR")), React.createElement("div", { style: { fontSize: 10, color: "#64748b" } }, "mmHg·bpm")), ergoMetCl && React.createElement("div", { style: { background: ergoMetCl.bg, borderRadius: 10, padding: "10px 12px", textAlign: "center" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" } }, "METs"), React.createElement("div", { style: { fontSize: 22, fontWeight: 900, color: ergoMetCl.color } }, ergo.mets), React.createElement("div", { style: { fontSize: 10, color: ergoMetCl.color, fontWeight: 700 } }, ergoMetCl.label.split(" ")[0]))), React.createElement(ZoneTable, { fcMax: ergo.fcMax, fcRest: ergo.fcRest, ischemicFC: ergo.fcIschemic, betaBlocker: hasBetaBlocker })), ergo.fcMax && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 14 } }, "🩺 Card 3 — Interpretação Clínica"), pressureAlert && React.createElement("div", { style: { background: "#fee2e2", border: "1.5px solid #fca5a5", borderRadius: 9, padding: "10px 12px", marginBottom: 10, fontSize: 12, fontWeight: 700, color: "#dc2626" } }, "🚨 Possível resposta hipertensiva ao esforço (PAS pico ", ergo.pasPeak, " mmHg)"), hasArrythmia && React.createElement("div", { style: { background: "#fef9c3", border: "1.5px solid #fde68a", borderRadius: 9, padding: "10px 12px", marginBottom: 10, fontSize: 12, fontWeight: 700, color: "#d97706" } }, "⚠️ Arritmia detectada — necessidade de monitoramento cardiovascular ampliado durante exercício"), hasBetaBlocker && React.createElement("div", { style: { background: "#eef2ff", border: "1.5px solid #c7d2fe", borderRadius: 9, padding: "10px 12px", marginBottom: 10, fontSize: 12, fontWeight: 700, color: "#6366f1" } }, "💊 Beta-bloqueador em uso — FC pode estar atenuada. Priorizar PSE/Borg e sintomas como guia de intensidade"), ergo.fcIschemic && React.createElement("div", { style: { background: "#fff4ee", border: "1.5px solid #FF560344", borderRadius: 9, padding: "10px 12px", marginBottom: 10, fontSize: 12, fontWeight: 700, color: "#FF5603" } }, "🎯 Limiar isquêmico: ", ergo.fcIschemic, " bpm — Zona segura: abaixo de ", parseFloat(ergo.fcIschemic) - 10, " bpm"), ergo.symptomType && ergo.symptomType !== "" && React.createElement("div", { style: { background: "#fee2e2", border: "1.5px solid #fca5a5", borderRadius: 9, padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "#dc2626" } }, "🚩 Sintoma limitante: ", { chest: "Dor torácica", dyspnea: "Dispneia", fatigue: "Fadiga", dizziness: "Tontura", palp: "Palpitação", other: "Outro" }[ergo.symptomType], " — FC início: ", ergo.fcSymptom, " bpm"), ergoMetCl && React.createElement("div", { style: { background: ergoMetCl.bg, borderRadius: 9, padding: "10px 12px", marginTop: 8, fontSize: 12, fontWeight: 700, color: ergoMetCl.color } }, "💪 Capacidade funcional: ", ergoMetCl.label)), ergo.fcMax && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 14 } }, "🏃 Card 4 — Prescrição Aeróbia"), React.createElement("div", { style: { background: "#dcfce7", border: "1.5px solid #86efac", borderRadius: 9, padding: "8px 12px", marginBottom: 12 } }, React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: "#16a34a" } }, "🟢 Prescrição baseada em TESTE ERGOMÉTRICO")), ergoMetCl && React.createElement("div", { style: { marginBottom: 10 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 } }, "Volume inicial recomendado"), React.createElement("div", { style: { fontSize: 13, color: "#334155" } }, parseFloat(ergo.mets) < 5 ? "10–20 min/sessão. Iniciar com baixa intensidade e progressão gradual." : parseFloat(ergo.mets) < 7 ? "20–30 min/sessão. Exercício contínuo ou intervalado leve." : "30–45 min/sessão. Exercício contínuo moderado bem tolerado.")), React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 } }, "Modalidades sugeridas"), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 } }, ["🚶 Caminhada", "🚴 Bicicleta ergométrica", "⚙️ Elíptico", "🌊 Natação/hidroginástica", hasBetaBlocker ? "📊 Foco em PSE (não FC)" : null].filter(Boolean).map((m, i) => React.createElement(Badge, { key: i, color: "#6366f1", bg: "#eef2ff" }, m))), React.createElement("div", { style: { fontSize: 12, color: "#64748b", fontStyle: "italic" } }, "Progressão: aumentar 5–10 min/semana. Reavaliar a cada 8–12 semanas."))), mode === "pred" && React.createElement(React.Fragment, null, React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 14 } }, "📋 Card 1 — Dados para Predição"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 } }, React.createElement(Inp, { label: "Idade", type: "number", value: pred.age, onChange: (v) => setPred((p) => ({ ...p, age: v })), placeholder: "ex: 65" }), React.createElement(Inp, { label: "Sexo", value: pred.sex, onChange: (v) => setPred((p) => ({ ...p, sex: v })), opts: [{ v: "", l: "..." }, { v: "M", l: "Masculino" }, { v: "F", l: "Feminino" }] }), React.createElement(Inp, { label: "FC repouso (bpm)", type: "number", value: pred.fcRest, onChange: (v) => setPred((p) => ({ ...p, fcRest: v })), placeholder: "ex: 72" })), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, React.createElement(Inp, { label: "PAS (mmHg)", type: "number", value: pred.pasSit, onChange: (v) => setPred((p) => ({ ...p, pasSit: v })), placeholder: "120" }), React.createElement(Inp, { label: "PAD (mmHg)", type: "number", value: pred.padSit, onChange: (v) => setPred((p) => ({ ...p, padSit: v })), placeholder: "80" })), React.createElement("div", { style: { fontWeight: 600, fontSize: 12, color: "#FF5603", marginBottom: 8, marginTop: 4 } }, "Comorbidades / Fatores de Risco"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 } }, [["cardioDisease", "Cardiopatia conhecida", "#dc2626"], ["symptoms", "Sintomas atuais", "#dc2626"], ["hypertension", "Hipertensão", "#ea580c"], ["diabetes", "Diabetes", "#d97706"], ["obesity", "Obesidade", "#d97706"], ["sedentary", "Sedentário 50+", "#64748b"]].map(([k, l, c]) => React.createElement("label", { key: k, style: { display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 9, border: `1.5px solid ${pred[k] ? c : "#e2e8f0"}`, background: pred[k] ? c + "18" : "#f8fafc", cursor: "pointer" } }, React.createElement("input", { type: "checkbox", checked: !!pred[k], onChange: (e) => setPred((p) => ({ ...p, [k]: e.target.checked })) }), React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: pred[k] ? c : "#475569" } }, l)))), React.createElement("div", { style: { fontWeight: 600, fontSize: 12, color: "#FF5603", marginBottom: 8 } }, "Fórmula FCmáx preditiva"), React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 10 } }, [{ v: "tanaka", l: "Tanaka (padrão): 208 − 0.7 × idade" }, { v: "traditional", l: "Tradicional: 220 − idade" }].map((f) => React.createElement("button", { key: f.v, onClick: () => setPred((p) => ({ ...p, formula: f.v })), style: { flex: 1, padding: "10px 8px", borderRadius: 10, border: `1.5px solid ${pred.formula === f.v ? "#FF5603" : "#e2e8f0"}`, background: pred.formula === f.v ? "#fff4ee" : "#f8fafc", fontWeight: 700, fontSize: 12, cursor: "pointer", color: pred.formula === f.v ? "#FF5603" : "#64748b", textAlign: "left" } }, f.l))), React.createElement("div", { style: { fontWeight: 600, fontSize: 12, color: "#FF5603", marginBottom: 8 } }, "Medicações"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 } }, medOpts.map((o) => React.createElement("label", { key: o.v, style: { display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 9, border: `1.5px solid ${pred.medications?.includes(o.v) ? "#6366f1" : "#e2e8f0"}`, background: pred.medications?.includes(o.v) ? "#eef2ff" : "#f8fafc", cursor: "pointer" } }, React.createElement("input", { type: "checkbox", checked: pred.medications?.includes(o.v), onChange: () => toggleMedPred(o.v) }), React.createElement("span", { style: { fontSize: 12, fontWeight: 600, color: pred.medications?.includes(o.v) ? "#6366f1" : "#475569" } }, o.l)))), React.createElement("div", { style: { fontWeight: 600, fontSize: 12, color: "#FF5603", marginBottom: 8 } }, "Testes Funcionais (opcional)"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 } }, React.createElement(Inp, { label: "Teste funcional", value: pred.functionalTest, onChange: (v) => setPred((p) => ({ ...p, functionalTest: v })), opts: [{ v: "", l: "Nenhum" }, { v: "walk6", l: "Caminhada 6 min" }, { v: "sts30", l: "Sit-to-Stand 30s" }, { v: "step", l: "Step Test 2-3 min" }, { v: "fcrec", l: "FC recuperação 1 min" }] }), pred.functionalTest && React.createElement(Inp, { label: pred.functionalTest === "walk6" ? "Distância (m)" : pred.functionalTest === "sts30" ? "Repetições" : pred.functionalTest === "fcrec" ? "FC 1min pós" : "Resultado", type: "number", value: pred.ftValue, onChange: (v) => setPred((p) => ({ ...p, ftValue: v })), placeholder: "valor" }))), pred.age && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 14 } }, "⚡ Card 2 — Cálculos Automáticos"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 } }, React.createElement("div", { style: { background: "#f8fafc", borderRadius: 10, padding: "12px", textAlign: "center" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" } }, "FCmáx estimada"), React.createElement("div", { style: { fontSize: 26, fontWeight: 900, color: "#FF5603" } }, predFcMax), React.createElement("div", { style: { fontSize: 10, color: "#64748b" } }, "bpm · ", pred.formula === "tanaka" ? "Tanaka" : "Trad.")), predFcReserve && React.createElement("div", { style: { background: "#f8fafc", borderRadius: 10, padding: "12px", textAlign: "center" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" } }, "FC Reserva"), React.createElement("div", { style: { fontSize: 26, fontWeight: 900, color: "#6366f1" } }, predFcReserve), React.createElement("div", { style: { fontSize: 10, color: "#64748b" } }, "bpm"))), React.createElement(ZoneTable, { fcMax: String(predFcMax), fcRest: pred.fcRest, betaBlocker: pred.medications?.includes("beta") })), pred.age && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 14 } }, "🩺 Card 3 — Estratificação de Risco"), React.createElement("div", { style: { background: predRisk.bg, border: `1.5px solid ${predRisk.color}33`, borderRadius: 12, padding: "14px", marginBottom: 12 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 15, color: predRisk.color, marginBottom: 4 } }, predRisk.label), React.createElement("div", { style: { fontSize: 13, color: "#334155" } }, "Zona recomendada: ", React.createElement("strong", null, predRisk.fcr), " · Borg: ", React.createElement("strong", null, predRisk.borg)), predRisk.alert && React.createElement("div", { style: { fontSize: 12, color: predRisk.color, fontWeight: 700, marginTop: 6 } }, "⚠️ ", predRisk.alert)), pred.cardioDisease && React.createElement("div", { style: { background: "#fee2e2", border: "1.5px solid #fca5a5", borderRadius: 9, padding: "10px 12px", marginBottom: 8, fontSize: 12, fontWeight: 700, color: "#dc2626" } }, "🚨 Cardiopatia conhecida sem teste ergométrico — predição limitada. Recomenda-se avaliação clínica e/ou teste ergométrico."), pred.medications?.includes("beta") && React.createElement("div", { style: { background: "#eef2ff", border: "1.5px solid #c7d2fe", borderRadius: 9, padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "#6366f1" } }, "💊 Beta-bloqueador: FC máxima pode ser menor que a estimada. Usar PSE/Borg como guia principal.")), pred.age && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 14 } }, "🏃 Card 4 — Prescrição Aeróbia"), React.createElement("div", { style: { background: "#fef9c3", border: "1.5px solid #fde68a", borderRadius: 9, padding: "8px 12px", marginBottom: 12 } }, React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: "#d97706" } }, "🟡 Prescrição baseada em ESTIMATIVA CLÍNICA")), React.createElement("div", { style: { fontSize: 13, color: "#334155", marginBottom: 10 } }, "Zona alvo: ", React.createElement("strong", { style: { color: "#FF5603" } }, predRisk.fcr), " · Borg recomendado: ", React.createElement("strong", null, predRisk.borg)), React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 } }, "Volume inicial"), React.createElement("div", { style: { fontSize: 13, color: "#334155", marginBottom: 10 } }, predRisk.level === "high" ? "10–20 min/sessão. Intensidade leve. Monitoramento contínuo." : predRisk.level === "moderate" ? "20–30 min/sessão. Progressão gradual." : "30–45 min/sessão. Exercício contínuo moderado."), React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 } }, "Modalidades"), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, ["🚶 Caminhada", "🚴 Bicicleta ergométrica", "🌊 Hidroginástica", "⚙️ Elíptico"].map((m, i) => React.createElement(Badge, { key: i, color: "#6366f1", bg: "#eef2ff" }, m))))), mode && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 10 } }, "🗣️ Talk Test (opcional)"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, [
    { v: "full", l: "Consegue conversar frases completas", "desc": "→ Intensidade moderada aceitável", "color": "#16a34a" },
    { v: "partial", l: "Fala fragmentada com dificuldade moderada", "desc": "→ Limite superior da zona moderada", "color": "#d97706" },
    { v: "poor", l: "Dificuldade importante para falar", "desc": "→ Reduzir intensidade imediatamente", "color": "#dc2626" }
  ].map((o) => React.createElement("button", { key: o.v, onClick: () => setTalkTest(o.v), style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${talkTest === o.v ? o.color : "#e2e8f0"}`, background: talkTest === o.v ? o.color + "18" : "#f8fafc", cursor: "pointer", textAlign: "left" } }, React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: talkTest === o.v ? o.color : "#0f172a" } }, o.l), React.createElement("div", { style: { fontSize: 11, color: o.color, fontWeight: 600, marginTop: 2 } }, o.desc)), talkTest === o.v && React.createElement("span", { style: { fontSize: 18 } }, "✓"))))), mode && React.createElement(Card, { style: { marginBottom: 14, border: "1.5px solid #fca5a5", background: "#fff5f5" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#dc2626", marginBottom: 10 } }, "🚨 Critérios de Interrupção / Alerta"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 } }, ["Dor anginosa", "Dispneia importante", "Síncope/pré-síncope", "Tontura relevante", "Arritmia sintomática", "Queda de saturação", "Hipoglicemia", "Alteração pressórica"].map((s, i) => React.createElement("div", { key: i, style: { background: "#fee2e2", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, color: "#dc2626" } }, "🚩 ", s)))), mode && React.createElement("div", { style: { display: "flex", gap: 10 } }, React.createElement(Btn, { full: true, onClick: save, variant: saved ? "secondary" : "primary" }, saved ? "✓ Salvo!" : "💾 Salvar Prescrição Cardiovascular")));
};
const Daily = ({ students, assessments, dailyLogs, setDailyLogs, cardioRecords, setCardioRecords, prefillStudentId }) => {
  const [modal, setModal] = useState(false);
  const [cardioModal, setCardioModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const [selCardioSt, setSelCardioSt] = useState("");
  const [filterSt, setFilterSt] = useState(prefillStudentId || "");
  const [activeMoments, setActiveMoments] = useState({ pre: true, during: false, post: false });
  const [form, setForm] = useState({ studentId: prefillStudentId || "", date: todayStr(), pre: emptyMoment(), during: emptyMoment(), post: emptyMoment(), notes: "", disposition: null, hydration: null });
  const resetForm = () => setForm({ studentId: prefillStudentId || "", date: todayStr(), pre: emptyMoment(), during: emptyMoment(), post: emptyMoment(), notes: "" });
  const save = () => {
    if (!form.studentId) return;
    setDailyLogs((p) => [...p, { id: uid(), ...form }]);
    setModal(false);
    resetForm();
  };
  const del = (id) => setDailyLogs((p) => p.filter((l) => l.id !== id));
  const logs = [...dailyLogs].filter((l) => !filterSt || l.studentId === filterSt).sort((a, b) => b.date?.localeCompare(a.date));
  const recs = getRecommendations(form.pre, form.during, form.post);
  return React.createElement("div", null, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 20 } }, "Monitoramento Diário"), React.createElement(Btn, { sm: true, icon: "plus", onClick: () => {
    resetForm();
    setActiveMoments({ pre: true, during: false, post: false });
    setModal(true);
  } }, "Registrar")), React.createElement("select", { value: filterSt, onChange: (e) => setFilterSt(e.target.value), style: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, marginBottom: 14 } }, React.createElement("option", { value: "" }, "Todos os alunos"), students.map((s) => React.createElement("option", { key: s.id, value: s.id }, s.name))), logs.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 40 } }, React.createElement(I, { n: "act", c: "#cbd5e1", s: 36 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhum registro ainda.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, logs.map((l) => {
    const st = students.find((s) => s.id === l.studentId);
    const savedRecs = getRecommendations(l.pre, l.during, l.post);
    return React.createElement(Card, { key: l.id, style: { padding: "14px 16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 } }, React.createElement("div", { style: { flex: 1 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 } }, React.createElement("span", { style: { fontWeight: 700, fontSize: 14 } }, st?.name), React.createElement("span", { style: { fontSize: 11, color: "#94a3b8" } }, fmt(l.date))), React.createElement(MomentCard, { label: "Pré-exercício", color: "#6366f1", m: l.pre }), React.createElement(MomentCard, { label: "Durante", color: O, m: l.during }), React.createElement(MomentCard, { label: "Pós-exercício", color: "#16a34a", m: l.post }), l.notes && React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 6 } }, "📝 ", l.notes), savedRecs.length > 0 && React.createElement("details", { style: { marginTop: 10 } }, React.createElement("summary", { style: { fontSize: 12, fontWeight: 700, color: "#64748b", cursor: "pointer" } }, "📋 Ver recomendações ACSM/AHA (", savedRecs.length, ")"), React.createElement(RecBox, { recs: savedRecs }))), React.createElement("button", { onClick: () => del(l.id), style: { background: "none", border: "none", cursor: "pointer", color: "#e2e8f0", padding: 4, flexShrink: 0 } }, React.createElement(I, { n: "trash", s: 15 }))));
  })), cardioModal && React.createElement(Modal, { title: "Prescrição Cardiovascular", onClose: () => setCardioModal(false), wide: true }, React.createElement(Inp, { label: "Selecionar Aluno", value: selCardioSt, onChange: setSelCardioSt, opts: [{ v: "", l: "Selecione..." }, ...students.map((s) => ({ v: s.id, l: s.name }))] }), selCardioSt && students.find((s) => s.id === selCardioSt) && React.createElement(
    CardioModule,
    {
      student: students.find((s) => s.id === selCardioSt),
      assessment: null,
      cardioData: cardioRecords?.find((r) => r.studentId === selCardioSt),
      setCardioData: (data) => {
        setCardioRecords((prev) => [...prev.filter((r) => r.studentId !== selCardioSt), { ...data, studentId: selCardioSt, date: todayStr() }]);
        setCardioModal(false);
      }
    }
  )), detailsModal && (() => {
    const dSt = students.find((s) => s.id === form.studentId);
    const dA = dSt ? [...assessments || []].filter((a) => a.studentId === dSt.id).sort((a, b) => b.date?.localeCompare(a.date))[0] : null;
    const dLogs = dSt ? [...dailyLogs].filter((l) => l.studentId === dSt.id).sort((a, b) => b.date?.localeCompare(a.date)) : [];
    const lastLog = dLogs[0];
    const riskFlags = [];
    if (dA?.parqApplied && dA?.parqFailed) riskFlags.push({ t: "PAR-Q Positivo", c: "#dc2626", bg: "#fee2e2" });
    if ((dA?.aha?.score || 0) >= 4) riskFlags.push({ t: "Alto Risco Cardiovascular (AHA)", c: "#dc2626", bg: "#fee2e2" });
    if (dA?.aha?.calf && parseFloat(dA.aha.calf) < 31) riskFlags.push({ t: "Risco de Sarcopenia (Panturrilha < 31cm)", c: "#ea580c", bg: "#ffedd5" });
    if ((dA?.functional?.score || 0) < 40) riskFlags.push({ t: "Capacidade Funcional Comprometida", c: "#d97706", bg: "#fef9c3" });
    if (dA?.physical?.tug && parseFloat(dA.physical.tug) > 13.5) riskFlags.push({ t: "Risco de Quedas (TUG alterado)", c: "#dc2626", bg: "#fee2e2" });
    const dispLabel = { 1: "😣 Exausto", 2: "😴 Cansado", 3: "😐 Neutro", 4: "🙂 Disposto", 5: "😁 Animado" };
    const hydrLabel = { 1: "Muito pouco", 2: "Pouco", 3: "Regular", 4: "Bom", 5: "Ótimo" };
    return React.createElement("div", { style: { position: "fixed", inset: 0, background: "#0009", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1100 } }, React.createElement("div", { style: { background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 600, maxHeight: "88vh", overflowY: "auto", paddingBottom: 80 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff", zIndex: 10 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 17, color: "#0f172a" } }, "🩺 ", dSt?.name || "Aluno"), React.createElement("button", { onClick: () => setDetailsModal(false), style: { background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" } }, React.createElement(I, { n: "x", s: 15 }))), React.createElement("div", { style: { padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 14 } }, riskFlags.length > 0 && React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 } }, "⚠️ Alertas de Risco"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5 } }, riskFlags.map((f, i) => React.createElement("div", { key: i, style: { background: f.bg, border: "1px solid " + f.c + "44", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 700, color: f.c } }, "• ", f.t)))), (dA?.anamnese?.pathologies || dA?.anamnese?.medications) && React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 } }, "🏥 Saúde"), dA.anamnese.pathologies && React.createElement("div", { style: { background: "#f8fafc", borderRadius: 8, padding: "8px 10px", marginBottom: 5 } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 } }, "Patologias"), React.createElement("div", { style: { fontSize: 13, color: "#0f172a" } }, dA.anamnese.pathologies)), dA.anamnese.medications && React.createElement("div", { style: { background: "#f8fafc", borderRadius: 8, padding: "8px 10px" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 } }, "Medicamentos"), React.createElement("div", { style: { fontSize: 13, color: "#0f172a" } }, dA.anamnese.medications))), (dA?.anamnese?.mainComplaints || dA?.anamnese?.painLocation) && React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 } }, "💬 Queixas Relatadas"), dA.anamnese.mainComplaints && React.createElement("div", { style: { background: "#f8fafc", borderRadius: 8, padding: "8px 10px", marginBottom: 5 } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 } }, "Sintomas"), React.createElement("div", { style: { fontSize: 13, color: "#0f172a" } }, dA.anamnese.mainComplaints)), dA.anamnese.painLocation && React.createElement("div", { style: { background: "#fff4ee", border: "1px solid #FF560322", borderRadius: 8, padding: "8px 10px" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 } }, "Localização de dores"), React.createElement("div", { style: { fontSize: 13, color: "#0f172a" } }, dA.anamnese.painLocation))), dA?.anamnese?.goals && React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 } }, "🎯 Objetivos"), React.createElement("div", { style: { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "8px 10px" } }, React.createElement("div", { style: { fontSize: 13, color: "#0f172a" } }, dA.anamnese.goals))), lastLog && React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 } }, "📅 Último Registro — ", fmt(lastLog.date)), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5 } }, lastLog.disposition && React.createElement("div", { style: { background: "#f8fafc", borderRadius: 8, padding: "7px 10px", fontSize: 13 } }, React.createElement("span", { style: { color: "#94a3b8", fontSize: 11 } }, "Disposição: "), React.createElement("span", { style: { fontWeight: 700 } }, dispLabel[lastLog.disposition] || lastLog.disposition)), lastLog.hydration && React.createElement("div", { style: { background: "#f8fafc", borderRadius: 8, padding: "7px 10px", fontSize: 13 } }, React.createElement("span", { style: { color: "#94a3b8", fontSize: 11 } }, "Hidratação: "), React.createElement("span", { style: { fontWeight: 700 } }, "💧 ", hydrLabel[lastLog.hydration] || lastLog.hydration)), lastLog.pre?.pain && React.createElement("div", { style: { background: "#fff4ee", border: "1px solid #FF560322", borderRadius: 8, padding: "7px 10px", fontSize: 13 } }, React.createElement("span", { style: { color: "#94a3b8", fontSize: 11 } }, "Dor/Desconforto (pré): "), React.createElement("span", { style: { fontWeight: 700, color: "#ea580c" } }, lastLog.pre.pain)), lastLog.during?.pain && React.createElement("div", { style: { background: "#fff4ee", border: "1px solid #FF560322", borderRadius: 8, padding: "7px 10px", fontSize: 13 } }, React.createElement("span", { style: { color: "#94a3b8", fontSize: 11 } }, "Dor/Desconforto (durante): "), React.createElement("span", { style: { fontWeight: 700, color: "#ea580c" } }, lastLog.during.pain)), lastLog.post?.pain && React.createElement("div", { style: { background: "#fff4ee", border: "1px solid #FF560322", borderRadius: 8, padding: "7px 10px", fontSize: 13 } }, React.createElement("span", { style: { color: "#94a3b8", fontSize: 11 } }, "Dor/Desconforto (pós): "), React.createElement("span", { style: { fontWeight: 700, color: "#ea580c" } }, lastLog.post.pain)), lastLog.notes && React.createElement("div", { style: { background: "#f8fafc", borderRadius: 8, padding: "7px 10px", fontSize: 13 } }, React.createElement("span", { style: { color: "#94a3b8", fontSize: 11 } }, "Obs: "), React.createElement("span", null, lastLog.notes)))), !dA && React.createElement("div", { style: { textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "20px 0" } }, "Nenhuma avaliação registrada para este aluno."), React.createElement("button", { onClick: () => setDetailsModal(false), style: { width: "100%", padding: "12px 0", background: "#FF5603", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 4 } }, "Fechar"))));
  })(), modal && React.createElement(Modal, { title: "Novo Registro", onClose: () => setModal(false) }, (() => {
    const selStudent = students.find((s) => s.id === form.studentId);
    const lastAssessment = selStudent ? [...assessments || []].filter((a) => a.studentId === selStudent.id).sort((a, b) => b.date?.localeCompare(a.date))[0] : null;
    const isBetaBlocker = lastAssessment?.anamnese?.medications?.toLowerCase().includes("beta") || lastAssessment?.anamnese?.medications?.toLowerCase().includes("propranolol") || lastAssessment?.anamnese?.medications?.toLowerCase().includes("atenolol") || lastAssessment?.anamnese?.medications?.toLowerCase().includes("metoprolol") || lastAssessment?.anamnese?.medications?.toLowerCase().includes("bisoprolol") || lastAssessment?.anamnese?.medications?.toLowerCase().includes("carvedilol");
    return isBetaBlocker ? React.createElement("div", { style: { background: "#fff4ee", border: "1.5px solid #FF560344", borderRadius: 10, padding: "10px 14px", marginBottom: 12 } }, React.createElement("div", { style: { fontWeight: 700, color: "#FF5603", fontSize: 13, marginBottom: 2 } }, "💊 Beta-bloqueador detectado"), React.createElement("div", { style: { fontSize: 12, color: "#475569" } }, "A FC pode estar artificialmente reduzida. Utilize a ", React.createElement("strong", null, "PSE como principal guia de intensidade"), " nesta sessão.")) : null;
  })(), React.createElement(Inp, { label: "Aluno *", value: form.studentId, onChange: (v) => setForm((f) => ({ ...f, studentId: v })), opts: [{ v: "", l: "Selecione..." }, ...students.map((s) => ({ v: s.id, l: s.name }))] }), form.studentId && React.createElement("button", { onClick: () => setDetailsModal(true), style: { width: "100%", marginBottom: 12, padding: "10px 0", background: "#f0f9ff", border: "1.5px solid #0ea5e9", borderRadius: 10, color: "#0369a1", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 } }, "🩺 Detalhes do Aluno"), React.createElement(Inp, { label: "Data", type: "date", value: form.date, onChange: (v) => setForm((f) => ({ ...f, date: v })) }), React.createElement("div", { style: { marginBottom: 16 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#6366f1", marginBottom: 10 } }, "😊 Quão disposto você está agora?"), React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 10 } }, [
    { v: 1, e: "😣", l: "Exausto" },
    { v: 2, e: "😴", l: "Cansado" },
    { v: 3, e: "😐", l: "Neutro" },
    { v: 4, e: "🙂", l: "Disposto" },
    { v: 5, e: "😁", l: "Animado" }
  ].map((o) => React.createElement("button", { key: o.v, onClick: () => setForm((f) => ({ ...f, disposition: o.v })), style: { flex: 1, marginRight: 4, padding: "10px 0", borderRadius: 12, border: `2px solid ${form.disposition === o.v ? "#6366f1" : "#e2e8f0"}`, background: form.disposition === o.v ? "#eef2ff" : "#f8fafc", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 } }, React.createElement("span", { style: { fontSize: 28 } }, o.e), React.createElement("span", { style: { fontSize: 9, color: form.disposition === o.v ? "#6366f1" : "#94a3b8", fontWeight: 700 } }, o.l)))), form.disposition !== null && (() => {
    const isLow = form.disposition <= 2;
    return isLow ? React.createElement("div", { style: { background: "#fff4ee", border: "1px solid #FF560344", borderRadius: 9, padding: "8px 12px", fontSize: 12, color: "#FF5603", fontWeight: 600 } }, "⚠️ Disposição baixa. Considere reduzir a intensidade da sessão hoje.") : null;
  })()), React.createElement("div", { style: { marginBottom: 16 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#0891b2", marginBottom: 10 } }, "💧 Como foi seu consumo de água ontem?"), React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 10 } }, [
    { v: 1, l: "Muito pouco", cups: "🥛" },
    { v: 2, l: "Pouco", cups: "🥛🥛" },
    { v: 3, l: "Regular", cups: "🥛🥛🥛" },
    { v: 4, l: "Bom", cups: "🥛🥛🥛🥛" },
    { v: 5, l: "Ótimo", cups: "🥛🥛🥛🥛🥛" }
  ].map((o) => React.createElement("button", { key: o.v, onClick: () => setForm((f) => ({ ...f, hydration: o.v })), style: { flex: 1, marginRight: 4, padding: "10px 4px", borderRadius: 12, border: `2px solid ${form.hydration === o.v ? "#0891b2" : "#e2e8f0"}`, background: form.hydration === o.v ? "#ecfeff" : "#f8fafc", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 } }, React.createElement("span", { style: { fontSize: 18 } }, "💧"), React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" } }, Array.from({ length: o.v }).map((_, i) => React.createElement("div", { key: i, style: { width: 8, height: form.hydration === o.v ? 6 : 4, background: form.hydration === o.v ? "#0891b2" : "#cbd5e1", borderRadius: 2, marginBottom: 1 } }))), React.createElement("span", { style: { fontSize: 9, color: form.hydration === o.v ? "#0891b2" : "#94a3b8", fontWeight: 700, textAlign: "center", lineHeight: 1.2 } }, o.l)))), form.hydration !== null && (() => {
    const isLow = form.hydration <= 2;
    return isLow ? React.createElement("div", { style: { background: "#ecfeff", border: "1px solid #0891b244", borderRadius: 9, padding: "8px 12px", fontSize: 12, color: "#0891b2", fontWeight: 600 } }, "💧 Hidratação baixa ontem. Incentive o aluno a beber água antes, durante e após o treino.") : null;
  })()), React.createElement("div", { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 8 } }, "Momentos a registrar:"), React.createElement("div", { style: { display: "flex", gap: 8 } }, [["pre", "Pré-exercício", "#6366f1"], ["during", "Durante", "#FF5603"], ["post", "Pós-exercício", "#16a34a"]].map(([k, l, c]) => React.createElement("button", { key: k, onClick: () => setActiveMoments((m) => ({ ...m, [k]: !m[k] })), style: { flex: 1, padding: "9px 6px", borderRadius: 10, border: `1.5px solid ${activeMoments[k] ? c : "#e2e8f0"}`, background: activeMoments[k] ? c + "18" : "#f8fafc", fontWeight: 700, fontSize: 12, cursor: "pointer", color: activeMoments[k] ? c : "#94a3b8" } }, l)))), activeMoments.pre && React.createElement(MomentBlock, { title: "Pré-exercício", color: "#6366f1", data: form.pre, onChange: (v) => setForm((f) => ({ ...f, pre: v })), showDP: false }), activeMoments.during && React.createElement(MomentBlock, { title: "Durante o Exercício", color: O, data: form.during, onChange: (v) => setForm((f) => ({ ...f, during: v })), showDP: true }), activeMoments.post && React.createElement(MomentBlock, { title: "Pós-exercício", color: "#16a34a", data: form.post, onChange: (v) => setForm((f) => ({ ...f, post: v })), showDP: false }), (form.pre.pas || form.pre.fc || form.pre.spo2 || form.pre.glycemia) && (() => {
    const fc = parseFloat(form.pre.fc);
    const pas = parseFloat(form.pre.pas);
    const pad = parseFloat(form.pre.pad);
    const recs2 = getRecommendations(form.pre, form.during, form.post);
    const hasStop = recs2.some((r) => r.level === "stop");
    return React.createElement("div", { style: { marginTop: 8, marginBottom: 4 } }, recs2.length > 0 && React.createElement("div", { style: { marginBottom: 12 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" } }, "📋 Alertas ACSM / AHA"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, recs2.map((r, i) => React.createElement("div", { key: i, style: { background: r.bg, border: `1.5px solid ${r.border}`, borderRadius: 11, padding: "10px 13px" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 7, marginBottom: 3 } }, React.createElement("span", { style: { fontSize: 14 } }, r.icon), React.createElement("span", { style: { fontWeight: 700, fontSize: 12, color: r.color } }, r.title)), React.createElement("div", { style: { fontSize: 12, color: "#334155", lineHeight: 1.5 } }, r.text))))), !hasStop && fc > 0 && (() => {
      const student = students.find((s) => s.id === form.studentId);
      const age = student ? calcAge(student.dob) : null;
      const fcMaxErgo = null;
      const fcMax = fcMaxErgo || (age ? Math.round(208 - 0.7 * age) : null);
      const fcRes = fcMax ? fcMax - fc : null;
      const pcts = [0.4, 0.5, 0.6, 0.7, 0.8];
      const borgMap = { 0.4: "2–3", 0.5: "3–4", 0.6: "4–5", 0.7: "5–6", 0.8: "6–7" };
      const zonaMap = { 0.4: "Leve", 0.5: "Leve-Mod.", 0.6: "Moderada", 0.7: "Mod-Vig.", 0.8: "Vigorosa" };
      const colorMap = { 0.4: "#16a34a", 0.5: "#65a30d", 0.6: "#d97706", 0.7: "#ea580c", 0.8: "#dc2626" };
      const paLimit = pas >= 160 || pad >= 100 ? 0.5 : pas >= 140 || pad >= 90 ? 0.6 : pas >= 130 || pad >= 80 ? 0.7 : 1;
      return React.createElement("div", { style: { background: "#f8fafc", borderRadius: 12, padding: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 4 } }, "🏃 Faixas de Intensidade Sugeridas"), fcMax && React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginBottom: 10 } }, "FC repouso: ", React.createElement("strong", null, fc, " bpm"), " · FCmáx ", fcMaxErgo ? "(teste)" : "(Tanaka)", ": ", React.createElement("strong", null, fcMax, " bpm"), fcRes && React.createElement(React.Fragment, null, " · FC Reserva: ", React.createElement("strong", null, fcRes, " bpm"))), React.createElement("div", { style: { overflowX: "auto" } }, React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 } }, React.createElement("thead", null, React.createElement("tr", { style: { background: "#e2e8f0" } }, React.createElement("th", { style: { padding: "7px 10px", textAlign: "left", fontWeight: 700, color: "#475569" } }, "Intensidade"), fcRes && React.createElement("th", { style: { padding: "7px 10px", textAlign: "center", fontWeight: 700, color: "#475569" } }, "FC Karvonen"), fcMax && React.createElement("th", { style: { padding: "7px 10px", textAlign: "center", fontWeight: 700, color: "#475569" } }, "%FCmáx"), React.createElement("th", { style: { padding: "7px 10px", textAlign: "center", fontWeight: 700, color: "#475569" } }, "Borg"), React.createElement("th", { style: { padding: "7px 10px", textAlign: "center", fontWeight: 700, color: "#475569" } }, "Zona"))), React.createElement("tbody", null, pcts.map((p) => {
        const karv = fcRes ? Math.round(fcRes * p + fc) : null;
        const pctFc = fcMax ? Math.round(fcMax * p) : null;
        const safe = p <= paLimit;
        const c2 = safe ? colorMap[p] : "#94a3b8";
        return React.createElement("tr", { key: p, style: { borderBottom: "1px solid #f1f5f9", background: safe ? "#fff" : "#f8fafc", opacity: safe ? 1 : 0.5 } }, React.createElement("td", { style: { padding: "8px 10px", fontWeight: 800, color: c2 } }, Math.round(p * 100), "%"), fcRes && React.createElement("td", { style: { padding: "8px 10px", textAlign: "center", fontWeight: 800, color: safe ? c2 : "#94a3b8" } }, karv, " bpm", !safe ? " 🚫" : ""), fcMax && React.createElement("td", { style: { padding: "8px 10px", textAlign: "center", color: safe ? "#475569" : "#94a3b8" } }, pctFc, " bpm"), React.createElement("td", { style: { padding: "8px 10px", textAlign: "center", color: "#64748b" } }, borgMap[p]), React.createElement("td", { style: { padding: "8px 10px", textAlign: "center" } }, React.createElement("span", { style: { background: safe ? c2 + "18" : "#f1f5f9", color: safe ? c2 : "#94a3b8", padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700 } }, safe ? zonaMap[p] : "Restrita")));
      })))), paLimit < 1 && React.createElement("div", { style: { fontSize: 11, color: "#ea580c", fontWeight: 700, marginTop: 8 } }, "⚠️ Faixas acima de ", Math.round(paLimit * 100), "% restritas pela PA atual (", pas, "/", pad, " mmHg)"), React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", marginTop: 6, fontStyle: "italic" } }, "Ref: ACSM Guidelines · Karvonen · ", fcMaxErgo ? "FC teste" : "Tanaka: 208−0.7×idade"));
    })());
  })(), React.createElement(Inp, { label: "Observações gerais", value: form.notes, onChange: (v) => setForm((f) => ({ ...f, notes: v })), placeholder: "Sintomas, intercorrências..." }), React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 8 } }, React.createElement(Btn, { variant: "secondary", full: true, onClick: () => setModal(false) }, "Cancelar"), React.createElement(Btn, { full: true, onClick: save }, "Salvar"))));
};
const PRECAUCOES_DICT = [
  { keywords: ["artrose no joelho", "artrose de joelho", "artrose joelho", "artrose  joelho"], texto: "Evitar exercícios que exijam dobrar muito o joelho (agachamento profundo) e evitar saltos ou movimentos de impacto. Priorizar amplitude controlada e sem dor." },
  { keywords: ["prótese no joelho", "protese no joelho", "prótese de joelho", "protese de joelho"], texto: "Evitar impacto e amplitude excessiva de flexão do joelho. Priorizar exercícios controlados, sem dor durante o movimento." },
  { keywords: ["prótese no quadril", "protese no quadril", "prótese de quadril", "protese de quadril"], texto: "Evitar rotação forçada do quadril e evitar cruzar as pernas além do confortável." },
  { keywords: ["artrose no quadril", "artrose de quadril", "artrose quadril"], texto: "Evitar movimentos de grande amplitude no quadril e exercícios com impacto. Priorizar amplitude confortável, sem dor." },
  { keywords: ["artrose"], texto: "Evitar movimentos com muito impacto ou amplitude forçada na articulação afetada. Priorizar exercícios controlados e sem dor." },
  { keywords: ["hérnia de disco", "hernia de disco", "hernia"], texto: "Evitar exercícios com a coluna curvada sob carga (ex: levantar peso com as costas arredondadas) e evitar rotações bruscas do tronco." },
  { keywords: ["lombalgia", "dor lombar", "dor na coluna", "lombar"], texto: "Evitar exercícios que sobrecarreguem a lombar, como agachamentos muito profundos ou levantar peso com a coluna curvada." },
  { keywords: ["problema cardíaco", "problema cardiaco", "cardiopatia", "cardíaco", "cardiaco", "infarto", "coração"], texto: "Evitar treinos muito intensos ou aumentos bruscos de esforço. Aumentar a intensidade aos poucos e ficar atento a falta de ar, tontura ou dor no peito." },
  { keywords: ["hipertensão", "hipertensao", "pressão alta", "pressao alta", "hipertenso"], texto: "Evitar prender a respiração durante o esforço e evitar mudanças bruscas de posição (levantar rápido, por exemplo)." },
  { keywords: ["diabetes", "diabético", "diabetico"], texto: "Ficar atento a sinais de queda de açúcar no sangue (tontura, suor frio, tremores) durante o exercício." },
  { keywords: ["osteoporose"], texto: "Evitar exercícios de alto impacto, saltos e movimentos bruscos de flexão da coluna." },
  { keywords: ["labirintite", "tontura", "vertigem"], texto: "Evitar mudanças rápidas de posição da cabeça e exercícios que exijam muito equilíbrio sem apoio por perto." },
  { keywords: ["tendinite no ombro", "tendinite ombro", "dor no ombro", "ombro"], texto: "Evitar movimentos acima da linha da cabeça com carga alta. Parar se sentir dor durante o movimento." },
  { keywords: ["bursite"], texto: "Evitar apoio prolongado ou pressão direta sobre a articulação afetada." },
  { keywords: ["avc", "derrame"], texto: "Ter atenção redobrada ao equilíbrio. Evitar exercícios que exijam coordenação complexa sem supervisão próxima." }
];
const getSugestoesPrecaucao = (studentId, assessments, checkins) => {
  if (!studentId) return [];
  const textoPartes = [];
  const stAssess = [...assessments].filter((a) => a.studentId === studentId).sort((a, b) => b.date?.localeCompare(a.date));
  const ultima = stAssess[0];
  if (ultima?.anamnese) {
    textoPartes.push(ultima.anamnese.pathologies || "");
    textoPartes.push(ultima.anamnese.mainComplaints || "");
    textoPartes.push(ultima.anamnese.painLocation || "");
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const stCheckins = (checkins || []).filter((c) => c.student_id === studentId && c.created_at && new Date(c.created_at) >= cutoff);
  stCheckins.forEach((c) => {
    if (c.data?.obs) textoPartes.push(c.data.obs);
  });
  const textoBusca = textoPartes.join(" ").toLowerCase();
  const encontrados = [];
  PRECAUCOES_DICT.forEach((item) => {
    if (item.keywords.some((kw) => textoBusca.includes(kw))) {
      if (!encontrados.some((e) => e.texto === item.texto)) encontrados.push(item);
    }
  });
  const dorRecorrente = stCheckins.filter((c) => c.type === "pos_treino" && (c.data?.dor === "moderada" || c.data?.dor === "alta")).length;
  if (dorRecorrente >= 2) {
    encontrados.push({ keywords: [], texto: "Este aluno relatou dor moderada/alta em treinos recentes (últimos 30 dias). Considere reduzir intensidade ou ajustar exercícios até reavaliação." });
  }
  return encontrados;
};
const AtividadesExtras = ({ students, atividadesExtras, setAtividadesExtras, prefillStudentId, assessments, checkins, exerciciosBiblioteca, sessions }) => {
  const [modal, setModal] = useState(false);
  const [filterSt, setFilterSt] = useState(prefillStudentId || "");
  const emptyForm = () => ({ studentId: prefillStudentId || filterSt || "", titulo: "", obs: "", exercicios: [] });
  const [form, setForm] = useState(emptyForm());
  const [buscaEx, setBuscaEx] = useState("");
  const [semData, setSemData] = useState(false);
  const [selDates, setSelDates] = useState(() => new Set());
  const [calRef, setCalRef] = useState(() => new Date());
  const openNew = () => {
    setForm(emptyForm());
    setBuscaEx("");
    setSemData(false);
    setSelDates(new Set());
    setCalRef(new Date());
    setModal(true);
  };
  const addExercicio = (ex) => {
    setForm((f) => ({ ...f, exercicios: [...f.exercicios, { exId: ex.id, series: "3", reps: "12", descanso: "60s", obs: "" }] }));
    setBuscaEx("");
  };
  const removeExercicio = (idx) => setForm((f) => ({ ...f, exercicios: f.exercicios.filter((_, i) => i !== idx) }));
  const updateExercicio = (idx, campo, val) => setForm((f) => ({ ...f, exercicios: f.exercicios.map((it, i) => i === idx ? { ...it, [campo]: val } : it) }));
  const resultadosBusca = buscaEx.trim().length > 1 ? (exerciciosBiblioteca || []).filter((e) => (e.nome || "").toLowerCase().includes(buscaEx.trim().toLowerCase())).slice(0, 8) : [];
  const toggleDate = (iso) => setSelDates((prev) => {
    const next = new Set(prev);
    if (next.has(iso)) next.delete(iso);
    else next.add(iso);
    return next;
  });
  const toggleWeekdayInMonth = (weekday) => {
    const dias = getMonthDates(calRef.getFullYear(), calRef.getMonth()).filter((d) => d.getDay() === weekday).map(toISODateLocal);
    const allSelected = dias.every((iso) => selDates.has(iso));
    setSelDates((prev) => {
      const next = new Set(prev);
      dias.forEach((iso) => {
        if (allSelected) next.delete(iso);
        else next.add(iso);
      });
      return next;
    });
  };
  const save = () => {
    if (!form.studentId || !form.titulo.trim()) return;
    if (semData) {
      const nova = { id: uid(), studentId: form.studentId, date: null, semData: true, titulo: form.titulo.trim(), obs: form.obs.trim(), exercicios: form.exercicios };
      setAtividadesExtras((p) => [...p, nova]);
      setModal(false);
      return;
    }
    if (selDates.size === 0) return;
    const novas = [...selDates].sort().map((date) => ({ id: uid(), studentId: form.studentId, date, titulo: form.titulo.trim(), obs: form.obs.trim(), exercicios: form.exercicios }));
    setAtividadesExtras((p) => [...p, ...novas]);
    setModal(false);
  };
  const del = async (id) => {
    if (window.confirm("Remover esta atividade extra?")) {
      await DB.remove("atividades_extras", id);
      setAtividadesExtras((p) => p.filter((a) => a.id !== id));
    }
  };
  const lista = [...atividadesExtras].filter((a) => !filterSt || a.studentId === filterSt).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const diasDoMes = getMonthDates(calRef.getFullYear(), calRef.getMonth());
  const primeiroDiaSemana = diasDoMes[0].getDay();
  return React.createElement("div", null, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 20 } }, "Atividades Extras"), React.createElement(Btn, { sm: true, icon: "plus", onClick: openNew }, "Adicionar")), React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 14, lineHeight: 1.5 } }, 'Atribua aulas ou atividades extras (spinning, natação, alongamento...) que o aluno deve realizar, além do treino já programado. O aluno vê isso automaticamente no app dele, na aba "Programação".'), React.createElement("select", { value: filterSt, onChange: (e) => setFilterSt(e.target.value), style: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, marginBottom: 14 } }, React.createElement("option", { value: "" }, "Todos os alunos"), students.map((s) => React.createElement("option", { key: s.id, value: s.id }, s.name))), lista.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 40 } }, React.createElement(I, { n: "calendar", c: "#cbd5e1", s: 36 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhuma atividade extra cadastrada ainda.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, lista.map((a) => {
    const st = students.find((s) => s.id === a.studentId);
    return React.createElement(Card, { key: a.id, style: { padding: "14px 16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 } }, React.createElement("div", { style: { flex: 1 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 } }, React.createElement("span", { style: { fontWeight: 700, fontSize: 14 } }, st?.name || "Aluno"), React.createElement("span", { style: { fontSize: 11, color: "#94a3b8" } }, fmt(a.date))), React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: "#0f172a" } }, a.titulo), a.semData && React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#FF5603", marginTop: 3 } }, "🔓 Sem data fixa"), a.exercicios?.length > 0 && React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#FF5603", marginTop: 3 } }, "🏋️ ", a.exercicios.length, " exercício(s) montado(s)"), a.obs && React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2, whiteSpace: "pre-wrap" } }, a.obs), (() => {
      const sessao = (sessions || []).find((s) => s?.source === "atividade_extra" && s?.atividadeExtraId === a.id);
      if (!sessao) return null;
      const cargasArr = Object.values(sessao.cargas || {});
      return React.createElement("div", { style: { marginTop: 6, fontSize: 11, color: "#16a34a", fontWeight: 700 } }, "✅ Aluno registrou: ", sessao.completedEx, "/", sessao.totalEx, " feitos", cargasArr.length > 0 && React.createElement("span", { style: { color: "#64748b", fontWeight: 400 } }, " · ", cargasArr.map((c) => `${c.nome} ${c.carga}kg`).join(", ")));
    })()), React.createElement("button", { onClick: () => del(a.id), style: { background: "none", border: "none", cursor: "pointer", color: "#e2e8f0", padding: 4, flexShrink: 0 } }, React.createElement(I, { n: "trash", s: 15 }))));
  })), modal && React.createElement(Modal, { title: "Nova Atividade Extra", onClose: () => setModal(false) }, React.createElement(Inp, { label: "Aluno", value: form.studentId, onChange: (v) => setForm((f) => ({ ...f, studentId: v })), opts: [{ v: "", l: "Selecione..." }, ...students.map((s) => ({ v: s.id, l: s.name }))] }), React.createElement(Inp, { label: "Atividade", value: form.titulo, onChange: (v) => setForm((f) => ({ ...f, titulo: v })), placeholder: "Ex: Aula de Pilates" }), form.studentId && (() => {
    const sugestoes = getSugestoesPrecaucao(form.studentId, assessments, checkins);
    if (sugestoes.length === 0) return null;
    return React.createElement("div", { style: { marginBottom: 13, background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 10, padding: "10px 12px" } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 } }, "💡 Baseado na anamnese e check-ins deste aluno"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, sugestoes.map((s, i) => React.createElement("div", { key: i, style: { display: "flex", gap: 8, alignItems: "flex-start" } }, React.createElement("div", { style: { fontSize: 12, color: "#78350f", flex: 1, lineHeight: 1.4 } }, s.texto), React.createElement("button", { onClick: () => setForm((f) => ({ ...f, obs: (f.obs ? f.obs.trim() + "\n" : "") + s.texto })), style: { flexShrink: 0, border: "1.5px solid #f59e0b", background: "#fff", color: "#92400e", borderRadius: 7, padding: "4px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer" } }, "Usar")))));
  })(), React.createElement("div", { style: { marginBottom: 13 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 } }, "Horário / observações (opcional)"), React.createElement("textarea", { value: form.obs, onChange: (e) => setForm((f) => ({ ...f, obs: e.target.value })), placeholder: "Ex: 09h no estúdio. Levar tênis fechado e garrafa d'água. Chegar 10 min antes.", rows: 4, style: { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, color: "#0f172a", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" } }), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 4 } }, 'O aluno vê isso tocando em "Ver detalhes" no app dele.')), React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#FF5603", marginBottom: 8, marginTop: 4, paddingTop: 10, borderTop: "1px solid #f1f5f9" } }, "🏋️ Exercícios específicos (opcional)"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 8 } }, "Monte um treino de verdade pra essa atividade — o aluno vê os exercícios com foto/vídeo, igual ao treino normal."), React.createElement("input", { value: buscaEx, onChange: (e) => setBuscaEx(e.target.value), placeholder: "Buscar exercício na biblioteca...", style: { width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 13, marginBottom: 6, boxSizing: "border-box" } }), resultadosBusca.length > 0 && React.createElement("div", { style: { border: "1.5px solid #e2e8f0", borderRadius: 9, marginBottom: 10, overflow: "hidden" } }, resultadosBusca.map((ex) => React.createElement("button", { key: ex.id, onClick: () => addExercicio(ex), style: { display: "block", width: "100%", textAlign: "left", border: "none", borderBottom: "1px solid #f1f5f9", background: "#fff", padding: "9px 12px", fontSize: 13, cursor: "pointer", color: "#0f172a" } }, "+ ", ex.nome))), form.exercicios.length > 0 && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 } }, form.exercicios.map((it, idx) => {
    const ex = (exerciciosBiblioteca || []).find((e) => e.id === it.exId);
    return React.createElement("div", { key: idx, style: { border: "1.5px solid #e2e8f0", borderRadius: 9, padding: "9px 12px", background: "#f8fafc" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } }, React.createElement("span", { style: { fontSize: 13, fontWeight: 700 } }, ex?.nome || "Exercício"), React.createElement("button", { onClick: () => removeExercicio(idx), style: { border: "none", background: "none", color: "#cbd5e1", cursor: "pointer", padding: 2 } }, React.createElement(I, { n: "trash", s: 14 }))), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 } }, React.createElement("input", { value: it.series, onChange: (e) => updateExercicio(idx, "series", e.target.value), placeholder: "Séries", style: { padding: "6px 8px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 12, textAlign: "center" } }), React.createElement("input", { value: it.reps, onChange: (e) => updateExercicio(idx, "reps", e.target.value), placeholder: "Reps", style: { padding: "6px 8px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 12, textAlign: "center" } }), React.createElement("input", { value: it.descanso, onChange: (e) => updateExercicio(idx, "descanso", e.target.value), placeholder: "Descanso", style: { padding: "6px 8px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 12, textAlign: "center" } })));
  })), React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 9, padding: "10px 12px", margin: "14px 0" } }, React.createElement("div", null, React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#0f172a" } }, "🔓 Sem data fixa"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 1 } }, "Aparece pro aluno todo dia, na tela inicial, até ele fazer — sem precisar escolher datas.")), React.createElement("button", { onClick: () => setSemData((v) => !v), style: { flexShrink: 0, width: 44, height: 26, borderRadius: 99, border: "none", background: semData ? "#FF5603" : "#e2e8f0", position: "relative", cursor: "pointer" } }, React.createElement("div", { style: { position: "absolute", top: 3, left: semData ? 21 : 3, width: 20, height: 20, borderRadius: 99, background: "#fff", transition: "left 0.15s" } }))), !semData && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", margin: "14px 0 8px" } }, "Em quais dias?"), React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 } }, React.createElement("button", { onClick: () => setCalRef((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)), style: { border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#475569" } }, "‹"), React.createElement("div", { style: { fontSize: 13, fontWeight: 700 } }, MESES_NOME[calRef.getMonth()], " de ", calRef.getFullYear()), React.createElement("button", { onClick: () => setCalRef((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)), style: { border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#475569" } }, "›")), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 6 } }, "Toque num dia da semana pra marcar/desmarcar todo mundo dele nesse mês:"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 } }, DIAS_SEMANA_CURTO.map((d, i) => React.createElement("button", { key: i, onClick: () => toggleWeekdayInMonth(i), style: { border: "none", background: "#f1f5f9", borderRadius: 6, padding: "5px 0", fontSize: 10, fontWeight: 700, color: "#64748b", cursor: "pointer" } }, d))), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 } }, Array.from({ length: primeiroDiaSemana }).map((_, i) => React.createElement("div", { key: "pad" + i })), diasDoMes.map((d) => {
    const iso = toISODateLocal(d);
    const sel = selDates.has(iso);
    const isHoje = iso === todayStr();
    return React.createElement("button", { key: iso, onClick: () => toggleDate(iso), style: { aspectRatio: "1", border: isHoje && !sel ? "1.5px solid " + O : "none", background: sel ? O : "#f8fafc", color: sel ? "#fff" : "#0f172a", borderRadius: 8, fontSize: 12, fontWeight: sel ? 800 : 500, cursor: "pointer" } }, d.getDate());
  })), React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: O, marginBottom: 14 } }, selDates.size, " dia(s) selecionado(s)")), React.createElement(Btn, { full: true, onClick: save, disabled: !form.studentId || !form.titulo.trim() || !semData && selDates.size === 0 }, semData ? "Salvar (sem data fixa)" : `Salvar ${selDates.size > 0 ? `(${selDates.size} dia${selDates.size > 1 ? "s" : ""})` : ""}`)));
};
const PrintStyle = () => React.createElement("style", null, `
@media print {
body { background: white !important; font-size: 12px; }
.no-print { display: none !important; }
nav, .bottom-nav { display: none !important; }
.print-page { padding: 16px !important; max-width: 100% !important; }
.print-break { page-break-before: always; }
@page { margin: 12mm 15mm; size: A4; }
/* Títulos ficam com seu bloco */
h1, h2, h3, h4 { page-break-after: avoid; }
/* Tabelas não quebram no meio */
table { page-break-inside: avoid; border-collapse: collapse; width: 100%; }
thead { display: table-header-group; }
tr { page-break-inside: avoid; page-break-after: auto; }
td, th { padding: 6px 8px !important; font-size: 11px !important; }
/* Seções do relatório */
.report-section { page-break-inside: avoid; margin-bottom: 12px; }
/* Assinatura sempre no final da página atual */
.prof-footer { page-break-inside: avoid; margin-top: 20px; }
/* Remover sombras e backgrounds para impressão limpa */
* { box-shadow: none !important; }
img { max-height: 60px !important; }
}
`);
const PROF = { name: "Wellington Brito", cref: "089836-G/SP", title: "Personal Trainer", specialty: "Envelhecimento e Longevidade", company: "Longevus Treinamento Neurofuncional" };
const ProfHeader = () => React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #FF5603", paddingBottom: 14, marginBottom: 20 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, React.createElement("img", { src: __LOGO_1__, alt: "Longevus", style: { height: 48, width: "auto" } })), React.createElement("div", { style: { textAlign: "right" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#0f172a" } }, PROF.name), React.createElement("div", { style: { fontSize: 11, color: "#64748b" } }, PROF.title, " · CREF ", PROF.cref), React.createElement("div", { style: { fontSize: 11, color: "#FF5603", fontWeight: 700 } }, PROF.specialty)));
const ProfFooter = ({ extra }) => React.createElement("div", { style: { borderTop: "1.5px solid #e2e8f0", marginTop: 32, paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end" } }, React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, React.createElement("div", null, "Documento gerado pelo sistema Longevus"), React.createElement("div", null, (new Date()).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })), extra && React.createElement("div", { style: { marginTop: 4, color: "#64748b" } }, extra)), React.createElement("div", { style: { textAlign: "right" } }, React.createElement("div", { style: { width: 160, borderTop: "1px solid #334155", paddingTop: 6, marginTop: 32 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#0f172a" } }, PROF.name), React.createElement("div", { style: { fontSize: 10, color: "#64748b" } }, PROF.title, " · CREF ", PROF.cref), React.createElement("div", { style: { fontSize: 10, color: "#FF5603", fontWeight: 600 } }, PROF.specialty))));
const AIReportDisplay = ({ text, title }) => {
  if (!text?.trim()) return null;
  return React.createElement("div", { style: { marginTop: 20 } }, React.createElement("div", { style: { borderBottom: "2px solid #FF560322", paddingBottom: 8, marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 14, color: "#0f172a" } }, title), React.createElement("div", { style: { fontSize: 11, color: "#64748b" } }, "Prof. ", PROF.name, " · CREF ", PROF.cref)), React.createElement("div", { style: { fontSize: 13, color: "#334155", lineHeight: 1.8, whiteSpace: "pre-wrap" } }, text));
};
const ReportClinical = ({ assessment: a, student: st, notesClinical = "", notesConduct = "", notesGoals = "" }) => {
  if (!a || !st) return null;
  const sex = st.sex || "";
  const modAtivos = a.modAtivos || { questionarios: true, fisico: true, cognitivo: true };
  const gc = classifyGlobal(a.globalScore || 0);
  const ahaCl = classifyAHA(a.aha?.score || 0);
  const funcCl = classifyFunctional(a.functional?.score || 0);
  const fitCl = classifyFitness(a.physical?.score || 0);
  const cvScore = Math.max(0, Math.round(100 - (a.aha?.score || 0) / 13 * 100));
  const recs = getRecommendations(null, null, null);
  const riskFlags = [];
  if (a.parqApplied && a.parqFailed) riskFlags.push("PAR-Q Positivo");
  if ((a.aha?.score || 0) >= 4) riskFlags.push("Alto Risco Cardiovascular (AHA)");
  if (a.aha?.calf && parseFloat(a.aha.calf) < 31) riskFlags.push("Risco de Sarcopenia (Panturrilha < 31 cm)");
  if ((a.functional?.score || 0) < 40) riskFlags.push("Capacidade Funcional Comprometida");
  if ((a.physical?.score || 0) < 40) riskFlags.push("Aptidão Física Insuficiente");
  const Row = ({ label, value, unit = "" }) => React.createElement("div", { style: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9" } }, React.createElement("span", { style: { fontSize: 12, color: "#475569" } }, label), React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "#0f172a" } }, value || "—", value && unit ? " " + unit : ""));
  return React.createElement("div", { className: "print-page", style: { padding: 20 } }, React.createElement(ProfHeader, null), React.createElement("div", { style: { background: "linear-gradient(135deg,#fff4ee,#fff)", border: "1.5px solid #FF560322", borderRadius: 12, padding: "14px 18px", marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 17, color: "#0f172a", marginBottom: 4 } }, "Relatório de Avaliação Física Integrada"), React.createElement("div", { style: { fontSize: 12, color: "#64748b" } }, "Data: ", fmt(a.date), " · Protocolo Longevus v1.0 (AHA/ACSM/Spirduso)")), React.createElement("div", { className: "report-section", style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 } }, "Identificação do Aluno"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 } }, React.createElement(Row, { label: "Nome", value: st.name }), React.createElement(Row, { label: "Idade", value: calcAge(st.dob), unit: "anos" }), React.createElement(Row, { label: "Sexo", value: st.sex === "M" ? "Masculino" : st.sex === "F" ? "Feminino" : "—" }), React.createElement(Row, { label: "Data de Nascimento", value: fmt(st.dob) })), st.notes && React.createElement("div", { style: { marginTop: 8, fontSize: 12, color: "#64748b", background: "#f8fafc", borderRadius: 8, padding: "8px 12px" } }, "Obs: ", st.notes)), a.anamnese && (a.anamnese.pathologies || a.anamnese.medications || a.anamnese.allergies || a.anamnese.surgeries || a.anamnese.mainComplaints || a.anamnese.goals) && React.createElement("div", { className: "report-section", style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 } }, "Anamnese Clínica"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 } }, a.anamnese.pathologies && React.createElement(Row, { label: "Patologias / Doenças", value: a.anamnese.pathologies }), a.anamnese.medications && React.createElement(Row, { label: "Medicamentos em uso", value: a.anamnese.medications }), a.anamnese.allergies && React.createElement(Row, { label: "Alergias", value: a.anamnese.allergies }), a.anamnese.surgeries && React.createElement(Row, { label: "Cirurgias / Procedimentos", value: a.anamnese.surgeries }), a.anamnese.mainComplaints && React.createElement(Row, { label: "Queixas / Sintomas", value: a.anamnese.mainComplaints }), a.anamnese.painLocation && React.createElement(Row, { label: "Localização de dores", value: a.anamnese.painLocation }), a.anamnese.goals && React.createElement(Row, { label: "Objetivos", value: a.anamnese.goals })), (a.anamnese.physActivityHistory || a.anamnese.sleepHours || a.anamnese.sleepQuality || a.anamnese.dietQuality || a.anamnese.stressLevel || a.anamnese.smoking || a.anamnese.alcohol) && React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, marginTop: 6 } }, a.anamnese.physActivityHistory && React.createElement(Row, { label: "Atividade física", value: { nunca: "Nunca praticou", passado: "Praticou no passado", irregular: "Pratica irregularmente", regular: "Pratica regularmente" }[a.anamnese.physActivityHistory] || a.anamnese.physActivityHistory }), a.anamnese.physActivityType && React.createElement(Row, { label: "Modalidade(s)", value: a.anamnese.physActivityType }), a.anamnese.physActivityFreq && React.createElement(Row, { label: "Frequência semanal", value: a.anamnese.physActivityFreq }), a.anamnese.sleepHours && React.createElement(Row, { label: "Horas de sono/noite", value: a.anamnese.sleepHours }), a.anamnese.sleepQuality && React.createElement(Row, { label: "Qualidade do sono", value: { ruim: "Ruim", regular: "Regular", boa: "Boa", otima: "Ótima" }[a.anamnese.sleepQuality] || a.anamnese.sleepQuality }), a.anamnese.dietQuality && React.createElement(Row, { label: "Qualidade da alimentação", value: { ruim: "Ruim", regular: "Regular", boa: "Boa", otima: "Ótima" }[a.anamnese.dietQuality] || a.anamnese.dietQuality }), a.anamnese.stressLevel && React.createElement(Row, { label: "Nível de estresse", value: { baixo: "Baixo", moderado: "Moderado", alto: "Alto", muito_alto: "Muito alto" }[a.anamnese.stressLevel] || a.anamnese.stressLevel }), a.anamnese.smoking && React.createElement(Row, { label: "Tabagismo", value: { nao: "Não fuma", ex: "Ex-fumante", sim: "Fumante" }[a.anamnese.smoking] || a.anamnese.smoking }), a.anamnese.alcohol && React.createElement(Row, { label: "Consumo de álcool", value: { nao: "Não consome", ocasional: "Ocasional", regular: "Regular" }[a.anamnese.alcohol] || a.anamnese.alcohol })), a.anamnese.observations && React.createElement("div", { style: { marginTop: 8, fontSize: 12, color: "#64748b", background: "#f8fafc", borderRadius: 8, padding: "8px 12px" } }, "Obs: ", a.anamnese.observations)), riskFlags.length > 0 && React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 } }, "⚠️ Alertas Identificados"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, riskFlags.map((f, i) => React.createElement("div", { key: i, style: { background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 600, color: "#dc2626" } }, "• ", f)))), React.createElement("div", { className: "report-section", style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 } }, "Índices Longevus"), (() => {
    const indices = [
      ...modAtivos.questionarios ? [["Risco Cardiovascular", cvScore, classifyCV(cvScore)], ["Capacidade Funcional", a.functional?.score || 0, funcCl]] : [],
      ...modAtivos.fisico ? [["Aptidão Física", a.physical?.score || 0, fitCl]] : [],
      ...a.cognitiveData?.score > 0 ? [["Capacidade Cognitiva", a.cognitiveData.score, classifyCognitive(a.cognitiveData.score)]] : [],
      ["Índice Global", a.globalScore || 0, gc]
    ];
    return React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(" + indices.length + ",1fr)", gap: 10 } }, indices.map(([lbl, val, cl]) => React.createElement("div", { key: lbl, style: { background: cl.bg, border: "1.5px solid " + cl.color + "33", borderRadius: 10, padding: "12px 8px", textAlign: "center" } }, React.createElement("div", { style: { fontSize: 26, fontWeight: 900, color: cl.color } }, Math.round(val)), React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: cl.color, marginBottom: 3 } }, cl.label), React.createElement("div", { style: { fontSize: 10, color: "#64748b" } }, lbl))));
  })()), a.parqApplied && React.createElement("div", { className: "report-section", style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 } }, "PAR-Q"), React.createElement("div", { style: { background: a.parqFailed ? "#fee2e2" : "#dcfce7", border: `1px solid ${a.parqFailed ? "#fca5a5" : "#86efac"}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, fontWeight: 700, color: a.parqFailed ? "#dc2626" : "#16a34a" } }, a.parqFailed ? "⚠️ PAR-Q POSITIVO — Avaliação médica recomendada antes de iniciar programa de exercícios." : "✅ PAR-Q Negativo — Sem contraindicações identificadas pelo questionário.")), modAtivos.questionarios && React.createElement("div", { className: "report-section", style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 } }, "Risco Cardiovascular (AHA)"), React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 } }, React.createElement(Badge, { color: ahaCl.color, bg: ahaCl.bg }, ahaCl.label, " — Score: ", a.aha?.score)), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 } }, [["Peso", a.aha?.weight, "kg"], ["Altura", a.aha?.height, "cm"], ["IMC", a.aha?.bmi, "kg/m²"], ["PAS", a.aha?.sbp, "mmHg"], ["PAD", a.aha?.dbp, "mmHg"], ["FC Rep.", a.aha?.hr, "bpm"], ["Cintura", a.aha?.waist, "cm"], ["Quadril", a.aha?.hip, "cm"], ["Panturrilha", a.aha?.calf, "cm"]].map(([k, v, u]) => React.createElement("div", { key: k, style: { background: "#f8fafc", borderRadius: 8, padding: "8px 10px" } }, React.createElement("div", { style: { fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" } }, k), React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#0f172a" } }, v || "—", v && u ? " " + u : "")))), React.createElement("div", { style: { marginTop: 10, display: "flex", flexDirection: "column", gap: 8 } }, a.aha?.bmi && React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 3 } }, "IMC:"), React.createElement(TestResult, { cl: classifyBMI(a.aha.bmi) })), a.aha?.waist && a.aha?.hip && React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 3 } }, "RCQ — Relação Cintura-Quadril:"), React.createElement(TestResult, { cl: classifyRCQ(a.aha.waist, a.aha.hip, sex) })), a.aha?.calf && React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 3 } }, "Panturrilha — Risco de Sarcopenia:"), React.createElement(TestResult, { cl: classifyCalf(a.aha.calf, sex) }))), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 } }, [["smoker", "Tabagismo"], ["diabetes", "Diabetes"], ["hypertension", "Hipertensão"], ["hyperlipid", "Dislipidemia"], ["family", "Hist. Familiar DCV"]].filter(([k]) => a.aha?.[k]).map(([k, l]) => React.createElement(Badge, { key: k, color: "#dc2626", bg: "#fee2e2" }, l)))), modAtivos.questionarios && React.createElement("div", { className: "report-section", style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 } }, "Capacidade Funcional (Spirduso)"), React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 } }, React.createElement(Badge, { color: funcCl.color, bg: funcCl.bg }, funcCl.label, " — Score: ", a.functional?.score, "/100")), a.avd && React.createElement("div", { style: { marginBottom: 10 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 } }, "AVDs — Atividades Básicas da Vida Diária:"), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, [["Alimentação", a.avd.eating], ["Banho", a.avd.bathing], ["Vestuário", a.avd.dressing], ["Higiene pessoal", a.avd.toileting], ["Transferência", a.avd.transferring]].map(([k, v]) => React.createElement("div", { key: k, style: { background: "#f8fafc", borderRadius: 7, padding: "5px 10px", fontSize: 11 } }, React.createElement("span", { style: { color: "#94a3b8" } }, k, ": "), React.createElement("span", { style: { fontWeight: 700, color: v === 2 ? "#16a34a" : v === 1 ? "#d97706" : "#dc2626" } }, v === 2 ? "Independente" : v === 1 ? "Com auxílio" : "Dependente"))))), a.aivd && React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 } }, "AIVDs — Atividades Instrumentais:"), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, [["Compras", a.aivd.shopping], ["Finanças", a.aivd.finance], ["Transporte", a.aivd.transport], ["Medicação", a.aivd.medication], ["Tarefas domésticas", a.aivd.housework], ["Telefone/Celular", a.aivd.telephone]].map(([k, v]) => React.createElement("div", { key: k, style: { background: "#f8fafc", borderRadius: 7, padding: "5px 10px", fontSize: 11 } }, React.createElement("span", { style: { color: "#94a3b8" } }, k, ": "), React.createElement("span", { style: { fontWeight: 700, color: v === 2 ? "#16a34a" : v === 1 ? "#d97706" : "#dc2626" } }, v === 2 ? "Independente" : v === 1 ? "Com auxílio" : "Dependente")))))), modAtivos.fisico && React.createElement("div", { className: "report-section", style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 } }, "Testes Físicos"), React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" } }, React.createElement(Badge, { color: fitCl.color, bg: fitCl.bg }, fitCl.label, " — Score: ", a.physical?.score, "/100")), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginTop: 10 } }, [
    ["SPPB — Equilíbrio", a.physical?.sppbBalanceScore !== void 0 ? String(a.physical.sppbBalanceScore) : null, (v) => classifySPPBBalanceScore(v), "pts"],
    ["SPPB — Teste de Sentar e Levantar", a.physical?.sppbChairUnable ? "unable" : a.physical?.sppbChair || null, (v) => classifySPPBChairStand(v), a.physical?.sppbChairUnable ? "" : "seg"],
    ["Preensão Manual", a.physical?.grip, (v) => classifyHandGrip(v, sex), "kgf"],
    ["TUG — Timed Up and Go", a.physical?.tug, classifyTUG, "seg"],
    ["Sentar e Alcançar", a.physical?.sitreach, classifySitReach, "cm"],
    ["Marcha Estacionária 2min", a.physical?.march, (v) => classifyMarch(v, sex), "passos"]
  ].map(([name, val, clFn, unit]) => {
    if (!val && val !== "0") return null;
    const cl = clFn(val);
    if (!cl) return null;
    return React.createElement("div", { key: name, style: { background: "#f8fafc", borderRadius: 9, padding: "10px 12px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 } }, React.createElement("div", { style: { flex: 1 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 3 } }, name), React.createElement("div", { style: { fontSize: 11, color: "#64748b", lineHeight: 1.4 } }, cl.desc)), React.createElement("div", { style: { textAlign: "right", flexShrink: 0 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 14, color: "#0f172a" } }, val, " ", unit), React.createElement(Badge, { color: cl.color, bg: cl.bg }, cl.label)));
  }))), React.createElement(AIReportDisplay, { text: notesClinical, title: "Observações Gerais — Prof. Wellington Brito · CREF 089836-G/SP" }), React.createElement(AIReportDisplay, { text: notesConduct, title: "Conduta Proposta — Prof. Wellington Brito · CREF 089836-G/SP" }), React.createElement(AIReportDisplay, { text: notesGoals, title: "Metas do Período — Prof. Wellington Brito · CREF 089836-G/SP" }), a?.cognitiveData?.score > 0 && React.createElement("div", { className: "report-section", style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 } }, "Avaliação Cognitiva — Bateria Longevus"), React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 } }, (() => {
    const cs = a.cognitiveData.score;
    const cl = cs >= 80 ? { label: "Excelente", color: "#16a34a", bg: "#dcfce7" } : cs >= 65 ? { label: "Bom", color: "#65a30d", bg: "#ecfccb" } : cs >= 50 ? { label: "Regular", color: "#d97706", bg: "#fef9c3" } : { label: "Comprometido", color: "#dc2626", bg: "#fee2e2" };
    return React.createElement(Badge, { color: cl.color, bg: cl.bg }, "Score Cognitivo Longevus: ", cs, " — ", cl.label);
  })()), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 12 } }, a.cognitiveData.mmse?.total && (() => {
    const cl = classifyMMSE(a.cognitiveData.mmse.total);
    return cl ? React.createElement("div", { style: { background: cl.bg, border: "1px solid " + cl.color + "33", borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" } }, "MMSE — Triagem Cognitiva"), React.createElement("div", { style: { fontSize: 22, fontWeight: 900, color: cl.color } }, a.cognitiveData.mmse.total, React.createElement("span", { style: { fontSize: 12, fontWeight: 400 } }, "/30")), React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: cl.color } }, cl.label), React.createElement("div", { style: { fontSize: 11, color: "#475569", marginTop: 3, lineHeight: 1.4 } }, cl.desc)) : null;
  })(), a.cognitiveData.dualTask?.single && a.cognitiveData.dualTask?.dual && (() => {
    const cl = classifyDualTask(a.cognitiveData.dualTask.single, a.cognitiveData.dualTask.dual);
    return cl ? React.createElement("div", { style: { background: cl.bg, border: "1px solid " + cl.color + "33", borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" } }, "Dual Task Cost"), React.createElement("div", { style: { fontSize: 22, fontWeight: 900, color: cl.color } }, cl.cost, React.createElement("span", { style: { fontSize: 12, fontWeight: 400 } }, "%")), React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: cl.color } }, cl.label), React.createElement("div", { style: { fontSize: 11, color: "#475569", marginTop: 3, lineHeight: 1.4 } }, cl.desc)) : null;
  })(), a.cognitiveData.verbalFluency?.score && (() => {
    const cl = classifyVerbalFluency(a.cognitiveData.verbalFluency.score);
    return cl ? React.createElement("div", { style: { background: cl.bg, border: "1px solid " + cl.color + "33", borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" } }, "Fluência Verbal"), React.createElement("div", { style: { fontSize: 22, fontWeight: 900, color: cl.color } }, a.cognitiveData.verbalFluency.score, React.createElement("span", { style: { fontSize: 12, fontWeight: 400 } }, " palavras")), React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: cl.color } }, cl.label), React.createElement("div", { style: { fontSize: 11, color: "#475569", marginTop: 3, lineHeight: 1.4 } }, cl.desc)) : null;
  })(), a.cognitiveData.digitSpan?.direct && (() => {
    const cl = classifyDigitSpan(a.cognitiveData.digitSpan.direct, a.cognitiveData.digitSpan.inverse);
    return cl ? React.createElement("div", { style: { background: cl.bg, border: "1px solid " + cl.color + "33", borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" } }, "Span de Dígitos"), React.createElement("div", { style: { fontSize: 22, fontWeight: 900, color: cl.color } }, a.cognitiveData.digitSpan.direct, "↑ ", a.cognitiveData.digitSpan.inverse ? a.cognitiveData.digitSpan.inverse + "↓" : ""), React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: cl.color } }, cl.label), React.createElement("div", { style: { fontSize: 11, color: "#475569", marginTop: 3, lineHeight: 1.4 } }, cl.desc)) : null;
  })()), a.cognitiveData.notes && React.createElement("div", { style: { fontSize: 11, color: "#64748b", background: "#f8fafc", borderRadius: 8, padding: "8px 12px" } }, "📝 Observações: ", a.cognitiveData.notes)), a?.cardioMode && a.cardioMode !== "skip" && React.createElement("div", { className: "report-section", style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 } }, "Avaliação Cardiorrespiratória"), React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 } }, React.createElement(Badge, { color: a.cardioMode === "ergo" ? "#16a34a" : "#d97706", bg: a.cardioMode === "ergo" ? "#dcfce7" : "#fef9c3" }, a.cardioMode === "ergo" ? "🟢 Baseado em Teste Ergométrico" : "🟡 Baseado em Predição Clínica")), a.cardioMode === "ergo" && a.cardioAssessment?.ergo && (() => {
    const e = a.cardioAssessment.ergo;
    const vo2 = e.vo2max || (e.mets ? (parseFloat(e.mets) * 3.5).toFixed(1) : null);
    const vo2cl = vo2 ? classifyVO2(vo2, calcAge(st?.dob), sex) : null;
    const fcMax = parseFloat(e.fcMax), fcRest = parseFloat(e.fcRest);
    const fcRes = fcMax && fcRest ? fcMax - fcRest : null;
    const dp = fcMax && e.pasPeak ? Math.round(fcMax * parseFloat(e.pasPeak)) : null;
    const metCl = metClass(e.mets);
    const hasBeta = e.medications?.includes("beta");
    const hasArr = e.arrythmias?.length > 0 && !e.arrythmias.includes("none");
    return React.createElement("div", null, React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 12 } }, [
      ["FC Repouso", e.fcRest, "bpm"],
      ["FC Máxima", e.fcMax, "bpm"],
      ["METs", e.mets, "METs"],
      ["PAS Repouso", e.pasSit, "mmHg"],
      ["PAS Pico", e.pasPeak, "mmHg"],
      ["FC Reserva", fcRes, fcRes ? "bpm" : null],
      ["Duplo Produto", dp ? dp.toLocaleString("pt-BR") : null, dp ? "mmHg·bpm" : null],
      ["FC Limiar Isq.", e.fcIschemic ? e.fcIschemic + " bpm" : null, null],
      ["Zona Segura", e.fcIschemic ? parseFloat(e.fcIschemic) - 10 + " bpm" : null, null]
    ].filter(([, v]) => v).map(([k, v, u]) => React.createElement("div", { key: k, style: { background: "#f8fafc", borderRadius: 8, padding: "8px 10px" } }, React.createElement("div", { style: { fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" } }, k), React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: "#0f172a" } }, v, u ? " " + u : "")))), vo2 && React.createElement("div", { style: { background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px", marginBottom: 10 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#16a34a" } }, "🫁 VO₂máx — ", e.vo2measured ? "Medido" : "Estimado (METs×3.5)"), React.createElement("div", { style: { fontWeight: 900, fontSize: 18, color: "#16a34a" } }, parseFloat(vo2).toFixed(1), " ml/kg/min")), vo2cl && React.createElement("div", { style: { background: vo2cl.bg, borderRadius: 8, padding: "8px 12px" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: vo2cl.color } }, vo2cl.label), React.createElement("div", { style: { fontSize: 11, color: "#475569" } }, vo2cl.desc)), metCl && React.createElement("div", { style: { marginTop: 8 } }, React.createElement(TestResult, { cl: metCl }))), fcMax > 0 && React.createElement("div", { style: { marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#475569", marginBottom: 8 } }, "Zonas de Treinamento Aeróbio"), hasBeta && React.createElement("div", { style: { background: "#eef2ff", borderRadius: 8, padding: "7px 12px", marginBottom: 8, fontSize: 11, fontWeight: 700, color: "#6366f1" } }, "💊 Beta-bloqueador: priorizar PSE/Borg + sintomas"), React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 11 } }, React.createElement("thead", null, React.createElement("tr", { style: { background: "#f8fafc" } }, ["Intensidade", fcRes ? "FC Karvonen" : null, "%FCmáx", "PSE (0–10)", "Zona"].filter(Boolean).map((h) => React.createElement("th", { key: h, style: { padding: "6px 8px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "1.5px solid #e2e8f0" } }, h)))), React.createElement("tbody", null, [0.4, 0.5, 0.6, 0.7, 0.8].map((p) => {
      const karv = fcRes ? Math.round(fcRes * p + fcRest) : null;
      const pctFc = Math.round(fcMax * p);
      const safe = e.fcIschemic ? (karv || pctFc) < parseFloat(e.fcIschemic) - 10 : true;
      const borg = p <= 0.5 ? "2–3" : p <= 0.6 ? "4–5" : p <= 0.7 ? "5–6" : "6–7";
      const zona = p <= 0.5 ? "Leve" : p <= 0.6 ? "Moderada" : p <= 0.7 ? "Mod-Vigorosa" : "Vigorosa";
      const color = safe ? "#16a34a" : "#dc2626";
      return React.createElement("tr", { key: p, style: { borderBottom: "1px solid #f1f5f9" } }, React.createElement("td", { style: { padding: "6px 8px", fontWeight: 800 } }, Math.round(p * 100), "%"), fcRes && React.createElement("td", { style: { padding: "6px 8px", fontWeight: 800, color } }, karv, " bpm", !safe ? " ⚠️" : ""), React.createElement("td", { style: { padding: "6px 8px", color: "#475569" } }, pctFc, " bpm"), React.createElement("td", { style: { padding: "6px 8px", color: "#64748b" } }, borg), React.createElement("td", { style: { padding: "6px 8px" } }, React.createElement(Badge, { color, bg: color + "18" }, safe ? zona : "Restrita ⚠️")));
    })))), React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, hasBeta && React.createElement(Badge, { color: "#6366f1", bg: "#eef2ff" }, "💊 Beta-bloqueador"), hasArr && React.createElement(Badge, { color: "#dc2626", bg: "#fee2e2" }, "⚠️ Arritmia detectada"), e.symptomType && e.symptomType !== "" && React.createElement(Badge, { color: "#ea580c", bg: "#ffedd5" }, "🚩 ", { chest: "Dor torácica", dyspnea: "Dispneia", fatigue: "Fadiga", dizziness: "Tontura", palp: "Palpitação", other: "Outro" }[e.symptomType])), e.ecgObs && React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 8 } }, "ECG: ", e.ecgObs));
  })(), a.cardioMode === "pred" && a.cardioAssessment?.pred && (() => {
    const p = a.cardioAssessment.pred;
    const age3 = parseFloat(p.age || calcAge(st?.dob));
    const fcMax2 = p.formula === "tanaka" ? Math.round(208 - 0.7 * age3) : 220 - age3;
    const fcRes2 = p.fcRest ? fcMax2 - parseFloat(p.fcRest) : null;
    const risk = riskStratify(p);
    const hasBeta2 = p.medications?.includes("beta");
    return React.createElement("div", null, React.createElement("div", { style: { background: risk.bg, border: `1.5px solid ${risk.color}33`, borderRadius: 10, padding: "12px", marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 14, color: risk.color, marginBottom: 4 } }, risk.label), React.createElement("div", { style: { fontSize: 12, color: "#334155" } }, "Zona recomendada: ", React.createElement("strong", null, risk.fcr), " · Borg: ", React.createElement("strong", null, risk.borg)), risk.alert && React.createElement("div", { style: { fontSize: 11, color: risk.color, fontWeight: 700, marginTop: 4 } }, "⚠️ ", risk.alert)), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 10 } }, React.createElement("div", { style: { background: "#f8fafc", borderRadius: 8, padding: "8px 10px" } }, React.createElement("div", { style: { fontSize: 9, color: "#94a3b8", fontWeight: 700 } }, "FCmáx ESTIMADA"), React.createElement("div", { style: { fontSize: 16, fontWeight: 900, color: "#FF5603" } }, fcMax2, " bpm"), React.createElement("div", { style: { fontSize: 9, color: "#64748b" } }, p.formula === "tanaka" ? "Tanaka" : "Trad.")), fcRes2 && React.createElement("div", { style: { background: "#f8fafc", borderRadius: 8, padding: "8px 10px" } }, React.createElement("div", { style: { fontSize: 9, color: "#94a3b8", fontWeight: 700 } }, "FC RESERVA"), React.createElement("div", { style: { fontSize: 16, fontWeight: 900, color: "#6366f1" } }, fcRes2, " bpm"))), React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#475569", marginBottom: 8 } }, "Zonas de Treinamento Estimadas"), hasBeta2 && React.createElement("div", { style: { background: "#eef2ff", borderRadius: 8, padding: "7px 12px", marginBottom: 8, fontSize: 11, fontWeight: 700, color: "#6366f1" } }, "💊 Beta-bloqueador: priorizar PSE/Borg + sintomas"), React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 11 } }, React.createElement("thead", null, React.createElement("tr", { style: { background: "#f8fafc" } }, ["Intensidade", fcRes2 ? "FC Karvonen" : null, "%FCmáx", "PSE (0–10)", "Zona"].filter(Boolean).map((h) => React.createElement("th", { key: h, style: { padding: "6px 8px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "1.5px solid #e2e8f0" } }, h)))), React.createElement("tbody", null, [0.4, 0.5, 0.6, 0.7, 0.8].map((p2) => {
      const karv2 = fcRes2 ? Math.round(fcRes2 * p2 + parseFloat(p.fcRest)) : null;
      const pctFc2 = Math.round(fcMax2 * p2);
      const borg2 = p2 <= 0.5 ? "2–3" : p2 <= 0.6 ? "4–5" : p2 <= 0.7 ? "5–6" : "6–7";
      const zona2 = p2 <= 0.5 ? "Leve" : p2 <= 0.6 ? "Moderada" : p2 <= 0.7 ? "Mod-Vigorosa" : "Vigorosa";
      const color2 = "#16a34a";
      return React.createElement("tr", { key: p2, style: { borderBottom: "1px solid #f1f5f9" } }, React.createElement("td", { style: { padding: "6px 8px", fontWeight: 800 } }, Math.round(p2 * 100), "%"), fcRes2 && React.createElement("td", { style: { padding: "6px 8px", fontWeight: 800, color: color2 } }, karv2, " bpm"), React.createElement("td", { style: { padding: "6px 8px", color: "#475569" } }, pctFc2, " bpm"), React.createElement("td", { style: { padding: "6px 8px", color: "#64748b" } }, borg2), React.createElement("td", { style: { padding: "6px 8px" } }, React.createElement(Badge, { color: color2, bg: color2 + "18" }, zona2)));
    }))));
  })()), React.createElement(ProfFooter, { extra: `Avaliação realizada em ${fmt(a.date)}` }));
};
const ReportReferral = ({ assessment: a, student: st, notesReferral = "" }) => {
  if (!a || !st) return null;
  const ahaCl = classifyAHA(a.aha?.score || 0);
  const funcCl = classifyFunctional(a.functional?.score || 0);
  const findings = [];
  if (a.parqFailed) findings.push("Questionário PAR-Q positivo, com respostas afirmativas a questões de saúde cardiovascular e/ou musculoesquelética");
  if ((a.aha?.score || 0) >= 4) findings.push(`Risco cardiovascular classificado como ALTO pela escala AHA (score ${a.aha?.score})`);
  if (a.aha?.sbp && parseFloat(a.aha.sbp) >= 140) findings.push(`Pressão arterial sistólica elevada (${a.aha.sbp}/${a.aha.dbp} mmHg)`);
  if (a.aha?.bmi && parseFloat(a.aha.bmi) >= 30) findings.push(`IMC indicativo de obesidade (${a.aha.bmi} kg/m²)`);
  if (a.aha?.calf && parseFloat(a.aha.calf) < 31) findings.push(`Circunferência de panturrilha reduzida (${a.aha.calf} cm), com risco elevado para sarcopenia`);
  if ((a.functional?.score || 0) < 40) findings.push(`Capacidade funcional comprometida (${funcCl.label}, score ${a.functional?.score}/100)`);
  if (a.physical?.tug && parseFloat(a.physical.tug) > 13.5) findings.push(`TUG alterado (${a.physical.tug}s), indicando risco de quedas`);
  if (a.physical?.grip) {
    const cl = classifyHandGrip(a.physical.grip, st.sex);
    if (cl && (cl.label === "Fraco" || cl.label === "Regular")) findings.push(`Força de preensão manual reduzida (${a.physical.grip} kgf — ${cl.label})`);
  }
  return React.createElement("div", { className: "print-page", style: { padding: 20 } }, React.createElement(ProfHeader, null), React.createElement("div", { style: { fontWeight: 800, fontSize: 17, color: "#0f172a", marginBottom: 4 } }, "Carta de Encaminhamento Médico"), React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginBottom: 24 } }, (new Date()).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })), React.createElement("div", { style: { fontSize: 13, color: "#334155", lineHeight: 1.8, marginBottom: 20 } }, React.createElement("p", null, "Prezado(a) Dr(a),"), React.createElement("br", null), React.createElement("p", null, "Encaminho o(a) aluno(a) ", React.createElement("strong", null, st.name), ", ", calcAge(st.dob), " anos, sexo ", st.sex === "M" ? "masculino" : "feminino", ", para avaliação clínica complementar, em virtude dos achados identificados durante avaliação física integrada realizada em ", React.createElement("strong", null, fmt(a.date)), ", pelo sistema Longevus (Avaliação Física Integrada — protocolos AHA, ACSM e Spirduso)."), React.createElement("br", null), findings.length > 0 && React.createElement(React.Fragment, null, React.createElement("p", null, React.createElement("strong", null, "Achados relevantes identificados na avaliação:")), React.createElement("ul", { style: { paddingLeft: 20, marginTop: 8 } }, findings.map((f, i) => React.createElement("li", { key: i, style: { marginBottom: 6 } }, f))), React.createElement("br", null)), React.createElement("p", null, "Solicito avaliação clínica e, se necessário, liberação ou restrição para a prática de exercício físico supervisionado, bem como orientações complementares ao programa de treinamento."), React.createElement("br", null), React.createElement("p", null, "Agradeço a atenção e me coloco à disposição para esclarecimentos adicionais."), React.createElement("br", null), React.createElement("p", null, "Atenciosamente,")), React.createElement(AIReportDisplay, { text: notesReferral, title: "Informações Complementares — Prof. Wellington Brito · CREF 089836-G/SP" }), React.createElement(ProfFooter, null));
};
const ReportEvolution = ({ student: st, assessments: stA, dailyLogs: stL, notesEvolution = "" }) => {
  if (!st) return null;
  return React.createElement("div", { className: "print-page", style: { padding: 20 } }, React.createElement(ProfHeader, null), React.createElement("div", { style: { fontWeight: 800, fontSize: 17, color: "#0f172a", marginBottom: 4 } }, "Relatório de Evolução — ", st.name), React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginBottom: 20 } }, calcAge(st.dob), " anos · ", st.sex === "M" ? "Masculino" : "Feminino", " · Gerado em ", (new Date()).toLocaleDateString("pt-BR")), stA.length > 0 && React.createElement("div", { style: { marginBottom: 24 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 } }, "Evolução dos Índices Longevus"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, stA.map((a, i) => {
    const gc = classifyGlobal(a.globalScore || 0);
    const prev = i > 0 ? stA[i - 1] : null;
    const delta = prev ? (a.globalScore || 0) - (prev.globalScore || 0) : null;
    const cvScore = a.aha?.score !== void 0 ? Math.max(0, Math.round(100 - a.aha.score / 13 * 100)) : null;
    const prevCv = prev?.aha?.score !== void 0 ? Math.max(0, 100 - prev.aha.score * 8) : null;
    const deltaCv = prev && cvScore !== null && prevCv !== null ? cvScore - prevCv : null;
    const deltaFunc = prev ? (a.functional?.score || 0) - (prev.functional?.score || 0) : null;
    const deltaPhys = prev ? (a.physical?.score || 0) - (prev.physical?.score || 0) : null;
    const cogScore = a.cognitiveData?.score || 0;
    const deltaCog = prev ? cogScore - (prev.cognitiveData?.score || 0) : null;
    const cogCl = cogScore >= 80 ? { color: "#16a34a", bg: "#dcfce7" } : cogScore >= 65 ? { color: "#65a30d", bg: "#ecfccb" } : cogScore >= 50 ? { color: "#d97706", bg: "#fef9c3" } : { color: "#dc2626", bg: "#fee2e2" };
    const Δ = (val, d) => d !== null && val ? React.createElement("span", { style: { fontSize: 10, color: d > 0 ? "#16a34a" : d < 0 ? "#dc2626" : "#94a3b8", marginLeft: 3, fontWeight: 700 } }, d > 0 ? "▲" : d < 0 ? "▼" : "–", Math.abs(d)) : null;
    return React.createElement("div", { key: a.id, style: { border: `2px solid ${gc.color}22`, borderRadius: 14, padding: "14px 16px", background: "#fff", position: "relative" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 } }, React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: "#475569" } }, fmt(a.date)), React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, React.createElement("div", { style: { fontWeight: 900, fontSize: 22, color: gc.color } }, a.globalScore || "—", Δ(a.globalScore, delta)), React.createElement(Badge, { color: gc.color, bg: gc.bg }, gc.label))), React.createElement("div", { style: { display: "grid", gridTemplateColumns: `repeat(${cogScore > 0 ? 4 : 3},1fr)`, gap: 8 } }, [[" Cardio", cvScore, deltaCv, "#6366f1"], [" Func.", a.functional?.score, deltaFunc, "#FF5603"], [" Aptidão", a.physical?.score, deltaPhys, "#0891b2"], ...cogScore > 0 ? [[" Cognitivo", cogScore, deltaCog, cogCl.color]] : []].map(([lbl, val, dv, cor]) => React.createElement("div", { key: lbl, style: { background: "#f8fafc", borderRadius: 9, padding: "8px 10px", textAlign: "center" } }, React.createElement("div", { style: { fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 } }, lbl), React.createElement("div", { style: { fontSize: 16, fontWeight: 900, color: cor || "#0f172a" } }, val || "—"), dv !== null && val ? React.createElement("div", { style: { fontSize: 10, color: dv > 0 ? "#16a34a" : dv < 0 ? "#dc2626" : "#94a3b8", fontWeight: 700 } }, dv > 0 ? "▲" : dv < 0 ? "▼" : "–", Math.abs(dv)) : React.createElement("div", { style: { fontSize: 10, color: "#e2e8f0" } }, "–")))));
  }))), stL.length > 0 && React.createElement("div", { style: { marginBottom: 24 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 } }, "Histórico de Monitoramento (últimos 15 registros)"), React.createElement("div", { style: { overflowX: "auto" } }, React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 11 } }, React.createElement("thead", null, React.createElement("tr", { style: { background: "#f8fafc" } }, ["Data", "PA Pré", "FC Pré", "SpO₂", "Glicemia", "PSE Pré", "PSE Dur.", "PSE Pós", "Duplo Produto", "PA Pós", "FC Pós", "Disp.", "Hidrat.", "Obs"].map((h) => React.createElement("th", { key: h, style: { padding: "7px 8px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" } }, h)))), React.createElement("tbody", null, stL.map((l, i) => {
    const sbp = parseFloat(l.pre?.sbp || l.pre?.pas);
    const gly = parseFloat(l.pre?.glycemia);
    const fc = parseFloat(l.pre?.fc);
    const spo2 = parseFloat(l.pre?.spo2);
    const alert2 = sbp >= 160 || parseFloat(l.pre?.pad) >= 100 || fc > 110 || spo2 > 0 && spo2 < 94 || gly > 0 && (gly < 70 || gly >= 200);
    const dp = l.during?.pas && l.during?.fc ? Math.round(parseFloat(l.during.pas) * parseFloat(l.during.fc)) : null;
    const dpCl = dpClassify(dp);
    const pseDurCl = l.during?.pse !== "" && l.during?.pse !== void 0 ? classifyPSE(l.during.pse) : null;
    const dispEmoji = ["", "😣", "😴", "😐", "🙂", "😁"];
    return React.createElement("tr", { key: l.id, style: { borderBottom: "1px solid #f1f5f9", background: alert2 ? "#fff5f5" : i % 2 === 0 ? "#fff" : "#fafafa" } }, React.createElement("td", { style: { padding: "7px 8px", fontWeight: 600, whiteSpace: "nowrap" } }, fmt(l.date)), React.createElement("td", { style: { padding: "7px 8px", color: sbp >= 160 ? "#dc2626" : sbp >= 140 ? "#d97706" : "inherit", fontWeight: sbp >= 140 ? 700 : 400 } }, (l.pre?.sbp || l.pre?.pas) && l.pre?.pad ? (l.pre.sbp || l.pre.pas) + "/" + l.pre.pad : "—"), React.createElement("td", { style: { padding: "7px 8px", color: fc > 110 ? "#dc2626" : fc >= 100 ? "#d97706" : "inherit" } }, l.pre?.fc || "—"), React.createElement("td", { style: { padding: "7px 8px", color: spo2 > 0 && spo2 < 94 ? "#dc2626" : "inherit" } }, l.pre?.spo2 ? l.pre.spo2 + "%" : "—"), React.createElement("td", { style: { padding: "7px 8px", color: gly > 0 && (gly < 70 || gly >= 200) ? "#dc2626" : "inherit" } }, l.pre?.glycemia || "—"), React.createElement("td", { style: { padding: "7px 8px" } }, l.pre?.pse !== "" && l.pre?.pse !== void 0 ? l.pre.pse : "—"), React.createElement("td", { style: { padding: "7px 8px", fontWeight: 700, color: pseDurCl?.color || "inherit", background: pseDurCl?.bg || "transparent" } }, l.during?.pse !== "" && l.during?.pse !== void 0 ? l.during.pse : "—"), React.createElement("td", { style: { padding: "7px 8px" } }, l.post?.pse !== "" && l.post?.pse !== void 0 ? l.post.pse : "—"), React.createElement("td", { style: { padding: "7px 8px" } }, dp ? React.createElement("span", { style: { fontWeight: 700, color: dpCl?.c } }, dp.toLocaleString("pt-BR")) : "—"), React.createElement("td", { style: { padding: "7px 8px" } }, (l.post?.sbp || l.post?.pas) && l.post?.pad ? (l.post.sbp || l.post.pas) + "/" + l.post.pad : "—"), React.createElement("td", { style: { padding: "7px 8px" } }, l.post?.fc || "—"), React.createElement("td", { style: { padding: "7px 8px" } }, l.disposition ? dispEmoji[l.disposition] : "—"), React.createElement("td", { style: { padding: "7px 8px" } }, l.hydration ? "💧".repeat(l.hydration) : "—"), React.createElement("td", { style: { padding: "7px 8px", color: "#64748b", fontSize: 10 } }, l.notes || "—"));
  }))))), React.createElement(AIReportDisplay, { text: notesEvolution, title: "Análise da Evolução — Prof. Wellington Brito · CREF 089836-G/SP" }), React.createElement(ProfFooter, { extra: `Relatório de evolução — ${stA.length} avaliação(ões) registrada(s)` }));
};
