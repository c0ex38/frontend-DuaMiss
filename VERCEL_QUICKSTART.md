# 🚀 Vercel Deploy - Hızlı Başlangıç

## ✅ Hazırlık Tamamlandı
Aşağıdaki dosyalar eklendi:
- ✅ `vercel.json` - Routing ve build ayarları
- ✅ `.vercelignore` - Vercel'e yüklenmeyecek dosyalar
- ✅ `.env.example` - Environment variable şablonu
- ✅ `VERCEL_DEPLOY.md` - Detaylı deploy rehberi

## 🎯 Şimdi Yapılacaklar

### Adım 1: Vercel'e Git
https://vercel.com → GitHub ile giriş yap

### Adım 2: Projeyi Import Et
"Add New" → "Project" → `frontend-DuaMiss` reposunu seç

### Adım 3: Environment Variables Ekle
**ÖNEMLİ:** Deploy etmeden önce:
```
Name: REACT_APP_API_BASE_URL
Value: https://backend-duamiss.onrender.com/api/
```
Bu değişkeni **Production**, **Preview** ve **Development** için ekle.

### Adım 4: Deploy Et
"Deploy" butonuna tıkla ve bekle (~2-3 dakika)

## 🔍 Deploy Sonrası Kontrol

### Eğer Çalışmıyorsa:

#### 1️⃣ API Çağrıları Başarısız
Browser console'u aç (F12):
- `REACT_APP_API_BASE_URL not set` görüyorsan → Environment variable'ı ekle ve **Redeploy** yap
- CORS hatası → Backend'de Vercel domain'ini whitelist'e ekle

#### 2️⃣ Routing Hatası (404 on refresh)
- `vercel.json` dosyası commit edilmiş mi kontrol et
- Git push et ve redeploy yap

#### 3️⃣ Blank Page (Beyaz Sayfa)
- Browser console'da hata var mı bak
- Network tab'da API calls başarılı mı kontrol et

## 📱 Test Checklist
Deploy sonrası bu sayfaları test et:
- [ ] `/login` - Giriş sayfası yükleniyor
- [ ] `/register` - Kayıt sayfası yükleniyor
- [ ] `/dashboard` - Login sonrası dashboard açılıyor
- [ ] API calls - Network tab'da 200 OK responses
- [ ] Routing - Sayfa yenilediğinde 404 vermiyor

## 🆘 Yardım
Detaylı troubleshooting için: `VERCEL_DEPLOY.md` dosyasını oku

## 🔗 Faydalı Komutlar
```bash
# Lokal build test
npm run build

# Build'i lokal servis et
npx serve -s build -l 5000

# Vercel CLI ile deploy (opsiyonel)
npm i -g vercel
vercel
```

---
**Not:** `.env` dosyası GitHub'a push edilmez. Tüm environment variable'lar Vercel dashboard'dan eklenmeli.
