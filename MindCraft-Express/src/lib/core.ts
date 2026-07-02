import type { GenerateContentConfig } from '@google/genai';

import { GoogleGenAI } from '@google/genai';

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

interface AiCallParams {
  prompt: string;
  model?: string;
  config?: GenerateContentConfig;
}

export async function getAiPlan({
  prompt,
  model = 'gemini-2.5-flash',
  config = {
    temperature: 0.3,
    responseMimeType: 'application/json',
  },
}: AiCallParams) {
  const response = await client.models.generateContent({
    model,
    contents: prompt,
    config,
  });

  if (config?.responseMimeType === 'text/plain') {
    const text = response.text || '';
    return {
      model,
      content: text,
      rawText: text,
      responseId: response.responseId,
    };
  }

  const text = response.text || '';
  let json: unknown = text;
  try {
    json = JSON.parse(text);
  } catch (err: any) {
    console.error('Failed to parse JSON:', err);
  }

  return {
    model,
    content: json,
    rawText: text,
    responseId: response.responseId,
  };
}
