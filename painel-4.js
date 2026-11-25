// Painel do professor (longevus-app.html) · parte 4 de 4. Código já convertido (sem Babel no navegador).
const buildReport = (type, a, student, stA, stL) => {
  if (!a || !student) return "Dados insuficientes.";
  const sex = student.sex === "M" ? "masculino" : "feminino";
  const pronoun = student.sex === "M" ? "o aluno" : "a aluna";
  const pronoun2 = student.sex === "M" ? "o" : "a";
  const age = calcAge(student.dob);
  const nome = student.name;
  const data = fmt(a.date);
  const gc = classifyGlobal(a.globalScore || 0);
  const ahaCl = classifyAHA(a.aha?.score || 0);
  const funcCl = classifyFunctional(a.functional?.score || 0);
  const fitCl = classifyFitness(a.physical?.score || 0);
  const cvScore = Math.max(0, Math.round(100 - (a.aha?.score || 0) / 13 * 100));
  const NL = "\n";
  const riskMap = { smoker: "tabagismo", diabetes: "diabetes", hypertension: "hipertensão arterial", hyperlipid: "dislipidemia", family: "histórico familiar de DCV" };
  const riskFactors = Object.keys(riskMap).filter((k) => a.aha?.[k]).map((k) => riskMap[k]);
  const funcRisks = [
    a.functional?.falls ? "quedas nos últimos 12 meses" : "",
    a.functional?.balance ? "limitação de equilíbrio" : "",
    a.functional?.physlim ? "limitação física" : ""
  ].filter(Boolean);
  const avdMap = { eating: "alimentação", bathing: "banho", dressing: "vestuário", toileting: "higiene pessoal", transferring: "transferência" };
  const avdProbs = a.avd ? Object.keys(avdMap).filter((k) => a.avd[k] < 2).map((k) => avdMap[k] + (a.avd[k] === 1 ? " (com auxílio)" : " (dependente)")) : [];
  const aivdMap = { shopping: "compras", finance: "finanças", transport: "transporte", medication: "medicação", housework: "tarefas domésticas", telephone: "uso de telefone" };
  const aivdProbs = a.aivd ? Object.keys(aivdMap).filter((k) => a.aivd[k] < 2).map((k) => aivdMap[k] + (a.aivd[k] === 1 ? " (com auxílio)" : " (dependente)")) : [];
  const calfRisk = a.aha?.calf ? classifyCalf(a.aha.calf, student.sex) : null;
  const testLines = [
    a.physical?.sppbBalanceScore !== void 0 ? "SPPB Equilíbrio: " + a.physical.sppbBalanceScore + " pts — " + (classifySPPBBalanceScore(a.physical.sppbBalanceScore)?.label || "—") : null,
    a.physical?.sppbChair || a.physical?.sppbChairUnable ? "SPPB — Teste de Sentar e Levantar: " + (a.physical.sppbChairUnable ? "Incapaz" : a.physical.sppbChair + "seg") + " — " + (classifySPPBChairStand(a.physical.sppbChairUnable ? "unable" : a.physical.sppbChair)?.label || "—") : null,
    a.physical?.grip ? "Preensão Manual: " + a.physical.grip + " kgf — " + (classifyHandGrip(a.physical.grip, student.sex)?.label || "—") : null,
    a.physical?.tug ? "TUG: " + a.physical.tug + " seg — " + (classifyTUG(a.physical.tug)?.label || "—") : null,
    a.physical?.sitreach !== void 0 && a.physical?.sitreach !== "" ? "Sentar e Alcançar: " + a.physical.sitreach + " cm — " + (classifySitReach(a.physical.sitreach)?.label || "—") : null,
    a.physical?.march ? "Marcha Estacionária: " + a.physical.march + " passos — " + (classifyMarch(a.physical.march, student.sex)?.label || "—") : null
  ].filter(Boolean);
  if (type === "evolution") {
    if (stA.length < 2) return "São necessárias ao menos duas avaliações para gerar este relatório.";
    const first = stA[0], last = stA[stA.length - 1];
    const delta = (last.globalScore || 0) - (first.globalScore || 0);
    const deltaCV = Math.max(0, 100 - (last.aha?.score || 0) * 8) - Math.max(0, 100 - (first.aha?.score || 0) * 8);
    const deltaFunc = (last.functional?.score || 0) - (first.functional?.score || 0);
    const deltaFit = (last.physical?.score || 0) - (first.physical?.score || 0);
    const tend = delta > 0 ? "positiva" : delta < 0 ? "negativa" : "estável";
    const lines2 = [
      "RELATÓRIO DE EVOLUÇÃO — " + nome.toUpperCase(),
      "Período: " + fmt(first.date) + " a " + fmt(last.date) + " (" + stA.length + " avaliações)",
      "",
      "TRAJETÓRIA GERAL",
      nome + " apresentou evolução " + tend + " no período analisado. O índice Índice Global " + (delta > 0 ? "aumentou de " + (first.globalScore || 0) + " para " + (last.globalScore || 0) + " pontos (melhora de " + delta + " pontos)" : delta < 0 ? "reduziu de " + (first.globalScore || 0) + " para " + (last.globalScore || 0) + " pontos, indicando necessidade de atenção" : "manteve-se estável em " + (last.globalScore || 0) + " pontos") + ". Classificação atual: " + classifyGlobal(last.globalScore || 0).label + ".",
      "",
      "ANÁLISE POR DOMÍNIO",
      "Cardiovascular: " + (deltaCV > 0 ? "melhora de " + deltaCV + " pontos." : deltaCV < 0 ? "redução de " + Math.abs(deltaCV) + " pontos. Atenção aos fatores de risco." : "estável."),
      "Funcional: " + (deltaFunc > 0 ? "melhora de " + deltaFunc + " pontos, com ganho de autonomia." : deltaFunc < 0 ? "redução de " + Math.abs(deltaFunc) + " pontos. Revisar programa funcional." : "estável."),
      "Aptidão Física: " + (deltaFit > 0 ? "melhora de " + deltaFit + " pontos, resposta positiva ao treinamento." : deltaFit < 0 ? "redução de " + Math.abs(deltaFit) + " pontos. Reavaliar cargas e modalidades." : "estável."),
      "",
      "TESTES FÍSICOS — COMPARATIVO (1ª vs ÚLTIMA AVALIAÇÃO)",
      ...(() => {
        const comparisons = [];
        const tests = [
          ["SPPB Equilíbrio", (f) => f.physical?.sppbBalanceScore !== void 0 ? String(f.physical.sppbBalanceScore) : null, "pts"],
          ["SPPB — Teste de Sentar e Levantar", (f) => f.physical?.sppbChairUnable ? "Incapaz" : f.physical?.sppbChair || null, "seg"],
          ["TUG", (f) => f.physical?.tug, "seg"],
          ["Preensão Manual", (f) => f.physical?.grip, "kgf"],
          ["Sentar e Alcançar", (f) => f.physical?.sitreach !== void 0 && f.physical.sitreach !== "" ? f.physical.sitreach : null, "cm"],
          ["Marcha Estacionária", (f) => f.physical?.march, "passos"]
        ];
        tests.forEach(([label, fn, unit]) => {
          const v1 = fn(first), v2 = fn(last);
          if (v1 || v2) comparisons.push(label + ": " + (v1 ? v1 + " " + unit : "—") + " → " + (v2 ? v2 + " " + unit : "—"));
        });
        if (last.cognitiveData?.score > 0 || first.cognitiveData?.score > 0) {
          comparisons.push("");
          comparisons.push("COGNITIVO:");
          if (first.cognitiveData?.mmse?.total || last.cognitiveData?.mmse?.total) comparisons.push("MMSE: " + (first.cognitiveData?.mmse?.total || "—") + "/30 → " + (last.cognitiveData?.mmse?.total || "—") + "/30");
          if (first.cognitiveData?.score || last.cognitiveData?.score) comparisons.push("Score Cognitivo: " + (first.cognitiveData?.score || "—") + " → " + (last.cognitiveData?.score || "—") + "/100");
        }
        return comparisons;
      })(),
      "",
      ...last.anamnese?.pathologies || last.anamnese?.medications ? [
        "DADOS CLÍNICOS (última avaliação)",
        ...last.anamnese?.pathologies ? ["Patologias: " + last.anamnese.pathologies] : [],
        ...last.anamnese?.medications ? ["Medicamentos: " + last.anamnese.medications] : [],
        ...last.anamnese?.goals ? ["Objetivos: " + last.anamnese.goals] : [],
        ""
      ] : [],
      "RECOMENDAÇÕES PARA O PRÓXIMO PERÍODO",
      delta > 0 ? nome + " demonstra boa adesão ao programa. Recomenda-se progressão gradual das cargas conforme ACSM para adultos 50+, mantendo mínimo de 3 sessões semanais com exercícios aeróbicos e resistidos." : delta < 0 ? "Recomenda-se revisão do programa de treinamento, avaliação da adesão e possível encaminhamento médico. Considerar reavaliação em 30 dias." : "Manter o programa atual com monitoramento contínuo. Considerar estímulos variados para promover novas adaptações fisiológicas conforme ACSM."
    ];
    return lines2.join(NL);
  }
  if (type === "referral") {
    const findings = [];
    if (a.parqFailed) findings.push("PAR-Q positivo com respostas afirmativas a questões de saúde cardiovascular e/ou musculoesquelética");
    if ((a.aha?.score || 0) >= 4) findings.push("risco cardiovascular ALTO pela escala AHA (score " + a.aha.score + ")");
    if (a.aha?.sbp && parseFloat(a.aha.sbp) >= 140) findings.push("pressão arterial elevada (" + a.aha.sbp + "/" + a.aha.dbp + " mmHg)");
    if (a.aha?.bmi && parseFloat(a.aha.bmi) >= 30) findings.push("IMC indicativo de obesidade (" + a.aha.bmi + " kg/m²)");
    if (calfRisk?.label.includes("Alto")) findings.push("circunferência de panturrilha reduzida (" + a.aha.calf + " cm) com risco elevado para sarcopenia");
    if ((a.functional?.score || 0) < 40) findings.push("capacidade funcional comprometida (" + funcCl.label + ", score " + a.functional?.score + "/100)");
    if (a.physical?.tug && parseFloat(a.physical.tug) > 13.5) findings.push("TUG alterado (" + a.physical.tug + "s), indicando risco de quedas");
    if (a.physical?.sppbChairUnable) findings.push("SPPB — Teste de Sentar e Levantar: incapaz de realizar — risco elevado de sarcopenia e quedas");
    else if (a.physical?.sppbChair && classifySPPBChairStand(a.physical.sppbChair)?.score <= 1) findings.push("SPPB — Teste de Sentar e Levantar comprometido (" + a.physical.sppbChair + "s) — força de MMII reduzida");
    if (a.cognitiveData?.mmse?.total && parseInt(a.cognitiveData.mmse.total) < 18) findings.push("MMSE " + a.cognitiveData.mmse.total + "/30 — " + classifyMMSE(a.cognitiveData.mmse.total)?.label + " — encaminhamento neurológico/geriátrico recomendado");
    else if (a.cognitiveData?.mmse?.total && parseInt(a.cognitiveData.mmse.total) < 24) findings.push("MMSE " + a.cognitiveData.mmse.total + "/30 — " + classifyMMSE(a.cognitiveData.mmse.total)?.label + " — acompanhamento cognitivo recomendado");
    if (a.anamnese?.pathologies) findings.push("patologias relatadas: " + a.anamnese.pathologies);
    if (a.anamnese?.medications) findings.push("medicamentos em uso: " + a.anamnese.medications);
    const lines2 = [
      "Prezado(a) Dr(a),",
      "",
      "Encaminho " + pronoun + " " + nome + ", " + age + " anos, sexo " + sex + ", para avaliação clínica complementar em virtude dos achados identificados durante avaliação física integrada realizada em " + data + " pelo protocolo Longevus (AHA, ACSM e Spirduso).",
      ""
    ];
    if (findings.length > 0) {
      lines2.push("Achados que motivam este encaminhamento:");
      findings.forEach((f) => lines2.push("• " + f + ";"));
      lines2.push("");
    }
    lines2.push("Solicito avaliação clínica e, se necessário, liberação ou restrição para a prática de exercício físico supervisionado, bem como orientações complementares ao programa de treinamento.");
    lines2.push("");
    lines2.push("Agradeço a atenção e coloco-me à disposição para esclarecimentos.");
    lines2.push("");
    lines2.push("Atenciosamente,");
    lines2.push("Prof. Wellington Brito — Personal Trainer · CREF 089836-G/SP");
    lines2.push("Envelhecimento e Longevidade");
    return lines2.join(NL);
  }
  const intens = (a.aha?.score || 0) >= 4 ? "baixa (40-50% FCmáx)" : (a.aha?.score || 0) >= 2 ? "moderada (50-70% FCmáx)" : "moderada a vigorosa (60-80% FCmáx)";
  const lines = [
    "RELATÓRIO DE AVALIAÇÃO FÍSICA INTEGRADA — Longevus",
    "Longevus — Protocolo: AHA / ACSM / Spirduso  |  Data: " + data,
    "",
    "IDENTIFICAÇÃO",
    nome + ", " + age + " anos, sexo " + sex + "." + (student.notes ? " Observações: " + student.notes + "." : ""),
    "",
    "RESUMO CLÍNICO",
    pronoun.charAt(0).toUpperCase() + pronoun.slice(1) + " " + nome + ", " + age + " anos, foi avaliado" + pronoun2 + " pelo protocolo Longevus em " + data + ". Índice global: " + (a.globalScore || 0) + " pts — " + gc.label + ". " + (riskFactors.length > 0 ? "Fatores de risco cardiovascular: " + riskFactors.join(", ") + ". " : "Sem fatores de risco cardiovascular identificados. ") + (avdProbs.length > 0 ? "Limitações nas AVDs: " + avdProbs.join(", ") + ". " : "") + (aivdProbs.length > 0 ? "Limitações nas AIVDs: " + aivdProbs.join(", ") + ". " : "") + (a.anamnese?.goals ? "Objetivo: " + a.anamnese.goals + "." : ""),
    ""
  ];
  if (a.parqApplied) {
    lines.push("PAR-Q");
    if (a.parqFailed) {
      const parqPos = Object.entries(a.parq || {}).filter(([, v]) => v === true).map(([k]) => ({ q1: "Doença cardíaca", q2: "Dor no peito com esforço", q3: "Tontura/desmaio", q4: "Problema ósseo/articular", q5: "Medicamento para PA/coração", q6: "Razão para não exercitar", q7: "Mais de 65 anos/sedentário" })[k]).filter(Boolean);
      lines.push("PAR-Q POSITIVO — Avaliação médica prévia recomendada (ACSM/AHA)." + (parqPos.length > 0 ? " Respostas afirmativas: " + parqPos.join("; ") + "." : ""));
    } else {
      lines.push("PAR-Q negativo. Sem contraindicações identificadas.");
    }
    lines.push("");
  }
  if (a.anamnese && (a.anamnese.pathologies || a.anamnese.medications || a.anamnese.mainComplaints)) {
    lines.push("ANAMNESE CLÍNICA");
    if (a.anamnese.pathologies) lines.push("Patologias: " + a.anamnese.pathologies);
    if (a.anamnese.medications) lines.push("Medicamentos: " + a.anamnese.medications);
    if (a.anamnese.allergies) lines.push("Alergias: " + a.anamnese.allergies);
    if (a.anamnese.surgeries) lines.push("Cirurgias: " + a.anamnese.surgeries);
    if (a.anamnese.mainComplaints) lines.push("Queixas: " + a.anamnese.mainComplaints);
    if (a.anamnese.painLocation) lines.push("Dores: " + a.anamnese.painLocation);
    if (a.anamnese.physActivityHistory) lines.push("Atividade física: " + { nunca: "Nunca praticou", passado: "Praticou no passado", irregular: "Pratica irregularmente", regular: "Pratica regularmente" }[a.anamnese.physActivityHistory]);
    if (a.anamnese.sleepHours || a.anamnese.sleepQuality) lines.push("Sono: " + (a.anamnese.sleepHours ? a.anamnese.sleepHours + "h/noite " : "") + (a.anamnese.sleepQuality ? "— " + { ruim: "Ruim", regular: "Regular", boa: "Boa", otima: "Ótima" }[a.anamnese.sleepQuality] : ""));
    if (a.anamnese.stressLevel) lines.push("Estresse: " + { baixo: "Baixo", moderado: "Moderado", alto: "Alto", muito_alto: "Muito alto" }[a.anamnese.stressLevel]);
    if (a.anamnese.smoking && a.anamnese.smoking !== "nao") lines.push("Tabagismo: " + { ex: "Ex-fumante", sim: "Fumante ativo" }[a.anamnese.smoking]);
    if (a.anamnese.alcohol && a.anamnese.alcohol !== "nao") lines.push("Álcool: " + { ocasional: "Ocasional", regular: "Regular" }[a.anamnese.alcohol]);
    if (a.anamnese.observations) lines.push("Obs: " + a.anamnese.observations);
    lines.push("");
  }
  const impacts = [];
  if (a.aha?.diabetes || a.anamnese?.pathologies?.toLowerCase().includes("diabet")) {
    impacts.push("Diabetes: aumenta o risco de hipoglicemia e hiperglicemia durante o exercício, podendo causar tontura, fraqueza e perda de consciência. Exige monitoramento obrigatório da glicemia antes e após cada sessão e ajuste de intensidade conforme os níveis glicêmicos.");
  }
  if (a.aha?.hypertension || a.anamnese?.pathologies?.toLowerCase().includes("hipertens") || a.aha?.sbp && parseFloat(a.aha.sbp) >= 140) {
    impacts.push("Hipertensão arterial: pressão elevada aumenta o risco cardiovascular durante o esforço, pode limitar a intensidade e exige aferição de PA em todos os momentos da sessão. Exercícios de alta intensidade e manobra de Valsalva são contraindicados.");
  }
  if ((a.aha?.score || 0) >= 4) {
    impacts.push("Risco cardiovascular alto (AHA): requer início com exercícios de baixa intensidade, progressão lenta e liberação médica antes de intensidades moderadas a altas. O coração pode ter menor reserva para responder ao esforço físico.");
  }
  if (calfRisk?.label?.includes("Alto") || calfRisk?.label?.includes("Sarcopenia")) {
    impacts.push("Risco de sarcopenia (panturrilha reduzida): a perda de massa muscular compromete força, equilíbrio e locomoção segura. Aumenta o risco de quedas, fraturas e perda de independência. Treino de força resistida é prioritário.");
  }
  if (avdProbs.length > 0) {
    impacts.push("Limitações nas AVDs (" + avdProbs.join(", ") + "): dificuldades nas atividades básicas indicam dependência parcial ou total em funções essenciais. O programa deve simular e reforçar esses movimentos para recuperar ou preservar a autonomia.");
  }
  if (aivdProbs.length > 0) {
    impacts.push("Limitações nas AIVDs (" + aivdProbs.join(", ") + "): dificuldades em atividades instrumentais como compras, transporte ou gestão de medicamentos indicam redução da independência social. O programa deve incluir treino cognitivo-motor e suporte à autonomia.");
  }
  if (a.functional?.balance) {
    impacts.push("Limitação de equilíbrio (questionário funcional): risco elevado de quedas em situações do cotidiano como subir escadas, caminhar em superfícies irregulares ou executar tarefas simultâneas. Treino de equilíbrio é componente obrigatório.");
  }
  if (a.physical?.tug && parseFloat(a.physical.tug) > 13.5) {
    impacts.push("TUG alterado (" + a.physical.tug + "s): indica comprometimento de marcha e mobilidade dinâmica com risco elevado de quedas. Impacta diretamente a capacidade de levantar de cadeiras, caminhar e mudar de direção com segurança.");
  }
  if (a.physical?.sppbBalanceScore !== void 0 && parseFloat(a.physical.sppbBalanceScore) < 2) {
    impacts.push("SPPB Equilíbrio comprometido (" + a.physical.sppbBalanceScore + "/3 pts): dificuldade em manter posições estáticas. Maior vulnerabilidade a tropeços e quedas em situações simples como se vestir em pé, tomar banho ou caminhar em superfícies irregulares.");
  }
  if (a.physical?.sppbChairUnable || a.physical?.sppbChair && classifySPPBChairStand(a.physical.sppbChairUnable ? "unable" : a.physical.sppbChair)?.score <= 1) {
    impacts.push("SPPB — Teste de Sentar e Levantar comprometido: fraqueza significativa de membros inferiores que impacta diretamente o uso do vaso sanitário, entrar e sair do carro, levantar do sofá e subir escadas com segurança.");
  }
  if (a.physical?.grip) {
    const gripCl = classifyHandGrip(a.physical.grip, student.sex);
    if (gripCl?.label === "Fraco" || gripCl?.label === "Regular") {
      impacts.push("Preensão manual reduzida (" + a.physical.grip + " kgf — " + gripCl.label + "): indicador global de perda muscular associado a sarcopenia, maior risco de quedas e dificuldade em tarefas diárias como abrir embalagens, segurar objetos e se apoiar.");
    }
  }
  if (a.physical?.sitreach !== void 0 && a.physical.sitreach !== "") {
    const srCl = classifySitReach(a.physical.sitreach);
    if (srCl?.label === "Fraco" || srCl?.label === "Regular") {
      impacts.push("Flexibilidade reduzida (" + a.physical.sitreach + "cm — " + srCl.label + "): encurtamento muscular aumenta o risco de dores lombares, lesões e dificulta movimentos cotidianos como amarrar calçados, pegar objetos no chão e calçar meias.");
    }
  }
  if (a.physical?.march) {
    const marchCl = classifyMarch(a.physical.march, student.sex);
    if (marchCl?.label === "Fraco" || marchCl?.label === "Regular") {
      impacts.push("Resistência de marcha reduzida (" + a.physical.march + " passos — " + marchCl.label + "): capacidade aeróbica limitada para atividades de média duração. Pode causar cansaço excessivo em caminhadas, escadas e tarefas domésticas.");
    }
  }
  if ((a.functional?.score || 0) < 40) {
    impacts.push("Capacidade funcional muito comprometida (score " + a.functional?.score + "/100): nível de dependência significativo nas atividades do dia a dia. O programa deve priorizar segurança, aprendizagem motora e exercícios assistidos antes de qualquer progressão.");
  }
  if (impacts.length > 0) {
    lines.push("O QUE OS RESULTADOS SIGNIFICAM");
    impacts.forEach((imp) => lines.push("• " + imp));
    lines.push("");
  }
  if (a?.cardioMode && a.cardioMode !== "skip") {
    lines.push("AVALIAÇÃO CARDIORRESPIRATÓRIA");
    if (a.cardioMode === "ergo" && a.cardioAssessment?.ergo) {
      const e = a.cardioAssessment.ergo;
      const vo2 = e.vo2max || (e.mets ? (parseFloat(e.mets) * 3.5).toFixed(1) : null);
      const fcMax = parseFloat(e.fcMax), fcRest = parseFloat(e.fcRest);
      const fcRes = fcMax && fcRest ? fcMax - fcRest : null;
      if (e.fcRest) lines.push("FC repouso: " + e.fcRest + " bpm");
      if (e.fcMax) lines.push("FC máxima: " + e.fcMax + " bpm");
      if (fcRes) lines.push("FC Reserva: " + fcRes + " bpm");
      if (vo2) lines.push("VO2max: " + parseFloat(vo2).toFixed(1) + " ml/kg/min" + (classifyVO2(vo2, calcAge(student?.dob), student?.sex) ? " — " + classifyVO2(vo2, calcAge(student?.dob), student?.sex).label : ""));
      if (e.medications?.includes("beta")) lines.push("⚠️ Beta-bloqueador: priorizar PSE/Borg.");
      if (e.arrythmias?.length > 0 && !e.arrythmias.includes("none")) lines.push("⚠️ Arritmia identificada.");
    } else if (a.cardioMode === "pred" && a.cardioAssessment?.pred) {
      const p = a.cardioAssessment.pred;
      const age3 = parseFloat(p.age || calcAge(student?.dob));
      const fcMax2 = p.formula === "tanaka" ? Math.round(208 - 0.7 * age3) : 220 - age3;
      const fcRes2 = p.fcRest ? fcMax2 - parseFloat(p.fcRest) : null;
      const risk = riskStratify(p);
      lines.push("FCmáx estimada (" + (p.formula === "tanaka" ? "Tanaka" : "Tradicional") + "): " + fcMax2 + " bpm");
      if (fcRes2) lines.push("FC Reserva estimada: " + fcRes2 + " bpm");
      lines.push("Estratificação: " + risk.label + " | Zona: " + risk.fcr + " · Borg: " + risk.borg);
      if (risk.alert) lines.push("⚠️ " + risk.alert);
    }
    lines.push("");
  }
  if (a?.cognitiveData?.score > 0) {
    const cd = a.cognitiveData;
    lines.push("AVALIAÇÃO COGNITIVA");
    lines.push("Score: " + cd.score + "/100 — " + (cd.score >= 80 ? "Excelente" : cd.score >= 65 ? "Bom" : cd.score >= 50 ? "Regular" : "Comprometido"));
    if (cd.mmse?.total) {
      const mmseCl = classifyMMSE(cd.mmse.total);
      const mmseVal = parseInt(cd.mmse.total);
      lines.push("MMSE: " + cd.mmse.total + "/30 — " + (mmseCl?.label || "—"));
      lines.push("  → " + mmseCl.impact + (mmseVal < 18 ? " Encaminhamento neurológico/geriátrico recomendado." : ""));
    }
    if (cd.dualTask?.single && cd.dualTask?.dual) {
      const cl = classifyDualTask(cd.dualTask.single, cd.dualTask.dual);
      if (cl) {
        lines.push("Dual Task: " + cl.cost + "% — " + cl.label);
        lines.push("  → " + cl.impact);
      }
    }
    if (cd.verbalFluency?.score) {
      const vfCl = classifyVerbalFluency(cd.verbalFluency.score);
      lines.push("Fluência Verbal: " + cd.verbalFluency.score + " palavras — " + (vfCl?.label || "—"));
      lines.push("  → " + vfCl.impact);
    }
    if (cd.digitSpan?.direct) {
      const dsCl = classifyDigitSpan(cd.digitSpan.direct, cd.digitSpan.inverse);
      lines.push("Span Dígitos: Direto " + cd.digitSpan.direct + (cd.digitSpan.inverse ? " / Inv. " + cd.digitSpan.inverse : "") + " — " + (dsCl?.label || "—"));
      lines.push("  → " + dsCl.impact);
    }
    lines.push("");
  }
  lines.push("RECOMENDAÇÕES GERAIS");
  lines.push("");
  lines.push("Prescrição de Exercício:");
  lines.push("• Intensidade: " + intens + " (ACSM/AHA).");
  lines.push("• Frequência: mínimo 3 sessões/semana, idealmente 5x para aeróbico.");
  lines.push("• Modalidades: aeróbico (caminhada, bicicleta), resistido (50-70% 1RM), equilíbrio e flexibilidade.");
  if (funcRisks.includes("quedas nos últimos 12 meses") || a.physical?.tug && parseFloat(a.physical.tug) > 13.5) lines.push("• Prevenção de quedas: treino de equilíbrio e fortalecimento de MMII obrigatório.");
  if (calfRisk?.label?.includes("Sarcopenia") || calfRisk?.label?.includes("Alto")) lines.push("• Risco de sarcopenia: treino de força e aporte proteico (mín. 1,2g/kg/dia) recomendados.");
  lines.push("");
  lines.push("Monitoramento por Sessão:");
  lines.push("• PA: aferir ANTES e APÓS cada sessão. Suspender se PAS ≥ 180 ou PAD ≥ 110 mmHg.");
  lines.push("• FC: aferir em repouso antes e ao término.");
  if (a.aha?.diabetes || a.anamnese?.pathologies?.toLowerCase().includes("diabet")) {
    lines.push("• Glicemia: OBRIGATÓRIA antes e após (diabético). Referência: 100-250 mg/dL. Abaixo de 70: tratar hipoglicemia. Acima de 300: suspender.");
    lines.push("• Manter carboidrato de rápida absorção disponível.");
  }
  if ((a.aha?.score || 0) >= 4 || a.anamnese?.pathologies?.toLowerCase().includes("cardio") || a.anamnese?.pathologies?.toLowerCase().includes("insuficiência")) lines.push("• SpO₂: monitorar durante o exercício. Interromper se < 90%.");
  if (a.aha?.hypertension || a.aha?.sbp && parseFloat(a.aha.sbp) >= 140) lines.push("• Hipertensão: aferir PA em todos os momentos. Reduzir se PAS > 160. Não iniciar se PAS ≥ 180 mmHg.");
  if (a.aha?.smoker) lines.push("• Tabagismo: monitorar SpO₂ e tolerância aeróbica.");
  if (a.anamnese?.medications?.toLowerCase().includes("beta") || a.anamnese?.medications?.toLowerCase().includes("propranolol") || a.anamnese?.medications?.toLowerCase().includes("atenolol")) lines.push("• Beta-bloqueador: priorizar PSE/Borg (0-10), não apenas FC.");
  if (funcRisks.includes("quedas nos últimos 12 meses") || a.physical?.tug && parseFloat(a.physical.tug) > 13.5) lines.push("• Risco de quedas: supervisão constante. Nunca deixar sem apoio próximo.");
  lines.push("");
  lines.push("SINAIS DE ALERTA — Interromper Imediatamente se:");
  lines.push("• Dor torácica, pressão no peito ou irradiação para braço/mandíbula.");
  lines.push("• Dispneia desproporcional ou fala fragmentada.");
  lines.push("• Tontura, náusea, palidez ou sudorese fria.");
  lines.push("• Palpitações ou arritmia percebida.");
  lines.push("• Confusão mental, perda de equilíbrio súbita ou alteração de consciência.");
  if (a.aha?.diabetes || a.anamnese?.pathologies?.toLowerCase().includes("diabet")) lines.push("• Tremor, fome súbita, irritabilidade ou suor frio (hipoglicemia).");
  if (a?.cognitiveData?.score > 0) {
    const cd = a.cognitiveData;
    const hasDT = cd.dualTask?.single && cd.dualTask?.dual && classifyDualTask(cd.dualTask.single, cd.dualTask.dual)?.cost > 20;
    const hasMMSE = cd.mmse?.total && parseInt(cd.mmse.total) < 24;
    if (hasDT || hasMMSE) {
      lines.push("");
      lines.push("RECOMENDAÇÕES COGNITIVAS:");
      if (hasMMSE) lines.push("• MMSE < 24: comandos simples, supervisão constante, comunicar ao médico.");
      if (hasDT) lines.push("• Dual Task elevado: iniciar neurofuncional no nível básico, progredir gradualmente.");
      lines.push("• Incluir dual task: caminhada + contagem, step + decisão, marcha + comando.");
      lines.push("• Reavaliar bateria cognitiva a cada 24 semanas.");
    }
  }
  lines.push("");
  lines.push("RECOMENDAÇÕES DE ESTILO DE VIDA:");
  lines.push("• Socialização: pelo menos 2x/semana — grupos de caminhada, dança, atividades religiosas, encontros familiares.");
  lines.push("• Autonomia: incentivar atividades domésticas leves e seguras.");
  lines.push("• Cognição: leitura, conversas, jogos de raciocínio, música e memória.");
  lines.push("• Quedas: evitar tapetes soltos, manter iluminação adequada, usar calçados estáveis.");
  if (a.aha?.weight) {
    const weight = parseFloat(a.aha.weight);
    const mlPerDay = Math.round(weight * 30);
    const liters = (mlPerDay / 1e3).toFixed(1);
    const glasses = Math.round(mlPerDay / 250);
    lines.push("• Hidratação: cerca de " + liters + "L de água por dia (aprox. " + glasses + " copos de 250ml), considerando peso de " + weight + "kg (~30ml/kg/dia). Distribuir ao longo do dia, com atenção redobrada antes, durante e após o exercício. Em caso de insuficiência cardíaca, renal ou uso de diuréticos, ajustar conforme orientação médica.");
  } else {
    lines.push("• Hidratação adequada antes, durante e após o exercício (recomenda-se registrar o peso na próxima avaliação para cálculo personalizado).");
  }
  lines.push("• Sono de qualidade (7-9h/noite) com horários regulares.");
  lines.push("• Seguir orientações médicas e uso correto dos medicamentos.");
  return lines.join(NL);
};
const buildPrompt = (type, a, student, stA, stL) => {
  const sex = student?.sex === "M" ? "masculino" : "feminino";
  const age = calcAge(student?.dob);
  const gc = classifyGlobal(a?.globalScore || 0);
  const ahaCl = classifyAHA(a?.aha?.score || 0);
  const funcCl = classifyFunctional(a?.functional?.score || 0);
  const fitCl = classifyFitness(a?.physical?.score || 0);
  const riskFactors = ["smoker", "diabetes", "hypertension", "hyperlipid", "family"].filter((k) => a?.aha?.[k]).map((k) => ({ smoker: "Tabagismo", diabetes: "Diabetes", hypertension: "Hipertensão", hyperlipid: "Dislipidemia", family: "Histórico Familiar DCV" })[k]).join(", ") || "nenhum";
  const funcRisks = [
    a?.functional?.falls ? "Quedas nos últimos 12 meses" : "",
    a?.functional?.balance ? "Limitação de equilíbrio" : "",
    a?.functional?.physlim ? "Limitação física" : ""
  ].filter(Boolean).join(", ") || "nenhum";
  const evolucao = stA.length > 1 ? "\nHISTÓRICO (" + stA.length + " avaliações):\n" + stA.map((av) => "  " + fmt(av.date) + ": Global " + (av.globalScore || "—") + " | CV " + Math.max(0, 100 - (av.aha?.score || 0) * 8) + " | Funcional " + (av.functional?.score || "—") + " | Aptidão " + (av.physical?.score || "—")).join("\n") : "";
  const dados = [
    "DADOS DO ALUNO:",
    "Nome: " + student?.name + ", " + age + " anos, sexo " + sex,
    "Avaliação: " + fmt(a?.date),
    "Obs: " + (student?.notes || "nenhuma"),
    "",
    "ÍNDICES LONGEVUS:",
    "Global: " + (a?.globalScore || "—") + " (" + gc.label + ")",
    "Cardiovascular: " + Math.max(0, 100 - (a?.aha?.score || 0) * 8),
    "Funcional: " + (a?.functional?.score || "—") + " (" + funcCl.label + ")",
    "Aptidão Física: " + (a?.physical?.score || "—") + " (" + fitCl.label + ")",
    "",
    "PAR-Q: " + (a?.parqFailed ? "POSITIVO — avaliação médica recomendada" : "Negativo"),
    "",
    "RISCO CARDIOVASCULAR (AHA):",
    "Score AHA: " + (a?.aha?.score || "—") + " — " + ahaCl.label,
    "Peso: " + (a?.aha?.weight || "—") + " kg | Altura: " + (a?.aha?.height || "—") + " cm | IMC: " + (a?.aha?.bmi || "—") + " kg/m2",
    "PA: " + (a?.aha?.sbp || "—") + "/" + (a?.aha?.dbp || "—") + " mmHg | FC: " + (a?.aha?.hr || "—") + " bpm",
    "Cintura: " + (a?.aha?.waist || "—") + " cm | Quadril: " + (a?.aha?.hip || "—") + " cm | Panturrilha: " + (a?.aha?.calf || "—") + " cm",
    "Fatores de risco: " + riskFactors,
    "",
    "AVDs (Spirduso):",
    "Alimentação " + (a?.avd?.eating || "—") + "/2 | Banho " + (a?.avd?.bathing || "—") + "/2 | Vestuário " + (a?.avd?.dressing || "—") + "/2 | Higiene " + (a?.avd?.toileting || "—") + "/2 | Transferência " + (a?.avd?.transferring || "—") + "/2",
    "AIVDs (Spirduso):",
    "Compras " + (a?.aivd?.shopping || "—") + "/2 | Financas " + (a?.aivd?.finance || "—") + "/2 | Transporte " + (a?.aivd?.transport || "—") + "/2 | Medicacao " + (a?.aivd?.medication || "—") + "/2 | Tarefas " + (a?.aivd?.housework || "—") + "/2 | Telefone " + (a?.aivd?.telephone || "—") + "/2",
    "Fatores risco funcional: " + funcRisks,
    "",
    "TESTES FISICOS:",
    a?.physical?.sppbSide !== void 0 ? "SPPB Equilibrio: " + (a.physical.sppbSide === "0" ? 0 : (parseInt(a.physical.sppbSemi) || 0) + (parseInt(a.physical.sppbTandem) || 0)) + "/3 pts — " + (classifySPPBBalance(a.physical.sppbSide, a.physical.sppbSemi, a.physical.sppbTandem)?.label || "—") : "—",
    a?.physical?.sppbChair || a?.physical?.sppbChairUnable ? "SPPB — Teste de Sentar e Levantar: " + (a.physical.sppbChairUnable ? "Incapaz" : a.physical.sppbChair + "s") + " — " + (classifySPPBChairStand(a.physical.sppbChairUnable ? "unable" : a.physical.sppbChair)?.label || "—") : "—",
    "Preensao Manual: " + (a?.physical?.grip || "—") + " kgf — " + (classifyHandGrip(a?.physical?.grip, student?.sex)?.label || "—"),
    "TUG: " + (a?.physical?.tug || "—") + " seg — " + (classifyTUG(a?.physical?.tug)?.label || "—"),
    "Sentar e Alcancar: " + (a?.physical?.sitreach || "—") + " cm — " + (classifySitReach(a?.physical?.sitreach)?.label || "—"),
    "Marcha Estacionaria: " + (a?.physical?.march || "—") + " passos — " + (classifyMarch(a?.physical?.march, student?.sex)?.label || "—"),
    evolucao
  ].join("\n");
  const instrucoes = {
    clinical: "Voce e um assistente de apoio a profissionais de educacao fisica. Com base nos dados abaixo, redija um RELATORIO CLINICO DE AVALIACAO FISICA INTEGRADA completo, profissional e baseado em evidencias cientificas (ACSM, AHA e Spirduso). O relatorio deve ter: 1) Resumo clinico do aluno. 2) Analise do risco cardiovascular. 3) Analise da capacidade funcional (AVDs e AIVDs). 4) Analise dos testes fisicos com interpretacao clinica. 5) Conclusao com classificacao geral Longevus. 6) Recomendacoes para o programa de exercicios (tipo, intensidade, frequencia, cuidados). Use linguagem tecnica mas acessivel. Cite as diretrizes quando relevante. Escreva em portugues do Brasil. Nao use markdown ou asteriscos. Use paragrafos normais com titulos em MAIUSCULAS.\n\n" + dados,
    referral: "Voce e um assistente de apoio a profissionais de educacao fisica. Redija uma CARTA DE ENCAMINHAMENTO MEDICO formal, baseada nos achados da avaliacao fisica integrada (ACSM/AHA/Spirduso). A carta deve: ter formato formal, apresentar achados de risco de forma clara, solicitar avaliacao clinica complementar, mencionar os fatores de risco identificados, ter tom respeitoso entre profissionais de saude, ser concisa (maximo 4 paragrafos). Escreva em portugues do Brasil. Nao use markdown.\n\n" + dados,
    evolution: "Voce e um assistente de apoio a profissionais de educacao fisica. Redija um RELATORIO DE EVOLUCAO do aluno, comparando as avaliacoes ao longo do tempo. O relatorio deve: 1) Descrever a trajetoria do aluno. 2) Destacar indicadores que melhoraram e os que precisam atencao. 3) Concluir com recomendacoes para o proximo periodo. Seja encorajador mas honesto. Escreva em portugues do Brasil. Nao use markdown.\n\n" + dados
  };
  return instrucoes[type] || instrucoes.clinical;
};
const AIReportEditor = ({ type, assessment, student, stA, stL, savedText, onSave }) => {
  const [text, setText] = useState(savedText || "");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(!!savedText);
  const [error, setError] = useState("");
  const generate = () => {
    setLoading(true);
    setError("");
    try {
      const result = buildReport(type, assessment, student, stA, stL);
      setText(result);
      setGenerated(true);
      onSave(result);
    } catch (e) {
      setError("Erro ao gerar o relatório. Tente novamente.");
    }
    setLoading(false);
  };
  const handleChange = (val) => {
    setText(val);
    onSave(val);
  };
  const labels = {
    clinical: { title: "Relatório Clínico", icon: "📋", color: "#6366f1" },
    referral: { title: "Carta de Encaminhamento", icon: "📩", color: "#FF5603" },
    evolution: { title: "Relatório de Evolução", icon: "📈", color: "#16a34a" }
  };
  const lbl = labels[type];
  return React.createElement("div", { style: { marginBottom: 16 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, React.createElement("span", { style: { fontSize: 18 } }, lbl.icon), React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a" } }, lbl.title), generated && React.createElement("span", { style: { fontSize: 10, background: "#dcfce7", color: "#16a34a", borderRadius: 99, padding: "2px 8px", fontWeight: 700 } }, "✓ gerado")), React.createElement("button", { onClick: generate, disabled: loading, style: { display: "flex", alignItems: "center", gap: 6, background: loading ? "#f1f5f9" : lbl.color, color: loading ? "#94a3b8" : "#fff", border: "none", borderRadius: 9, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: loading ? "not-allowed" : "pointer" } }, loading ? "⏳ Gerando..." : generated ? "🔄 Regerar" : "✨ Gerar com IA")), !generated && !loading && React.createElement("div", { style: { background: "#f8fafc", border: "1.5px dashed #e2e8f0", borderRadius: 11, padding: "24px 20px", textAlign: "center" } }, React.createElement("div", { style: { fontSize: 28, marginBottom: 8 } }, "✨"), React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 } }, "Gerar ", lbl.title, " com IA"), React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 14 } }, "A IA analisa todos os dados da avaliação e escreve um texto profissional baseado em ACSM, AHA e Spirduso. Depois você edita à vontade."), React.createElement("button", { onClick: generate, style: { background: lbl.color, color: "#fff", border: "none", borderRadius: 9, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" } }, "✨ Gerar agora")), loading && React.createElement("div", { style: { background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 11, padding: "32px 20px", textAlign: "center" } }, React.createElement("div", { style: { fontSize: 28, marginBottom: 8 } }, "⏳"), React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 } }, "Analisando dados e gerando texto..."), React.createElement("div", { style: { fontSize: 12, color: "#94a3b8" } }, "Isso pode levar alguns segundos.")), error && React.createElement("div", { style: { background: "#fee2e2", borderRadius: 9, padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 10 } }, error), generated && !loading && React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 6 } }, "✏️ Edite o texto abaixo antes de imprimir — cada alteração é salva automaticamente."), React.createElement(
    "textarea",
    {
      value: text,
      onChange: (e) => handleChange(e.target.value),
      style: { width: "100%", minHeight: 280, padding: "14px", borderRadius: 11, border: "1.5px solid #e2e8f0", background: "#fff", fontSize: 13, color: "#0f172a", lineHeight: 1.7, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }
    }
  )));
};
const EXERCISE_LIBRARY = [
  {
    id: 1,
    domain: "Força MMII",
    family: "Agachar",
    base: "Sit-to-Stand Assistido",
    progressions: ["Sit-to-Stand", "STS Baixo Banco", "Goblet Squat", "Split Squat", "STS Explosivo"],
    tags: { movement: "squat", env: ["home", "gym", "hybrid"], equipment: ["bodyweight", "dumbbell"], clinical: ["low_impact", "equilíbrio_safe"] },
    defaultSets: 3,
    defaultReps: "10-12",
    defaultRest: 60
  },
  {
    id: 2,
    domain: "Força MMSS",
    family: "Empurrar",
    base: "Wall Push-Up",
    progressions: ["Incline Alto", "Incline Médio", "Chest Press", "Push-Up Banco", "Push-Up Adaptado"],
    tags: { movement: "push", env: ["home", "gym", "hybrid"], equipment: ["bodyweight", "machine"] },
    defaultSets: 3,
    defaultReps: "10-12",
    defaultRest: 60
  },
  {
    id: 3,
    domain: "Força MMSS",
    family: "Puxar",
    base: "Remada Elástico",
    progressions: ["Remada Halter", "Remada Sentada", "Pulley", "Remada Unilateral", "Remada Funcional"],
    tags: { movement: "pull", env: ["home", "gym", "hybrid"], equipment: ["band", "dumbbell", "machine"] },
    defaultSets: 3,
    defaultReps: "10-12",
    defaultRest: 60
  },
  {
    id: 4,
    domain: "Força MMII",
    family: "Hinge",
    base: "Ponte Glútea",
    progressions: ["Ponte Unilateral", "Hip Thrust", "Hip Thrust Carga", "Deadlift Leve", "Deadlift Funcional"],
    tags: { movement: "hinge", env: ["home", "gym", "hybrid"], equipment: ["bodyweight", "dumbbell"], clinical: ["lombar_safe"] },
    defaultSets: 3,
    defaultReps: "12-15",
    defaultRest: 60
  },
  {
    id: 5,
    domain: "Cardio",
    family: "Cardio Contínuo",
    base: "Marcha Estacionária",
    progressions: ["Marcha Dinâmica", "Marcha Obstáculo", "Corrida Estacionária", "Skipping Baixo", "Skipping Alto"],
    tags: { movement: "cardio", env: ["home", "gym", "hybrid"], equipment: ["bodyweight"], clinical: ["cardiometabolic", "low_impact"] },
    defaultSets: 1,
    defaultReps: "20 min",
    defaultRest: 0
  },
  {
    id: 6,
    domain: "Força MMII",
    family: "Step",
    base: "Step Touch",
    progressions: ["Step Lateral", "Step-Up Baixo", "Step-Up Médio", "Step-Up Carga", "Step Potência"],
    tags: { movement: "locomotion", env: ["home", "gym", "hybrid"], equipment: ["bodyweight", "dumbbell"] },
    defaultSets: 3,
    defaultReps: "10 cada lado",
    defaultRest: 60
  },
  {
    id: 7,
    domain: "Equilíbrio",
    family: "Equilíbrio Estático",
    base: "Apoio Bipodal",
    progressions: ["Semi-Tandem", "Tandem", "Unilateral Assistido", "Unilateral", "Equilíbrio Dinâmico"],
    tags: { movement: "balance", env: ["home", "gym", "hybrid"], equipment: ["bodyweight"], clinical: ["equilíbrio_safe", "low_impact"] },
    defaultSets: 3,
    defaultReps: "30 seg",
    defaultRest: 30
  },
  {
    id: 8,
    domain: "Core",
    family: "Estabilidade",
    base: "Dead Bug Assistido",
    progressions: ["Dead Bug", "Bird Dog", "Pallof Press", "Carry Anti-Rotação", "Core Funcional"],
    tags: { movement: "core", env: ["home", "gym", "hybrid"], equipment: ["bodyweight", "band"], clinical: ["lombar_safe"] },
    defaultSets: 3,
    defaultReps: "8-10",
    defaultRest: 45
  },
  {
    id: 9,
    domain: "Cardio",
    family: "Cardio Funcional",
    base: "Caminhada Contínua",
    progressions: ["Caminhada Rápida", "Caminhada Intervalada", "Marcha Funcional", "Cardio Funcional", "Cardio Neurofuncional"],
    tags: { movement: "cardio", env: ["home", "gym", "hybrid"], equipment: ["bodyweight"], clinical: ["cardiometabolic", "low_impact"] },
    defaultSets: 1,
    defaultReps: "30 min",
    defaultRest: 0
  },
  {
    id: 10,
    domain: "Dual Task",
    family: "Cognitivo-Motor",
    base: "STS + Contagem",
    progressions: ["Marcha + Contagem", "Marcha + Fluência", "Step + Decisão", "Dual Task Complexo", "Neurocircuito"],
    tags: { movement: "cognition", env: ["home", "gym", "hybrid"], equipment: ["bodyweight"], clinical: ["low_impact"] },
    defaultSets: 3,
    defaultReps: "60 seg",
    defaultRest: 30
  },
  {
    id: 11,
    domain: "Mobilidade",
    family: "Mobilidade Torácica",
    base: "Mobilidade Torácica",
    progressions: ["Torácica Pé", "Rotação Ativa", "Rotação + Marcha", "Mobilidade Funcional", "Mobilidade Neuro"],
    tags: { movement: "mobility", env: ["home", "gym", "hybrid"], equipment: ["bodyweight"], clinical: ["lombar_safe"] },
    defaultSets: 2,
    defaultReps: "10 cada lado",
    defaultRest: 30
  },
  {
    id: 12,
    domain: "Core",
    family: "Carry",
    base: "Farmer Carry Leve",
    progressions: ["Carry Moderado", "Carry Unilateral", "Carry Marchando", "Carry Obstáculo", "Carry Complexo"],
    tags: { movement: "core", env: ["gym", "hybrid"], equipment: ["dumbbell"], clinical: ["lombar_safe"] },
    defaultSets: 3,
    defaultReps: "20 m",
    defaultRest: 60
  },
  {
    id: 13,
    domain: "Neurofuncional",
    family: "Reação",
    base: "Toque Alvo Simples",
    progressions: ["Toque Direcional", "Reação Auditiva", "Reação Visual", "Tomada Decisão", "NeuroReação"],
    tags: { movement: "cognition", env: ["home", "gym", "hybrid"], equipment: ["bodyweight"] },
    defaultSets: 3,
    defaultReps: "45 seg",
    defaultRest: 30
  },
  {
    id: 14,
    domain: "Força MMII",
    family: "Escada",
    base: "Subida Assistida",
    progressions: ["Step-Up Livre", "Escada Livre", "Escada Carga", "Escada Dual Task", "Escada Potência"],
    tags: { movement: "locomotion", env: ["home", "gym", "hybrid"], equipment: ["bodyweight", "dumbbell"] },
    defaultSets: 3,
    defaultReps: "8-10",
    defaultRest: 60
  },
  {
    id: 15,
    domain: "Neurofuncional",
    family: "Agilidade",
    base: "Deslocamento Lateral",
    progressions: ["Frontal/Lateral", "Cone Drill", "Reativo", "Dual Task", "Agilidade Neuro"],
    tags: { movement: "cognition", env: ["gym", "hybrid"], equipment: ["bodyweight"] },
    defaultSets: 3,
    defaultReps: "30 seg",
    defaultRest: 30
  },
  {
    id: 16,
    domain: "Força MMSS",
    family: "Empurrar Vertical",
    base: "Shoulder Press Sentado",
    progressions: ["Press Pé", "Desenvolvimento", "Press Alternado", "Push Press", "Press Funcional"],
    tags: { movement: "push", env: ["home", "gym", "hybrid"], equipment: ["dumbbell", "machine"] },
    defaultSets: 3,
    defaultReps: "10-12",
    defaultRest: 60
  },
  {
    id: 17,
    domain: "Força MMSS",
    family: "Puxar Vertical",
    base: "Pull Apart Elástico",
    progressions: ["Face Pull", "Pulley Alto", "Remada Alta", "Pull Down", "Puxada Funcional"],
    tags: { movement: "pull", env: ["home", "gym", "hybrid"], equipment: ["band", "machine"] },
    defaultSets: 3,
    defaultReps: "12-15",
    defaultRest: 45
  },
  {
    id: 18,
    domain: "Core",
    family: "Respiração",
    base: "Respiração Diafragmática",
    progressions: ["Brace Core", "Respiração + Marcha", "Respiração Funcional", "Core Respiratório", "Core Neuro"],
    tags: { movement: "core", env: ["home", "gym", "hybrid"], equipment: ["bodyweight"], clinical: ["low_impact", "cardiometabolic"] },
    defaultSets: 2,
    defaultReps: "10 respirações",
    defaultRest: 30
  },
  {
    id: 19,
    domain: "Cardio",
    family: "Cardio Coordenação",
    base: "Shadow Boxing",
    progressions: ["Shadow Dinâmico", "Shadow + Passos", "Shadow Intervalado", "Cardio Coordenação", "Cardio Neuro"],
    tags: { movement: "cardio", env: ["home", "gym", "hybrid"], equipment: ["bodyweight"] },
    defaultSets: 3,
    defaultReps: "45 seg",
    defaultRest: 30
  },
  {
    id: 20,
    domain: "Equilíbrio",
    family: "Equilíbrio Dinâmico",
    base: "Transferência Peso",
    progressions: ["Transferência Lateral", "Alcance Funcional", "Marcha Reativa", "Reação Postural", "NeuroEquilíbrio"],
    tags: { movement: "balance", env: ["home", "gym", "hybrid"], equipment: ["bodyweight"], clinical: ["equilíbrio_safe", "low_impact"] },
    defaultSets: 3,
    defaultReps: "10-12",
    defaultRest: 30
  },
  {
    id: 21,
    domain: "Força MMII",
    family: "Hinge Avançado",
    base: "Hip Hinge Parede",
    progressions: ["Hip Hinge Livre", "RDL Leve", "Deadlift KB", "Deadlift Uni", "Deadlift Complexo"],
    tags: { movement: "hinge", env: ["home", "gym", "hybrid"], equipment: ["bodyweight", "dumbbell"], clinical: ["lombar_safe"] },
    defaultSets: 3,
    defaultReps: "10-12",
    defaultRest: 60
  },
  {
    id: 22,
    domain: "Força MMII",
    family: "Agachar Avançado",
    base: "Wall Squat",
    progressions: ["Box Squat", "Goblet Squat", "Front Squat Adaptado", "Split Squat", "Potência MMII"],
    tags: { movement: "squat", env: ["home", "gym", "hybrid"], equipment: ["bodyweight", "dumbbell"] },
    defaultSets: 3,
    defaultReps: "10-12",
    defaultRest: 60
  },
  {
    id: 23,
    domain: "Core",
    family: "Prancha",
    base: "Prancha Parede",
    progressions: ["Prancha Banco", "Prancha Joelhos", "Prancha Completa", "Prancha Dinâmica", "Core Complexo"],
    tags: { movement: "core", env: ["home", "gym", "hybrid"], equipment: ["bodyweight"], clinical: ["lombar_safe"] },
    defaultSets: 3,
    defaultReps: "20-30 seg",
    defaultRest: 45
  },
  {
    id: 24,
    domain: "Cardio",
    family: "Cardio Intervalado",
    base: "Polichinelo Adaptado",
    progressions: ["Polichinelo Parcial", "Polichinelo", "Polichinelo Dinâmico", "Cardio Complexo", "Circuito Intervalado"],
    tags: { movement: "cardio", env: ["home", "gym", "hybrid"], equipment: ["bodyweight"] },
    defaultSets: 3,
    defaultReps: "30 seg",
    defaultRest: 30
  },
  {
    id: 25,
    domain: "Dual Task",
    family: "Neurocognitivo",
    base: "Marcha + Comando",
    progressions: ["Contagem Reversa", "Categorias", "Memória Sequencial", "Regra Alternada", "NeuroMarcha"],
    tags: { movement: "cognition", env: ["home", "gym", "hybrid"], equipment: ["bodyweight"], clinical: ["low_impact"] },
    defaultSets: 3,
    defaultReps: "60 seg",
    defaultRest: 30
  }
];
const selectExercises = (priorities, level, env, phase) => {
  const progLevel = Math.min(phase - 1, 4);
  const isHome = env === "home";
  const getExercise = (domainFilter, id, override) => {
    const ex = EXERCISE_LIBRARY.find((e) => id ? e.id === id : e.domain === domainFilter);
    if (!ex) return null;
    if (isHome && ex.tags.env && !ex.tags.env.includes("home") && !ex.tags.env.includes("hybrid")) return null;
    const progName = progLevel === 0 ? ex.base : ex.progressions[progLevel - 1] || ex.progressions[0];
    return { ...ex, currentExercise: progName, progLevel, sets: ex.defaultSets, reps: ex.defaultReps, rest: ex.defaultRest, obs: "", ...override };
  };
  const domainMap = {
    "Prevenção de Quedas": [getExercise(null, 7), getExercise(null, 20), getExercise(null, 6)],
    "Força MMII": [getExercise(null, 1), getExercise(null, 4), getExercise(null, 22)],
    "Cardiorrespiratório": [getExercise(null, 9), getExercise(null, 5)],
    "Equilíbrio e Mobilidade": [getExercise(null, 7), getExercise(null, 11), getExercise(null, 20)],
    "Força MMSS": [getExercise(null, 2), getExercise(null, 3), getExercise(null, 16)],
    "Funcionalidade / AVDs": [getExercise(null, 6), getExercise(null, 12), getExercise(null, 14)],
    "Neurofuncional / Dual Task": [getExercise(null, 10), getExercise(null, 13), getExercise(null, 25)],
    "Core e Estabilidade": [getExercise(null, 8), getExercise(null, 23), getExercise(null, 18)]
  };
  const warmup = [getExercise(null, 11), getExercise(null, 18)].filter(Boolean);
  const cooldown = [{ id: 99, currentExercise: "Alongamento Global", domain: "Mobilidade", sets: 1, reps: "5-8 min", rest: 0, obs: "", progLevel: 0, base: "Alongamento", progressions: [] }];
  const sessions = [];
  const allPriorities = priorities.length > 0 ? priorities : [{ domain: "Força MMII" }, { domain: "Cardiorrespiratório" }, { domain: "Core e Estabilidade" }];
  allPriorities.slice(0, 5).forEach((p, idx) => {
    const exList = (domainMap[p.domain] || []).filter(Boolean);
    if (exList.length > 0) {
      sessions.push({ priority: p.domain, icon: p.icon || "🏋️", exercises: exList });
    }
  });
  const coreEx = [getExercise(null, 8), getExercise(null, 23)].filter(Boolean);
  if (!sessions.find((s) => s.priority === "Core e Estabilidade")) {
    sessions.push({ priority: "Core e Estabilidade", icon: "🔩", exercises: coreEx });
  }
  return { warmup, sessions, cooldown };
};
const buildProgram = (assessment, student, freq, env, phase) => {
  const level = getFunctionalLevel(assessment, student);
  const priorities = getRankedPriorities(assessment, student);
  const f = parseInt(freq) || 3;
  const p = parseInt(phase) || 1;
  const { warmup, sessions, cooldown } = selectExercises(priorities, level, env, p);
  const days = [];
  if (f === 1) {
    days.push({ day: "Dia Único — Full Body", sessions: sessions.slice(0, 4), warmup, cooldown });
  } else if (f === 2) {
    const half = Math.ceil(sessions.length / 2);
    days.push({ day: "Dia A", sessions: sessions.slice(0, half), warmup, cooldown });
    days.push({ day: "Dia B", sessions: sessions.slice(half), warmup, cooldown });
  } else if (f === 3) {
    days.push({ day: "Dia A — Força + Core", sessions: sessions.filter((s) => s.priority.includes("Força") || s.priority.includes("Core")), warmup, cooldown });
    days.push({ day: "Dia B — Cardio + Equilíbrio", sessions: sessions.filter((s) => s.priority.includes("Cardio") || s.priority.includes("Equilíbrio") || s.priority.includes("Quedas")), warmup, cooldown });
    days.push({ day: "Dia C — Funcional + Neuro", sessions: sessions.filter((s) => s.priority.includes("Neuro") || s.priority.includes("Func") || s.priority.includes("AVD")), warmup, cooldown });
    days.forEach((d, i) => {
      if (d.sessions.length === 0) d.sessions = sessions.slice(i % sessions.length, i % sessions.length + 2);
    });
  } else {
    const chunk = Math.ceil(sessions.length / Math.min(f, 4));
    for (let i = 0; i < Math.min(f, 4); i++) {
      days.push({ day: "Dia " + String.fromCharCode(65 + i), sessions: sessions.slice(i * chunk, (i + 1) * chunk), warmup, cooldown });
    }
  }
  return {
    id: uid(),
    studentId: student.id,
    assessmentId: assessment.id,
    createdAt: todayStr(),
    level: level.level,
    levelLabel: level.label,
    arch: level.arch,
    freq: f,
    env,
    phase: p,
    days,
    priorities: priorities.slice(0, 5),
    phaseLabel: ["", "Adaptação", "Desenvolvimento", "Consolidação", "Otimização"][p] || "Adaptação",
    weekRange: [[1, 4], [5, 12], [13, 20], [21, 24]][p - 1] || [1, 4]
  };
};
const ytLink = (name) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(name + " exercício como fazer");
const YTBtn = ({ name }) => React.createElement(
  "a",
  {
    href: ytLink(name),
    target: "_blank",
    rel: "noopener noreferrer",
    style: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 7, background: "#fee2e2", border: "1px solid #fca5a5", cursor: "pointer", textDecoration: "none", flexShrink: 0 },
    title: "Ver no YouTube: " + name
  },
  React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "#dc2626" }, React.createElement("path", { d: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z" }))
);
const STATUS_AGENDA = {
  agendado: { label: "Agendado", color: "#64748b", bg: "#f1f5f9", dot: "#94a3b8" },
  confirmada: { label: "Confirmada", color: "#2563eb", bg: "#dbeafe", dot: "#2563eb" },
  realizada: { label: "Realizada", color: "#16a34a", bg: "#dcfce7", dot: "#16a34a" },
  falta: { label: "Falta", color: "#dc2626", bg: "#fee2e2", dot: "#dc2626" },
  cancelada_professor: { label: "Cancelada pelo professor", color: "#64748b", bg: "#f1f5f9", dot: "#94a3b8" },
  cancelada_aluno_prazo: { label: "Cancelada pelo aluno (no prazo)", color: "#2563eb", bg: "#dbeafe", dot: "#2563eb" },
  cancelada_aluno_sem_prazo: { label: "Cancelada pelo aluno (fora do prazo)", color: "#dc2626", bg: "#fee2e2", dot: "#dc2626" }
};
const getWeekDates = (date) => {
  const d = new Date(date);
  const dom = new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => new Date(dom.getFullYear(), dom.getMonth(), dom.getDate() + i));
};
const cap1 = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const Agenda = ({ students, setStudents, agendaEntries, setAgendaEntries, pagamentos, setPagamentos, leads, nav }) => {
  const nomeDoCompromisso = (e) => {
    const st = students.find((s) => s.id === e.studentId);
    if (st) return st.name;
    const ld = (leads || []).find((l) => l.id === e.leadId);
    if (ld) return "🧪 " + ld.name;
    return "Aluno";
  };
  const [viewMode, setViewMode] = useState("dia");
  const [filterSt, setFilterSt] = useState("");
  const [refDate, setRefDate] = useState(() => new Date());
  const goPrev = () => setRefDate((d) => {
    const n = new Date(d);
    if (viewMode === "dia") n.setDate(n.getDate() - 1);
    else if (viewMode === "semana") n.setDate(n.getDate() - 7);
    else n.setMonth(n.getMonth() - 1);
    return n;
  });
  const goNext = () => setRefDate((d) => {
    const n = new Date(d);
    if (viewMode === "dia") n.setDate(n.getDate() + 1);
    else if (viewMode === "semana") n.setDate(n.getDate() + 7);
    else n.setMonth(n.getMonth() + 1);
    return n;
  });
  const goHoje = () => setRefDate(new Date());
  const [scheduleModal, setScheduleModal] = useState(false);
  const emptySchedule = () => ({ studentId: filterSt || "", time: "", obs: "" });
  const [scheduleForm, setScheduleForm] = useState(emptySchedule());
  const [selDates, setSelDates] = useState(() => new Set());
  const [scheduleCalRef, setScheduleCalRef] = useState(() => new Date());
  const openSchedule = () => {
    setScheduleForm(emptySchedule());
    setSelDates(new Set());
    setScheduleCalRef(new Date());
    setScheduleModal(true);
  };
  const toggleDate = (iso) => setSelDates((prev) => {
    const next = new Set(prev);
    if (next.has(iso)) next.delete(iso);
    else next.add(iso);
    return next;
  });
  const toggleWeekdayInMonth = (weekday) => {
    const dias = getMonthDates(scheduleCalRef.getFullYear(), scheduleCalRef.getMonth()).filter((d) => d.getDay() === weekday).map(toISODateLocal);
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
  const saveSchedule = () => {
    if (!scheduleForm.studentId || !scheduleForm.time || selDates.size === 0) return;
    const novas = [...selDates].sort().map((date) => ({ id: uid(), studentId: scheduleForm.studentId, date, time: scheduleForm.time, status: "agendado", obs: scheduleForm.obs.trim() }));
    setAgendaEntries((p) => [...p, ...novas]);
    novas.forEach((nova) => atualizarFinanceiroPelaAgenda(nova, students, agendaEntries, setPagamentos, setStudents));
    setScheduleModal(false);
  };
  const scheduleDiasDoMes = getMonthDates(scheduleCalRef.getFullYear(), scheduleCalRef.getMonth());
  const schedulePrimeiroDiaSemana = scheduleDiasDoMes[0].getDay();
  const [entryModal, setEntryModal] = useState(false);
  const [entryEditId, setEntryEditId] = useState(null);
  const [entryForm, setEntryForm] = useState({ studentId: "", leadId: "", date: "", time: "", status: "agendado", obs: "" });
  const openEntry = (date, entry) => {
    if (entry) {
      setEntryEditId(entry.id);
      setEntryForm({ studentId: entry.studentId || "", leadId: entry.leadId || "", date: entry.date, time: entry.time || "", status: entry.status, obs: entry.obs || "" });
    } else {
      setEntryEditId(null);
      setEntryForm({ studentId: filterSt || "", leadId: "", date: date || todayStr(), time: "", status: "agendado", obs: "" });
    }
    setEntryModal(true);
  };
  const saveEntry = () => {
    if (!entryForm.studentId && !entryForm.leadId || !entryForm.date) return;
    if (entryEditId) {
      const original = agendaEntries.find((e) => e.id === entryEditId) || {};
      const atualizado = marcarReagendamento(original, { ...original, id: entryEditId, ...entryForm });
      setAgendaEntries((p) => p.map((e) => e.id === entryEditId ? atualizado : e));
      atualizarFinanceiroPelaAgenda(atualizado, students, agendaEntries, setPagamentos, setStudents);
    } else {
      const nova = { id: uid(), ...entryForm };
      setAgendaEntries((p) => [...p, nova]);
      atualizarFinanceiroPelaAgenda(nova, students, agendaEntries, setPagamentos, setStudents);
    }
    setEntryModal(false);
  };
  const delEntry = async (id) => {
    if (window.confirm("Remover este compromisso da agenda?")) {
      await DB.remove("agenda", id);
      setAgendaEntries((p) => p.filter((e) => e.id !== id));
      removerPagamentoDaAgenda(id, setPagamentos);
    }
  };
  const entriesFiltradas = [...agendaEntries].filter((e) => !filterSt || e.studentId === filterSt);
  const entriesPorDia = (iso) => entriesFiltradas.filter((e) => e.date === iso).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  const listaOrdenada = [...entriesFiltradas].sort((a, b) => (b.date || "").localeCompare(a.date || "") || (a.time || "").localeCompare(b.time || ""));
  const refIso = toISODateLocal(refDate);
  const weekDates = getWeekDates(refDate);
  const monthDiasDoMes = getMonthDates(refDate.getFullYear(), refDate.getMonth());
  const monthPrimeiroDiaSemana = monthDiasDoMes[0].getDay();
  const mesRef = refIso.slice(0, 7);
  const entriesDoMes = entriesFiltradas.filter((e) => e.date && e.date.slice(0, 7) === mesRef);
  const contagemMes = { agendado: 0, confirmada: 0, realizada: 0, falta: 0 };
  entriesDoMes.forEach((e) => {
    if (contagemMes[e.status] !== void 0) contagemMes[e.status]++;
  });
  const EntryRow = ({ e }) => {
    const cfg = STATUS_AGENDA[e.status] || STATUS_AGENDA.agendado;
    return React.createElement("div", { onClick: () => openEntry(e.date, e), style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "10px 12px", border: "1.5px solid #f1f5f9", borderRadius: 10, cursor: "pointer" } }, React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13 } }, e.time ? e.time + " · " : "", nomeDoCompromisso(e)), e.obs && React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 2 } }, e.obs), e.dataOriginal && React.createElement("div", { style: { fontSize: 10, color: "#c2410c", marginTop: 2 } }, "↻ Remarcada, era dia ", fmt(e.dataOriginal))), React.createElement(Badge, { color: cfg.color, bg: cfg.bg }, cfg.label));
  };
  const headerLabel = viewMode === "dia" ? cap1(refDate.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })) : viewMode === "semana" ? `${weekDates[0].getDate()} ${MESES_NOME[weekDates[0].getMonth()].slice(0, 3)} – ${weekDates[6].getDate()} ${MESES_NOME[weekDates[6].getMonth()].slice(0, 3)} de ${weekDates[6].getFullYear()}` : `${MESES_NOME[refDate.getMonth()]} de ${refDate.getFullYear()}`;
  return React.createElement("div", null, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 20 } }, "📅 Agenda"), React.createElement(Btn, { sm: true, icon: "plus", onClick: openSchedule }, "Agendar Aulas")), React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 14, lineHeight: 1.5 } }, "Primeiro agende os dias e o horário das aulas com o aluno. Quando o dia chegar, toque no compromisso pra marcar se foi confirmada, realizada, se o aluno faltou, e deixar uma observação."), React.createElement("select", { value: filterSt, onChange: (e) => setFilterSt(e.target.value), style: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, marginBottom: 12 } }, React.createElement("option", { value: "" }, "Todos os alunos"), students.map((s) => React.createElement("option", { key: s.id, value: s.id }, s.name))), React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 14 } }, [["dia", "Dia"], ["semana", "Semana"], ["mes", "Mês"], ["lista", "Lista"]].map(([k, l]) => React.createElement("button", { key: k, onClick: () => setViewMode(k), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: viewMode === k ? O : "#f1f5f9", color: viewMode === k ? "#fff" : "#64748b" } }, l))), viewMode !== "lista" && React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 8 } }, React.createElement("button", { onClick: goPrev, style: { border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#475569", flexShrink: 0 } }, "‹"), React.createElement("div", { style: { flex: 1, textAlign: "center" } }, React.createElement("div", { style: { fontSize: 14, fontWeight: 800 } }, headerLabel), refIso !== todayStr() && React.createElement("button", { onClick: goHoje, style: { border: "none", background: "none", color: O, fontSize: 11, fontWeight: 700, cursor: "pointer", padding: 0, marginTop: 2 } }, "Ir para hoje")), React.createElement("button", { onClick: goNext, style: { border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#475569", flexShrink: 0 } }, "›")), viewMode === "dia" && (entriesPorDia(refIso).length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 40 } }, React.createElement(I, { n: "calendar", c: "#cbd5e1", s: 36 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhuma aula agendada neste dia.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 } }, entriesPorDia(refIso).map((e) => React.createElement(EntryRow, { key: e.id, e })))), viewMode === "dia" && React.createElement(Btn, { full: true, icon: "plus", onClick: () => openEntry(refIso, null) }, "Adicionar aula avulsa neste dia"), viewMode === "semana" && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, weekDates.map((d) => {
    const iso = toISODateLocal(d);
    const doDia = entriesPorDia(iso);
    const isHoje = iso === todayStr();
    return React.createElement(Card, { key: iso, style: { padding: "12px 14px", border: isHoje ? `1.5px solid ${O}` : void 0 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: doDia.length ? 8 : 0 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: isHoje ? O : "#0f172a" } }, DIAS_SEMANA_CURTO[d.getDay()], " · ", d.getDate(), "/", d.getMonth() + 1), React.createElement("button", { onClick: () => openEntry(iso, null), style: { border: "none", background: "none", cursor: "pointer", color: "#94a3b8", padding: 2 } }, React.createElement(I, { n: "plus", s: 16 }))), doDia.length > 0 && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, doDia.map((e) => React.createElement(EntryRow, { key: e.id, e }))));
  })), viewMode === "mes" && React.createElement(React.Fragment, null, React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" } }, Object.entries(STATUS_AGENDA).map(([k, v]) => React.createElement("div", { key: k, style: { display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" } }, React.createElement("span", { style: { width: 8, height: 8, borderRadius: 99, background: v.dot, display: "inline-block" } }), v.label, " (", contagemMes[k] || 0, ")"))), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 } }, DIAS_SEMANA_CURTO.map((d, i) => React.createElement("div", { key: i, style: { textAlign: "center", fontSize: 10, fontWeight: 700, color: "#94a3b8", padding: "4px 0" } }, d))), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 16 } }, Array.from({ length: monthPrimeiroDiaSemana }).map((_, i) => React.createElement("div", { key: "pad" + i })), monthDiasDoMes.map((d) => {
    const iso = toISODateLocal(d);
    const doDia = entriesPorDia(iso);
    const isHoje = iso === todayStr();
    const statusesUnicos = [...new Set(doDia.map((e) => e.status))];
    return React.createElement("button", { key: iso, onClick: () => {
      setRefDate(d);
      setViewMode("dia");
    }, style: { aspectRatio: "1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, border: isHoje ? "1.5px solid " + O : "1.5px solid #f1f5f9", background: "#fff", borderRadius: 8, cursor: "pointer", padding: 2 } }, React.createElement("span", { style: { fontSize: 12, fontWeight: isHoje ? 800 : 500, color: isHoje ? O : "#0f172a" } }, d.getDate()), statusesUnicos.length > 0 && React.createElement("div", { style: { display: "flex", gap: 2 } }, statusesUnicos.slice(0, 3).map((s) => React.createElement("span", { key: s, style: { width: 5, height: 5, borderRadius: 99, background: STATUS_AGENDA[s]?.dot || "#94a3b8" } }))));
  }))), viewMode === "lista" && (listaOrdenada.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 40 } }, React.createElement(I, { n: "calendar", c: "#cbd5e1", s: 36 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhuma aula agendada ainda.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, listaOrdenada.map((e) => {
    const cfg = STATUS_AGENDA[e.status] || STATUS_AGENDA.agendado;
    return React.createElement(Card, { key: e.id, onClick: () => openEntry(e.date, e), style: { padding: "14px 16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 } }, React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 } }, React.createElement("span", { style: { fontWeight: 700, fontSize: 14 } }, nomeDoCompromisso(e)), React.createElement("span", { style: { fontSize: 11, color: "#94a3b8" } }, fmt(e.date), e.time ? " · " + e.time : ""), React.createElement(Badge, { color: cfg.color, bg: cfg.bg }, cfg.label)), e.obs && React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2, whiteSpace: "pre-wrap" } }, e.obs), e.dataOriginal && React.createElement("div", { style: { fontSize: 11, color: "#c2410c", marginTop: 4 } }, "↻ Remarcada — combinada originalmente pra ", fmt(e.dataOriginal))), React.createElement("button", { onClick: (ev) => {
      ev.stopPropagation();
      delEntry(e.id);
    }, style: { background: "none", border: "none", cursor: "pointer", color: "#e2e8f0", padding: 4, flexShrink: 0 } }, React.createElement(I, { n: "trash", s: 15 }))));
  }))), scheduleModal && React.createElement(Modal, { title: "Agendar Aulas", onClose: () => setScheduleModal(false) }, React.createElement(Inp, { label: "Aluno", value: scheduleForm.studentId, onChange: (v) => setScheduleForm((f) => ({ ...f, studentId: v })), opts: [{ v: "", l: "Selecione..." }, ...students.map((s) => ({ v: s.id, l: s.name }))] }), React.createElement(Inp, { label: "Horário", type: "time", value: scheduleForm.time, onChange: (v) => setScheduleForm((f) => ({ ...f, time: v })) }), React.createElement("div", { style: { marginBottom: 13 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 } }, "Observação (opcional)"), React.createElement("textarea", { value: scheduleForm.obs, onChange: (e) => setScheduleForm((f) => ({ ...f, obs: e.target.value })), placeholder: "Ex: Treino de força no estúdio.", rows: 3, style: { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, color: "#0f172a", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" } })), React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", margin: "14px 0 8px" } }, "Em quais dias?"), React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 } }, React.createElement("button", { onClick: () => setScheduleCalRef((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)), style: { border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#475569" } }, "‹"), React.createElement("div", { style: { fontSize: 13, fontWeight: 700 } }, MESES_NOME[scheduleCalRef.getMonth()], " de ", scheduleCalRef.getFullYear()), React.createElement("button", { onClick: () => setScheduleCalRef((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)), style: { border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "#475569" } }, "›")), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 6 } }, "Toque num dia da semana pra marcar/desmarcar todo mundo dele nesse mês:"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 } }, DIAS_SEMANA_CURTO.map((d, i) => React.createElement("button", { key: i, onClick: () => toggleWeekdayInMonth(i), style: { border: "none", background: "#f1f5f9", borderRadius: 6, padding: "5px 0", fontSize: 10, fontWeight: 700, color: "#64748b", cursor: "pointer" } }, d))), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 } }, Array.from({ length: schedulePrimeiroDiaSemana }).map((_, i) => React.createElement("div", { key: "pad" + i })), scheduleDiasDoMes.map((d) => {
    const iso = toISODateLocal(d);
    const sel = selDates.has(iso);
    const isHoje = iso === todayStr();
    return React.createElement("button", { key: iso, onClick: () => toggleDate(iso), style: { aspectRatio: "1", border: isHoje && !sel ? "1.5px solid " + O : "none", background: sel ? O : "#f8fafc", color: sel ? "#fff" : "#0f172a", borderRadius: 8, fontSize: 12, fontWeight: sel ? 800 : 500, cursor: "pointer" } }, d.getDate());
  })), React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: O, marginBottom: 14 } }, selDates.size, " dia(s) selecionado(s)"), React.createElement(Btn, { full: true, onClick: saveSchedule, disabled: !scheduleForm.studentId || !scheduleForm.time || selDates.size === 0 }, "Salvar ", selDates.size > 0 ? `(${selDates.size} dia${selDates.size > 1 ? "s" : ""})` : "")), entryModal && React.createElement(Modal, { title: entryEditId ? "Compromisso" : "Nova Aula Avulsa", onClose: () => setEntryModal(false) }, entryForm.leadId ? React.createElement("div", { style: { marginBottom: 13 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 } }, "Lead (aula experimental)"), React.createElement("div", { style: { padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#fff7ed", fontSize: 14, color: "#9a3412", fontWeight: 700 } }, "🧪 ", (leads || []).find((l) => l.id === entryForm.leadId)?.name || "Lead")) : React.createElement(Inp, { label: "Aluno", value: entryForm.studentId, onChange: (v) => setEntryForm((f) => ({ ...f, studentId: v })), opts: [{ v: "", l: "Selecione..." }, ...students.map((s) => ({ v: s.id, l: s.name }))] }), React.createElement(Inp, { label: "Data", type: "date", value: entryForm.date, onChange: (v) => setEntryForm((f) => ({ ...f, date: v })) }), React.createElement(Inp, { label: "Horário", type: "time", value: entryForm.time, onChange: (v) => setEntryForm((f) => ({ ...f, time: v })) }), React.createElement("div", { style: { marginBottom: 13 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 } }, "Status"), React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, Object.entries(STATUS_AGENDA).map(([k, v]) => React.createElement("button", { key: k, onClick: () => setEntryForm((f) => ({ ...f, status: k })), style: { flex: "1 1 45%", border: entryForm.status === k ? `1.5px solid ${v.color}` : "1.5px solid #e2e8f0", background: entryForm.status === k ? v.bg : "#f8fafc", color: entryForm.status === k ? v.color : "#64748b", borderRadius: 9, padding: "9px 4px", fontSize: 12, fontWeight: 700, cursor: "pointer" } }, v.label)))), React.createElement("div", { style: { marginBottom: 13 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 } }, "Observação / justificativa (opcional)"), React.createElement("textarea", { value: entryForm.obs, onChange: (e) => setEntryForm((f) => ({ ...f, obs: e.target.value })), placeholder: "Ex: Justificou a falta por consulta médica. Chegou 15 min atrasado. Sentiu dor no joelho durante o treino.", rows: 4, style: { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, color: "#0f172a", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" } })), React.createElement("div", { style: { display: "flex", gap: 8 } }, entryEditId && React.createElement(Btn, { variant: "danger", onClick: () => {
    delEntry(entryEditId);
    setEntryModal(false);
  } }, "Excluir"), React.createElement(Btn, { full: true, onClick: saveEntry, disabled: !entryForm.studentId && !entryForm.leadId || !entryForm.date }, "Salvar"))));
};
const LEAD_ETAPAS = [
  { id: "novo", label: "Novo Lead", emoji: "🟡", color: "#ca8a04", bg: "#fef9c3" },
  { id: "contato", label: "Contato Iniciado", emoji: "🔵", color: "#2563eb", bg: "#dbeafe" },
  { id: "qualificado", label: "Qualificado", emoji: "🟣", color: "#7c3aed", bg: "#ede9fe" },
  { id: "exp_agendada", label: "Exp. Agendada", emoji: "🟠", color: "#ea580c", bg: "#ffedd5" },
  { id: "exp_realizada", label: "Exp. Realizada", emoji: "🟢", color: "#0d9488", bg: "#ccfbf1" },
  { id: "proposta", label: "Proposta/Fechamento", emoji: "💰", color: "#0891b2", bg: "#cffafe" },
  { id: "fechado", label: "Cliente Fechado", emoji: "✅", color: "#16a34a", bg: "#dcfce7" },
  { id: "followup", label: "Follow-up/Recuperação", emoji: "🔴", color: "#dc2626", bg: "#fee2e2" },
  { id: "perdido", label: "Perdido/Sem Interesse", emoji: "⚫", color: "#475569", bg: "#e2e8f0" }
];
const LEAD_STATUS = [
  { id: "ativo", label: "Ativo", emoji: "🟢", color: "#16a34a", bg: "#dcfce7" },
  { id: "aguardando", label: "Aguardando resposta", emoji: "🟡", color: "#ca8a04", bg: "#fef9c3" },
  { id: "followup_agendado", label: "Follow-up agendado", emoji: "🔵", color: "#2563eb", bg: "#dbeafe" },
  { id: "sem_resposta", label: "Sem resposta", emoji: "🔴", color: "#dc2626", bg: "#fee2e2" },
  { id: "perdido", label: "Perdido", emoji: "⚫", color: "#475569", bg: "#e2e8f0" },
  { id: "convertido", label: "Convertido", emoji: "✅", color: "#16a34a", bg: "#dcfce7" }
];
const LEAD_ORIGENS = ["Instagram", "Indicação de aluno", "Presente de aluno", "Indicação de amigo", "Academia", "WhatsApp", "Google", "Evento", "Outro"];
const LEAD_OBJETIVOS = ["Emagrecimento", "Hipertrofia", "Força", "Mobilidade", "Condicionamento", "Saúde", "Autonomia", "50+", "Outro"];
const LEAD_TEMPERATURAS = [
  { id: "quente", label: "Quente", emoji: "🔥", color: "#dc2626", bg: "#fee2e2" },
  { id: "morno", label: "Morno", emoji: "🟡", color: "#ca8a04", bg: "#fef9c3" },
  { id: "frio", label: "Frio", emoji: "❄️", color: "#2563eb", bg: "#dbeafe" }
];
const PROXIMA_ACAO_TIPOS = ["Enviar mensagem", "Fazer ligação", "Enviar proposta", "Confirmar aula experimental", "Fazer follow-up", "Perguntar se decidiu", "Verificar disponibilidade", "Outro"];
const MOTIVO_NAO_FECHAMENTO = ["💰 Preço", "⏰ Horário", "📍 Localização", "🤔 Vai pensar", "👨‍👩‍👧 Precisa conversar com alguém", "🏋️ Preferiu treinar sozinho", "📅 Momento inadequado", "❌ Não respondeu", "Outro"];
const OLD_STAGE_TO_ETAPA = { novo: "novo", conversa: "contato", experimental: "exp_agendada", proposta: "proposta", convertido: "fechado", perdido: "perdido" };
const migrateLead = (l) => {
  if (l.etapa) return { ...l, valorPotencial: l.valorPotencial || "", historico: l.historico || (l.createdAt ? [{ ts: l.createdAt + "T00:00:00", texto: "Lead cadastrado" }] : []) };
  const etapa = OLD_STAGE_TO_ETAPA[l.stage] || "novo";
  return {
    ...l,
    etapa,
    status: l.stage === "convertido" ? "convertido" : l.stage === "perdido" ? "perdido" : "ativo",
    whatsapp: l.whatsapp || l.phone || "",
    instagram: l.instagram || "",
    idade: l.idade || "",
    sexo: l.sexo || "",
    indicadoPor: l.indicadoPor || "",
    objetivo: l.objetivo || "",
    necessidade: l.necessidade || "",
    temperatura: l.temperatura || "morno",
    proximaAcaoTipo: l.proximaAcaoTipo || "",
    proximaAcaoData: l.proximaAcaoData || "",
    proximaAcaoHorario: l.proximaAcaoHorario || "",
    proximaAcaoObs: l.proximaAcaoObs || "",
    motivoNaoFechamento: l.motivoNaoFechamento || "",
    motivoObs: l.motivoObs || "",
    valorPotencial: l.valorPotencial || "",
    historico: l.historico || (l.createdAt ? [{ ts: l.createdAt + "T00:00:00", texto: "Lead cadastrado" }] : [])
  };
};
const Leads = ({ leads, setLeads, students, setStudents, agendaEntries, setAgendaEntries, nav }) => {
  useEffect(() => {
    const comData = leads.filter((l) => l.etapa === "exp_agendada" && l.proximaAcaoData);
    const foraDaEtapa = leads.filter((l) => l.etapa !== "exp_agendada" && l.agendaEntryId);
    if (foraDaEtapa.length) {
      const idsRemover = foraDaEtapa.map((l) => l.agendaEntryId);
      setAgendaEntries((p) => p.filter((e) => !idsRemover.includes(e.id)));
      setLeads((p) => p.map((l) => idsRemover.includes(l.agendaEntryId) ? { ...l, agendaEntryId: null } : l));
    }
    comData.forEach((l) => {
      const existente = l.agendaEntryId ? (agendaEntries || []).find((e) => e.id === l.agendaEntryId) : null;
      if (!existente) {
        const nova = { id: uid(), leadId: l.id, date: l.proximaAcaoData, time: l.proximaAcaoHorario || "", status: "agendado", obs: "🧪 Aula experimental" + (l.proximaAcaoObs ? " — " + l.proximaAcaoObs : "") };
        setAgendaEntries((p) => [...p, nova]);
        setLeads((p) => p.map((x) => x.id === l.id ? { ...x, agendaEntryId: nova.id } : x));
      } else if (existente.date !== l.proximaAcaoData || existente.time !== (l.proximaAcaoHorario || "")) {
        setAgendaEntries((p) => p.map((e) => e.id === existente.id ? { ...e, date: l.proximaAcaoData, time: l.proximaAcaoHorario || "" } : e));
      }
    });
  }, [leads]);
  const [ledView, setLedView] = useState("kanban");
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const emptyForm = () => ({ name: "", whatsapp: "", instagram: "", idade: "", sexo: "", origem: "WhatsApp", indicadoPor: "", objetivo: "", necessidade: "", temperatura: "morno", etapa: "novo", status: "ativo", obs: "", proximaAcaoTipo: "", proximaAcaoData: "", proximaAcaoHorario: "", proximaAcaoObs: "", motivoNaoFechamento: "", motivoObs: "", valorPotencial: "" });
  const [form, setForm] = useState(emptyForm());
  const openNew = () => {
    setEditId(null);
    setForm(emptyForm());
    setModal(true);
  };
  const openEdit = (lead) => {
    setEditId(lead.id);
    setForm({ ...emptyForm(), ...lead });
    setModal(true);
  };
  const save = () => {
    if (!form.name.trim()) return;
    const now = (new Date()).toISOString();
    if (editId) setLeads((p) => p.map((l) => {
      if (l.id !== editId) return l;
      const novasEntradas = [];
      if (l.etapa !== form.etapa) {
        const et = LEAD_ETAPAS.find((e) => e.id === form.etapa);
        novasEntradas.push({ ts: now, texto: `Etapa alterada para: ${et ? et.emoji + " " + et.label : form.etapa}` });
      }
      if (l.status !== form.status) {
        const stt = LEAD_STATUS.find((s) => s.id === form.status);
        novasEntradas.push({ ts: now, texto: `Status alterado para: ${stt ? stt.emoji + " " + stt.label : form.status}` });
      }
      return { ...l, ...form, name: form.name.trim(), historico: [...l.historico || [], ...novasEntradas] };
    }));
    else setLeads((p) => [...p, { id: uid(), ...form, name: form.name.trim(), createdAt: todayStr(), historico: [{ ts: now, texto: "Lead cadastrado" }] }]);
    setModal(false);
  };
  const del = async (id) => {
    if (window.confirm("Remover este lead?")) {
      const lead = leads.find((l) => l.id === id);
      if (lead?.agendaEntryId) {
        await DB.remove("agenda", lead.agendaEntryId);
        setAgendaEntries((p) => p.filter((e) => e.id !== lead.agendaEntryId));
      }
      await DB.remove("leads", id);
      setLeads((p) => p.filter((l) => l.id !== id));
    }
  };
  const [motivoModal, setMotivoModal] = useState(null);
  const [motivoForm, setMotivoForm] = useState({ motivoNaoFechamento: "", motivoObs: "" });
  const setEtapaRapida = (lead, etapa) => {
    const status = etapa === "fechado" ? "convertido" : etapa === "perdido" ? "perdido" : lead.status === "convertido" || lead.status === "perdido" ? "ativo" : lead.status;
    const et = LEAD_ETAPAS.find((e) => e.id === etapa);
    const now = (new Date()).toISOString();
    setLeads((p) => p.map((l) => l.id === lead.id ? { ...l, etapa, status, historico: [...l.historico || [], { ts: now, texto: `Etapa alterada para: ${et ? et.emoji + " " + et.label : etapa}` }] } : l));
    if ((etapa === "followup" || etapa === "perdido") && lead.etapa !== etapa) {
      setMotivoForm({ motivoNaoFechamento: lead.motivoNaoFechamento || "", motivoObs: lead.motivoObs || "" });
      setMotivoModal(lead.id);
    }
  };
  const saveMotivo = () => {
    const now = (new Date()).toISOString();
    setLeads((p) => p.map((l) => l.id === motivoModal ? { ...l, ...motivoForm, historico: [...l.historico || [], { ts: now, texto: `Motivo registrado: ${motivoForm.motivoNaoFechamento || "—"}` }] } : l));
    setMotivoModal(null);
  };
  const converter = (lead) => {
    if (!window.confirm(`Converter "${lead.name}" em aluno?`)) return;
    const novoAluno = { id: uid(), name: lead.name, phone: lead.whatsapp || "", whatsapp: lead.whatsapp || "", dob: "", sex: "", createdAt: todayStr() };
    setStudents((p) => [...p, novoAluno]);
    const now = (new Date()).toISOString();
    setLeads((p) => p.map((l) => l.id === lead.id ? { ...l, etapa: "fechado", status: "convertido", studentId: novoAluno.id, historico: [...l.historico || [], { ts: now, texto: "🎓 Cliente convertido em aluno" }] } : l));
  };
  const mostraIndicadoPor = form.origem === "Indicação de aluno" || form.origem === "Indicação de amigo";
  const totalGeral = leads.length;
  const leadsAtivos = leads.filter((l) => l.etapa !== "fechado" && l.etapa !== "perdido").length;
  const qtdNovos = leads.filter((l) => l.etapa === "novo").length;
  const qtdExperimentais = leads.filter((l) => l.etapa === "exp_agendada").length;
  const qtdFollowups = leads.filter((l) => l.etapa === "followup").length;
  const qtdConvertidos = leads.filter((l) => l.etapa === "fechado").length;
  const taxaConversao = totalGeral > 0 ? Math.round(qtdConvertidos / totalGeral * 100) : 0;
  const valorPotencialTotal = leads.filter((l) => l.etapa !== "fechado" && l.etapa !== "perdido").reduce((sum, l) => sum + (parseFloat(l.valorPotencial) || 0), 0);
  const fmtMoeda = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const STAT_CARDS = [
    { label: "Leads Ativos", value: leadsAtivos, emoji: "🧲", color: "#2563eb", bg: "#dbeafe" },
    { label: "Novos", value: qtdNovos, emoji: "🟡", color: "#ca8a04", bg: "#fef9c3" },
    { label: "Experimentais", value: qtdExperimentais, emoji: "🟠", color: "#ea580c", bg: "#ffedd5" },
    { label: "Follow-ups", value: qtdFollowups, emoji: "🔴", color: "#dc2626", bg: "#fee2e2" },
    { label: "Convertidos", value: qtdConvertidos, emoji: "✅", color: "#16a34a", bg: "#dcfce7" },
    { label: "Taxa de Conversão", value: taxaConversao + "%", emoji: "📈", color: "#7c3aed", bg: "#ede9fe" },
    { label: "Valor Potencial", value: fmtMoeda(valorPotencialTotal), emoji: "💰", color: "#0891b2", bg: "#cffafe" }
  ];
  const hojeStr = todayStr();
  const novosHoje = leads.filter((l) => l.createdAt === hojeStr);
  const contatosPendentes = leads.filter((l) => l.etapa === "novo");
  const experimentaisHoje = leads.filter((l) => l.etapa === "exp_agendada" && l.proximaAcaoData === hojeStr).sort((a, b) => (a.proximaAcaoHorario || "").localeCompare(b.proximaAcaoHorario || ""));
  const followupsHoje = leads.filter((l) => l.etapa !== "exp_agendada" && l.etapa !== "fechado" && l.etapa !== "perdido" && l.proximaAcaoData === hojeStr).sort((a, b) => (a.proximaAcaoHorario || "").localeCompare(b.proximaAcaoHorario || ""));
  const followupsAtrasados = leads.filter((l) => l.etapa !== "fechado" && l.etapa !== "perdido" && l.proximaAcaoData && l.proximaAcaoData < hojeStr).sort((a, b) => a.proximaAcaoData.localeCompare(b.proximaAcaoData));
  const diasAtraso = (d) => Math.round((new Date(hojeStr + "T00:00:00") - new Date(d + "T00:00:00")) / 864e5);
  const relatorioOrigem = LEAD_ORIGENS.map((o) => {
    const doOrigem = leads.filter((l) => l.origem === o);
    const convertidosOrigem = doOrigem.filter((l) => l.etapa === "fechado").length;
    const conversao = doOrigem.length > 0 ? Math.round(convertidosOrigem / doOrigem.length * 100) : 0;
    return { origem: o, total: doOrigem.length, convertidos: convertidosOrigem, conversao };
  }).filter((r) => r.total > 0).sort((a, b) => b.total - a.total);
  const SecaoHoje = ({ emoji, titulo, itens, render }) => React.createElement("div", { style: { marginBottom: 20 } }, React.createElement("div", { style: { fontSize: 13, fontWeight: 800, marginBottom: 8 } }, emoji, " ", titulo, itens.length > 0 ? ` (${itens.length})` : ""), itens.length === 0 ? React.createElement("div", { style: { fontSize: 12, color: "#cbd5e1", padding: "4px 0 8px" } }, "Nada por aqui.") : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, itens.map(render)));
  return React.createElement("div", null, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 20 } }, "🧲 Leads"), React.createElement(Btn, { sm: true, icon: "plus", onClick: openNew }, "Novo Lead")), React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 14 } }, React.createElement("button", { onClick: () => setLedView("kanban"), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: ledView === "kanban" ? O : "#f1f5f9", color: ledView === "kanban" ? "#fff" : "#64748b" } }, "🗂 Kanban"), React.createElement("button", { onClick: () => setLedView("hoje"), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: ledView === "hoje" ? O : "#f1f5f9", color: ledView === "hoje" ? "#fff" : "#64748b" } }, "📅 Hoje"), React.createElement("button", { onClick: () => setLedView("relatorio"), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: ledView === "relatorio" ? O : "#f1f5f9", color: ledView === "relatorio" ? "#fff" : "#64748b" } }, "📊 Relatório")), ledView === "kanban" && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 14, lineHeight: 1.5 } }, "Acompanhe cada pessoa que chegou até você (WhatsApp, indicação, presencial...) desde o primeiro contato até virar aluno."), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 16 } }, STAT_CARDS.map((c) => React.createElement("div", { key: c.label, style: { background: c.bg, borderRadius: 12, padding: "10px 12px" } }, React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: c.color, marginBottom: 3 } }, c.emoji, " ", c.label), React.createElement("div", { style: { fontSize: 19, fontWeight: 800, color: c.color } }, c.value)))), React.createElement("div", { style: { display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10, WebkitOverflowScrolling: "touch", margin: "0 -20px", padding: "0 20px 10px" } }, LEAD_ETAPAS.map((etapa) => {
    const doEtapa = leads.filter((l) => l.etapa === etapa.id);
    return React.createElement("div", { key: etapa.id, style: { flex: "0 0 240px", width: 240 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, padding: "0 2px" } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: etapa.color } }, etapa.emoji, " ", etapa.label), React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#fff", background: etapa.color, borderRadius: 99, minWidth: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" } }, doEtapa.length)), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, minHeight: 60 } }, doEtapa.length === 0 && React.createElement("div", { style: { border: "1.5px dashed #e2e8f0", borderRadius: 10, padding: "16px 8px", textAlign: "center", fontSize: 11, color: "#cbd5e1" } }, "Vazio"), doEtapa.map((lead) => {
      const temp = LEAD_TEMPERATURAS.find((t) => t.id === lead.temperatura) || LEAD_TEMPERATURAS[1];
      const stat = LEAD_STATUS.find((s) => s.id === lead.status);
      return React.createElement(Card, { key: lead.id, onClick: () => openEdit(lead), style: { padding: "10px 12px" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 3 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13 } }, lead.name), React.createElement("span", { title: temp.label, style: { fontSize: 13, flexShrink: 0 } }, temp.emoji)), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 6 } }, lead.origem, lead.whatsapp ? " · " + lead.whatsapp : ""), stat && React.createElement("div", { style: { marginBottom: 6 } }, React.createElement(Badge, { color: stat.color, bg: stat.bg }, stat.emoji, " ", stat.label)), lead.proximaAcaoData && (() => {
        const atrasada = lead.proximaAcaoData < todayStr();
        return React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: atrasada ? "#dc2626" : "#64748b", marginBottom: 6 } }, atrasada ? "⚠️ " : "🔔 ", lead.proximaAcaoTipo || "Próxima ação", " · ", fmt(lead.proximaAcaoData), lead.proximaAcaoHorario ? " " + lead.proximaAcaoHorario : "");
      })(), lead.obs && React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginBottom: 6, whiteSpace: "pre-wrap" } }, lead.obs), React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4 }, onClick: (e) => e.stopPropagation() }, React.createElement("select", { value: lead.etapa, onChange: (e) => setEtapaRapida(lead, e.target.value), style: { flex: 1, border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: 6, padding: "4px 4px", fontSize: 10, color: "#334155" } }, LEAD_ETAPAS.map((et) => React.createElement("option", { key: et.id, value: et.id }, et.emoji, " ", et.label))), !lead.studentId && React.createElement("button", { onClick: () => converter(lead), style: { border: "none", background: "#dcfce7", color: "#16a34a", borderRadius: 6, padding: "4px 6px", fontSize: 10, fontWeight: 700, cursor: "pointer", flexShrink: 0 } }, "🎓"), lead.studentId && React.createElement("button", { onClick: () => nav("studentDetail", { studentId: lead.studentId }), style: { border: "none", background: "#f1f5f9", color: "#475569", borderRadius: 6, padding: "4px 6px", fontSize: 10, fontWeight: 700, cursor: "pointer", flexShrink: 0 } }, "Ver aluno"), React.createElement("button", { onClick: () => del(lead.id), style: { border: "none", background: "none", cursor: "pointer", color: "#e2e8f0", padding: 2, flexShrink: 0 } }, React.createElement(I, { n: "trash", s: 13 }))));
    })));
  }))), ledView === "hoje" && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 1.5 } }, "Tudo o que precisa da sua atenção hoje, ", fmt(hojeStr), "."), React.createElement(SecaoHoje, { emoji: "🔥", titulo: "Novos Leads", itens: novosHoje, render: (l) => React.createElement(Card, { key: l.id, onClick: () => openEdit(l), style: { padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" } }, React.createElement("span", { style: { fontWeight: 700, fontSize: 13 } }, l.name), React.createElement("span", { style: { fontSize: 11, color: "#94a3b8" } }, l.origem)) }), React.createElement(SecaoHoje, { emoji: "📞", titulo: "Contatos Pendentes", itens: contatosPendentes, render: (l) => React.createElement(Card, { key: l.id, onClick: () => openEdit(l), style: { padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" } }, React.createElement("span", { style: { fontWeight: 700, fontSize: 13 } }, l.name), React.createElement("span", { style: { fontSize: 11, color: "#94a3b8" } }, l.whatsapp || l.origem)) }), React.createElement(SecaoHoje, { emoji: "🏋️", titulo: "Experimentais de Hoje", itens: experimentaisHoje, render: (l) => React.createElement(Card, { key: l.id, onClick: () => openEdit(l), style: { padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" } }, React.createElement("span", { style: { fontWeight: 700, fontSize: 13 } }, l.name), React.createElement(Badge, { color: "#ea580c", bg: "#ffedd5" }, l.proximaAcaoHorario || "—")) }), React.createElement(SecaoHoje, { emoji: "🔔", titulo: "Follow-ups de Hoje", itens: followupsHoje, render: (l) => React.createElement(Card, { key: l.id, onClick: () => openEdit(l), style: { padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" } }, React.createElement("span", { style: { fontWeight: 700, fontSize: 13 } }, l.name), React.createElement(Badge, { color: "#2563eb", bg: "#dbeafe" }, l.proximaAcaoHorario || "—")) }), React.createElement(SecaoHoje, { emoji: "⚠️", titulo: "Follow-ups Atrasados", itens: followupsAtrasados, render: (l) => {
    const dias = diasAtraso(l.proximaAcaoData);
    return React.createElement(Card, { key: l.id, onClick: () => openEdit(l), style: { padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" } }, React.createElement("span", { style: { fontWeight: 700, fontSize: 13 } }, l.name), React.createElement(Badge, { color: "#dc2626", bg: "#fee2e2" }, dias, " dia", dias > 1 ? "s" : "", " atrasado"));
  } })), ledView === "relatorio" && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 1.5 } }, "Quais canais trazem mais leads — e, principalmente, quais trazem leads que realmente viram aluno."), relatorioOrigem.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 32 } }, React.createElement(I, { n: "bar", c: "#cbd5e1", s: 32 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhum lead cadastrado ainda.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, relatorioOrigem.map((r) => React.createElement(Card, { key: r.origem, style: { padding: "12px 14px" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 10 } }, r.origem), React.createElement("div", { style: { display: "flex", gap: 8 } }, React.createElement("div", { style: { flex: 1, textAlign: "center" } }, React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: "#334155" } }, r.total), React.createElement("div", { style: { fontSize: 10, color: "#94a3b8" } }, "Leads")), React.createElement("div", { style: { flex: 1, textAlign: "center" } }, React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: "#16a34a" } }, r.convertidos), React.createElement("div", { style: { fontSize: 10, color: "#94a3b8" } }, "Clientes")), React.createElement("div", { style: { flex: 1, textAlign: "center" } }, React.createElement("div", { style: { fontSize: 18, fontWeight: 800, color: "#7c3aed" } }, r.conversao, "%"), React.createElement("div", { style: { fontSize: 10, color: "#94a3b8" } }, "Conversão"))))))), modal && React.createElement(Modal, { title: editId ? "Ficha do Lead" : "Novo Lead", onClose: () => setModal(false) }, React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" } }, "Dados básicos"), React.createElement(Inp, { label: "Nome *", value: form.name, onChange: (v) => setForm((f) => ({ ...f, name: v })), placeholder: "Nome do contato" }), React.createElement(Inp, { label: "WhatsApp", value: form.whatsapp, onChange: (v) => setForm((f) => ({ ...f, whatsapp: v })), placeholder: "(00) 00000-0000" }), React.createElement(Inp, { label: "Instagram", value: form.instagram, onChange: (v) => setForm((f) => ({ ...f, instagram: v })), placeholder: "@usuario" }), React.createElement("div", { style: { display: "flex", gap: 10 } }, React.createElement("div", { style: { flex: 1 } }, React.createElement(Inp, { label: "Idade", value: form.idade, onChange: (v) => setForm((f) => ({ ...f, idade: v })), placeholder: "Ex: 62" })), React.createElement("div", { style: { flex: 1 } }, React.createElement(Inp, { label: "Sexo", value: form.sexo, onChange: (v) => setForm((f) => ({ ...f, sexo: v })), opts: [{ v: "", l: "Selecione..." }, { v: "F", l: "Feminino" }, { v: "M", l: "Masculino" }, { v: "Outro", l: "Outro" }] }))), React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, margin: "14px 0 8px" } }, "Origem"), React.createElement(Inp, { label: "Origem do lead", value: form.origem, onChange: (v) => setForm((f) => ({ ...f, origem: v })), opts: LEAD_ORIGENS.map((o) => ({ v: o, l: o })) }), mostraIndicadoPor && React.createElement(Inp, { label: "Indicado por", value: form.indicadoPor, onChange: (v) => setForm((f) => ({ ...f, indicadoPor: v })), placeholder: "Nome de quem indicou" }), React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, margin: "14px 0 8px" } }, "Objetivo / Necessidade"), React.createElement(Inp, { label: "Objetivo principal", value: form.objetivo, onChange: (v) => setForm((f) => ({ ...f, objetivo: v })), opts: [{ v: "", l: "Selecione..." }, ...LEAD_OBJETIVOS.map((o) => ({ v: o, l: o }))] }), React.createElement("div", { style: { marginBottom: 13 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 } }, "Principal necessidade / dor"), React.createElement("textarea", { value: form.necessidade, onChange: (e) => setForm((f) => ({ ...f, necessidade: e.target.value })), placeholder: "Ex: Tem medo de cair. Está sedentário. Quer voltar a treinar depois dos 60.", rows: 3, style: { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, color: "#0f172a", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" } })), React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, margin: "14px 0 8px" } }, "Temperatura"), React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 13 } }, LEAD_TEMPERATURAS.map((t) => React.createElement("button", { key: t.id, onClick: () => setForm((f) => ({ ...f, temperatura: t.id })), style: { flex: 1, border: form.temperatura === t.id ? `1.5px solid ${t.color}` : "1.5px solid #e2e8f0", background: form.temperatura === t.id ? t.bg : "#f8fafc", color: form.temperatura === t.id ? t.color : "#64748b", borderRadius: 9, padding: "9px 4px", fontSize: 12, fontWeight: 700, cursor: "pointer" } }, t.emoji, " ", t.label))), React.createElement(Inp, { label: "Valor do plano (R$) — opcional", type: "number", value: form.valorPotencial, onChange: (v) => setForm((f) => ({ ...f, valorPotencial: v })), placeholder: "Ex: 350" }), React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, margin: "14px 0 8px" } }, "Funil"), React.createElement("div", { style: { display: "flex", gap: 10 } }, React.createElement("div", { style: { flex: 1 } }, React.createElement(Inp, { label: "Etapa", value: form.etapa, onChange: (v) => setForm((f) => ({ ...f, etapa: v })), opts: LEAD_ETAPAS.map((e) => ({ v: e.id, l: e.emoji + " " + e.label })) })), React.createElement("div", { style: { flex: 1 } }, React.createElement(Inp, { label: "Status", value: form.status, onChange: (v) => setForm((f) => ({ ...f, status: v })), opts: LEAD_STATUS.map((s) => ({ v: s.id, l: s.emoji + " " + s.label })) }))), React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, margin: "14px 0 8px" } }, "Próxima ação"), React.createElement(Inp, { label: "O que fazer", value: form.proximaAcaoTipo, onChange: (v) => setForm((f) => ({ ...f, proximaAcaoTipo: v })), opts: [{ v: "", l: "Selecione..." }, ...PROXIMA_ACAO_TIPOS.map((t) => ({ v: t, l: t }))] }), React.createElement("div", { style: { display: "flex", gap: 10 } }, React.createElement("div", { style: { flex: 1 } }, React.createElement(Inp, { label: "Data", type: "date", value: form.proximaAcaoData, onChange: (v) => setForm((f) => ({ ...f, proximaAcaoData: v })) })), React.createElement("div", { style: { flex: 1 } }, React.createElement(Inp, { label: "Horário", type: "time", value: form.proximaAcaoHorario, onChange: (v) => setForm((f) => ({ ...f, proximaAcaoHorario: v })) }))), React.createElement("div", { style: { marginBottom: 13 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 } }, "Observação da próxima ação"), React.createElement("textarea", { value: form.proximaAcaoObs, onChange: (e) => setForm((f) => ({ ...f, proximaAcaoObs: e.target.value })), placeholder: "Ex: Perguntar se conseguiu conversar com a esposa sobre o plano.", rows: 2, style: { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, color: "#0f172a", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" } })), (form.etapa === "followup" || form.etapa === "perdido") && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, margin: "14px 0 8px" } }, "Motivo de não fechamento"), React.createElement(Inp, { label: "Motivo", value: form.motivoNaoFechamento, onChange: (v) => setForm((f) => ({ ...f, motivoNaoFechamento: v })), opts: [{ v: "", l: "Selecione..." }, ...MOTIVO_NAO_FECHAMENTO.map((m) => ({ v: m, l: m }))] }), React.createElement("div", { style: { marginBottom: 13 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 } }, "Observação complementar"), React.createElement("textarea", { value: form.motivoObs, onChange: (e) => setForm((f) => ({ ...f, motivoObs: e.target.value })), rows: 2, style: { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, color: "#0f172a", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" } }))), React.createElement("div", { style: { marginBottom: 13 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 } }, "Observações"), React.createElement("textarea", { value: form.obs, onChange: (e) => setForm((f) => ({ ...f, obs: e.target.value })), placeholder: "Ex: Veio pelo Instagram, interessada em treino funcional 3x/semana.", rows: 3, style: { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, color: "#0f172a", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" } })), editId && (form.historico || []).length > 0 && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, margin: "14px 0 8px" } }, "Histórico"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, maxHeight: 220, overflowY: "auto", border: "1.5px solid #f1f5f9", borderRadius: 10, padding: "10px 12px" } }, [...form.historico || []].sort((a, b) => a.ts.localeCompare(b.ts)).map((h, i) => React.createElement("div", { key: i, style: { display: "flex", gap: 8, fontSize: 12 } }, React.createElement("div", { style: { color: "#94a3b8", flexShrink: 0, minWidth: 98 } }, new Date(h.ts).toLocaleDateString("pt-BR"), " ", new Date(h.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })), React.createElement("div", { style: { color: "#334155" } }, h.texto))))), editId && form.studentId && React.createElement("div", { style: { marginBottom: 13 } }, React.createElement(Btn, { variant: "secondary", onClick: () => {
    setModal(false);
    nav("studentDetail", { studentId: form.studentId });
  } }, "Ver ficha do aluno")), editId && !form.studentId && React.createElement("div", { style: { marginBottom: 13 } }, React.createElement(Btn, { variant: "secondary", onClick: () => {
    save();
    converter(form);
  } }, "🎓 Converter em Aluno")), React.createElement("div", { style: { display: "flex", gap: 8 } }, editId && React.createElement(Btn, { variant: "danger", onClick: () => {
    del(editId);
    setModal(false);
  } }, "Excluir"), React.createElement(Btn, { full: true, onClick: save, disabled: !form.name.trim() }, "Salvar"))), motivoModal && React.createElement(Modal, { title: "Motivo", onClose: () => setMotivoModal(null) }, React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 14 } }, "Por que esse lead não fechou agora?"), React.createElement(Inp, { label: "Motivo de não fechamento", value: motivoForm.motivoNaoFechamento, onChange: (v) => setMotivoForm((f) => ({ ...f, motivoNaoFechamento: v })), opts: [{ v: "", l: "Selecione..." }, ...MOTIVO_NAO_FECHAMENTO.map((m) => ({ v: m, l: m }))] }), React.createElement("div", { style: { marginBottom: 13 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 } }, "Observação complementar"), React.createElement("textarea", { value: motivoForm.motivoObs, onChange: (e) => setMotivoForm((f) => ({ ...f, motivoObs: e.target.value })), rows: 3, style: { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 14, color: "#0f172a", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" } })), React.createElement(Btn, { full: true, onClick: saveMotivo }, "Salvar")));
};
const Contrato = ({ students, setStudents, contratoModelos, setContratoModelos, contratoAssinaturas, nav }) => {
  const [viewCat, setViewCat] = useState("alunos");
  const [modeloModal, setModeloModal] = useState(false);
  const [modeloEditId, setModeloEditId] = useState(null);
  const emptyModelo = () => ({ nome: "", texto: "", prazoDias: 7, padrao: contratoModelos.length === 0 });
  const [modeloForm, setModeloForm] = useState(emptyModelo());
  const [verAssinatura, setVerAssinatura] = useState(null);
  const [assignSt, setAssignSt] = useState(null);
  const [assignModo, setAssignModo] = useState("modelo");
  const [assignModeloId, setAssignModeloId] = useState("");
  const [assignTexto, setAssignTexto] = useState("");
  const modeloPadrao = contratoModelos.find((m) => m.padrao) || contratoModelos[0];
  const abrirNovoModelo = () => {
    setModeloEditId(null);
    setModeloForm(emptyModelo());
    setModeloModal(true);
  };
  const abrirEditModelo = (m) => {
    setModeloEditId(m.id);
    setModeloForm({ nome: m.nome, texto: m.texto, prazoDias: m.prazoDias || 7, padrao: !!m.padrao });
    setModeloModal(true);
  };
  const salvarModelo = () => {
    if (!modeloForm.nome.trim() || !modeloForm.texto.trim()) return;
    const dados = { nome: modeloForm.nome.trim(), texto: modeloForm.texto, prazoDias: parseInt(modeloForm.prazoDias) || 7, padrao: modeloForm.padrao };
    if (modeloEditId) {
      setContratoModelos((p) => p.map((m) => {
        if (dados.padrao && m.id !== modeloEditId) return { ...m, padrao: false };
        return m.id === modeloEditId ? { ...m, ...dados } : m;
      }));
    } else {
      const novo = { id: uid(), ...dados, createdAt: todayStr() };
      setContratoModelos((p) => [...dados.padrao ? p.map((m) => ({ ...m, padrao: false })) : p, novo]);
    }
    setModeloModal(false);
  };
  const excluirModelo = async (id) => {
    if (!window.confirm("Excluir este modelo? Alunos já vinculados a ele continuam com o texto que já foi definido, mas não vão mais poder usar esse modelo pra novas atribuições.")) return;
    await DB.remove("contrato_modelo", id);
    setContratoModelos((p) => p.filter((m) => m.id !== id));
  };
  const definirPadrao = (id) => setContratoModelos((p) => p.map((m) => ({ ...m, padrao: m.id === id })));
  const assinaturaDoAluno = (studentId) => [...contratoAssinaturas || []].filter((c) => c.student_id === studentId).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))[0];
  const modeloEfetivo = (s) => {
    if (s.contratoTextoPersonalizado) return { nome: "Personalizado", prazoDias: (contratoModelos.find((m) => m.id === s.contratoModeloId) || modeloPadrao)?.prazoDias || 7 };
    if (s.contratoModeloId) {
      const m = contratoModelos.find((x) => x.id === s.contratoModeloId);
      if (m) return m;
    }
    return modeloPadrao;
  };
  const agora = new Date();
  const renovarPrazo = (s) => {
    if (!window.confirm(`Renovar o prazo de assinatura de ${s.name}? Ele(a) vai ter mais ${modeloEfetivo(s)?.prazoDias || 7} dia(s) a partir de agora pra assinar.`)) return;
    setStudents((p) => p.map((x) => x.id === s.id ? { ...x, contratoPrazoLiberadoEm: todayStr() } : x));
  };
  const abrirAssign = (s) => {
    setAssignSt(s);
    setAssignModo(s.contratoTextoPersonalizado ? "personalizado" : "modelo");
    setAssignModeloId(s.contratoModeloId || modeloPadrao?.id || "");
    setAssignTexto(s.contratoTextoPersonalizado || (contratoModelos.find((m) => m.id === (s.contratoModeloId || modeloPadrao?.id))?.texto || ""));
  };
  const salvarAssign = () => {
    if (assignModo === "modelo") {
      setStudents((p) => p.map((s) => s.id === assignSt.id ? { ...s, contratoModeloId: assignModeloId, contratoTextoPersonalizado: "" } : s));
    } else {
      setStudents((p) => p.map((s) => s.id === assignSt.id ? { ...s, contratoTextoPersonalizado: assignTexto, contratoModeloId: assignModeloId } : s));
    }
    setAssignSt(null);
  };
  return React.createElement("div", null, React.createElement("div", { style: { fontWeight: 800, fontSize: 20, marginBottom: 4 } }, "📋 Contrato"), React.createElement("div", { style: { fontSize: 13, color: "#94a3b8", marginBottom: 18 } }, "Seus modelos de contrato e quem já assinou."), React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 18 } }, React.createElement("button", { onClick: () => setViewCat("alunos"), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: viewCat === "alunos" ? O : "#f1f5f9", color: viewCat === "alunos" ? "#fff" : "#64748b" } }, "Alunos"), React.createElement("button", { onClick: () => setViewCat("modelos"), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: viewCat === "modelos" ? O : "#f1f5f9", color: viewCat === "modelos" ? "#fff" : "#64748b" } }, "Modelos")), viewCat === "modelos" && React.createElement(React.Fragment, null, React.createElement(Btn, { full: true, icon: "plus", onClick: abrirNovoModelo, style: { marginBottom: 16 } }, "Novo Modelo"), contratoModelos.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 32 } }, React.createElement(I, { n: "clip", c: "#cbd5e1", s: 32 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhum modelo cadastrado ainda.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, contratoModelos.map((m) => React.createElement(Card, { key: m.id, onClick: () => abrirEditModelo(m), style: { padding: "14px 16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 } }, React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 } }, React.createElement("span", { style: { fontWeight: 700, fontSize: 14 } }, m.nome), m.padrao && React.createElement(Badge, { color: "#16a34a", bg: "#dcfce7" }, "Padrão")), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, "Prazo pra assinar: ", m.prazoDias || 7, " dia(s) · ", students.filter((s) => (s.contratoModeloId || modeloPadrao?.id) === m.id && !s.contratoTextoPersonalizado).length, " aluno(s) neste modelo")), React.createElement("button", { onClick: (ev) => {
    ev.stopPropagation();
    excluirModelo(m.id);
  }, style: { background: "none", border: "none", cursor: "pointer", color: "#e2e8f0", padding: 4, flexShrink: 0 } }, React.createElement(I, { n: "trash", s: 15 }))))))), viewCat === "alunos" && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 10 } }, "Toque num aluno pendente pra escolher o modelo dele (ou personalizar). Toque num aluno que já assinou pra ver a assinatura."), students.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 32 } }, React.createElement(I, { n: "clip", c: "#cbd5e1", s: 32 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhum aluno cadastrado ainda.")) : React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, students.map((s) => {
    const assin = assinaturaDoAluno(s.id);
    const modeloUsado = modeloEfetivo(s);
    let statusNode;
    let vencido = false;
    if (assin) {
      statusNode = React.createElement(Badge, { color: "#16a34a", bg: "#dcfce7" }, "Assinado em ", fmt((assin.created_at || "").slice(0, 10)));
    } else if (!modeloUsado) {
      statusNode = React.createElement(Badge, { color: "#64748b", bg: "#f1f5f9" }, "Sem modelo definido");
    } else {
      const base = s.contratoPrazoLiberadoEm || s.createdAt;
      const criado = base ? new Date(base + "T00:00:00") : null;
      const prazoVenceEm = criado ? new Date(criado.getTime() + (modeloUsado.prazoDias || 7) * 864e5) : null;
      const diasRestantes = prazoVenceEm ? Math.ceil((prazoVenceEm - agora) / 864e5) : null;
      if (diasRestantes === null) statusNode = React.createElement(Badge, { color: "#64748b", bg: "#f1f5f9" }, "Sem data de cadastro");
      else if (diasRestantes < 0) {
        vencido = true;
        statusNode = React.createElement(Badge, { color: "#dc2626", bg: "#fee2e2" }, "Vencido — acesso bloqueado");
      } else statusNode = React.createElement(Badge, { color: "#d97706", bg: "#fef9c3" }, "Pendente — ", diasRestantes, " dia(s)");
    }
    return React.createElement(Card, { key: s.id, style: { padding: "12px 14px" } }, React.createElement("div", { onClick: () => assin ? setVerAssinatura({ s, assin }) : abrirAssign(s), style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, cursor: "pointer" } }, React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 13 } }, s.name), !assin && React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", marginTop: 2 } }, modeloUsado ? s.contratoTextoPersonalizado ? "✏️ Personalizado" : modeloUsado.nome : "—")), statusNode), vencido && React.createElement("button", { onClick: (ev) => {
      ev.stopPropagation();
      renovarPrazo(s);
    }, style: { marginTop: 10, width: "100%", border: "1.5px solid #FF5603", background: "#fff4ee", color: "#FF5603", borderRadius: 8, padding: "7px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" } }, "Renovar prazo"));
  }))), modeloModal && React.createElement(Modal, { title: modeloEditId ? "Editar Modelo" : "Novo Modelo", onClose: () => setModeloModal(false) }, React.createElement(Inp, { label: "Nome do modelo *", value: modeloForm.nome, onChange: (v) => setModeloForm((f) => ({ ...f, nome: v })), placeholder: "Ex: Presencial, Online, Consultoria" }), React.createElement(Inp, { label: "Prazo para assinatura (dias após o cadastro do aluno)", type: "number", value: modeloForm.prazoDias, onChange: (v) => setModeloForm((f) => ({ ...f, prazoDias: v })) }), React.createElement("div", { style: { marginBottom: 8 } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 5 } }, "Texto do contrato"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 8, lineHeight: 1.5 } }, "Use ", "{nome}", ", ", "{cpf}", ", ", "{plano}", ", ", "{valor}", " e ", "{data}", " — são preenchidos automaticamente. ", "{nome}", " e ", "{cpf}", " são preenchidos pelo próprio aluno na hora de assinar."), React.createElement("textarea", { value: modeloForm.texto, onChange: (e) => setModeloForm((f) => ({ ...f, texto: e.target.value })), rows: 12, placeholder: "Escreva aqui os termos da sua prestação de serviços...", style: { width: "100%", padding: "12px 14px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 13, color: "#0f172a", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", lineHeight: 1.5 } })), React.createElement("div", { onClick: () => setModeloForm((f) => ({ ...f, padrao: !f.padrao })), style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16, cursor: "pointer", background: "#f8fafc", borderRadius: 9, padding: "10px 12px" } }, React.createElement("div", { style: { width: 38, height: 22, borderRadius: 99, background: modeloForm.padrao ? "#FF5603" : "#cbd5e1", position: "relative", transition: "background 0.15s", flexShrink: 0 } }, React.createElement("div", { style: { width: 18, height: 18, borderRadius: 99, background: "#fff", position: "absolute", top: 2, left: modeloForm.padrao ? 18 : 2, transition: "left 0.15s" } })), React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: "#334155" } }, "Modelo padrão (usado pra quem não tem um modelo específico atribuído)")), React.createElement("div", { style: { display: "flex", gap: 8 } }, modeloEditId && React.createElement(Btn, { variant: "danger", onClick: () => {
    excluirModelo(modeloEditId);
    setModeloModal(false);
  } }, "Excluir"), React.createElement(Btn, { full: true, onClick: salvarModelo, disabled: !modeloForm.nome.trim() || !modeloForm.texto.trim() }, "Salvar"))), verAssinatura && React.createElement(Modal, { title: "Contrato assinado", onClose: () => setVerAssinatura(null) }, React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 4 } }, "Assinado por"), React.createElement("div", { style: { fontWeight: 700, fontSize: 15, marginBottom: 2 } }, verAssinatura.assin.data?.nomeDigitado), verAssinatura.assin.data?.cpf && React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 4 } }, "CPF: ", verAssinatura.assin.data.cpf), React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 14 } }, verAssinatura.assin.created_at ? new Date(verAssinatura.assin.created_at).toLocaleString("pt-BR") : ""), verAssinatura.assin.data?.assinaturaImg && React.createElement("img", { src: verAssinatura.assin.data.assinaturaImg, alt: "Assinatura", style: { width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 9, background: "#fff", marginBottom: 14 } }), React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 } }, "Texto assinado"), React.createElement("div", { style: { fontSize: 12, color: "#334155", whiteSpace: "pre-wrap", background: "#f8fafc", borderRadius: 9, padding: "12px 14px", lineHeight: 1.5, maxHeight: 280, overflowY: "auto", marginBottom: 14 } }, verAssinatura.assin.data?.textoAssinado), React.createElement(Btn, { full: true, icon: "download", onClick: () => baixarContratoHTML(verAssinatura.assin) }, "Baixar contrato")), assignSt && React.createElement(Modal, { title: "Contrato — " + assignSt.name, onClose: () => setAssignSt(null) }, React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 16 } }, React.createElement("button", { onClick: () => setAssignModo("modelo"), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: assignModo === "modelo" ? O : "#f1f5f9", color: assignModo === "modelo" ? "#fff" : "#64748b" } }, "Usar um modelo"), React.createElement("button", { onClick: () => setAssignModo("personalizado"), style: { flex: 1, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", background: assignModo === "personalizado" ? O : "#f1f5f9", color: assignModo === "personalizado" ? "#fff" : "#64748b" } }, "Personalizar")), assignModo === "modelo" ? React.createElement(React.Fragment, null, React.createElement(Inp, { label: "Qual modelo esse aluno vai assinar", value: assignModeloId, onChange: setAssignModeloId, opts: contratoModelos.map((m) => ({ v: m.id, l: m.nome + (m.padrao ? " (padrão)" : "") })) }), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: -6, marginBottom: 14, lineHeight: 1.5 } }, "{nome}", ", ", "{cpf}", ", ", "{plano}", ", ", "{valor}", " e ", "{data}", " são preenchidos automaticamente pra esse aluno.")) : React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginBottom: 8, lineHeight: 1.5 } }, "Escreva um contrato só pra esse aluno. Pode começar de um modelo pronto e ajustar."), React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 } }, contratoModelos.map((m) => React.createElement("button", { key: m.id, onClick: () => setAssignTexto(m.texto), style: { border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#64748b", borderRadius: 99, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" } }, 'Copiar "', m.nome, '"'))), React.createElement("textarea", { value: assignTexto, onChange: (e) => setAssignTexto(e.target.value), rows: 12, placeholder: "Cole ou escreva o texto do contrato desse aluno...", style: { width: "100%", padding: "12px 14px", borderRadius: 9, border: "1.5px solid #e2e8f0", background: "#f8fafc", fontSize: 13, color: "#0f172a", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", lineHeight: 1.5, marginBottom: 14 } })), React.createElement(Btn, { full: true, onClick: salvarAssign, disabled: assignModo === "modelo" ? !assignModeloId : !assignTexto.trim() }, "Salvar")));
};
const ProgramGenerator = ({ students, assessments, programs, setPrograms, nav }) => {
  return React.createElement("div", null);
  const [selSt, setSelSt] = useState("");
  const [selA, setSelA] = useState("");
  const [freq, setFreq] = useState("3");
  const [env, setEnv] = useState("gym");
  const [phase, setPhase] = useState("1");
  const [generated, setGenerated] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const st = students.find((s) => s.id === selSt);
  const stAssessments = assessments.filter((a) => a.studentId === selSt).sort((a, b) => b.date?.localeCompare(a.date));
  const assessment = assessments.find((a) => a.id === selA);
  const existingProgram = programs.find((p) => p.studentId === selSt && p.assessmentId === selA);
  const phases = [
    { v: "1", l: "Bloco 1 — Adaptação", sub: "Semanas 1–4", color: "#6366f1" },
    { v: "2", l: "Bloco 2 — Desenvolvimento", sub: "Semanas 5–12", color: "#FF5603" },
    { v: "3", l: "Bloco 3 — Consolidação", sub: "Semanas 13–20", color: "#16a34a" },
    { v: "4", l: "Bloco 4 — Otimização", sub: "Semanas 21–24", color: "#d97706" }
  ];
  const generate = () => {
    if (!assessment || !st) return;
    const prog = buildProgram(assessment, st, freq, env, phase);
    setGenerated(prog);
    setEditMode(false);
  };
  const save = () => {
    if (!generated) return;
    setPrograms((prev) => [...prev.filter((p) => !(p.studentId === selSt && p.assessmentId === selA)), generated]);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2e3);
  };
  const updateExercise = (dayIdx, sessionIdx, exIdx, field, value) => {
    setGenerated((prev) => {
      const d = JSON.parse(JSON.stringify(prev));
      d.days[dayIdx].sessions[sessionIdx].exercises[exIdx][field] = value;
      return d;
    });
  };
  const swapExercise = (dayIdx, sessionIdx, exIdx, direction) => {
    setGenerated((prev) => {
      const d = JSON.parse(JSON.stringify(prev));
      const ex = d.days[dayIdx].sessions[sessionIdx].exercises[exIdx];
      const newLevel = Math.max(0, Math.min(5, ex.progLevel + direction));
      ex.progLevel = newLevel;
      ex.currentExercise = newLevel === 0 ? ex.base : ex.progressions[newLevel - 1] || ex.base;
      return d;
    });
  };
  if (previewing && generated) {
    const prog = generated;
    return React.createElement("div", null, React.createElement("div", { className: "no-print", style: { display: "flex", gap: 10, marginBottom: 16 } }, React.createElement("button", { onClick: () => setPreviewing(false), style: { background: "#f1f5f9", border: "none", borderRadius: 9, padding: "9px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" } }, "← Voltar"), React.createElement("button", { onClick: () => window.print(), style: { background: "#FF5603", border: "none", borderRadius: 9, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "#fff" } }, "🖨️ Imprimir / PDF")), React.createElement(PrintStyle, null), React.createElement("div", { className: "print-page", style: { padding: 20 } }, React.createElement(ProfHeader, null), React.createElement("div", { style: { fontWeight: 800, fontSize: 18, color: "#0f172a", marginBottom: 2 } }, "Programa de Treinamento"), React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 4 } }, st?.name, " · ", calcAge(st?.dob), " anos · Gerado em ", fmt(prog.createdAt)), React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 } }, React.createElement(Badge, { color: "#6366f1", bg: "#eef2ff" }, "Nível ", prog.level, " — ", prog.levelLabel?.split("—")[1]?.trim()), React.createElement(Badge, { color: "#FF5603", bg: "#fff4ee" }, prog.arch), React.createElement(Badge, { color: "#16a34a", bg: "#dcfce7" }, prog.phaseLabel, " · Sem. ", prog.weekRange?.[0], "–", prog.weekRange?.[1]), React.createElement(Badge, { color: "#64748b", bg: "#f8fafc" }, prog.freq, "x/semana · ", { home: "Casa", gym: "Academia", hybrid: "Híbrido" }[prog.env])), prog.days.map((day, di) => React.createElement("div", { key: di, style: { marginBottom: 20 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 15, color: "#FF5603", borderBottom: "2px solid #FF560322", paddingBottom: 6, marginBottom: 12 } }, day.day), React.createElement("div", { style: { marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#6366f1", marginBottom: 6 } }, "🔥 AQUECIMENTO"), day.warmup?.map((ex, i) => ex && React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#eef2ff", borderRadius: 8, marginBottom: 4, fontSize: 12 } }, React.createElement("span", { style: { fontWeight: 700, color: "#6366f1", flex: 1 } }, ex.currentExercise), React.createElement("span", { style: { color: "#64748b" } }, ex.sets, "×", ex.reps), React.createElement(YTBtn, { name: ex.currentExercise })))), day.sessions.map((session, si) => session.exercises?.length > 0 && React.createElement("div", { key: si, style: { marginBottom: 10 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#0f172a", marginBottom: 6 } }, session.icon, " ", session.priority.toUpperCase()), session.exercises.map((ex, ei) => ex && React.createElement("div", { key: ei, style: { display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "#f8fafc", borderRadius: 8, marginBottom: 4, fontSize: 12, border: "1px solid #f1f5f9" } }, React.createElement("span", { style: { fontWeight: 700, color: "#0f172a", flex: 1 } }, ex.currentExercise), React.createElement("span", { style: { color: "#64748b", fontWeight: 600 } }, ex.sets, " séries × ", ex.reps), ex.rest > 0 && React.createElement("span", { style: { color: "#94a3b8" } }, "· ", ex.rest, "s"), ex.obs && React.createElement("span", { style: { color: "#FF5603", fontSize: 11 } }, "— ", ex.obs), React.createElement(YTBtn, { name: ex.currentExercise }))))), React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 12, color: "#16a34a", marginBottom: 6 } }, "🧘 DESAQUECIMENTO"), day.cooldown?.map((ex, i) => ex && React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#dcfce7", borderRadius: 8, fontSize: 12 } }, React.createElement("span", { style: { fontWeight: 700, color: "#16a34a", flex: 1 } }, ex.currentExercise), React.createElement("span", { style: { color: "#64748b" } }, ex.reps)))))), React.createElement(ProfFooter, { extra: `Programa gerado em ${fmt(prog.createdAt)} · ${prog.phaseLabel} · Semanas ${prog.weekRange?.[0]}–${prog.weekRange?.[1]}` })));
  }
  return React.createElement("div", null, React.createElement("div", { style: { fontWeight: 800, fontSize: 20, marginBottom: 18 } }, "⚡ Gerador de Programa"), React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 12 } }, "1. Selecionar Aluno e Avaliação"), React.createElement(Inp, { label: "Aluno", value: selSt, onChange: (v) => {
    setSelSt(v);
    setSelA("");
    setGenerated(null);
  }, opts: [{ v: "", l: "Selecione..." }, ...students.map((s) => ({ v: s.id, l: `${s.name} (${calcAge(s.dob)} anos)` }))] }), st && stAssessments.length > 0 && React.createElement(Inp, { label: "Avaliação base", value: selA, onChange: (v) => {
    setSelA(v);
    setGenerated(null);
  }, opts: [{ v: "", l: "Selecione..." }, ...stAssessments.map((a) => {
    const gc = classifyGlobal(a.globalScore || 0);
    return { v: a.id, l: `${fmt(a.date)} — ${gc.label} (${a.globalScore} pts)` };
  })] }), st && stAssessments.length === 0 && React.createElement("div", { style: { fontSize: 13, color: "#94a3b8", marginTop: 8 } }, "Nenhuma avaliação registrada. ", React.createElement("button", { onClick: () => nav("newAssessment", { studentId: selSt }), style: { background: "none", border: "none", color: "#FF5603", fontWeight: 700, cursor: "pointer" } }, "Fazer avaliação →"))), selA && assessment && React.createElement(React.Fragment, null, React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 12 } }, "2. Parâmetros do Programa"), (() => {
    const lv = getFunctionalLevel(assessment, st);
    return React.createElement("div", { style: { background: lv.bg, border: `1.5px solid ${lv.color}33`, borderRadius: 10, padding: "10px 14px", marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, color: lv.color } }, lv.archIcon, " ", lv.label), React.createElement("div", { style: { fontSize: 12, color: "#475569", marginTop: 2 } }, "Arquitetura sugerida: ", lv.arch));
  })(), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 } }, React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 } }, "Frequência semanal"), React.createElement("div", { style: { display: "flex", gap: 5 } }, ["1", "2", "3", "4", "5"].map((f) => React.createElement("button", { key: f, onClick: () => setFreq(f), style: { flex: 1, padding: "8px 0", borderRadius: 8, border: "1.5px solid", borderColor: freq === f ? "#FF5603" : "#e2e8f0", background: freq === f ? "#FF5603" : "#f8fafc", color: freq === f ? "#fff" : "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer" } }, f, "x")))), React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 } }, "Ambiente"), React.createElement("div", { style: { display: "flex", gap: 5 } }, [{ v: "home", l: "🏠" }, { v: "gym", l: "🏋️" }, { v: "hybrid", l: "🔄" }].map((e) => React.createElement("button", { key: e.v, onClick: () => setEnv(e.v), style: { flex: 1, padding: "8px 4px", borderRadius: 8, border: "1.5px solid", borderColor: env === e.v ? "#FF5603" : "#e2e8f0", background: env === e.v ? "#fff4ee" : "#f8fafc", fontSize: 18, cursor: "pointer" } }, e.l))))), React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 8 } }, "Fase do Programa"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 } }, phases.map((ph) => React.createElement("button", { key: ph.v, onClick: () => setPhase(ph.v), style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${phase === ph.v ? ph.color : "#e2e8f0"}`, background: phase === ph.v ? ph.color + "18" : "#f8fafc", cursor: "pointer" } }, React.createElement("div", { style: { textAlign: "left" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: phase === ph.v ? ph.color : "#0f172a" } }, ph.l), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, ph.sub)), phase === ph.v && React.createElement("span", { style: { color: ph.color, fontSize: 16 } }, "✓")))), React.createElement(Btn, { full: true, onClick: generate }, "⚡ Gerar Programa Automaticamente"))), generated && React.createElement(React.Fragment, null, React.createElement(Card, { style: { marginBottom: 14, border: "1.5px solid #FF560333" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, "3. Programa Gerado"), React.createElement("div", { style: { display: "flex", gap: 8 } }, React.createElement(Btn, { sm: true, variant: editMode ? "primary" : "outline", onClick: () => setEditMode((e) => !e) }, editMode ? "✓ Edição ON" : "✏️ Editar"), React.createElement(Btn, { sm: true, variant: "secondary", onClick: () => setPreviewing(true) }, "🖨️ Imprimir"))), React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 } }, React.createElement(Badge, { color: "#6366f1", bg: "#eef2ff" }, "Nível ", generated.level), React.createElement(Badge, { color: "#FF5603", bg: "#fff4ee" }, generated.arch), React.createElement(Badge, { color: "#16a34a", bg: "#dcfce7" }, generated.phaseLabel), React.createElement(Badge, { color: "#64748b", bg: "#f8fafc" }, generated.freq, "x · ", { home: "Casa", gym: "Academia", hybrid: "Híbrido" }[generated.env])), generated.days.map((day, di) => React.createElement("div", { key: di, style: { marginBottom: 16, border: "1px solid #f1f5f9", borderRadius: 12, overflow: "hidden" } }, React.createElement("div", { style: { background: "#FF560312", padding: "10px 14px", fontWeight: 800, fontSize: 14, color: "#FF5603" } }, day.day), React.createElement("div", { style: { padding: "12px 14px" } }, React.createElement("div", { style: { marginBottom: 10 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#6366f1", marginBottom: 6, textTransform: "uppercase" } }, "🔥 Aquecimento"), day.warmup?.filter(Boolean).map((ex, i) => React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: "#eef2ff", borderRadius: 8, marginBottom: 4 } }, React.createElement("span", { style: { fontWeight: 600, fontSize: 12, flex: 1, color: "#334155" } }, ex.currentExercise), React.createElement("span", { style: { fontSize: 11, color: "#6366f1", fontWeight: 700 } }, ex.sets, "×", ex.reps), React.createElement(YTBtn, { name: ex.currentExercise })))), day.sessions.map((session, si) => session.exercises?.filter(Boolean).length > 0 && React.createElement("div", { key: si, style: { marginBottom: 10 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#0f172a", marginBottom: 6, textTransform: "uppercase" } }, session.icon, " ", session.priority), session.exercises.filter(Boolean).map((ex, ei) => React.createElement("div", { key: ei, style: { background: "#f8fafc", borderRadius: 10, padding: "10px 12px", marginBottom: 6, border: "1px solid #f1f5f9" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: editMode ? 8 : 0 } }, React.createElement("div", { style: { flex: 1 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#0f172a" } }, ex.currentExercise), React.createElement(YTBtn, { name: ex.currentExercise })), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, ex.family, " · Nível ", ex.progLevel === 0 ? "Base" : ex.progLevel)), React.createElement("div", { style: { textAlign: "right" } }, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#FF5603" } }, ex.sets, " séries"), React.createElement("div", { style: { fontSize: 11, color: "#64748b" } }, ex.reps, ex.rest > 0 ? ` · ${ex.rest}s` : "")), editMode && React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4 } }, React.createElement("button", { onClick: () => swapExercise(di, si, ei, 1), disabled: ex.progLevel >= 5, style: { width: 28, height: 28, borderRadius: 6, border: "1.5px solid #e2e8f0", background: ex.progLevel >= 5 ? "#f8fafc" : "#fff", cursor: ex.progLevel >= 5 ? "default" : "pointer", fontSize: 12, fontWeight: 700, color: ex.progLevel >= 5 ? "#e2e8f0" : "#16a34a" } }, "▲"), React.createElement("button", { onClick: () => swapExercise(di, si, ei, -1), disabled: ex.progLevel <= 0, style: { width: 28, height: 28, borderRadius: 6, border: "1.5px solid #e2e8f0", background: ex.progLevel <= 0 ? "#f8fafc" : "#fff", cursor: ex.progLevel <= 0 ? "default" : "pointer", fontSize: 12, fontWeight: 700, color: ex.progLevel <= 0 ? "#e2e8f0" : "#dc2626" } }, "▼"))), editMode && React.createElement(React.Fragment, null, React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 } }, React.createElement(Inp, { label: "Séries", type: "number", value: String(ex.sets), onChange: (v) => updateExercise(di, si, ei, "sets", parseInt(v) || ex.sets) }), React.createElement(Inp, { label: "Reps", value: ex.reps, onChange: (v) => updateExercise(di, si, ei, "reps", v) }), React.createElement(Inp, { label: "Descanso (s)", type: "number", value: String(ex.rest), onChange: (v) => updateExercise(di, si, ei, "rest", parseInt(v) || 0) })), React.createElement(Inp, { label: "Observação", value: ex.obs || "", onChange: (v) => updateExercise(di, si, ei, "obs", v), placeholder: "adaptação, restrição, foco..." })), !editMode && ex.obs && React.createElement("div", { style: { fontSize: 11, color: "#FF5603", marginTop: 4 } }, "📌 ", ex.obs))))), React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#16a34a", marginBottom: 6, textTransform: "uppercase" } }, "🧘 Desaquecimento"), day.cooldown?.filter(Boolean).map((ex, i) => React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", padding: "7px 10px", background: "#dcfce7", borderRadius: 8, fontSize: 12 } }, React.createElement("span", { style: { fontWeight: 600, flex: 1, color: "#334155" } }, ex.currentExercise), React.createElement("span", { style: { fontSize: 11, color: "#16a34a", fontWeight: 700 } }, ex.reps))))))), React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 4 } }, React.createElement(Btn, { full: true, variant: "secondary", onClick: save }, savedMsg ? "✓ Salvo!" : "💾 Salvar Programa"), React.createElement(Btn, { full: true, onClick: () => setPreviewing(true) }, "🖨️ Imprimir / PDF")))), !selSt && React.createElement(Card, { style: { textAlign: "center", padding: 40 } }, React.createElement("div", { style: { fontSize: 40, marginBottom: 10 } }, "⚡"), React.createElement("div", { style: { fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 8 } }, "Gerador de Programa"), React.createElement("div", { style: { fontSize: 13, color: "#94a3b8" } }, "Selecione um aluno e uma avaliação para gerar o programa de treinamento automaticamente, baseado no Perfil Funcional, prioridades e arquitetura Longevus.")));
};
const suggestProgression = (exercise, history) => {
  if (!history || history.length < 2) return null;
  const recent = history.slice(-3);
  const avgPSE = recent.reduce((s, h) => s + (h.pse || 5), 0) / recent.length;
  const allCompleted = recent.every((h) => h.completed);
  const ex = recent[recent.length - 1];
  if (!ex) return null;
  if (allCompleted && avgPSE <= 5) {
    const repsNum = parseInt(ex.reps);
    if (!isNaN(repsNum) && repsNum < 15) return { type: "reps", from: ex.reps, to: String(repsNum + 2), reason: "PSE baixo e execução consistente. Aumentar repetições." };
    const setsNum = parseInt(ex.sets);
    if (!isNaN(setsNum) && setsNum < 4) return { type: "sets", from: String(ex.sets), to: String(setsNum + 1), reason: "Boa tolerância. Adicionar mais uma série." };
    if (ex.load) {
      const l = parseFloat(ex.load);
      return { type: "load", from: String(ex.load), to: (l * 1.05).toFixed(1), reason: "Execução consistente. Progressão de 5% na carga." };
    }
  }
  if (!allCompleted || avgPSE >= 8) return { type: "regress", from: "", to: "", reason: "PSE elevado ou sessões incompletas. Manter ou regredir exercício." };
  return null;
};
const SessionTracker = ({ students, programs, sessions, setSessions, nav }) => {
  return React.createElement("div", null);
  const [selSt, setSelSt] = useState("");
  const [selProg, setSelProg] = useState("");
  const [selDay, setSelDay] = useState("");
  const [view, setView] = useState("new");
  const [form, setForm] = useState({
    date: (new Date()).toISOString().split("T")[0],
    present: true,
    absenceReason: "",
    pse: 5,
    notes: "",
    exercises: []
  });
  const [saved, setSaved] = useState(false);
  const st = students.find((s) => s.id === selSt);
  const stProgs = programs.filter((p) => p.studentId === selSt);
  const prog = programs.find((p) => p.id === selProg);
  const day = prog?.days?.find((d) => d.day === selDay);
  const stSessions = sessions.filter((s) => s.studentId === selSt).sort((a, b) => b.date?.localeCompare(a.date));
  const initExercises = (d) => {
    const allEx = [];
    d?.warmup?.filter(Boolean).forEach((ex) => allEx.push({ id: uid(), name: ex.currentExercise, domain: "Aquecimento", sets: ex.sets, reps: ex.reps, load: "", pse: 5, completed: true, obs: "" }));
    d?.sessions?.forEach((s) => s.exercises?.filter(Boolean).forEach((ex) => allEx.push({ id: uid(), name: ex.currentExercise, domain: s.priority, sets: ex.sets, reps: ex.reps, load: "", pse: 5, completed: true, obs: "" })));
    d?.cooldown?.filter(Boolean).forEach((ex) => allEx.push({ id: uid(), name: ex.currentExercise, domain: "Desaquecimento", sets: 1, reps: ex.reps, load: "", pse: 3, completed: true, obs: "" }));
    return allEx;
  };
  const handleDaySelect = (dayName) => {
    setSelDay(dayName);
    const d = prog?.days?.find((d2) => d2.day === dayName);
    setForm((f) => ({ ...f, exercises: initExercises(d) }));
  };
  const updateEx = (idx, field, val) => {
    setForm((f) => {
      const exs = [...f.exercises];
      exs[idx] = { ...exs[idx], [field]: val };
      return { ...f, exercises: exs };
    });
  };
  const getExHistory = (exName) => {
    return stSessions.filter((s) => s.exercises?.some((e) => e.name === exName)).map((s) => s.exercises.find((e) => e.name === exName)).filter(Boolean).slice(-5);
  };
  const save = () => {
    const session = { id: uid(), studentId: selSt, programId: selProg, day: selDay, ...form, createdAt: todayStr() };
    setSessions((prev) => [...prev, session]);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setForm({ date: (new Date()).toISOString().split("T")[0], present: true, absenceReason: "", pse: 5, notes: "", exercises: form.exercises.map((e) => ({ ...e, load: "", obs: "", completed: true })) });
    }, 1500);
  };
  const attendance = stSessions.length > 0 ? Math.round(stSessions.filter((s) => s.present).length / stSessions.length * 100) : 0;
  return React.createElement("div", null, React.createElement("div", { style: { fontWeight: 800, fontSize: 20, marginBottom: 18 } }, "📋 Acompanhamento de Sessão"), React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 16 } }, [{ v: "new", l: "➕ Nova Sessão" }, { v: "history", l: "📊 Histórico" }].map((t) => React.createElement("button", { key: t.v, onClick: () => setView(t.v), style: { flex: 1, padding: "10px 0", borderRadius: 10, border: "1.5px solid", borderColor: view === t.v ? "#FF5603" : "#e2e8f0", background: view === t.v ? "#FF5603" : "#f8fafc", color: view === t.v ? "#fff" : "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer" } }, t.l))), view === "new" && React.createElement(React.Fragment, null, React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 12 } }, "1. Selecionar Aluno e Programa"), React.createElement(Inp, { label: "Aluno", value: selSt, onChange: (v) => {
    setSelSt(v);
    setSelProg("");
    setSelDay("");
    setForm((f) => ({ ...f, exercises: [] }));
  }, opts: [{ v: "", l: "Selecione..." }, ...students.map((s) => ({ v: s.id, l: s.name + " (" + calcAge(s.dob) + " anos)" }))] }), selSt && stProgs.length === 0 && React.createElement("div", { style: { fontSize: 13, color: "#94a3b8", marginTop: 8 } }, "Nenhum programa gerado. ", React.createElement("button", { onClick: () => nav("program", { studentId: selSt }), style: { background: "none", border: "none", color: "#FF5603", fontWeight: 700, cursor: "pointer" } }, "Gerar programa →")), selSt && stProgs.length > 0 && React.createElement(Inp, { label: "Programa", value: selProg, onChange: (v) => {
    setSelProg(v);
    setSelDay("");
    setForm((f) => ({ ...f, exercises: [] }));
  }, opts: [{ v: "", l: "Selecione..." }, ...stProgs.map((p) => ({ v: p.id, l: p.arch + " · " + p.phaseLabel + " · " + p.freq + "x/sem" }))] }), selProg && prog && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 8, marginTop: 4 } }, "Selecionar dia da semana"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6 } }, prog.days.map((d) => React.createElement("button", { key: d.day, onClick: () => handleDaySelect(d.day), style: { padding: "11px 14px", borderRadius: 10, border: "1.5px solid", borderColor: selDay === d.day ? "#FF5603" : "#e2e8f0", background: selDay === d.day ? "#fff4ee" : "#f8fafc", cursor: "pointer", textAlign: "left", fontWeight: selDay === d.day ? 700 : 500, color: selDay === d.day ? "#FF5603" : "#0f172a", fontSize: 13 } }, d.day))))), selDay && React.createElement(React.Fragment, null, React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 12 } }, "2. Dados da Sessão"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 } }, React.createElement(Inp, { label: "Data", type: "date", value: form.date, onChange: (v) => setForm((f) => ({ ...f, date: v })) }), React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 } }, "Presença"), React.createElement("div", { style: { display: "flex", gap: 8 } }, [{ v: true, l: "✅ Presente" }, { v: false, l: "❌ Falta" }].map((o) => React.createElement("button", { key: String(o.v), onClick: () => setForm((f) => ({ ...f, present: o.v })), style: { flex: 1, padding: "9px 0", borderRadius: 9, border: "1.5px solid", borderColor: form.present === o.v ? "#FF5603" : "#e2e8f0", background: form.present === o.v ? "#fff4ee" : "#f8fafc", color: form.present === o.v ? "#FF5603" : "#64748b", fontWeight: 700, fontSize: 12, cursor: "pointer" } }, o.l))))), !form.present && React.createElement(Inp, { label: "Motivo da falta", value: form.absenceReason, onChange: (v) => setForm((f) => ({ ...f, absenceReason: v })), placeholder: "Doença, viagem, compromisso..." }), form.present && React.createElement(React.Fragment, null, React.createElement("div", { style: { marginBottom: 12 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 } }, "PSE Geral da Sessão (0–10)"), React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, React.createElement("input", { type: "range", min: "0", max: "10", value: form.pse, onChange: (e) => setForm((f) => ({ ...f, pse: parseInt(e.target.value) })), style: { flex: 1, accentColor: "#FF5603" } }), React.createElement("span", { style: { fontWeight: 900, fontSize: 18, color: "#FF5603", minWidth: 24 } }, form.pse), React.createElement("span", { style: { fontSize: 12, color: "#64748b" } }, form.pse <= 2 ? "Muito leve" : form.pse <= 4 ? "Leve" : form.pse <= 6 ? "Moderado" : form.pse <= 8 ? "Intenso" : "Muito intenso"))), React.createElement(Inp, { label: "Observações gerais da sessão", value: form.notes, onChange: (v) => setForm((f) => ({ ...f, notes: v })), placeholder: "Comportamento, dor relatada, humor, energia..." }))), form.present && form.exercises.length > 0 && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 12 } }, "3. Exercícios Realizados"), form.exercises.map((ex, ei) => {
    const hist = getExHistory(ex.name);
    const sugg = suggestProgression(ex, hist);
    return React.createElement("div", { key: ex.id, style: { marginBottom: 12, border: "1.5px solid #f1f5f9", borderRadius: 12, overflow: "hidden" } }, React.createElement("div", { style: { background: ex.completed ? "#f0fdf4" : "#fff5f5", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" } }, React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#0f172a" } }, ex.name), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, ex.domain)), React.createElement("button", { onClick: () => updateEx(ei, "completed", !ex.completed), style: { padding: "5px 12px", borderRadius: 8, border: "none", background: ex.completed ? "#16a34a" : "#dc2626", color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer" } }, ex.completed ? "✓ Feito" : "✗ Não")), ex.completed && React.createElement("div", { style: { padding: "10px 14px" } }, React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 } }, React.createElement(Inp, { label: "Séries", type: "number", value: String(ex.sets), onChange: (v) => updateEx(ei, "sets", parseInt(v) || ex.sets) }), React.createElement(Inp, { label: "Reps", value: ex.reps, onChange: (v) => updateEx(ei, "reps", v) }), React.createElement(Inp, { label: "Carga (kg)", type: "number", value: ex.load || "", onChange: (v) => updateEx(ei, "load", v), placeholder: "—" })), React.createElement("div", { style: { marginBottom: 8 } }, React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4 } }, "PSE do exercício"), React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, React.createElement("input", { type: "range", min: "0", max: "10", value: ex.pse, onChange: (e) => updateEx(ei, "pse", parseInt(e.target.value)), style: { flex: 1, accentColor: "#FF5603" } }), React.createElement("span", { style: { fontWeight: 800, fontSize: 16, color: "#FF5603", minWidth: 20 } }, ex.pse))), sugg && React.createElement("div", { style: { background: sugg.type === "regress" ? "#fff4ee" : "#ecfccb", border: "1px solid", borderColor: sugg.type === "regress" ? "#FF560344" : "#86efac", borderRadius: 9, padding: "8px 12px", marginBottom: 8, fontSize: 12 } }, React.createElement("span", { style: { fontWeight: 700, color: sugg.type === "regress" ? "#FF5603" : "#16a34a" } }, "💡 Sugestão: "), React.createElement("span", { style: { color: "#475569" } }, sugg.reason), sugg.type !== "regress" && sugg.from && React.createElement("span", { style: { color: "#64748b" } }, " (", sugg.from, " → ", sugg.to, ")")), React.createElement(Inp, { label: "Obs do exercício", value: ex.obs || "", onChange: (v) => updateEx(ei, "obs", v), placeholder: "Adaptação usada, queixa, foco..." })));
  })), React.createElement(Btn, { full: true, onClick: save, disabled: saved }, saved ? "✅ Salvo!" : "💾 Salvar Sessão"))), view === "history" && React.createElement(React.Fragment, null, React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement(Inp, { label: "Aluno", value: selSt, onChange: setSelSt, opts: [{ v: "", l: "Selecione..." }, ...students.map((s) => ({ v: s.id, l: s.name }))] })), selSt && React.createElement(React.Fragment, null, React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 12 } }, "📊 Resumo de Adesão"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 } }, [
    { label: "Total", value: stSessions.length, color: "#6366f1" },
    { label: "Presença", value: stSessions.filter((s) => s.present).length, color: "#16a34a" },
    { label: "Adesão", value: attendance + "%", color: attendance >= 80 ? "#16a34a" : attendance >= 60 ? "#d97706" : "#dc2626" }
  ].map((item) => React.createElement("div", { key: item.label, style: { background: "#f8fafc", borderRadius: 10, padding: "12px 0", textAlign: "center" } }, React.createElement("div", { style: { fontWeight: 900, fontSize: 22, color: item.color } }, item.value), React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 2 } }, item.label)))), React.createElement("div", { style: { marginTop: 12, background: "#f1f5f9", borderRadius: 99, height: 8, overflow: "hidden" } }, React.createElement("div", { style: { height: "100%", borderRadius: 99, background: attendance >= 80 ? "#16a34a" : attendance >= 60 ? "#d97706" : "#dc2626", width: attendance + "%", transition: "width 0.5s" } }))), stSessions.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 32, color: "#94a3b8" } }, "Nenhuma sessão registrada ainda.") : stSessions.map((s) => {
    const exDone = s.exercises?.filter((e) => e.completed).length || 0;
    const exTotal = s.exercises?.length || 0;
    return React.createElement(Card, { key: s.id, style: { marginBottom: 10, border: "1.5px solid " + (s.present ? "#f1f5f9" : "#fca5a5") } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: s.present ? 8 : 0 } }, React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: "#0f172a" } }, fmt(s.date), " · ", s.day), React.createElement("div", { style: { fontSize: 12, color: "#64748b" } }, s.present ? "✅ Presente" : "❌ Falta", s.absenceReason ? " — " + s.absenceReason : "")), s.present && React.createElement("div", { style: { textAlign: "right" } }, React.createElement("div", { style: { fontWeight: 900, fontSize: 18, color: "#FF5603" } }, "PSE ", s.pse), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, exDone, "/", exTotal, " ex."))), s.present && s.exercises?.length > 0 && React.createElement("details", null, React.createElement("summary", { style: { fontSize: 12, color: "#6366f1", fontWeight: 700, cursor: "pointer" } }, "Ver exercícios"), React.createElement("div", { style: { marginTop: 8, display: "flex", flexDirection: "column", gap: 6 } }, s.exercises.map((ex) => React.createElement("div", { key: ex.id, style: { display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: ex.completed ? "#f8fafc" : "#fff5f5", borderRadius: 8, fontSize: 12 } }, React.createElement("span", { style: { fontSize: 14 } }, ex.completed ? "✓" : "✗"), React.createElement("span", { style: { flex: 1, fontWeight: 600, color: "#0f172a" } }, ex.name), ex.completed && React.createElement("span", { style: { color: "#64748b" } }, ex.sets, "×", ex.reps, ex.load ? " · " + ex.load + "kg" : ""), ex.completed && React.createElement("span", { style: { color: "#FF5603", fontWeight: 700 } }, "PSE ", ex.pse)))), s.notes && React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 8, padding: "7px 10px", background: "#f8fafc", borderRadius: 8 } }, "📝 ", s.notes)));
  }))));
};
const ReportMonitoring = ({ student: st, logs, period }) => {
  if (!st || !logs || logs.length === 0) return null;
  const periodLabels = { 1: "Mensal", 2: "Bimestral", 3: "Trimestral", 6: "Semestral", 12: "Anual" };
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth() - period + 1, 1);
  const filtered = logs.filter((l) => l.studentId === st.id && new Date(l.date) >= cutoff).sort((a, b) => a.date?.localeCompare(b.date));
  const present = filtered.filter((l) => l.pre?.sbp || l.pre?.fc || l.post?.sbp || l.pre?.pas || l.pre?.glycemia);
  const total = filtered.length;
  const attendance = total > 0 ? Math.round(present.length / total * 100) : 0;
  const avg = (arr, fn) => {
    const v = arr.map(fn).filter((x) => x && !isNaN(parseFloat(x)));
    return v.length ? (v.reduce((a, b) => a + parseFloat(b), 0) / v.length).toFixed(1) : "—";
  };
  const avgPreSbp = avg(present, (l) => l.pre?.sbp || l.pre?.pas);
  const avgPrePad = avg(present, (l) => l.pre?.pad);
  const avgPreFc = avg(present, (l) => l.pre?.fc);
  const avgPostSbp = avg(present, (l) => l.post?.sbp || l.post?.pas);
  const avgPostPad = avg(present, (l) => l.post?.pad);
  const avgPostFc = avg(present, (l) => l.post?.fc);
  const avgSpo2 = avg(present, (l) => l.pre?.spo2);
  const avgGly = avg(present, (l) => l.pre?.glycemia);
  const hasPSE = filtered.some((l) => l.pre?.pse !== "" && l.pre?.pse !== void 0 || l.during?.pse !== "" && l.during?.pse !== void 0 || l.post?.pse !== "" && l.post?.pse !== void 0);
  const avgPsePre = avg(filtered, (l) => l.pre?.pse);
  const avgPseDuring = avg(filtered, (l) => l.during?.pse);
  const avgPsePost = avg(filtered, (l) => l.post?.pse);
  const avgDisp = avg(filtered, (l) => l.disposition);
  const avgHyd = avg(filtered, (l) => l.hydration);
  const avgDispNum = parseFloat(avgDisp);
  const avgHydNum = parseFloat(avgHyd);
  const dispLabels = ["", "Exausto", "Cansado", "Neutro", "Disposto", "Animado"];
  const dispEmoji = ["", "😣", "😴", "😐", "🙂", "😁"];
  const alertCount = present.filter((l) => {
    const s = parseFloat(l.pre?.sbp || l.pre?.pas);
    const d = parseFloat(l.pre?.pad);
    const fc = parseFloat(l.pre?.fc);
    const spo2 = parseFloat(l.pre?.spo2);
    const gly = parseFloat(l.pre?.glycemia);
    return s >= 160 || d >= 100 || fc > 110 || spo2 > 0 && spo2 < 94 || gly > 0 && (gly < 70 || gly >= 200);
  }).length;
  const pseDuringNum = parseFloat(avgPseDuring);
  const pseDuringCl = !isNaN(pseDuringNum) ? classifyPSE(Math.round(pseDuringNum)) : null;
  return React.createElement("div", { className: "print-page", style: { padding: 20, maxWidth: 800, margin: "0 auto" } }, React.createElement(ProfHeader, null), React.createElement("div", { style: { marginBottom: 16 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 18, color: "#0f172a" } }, "Relatório de Monitoramento"), React.createElement("div", { style: { fontSize: 13, color: "#64748b" } }, st.name, " · ", calcAge(st.dob), " anos · ", st.sex === "M" ? "Masculino" : "Feminino", " · ", periodLabels[period], " · Gerado em ", (new Date()).toLocaleDateString("pt-BR")), React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 2 } }, "Período: ", cutoff.toLocaleDateString("pt-BR"), " a ", now.toLocaleDateString("pt-BR"))), total === 0 ? React.createElement("div", { style: { textAlign: "center", color: "#94a3b8", padding: 40 } }, "Nenhum registro no período selecionado.") : React.createElement(React.Fragment, null, React.createElement("div", { className: "report-section", style: { marginBottom: 18 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 } }, "Resumo do Período"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 } }, [
    { label: "Registros", value: total, color: "#6366f1", bg: "#eef2ff" },
    { label: "Adesão", value: attendance + "%", color: attendance >= 80 ? "#16a34a" : attendance >= 60 ? "#d97706" : "#dc2626", bg: attendance >= 80 ? "#dcfce7" : attendance >= 60 ? "#fef9c3" : "#fee2e2" },
    { label: "Alertas", value: alertCount, color: alertCount > 0 ? "#dc2626" : "#16a34a", bg: alertCount > 0 ? "#fee2e2" : "#dcfce7" },
    { label: "PSE Médio", value: !isNaN(pseDuringNum) ? pseDuringNum.toFixed(1) : "—", color: pseDuringCl?.color || "#FF5603", bg: pseDuringCl?.bg || "#fff4ee" }
  ].map((item) => React.createElement("div", { key: item.label, style: { background: item.bg, border: "1px solid " + item.color + "33", borderRadius: 10, padding: "10px 8px", textAlign: "center" } }, React.createElement("div", { style: { fontSize: 22, fontWeight: 900, color: item.color } }, item.value), React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 2 } }, item.label))))), React.createElement("div", { className: "report-section", style: { marginBottom: 18 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 } }, "Sinais Vitais — Médias do Período"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 10 } }, [
    { label: "PA Pré (mmHg)", value: avgPreSbp + "/" + avgPrePad, color: "#6366f1" },
    { label: "FC Pré (bpm)", value: avgPreFc, color: "#FF5603" },
    { label: "SpO₂ (%)", value: avgSpo2, color: "#0891b2" },
    { label: "PA Pós (mmHg)", value: avgPostSbp + "/" + avgPostPad, color: "#6366f1" },
    { label: "FC Pós (bpm)", value: avgPostFc, color: "#FF5603" },
    { label: "Glicemia (mg/dL)", value: avgGly, color: "#d97706" }
  ].map((item) => React.createElement("div", { key: item.label, style: { background: "#f8fafc", border: "1px solid " + item.color + "22", borderRadius: 9, padding: "9px 10px" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" } }, item.label), React.createElement("div", { style: { fontSize: 18, fontWeight: 900, color: item.color, marginTop: 2 } }, item.value)))), alertCount > 0 && React.createElement("div", { style: { background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 9, padding: "9px 12px", fontSize: 12, color: "#dc2626", fontWeight: 600 } }, "⚠️ ", alertCount, " sessão(ões) com alertas de sinais vitais fora das Zonas Longevus no período.")), hasPSE && React.createElement("div", { className: "report-section", style: { marginBottom: 18 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 } }, "Percepção Subjetiva de Esforço (PSE 0–10)"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: pseDuringCl ? 10 : 0 } }, [
    { label: "PSE Pré", value: avgPsePre, cl: !isNaN(parseFloat(avgPsePre)) ? classifyPSE(Math.round(parseFloat(avgPsePre))) : null },
    { label: "PSE Durante", value: avgPseDuring, cl: pseDuringCl },
    { label: "PSE Pós", value: avgPsePost, cl: !isNaN(parseFloat(avgPsePost)) ? classifyPSE(Math.round(parseFloat(avgPsePost))) : null }
  ].map((item) => React.createElement("div", { key: item.label, style: { background: item.cl?.bg || "#f8fafc", border: "1px solid " + (item.cl?.color || "#e2e8f0") + "44", borderRadius: 9, padding: "9px 10px", textAlign: "center" } }, React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" } }, item.label), React.createElement("div", { style: { fontSize: 22, fontWeight: 900, color: item.cl?.color || "#64748b", marginTop: 2 } }, item.value), item.cl && React.createElement("div", { style: { fontSize: 10, color: item.cl.color, fontWeight: 700, marginTop: 2 } }, item.cl.label)))), pseDuringCl && React.createElement("div", { style: { background: pseDuringCl.bg, border: "1px solid " + pseDuringCl.color + "44", borderRadius: 9, padding: "9px 12px", fontSize: 12, color: pseDuringCl.color, fontWeight: 600 } }, "PSE médio durante o exercício: ", avgPseDuring, "/10 — ", pseDuringCl.label, ". ", pseDuringCl.rec)), (filtered.some((l) => l.disposition) || filtered.some((l) => l.hydration)) && React.createElement("div", { className: "report-section", style: { marginBottom: 18 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 } }, "Bem-estar e Hidratação"), React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, filtered.some((l) => l.disposition) && React.createElement("div", { style: { background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 10, padding: "12px 14px" } }, React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 } }, "Disposição Média Pré-Treino"), React.createElement("div", { style: { fontSize: 28 } }, !isNaN(avgDispNum) ? dispEmoji[Math.round(avgDispNum)] : "—"), React.createElement("div", { style: { fontWeight: 700, color: "#6366f1", fontSize: 13 } }, !isNaN(avgDispNum) ? dispLabels[Math.round(avgDispNum)] : "—"), React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 2 } }, "Média: ", avgDisp, "/5 · ", filtered.filter((l) => l.disposition <= 2).length, " sessão(ões) com disposição baixa")), filtered.some((l) => l.hydration) && React.createElement("div", { style: { background: "#ecfeff", border: "1px solid #a5f3fc", borderRadius: 10, padding: "12px 14px" } }, React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 } }, "Hidratação Média"), React.createElement("div", { style: { fontSize: 22 } }, "💧".repeat(Math.max(1, Math.round(avgHydNum) || 1))), React.createElement("div", { style: { fontWeight: 700, color: "#0891b2", fontSize: 13 } }, !isNaN(avgHydNum) ? ["", "Muito baixa", "Baixa", "Regular", "Boa", "Ótima"][Math.round(avgHydNum)] : "—"), React.createElement("div", { style: { fontSize: 11, color: "#64748b", marginTop: 2 } }, "Média: ", avgHyd, "/5 · ", filtered.filter((l) => l.hydration <= 2).length, " sessão(ões) com hidratação baixa")))), React.createElement("div", { className: "report-section", style: { marginBottom: 18 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 } }, "Histórico de Sessões"), React.createElement("div", { style: { overflowX: "auto" } }, React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 11 } }, React.createElement("thead", null, React.createElement("tr", { style: { background: "#f8fafc" } }, ["Data", "PA Pré", "FC Pré", "SpO₂", "Glicemia", "PSE Pré", "PSE Dur.", "PSE Pós", "PA Pós", "FC Pós", "Disp.", "Hidrat.", "Obs"].map((h) => React.createElement("th", { key: h, style: { padding: "7px 8px", textAlign: "left", fontWeight: 700, color: "#475569", borderBottom: "1.5px solid #e2e8f0", whiteSpace: "nowrap" } }, h)))), React.createElement("tbody", null, filtered.slice().reverse().map((l, i) => {
    const sbp = parseFloat(l.pre?.sbp || l.pre?.pas);
    const gly = parseFloat(l.pre?.glycemia);
    const fc = parseFloat(l.pre?.fc);
    const spo2 = parseFloat(l.pre?.spo2);
    const alert2 = sbp >= 160 || parseFloat(l.pre?.pad) >= 100 || fc > 110 || spo2 > 0 && spo2 < 94 || gly > 0 && (gly < 70 || gly >= 200);
    const pseDurCl = l.during?.pse !== "" && l.during?.pse !== void 0 ? classifyPSE(l.during.pse) : null;
    return React.createElement("tr", { key: l.id || i, style: { borderBottom: "1px solid #f1f5f9", background: alert2 ? "#fff5f5" : i % 2 === 0 ? "#fff" : "#fafafa" } }, React.createElement("td", { style: { padding: "7px 8px", fontWeight: 600, whiteSpace: "nowrap" } }, fmt(l.date)), React.createElement("td", { style: { padding: "7px 8px", color: sbp >= 160 ? "#dc2626" : sbp >= 140 ? "#d97706" : "inherit", fontWeight: sbp >= 140 ? 700 : 400 } }, (l.pre?.sbp || l.pre?.pas) && l.pre?.pad ? (l.pre.sbp || l.pre.pas) + "/" + l.pre.pad : "—"), React.createElement("td", { style: { padding: "7px 8px", color: fc > 110 ? "#dc2626" : fc >= 100 ? "#d97706" : "inherit" } }, l.pre?.fc || "—"), React.createElement("td", { style: { padding: "7px 8px", color: spo2 > 0 && spo2 < 94 ? "#dc2626" : "inherit" } }, l.pre?.spo2 ? l.pre.spo2 + "%" : "—"), React.createElement("td", { style: { padding: "7px 8px", color: gly > 0 && (gly < 70 || gly >= 200) ? "#dc2626" : "inherit" } }, l.pre?.glycemia || "—"), React.createElement("td", { style: { padding: "7px 8px" } }, l.pre?.pse !== "" && l.pre?.pse !== void 0 ? l.pre.pse : "—"), React.createElement("td", { style: { padding: "7px 8px", fontWeight: 700, color: pseDurCl?.color || "inherit", background: pseDurCl?.bg || "transparent" } }, l.during?.pse !== "" && l.during?.pse !== void 0 ? l.during.pse : "—"), React.createElement("td", { style: { padding: "7px 8px" } }, l.post?.pse !== "" && l.post?.pse !== void 0 ? l.post.pse : "—"), React.createElement("td", { style: { padding: "7px 8px" } }, (l.post?.sbp || l.post?.pas) && l.post?.pad ? (l.post.sbp || l.post.pas) + "/" + l.post.pad : "—"), React.createElement("td", { style: { padding: "7px 8px" } }, l.post?.fc || "—"), React.createElement("td", { style: { padding: "7px 8px" } }, l.disposition ? dispEmoji[l.disposition] : "—"), React.createElement("td", { style: { padding: "7px 8px" } }, l.hydration ? "💧".repeat(l.hydration) : "—"), React.createElement("td", { style: { padding: "7px 8px", color: "#64748b", fontSize: 10 } }, l.notes || "—"));
  }))))), React.createElement(ProfFooter, { extra: "Relatório de Monitoramento · " + periodLabels[period] + " · " + filtered.length + " sessões · Zonas Longevus v1.0" })));
};
const Reports = ({ pre, students, assessments, setAssessments, dailyLogs, sessions, nav }) => {
  const [selSt, setSelSt] = useState(pre && pre.studentId || "");
  const [selA, setSelA] = useState("");
  const [reportType, setReportType] = useState(pre && pre.tipo || "");
  const [antroSel, setAntroSel] = useState(null);
  const [antroAuto, setAntroAuto] = useState(pre && pre.antroId || null);
  const LA = window.LongevusAntropometria;
  const [monitoringPeriod, setMonitoringPeriod] = useState(1);
  const [previewing, setPreviewing] = useState(false);
  const [aiTexts, setAiTexts] = useState({ clinical: "", referral: "", evolution: "" });
  const st = students.find((s) => s.id === selSt);
  const stA = assessments.filter((a) => a.studentId === selSt).sort((a, b) => a.date?.localeCompare(b.date));
  const stL = [...dailyLogs.filter((l) => l.studentId === selSt)].sort((a, b) => b.date?.localeCompare(a.date)).slice(0, 15);
  const selectedAssessment = assessments.find((a) => a.id === selA);
  useEffect(() => {
    if (selectedAssessment?.aiTexts) setAiTexts(selectedAssessment.aiTexts);
    else setAiTexts({ clinical: "", referral: "", evolution: "" });
  }, [selA]);
  const saveAiText = (type, text) => {
    const updated = { ...aiTexts, [type]: text };
    setAiTexts(updated);
    if (selA) setAssessments((prev) => prev.map((a) => a.id === selA ? { ...a, aiTexts: updated } : a));
  };
  const reportTypes = [
    { id: "clinical", label: "Relatório Clínico Completo", desc: "IA gera texto profissional com base nos dados. Você edita e imprime.", icon: "📋", needsAssessment: true },
    { id: "referral", label: "Carta de Encaminhamento", desc: "IA redige a carta para o médico. Você revisa e personaliza.", icon: "📩", needsAssessment: true },
    { id: "evolution", label: "Relatório de Evolução", desc: "IA analisa o progresso do aluno ao longo das avaliações.", icon: "📈", needsAssessment: false },
    { id: "monitoring", label: "Relatório de Monitoramento", desc: "Sinais vitais, adesão, disposição e hidratação por período.", icon: "📊", needsAssessment: false },
    { id: "antro", label: "Relatório Antropométrico", desc: "Medidas, dobras e bioimpedância com classificação e comparação.", icon: "📏", needsAssessment: false }
  ];
  const handlePrint = () => window.print();
  if (previewing) {
    return React.createElement("div", null, React.createElement("div", { className: "no-print", style: { display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16, alignItems: "center" } }, React.createElement("button", { onClick: () => setPreviewing(false), style: { background: "#f1f5f9", border: "none", borderRadius: 9, padding: "9px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer" } }, "← Voltar e Editar"), React.createElement("button", { onClick: handlePrint, style: { background: "#FF5603", border: "none", borderRadius: 9, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "#fff" } }, "🖨️ Imprimir / Salvar PDF"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, 'No celular: "Imprimir" → "Salvar como PDF"')), React.createElement(PrintStyle, null), reportType === "clinical" && React.createElement(React.Fragment, null, React.createElement(ReportClinical, { assessment: selectedAssessment, student: st }), React.createElement("div", { style: { padding: "0 20px 20px" } }, React.createElement(AIReportDisplay, { text: aiTexts.clinical, title: "Análise Clínica" }))), reportType === "referral" && React.createElement(React.Fragment, null, React.createElement(ReportReferral, { assessment: selectedAssessment, student: st })), reportType === "antro" && antroSel && LA && LA.Relatorio && React.createElement(LA.Relatorio, { key: antroSel.rec.id, st, rec: antroSel.rec, anterior: antroSel.anterior, Header: ProfHeader, Footer: ProfFooter }), reportType === "monitoring" && React.createElement(React.Fragment, null, React.createElement(ReportMonitoring, { student: st, logs: dailyLogs, period: monitoringPeriod })), reportType === "evolution" && React.createElement(React.Fragment, null, React.createElement(ReportEvolution, { student: st, assessments: stA, dailyLogs: stL }), React.createElement("div", { style: { padding: "0 20px 20px" } }, React.createElement(AIReportDisplay, { text: aiTexts.evolution, title: "Análise de Evolução" }))));
  }
  return React.createElement("div", null, React.createElement("div", { style: { fontWeight: 800, fontSize: 20, marginBottom: 18 } }, "Relatórios"), React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 12 } }, "1. Selecionar Aluno"), React.createElement(Inp, { label: "", value: selSt, onChange: (v) => {
    setSelSt(v);
    setSelA("");
    setReportType("");
    setAntroSel(null);
    setAntroAuto(null);
    setAiTexts({ clinical: "", referral: "", evolution: "" });
  }, opts: [{ v: "", l: "Selecione o aluno..." }, ...students.map((s) => ({ v: s.id, l: `${s.name} (${calcAge(s.dob)} anos)` }))] })), st && React.createElement(React.Fragment, null, React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 12 } }, "2. Tipo de Relatório"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, reportTypes.map((r) => React.createElement("button", { key: r.id, onClick: () => setReportType(r.id), style: { display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 14px", borderRadius: 11, border: `1.5px solid ${reportType === r.id ? "#FF5603" : "#e2e8f0"}`, background: reportType === r.id ? "#fff4ee" : "#f8fafc", cursor: "pointer", textAlign: "left" } }, React.createElement("span", { style: { fontSize: 22 } }, r.icon), React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: reportType === r.id ? "#FF5603" : "#0f172a" } }, r.label), React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 2 } }, r.desc)))))), reportType && reportTypes.find((r) => r.id === reportType)?.needsAssessment && stA.length > 0 && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 12 } }, "3. Selecionar Avaliação"), React.createElement(Inp, { label: "", value: selA, onChange: setSelA, opts: [{ v: "", l: "Selecione..." }, ...stA.slice().reverse().map((a) => {
    const gc = classifyGlobal(a.globalScore || 0);
    return { v: a.id, l: `${fmt(a.date)} — ${gc.label} (${a.globalScore || 0} pts)` };
  })] })), reportType === "antro" && selSt && React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 12 } }, "3. Selecionar Avaliação Antropométrica"), LA && LA.Seletor ? React.createElement(LA.Seletor, { st, autoId: antroAuto, onAbrir: (rec, anterior) => {
    setAntroSel({ rec, anterior });
    setAntroAuto(null);
    setPreviewing(true);
    window.scrollTo(0, 0);
  } }) : React.createElement("div", { style: { fontSize: 13, color: "#94a3b8" } }, "Módulo de antropometria não carregou.")), reportType === "monitoring" && selSt && React.createElement(Card, { style: { marginBottom: 14, border: "1.5px solid #FF560322" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 4 } }, "📊 Relatório de Monitoramento"), React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 12 } }, "Gerado automaticamente com base nos registros do aluno no período selecionado."), React.createElement(Btn, { full: true, icon: "eye", onClick: () => setPreviewing(true) }, "Visualizar e Imprimir")), reportType && reportType !== "monitoring" && reportType !== "antro" && (reportTypes.find((r) => r.id === reportType)?.needsAssessment ? selA : true) && React.createElement(Card, { style: { marginBottom: 14, border: "1.5px solid #FF560322" } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 4 } }, "✨ Texto gerado — editável"), React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 16 } }, 'Clique em "Gerar" para criar o texto automaticamente. Edite à vontade antes de imprimir.'), React.createElement(
    AIReportEditor,
    {
      type: reportType,
      assessment: selectedAssessment || assessments.filter((a) => a.studentId === selSt).slice(-1)[0],
      student: st,
      stA,
      stL,
      savedText: aiTexts[reportType],
      onSave: (text) => saveAiText(reportType, text)
    }
  ), aiTexts[reportType]?.trim() && React.createElement(Btn, { full: true, icon: "eye", onClick: () => setPreviewing(true), style: { marginTop: 8 } }, "Visualizar e Imprimir")), stA.length === 0 && selSt && reportType !== "antro" && React.createElement("div", { style: { fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "20px 0" } }, "Nenhuma avaliação registrada para este aluno.")));
};
const Login = ({ onLogin }) => {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error: error2 } = await supa.auth.signInWithPassword({ email, password });
        if (error2) throw error2;
      } else if (mode === "forgot") {
        const { error: error2 } = await supa.auth.resetPasswordForEmail(email, { redirectTo: window.location.href.split("?")[0].split("#")[0] });
        if (error2) throw error2;
        setInfo("Enviamos um link de redefinição para " + email + ". Verifique sua caixa de entrada.");
        setLoading(false);
        return;
      } else {
        const { error: error2 } = await supa.auth.signUp({ email, password, options: { data: { nome, whatsapp } } });
        if (error2) throw error2;
        setInfo("Conta criada! Faça login.");
        setMode("signin");
        setLoading(false);
        return;
      }
      onLogin();
    } catch (err) {
      setError(err.message || "Erro ao autenticar.");
    } finally {
      setLoading(false);
    }
  };
  return React.createElement("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: 20 } }, React.createElement("form", { onSubmit: submit, style: { background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 380, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" } }, React.createElement("div", { style: { textAlign: "center", marginBottom: 18 } }, React.createElement("img", { src: __LOGO_1__, alt: "Longevus", style: { width: 100, height: 100, margin: "0 auto 12px", display: "block" } })), mode === "signup" && React.createElement("div", { style: { marginBottom: 12 } }, React.createElement("label", { style: { fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 } }, "Nome"), React.createElement("input", { type: "text", required: true, value: nome, onChange: (e) => setNome(e.target.value), style: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" } })), mode === "signup" && React.createElement("div", { style: { marginBottom: 12 } }, React.createElement("label", { style: { fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 } }, "WhatsApp"), React.createElement("input", { type: "tel", required: true, placeholder: "(11) 91234-5678", value: whatsapp, onChange: (e) => setWhatsapp(e.target.value), style: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" } })), React.createElement("div", { style: { marginBottom: 12 } }, React.createElement("label", { style: { fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 } }, "E-mail"), React.createElement("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), style: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" } })), mode !== "forgot" && React.createElement("div", { style: { marginBottom: 16 } }, React.createElement("label", { style: { fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 } }, "Senha"), React.createElement(SenhaInput, { required: true, value: password, onChange: (e) => setPassword(e.target.value), style: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" } })), mode === "signin" && React.createElement("div", { style: { textAlign: "right", marginTop: -8, marginBottom: 16 } }, React.createElement("a", { href: "#", onClick: (e) => {
    e.preventDefault();
    setMode("forgot");
    setError("");
    setInfo("");
  }, style: { fontSize: 12, color: "#94a3b8" } }, "Esqueci minha senha")), error && React.createElement("div", { style: { fontSize: 12, color: "#dc2626", marginBottom: 12, textAlign: "center" } }, error), info && React.createElement("div", { style: { fontSize: 12, color: "#16a34a", marginBottom: 12, textAlign: "center" } }, info), React.createElement("button", { type: "submit", disabled: loading, style: { width: "100%", padding: "11px", borderRadius: 8, border: "none", background: "#FF5603", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: loading ? 0.7 : 1, boxSizing: "border-box" } }, loading ? "Aguarde..." : mode === "signin" ? "Entrar" : mode === "forgot" ? "Enviar link de redefinição" : "Criar conta"), React.createElement("div", { style: { textAlign: "center", marginTop: 14, fontSize: 13 } }, mode === "signin" ? React.createElement("span", null, "Não tem conta? ", React.createElement("a", { href: "#", onClick: (e) => {
    e.preventDefault();
    setMode("signup");
    setError("");
    setInfo("");
  }, style: { color: "#FF5603", fontWeight: 600 } }, "Criar conta")) : React.createElement("span", null, mode === "forgot" ? "Lembrou a senha?" : "Já tem conta?", " ", React.createElement("a", { href: "#", onClick: (e) => {
    e.preventDefault();
    setMode("signin");
    setError("");
    setInfo("");
  }, style: { color: "#FF5603", fontWeight: 600 } }, "Entrar")))));
};
const ResetPassword = ({ onDone }) => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const { error: error2 } = await supa.auth.updateUser({ password });
      if (error2) throw error2;
      onDone();
    } catch (err) {
      setError(err.message || "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  };
  return React.createElement("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: 20 } }, React.createElement("form", { onSubmit: submit, style: { background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 380, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" } }, React.createElement("div", { style: { textAlign: "center", marginBottom: 18 } }, React.createElement("img", { src: __LOGO_1__, alt: "Longevus", style: { width: 56, height: 56, margin: "0 auto 8px", display: "block" } }), React.createElement("div", { style: { fontWeight: 900, fontSize: 20 } }, "Definir nova senha")), React.createElement("div", { style: { marginBottom: 12 } }, React.createElement("label", { style: { fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 } }, "Nova senha"), React.createElement(SenhaInput, { required: true, value: password, onChange: (e) => setPassword(e.target.value), style: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" } })), React.createElement("div", { style: { marginBottom: 16 } }, React.createElement("label", { style: { fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 } }, "Confirmar senha"), React.createElement(SenhaInput, { required: true, value: confirm, onChange: (e) => setConfirm(e.target.value), style: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" } })), error && React.createElement("div", { style: { fontSize: 12, color: "#dc2626", marginBottom: 12, textAlign: "center" } }, error), React.createElement("button", { type: "submit", disabled: loading, style: { width: "100%", padding: "11px", borderRadius: 8, border: "none", background: "#FF5603", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: loading ? 0.7 : 1 } }, loading ? "Salvando..." : "Salvar nova senha")));
};
const Profile = ({ session, onLogoChange, nav }) => {
  const [form, setForm] = useState({ nome: "", whatsapp: "", cref: "", especializacao: "", logo_url: "", pix_key: "", pix_key_type: "cpf", pix_merchant_name: "", pix_merchant_city: "", aviso_vencimento_dias: "7", tolerancia_vencimento_dias: "0" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [pwd, setPwd] = useState({ nova: "", confirmar: "" });
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [c360, setC360] = useState({ ativo: false, nome: "Longevus 360", valor: "", beneficios: "" });
  const [saving360, setSaving360] = useState(false);
  const [msg360, setMsg360] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const headers = await DB.authHeaders();
        const r = await fetch(SUPA_URL + "/rest/v1/professionals?select=l360&id=eq." + session.user.id, { headers });
        if (!r.ok) return;
        const rows = await r.json();
        const c = rows && rows[0] && rows[0].l360 || {};
        setC360({ ativo: !!c.ativo, nome: c.nome || "Longevus 360", valor: c.valor ? String(c.valor).replace(".", ",") : "", beneficios: Array.isArray(c.beneficios) ? c.beneficios.join("\n") : "" });
      } catch (e) {
      }
    })();
  }, [session]);
  const save360 = async () => {
    setSaving360(true);
    setMsg360("");
    try {
      const headers = await DB.authHeaders();
      const valor = parseFloat(String(c360.valor || "").replace(",", ".")) || 0;
      const beneficios = String(c360.beneficios || "").split("\n").map((x) => x.trim()).filter(Boolean);
      const r = await fetch(SUPA_URL + "/rest/v1/professionals?id=eq." + session.user.id, {
        method: "PATCH",
        headers: { ...headers, "Prefer": "return=minimal" },
        body: JSON.stringify({ l360: { ativo: !!c360.ativo, nome: (c360.nome || "").trim() || "Longevus 360", valor, beneficios } })
      });
      if (!r.ok) throw new Error("http");
      setMsg360("Longevus 360 salvo!");
    } catch (e) {
      setMsg360("Erro ao salvar. Confira se o SQL do Longevus 360 foi rodado.");
    }
    setSaving360(false);
  };
  const changePassword = async () => {
    setPwdMsg("");
    if (pwd.nova.length < 6) {
      setPwdMsg("Erro: a senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (pwd.nova !== pwd.confirmar) {
      setPwdMsg("Erro: as senhas não coincidem.");
      return;
    }
    setPwdSaving(true);
    try {
      const { error } = await supa.auth.updateUser({ password: pwd.nova });
      if (error) throw error;
      setPwdMsg("Senha alterada com sucesso!");
      setPwd({ nova: "", confirmar: "" });
    } catch (err) {
      setPwdMsg("Erro: " + (err.message || "não foi possível alterar"));
    }
    setPwdSaving(false);
  };
  useEffect(() => {
    (async () => {
      try {
        const headers = await DB.authHeaders();
        const r = await fetch(SUPA_URL + "/rest/v1/professionals?select=nome,whatsapp,cref,especializacao,email,logo_url,pix_key,pix_key_type,pix_merchant_name,pix_merchant_city,aviso_vencimento_dias,tolerancia_vencimento_dias&id=eq." + session.user.id, { headers });
        const rows = await r.json();
        const p = rows?.[0] || {};
        setForm({ nome: p.nome || "", whatsapp: p.whatsapp || "", cref: p.cref || "", especializacao: p.especializacao || "", email: p.email || session.user.email, logo_url: p.logo_url || "", pix_key: p.pix_key || "", pix_key_type: p.pix_key_type || "cpf", pix_merchant_name: p.pix_merchant_name || p.nome || "", pix_merchant_city: p.pix_merchant_city || "", aviso_vencimento_dias: String(p.aviso_vencimento_dias ?? 7), tolerancia_vencimento_dias: String(p.tolerancia_vencimento_dias ?? 0) });
      } catch (e) {
      }
      setLoading(false);
    })();
  }, [session]);
  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const headers = await DB.authHeaders();
      await fetch(SUPA_URL + "/rest/v1/professionals?id=eq." + session.user.id, {
        method: "PATCH",
        headers: { ...headers, "Prefer": "return=minimal" },
        body: JSON.stringify({ nome: form.nome, whatsapp: form.whatsapp, cref: form.cref, especializacao: form.especializacao, pix_key: form.pix_key, pix_key_type: form.pix_key_type, pix_merchant_name: form.pix_merchant_name, pix_merchant_city: form.pix_merchant_city, aviso_vencimento_dias: parseInt(form.aviso_vencimento_dias) || 7, tolerancia_vencimento_dias: Math.max(0, parseInt(form.tolerancia_vencimento_dias) || 0) })
      });
      setMsg("Dados salvos com sucesso!");
    } catch (e) {
      setMsg("Erro ao salvar.");
    }
    setSaving(false);
  };
  const uploadLogo = async (file) => {
    if (!file) return;
    setUploading(true);
    setMsg("");
    try {
      const ext = file.name.split(".").pop();
      const path = session.user.id + "/logo." + ext;
      const { error: upErr } = await supa.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supa.storage.from("avatars").getPublicUrl(path);
      const url = data.publicUrl + "?t=" + Date.now();
      const headers = await DB.authHeaders();
      await fetch(SUPA_URL + "/rest/v1/professionals?id=eq." + session.user.id, {
        method: "PATCH",
        headers: { ...headers, "Prefer": "return=minimal" },
        body: JSON.stringify({ logo_url: url })
      });
      setForm((f) => ({ ...f, logo_url: url }));
      onLogoChange && onLogoChange(url);
      setMsg("Foto/logo atualizada!");
    } catch (err) {
      setMsg("Erro ao enviar imagem: " + (err.message || ""));
    }
    setUploading(false);
  };
  const fld = (label, key, type = "text", placeholder = "") => React.createElement("div", { style: { marginBottom: 14 } }, React.createElement("label", { style: { fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 } }, label), React.createElement("input", { type, placeholder, value: form[key], onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })), style: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" } }));
  if (loading) return React.createElement("div", { style: { padding: 20, color: "#94a3b8", fontSize: 13 } }, "Carregando...");
  return React.createElement("div", { style: { padding: "16px" } }, React.createElement(Card, null, React.createElement("div", { style: { fontWeight: 800, fontSize: 16, marginBottom: 14 } }, "Meu Perfil"), React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14, marginBottom: 18 } }, form.logo_url ? React.createElement("img", { src: form.logo_url, alt: "Logo", style: { width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "1.5px solid #e2e8f0" } }) : React.createElement("div", { style: { width: 64, height: 64, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" } }, React.createElement(I, { n: "user", s: 28, c: "#94a3b8" })), React.createElement("div", null, React.createElement("label", { style: { display: "inline-block", padding: "8px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" } }, uploading ? "Enviando..." : "Alterar foto/logo", React.createElement("input", { type: "file", accept: "image/*", onChange: (e) => uploadLogo(e.target.files[0]), disabled: uploading, style: { display: "none" } })))), fld("Nome", "nome"), React.createElement("div", { style: { marginBottom: 14 } }, React.createElement("label", { style: { fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 } }, "E-mail"), React.createElement("input", { type: "email", disabled: true, value: form.email, style: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", background: "#f8fafc", color: "#94a3b8" } })), fld("WhatsApp", "whatsapp", "tel", "(11) 91234-5678"), fld("CREF", "cref", "text", "Ex: 089836-G/SP"), fld("Especialização", "especializacao", "text", "Ex: Gerontologia"), msg && React.createElement("div", { style: { fontSize: 12, color: msg.includes("Erro") ? "#dc2626" : "#16a34a", marginBottom: 10 } }, msg), React.createElement(Btn, { full: true, onClick: save, disabled: saving }, saving ? "Salvando..." : "Salvar alterações")), React.createElement(Card, { style: { marginTop: 16 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 16, marginBottom: 4 } }, "💰 Chave Pix para cobrança"), React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginBottom: 14, lineHeight: 1.5 } }, "Usada para gerar o QR Code de pagamento que aparece pros seus alunos quando a mensalidade vence."), React.createElement("div", { style: { marginBottom: 14 } }, React.createElement("label", { style: { fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 } }, "Tipo de chave"), React.createElement("select", { value: form.pix_key_type, onChange: (e) => setForm((f) => ({ ...f, pix_key_type: e.target.value })), style: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", background: "#fff" } }, React.createElement("option", { value: "cpf" }, "CPF"), React.createElement("option", { value: "cnpj" }, "CNPJ"), React.createElement("option", { value: "email" }, "E-mail"), React.createElement("option", { value: "telefone" }, "Telefone"), React.createElement("option", { value: "aleatoria" }, "Chave aleatória"))), fld("Chave Pix", "pix_key", "text", "Somente números, e-mail ou chave aleatória"), fld("Nome do recebedor (aparece no Pix)", "pix_merchant_name", "text", "Seu nome ou nome do negócio"), fld("Cidade (aparece no Pix)", "pix_merchant_city", "text", "Ex: SAO PAULO"), React.createElement("div", { style: { marginBottom: 14 } }, React.createElement("label", { style: { fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 } }, "Avisar o aluno quantos dias antes do vencimento?"), React.createElement("input", { type: "number", min: "0", max: "30", value: form.aviso_vencimento_dias, onChange: (e) => setForm((f) => ({ ...f, aviso_vencimento_dias: e.target.value })), style: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" } }), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 4 } }, "Nesse período, o aluno vê um aviso de vencimento próximo (com opção de pagar adiantado) toda vez que abrir o app dele — mas ainda consegue usar normalmente. Só bloqueia de fato depois que vencer.")), React.createElement("div", { style: { marginBottom: 14 } }, React.createElement("label", { style: { fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 } }, "Dias de tolerância após o vencimento"), React.createElement("input", { type: "number", min: "0", max: "30", value: form.tolerancia_vencimento_dias, onChange: (e) => setForm((f) => ({ ...f, tolerancia_vencimento_dias: e.target.value })), style: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" } }), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8", marginTop: 4 } }, "Depois de vencer, o aluno ainda usa o app por esse número de dias, vendo um aviso de atraso. Passado o prazo, o acesso é bloqueado até o pagamento. Use 0 para bloquear no dia seguinte ao vencimento.")), msg && React.createElement("div", { style: { fontSize: 12, color: msg.includes("Erro") ? "#dc2626" : "#16a34a", marginBottom: 10 } }, msg), React.createElement(Btn, { full: true, onClick: save, disabled: saving }, saving ? "Salvando..." : "Salvar chave Pix")), React.createElement(Card, { style: { marginTop: 16 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 } }, React.createElement("div", null, React.createElement("div", { style: { fontWeight: 800, fontSize: 16 } }, c360.nome || "Longevus 360"), React.createElement("div", { style: { fontSize: 12, color: "#64748b", marginTop: 2, lineHeight: 1.5 } }, "Valor, benefícios e anúncio agora ficam na Vitrine, junto com seus outros serviços.")), React.createElement("button", { type: "button", onClick: () => nav && nav("vitrine"), style: { flexShrink: 0, padding: "9px 14px", borderRadius: 10, border: "none", background: "#FF5603", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" } }, "Configurar na Vitrine"))), React.createElement(Card, { style: { marginTop: 16 } }, React.createElement("div", { style: { fontWeight: 800, fontSize: 16, marginBottom: 14 } }, "Alterar senha"), React.createElement("div", { style: { marginBottom: 14 } }, React.createElement("label", { style: { fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 } }, "Nova senha"), React.createElement(SenhaInput, { value: pwd.nova, onChange: (e) => setPwd((p) => ({ ...p, nova: e.target.value })), style: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" } })), React.createElement("div", { style: { marginBottom: 14 } }, React.createElement("label", { style: { fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 } }, "Confirmar nova senha"), React.createElement(SenhaInput, { value: pwd.confirmar, onChange: (e) => setPwd((p) => ({ ...p, confirmar: e.target.value })), style: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" } })), pwdMsg && React.createElement("div", { style: { fontSize: 12, color: pwdMsg.includes("Erro") ? "#dc2626" : "#16a34a", marginBottom: 10 } }, pwdMsg), React.createElement(Btn, { full: true, onClick: changePassword, disabled: pwdSaving }, pwdSaving ? "Salvando..." : "Alterar senha")));
};
const SubscribeModal = ({ onClose }) => {
  const [plan, setPlan] = React.useState("anual");
  const [cpf, setCpf] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const handleSubscribe = async () => {
    setError("");
    setLoading(true);
    try {
      const { data: sess } = await supa.auth.getSession();
      const token = sess?.session?.access_token;
      const body = { planType: plan };
      if (cpf) body.cpfCnpj = cpf;
      const r = await fetch("https://jpduxfbigcdxmtcozqpp.supabase.co/functions/v1/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(body)
      });
      const data = await r.json();
      if (data.error === "cpf_cnpj_required") {
        setError("Informe seu CPF ou CNPJ para continuar.");
        setLoading(false);
        return;
      }
      if (!r.ok) {
        setError("Erro ao criar assinatura. Tente novamente.");
        setLoading(false);
        return;
      }
      if (data.checkoutUrl) window.open(data.checkoutUrl, "_blank");
      else setError("Link de pagamento não encontrado. Tente novamente.");
    } catch (e) {
      setError("Erro de conexão. Tente novamente.");
    }
    setLoading(false);
  };
  const plans = {
    anual: { label: "Anual", price: "R$ 970", sub: "R$ 80,83/mês · 2 meses grátis", badge: "Mais popular", features: ["Acesso completo à plataforma", "Relatórios ilimitados", "Todos os protocolos e módulos", "Suporte prioritário", "Renovação automática anual"] },
    mensal: { label: "Mensal", price: "R$ 97", sub: "por mês", badge: null, features: ["Acesso completo à plataforma", "Relatórios ilimitados", "Todos os protocolos e módulos", "Suporte por e-mail", "Renovação automática mensal"] }
  };
  const selected = plans[plan];
  return React.createElement("div", { style: { position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" } }, React.createElement("div", { style: { background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, boxShadow: "0 24px 48px rgba(0,0,0,0.2)", overflow: "hidden" } }, React.createElement("div", { style: { background: "#1F2E2A", padding: "20px 24px 16px", textAlign: "center" } }, React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#FF5603", fontWeight: 700, marginBottom: 6 } }, "Longevus"), React.createElement("div", { style: { color: "#fff", fontWeight: 800, fontSize: 20, marginBottom: 4 } }, "Escolha seu plano"), React.createElement("div", { style: { color: "#94a3b8", fontSize: 13 } }, "Acesso completo. Cancele quando quiser.")), React.createElement("div", { style: { padding: "20px 20px 0" } }, React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 20 } }, ["anual", "mensal"].map((p) => React.createElement("div", { key: p, onClick: () => setPlan(p), style: { flex: 1, position: "relative", padding: "14px 10px 12px", borderRadius: 12, border: "2px solid " + (plan === p ? "#FF5603" : "#e2e8f0"), cursor: "pointer", textAlign: "center", background: plan === p ? "#fff7f3" : "#fafafa", transition: "all 0.15s" } }, plans[p].badge && React.createElement("div", { style: { position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#FF5603", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 99, letterSpacing: "0.08em", whiteSpace: "nowrap" } }, plans[p].badge), React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#1F2E2A", marginBottom: 4 } }, plans[p].label), React.createElement("div", { style: { fontWeight: 900, fontSize: 24, color: plan === p ? "#FF5603" : "#1F2E2A", lineHeight: 1 } }, plans[p].price), React.createElement("div", { style: { fontSize: 10, color: "#94a3b8", marginTop: 4, lineHeight: 1.4 } }, plans[p].sub)))), React.createElement("div", { style: { background: "#f8fafc", borderRadius: 10, padding: "12px 14px", marginBottom: 16 } }, selected.features.map((f, i) => React.createElement("div", { key: i, style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#334155", padding: "4px 0" } }, React.createElement("span", { style: { color: "#FF5603", fontWeight: 700, fontSize: 15, lineHeight: 1 } }, "✓"), f))), React.createElement("input", { value: cpf, onChange: (e) => setCpf(e.target.value), placeholder: "CPF ou CNPJ (somente números)", style: { width: "100%", padding: "11px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, marginBottom: 4, outline: "none", boxSizing: "border-box" } }), error && React.createElement("div", { style: { fontSize: 12, color: "#dc2626", marginBottom: 6, paddingLeft: 2 } }, error)), React.createElement("div", { style: { padding: "12px 20px 20px" } }, React.createElement("button", { onClick: handleSubscribe, disabled: loading, style: { width: "100%", padding: "14px", borderRadius: 10, background: "#FF5603", color: "#fff", fontWeight: 800, fontSize: 15, border: "none", cursor: "pointer", marginBottom: 8, boxShadow: "0 4px 12px rgba(255,86,3,0.3)" } }, loading ? "Aguarde..." : "Ir para pagamento →"), React.createElement("div", { style: { textAlign: "center", fontSize: 11, color: "#94a3b8", marginBottom: 10, lineHeight: 1.5 } }, "🔒 Pagamento seguro · Renovação automática · Cancele quando quiser"), React.createElement("button", { onClick: onClose, style: { width: "100%", padding: "8px", background: "transparent", color: "#94a3b8", fontSize: 13, border: "none", cursor: "pointer", textDecoration: "underline" } }, "Agora não"))));
};
const ContaDeAluno = ({ email }) => React.createElement("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: 20 } }, React.createElement("div", { style: { background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 380, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", textAlign: "center" } }, React.createElement("img", { src: __LOGO_1__, alt: "Longevus", style: { width: 56, height: 56, margin: "0 auto 12px", display: "block" } }), React.createElement("div", { style: { fontWeight: 900, fontSize: 18, marginBottom: 8 } }, "Esta é uma conta de aluno"), React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 6, lineHeight: 1.5 } }, "O painel do professor é só para profissionais. Para ver seu treino, use o app Meu Treino."), email && React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginBottom: 20 } }, "Conectado como ", email), React.createElement("a", { href: "aluno.html", style: { display: "block", width: "100%", boxSizing: "border-box", padding: "12px", borderRadius: 8, background: "#FF5603", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", marginBottom: 10 } }, "Abrir Meu Treino"), React.createElement("button", { onClick: () => supa.auth.signOut({ scope: "local" }), style: { border: "none", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer", textDecoration: "underline" } }, "Entrar com outra conta")));
const TrialExpired = ({ email }) => {
  const [showModal, setShowModal] = React.useState(false);
  return React.createElement("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: 20 } }, showModal && React.createElement(SubscribeModal, { onClose: () => setShowModal(false) }), React.createElement("div", { style: { background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 380, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", textAlign: "center" } }, React.createElement("img", { src: __LOGO_1__, alt: "Longevus", style: { width: 56, height: 56, margin: "0 auto 12px", display: "block" } }), React.createElement("div", { style: { fontWeight: 900, fontSize: 18, marginBottom: 8 } }, "Seu período de teste terminou"), React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.5 } }, "Para continuar usando o Longevus e acessar os dados dos seus alunos, ative seu plano."), email && React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: -12, marginBottom: 16 } }, "Conectado como ", email), React.createElement("button", { onClick: () => setShowModal(true), style: { display: "block", width: "100%", padding: "12px", borderRadius: 8, background: "#FF5603", color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", marginBottom: 10 } }, "Ativar plano"), React.createElement("button", { onClick: () => supa.auth.signOut({ scope: "local" }), style: { border: "none", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer", textDecoration: "underline" } }, "Sair")));
};
function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profName, setProfName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [billing, setBilling] = useState(null);
  useEffect(() => {
    supa.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
      setAuthLoading(false);
    });
    const { data: listener } = supa.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!session) {
      setProfName("");
      setLogoUrl("");
      setBilling(null);
      return;
    }
    (async () => {
      try {
        const headers = await DB.authHeaders();
        const r = await fetch(SUPA_URL + "/rest/v1/professionals?select=nome,logo_url,plano,status_assinatura,trial_ends_at&id=eq." + session.user.id, { headers });
        const rows = await r.json();
        const p = rows?.[0] || {};
        setProfName(p.nome || session.user.email || "");
        setLogoUrl(p.logo_url || "");
        let ehAluno = false;
        if (p.plano !== "anual" && p.plano !== "mensal") {
          try {
            const ra = await fetch(SUPA_URL + "/rest/v1/students?select=id&owner_id=neq." + session.user.id + "&limit=1", { headers });
            const la = ra.ok ? await ra.json() : [];
            ehAluno = Array.isArray(la) && la.length > 0;
          } catch (e) {
          }
        }
        setBilling({ plano: p.plano || "trial", status_assinatura: p.status_assinatura || "ativo", trial_ends_at: p.trial_ends_at, aluno: ehAluno });
        fetch(SUPA_URL + "/rest/v1/professionals?id=eq." + session.user.id, {
          method: "PATCH",
          headers: { ...headers, "Prefer": "return=minimal" },
          body: JSON.stringify({ last_active: (new Date()).toISOString() })
        }).catch(() => {
        });
      } catch (e) {
        setProfName(session.user.email || "");
      }
    })();
  }, [session]);
  const [students, setStudents] = useState(() => LS.get("longevus_students", []));
  const [assessments, setAssessments] = useState(() => LS.get("longevus_assessments", []));
  const [dailyLogs, setDailyLogs] = useState(() => LS.get("longevus_daily", []));
  const [documents, setDocuments] = useState(() => LS.get("longevus_docs", []));
  const [cardioRecords, setCardioRecords] = useState(() => LS.get("longevus_cardio", []));
  const [programs, setPrograms] = useState(() => LS.get("longevus_programs", []));
  const [sessions, setSessions] = useState(() => LS.get("longevus_sessions", []));
  const [checkins, setCheckins] = useState(() => LS.get("longevus_checkins", []));
  const [notifOpen, setNotifOpen] = useState(false);
  const [checkinsSeenAt, setCheckinsSeenAt] = useState(() => LS.get("longevus_checkins_seen_at", "1970-01-01T00:00:00.000Z"));
  const [ultimoAcesso, setUltimoAcesso] = useState({});
  const [pendenciasLogin, setPendenciasLogin] = useState([]);
  const [atividadesExtras, setAtividadesExtras] = useState(() => LS.get("longevus_atividades_extras", []));
  const [professorFeedbacks, setProfessorFeedbacks] = useState(() => LS.get("longevus_professor_feedbacks", []));
  const [agendaEntries, setAgendaEntries] = useState(() => LS.get("longevus_agenda", []));
  const [pagamentos, setPagamentos] = useState(() => LS.get("longevus_pagamentos", []));
  const [receitasExtras, setReceitasExtras] = useState(() => LS.get("longevus_receitas_extras", []));
  const [leads, setLeads] = useState(() => LS.get("longevus_leads", []).map(migrateLead));
  const [condos, setCondos] = useState(() => LS.get("longevus_condominios", []));
  const [condoLeads, setCondoLeads] = useState(() => LS.get("longevus_condominio_leads", []));
  const [exerciciosBiblioteca, setExerciciosBiblioteca] = useState(() => LS.get("longevus_exercicios_biblioteca", []));
  const [planos, setPlanos] = useState(() => LS.get("longevus_planos", []));
  const [contratoModelos, setContratoModelos] = useState(() => {
    const salvos = LS.get("longevus_contrato_modelos", null);
    if (salvos && salvos.length > 0) return salvos;
    const legado = LS.get("longevus_contrato_modelo", null);
    if (legado && legado.texto) return [{ id: uid(), nome: "Modelo padrão", texto: legado.texto, prazoDias: legado.prazoDias || 7, padrao: true, createdAt: todayStr() }];
    return [{ id: uid(), nome: "Presencial (padrão)", texto: CONTRATO_MODELO_PADRAO_TEXTO, prazoDias: 7, padrao: true, createdAt: todayStr() }];
  });
  const [contratoAssinaturas, setContratoAssinaturas] = useState(() => LS.get("longevus_contrato_assinaturas", []));
  const [dbReady, setDbReady] = useState(false);
  const [hubResults, setHubResults] = useState(() => LS.get("longevus_hub_results", []));
  useEffect(() => {
    LS.set("longevus_hub_results", hubResults);
  }, [hubResults]);
  const [syncing, setSyncing] = useState(false);
  useEffect(() => {
    if (!session) return;
    setDbReady(false);
    (async () => {
      setSyncing(true);
      try {
        const [s, a, d, docs, c, p, sess, ae, ck, pf, ag, ld, exb, pln, cm, ca, pg, rex, cdm, cdl] = await Promise.all([
          DB.load("students"),
          DB.load("assessments"),
          DB.load("daily_logs"),
          DB.load("documents"),
          DB.load("cardio_records"),
          DB.load("programs"),
          DB.load("sessions"),
          DB.load("atividades_extras"),
          DB.loadRaw("checkins"),
          DB.load("professor_feedbacks"),
          DB.load("agenda"),
          DB.load("leads"),
          DB.loadRaw("exercises", "select=*"),
          DB.load("planos"),
          DB.load("contrato_modelo"),
          DB.loadRaw("contrato_assinaturas", "select=*"),
          DB.load("pagamentos"),
          DB.load("receitas_extras"),
          DB.load("condominios"),
          DB.load("condominio_leads")
        ]);
        if (s !== null) {
          setStudents(s);
          LS.set("longevus_students", s);
        }
        if (a !== null) {
          setAssessments(a);
          LS.set("longevus_assessments", a);
        }
        if (d !== null) {
          setDailyLogs(d);
          LS.set("longevus_daily", d);
        }
        if (docs !== null) {
          setDocuments(docs);
          LS.set("longevus_docs", docs);
        }
        if (c !== null) {
          setCardioRecords(c);
          LS.set("longevus_cardio", c);
        }
        if (p !== null) {
          setPrograms(p);
          LS.set("longevus_programs", p);
        }
        if (sess !== null) {
          setSessions(sess);
          LS.set("longevus_sessions", sess);
        }
        if (ae !== null) {
          setAtividadesExtras(ae);
          LS.set("longevus_atividades_extras", ae);
        }
        if (ck !== null) {
          setCheckins(ck);
          LS.set("longevus_checkins", ck);
        }
        if (pf !== null) {
          setProfessorFeedbacks(pf);
          LS.set("longevus_professor_feedbacks", pf);
        }
        if (ag !== null) {
          setAgendaEntries(ag);
          LS.set("longevus_agenda", ag);
        }
        if (pg !== null) {
          setPagamentos(pg);
          LS.set("longevus_pagamentos", pg);
        }
        if (rex !== null) {
          setReceitasExtras(rex);
          LS.set("longevus_receitas_extras", rex);
        }
        if (cdm !== null) {
          setCondos(cdm);
          LS.set("longevus_condominios", cdm);
        }
        if (cdl !== null) {
          setCondoLeads(cdl);
          LS.set("longevus_condominio_leads", cdl);
        }
        if (ld !== null) {
          const ldMigrado = ld.map(migrateLead);
          setLeads(ldMigrado);
          LS.set("longevus_leads", ldMigrado);
        }
        if (exb !== null) {
          setExerciciosBiblioteca(exb);
          LS.set("longevus_exercicios_biblioteca", exb);
        }
        if (pln !== null) {
          setPlanos(pln);
          LS.set("longevus_planos", pln);
        }
        if (cm !== null && cm.length > 0) {
          setContratoModelos(cm);
          LS.set("longevus_contrato_modelos", cm);
        }
        if (ca !== null) {
          setContratoAssinaturas(ca);
          LS.set("longevus_contrato_assinaturas", ca);
        }
        try {
          const headersUA = await DB.authHeaders();
          const rUA = await fetch(SUPA_URL + "/rest/v1/rpc/rpc_ultimo_acesso_alunos", { method: "POST", headers: headersUA, body: "{}" });
          if (rUA.ok) {
            const rowsUA = await rUA.json();
            const mapUA = {};
            (rowsUA || []).forEach((row) => {
              if (row.student_id) mapUA[row.student_id] = row.last_sign_in_at;
            });
            setUltimoAcesso(mapUA);
          }
          const rPendBell = await fetch(SUPA_URL + "/rest/v1/rpc/rpc_listar_pendencias", { method: "POST", headers: headersUA, body: "{}" });
          if (rPendBell.ok) {
            setPendenciasLogin(await rPendBell.json());
          }
        } catch (e) {
        }
        setDbReady(true);
      } catch (e) {
        setDbReady(true);
      }
      setSyncing(false);
    })();
  }, [session?.user?.id]);
  useEffect(() => {
    if (!dbReady) return;
    setContratoModelos((p) => {
      if (p.some((m) => m.tipo === "avulso")) return p;
      return [...p, { id: uid(), nome: "Presencial — Aula Avulsa", tipo: "avulso", texto: CONTRATO_MODELO_AVULSO_TEXTO, prazoDias: 7, padrao: false, createdAt: todayStr() }];
    });
  }, [dbReady]);
  useEffect(() => {
    if (!dbReady) return;
    setPagamentos((p) => {
      const existentes = new Set(p.map((x) => x.agendaEntryId).filter(Boolean));
      const novos = [];
      agendaEntries.forEach((entry) => {
        if (existentes.has(entry.id)) return;
        if (STATUS_NAO_COBRAM.includes(entry.status)) return;
        const st = students.find((s) => s.id === entry.studentId);
        if (!st || !st.billing?.ativo) return;
        const ehAvulso = st.billing?.tipo === "avulso";
        const ehPorSessao = !ehAvulso && st.billing?.modoCobranca === "porSessao";
        if (!ehAvulso && !ehPorSessao) return;
        novos.push(ehAvulso ? novoPagamentoAvulso(st, entry.date, entry.id) : novoPagamentoPorSessao(st, entry.date, entry.id));
      });
      return novos.length ? [...p, ...novos] : p;
    });
  }, [dbReady]);
  useEffect(() => {
    if (!dbReady) return;
    const idsAgenda = new Set(agendaEntries.map((e) => e.id));
    setPagamentos((p) => {
      const limpo = p.filter((pg) => !(pg.agendaEntryId && pg.status === "previsto" && !idsAgenda.has(pg.agendaEntryId)));
      return limpo.length !== p.length ? limpo : p;
    });
  }, [agendaEntries, dbReady]);
  const [page, setPage] = useState(() => {
    try {
      sessionStorage.setItem("lv_ctx", "painel");
      localStorage.setItem("lv_ctx", JSON.stringify({ c: "painel", t: Date.now() }));
      const pg = new URLSearchParams(location.search).get("page");
      if (["dashboard", "students", "assessments"].includes(pg)) return pg;
    } catch (e) {
    }
    return "dashboard";
  });
  const [pageProps, setPageProps] = useState({});
  useEffect(() => {
    LS.set("longevus_students", students);
  }, [students]);
  useEffect(() => {
    LS.set("longevus_assessments", assessments);
  }, [assessments]);
  useEffect(() => {
    LS.set("longevus_daily", dailyLogs);
  }, [dailyLogs]);
  useEffect(() => {
    LS.set("longevus_docs", documents);
  }, [documents]);
  useEffect(() => {
    LS.set("longevus_cardio", cardioRecords);
  }, [cardioRecords]);
  useEffect(() => {
    LS.set("longevus_programs", programs);
  }, [programs]);
  useEffect(() => {
    LS.set("longevus_sessions", sessions);
  }, [sessions]);
  useEffect(() => {
    LS.set("longevus_atividades_extras", atividadesExtras);
  }, [atividadesExtras]);
  useEffect(() => {
    LS.set("longevus_professor_feedbacks", professorFeedbacks);
  }, [professorFeedbacks]);
  useEffect(() => {
    LS.set("longevus_agenda", agendaEntries);
  }, [agendaEntries]);
  useEffect(() => {
    LS.set("longevus_pagamentos", pagamentos);
  }, [pagamentos]);
  useEffect(() => {
    LS.set("longevus_receitas_extras", receitasExtras);
  }, [receitasExtras]);
  useEffect(() => {
    window.__lvAddReceita = (r) => setReceitasExtras((p) => [...p, r]);
    return () => {
      window.__lvAddReceita = null;
    };
  }, []);
  useEffect(() => {
    LS.set("longevus_leads", leads);
  }, [leads]);
  useEffect(() => {
    LS.set("longevus_condominios", condos);
  }, [condos]);
  useEffect(() => {
    LS.set("longevus_condominio_leads", condoLeads);
  }, [condoLeads]);
  useEffect(() => {
    LS.set("longevus_planos", planos);
  }, [planos]);
  const planosRef = useRef(planos);
  planosRef.current = planos;
  useEffect(() => {
    window.__lvPlanos = planos;
    window.__lvSlugPlano = (id) => {
      const lista = planosRef.current || [];
      const pl = lista.find((x) => x.id === id);
      if (!pl) return null;
      const dup = pl.slugVenda && lista.some((o) => o.id !== pl.id && o.slugVenda === pl.slugVenda);
      if (pl.slugVenda && !dup) return pl.slugVenda;
      const base = String(pl.nome || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "") || "plano";
      let novo = base, n = 2;
      while (lista.some((o) => o.id !== pl.id && o.slugVenda === novo)) novo = base + n++;
      setPlanos((p) => p.map((x) => x.id === pl.id ? { ...x, slugVenda: novo } : x));
      return novo;
    };
  }, [planos]);
  useEffect(() => {
    LS.set("longevus_contrato_modelos", contratoModelos);
  }, [contratoModelos]);
  useEffect(() => {
    if (dbReady) students.forEach((s) => DB.save("students", s.id, s));
  }, [students, dbReady]);
  useEffect(() => {
    if (dbReady) assessments.forEach((a) => DB.save("assessments", a.id, a, a.studentId));
  }, [assessments, dbReady]);
  useEffect(() => {
    if (dbReady) dailyLogs.forEach((l) => DB.save("daily_logs", l.id, l, l.studentId));
  }, [dailyLogs, dbReady]);
  useEffect(() => {
    if (dbReady) documents.forEach((d) => DB.save("documents", d.id, d, d.studentId));
  }, [documents, dbReady]);
  useEffect(() => {
    if (dbReady) cardioRecords.forEach((r) => DB.save("cardio_records", r.id, r, r.studentId));
  }, [cardioRecords, dbReady]);
  useEffect(() => {
    if (dbReady) programs.forEach((p) => DB.save("programs", p.id, p, p.studentId));
  }, [programs, dbReady]);
  useEffect(() => {
    if (dbReady) sessions.forEach((s) => DB.save("sessions", s.id, s, s.studentId));
  }, [sessions, dbReady]);
  useEffect(() => {
    if (dbReady) atividadesExtras.forEach((a) => DB.save("atividades_extras", a.id, a, a.studentId));
  }, [atividadesExtras, dbReady]);
  useEffect(() => {
    if (dbReady) professorFeedbacks.forEach((f) => DB.save("professor_feedbacks", f.id, f, f.studentId));
  }, [professorFeedbacks, dbReady]);
  useEffect(() => {
    if (dbReady) agendaEntries.forEach((e) => DB.save("agenda", e.id, e, e.studentId));
  }, [agendaEntries, dbReady]);
  useEffect(() => {
    if (dbReady) pagamentos.forEach((pg) => DB.save("pagamentos", pg.id, pg, pg.studentId));
  }, [pagamentos, dbReady]);
  useEffect(() => {
    if (dbReady) receitasExtras.forEach((r) => DB.save("receitas_extras", r.id, r));
  }, [receitasExtras, dbReady]);
  useEffect(() => {
    if (dbReady) condos.forEach((r) => DB.save("condominios", r.id, r));
  }, [condos, dbReady]);
  useEffect(() => {
    if (dbReady) condoLeads.forEach((r) => DB.save("condominio_leads", r.id, r));
  }, [condoLeads, dbReady]);
  useEffect(() => {
    if (dbReady) leads.forEach((l) => DB.save("leads", l.id, l, l.studentId || null));
  }, [leads, dbReady]);
  useEffect(() => {
    if (dbReady) planos.forEach((pl) => DB.save("planos", pl.id, pl, null));
  }, [planos, dbReady]);
  useEffect(() => {
    if (dbReady) contratoModelos.forEach((m) => DB.save("contrato_modelo", m.id, m, null));
  }, [contratoModelos, dbReady]);
  const nav = useCallback((p, props = {}) => {
    setPage(p);
    setPageProps(props);
    window.scrollTo(0, 0);
  }, []);
  const [pendingQCount, setPendingQCount] = useState(0);
  const refreshPendingCount = useCallback(async () => {
    if (!session) return;
    try {
      const headers = await DB.authHeaders();
      const r = await fetch(SUPA_URL + "/rest/v1/questionarios_pendentes?select=id&status=eq.preenchido", { headers: { ...headers, "Prefer": "count=exact" } });
      const range = r.headers.get("content-range");
      setPendingQCount(range ? parseInt(range.split("/")[1] || "0") : 0);
    } catch (e) {
    }
  }, [session]);
  useEffect(() => {
    refreshPendingCount();
  }, [session, refreshPendingCount]);
  const navItems = [
    { id: "dashboard", label: "Início", icon: "home" },
    { id: "students", label: "Alunos", icon: "users" },
    { id: "assessments", label: "Avaliações", icon: "clip" },
    { id: "extprograma", label: "Programa", icon: "zap" }
  ];
  const menuItems = [
    { id: "leads", label: "Leads", icon: "user" },
    { id: "condominios", label: "Projeto Condomínios", icon: "home" },
    { group: "Agenda", icon: "calendar", items: [
      { id: "agenda", label: "Agenda" },
      { id: "extraatividades", label: "Atividades Extras" }
    ] },
    { group: "Avaliação e Acompanhamento", icon: "clip", items: [
      { id: "questionarios", label: "Questionários" },
      { id: "daily", label: "Monitoramento" },
      { id: "reports", label: "Relatórios" }
    ] },
    { group: "Treino e Conteúdo", icon: "zap", items: [
      { id: "cognitivehub", label: "Mente Ativa" },
      { id: "extmenteativa", label: "Elo 60+" },
      { id: "extprograma", label: "Gerador de Programa" },
      { id: "extbiblioteca", label: "Biblioteca" },
      { id: "extcircuito", label: "Aulas em Circuito" },
      { id: "documents", label: "Documentos" }
    ] },
    { id: "financeiro", label: "Financeiro", icon: "money" },
    { id: "vitrine", label: "Vitrine e parceiros", icon: "star" },
    { id: "materiais", label: "Materiais de apoio", icon: "clip" },
    { id: "contrato", label: "Contrato", icon: "clip" },
    { group: "Conta", icon: "user", items: [
      { id: "vincular", label: "Vincular Alunos" },
      { id: "profile", label: "Meu Perfil" }
    ] }
  ];
  const ALL_MENU_IDS = menuItems.flatMap((m) => m.group ? m.items.map((it) => it.id) : [m.id]);
  const [menuOpen, setMenuOpen] = useState(() => {
    try {
      return new URLSearchParams(location.search).get("menu") === "1";
    } catch (e) {
      return false;
    }
  });
  const [openGroup, setOpenGroup] = useState(null);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const activePage = page === "studentDetail" ? "students" : ["dashboard", "students", "assessments", "daily", "reports", "documents", "program", "cognitivehub", "profile", "questionarios", "vincular", "extraatividades", "financeiro", "agenda", "leads", "condominios", "contrato", "materiais", "vitrine"].includes(page) ? page : null;
  if (authLoading) {
    return React.createElement("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 14 } }, "Carregando...");
  }
  if (recoveryMode) {
    return React.createElement(ResetPassword, { onDone: () => {
      setRecoveryMode(false);
    } });
  }
  if (!session) {
    return React.createElement(Login, { onLogin: () => {
    } });
  }
  if (!billing) {
    return React.createElement("div", { style: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 14 } }, "Carregando...");
  }
  const trialEnd = billing.trial_ends_at ? new Date(billing.trial_ends_at) : null;
  const trialExpired = billing.plano === "trial" && trialEnd && trialEnd.getTime() < Date.now();
  const accountBlocked = billing.status_assinatura === "cancelado" || trialExpired;
  const trialDaysLeft = !trialExpired && billing.plano === "trial" && trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / 864e5) : null;
  if (billing.aluno) {
    return React.createElement(ContaDeAluno, { email: session?.user?.email });
  }
  if (accountBlocked) {
    return React.createElement(TrialExpired, { email: session?.user?.email });
  }
  const notifItems = [
    ...checkins.map((c) => ({ id: "ck_" + c.id, ts: c.created_at, kind: "checkin", checkin: c })),
    ...students.filter((s) => s.createdAt).map((s) => ({ id: "new_" + s.id, ts: s.createdAt + "T00:00:00.000Z", kind: "novo_aluno", student: s })),
    ...pendenciasLogin.map((p) => ({ id: "pend_" + p.user_id, ts: p.created_at, kind: "pendencia", pendencia: p }))
  ].sort((a, b) => (b.ts || "").localeCompare(a.ts || "")).slice(0, 15);
  const notifCount = notifItems.filter((n) => n.ts && n.ts > checkinsSeenAt).length;
  return React.createElement(React.Fragment, null, showSubscribe && React.createElement(SubscribeModal, { onClose: () => setShowSubscribe(false) }), React.createElement("style", null, `*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#0f172a;}input,select,textarea{font-family:inherit;}input:focus,select:focus{outline:none;border-color:#FF5603!important;box-shadow:0 0 0 3px #FF560318;}::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:99px;}details>summary{list-style:none;}details>summary::-webkit-details-marker{display:none;}@media print{.no-print{display:none!important;}body{background:white!important;}nav{display:none!important;}}`), React.createElement("div", { style: { minHeight: "100vh", paddingBottom: 80 } }, React.createElement("div", { className: "no-print", style: { background: "#fff", borderBottom: "1.5px solid #e2e8f0", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, React.createElement("img", { src: __LOGO_2__, alt: "Longevus", style: { height: 38, width: "auto" } }), logoUrl && React.createElement("img", { src: logoUrl, alt: "", style: { width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: "1.5px solid #e2e8f0" } }), profName && React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: "#0f172a" } }, profName)), React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 10 } }, React.createElement("span", null, syncing ? "☁️ Sincronizando..." : students.filter((s) => (s.status || "ativo") === "ativo").length + " aluno(s)"), React.createElement("div", { style: { position: "relative" } }, React.createElement("button", { onClick: () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening) {
      const now = (new Date()).toISOString();
      setCheckinsSeenAt(now);
      LS.set("longevus_checkins_seen_at", now);
    }
  }, style: { border: "none", background: "transparent", cursor: "pointer", padding: 6, position: "relative", display: "flex", alignItems: "center" } }, React.createElement(I, { n: "bell", c: "#475569", s: 19 }), notifCount > 0 && React.createElement("span", { style: { position: "absolute", top: 2, right: 2, minWidth: 15, height: 15, borderRadius: 99, background: "#dc2626", color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" } }, notifCount)), notifOpen && React.createElement(React.Fragment, null, React.createElement("div", { onClick: () => setNotifOpen(false), style: { position: "fixed", inset: 0, zIndex: 199 } }), React.createElement("div", { style: { position: "absolute", top: "calc(100% + 8px)", right: 0, width: 320, maxHeight: 420, overflowY: "auto", background: "#fff", borderRadius: 14, boxShadow: "0 12px 32px rgba(0,0,0,0.18)", border: "1.5px solid #e2e8f0", zIndex: 200 } }, React.createElement("div", { style: { padding: "12px 14px", fontWeight: 800, fontSize: 13, borderBottom: "1px solid #f1f5f9", color: "#0f172a" } }, "Notificações"), notifItems.length === 0 ? React.createElement("div", { style: { padding: 20, textAlign: "center", fontSize: 12, color: "#94a3b8" } }, "Nenhuma notificação ainda.") : notifItems.map((n) => {
    if (n.kind === "novo_aluno") {
      const s = n.student;
      const dt2 = n.ts ? new Date(n.ts) : null;
      const dtLabel2 = dt2 ? dt2.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : "";
      return React.createElement("div", { key: n.id, onClick: () => {
        setNotifOpen(false);
        nav("studentDetail", { studentId: s.id });
      }, style: { padding: "11px 14px", borderBottom: "1px solid #f8fafc", cursor: "pointer", display: "flex", gap: 8, alignItems: "flex-start" } }, React.createElement("div", { style: { width: 7, height: 7, borderRadius: 99, background: "#16a34a", marginTop: 5, flexShrink: 0 } }), React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 12.5, color: "#0f172a" } }, "🎓 Novo aluno: ", s.name), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, "Cadastrado · ", dtLabel2)));
    }
    if (n.kind === "pendencia") {
      const p = n.pendencia;
      const dt2 = n.ts ? new Date(n.ts) : null;
      const dtLabel2 = dt2 ? dt2.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " + dt2.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
      return React.createElement("div", { key: n.id, onClick: () => {
        setNotifOpen(false);
        nav("vincular");
      }, style: { padding: "11px 14px", borderBottom: "1px solid #f8fafc", cursor: "pointer", display: "flex", gap: 8, alignItems: "flex-start", background: "#fffbeb" } }, React.createElement("div", { style: { width: 7, height: 7, borderRadius: 99, background: "#d97706", marginTop: 5, flexShrink: 0 } }), React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 12.5, color: "#0f172a" } }, "🔔 Login sem vínculo: ", p.email), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, "Criou conta · ", dtLabel2, " · toque pra vincular")));
    }
    const c = n.checkin;
    const d = c.data || {};
    const stName = (students.find((s) => s.id === c.student_id) || {}).name || "Aluno";
    const isPre = c.type === "pre_treino";
    const alerta = !isPre && (d.dor === "alta" || d.dor === "moderada" || d.completude === "nao");
    const dt = c.created_at ? new Date(c.created_at) : null;
    const dtLabel = dt ? dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " + dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
    return React.createElement("div", { key: n.id, onClick: () => {
      setNotifOpen(false);
      nav("studentDetail", { studentId: c.student_id, initialTab: "checkin" });
    }, style: { padding: "11px 14px", borderBottom: "1px solid #f8fafc", cursor: "pointer", display: "flex", gap: 8, alignItems: "flex-start", background: alerta ? "#fffbfa" : "#fff" } }, React.createElement("div", { style: { width: 7, height: 7, borderRadius: 99, background: alerta ? "#dc2626" : isPre ? "#3b82f6" : O, marginTop: 5, flexShrink: 0 } }), React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 12.5, color: "#0f172a" } }, stName), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, isPre ? "Antes do treino" : "Depois do treino", " · ", dtLabel), alerta && React.createElement("div", { style: { fontSize: 11, color: "#dc2626", fontWeight: 700, marginTop: 2 } }, "⚠️ ", d.completude === "nao" ? "Não completou o treino" : "Dor " + d.dor)));
  })))), React.createElement("button", { onClick: () => supa.auth.signOut({ scope: "local" }), style: { border: "none", background: "transparent", color: "#94a3b8", fontSize: 12, cursor: "pointer", textDecoration: "underline" } }, "Sair"))), trialDaysLeft !== null && trialDaysLeft <= 3 && React.createElement("div", { className: "no-print", style: { background: "#fff7ed", borderBottom: "1.5px solid #fed7aa", padding: "8px 18px", textAlign: "center", fontSize: 12, color: "#c2410c", fontWeight: 600 } }, trialDaysLeft <= 0 ? "Seu teste expira hoje." : "Seu teste expira em " + trialDaysLeft + " dia" + (trialDaysLeft > 1 ? "s" : "") + ".", " ", React.createElement("a", { href: "#", onClick: (e) => {
    e.preventDefault();
    setShowSubscribe(true);
  }, style: { color: "#c2410c", textDecoration: "underline" } }, "Ativar plano")), React.createElement("div", { style: { padding: "20px 16px", maxWidth: 640, margin: "0 auto" } }, page === "dashboard" && React.createElement(Dashboard, { students, setStudents, setLeads, assessments, dailyLogs, pagamentos, receitasExtras, nav, programs, pendenciasLogin, pendingQCount }), page === "students" && React.createElement(Students, { key: pageProps.novo ? "novo" : "lista", students, setStudents, planos, setPagamentos, nav, abrirNovo: pageProps.novo }), page === "studentDetail" && React.createElement(StudentDetail, { studentId: pageProps.studentId, students, setStudents, assessments, setAssessments, programs, setPrograms, dailyLogs, documents, checkins, sessions, setSessions, exerciciosBiblioteca, planos, professorFeedbacks, setProfessorFeedbacks, agendaEntries, setAgendaEntries, pagamentos, setPagamentos, ultimoAcesso, initialTab: pageProps.initialTab, nav }), page === "assessments" && React.createElement(AssessmentsList, { assessments, students, setAssessments, nav }), page === "newAssessment" && React.createElement(NewAssessment, { students, setAssessments, nav, prefillStudentId: pageProps.studentId }), page === "result" && React.createElement(Result, { assessmentId: pageProps.id, assessments, setAssessments, students, nav }), page === "daily" && React.createElement(Daily, { students, assessments, dailyLogs, setDailyLogs, cardioRecords, setCardioRecords, prefillStudentId: pageProps.studentId }), page === "reports" && React.createElement(Reports, { pre: pageProps, students, assessments, setAssessments, dailyLogs, sessions, nav }), page === "documents" && React.createElement(Documents, { students, documents, setDocuments, prefillStudentId: pageProps.studentId }), page === "questionarios" && React.createElement(Questionarios, { students, nav, onRefreshCount: refreshPendingCount }), page === "extprograma" && (() => {
    window.open("longevus-programa.html", "_self");
    return null;
  })(), page === "cognitivehub" && React.createElement(CognitiveHub, { students, hubResults, setHubResults }), page === "sessions" && React.createElement(SessionTracker, { students, programs, sessions, setSessions, nav }), page === "vincular" && React.createElement(VincularAlunos, { students, setStudents }), page === "extraatividades" && React.createElement(AtividadesExtras, { students, atividadesExtras, setAtividadesExtras, prefillStudentId: pageProps.studentId, assessments, checkins, exerciciosBiblioteca, sessions }), page === "financeiro" && React.createElement(Financeiro, { students, setStudents, planos, setPlanos, pagamentos, setPagamentos, receitasExtras, setReceitasExtras, nav, agendaEntries }), page === "agenda" && React.createElement(Agenda, { students, setStudents, agendaEntries, setAgendaEntries, pagamentos, setPagamentos, leads, nav }), page === "leads" && React.createElement(Leads, { leads, setLeads, students, setStudents, agendaEntries, setAgendaEntries, nav }), page === "condominios" && (window.ProjetoCondominios ? React.createElement(window.ProjetoCondominios.Page, { session, condos, setCondos, condoLeads, setCondoLeads, students, setStudents, nav, pageProps, deps: { Card, Btn, Inp, Modal, Badge, I, O, DB, uid, fmt, fmtR, SUPA_URL } }) : React.createElement(Card, null, React.createElement("div", { style: { fontSize: 13, color: "#64748b" } }, "O módulo Projeto Condomínios ainda não carregou. Confirme que o arquivo longevus-condominios.js está no mesmo endereço do app e recarregue."))), page === "contrato" && React.createElement(Contrato, { students, setStudents, contratoModelos, setContratoModelos, contratoAssinaturas, nav }), page === "profile" && React.createElement(Profile, { session, onLogoChange: setLogoUrl, nav }), page === "materiais" && (window.LongevusMateriais ? React.createElement(window.LongevusMateriais.Page, { session }) : React.createElement("div", { style: { padding: 24, color: "#94a3b8", fontSize: 14 } }, "Carregando materiais...")), page === "vitrine" && (window.LongevusVitrine ? React.createElement(window.LongevusVitrine.Painel, { profNome: "Wellington Brito", students, setStudents, nav }) : React.createElement(Card, { style: { textAlign: "center", padding: 32, color: "#94a3b8" } }, "Carregando a vitrine...")))), React.createElement("div", { className: "no-print", style: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1.5px solid #e2e8f0", display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" } }, navItems.map((n) => React.createElement("button", { key: n.id, onClick: () => {
    if (n.id === "extprograma") {
      window.open("longevus-programa.html", "_self");
      return;
    }
    if (n.id === "extbiblioteca") {
      window.open("longevus-biblioteca.html", "_self");
      return;
    }
    if (n.id === "extcircuito") {
      window.open("longevus-circuito.html", "_self");
      return;
    }
    if (n.id === "cognitivehub") {
      window.open("longevus-hub.html", "_self");
      return;
    }
    nav(n.id);
    setMenuOpen(false);
  }, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: "9px 4px 8px", border: "none", background: "transparent", cursor: "pointer", color: activePage === n.id ? "#FF5603" : "#94a3b8" } }, React.createElement(I, { n: n.icon, s: 21, c: activePage === n.id ? "#FF5603" : "#94a3b8" }), React.createElement("span", { style: { fontSize: 10, fontWeight: activePage === n.id ? 700 : 500 } }, n.label))), React.createElement("button", { onClick: () => setMenuOpen((o) => {
    const next = !o;
    if (next) {
      const g = menuItems.find((m) => m.group && m.items.some((it) => it.id === activePage));
      setOpenGroup(g ? g.group : null);
    }
    return next;
  }), style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: "9px 4px 8px", border: "none", background: "transparent", cursor: "pointer", color: menuOpen || ALL_MENU_IDS.includes(activePage) ? "#FF5603" : "#94a3b8", position: "relative" } }, React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "center", justifyContent: "center" } }, React.createElement("div", { style: { width: 18, height: 2, borderRadius: 2, background: menuOpen || ALL_MENU_IDS.includes(activePage) ? "#FF5603" : "#94a3b8", transition: "background 0.2s" } }), React.createElement("div", { style: { width: 18, height: 2, borderRadius: 2, background: menuOpen || ALL_MENU_IDS.includes(activePage) ? "#FF5603" : "#94a3b8", transition: "background 0.2s" } }), React.createElement("div", { style: { width: 18, height: 2, borderRadius: 2, background: menuOpen || ALL_MENU_IDS.includes(activePage) ? "#FF5603" : "#94a3b8", transition: "background 0.2s" } })), React.createElement("span", { style: { fontSize: 10, fontWeight: menuOpen || ALL_MENU_IDS.includes(activePage) ? 700 : 500 } }, "Mais"), menuOpen && React.createElement("div", { style: { position: "absolute", bottom: "100%", right: 0, background: "#fff", borderRadius: "14px 14px 0 14px", boxShadow: "0 -4px 24px #0000001a", border: "1.5px solid #f1f5f9", minWidth: 220, maxHeight: "70vh", overflowY: "auto", zIndex: 999, overflowX: "hidden" } }, menuItems.map((m) => {
    if (m.group) {
      const isOpenG = openGroup === m.group;
      const hasActive = m.items.some((it) => it.id === activePage);
      return React.createElement("div", { key: m.group }, React.createElement("button", { onClick: (e) => {
        e.stopPropagation();
        setOpenGroup((o) => o === m.group ? null : m.group);
      }, style: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", border: "none", background: hasActive ? "#fff4ee" : "#fff", cursor: "pointer", borderBottom: "1px solid #f8fafc" } }, React.createElement(I, { n: m.icon, s: 18, c: hasActive ? "#FF5603" : "#64748b" }), React.createElement("span", { style: { fontSize: 14, fontWeight: hasActive ? 700 : 500, color: hasActive ? "#FF5603" : "#0f172a", flex: 1, textAlign: "left" } }, m.group), React.createElement("span", { style: { display: "inline-flex", transform: isOpenG ? "rotate(90deg)" : "rotate(-90deg)", transition: "transform 0.2s" } }, React.createElement(I, { n: "back", s: 13, c: "#94a3b8" }))), isOpenG && React.createElement("div", { style: { background: "#fafbfc" } }, m.items.map((it) => {
        const isActive2 = activePage === it.id;
        return React.createElement("button", { key: it.id, onClick: (e) => {
          e.stopPropagation();
          if (it.id === "extprograma") {
            window.open("longevus-programa.html", "_self");
            return;
          }
          if (it.id === "extbiblioteca") {
            window.open("longevus-biblioteca.html", "_self");
            return;
          }
          if (it.id === "extcircuito") {
            window.open("longevus-circuito.html", "_self");
            return;
          }
          if (it.id === "extmenteativa") {
            window.open("elo60-painel.html", "_self");
            return;
          }
          nav(it.id);
          setMenuOpen(false);
        }, style: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 18px 12px 48px", border: "none", background: isActive2 ? "#fff4ee" : "#fafbfc", cursor: "pointer", borderBottom: "1px solid #f1f5f9" } }, React.createElement("span", { style: { fontSize: 13, fontWeight: isActive2 ? 700 : 500, color: isActive2 ? "#FF5603" : "#334155" } }, it.label), it.id === "questionarios" && pendingQCount > 0 && React.createElement("span", { style: { marginLeft: "auto", background: "#dc2626", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 99, padding: "2px 7px" } }, pendingQCount), isActive2 && React.createElement("div", { style: { width: 6, height: 6, borderRadius: 99, background: "#FF5603", marginLeft: it.id === "questionarios" && pendingQCount > 0 ? 8 : "auto" } }));
      })));
    }
    const isActive = activePage === m.id;
    return React.createElement("button", { key: m.id, onClick: (e) => {
      e.stopPropagation();
      nav(m.id);
      setMenuOpen(false);
    }, style: { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", border: "none", background: isActive ? "#fff4ee" : "#fff", cursor: "pointer", borderBottom: "1px solid #f8fafc" } }, React.createElement(I, { n: m.icon, s: 18, c: isActive ? "#FF5603" : "#64748b" }), React.createElement("span", { style: { fontSize: 14, fontWeight: isActive ? 700 : 500, color: isActive ? "#FF5603" : "#0f172a" } }, m.label), isActive && React.createElement("div", { style: { width: 6, height: 6, borderRadius: 99, background: "#FF5603", marginLeft: "auto" } }));
  })))));
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App, null));
const CognitiveHub = ({ students, hubResults, setHubResults }) => {
  const [selSt, setSelSt] = useState("");
  const st = students.find((s) => s.id === selSt);
  const stResults = (hubResults || []).filter((r) => r.studentId === selSt).sort((a, b) => (b.savedAt || "").localeCompare(a.savedAt || ""));
  const gameLabels = { cartas: "🃏 Cartas Neurofuncionais", sequencia: "🔢 Sequência Numérica", genio: "🎨 Gênio das Cores", pares: "🃏 Memória de Pares", padroes: "🔲 Copiar Padrões", caca: "🔍 Caça-Palavras", listar: "📋 Listar Palavras", completar: "🔤 Completar Letra" };
  return React.createElement("div", null, React.createElement("div", { style: { fontWeight: 800, fontSize: 20, marginBottom: 18 } }, "🧠 Hub Cognitivo"), React.createElement(Card, { style: { marginBottom: 14, background: "linear-gradient(135deg,#1A2340,#2d3a5c)", border: "none" } }, React.createElement("div", { style: { textAlign: "center", padding: "24px 16px" } }, React.createElement("div", { style: { fontSize: 48, marginBottom: 12 } }, "🧠"), React.createElement("div", { style: { fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 8 } }, "Hub Cognitivo Longevus"), React.createElement("div", { style: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 20, lineHeight: 1.6 } }, "Jogos cognitivos, cartas neurofuncionais e biblioteca de exercícios para 50+"), React.createElement("a", { href: "longevus-hub.html", target: "_blank", rel: "noopener noreferrer", style: { display: "inline-block", background: "#FF5603", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 28px", borderRadius: 12, textDecoration: "none" } }, "🚀 Abrir Hub Cognitivo"))), React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 12 } }, "📚 O que tem no Hub"), [
    { icon: "🃏", label: "Jogo de Cartas Neurofuncional", desc: "40 cartas · 4 categorias · nível progressivo" },
    { icon: "🎮", label: "Jogos Cognitivos Interativos", desc: "Sequência, Gênio das Cores, Memória de Pares, Copiar Padrões" },
    { icon: "✍️", label: "Atividades Cognitivas Escritas", desc: "Caça-Palavras, Listar Palavras, Completar Letra" },
    { icon: "📚", label: "Biblioteca de Exercícios Físicos", desc: "28 exercícios × 14 patologias" }
  ].map((item, i) => React.createElement("div", { key: i, style: { display: "flex", gap: 12, padding: "10px 0", borderBottom: i < 3 ? "1px solid #f1f5f9" : "none" } }, React.createElement("span", { style: { fontSize: 22, flexShrink: 0 } }, item.icon), React.createElement("div", null, React.createElement("div", { style: { fontWeight: 700, fontSize: 13 } }, item.label), React.createElement("div", { style: { fontSize: 12, color: "#94a3b8", marginTop: 2 } }, item.desc))))), React.createElement(Card, { style: { marginBottom: 14 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 12 } }, "📊 Histórico de Jogos"), React.createElement(Inp, { label: "Aluno", value: selSt, onChange: setSelSt, opts: [{ v: "", l: "Selecione..." }, ...students.map((s) => ({ v: s.id, l: s.name }))] }), selSt && (stResults.length === 0 ? React.createElement("div", { style: { fontSize: 13, color: "#94a3b8", marginTop: 12, textAlign: "center" } }, "Nenhum jogo ainda. Abra o Hub para começar!") : stResults.slice(0, 15).map((r, i) => React.createElement("div", { key: r.id || i, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f1f5f9" } }, React.createElement("div", null, React.createElement("div", { style: { fontWeight: 600, fontSize: 13 } }, gameLabels[r.gameId] || r.gameId), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, fmt(r.date || r.savedAt))), r.score !== void 0 && React.createElement("div", { style: { fontWeight: 900, fontSize: 18, color: "#FF5603" } }, r.score))))));
};
const qAnamneseFields = [["pathologies", "Doenças diagnosticadas"], ["medications", "Medicamentos em uso"], ["allergies", "Alergias"], ["surgeries", "Cirurgias anteriores"], ["physActivityHistory", "Histórico de atividade física"], ["physActivityType", "Modalidade(s)"], ["physActivityFreq", "Frequência semanal"], ["sleepHours", "Horas de sono"], ["sleepQuality", "Qualidade do sono"], ["dietQuality", "Qualidade da alimentação"], ["stressLevel", "Nível de estresse"], ["smoking", "Tabagismo"], ["alcohol", "Consumo de álcool"], ["mainComplaints", "Queixas principais"], ["painLocation", "Localização de dores"], ["goals", "Objetivos"], ["observations", "Observações"]];
const qParqLabels = ["Médico já disse que tem problema cardíaco?", "Sente dor no peito durante esforço físico?", "Sentiu dor no peito no último mês (sem esforço)?", "Perde equilíbrio por tontura ou já desmaiou?", "Tem problema ósseo/articular que piora com exercício?", "Toma medicamento para pressão ou coração?", "Existe outro motivo para não se exercitar?"];
const qAvdLabels = { eating: "Alimentação", bathing: "Banho", dressing: "Vestuário", toileting: "Higiene pessoal", transferring: "Transferência" };
const qAivdLabels = { shopping: "Compras", finance: "Finanças", transport: "Transporte", medication: "Medicação", housework: "Tarefas domésticas", telephone: "Telefone/celular" };
const qScaleLabel = (v) => v === 2 ? "Independente" : v === 1 ? "Com ajuda" : "Dependente";
const fmtDT = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  return isNaN(d) ? "—" : d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};
const Questionarios = ({ students, nav, onRefreshCount }) => {
  const [items, setItems] = useState(null);
  const [detail, setDetail] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const load = async () => {
    try {
      const headers = await DB.authHeaders();
      const r = await fetch(SUPA_URL + "/rest/v1/questionarios_pendentes?select=*&status=in.(preenchido,revisado)&order=created_at.desc&limit=50", { headers });
      const rows = r.ok ? await r.json() : [];
      setItems(rows);
    } catch (e) {
      setItems([]);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const studentFor = (id) => students.find((s) => s.id === id);
  const approve = async (item) => {
    setBusyId(item.id);
    try {
      LS.set("longevus_prefill_" + item.aluno_id, item.respostas);
      const headers = await DB.authHeaders();
      await fetch(SUPA_URL + "/rest/v1/questionarios_pendentes?id=eq." + item.id, {
        method: "PATCH",
        headers: { ...headers, "Prefer": "return=minimal" },
        body: JSON.stringify({ status: "revisado", reviewed_at: (new Date()).toISOString() })
      });
      await load();
      onRefreshCount && onRefreshCount();
      nav("newAssessment", { studentId: item.aluno_id });
    } catch (e) {
      window.alert("Erro ao aprovar. Tente novamente.");
    }
    setBusyId(null);
  };
  const discard = async (item) => {
    if (!window.confirm("Descartar este questionário? Essa ação não pode ser desfeita.")) return;
    setBusyId(item.id);
    try {
      const headers = await DB.authHeaders();
      await fetch(SUPA_URL + "/rest/v1/questionarios_pendentes?id=eq." + item.id, { method: "DELETE", headers });
      await load();
      onRefreshCount && onRefreshCount();
    } catch (e) {
      window.alert("Erro ao descartar.");
    }
    setBusyId(null);
  };
  if (items === null) {
    return React.createElement("div", { style: { fontWeight: 800, fontSize: 20, marginBottom: 18 } }, "Questionários");
  }
  const pending = items.filter((i) => i.status === "preenchido");
  const reviewed = items.filter((i) => i.status === "revisado");
  return React.createElement("div", null, React.createElement("div", { style: { fontWeight: 800, fontSize: 20, marginBottom: 6 } }, "Questionários"), React.createElement("div", { style: { fontSize: 13, color: "#64748b", marginBottom: 18 } }, "Respostas enviadas pelos alunos antes da avaliação presencial."), pending.length === 0 && reviewed.length === 0 && React.createElement(Card, { style: { textAlign: "center", padding: 40 } }, React.createElement(I, { n: "inbox", c: "#cbd5e1", s: 36 }), React.createElement("div", { style: { color: "#94a3b8", marginTop: 10 } }, "Nenhum questionário recebido ainda.")), pending.length > 0 && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", marginBottom: 10 } }, "Pendentes de revisão (", pending.length, ")"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 } }, pending.map((item) => {
    const st = studentFor(item.aluno_id);
    return React.createElement(Card, { key: item.id, style: { padding: "14px 16px" } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 10 } }, React.createElement("div", { style: { width: 40, height: 40, borderRadius: 11, background: "#fff4ee", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: O, flexShrink: 0 } }, st?.name?.[0]?.toUpperCase() || "?"), React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, st?.name || "Aluno não encontrado"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, "Enviado em ", fmtDT(item.filled_at || item.created_at)))), React.createElement("div", { style: { display: "flex", gap: 8 } }, React.createElement(Btn, { sm: true, variant: "secondary", full: true, onClick: () => setDetail(item) }, "Ver Respostas"), React.createElement(Btn, { sm: true, full: true, disabled: busyId === item.id, onClick: () => approve(item) }, busyId === item.id ? "..." : "Aprovar e Importar")), React.createElement("div", { style: { marginTop: 8, textAlign: "center" } }, React.createElement("button", { onClick: () => discard(item), style: { background: "none", border: "none", color: "#dc2626", fontSize: 12, cursor: "pointer" } }, "Descartar")));
  }))), reviewed.length > 0 && React.createElement(React.Fragment, null, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#94a3b8", marginBottom: 10 } }, "Já importados"), React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, reviewed.map((item) => {
    const st = studentFor(item.aluno_id);
    return React.createElement(Card, { key: item.id, style: { padding: "12px 16px", opacity: 0.7 } }, React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } }, React.createElement("div", { style: { width: 36, height: 36, borderRadius: 10, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#94a3b8", flexShrink: 0 } }, st?.name?.[0]?.toUpperCase() || "?"), React.createElement("div", { style: { flex: 1, minWidth: 0 } }, React.createElement("div", { style: { fontWeight: 600, fontSize: 13 } }, st?.name || "Aluno não encontrado"), React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, "Importado em ", fmtDT(item.reviewed_at))), React.createElement("button", { onClick: () => setDetail(item), style: { background: "none", border: "none", color: "#64748b", fontSize: 12, cursor: "pointer" } }, "Ver")));
  }))), detail && React.createElement(Modal, { title: studentFor(detail.aluno_id)?.name || "Respostas", onClose: () => setDetail(null) }, React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", marginBottom: 10, paddingBottom: 6, borderBottom: "1.5px solid #fff4ee" } }, "🏥 Saúde e Hábitos"), qAnamneseFields.map(([k, l]) => {
    const v = detail.respostas?.anamnese?.[k];
    if (!v) return null;
    return React.createElement("div", { key: k, style: { marginBottom: 8 } }, React.createElement("div", { style: { fontSize: 11, color: "#94a3b8" } }, l), React.createElement("div", { style: { fontSize: 13, color: "#334155" } }, v));
  }), React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", marginBottom: 10, marginTop: 14, paddingBottom: 6, borderBottom: "1.5px solid #fff4ee" } }, "❓ PAR-Q"), qParqLabels.map((l, i) => {
    const v = detail.respostas?.parq?.["q" + (i + 1)];
    return React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 } }, React.createElement("span", { style: { fontSize: 12, color: "#475569", flex: 1 } }, l), React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: v ? "#dc2626" : "#16a34a" } }, v === null || v === void 0 ? "—" : v ? "SIM" : "NÃO"));
  }), React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", marginBottom: 10, marginTop: 14, paddingBottom: 6, borderBottom: "1.5px solid #fff4ee" } }, "🏠 AVDs"), Object.entries(qAvdLabels).map(([k, l]) => React.createElement("div", { key: k, style: { display: "flex", justifyContent: "space-between", marginBottom: 6 } }, React.createElement("span", { style: { fontSize: 12, color: "#475569" } }, l), React.createElement("span", { style: { fontSize: 12, fontWeight: 700 } }, qScaleLabel(detail.respostas?.avd?.[k])))), React.createElement("div", { style: { fontWeight: 700, fontSize: 13, color: "#FF5603", marginBottom: 10, marginTop: 14, paddingBottom: 6, borderBottom: "1.5px solid #fff4ee" } }, "🚌 AIVDs"), Object.entries(qAivdLabels).map(([k, l]) => React.createElement("div", { key: k, style: { display: "flex", justifyContent: "space-between", marginBottom: 6 } }, React.createElement("span", { style: { fontSize: 12, color: "#475569" } }, l), React.createElement("span", { style: { fontSize: 12, fontWeight: 700 } }, qScaleLabel(detail.respostas?.aivd?.[k])))), React.createElement("div", { style: { marginTop: 16 } }, React.createElement(Btn, { full: true, variant: "secondary", onClick: () => setDetail(null) }, "Fechar"))));
};
