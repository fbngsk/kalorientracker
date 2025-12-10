import type { AnalysisResult } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function analyzeImageWithGemini(
  base64Image: string,
  userNotes: string
): Promise<AnalysisResult> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API Key nicht konfiguriert.');
  }

  const cleanBase64 = base64Image.replace(
    /^data:image\/(png|jpeg|jpg|webp);base64,/,
    ''
  );

  const prompt = `
    Du bist ein präziser Ernährungs-Tracker. Deine Aufgabe ist es, Kalorien sachlich und genau zu schätzen.
    Analysiere dieses Foto (Essen ODER Getränk).
    
    Zusatzinfos vom Nutzer: "${userNotes}"
    (Nutze diese Infos für die Portionsgröße und versteckte Kalorien wie Öl, Zucker in Getränken etc.)

    Anweisungen:
    1. Erkenne das Gericht oder Getränk genau.
    2. Schätze die Kalorien realistisch. Sei bei Getränken (Alkohol, Latte Macchiato etc.) und Saucen streng.
    3. Gib Makros in Gramm an.
    4. Bestimme den Typ: "food" oder "drink".

    Antworte NUR mit diesem JSON Format:
    {
      "name": "Name des Items",
      "calories": 0,
      "macros": { "protein": 0, "carbs": 0, "fat": 0 },
      "type": "food",
      "reasoning": "Sachliche Begründung der Schätzung."
    }
  `;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'image/jpeg', data: cleanBase64 } },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Gemini API Error:', errorData);
    throw new Error('API-Anfrage fehlgeschlagen.');
  }

  const data = await response.json();

  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Ungültige API-Antwort.');
  }

  const textResponse = data.candidates[0].content.parts[0].text;
  const cleanJson = textResponse
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  try {
    const result = JSON.parse(cleanJson);

    // Validate required fields
    if (
      typeof result.name !== 'string' ||
      typeof result.calories !== 'number' ||
      !result.macros
    ) {
      throw new Error('Unvollständige Analysedaten.');
    }

    return {
      name: result.name,
      calories: Math.max(0, Math.round(result.calories)),
      macros: {
        protein: Math.max(0, Math.round(result.macros.protein || 0)),
        carbs: Math.max(0, Math.round(result.macros.carbs || 0)),
        fat: Math.max(0, Math.round(result.macros.fat || 0)),
      },
      type: result.type === 'drink' ? 'drink' : 'food',
      reasoning: result.reasoning || '',
    };
  } catch (parseError) {
    console.error('JSON Parse Error:', parseError, textResponse);
    throw new Error('Analyse konnte nicht verarbeitet werden.');
  }
}

// Utility: Compress image before upload
export async function compressImage(
  base64: string,
  maxWidth = 800,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = base64;
  });
}
