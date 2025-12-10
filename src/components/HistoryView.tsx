import { ArrowLeft, Calendar, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { Meal } from '../types';

interface HistoryViewProps {
  meals: Meal[];
  dailyTarget: number;
  onBack: () => void;
}

interface DayData {
  date: string;
  dateFormatted: string;
  calories: number;
  isToday: boolean;
}

export function HistoryView({ meals, dailyTarget, onBack }: HistoryViewProps) {
  const groupedByDay = meals.reduce<Record<string, number>>((acc, meal) => {
    const date = new Date(meal.created_at).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + meal.calories;
    return acc;
  }, {});

  const today = new Date().toISOString().split('T')[0];
  
  const days: DayData[] = Object.entries(groupedByDay)
    .map(([date, calories]) => {
      const d = new Date(date + 'T12:00:00');
      return {
        date,
        dateFormatted: d.toLocaleDateString('de-DE', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
        calories,
        isToday: date === today,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const pastDays = days.filter(d => !d.isToday);
  const average = pastDays.length > 0 
    ? Math.round(pastDays.reduce((sum, d) => sum + d.calories, 0) / pastDays.length)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white sticky top-0 z-10 border-b border-slate-100 px-6 py-4 flex items-center gap-4">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-900" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Verlauf</h1>
      </div>

      <div className="p-6 pb-0">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500">Ø Kalorien / Tag</p>
            <p className="text-2xl font-bold text-slate-900">{average} kcal</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Tagesziel</p>
            <p className="text-2xl font-bold text-slate-400">{dailyTarget} kcal</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-2">
        {days.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Noch keine Einträge vorhanden.
          </div>
        ) : (
          days.map((day) => {
            const diff = day.calories - dailyTarget;
            const isOver = diff > 0;
            const isUnder = diff < -100;
            return (
              <div key={day.date} className={`bg-white p-4 rounded-xl border flex items-center justify-between ${day.isToday ? 'border-slate-300 bg-slate-50' : 'border-slate-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOver ? 'bg-orange-100 text-orange-600' : isUnder ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                    {isOver ? <TrendingUp className="w-5 h-5" /> : isUnder ? <TrendingDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{day.isToday ? 'Heute' : day.dateFormatted}</p>
                    <p className={`text-xs ${isOver ? 'text-orange-600' : isUnder ? 'text-green-600' : 'text-slate-400'}`}>
                      {isOver ? `+${diff} über Ziel` : isUnder ? `${Math.abs(diff)} unter Ziel` : 'Im Zielbereich'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-slate-900">{day.calories}</span>
                  <span className="text-sm text-slate-400 ml-1">kcal</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
