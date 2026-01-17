
import { GoogleGenAI } from "@google/genai";

export async function getVolunteerResponse(petName: string, userMessage: string, history: {role: 'user' | 'model', parts: {text: string}[]}[]) {
  try {
    // Fix: Initialize GoogleGenAI with the API key directly from process.env.API_KEY using named parameters
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Fix: Call generateContent with model and contents as per recommended SDK patterns
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { role: 'user', parts: [{ text: `你是一位名叫 Sarah 的動物之家志工。你正在協助領養人了解名為 ${petName} 的寵物。請用親切、溫柔且專業的語氣回答問題。對話歷史如下。` }] },
        ...history,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: "你是一位充滿愛心的寵物領養志工 Sarah，目標是幫助使用者了解寵物並評估是否適合領養。請使用繁體中文回答。",
        temperature: 0.7,
      }
    });

    // Fix: Directly access the .text property on the GenerateContentResponse object (it is a property, not a method)
    return response.text || "謝謝您的詢問，我會盡快回覆您！";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "對不起，目前連線有些問題，請稍後再試。";
  }
}
