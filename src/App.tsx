import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useProfile } from './hooks/useProfile';
import { useMeals } from './hooks/useMeals';
import { compressImage } from './lib/gemini';
import { AuthView } from './components/AuthView';
import { OnboardingView } from './components/OnboardingView';
import { DashboardView } from './components/DashboardView';
import { AnalysisView } from './components/AnalysisView';
import { SettingsView } from './components/SettingsView';
import type { AppView, ProfileFormData, AnalysisResult } from './types';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-4" />
        <p className="text-slate-500">Laden...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, saveProfile, hasProfile } = useProfile();
  const { 
    todaysMeals, 
    dailyCalories, 
    weeklyCalories, 
    dailyMacros, 
    addMeal, 
    deleteMeal 
  } = useMeals();

  const [view, setView] = useState<AppView>('dashboard');
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // Loading state
  if (authLoading || (user && profileLoading)) {
    return <LoadingScreen />;
  }

  // Not authenticated
  if (!user) {
    return <AuthView />;
  }

  // Needs onboarding
  if (!hasProfile && view !== 'onboarding') {
    return (
      <OnboardingView
        onSave={async (formData: ProfileFormData) => {
          const success = await saveProfile(formData);
          if (success) {
            setView('dashboard');
          }
          return success;
        }}
      />
    );
  }

  // Handle image selection
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const compressed = await compressImage(base64);
        setCurrentImage(compressed);
        setView('analysis');
      } catch (err) {
        console.error('Image processing error:', err);
        alert('Bild konnte nicht verarbeitet werden.');
      }
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Handle save from analysis
  const handleSaveMeal = async (
    result: AnalysisResult,
    imageUrl: string,
    notes: string
  ): Promise<boolean> => {
    const success = await addMeal(result, imageUrl, notes);
    if (success) {
      setCurrentImage(null);
      setView('dashboard');
    }
    return success;
  };

  // Handle delete meal
  const handleDeleteMeal = async (mealId: string) => {
    if (window.confirm('Eintrag wirklich löschen?')) {
      await deleteMeal(mealId);
    }
  };

  // Settings view
  if (view === 'settings' && profile) {
    return (
      <SettingsView
        profile={profile}
        onSave={saveProfile}
        onBack={() => setView('dashboard')}
      />
    );
  }

  // Analysis view
  if (view === 'analysis' && currentImage) {
    return (
      <AnalysisView
        imageData={currentImage}
        onSave={handleSaveMeal}
        onCancel={() => {
          setCurrentImage(null);
          setView('dashboard');
        }}
      />
    );
  }

  // Dashboard (default)
  if (profile) {
    return (
      <DashboardView
        profile={profile}
        todaysMeals={todaysMeals}
        dailyCalories={dailyCalories}
        weeklyCalories={weeklyCalories}
        dailyMacros={dailyMacros}
        onNavigateToSettings={() => setView('settings')}
        onImageSelect={handleImageSelect}
        onDeleteMeal={handleDeleteMeal}
        onSignOut={signOut}
      />
    );
  }

  return <LoadingScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
