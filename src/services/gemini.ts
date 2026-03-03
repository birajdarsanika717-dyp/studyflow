import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async generateFlashcards(content: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a set of 10-15 interactive flashcards from the following study notes. Each flashcard should have a question and a clear, concise answer. Focus on key concepts, definitions, and important facts.
      
      Notes:
      ${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING },
            },
            required: ["question", "answer"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  },

  async generateQuiz(content: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a multiple-choice quiz with 10 questions based on the following study notes. Each question should have 4 options, one correct answer, and a brief explanation of why that answer is correct.
      
      Notes:
      ${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ["question", "options", "correctAnswer", "explanation"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  },

  async generatePracticeTest(content: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a comprehensive practice test based on the following study notes. Include a mix of 5 multiple-choice questions and 5 short-answer questions.
      
      Notes:
      ${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  type: { type: Type.STRING, description: "either 'multiple-choice' or 'short-answer'" },
                  options: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Only for multiple-choice"
                  },
                  correctAnswer: { type: Type.STRING },
                },
                required: ["question", "type", "correctAnswer"],
              }
            }
          },
          required: ["questions"],
        },
      },
    });

    return JSON.parse(response.text || '{"questions": []}');
  },

  async summarizeNotes(content: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the following study notes into a clear, structured format using Markdown. Use headings, bullet points, and bold text for emphasis.
      
      Notes:
      ${content}`,
    });

    return response.text;
  }
};
