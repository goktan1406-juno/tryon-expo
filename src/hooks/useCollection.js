import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

const KEY = 'tryon_collection';

export function useCollection() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    SecureStore.getItemAsync(KEY)
      .then(raw => { if (raw) setItems(JSON.parse(raw)); })
      .catch(() => {});
  }, []);

  const persist = async (data) => {
    await SecureStore.setItemAsync(KEY, JSON.stringify(data));
    setItems(data);
  };

  const addItem = useCallback(async ({ resultImage, clothingImageUri }) => {
    const entry = {
      id: Date.now().toString(),
      resultImage,
      clothingImageUri: clothingImageUri || null,
      savedAt: new Date().toISOString(),
    };
    const updated = [entry, ...items];
    await persist(updated);
  }, [items]);

  const removeItem = useCallback(async (id) => {
    const updated = items.filter(i => i.id !== id);
    await persist(updated);
  }, [items]);

  return { items, addItem, removeItem };
}
