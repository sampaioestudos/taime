import { GoogleGenAI, Type } from "@google/genai";
import { Task, AnalysisResult } from '../types';
import { formatTime } from "../utils/time";

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    categories: {
      type: Type.ARRAY,
      description: "A list of suggested categories with tasks grouped under them. Avoid generic categories like 'General' or 'Other'. Create meaningful groups based on task names and descriptions.",
      items: {
        type: Type.OBJECT,
        properties: {
          categoryName: {
            type: Type.STRING,
            description: "The name of the category (e.g., 'Project Work', 'Meetings', 'Learning').",
          },
          tasks: {
            type: Type.ARRAY,
            description: "A list of task names that fall into this category.",
            items: { type: Type.STRING },
          },
          totalTime: {
            type: Type.NUMBER,
            description: "Total time in seconds spent on all tasks in this category.",
          },
        },
        required: ["categoryName", "tasks", "totalTime"],
      },
    },
    insights: {
      type: Type.ARRAY,
      description: "Actionable insights, patterns, and suggestions for productivity improvement. Each insight should be a single, complete sentence.",
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ["categories", "insights"],
};

const getPrompt = (taskDataJson: string, language: string) => {
    const prompts = {
        en: `
    You are a world-class productivity expert. Your goal is to help users understand their work patterns and improve their time management.
    Analyze the following list of tasks (with optional descriptions and Jira issue keys) and the time spent on each. The data is provided in JSON format.

    Tasks Data:
    ${taskDataJson}

    Based on this data, please perform the following actions:
    1.  **Categorize the Tasks:** Based on the task names, descriptions, and Jira keys, group them into meaningful categories. Avoid generic names like "Miscellaneous" or "General". Categories should reflect the nature of the work (e.g., "Software Development", "Client Meetings", "Administrative", "Personal Growth"). A task with a Jira key is likely professional work.
    2.  **Calculate Category Totals:** For each category, calculate the total time spent in seconds.
    3.  **Generate Insights:** Provide 2-3 concise, actionable insights, with each insight being a complete sentence. These should identify patterns (e.g., "A large portion of your time is spent on meetings"), suggest potential improvements (e.g., "Consider blocking out focus time for development tasks"), or highlight positive trends.
    4.  **Format Output:** Return the entire response as a single, valid JSON object that adheres to the provided schema.
  `,
    'pt-BR': `
    Você é um especialista em produtividade de classe mundial. Seu objetivo é ajudar os usuários a entenderem seus padrões de trabalho e melhorarem sua gestão de tempo.
    Analise a lista de tarefas a seguir (com descrições e chaves de issues do Jira opcionais) e o tempo gasto em cada uma. Os dados são fornecidos em formato JSON.

    Dados das Tarefas:
    ${taskDataJson}

    Com base nestes dados, por favor, realize as seguintes ações:
    1.  **Categorize as Tarefas:** Com base nos nomes, descrições e chaves do Jira, agrupe-as em categorias significativas. Evite nomes genéricos como "Diversos" ou "Geral". As categorias devem refletir a natureza do trabalho (ex: "Desenvolvimento de Software", "Reuniões com Clientes", "Administrativo", "Crescimento Pessoal"). Uma tarefa com chave do Jira provavelmente é trabalho profissional.
    2.  **Calcule os Totais por Categoria:** Para cada categoria, calcule o tempo total gasto em segundos.
    3.  **Gere Insights:** Forneça 2-3 insights concisos e práticos, com cada insight sendo uma frase completa. Eles devem identificar padrões (ex: "Uma grande parte do seu tempo é gasta em reuniões"), sugerir melhorias potenciais (ex: "Considere bloquear tempo de foco para tarefas de desenvolvimento"), ou destacar tendências positivas.
    4.  **Formate a Saída:** Retorne a resposta inteira como um único objeto JSON válido que adere ao esquema fornecido.
  `
    };

    return prompts[language as keyof typeof prompts] || prompts.en;
};


export const getTaskAnalysis = async (tasks: Task[], language: string): Promise<AnalysisResult> => {
  const taskData = tasks.map(t => ({ 
      name: t.name, 
      description: t.description || undefined,
      jiraIssueKey: t.jiraIssueKey || undefined,
      time_seconds: t.elapsedSeconds 
    }));
  
  const prompt = getPrompt(JSON.stringify(taskData, null, 2), language);
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
        throw new Error("Empty JSON response from API.");
    }
    const result = JSON.parse(jsonText.trim());
    
    if (!result.categories || !result.insights) {
        throw new Error("Invalid JSON structure received from API.");
    }

    return result as AnalysisResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from AI service.");
  }
};

const getRealtimePrompt = (taskName: string, elapsedSeconds: number, language: string) => {
    const duration = formatTime(elapsedSeconds);
    const prompts = {
        en: `You are a friendly productivity coach. The user has been working on the task "${taskName}" for ${duration}. Provide a very short, single-sentence motivational message or a gentle reminder (like suggesting a short break). Keep it under 15 words. Be encouraging. Example: "Great focus! A short break can boost your energy."`,
        'pt-BR': `Você é um coach de produtividade amigável. O usuário está trabalhando na tarefa "${taskName}" há ${duration}. Forneça uma mensagem motivacional muito curta, de uma única sentença, ou um lembrete gentil (como sugerir uma pequena pausa). Mantenha a mensagem com menos de 15 palavras. Seja encorajador. Exemplo: "Ótimo foco! Uma pequena pausa pode renovar sua energia."`
    };
    return prompts[language as keyof typeof prompts] || prompts.en;
};

export const getRealtimeInsight = async (taskName: string, elapsedSeconds: number, language: string): Promise<string> => {
    const prompt = getRealtimePrompt(taskName, elapsedSeconds, language);
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text?.trim() || "";
    } catch (error) {
        console.error("Error getting real-time insight:", error);
        return ""; // Return empty string on failure
    }
};