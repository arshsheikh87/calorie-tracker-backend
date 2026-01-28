/**
 * Gemini Service (Google Gemini API)
 * Handles all interactions with Google Gemini for meal analysis (text + vision).
 *
 * Exposes the SAME public API as the previous AI service:
 * - analyzeMealText(mealText)
 * - analyzeMealImage(imageBuffer, imageMimeType)
 *
 * The rest of the backend (routes/controllers/clients) should remain unchanged.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Lazily initialize the Gemini client so unit tests / scripts can load the module
 * even when GEMINI_API_KEY is not set (we throw a clear error at call time).
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log(' Checking Gemini API key...');
  console.log(' API key exists:', !!apiKey);
  console.log(' API key length:', apiKey ? apiKey.length : 0);
  console.log(' API key starts with:', apiKey ? apiKey.substring(0, 8) + '...' : 'N/A');
  
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    const err = new Error('Gemini API key not configured: set GEMINI_API_KEY in your .env');
    // Surface as "unauthorized" to API callers (similar to invalid/missing key).
    err.status = 401;
    err.code = 'missing_api_key';
    throw err;
  }
  
  console.log(' Gemini API key validated successfully');
  return new GoogleGenerativeAI(apiKey.trim());
}

/**
 * Choose models (overrideable via env vars if you want).
 * - Text: fast + cheap is usually enough
 * - Vision: needs multimodal support (Gemini 2.5+ supports this)
 */
function getTextModelName() {
  return process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
}

function getVisionModelName() {
  return process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';
}

function buildNutritionPrompt({ mealText, isVision }) {
  // Keep prompt strict: JSON only, no markdown/code fences.
  // We keep the exact schema expected by your frontend/API contract.
  return `You are a nutrition analysis expert.
Analyze the provided meal and estimate nutrition.

${isVision ? 'Meal input: An image of a meal will be provided.' : `Meal description: "${mealText}"`}

Return ONLY a valid JSON object with EXACTLY this structure (no extra keys, no extra text):
{
  "detected_food_items": ["string"],
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number
}

Rules:
- "detected_food_items" must be an array of strings (at least 1 item).
- calories/protein_g/carbs_g/fat_g must be JSON numbers (no quotes), non-negative.
- Do NOT wrap output in markdown or code fences.
- If uncertain, make best estimates based on typical serving sizes.`;
}

function extractJsonObject(text) {
  // Gemini may sometimes include surrounding text; try strict parse first, then fallback to best-effort extraction.
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract the first JSON object-like substring.
    const match = text && typeof text === 'string' ? text.match(/\{[\s\S]*\}/) : null;
    if (!match) throw new Error('Failed to parse model response as JSON');
    return JSON.parse(match[0]);
  }
}

/**
 * Validate and normalize nutrition data to ensure consistent format
 * @param {Object} data - Raw nutrition data from AI
 * @returns {Object} Normalized nutrition data
 */
function validateAndNormalizeNutritionData(data) {
  // Ensure all required fields exist with valid types
  const normalized = {
    detected_food_items: Array.isArray(data?.detected_food_items)
      ? data.detected_food_items.filter((item) => typeof item === 'string' && item.trim().length > 0)
      : [],
    calories: typeof data?.calories === 'number' ? Math.round(data.calories) : 0,
    protein_g: typeof data?.protein_g === 'number' ? Math.round(data.protein_g * 10) / 10 : 0,
    carbs_g: typeof data?.carbs_g === 'number' ? Math.round(data.carbs_g * 10) / 10 : 0,
    fat_g: typeof data?.fat_g === 'number' ? Math.round(data.fat_g * 10) / 10 : 0,
  };

  if (normalized.detected_food_items.length === 0) {
    normalized.detected_food_items = ['Unidentified food items'];
  }

 
  normalized.calories = Math.max(0, normalized.calories);
  normalized.protein_g = Math.max(0, normalized.protein_g);
  normalized.carbs_g = Math.max(0, normalized.carbs_g);
  normalized.fat_g = Math.max(0, normalized.fat_g);

  return normalized;
}

