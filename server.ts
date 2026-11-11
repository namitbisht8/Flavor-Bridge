import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// The dev server and backend proxy MUST strictly listen on port 3000
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI on the server
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Rate limit tracker for photo scanning: 1 scan every 5 seconds
let lastPhotoScanTime = 0;

// Server-side API endpoint for Photo Scanning (hybrid AI detection)
// Never saves or logs photo data.
app.post('/api/scan-photo', async (req, res) => {
  const now = Date.now();
  if (now - lastPhotoScanTime < 5000) {
    res.status(429).json({
      error: 'Rate limit: 1 scan every 5 seconds',
      reason: 'rate limit',
      retryAfterMs: 5000 - (now - lastPhotoScanTime),
    });
    return;
  }
  lastPhotoScanTime = now;

  try {
    const { image, mimeType = 'image/jpeg' } = req.body;
    if (!image || typeof image !== 'string') {
      res.status(400).json({ error: 'Image base64 is required' });
      return;
    }

    // Strip data URI prefix if present; never persist image to disk or logs
    const cleanBase64 = image.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    // Check if API key is present
    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest'];
    if (!apiKey) {
      console.error(`[Server Gemini Vision Error] GEMINI_API_KEY is not set in secrets`);
      res.status(500).json({
        error: 'Failed to analyze photo',
        reason: 'bad key',
        status: 500,
        message: 'GEMINI_API_KEY is not set in secrets',
      });
      return;
    }

    const prompt = `Analyze this dish photo. Identify the dish and its visible key culinary ingredients.
Respond ONLY with valid JSON in this exact structure:
{"dish_guess": "string", "ingredients": ["string"], "confidence": "low"|"medium"|"high"}
Do not include markdown code fences or any other text.`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: cleanBase64,
      },
    };
    const textPart = { text: prompt };

    let rawOutput = '';
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout after 15 seconds')), 15000)
        );

        const callPromise = ai.models.generateContent({
          model,
          contents: { parts: [imagePart, textPart] },
          config: {
            temperature: 0.1,
            maxOutputTokens: 250,
          },
        });

        const response = await Promise.race([callPromise, timeoutPromise]);
        rawOutput = response.text?.trim() || '';
        if (rawOutput) break;
      } catch (err: any) {
        lastError = err;
        console.error(`[Server Gemini Vision Error] Model: ${model}, Message: ${err?.message || err}`);
      }
    }

    if (!rawOutput) {
      throw lastError || new Error('Empty response from vision model');
    }

    // Strip code fences before parsing JSON
    let cleaned = rawOutput.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Invalid JSON format from vision model');
      }
    }

    res.json({
      dish_guess: String(parsed.dish_guess || ''),
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients.map(String) : [],
      confidence: ['low', 'medium', 'high'].includes(parsed.confidence) ? parsed.confidence : 'medium',
    });
  } catch (err: any) {
    const errorDetail = err?.message || 'Unknown error';
    console.error(`[Server Photo Scan Error] Status: 500, Message: ${errorDetail}`);
    res.status(500).json({
      error: "I couldn't read that photo. Pick your dish below.",
      reason: errorDetail.toLowerCase().includes('timeout') ? 'timeout' : 'vision error',
      message: errorDetail,
    });
  }
});

// Health check endpoint for FlavorBot testing connection and measuring latency
app.get('/api/flavor-bot/health', async (_req, res) => {
  const start = Date.now();
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastErr: any = null;

  if (!apiKey) {
    console.log(`[FlavorBot Health] Error: GEMINI_API_KEY is not set`);
    res.status(500).json({ status: 'error', reason: 'bad key', message: 'GEMINI_API_KEY is not set' });
    return;
  }

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: 'Say OK',
        config: {
          thinkingConfig: { thinkingBudget: 0 },
          maxOutputTokens: 20,
        },
      });
      const latencyMs = Date.now() - start;
      const reply = response.text?.trim() || 'OK';
      console.log(`[FlavorBot Health] Model: ${model}, Latency: ${latencyMs}ms, Response: "${reply}"`);
      res.json({
        status: 'ok',
        model,
        latencyMs,
        response: reply,
      });
      return;
    } catch (err: any) {
      lastErr = err;
      console.error(`[FlavorBot Health Error] Model: ${model}, Error: ${err?.message || err}`);
    }
  }

  const latencyMs = Date.now() - start;
  res.status(500).json({
    status: 'error',
    latencyMs,
    error: lastErr?.message || 'Health check failed',
  });
});

