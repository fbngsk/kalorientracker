import { useState } from 'react'; 
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ACTIVITY_LEVELS, calculateDailyTarget, safeParseInt } from '../lib/calories';
import type { ProfileFormData, UserProfile } from '../types';

interface SettingsViewProps {
  profile: UserProfile;
  onSave: (profile: ProfileFormData) => Promise<boolean>;
  onBack: () => void;
}

export function SettingsView({ profile, onSave, onBack }: SettingsViewProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    gender: profile.gender,
    age: profile.age,
    weight: profile.weight,
    height: profile.height,
    activity_level: profile.activity_level,
    goal_weight: profile.goal_weight,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const calculatedPreview = calculateDailyTarget(formData);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const result = await onSave(formData);

    if (result) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } else {
      setError('Speichern fehlgeschlagen. Bitte versuche es erneut.');
    }

    setSaving(false);
  };

  const updateField = (field: keyof ProfileFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-900" />
        </button>
        <span className="font-bold text-slate-900">Einstellungen</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-green-600 text-sm">
            Änderungen gespeichert!
          </div>
        )}

        {/* Gender Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Geschlecht</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => updateField('gender', 'male')}
              className={`p-3 rounded-xl border text-center font-medium transition-all text-sm ${
                formData.gender === 'male'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Mann
            </button>
            <button
              type="button"
              onClick={() => updateField('gender', 'female')}
              className={`p-3 rounded-xl border text-center font-medium transition-all text-sm ${
                formData.gender === 'female'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Frau
            </button>
          </div>
        </div>

        {/* Numeric Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Alter</label>
            <input
              type="number"
              inputMode="numeric"
              value={formData.age || ''}
              onChange={(e) => updateField('age', safeParseInt(e.target.value, 30))}
              min={1}
              max={120}
              className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Größe (cm)</label>
            <input
              type="number"
              inputMode="numeric"
              value={formData.height || ''}
              onChange={(e) => updateField('height', safeParseInt(e.target.value, 180))}
              min={100}
              max={250}
              className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gewicht (kg)</label>
            <input
              type="number"
              inputMode="numeric"
              value={formData.weight || ''}
              onChange={(e) => updateField('weight', safeParseInt(e.target.value, 80))}
              min={30}
              max={300}
              className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Zielgewicht (kg)</label>
            <input
              type="number"
              inputMode="numeric"
              value={formData.goal_weight || ''}
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
                  formData.activity_level === level.value
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
          <span className="text-slate-600 font-medium">Neues Tagesbudget:</span>
          <span className="text-xl font-bold text-slate-900">{calculatedPreview} kcal</span>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Speichern...
            </>
          ) : (
            'Änderungen speichern'
          )}
        </button>
      </div>
    </div>
  );
}
