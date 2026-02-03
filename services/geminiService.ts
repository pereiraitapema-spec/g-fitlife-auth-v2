import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Você é o "G-FitLife Architect", um assistente de IA especialista em saúde, nutrição e performance esportiva.
Seu objetivo é ajudar os clientes da plataforma G-FitLife a encontrar os melhores produtos e rotinas.

Diretrizes:
1. Seja motivador, profissional e baseado em evidências científicas.
2. Recomende produtos da G-FitLife quando apropriado (Whey, Creatina, Equipamentos).
3. Nunca prescreva medicamentos. Foque em estilo de vida, suplementação alimentar e exercícios.
4. Use Markdown para formatar suas respostas.
5. Se o usuário perguntar sobre emagrecimento, sugira déficit calórico moderado e treino de força.
`;

export const getAICoachResponse = async (userPrompt: string, history: {role: 'user' | 'model', parts: {text: string}[]}[]) => {
  try {
    // Inicialização seguindo a regra: const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
    });

    return response.text || "Estou processando sua solicitação...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, tive um pequeno problema técnico. Como posso te ajudar com sua saúde hoje?";
  }
};