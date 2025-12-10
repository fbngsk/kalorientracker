import { useState } from 'react';
import { ArrowLeft, Activity, Save, Loader2 } from 'lucide-react';
import { analyzeImageWithGemini } from '../lib/gemini';
import { safeParseInt } from '../lib/calories';
import type { AnalysisResult } from '../types';

interface AnalysisViewProps {
  imageData: string;
  onSave: (result: AnalysisResult, imageUrl: string, notes: string) => Promise<boolean>;
  onCancel: () => void;
}

export function AnalysisView({ imageData, onSave, onCancel }: AnalysisViewProps) {
  const [userNotes, setUserNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeImageWithGemini(imageData, userNotes);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analyse fehlgeschlagen.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!analysisResult) return;

    setIsSaving(true);
    const success = await onSave(analysisResult, imageData, userNotes);
    
    if (!success) {
      setError('Speichern fehlgeschlagen. Bitte versuche es erneut.');
    }
    
    setIsSaving(false);
  };

  const updateCalories = (value: string) => {
    if (!analysisResult) return;
    setAnalysisResult({
      ...analysisResult,
      calories: safeParseInt(value, 0),
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-4">
        <button
          onClick={onCancel}
          className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-900" />
        </button>
        <span className="font-bold text-slate-900">Eintrag prüfen</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Image Preview */}
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
          <img src={imageData} alt="Food" className="w-full h-full object-cover" />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Pre-Analysis Form */}
        {!analysisResult && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notizen (Optional)
              </label>
              <textarea
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 resize-none text-base"
                rows={3}
                placeholder="z.B. 'Milchkaffee mit Zucker', 'Halbe Portion'..."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>

            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg disabled:opacity-70 flex items-center justify-center gap-3 shadow-lg shadow-slate-200"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Activity className="w-5 h-5" />
              )}
              {isAnalyzing ? 'Analysiere...' : 'Analysieren'}
            </button>
          </div>
        )}

        {/* Analysis Result */}
        {analysisResult && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-xl text-slate-900 mb-1">
                {analysisResult.name}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {analysisResult.reasoning}
              </p>
            </div>

            <div className="flex gap-4 items-center bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Kalorien
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={analysisResult.calories}
                  onChange={(e) => updateCalories(e.target.value)}
                  className="text-3xl font-bold text-slate-900 bg-transparent w-full focus:outline-none"
                />
              </div>
              <div className="text-right space-y-1">
                <div className="text-xs text-slate-500">
                  Protein: <b>{analysisResult.macros.protein}g</b>
                </div>
                <div className="text-xs text-slate-500">
                  Carbs: <b>{analysisResult.macros.carbs}g</b>
                </div>
                <div className="text-xs text-slate-500">
                  Fett: <b>{analysisResult.macros.fat}g</b>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-100 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSaving ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
