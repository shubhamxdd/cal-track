import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiNutritionResponse } from '../types';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const NUTRITION_PROMPT = `You are a nutrition expert specializing in Indian cuisine and international foods.
The user has eaten: "{INPUT}"

Analyze the food and return ONLY a valid JSON object with this exact structure:
{
  "foodName": "descriptive name of the food",
  "portionDescription": "e.g., 1 medium bowl (~200g) or 2 pieces (~150g)",
  "calories": <number>,
  "proteinG": <number>,
  "carbsG": <number>,
  "fatG": <number>,
  "confidence": "high" | "medium" | "low"
}

Rules:
- Use standard Indian household measurements (katori, bowl, roti, piece) when applicable
- If quantity is not specified, assume a standard single serving
- All macros in grams, calories in kcal
- Return ONLY valid JSON, absolutely no extra text or markdown
- If you cannot determine the food, estimate based on the closest known similar food`;

export const getNutritionFromGemini = async (
  userInput: string
): Promise<GeminiNutritionResponse> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = NUTRITION_PROMPT.replace('{INPUT}', userInput);

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip markdown code fences if Gemini wraps in them
  const jsonText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

  const parsed: GeminiNutritionResponse = JSON.parse(jsonText);

  // Validate required fields
  if (
    typeof parsed.calories !== 'number' ||
    typeof parsed.proteinG !== 'number' ||
    typeof parsed.carbsG !== 'number' ||
    typeof parsed.fatG !== 'number'
  ) {
    throw new Error('Invalid nutrition data returned from Gemini');
  }

  return parsed;
};
