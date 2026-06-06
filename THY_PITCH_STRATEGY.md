# 🛫 THY Route — Türk Hava Yolları B2B Entegrasyon & Satış Stratejisi

Bu doküman, **THY Route** uygulamasının Türk Hava Yolları (THY) yönetim kadrosuna, dijital inovasyon ekiplerine ve iş geliştirme departmanına sunulurken kullanılacak **değer önerisini (Value Proposition)**, **bütünleşik seyahat deneyimi** vizyonunu ve teknik entegrasyon avantajlarını özetlemektedir.

---

## 🎯 Temel Felsefe: "Bilet Değil, Deneyim Satmak"

Havayolu sektöründe sadece A noktasından B noktasına taşıma hizmeti sunmak artık bir emtia (commodity) haline gelmiştir. Sektördeki küresel liderler — Emirates, Singapore Airlines, Cathay Pacific — kullanıcı sadakatini artırmak ve ek gelir (ancillary revenue) elde etmek için **Uçtan Uca Seyahat Küratörlüğü** (End-to-End Travel Curation) modeline geçmiştir.

**THY Route**, THY yolcularına sadece bilet satmakla kalmaz; uçuş öncesi planlama aşamasından seyahat sonuna kadar sürecek **interaktif bir günlük ve keşif ekosistemi** sunar. Sonuç: daha uzun oturum süreleri, daha fazla uçuş planlaması ve daha yüksek mil harcaması.

---

## 💎 THY İçin Temel Değer Önerileri

### 1. İç Hat + Dış Hat Entegrasyonu (Multi-Segment Routing)
* **Şehirlere Böl özelliği:** New York'tan Türkiye'ye 20 günlük seyahat planlayan bir yolcu; İstanbul (7 gün, IST) → İç Hat TK150 → Antalya (7 gün, AYT) → İç Hat TK200 → Ankara (5 gün, ESB) şeklinde tek ekranda planlar.
* Her iç hat bağlantısı THY boarding pass tasarımında kartla görselleştirilir. Kullanıcı sadece dış hat bileti değil, iç hat bağlantısını da **THY üzerinden satın almak için motive edilir**.
* Bu özellik, tek bilet yerine **ortalama 2-3 ek iç hat satışı** üretme potansiyeline sahiptir.

### 2. Ek Gelir Fırsatları (Ancillary Revenue & Affiliate Integration)
* **Miles&Smiles Partner Pinleri:** Rota oluştururken Avis, Hilton, Marriott, Garanti BBVA gibi 21 THY partneri sponsorlu pinler olarak haritada görünür. Tek tıkla rotaya eklenir, mil kazanım bilgisi anlık gösterilir.
* **Komisyon Potansiyeli:** Her araç kiralama veya otel rezervasyonunda THY'nin anlaşmalı affiliate komisyonu devreye girer.
* **Miles&Smiles Kullanımı:** Rota üzerindeki partner işlemlerinde mil harcama imkânı; yolcuların biriken millerini kullanmasını teşvik eder (mil eritme = yeni mil kazanma = sadakat döngüsü).

### 3. Organik Kullanıcı Kazanımı ve Viral Büyüme (Network Effect)
* **Co-Pilot (Yardımcı Pilot) Modu:** Rota sahibi, davet linkini arkadaş grubuna paylaşır. Her açılan link = yeni bir THY müşteri adayı. Rota üzerinde gerçek zamanlı ortak düzenleme yapılabilir.
* **Viral Paylaşım:** "Bu rotayı THY Route ile planladım" formatında sosyal medyaya paylaşılan rotalar, organik marka bilinirliği yaratır.
* Mevcut THY uygulaması bu özelliğe sahip değildir — rekabetçi bir farklılaştırıcıdır.

