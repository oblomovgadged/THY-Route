# ✈️ THY Route — Kullanım Kılavuzu

**THY Route**, Türk Hava Yolları esintili premium tasarımıyla uçuş planlaması, interaktif rota çizimi, gerçek zamanlı kolaborasyon ve iç hat bağlantıları içeren kapsamlı bir seyahat günlüğü uygulamasıdır.

🌐 Canlı Uygulama: **https://thy-route.vercel.app**

---

## 📋 İçindekiler

1. [İlk Kurulum & Başlangıç](#1-ilk-kurulum--başlangıç)
2. [Ana Sayfa — Uçuş Arama](#2-ana-sayfa--uçuş-arama)
3. [Harita & Rota Sayfası](#3-harita--rota-sayfası)
4. [Rota Oluşturma ve Düzenleme](#4-rota-oluşturma-ve-düzenleme)
5. [İç Hat Uçuşu Ekleme (Şehirlere Böl)](#5-iç-hat-uçuşu-ekleme-şehirlere-böl)
6. [Günlere Göre Planlama](#6-günlere-göre-planlama)
7. [Yer Keşfetme (Places)](#7-yer-keşfetme-places)
8. [Miles&Smiles Ortakları](#8-milessmiles-ortakları)
9. [Kolaborasyon — Co-Pilot Modu](#9-kolaborasyon--co-pilot-modu)
10. [Seyahat Raporu E-posta](#10-seyahat-raporu-e-posta)
11. [Seyahatlerim — Kaydetme ve Yönetim](#11-seyahatlerim--kaydetme-ve-yönetim)
12. [Bagaj & Pet Doğrulama](#12-bagaj--pet-doğrulama)
13. [PWA — Ana Ekrana Kurulum](#13-pwa--ana-ekrana-kurulum)
14. [Dil Değiştirme (TR/EN)](#14-dil-değiştirme-tren)
15. [Fiyat Alarmı Kurma](#15-fiyat-alarmı-kurma)
16. [Sık Sorulan Sorular (SSS)](#16-sık-sorulan-sorular-sss)

---

## 1. İlk Kurulum & Başlangıç

**Yükleme gerekmez.** Uygulama tamamen web tabanlıdır.

1. Tarayıcınızda **https://thy-route.vercel.app** adresini açın
2. Yükleme ekranı (THY uçuş ağı haritası) birkaç saniye içinde geçer
3. Ana sayfa açılır — Türkiye'deki uygulamayı andıran uçuş arama ekranı karşılar

> **💡 İpucu:** iPhone ve Android'de ana ekrana ekleyebilirsiniz. Uygulama internet bağlantısı olmadan da çalışır.

---

## 2. Ana Sayfa — Uçuş Arama

Ana sayfa, gerçek THY rezervasyon portalına benzer bir arayüz sunar.

### Uçuş Türü Seçimi
Sayfanın üst kısmındaki radyo butonlardan seçin:
- **Gidiş - Dönüş** — İki yön bilet arama
- **Tek Yön** — Sadece gidiş
- **İstanbul'da Stopover** — IST transit mola seçeneği
- **Çoklu Uçuş** — Farklı güzergahlar

### Nereden / Nereye
1. **Nereden** kutusuna kalkış şehri veya havalimanı kodunu yazın
2. Otomatik tamamlama önerileri çıkar — tıklayarak seçin
3. **Nereye** kutusuna varış noktasını yazın
4. İki ok (**⇄**) butonuyla kalkış/varış yer değiştirilir
5. **📍 butonu**: Konumunuza en yakın havalimanını otomatik bulur

### Tarih Seçimi
1. **Tarih** alanına tıklayın — çift takvim açılır
2. Sol takvimde gidiş tarihi, sağda dönüş tarihi seçin
3. Tarih aralığı seçildiğinde mavi renkte gösterilir
4. **Tamam** ile onayla, **Seçimi Temizle** ile sıfırla

### Yolcu & Kabin Sınıfı
1. **Yolcu/Kabin** alanına tıklayın
2. Yetişkin / Çocuk / Bebek / Engelli sayılarını `+` ve `-` ile ayarlayın
3. **Economy Class** veya **Business Class** seçin
4. **Tamam** ile onayla

### Uçuş Ara
Form doldurulduktan sonra **"Uçuş Ara"** butonuna basın. Sonuçlar:
- Simüle edilmiş THY uçuş listesi çıkar
- Her sonuç: uçuş kodu, süre, aktarma bilgisi, fiyat
- **"Rotayı Planla"** butonuyla rota sayfasına geçilir

---

## 3. Harita & Rota Sayfası

Uçuş seçilince veya "Rotayı Planla" butonuna basılınca **Harita Sayfası** açılır.

### Flight Board (Üst Başlık)
Sayfanın en üstündeki karanlık şerit:
- **Logo** — THY Route rozeti
- **Uçuş / Kalkış / Varış / Kapı** — Seçilen uçuşun bilgileri (JetBrains Mono yazı tipiyle)
- **Durum Badge** — "PLANLANIYOR" → "HAVALANDI" → "İNİŞ YAPILDI"
- **Saat & Tarih** — Gerçek zamanlı yerel saat
- **🌐 TR/EN** — Dil değiştirme butonu

### Harita Kontrolleri (Sol)
- **✏️ Rota Çiz** — Bu moda geçince haritaya her tıkladığınızda nokta eklenir
- **🗑️ Temizle** — Tüm rotayı siler (onay istenir)
- **📍 Konumum** — GPS ile mevcut konuma zoom yapar
- **🔍 Yakındaki Yerler** — Places panelini açar

### Sol Panel (Cockpit Control Panel)
Sağ taraftaki açılır panel 6 sekmeye ayrılır:
1. **Rota** — Waypoint listesi, kaydetme
2. **Yerler** — Google Places arama
3. **Rapor** — Email seyahat raporu
4. **Seyahatler** — Kayıtlı triplar
5. **Miles&Smiles** — Partner fırsatları
6. **Bagaj & Pet** — Ağırlık/boyut doğrulama

---

## 4. Rota Oluşturma ve Düzenleme

### Waypoint (Rota Noktası) Ekleme
**Yöntem 1 — Haritaya Tıklama:**
1. Haritada herhangi bir yere tıkla
2. Açılan popup'ta **"Rotaya Ekle"** butonuna bas
3. Nokta listenin en altına eklenir

**Yöntem 2 — Rota Çizim Modu:**
1. Sol kontrol panelinden **✏️ Rota Çiz** butonuna bas
2. Haritada istediğin noktaları ardışık tıkla
3. Her tıklamada yeni waypoint eklenir
4. Çizim modundan çıkmak için butona tekrar bas

**Yöntem 3 — POI Tıklama:**
1. Haritada kafeterya / müze / restoran logolarına tıkla
2. Açılan info pencerede **"Rotaya Ekle"** seçeneği çıkar

### Waypoint Düzenleme
Rota listesindeki her kart üzerinde:
- **✏️ Not Ekle:** Waypoint için not yaz (ör. "Saat 14:00 rezervasyon")
- **✕ Kaldır:** Waypointten çıkar (harita pinini siler)
- **Karta Tıkla:** Kartı aktifleştir (kırmızı vurgu)

### Sıralama
Şu an sürükle-bırak desteği yoktur. Noktaları silip yeniden ekleyerek sırayı değiştirebilirsiniz.

---

## 5. İç Hat Uçuşu Ekleme (Şehirlere Böl)

Bu özellik, uzun seyahatlerde birden fazla Türk şehrini ziyaret edecekler için tasarlanmıştır.

**Örnek Senaryo:**
New York'tan geliyor ve Türkiye'de 20 gün geçireceksiniz:
- İstanbul 7 gün (IST) → İç hat → Antalya 7 gün (AYT) → İç hat → Ankara 5 gün (ESB)

**Nasıl Yapılır:**
1. Rota sekmesinde **"İç Hat Uçuşu Ekle / Şehirlere Böl"** butonuna bas
2. **Kalkış Havalimanı (IATA):** `IST` yazın (İstanbul)
3. **Varış Havalimanı (IATA):** `AYT` yazın (Antalya)
4. **Uçuş Numarası:** İsteğe bağlı, örn. `TK 150`
5. **Hangi Günden Sonra:** Eklenecek günü seçin (ör. "1. Günden Sonra")
6. **Uçuşu Ekle** butonuna bas

Rota listesinde özel bir **Boarding Pass kartı** belirir:
```
IST ————✈————> AYT
    İÇ HAT UÇUŞU       [TK 150]
```

**Türkiye İçi IATA Kodları:**
| Havalimanı | IATA |
|---|---|
| İstanbul Havalimanı | IST |
| Sabiha Gökçen | SAW |
| Antalya | AYT |
| Ankara Esenboğa | ESB |
| İzmir Adnan Menderes | ADB |
| Trabzon | TZX |
| Bodrum Milas | BJV |
| Dalaman | DLM |
| Gaziantep | GZT |
| Kayseri | ASR |

---

## 6. Günlere Göre Planlama

Çok günlü seyahatler için gün bazlı planlama:

### Gün Ekleme
1. Gün seçici şeridinin sağındaki **+** butonuna bas
2. Yeni bir gün sekmesi eklenir (farklı renkte gösterilir)

### Günler Arası Geçiş
- Gün sekmeleri şeridin solunda renkli butonlar olarak sıralanır
- İstediğiniz güne tıklayın, o günün waypoint'leri gösterilir
- **"Tüm Günler"** sekmesi tüm rotayı tek seferde gösterir

### Waypoint Hangi Güne Ait?
- Aktif günde haritaya tıklayınca waypoint o güne eklenir
- Tam rota görünümünde her kart renkli bir gün rozeti gösterir (ör. "2. Gün")
- Günler arası bağlantı çizgisi kesik gri renktedir (iç hat bağlantısı gibi)

---

## 7. Yer Keşfetme (Places)

**Yerler** sekmesiyle aktif konumun çevresindeki yerleri keşfet:

### Filtreler
| Filtre | Açıklama |
|---|---|
| 🍴 Restoranlar | Yakındaki yemek mekanları |
| 🏨 Oteller | Konaklama seçenekleri |
| 🗺️ Turistik | Müze, anıt, turistik noktalar |
| ☕ Kafeler | Kahveci ve kafe |
| 🛍️ Alışveriş | AVM ve mağazalar |
| 🏠 Yerel Halk | Yöre halkının gittiği yerler |

### Kullanım
1. **Yerler** sekmesine tıkla
2. Arama kutusuna mekan adı ya da kategori yaz (örn. "Ramen", "Boutique Hotel")
3. **Ara** butonuna bas veya filtre chipine tıkla
4. Sonuçlar listede ve haritada pin olarak belirir
5. Sonuca tıklayınca **"Rotaya Ekle"** butonu çıkar

---

## 8. Miles&Smiles Ortakları

**Miles&Smiles** sekmesi, THY'nin iş ortaklarının tekliflerini gösterir.

### Kategoriler
- **✈ Araç Kiralama:** Avis, Budget, Hertz, Europcar, Sixt
- **🏨 Konaklama:** Hilton, Marriott, IHG, Radisson, Wyndham, Rixos, Divan
- **🚌 Havalimanı Ulaşım:** Havaş, Havaist
- **🌍 Seyahat Acentaları:** Setur, Jolly Tur
- **💳 Finans:** Garanti BBVA, Akbank, Yapı Kredi, İş Bankası, QNB Finansbank

### Nasıl Kullanılır?
1. Partner logosuna veya "Haritada Bul" butonuna tıkla
2. Harita o partnerin çevresindeki şubelerini pin olarak gösterir
3. Pin'e tıkla → rotana ekle → Miles kazanma bilgisi görünür

---

## 9. Kolaborasyon — Co-Pilot Modu

Birden fazla kişiyle aynı rotayı **gerçek zamanlı** düzenleyin.

### Link ile Davet Etme
1. **Rapor** sekmesine git
2. **"Davet Linkini Kopyala"** butonuna bas
3. Link kopyalanır: `https://thy-route.vercel.app/?tripId=TRIP-xxxx`
4. Bu linki WhatsApp, mesaj veya email ile paylaş

### Davete Katılma
1. Arkadaşın gönderdiği linke tıkla
2. "Rotaya Katıl" penceresi açılır
3. İsmini yaz ve **"Rotaya Dahil Ol"** butonuna bas
4. Artık aynı rotayı eş zamanlı düzenleyebilirsiniz

### Canlı Takip
- Birisi rota noktası eklediğinde veya sildiğinde tüm kullanıcılara anlık bildirim gelir
- Sağ üst köşedeki durum badgesi değişir: "PLANLANIYOR" → "AKTİF SEFER"

---

## 10. Seyahat Raporu E-posta

Oluşturduğunuz rotayı e-posta olarak kendinize veya arkadaşlarınıza gönderin.

1. **Rapor** sekmesine git
2. **Alıcı E-posta** kutusunu doldur
3. **Gönderen Adı** (isteğe bağlı)
4. **Ek Not** yazabilirsin
5. **"Rapor & Davet Gönder"** butonuna bas

E-posta içeriği:
- Tüm waypoint listesi (gün bazlı)
- Koordinatlar ve notlar
- Davet linki (Co-Pilot modu için)
- THY kurumsal imza

---

## 11. Seyahatlerim — Kaydetme ve Yönetim

### Trip Kaydetme
1. Rota sekmesinde **"Kaydet"** butonuna bas
2. Trip otomatik olarak **TRIP-xxxx** kodu ile Firestore'a kaydedilir
3. Sağ üst köşede yeşil "Kaydedildi" toastı görünür

### Seyahatler Listesi
**Seyahatler** sekmesinde tüm triplar listelenir:
- Trip kodu, tarih, waypoint sayısı
- **Yükle** — Seçilen tripi açar
- **Sil** — Kalıcı olarak siler

### Cihaz Eşitleme (Pilot ID)
Farklı cihazlarda aynı tripler görünsün:
1. **Seyahatler** sekmesindeki **"Cihaz Eşitleme Kodu"** alanını bul
2. **Kopyala** butonuyla kodu al
3. Diğer cihazda aynı kodu ilgili alana yapıştır
4. **"Diğer Cihazla Eşitle"** butonuna bas → triplar aktarılır

---

## 12. Bagaj & Pet Doğrulama

THY uçuşundan önce bagaj ve evcil hayvan boyutlarını doğrulayın.

1. **Bagaj & Pet** sekmesine git
2. **Hizmet Türü** seç:
   - Kabin içi evcil hayvan kafesi
   - Kargo bölümü evcil hayvan kafesi
   - Kayıtlı bagaj (standart)
   - Büyük (oversize) bagaj
3. **Genişlik / Yükseklik / Derinlik** (cm) gir
4. **Ağırlık** (kg) gir
5. **"Doğrula ve Hesapla"** butonuna bas

Sonuç kartı:
- ✅ **Uygun** — THY limitleri dahilinde
- ❌ **Uygun Değil** — Limit aşımı ve ücret bilgisi
- ⚠️ **Dikkat** — Sınır değer, ek bagaj önerilir

---

## 13. PWA — Ana Ekrana Kurulum

Uygulama, internet bağlantısı olmadan da çalışan **Progresif Web Uygulaması** (PWA) özelliğine sahiptir.

### iPhone / iPad (Safari)
1. Safari'de uygulamayı aç
2. Alt menüdeki **Paylaş** (kare + ok) ikonuna bas
3. **"Ana Ekrana Ekle"** seçeneğini seç
4. İsmi istersen değiştir → **Ekle**

### Android (Chrome)
1. Chrome'da uygulamayı aç
2. Adres çubuğunun sağındaki **⋮** menüsüne bas
3. **"Ana ekrana ekle"** veya **"Uygulamayı yükle"** seçeneğini seç
4. **Ekle**

### Offline Kullanım
- Kaydedilmiş rotalar ve waypoint'ler internet olmadan görüntülenir
- Yeni nokta ekleyemez ve harita güncelleyemezsin (harita Google sunucusu gerektirir)
- Bağlantı geri geldiğinde veriler otomatik senkronize edilir

---

## 14. Dil Değiştirme (TR/EN)

Uygulamanın tamamı Türkçe ve İngilizce olarak kullanılabilir.

- **Harita sayfasında:** Sağ üst köşedeki **🌐 TR** / **🌐 EN** butonuna bas
- **Ana sayfada:** Üst sağ köşedeki **"🌐 EN"** butonuna bas
- Mobilde: Panel başlığındaki **🌐** butonuna bas

Dil değişikliği tüm butonları, etiketleri ve mesajları anında günceller.

---

## 15. Fiyat Alarmı Kurma

Belirlediğiniz güzergah ve fiyata ulaşıldığında e-posta bildirimi alın.

1. Ana sayfada uçuş arama sonuçlarının altında **"Akıllı Fiyat Alarmı"** bölümünü bul
2. **Hedef Fiyat (TL)** gir (ör. 12000)
3. **E-posta adresin** gir
4. **"Alarm Kur"** butonuna bas

Sistem bilet fiyatı hedef değere ulaştığında e-posta gönderir.
> Not: Alarm verisi KVKK uyumlu şekilde şifreli ortamda saklanır.

---

## 16. Sık Sorulan Sorular (SSS)

**S: Harita görünmüyor, boş çıkıyor.**
C: Google Maps API yüklenmemiş olabilir. Sayfayı yenile. Sorun devam ederse "Harita yüklenemedi" ekranı görünür — bu durumda internet bağlantını ve tarayıcı izinlerini kontrol et.

**S: Rota kaydedildi mi?**
C: "Kaydet" butonuna bastıktan sonra sağ üst köşede "✓ Kaydedildi" mesajı çıkarsa kayıt başarılı. Trip kodunu (TRIP-xxxx) not al.

**S: Başka biri rotamı görebilir mi?**
C: Hayır. Trip ID'ni bilmeden kimse rotana erişemez. Paylaşmak istersen davet linkini kendin göndermelisin.

**S: İç hat uçuşu eklince haritada ne görünür?**
C: İç hat waypointi, harita üzerinde iki şehri bağlayan bir uçuş çizgisi (polyline) olarak gösterilmez — sadece rota listesinde boarding pass kartı olarak belirir. Gelecek güncellemelerde harita görselleştirmesi eklenecek.

**S: Kaç waypoint ekleyebilirim?**
C: Maksimum 100 waypoint (Firestore güvenlik kuralı). Tek bir trip için yeterlidir.

**S: Uygulama ücretsiz mi?**
C: Evet, tamamen ücretsizdir.

---

*THY Route Kullanım Kılavuzu — Haziran 2026*
*Geliştirici iletişim için: GitHub Issues*
