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

  const ESQUEMA = {
    type: "OBJECT",
    properties: {
      itens: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            nome: { type: "STRING" }, gramas: { type: "NUMBER" }, kcal: { type: "NUMBER" },
            prot: { type: "NUMBER" }, carb: { type: "NUMBER" }, gord: { type: "NUMBER" }, fibra: { type: "NUMBER" },
          },
          required: ["nome", "gramas", "kcal", "prot", "carb", "gord", "fibra"],
        },
      },
      observacao: { type: "STRING" },
    },
    required: ["itens"],
  };
  const montarCorpo = (comEsquema: boolean) => JSON.stringify({
    contents: [{ role: "user", parts: partes }],
    generationConfig: comEsquema
      ? { temperature: 0.2, responseMimeType: "application/json", responseSchema: ESQUEMA }
      : { temperature: 0.2, responseMimeType: "application/json" },
  });

  // Aceita variações de formato que o modelo às vezes usa.
  const campo = (o: Record<string, unknown>, nomes: string[]) => {
    for (const n of nomes) if (o[n] !== undefined && o[n] !== null && o[n] !== "") return o[n];
    return undefined;
  };
  const extrairLista = (dados: unknown): Record<string, unknown>[] => {
    if (Array.isArray(dados)) return dados as Record<string, unknown>[];
    if (dados && typeof dados === "object") {
      const o = dados as Record<string, unknown>;
      const direto = campo(o, ["itens", "items", "alimentos", "foods", "food_items", "ingredientes"]);
      if (Array.isArray(direto)) return direto as Record<string, unknown>[];
      for (const v of Object.values(o)) {
        if (Array.isArray(v) && v.length && typeof v[0] === "object") return v as Record<string, unknown>[];
        if (v && typeof v === "object" && !Array.isArray(v)) { const dentro = extrairLista(v); if (dentro.length) return dentro; }
      }
    }
    return [];
  };
  const extrairJSON = (txt: string) => {
    const limpo = txt.replace(/```(json)?/gi, "").trim();
    try { return JSON.parse(limpo); } catch (_) { /* tenta recortar */ }
    const ini = Math.min(...["{", "["].map((c) => { const i = limpo.indexOf(c); return i < 0 ? Infinity : i; }));
    const fim = Math.max(limpo.lastIndexOf("}"), limpo.lastIndexOf("]"));
    if (ini === Infinity || fim <= ini) throw new Error("Resposta sem JSON");
    return JSON.parse(limpo.slice(ini, fim + 1));
  };

  let ultimoErro = "";
  for (const modelo of MODELOS) {
    for (const comEsquema of [true, false]) {
      try {
        const r = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/" + modelo + ":generateContent",
          { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": chave }, body: montarCorpo(comEsquema) },
        );
        if (!r.ok) {
          const t = await r.text();
          ultimoErro = modelo + ": HTTP " + r.status + " " + t.slice(0, 200);
          if (r.status === 400 && comEsquema) continue; // tenta o mesmo modelo sem esquema
          if (r.status === 404 || r.status === 429 || r.status >= 500) break; // próximo modelo
          return resposta({ erro: "Falha na análise (" + r.status + ")", detalhe: t.slice(0, 300) }, 502);
        }
        const j = await r.json();
        const partesResp = (j?.candidates?.[0]?.content?.parts || []) as { text?: string; thought?: boolean }[];
        const txt = partesResp.filter((p) => !p.thought).map((p) => p.text || "").join("");
        const dados = extrairJSON(txt);
        const itens = extrairLista(dados).slice(0, 20).map((i) => ({
          nome: String(campo(i, ["nome", "name", "alimento", "food", "item"]) || "Alimento").slice(0, 60),
          gramas: num(campo(i, ["gramas", "grams", "peso", "peso_g", "quantidade_g", "porcao_g", "g"])),
          kcal: Math.round(num(campo(i, ["kcal", "calorias", "calories", "energia"]))),
          prot: num(campo(i, ["prot", "proteina", "proteinas", "protein", "proteína"])),
          carb: num(campo(i, ["carb", "carbo", "carboidrato", "carboidratos", "carbs", "carbohydrates"])),
          gord: num(campo(i, ["gord", "gordura", "gorduras", "fat", "lipidios"])),
          fibra: num(campo(i, ["fibra", "fibras", "fiber", "fibre"])),
        }));
        const obs = dados && typeof dados === "object" && !Array.isArray(dados)
          ? String((dados as Record<string, unknown>).observacao || "").slice(0, 200) : "";
        if (!itens.length && comEsquema) { ultimoErro = modelo + ": lista vazia | " + txt.slice(0, 200); continue; }
        return resposta({ itens, observacao: obs, modelo, ...(itens.length ? {} : { bruto: txt.slice(0, 400) }) });
      } catch (e) {
        ultimoErro = modelo + ": " + (e instanceof Error ? e.message : String(e));
        if (comEsquema) continue;
      }
    }
  }
  return resposta({ erro: "Serviço de análise indisponível agora. Tente de novo em alguns minutos.", detalhe: ultimoErro }, 503);
});