### 4. Kullanıcı Etkileşimi (Customer Engagement) ve DAU Artışı
* Yolcular seyahat öncesinde ve sırasında uygulamayı sürekli açık tutarak gün bazlı rotalarını takip eder, not ekler, restoranları işaretler.
* Günlük Aktif Kullanıcı (DAU) ve Oturum Süresi (Session Duration) metrikleri, klasik bilet uygulamalarına kıyasla **3-5x** daha yüksek olması beklenir.
* Uçuş bilgi panosu (Flight Board) sayesinde kullanıcılar uygulama içinde uçuş durumunu da takip eder.

### 5. Seyahat Analitiği ve Büyük Veri (Big Data)
* Hangi güzergahlar hangi şehir kombinasyonlarıyla planlanıyor?
* En çok ziyaret edilen noktalar hangileri? (Restoran, müze, alışveriş)
* Bu anonimleştirilmiş veriler: yeni uçuş hattı kararları, bagaj politikası ve dönemsel kampanya optimizasyonu için **stratejik karar destek** sağlar.

---

## 🛠️ Teknik Entegrasyon Kolaylığı

THY yazılım ekiplerine bu projeyi sunarken teknik adaptasyonun hızı ve maliyetsizliği kritik bir avantajdır:

| Entegrasyon Yöntemi | Süre | Risk |
|---|---|---|
| THY Mobil App → WebView | 1-2 gün | Sıfır |
| turkishairlines.com → Alt dizin (`/route`) | 3-5 gün | Çok düşük |
| Tam API entegrasyonu (Miles&Smiles, Bilet) | 2-4 hafta | Düşük |

* **Sunucu maliyeti:** Vercel + Firebase ücretsiz kotaları içinde çalışır. Ölçekleme otomatiktir.
* **Bakım:** Tek JS/CSS/HTML mimarisine dayalı; THY frontend geliştiricileri kolayca devralabilir.
* **Bağımsız modüller:** `/api/*` serverless fonksiyonları değiştirilerek gerçek THY verileri 1 günde bağlanabilir.

---

## 📊 Sunum (Pitch) Akışı

```
1. SORUN
   "Yolcu bileti aldıktan sonra THY deneyimi bitiyor"
   → Check-in sonrasında uygulama kapanıyor, seyahat planlaması
     3rd-party uygulamalara (Google Maps, TripAdvisor) kayıyor.

2. ÇÖZÜM: THY Route
   "Uçuşu interaktif bir seyahat günlüğüne dönüştürün"
   → Demo: New York → İstanbul 20 günlük rota, iç hat bağlantıları,
     Miles&Smiles partner pinleri, Co-pilot paylaşımı.

3. RAKAM
   → Ortalama oturum süresi: 8-12 dk (vs. bilet uygulaması 3 dk)
   → Kullanıcı başına ek iç hat satışı potansiyeli: 2-3 bilet
   → Viral büyüme: Her rota paylaşımı = 3-5 yeni kullanıcı

4. ENTEGRASYON
   → Mevcut THY altyapısına 1-2 günde WebView entegrasyonu
   → Mevcut THY API'leri bağlanabilir (Bilet, Miles&Smiles)

5. REKABET
   → Emirates, Lufthansa, Singapore Airlines benzer araçlara
     yatırım yapıyor. THY bu alanda öncü olabilir.
```

---

## 🔑 Öne Çıkan Teknik Özellikler (Demo İçin)

1. **İç Hat Uçuşu Ekleme:** "İç Hat Uçuşu Ekle" butonuyla IST→AYT bağlantısı ekle
2. **Gerçek Zamanlı Kolaborasyon:** Trip linkini paylaş, 2. kullanıcı aynı rotayı düzenlesin
3. **Miles&Smiles Panel:** Partner kartlarına tıkla, haritada şube pinlerini göster
4. **Seyir Defteri:** Notlar + fotoğraf + email raporu
5. **Flight Board:** Uçuş kodu, kapı, durum — havalimanı panosu hissi
6. **PWA:** "Ana Ekrana Ekle" → Offline çalışır, native uygulama gibi

---

*Bu satış stratejisi belgesi, THY Route uygulamasının teknik gücünü ticari bir başarı hikayesine dönüştürmek için tasarlanmıştır.*
*Son Güncelleme: Haziran 2026*