// Server-side API endpoint for FlavorBot chat queries
app.post('/api/flavor-bot', async (req, res) => {
  const requestStart = Date.now();
  try {
    const { query, context } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query string is required' });
      return;
    }

    const systemInstruction = `You are FlavorBot. Answer ONLY using the dish data provided. Never invent recipes or nutrition values. Keep answers friendly, helpful and under 80 words. For medical questions say: please ask your doctor or dietitian.`;

    // Keep context concise: send only selected dish's key fields rather than massive raw JSON
    const dish = context?.dish || context?.dishName || 'Selected Dish';
    const shortContext = `Selected Dish: ${dish}
Diet: ${context?.diet || 'Not specified'}
Allergies: ${Array.isArray(context?.allergies) ? context.allergies.join(', ') : 'None'}
Sodium: ${context?.nutritionPerServing?.originalSodiumMg ?? context?.originalSodiumMg ?? ''}mg to ${context?.nutritionPerServing?.rebuiltSodiumMg ?? context?.rebuiltSodiumMg ?? ''}mg (limit: ${context?.nutritionPerServing?.limitSodiumMg ?? context?.limitSodiumMg ?? 350}mg)
Sat Fat: ${context?.nutritionPerServing?.originalSatFatG ?? context?.originalSatFatG ?? ''}g to ${context?.nutritionPerServing?.rebuiltSatFatG ?? context?.rebuiltSatFatG ?? ''}g
Sugar: ${context?.nutritionPerServing?.originalAddedSugarG ?? context?.originalAddedSugarG ?? ''}g to ${context?.nutritionPerServing?.rebuiltAddedSugarG ?? context?.rebuiltAddedSugarG ?? ''}g
Cost: Rs ${context?.nutritionPerServing?.costPerServing ?? context?.costPerServing ?? ''}
Time: ${context?.nutritionPerServing?.estimatedTimeMins ?? context?.estimatedTimeMins ?? ''} mins (${context?.nutritionPerServing?.difficulty ?? context?.difficulty ?? ''})
Swaps: ${context?.swaps?.map((s: any) => `${s.originalIngredient} -> ${s.rebuiltIngredient}`).join('; ') || 'None'}
Steps: ${context?.cookingSteps?.map((st: any) => `Step ${st.stepNumber} (${st.timeMinutes}m): ${st.instruction}`).join('; ') || 'None'}`;

    const prompt = `Dish Data:
${shortContext}

User Question: ${query}`;

    // Prefer fastest Gemini Flash-Lite, then Flash
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let text = '';
    let lastError: any = null;
    let selectedModel = modelsToTry[0];

    // Check if API key is present
    if (!apiKey) {
      console.error(`[Server Gemini Error] Model: ${modelsToTry[0]}, Status: 500, Message: GEMINI_API_KEY is not set in environment secrets`);
      res.status(500).json({
        error: 'Failed to generate response from model',
        reason: 'bad key',
        status: 500,
        model: modelsToTry[0],
        message: 'GEMINI_API_KEY is not set in secrets',
      });
      return;
    }

    for (const model of modelsToTry) {
      selectedModel = model;
      // Retry once on timeout
      let attempts = 0;
      const maxRetries = 1;

      while (attempts <= maxRetries) {
        attempts++;
        try {
          const attemptStart = Date.now();
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout after 20 seconds')), 20000)
          );

          const callPromise = ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.2,
              maxOutputTokens: 300,
              thinkingConfig: { thinkingBudget: 0 },
            },
          });

          const response = await Promise.race([callPromise, timeoutPromise]);
          text = response.text?.trim() || '';
          const latencyMs = Date.now() - attemptStart;
          console.log(`[FlavorBot Request] Model: ${model}, Latency: ${latencyMs}ms, Query: "${query.slice(0, 40)}"`);
          if (text) break;
        } catch (err: any) {
          lastError = err;
          const isTimeout = err?.message?.toLowerCase().includes('timeout');
          console.error(`[Server Gemini Error] Model: ${model}, Attempt: ${attempts}, Message: ${err?.message || err}`);
          if (isTimeout && attempts <= maxRetries) {
            console.log(`[FlavorBot Retry] Retrying model ${model} after timeout...`);
            continue;
          }
          break; // Move to next model if non-timeout or retry exhausted
        }
      }

      if (text) break;
    }

    if (!text) {
      throw lastError || new Error('Empty response from model');
    }

    res.json({ text });
  } catch (err: any) {
    const totalLatencyMs = Date.now() - requestStart;
    let errorDetail = err?.message || 'Unknown error';
    let statusCode = 500;
    try {
      const parsed = JSON.parse(errorDetail);
      if (parsed?.error?.message) {
        errorDetail = parsed.error.message;
      }
      if (parsed?.error?.code) {
        statusCode = parsed.error.code;
      }
    } catch {
      // Not a JSON string
    }

    // Determine short reason field
    let reason = 'unknown error';
    const lower = errorDetail.toLowerCase();
    if (lower.includes('timeout')) {
      reason = 'timeout';
    } else if (lower.includes('not found') || lower.includes('404')) {
      reason = 'model not found';
    } else if (lower.includes('quota') || lower.includes('rate limit') || lower.includes('429') || lower.includes('resource_exhausted')) {
      reason = 'quota exceeded';
    } else if (lower.includes('key') || lower.includes('api_key') || lower.includes('permission_denied') || lower.includes('403') || lower.includes('auth')) {
      reason = 'bad key';
    } else if (lower.includes('503') || lower.includes('high demand') || lower.includes('unavailable')) {
      reason = 'high demand (503)';
    }

    console.error(`[Server Gemini Error] Model: gemini-3.1-flash-lite, Status: ${statusCode}, Reason: ${reason}, Latency: ${totalLatencyMs}ms, Message: ${errorDetail}`);

    res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
      error: 'Failed to generate response from model',
      reason,
      status: statusCode,
      message: errorDetail,
    });
  }
});

// In development, mount Vite middleware. In production, serve dist.
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({
    root: __dirname,
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Flavor Bridge server listening on http://0.0.0.0:${port}`);
});

server.on('error', (err) => {
  console.error('[Server Listen Error]', err);
});
