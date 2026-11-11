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

app.use(express.json());

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

// Server-side API endpoint for FlavorBot chat queries
app.post('/api/flavor-bot', async (req, res) => {
  try {
    const { query, context } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query string is required' });
      return;
    }

    const systemInstruction = `You are FlavorBot. Answer ONLY using the dish data provided. Never invent nutrition values, recipes or aroma-compound claims. If the answer is not in the data, say you don't know and suggest the chips. Do not give medical advice; for health questions say: please ask your doctor or dietitian. Keep answers under 80 words.`;

    const prompt = `Context Data:
${JSON.stringify(context || {}, null, 2)}

User Question: ${query}`;

    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest'];
    let text = '';
    let lastError: any = null;

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
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout after 8 seconds')), 8000)
        );

        const callPromise = ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.2,
            maxOutputTokens: 150,
          },
        });

        const response = await Promise.race([callPromise, timeoutPromise]);
        text = response.text?.trim() || '';
        if (text) break;
      } catch (err: any) {
        lastError = err;
        console.error(`[Server Gemini Error] Model: ${model}, Message: ${err?.message || err}`);
      }
    }

    if (!text) {
      throw lastError || new Error('Empty response from model');
    }

    res.json({ text });
  } catch (err: any) {
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

    console.error(`[Server Gemini Error] Model: gemini-3.8-flash, Status: ${statusCode}, Reason: ${reason}, Message: ${errorDetail}`);

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
