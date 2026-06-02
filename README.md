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

6. **Çoklu Kullanıcı Çakışma Önleme (Optimistic Locking & Transactions):**
   * Aynı rota üzerinde birden fazla pilotun (kullanıcının) aynı anda değişiklik yapması durumunda veri ezilmesini (Last Write Wins) önlemek amacıyla **Firestore Transactions** altyapısı kurulmuştur.
   * Her rota dokümanı `version` alanı ile sürüm kontrolü altında tutulur. Eşzamanlı çakışma durumunda sunucu sürümü ile istemci sürümü karşılaştırılır; çakışma varsa güncelleme reddedilir ve kullanıcı uyarılır.

7. **Aviationstack API Key ve Dinamik HTTPS Güvencesi:**
   * Aviationstack API anahtarının Vercel üzerinde tanımlanmaması ihtimaline karşı akıllı bir varsayılan yedek (fallback) değer tanımlanarak uçuş aramalarının çökmesi engellenmiştir.
   * Ücretsiz üyelik planlarında Aviationstack API'nin sadece `http://` (şifresiz) bağlantıya izin vermesi kısıtı nedeniyle, tüm uçuş sorgulamaları sunucu tarafında (Vercel Serverless Function proxy) yapılarak güvenceye alınmıştır. İstemci ile sunucumuz arasındaki bağlantı **%100 HTTPS (şifreli)** olarak kalır. Eğer ücretli Aviationstack planına geçilirse, Vercel panelinden `AVIATIONSTACK_HTTPS=true` tanımlanarak uçuş sorgulamaları sunucu tarafında da tamamen HTTPS yapılabilir.

8. **IP Tabanlı Hız Sınırlandırması (Rate Limiting):**
   * API uç noktalarının (Google Maps anahtarı, Aviationstack limitleri ve EmailJS e-posta gönderimi) kötü niyetli botlar veya spam saldırıları tarafından tüketilmesini önlemek amacıyla sunucu tarafında IP tabanlı hız sınırlandırması (Rate Limiting) aktif edilmiştir.
   * `api/maps-key.js` için dakikada maks 5 istek, `api/flights.js` için dakikada maks 15 istek ve `api/send-email.js` için dakikada maks 3 e-posta gönderim sınırı getirilmiştir. Limit aşımında API'ler standart `429 Too Many Requests` hatası döndürür.

9. **Gelişmiş Çoklu Dil (İngilizce/Türkçe) ve Tipografi Düzeltmeleri:**
   * Uygulamanın tüm alanlarında (Uçuş Arama Sonuçları, Yer Arama, Miles&Smiles, Seyahatlerim listesi, toast bildirimleri, email ve işlem onay pencereleri) tam ve eksiksiz İngilizce desteği sağlanmıştır.
   * İngilizce dil seçildiğinde, CSS `text-transform: uppercase` kurallarının tarayıcı yerel ayarlarına bağlı olarak İngilizce kelimelerde Türkçe noktalı `İ` karakteri (örn: `TURKİSH AİRLİNES`, `FLİGHT ARRİVE`) üretme hatası, İngilizce kaynak sözlüklerin doğrudan büyük harfli (uppercase) olarak beslenmesiyle ve dinamik harf düzeltmeleriyle kökten çözülmüştür.

10. **Ana Ekran Form Yükleme ve JavaScript Sözdizimi Düzeltmesi:**
    * Dil güncellemeleri esnasında `js/app.js` dosyasında kalan mükerrer kod bloğu ve `}for one-way flight route` sözdizimi (syntax) hatası giderildi.
    * Bu hatanın tüm JavaScript motorunu kilitleyerek kalkış/varış autocomplete kutularını devre dışı bırakması ve gidiş/dönüş tarihlerini boş göstermesi sorunu tamamen çözüldü; form özellikleri ve varsayılan THY uçuş ağı simülasyonları başarıyla restore edildi.

11. **KVKK & GDPR Gizlilik Politikası Entegrasyonu:**
    * Kullanıcıların seyahat planları, adları, e-postaları ve konum verilerinin işlenme süreçlerini şeffaflaştırmak amacıyla KVKK (Kişisel Verilerin Korunması Kanunu) ve GDPR (General Data Protection Regulation) uyumlu interaktif bir **Gizlilik Politikası** paneli eklenmiştir.
    * Giriş ekranı alt bilgisine (footer), fiyat alarmı formuna ve e-posta raporlama sekmesine yasal aydınlatma metni onay linkleri yerleştirilmiştir. Bu sayede uygulamanın yasal uyumluluk standartları kurumsal THY satış/sunum kriterlerine uygun hale getirilmiştir.

