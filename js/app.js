// ============================================
// THY Route - App Core (app.js)
// Toast, Tabs, Clock, PWA, Settings, Modals
// ============================================

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8kCL4NC8UdtoQLaDYKCWeF1o16dek7CE",
  authDomain: "thyb-211cb.firebaseapp.com",
  projectId: "thyb-211cb",
  storageBucket: "thyb-211cb.firebasestorage.app",
  messagingSenderId: "1024892899293",
  appId: "1:1024892899293:web:92cad604ba9eefd517b034",
  measurementId: "G-DXSFM8XBMY"
};

// Hardcoded EmailJS & THY API Configuration (Empty on client for security, handled by backend API)
const emailJsConfig = {
  serviceId: "",
  templateId: "",
  publicKey: ""
};

const thyApiConfig = {
  clientId: "",      // Insert THY APIM Client ID here if needed
  clientSecret: ""   // Insert THY APIM Client Secret here if needed
};

(() => {
  'use strict';

  // ---- TOAST SYSTEM ----
  window.THY = window.THY || {};
  
  THY.t = (text) => {
    if (THY.currentLanguage !== 'en') return text;
    const translations = {
      'Yeni seyahat oluşturuldu!': 'New trip created!',
      'Seyahat başarıyla silindi.': 'Trip successfully deleted.',
      'Seyahat raporu ve davet bağlantısı başarıyla gönderildi! ✈️': 'Travel report and invite link successfully sent! ✈️',
      'Canlı seyahat veritabanından yüklendi! ✈️': 'Loaded from live travel database! ✈️',
      'Firebase SDK yüklenemedi. Çevrimdışı moda geçildi.': 'Failed to load Firebase SDK. Switched to offline mode.',
      'Firebase kurulumu başarısız oldu.': 'Firebase installation failed.',
      "Firestore bağlantısı başarısız. Lütfen Ayarlar sekmesinden geçerli Firebase bilgilerinizi girin.": "Firestore connection failed. Please enter valid Firebase details in the Settings tab.",
      "Firebase başlatılamadı. Ayarları kontrol edin.": "Firebase could not be started. Check settings.",
      "⚠️ Rota çakışması engellendi: Başka bir pilot bu rotayı güncelledi. Değişiklikleriniz yerel kaldı, sayfa güncelleniyor.": "⚠️ Route conflict prevented: Another pilot updated this route. Your changes remained local, page is reloading.",
      "Değişiklikler Firestore'a kaydedilemedi. Yerel önbelleğe yazıldı.": "Changes could not be saved to Firestore. Saved to local cache.",
      'Tarayıcınız konum servisini desteklemiyor.': 'Your browser does not support location services.',
      'Konumunuz tespit ediliyor...': 'Detecting your location...',
      'Konum bilgisi alınamadı. Lütfen listeden seçin.': 'Location info could not be retrieved. Please select from the list.',
      'THY Live API: CORS veya yetkilendirme engeli. Canlı dinamik simülasyona dönüldü.': 'THY Live API: CORS or auth block. Switched to live dynamic simulation.',
      'THY Canlı Uçuş Verileri Yüklendi! ✈️': 'THY Live Flight Data Loaded! ✈️',
      'THY API Bağlantı Sorunu. Dinamik Simülasyon Devreye Alındı.': 'THY API Connection Issue. Dynamic Simulation Activated.',
      'Dinamik Simülasyon Aktif ✈️': 'Dynamic Simulation Active ✈️',
      'Canlı Uçuş Verileri Yüklendi! ✈️': 'Live Flight Data Loaded! ✈️',
      'Canlı Bağlantı Kısıtlaması. Dinamik Simülasyon Devreye Alındı.': 'Live Connection Restriction. Dynamic Simulation Activated.',
      'Lütfen kalkış ve varış noktalarını seçin veya geçerli bir uçuş kodu girin.': 'Please select departure and arrival points or enter a valid flight code.',
      'Kalkış noktası bulunamadı.': 'Departure point not found.',
      'Varış noktası bulunamadı.': 'Arrival point not found.',
      'Konumlar çözümlenemedi.': 'Locations could not be resolved.',
      'Kalkış ve varış noktaları aynı olamaz.': 'Departure and destination points cannot be the same.',
      'Lütfen gidiş tarihini seçin.': 'Please select departure date.',
      'Lütfen dönüş tarihini seçin.': 'Please select return date.',
      'Dönüş tarihi gidiş tarihinden önce olamaz.': 'Return date cannot be before departure date.',
      'Tek Yön Uçuş: 3 Günlük Rota Planlanıyor... ✈️': 'One Way Flight: Planning 3-Day Route... ✈️',
      'Biniş Kartlarınız Hazırlanıyor... ✈️': 'Preparing your boarding passes... ✈️',
      'Dışa aktarılacak rota yok!': 'No route to export!',
      'JSON kopyalandı!': 'JSON copied!',
      'JSON dosyası indirildi!': 'JSON file downloaded!',
      'Rotaya başarıyla katıldınız!': 'Successfully joined the route!',
      'Aviationstack Canlı Uçuş Veritabanı Sorunu. Simülasyon Çalıştırıldı.': 'Aviationstack Live Flight Database Issue. Simulation Started.',
      'Temizlenecek rota yok!': 'No route to clear!',
      'Rota temizlendi!': 'Route cleared!',
      'Tarayıcınız konum desteği sunmuyor.': 'Your browser does not support location services.',
      'Konumunuza gidiliyor...': 'Going to your location...',
      'Konum alınamadı.': 'Location could not be retrieved.',
      'Yer arama servisi henüz hazır değil.': 'Places search service is not ready yet.',
      'Harita merkezi alınamadı.': 'Map center could not be retrieved.',
      'Bu bölgede yerel lezzet yok.': 'No local tastes in this area.',
      'Bu bölgede eşleşen yer bulunamadı.': 'No matching places found in this area.',
      'Bu bölgede veya küresel olarak eşleşen yer bulunamadı.': 'No matching places found in this area or globally.',
      'Hata: API Anahtarında Places API izni veya faturalandırma etkin değil. (REQUEST_DENIED)': 'Error: Places API permission or billing is not enabled on the API Key. (REQUEST_DENIED)',
      'Hata: API Anahtarında Places API izni yok. (REQUEST_DENIED)': 'Error: No Places API permission on the API Key. (REQUEST_DENIED)',
      'Arama başarısız oldu. Hata Kodu: ': 'Search failed. Error Code: ',
      'Yer arama servisi hazır değil.': 'Places search service is not ready.',
      'THY Partner Ayrıcalıkları Haritada Gösteriliyor!': 'THY Partner Privileges Displayed on Map!',
      'Partner Ayrıcalıkları Gizlendi': 'Partner Privileges Hidden',
      'Kayıtlı Seyahat Yok': 'No Saved Trips',
      'Henüz kaydedilmiş seyahatiniz bulunmuyor. Sol menüde bir rota çizdikten sonra "Kaydet" butonuna basarak seyahatlerinizi burada listeleyebilirsiniz.': 'You have no saved trips yet. After drawing a route on the left menu, you can list your trips here by clicking the "Save" button.',
      'Aktif': 'Active',
      'Gün': 'Day',
      'Durak': 'Stop',
      'Aç': 'Open',
      'Sil': 'Delete',
      'PLANLANIYOR': 'PLANNING',
      '⚠️ Seyahati Sil': '⚠️ Delete Trip',
      'Arama başarısız oldu. Hata Kodu:': 'Search failed. Error Code:',
      'Fiyat alarmı başarıyla kaldırıldı.': 'Price alert successfully removed.',
      'Avis araç kiralamalarında %30 İndirim + 500 Mil Hediye!': '30% Discount + 500 Miles on Avis Car Rentals!',
      'THY İş Ortaklığı ile konaklamalarda 3 Kat Mil Kazanma Fırsatı!': 'Earn 3x Miles on Stays with THY Hotel Partnership!',
      'rotayı temizledi 🗑️': 'cleared the route 🗑️',
      'rotayı güncelledi 🗺️': 'updated the route 🗺️',
      'rotadan bir nokta kaldırdı 🗑️': 'removed a stop from the route 🗑️',
      'uçuş panosu bilgilerini güncelledi ✈️': 'updated flight board information ✈️'
    };

    if (text.startsWith('Kaptan ')) {
      return 'Captain ' + THY.t(text.substring(7));
    }
    if (text.startsWith('Yardımcı Pilot ')) {
      return 'Co-Pilot ' + THY.t(text.substring(15));
    }
    if (text.startsWith('Konum algılandı: En yakın havalimanı ')) {
      const remainder = text.replace('Konum algılandı: En yakın havalimanı ', '');
      return `Location detected: Nearest airport ${remainder}`;
    }
    if (text.startsWith('seyahate yeni bir gün ekledi: Toplam ')) {
      const days = text.replace('seyahate yeni bir gün ekledi: Toplam ', '').replace(' Gün 📅', '');
      return `added a new day to the trip: Total ${days} ${days === '1' ? 'Day' : 'Days'} 📅`;
    }
    if (text.includes('günlük seyahat planı hazırlanıyor...')) {
      const city = text.split(' için ')[0];
      const days = text.split(' için ')[1].split(' günlük ')[0];
      return `Preparing a ${days}-day travel plan for ${city}...`;
    }
    if (text.endsWith(' civarı keşfediliyor...')) {
      const city = text.replace(' civarı keşfediliyor...', '');
      return `Exploring around ${city}...`;
    }
    if (text.endsWith(' yer bulundu!')) {
      const count = text.replace(' yer bulundu!', '');
      return `${count} ${count === '1' ? 'place' : 'places'} found!`;
    }
    if (text.endsWith(' yer bulundu! (30km yarıçapında)')) {
      const count = text.replace(' yer bulundu! (30km yarıçapında)', '');
      return `${count} ${count === '1' ? 'place' : 'places'} found! (30km radius)`;
    }
    if (text.endsWith(' sonuç bulundu!')) {
      const count = text.replace(' sonuç bulundu!', '');
      return `${count} ${count === '1' ? 'result' : 'results'} found!`;
    }
    if (text.endsWith(' sonuç bulundu! (Küresel arama)')) {
      const count = text.replace(' sonuç bulundu! (Küresel arama)', '');
      return `${count} ${count === '1' ? 'result' : 'results'} found! (Global search)`;
    }
    if (text.endsWith(' rotaya eklendi!')) {
      const placeName = text.replace(' rotaya eklendi!', '');
      return `${placeName} added to route!`;
    }
    if (text.endsWith('. Gün oluşturuldu!')) {
      const day = text.replace('. Gün oluşturuldu!', '');
      return `Day ${day} created!`;
    }
    if (text.includes('. Gün rotasına yeni rota noktası ekledi: ')) {
      const parts = text.split('. Gün rotasına yeni rota noktası ekledi: ');
      const day = parts[0];
      const name = parts[1];
      return `added a new stop to Day ${day} route: ${name}`;
    }
    if (text.endsWith('durağının notunu sildi 📝')) {
      const name = text.replace(' durağının notunu sildi 📝', '');
      return `deleted note for stop ${name} 📝`;
    }
    if (text.includes(' durağına not ekledi: ')) {
      const parts = text.split(' durağına not ekledi: ');
      const name = parts[0];
      const note = parts[1];
      return `added a note to stop ${name}: ${note}`;
    }
    if (text.startsWith('Alarm kuruldu! Fiyat ')) {
      const price = text.replace('Alarm kuruldu! Fiyat ', '').replace(' altına indiğinde haber vereceğiz. 🔔', '');
      return `Alert set! We will notify you when the price drops below ${price} TRY. 🔔`;
    }

    for (const trKey in translations) {
      if (text.startsWith(trKey)) {
        return translations[trKey] + text.substring(trKey.length);
      }
    }
    return text;
  };

  THY.userRole = 'Kaptan'; // Default role is Captain
  THY.activeDay = 1;
  THY.maxDays = 1;
  THY.dayColors = [
    '#0F2C59', // Day 1: THY Navy/Corporate Blue
    '#C8A951', // Day 2: THY Gold
    '#E31837', // Day 3: THY Red
    '#10B981', // Day 4: Emerald Green
    '#8B5CF6', // Day 5: Royal Purple
    '#14B8A6', // Day 6: Teal
    '#F59E0B'  // Day 7: Amber
  ];

  // ---- TRIP ID GENERATOR ----
  THY.generateTripId = () => {
    const now = new Date();
    const id = `TRIP-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*9999)).padStart(4,'0')}`;
    return id;
  };

  THY.clearLocalState = () => {
    if (typeof THY.resetFirstRender === 'function') {
      THY.resetFirstRender();
    }
    THY.waypoints = [];
    THY.activeDay = 0; // Default to Tam Rota view
    THY.maxDays = 1;
    if (typeof THY.renderTripState === 'function') {
      THY.renderTripState({ waypoints: [] });
    }
    if (typeof THY.updateDayTabs === 'function') {
      THY.updateDayTabs();
    }
    if (typeof THY.clearPlaces === 'function') {
      THY.clearPlaces();
    }
  };

  // Initialize Trip ID, Versioning (Optimistic Locking) & URL Parsing
  THY.currentTripId = null;
  THY.currentTripVersion = 1;

  const parseSharedRoute = () => {
    const params = new URLSearchParams(window.location.search);
    const urlTripId = params.get('tripId');
    if (urlTripId) {
      THY.currentTripId = urlTripId;
      const cachedTripId = localStorage.getItem('thy_current_trip_id');
      if (cachedTripId !== urlTripId) {
        THY.userRole = 'Yardımcı Pilot';
      } else {
        THY.userRole = localStorage.getItem('thy_user_role') || 'Kaptan';
      }
      localStorage.setItem('thy_current_trip_id', urlTripId);
      localStorage.setItem('thy_user_role', THY.userRole);
      console.log("🔗 Shared tripId loaded from URL:", urlTripId, "Role:", THY.userRole);
    } else {
      // Start fresh every time! Generate a new trip ID.
      THY.currentTripId = THY.generateTripId();
      THY.userRole = 'Kaptan';
      localStorage.setItem('thy_current_trip_id', THY.currentTripId);
      localStorage.setItem('thy_user_role', 'Kaptan');
      console.log("✈️ Fresh trip initialized on startup:", THY.currentTripId);
    }
  };
  parseSharedRoute();

  const UI_TRANSLATIONS = {
    tr: {
      '#bookingCard .booking-card-title': 'Nereye uçmak istersiniz?',
      '#lblDeparture': 'Nereden',
      '#flightDepartureInput': { placeholder: 'Şehir veya Havalimanı ara...' },
      '#lblDestination': 'Nereye',
      '#flightDestinationInput': { placeholder: 'Nereye gitmek istersiniz?' },
      '#lblDepDate': 'Gidiş Tarihi',
      '#lblRetDate': 'Dönüş Tarihi',
      '#lblCellDates': 'Tarih',
      '#lblCellPassengers': 'Yolcu / Kabin Sınıfı',
      '#lblRadioRoundTrip': 'Gidiş - Dönüş',
      '#lblRadioOneWay': 'Tek yön',
      '#lblMilesBooking': 'Ödül bilet - Millerinizle bilet alın',
      '#txtTabFlightTicket': 'Uçuş bileti',
      '#txtTabFlightHotel': 'Uçak bileti + Otel',
      '#txtTabCheckin': 'Check-in',
      '#txtTabManage': 'Bilet yönetimi',
      '#txtTabFlightStatus': 'Uçuş durumu',
      '#lblNavFlight': 'Uçuş Bileti',
      '#lblNavExplore': 'Keşfet',
      '#lblNavExperience': 'Seyahat Deneyimi',
      '#lblNavMiles': 'Miles&Smiles',
      '#lblLandingLogin': 'Giriş Yap',
      '#lblHeroTitle': 'Yazı Avrupa\'nın en iyisiyle keşfedin',
      '#lblHeroSubtitle': 'Seyahat planınızı oluşturun veya uçuş arayarak hemen biletinizi alın.',
      '#lblHeroCta': 'Keşfet',
      '#btnSearchFlights': 'Uçuş ara →',
      '#lblAllFlightPoints': '🌐 Tüm uçuş noktalarını gör',
      '#lblPreviousSearches': '🔍 Önceki aramalarım',
      '#subDestination': 'Gideceğiniz şehir',
      '#btnBackToSearch': '← Aramayı Düzenle',
      '#resultsRouteBanner': '🛫 UÇUŞ SEÇİN',
      '#lblAvailableFlightsTitle': 'Uygun Uçuşlar',
      '#stepOutbound .step-label': 'Gidiş Uçuşu',
      '#stepInbound .step-label': 'Dönüş Uçuşu',
      '#priceAlertWidget .price-alert-title': 'Akıllı Fiyat Alarmı (Mil & Fiyat Takipçisi)',
      '#priceAlertWidget .price-alert-desc': 'Seçtiğiniz tarihlerde bilet fiyatı veya mil değeri limitin altına indiğinde e-posta ile haber verelim.',
      '#alertTargetPrice': { placeholder: 'Hedef Fiyat (TL)' },
      '#alertEmail': { placeholder: 'E-posta Adresi' },
      '#btnCreatePriceAlert': 'Alarm Kur',
      '#lblBoardFlight': 'Uçuş',
      '#lblBoardDep': 'Kalkış',
      '#lblBoardArr': 'Varış',
      '#lblBoardGate': 'Kapı',
      '[data-tab="route"]': '<span class="panel-tab__icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg></span> Rota',
      '[data-tab="places"]': '<span class="panel-tab__icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span> Yerler',
      '[data-tab="email"]': '<span class="panel-tab__icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></span> Rapor',
      '[data-tab="trips"]': '<span class="panel-tab__icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg></span> Seyahatler',
      '[data-tab="miles-smiles"]': '<span class="panel-tab__icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></span> M&S',
      '#tabRoute .route-title': '<span class="icon">✈️</span> <span id="lblRouteTitle">Seyahat Rotası</span>',
      '#btnAddingDay': { title: 'Yeni Gün Ekle' },
      '#joinModal .modal-title': '🛫 Rotaya Katıl',
      '#joinModal p': 'Bir seyahat planına davet edildiniz! Rota üzerinde ortak çalışmak, durakları ve notları düzenlemek için lütfen isminizi girin.',
      '#joinModal label': 'İsminiz',
      '#joinUserNameInput': { placeholder: 'Adınızı yazın...' },
      '#btnConfirmJoin': '<span class="icon">✈️</span> Rotaya Dahil Ol',
      '#importModal .modal-title': '📥 Trip İçe Aktar',
      '#importJsonArea': { placeholder: 'JSON verisini buraya yapıştırın...' },
      '#btnCancelImport': 'İptal',
      '#btnConfirmImport': 'İçe Aktar',
      '#exportModal .modal-title': '📤 Trip Dışa Aktar',
      '#exportModal p': 'Bu seyahat planını başkalarıyla paylaşarak aynı rota üzerinde gerçek zamanlı olarak birlikte çalışabilirsiniz.',
      '#lblCaptainCode': 'Kaptan Eşitleme Kodu (Sizin Kodunuz)',
      '#lblCoPilotCode': 'Yardımcı Pilot Eşitleme Kodu (Davet Ettiğiniz Kişi)',
      '#btnCopyInviteLink': '<span class="icon"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></span> Davet Linkini Kopyala',
      '#btnShareByEmail': '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> Raporu E-posta ile Gönder',
      '#btnCloseExport': 'Kapat',
      '#btnCopyExport': '📋 Kopyala',
      '#btnDownloadExport': '⬇️ İndir',
      '#pilotSyncModal .modal-title': '🔄 Diğer Cihazla Eşitle',
      '#pilotSyncModal p': 'Diğer cihazınızdaki seyahatlerinizi bu cihaza aktarmak için o cihazın <strong>Cihaz Eşitleme Kodu</strong>\'nu girin. Bu işlem iki cihazdaki seyahat listelerini birleştirecektir.',
      '#pilotSyncModal label': 'Diğer Cihazın Eşitleme Kodu',
      '#targetPilotIdInput': { placeholder: 'Örn: a1b2c3d4...' },
      '#btnCancelSync': 'İptal',
      '#btnConfirmSync': 'Eşitlemeyi Başlat',
      '#lblEmailTo': 'Alıcı E-posta',
      '#emailTo': { placeholder: 'ornek@email.com' },
      '#lblEmailFromName': 'Gönderen Adı',
      '#emailFrom': { placeholder: 'Gezgin Adı' },
      '#lblEmailNote': 'Ek Not',
      '#emailNote': { placeholder: 'Seyahat hakkında notlarınız...' },
      '#lblEmailPreviewHeader': '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"></path></svg> THY Route — Seyahat Raporu',
      '#btnSendEmail': '<span class="icon"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></span> Rapor & Davet Gönder',
      '#lblSavedTripsTitle': '<span class="icon">💼</span> Seyahatlerim',
      '#lblSyncCodeTitle': 'Cihaz Eşitleme Kodu',
      '#syncStatus': '<span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #10B981;"></span> Eşitlendi',
      '#pilotIdInput': { value: 'Bağlanıyor...' },
      '#btnShowSyncModal': '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block;"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg> Diğer Cihazla Eşitle',
      '#lblMsTitle': '<span class="icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></span> Miles&Smiles Ortakları',
      '#lblMsDesc': '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block; color: var(--thy-gold);"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"></path></svg> Partner logolarına tıklayarak etraftaki şubelerini harita üzerinde anında keşfedebilir ve rotanıza ekleyebilirsiniz!',
      '#lblMsCarRental': '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block;"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2a3 3 0 0 0 6 0h2a3 3 0 0 0 6 0z"></path><circle cx="8" cy="17" r="2"></circle><circle cx="16" cy="17" r="2"></circle></svg> ARAÇ KİRALAMA',
      '#lblMsAccommodation': '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block;"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17M9 14h6v7H9v-7z"></path></svg> KONAKLAMA VE OTELLER',
      '#lblMsVip': '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block;"><rect x="2" y="4" width="20" height="12" rx="2"></rect><circle cx="6" cy="18" r="2"></circle><circle cx="18" cy="18" r="2"></circle><path d="M2 12h20M6 4v4M18 4v4"></path></svg> HAVALİMANI VIP TAŞIMACILIK',
      '#lblMsAgencies': '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block;"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"></path></svg> ACENTALAR VE GEZİ TURLARI',
      '#lblMsActiveAlerts': '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"></path></svg> AKTİF FİYAT ALARMLARI',
      '#lblTabBaggage': 'Bagaj & Pet',
      '#lblBaggageTitle': '<span class="icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><rect x="3" y="6" width="18" height="15" rx="2"></rect><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg></span> Bagaj & Pet Doğrulama',
      '#baggageResultStatusHeader': 'DOĞRULAMA SONUCU',
      '#lblBaggageIntro': 'Uçuş öncesi kabin içi evcil hayvan, kargo kafesi ve bagaj boyutlarınızı doğrulayın.',
      '#lblBaggageType': 'HİZMET TÜRÜ',
      '#optPetCabin': 'Kabin İçi Evcil Hayvan Kafesi',
      '#optPetCargo': 'Kargo Bölümü Evcil Hayvan Kafesi',
      '#optBaggageChecked': 'Kayıtlı Bagaj (Standart Tek Parça)',
      '#optBaggageOversize': 'Büyük (Oversize) Bagaj',
      '#lblBaggageWidth': 'Genişlik (cm)',
      '#lblBaggageHeight': 'Yükseklik (cm)',
      '#lblBaggageDepth': 'Derinlik (cm)',
      '#lblBaggageWeight': 'Ağırlık (kg)',
      '#btnBaggageCalculate': 'Doğrula ve Hesapla',
      '#lblPlacesEmptyTitle': 'Yer Keşfet',
      '#lblPlacesEmptyText': 'Filtrelere tıklayarak veya arama yaparak etraftaki yerleri keşfedin.',
      '#lblRouteEmptyTitle': 'Rota Boş',
      '#lblRouteEmptyText': 'Haritaya tıklayarak veya "Rota Çiz" modunu açarak nokta ekleyin.',
      '#btnSaveTrip': '<span class="icon">💾</span> Kaydet',
      '#btnNewTrip': '<span class="icon">➕</span> Yeni Trip',
      '#btnExportTrip': '<span class="icon">📤</span> Dışa Aktar',
      '#btnImportTrip': '<span class="icon">📥</span> İçe Aktar',
      '#btnReturnToLanding': '<span class="icon">🛫</span> Yeni Uçuş Ara / Ana Sayfa',
      '#btnConfirmCancel': 'Vazgeç',
      '#btnConfirmProceed': 'Seyahati Sil',
      '#noteModal .modal-title': '📝 Not Ekle / Düzenle',
      '#noteTxt': { placeholder: 'Bu konum için planlarınızı veya notunuzu yazın...' },
      '#btnDeleteNote': 'Notu Sil',
      '#btnCancelNote': 'İptal',
      '#btnSaveNote': 'Kaydet',
      '#pwaInstallBanner .pwa-install-text': '📲 THY Route\'u cihazına yükle!',
      '#btnInstallPwa': 'Yükle',
      '#btnDrawRoute': { title: 'Rota Çiz' },
      '#btnDrawRoute .tooltip': 'Rota Çiz',
      '#btnClearRoute': { title: 'Rotayı Temizle' },
      '#btnClearRoute .tooltip': 'Rotayı Temizle',
      '#btnMyLocation': { title: 'Konumum' },
      '#btnMyLocation .tooltip': 'Konumum',
      '#btnSearchPlaces': { title: 'Yakındaki Yerler' },
      '#btnSearchPlaces .tooltip': 'Yakındaki Yerler',
      '#confirmModal .modal-title': '⚠️ Seyahati Sil',
      '#priceAlertPrivacyNotice': '* Alarm kurarak verilerinizin <a href="#" class="privacy-modal-trigger" style="color: var(--thy-gold); text-decoration: underline;">Gizlilik Politikası (KVKK)</a> uyarınca işlenmesini kabul etmiş olursunuz.',
      '#emailReportPrivacyNotice': '* Rapor göndererek verilerinizin <a href="#" class="privacy-modal-trigger" style="color: var(--thy-gold); text-decoration: underline;">Gizlilik Politikası (KVKK)</a> uyarınca işlenmesini kabul etmiş olursunuz.'
    },
    en: {
      '#bookingCard .booking-card-title': 'Where would you like to fly?',
      '#lblDeparture': 'From',
      '#flightDepartureInput': { placeholder: 'Search city or airport...' },
      '#lblDestination': 'To',
      '#flightDestinationInput': { placeholder: 'Where would you like to go?' },
      '#lblDepDate': 'Departure Date',
      '#lblRetDate': 'Return Date',
      '#lblCellDates': 'Dates',
      '#lblCellPassengers': 'Passengers / Cabin Class',
      '#lblRadioRoundTrip': 'Round trip',
      '#lblRadioOneWay': 'One way',
      '#lblMilesBooking': 'Award ticket - Buy ticket with miles',
      '#txtTabFlightTicket': 'Flight ticket',
      '#txtTabFlightHotel': 'Flight + Hotel',
      '#txtTabCheckin': 'Check-in',
      '#txtTabManage': 'Manage booking',
      '#txtTabFlightStatus': 'Flight status',
      '#lblNavFlight': 'Flight Ticket',
      '#lblNavExplore': 'Explore',
      '#lblNavExperience': 'Experience',
      '#lblNavMiles': 'Miles&Smiles',
      '#lblLandingLogin': 'Sign In',
      '#lblHeroTitle': 'Discover Summer with Europe\'s Best',
      '#lblHeroSubtitle': 'Plan your next trip or search for flights and book your ticket now.',
      '#lblHeroCta': 'Discover',
      '#btnSearchFlights': 'Search flights →',
      '#lblAllFlightPoints': '🌐 View all flight destinations',
      '#lblPreviousSearches': '🔍 My previous searches',
      '#subDestination': 'Destination city',
      '#btnBackToSearch': '← Edit Search',
      '#resultsRouteBanner': '🛫 SELECT FLIGHT',
      '#lblAvailableFlightsTitle': 'Available Flights',
      '#stepOutbound .step-label': 'Outbound Flight',
      '#stepInbound .step-label': 'Inbound Flight',
      '#priceAlertWidget .price-alert-title': 'SMART PRICE ALERT (MILES & PRICE TRACKER)',
      '#priceAlertWidget .price-alert-desc': 'We will email you when ticket prices or mile values drop below your target limit.',
      '#alertTargetPrice': { placeholder: 'Target Price (TL)' },
      '#alertEmail': { placeholder: 'Email Address' },
      '#btnCreatePriceAlert': 'Set Alert',
      '#lblBoardFlight': 'FLIGHT',
      '#lblBoardDep': 'DEPARTURE',
      '#lblBoardArr': 'ARRIVAL',
      '#lblBoardGate': 'GATE',
      '[data-tab="route"]': '<span class="panel-tab__icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg></span> ROUTE',
      '[data-tab="places"]': '<span class="panel-tab__icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></span> PLACES',
      '[data-tab="email"]': '<span class="panel-tab__icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></span> REPORT',
      '[data-tab="trips"]': '<span class="panel-tab__icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg></span> TRIPS',
      '[data-tab="miles-smiles"]': '<span class="panel-tab__icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></span> M&S',
      '#tabRoute .route-title': '<span class="icon">✈️</span> <span id="lblRouteTitle">TRAVEL ROUTE</span>',
      '#btnAddingDay': { title: 'Add New Day' },
      '#joinModal .modal-title': '🛫 JOIN ROUTE',
      '#joinModal p': 'You have been invited to a travel route! Please enter your name to collaborate and edit stops and notes.',
      '#joinModal label': 'Your Name',
      '#joinUserNameInput': { placeholder: 'Enter your name...' },
      '#btnConfirmJoin': '<span class="icon">✈️</span> Join Route Now',
      '#importModal .modal-title': '📥 IMPORT TRIP',
      '#importJsonArea': { placeholder: 'Paste JSON data here...' },
      '#btnCancelImport': 'Cancel',
      '#btnConfirmImport': 'Import',
      '#exportModal .modal-title': '📤 EXPORT TRIP',
      '#exportModal p': 'Share this trip plan with others to collaborate on the same route in real-time.',
      '#lblCaptainCode': 'Captain Sync Code (Your Code)',
      '#lblCoPilotCode': 'Co-Pilot Sync Code (The Person You Invite)',
      '#btnCopyInviteLink': '<span class="icon"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></span> Copy Invite Link',
      '#btnShareByEmail': '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> Send Report by Email',
      '#btnCloseExport': 'Close',
      '#btnCopyExport': '📋 Copy',
      '#btnDownloadExport': '⬇️ Download',
      '#pilotSyncModal .modal-title': '🔄 SYNC WITH OTHER DEVICE',
      '#pilotSyncModal p': 'To transfer your trips from another device, enter its <strong>Device Sync Code</strong>. This will merge the trip lists on both devices.',
      '#pilotSyncModal label': 'Other Device Sync Code',
      '#targetPilotIdInput': { placeholder: 'E.g., a1b2c3d4...' },
      '#btnCancelSync': 'Cancel',
      '#btnConfirmSync': 'Start Syncing',
      '#lblEmailTo': 'Recipient Email',
      '#emailTo': { placeholder: 'example@email.com' },
      '#lblEmailFromName': 'Sender Name',
      '#emailFrom': { placeholder: 'Traveler Name' },
      '#lblEmailNote': 'Additional Note',
      '#emailNote': { placeholder: 'Your travel notes...' },
      '#lblEmailPreviewHeader': '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"></path></svg> THY Route — Travel Report',
      '#btnSendEmail': '<span class="icon"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></span> Send Report & Invite',
      '#lblSavedTripsTitle': '<span class="icon">💼</span> MY TRIPS',
      '#lblSyncCodeTitle': 'DEVICE SYNC CODE',
      '#syncStatus': '<span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #10B981;"></span> SYNCED',
      '#pilotIdInput': { value: 'Connecting...' },
      '#btnShowSyncModal': '<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block;"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg> SYNC WITH OTHER DEVICE',
      '#lblMsTitle': '<span class="icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></span> MILES&SMILES PARTNERS',
      '#lblMsDesc': '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block; color: var(--thy-gold);"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"></path></svg> Click on partner logos to instantly discover their nearby branches on the map and add them to your route!',
      '#lblMsCarRental': '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block;"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2a3 3 0 0 0 6 0h2a3 3 0 0 0 6 0z"></path><circle cx="8" cy="17" r="2"></circle><circle cx="16" cy="17" r="2"></circle></svg> CAR RENTAL',
      '#lblMsAccommodation': '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block;"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17M9 14h6v7H9v-7z"></path></svg> ACCOMMODATION & HOTELS',
      '#lblMsVip': '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block;"><rect x="2" y="4" width="20" height="12" rx="2"></rect><circle cx="6" cy="18" r="2"></circle><circle cx="18" cy="18" r="2"></circle><path d="M2 12h20M6 4v4M18 4v4"></path></svg> AIRPORT VIP TRANSPORTATION',
      '#lblMsAgencies': '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block;"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"></path></svg> AGENCIES & TOURS',
      '#lblMsActiveAlerts': '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px; display: inline-block;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"></path></svg> ACTIVE PRICE ALERTS',
      '#lblPlacesEmptyTitle': 'EXPLORE PLACES',
      '#lblPlacesEmptyText': 'Discover nearby places by clicking filters or searching.',
      '#lblRouteEmptyTitle': 'ROUTE IS EMPTY',
      '#lblRouteEmptyText': 'Add points by clicking on the map or activating "Draw Route" mode.',
      '#btnSaveTrip': '<span class="icon">💾</span> Save Route',
      '#btnNewTrip': '<span class="icon">➕</span> New Trip',
      '#btnExportTrip': '<span class="icon">📤</span> Export',
      '#btnImportTrip': '<span class="icon">📥</span> Import',
      '#btnReturnToLanding': '<span class="icon">🛫</span> New Search / Home',
      '#btnConfirmCancel': 'Cancel',
      '#btnConfirmProceed': 'Delete Trip',
      '#noteModal .modal-title': '📝 ADD / EDIT NOTE',
      '#noteTxt': { placeholder: 'Write your plans or notes for this location...' },
      '#btnDeleteNote': 'Delete Note',
      '#btnCancelNote': 'Cancel',
      '#btnSaveNote': 'Save',
      '#pwaInstallBanner .pwa-install-text': '📲 Install THY Route on your device!',
      '#btnInstallPwa': 'Install',
      '#btnDrawRoute': { title: 'Draw Route' },
      '#btnDrawRoute .tooltip': 'Draw Route',
      '#btnClearRoute': { title: 'Clear Route' },
      '#btnClearRoute .tooltip': 'Clear Route',
      '#btnMyLocation': { title: 'My Location' },
      '#btnMyLocation .tooltip': 'My Location',
      '#btnSearchPlaces': { title: 'Search Nearby Places' },
      '#btnSearchPlaces .tooltip': 'Search Nearby Places',
      '#confirmModal .modal-title': '⚠️ DELETE TRIP',
      '#priceAlertPrivacyNotice': '* By setting an alert, you consent to the processing of your data under the <a href="#" class="privacy-modal-trigger" style="color: var(--thy-gold); text-decoration: underline;">Privacy Policy</a>.',
      '#emailReportPrivacyNotice': '* By sending reports, you consent to the processing of your data under the <a href="#" class="privacy-modal-trigger" style="color: var(--thy-gold); text-decoration: underline;">Privacy Policy</a>.',
      '#lblTabBaggage': 'Baggage & Pet',
      '#lblBaggageTitle': '<span class="icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><rect x="3" y="6" width="18" height="15" rx="2"></rect><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg></span> Baggage & Pet Validation',
      '#baggageResultStatusHeader': 'VALIDATION RESULT',
      '#lblBaggageIntro': 'Verify your in-cabin pet, cargo cage, and baggage dimensions before your flight.',
      '#lblBaggageType': 'SERVICE TYPE',
      '#optPetCabin': 'In-Cabin Pet Carrier/Cage',
      '#optPetCargo': 'Cargo Hold Pet Cage',
      '#optBaggageChecked': 'Checked Baggage (Standard Single Piece)',
      '#optBaggageOversize': 'Oversize Baggage Limit',
      '#lblBaggageWidth': 'Width (cm)',
      '#lblBaggageHeight': 'Height (cm)',
      '#lblBaggageDepth': 'Depth (cm)',
      '#btnBaggageCalculate': 'Validate and Calculate'
    }
  };

  THY.currentLanguage = localStorage.getItem('thy_lang') || (navigator.language.startsWith('tr') ? 'tr' : 'en');

  THY.translateStatus = (statusStr) => {
    if (!statusStr) return '---';
    const lang = THY.currentLanguage || 'tr';
    if (lang === 'tr') {
      if (statusStr.includes('PLANNING') || statusStr.includes('SCHEDULED')) return 'PLANLANIYOR';
      if (statusStr.includes('DELAYED')) return 'GECİKMELİ';
      if (statusStr.includes('IN FLIGHT')) return 'UÇUŞTA';
      if (statusStr.includes('COMPLETED') || statusStr.includes('LANDED') || statusStr.includes('VARIS YAPILDI')) return 'VARIS YAPILDI';
      if (statusStr.includes('READY FOR TAKE OFF') || statusStr.includes('KALKIŞ HAZIR')) return 'KALKIŞ HAZIR';
      if (statusStr.includes('BOARDING') || statusStr.includes('BİNİŞ BAŞLADI')) return 'BİNİŞ BAŞLADI';
      if (statusStr.includes('GATE CLOSING') || statusStr.includes('KAPI KAPANIYOR')) return 'KAPI KAPANIYOR';
      if (statusStr.includes('LANDING') || statusStr.includes('İNİŞ YAPILIYOR')) return 'İNİŞ YAPILIYOR';
      if (statusStr.includes('CANCELLED') || statusStr.includes('İPTAL EDİLDİ')) return 'İPTAL EDİLDİ';
      return statusStr;
    } else {
      if (statusStr.includes('PLANLANIYOR')) return 'PLANNING';
      if (statusStr.includes('GECİKMELİ') || statusStr.includes('RÖTAR')) return 'DELAYED';
      if (statusStr.includes('UÇUŞTA')) return 'IN FLIGHT';
      if (statusStr.includes('TAMAMLANDI') || statusStr.includes('VARIS YAPILDI')) return 'COMPLETED';
      if (statusStr.includes('KALKIŞ HAZIR')) return 'READY FOR TAKE OFF';
      if (statusStr.includes('BİNİŞ BAŞLADI')) return 'BOARDING';
      if (statusStr.includes('KAPI KAPANIYOR')) return 'GATE CLOSING';
      if (statusStr.includes('İNİŞ YAPILIYOR')) return 'LANDING';
      if (statusStr.includes('İPTAL EDİLDİ')) return 'CANCELLED';
      return statusStr;
    }
  };

  THY.translateUI = (lang) => {
    THY.currentLanguage = lang;
    localStorage.setItem('thy_lang', lang);
    
    // Set Document Language dynamically to prevent browser text-transform issues with Turkish I vs English I
    document.documentElement.setAttribute('lang', lang);
    
    const dictionary = UI_TRANSLATIONS[lang];
    if (!dictionary) return;
    
    for (const selector in dictionary) {
      const elements = document.querySelectorAll(selector);
      const translation = dictionary[selector];
      
      elements.forEach(element => {
        if (typeof translation === 'string') {
          if (translation.includes('<')) {
            element.innerHTML = translation;
          } else {
            element.textContent = translation;
          }
        } else if (typeof translation === 'object') {
          for (const attr in translation) {
            if (attr === 'placeholder') {
              element.placeholder = translation[attr];
            } else if (attr === 'title') {
              element.setAttribute('title', translation[attr]);
            } else if (attr === 'value') {
              element.value = translation[attr];
            }
          }
        }
      });
    }
    
    const nextLangText = lang === 'tr' ? '🌐 EN' : '🌐 TR';
    const btnToggle = document.getElementById('btnLangToggle');
    const btnToggleLanding = document.getElementById('btnLangToggleLanding');
    const btnToggleMobile = document.getElementById('btnLangToggleMobile');
    
    if (btnToggle) btnToggle.textContent = nextLangText;
    if (btnToggleLanding) btnToggleLanding.textContent = nextLangText;
    if (btnToggleMobile) btnToggleMobile.textContent = nextLangText;
    
    const passengers = document.getElementById('flightPassengers');
    if (passengers) {
      const isEn = lang === 'en';
      passengers.options[0].text = isEn ? '1 Passenger' : '1 Yolcu';
      passengers.options[1].text = isEn ? '2 Passengers' : '2 Yolcu';
      passengers.options[2].text = isEn ? '3 Passengers' : '3 Yolcu';
      passengers.options[3].text = isEn ? '4 Passengers' : '4 Yolcu';
    }
    
    const statusText = document.getElementById('statusText');
    if (statusText && statusText.textContent) {
      statusText.textContent = THY.translateStatus(statusText.textContent);
    }

    // Translate dynamic partner buttons and descriptions
    const partnerBtns = document.querySelectorAll('.partner-item button');
    partnerBtns.forEach(btn => {
      btn.textContent = lang === 'en' ? 'Find on Map' : 'Haritada Bul';
    });

    document.querySelectorAll('.partner-item').forEach(item => {
      const query = item.dataset.query;
      const nameEl = item.querySelector('.partner-name');
      const offerEl = item.querySelector('.partner-offer');
      if (!nameEl || !offerEl) return;
      
      const isEn = lang === 'en';
      if (query === 'Avis') {
        nameEl.textContent = isEn ? 'Avis Car Rental' : 'Avis Araç Kiralama';
        offerEl.textContent = isEn ? '30% Discount + 500 Miles!' : '%30 İndirim + 500 Mil!';
      } else if (query === 'Budget Rent A Car') {
        nameEl.textContent = 'Budget Rent A Car';
        offerEl.textContent = isEn ? '25% Discount + 400 Miles!' : '%25 İndirim + 400 Mil!';
      } else if (query === 'Hilton Hotel') {
        nameEl.textContent = 'Hilton Hotels & Resorts';
        offerEl.textContent = isEn ? '3x Miles on Stays!' : 'Konaklamalarda 3 Kat Mil!';
      } else if (query === 'Marriott Hotel') {
        nameEl.textContent = 'Marriott Bonvoy';
        offerEl.textContent = isEn ? '500 Miles per Stay!' : 'Her Konaklamada 500 Mil!';
      } else if (query === 'Rixos Hotel') {
        nameEl.textContent = 'Rixos Hotels';
        offerEl.textContent = isEn ? '15% Discount + Double Miles!' : '%15 İndirim + Çift Mil!';
      } else if (query === 'Airport Transfer Shuttle') {
        nameEl.textContent = isEn ? 'Havaş & Havaist Transport' : 'Havaş & Havaist Ulaşım';
        offerEl.textContent = isEn ? '20% Mile Discount on Tickets!' : 'Bilet Alımlarında %20 Mil İndirimi!';
      } else if (query === 'Secure Drive Airport Transfer') {
        nameEl.textContent = 'Secure Drive VIP Transfer';
        offerEl.textContent = isEn ? '200 Bonus Miles on Transfer!' : 'Transferde 200 Mil Hediye!';
      } else if (query === 'Setur') {
        nameEl.textContent = isEn ? 'Setur Travel Agency' : 'Setur Seyahat Acentası';
        offerEl.textContent = isEn ? '2,500 Bonus Miles on Tours!' : 'Turlarda 2.500 Mil Hediye!';
      } else if (query === 'Jolly Tur') {
        nameEl.textContent = 'Jolly Tur';
        offerEl.textContent = isEn ? '10% Extra Mile Earnings!' : '%10 Ek Mil Kazanımı!';
      }
    });

    // Translate sponsored map button
    const btnThyPartners = document.getElementById('btnThyPartnersToggle');
    if (btnThyPartners) {
      btnThyPartners.innerHTML = `<span class="btn-icon"></span>${lang === 'en' ? 'THY Partners' : 'THY Partnerleri'}`;
    }

    // Places Tab Filters translation
    const placesInput = document.getElementById('placesSearchInput');
    if (placesInput) {
      placesInput.placeholder = lang === 'en' ? 'Search places... (e.g. Ramen, Hotel)' : 'Yer ara... (ör. Ramen, Hotel)';
    }

    const chips = document.querySelectorAll('.filter-chip');
    if (chips.length >= 6) {
      const chipLabels = lang === 'en' ? [
        '<svg class="chip-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v7c0 2.2 1.8 4 4 4v9h2v-9c2.2 0 4-1.8 4-4V2M6 2v4M8 2v4M18 2c-2.2 0-4 1.8-4 4v16h2V12h2v10h2V6c0-2.2-1.8-4-4-4z"></path></svg> Restaurants',
        '<svg class="chip-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 11h20M22 4v16M18 11v8M12 11v8M6 11V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"></path></svg> Hotels',
        '<svg class="chip-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg> Attractions',
        '<svg class="chip-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"></path></svg> Cafes',
        '<svg class="chip-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"></path></svg> Shopping',
        '<svg class="chip-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Locals\' Choice'
      ] : [
        '<svg class="chip-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v7c0 2.2 1.8 4 4 4v9h2v-9c2.2 0 4-1.8 4-4V2M6 2v4M8 2v4M18 2c-2.2 0-4 1.8-4 4v16h2V12h2v10h2V6c0-2.2-1.8-4-4-4z"></path></svg> Restoranlar',
        '<svg class="chip-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 11h20M22 4v16M18 11v8M12 11v8M6 11V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"></path></svg> Oteller',
        '<svg class="chip-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg> Turistik',
        '<svg class="chip-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"></path></svg> Kafeler',
        '<svg class="chip-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"></path></svg> Alışveriş',
        '<svg class="chip-svg" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Yerel Halk (Local)'
      ];
      chips.forEach((chip, i) => {
        if (chipLabels[i]) {
          chip.innerHTML = chipLabels[i];
        }
      });
    }

    // Refresh email preview
    if (typeof THY.updateEmailPreview === 'function') {
      THY.updateEmailPreview();
    }

    // Refresh day tabs
    if (typeof THY.updateDayTabs === 'function') {
      THY.updateDayTabs();
    }

    // Refresh active price alerts list
    if (typeof THY.loadPriceAlerts === 'function') {
      THY.loadPriceAlerts();
    }

    // Refresh saved trips list representation
    if (typeof THY.renderSavedTrips === 'function') {
      THY.renderSavedTrips();
    }

    // Translate dynamic search results items and title
    const resultsLabel = document.getElementById('resultsRouteLabel');
    if (resultsLabel && resultsLabel.textContent && resultsLabel.textContent !== '...') {
      const txt = resultsLabel.textContent;
      const match = txt.match(/\(([^)]+)\)/);
      if (match) {
        const codes = match[1]; // e.g. "IST ➔ FCO"
        const isOutbound = txt.toLowerCase().includes('gidiş') || txt.toLowerCase().includes('outbound');
        resultsLabel.textContent = isEn
          ? (isOutbound ? `Select Outbound Flight (${codes})` : `Select Inbound Flight (${codes})`)
          : (isOutbound ? `Gidiş Uçuşu Seçin (${codes})` : `Dönüş Uçuşu Seçin (${codes})`);
      }
    }

    const resultsBanner = document.getElementById('resultsRouteBanner');
    if (resultsBanner && resultsBanner.textContent) {
      const txt = resultsBanner.textContent;
      const match = txt.match(/\(([^)]+)\)/);
      if (match) {
        const codes = match[1]; // e.g. "IST ➔ FCO"
        const isOutbound = txt.toLowerCase().includes('gidiş') || txt.toLowerCase().includes('outbound');
        resultsBanner.textContent = isEn
          ? (isOutbound ? `🛫 SELECT OUTBOUND FLIGHT (${codes})` : `🛬 SELECT INBOUND FLIGHT (${codes})`)
          : (isOutbound ? `🛫 GİDİŞ UÇUŞU SEÇİN (${codes})` : `🛬 DÖNÜŞ UÇUŞU SEÇİN (${codes})`);
      }
    }

    // Translate active flight list items if present
    document.querySelectorAll('.flight-item').forEach(item => {
      const badge = item.querySelector('.flight-type-badge');
      if (badge) {
        const isOutboundBadge = badge.classList.contains('outbound-badge');
        badge.textContent = isEn
          ? (isOutboundBadge ? '🛫 OUTBOUND FLIGHT' : '🛬 INBOUND FLIGHT')
          : (isOutboundBadge ? '🛫 GİDİŞ UÇUŞU' : '🛬 DÖNÜŞ UÇUŞU');
      }

      const statusSpan = item.querySelector('.flight-status');
      if (statusSpan) {
        const txt = statusSpan.textContent;
        if (txt.includes('Zamanında') || txt.includes('On Time')) {
          statusSpan.textContent = isEn ? '🟢 On Time' : '🟢 Zamanında';
        } else if (txt.includes('Rötar') || txt.includes('Delay')) {
          const minutesMatch = txt.match(/\d+/);
          const mins = minutesMatch ? minutesMatch[0] : '0';
          statusSpan.textContent = isEn ? `⚠️ Delay: ${mins} min` : `⚠️ Rötar: ${mins} dk`;
        }
      }

      const gateSpan = item.querySelector('.flight-gate');
      if (gateSpan) {
        const txt = gateSpan.textContent;
        const gateVal = txt.replace('🚪 Kapı: ', '').replace('🚪 Gate: ', '').trim();
        gateSpan.textContent = isEn ? `🚪 Gate: ${gateVal}` : `🚪 Kapı: ${gateVal}`;
      }

      const durationBlock = item.querySelector('.flight-duration-path');
      if (durationBlock) {
        const durationSpans = durationBlock.querySelectorAll('.duration-text');
        if (durationSpans.length >= 2) {
          const durSpan = durationSpans[0];
          const directSpan = durationSpans[1];

          let durTxt = durSpan.textContent;
          if (isEn) {
            durTxt = durTxt.replace('sa', 'h').replace('dk', 'm');
          } else {
            durTxt = durTxt.replace('h', 'sa').replace('m', 'dk');
          }
          durSpan.textContent = durTxt;

          if (directSpan.textContent === 'Direkt' || directSpan.textContent === 'Nonstop') {
            directSpan.textContent = isEn ? 'Nonstop' : 'Direkt';
          }
        }
      }

      const selectBtn = item.querySelector('.btn-select-flight');
      if (selectBtn) {
        const btnTxt = selectBtn.textContent;
        if (btnTxt.includes('Seçild') || btnTxt.includes('Selected')) {
          selectBtn.textContent = isEn ? 'Selected ✓' : 'Seçildi ✓';
        } else {
          selectBtn.textContent = isEn ? 'Select' : 'Seç';
        }
      }
    });
  };

  // Secure EmailJS Proxy Helper
  THY.sendEmailProxy = async (templateParams) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ templateParams })
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Server error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Email proxy error:', error);
      throw error;
    }
  };

  // Set the trip ID badge on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    const tripBadge = document.getElementById('tripIdBadge');
    if (tripBadge) tripBadge.textContent = THY.currentTripId;

    // Initialize UI language translation
    THY.translateUI(THY.currentLanguage);

    // Bind Language Switches
    const handleLangToggle = () => {
      const newLang = THY.currentLanguage === 'tr' ? 'en' : 'tr';
      THY.translateUI(newLang);
    };
    
    document.getElementById('btnLangToggle')?.addEventListener('click', handleLangToggle);
    document.getElementById('btnLangToggleLanding')?.addEventListener('click', handleLangToggle);
    document.getElementById('btnLangToggleMobile')?.addEventListener('click', handleLangToggle);

    // Handle shared trip join popup and redirect
    const params = new URLSearchParams(window.location.search);
    const urlTripId = params.get('tripId');
    if (urlTripId) {
      // Hide landing screen and show map screen immediately
      const landing = document.getElementById('landingScreen');
      const mapScr = document.getElementById('mapScreen');
      if (landing) landing.classList.add('hidden');
      if (mapScr) mapScr.classList.remove('hidden');

      // Pre-fill user name if cached
      const cachedName = localStorage.getItem('thy_user_name');
      if (cachedName) {
        const emailFrom = document.getElementById('emailFrom');
        if (emailFrom) emailFrom.value = cachedName;
      }

      // Check if user has already joined this trip
      const joinedTrips = JSON.parse(localStorage.getItem('thy_joined_trips') || '[]');
      const isCaptain = (THY.userRole === 'Kaptan');
      const hasJoined = isCaptain || (joinedTrips.includes(urlTripId) && cachedName);

      if (!hasJoined) {
        const joinModal = document.getElementById('joinModal');
        const joinInput = document.getElementById('joinUserNameInput');
        const joinBtn = document.getElementById('btnConfirmJoin');

        if (joinModal) {
          joinModal.classList.add('active');
          
          if (joinInput && joinBtn) {
            joinInput.addEventListener('input', () => {
              const nameVal = joinInput.value.trim();
              if (nameVal.length >= 2) {
                joinBtn.removeAttribute('disabled');
                joinBtn.style.opacity = '1';
              } else {
                joinBtn.setAttribute('disabled', 'true');
                joinBtn.style.opacity = '0.5';
              }
            });

            joinBtn.addEventListener('click', () => {
              const nameVal = joinInput.value.trim();
              if (nameVal.length < 2) return;

              // Store user name
              localStorage.setItem('thy_user_name', nameVal);
              localStorage.setItem('thy_user_name_old', nameVal);
              
              const currentJoined = JSON.parse(localStorage.getItem('thy_joined_trips') || '[]');
              if (!currentJoined.includes(urlTripId)) {
                currentJoined.push(urlTripId);
              }
              localStorage.setItem('thy_joined_trips', JSON.stringify(currentJoined));

              // Pre-fill the Rapor tab sender name
              const emailFrom = document.getElementById('emailFrom');
              if (emailFrom) emailFrom.value = nameVal;

              // Set local role to actual name for action log
              THY.userRole = nameVal;
              localStorage.setItem('thy_user_role', nameVal);

              // Join via Firestore transaction
              if (THY.firebaseDb) {
                const docRef = THY.firebaseDb.collection("trips").doc(urlTripId);
                THY.firebaseDb.runTransaction(async (transaction) => {
                  const sfDoc = await transaction.get(docRef);
                  if (sfDoc.exists) {
                    const data = sfDoc.data();
                    const participants = data.participants || [];
                    if (!participants.includes(nameVal)) {
                      participants.push(nameVal);
                      transaction.update(docRef, {
                        participants: participants,
                        lastAction: {
                          user: nameVal,
                          type: 'join',
                          timestamp: Date.now(),
                          text: 'uçuş planına katıldı! ✈️'
                        }
                      });
                    }
                  }
                }).catch(err => console.error("Join transaction failed:", err));
              }

              joinModal.classList.remove('active');
              THY.toast('Rotaya başarıyla katıldınız!', 'success');
            });
          }
        }
      }
    }

    // Sender Name input listener in Report Tab to update Firestore participants
    document.getElementById('emailFrom')?.addEventListener('change', (e) => {
      const val = e.target.value.trim();
      if (val) {
        const oldVal = localStorage.getItem('thy_user_name') || (THY.userRole === 'Kaptan' ? 'Kaptan' : 'Yardımcı Pilot');
        localStorage.setItem('thy_user_name', val);
        
        if (THY.userRole === 'Kaptan' || THY.userRole === oldVal) {
          THY.userRole = val;
          localStorage.setItem('thy_user_role', val);
        }

        if (THY.firebaseDb && THY.currentTripId) {
          const docRef = THY.firebaseDb.collection("trips").doc(THY.currentTripId);
          THY.firebaseDb.runTransaction(async (transaction) => {
            const sfDoc = await transaction.get(docRef);
            if (sfDoc.exists) {
              const data = sfDoc.data();
              let participants = data.participants || [];
              const oldIdx = participants.indexOf(oldVal);
              if (oldIdx !== -1) {
                participants[oldIdx] = val;
              } else if (!participants.includes(val)) {
                participants.push(val);
              }
              transaction.update(docRef, { participants: participants });
            }
          }).catch(err => console.error("Update participant name transaction failed:", err));
        }
      }
    });

    // Render list of saved trips
    if (typeof THY.renderSavedTrips === 'function') {
      THY.renderSavedTrips();
    }

    // Day Add Button Click Listener
    const btnAddingDay = document.getElementById('btnAddingDay');
    if (btnAddingDay) {
      btnAddingDay.addEventListener('click', () => {
        THY.maxDays = (THY.maxDays || 1) + 1;
        THY.activeDay = THY.maxDays;
        if (typeof THY.playSplitFlapSound === 'function') {
          THY.playSplitFlapSound(4);
        }
        
        THY.updateTripInFirestore({ maxDays: THY.maxDays });
        
        THY.updateDayTabs();
        if (typeof THY.renderTripState === 'function') {
          THY.renderTripState({
            waypoints: THY.waypoints,
            maxDays: THY.maxDays
          });
        }
        THY.toast(`${THY.activeDay}. Gün oluşturuldu!`, 'success');
      });
    }

    // Pre-fill email address if available
    const alertEmailInput = document.getElementById('alertEmail');
    if (alertEmailInput) {
      const savedEmail = document.getElementById('emailTo')?.value || localStorage.getItem('thy_saved_email') || '';
      alertEmailInput.value = savedEmail;
    }

    // Initialize Price Alert Button Click
    document.getElementById('btnCreatePriceAlert')?.addEventListener('click', () => {
      const email = document.getElementById('alertEmail')?.value?.trim();
      const targetPrice = document.getElementById('alertTargetPrice')?.value?.trim();
      if (email) {
        localStorage.setItem('thy_saved_email', email);
      }
      THY.createPriceAlert(email, targetPrice);
    });

    // Load active alerts
    if (typeof THY.loadPriceAlerts === 'function') {
      THY.loadPriceAlerts();
    }

    // ---- BAGGAGE & PET CALCULATOR ----
    const baggageForm = document.getElementById('baggagePetForm');
    const baggageTypeSelect = document.getElementById('baggageTypeSelect');
    const resultCard = document.getElementById('baggageResultCard');
    const resultStatusHeader = document.getElementById('baggageResultStatusHeader');
    const resultStatus = document.getElementById('baggageResultStatus');
    const resultDetails = document.getElementById('baggageResultDetails');
    const resultAction = document.getElementById('baggageResultAction');

    const widthInput = document.getElementById('baggageWidth');
    const heightInput = document.getElementById('baggageHeight');
    const depthInput = document.getElementById('baggageDepth');
    const weightInput = document.getElementById('baggageWeight');

    if (baggageTypeSelect) {
      // Set default initial values for "pet_cabin"
      if (widthInput && heightInput && depthInput && weightInput) {
        widthInput.value = 30;
        heightInput.value = 23;
        depthInput.value = 40;
        weightInput.value = 8;
      }

      baggageTypeSelect.addEventListener('change', (e) => {
        const type = e.target.value;
        if (!widthInput || !heightInput || !depthInput || !weightInput) return;

        if (type === 'pet_cabin') {
          widthInput.value = 30;
          heightInput.value = 23;
          depthInput.value = 40;
          weightInput.value = 8;
        } else if (type === 'pet_cargo') {
          widthInput.value = 75;
          heightInput.value = 75;
          depthInput.value = 125;
          weightInput.value = 25;
        } else if (type === 'baggage_checked') {
          widthInput.value = 50;
          heightInput.value = 40;
          depthInput.value = 30;
          weightInput.value = 23;
        } else if (type === 'baggage_oversize') {
          widthInput.value = 80;
          heightInput.value = 60;
          depthInput.value = 50;
          weightInput.value = 28;
        }
        
        if (resultCard) resultCard.style.display = 'none';
      });
    }

    if (baggageForm) {
      baggageForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const type = baggageTypeSelect.value;
        const width = parseFloat(widthInput?.value) || 0;
        const height = parseFloat(heightInput?.value) || 0;
        const depth = parseFloat(depthInput?.value) || 0;
        const weight = parseFloat(weightInput?.value) || 0;

        const isEn = THY.currentLanguage === 'en';
        let status = 'success'; // success, warning, error
        let statusText = '';
        let detailsText = '';
        let actionText = '';
        let actionVisible = false;

        // Sound effect
        if (typeof THY.playSplitFlapSound === 'function') {
          THY.playSplitFlapSound(4);
        }

        if (type === 'pet_cabin') {
          const wLimit = 30, hLimit = 23, dLimit = 40, wtLimit = 8;
          const wExceed = width > wLimit;
          const hExceed = height > hLimit;
          const dExceed = depth > dLimit;
          const wtExceed = weight > wtLimit;

          if (wExceed || hExceed || dExceed || wtExceed) {
            status = 'warning';
            statusText = isEn ? '⚠️ CABIN LIMIT EXCEEDED' : '⚠️ KABİN LİMİTİ AŞILDI';
            
            const exceededParts = [];
            if (wExceed) exceededParts.push(`${isEn ? 'Width' : 'Genişlik'} (${width} > ${wLimit} cm)`);
            if (hExceed) exceededParts.push(`${isEn ? 'Height' : 'Yükseklik'} (${height} > ${hLimit} cm)`);
            if (dExceed) exceededParts.push(`${isEn ? 'Depth' : 'Derinlik'} (${depth} > ${dLimit} cm)`);
            if (wtExceed) exceededParts.push(`${isEn ? 'Weight' : 'Ağırlık'} (${weight} > ${wtLimit} kg)`);

            detailsText = isEn
              ? `The following limits were exceeded: ${exceededParts.join(', ')}.`
              : `Şu limitler aşıldı: ${exceededParts.join(', ')}.`;

            actionText = isEn
              ? '🐱 Due to cabin safety regulations, this pet cannot be carried in-cabin. You are redirected to the cargo hold compartment.'
              : '🐱 Kabin güvenlik kuralları gereği bu evcil hayvan kabinde taşınamaz. Kargo bölümü seçeneğine yönlendiriliyorsunuz.';
            actionVisible = true;
          } else {
            status = 'success';
            statusText = isEn ? '🟢 COMPLIANT' : '🟢 UYGUN';
            detailsText = isEn
              ? `Dimensions and weight are within cabin limits (${width}x${height}x${depth} cm, ${weight} kg). Max limit: 30x23x40 cm, 8 kg.`
              : `Boyutlar ve ağırlık kabin sınırları içerisindedir (${width}x${height}x${depth} cm, ${weight} kg). Maksimum limit: 30x23x40 cm, 8 kg.`;
          }
        } else if (type === 'pet_cargo') {
          const wLimit = 75, hLimit = 75, dLimit = 125, wtLimit = 50;
          const wExceed = width > wLimit;
          const hExceed = height > hLimit;
          const dExceed = depth > dLimit;
          const wtExceed = weight > wtLimit;

          if (wExceed || hExceed || dExceed || wtExceed) {
            status = 'error';
            statusText = isEn ? '❌ CARGO HOLD LIMIT EXCEEDED' : '❌ KARGO LİMİTİ AŞILDI';
            
            const exceededParts = [];
            if (wExceed) exceededParts.push(`${isEn ? 'Width' : 'Genişlik'} (${width} > ${wLimit} cm)`);
            if (hExceed) exceededParts.push(`${isEn ? 'Height' : 'Yükseklik'} (${height} > ${hLimit} cm)`);
            if (dExceed) exceededParts.push(`${isEn ? 'Depth' : 'Derinlik'} (${depth} > ${dLimit} cm)`);
            if (wtExceed) exceededParts.push(`${isEn ? 'Weight' : 'Ağırlık'} (${weight} > ${wtLimit} kg)`);

            detailsText = isEn
              ? `The following limits were exceeded: ${exceededParts.join(', ')}. Maximum allowed is 75x75x125 cm, 50 kg.`
              : `Şu limitler aşıldı: ${exceededParts.join(', ')}. İzin verilen maks limitler: 75x75x125 cm, 50 kg.`;
            
            actionText = isEn
              ? '🐕 This cage exceeds the maximum structural limits for aircraft cargo transport. Please split or contact customer services.'
              : '🐕 Bu kafes uçak kargo bölümü maksimum yapısal limitlerini aşmaktadır. Lütfen bölün veya müşteri hizmetleri ile görüşün.';
            actionVisible = true;
          } else {
            status = 'success';
            statusText = isEn ? '🟢 COMPLIANT' : '🟢 UYGUN';
            
            const baseFee = Math.round(weight * 25 + (width + height + depth) * 5);
            
            detailsText = isEn
              ? `Cage dimensions and weight are compliant. Dynamic "Pet Carriage Fee" calculated for this transport: ${baseFee} TRY.`
              : `Kafes boyutları ve ağırlık uygundur. Bu taşıma için hesaplanan dinamik "Pet Taşıma Ücreti": ${baseFee} TL.`;
            
            actionText = isEn
              ? `💵 A fee of ${baseFee} TRY has been calculated. It will be added to your payment screen.`
              : `💵 ${baseFee} TL taşıma ücreti hesaplanmıştır. Ödeme ekranınıza yansıtılacaktır.`;
            actionVisible = true;
          }
        } else if (type === 'baggage_checked') {
          const totalDim = width + height + depth;
          const dimLimit = 158;
          const wtLimit = 32;
          const dimExceed = totalDim >= dimLimit;
          const wtExceed = weight > wtLimit;

          if (wtExceed) {
            status = 'error';
            statusText = isEn ? '❌ BAGGAGE LIMIT EXCEEDED' : '❌ BAGAJ LİMİTİ AŞILDI';
            detailsText = isEn
              ? `Weight exceeds the absolute single-piece limit of ${wtLimit} kg. Entered weight: ${weight} kg.`
              : `Ağırlık, tek parça için mutlak limit olan ${wtLimit} kg değerini aşmaktadır. Girilen ağırlık: ${weight} kg.`;
            actionText = isEn
              ? '📦 Baggage over 32 kg cannot be carried as a single piece. You must split your baggage into multiple pieces.'
              : '📦 32 kg üzerindeki bagajlar tek parça halinde taşınamaz. Bagajınızı birden fazla parçaya bölmeniz gerekmektedir.';
            actionVisible = true;
          } else if (dimExceed) {
            status = 'warning';
            statusText = isEn ? '⚠️ OVERSIZE BAGGAGE' : '⚠️ BÜYÜK BOYUTLU BAGAJ';
            detailsText = isEn
              ? `Sum of dimensions (${totalDim} cm) exceeds standard limit of 158 cm, but fits within oversize limits (158 - 292 cm).`
              : `Boyutlar toplamı (${totalDim} cm) standart limit olan 158 cm değerini aşmakta, ancak büyük bagaj sınırları (158 - 292 cm) içerisindedir.`;
            actionText = isEn
              ? '📦 Oversize baggage rules apply. A static penalty fee of 1000 TRY (90 USD) will be charged.'
              : '📦 Büyük bagaj kuralları geçerlidir. Sabit ceza ücreti olan 1000 TL (90 USD) yansıtılacaktır.';
            actionVisible = true;
          } else {
            status = 'success';
            statusText = isEn ? '🟢 COMPLIANT' : '🟢 UYGUN';
            detailsText = isEn
              ? `Standard baggage criteria met. Sum of dimensions: ${totalDim} cm (< 158 cm), Weight: ${weight} kg (<= 32 kg).`
              : `Standart bagaj kriterleri karşılandı. Boyutlar toplamı: ${totalDim} cm (< 158 cm), Ağırlık: ${weight} kg (<= 32 kg).`;
          }
        } else if (type === 'baggage_oversize') {
          const totalDim = width + height + depth;
          const minDim = 158;
          const maxDim = 292;
          const wtLimit = 32;
          const dimExceed = totalDim > maxDim;
          const dimUnder = totalDim < minDim;
          const wtExceed = weight > wtLimit;

          if (wtExceed) {
            status = 'error';
            statusText = isEn ? '❌ WEIGHT LIMIT EXCEEDED' : '❌ AĞIRLIK LİMİTİ AŞILDI';
            detailsText = isEn
              ? `Even for oversize baggage, single-piece weight cannot exceed ${wtLimit} kg. Entered: ${weight} kg.`
              : `Büyük bagaj olsa dahi tek parça ağırlığı ${wtLimit} kg sınırını aşamaz. Girilen: ${weight} kg.`;
            actionText = isEn
              ? '📦 Please split your baggage. Pieces above 32 kg are strictly prohibited from aircraft cargo hold.'
              : '📦 Lütfen bagajınızı bölün. 32 kg üzerindeki parçaların kargoya alınması kesinlikle yasaktır.';
            actionVisible = true;
          } else if (dimExceed) {
            status = 'error';
            statusText = isEn ? '❌ SIZE LIMIT EXCEEDED' : '❌ BOYUT LİMİTİ AŞILDI';
            detailsText = isEn
              ? `Sum of dimensions (${totalDim} cm) exceeds maximum allowed oversize limit of ${maxDim} cm.`
              : `Boyutlar toplamı (${totalDim} cm) izin verilen maksimum büyük bagaj sınırı olan ${maxDim} cm değerini aşmaktadır.`;
            actionText = isEn
              ? '📦 This baggage is too large to carry on commercial flights. Please contact cargo department.'
              : '📦 Bu bagaj ticari uçuşlarda taşınamayacak kadar büyüktür. Lütfen kargo departmanı ile iletişime geçin.';
            actionVisible = true;
          } else if (dimUnder) {
            status = 'success';
            statusText = isEn ? '🟢 STANDARD BAGGAGE' : '🟢 STANDART BAGAJ';
            detailsText = isEn
              ? `Sum of dimensions (${totalDim} cm) is below 158 cm. This qualifies as standard checked baggage without any extra penalty fee.`
              : `Boyutlar toplamı (${totalDim} cm) 158 cm sınırının altındadır. Standart kayıtlı bagaj statüsündedir, ek ceza yansıtılmaz.`;
          } else {
            status = 'warning';
            statusText = isEn ? '⚠️ OVERSIZE BAGGAGE PENALTY' : '⚠️ BÜYÜK BAGAJ CEZASI';
            detailsText = isEn
              ? `Sum of dimensions is ${totalDim} cm (158 - 292 cm). Weight is ${weight} kg. Static penalty fee of 1000 TRY (90 USD) applies.`
              : `Boyutlar toplamı: ${totalDim} cm (158 - 292 cm). Ağırlık: ${weight} kg. Sabit ceza ücreti 1000 TL (90 USD) uygulanır.`;
            actionText = isEn
              ? '💵 A static surcharge of 1000 TRY (90 USD) will be automatically added to your baggage payment screen.'
              : '💵 1000 TL (90 USD) sabit ceza ek ücreti bagaj ödeme ekranınıza otomatik olarak yansıtılacaktır.';
            actionVisible = true;
          }
        }

        if (resultCard) {
          resultCard.style.display = 'block';
          resultCard.style.borderColor = status === 'success' ? '#22C55E' : (status === 'warning' ? '#F59E0B' : '#EF4444');
          resultCard.style.background = status === 'success' ? 'rgba(34, 197, 94, 0.05)' : (status === 'warning' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.05)');
        }
        
        if (resultStatus) {
          resultStatus.style.color = status === 'success' ? '#22C55E' : (status === 'warning' ? '#F59E0B' : '#EF4444');
          resultStatus.textContent = statusText;
        }
        if (resultDetails) {
          resultDetails.textContent = detailsText;
        }

        if (resultAction) {
          if (actionVisible) {
            resultAction.style.display = 'block';
            resultAction.style.color = status === 'success' ? '#22C55E' : (status === 'warning' ? '#F59E0B' : '#EF4444');
            resultAction.style.borderColor = status === 'success' ? 'rgba(34, 197, 94, 0.2)' : (status === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)');
            resultAction.textContent = actionText;
          } else {
            resultAction.style.display = 'none';
          }
        }
      });
    }
  });

  THY.updateDayTabs = () => {
    const container = document.getElementById('dayTabs');
    if (!container) return;

    container.innerHTML = '';

    const isEn = THY.currentLanguage === 'en';

    // Add "Tam Rota" tab button
    const allBtn = document.createElement('button');
    allBtn.className = `day-tab-btn ${THY.activeDay === 0 ? 'active' : ''}`;
    allBtn.style.setProperty('--day-color', '#94A3B8');
    allBtn.innerHTML = `<span>${isEn ? 'Full Route' : 'Tam Rota'}</span>`;
    allBtn.addEventListener('click', () => {
      if (THY.activeDay !== 0) {
        THY.activeDay = 0;
        if (typeof THY.playSplitFlapSound === 'function') {
          THY.playSplitFlapSound(2);
        }
        THY.updateDayTabs();
        if (typeof THY.renderTripState === 'function') {
          THY.renderTripState({
            waypoints: THY.waypoints,
            maxDays: THY.maxDays
          }, true);
        }
      }
    });
    container.appendChild(allBtn);

    for (let d = 1; d <= THY.maxDays; d++) {
      const btn = document.createElement('button');
      btn.className = `day-tab-btn ${d === THY.activeDay ? 'active' : ''}`;
      
      const color = THY.dayColors[(d - 1) % THY.dayColors.length] || '#E31837';
      btn.style.setProperty('--day-color', color);
      const tabLabel = isEn ? `Day ${d}` : `${d}. Gün`;
      btn.innerHTML = `<span>${tabLabel}</span>`;
      btn.addEventListener('click', () => {
        if (THY.activeDay !== d) {
          THY.activeDay = d;
          if (typeof THY.playSplitFlapSound === 'function') {
            THY.playSplitFlapSound(2);
          }
          THY.updateDayTabs();
          if (typeof THY.renderTripState === 'function') {
            THY.renderTripState({
              waypoints: THY.waypoints,
              maxDays: THY.maxDays
            }, true);
          }
        }
      });
      container.appendChild(btn);
    }
  };

  THY.toast = (message, type = 'info', duration = 3500) => {
    message = THY.t(message);
    // Filter out system loading/success messages, keeping errors and collaborative actions
    if (type !== 'error') {
      const lowerMsg = message.toLowerCase();
      // Check if it is a collaborative/user action message (contains '[' or 'kaptan' or 'pilot')
      const isUserAction = lowerMsg.includes('[') || lowerMsg.includes('kaptan') || lowerMsg.includes('pilot');
      
      if (!isUserAction) {
        const suppressKeywords = [
          'yüklen', 'yuklen', // yükleniyor, yüklendi
          'hazırlan', 'hazirlan', // hazırlanıyor, hazırlandı
          'aran', // aranıyor
          'keşfed', 'kesfed', // keşfediliyor
          'gidil', // gidiliyor
          'bulun', // bulundu
          'oluştur', 'olustur', // oluşturuldu
          'kayded', // kaydedildi
          'kopyalan', 'kopyalan', // kopyalandı
          'indiril', // indirildi
          'temizlen', // temizlendi
          'eklen', // eklendi
          'seçildi', 'secildi' // seçildi
        ];
        
        for (const keyword of suppressKeywords) {
          if (lowerMsg.includes(keyword)) {
            // Silently suppress this toast to avoid visual clutter
            console.log(`[Toast Filtered] Suppressed system message: "${message}"`);
            return;
          }
        }
      }
    }

    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✅', error: '❌', info: '💡' };
    toast.innerHTML = `<span>${icons[type] || '💡'}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      toast.addEventListener('animationend', () => toast.remove());
    }, duration);
  };

  // ---- ROBUST CLIPBOARD COPY HELPER ----
  THY.copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.width = '2em';
        textarea.style.height = '2em';
        textarea.style.padding = '0';
        textarea.style.border = 'none';
        textarea.style.outline = 'none';
        textarea.style.boxShadow = 'none';
        textarea.style.background = 'transparent';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (successful) {
          resolve();
        } else {
          reject(new Error('execCommand failed'));
        }
      } catch (err) {
        reject(err);
      }
    });
  };

  // ---- RETRO SPLIT-FLAP MECHANICAL SOUND SYNTHESIZER ----
  THY.playSplitFlapSound = (ticks = 5) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      let time = ctx.currentTime;
      
      for (let i = 0; i < ticks; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        // Mechanical variation of flap click pitches
        osc.frequency.setValueAtTime(140 - (i * 6) + (Math.random() * 20), time);
        
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.04);
        
        time += 0.06 + Math.random() * 0.02; // realistic mechanical jitter
      }
    } catch (e) {
      console.warn('[Web Audio] Audio playback bypassed/blocked:', e);
    }
  };

  // ---- SHAREABLE ROUTE SERIALIZATION & DECODING (Firebase Firestore) ----
  THY.firebaseDb = null;
  let activeUnsubscribe = null;

  THY.generateShareUrl = () => {
    return `${window.location.origin}${window.location.pathname}?tripId=${THY.currentTripId}`;
  };

  // ---- DYNAMIC URL SHORTENER (Bypassed: share URL is already short and contains the trip ID) ----
  THY.getShortenedUrl = async (longUrl) => {
    return longUrl;
  };

  THY.initFirebaseAndSync = () => {
    if (activeUnsubscribe) {
      activeUnsubscribe();
      activeUnsubscribe = null;
    }

    try {
      if (window.firebase && window.firebase.initializeApp) {
        let app;
        if (window.firebase.apps.length > 0) {
          app = window.firebase.app();
        } else {
          app = window.firebase.initializeApp(firebaseConfig);
        }
        
        THY.firebaseDb = app.firestore();
        
        if (window.firebase.analytics) {
          try {
            window.firebase.analytics();
            console.log("📈 Firebase Analytics initialized.");
          } catch (e) {
            console.warn("Analytics blocked or failed to load:", e);
          }
        }

        // Anonymous Auth Sign-In
        const auth = app.auth();
        auth.onAuthStateChanged(user => {
          if (user) {
            console.log("👤 Firebase Auth signed in anonymously. UID:", user.uid);
            setupFirestoreListener();
            if (typeof THY.syncSavedTripsWithFirestore === 'function') {
              THY.syncSavedTripsWithFirestore(user.uid);
            }
          } else {
            console.log("👤 Firebase Auth signing in...");
            auth.signInAnonymously().catch(err => {
              console.error("❌ Firebase Auth sign in failed:", err);
              // Fallback to listening anyway
              setupFirestoreListener();
            });
          }
        });
      } else {
        console.warn("⚠️ Firebase SDK not loaded on the window object.");
        THY.toast("Firebase SDK yüklenemedi. Çevrimdışı moda geçildi.", "error");
      }
    } catch (e) {
      console.error("❌ Firebase setup failed:", e);
      THY.toast("Firebase kurulumu başarısız oldu.", "error");
    }
  };

  function setupFirestoreListener() {
    try {
      const tripId = THY.currentTripId;
      if (!tripId || !THY.firebaseDb) return;

      if (activeUnsubscribe) {
        activeUnsubscribe();
      }

      console.log(`📡 Listening to Firestore document: trips/${tripId}`);
      activeUnsubscribe = THY.firebaseDb.collection("trips").doc(tripId).onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          console.log("📥 Firestore Sync Update Received:", data);
          
          // Keep version counter synchronized locally
          THY.currentTripVersion = data.version || 1;
          
          // Auto-save/update metadata in the local saved trips list ONLY if it is already saved
          const savedTrips = JSON.parse(localStorage.getItem('thy_saved_trips') || '{}');
          if (savedTrips[tripId] && typeof THY.addTripToSavedList === 'function') {
            THY.addTripToSavedList(tripId, {
              flightCode: data.flightCode,
              dep: data.dep,
              arr: data.arr,
              maxDays: data.maxDays,
              waypointsCount: data.waypoints ? data.waypoints.length : 0
            });
          }
          
          // First time loading/joining a shared trip as Co-pilot? Notify the Captain.
          const currentName = localStorage.getItem('thy_user_name') || 'Yardımcı Pilot';
          if (THY.userRole !== 'Kaptan' && !sessionStorage.getItem('thy_joined_notified')) {
            sessionStorage.setItem('thy_joined_notified', 'true');
            THY.updateTripInFirestore({
              lastAction: {
                user: currentName,
                type: 'join',
                timestamp: Date.now(),
                text: 'uçuş planına katıldı! ✈️'
              }
            });
          }

          // Check for notifications from the other participant
          const myRepresentedName = localStorage.getItem('thy_user_name') || THY.userRole;
          if (data.lastAction && data.lastAction.user !== myRepresentedName) {
            const actionId = `${data.lastAction.type}_${data.lastAction.timestamp}`;
            const acknowledgedActions = JSON.parse(sessionStorage.getItem('thy_acknowledged_actions') || '[]');
            if (!acknowledgedActions.includes(actionId)) {
              acknowledgedActions.push(actionId);
              sessionStorage.setItem('thy_acknowledged_actions', JSON.stringify(acknowledgedActions));
              
              // Play split-flap ticking sound
              if (typeof THY.playSplitFlapSound === 'function') {
                THY.playSplitFlapSound(8);
              }
              // Toast notification using actual name in prefix
              const prefix = `👨‍✈️ [${data.lastAction.user}]`;
              THY.toast(`${prefix} ${data.lastAction.text}`, 'info', 5000);
            }
          }

          THY.participants = data.participants || [];
          if (typeof THY.updateEmailPreview === 'function') {
            THY.updateEmailPreview();
          }

          THY.waypoints = data.waypoints || [];
          THY.waypoints.forEach(wp => {
            if (!wp.day) wp.day = 1;
          });
          const maxWpDay = THY.waypoints.reduce((max, wp) => Math.max(max, wp.day), 1);
          THY.maxDays = Math.max(maxWpDay, data.maxDays || 1);
          if (THY.activeDay !== 0 && THY.activeDay > THY.maxDays) {
            THY.activeDay = THY.maxDays;
          }
          if (typeof THY.updateDayTabs === 'function') {
            THY.updateDayTabs();
          }
          
          const boardNo = document.getElementById('flightCode');
          const boardDep = document.getElementById('flightDep');
          const boardArr = document.getElementById('flightArr');
          const boardGate = document.getElementById('flightGate');
          const statusText = document.getElementById('statusText');
          const statusBadge = document.getElementById('statusBadge');

          if (boardNo && data.flightCode) boardNo.textContent = data.flightCode;
          if (boardDep && data.dep) boardDep.textContent = data.dep;
          if (boardArr && data.arr) boardArr.textContent = data.arr;
          if (boardGate && data.gate) boardGate.textContent = data.gate;
          
          if (statusText && data.statusText) {
            statusText.textContent = THY.translateStatus(data.statusText);
            const colors = {
              'BİNİŞ BAŞLADI': '#FF2D4D',
              'KAPI KAPANIYOR': '#FF8C00',
              'KALKIŞ HAZIR': '#22C55E',
              'UÇUŞTA': '#3B82F6',
              'İNİŞ YAPILIYOR': '#A855F7',
              'VARIS YAPILDI': '#22C55E',
              'İPTAL EDİLDİ': '#E31837'
            };
            let color = '#22C55E';
            for (const key in colors) {
              if (data.statusText.includes(key)) {
                color = colors[key];
                break;
              }
            }
            if (data.statusText.includes('GECİKMELİ') || data.statusText.includes('RÖTAR')) {
              color = '#FF8C00';
            }
            statusText.style.color = color;
            if (statusBadge) statusBadge.style.borderColor = color;
          }

          if (statusIntervalId) {
            clearInterval(statusIntervalId);
            statusIntervalId = null;
          }

          if (THY.mapReady && typeof THY.renderTripState === 'function') {
            THY.renderTripState(data);
          } else {
            THY.pendingSyncData = data;
          }

          const landingScreen = document.getElementById('landingScreen');
          const mapScreen = document.getElementById('mapScreen');
          if (landingScreen && mapScreen && !landingScreen.classList.contains('hidden') && (data.waypoints?.length > 0 || data.flightCode)) {
            landingScreen.classList.add('hidden');
            mapScreen.classList.remove('hidden');
            THY.toast('Canlı seyahat veritabanından yüklendi! ✈️', 'success');
          }
        } else {
          const mapScreen = document.getElementById('mapScreen');
          if (mapScreen && !mapScreen.classList.contains('hidden')) {
            console.log("📤 Initializing new trip document in Firestore...");
            THY.updateTripInFirestore({
              flightCode: document.getElementById('flightCode')?.textContent || '---',
              dep: document.getElementById('flightDep')?.textContent || '---',
              arr: document.getElementById('flightArr')?.textContent || '---',
              gate: document.getElementById('flightGate')?.textContent || '---',
              statusText: document.getElementById('statusText')?.textContent || 'PLANLANIYOR',
              waypoints: THY.waypoints || []
            });
          }
        }
      }, error => {
        console.error("Firestore onSnapshot error:", error);
        THY.toast("Firestore bağlantısı başarısız. Lütfen Ayarlar sekmesinden geçerli Firebase bilgilerinizi girin.", "error", 6000);
      });
    } catch (err) {
      console.error("Error initializing Firebase:", err);
      THY.toast("Firebase başlatılamadı. Ayarları kontrol edin.", "error");
    }
  }

  THY.updateTripInFirestore = (fields) => {
    if (!THY.firebaseDb) {
      console.warn("⚠️ Cannot update Firestore: Firebase database is not initialized. Using offline fallback.");
      if (fields.waypoints !== undefined) {
        THY.waypoints = fields.waypoints;
      }
      if (fields.maxDays !== undefined) {
        THY.maxDays = fields.maxDays;
      }
      if (typeof THY.renderTripState === 'function') {
        THY.renderTripState({
          flightCode: fields.flightCode || document.getElementById('flightCode')?.textContent || '---',
          dep: fields.dep || document.getElementById('flightDep')?.textContent || '---',
          arr: fields.arr || document.getElementById('flightArr')?.textContent || '---',
          gate: fields.gate || document.getElementById('flightGate')?.textContent || '---',
          statusText: fields.statusText || document.getElementById('statusText')?.textContent || 'PLANLANIYOR',
          waypoints: THY.waypoints,
          maxDays: THY.maxDays
        });
      }
      return;
    }
    const tripId = THY.currentTripId;
    if (!tripId) return;

    // Automatically generate lastAction description if not explicitly provided
    if (!fields.lastAction) {
      let actionText = '';
      if (fields.waypoints !== undefined) {
        const oldLen = THY.waypoints ? THY.waypoints.length : 0;
        const newLen = fields.waypoints.length;
        if (newLen > oldLen) {
          const addedWp = fields.waypoints[newLen - 1];
          const wpDay = addedWp.day || 1;
          actionText = `${wpDay}. Gün rotasına yeni rota noktası ekledi: "${addedWp.name}" 📍`;
        } else if (newLen < oldLen) {
          actionText = 'rotadan bir nokta kaldırdı 🗑️';
        } else {
          // Check if a note was edited
          let noteEdited = false;
          for (let i = 0; i < newLen; i++) {
            if (THY.waypoints[i] && fields.waypoints[i] && THY.waypoints[i].note !== fields.waypoints[i].note) {
              if (fields.waypoints[i].note === '') {
                actionText = `"${fields.waypoints[i].name}" durağının notunu sildi 📝`;
              } else {
                actionText = `"${fields.waypoints[i].name}" durağına not ekledi: "${fields.waypoints[i].note}" 📝`;
              }
              noteEdited = true;
              break;
            }
          }
          if (!noteEdited) {
            actionText = 'rotayı güncelledi 🗺️';
          }
        }
      } else if (fields.maxDays !== undefined) {
        actionText = `seyahate yeni bir gün ekledi: Toplam ${fields.maxDays} Gün 📅`;
      } else if (fields.flightCode !== undefined || fields.dep !== undefined || fields.arr !== undefined || fields.statusText !== undefined) {
        actionText = 'uçuş panosu bilgilerini güncelledi ✈️';
      }
      
      if (actionText) {
        fields.lastAction = {
          user: THY.userRole || 'Kaptan',
          type: 'change',
          timestamp: Date.now(),
          text: actionText
        };
      }
    }

    const cleanedFields = {};
    for (const key in fields) {
      if (fields[key] !== undefined) {
        cleanedFields[key] = fields[key];
      }
    }
    cleanedFields.updatedAt = new Date().toISOString();

    const docRef = THY.firebaseDb.collection("trips").doc(tripId);
    const localVersion = THY.currentTripVersion || 1;

    THY.firebaseDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (!doc.exists) {
        // If document doesn't exist, create it with version 1
        const newDocData = { ...cleanedFields, version: 1 };
        transaction.set(docRef, newDocData);
        return 1;
      }

      const serverData = doc.data() || {};
      const serverVersion = serverData.version || 1;

      // Optimistic Locking Check:
      // If server version is greater than what we have locally, someone else updated it first!
      // Exception: If the only field being updated is 'lastAction' with type 'join', we allow it.
      const isJoinAction = cleanedFields.lastAction && cleanedFields.lastAction.type === 'join';
      if (serverVersion > localVersion && !isJoinAction) {
        throw new Error("version_conflict");
      }

      const mergedFields = { ...cleanedFields };
      mergedFields.version = serverVersion + 1;

      transaction.update(docRef, mergedFields);
      return mergedFields.version;
    })
    .then((newVersion) => {
      console.log(`📤 Firestore document updated successfully with Transaction (Version: ${newVersion}) for: ${tripId}`);
      THY.currentTripVersion = newVersion;
    })
    .catch(error => {
      if (error.message === "version_conflict") {
        console.warn("⚠️ Version conflict detected. Server has newer changes.");
        THY.toast("⚠️ Rota çakışması engellendi: Başka bir pilot bu rotayı güncelledi. Değişiklikleriniz yerel kaldı, sayfa güncelleniyor.", "error", 6000);
        if (typeof THY.playSplitFlapSound === 'function') {
          THY.playSplitFlapSound(3);
        }
        return;
      }

      console.error("❌ Firestore transaction update failed:", error);
      THY.toast("Değişiklikler Firestore'a kaydedilemedi. Yerel önbelleğe yazıldı.", "error");
      
      if (fields.waypoints !== undefined) {
        THY.waypoints = fields.waypoints;
      }
      if (fields.maxDays !== undefined) {
        THY.maxDays = fields.maxDays;
      }
      if (typeof THY.renderTripState === 'function') {
        THY.renderTripState({
          flightCode: fields.flightCode || document.getElementById('flightCode')?.textContent || '---',
          dep: fields.dep || document.getElementById('flightDep')?.textContent || '---',
          arr: fields.arr || document.getElementById('flightArr')?.textContent || '---',
          gate: fields.gate || document.getElementById('flightGate')?.textContent || '---',
          statusText: fields.statusText || document.getElementById('statusText')?.textContent || 'PLANLANIYOR',
          waypoints: THY.waypoints,
          maxDays: THY.maxDays
        });
      }
    });
  };



  // ---- AIRPORT DATABASE & GLOBAL DATA ----
  const AIRPORTS = [
    // Türkiye - Domestic
    { code: "IST", city: "İstanbul", name: "İstanbul Havalimanı", country: "Türkiye", lat: 41.275, lng: 28.751 },
    { code: "SAW", city: "İstanbul", name: "Sabiha Gökçen Havalimanı", country: "Türkiye", lat: 40.898, lng: 29.309 },
    { code: "ESB", city: "Ankara", name: "Esenboğa Havalimanı", country: "Türkiye", lat: 40.128, lng: 32.995 },
    { code: "ADB", city: "İzmir", name: "Adnan Menderes Havalimanı", country: "Türkiye", lat: 38.292, lng: 27.156 },
    { code: "AYT", city: "Antalya", name: "Antalya Havalimanı", country: "Türkiye", lat: 36.900, lng: 30.792 },
    { code: "ADA", city: "Adana", name: "Adana Havalimanı", country: "Türkiye", lat: 36.982, lng: 35.280 },
    { code: "TZX", city: "Trabzon", name: "Trabzon Havalimanı", country: "Türkiye", lat: 40.995, lng: 39.789 },
    { code: "BJV", city: "Muğla Bodrum", name: "Milas-Bodrum Havalimanı", country: "Türkiye", lat: 37.250, lng: 27.664 },
    { code: "DLM", city: "Muğla Dalaman", name: "Dalaman Havalimanı", country: "Türkiye", lat: 36.713, lng: 28.792 },
    { code: "GZT", city: "Gaziantep", name: "Gaziantep Havalimanı", country: "Türkiye", lat: 36.947, lng: 37.478 },
    { code: "ASR", city: "Kayseri", name: "Erkilet Havalimanı", country: "Türkiye", lat: 38.770, lng: 35.495 },
    { code: "SZF", city: "Samsun", name: "Samsun Çarşamba Havalimanı", country: "Türkiye", lat: 41.265, lng: 36.548 },
    { code: "DIY", city: "Diyarbakır", name: "Diyarbakır Havalimanı", country: "Türkiye", lat: 37.893, lng: 40.201 },
    { code: "VAN", city: "Van", name: "Ferit Melen Havalimanı", country: "Türkiye", lat: 38.468, lng: 43.332 },
    { code: "ERZ", city: "Erzurum", name: "Erzurum Havalimanı", country: "Türkiye", lat: 39.956, lng: 41.170 },
    { code: "KYA", city: "Konya", name: "Konya Havalimanı", country: "Türkiye", lat: 37.978, lng: 32.561 },
    { code: "HTY", city: "Hatay", name: "Hatay Havalimanı", country: "Türkiye", lat: 36.363, lng: 36.282 },
    { code: "RZV", city: "Rize-Artvin", name: "Rize-Artvin Havalimanı", country: "Türkiye", lat: 41.173, lng: 40.835 },
    { code: "VAS", city: "Sivas", name: "Nuri Demirağ Havalimanı", country: "Türkiye", lat: 39.813, lng: 36.903 },
    { code: "OGU", city: "Ordu-Giresun", name: "Ordu-Giresun Havalimanı", country: "Türkiye", lat: 40.967, lng: 37.878 },
    { code: "GNY", city: "Şanlıurfa", name: "GAP Havalimanı", country: "Türkiye", lat: 37.449, lng: 38.908 },
    { code: "KSY", city: "Kars", name: "Harakani Havalimanı", country: "Türkiye", lat: 40.562, lng: 43.115 },
    { code: "MQM", city: "Mardin", name: "Mardin Prof. Dr. Aziz Sancar Havalimanı", country: "Türkiye", lat: 37.224, lng: 40.638 },
    { code: "BAL", city: "Batman", name: "Batman Havalimanı", country: "Türkiye", lat: 37.929, lng: 41.116 },
    { code: "DNZ", city: "Denizli", name: "Çardak Havalimanı", country: "Türkiye", lat: 37.785, lng: 29.701 },
    { code: "MLX", city: "Malatya", name: "Erhaç Havalimanı", country: "Türkiye", lat: 38.435, lng: 38.090 },
    { code: "ERC", city: "Erzincan", name: "Yıldırım Akbulut Havalimanı", country: "Türkiye", lat: 39.715, lng: 39.529 },
    { code: "EZS", city: "Elazığ", name: "Elazığ Havalimanı", country: "Türkiye", lat: 38.606, lng: 39.291 },
    { code: "NAV", city: "Nevşehir", name: "Kapadokya Havalimanı", country: "Türkiye", lat: 38.771, lng: 34.526 },
    { code: "EDO", city: "Balıkesir Koca Seyit", name: "Koca Seyit Havalimanı", country: "Türkiye", lat: 39.554, lng: 27.014 },

    // Europe
    { code: "FCO", city: "Roma", name: "Fiumicino Leonardo da Vinci", country: "İtalya", lat: 41.800, lng: 12.238 },
    { code: "MXP", city: "Milano", name: "Milano Malpensa Havalimanı", country: "İtalya", lat: 45.630, lng: 8.728 },
    { code: "VCE", city: "Venedik", name: "Venedik Marco Polo", country: "İtalya", lat: 45.505, lng: 12.351 },
    { code: "BLQ", city: "Bolonya", name: "Guglielmo Marconi Havalimanı", country: "İtalya", lat: 44.535, lng: 11.288 },
    { code: "NAP", city: "Napoli", name: "Napoli Uluslararası Havalimanı", country: "İtalya", lat: 40.886, lng: 14.290 },
    { code: "CDG", city: "Paris", name: "Charles de Gaulle Havalimanı", country: "Fransa", lat: 49.009, lng: 2.547 },
    { code: "LYS", city: "Lyon", name: "Saint Exupéry Havalimanı", country: "Fransa", lat: 45.726, lng: 5.090 },
    { code: "NCE", city: "Nice", name: "Côte d'Azur Havalimanı", country: "Fransa", lat: 43.665, lng: 7.215 },
    { code: "LHR", city: "Londra", name: "Heathrow Havalimanı", country: "İngiltere", lat: 51.470, lng: -0.454 },
    { code: "LGW", city: "Londra", name: "Gatwick Havalimanı", country: "İngiltere", lat: 51.148, lng: -0.190 },
    { code: "MAN", city: "Manchester", name: "Manchester Havalimanı", country: "İngiltere", lat: 53.353, lng: -2.275 },
    { code: "EDI", city: "Edinburgh", name: "Edinburgh Havalimanı", country: "İskoçya", lat: 55.950, lng: -3.372 },
    { code: "BHX", city: "Birmingham", name: "Birmingham Havalimanı", country: "İngiltere", lat: 52.453, lng: -1.748 },
    { code: "AMS", city: "Amsterdam", name: "Schiphol Havalimanı", country: "Hollanda", lat: 52.313, lng: 4.764 },
    { code: "MAD", city: "Madrid", name: "Barajas Havalimanı", country: "İspanya", lat: 40.490, lng: -3.567 },
    { code: "BCN", city: "Barselona", name: "Barselona Havalimanı", country: "İspanya", lat: 41.297, lng: 2.078 },
    { code: "LIS", city: "Lizbon", name: "Humberto Delgado Havalimanı", country: "Portekiz", lat: 38.774, lng: -9.135 },
    { code: "OPO", city: "Porto", name: "Francisco Sa Carneiro Havalimanı", country: "Portekiz", lat: 41.248, lng: -8.681 },
    { code: "ATH", city: "Atina", name: "Elefterios Venizelos", country: "Yunanistan", lat: 37.936, lng: 23.944 },
    { code: "MUC", city: "Münih", name: "Münih Havalimanı", country: "Almanya", lat: 48.353, lng: 11.786 },
    { code: "FRA", city: "Frankfurt", name: "Frankfurt Havalimanı", country: "Almanya", lat: 50.033, lng: 8.570 },
    { code: "BER", city: "Berlin", name: "Brandenburg Havalimanı", country: "Almanya", lat: 52.362, lng: 13.501 },
    { code: "DUS", city: "Düsseldorf", name: "Düsseldorf Havalimanı", country: "Almanya", lat: 51.289, lng: 6.766 },
    { code: "HAM", city: "Hamburg", name: "Hamburg Havalimanı", country: "Almanya", lat: 53.630, lng: 9.988 },
    { code: "CGN", city: "Köln", name: "Köln Bonn Havalimanı", country: "Almanya", lat: 50.865, lng: 7.142 },
    { code: "VIE", city: "Viyana", name: "Viyana Havalimanı", country: "Avusturya", lat: 48.110, lng: 16.569 },
    { code: "ZRH", city: "Zürih", name: "Zürih Havalimanı", country: "İsviçre", lat: 47.458, lng: 8.548 },
    { code: "GVA", city: "Cenevre", name: "Cenevre Havalimanı", country: "İsviçre", lat: 46.238, lng: 6.109 },
    { code: "BSL", city: "Basel", name: "EuroAirport Basel-Mulhouse-Freiburg", country: "İsviçre", lat: 47.590, lng: 7.529 },
    { code: "BRU", city: "Brüksel", name: "Brüksel Havalimanı", country: "Belçika", lat: 50.901, lng: 4.484 },
    { code: "BUD", city: "Budapeşte", name: "Ferenc Liszt Havalimanı", country: "Macaristan", lat: 47.439, lng: 19.261 },
    { code: "PRG", city: "Prag", name: "Vaclav Havel", country: "Çekya", lat: 50.100, lng: 14.260 },
    { code: "WAW", city: "Varşova", name: "Chopin Havalimanı", country: "Polonya", lat: 52.165, lng: 20.967 },
    { code: "OTP", city: "Bükreş", name: "Henri Coanda", country: "Romanya", lat: 44.572, lng: 26.084 },
    { code: "CPH", city: "Kopenhag", name: "Kopenhag Havalimanı", country: "Danimarka", lat: 55.618, lng: 12.656 },
    { code: "ARN", city: "Stokholm", name: "Arlanda Havalimanı", country: "İsveç", lat: 59.651, lng: 17.918 },
    { code: "OSL", city: "Oslo", name: "Gardermoen Havalimanı", country: "Norveç", lat: 60.193, lng: 11.100 },
    { code: "DUB", city: "Dublin", name: "Dublin Havalimanı", country: "İrlanda", lat: 53.421, lng: -6.270 },
    { code: "VKO", city: "Moskova", name: "Vnukovo Havalimanı", country: "Rusya", lat: 55.591, lng: 37.261 },
    { code: "LED", city: "St. Petersburg", name: "Pulkovo Havalimanı", country: "Rusya", lat: 59.800, lng: 30.262 },
    { code: "SOF", city: "Sofya", name: "Sofya Havalimanı", country: "Bulgaristan", lat: 42.695, lng: 23.406 },
    { code: "BEG", city: "Belgrad", name: "Nikola Tesla Havalimanı", country: "Sırbistan", lat: 44.818, lng: 20.309 },
    { code: "SJJ", city: "Saraybosna", name: "Saraybosna Havalimanı", country: "Bosna Hersek", lat: 43.824, lng: 18.331 },

    // Americas
    { code: "JFK", city: "New York", name: "John F. Kennedy Havalimanı", country: "ABD", lat: 40.641, lng: -73.778 },
    { code: "ORD", city: "Şikago", name: "O'Hare Havalimanı", country: "ABD", lat: 41.974, lng: -87.907 },
    { code: "LAX", city: "Los Angeles", name: "Los Angeles Havalimanı", country: "ABD", lat: 33.941, lng: -118.408 },
    { code: "SFO", city: "San Francisco", name: "San Francisco Havalimanı", country: "ABD", lat: 37.621, lng: -122.378 },
    { code: "MIA", city: "Miami", name: "Miami Havalimanı", country: "ABD", lat: 25.795, lng: -80.287 },
    { code: "BOS", city: "Boston", name: "Logan Havalimanı", country: "ABD", lat: 42.365, lng: -71.009 },
    { code: "IAD", city: "Washington", name: "Dulles Havalimanı", country: "ABD", lat: 38.944, lng: -77.456 },
    { code: "IAH", city: "Houston", name: "George Bush Havalimanı", country: "ABD", lat: 29.980, lng: -95.339 },
    { code: "ATL", city: "Atlanta", name: "Hartsfield-Jackson", country: "ABD", lat: 33.640, lng: -84.427 },
    { code: "DFW", city: "Dallas", name: "Dallas/Fort Worth Havalimanı", country: "ABD", lat: 32.899, lng: -97.040 },
    { code: "SEA", city: "Seattle", name: "Seattle-Tacoma Havalimanı", country: "ABD", lat: 47.450, lng: -122.308 },
    { code: "YYZ", city: "Toronto", name: "Pearson Havalimanı", country: "Kanada", lat: 43.677, lng: -79.624 },
    { code: "YUL", city: "Montreal", name: "Trudeau Havalimanı", country: "Kanada", lat: 45.470, lng: -73.740 },
    { code: "MEX", city: "Meksika", name: "Benito Juarez", country: "Meksika", lat: 19.436, lng: -99.072 },
    { code: "GRU", city: "Sao Paulo", name: "Guarulhos Havalimanı", country: "Brezilya", lat: -23.435, lng: -46.473 },
    { code: "EZE", city: "Buenos Aires", name: "Ezeiza Havalimanı", country: "Arjantin", lat: -34.822, lng: -58.535 },
    { code: "BOG", city: "Bogota", name: "El Dorado Havalimanı", country: "Kolombiya", lat: 4.701, lng: -74.146 },

    // Middle East, Africa & Asia-Pacific
    { code: "DXB", city: "Dubai", name: "Dubai Havalimanı", country: "BAE", lat: 25.253, lng: 55.364 },
    { code: "GYD", city: "Bakü", name: "Haydar Aliyev Havalimanı", country: "Azerbaycan", lat: 40.467, lng: 50.432 },
    { code: "TAS", city: "Taşkent", name: "Taşkent Havalimanı", country: "Özbekistan", lat: 41.257, lng: 69.281 },
    { code: "ALA", city: "Almati", name: "Almati Havalimanı", country: "Kazakistan", lat: 43.352, lng: 77.040 },
    { code: "IKA", city: "Tahran", name: "İmam Humeyni Havalimanı", country: "İran", lat: 35.416, lng: 51.152 },
    { code: "RUH", city: "Riyad", name: "Kral Halid Havalimanı", country: "Suudi Arabistan", lat: 24.957, lng: 46.698 },
    { code: "JED", city: "Cidde", name: "Kral Abdülaziz Havalimanı", country: "Suudi Arabistan", lat: 21.679, lng: 39.156 },
    { code: "MED", city: "Medine", name: "Prens Muhammed Havalimanı", country: "Suudi Arabistan", lat: 24.553, lng: 39.705 },
    { code: "DOH", city: "Doha", name: "Hamad Havalimanı", country: "Katar", lat: 25.273, lng: 51.608 },
    { code: "MCT", city: "Maskat", name: "Maskat Havalimanı", country: "Umman", lat: 23.593, lng: 58.281 },
    { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji", country: "Hindistan", lat: 19.089, lng: 72.868 },
    { code: "DEL", city: "Yeni Delhi", name: "Indira Gandhi", country: "Hindistan", lat: 28.566, lng: 77.103 },
    { code: "BKK", city: "Bangkok", name: "Suvarnabhumi Havalimanı", country: "Tayland", lat: 13.690, lng: 100.750 },
    { code: "HKT", city: "Phuket", name: "Phuket Havalimanı", country: "Tayland", lat: 8.113, lng: 98.306 },
    { code: "SIN", city: "Singapur", name: "Changi Havalimanı", country: "Singapur", lat: 1.364, lng: 103.991 },
    { code: "KUL", city: "Kuala Lumpur", name: "Kuala Lumpur Havalimanı", country: "Malezya", lat: 2.745, lng: 101.709 },
    { code: "CGK", city: "Cakarta", name: "Soekarno-Hatta", country: "Endonezya", lat: -6.125, lng: 106.655 },
    { code: "DPS", city: "Bali", name: "Ngurah Rai Havalimanı", country: "Endonezya", lat: -8.748, lng: 115.167 },
    { code: "MNL", city: "Manila", name: "Ninoy Aquino", country: "Filipinler", lat: 14.508, lng: 121.019 },
    { code: "NRT", city: "Tokyo Narita", name: "Narita Havalimanı", country: "Japonya", lat: 35.772, lng: 140.392 },
    { code: "HND", city: "Tokyo Haneda", name: "Haneda Havalimanı", country: "Japonya", lat: 35.549, lng: 139.779 },
    { code: "ICN", city: "Seul", name: "Incheon Havalimanı", country: "Güney Kore", lat: 37.460, lng: 126.440 },
    { code: "PEK", city: "Pekin", name: "Pekin Başkent Havalimanı", country: "Çin", lat: 40.080, lng: 116.584 },
    { code: "PVG", city: "Şanghay", name: "Pudong Havalimanı", country: "Çin", lat: 31.144, lng: 121.808 },
    { code: "CAN", city: "Guangzhou", name: "Guangzhou Baiyun", country: "Çin", lat: 23.392, lng: 113.299 },
    { code: "HKG", city: "Hong Kong", name: "Hong Kong Havalimanı", country: "Hong Kong", lat: 22.308, lng: 113.914 },
    { code: "TPE", city: "Taipei", name: "Taoyuan Havalimanı", country: "Tayvan", lat: 25.079, lng: 121.234 },
    { code: "SYD", city: "Sidney", name: "Kingsford Smith Havalimanı", country: "Avustralya", lat: -33.946, lng: 151.177 },
    { code: "MEL", city: "Melbourne", name: "Melbourne Havalimanı", country: "Avustralya", lat: -37.673, lng: 144.843 },

    { code: "CAI", city: "Kahire", name: "Kahire Havalimanı", country: "Mısır", lat: 30.121, lng: 31.405 },
    { code: "JNB", city: "Johannesburg", name: "O.R. Tambo Havalimanı", country: "Güney Afrika", lat: -26.139, lng: 28.246 },
    { code: "CPT", city: "Cape Town", name: "Cape Town Havalimanı", country: "Güney Afrika", lat: -33.978, lng: 18.601 },
    { code: "CMN", city: "Kazablanka", name: "Mohammed V Havalimanı", country: "Fas", lat: 33.367, lng: -7.589 },
    { code: "TUN", city: "Tunus", name: "Tunus-Kartaca Havalimanı", country: "Tunus", lat: 36.851, lng: 10.227 },
    { code: "ALG", city: "Cezayir", name: "Houari Boumediene", country: "Cezayir", lat: 36.691, lng: 3.215 },
    { code: "NBO", city: "Nairobi", name: "Jomo Kenyatta", country: "Kenya", lat: -1.319, lng: 36.927 },
    { code: "ADD", city: "Addis Ababa", name: "Bole Havalimanı", country: "Etiyopya", lat: 8.977, lng: 38.799 }
  ];

  // Haversine formula to compute distance between two lat/lng points
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Helper to normalize Turkish characters and diacritics for robust searching
  function normalizeText(text) {
    if (!text) return '';
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/İ/g, 'i')
      .replace(/I/g, 'i')
      .toLowerCase();
  }

  THY.getAirportCoordinates = async (code, cityName) => {
    // 1. Check in hardcoded database first
    const ap = AIRPORTS.find(a => a.code === code);
    if (ap) return { lat: ap.lat, lng: ap.lng, city: ap.city, name: ap.name };

    // 2. Try to Geocode using the city name or IATA code
    const query = cityName ? `${cityName} ${code}` : `Airport ${code}`;
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve) => {
      geocoder.geocode({ address: query }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const loc = results[0].geometry.location;
          resolve({
            lat: loc.lat(),
            lng: loc.lng(),
            city: cityName || results[0].formatted_address.split(',')[0],
            name: results[0].formatted_address
          });
        } else {
          // Absolute fallback
          resolve({ lat: 40.641, lng: -73.778, city: cityName || code || 'New York', name: 'John F. Kennedy Havalimanı' });
        }
      });
    });
  };

  // ---- AUTOCOMPLETE SUGGESTIONS ENGINE ----
  function setupAutocomplete(inputId, suggestionsId) {
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);
    if (!input || !suggestions) return;

    input.addEventListener('input', (e) => {
      const rawVal = e.target.value.trim();
      const val = normalizeText(rawVal);
      suggestions.innerHTML = '';
      if (!val) {
        suggestions.classList.remove('active');
        return;
      }

      // Check if it looks like a flight code pattern in the departure input
      if (inputId === 'flightDepartureInput') {
        const flightCodeRegex = /^(TK|THY)?\s*\d{1,4}[A-Z]?$/i;
        if (flightCodeRegex.test(rawVal)) {
          let codeDisplay = rawVal.toUpperCase();
          if (!codeDisplay.startsWith('TK') && !codeDisplay.startsWith('THY')) {
            codeDisplay = 'TK ' + codeDisplay;
          }
          const div = document.createElement('div');
          div.className = 'suggestion-item flight-code-suggestion';
          div.style.background = 'rgba(230, 26, 59, 0.1)';
          div.style.borderLeft = '3px solid var(--thy-red)';
          div.innerHTML = `
            <span>🔍 <strong>Uçuş Kodu Ara:</strong> ${codeDisplay}</span>
            <span class="suggestion-code" style="color: var(--thy-red);">CANLI</span>
          `;
          div.addEventListener('click', () => {
            input.value = codeDisplay;
            input.dataset.isFlightCode = 'true';
            input.dataset.code = '';
            suggestions.innerHTML = '';
            suggestions.classList.remove('active');
            input.dispatchEvent(new Event('input'));
            
            // Automatically click search
            setTimeout(() => {
              document.getElementById('btnSearchFlights')?.click();
            }, 100);
          });
          suggestions.appendChild(div);
          suggestions.classList.add('active');
        }
      }

      // Clear flight code flag if they type something else
      if (inputId === 'flightDepartureInput' && !/^(TK|THY)?\s*\d{1,4}[A-Z]?$/i.test(rawVal)) {
        input.removeAttribute('data-is-flight-code');
      }

      const filtered = AIRPORTS.filter(ap => 
        normalizeText(ap.city).includes(val) || 
        normalizeText(ap.code).includes(val) || 
        normalizeText(ap.name).includes(val) ||
        normalizeText(ap.country).includes(val)
      );

      if (filtered.length === 0 && suggestions.children.length === 0) {
        const div = document.createElement('div');
        div.className = 'suggestion-item dynamic-suggestion';
        div.style.background = 'rgba(200, 169, 81, 0.1)';
        div.style.borderLeft = '3px solid var(--thy-gold)';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.innerHTML = `
          <span>🔍 <strong>Haritada Keşfet:</strong> "${rawVal}"</span>
          <span class="suggestion-code" style="color: var(--thy-gold); font-size: 10px; font-weight: 800;">BULUT</span>
        `;
        div.addEventListener('click', () => {
          input.value = rawVal;
          const tempCode = rawVal.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase() || 'XXX';
          input.dataset.code = tempCode;
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address: rawVal }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
              const loc = results[0].geometry.location;
              input.dataset.lat = loc.lat();
              input.dataset.lng = loc.lng();
              console.log(`✈️ Resolved dynamic location "${rawVal}" to coordinates:`, loc.lat(), loc.lng());
            }
          });
          suggestions.innerHTML = '';
          suggestions.classList.remove('active');
          input.dispatchEvent(new Event('input'));
        });
        suggestions.appendChild(div);
        suggestions.classList.add('active');
        return;
      }

      filtered.forEach(ap => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
          <span>🛫 <strong>${ap.city}</strong> - ${ap.name} (${ap.country})</span>
          <span class="suggestion-code">${ap.code}</span>
        `;
        div.addEventListener('click', () => {
          input.value = `${ap.city} (${ap.code})`;
          input.dataset.code = ap.code;
          input.dataset.lat = ap.lat;
          input.dataset.lng = ap.lng;
          suggestions.innerHTML = '';
          suggestions.classList.remove('active');
          input.dispatchEvent(new Event('input'));
        });
        suggestions.appendChild(div);
      });
      suggestions.classList.add('active');
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.classList.remove('active');
      }
    });
  }

  // Initialize Autocompletes
  setupAutocomplete('flightDepartureInput', 'depSuggestions');
  setupAutocomplete('flightDestinationInput', 'destSuggestions');

  // ---- NEAREST AIRPORT GEOLOCATION ----
  document.getElementById('btnDetectLocation')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      THY.toast('Tarayıcınız konum servisini desteklemiyor.', 'error');
      return;
    }
    THY.toast('Konumunuz tespit ediliyor...', 'info');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;
        
        let nearest = null;
        let minDist = Infinity;
        
        AIRPORTS.forEach(ap => {
          const d = getDistance(uLat, uLng, ap.lat, ap.lng);
          if (d < minDist) {
            minDist = d;
            nearest = ap;
          }
        });
        
        if (nearest) {
          const depInput = document.getElementById('flightDepartureInput');
          if (depInput) {
            depInput.value = `${nearest.city} (${nearest.code})`;
            depInput.dataset.code = nearest.code;
            depInput.dataset.lat = nearest.lat;
            depInput.dataset.lng = nearest.lng;
            THY.toast(`Konum algılandı: En yakın havalimanı ${nearest.name} (${nearest.code})`, 'success');
          }
        }
      },
      (error) => {
        console.error(error);
        THY.toast('Konum bilgisi alınamadı. Lütfen listeden seçin.', 'error');
      }
    );
  });

  // ---- INITIALIZE BOOKING DATES & TRIP TYPE ----
  const today = new Date();
  const returnDate = new Date(today);
  returnDate.setDate(returnDate.getDate() + 4);

  const formatDateLocal = (date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const depInput = document.getElementById('flightDepartureInput');
  const destInput = document.getElementById('flightDestinationInput');
  if (depInput && !depInput.value) {
    depInput.value = 'İstanbul (IST)';
    depInput.dataset.code = 'IST';
    depInput.dataset.lat = '41.275';
    depInput.dataset.lng = '28.751';
  }
  if (destInput && !destInput.value) {
    destInput.value = 'Roma (FCO)';
    destInput.dataset.code = 'FCO';
    destInput.dataset.lat = '41.800';
    destInput.dataset.lng = '12.238';
  }

  const depDateInput = document.getElementById('flightDepartureDate');
  const retDateInput = document.getElementById('flightReturnDate');
  const todayStr = formatDateLocal(today);
  
  if (depDateInput) {
    depDateInput.setAttribute('min', todayStr);
    depDateInput.value = todayStr;
    
    depDateInput.addEventListener('change', () => {
      if (retDateInput) {
        retDateInput.setAttribute('min', depDateInput.value);
        if (retDateInput.value && retDateInput.value < depDateInput.value) {
          retDateInput.value = depDateInput.value;
        }
      }
    });
  }
  
  if (retDateInput) {
    retDateInput.setAttribute('min', todayStr);
    retDateInput.value = formatDateLocal(returnDate);
  }

  let currentTripType = 'round-trip';
  const btnRoundTrip = document.getElementById('btnRoundTrip');
  const btnOneWay = document.getElementById('btnOneWay');
  const radioRoundTrip = document.getElementById('radioRoundTrip');
  const radioOneWay = document.getElementById('radioOneWay');
  const returnDateGroup = document.getElementById('returnDateGroup');

  if (radioRoundTrip && radioOneWay) {
    radioRoundTrip.addEventListener('change', () => {
      if (radioRoundTrip.checked) {
        currentTripType = 'round-trip';
        btnRoundTrip?.classList.add('active');
        btnOneWay?.classList.remove('active');
        returnDateGroup?.classList.remove('hidden-date');
        if (retDateInput) {
          retDateInput.removeAttribute('disabled');
          const defaultRet = new Date();
          if (depDateInput && depDateInput.value) {
            const parts = depDateInput.value.split('-');
            const depD = new Date(parts[0], parts[1] - 1, parts[2]);
            defaultRet.setTime(depD.getTime());
          }
          defaultRet.setDate(defaultRet.getDate() + 4);
          retDateInput.value = formatDateLocal(defaultRet);
        }
      }
    });

    radioOneWay.addEventListener('change', () => {
      if (radioOneWay.checked) {
        currentTripType = 'one-way';
        btnOneWay?.classList.add('active');
        btnRoundTrip?.classList.remove('active');
        returnDateGroup?.classList.add('hidden-date');
        if (retDateInput) {
          retDateInput.setAttribute('disabled', 'true');
          retDateInput.value = '';
        }
      }
    });
  }

  // ---- CUSTOM DATEPICKER CALENDAR & PASSENGER POPOVER LOGIC ----
  const cellDates = document.getElementById('cellDates');
  const datepickerModal = document.getElementById('customDatePickerModal');
  const btnCloseDatePicker = document.getElementById('btnCloseDatePicker');
  const btnPrevMonth = document.getElementById('btnPrevMonth');
  const btnNextMonth = document.getElementById('btnNextMonth');
  const btnDateClear = document.getElementById('btnDateClear');
  const btnDateConfirm = document.getElementById('btnDateConfirm');
  const daysGrid1 = document.getElementById('daysGrid1');
  const daysGrid2 = document.getElementById('daysGrid2');
  const monthTitle1 = document.getElementById('monthTitle1');
  const monthTitle2 = document.getElementById('monthTitle2');
  
  let selectedStartDate = depDateInput?.value || '';
  let selectedEndDate = retDateInput?.value || '';
  let calendarCurrentDate = new Date();
  if (selectedStartDate) {
    calendarCurrentDate = new Date(selectedStartDate);
  }

  function renderCustomCalendar() {
    if (!daysGrid1 || !daysGrid2) return;
    daysGrid1.innerHTML = '';
    daysGrid2.innerHTML = '';

    const firstMonthDate = new Date(calendarCurrentDate.getFullYear(), calendarCurrentDate.getMonth(), 1);
    const secondMonthDate = new Date(firstMonthDate.getFullYear(), firstMonthDate.getMonth() + 1, 1);

    const trMonths = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const enMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const getMonthTitle = (d) => {
      const m = d.getMonth();
      const y = d.getFullYear();
      const mName = THY.currentLanguage === 'en' ? enMonths[m] : trMonths[m];
      return `${mName} ${y}`;
    };

    if (monthTitle1) monthTitle1.textContent = getMonthTitle(firstMonthDate);
    if (monthTitle2) monthTitle2.textContent = getMonthTitle(secondMonthDate);

    // Disable prev button if current month is <= today's month
    const isPrevDisabled = firstMonthDate.getFullYear() <= today.getFullYear() && firstMonthDate.getMonth() <= today.getMonth();
    if (btnPrevMonth) {
      btnPrevMonth.disabled = isPrevDisabled;
      btnPrevMonth.style.opacity = isPrevDisabled ? '0.3' : '1';
      btnPrevMonth.style.pointerEvents = isPrevDisabled ? 'none' : 'auto';
    }

    renderSingleMonth(firstMonthDate, daysGrid1);
    renderSingleMonth(secondMonthDate, daysGrid2);
  }

  function renderSingleMonth(baseDate, gridEl) {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayIndex = (firstDay.getDay() + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    // Empty slots
    for (let i = 0; i < startDayIndex; i++) {
      const emptySpan = document.createElement('span');
      emptySpan.className = 'empty-day';
      gridEl.appendChild(emptySpan);
    }
    
    const todayYMD = formatDateLocal(today);

    for (let d = 1; d <= totalDays; d++) {
      const daySpan = document.createElement('span');
      daySpan.textContent = d;
      
      const currentD = new Date(year, month, d);
      const currentYMD = formatDateLocal(currentD);
      
      if (currentYMD < todayYMD) {
        daySpan.className = 'past-day';
      } else {
        if (selectedStartDate && currentYMD === selectedStartDate) {
          daySpan.classList.add('selected-day');
        } else if (selectedEndDate && currentYMD === selectedEndDate) {
          daySpan.classList.add('selected-day');
        } else if (selectedStartDate && selectedEndDate && currentYMD > selectedStartDate && currentYMD < selectedEndDate) {
          daySpan.classList.add('range-day');
        }
        
        daySpan.addEventListener('click', () => {
          handleDayClick(currentYMD);
        });
      }
      gridEl.appendChild(daySpan);
    }
  }

  function handleDayClick(ymd) {
    if (currentTripType === 'one-way') {
      selectedStartDate = ymd;
      selectedEndDate = '';
    } else {
      if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
        selectedStartDate = ymd;
        selectedEndDate = '';
      } else {
        if (ymd < selectedStartDate) {
          selectedStartDate = ymd;
          selectedEndDate = '';
        } else {
          selectedEndDate = ymd;
        }
      }
    }
    renderCustomCalendar();
  }

  if (cellDates) {
    cellDates.addEventListener('click', (e) => {
      if (datepickerModal?.classList.contains('hidden')) {
        selectedStartDate = depDateInput?.value || '';
        selectedEndDate = retDateInput?.value || '';
        if (selectedStartDate) {
          calendarCurrentDate = new Date(selectedStartDate);
        } else {
          calendarCurrentDate = new Date();
        }
        renderCustomCalendar();
        datepickerModal.classList.remove('hidden');
      }
    });
  }

  if (datepickerModal) {
    datepickerModal.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  if (btnCloseDatePicker) {
    btnCloseDatePicker.addEventListener('click', (e) => {
      e.stopPropagation();
      datepickerModal.classList.add('hidden');
    });
  }

  if (btnDateClear) {
    btnDateClear.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedStartDate = '';
      selectedEndDate = '';
      renderCustomCalendar();
    });
  }

  if (btnPrevMonth) {
    btnPrevMonth.addEventListener('click', (e) => {
      e.stopPropagation();
      calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() - 1);
      renderCustomCalendar();
    });
  }

  if (btnNextMonth) {
    btnNextMonth.addEventListener('click', (e) => {
      e.stopPropagation();
      calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + 1);
      renderCustomCalendar();
    });
  }

  if (btnDateConfirm) {
    btnDateConfirm.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!selectedStartDate) {
        THY.toast(THY.currentLanguage === 'en' ? 'Please select departure date' : 'Lütfen gidiş tarihini seçin.', 'error');
        return;
      }
      if (currentTripType === 'round-trip' && !selectedEndDate) {
        THY.toast(THY.currentLanguage === 'en' ? 'Please select return date' : 'Lütfen dönüş tarihini seçin.', 'error');
        return;
      }
      if (depDateInput) {
        depDateInput.value = selectedStartDate;
        depDateInput.dispatchEvent(new Event('change'));
      }
      if (retDateInput) {
        retDateInput.value = selectedEndDate;
        retDateInput.dispatchEvent(new Event('change'));
      }
      datepickerModal.classList.add('hidden');
    });
  }

  // ---- CUSTOM PASSENGER POPOVER LOGIC ----
  const passengerDisplay = document.getElementById('passengerDisplay');
  const passengerPopover = document.getElementById('passengerPopover');
  const btnPassengerConfirm = document.getElementById('btnPassengerConfirm');
  const tabCabinEco = document.getElementById('tabCabinEco');
  const tabCabinBus = document.getElementById('tabCabinBus');
  const flightPassengers = document.getElementById('flightPassengers');
  const flightCabinClass = document.getElementById('flightCabinClass');
  const cntAdult = document.getElementById('cntAdult');
  const cntChild = document.getElementById('cntChild');
  const cntInfant = document.getElementById('cntInfant');
  const cntDisabled = document.getElementById('cntDisabled');

  let selectedCabin = flightCabinClass?.value || 'economy';

  function updateCabinTabs() {
    if (selectedCabin === 'economy') {
      tabCabinEco?.classList.add('active');
      tabCabinBus?.classList.remove('active');
    } else {
      tabCabinBus?.classList.add('active');
      tabCabinEco?.classList.remove('active');
    }
  }

  tabCabinEco?.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedCabin = 'economy';
    updateCabinTabs();
  });

  tabCabinBus?.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedCabin = 'business';
    updateCabinTabs();
  });

  const passengerRows = document.querySelectorAll('#passengerPopover .passenger-row');
  passengerRows.forEach(row => {
    const type = row.dataset.type;
    const decBtn = row.querySelector('.dec-btn');
    const incBtn = row.querySelector('.inc-btn');
    const counterVal = row.querySelector('.counter-val');

    incBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      let adult = parseInt(cntAdult.textContent) || 0;
      let child = parseInt(cntChild.textContent) || 0;
      let infant = parseInt(cntInfant.textContent) || 0;
      let disabled = parseInt(cntDisabled.textContent) || 0;
      let total = adult + child + infant + disabled;

      if (total >= 9) {
        THY.toast(THY.currentLanguage === 'en' ? 'Maximum 9 passengers allowed' : 'Maksimum 9 yolcu seçilebilir.', 'warning');
        return;
      }

      if (type === 'adult') {
        adult++;
        cntAdult.textContent = adult;
      } else if (type === 'child') {
        child++;
        cntChild.textContent = child;
      } else if (type === 'infant') {
        if (infant >= adult) {
          THY.toast(THY.currentLanguage === 'en' ? 'Infants cannot exceed adults' : 'Bebek sayısı yetişkin sayısını geçemez.', 'warning');
          return;
        }
        infant++;
        cntInfant.textContent = infant;
      } else if (type === 'disabled') {
        disabled++;
        cntDisabled.textContent = disabled;
      }
    });

    decBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      let adult = parseInt(cntAdult.textContent) || 0;
      let child = parseInt(cntChild.textContent) || 0;
      let infant = parseInt(cntInfant.textContent) || 0;
      let disabled = parseInt(cntDisabled.textContent) || 0;

      if (type === 'adult') {
        if (adult <= 1) return;
        if (infant >= adult) {
          THY.toast(THY.currentLanguage === 'en' ? 'Infants cannot exceed adults' : 'Bebek sayısı yetişkin sayısını geçemez.', 'warning');
          return;
        }
        adult--;
        cntAdult.textContent = adult;
      } else if (type === 'child') {
        if (child <= 0) return;
        child--;
        cntChild.textContent = child;
      } else if (type === 'infant') {
        if (infant <= 0) return;
        infant--;
        cntInfant.textContent = infant;
      } else if (type === 'disabled') {
        if (disabled <= 0) return;
        disabled--;
        cntDisabled.textContent = disabled;
      }
    });
  });

  passengerDisplay?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (passengerPopover?.classList.contains('hidden')) {
      selectedCabin = flightCabinClass?.value || 'economy';
      updateCabinTabs();
      passengerPopover.classList.remove('hidden');
    } else {
      passengerPopover.classList.add('hidden');
    }
  });

  if (passengerPopover) {
    passengerPopover.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  btnPassengerConfirm?.addEventListener('click', (e) => {
    e.stopPropagation();
    let adult = parseInt(cntAdult.textContent) || 0;
    let child = parseInt(cntChild.textContent) || 0;
    let infant = parseInt(cntInfant.textContent) || 0;
    let disabled = parseInt(cntDisabled.textContent) || 0;
    let total = adult + child + infant + disabled;

    if (flightPassengers) {
      flightPassengers.value = total.toString();
      flightPassengers.dispatchEvent(new Event('change'));
    }
    if (flightCabinClass) {
      flightCabinClass.value = selectedCabin;
      flightCabinClass.dispatchEvent(new Event('change'));
    }

    const passengerDisplayText = document.getElementById('passengerDisplayText');
    if (passengerDisplayText) {
      const isEn = THY.currentLanguage === 'en';
      const label = selectedCabin === 'economy' ? 'ECO' : 'BUS';
      if (isEn) {
        passengerDisplayText.textContent = `${total} Passenger${total > 1 ? 's' : ''} / ${label}`;
      } else {
        passengerDisplayText.textContent = `${total} Yolcu / ${label}`;
      }
    }
    passengerPopover?.classList.add('hidden');
  });

  document.addEventListener('click', () => {
    datepickerModal?.classList.add('hidden');
    passengerPopover?.classList.add('hidden');
  });

  // Gidiş tarihi değiştiğinde dönüş tarihini otomatik olarak 4 gün sonrasına güncelle
  if (depDateInput && retDateInput) {
    depDateInput.addEventListener('change', () => {
      if (depDateInput.value && currentTripType === 'round-trip') {
        const parts = depDateInput.value.split('-');
        const depD = new Date(parts[0], parts[1] - 1, parts[2]);
        const retD = new Date(depD);
        retD.setDate(retD.getDate() + 4);
        retDateInput.value = formatDateLocal(retD);
      }
    });
  }

  // Kalkış ve Varış yerlerini yer değiştirme (Swap Locations)
  const btnSwapLocations = document.getElementById('btnSwapLocations');

  if (btnSwapLocations && depInput && destInput) {
    btnSwapLocations.addEventListener('click', () => {
      const tempVal = depInput.value;
      const tempCode = depInput.dataset.code || '';
      const tempLat = depInput.dataset.lat || '';
      const tempLng = depInput.dataset.lng || '';
      
      depInput.value = destInput.value;
      depInput.dataset.code = destInput.dataset.code || '';
      depInput.dataset.lat = destInput.dataset.lat || '';
      depInput.dataset.lng = destInput.dataset.lng || '';
      
      destInput.value = tempVal;
      destInput.dataset.code = tempCode;
      destInput.dataset.lat = tempLat;
      destInput.dataset.lng = tempLng;
      
      // Kalkış ve varış metinlerini ve alt metinlerini güncelle
      const subDep = document.getElementById('subDeparture');
      const subDest = document.getElementById('subDestination');
      
      if (subDep) {
        subDep.textContent = depInput.value ? (depInput.value.includes('(') ? depInput.value : depInput.value + ' Havalimanı') : 'İstanbul (Tümü)';
      }
      if (subDest) {
        subDest.textContent = destInput.value ? (destInput.value.includes('(') ? destInput.value : destInput.value + ' Havalimanı') : 'Gideceğiniz şehir';
      }
      
      // Tetikleyici olayları çalıştır (Change event)
      depInput.dispatchEvent(new Event('input'));
      destInput.dispatchEvent(new Event('input'));
      depInput.dispatchEvent(new Event('change'));
      destInput.dispatchEvent(new Event('change'));
      
      THY.toast ? THY.toast(THY.currentLanguage === 'en' ? 'Locations swapped' : 'Kalkış ve varış noktaları değiştirildi.', 'info') : console.log('Swapped destinations');
    });
  }

  // Update sub-text dynamically
  const updateInputSubtext = (inputEl, subtextElId, defaultText) => {
    if (!inputEl) return;
    const subtextEl = document.getElementById(subtextElId);
    if (!subtextEl) return;
    
    const update = () => {
      const val = inputEl.value;
      if (!val) {
        subtextEl.textContent = defaultText;
      } else {
        const code = inputEl.dataset.code;
        if (code) {
          const ap = AIRPORTS.find(x => x.code === code);
          subtextEl.textContent = ap ? ap.name : val;
        } else {
          subtextEl.textContent = val;
        }
      }
    };
    
    inputEl.addEventListener('input', update);
    inputEl.addEventListener('change', update);
    // Initial call
    update();
  };

  updateInputSubtext(document.getElementById('flightDepartureInput'), 'subDeparture', 'İstanbul (Tümü)');
  updateInputSubtext(document.getElementById('flightDestinationInput'), 'subDestination', 'Gideceğiniz şehir');

  // ---- TURKISH AIRLINES LIVE API INTEGRATION ----
  async function fetchThyLiveFlights(fromCode, toCode, date, cabin) {
    const thySettings = thyApiConfig;
    if (!thySettings.clientId || !thySettings.clientSecret) {
      return null; // Fallback to simulated dynamic data
    }

    try {
      // Step 1: SSO Token Request (OAuth 2.0 Client Credentials Grant)
      const tokenRes = await fetch('https://api.turkishairlines.com/v2/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: thySettings.clientId,
          client_secret: thySettings.clientSecret
        })
      });

      if (!tokenRes.ok) {
        throw new Error('SSO Token Call failed: ' + tokenRes.statusText);
      }

      const tokenData = await tokenRes.json();
      const token = tokenData.access_token;

      // Step 2: Get Flight Availability Request
      const transactionId = 'TX-' + Math.floor(Math.random() * 1000000);
      const requestBody = {
        "requestHeader": {
          "clientTransactionId": transactionId,
          "channel": "WEB"
        },
        "originDestinationInformation": [
          {
            "departureDateTime": {
              "date": date // Format: YYYY-MM-DD
            },
            "origin": fromCode,
            "destination": toCode
          }
        ],
        "passengerCount": 1
      };

      const res = await fetch('https://api.turkishairlines.com/v2/test/flightavailability', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'transactionId': transactionId
        },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        throw new Error('Flight Availability Call failed: ' + res.statusText);
      }

      const data = await res.json();
      
      // Parse THY response schema to match app's flight format
      const flights = [];
      const options = data?.data?.availabilityResult?.originDestinationOptions;
      if (options && options.length > 0) {
        options.forEach(opt => {
          if (opt.flightSegments) {
            opt.flightSegments.forEach(seg => {
              const depTime = new Date(seg.departureDateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
              const arrTime = new Date(seg.arrivalDateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
              const flightNo = (seg.carrierCode || 'TK') + ' ' + (seg.flightNumber || '1862');
              const gate = seg.departureTerminal || 'A' + Math.floor(Math.random() * 12 + 1);
              flights.push({ dep: depTime, arr: arrTime, flightNo, gate });
            });
          }
        });
      }
      
    } catch (err) {
      console.warn('THY API Client connection bypassed/CORS block. Details:', err);
      THY.toast('THY Live API: CORS veya yetkilendirme engeli. Canlı dinamik simülasyona dönüldü.', 'info', 4500);
      return null;
    }
  }

  // ---- THY APIM LIVE FLIGHT API INTEGRATION (via Server Proxy) ----
  async function fetchTHYApiFlights(fromCode, toCode, date, returnDate, passengers, cabinClass) {
    try {
      let url = `/api/flights?type=route&from=${fromCode}&to=${toCode}`;
      if (date) url += `&date=${date}`;
      if (returnDate) url += `&returnDate=${returnDate}`;
      if (passengers) url += `&passengers=${passengers}`;
      if (cabinClass) url += `&class=${cabinClass}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('THY API proxy call failed: ' + res.statusText);
      }

      const data = await res.json();

      if (data.error) {
        throw new Error('THY API response error: ' + (data.details || data.error));
      }

      const isSimulation = data.source === 'SIMULATION';

      // Parse outbound flights from new THY APIM format
      const outbound = [];
      const outboundData = data.outbound || data.data || [];
      if (Array.isArray(outboundData) && outboundData.length > 0) {
        outboundData.forEach(item => {
          const depTime = item.departure?.time || item.dep || '';
          const arrTime = item.arrival?.time || item.arr || '';
          const flightNo = item.flightNumber || item.flightNo || `TK ${Math.floor(1000 + Math.random() * 9000)}`;
          const gate = item.gate || item.departure?.gate || 'A' + Math.floor(Math.random() * 10 + 1);
          const delay = item.delay || 0;
          const status = item.status || 'Scheduled';
          const aircraft = item.aircraft || '';
          const duration = item.duration || '';
          const durationMinutes = item.durationMinutes || 0;
          const stops = item.stops || 0;
          const price = item.price || null;
          const fareFamily = item.fareFamily || null;
          const seatAvailability = item.seatAvailability || null;

          if (depTime && arrTime) {
            outbound.push({
              dep: depTime, arr: arrTime, flightNo, gate, delay, status,
              aircraft, duration, durationMinutes, stops, price, fareFamily, seatAvailability
            });
          }
        });
      }

      // Parse inbound flights
      const inbound = [];
      const inboundData = data.inbound || [];
      if (Array.isArray(inboundData) && inboundData.length > 0) {
        inboundData.forEach(item => {
          const depTime = item.departure?.time || item.dep || '';
          const arrTime = item.arrival?.time || item.arr || '';
          const flightNo = item.flightNumber || item.flightNo || `TK ${Math.floor(1000 + Math.random() * 9000)}`;
          const gate = item.gate || 'B' + Math.floor(Math.random() * 10 + 1);
          const delay = item.delay || 0;
          const status = item.status || 'Scheduled';
          const aircraft = item.aircraft || '';
          const duration = item.duration || '';
          const durationMinutes = item.durationMinutes || 0;
          const stops = item.stops || 0;
          const price = item.price || null;
          const fareFamily = item.fareFamily || null;
          const seatAvailability = item.seatAvailability || null;

          if (depTime && arrTime) {
            inbound.push({
              dep: depTime, arr: arrTime, flightNo, gate, delay, status,
              aircraft, duration, durationMinutes, stops, price, fareFamily, seatAvailability
            });
          }
        });
      }

      if (outbound.length > 0) {
        const source = isSimulation ? 'Dinamik Simülasyon' : 'THY APIM';
        THY.toast(isSimulation
          ? (THY.currentLanguage === 'en' ? 'Dynamic Simulation Active ✈️' : 'Dinamik Simülasyon Aktif ✈️')
          : (THY.currentLanguage === 'en' ? 'THY Live Flight Data Loaded! ✈️' : 'THY Canlı Uçuş Verileri Yüklendi! ✈️'),
          'success');
        return { outbound, inbound, source: data.source || 'THY_APIM' };
      }
      return null;

    } catch (err) {
      console.warn('THY API proxy call failed:', err);
      THY.toast(
        THY.currentLanguage === 'en'
          ? 'THY API Connection Issue. Dynamic Simulation Activated.'
          : 'THY API Bağlantı Sorunu. Dinamik Simülasyon Devreye Alındı.',
        'info', 4500
      );
      return null;
    }
  }

  // ---- AVIATIONSTACK FLIGHT BY CODE LOOKUP (via Server Proxy) ----
  async function fetchFlightByCode(flightCode) {
    let cleanCode = flightCode.replace(/\s+/g, '').toUpperCase();
    if (!cleanCode.startsWith('TK') && !cleanCode.startsWith('THY')) {
      cleanCode = 'TK' + cleanCode;
    }

    try {
      const res = await fetch(`/api/flights?type=code&code=${cleanCode}`);
      if (!res.ok) throw new Error('Server proxy call failed: ' + res.statusText);
      const data = await res.json();

      if (data && data.data && data.data.length > 0) {
        const flights = [];
        data.data.forEach(item => {
          const carrier = item.airline?.iata || item.airline?.icao;
          const matchesCarrier = carrier === 'TK' || carrier === 'THY' || item.flight?.iata?.startsWith('TK');
          if (matchesCarrier) {
            const depTimeRaw = item.departure?.scheduled;
            const arrTimeRaw = item.arrival?.scheduled;
            if (depTimeRaw && arrTimeRaw) {
              const depTime = new Date(depTimeRaw).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
              const arrTime = new Date(arrTimeRaw).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
              const fNo = item.flight?.iata || cleanCode;
              const gate = item.departure?.gate || 'A' + Math.floor(Math.random() * 10 + 1);
              const delay = item.departure?.delay || 0;
              const status = item.flight_status || 'scheduled';
              const depIata = item.departure?.iata;
              const arrIata = item.arrival?.iata;
              
              flights.push({ dep: depTime, arr: arrTime, flightNo: fNo, gate, delay, status, depIata, arrIata });
            }
          }
        });
        return flights.length > 0 ? flights : null;
      }
      return null;
    } catch (err) {
      console.warn('fetchFlightByCode error:', err);
      return null;
    }
  }

  // ---- GENERATE SIMULATED FLIGHT BY CODE (FALLBACK) ----
  function generateSimulatedFlightByCode(flightCode) {
    let cleanCode = flightCode.replace(/\s+/g, '').toUpperCase();
    if (!cleanCode.startsWith('TK') && !cleanCode.startsWith('THY')) {
      cleanCode = 'TK ' + cleanCode;
    } else if (cleanCode.startsWith('TK') && !cleanCode.startsWith('TK ')) {
      cleanCode = 'TK ' + cleanCode.substring(2);
    }
    
    // Use user's selected departure and destination instead of hardcoded values
    const depInputEl = document.getElementById('flightDepartureInput');
    const destInputEl = document.getElementById('flightDestinationInput');
    const depCode = depInputEl?.dataset?.code || 'IST';
    const destCode = destInputEl?.dataset?.code || 'FCO';
    
    const departure = AIRPORTS.find(a => a.code === depCode) || AIRPORTS[0];
    const destination = AIRPORTS.find(a => a.code === destCode) || AIRPORTS[1];
    
    // Calculate realistic flight time based on distance
    const dist = getDistance(departure.lat, departure.lng, destination.lat, destination.lng);
    const durationMinutes = Math.max(45, Math.round(dist * 0.075 + 30));
    
    const depHour = 8 + Math.floor(Math.random() * 10); // 08:00 - 17:59 arası
    const depMin = Math.floor(Math.random() * 12) * 5; // 0,5,10,...55
    const depTime = `${String(depHour).padStart(2, '0')}:${String(depMin).padStart(2, '0')}`;
    
    let arrMin = depMin + durationMinutes;
    let arrHour = (depHour + Math.floor(arrMin / 60)) % 24;
    arrMin = arrMin % 60;
    const arrTime = `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`;
    
    const gate = 'A' + Math.floor(Math.random() * 10 + 1);
    
    // 15% chance of delay
    const delay = Math.random() < 0.15 ? Math.floor(Math.random() * 60 + 15) : 0;
    const status = delay > 0 ? 'incident' : 'scheduled';
    
    return [{
      dep: depTime,
      arr: arrTime,
      flightNo: cleanCode,
      gate: gate,
      delay: delay,
      status: status,
      depIata: departure.code,
      arrIata: destination.code
    }];
  }

  // ---- FLIGHT SEARCH & SELECTION ----
  document.getElementById('btnSearchFlights')?.addEventListener('click', async () => {
    const depInput = document.getElementById('flightDepartureInput');
    const destInput = document.getElementById('flightDestinationInput');
    const depVal = depInput?.value?.trim() || '';
    const destVal = destInput?.value?.trim() || '';
    
    // Check if it's a flight code search (either flagged by autocomplete, or matches regex directly)
    const flightCodeRegex = /^(TK|THY)?\s*\d{1,4}[A-Z]?$/i;
    const isFlightCodeSearch = flightCodeRegex.test(depVal) || depInput?.dataset?.isFlightCode === 'true';

    if (!isFlightCodeSearch && (!depVal || !destVal)) {
      THY.toast('Lütfen kalkış ve varış noktalarını seçin veya geçerli bir uçuş kodu girin.', 'error');
      return;
    }
    
    // Resolve airport code from typed text if necessary
    async function resolveAirportCode(val) {
      if (!val) return null;
      const cleanVal = val.toUpperCase().trim();
      
      const codeMatch = cleanVal.match(/\(([A-Z]{3})\)/) || cleanVal.match(/^([A-Z]{3})$/);
      if (codeMatch) {
        const matchedCode = codeMatch[1];
        const ap = AIRPORTS.find(a => a.code === matchedCode);
        if (ap) return ap;
        
        // If code is not in AIRPORTS, geocode to get coordinates
        const coords = await THY.getAirportCoordinates(matchedCode);
        return {
          code: matchedCode,
          city: cleanVal.replace(/\([A-Z]{3}\)/, '').trim() || coords.city,
          name: coords.name,
          lat: coords.lat,
          lng: coords.lng
        };
      }
      
      const normalizedInput = normalizeText(val);
      const matchedByCity = AIRPORTS.find(a => normalizeText(a.city) === normalizedInput);
      if (matchedByCity) return matchedByCity;
      
      const matchedByName = AIRPORTS.find(a => normalizeText(a.name).includes(normalizedInput));
      if (matchedByName) return matchedByName;

      // Geocoding fallback for typed string (e.g. "nweyork", "Miami")
      return new Promise((resolve) => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: val }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            const loc = results[0].geometry.location;
            const tempCode = val.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase() || 'XXX';
            
            let addressCity = '';
            const addressComponents = results[0].address_components;
            if (addressComponents) {
              const locality = addressComponents.find(c => c.types.includes('locality'));
              const adminArea = addressComponents.find(c => c.types.includes('administrative_area_level_1'));
              addressCity = locality ? locality.long_name : (adminArea ? adminArea.long_name : val);
            } else {
              addressCity = val;
            }

            // Check if the resolved city matches any hardcoded airport
            const normalizedAddressCity = normalizeText(addressCity);
            const ap = AIRPORTS.find(a => normalizeText(a.city) === normalizedAddressCity);
            if (ap) {
              resolve({
                code: ap.code,
                city: ap.city,
                name: ap.name,
                lat: ap.lat,
                lng: ap.lng
              });
              return;
            }

            resolve({
              code: tempCode,
              city: addressCity,
              name: results[0].formatted_address,
              lat: loc.lat(),
              lng: loc.lng()
            });
          } else {
            resolve(null);
          }
        });
      });
    }

    if (!isFlightCodeSearch) {
      const searchBtn = document.getElementById('btnSearchFlights');
      const originalText = searchBtn ? searchBtn.innerHTML : 'Uçuş Ara';
      if (searchBtn) {
        searchBtn.disabled = true;
        searchBtn.innerHTML = '🔍 Çözümleniyor...';
      }

      try {
        const resolvedDep = await resolveAirportCode(depVal);
        if (resolvedDep) {
          depInput.dataset.code = resolvedDep.code;
          depInput.dataset.lat = resolvedDep.lat;
          depInput.dataset.lng = resolvedDep.lng;
          depInput.dataset.city = resolvedDep.city;
          depInput.dataset.name = resolvedDep.name;
          depInput.value = `${resolvedDep.city} (${resolvedDep.code})`;
        } else {
          THY.toast('Kalkış noktası bulunamadı.', 'error');
          if (searchBtn) {
            searchBtn.disabled = false;
            searchBtn.innerHTML = originalText;
          }
          return;
        }

        const resolvedDest = await resolveAirportCode(destVal);
        if (resolvedDest) {
          destInput.dataset.code = resolvedDest.code;
          destInput.dataset.lat = resolvedDest.lat;
          destInput.dataset.lng = resolvedDest.lng;
          destInput.dataset.city = resolvedDest.city;
          destInput.dataset.name = resolvedDest.name;
          destInput.value = `${resolvedDest.city} (${resolvedDest.code})`;
        } else {
          THY.toast('Varış noktası bulunamadı.', 'error');
          if (searchBtn) {
            searchBtn.disabled = false;
            searchBtn.innerHTML = originalText;
          }
          return;
        }
      } catch (err) {
        console.error('Error resolving locations:', err);
        THY.toast('Konumlar çözümlenemedi.', 'error');
        if (searchBtn) {
          searchBtn.disabled = false;
          searchBtn.innerHTML = originalText;
        }
        return;
      } finally {
        if (searchBtn) {
          searchBtn.disabled = false;
          searchBtn.innerHTML = originalText;
        }
      }
    }

    let depCode = depInput.dataset.code;
    let destCode = destInput.dataset.code;
    const depDate = document.getElementById('flightDepartureDate')?.value;
    const retDate = document.getElementById('flightReturnDate')?.value;
    const cabin = document.getElementById('flightCabinClass')?.value;
    const flightPassengers = document.getElementById('flightPassengers');
    
    THY.lastFlightSearch = {
      depCode: depCode,
      destCode: destCode,
      depDate: depDate,
      retDate: retDate,
      cabin: cabin
    };
    
    if (!isFlightCodeSearch && depCode === destCode) {
      THY.toast('Kalkış ve varış noktaları aynı olamaz.', 'error');
      return;
    }

    if (!depDate) {
      THY.toast('Lütfen gidiş tarihini seçin.', 'error');
      return;
    }

    if (!isFlightCodeSearch && currentTripType === 'round-trip') {
      if (!retDate) {
        THY.toast('Lütfen dönüş tarihini seçin.', 'error');
        return;
      }
      if (new Date(retDate) < new Date(depDate)) {
        THY.toast('Dönüş tarihi gidiş tarihinden önce olamaz.', 'error');
        return;
      }
    }
    
    const listContainer = document.getElementById('flightListContainer');
    if (!listContainer) return;
    
    let selectedOutbound = null;
    let selectedInbound = null;
    let lastTransitionTime = 0;

    // Update the Turkish Airlines Search Results Banner fields
    const bannerDepVal = document.getElementById('bannerDepVal');
    const bannerDestVal = document.getElementById('bannerDestVal');
    const bannerDepDateVal = document.getElementById('bannerDepDateVal');
    const bannerRetDateVal = document.getElementById('bannerRetDateVal');
    const bannerRetDateBlock = document.getElementById('bannerRetDateBlock');
    const bannerPassVal = document.getElementById('bannerPassVal');

    if (bannerDepVal) bannerDepVal.textContent = depInput?.value || '';
    if (bannerDestVal) bannerDestVal.textContent = destInput?.value || '';
    
    const formatDateShort = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const monthsTr = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const m = d.getMonth();
      const day = d.getDate();
      const mName = THY.currentLanguage === 'en' ? monthsEn[m] : monthsTr[m];
      return `${day} ${mName}`;
    };

    if (bannerDepDateVal) bannerDepDateVal.textContent = formatDateShort(depDate);
    if (bannerRetDateVal) bannerRetDateVal.textContent = formatDateShort(retDate);
    
    if (bannerRetDateBlock) {
      if (currentTripType === 'one-way' || isFlightCodeSearch) {
        bannerRetDateBlock.style.display = 'none';
      } else {
        bannerRetDateBlock.style.display = 'block';
      }
    }
    
    if (bannerPassVal) {
      const paxCount = flightPassengers?.value || '1';
      const cab = cabin === 'business' ? 'BUS' : 'ECO';
      const isEn = THY.currentLanguage === 'en';
      if (isEn) {
        bannerPassVal.textContent = `${paxCount} Pax, ${cab}`;
      } else {
        bannerPassVal.textContent = `${paxCount} Yolcu, ${cab}`;
      }
    }
 
    function renderFlights(direction) {
      // 1. Fade out current content
      listContainer.classList.add('fade-out');
      listContainer.style.pointerEvents = 'none'; // Disable clicks during transition
 
      setTimeout(async () => {
        listContainer.innerHTML = '';
        
        const isOutbound = direction === 'outbound';
        const isEn = THY.currentLanguage === 'en';

        // Update step indicators
        const stepOutbound = document.getElementById('stepOutbound');
        const stepInbound = document.getElementById('stepInbound');
        if (isOutbound) {
          stepOutbound?.classList.add('active');
          stepOutbound?.classList.remove('completed');
          stepInbound?.classList.remove('active', 'completed');
        } else {
          stepOutbound?.classList.add('completed');
          stepOutbound?.classList.remove('active');
          stepInbound?.classList.add('active');
          stepInbound?.classList.remove('completed');
        }
        
        listContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state__icon">✈️</div>
            <div class="empty-state__title">${isEn ? 'Searching THY Flights' : 'THY Uçuşları Sorgulanıyor'}</div>
            <div class="empty-state__text">${isEn ? 'Connecting to Turkish Airlines flight database...' : 'Türk Hava Yolları uçuş veritabanına bağlanılıyor...'}</div>
          </div>
        `;
        
        // Fetch Live flights or fallback
        const searchDate = isOutbound ? depDate : retDate;
        let flightOptions = null;

        if (isFlightCodeSearch && isOutbound) {
          try {
            flightOptions = await fetchFlightByCode(depVal);
          } catch (e) {
            console.warn('Flight code fetch error:', e);
          }

          if (!flightOptions) {
            flightOptions = generateSimulatedFlightByCode(depVal);
            THY.toast(isEn ? 'Aviationstack Live Flight Database Issue. Simulation Started.' : 'Aviationstack Canlı Uçuş Veritabanı Sorunu. Simülasyon Çalıştırıldı.', 'info', 4500);
          }

          if (flightOptions && flightOptions.length > 0) {
            const firstFlight = flightOptions[0];
            depCode = firstFlight.depIata || 'IST';
            destCode = firstFlight.arrIata || 'NRT';

            // Hydrate input values and coordinates from AIRPORTS
            const depAp = AIRPORTS.find(a => a.code === depCode) || { city: 'İstanbul', name: 'İstanbul Havalimanı', code: depCode, lat: 41.275, lng: 28.751 };
            const destAp = AIRPORTS.find(a => a.code === destCode) || { city: 'Tokyo Narita', name: 'Narita Havalimanı', code: destCode, lat: 35.772, lng: 140.392 };
            
            depInput.value = `${depAp.city} (${depAp.code})`;
            depInput.dataset.code = depAp.code;
            depInput.dataset.lat = depAp.lat;
            depInput.dataset.lng = depAp.lng;
            
            destInput.value = `${destAp.city} (${destAp.code})`;
            destInput.dataset.code = destAp.code;
            destInput.dataset.lat = destAp.lat;
            destInput.dataset.lng = destAp.lng;
          }
        } else {
          const fromCode = isOutbound ? depCode : destCode;
          const toCode = isOutbound ? destCode : depCode;
          try {
            // Call THY APIM proxy (with real fare families, prices, deeplinks)
            const thyResult = await fetchTHYApiFlights(fromCode, toCode, searchDate, isOutbound ? retDate : null, flightPassengers?.value, cabin);
            if (thyResult && thyResult.outbound && thyResult.outbound.length > 0) {
              flightOptions = isOutbound ? thyResult.outbound : (thyResult.inbound || thyResult.outbound);
              // Store THY result for inbound reuse
              if (isOutbound) THY._lastTHYResult = thyResult;
            }
            if (!flightOptions) {
              flightOptions = await fetchThyLiveFlights(fromCode, toCode, searchDate, cabin);
            }
          } catch (e) {
            console.warn('THY API fetch error:', e);
          }
        }

        const fromCode = isOutbound ? depCode : destCode;
        const toCode = isOutbound ? destCode : depCode;
        const routeLabel = isEn
          ? (isOutbound ? `Select Outbound Flight (${fromCode} ➔ ${toCode})` : `Select Inbound Flight (${fromCode} ➔ ${toCode})`)
          : (isOutbound ? `Gidiş Uçuşu Seçin (${fromCode} ➔ ${toCode})` : `Dönüş Uçuşu Seçin (${fromCode} ➔ ${toCode})`);
        
        const routeLabelEl = document.getElementById('resultsRouteLabel');
        if (routeLabelEl) routeLabelEl.textContent = routeLabel;
 
        const bannerText = isEn
          ? (isOutbound ? `🛫 SELECT OUTBOUND FLIGHT (${fromCode} ➔ ${toCode})` : `🛬 SELECT INBOUND FLIGHT (${fromCode} ➔ ${toCode})`)
          : (isOutbound ? `🛫 GİDİŞ UÇUŞU SEÇİN (${fromCode} ➔ ${toCode})` : `🛬 DÖNÜŞ UÇUŞU SEÇİN (${fromCode} ➔ ${toCode})`);
        const bannerEl = document.getElementById('resultsRouteBanner');
        if (bannerEl) bannerEl.textContent = bannerText;

        // Update search title label dynamically
        const fromCity = AIRPORTS.find(a => a.code === fromCode)?.city || depInput.dataset.city || fromCode;
        const toCity = AIRPORTS.find(a => a.code === toCode)?.city || destInput.dataset.city || toCode;
        const opt = { day: 'numeric', month: 'long', weekday: 'long' };
        const formattedDateStr = new Date(searchDate).toLocaleDateString(THY.currentLanguage === 'en' ? 'en-US' : 'tr-TR', opt);
        const titleEl = document.getElementById('thyResultsTitleText');
        if (titleEl) {
          titleEl.textContent = `${fromCity} - ${toCity}, ${formattedDateStr}`;
        }

        listContainer.innerHTML = '';

        // Calculate dynamic flight duration using Haversine coordinates distance
        const depLat = parseFloat(depInput.dataset.lat);
        const depLng = parseFloat(depInput.dataset.lng);
        const destLat = parseFloat(destInput.dataset.lat);
        const destLng = parseFloat(destInput.dataset.lng);
        let flightDurationMinutes = 200; // default 3h 20m
        if (!isNaN(depLat) && !isNaN(depLng) && !isNaN(destLat) && !isNaN(destLng)) {
          const dist = getDistance(depLat, depLng, destLat, destLng);
          flightDurationMinutes = Math.max(45, Math.round(dist * 0.075 + 30));
        }
        const durationHoursStr = isEn
          ? `${Math.floor(flightDurationMinutes / 60)}h ${flightDurationMinutes % 60}m`
          : `${Math.floor(flightDurationMinutes / 60)}sa ${flightDurationMinutes % 60}dk`;

        const isSearchToday = formatDateLocal(new Date(searchDate)) === formatDateLocal(today);

        if (flightOptions && isSearchToday && !isFlightCodeSearch) {
          const currentHour = today.getHours();
          const currentMin = today.getMinutes();
          
          flightOptions = flightOptions.filter(fo => {
            const [h, m] = fo.dep.split(':').map(Number);
            return (h > currentHour) || (h === currentHour && m > currentMin);
          });
          
          if (flightOptions.length === 0) {
            flightOptions = null; // force simulator fallback
          }
        }

        const dateSeed = new Date(searchDate).getDate() || today.getDate();

        if (!flightOptions) {
          // Generate 5-6 realistic flight times (matching real THY schedules)
          let baseHours = isOutbound ? [7, 10, 12, 16, 19, 21] : [8, 11, 14, 17, 20, 22];

          if (isSearchToday) {
            const currentHour = today.getHours();
            baseHours = baseHours.filter(h => h > currentHour);
            if (baseHours.length === 0) baseHours = [currentHour + 1, currentHour + 3];
          }
          
          flightOptions = baseHours.map((hour, idx) => {
            const offsetMinutes = ((dateSeed * 7 + idx * 13) % 45);
            const depMin = (idx * 5 + offsetMinutes) % 60;
            const depHour = hour;
            
            const depTimeStr = `${String(depHour).padStart(2, '0')}:${String(depMin).padStart(2, '0')}`;
            
            let arrMin = depMin + flightDurationMinutes;
            let arrHour = (depHour + Math.floor(arrMin / 60)) % 24;
            arrMin = arrMin % 60;
            const arrTimeStr = `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`;
            
            const flightNumVal = 1000 + (dateSeed * 17 + idx * 4) % 900;
            const flightNo = `TK ${flightNumVal + (isOutbound ? 0 : 1)}`;
            
            const gates = ['A', 'B', 'C', 'D', 'E', 'F'];
            const gateChar = gates[(dateSeed + idx) % gates.length];
            const gateNum = ((dateSeed * 3 + idx * 7) % 19) + 1;
            const gate = `${gateChar}${gateNum}`;

            const isDelayed = (dateSeed + idx) % 7 === 0;
            const delay = isDelayed ? ((dateSeed * 5 + idx * 10) % 80 + 10) : 0;
            const status = delay > 0 ? 'incident' : 'scheduled';
            
            return { dep: depTimeStr, arr: arrTimeStr, flightNo, gate, delay, status };
          });
        }
        
        const formatPrice = (val) => Math.floor(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        const directLabel = isEn ? 'Nonstop' : 'Direkt';

        flightOptions.forEach((fo, idx) => {
          const priceEco = 3400 + idx * 800 + Math.floor(Math.random() * 300);
          const priceBus = priceEco * 3.2;

          const aircrafts = ['Boeing 787-9', 'Airbus A350-900', 'Airbus A321neo'];
          const aircraftModel = aircrafts[(dateSeed + idx) % aircrafts.length];

          const item = document.createElement('div');
          item.className = 'thy-flight-row';
          item.dataset.index = idx;
          
          item.innerHTML = `
            <div class="thy-flight-main-card">
              <div class="flight-info-col">
                <div class="flight-times-row">
                  <div class="time-block">
                    <span class="time">${fo.dep}</span>
                    <span class="airport-code">${fromCode}</span>
                    <span class="city">${fromCity}</span>
                  </div>
                  <div class="path-block">
                    <span class="path-type">${durationHoursStr}</span>
                    <div class="path-line"></div>
                    <span class="path-type">${directLabel}</span>
                  </div>
                  <div class="time-block">
                    <span class="time">${fo.arr}</span>
                    <span class="airport-code">${toCode}</span>
                    <span class="city">${toCity}</span>
                  </div>
                </div>
                <div class="flight-details-row">
                  <span class="aircraft-model">${aircraftModel}</span>
                  <span class="details-divider">|</span>
                  <button type="button" class="btn-toggle-flight-details" data-index="${idx}">
                    ${isEn ? 'Flight details' : 'Seyahat detayları'}
                  </button>
                </div>
              </div>
              
              <div class="flight-prices-col">
                <div class="fare-price-box economy-box" data-cabin="economy" data-index="${idx}">
                  <div class="fare-box-header">ECONOMY</div>
                  <div class="fare-box-body">
                    <span class="radio-indicator"></span>
                    <div class="price-info">
                      <span class="price-lbl">${isEn ? 'Per Passenger' : 'Yolcu başına'}</span>
                      <span class="price-value">${formatPrice(priceEco)} TRY</span>
                    </div>
                  </div>
                  ${idx === 0 ? `<span class="fare-badge">${isEn ? 'Best Price' : 'En Uygun'}</span>` : ''}
                </div>
                
                <div class="fare-price-box business-box" data-cabin="business" data-index="${idx}">
                  <div class="fare-box-header">BUSINESS</div>
                  <div class="fare-box-body">
                    <span class="radio-indicator"></span>
                    <div class="price-info">
                      <span class="price-lbl">${isEn ? 'Per Passenger' : 'Yolcu başına'}</span>
                      <span class="price-value">${formatPrice(priceBus)} TRY</span>
                    </div>
                  </div>
                  ${idx === 2 ? `<span class="fare-badge warning">${isEn ? 'Only 4 left' : 'Son 4 koltuk'}</span>` : ''}
                </div>
              </div>
            </div>
            
            <div class="fare-details-expansion hidden" id="expansion-${idx}"></div>
          `;
          
          listContainer.appendChild(item);
          // Details click handler
          item.querySelector('.btn-toggle-flight-details')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const gateText = isEn ? `Gate: ${fo.gate}` : `Kapı: ${fo.gate}`;
            const statusText = isEn ? `Status: ${fo.status === 'incident' ? 'Delayed' : 'On Time'}` : `Durum: ${fo.status === 'incident' ? 'Rötarlı' : 'Zamanında'}`;
            const detailsMsg = `${fo.flightNo} | ${aircraftModel} | ${gateText} | ${statusText}`;
            THY.toast(detailsMsg, 'info', 4500);
          });

          // Price box clicks
          const ecoBox = item.querySelector('.economy-box');
          const busBox = item.querySelector('.business-box');
          const expansionEl = item.querySelector(`#expansion-${idx}`);

          const toggleSubclasses = (cabinType) => {
            const isEco = cabinType === 'economy';
            const targetBox = isEco ? ecoBox : busBox;
            const otherBox = isEco ? busBox : ecoBox;

            if (targetBox.classList.contains('active')) {
              targetBox.classList.remove('active');
              expansionEl.classList.add('hidden');
              expansionEl.innerHTML = '';
            } else {
              targetBox.classList.add('active');
              otherBox.classList.remove('active');
              expansionEl.classList.remove('hidden');
              
              if (isEco) {
                const ecoFares = [
                  { name: 'EcoFly', desc: isEn ? 'Cabin bag & basics' : 'Kabin bagajı ve temel seyahat ihtiyaçları', price: priceEco, ticks: [isEn ? '✓ Cabin bag (8kg)' : '✓ Kabin bagajı (8 kg)', isEn ? '✓ Catering' : '✓ Uçuş esnasında ikram', '✗', '✗', '25% Mil'] },
                  { name: 'ExtraFly', desc: isEn ? 'Extra baggage & standard seat' : 'Ekstra bagaj hakkı ve standart koltuk seçimi', price: priceEco + 800, ticks: [isEn ? '✓ Cabin bag + 20kg checked' : '✓ Kabin bagajı + 20 kg Bagaj', isEn ? '✓ Hot Meal' : '✓ Sıcak İkram', isEn ? '✓ Standard Seat' : '✓ Standart Koltuk', '✗', '100% Mil'] },
                  { name: 'FlexFly', desc: isEn ? 'Flexible dates & refund right' : 'Esnek seyahat planları için değişiklik hakkı', price: priceEco + 1600, ticks: [isEn ? '✓ Cabin bag + 20kg checked' : '✓ Kabin bagajı + 20 kg Bagaj', isEn ? '✓ Hot Meal' : '✓ Sıcak İkram', isEn ? '✓ Standard Seat' : '✓ Standart Koltuk', isEn ? '✓ Refund/Change (Fee applies)' : '✓ Cezalı İade/Değişiklik', '150% Mil'], recommended: true },
                  { name: 'PrimeFly', desc: isEn ? 'Max flexibility & premium dining' : 'Maksimum esneklik ve zengin ikram seçenekleri', price: priceEco + 2800, ticks: [isEn ? '✓ Cabin bag + 23kg checked' : '✓ Kabin bagajı + 23 kg Bagaj', isEn ? '✓ Gourmet Meal' : '✓ Gurme İkram', isEn ? '✓ Free Selection' : '✓ Ücretsiz Seçim', isEn ? '✓ Free Refund/Change' : '✓ Ücretsiz İade/Değişiklik', '200% Mil'] }
                ];
                
                expansionEl.innerHTML = `
                  <div class="fare-package-table">
                    <div class="fare-package-left-checklist">
                      <div class="checklist-row-lbl">${isEn ? 'Cabin baggage (8 kg)' : 'Kabin bagajı (8 kg)'}</div>
                      <div class="checklist-row-lbl">${isEn ? 'In-flight catering' : 'Uçuş esnasında ikram'}</div>
                      <div class="checklist-row-lbl">${isEn ? 'Seat selection' : 'Koltuk seçimi'}</div>
                      <div class="checklist-row-lbl">${isEn ? 'Refund / Change' : 'İade / Değişiklik'}</div>
                      <div class="checklist-row-lbl">${isEn ? 'Miles earning' : 'Mil kazanımı'}</div>
                    </div>
                    <div class="fare-package-cols">
                      ${ecoFares.map(fare => `
                        <div class="fare-subclass-card ${fare.recommended ? 'recommend-border' : ''}">
                          <div class="subclass-header">
                            <div>
                              <span class="subclass-name">${fare.name}</span>
                              <span class="subclass-desc">${fare.desc}</span>
                            </div>
                            <span class="price-value">${formatPrice(fare.price)} TRY</span>
                          </div>
                          <div class="subclass-features-list">
                            ${fare.ticks.map(tick => {
                              let tickClass = 'tick-yes';
                              if (tick === '✗') tickClass = 'tick-no';
                              else if (!tick.startsWith('✓')) tickClass = 'tick-info-text';
                              return `<div class="feature-item-tick ${tickClass}">${tick}</div>`;
                            }).join('')}
                          </div>
                          <button type="button" class="btn-subclass-select" 
                            data-subclass="${fare.name}" 
                            data-price="${fare.price}">
                            ${isEn ? 'Select Flight' : 'Uçuşu Seç'}
                          </button>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `;
              } else {
                const busFares = [
                  { name: 'BusinessFly', desc: isEn ? 'Business comfort & lounge' : 'Business konforu ve Lounge erişimi', price: priceBus, ticks: [isEn ? '✓ Cabin bag + 30kg checked' : '✓ Kabin bagajı + 30 kg Bagaj', isEn ? '✓ Business Dining' : '✓ Sıcak Gurme İkramı', isEn ? '✓ Standard Seat' : '✓ Ücretsiz Koltuk Seçimi', isEn ? '✓ Refund/Change (Fee applies)' : '✓ Cezalı İade/Değişiklik', '150% Mil'] },
                  { name: 'BusinessPrime', desc: isEn ? 'Unmatched comfort & full flexibility' : 'Eşsiz konfor ve tam esneklik', price: priceBus + 2500, ticks: [isEn ? '✓ Cabin bag + 40kg checked' : '✓ Kabin bagajı + 40 kg Bagaj', isEn ? '✓ Gourmet Experience' : '✓ Gurme İkram Ayrıcalığı', isEn ? '✓ All Seats Free' : '✓ Tüm Koltuklar Ücretsiz', isEn ? '✓ Free Refund/Change' : '✓ Ücretsiz İade/Değişiklik', '200% Mil'] }
                ];

                expansionEl.innerHTML = `
                  <div class="fare-package-table">
                    <div class="fare-package-left-checklist">
                      <div class="checklist-row-lbl">${isEn ? 'Cabin baggage (8 kg)' : 'Kabin bagajı (8 kg)'}</div>
                      <div class="checklist-row-lbl">${isEn ? 'In-flight catering' : 'Uçuş esnasında ikram'}</div>
                      <div class="checklist-row-lbl">${isEn ? 'Seat selection' : 'Koltuk seçimi'}</div>
                      <div class="checklist-row-lbl">${isEn ? 'Refund / Change' : 'İade / Değişiklik'}</div>
                      <div class="checklist-row-lbl">${isEn ? 'Miles earning' : 'Mil kazanımı'}</div>
                    </div>
                    <div class="fare-package-cols">
                      ${busFares.map(fare => `
                        <div class="fare-subclass-card">
                          <div class="subclass-header">
                            <div>
                              <span class="subclass-name">${fare.name}</span>
                              <span class="subclass-desc">${fare.desc}</span>
                            </div>
                            <span class="price-value">${formatPrice(fare.price)} TRY</span>
                          </div>
                          <div class="subclass-features-list">
                            ${fare.ticks.map(tick => {
                              let tickClass = 'tick-yes';
                              if (tick === '✗') tickClass = 'tick-no';
                              else if (!tick.startsWith('✓')) tickClass = 'tick-info-text';
                              return `<div class="feature-item-tick ${tickClass}">${tick}</div>`;
                            }).join('')}
                          </div>
                          <button type="button" class="btn-subclass-select" 
                            data-subclass="${fare.name}" 
                            data-price="${fare.price}">
                            ${isEn ? 'Select Flight' : 'Uçuşu Seç'}
                          </button>
                        </div>
                      `).join('')}
                      <div class="privilege-card">
                        <div class="privilege-card-title">${isEn ? 'Business Class Privileges' : 'Business Class Ayrıcalıkları'}</div>
                        <div class="privilege-card-desc">${isEn ? 'Make your flight premium with Lounge access, priority check-in and boarding.' : 'Özel dinlenme salonu (Lounge), öncelikli check-in ve bagaj teslimi ile uçuşunuzu premium hale getirin.'}</div>
                        <div class="privilege-items-grid">
                          <div class="privilege-item">
                            <span class="privilege-item-icon">🛋️</span>
                            <span class="privilege-item-lbl">${isEn ? 'Lounge' : 'Lounge İzni'}</span>
                          </div>
                          <div class="privilege-item">
                            <span class="privilege-item-icon">🍽️</span>
                            <span class="privilege-item-lbl">${isEn ? 'Catering' : 'Gurme İkram'}</span>
                          </div>
                          <div class="privilege-item">
                            <span class="privilege-item-icon">🏎️</span>
                            <span class="privilege-item-lbl">${isEn ? 'Fast Track' : 'Öncelikli Geçiş'}</span>
                          </div>
                          <div class="privilege-item">
                            <span class="privilege-item-icon">💺</span>
                            <span class="privilege-item-lbl">${isEn ? 'Lie-flat Seat' : 'Yatak Koltuk'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              }

              // Bind subclass selects
              expansionEl.querySelectorAll('.btn-subclass-select').forEach(subBtn => {
                subBtn.addEventListener('click', (e) => {
                  e.stopPropagation();

                  if (Date.now() - lastTransitionTime < 800) {
                    return;
                  }

                  // Visual feedback: lock select
                  expansionEl.querySelectorAll('.btn-subclass-select').forEach(b => {
                    b.disabled = true;
                    b.style.pointerEvents = 'none';
                    b.style.opacity = '0.4';
                  });

                  subBtn.textContent = isEn ? 'Selected ✓' : 'Seçildi ✓';
                  subBtn.style.opacity = '1';
                  subBtn.style.background = '#22C55E';
                  subBtn.style.borderColor = '#22C55E';
                  subBtn.style.color = 'white';

                  const subclassName = subBtn.dataset.subclass;
                  const finalPrice = subBtn.dataset.price;

                  const selectedDetails = {
                    no: fo.flightNo,
                    dep: fromCode,
                    arr: toCode,
                    gate: fo.gate,
                    delay: fo.delay || 0,
                    status: fo.status || 'scheduled',
                    price: finalPrice,
                    subclass: subclassName,
                    cabin: cabinType
                  };

                  setTimeout(() => {
                    if (isOutbound) {
                      selectedOutbound = selectedDetails;
                      if (currentTripType === 'one-way' || isFlightCodeSearch) {
                        completeBooking();
                      } else {
                        const toastMsg = isEn 
                          ? 'Outbound flight selected! Now select your inbound flight. ✈️'
                          : 'Gidiş uçuşu seçildi! Şimdi dönüş uçuşunuzu seçin. ✈️';
                        THY.toast(toastMsg, 'success');
                        renderFlights('inbound');
                      }
                    } else {
                      selectedInbound = selectedDetails;
                      completeBooking();
                    }
                  }, 600);
                });
              });
            }
          };

          ecoBox.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSubclasses('economy');
          });

          busBox.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSubclasses('business');
          });
        });
        async function completeBooking() {
          if (typeof THY.playSplitFlapSound === 'function') {
            THY.playSplitFlapSound(16);
          }
          // Populate Boarding cockpit header with outbound flight (main flight)
          const boardNo = document.getElementById('flightCode');
          const boardDep = document.getElementById('flightDep');
          const boardArr = document.getElementById('flightArr');
          const boardGate = document.getElementById('flightGate');
          if (boardNo) boardNo.textContent = selectedOutbound.no;
          if (boardDep) boardDep.textContent = selectedOutbound.dep;
          if (boardArr) boardArr.textContent = selectedOutbound.arr;
          if (boardGate) boardGate.textContent = selectedOutbound.gate;

          // Clear status rotation interval to preserve real flight status on the board
          if (statusIntervalId) {
            clearInterval(statusIntervalId);
            statusIntervalId = null;
          }

          const statusText = document.getElementById('statusText');
          const statusBadge = document.getElementById('statusBadge');
          if (statusText && statusBadge) {
            let statusStr = 'KALKIŞ HAZIR';
            let color = '#22C55E';

            if (selectedOutbound.delay > 0) {
              statusStr = `GECİKMELİ (${selectedOutbound.delay} DK)`;
              color = '#FF8C00';
            } else {
              const statusMap = {
                active: { text: 'UÇUŞTA', color: '#3B82F6' },
                landed: { text: 'VARIS YAPILDI', color: '#22C55E' },
                scheduled: { text: 'KALKIŞ HAZIR', color: '#22C55E' },
                cancelled: { text: 'İPTAL EDİLDİ', color: '#E31837' },
                incident: { text: 'RÖTARLI / ACİL', color: '#FF2D4D' },
                diverted: { text: 'ROTADAN SAPTI', color: '#A855F7' }
              };
              const mapped = statusMap[selectedOutbound.status];
              if (mapped) {
                statusStr = mapped.text;
                color = mapped.color;
              }
            }

            statusText.textContent = THY.translateStatus(statusStr);
            statusText.style.color = color;
            statusBadge.style.borderColor = color;
          }
          
          let destAp = AIRPORTS.find(a => a.code === selectedOutbound.arr);
          if (!destAp) {
            const destInput = document.getElementById('flightDestinationInput');
            if (destInput && destInput.dataset.code === selectedOutbound.arr && destInput.dataset.lat) {
              destAp = {
                code: selectedOutbound.arr,
                city: destInput.dataset.city || destInput.value || 'Keşfedilmemiş Şehir',
                name: destInput.dataset.name || destInput.value || 'Keşfedilmemiş Şehir Havalimanı',
                lat: parseFloat(destInput.dataset.lat),
                lng: parseFloat(destInput.dataset.lng)
              };
            } else {
              try {
                const coords = await THY.getAirportCoordinates(selectedOutbound.arr, destInput?.dataset?.city);
                destAp = {
                  code: selectedOutbound.arr,
                  city: coords.city,
                  name: coords.name,
                  lat: coords.lat,
                  lng: coords.lng
                };
              } catch (e) {
                console.error("Geocoding failed for dest airport:", e);
              }
            }
          }
          
          let days = 3; // Default 3 days for one-way flight route
          if (currentTripType === 'round-trip' && depDate && retDate) {
            days = Math.max(1, Math.ceil((new Date(retDate) - new Date(depDate)) / (1000 * 60 * 60 * 24)));
          }
          
          if (currentTripType === 'one-way') {
            const toastMsg = isEn 
              ? 'One-way Flight: Planning 3-Day Route... ✈️'
              : 'Tek Yön Uçuş: 3 Günlük Rota Planlanıyor... ✈️';
            THY.toast(toastMsg, 'success');
          } else {
            const toastMsg = isEn 
              ? 'Your Boarding Passes are being prepared... ✈️'
              : 'Biniş Kartlarınız Hazırlanıyor... ✈️';
            THY.toast(toastMsg, 'success');
            if (stepInbound) {
              stepInbound.classList.remove('active');
              stepInbound.classList.add('completed');
            }
          }
          
          setTimeout(() => {
            document.getElementById('landingScreen').classList.add('hidden');
            document.getElementById('mapScreen').classList.remove('hidden');
            
            // Push trip ID to URL query parameters
            window.history.pushState({}, '', `${window.location.origin}${window.location.pathname}?tripId=${THY.currentTripId}`);
            
            if (destAp && typeof THY.planAutoItinerary === 'function') {
              THY.planAutoItinerary(destAp, days);
            }
          }, 1500);
        }
 
        // 2. Animate list back in
        listContainer.classList.remove('fade-out');
        listContainer.classList.add('fade-in');
        
        // Force reflow
        void listContainer.offsetWidth;
        
        listContainer.classList.remove('fade-in');
        listContainer.style.pointerEvents = 'auto'; // Enable clicks
        lastTransitionTime = Date.now(); // Record rendering time for debounce cooldown when clickable
      }, 250);
    }
  
    renderFlights('outbound');
    document.getElementById('bookingCard').classList.add('hidden');
    document.getElementById('flightResultsCard').classList.remove('hidden');
  });

  document.getElementById('btnBackToSearch')?.addEventListener('click', () => {
    document.getElementById('flightResultsCard').classList.add('hidden');
    document.getElementById('bookingCard').classList.remove('hidden');
  });

  document.getElementById('btnReturnToLanding')?.addEventListener('click', () => {
    // Show landing, hide map
    document.getElementById('landingScreen').classList.remove('hidden');
    document.getElementById('mapScreen').classList.add('hidden');
    
    // Reset booking card visibility
    document.getElementById('bookingCard').classList.remove('hidden');
    document.getElementById('flightResultsCard').classList.add('hidden');

    // Start fresh: generate a new trip ID and clear URL query parameters
    THY.currentTripId = THY.generateTripId();
    THY.userRole = 'Kaptan';
    localStorage.setItem('thy_current_trip_id', THY.currentTripId);
    localStorage.setItem('thy_user_role', 'Kaptan');
    
    const tripBadge = document.getElementById('tripIdBadge');
    if (tripBadge) tripBadge.textContent = THY.currentTripId;
    
    window.history.pushState({}, '', `${window.location.origin}${window.location.pathname}`);
    
    // Clear local state
    if (typeof THY.clearLocalState === 'function') {
      THY.clearLocalState();
    }
  });

  // ---- FLIGHT BOARD CLOCK ----
  function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
    const boardTime = document.getElementById('boardTime');
    const boardDate = document.getElementById('boardDate');
    if (boardTime) boardTime.textContent = timeStr;
    if (boardDate) boardDate.textContent = dateStr.toUpperCase();
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ---- FLIGHT STATUS ROTATION ----
  let statusIntervalId = null;
  const statuses = [
    { text: 'BİNİŞ BAŞLADI', color: '#FF2D4D' },
    { text: 'KAPI KAPANIYOR', color: '#FF8C00' },
    { text: 'KALKIŞ HAZIR', color: '#22C55E' },
    { text: 'UÇUŞTA', color: '#3B82F6' },
    { text: 'İNİŞ YAPILIYOR', color: '#A855F7' },
    { text: 'VARIS YAPILDI', color: '#22C55E' }
  ];
  let statusIndex = 0;

  function rotateStatus() {
    statusIndex = (statusIndex + 1) % statuses.length;
    const statusText = document.getElementById('statusText');
    const statusBadge = document.getElementById('statusBadge');
    if (statusText && statusBadge) {
      statusText.textContent = THY.translateStatus(statuses[statusIndex].text);
      statusText.style.color = statuses[statusIndex].color;
      statusBadge.style.borderColor = statuses[statusIndex].color;
    }
  }
  statusIntervalId = setInterval(rotateStatus, 6000);

  // ---- TAB NAVIGATION ----
  const tabs = document.querySelectorAll('.panel-tab');
  const panes = {
    route: document.getElementById('tabRoute'),
    places: document.getElementById('tabPlaces'),
    email: document.getElementById('tabEmail'),
    trips: document.getElementById('tabTrips'),
    'miles-smiles': document.getElementById('tabMilesSmiles'),
    'baggage-pet': document.getElementById('tabBaggagePet')
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      Object.values(panes).forEach(p => { if (p) p.classList.remove('active'); });
      if (panes[target]) panes[target].classList.add('active');
    });
  });

  // ---- MILES&SMILES PARTNER CLICKS ----
  document.querySelectorAll('.partner-item').forEach(item => {
    item.addEventListener('click', () => {
      const query = item.dataset.query;
      if (query) {
        if (typeof THY.playSplitFlapSound === 'function') {
          THY.playSplitFlapSound(3);
        }
        
        // Force-activate Places tab
        const placesTab = document.querySelector('.panel-tab[data-tab="places"]');
        placesTab?.click();
        
        // Fill search input and execute search
        const searchInput = document.getElementById('placesSearchInput');
        if (searchInput) searchInput.value = query;
        if (typeof THY.textSearchPlaces === 'function') {
          THY.textSearchPlaces(query);
        }
      }
    });
  });

  // ---- PANEL TOGGLE ----
  const sidePanel = document.getElementById('sidePanel');
  const panelToggle = document.getElementById('panelToggle');
  const btnTogglePanel = document.getElementById('btnTogglePanel');
  const appEl = document.getElementById('app');

  function closePanel() {
    sidePanel.classList.add('collapsed');
    panelToggle.classList.remove('hidden');
    appEl?.classList.add('panel-collapsed');
  }

  function openPanel() {
    sidePanel.classList.remove('collapsed');
    panelToggle.classList.add('hidden');
    appEl?.classList.remove('panel-collapsed');
  }

  if (panelToggle) panelToggle.addEventListener('click', openPanel);
  if (btnTogglePanel) btnTogglePanel.addEventListener('click', closePanel);

  // ---- SETTINGS (Hardcoded Configuration Cleanup) ----
  function loadSettings() {
    // Clear legacy local storage keys to ensure clean state
    localStorage.removeItem('thy_firebase_settings');
    localStorage.removeItem('thy_emailjs_settings');
    localStorage.removeItem('thy_api_settings');
    return { emailjs: emailJsConfig, thy: thyApiConfig };
  }
  loadSettings();



  // ---- IMPORT / EXPORT MODALS ----
  const importModal = document.getElementById('importModal');
  const exportModal = document.getElementById('exportModal');

  // Export
  document.getElementById('btnExportTrip')?.addEventListener('click', () => {
    if (!THY.waypoints || THY.waypoints.length === 0) {
      THY.toast('Dışa aktarılacak rota yok!', 'error');
      return;
    }
    const data = {
      tripId: THY.currentTripId,
      exportedAt: new Date().toISOString(),
      maxDays: THY.maxDays || 1,
      waypoints: THY.waypoints.map(wp => ({
        name: wp.name,
        lat: wp.lat,
        lng: wp.lng,
        note: wp.note || '',
        day: wp.day || 1
      }))
    };
    document.getElementById('exportJsonArea').value = JSON.stringify(data, null, 2);
    exportModal.classList.add('active');
  });

  document.getElementById('btnCloseExportModal')?.addEventListener('click', () => exportModal.classList.remove('active'));
  document.getElementById('btnCloseExport')?.addEventListener('click', () => exportModal.classList.remove('active'));

  document.getElementById('btnCopyExport')?.addEventListener('click', () => {
    const area = document.getElementById('exportJsonArea');
    THY.copyToClipboard(area.value).then(() => {
      THY.toast('JSON kopyalandı!', 'success');
    }).catch(err => {
      console.error('Failed to copy JSON:', err);
      window.prompt('Kopyalama başarısız oldu. Lütfen bu alandan seçip kopyalayın:', area.value);
    });
  });

  document.getElementById('btnDownloadExport')?.addEventListener('click', () => {
    const area = document.getElementById('exportJsonArea');
    const blob = new Blob([area.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${THY.currentTripId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    THY.toast('JSON dosyası indirildi!', 'success');
  });

  // Import
  document.getElementById('btnImportTrip')?.addEventListener('click', () => {
    document.getElementById('importJsonArea').value = '';
    importModal.classList.add('active');
  });

  document.getElementById('btnCloseImportModal')?.addEventListener('click', () => importModal.classList.remove('active'));
  document.getElementById('btnCancelImport')?.addEventListener('click', () => importModal.classList.remove('active'));

  document.getElementById('btnConfirmImport')?.addEventListener('click', () => {
    const raw = document.getElementById('importJsonArea').value.trim();
    if (!raw) {
      THY.toast('JSON verisi boş!', 'error');
      return;
    }
    try {
      const data = JSON.parse(raw);
      if (!data.waypoints || !Array.isArray(data.waypoints) || data.waypoints.length === 0) {
        throw new Error('Geçersiz waypoints');
      }
      
      // Set trip ID and update URL & storage
      THY.currentTripId = data.tripId || THY.generateTripId();
      if (tripBadge) tripBadge.textContent = THY.currentTripId;
      localStorage.setItem('thy_current_trip_id', THY.currentTripId);
      window.history.pushState({}, '', `${window.location.origin}${window.location.pathname}?tripId=${THY.currentTripId}`);

      // Clear existing local waypoints
      if (typeof THY.clearLocalState === 'function') THY.clearLocalState();
      
      // Re-initialize Firebase listener to point to the new imported trip ID
      THY.initFirebaseAndSync();

      // Write imported trip data to Firestore
      setTimeout(() => {
        THY.updateTripInFirestore({
          flightCode: data.flightCode || document.getElementById('flightCode')?.textContent || '---',
          dep: data.dep || document.getElementById('flightDep')?.textContent || '---',
          arr: data.arr || document.getElementById('flightArr')?.textContent || '---',
          gate: data.gate || document.getElementById('flightGate')?.textContent || '---',
          statusText: data.statusText || document.getElementById('statusText')?.textContent || 'PLANLANIYOR',
          maxDays: data.maxDays || 1,
          waypoints: data.waypoints.map(wp => ({
            name: wp.name,
            lat: parseFloat(wp.lat),
            lng: parseFloat(wp.lng),
            note: wp.note || '',
            day: wp.day || 1
          }))
        });
      }, 500);

      importModal.classList.remove('active');
      THY.toast(`Trip "${THY.currentTripId}" içe aktarıldı!`, 'success');
    } catch (e) {
      THY.toast('Geçersiz JSON formatı!', 'error');
      console.error('Import error:', e);
    }
  });

  // New Trip
  document.getElementById('btnNewTrip')?.addEventListener('click', () => {
    THY.currentTripId = THY.generateTripId();
    THY.userRole = 'Kaptan';
    localStorage.setItem('thy_user_role', 'Kaptan');
    if (tripBadge) tripBadge.textContent = THY.currentTripId;
    localStorage.setItem('thy_current_trip_id', THY.currentTripId);
    window.history.pushState({}, '', `${window.location.origin}${window.location.pathname}?tripId=${THY.currentTripId}`);

    // Clear local route first
    if (typeof THY.clearLocalState === 'function') THY.clearLocalState();

    // Reset cockpit flight board DOM elements
    const boardNo = document.getElementById('flightCode');
    const boardDep = document.getElementById('flightDep');
    const boardArr = document.getElementById('flightArr');
    const boardGate = document.getElementById('flightGate');
    const statusText = document.getElementById('statusText');
    const statusBadge = document.getElementById('statusBadge');
    
    if (boardNo) boardNo.textContent = '---';
    if (boardDep) boardDep.textContent = '---';
    if (boardArr) boardArr.textContent = '---';
    if (boardGate) boardGate.textContent = '---';
    if (statusText) {
      statusText.textContent = 'PLANLANIYOR';
      statusText.style.color = '#3B82F6';
    }
    if (statusBadge) {
      statusBadge.style.borderColor = '#3B82F6';
    }

    // Re-initialize Firebase live sync
    THY.initFirebaseAndSync();

    // Refresh saved trips list representation
    if (typeof THY.renderSavedTrips === 'function') {
      THY.renderSavedTrips();
    }

    THY.toast('Yeni seyahat oluşturuldu!', 'info');
  });

  // Save Trip (Firestore update & localStorage backup)
  document.getElementById('btnSaveTrip')?.addEventListener('click', () => {
    if (!THY.waypoints || THY.waypoints.length === 0) {
      THY.toast('Kaydedilecek rota yok!', 'error');
      return;
    }

    // Save to Firestore
    THY.updateTripInFirestore({
      flightCode: document.getElementById('flightCode')?.textContent || '---',
      dep: document.getElementById('flightDep')?.textContent || '---',
      arr: document.getElementById('flightArr')?.textContent || '---',
      gate: document.getElementById('flightGate')?.textContent || '---',
      statusText: document.getElementById('statusText')?.textContent || 'PLANLANIYOR',
      maxDays: THY.maxDays || 1,
      waypoints: THY.waypoints || []
    });

    // LocalStorage Backup
    const trips = JSON.parse(localStorage.getItem('thy_saved_trips') || '{}');
    trips[THY.currentTripId] = {
      tripId: THY.currentTripId,
      savedAt: new Date().toISOString(),
      flightCode: document.getElementById('flightCode')?.textContent || '---',
      dep: document.getElementById('flightDep')?.textContent || '---',
      arr: document.getElementById('flightArr')?.textContent || '---',
      maxDays: THY.maxDays || 1,
      waypointsCount: THY.waypoints ? THY.waypoints.length : 0,
      waypoints: THY.waypoints.map(wp => ({
        name: wp.name,
        lat: wp.lat,
        lng: wp.lng,
        note: wp.note || '',
        day: wp.day || 1
      }))
    };
    localStorage.setItem('thy_saved_trips', JSON.stringify(trips));
    
    // Sync list to Firestore
    const pilotId = localStorage.getItem('thy_pilot_id');
    if (pilotId && THY.firebaseDb) {
      THY.firebaseDb.collection("users").doc(pilotId).set({ savedTrips: trips }, { merge: true })
        .catch(err => console.error("Error saving trip list to cloud:", err));
    }
    
    // Refresh saved trips list
    if (typeof THY.renderSavedTrips === 'function') {
      THY.renderSavedTrips();
    }

    THY.toast(`Trip "${THY.currentTripId}" veritabanına ve yerel belleğe kaydedildi!`, 'success');
  });

  // ---- EMAIL SENDING ----
  document.getElementById('btnSendEmail')?.addEventListener('click', async () => {
    const settings = emailJsConfig;

    const toEmail = document.getElementById('emailTo')?.value?.trim();
    const fromName = document.getElementById('emailFrom')?.value?.trim() || 'THY Route Gezgini';
    const note = document.getElementById('emailNote')?.value?.trim() || '';

    if (!toEmail) {
      THY.toast('Lütfen alıcı e-posta adresi girin!', 'error');
      return;
    }

    THY.toast('Uçuş Özeti Hazırlanıyor...', 'info');

    // Generate invite link (already short because it contains the trip ID)
    const inviteLink = THY.generateShareUrl();

    // Build route summary as a Captain's Logbook brochure
    let routeSummary = 'Henüz rota oluşturulmadı.';
    if (THY.waypoints && THY.waypoints.length > 0) {
      const flightCode = document.getElementById('flightCode')?.textContent || '---';
      const depCode = document.getElementById('flightDep')?.textContent || '---';
      const arrCode = document.getElementById('flightArr')?.textContent || '---';
      const dateStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

      // Group waypoints by day
      const groupedWps = {};
      THY.waypoints.forEach(wp => {
        const d = wp.day || 1;
        if (!groupedWps[d]) groupedWps[d] = [];
        groupedWps[d].push(wp);
      });

      let listStr = '';
      Object.keys(groupedWps).sort((a, b) => a - b).forEach(dayNum => {
        listStr += `📅 GÜN ${dayNum}\n`;
        listStr += `===================================\n`;
        groupedWps[dayNum].forEach((wp, idx) => {
          listStr += `[DURAK ${idx + 1}] 📍 ${wp.name}\n`;
          listStr += `   Koordinat: ${wp.lat.toFixed(5)}°N, ${wp.lng.toFixed(5)}°E\n`;
          if (wp.note) {
            listStr += `   📝 Kaptan Pilot Notu: "${wp.note}"\n`;
          }
          listStr += `\n`;
        });
        listStr += `───────────────────────────────────\n\n`;
      });

      routeSummary = `
===================================================
      🛫 TURKISH AIRLINES - KAPTANIN SEYİR DEFTERİ 🛫
===================================================
Defter Kayıt ID : ${THY.currentTripId}
Kayıt Tarihi    : ${dateStr}
Canlı Uçuş Kodu : ${flightCode}
Uçuş Güzergahı  : ${depCode} ➔ ${arrCode}
Kontrol Noktası : ${THY.waypoints.length} Durak (Toplam ${THY.maxDays} Gün)
===================================================

YOLCULUK GÜZERGAH DETAYLARI:
───────────────────────────────────

${listStr}
───────────────────────────────────
DAVET VE BİRLİKTE DÜZENLEME BAĞLANTISI:
${inviteLink}

───────────────────────────────────
"Gökyüzünde güvenle planlandı. İyi uçuşlar dileriz."
===================================================
`;
    }

    const templateParams = {
      to_email: toEmail,
      from_name: fromName,
      trip_id: THY.currentTripId,
      route_summary: routeSummary,
      note: note,
      waypoint_count: THY.waypoints ? THY.waypoints.length : 0,
      date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
      // Injecting all common link naming conventions for robust template mapping
      link: inviteLink,
      invite_link: inviteLink,
      inviteLink: inviteLink,
      url: inviteLink,
      share_url: inviteLink,
      share_link: inviteLink,
      route_link: inviteLink
    };

    THY.toast('Rapor ve Davet gönderiliyor...', 'info');

    THY.sendEmailProxy(templateParams)
      .then(() => {
        THY.toast('Seyahat raporu ve davet bağlantısı başarıyla gönderildi! ✈️', 'success');
      })
      .catch((err) => {
        console.error('EmailJS Error:', err);
        THY.toast('E-posta gönderilemedi. Sunucu hatası oluştu.', 'error');
      });
  });

  // ---- COPY INVITE LINK ----
  document.getElementById('btnCopyInviteLink')?.addEventListener('click', () => {
    if (!THY.waypoints || THY.waypoints.length === 0) {
      THY.toast('Davet linki oluşturmak için önce rotaya nokta ekleyin!', 'error');
      return;
    }
    const shareUrl = THY.generateShareUrl();
    
    THY.copyToClipboard(shareUrl).then(() => {
      THY.toast('Davet bağlantısı kopyalandı! 🔗', 'success');
      if (typeof THY.playSplitFlapSound === 'function') {
        THY.playSplitFlapSound(5);
      }
    }).catch(err => {
      console.error('Failed to copy link:', err);
      window.prompt('Link panoya otomatik kopyalanamadı. Lütfen bu alandan seçip kopyalayın:', shareUrl);
    });
  });

  // ---- EMAIL PREVIEW UPDATE ----
  THY.updateEmailPreview = () => {
    const body = document.getElementById('emailPreviewBody');
    if (!body) return;

    const isEn = THY.currentLanguage === 'en';

    if (!THY.waypoints || THY.waypoints.length === 0) {
      body.innerHTML = isEn 
        ? '<p style="opacity:0.5; text-align: center; padding: 20px 0;">Captain\'s Logbook will be prepared here once the route is created.</p>'
        : '<p style="opacity:0.5; text-align: center; padding: 20px 0;">Rota oluşturulduktan sonra Kaptan Pilotun Seyir Defteri burada hazırlanacak.</p>';
      return;
    }

    const flightCode = document.getElementById('flightCode')?.textContent || '---';
    const depCode = document.getElementById('flightDep')?.textContent || '---';
    const arrCode = document.getElementById('flightArr')?.textContent || '---';
    const dateStr = new Date().toLocaleDateString(isEn ? 'en-US' : 'tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

    // Group waypoints by day
    const groupedWps = {};
    THY.waypoints.forEach(wp => {
      const d = wp.day || 1;
      if (!groupedWps[d]) groupedWps[d] = [];
      groupedWps[d].push(wp);
    });

    let routeHtml = '';
    Object.keys(groupedWps).sort((a, b) => a - b).forEach(dayNum => {
      const dayColor = THY.dayColors[(dayNum - 1) % THY.dayColors.length] || '#E31837';
      const dayLabel = isEn ? `DAY ${dayNum} ROUTE` : `${dayNum}. GÜN ROTASI`;
      routeHtml += `
        <div style="margin-top: 16px; margin-bottom: 8px; font-weight: 800; font-size: 12px; color: ${dayColor}; letter-spacing: 1px; text-transform: uppercase; display: flex; align-items: center; gap: 4px;">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          ${dayLabel}
        </div>
        <div style="border-left: 2px solid ${dayColor}; padding-left: 12px; margin-left: 4px; margin-bottom: 16px;">
      `;
      
      groupedWps[dayNum].forEach((wp, idx) => {
        const wpLabel = isEn ? 'Waypoint' : 'Nokta';
        const noteLabel = isEn ? 'Note' : 'Not';
        routeHtml += `
          <div style="position: relative; padding-left: 20px; margin-bottom: 12px;">
            <!-- Node Dot -->
            <div style="position: absolute; left: -18px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: ${dayColor}; display: flex; align-items: center; justify-content: center;">
            </div>
            
            <!-- Stop Detail -->
            <div style="font-weight: 600; font-size: 13px; color: var(--text-primary);">
              ${wpLabel} ${idx + 1}: ${wp.name}
            </div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-muted);">
              COORD: ${wp.lat.toFixed(5)}°N, ${wp.lng.toFixed(5)}°E
            </div>
            ${wp.note ? `
              <div style="margin-top: 4px; padding: 6px 10px; background: rgba(255, 255, 255, 0.02); border-left: 2px solid var(--thy-gold); font-size: 11px; color: var(--text-secondary); font-style: italic; border-radius: 0 4px 4px 0; display: flex; align-items: center; gap: 4px;">
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                ${noteLabel}: "${wp.note}"
              </div>
            ` : ''}
          </div>
        `;
      });

      routeHtml += `</div>`;
    });

    const participants = THY.participants || [];
    const participantsStr = participants.length > 0 ? participants.join(', ') : (isEn ? 'Captain' : 'Kaptan');

    const labelFlightCode = isEn ? 'FLIGHT CODE' : 'UÇUŞ KODU';
    const labelRoute = isEn ? 'ROUTE' : 'GÜZERGAH';
    const labelCrew = isEn ? 'FLIGHT CREW' : 'UÇUŞ KADROSU';
    const labelDate = isEn ? 'LOG DATE' : 'SEYİR TARİHİ';
    const labelStops = isEn ? 'WAYPOINTS' : 'KONTROL NOKTASI';
    const stopsSuffix = isEn ? `${THY.waypoints.length} Stops` : `${THY.waypoints.length} Durak`;

    let html = `
      <div style="font-family: 'Inter', sans-serif; color: var(--text-primary); background: #0E131F; border: 1px solid rgba(200, 169, 81, 0.2); border-radius: 8px; padding: 16px; box-shadow: var(--shadow-md);">
        
        <!-- Header Banner -->
        <div style="text-align: center; border-bottom: 2px double rgba(200, 169, 81, 0.3); padding-bottom: 12px; margin-bottom: 16px;">
          <div style="font-size: 9px; font-weight: 800; color: var(--thy-gold); letter-spacing: 3px; text-transform: uppercase;">Turkish Airlines | Flight Log</div>
          <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 4px 0; letter-spacing: 1px; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            ${isEn ? "CAPTAIN'S TRAVEL LOGBOOK" : "KAPTAN PİLOTUN SEYİR DEFTERİ"}
          </h4>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-muted);">${THY.currentTripId}</div>
        </div>

        <!-- Metadata Grid -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px;">
          <tr>
            <td style="padding: 4px 0; color: var(--text-secondary); text-transform: uppercase;"><strong>${labelFlightCode}:</strong></td>
            <td style="padding: 4px 0; text-align: right; color: var(--thy-gold-light); font-family: 'JetBrains Mono', monospace;"><strong>${flightCode}</strong></td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: var(--text-secondary); text-transform: uppercase;"><strong>${labelRoute}:</strong></td>
            <td style="padding: 4px 0; text-align: right; color: var(--text-primary);"><strong>${depCode} ➔ ${arrCode}</strong></td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: var(--text-secondary); text-transform: uppercase;"><strong>${labelCrew}:</strong></td>
            <td style="padding: 4px 0; text-align: right; color: var(--thy-gold-light);"><strong>${participantsStr}</strong></td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: var(--text-secondary); text-transform: uppercase;"><strong>${labelDate}:</strong></td>
            <td style="padding: 4px 0; text-align: right; color: var(--text-primary);">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: var(--text-secondary); text-transform: uppercase;"><strong>${labelStops}:</strong></td>
            <td style="padding: 4px 0; text-align: right; color: var(--text-primary);">${stopsSuffix}</td>
          </tr>
        </table>

        <!-- Log Entry Area -->
        <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px;">
          <div style="font-size: 10px; font-weight: 700; color: var(--thy-gold); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">${isEn ? 'Travel Route Report' : 'Seyir Güzergah Raporu'}</div>
          <div style="margin-bottom: 16px;">
            ${routeHtml}
          </div>
        </div>

        <!-- Collaboration Link Area -->
        <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px; margin-top: 16px; word-break: break-all;">
          <div style="font-size: 10px; font-weight: 700; color: var(--thy-gold); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">🔗 ${isEn ? 'Collaboration & Invite Link' : 'Düzenleme ve Davet Bağlantısı'}</div>
          <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4; word-break: break-all;">
            <span style="color: var(--thy-gold-light); font-weight: 600;">${THY.generateShareUrl()}</span>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px dashed rgba(148, 163, 184, 0.15); margin-top: 20px; padding-top: 12px; text-align: center; font-size: 10px; color: var(--text-muted); font-style: italic;">
          "${isEn ? 'Planned safely in the skies. We wish you a pleasant flight.' : 'Gökyüzünde güvenle planlandı. İyi uçuşlar dileriz.'}"
        </div>
      </div>
    `;

    body.innerHTML = html;
  };

  // ---- SPLASH SCREEN ----
  window.addEventListener('load', () => {
    setTimeout(() => {
      const splash = document.getElementById('splashScreen');
      if (splash) splash.classList.add('hidden');
    }, 1800);
  });

  // ---- PWA INSTALL (Disabled) ----

  // ---- LOAD LIVE FLIGHT TO COCKPIT BOARD (via Server Proxy) ----
  THY.loadLiveFlightBoard = async () => {
    try {
      console.log('📡 Fetching live THY flight board feed via server proxy...');
      const res = await fetch('/api/flights?type=board');
      if (!res.ok) throw new Error('Server proxy call failed');
      const data = await res.json();

      if (data && data.data && data.data.length > 0) {
        const liveFlight = data.data.find(f => f.departure?.iata && f.arrival?.iata);
        if (liveFlight) {
          const code = liveFlight.flight?.iata || `TK ${liveFlight.flight?.number || '1982'}`;
          const dep = liveFlight.departure?.iata;
          const arr = liveFlight.arrival?.iata;
          const gate = liveFlight.departure?.gate || 'A' + Math.floor(Math.random() * 12 + 1);
          
          let statusTextStr = 'KALKIŞ HAZIR';
          const statusMap = {
            active: 'UÇUŞTA',
            landed: 'VARIS YAPILDI',
            scheduled: 'BİNİŞ BAŞLADI',
            cancelled: 'İPTAL EDİLDİ',
            delayed: 'GECİKMELİ'
          };
          if (liveFlight.flight_status && statusMap[liveFlight.flight_status]) {
            statusTextStr = statusMap[liveFlight.flight_status];
          }

          const boardNo = document.getElementById('flightCode');
          const boardDep = document.getElementById('flightDep');
          const boardArr = document.getElementById('flightArr');
          const boardGate = document.getElementById('flightGate');
          const statusText = document.getElementById('statusText');

          if (boardNo) boardNo.textContent = code;
          if (boardDep) boardDep.textContent = dep;
          if (boardArr) boardArr.textContent = arr;
          if (boardGate) boardGate.textContent = gate;
          if (statusText) {
            statusText.textContent = THY.translateStatus(statusTextStr);
            const colors = {
              'BİNİŞ BAŞLADI': '#FF2D4D',
              'KAPI KAPANIYOR': '#FF8C00',
              'KALKIŞ HAZIR': '#22C55E',
              'UÇUŞTA': '#3B82F6',
              'İNİŞ YAPILIYOR': '#A855F7',
              'VARIS YAPILDI': '#22C55E',
              'İPTAL EDİLDİ': '#E31837',
              'GECİKMELİ': '#FF8C00'
            };
            const color = colors[statusTextStr] || '#FF2D4D';
            statusText.style.color = color;
            const badge = document.getElementById('statusBadge');
            if (badge) badge.style.borderColor = color;
          }

          console.log(`✈️ Live flight board loaded: ${code} from ${dep} to ${arr}`);
          THY.toast(`Canlı THY uçuşu panoya yüklendi: ${code} (${dep}➔${arr})`, 'success');
          
          if (typeof THY.playSplitFlapSound === 'function') {
            THY.playSplitFlapSound(12);
          }
          return;
        }
      }
      throw new Error('No suitable flight found');
    } catch (e) {
      console.warn('Could not load live board feed, using offline simulator defaults.', e);
    }
  };

  // Run board load on startup
  THY.loadLiveFlightBoard();

  // Initialize Firebase and start real-time Firestore sync
  THY.initFirebaseAndSync();

  // ---- SERVICE WORKER REGISTRATION ----
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=3.6')
      .then(reg => console.log('[SW] Registered:', reg.scope))
      .catch(err => console.warn('[SW] Registration failed:', err));
  }

  // ---- PLACES FILTER CHIPS ----
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const wasActive = chip.classList.contains('active');
      filterChips.forEach(c => c.classList.remove('active'));
      
      if (!wasActive) {
        chip.classList.add('active');
        const placeType = chip.dataset.type;
        if (typeof THY.searchNearbyPlaces === 'function') {
          THY.searchNearbyPlaces(placeType);
        }
      } else {
        if (typeof THY.clearPlaces === 'function') {
          THY.clearPlaces();
        }
        const placesContainer = document.getElementById('placesList');
        if (placesContainer) {
          const isEn = (localStorage.getItem('thy_lang') || 'tr') === 'en';
          placesContainer.innerHTML = `
            <div class="empty-state">
              <div class="empty-state__icon">📌</div>
              <div class="empty-state__title" id="lblPlacesEmptyTitle">${isEn ? 'Discover Places' : 'Yer Keşfet'}</div>
              <div class="empty-state__text" id="lblPlacesEmptyText">${isEn ? 'Discover nearby places by clicking filters or searching.' : 'Filtrelere tıklayarak veya arama yaparak etraftaki mekanları keşfedin.'}</div>
            </div>
          `;
        }
      }
    });
  });

  // Places Search Button
  document.getElementById('btnPlacesSearch')?.addEventListener('click', () => {
    const query = document.getElementById('placesSearchInput')?.value?.trim();
    if (query && typeof THY.textSearchPlaces === 'function') {
      THY.textSearchPlaces(query);
    }
  });

  // Places search on Enter
  document.getElementById('placesSearchInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value.trim();
      if (query && typeof THY.textSearchPlaces === 'function') {
        THY.textSearchPlaces(query);
      }
    }
  });

  // ---- SAVED TRIPS MANAGEMENT ----
  THY.loadTrip = (tripId) => {
    THY.currentTripId = tripId;
    localStorage.setItem('thy_current_trip_id', tripId);
    
    const tripBadge = document.getElementById('tripIdBadge');
    if (tripBadge) tripBadge.textContent = tripId;

    window.history.pushState({}, '', `${window.location.origin}${window.location.pathname}?tripId=${tripId}`);
    
    // Clear local route first
    if (typeof THY.clearLocalState === 'function') THY.clearLocalState();
    
    // Re-initialize Firebase live sync
    THY.initFirebaseAndSync();
    
    // Refresh list view to highlight active
    THY.renderSavedTrips();
  };

  THY.addTripToSavedList = (tripId, details = {}) => {
    const trips = JSON.parse(localStorage.getItem('thy_saved_trips') || '{}');
    trips[tripId] = {
      tripId: tripId,
      savedAt: new Date().toISOString(),
      flightCode: details.flightCode || trips[tripId]?.flightCode || '---',
      dep: details.dep || trips[tripId]?.dep || '---',
      arr: details.arr || trips[tripId]?.arr || '---',
      maxDays: details.maxDays || trips[tripId]?.maxDays || 1,
      waypointsCount: details.waypointsCount !== undefined ? details.waypointsCount : (trips[tripId]?.waypointsCount || 0)
    };
    localStorage.setItem('thy_saved_trips', JSON.stringify(trips));

    // Sync list to Firestore
    const pilotId = localStorage.getItem('thy_pilot_id');
    if (pilotId && THY.firebaseDb) {
      THY.firebaseDb.collection("users").doc(pilotId).set({ savedTrips: trips }, { merge: true })
        .catch(err => console.error("Error saving trip list to cloud:", err));
    }

    THY.renderSavedTrips();
  };

  THY.renderSavedTrips = () => {
    const container = document.getElementById('savedTripsList');
    if (!container) return;

    const trips = JSON.parse(localStorage.getItem('thy_saved_trips') || '{}');
    const tripIds = Object.keys(trips).sort((a, b) => new Date(trips[b].savedAt) - new Date(trips[a].savedAt));

    const isEn = THY.currentLanguage === 'en';

    if (tripIds.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">💼</div>
          <div class="empty-state__title">${THY.t('Kayıtlı Seyahat Yok')}</div>
          <div class="empty-state__text">${THY.t('Henüz kaydedilmiş seyahatiniz bulunmuyor. Sol menüde bir rota çizdikten sonra "Kaydet" butonuna basarak seyahatlerinizi burada listeleyebilirsiniz.')}</div>
        </div>
      `;
      return;
    }

    container.innerHTML = '';

    tripIds.forEach(id => {
      const trip = trips[id];
      const isActive = (id === THY.currentTripId);

      const card = document.createElement('div');
      card.className = `trip-card ${isActive ? 'active' : ''}`;
      
      card.innerHTML = `
        <div class="trip-card-header">
          <div class="trip-card-id">${id}</div>
          ${isActive ? `<span class="trip-card-active-badge">${THY.t('Aktif')}</span>` : ''}
        </div>
        <div class="trip-card-body">
          <div class="trip-card-flight">
            <span class="flight-route">${trip.dep || '---'} ➔ ${trip.arr || '---'}</span>
            <span class="flight-code">${trip.flightCode || '---'}</span>
          </div>
          <div class="trip-card-meta">
            <span style="display: inline-flex; align-items: center; gap: 4px;"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${trip.maxDays || 1} ${isEn ? (trip.maxDays === 1 ? 'Day' : 'Days') : 'Gün'}</span>
            <span style="display: inline-flex; align-items: center; gap: 4px;"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${trip.waypointsCount || 0} ${isEn ? (trip.waypointsCount === 1 ? 'Stop' : 'Stops') : 'Durak'}</span>
          </div>
        </div>
        <div class="trip-card-actions">
          <button class="btn btn-primary btn-sm btn-load" data-id="${id}">${THY.t('Aç')}</button>
          <button class="btn btn-secondary btn-sm btn-delete" data-id="${id}">${THY.t('Sil')}</button>
        </div>
      `;

      card.querySelector('.btn-load').addEventListener('click', (e) => {
        e.stopPropagation();
        THY.loadTrip(id);
      });

      card.querySelector('.btn-delete').addEventListener('click', async (e) => {
        e.stopPropagation();
        const cleanId = id.replace('TRIP-', '');
        const message = `<strong>"${cleanId}"</strong> kodlu seyahat planını silmek istediğinizden emin misiniz?<br><br><span style="color: var(--text-muted); font-size: 11px;">Bu işlem seyahati bu cihazdan ve ortak bulut veritabanından kalıcı olarak silecektir.</span>`;
        const confirmed = await THY.confirm(message, '⚠️ Seyahati Sil');
        if (confirmed) {
          // Delete from Firestore
          if (THY.firebaseDb) {
            THY.firebaseDb.collection("trips").doc(id).delete()
              .then(() => {
                console.log(`🔥 Deleted trip "${id}" from Firestore.`);
              })
              .catch(err => {
                console.error("Firestore delete error:", err);
              });
          }

          const saved = JSON.parse(localStorage.getItem('thy_saved_trips') || '{}');
          delete saved[id];
          localStorage.setItem('thy_saved_trips', JSON.stringify(saved));

          // Sync deletion to cloud
          const pilotId = localStorage.getItem('thy_pilot_id');
          if (pilotId && THY.firebaseDb) {
            THY.firebaseDb.collection("users").doc(pilotId).set({ savedTrips: saved })
              .catch(err => console.error("Error updating deleted trip in cloud:", err));
          }
          
          if (id === THY.currentTripId) {
            THY.currentTripId = THY.generateTripId();
            localStorage.setItem('thy_current_trip_id', THY.currentTripId);
            window.history.pushState({}, '', `${window.location.origin}${window.location.pathname}?tripId=${THY.currentTripId}`);
            if (typeof THY.clearLocalState === 'function') THY.clearLocalState();
            THY.initFirebaseAndSync();
          }

          THY.renderSavedTrips();
          THY.toast('Seyahat başarıyla silindi.', 'success');
        }
      });

      container.appendChild(card);
    });
  };

  // ---- PILOT ID SYNC SYSTEM ----
  let activeUserUnsubscribe = null;

  THY.syncSavedTripsWithFirestore = (uid) => {
    if (!THY.firebaseDb) return;
    
    let pilotId = localStorage.getItem('thy_pilot_id') || uid;
    localStorage.setItem('thy_pilot_id', pilotId);
    
    const pilotIdInput = document.getElementById('pilotIdInput');
    if (pilotIdInput) pilotIdInput.value = pilotId;

    if (activeUserUnsubscribe) {
      activeUserUnsubscribe();
    }

    const userDocRef = THY.firebaseDb.collection("users").doc(pilotId);
    console.log(`📡 Syncing user trips list from Firestore: users/${pilotId}`);
    
    activeUserUnsubscribe = userDocRef.onSnapshot(doc => {
      let localTrips = JSON.parse(localStorage.getItem('thy_saved_trips') || '{}');
      let remoteTrips = {};
      
      if (doc.exists) {
        remoteTrips = doc.data().savedTrips || {};
      }
      
      // Merge local and remote trips
      let mergedTrips = { ...remoteTrips };
      let hasChanges = false;
      
      // Add or update local trips into merged list
      for (const tripId in localTrips) {
        const localTrip = localTrips[tripId];
        const remoteTrip = remoteTrips[tripId];
        
        if (!remoteTrip || new Date(localTrip.savedAt) > new Date(remoteTrip.savedAt)) {
          mergedTrips[tripId] = localTrip;
          hasChanges = true;
        }
      }
      
      // Add remote-only trips to local
      for (const tripId in remoteTrips) {
        if (!localTrips[tripId]) {
          hasChanges = true;
        }
      }
      
      // Save locally
      localStorage.setItem('thy_saved_trips', JSON.stringify(mergedTrips));
      
      // If we merged new local trips to the cloud, upload them
      if (hasChanges || !doc.exists) {
        userDocRef.set({ savedTrips: mergedTrips }, { merge: true })
          .then(() => console.log("📤 Cloud saved trips list synchronized."))
          .catch(err => console.error("❌ Cloud sync failed:", err));
      }
      
      THY.renderSavedTrips();
    }, error => {
      console.error("Firestore user sync error:", error);
    });
  };

  // Pilot Sync UI Event Listeners
  document.getElementById('btnCopyPilotId')?.addEventListener('click', () => {
    const val = document.getElementById('pilotIdInput')?.value;
    if (val) {
      navigator.clipboard.writeText(val).then(() => {
        THY.toast('Cihaz Eşitleme Kodu kopyalandı! 📋', 'success');
      }).catch(() => {
        const input = document.getElementById('pilotIdInput');
        if (input) {
          input.select();
          document.execCommand('copy');
          THY.toast('Cihaz Eşitleme Kodu kopyalandı! 📋', 'success');
        }
      });
    }
  });

  const pilotSyncModal = document.getElementById('pilotSyncModal');
  document.getElementById('btnShowSyncModal')?.addEventListener('click', () => {
    const targetInput = document.getElementById('targetPilotIdInput');
    if (targetInput) targetInput.value = '';
    pilotSyncModal?.classList.add('active');
  });

  document.getElementById('btnCloseSyncModal')?.addEventListener('click', () => pilotSyncModal?.classList.remove('active'));
  document.getElementById('btnCancelSync')?.addEventListener('click', () => pilotSyncModal?.classList.remove('active'));

  document.getElementById('btnConfirmSync')?.addEventListener('click', async () => {
    const targetInput = document.getElementById('targetPilotIdInput');
    const targetPilotId = targetInput?.value?.trim();
    
    if (!targetPilotId) {
      THY.toast('Lütfen geçerli bir Eşitleme Kodu girin.', 'error');
      return;
    }
    
    if (!THY.firebaseDb) {
      THY.toast('Firebase bağlantısı etkin değil.', 'error');
      return;
    }
    
    const confirmBtn = document.getElementById('btnConfirmSync');
    confirmBtn.disabled = true;
    confirmBtn.innerText = 'Eşitleniyor...';
    
    try {
      const doc = await THY.firebaseDb.collection("users").doc(targetPilotId).get();
      if (!doc.exists) {
        THY.toast('Girdiğiniz Eşitleme Kodu bulunamadı. Lütfen kodu kontrol edin.', 'error');
        confirmBtn.disabled = false;
        confirmBtn.innerText = 'Eşitlemeyi Başlat';
        return;
      }
      
      const remoteTrips = doc.data().savedTrips || {};
      let localTrips = JSON.parse(localStorage.getItem('thy_saved_trips') || '{}');
      
      // Merge
      let mergedTrips = { ...remoteTrips };
      for (const tripId in localTrips) {
        const localTrip = localTrips[tripId];
        const remoteTrip = remoteTrips[tripId];
        if (!remoteTrip || new Date(localTrip.savedAt) > new Date(remoteTrip.savedAt)) {
          mergedTrips[tripId] = localTrip;
        }
      }
      
      // Save locally and switch pilot ID
      localStorage.setItem('thy_pilot_id', targetPilotId);
      localStorage.setItem('thy_saved_trips', JSON.stringify(mergedTrips));
      
      // Write merged back to target document
      await THY.firebaseDb.collection("users").doc(targetPilotId).set({ savedTrips: mergedTrips });
      
      // Re-trigger listener on new pilotId
      THY.syncSavedTripsWithFirestore(window.firebase.auth().currentUser.uid);
      
      THY.toast('Cihazlar arası eşitleme başarıyla tamamlandı!', 'success');
      pilotSyncModal?.classList.remove('active');
      if (targetInput) targetInput.value = '';
      
    } catch (err) {
      console.error("Sync error:", err);
      THY.toast('Eşitleme sırasında bir hata oluştu.', 'error');
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.innerText = 'Eşitlemeyi Başlat';
    }
  });

  // Custom Asynchronous Confirmation Modal
  THY.confirm = (message, title = null) => {
    message = THY.t(message);
    if (!title) title = THY.currentLanguage === 'en' ? '⚠️ Warning' : '⚠️ Uyarı';
    else title = THY.t(title);
    return new Promise((resolve) => {
      const modal = document.getElementById('confirmModal');
      const titleEl = modal?.querySelector('.modal-title');
      const textEl = document.getElementById('confirmModalText');
      const btnCancel = document.getElementById('btnConfirmCancel');
      const btnClose = document.getElementById('btnCloseConfirmModal');
      const btnProceed = document.getElementById('btnConfirmProceed');

      if (!modal || !textEl || !btnCancel || !btnProceed) {
        // Fallback to native confirm if DOM is missing
        resolve(window.confirm(message));
        return;
      }

      if (titleEl) titleEl.innerHTML = title;
      textEl.innerHTML = message;
      
      modal.classList.add('active');

      const cleanup = (result) => {
        modal.classList.remove('active');
        btnCancel.removeEventListener('click', onCancel);
        if (btnClose) btnClose.removeEventListener('click', onCancel);
        btnProceed.removeEventListener('click', onProceed);
        resolve(result);
      };

      const onCancel = () => cleanup(false);
      const onProceed = () => cleanup(true);

      btnCancel.addEventListener('click', onCancel);
      if (btnClose) btnClose.addEventListener('click', onCancel);
      btnProceed.addEventListener('click', onProceed);
    });
  };

  // ---- PRICE ALERT SYSTEMS ----
  THY.loadPriceAlerts = () => {
    const listContainer = document.getElementById('activeAlertsList');
    if (!listContainer) return;

    // Load from local storage backup first
    const alerts = JSON.parse(localStorage.getItem('thy_price_alerts') || '[]');

    const isEn = THY.currentLanguage === 'en';
    if (alerts.length === 0) {
      listContainer.innerHTML = `
        <div style="font-size: 11px; color: var(--text-muted); font-style: italic; text-align: center; padding: 12px; border: 1px dashed var(--border-subtle); border-radius: 6px; background: rgba(255, 255, 255, 0.01);">
          ${isEn ? 'No active price alerts found.' : 'Henüz aktif bir fiyat alarmı bulunmuyor.'}
        </div>
      `;
      return;
    }

    listContainer.innerHTML = '';
    alerts.forEach((alert) => {
      const card = document.createElement('div');
      card.className = 'alert-card';
      card.innerHTML = `
        <div class="alert-card-info">
          <div class="alert-card-route">🛫 ${alert.dep} ➔ ${alert.arr}</div>
          <div class="alert-card-email">📬 ${alert.email}</div>
          <div style="font-size: 10px; color: var(--text-muted);">${alert.depDate} ${alert.retDate ? ` - ${alert.retDate}` : ''}</div>
          <div class="alert-card-price">${isEn ? 'Target' : 'Hedef'}: ${Number(alert.targetPrice).toLocaleString(isEn ? 'en-US' : 'tr-TR')} ${isEn ? 'TRY' : 'TL'}</div>
        </div>
        <button class="alert-card-delete" data-id="${alert.id}" title="${isEn ? 'Delete Alert' : 'Alarmı Sil'}">✕</button>
      `;

      card.querySelector('.alert-card-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        THY.deletePriceAlert(alert.id);
      });

      listContainer.appendChild(card);
    });
  };

  THY.createPriceAlert = (email, targetPrice) => {
    const isEn = THY.currentLanguage === 'en';
    if (!email || !targetPrice) {
      THY.toast('Lütfen geçerli bir e-posta ve hedef fiyat girin.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      THY.toast('Geçerli bir e-posta adresi giriniz.', 'error');
      return;
    }

    const search = THY.lastFlightSearch || {
      depCode: document.getElementById('flightDepartureInput')?.dataset?.code || 'IST',
      destCode: document.getElementById('flightDestinationInput')?.dataset?.code || 'FCO',
      depDate: document.getElementById('flightDepartureDate')?.value || new Date().toISOString().split('T')[0],
      retDate: document.getElementById('flightReturnDate')?.value || '',
      cabin: document.getElementById('flightCabinClass')?.value || 'economy'
    };

    const newAlert = {
      id: 'ALT-' + Date.now() + '-' + Math.floor(Math.random()*1000),
      dep: search.depCode,
      arr: search.destCode,
      depDate: search.depDate,
      retDate: search.retDate || '',
      cabin: search.cabin,
      email: email,
      targetPrice: targetPrice,
      createdAt: new Date().toISOString()
    };

    // Save to LocalStorage
    const currentAlerts = JSON.parse(localStorage.getItem('thy_price_alerts') || '[]');
    currentAlerts.push(newAlert);
    localStorage.setItem('thy_price_alerts', JSON.stringify(currentAlerts));

    // Save to Firestore
    if (THY.firebaseDb) {
      THY.firebaseDb.collection("price_alerts").doc(newAlert.id).set(newAlert)
        .then(() => console.log("🔥 Price alert synced to Firestore:", newAlert.id))
        .catch(err => console.error("Firestore Price Alert save failed:", err));
    }

    // Refresh UI
    THY.loadPriceAlerts();

    // Sound effect
    if (typeof THY.playSplitFlapSound === 'function') {
      THY.playSplitFlapSound(8);
    }

    // Send Confirm Email via EmailJS Proxy
    const templateParams = {
      to_email: email,
      from_name: isEn ? 'THY Price Alert Service' : 'THY Fiyat Takip Servisi',
      trip_id: newAlert.id,
      note: isEn 
        ? `We will notify you when ticket prices or mile values drop below ${Number(targetPrice).toLocaleString('en-US')} TRY for your selected ${search.depCode} ➔ ${search.destCode} route.`
        : `Seçtiğiniz ${search.depCode} ➔ ${search.destCode} rotası için bilet fiyatı veya mil değeri ${Number(targetPrice).toLocaleString('tr-TR')} TL limitinin altına indiğinde sizi bilgilendireceğiz.`,
      route_summary: isEn
        ? `🔔 PRICE ALERT CREATED\n-----------------------------------\nRoute: ${search.depCode} ➔ ${search.destCode}\nCabin: ${search.cabin.toUpperCase()}\nTarget Limit: ${Number(targetPrice).toLocaleString('en-US')} TRY\nDeparture Date: ${search.depDate}\nReturn Date: ${search.retDate || 'One Way'}\n-----------------------------------\nThis alert was set to email you when the ticket price drops.`
        : `🔔 FİYAT ALARMI OLUŞTURULDU\n-----------------------------------\nRota: ${search.depCode} ➔ ${search.destCode}\nKabin: ${search.cabin.toUpperCase()}\nLimit: ${Number(targetPrice).toLocaleString('tr-TR')} TL\nGidiş Tarihi: ${search.depDate}\nDönüş Tarihi: ${search.retDate || 'Tek Yön'}\n-----------------------------------\nBu alarm bilet fiyatı düştüğünde size e-posta göndermek üzere kurulmuştur.`,
      inviteLink: `${window.location.origin}${window.location.pathname}?tripId=${THY.currentTripId}`
    };
    
    THY.sendEmailProxy(templateParams)
      .then(() => console.log("📧 EmailJS proxy confirm alert mail sent."))
      .catch(err => console.error("EmailJS proxy confirm alert mail failed:", err));

    THY.toast(`Alarm kuruldu! Fiyat ${Number(targetPrice).toLocaleString('tr-TR')} TL altına indiğinde haber vereceğiz. 🔔`, 'success');
  };

  THY.deletePriceAlert = (id) => {
    let currentAlerts = JSON.parse(localStorage.getItem('thy_price_alerts') || '[]');
    currentAlerts = currentAlerts.filter(a => a.id !== id);
    localStorage.setItem('thy_price_alerts', JSON.stringify(currentAlerts));

    // Delete from Firestore
    if (THY.firebaseDb) {
      THY.firebaseDb.collection("price_alerts").doc(id).delete()
        .then(() => console.log("🔥 Price alert deleted from Firestore:", id))
        .catch(err => console.error("Firestore Price Alert delete failed:", err));
    }

    // Refresh UI
    THY.loadPriceAlerts();

    if (typeof THY.playSplitFlapSound === 'function') {
      THY.playSplitFlapSound(3);
    }
    THY.toast('Fiyat alarmı başarıyla kaldırıldı.', 'info');
  };

  // ---- KVKK & PRIVACY POLICY MODAL EVENT HANDLERS ----
  const privacyModal = document.getElementById('privacyModal');
  const btnOpenPrivacy = document.getElementById('btnOpenPrivacyModal');
  const btnClosePrivacy = document.getElementById('btnClosePrivacyModal');
  const btnAcceptPrivacy = document.getElementById('btnAcceptPrivacy');
  const btnPrivacyTr = document.getElementById('btnPrivacyTr');
  const btnPrivacyEn = document.getElementById('btnPrivacyEn');
  const privacyContentTr = document.getElementById('privacyContentTr');
  const privacyContentEn = document.getElementById('privacyContentEn');

  function openPrivacy() {
    if (!privacyModal) return;
    privacyModal.classList.add('active');
    
    // Auto-select tab based on current language
    const isEn = THY.currentLanguage === 'en';
    if (isEn) {
      selectPrivacyTab('en');
    } else {
      selectPrivacyTab('tr');
    }
  }

  function closePrivacy() {
    if (privacyModal) privacyModal.classList.remove('active');
  }

  function selectPrivacyTab(lang) {
    if (lang === 'tr') {
      btnPrivacyTr?.classList.add('active');
      btnPrivacyEn?.classList.remove('active');
      privacyContentTr?.classList.remove('hidden');
      privacyContentEn?.classList.add('hidden');
    } else {
      btnPrivacyEn?.classList.add('active');
      btnPrivacyTr?.classList.remove('active');
      privacyContentEn?.classList.remove('hidden');
      privacyContentTr?.classList.add('hidden');
    }
  }

  // Bind Open links via Event Delegation (handles dynamically translated/overwritten elements)
  document.addEventListener('click', (e) => {
    const isTrigger = e.target && (e.target.classList.contains('privacy-modal-trigger') || e.target.id === 'btnOpenPrivacyModal' || e.target.closest('#btnOpenPrivacyModal'));
    if (isTrigger) {
      e.preventDefault();
      openPrivacy();
    }
  });

  // Bind Close links
  btnClosePrivacy?.addEventListener('click', closePrivacy);
  btnAcceptPrivacy?.addEventListener('click', closePrivacy);

  // Close when clicking outside modal content
  privacyModal?.addEventListener('click', (e) => {
    if (e.target === privacyModal) {
      closePrivacy();
    }
  });

  // Tab switching
  btnPrivacyTr?.addEventListener('click', () => selectPrivacyTab('tr'));
  btnPrivacyEn?.addEventListener('click', () => selectPrivacyTab('en'));

  // ---- NETWORK CONNECTION MONITORING ----
  window.addEventListener('online', () => {
    const isEn = THY.currentLanguage === 'en';
    THY.toast(
      isEn ? 'Internet connection restored. Switched to online mode.' : 'İnternet bağlantısı sağlandı. Çevrimdışı veriler eşitleniyor...', 
      'success'
    );
  });
  
  window.addEventListener('offline', () => {
    const isEn = THY.currentLanguage === 'en';
    THY.toast(
      isEn ? 'Internet connection lost. Switched to offline mode.' : 'İnternet bağlantısı kesildi. Çevrimdışı moda geçildi.', 
      'warning'
    );
  });

  console.log('✈️ THY Route App Core initialized');
})();
