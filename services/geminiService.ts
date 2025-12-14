import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SUB_TOPICS = [
  "Nutrientes (Glúcidos, Lípidos, Proteínas, Vitaminas, Sales, Agua) y Energía",
  "Anatomía y Fisiología del Aparato Digestivo (Órganos, procesos de digestión)",
  "Dieta Equilibrada, Rueda de alimentos, Metabolismo y Hábitos Saludables",
  "Enfermedades relacionadas con la alimentación, conservación y manipulación de alimentos"
];

const questionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { 
            type: Type.STRING, 
            enum: ["multiple_choice", "true_false", "short_answer"],
            description: "El tipo de pregunta." 
          },
          text: { type: Type.STRING, description: "El enunciado de la pregunta." },
          options: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Opciones de respuesta (Solo para multiple_choice o true_false). Dejar vacío si es short_answer." 
          },
          correctIndex: { type: Type.INTEGER, description: "Índice correcto (para multiple_choice/true_false)." },
          correctAnswer: { type: Type.STRING, description: "La respuesta correcta en texto (Solo para short_answer, una única palabra)." },
          explanation: { type: Type.STRING, description: "Breve explicación." }
        },
        required: ["type", "text", "explanation"]
      }
    }
  },
  required: ["questions"]
};

export const generateQuestions = async (totalQuestions: number = 100): Promise<Question[]> => {
  const batchSize = Math.ceil(totalQuestions / SUB_TOPICS.length);
  
  const promises = SUB_TOPICS.map(async (topic, index) => {
    try {
      // Adjusted prompt for variety
      const prompt = `Genera ${batchSize} preguntas para un examen de 3º ESO (Biología) sobre: "${topic}".
      
      Debes mezclar los siguientes tipos de preguntas:
      1. "multiple_choice" (aprox 60%): 4 opciones, 1 correcta.
      2. "true_false" (aprox 20%): Opciones ["Verdadero", "Falso"].
      3. "short_answer" (aprox 20%): El alumno debe escribir una única palabra clave.
      
      Idioma: Español. Nivel: 14-15 años.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: questionSchema,
          temperature: 0.8, // Slightly higher for variety
        },
      });

      const data = JSON.parse(response.text || "{ \"questions\": [] }");
      
      return (data.questions || []).map((q: any, idx: number) => ({
        ...q,
        id: index * 1000 + idx,
        category: topic,
        // Ensure options exist for MC/TF
        options: q.type === 'short_answer' ? [] : (q.options || []),
        // Ensure correctAnswer is normalized if it exists
        correctAnswer: q.correctAnswer ? q.correctAnswer.trim() : undefined
      }));

    } catch (error) {
      console.error(`Error generating batch for ${topic}:`, error);
      return [];
    }
  });

  const results = await Promise.all(promises);
  const allQuestions = results.flat();
  return allQuestions.slice(0, totalQuestions);
};