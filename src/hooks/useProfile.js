import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

const KEY = 'tryon_profile';

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(KEY)
      .then(raw => { if (raw) setProfile(JSON.parse(raw)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = useCallback(async (data) => {
    const updated = { ...profile, ...data };
    await SecureStore.setItemAsync(KEY, JSON.stringify(updated));
    setProfile(updated);
  }, [profile]);

  const clearProfile = useCallback(async () => {
    await SecureStore.deleteItemAsync(KEY);
    setProfile(null);
  }, []);

  return { profile, loading, saveProfile, clearProfile };
}