function wrapGeminiError(error, prefixMessage) {
  // The SDK error shapes can vary; normalize to include status/code for route-level mapping.
  const wrapped = new Error(`${prefixMessage}: ${error?.message || String(error)}`);
  wrapped.cause = error;

  // Common places where HTTP status might exist.
  wrapped.status =
    error?.status ||
    error?.response?.status ||
    error?.response?.statusCode ||
    undefined;

  const msg = (error?.message || '').toLowerCase();
  if (wrapped.status === 401 || wrapped.status === 403 || msg.includes('api key') || msg.includes('permission') || msg.includes('unauthorized')) {
    wrapped.status = 401;
    wrapped.code = 'invalid_api_key';
  } else if (wrapped.status === 429 || msg.includes('quota') || msg.includes('resource_exhausted') || msg.includes('rate limit')) {
    wrapped.status = 429;
    wrapped.code = 'insufficient_quota';
  } else {
    wrapped.code = error?.code;
  }

  return wrapped;
}

/**
 * @param {string} mealText - Natural language meal description
 * @returns {Promise<Object>} Nutrition data in standardized format
 */
async function analyzeMealText(mealText) {
  try {
    console.log(' Starting meal text analysis with Gemini...');
    console.log(' Meal text:', mealText);
    
    const genAI = getGeminiClient();
    const modelName = getTextModelName();
    console.log(' Using model:', modelName);
    
    const model = genAI.getGenerativeModel({
      model: modelName,
   
      generationConfig: { temperature: 0.3 },
    });

    const prompt = buildNutritionPrompt({ mealText, isVision: false });
    console.log(' Sending request to Gemini...');
    
    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() ?? '';
    
    console.log(' Raw Gemini response:', text);
    
    const nutritionData = extractJsonObject(text);
    const normalizedData = validateAndNormalizeNutritionData(nutritionData);
    
    console.log(' Normalized nutrition data:', normalizedData);
    
    return normalizedData;
  } catch (error) {
    console.error(' Error in analyzeMealText:', error.message);
    console.error(' Error details:', {
      status: error.status,
      code: error.code,
      cause: error.cause?.message
    });
    throw wrapGeminiError(error, 'Failed to analyze meal text');
  }
}

/**
 * Analyze meal from image (Gemini vision-capable model)
 * @param {Buffer|string} imageData - Image buffer o string
 * @param {string} imageMimeType - MIME type of the image (e.g., 'image/jpeg')
 * @returns {Promise<Object>} Nutrition data in standardized format
 */
async function analyzeMealImage(imageData, imageMimeType = 'image/jpeg') {
  try {
    console.log(' Starting meal image analysis with Gemini...');
    console.log(' Image type:', imageMimeType);
    
    const genAI = getGeminiClient();
    const modelName = getVisionModelName();
    console.log(' Using vision model:', modelName);
    
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { temperature: 0.3 },
    });

    // Convert image to base64 if it's a buffer
    let imageBase64;
    if (Buffer.isBuffer(imageData)) {
      imageBase64 = imageData.toString('base64');
      console.log(' Converted buffer to base64, size:', imageData.length, 'bytes');
    } else if (typeof imageData === 'string') {
      imageBase64 = imageData.replace(/^data:image\/\w+;base64,/, '');
      console.log(' Using provided base64 string');
    } else {
      const err = new Error('Invalid image data format');
      err.status = 400;
      err.code = 'invalid_image';
      throw err;
    }

    const prompt = buildNutritionPrompt({ mealText: '', isVision: true });
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: imageMimeType,
      },
    };

    console.log(' Sending image analysis request to Gemini...');
    const result = await model.generateContent([prompt, imagePart]);
    const text = result?.response?.text?.() ?? '';
    
    console.log(' Raw Gemini response:', text);
    
    const nutritionData = extractJsonObject(text);
    const normalizedData = validateAndNormalizeNutritionData(nutritionData);
    
    console.log(' Normalized nutrition data:', normalizedData);
    
    return normalizedData;
  } catch (error) {
    console.error(' Error in analyzeMealImage:', error.message);
    console.error(' Error details:', {
      status: error.status,
      code: error.code,
      cause: error.cause?.message
    });
    throw wrapGeminiError(error, 'Failed to analyze meal image');
  }
}

module.exports = {
  analyzeMealText,
  analyzeMealImage,
};

