// Edge Function: analisar-refeicao
// Recebe uma foto (base64) e/ou uma descrição em texto e devolve a estimativa
// de alimentos, calorias e macros usando o plano gratuito do Gemini.
// A foto só passa pela memória desta função: não é salva em lugar nenhum.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODELOS = [
  Deno.env.get("GEMINI_MODEL") || "",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
].filter((m, i, arr) => m && arr.indexOf(m) === i);

const INSTRUCOES = `Você é um assistente de registro alimentar de um app de treino no Brasil.
Identifique os alimentos e bebidas da refeição e estime a porção de cada um em gramas (ou ml para líquidos).
Use como referência a Tabela Brasileira de Composição de Alimentos (TACO) e preparos comuns no Brasil.
Considere óleo e temperos visíveis. Não invente itens que não estão presentes.
Responda SOMENTE com JSON neste formato:
{"itens":[{"nome":"Arroz branco cozido","gramas":120,"kcal":154,"prot":3.0,"carb":33.8,"gord":0.3,"fibra":1.9}],"observacao":"frase curta opcional"}
Todos os números são o total daquela porção (não por 100 g). Use ponto como separador decimal.
Se não houver comida identificável, responda {"itens":[],"observacao":"Não identifiquei alimentos."}`;

const num = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 10) / 10 : 0;
};

const resposta = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return resposta({ erro: "Método não permitido" }, 405);

  const chave = Deno.env.get("GEMINI_API_KEY");
  if (!chave) return resposta({ erro: "Chave GEMINI_API_KEY não configurada na função." }, 500);

  let entrada: { imagem?: string; mime?: string; texto?: string; tipo?: string };
  try { entrada = await req.json(); } catch { return resposta({ erro: "Corpo inválido" }, 400); }

  const imagem = (entrada.imagem || "").trim();
  const texto = (entrada.texto || "").trim().slice(0, 600);
  if (!imagem && !texto) return resposta({ erro: "Envie uma foto ou uma descrição." }, 400);
  if (imagem.length > 4_500_000) return resposta({ erro: "Foto muito grande." }, 413);

  const partes: unknown[] = [{ text: INSTRUCOES }];
  if (entrada.tipo) partes.push({ text: "Refeição: " + String(entrada.tipo).slice(0, 40) });
  if (texto) partes.push({ text: (imagem ? "Observação do aluno sobre a foto: " : "Descrição da refeição: ") + texto });
  if (imagem) partes.push({ inline_data: { mime_type: entrada.mime || "image/jpeg", data: imagem } });

  const corpo = JSON.stringify({
    contents: [{ role: "user", parts: partes }],
    generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
  });

  let ultimoErro = "";
  for (const modelo of MODELOS) {
    try {
      const r = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + modelo + ":generateContent",
        { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": chave }, body: corpo },
      );
      if (!r.ok) {
        ultimoErro = modelo + ": HTTP " + r.status;
        if (r.status === 404 || r.status === 429 || r.status >= 500) continue;
        const t = await r.text();
        return resposta({ erro: "Falha na análise (" + r.status + ")", detalhe: t.slice(0, 300) }, 502);
      }
      const j = await r.json();
      const txt = (j?.candidates?.[0]?.content?.parts || []).map((p: { text?: string }) => p.text || "").join("");
      const limpo = txt.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
      const dados = JSON.parse(limpo);
      const itens = (Array.isArray(dados?.itens) ? dados.itens : []).slice(0, 20).map((i: Record<string, unknown>) => ({
        nome: String(i.nome || "Alimento").slice(0, 60),
        gramas: num(i.gramas),
        kcal: Math.round(num(i.kcal)),
        prot: num(i.prot),
        carb: num(i.carb),
        gord: num(i.gord),
        fibra: num(i.fibra),
      }));
      return resposta({ itens, observacao: String(dados?.observacao || "").slice(0, 200), modelo });
    } catch (e) {
      ultimoErro = modelo + ": " + (e instanceof Error ? e.message : String(e));
    }
  }
  return resposta({ erro: "Serviço de análise indisponível agora. Tente de novo em alguns minutos.", detalhe: ultimoErro }, 503);
});
