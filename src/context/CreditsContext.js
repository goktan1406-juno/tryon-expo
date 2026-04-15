import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';

const KEY = 'tryon_credits';
const DEFAULT = { count: 0, plan: null, expiresAt: null };

const CreditsContext = createContext(null);

export function CreditsProvider({ children }) {
  const [credits, setCredits] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(KEY)
      .then(raw => { if (raw) setCredits(JSON.parse(raw)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const purchasePlan = useCallback(async (plan) => {
    setCredits(prev => {
      const credits_to_add = plan === 'annual' ? 120 : 10;
      const updated = { ...prev, count: prev.count + credits_to_add, plan };
      SecureStore.setItemAsync(KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const purchaseCredits = useCallback(async (amount) => {
    setCredits(prev => {
      const updated = { ...prev, count: prev.count + amount };
      SecureStore.setItemAsync(KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const creditsRef = useRef(DEFAULT);

  // Keep ref in sync so spendCredit can read current value synchronously
  useEffect(() => { creditsRef.current = credits; }, [credits]);

  const spendCredit = useCallback(async () => {
    if (creditsRef.current.count <= 0) throw new Error('Not enough credits.');
    const updated = { ...creditsRef.current, count: creditsRef.current.count - 1 };
    await SecureStore.setItemAsync(KEY, JSON.stringify(updated));
    setCredits(updated);
  }, []);

  const hasCredits = credits.count > 0;

  return (
    <CreditsContext.Provider value={{ credits, loading, hasCredits, purchasePlan, purchaseCredits, spendCredit }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error('useCredits must be used inside CreditsProvider');
  return ctx;
}
