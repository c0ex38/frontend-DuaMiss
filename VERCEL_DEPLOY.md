# Vercel Deploy Rehberi

## Vercel'de Deploy Adımları

### 1. Vercel'e Giriş Yap
- [vercel.com](https://vercel.com) adresinden GitHub hesabınla giriş yap

### 2. Projeyi Import Et
- "Add New" → "Project" → GitHub reposu seç: `frontend-DuaMiss`

### 3. Environment Variables (Çevre Değişkenleri) Ayarla
Vercel dashboard'da **Environment Variables** bölümüne şu değişkeni ekle:

#### Production Environment
```
REACT_APP_API_BASE_URL=https://backend-duamiss.onrender.com/api/
```

**ÖNEMLİ:** 
- Değişken adı **tam olarak** `REACT_APP_API_BASE_URL` olmalı (Create React App için `REACT_APP_` prefix zorunlu)
- Değer sonunda `/` ile bitmeli (API endpoint'leriniz buna göre ayarlanmış)
- Vercel'de **Production**, **Preview** ve **Development** için ayrı ayrı ayarlayabilirsiniz

### 4. Build & Output Settings
Vercel otomatik algılar ama kontrol edin:
- **Framework Preset:** Create React App
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Install Command:** `npm install`

### 5. Deploy Et
- "Deploy" butonuna tıkla
- Build loglarını izle

## Yaygın Sorunlar ve Çözümler

### ❌ Sorun 1: API Çağrıları Çalışmıyor
**Sebep:** Environment variable ayarlanmamış
**Çözüm:** 
1. Vercel Dashboard → Projenizi seçin → Settings → Environment Variables
2. `REACT_APP_API_BASE_URL` ekleyin
3. "Redeploy" yapın (Deployments → üç nokta → Redeploy)

### ❌ Sorun 2: Routing 404 Veriyor (örn: /dashboard yenilediğinde hata)
**Sebep:** SPA routing için rewrite kuralı eksik
**Çözüm:** `vercel.json` dosyası eklendi (bu repo'da mevcut), rewrites bölümü tüm route'ları index.html'e yönlendiriyor

### ❌ Sorun 3: Build Başarısız Oluyor
**Sebep:** Genellikle npm versiyonu veya bağımlılık sorunları
**Çözüm:**
1. Vercel loglarını kontrol edin
2. Gerekirse `package.json`'a engines ekleyin:
   ```json
   "engines": {
     "node": ">=18.0.0",
     "npm": ">=9.0.0"
   }
   ```

### ❌ Sorun 4: Blank White Page (Beyaz Sayfa)
**Sebep:** JavaScript hatası veya yanlış PUBLIC_URL
**Çözüm:**
1. Browser console'u açın (F12) → hataları kontrol edin
2. `package.json`'da `homepage` alanı varsa kaldırın veya doğru ayarlayın

### ❌ Sorun 5: CORS Hatası
**Sebep:** Backend CORS ayarları Vercel domain'ini içermiyor
**Çözüm:**
Backend'de (Django/Flask vb.) CORS whitelist'e Vercel domain'inizi ekleyin:
```python
# Django örneği
CORS_ALLOWED_ORIGINS = [
    "https://your-app.vercel.app",
]
```

## Build Testi (Lokal)
Deploy etmeden önce lokal build test edin:
```bash
npm run build
npx serve -s build -l 5000
```
http://localhost:5000'de test edin - routing, API calls vb. çalışıyor mu?

## Güvenlik Notları
- `.env` dosyası Vercel'e push edilmez (`.vercelignore` ve `.gitignore`'da)
- Tüm environment variable'lar Vercel dashboard'dan eklenmeli
- Production ve Preview için farklı API URL'leri kullanabilirsiniz

## Redeploy (Yeniden Deploy)
Environment variable değiştirdikten sonra:
1. Vercel Dashboard → Deployments
2. En son deployment'ın yanındaki üç nokta → **Redeploy**
3. "Use existing Build Cache" seçeneğini **KALDIRIN** (değişkenlerin uygulanması için)

## Monitoring
Deploy olduktan sonra:
- Vercel Dashboard → Logs → Runtime Logs (production hataları)
- Browser Console (F12) → client-side hatalar
- Network tab → API call'ları kontrol et

## Faydalı Linkler
- [Vercel Docs - Create React App](https://vercel.com/docs/frameworks/create-react-app)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)
