import React from 'react';
import { Activity, Settings, Plus, Droplet, Trash2, LogOut, Calendar, Zap } from 'lucide-react';
import { formatTime } from '../lib/calories';
import type { Meal, UserProfile } from '../types';

interface DashboardViewProps {
  profile: UserProfile;
  todaysMeals: Meal[];
  dailyCalories: number;
  weeklyCalories: number;
  dailyMacros: { protein: number; carbs: number; fat: number };
  onNavigateToSettings: () => void;
  onNavigateToHistory: () => void;
  onNavigateToQuickAdd: () => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteMeal: (mealId: string) => void;
  onSignOut: () => void;
}

function ProgressBar({ current, target }: { current: number; target: number }) {
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  const isOver = current > target;

  return (
    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
      <div
        className={`h-full transition-all duration-500 ease-out ${
          isOver ? 'bg-orange-500' : 'bg-slate-800'
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export function DashboardView({
  profile,
  todaysMeals,
  dailyCalories,
  weeklyCalories,
  dailyMacros,
  onNavigateToSettings,
  onNavigateToHistory,
  onNavigateToQuickAdd,
  onImageSelect,
  onDeleteMeal,
  onSignOut,
}: DashboardViewProps) {
  const remainingDaily = profile.daily_target - dailyCalories;

  return (
    <div className="pb-24 min-h-screen bg-slate-50">
      <div className="bg-white sticky top-0 z-10 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Übersicht</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToHistory}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
            title="Verlauf"
          >
            <Calendar className="w-5 h-5" />
          </button>
          <button
            onClick={onNavigateToSettings}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
            title="Einstellungen"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={onSignOut}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Abmelden"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">Verbleibend (Heute)</p>
              <div
                className={`text-4xl font-bold tracking-tighter ${
                  remainingDaily < 0 ? 'text-orange-500' : 'text-slate-900'
                }`}
              >
                {remainingDaily}{' '}
                <span className="text-lg text-slate-400 font-normal">kcal</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <Activity className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Tagesziel</span>
                <span className="text-slate-500">
                  {dailyCalories} / {profile.daily_target}
                </span>
              </div>
              <ProgressBar current={dailyCalories} target={profile.daily_target} />
            </div>

            <div className="pt-4 border-t border-slate-50">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Wochenziel</span>
                <span className="text-slate-500">
                  {weeklyCalories} / {profile.weekly_target}
                </span>
              </div>
              <ProgressBar current={weeklyCalories} target={profile.weekly_target} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Protein', val: dailyMacros.protein },
            { label: 'Carbs', val: dailyMacros.carbs },
            { label: 'Fett', val: dailyMacros.fat },
          ].map((m) => (
            <div
              key={m.label}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center"
            >
              <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">
                {m.label}
              </div>
              <div className="text-lg font-bold text-slate-800">{m.val}g</div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-slate-900 font-bold mb-4">Heute</h3>
          <div className="space-y-3">
            {todaysMeals.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                Noch keine Einträge. Tippe auf + um zu starten.
              </div>
