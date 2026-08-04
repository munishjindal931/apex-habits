import { useCallback, useEffect, useState } from 'react';
import { Settings } from '../types';
import { loadSettings, saveSettings } from '../storage';

const FALLBACK: Settings = {
  onboardingComplete: false,
  notificationsEnabled: false,
  soundEnabled: true,
  hapticsEnabled: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(FALLBACK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings().then((stored) => {
      setSettings(stored);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveSettings(settings);
  }, [settings, loaded]);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  return { settings, loaded, updateSettings };
}
