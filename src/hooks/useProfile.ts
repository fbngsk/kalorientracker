import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { calculateDailyTarget } from '../lib/calories';
import type { UserProfile, ProfileFormData } from '../types';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw fetchError;
      }

      setProfile(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Profil konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async (formData: ProfileFormData): Promise<boolean> => {
    if (!user) return false;

    try {
      const dailyTarget = calculateDailyTarget(formData);

      const profileData = {
        user_id: user.id,
        gender: formData.gender,
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        activity_level: formData.activity_level,
        goal_weight: formData.goal_weight,
        daily_target: dailyTarget,
        weekly_target: dailyTarget * 7,
        updated_at: new Date().toISOString(),
      };

      const { data, error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select()
        .single();

      if (upsertError) throw upsertError;

      setProfile(data);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Profil konnte nicht gespeichert werden.');
      return false;
    }
  };

  return {
    profile,
    loading,
    error,
    saveProfile,
    refetch: fetchProfile,
    hasProfile: !!profile,
  };
}
