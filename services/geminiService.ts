import { GoogleGenAI, Type } from "@google/genai";
import { Priority, Task } from "../types";

const taskActionSchema = {
  type: Type.OBJECT,
  properties: {
    action: {
      type: Type.STRING,
      description: "One of: ADD, DELETE, UPDATE, COMPLETE, SEARCH, CHAT",
    },
    taskData: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        priority: { type: Type.STRING, description: "low, medium, or high" },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        dueDate: { type: Type.STRING, description: "ISO date string" },
        recurring: { type: Type.STRING, description: "daily, weekly, monthly" },
      }
    },
    targetId: { type: Type.STRING, description: "Target task ID if known" },
    query: { type: Type.STRING, description: "Search query or filtering criteria" },
    explanation: { type: Type.STRING, description: "Natural language answer or summary for the user" }
  },
  required: ["action"]
};

// Constitutional principles to be injected into system instructions
const CONSTITUTION_PROMPT = `
ADHERE TO THE PROJECT CONSTITUTION:
1. Be helpful, concise, and accurate.
2. Support English and Urdu fluently. 
3. Maintain a supportive and professional tone.
4. Respect user privacy and never create harmful content.
`;

const cleanJson = (text: string): string => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const processNaturalLanguage = async (input: string, context: Task[]): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the user's natural language command or question into a structured action.
      Current Tasks Context: ${JSON.stringify(context.map(t => ({ id: t.id, title: t.title, priority: t.priority, completed: t.completed })))}
      Input: "${input}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: taskActionSchema,
        systemInstruction: `You are a task management assistant. ${CONSTITUTION_PROMPT} 
        If the user asks a question about their tasks, use the 'CHAT' action and provide a detailed, helpful summary in the 'explanation' field. 
        If they want to find something, use 'SEARCH'. Always respond with VALID JSON ONLY.`
      }
    });

    const jsonStr = cleanJson(response.text || "");
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("AI processing error:", e);
    return null;
  }
};

export const getAIResponse = async (input: string, lang: 'en' | 'ur'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: input,
      config: {
        systemInstruction: `${CONSTITUTION_PROMPT} 
        Respond in ${lang === 'ur' ? 'Urdu with a respectful and warm tone' : 'English in a professional and crisp manner'}.`
      }
    });
    return response.text || (lang === 'en' ? "I couldn't generate a response." : "میں جواب نہیں دے سکا۔");
  } catch (e) {
    console.error("AI response error:", e);
    return lang === 'en' ? "Sorry, I'm having trouble connecting right now." : "معذرت، مجھے اس وقت رابطہ کرنے میں دشواری ہو رہی ہے۔";
  }
};