import axios from 'axios';

// ✏️ Change this to your machine's local IP when testing on a physical device.
// e.g. 'http://192.168.1.42:3001'  (find your IP: ipconfig on Windows / ifconfig on Mac)
// Android emulator → 'http://10.0.2.2:3001'
// iOS simulator    → 'http://localhost:3001'
// Bilgisayarının WiFi IP'si — ipconfig ile kontrol et
export const API_BASE_URL = 'https://tryon-backend-production-f948.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes — AI models are slow
});

/**
 * Run virtual try-on.
 *
 * @param {string}      userImageUri      — URI from expo-image-picker
 * @param {string|null} clothingImageUri  — URI from expo-image-picker, or null
 * @param {string|null} productLink       — product page URL to scrape, or null
 *
 * One of clothingImageUri or productLink must be provided.
 */
export async function runTryOn(userImageUri, clothingImageUri, productLink, category = 'tops') {
  const formData = new FormData();

  formData.append('userImage', {
    uri: userImageUri,
    type: 'image/jpeg',
    name: 'user.jpg',
  });

  if (clothingImageUri) {
    formData.append('clothingImage', {
      uri: clothingImageUri,
      type: 'image/jpeg',
      name: 'clothing.jpg',
    });
  }

  if (productLink) {
    formData.append('productLink', productLink);
  }

  formData.append('category', category);

  const response = await api.post('/api/try-on', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (!response.data.success) {
    throw new Error(response.data.error || 'Try-on başarısız oldu');
  }

  return response.data; // { success, image, steps }
}

export async function checkHealth() {
  const response = await api.get('/health', { timeout: 8000 });
  return response.data;
}
