import { useState } from 'react';
import { ArrowLeft, Zap, Save, Loader2, Coffee, Pizza } from 'lucide-react';
import { safeParseInt } from '../lib/calories';
import type { AnalysisResult } from '../types';

interface QuickAddViewProps {
  onSave: (result: AnalysisResult, notes: string) => Promise<boolean>;
  onCancel: () => void;
}

const QUICK_EXAMPLES = [
  'Kaffee mit Hafermilch',
  'Cola Zero 500ml',
  'Apfel',
  'Brötchen mit Käse',
  'Cappuccino',
  'Müsliriegel',
];

export function QuickAddView({ onSave, onCancel }: QuickAddViewProps) {
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeText = async () => {
    if (!description.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Du bist ein präziser Ernährungs-Tracker. Schätze die Kalorien für folgendes:

"${description}"

Anweisungen:
1. Schätze realistisch basierend auf typischen Portionsgrößen
2. Bei Getränken: Beachte Zucker, Milch, Alkohol etc.
3. Bei "Zero" oder "Light" Produkten: Entsprechend niedrige Kalorien
4. Gib Makros in Gramm an
5. Bestimme ob "food" oder "drink"

Antworte NUR mit diesem JSON:
{
  "name": "Kurzer Name",
  "calories": 0,
  "macros": { "protein": 0, "carbs": 0, "fat": 0 },
  "type": "food",
  "reasoning": "Kurze Begründung"
}`
              }]
            }]
          })
        }
      );

      if (!response.ok) throw new Error('API Fehler');

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);

      setResult({
        name: parsed.name,
        calories: Math.max(0, Math.round(parsed.calories)),
        macros: {
          protein: Math.max(0, Math.round(parsed.macros?.protein || 0)),
          carbs: Math.max(0, Math.round(parsed.macros?.carbs || 0)),
          fat: Math.max(0, Math.round(parsed.macros?.fat || 0)),
        },
        type: parsed.type === 'drink' ? 'drink' : 'food',
        reasoning: parsed.reasoning || '',
      });
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Konnte nicht analysiert werden. Bitte versuche es erneut.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    const success = await onSave(result, description);
    if (!success) {
      setError('Speichern fehlgeschlagen.');
    }
    setIsSaving(false);
  };

  const updateCalories = (value: string) => {
    if (!result) return;
    setResult({ ...result, calories: safeParseInt(value, 0) });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="p-4 border-b border-slate-100 flex items-center gap-4">
        <button
          onClick={onCancel}
          className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-900" />
        </button>
        <span className="font-bold text-slate-900">Schnell hinzufügen</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
            <Zap className="w-10 h-10 text-slate-400" />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {!result && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Was hast du gegessen oder getrunken?
              </label>
              <textarea
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 resize-none text-base"
                rows={3}
                placeholder="z.B. Kaffee mit Hafermilch, Cola Zero 500ml, Apfel..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isAnalyzing}
                autoFocus
              />
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2">Schnellauswahl:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_EXAMPLES.map((example) => (
                  <button
                    key={example}
                    onClick={() => setDescription(example)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-sm text-slate-600 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={analyzeText}
              disabled={isAnalyzing || !description.trim()}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
              {isAnalyzing ? 'Analysiere...' : 'Kalorien schätzen'}
            </button>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                {result.type === 'drink' ? (
                  <Coffee className="w-5 h-5 text-blue-500" />
                ) : (
                  <Pizza className="w-5 h-5 text-orange-500" />
                )}
                <h3 className="font-bold text-xl text-slate-900">{result.name}</h3>
              </div>
              <p className="text-sm text-slate-500">{result.reasoning}</p>
            </div>

            <div className="flex gap-4 items-center bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Kalorien
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={result.calories}
                  onChange={(e) => updateCalories(e.target.value)}
                  className="text-3xl font-bold text-slate-900 bg-transparent w-full focus:outline-none"
                />
              </div>
              <div className="text-right space-y-1">
                <div className="text-xs text-slate-500">P: <b>{result.macros.protein}g</b></div>
                <div className="text-xs text-slate-500">C: <b>{result.macros.carbs}g</b></div>
                <div className="text-xs text-slate-500">F: <b>{result.macros.fat}g</b></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold"
              >
                Zurück
              </button>
              <button
                onClick={hand
