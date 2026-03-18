# AI Virtual Try-On — Expo + Express

Try any outfit from the internet. Upload your photo, paste a product link → AI generates the try-on.

---

## Project structure

```
tryon-expo/
├── App.js                        ← Expo entry point + navigation
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js
│   │   ├── UploadScreen.js       ← photo upload + product link OR clothing image
│   │   ├── ProcessingScreen.js   ← progress UI + API call
│   │   └── ResultScreen.js       ← result + compare + share
│   ├── services/
│   │   └── api.js                ← axios client (set API_BASE_URL here)
│   ├── hooks/
│   │   └── useImagePicker.js
│   └── utils/
│       └── theme.js
└── backend/
    ├── server.js
    ├── .env                      ← REPLICATE_API_TOKEN goes here
    ├── routes/tryon.js
    ├── controllers/tryonController.js
    └── services/
        ├── replicateService.js   ← removeBackground / runTryOn / upscaleImage
        ├── scraperService.js     ← scrape product image from URL
        └── tryonPipeline.js      ← full pipeline orchestration
```

---

## Pipeline

```
product_link  OR  clothing image (direct upload)
        ↓
  scraperService  (axios + cheerio → puppeteer fallback)
        ↓
  replicateService.removeBackground  (briaai/rmbg)
        ↓
  replicateService.runTryOn          (lucataco/idm-vton)
        ↓
  replicateService.upscaleImage      (nightmareai/real-esrgan)
        ↓
  final try-on image URL  →  app
```

---

## Setup

### Step 1 — Get a Replicate API token

Sign up at https://replicate.com → Account → API Tokens → copy your token.

### Step 2 — Configure backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and set:
```
REPLICATE_API_TOKEN=r8_your_token_here
```

### Step 3 — Install backend dependencies

```bash
cd backend
npm install
```

### Step 4 — Install frontend dependencies

```bash
cd ..          # back to tryon-expo root
npm install
```

### Step 5 — Set your machine's local IP in the frontend

Open `src/services/api.js` and set `API_BASE_URL`:

| Device                   | Value                         |
|--------------------------|-------------------------------|
| Android emulator         | `http://10.0.2.2:3001`        |
| iOS simulator            | `http://localhost:3001`       |
| Physical phone (same WiFi) | `http://192.168.x.x:3001`  |

Find your IP: run `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

---

## Running locally

Open **two terminals**:

**Terminal 1 — Backend**
```bash
cd tryon-expo/backend
npm run dev
```
Expected output:
```
✅  TryOn backend running on http://localhost:3001
   Replicate token: ✓ set
```

**Terminal 2 — Expo frontend**
```bash
cd tryon-expo
npx expo start
```
Scan the QR code with Expo Go on your phone.

---

## API

### POST /api/try-on

**Content-Type:** `multipart/form-data`

| Field           | Type   | Required | Description                            |
|-----------------|--------|----------|----------------------------------------|
| userImage       | file   | Yes      | Person photo (JPEG/PNG/WebP, max 15MB) |
| clothingImage   | file   | No*      | Clothing image direct upload           |
| productLink     | string | No*      | Product page URL to scrape             |

*One of `clothingImage` or `productLink` must be provided.

**Response:**
```json
{
  "success": true,
  "image": "https://replicate.delivery/...",
  "steps": {
    "scraped": "https://...",
    "backgroundRemoved": "https://...",
    "tryOn": "https://...",
    "upscaled": "https://..."
  }
}
```

**Health check:** `GET /health`

---

## Troubleshooting

**"Network request failed"**
→ Verify `API_BASE_URL` in `src/services/api.js`
→ Make sure the backend (`npm run dev`) is running
→ Phone and computer must be on the same WiFi (physical device)
→ Test: open `http://localhost:3001/health` in your browser

**"REPLICATE_API_TOKEN is not set"**
→ Check `backend/.env` — make sure the token is set correctly

**Scraping failed for a product link**
→ Some sites block scrapers — use the "Görsel Yükle" tab to upload the clothing image directly instead

**Module not found / cache issues**
```bash
npx expo start --clear
```

**Expo Go QR not loading**
```bash
npx expo start --tunnel
```
