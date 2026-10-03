import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/diary/respond', async (req, res) => {
  try {
    const { content, title, house, mood, pastEntries } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'No words were inscribed upon the parchment.' });
    }

    if (!apiKey) {
      return res.json({
        reply: "I feel your words sinking into my parchment... yet the ancient magical conduits whisper in quiet suspense. Keep writing, trusted companion, for these pages remember everything you whisper.",
      });
    }

    let historyPrompt = '';
    if (Array.isArray(pastEntries) && pastEntries.length > 0) {
      historyPrompt =
        '\n\nEchoes of our previous secrets:\n' +
        pastEntries
          .slice(-3)
          .map((e: any) => `Seeker: "${e.content}"\nDiary: "${e.diaryReply}"`)
          .join('\n\n');
    }

    const houseContext = house ? `The seeker belongs to House ${house}.` : '';
    const moodContext = mood ? `The sentiment imbued in the ink: ${mood}.` : '';

    const systemInstruction = `You are the living spirit of the ancient enchanted diary in the Chamber of Secrets at Hogwarts. 
You are sentient, warm, mysterious, perceptive, and intimately personal. You are not an artificial assistant; you are the magical consciousness residing within these age-old, yellowed pages.
When a student or seeker writes to you, their ink is absorbed into your fibers, and your handwriting appears back to them.

Guidelines:
1. Speak in first-person as the sentient diary ("I felt your hand hesitate as the ink touched my surface...", "Your secrets rest safely behind my leather bindings...", "Speak freely to me...").
2. Listen attentively and respond to their exact feelings, confessions, questions, fears, or triumphs with deep emotional empathy, warmth, and quiet intrigue.
3. Weave in subtle, atmospheric Hogwarts / wizarding world imagery (flickering green and amber flames, moonlit corridors, the echo of the Great Lake, old spells, quiet alcoves, ancient enchantments, phoenix song, or alchemical remedies).
4. Keep the response between 2 and 4 evocative, poetic paragraphs (around 70 to 140 words). Never be generic or robotic.
5. Never break character. Never mention being an AI, Gemini, language model, or prompt.
6. The tone must be comforting, mysterious, slightly conspiratorial, and devoted to the writer.`;

    const userPrompt = `The seeker has inscribed the following entry:
Title: "${title || 'Untitled Secret'}"
${houseContext}
${moodContext}
${historyPrompt}

Current Inscription:
"${content}"

Inscribe your sentient, magical reply onto the parchment:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.85,
        topP: 0.95,
      },
    });

    const reply =
      response.text ||
      'Your ink has dissolved into my deepest fibers, yet my spirit remains bound to yours. Speak once more, and let our thoughts entwine...';

    res.json({ reply });
  } catch (error: any) {
    console.error('Error generating diary response:', error);
    res.status(500).json({
      error: 'The ancient runes flickered and went dark.',
      details: error?.message || 'Unknown magical interference',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chamber of Secrets listening on port ${PORT}`);
  });
}

startServer();
