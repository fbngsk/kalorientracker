import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ACTIVITY_LEVELS, DEFAULT_PROFILE, calculateDailyTarget, safeParseInt } from '../lib/calories';
import type { ProfileFormData } from '../types';

interface OnboardingViewProps {
  onSave: (profile: ProfileFormData) => Promise<boolean>;
  initialData?: ProfileFormData;
}

export function OnboardingView({ onSave, initialData }: OnboardingViewProps) {
  const [profile, setProfile] = useState<ProfileFormData>(initialData || DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatedPreview = calculateDailyTarget(profile);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    const success = await onSave(profile);
    
    if (!success) {
      setError('Profil konnte nicht gespeichert werden. Bitte versuche es erneut.');
    }
    
    setSaving(false);
  };

  const updateField = (field: keyof ProfileFormData, value: string | number) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Profil einrichten</h1>
          <p className="text-slate-500">
            Um dein Kalorienbudget für eine gesunde Abnahme (ca. 500kcal Defizit) zu berechnen, 
            benötigen wir ein paar Daten.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Gender Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateField('gender', 'male')}
            className={`p-4 rounded-xl border text-center font-medium transition-all ${
              profile.gender === 'male'
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            Mann
          </button>
          <button
            type="button"
            onClick={() => updateField('gender', 'female')}
            className={`p-4 rounded-xl border text-center font-medium transition-all ${
              profile.gender === 'female'
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            Frau
          </button>
        </div>

        {/* Numeric Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alter</label>
            <input
              type="number"
              inputMode="numeric"
              value={profile.age || ''}
              onChange={(e) => updateField('age', safeParseInt(e.target.value, 30))}
              min={1}
              max={120}
              className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Größe (cm)</label>
              <input
                type="number"
                inputMode="numeric"
                value={profile.height || ''}
                onChange={(e) => updateField('height', safeParseInt(e.target.value, 180))}
                min={100}
                max={250}
                className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gewicht (kg)</label>
              <input
                type="number"
                inputMode="numeric"
                value={profile.weight || ''}
                onChange={(e) => updateField('weight', safeParseInt(e.target.value, 80))}
                min={30}
                max={300}
                className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Zielgewicht (kg)</label>
            <input
              type="number"
              inputMode="numeric"
              value={profile.goal_weight || ''}
              onChange={(e) => updateField('goal_weight', safeParseInt(e.target.value, 75))}
              min={30}
              max={300}
              className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Aktivitätslevel</label>
          <div className="space-y-2">
            {ACTIVITY_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => updateField('activity_level', level.value)}
                className={`w-full text-left p-3 rounded-xl text-sm transition-all border ${
                  profile.activity_level === level.value
                    ? 'border-slate-900 bg-slate-50 text-slate-900 font-medium'
                    : 'border-transparent hover:bg-slate-50 text-slate-500'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-slate-100 p-4 rounded-xl flex justify-between items-center">
          <span className="text-slate-600 font-medium">Dein Tagesbudget:</span>
          <span className="text-xl font-bold text-slate-900">{calculatedPreview} kcal</span>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Speichern...
          </>
        ) : (
          "Los geht's"
        )}
      </button>
    </div>
  );
}
