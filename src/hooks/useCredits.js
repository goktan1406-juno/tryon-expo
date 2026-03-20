import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

const KEY = 'tryon_credits';

// credits: { count: number, plan: 'monthly'|'annual'|null, expiresAt: ISO string|null }
const DEFAULT = { count: 0, plan: null, expiresAt: null };

export function useCredits() {
  const [credits, setCredits] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(KEY)
      .then(raw => { if (raw) setCredits(JSON.parse(raw)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async (data) => {
    await SecureStore.setItemAsync(KEY, JSON.stringify(data));
    setCredits(data);
  };

  // Simulates a purchase — replace with real payment SDK later
  const purchasePlan = useCallback(async (plan) => {
    const now = new Date();
    const expiresAt = plan === 'annual'
      ? new Date(now.setFullYear(now.getFullYear() + 1)).toISOString()
      : new Date(now.setMonth(now.getMonth() + 1)).toISOString();
    const updated = { count: credits.count + 10, plan, expiresAt };
    await save(updated);
  }, [credits]);

  const purchaseCredits = useCallback(async (amount) => {
    const updated = { ...credits, count: credits.count + amount };
    await save(updated);
  }, [credits]);

  const spendCredit = useCallback(async () => {
    if (credits.count <= 0) throw new Error('Not enough credits.');
    const updated = { ...credits, count: credits.count - 1 };
    await save(updated);
  }, [credits]);

  const hasCredits = credits.count > 0;

  return { credits, loading, hasCredits, purchasePlan, purchaseCredits, spendCredit };
}