12. **Gelişmiş Hata Yönetimi ve Çevrimdışı (Offline) Mod Koruması:**
    * Google Haritalar API'sinin internet bağlantısı veya API anahtarı yetkileri nedeniyle yüklenememesi durumu için dinamik script yükleyiciye hata dinleyicisi (`onerror`) ve küresel yetki reddi (`gm_authFailure`) geri çağrımı eklenmiştir. Yükleme başarısız olduğunda boş veya beyaz ekran yerine antrasit temada bilgilendirici bir çevrimdışı uyarı ekranı gösterilir.
    * Firebase Firestore bağlantısı koptuğunda veya başlatılamadığında seyahat planlama özellikleri kesintiye uğramaz; uygulama verileri tarayıcının `localStorage` hafızasında saklar ve Aviationstack verileri offline simülasyon motoruna kayarak uygulamanın çökmesi engellenir.
    * Tarayıcının internet bağlantı durumundaki değişiklikler (`online`/`offline` olayları) anlık izlenerek kullanıcıya Türkçe/İngilizce durum bildirimleri (toast) gösterilir ve çevrimdışı toplanan verilerin bağlantı geri geldiğinde sunucuyla eşitlemesi başlatılır.

## 🔮 Teknik Entegrasyon & API Yol Haritası (Technical Roadmap)

Uygulamanın mevcut mimarisi, kurumsal ölçekte canlı entegrasyonlara hazır modüler bir veri katmanına (data abstraction layer) sahiptir. Türk Hava Yolları (THY) teknik ekiplerinden resmi API yetkileri sağlandığında gerçekleştirilecek tam zamanlı entegrasyon planı aşağıda sunulmuştur:

1. **Uçuş Arama & Canlı Bilgi Entegrasyonu:**
   * **Mevcut Durum:** Aviationstack API ve dinamik kalkış/varış uçuş ağı simülasyon motoru kullanılmaktadır.
   * **Hedef Durum:** THY Live Flight Availability & Scheduling API entegrasyonu ile resmi uçuş kodları, bilet fiyatları, kapı numaraları ve uçak tipleri tam zamanlı ve %100 gerçek verilerle sunulacaktır.

2. **Sadakat Programı & Mil Entegrasyonu (Miles&Smiles):**
   * **Mevcut Durum:** M&S ortaklarına (Avis, Budget, Hilton vb.) ait mil kazanımları ve indirim oranları görsel prototip amaçlı zenginleştirilmiş mock verilerle gösterilmektedir.
   * **Hedef Durum:** THY Miles&Smiles Partner & Award Mileage API bağlantısı kurularak; kullanıcıların canlı hesap bakiyelerine göre özel teklifler sunulacak, Avis araç kiralama veya Hilton otel konaklamalarından kazanacakları miller tam zamanlı olarak hesaplanıp doğrudan Miles&Smiles üyelik profillerine işlenebilecektir.

3. **B2B Otel & Hizmet Rezervasyon Entegrasyonu:**
   * **Mevcut Durum:** Google Places veritabanı üzerinden yakınlardaki konaklama ve turistik noktalar listelenmektedir.
   * **Hedef Durum:** THY'nin anlaşmalı otel/konaklama API'leri ile harita üzerindeki oteller doğrudan uygulama içinden rezerve edilebilecek, mil harcama/kazanma seçenekleri dinamik olarak aktifleştirilecektir.

Bu entegrasyon adımları, client-side kodlarda herhangi bir arayüz değişikliği gerektirmeden, sadece `/api/*` serverless proxy fonksiyonlarındaki veri beslemelerinin güncellenmesiyle gerçekleştirilecektir.

---

## 🌐 Canlı Yayın (Deployment)

Projenin master dalına yapılan her push işlemi, GitHub entegrasyonu sayesinde **Vercel** üzerinde otomatik olarak derlenir ve canlıya alınır:
👉 **[https://thy-route.vercel.app](https://thy-route.vercel.app)**
