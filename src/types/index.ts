// --- Core Types ---

export interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  macros: MacroNutrients;
  created_at: string;
  image_url?: string;
  notes?: string;
  type: 'food' | 'drink';
}

export interface UserProfile {
  id: string;
  user_id: string;
  gender: 'male' | 'female';
  age: number;
  weight: number; // kg
  height: number; // cm
  activity_level: number;
  goal_weight: number;
  daily_target: number;
  weekly_target: number;
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  name: string;
  calories: number;
  macros: MacroNutrients;
  type: 'food' | 'drink';
  reasoning: string;
}

// --- Form Types ---

export interface ProfileFormData {
  gender: 'male' | 'female';
  age: number;
  weight: number;
  height: number;
  activity_level: number;
  goal_weight: number;
}

// --- Auth Types ---

export interface AuthUser {
  id: string;
  email: string;
}

// --- View Types ---

export type AppView = 'loading' | 'auth' | 'onboarding' | 'dashboard' | 'analysis' | 'settings';
