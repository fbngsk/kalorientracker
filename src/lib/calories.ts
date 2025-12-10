import type { ProfileFormData } from '../types';

export const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sitzend (Bürojob, kein Sport)' },
  { value: 1.375, label: 'Leicht aktiv (1-3x Sport/Woche)' },
  { value: 1.55, label: 'Moderat aktiv (3-5x Sport/Woche)' },
  { value: 1.725, label: 'Sehr aktiv (6-7x Sport/Woche)' },
  { value: 1.9, label: 'Extrem aktiv (Physischer Job + Training)' },
] as const;

export const DEFAULT_PROFILE: ProfileFormData = {
  gender: 'male',
  age: 30,
  weight: 80,
  height: 180,
  activity_level: 1.2,
  goal_weight: 75,
};

/**
 * Mifflin-St Jeor Equation
 * Calculates daily calorie target with 500kcal deficit
 */
export function calculateDailyTarget(profile: ProfileFormData): number {
  // Validate inputs
  const age = Math.max(1, Math.min(120, profile.age || 30));
  const weight = Math.max(30, Math.min(300, profile.weight || 80));
  const height = Math.max(100, Math.min(250, profile.height || 180));
  const activityLevel = profile.activity_level || 1.2;

  let bmr = 10 * weight + 6.25 * height - 5 * age;

  if (profile.gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  const tdee = bmr * activityLevel;
  const target = Math.round(tdee - 500);

  // Minimum safe calories
  const minCalories = profile.gender === 'male' ? 1500 : 1200;
  return Math.max(target, minCalories);
}

/**
 * Safe number parsing with fallback
 */
export function safeParseInt(value: string, fallback: number): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
}

export function safeParseFloat(value: string, fallback: number): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Format date for display
 */
export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isWithinLastWeek(dateString: string): boolean {
  const date = new Date(dateString);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return date >= oneWeekAgo;
}
