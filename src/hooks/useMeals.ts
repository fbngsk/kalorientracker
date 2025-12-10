import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { isToday, isWithinLastWeek } from '../lib/calories';
import type { Meal, AnalysisResult } from '../types';

export function useMeals() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeals = useCallback(async () => {
    if (!user) {
      setMeals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch meals from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error: fetchError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setMeals(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError('Mahlzeiten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const addMeal = async (
    analysis: AnalysisResult,
    imageUrl?: string,
    notes?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const mealData = {
        user_id: user.id,
        name: analysis.name,
        calories: analysis.calories,
        macros: analysis.macros,
        type: analysis.type,
        image_url: imageUrl,
        notes: notes || null,
      };

      const { data, error: insertError } = await supabase
        .from('meals')
        .insert(mealData)
        .select()
        .single();

      if (insertError) throw insertError;

      setMeals((prev) => [data, ...prev]);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error adding meal:', err);
      setError('Mahlzeit konnte nicht gespeichert werden.');
      return false;
    }
  };

  const deleteMeal = async (mealId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: deleteError } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setMeals((prev) => prev.filter((m) => m.id !== mealId));
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting meal:', err);
      setError('Mahlzeit konnte nicht gelöscht werden.');
      return false;
    }
  };

  // Computed values
  const todaysMeals = meals.filter((m) => isToday(m.created_at));
  const weeksMeals = meals.filter((m) => isWithinLastWeek(m.created_at));

  const dailyCalories = todaysMeals.reduce((acc, m) => acc + m.calories, 0);
  const weeklyCalories = weeksMeals.reduce((acc, m) => acc + m.calories, 0);

  const dailyMacros = {
    protein: todaysMeals.reduce((acc, m) => acc + m.macros.protein, 0),
    carbs: todaysMeals.reduce((acc, m) => acc + m.macros.carbs, 0),
    fat: todaysMeals.reduce((acc, m) => acc + m.macros.fat, 0),
  };

  return {
    meals,
    todaysMeals,
    weeksMeals,
    loading,
    error,
    addMeal,
    deleteMeal,
    refetch: fetchMeals,
    dailyCalories,
    weeklyCalories,
    dailyMacros,
  };
}
