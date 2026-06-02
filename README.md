# 🛫 THY Route — İnteraktif Seyahat Planlama & Seyir Defteri

Turkish Airlines esintili premium tasarımı, Google Maps entegrasyonu, gerçek zamanlı kolaborasyon desteği ve PWA (Aşamalı Web Uygulaması) yapısı ile geliştirilmiş modern bir seyahat günlüğü uygulaması.

---

## ✨ Özellikler

* **Gerçek Zamanlı Kolaborasyon:** Aynı seyahat linkini (`?tripId=TRIP-xxxx`) paylaşarak yardımcı pilotlarınızla (diğer kullanıcılarla) aynı rota üzerinde anlık olarak ortak çalışabilir, değişiklikleri sesli ve görsel bildirimlerle takip edebilirsiniz.
* **Google Maps & Yer Keşfi:** Harita üzerinde serbest rota çizme modu, yerleşik Google Places arama altyapısı (restoranlar, oteller, turistik yerler) ve harita üzeri POI etkileşimi.
* **THY Partner Ayrıcalıkları:** Avis ve Hilton gibi THY iş ortaklarının sağladığı mil ve indirim fırsatlarını harita üzerinde sponsorlu pinler olarak görüntüleme ve tek tıkla rotaya dahil etme.
* **Uçuş Bilgi Panosu (Flight Board):** Aviationstack API altyapısıyla desteklenen, anlık kalkış/varış, uçuş kodu, kapı ve durum takibi sağlayan THY havalimanı panosu tasarımı.
* **Cihazlar Arası Eşitleme (Pilot ID):** Seyahatlerinizi bulutta yedeklemek ve farklı tarayıcılardaki listelerinizi birleştirmek için kullanabileceğiniz cihaz eşitleme kodu.
* **Seyir Defteri E-posta Raporu:** Oluşturduğunuz seyahat planını ve özel notları EmailJS aracılığıyla tek tıkla e-posta raporu olarak gönderebilme.
* **PWA Desteği:** Cihazınıza yerel bir uygulama gibi kurabilme (PWA), çevrimdışı çalışma desteği, şeffaf dairesel PWA ikonları ve uçuş ağı arka planlı, üstten hizalanmış özel yükleme ekranı (Splash Screen).

---

## 🎨 Görsel Tasarım & Varlıklar

Uygulamanın görsel kalitesini ve responsive yapısını en üst düzeye çıkarmak için aşağıdaki özel varlıklar Pillow (Python) aracılığıyla işlenerek entegre edilmiştir:

* **`icons/favicon.png` (128x128):** Orijinal turnalı dairesel amblemin tam koordinatlarından şeffaf olarak kırpılmış, deformasyonsuz sekme ikonu.
* **`icons/logo.png` & `icons/logo-dark.png` (h=150px):** Soluk arka plan filigranından arındırılmış, sırasıyla koyu ve açık temalar için beyaz/siyah yazılı, yüksek DPI ekranlar için keskinleştirilmiş horizontal logolar.
* **`icons/splash.png` (1024x558):** THY uçuş ağını gösteren, responsive tasarıma uygun ve hiçbir ekran boyutunda üst logosu kırpılmayacak şekilde `center top` hizalanmış arka plan görseli.

---

## 🛠️ Teknoloji Yığını

* **Ön Yüz:** Vanilla HTML5, CSS3 (Custom Variables, Flexbox, Grid), JavaScript (ES6+ Asenkron Mimari)
* **Veritabanı & Kimlik Doğrulama:** Firebase Cloud Firestore (Real-time Sync) & Firebase Anonymous Auth
* **E-posta Altyapısı:** EmailJS SDK
* **Harita Servisleri:** Google Maps JavaScript API, Google Places Library, Geocoding API
* **Sunucu Tarafı (Proxy / API Security):** Vercel Serverless Functions (Node.js)

---

## 🚀 Yerel Kurulum (Local Setup)

Projeyi bilgisayarınızda çalıştırmak için aşağıdaki adımları takip edebilirsiniz:

1. **Depoyu Klonlayın:**
   ```bash
   git clone https://github.com/oblomovgadged/THY-Route.git
   cd THY-Route
   ```

2. **Çevre Değişkenlerini Tanımlayın:**
   Proje kök dizininde `.env` adında bir dosya oluşturun ve API anahtarlarınızı buraya ekleyin:
   ```env
   AVIATIONSTACK_KEY=your_aviationstack_access_key
   GOOGLE_MAPS_KEY=your_google_maps_api_key
   ```

3. **Geliştirme Sunucusunu Başlatın:**
   Projeyi yerel serverless fonksiyonlarla birlikte test etmek için Vercel CLI kullanabilirsiniz:
   ```bash
   # Vercel CLI yoksa yükleyin
   npm install -g vercel

   # Yerel geliştirme ortamını başlatın
   vercel dev
   ```

---

## 🔒 Firestore Güvenlik Kuralları (Security Rules)

Uygulama, veritabanına yetkisiz erişimleri engellemek için Firebase Anonymous Authentication ile entegre çalışmaktadır. Firebase Console üzerindeki Cloud Firestore güvenlik kuralları aşağıdaki gibi yapılandırılmıştır:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trips/{tripId} {
      // Rota paylaşımı (collaboration) için belirli bir ID'ye sahip seyahatin okunmasına (get) ve yazılmasına izin ver.
      // Tüm seyahatleri topluca listelemeyi (list) sızıntı koruması amacıyla yasakla.
      allow get, write: if request.auth != null;
      allow list: if false;
    }
    match /users/{userId} {
      // Kullanıcılar sadece kendi kimliklerine ait (UID) verileri okuyup yazabilirler.
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /price_alerts/{alertId} {
      // E-postaları korumak için istemci tarafından alarmların okunmasını engelle.
      // Yalnızca oturum açmış kullanıcıların alarm eklemesine ve silmesine (write) izin ver.
      allow write: if request.auth != null;
      allow read: if false;
    }
  }
}
```

---

## 🛡️ Güvenlik ve API Koruması (Security & API Protection)

Uygulama, güvenlik ve veri sızıntılarını önlemek amacıyla aşağıdaki 5 kritik güvenlik katmanı ile güçlendirilmiştir:

1. **Google Maps API Key Koruması:**
   * Google Cloud Console üzerinden API anahtarı sınırlandırılarak sadece `http://localhost/*` ve `https://thy-route.vercel.app/*` kaynaklarından gelen harita yükleme isteklerine izin verilmiştir.

2. **Firebase Config ve Firestore Veri Koruması:**
   * Firebase yapılandırma bilgileri istemci tarafında yer alsa da, yukarıda belirtilen **Firestore Security Rules** sayesinde yetkilendirilmemiş kişilerin veritabanı sorguları yapması veya diğer kullanıcıların rotalarını listelemesi tamamen engellenmiştir.

3. **EmailJS Proxy Entegrasyonu (Serverless Backend):**
   * Ön yüzde açıkta duran `serviceId`, `templateId` ve `publicKey` bilgileri kod tabanından tamamen temizlenmiştir.
   * E-posta gönderim mantığı [api/send-email.js](file:///c:/Users/borak/OneDrive/Desktop/Route/api/send-email.js) serverless fonksiyonuna taşınmıştır. Değerler Vercel üzerinden Environment Variables (Çevre Değişkenleri) olarak güvenle saklanmaktadır.

4. **Kişisel Verilerin ve Fiyat Alarmlarının Koruması:**
   * Fiyat takibi için girilen e-posta adresleri `/price_alerts` koleksiyonunda saklanırken, istemci tarafı okumaları tamamen kapatılarak verilerin kazınması (data scraping) engellenmiştir.

5. **Dinamik CORS Whitelisting:**
   * API uç noktalarındaki güvensiz `Access-Control-Allow-Origin: '*'` (CORS) yapısı kaldırılarak dinamik CORS kontrolü eklenmiştir.
   * Sunucu tarafındaki isteklerin `Origin` başlığı kontrol edilerek sadece localhost, `thy-route.vercel.app` ve Vercel Preview domainlerine izin verilmekte, yabancı kaynaklı istekler `403 Forbidden` hatasıyla engellenmektedir.

---

## 🌐 Canlı Yayın (Deployment)

Projenin master dalına yapılan her push işlemi, GitHub entegrasyonu sayesinde **Vercel** üzerinde otomatik olarak derlenir ve canlıya alınır:
👉 **[https://thy-route.vercel.app](https://thy-route.vercel.app)**
