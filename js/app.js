// ============================================
// THY Route - App Core (app.js)
// Toast, Tabs, Clock, PWA, Settings, Modals
// ============================================

(() => {
  'use strict';

  // ---- TOAST SYSTEM ----
  window.THY = window.THY || {};

  THY.toast = (message, type = 'info', duration = 3500) => {
    const container = document.getElementById('toastContainer');
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

  };

  // ---- AIRPORT DATABASE & GLOBAL DATA ----
  const AIRPORTS = [
    { code: "IST", city: "İstanbul", name: "İstanbul Havalimanı", country: "Türkiye", lat: 41.275, lng: 28.751 },
    { code: "SAW", city: "İstanbul", name: "Sabiha Gökçen Havalimanı", country: "Türkiye", lat: 40.898, lng: 29.309 },
    { code: "ESB", city: "Ankara", name: "Esenboğa Havalimanı", country: "Türkiye", lat: 40.128, lng: 32.995 },
    { code: "ADB", city: "İzmir", name: "Adnan Menderes Havalimanı", country: "Türkiye", lat: 38.292, lng: 27.156 },
    { code: "AYT", city: "Antalya", name: "Antalya Havalimanı", country: "Türkiye", lat: 36.900, lng: 30.792 },
    { code: "FCO", city: "Roma", name: "Fiumicino Leonardo da Vinci", country: "İtalya", lat: 41.800, lng: 12.238 },
    { code: "CDG", city: "Paris", name: "Charles de Gaulle Havalimanı", country: "Fransa", lat: 49.009, lng: 2.547 },
    { code: "LHR", city: "Londra", name: "Heathrow Havalimanı", country: "İngiltere", lat: 51.470, lng: -0.454 },
    { code: "JFK", city: "New York", name: "John F. Kennedy Havalimanı", country: "ABD", lat: 40.641, lng: -73.778 },
    { code: "NRT", city: "Tokyo", name: "Narita Uluslararası Havalimanı", country: "Japonya", lat: 35.772, lng: 140.392 },
    { code: "HND", city: "Tokyo", name: "Haneda Havalimanı", country: "Japonya", lat: 35.549, lng: 139.779 },
    { code: "DXB", city: "Dubai", name: "Dubai Uluslararası Havalimanı", country: "BAE", lat: 25.253, lng: 55.364 },
    { code: "AMS", city: "Amsterdam", name: "Schiphol Havalimanı", country: "Hollanda", lat: 52.313, lng: 4.764 },
    { code: "MAD", city: "Madrid", name: "Barajas Havalimanı", country: "İspanya", lat: 40.490, lng: -3.567 },
    { code: "MUC", city: "Münih", name: "Münih Havalimanı", country: "Almanya", lat: 48.353, lng: 11.786 }
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

  // ---- AUTOCOMPLETE SUGGESTIONS ENGINE ----
  function setupAutocomplete(inputId, suggestionsId) {
    const input = document.getElementById(inputId);
    const suggestions = document.getElementById(suggestionsId);
    if (!input || !suggestions) return;

    input.addEventListener('input', (e) => {
      const val = e.target.value.trim().toLowerCase();
      suggestions.innerHTML = '';
      if (!val) {
        suggestions.classList.remove('active');
        return;
      }

      const filtered = AIRPORTS.filter(ap => 
        ap.city.toLowerCase().includes(val) || 
        ap.code.toLowerCase().includes(val) || 
        ap.name.toLowerCase().includes(val) ||
        ap.country.toLowerCase().includes(val)
      );

      if (filtered.length === 0) {
        suggestions.classList.remove('active');
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

  // ---- INITIALIZE BOOKING DATES ----
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const returnDate = new Date(tomorrow);
  returnDate.setDate(returnDate.getDate() + 4);

  const depDateInput = document.getElementById('flightDepartureDate');
  const retDateInput = document.getElementById('flightReturnDate');
  if (depDateInput) depDateInput.value = tomorrow.toISOString().split('T')[0];
  if (retDateInput) retDateInput.value = returnDate.toISOString().split('T')[0];

  // ---- FLIGHT SEARCH & SELECTION ----
  document.getElementById('btnSearchFlights')?.addEventListener('click', () => {
    const depInput = document.getElementById('flightDepartureInput');
    const destInput = document.getElementById('flightDestinationInput');
    
    if (!depInput?.value || !destInput?.value) {
      THY.toast('Lütfen kalkış ve varış noktalarını seçin.', 'error');
      return;
    }
    
    const depCode = depInput.dataset.code;
    const destCode = destInput.dataset.code;
    const depDate = document.getElementById('flightDepartureDate')?.value;
    const retDate = document.getElementById('flightReturnDate')?.value;
    const cabin = document.getElementById('flightCabinClass')?.value;
    
    if (depCode === destCode) {
      THY.toast('Kalkış ve varış noktaları aynı olamaz.', 'error');
      return;
    }

    if (new Date(retDate) < new Date(depDate)) {
      THY.toast('Dönüş tarihi gidiş tarihinden önce olamaz.', 'error');
      return;
    }
    
    const listContainer = document.getElementById('flightListContainer');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    
    document.getElementById('resultsRouteLabel').textContent = `${depCode} - ${destCode}`;
    
    const flightOptions = [
      { dep: "08:25", arr: "11:45", flightNo: "TK 1862", gate: "A4" },
      { dep: "13:10", arr: "16:30", flightNo: "TK 1864", gate: "B12" },
      { dep: "18:55", arr: "22:15", flightNo: "TK 1866", gate: "C7" }
    ];
    
    flightOptions.forEach((fo, idx) => {
      const baseVal = cabin === 'business' ? 14900 : 3400;
      const price = baseVal + idx * 800 + Math.floor(Math.random() * 300);
      
      const item = document.createElement('div');
      item.className = 'flight-item';
      item.innerHTML = `
        <div class="flight-carrier">
          <div class="flight-logo-small">
            <svg viewBox="0 0 100 100">
              <path d="M50 5 C50 5, 85 25, 85 55 C85 75, 70 95, 50 95 C30 95, 15 75, 15 55 C15 25, 50 5, 50 5Z" fill="white"/>
              <path d="M50 20 L55 45 L78 45 L59 58 L66 82 L50 67 L34 82 L41 58 L22 45 L45 45 Z" fill="#E31837"/>
            </svg>
          </div>
          <span class="flight-no">${fo.flightNo}</span>
        </div>
        <div class="flight-schedule">
          <div class="schedule-block">
            <span class="schedule-time">${fo.dep}</span>
            <span class="schedule-code">${depCode}</span>
          </div>
          <div class="flight-duration-path">
            <span class="duration-text">3sa 20dk</span>
            <div class="duration-line">
              <span class="duration-plane">✈️</span>
            </div>
            <span class="duration-text">Direkt</span>
          </div>
          <div class="schedule-block">
            <span class="schedule-time">${fo.arr}</span>
            <span class="schedule-code">${destCode}</span>
          </div>
        </div>
        <div class="flight-price-action">
          <div class="price-tag">
            <span class="price-amount">${price.toLocaleString('tr-TR')}</span>
            <span class="price-currency">TRY</span>
          </div>
          <button class="btn btn-primary btn-select-flight" 
            data-no="${fo.flightNo}" 
            data-dep="${depCode}" 
            data-arr="${destCode}"
            data-gate="${fo.gate}">Seç</button>
        </div>
      `;
      listContainer.appendChild(item);
    });

    listContainer.querySelectorAll('.btn-select-flight').forEach(btn => {
      btn.addEventListener('click', () => {
        const no = btn.dataset.no;
        const dep = btn.dataset.dep;
        const arr = btn.dataset.arr;
        const gate = btn.dataset.gate;
        
        // Update Boarding cockpit header
        const boardNo = document.getElementById('flightCode');
        const boardDep = document.getElementById('flightDep');
        const boardArr = document.getElementById('flightArr');
        const boardGate = document.getElementById('flightGate');
        if (boardNo) boardNo.textContent = no;
        if (boardDep) boardDep.textContent = dep;
        if (boardArr) boardArr.textContent = arr;
        if (boardGate) boardGate.textContent = gate;
        
        const destAp = AIRPORTS.find(a => a.code === arr);
        const days = Math.max(1, Math.ceil((new Date(retDate) - new Date(depDate)) / (1000 * 60 * 60 * 24)));
        
        THY.toast('Biniş Kartınız Hazırlanıyor... ✈️', 'success');
        
        setTimeout(() => {
          document.getElementById('landingScreen').classList.add('hidden');
          document.getElementById('mapScreen').classList.remove('hidden');
          
          if (destAp && typeof THY.planAutoItinerary === 'function') {
            THY.planAutoItinerary(destAp, days);
          }
        }, 1500);
      });
    });

    document.getElementById('bookingCard').classList.add('hidden');
    document.getElementById('flightResultsCard').classList.remove('hidden');
  });

  document.getElementById('btnBackToSearch')?.addEventListener('click', () => {
    document.getElementById('flightResultsCard').classList.add('hidden');
    document.getElementById('bookingCard').classList.remove('hidden');
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
      statusText.textContent = statuses[statusIndex].text;
      statusText.style.color = statuses[statusIndex].color;
      statusBadge.style.borderColor = statuses[statusIndex].color;
    }
  }
  setInterval(rotateStatus, 6000);

  // ---- TAB NAVIGATION ----
  const tabs = document.querySelectorAll('.panel-tab');
  const panes = {
    route: document.getElementById('tabRoute'),
    places: document.getElementById('tabPlaces'),
    email: document.getElementById('tabEmail'),
    settings: document.getElementById('tabSettingsPane')
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

  // ---- SETTINGS (EmailJS) ----
  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('thy_emailjs_settings') || '{}');
    const sid = document.getElementById('settingServiceId');
    const tid = document.getElementById('settingTemplateId');
    const pk = document.getElementById('settingPublicKey');
    if (sid) sid.value = settings.serviceId || '';
    if (tid) tid.value = settings.templateId || '';
    if (pk) pk.value = settings.publicKey || '';
    return settings;
  }

  function saveSettings() {
    const settings = {
      serviceId: document.getElementById('settingServiceId')?.value?.trim() || '',
      templateId: document.getElementById('settingTemplateId')?.value?.trim() || '',
      publicKey: document.getElementById('settingPublicKey')?.value?.trim() || ''
    };
    localStorage.setItem('thy_emailjs_settings', JSON.stringify(settings));
    THY.toast('Ayarlar kaydedildi!', 'success');
    return settings;
  }

  document.getElementById('btnSaveSettings')?.addEventListener('click', saveSettings);
  loadSettings();

  // ---- TRIP ID GENERATOR ----
  THY.generateTripId = () => {
    const now = new Date();
    const id = `TRIP-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*9999)).padStart(4,'0')}`;
    return id;
  };

  THY.currentTripId = THY.generateTripId();
  const tripBadge = document.getElementById('tripIdBadge');
  if (tripBadge) tripBadge.textContent = THY.currentTripId;

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
      waypoints: THY.waypoints.map(wp => ({
        name: wp.name,
        lat: wp.lat,
        lng: wp.lng
      }))
    };
    document.getElementById('exportJsonArea').value = JSON.stringify(data, null, 2);
    exportModal.classList.add('active');
  });

  document.getElementById('btnCloseExportModal')?.addEventListener('click', () => exportModal.classList.remove('active'));
  document.getElementById('btnCloseExport')?.addEventListener('click', () => exportModal.classList.remove('active'));

  document.getElementById('btnCopyExport')?.addEventListener('click', () => {
    const area = document.getElementById('exportJsonArea');
    navigator.clipboard.writeText(area.value).then(() => {
      THY.toast('JSON kopyalandı!', 'success');
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
      // Set trip ID
      THY.currentTripId = data.tripId || THY.generateTripId();
      if (tripBadge) tripBadge.textContent = THY.currentTripId;

      // Clear existing and import
      if (typeof THY.clearRoute === 'function') THY.clearRoute();
      data.waypoints.forEach(wp => {
        if (typeof THY.addWaypoint === 'function') {
          THY.addWaypoint(wp.lat, wp.lng, wp.name);
        }
      });

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
    if (tripBadge) tripBadge.textContent = THY.currentTripId;
    if (typeof THY.clearRoute === 'function') THY.clearRoute();
    THY.toast('Yeni seyahat oluşturuldu!', 'info');
  });

  // Save Trip (localStorage)
  document.getElementById('btnSaveTrip')?.addEventListener('click', () => {
    if (!THY.waypoints || THY.waypoints.length === 0) {
      THY.toast('Kaydedilecek rota yok!', 'error');
      return;
    }
    const trips = JSON.parse(localStorage.getItem('thy_saved_trips') || '{}');
    trips[THY.currentTripId] = {
      tripId: THY.currentTripId,
      savedAt: new Date().toISOString(),
      waypoints: THY.waypoints.map(wp => ({
        name: wp.name,
        lat: wp.lat,
        lng: wp.lng
      }))
    };
    localStorage.setItem('thy_saved_trips', JSON.stringify(trips));
    THY.toast(`Trip "${THY.currentTripId}" kaydedildi!`, 'success');
  });

  // ---- EMAIL SENDING ----
  document.getElementById('btnSendEmail')?.addEventListener('click', () => {
    const settings = JSON.parse(localStorage.getItem('thy_emailjs_settings') || '{}');
    if (!settings.serviceId || !settings.templateId || !settings.publicKey) {
      THY.toast('Önce Ayarlar sekmesinden EmailJS bilgilerini girin!', 'error');
      return;
    }

    const toEmail = document.getElementById('emailTo')?.value?.trim();
    const fromName = document.getElementById('emailFrom')?.value?.trim() || 'THY Route Gezgini';
    const note = document.getElementById('emailNote')?.value?.trim() || '';

    if (!toEmail) {
      THY.toast('Lütfen alıcı e-posta adresi girin!', 'error');
      return;
    }

    // Build route summary
    let routeSummary = 'Henüz rota oluşturulmadı.';
    if (THY.waypoints && THY.waypoints.length > 0) {
      routeSummary = THY.waypoints.map((wp, i) => `${i + 1}. ${wp.name} (${wp.lat.toFixed(4)}, ${wp.lng.toFixed(4)})`).join('\n');
    }

    const templateParams = {
      to_email: toEmail,
      from_name: fromName,
      trip_id: THY.currentTripId,
      route_summary: routeSummary,
      note: note,
      waypoint_count: THY.waypoints ? THY.waypoints.length : 0,
      date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })
    };

    THY.toast('Rapor gönderiliyor...', 'info');

    emailjs.send(settings.serviceId, settings.templateId, templateParams, settings.publicKey)
      .then(() => {
        THY.toast('Seyahat raporu başarıyla gönderildi! ✈️', 'success');
      })
      .catch((err) => {
        console.error('EmailJS Error:', err);
        THY.toast('E-posta gönderilemedi. Ayarları kontrol edin.', 'error');
      });
  });

  // ---- EMAIL PREVIEW UPDATE ----
  THY.updateEmailPreview = () => {
    const body = document.getElementById('emailPreviewBody');
    if (!body) return;

    if (!THY.waypoints || THY.waypoints.length === 0) {
      body.innerHTML = '<p style="opacity:0.5;">Rota oluşturulduktan sonra rapor önizlemesi burada görünecek.</p>';
      return;
    }

    let html = `
      <p><strong>Trip ID:</strong> ${THY.currentTripId}</p>
      <p><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
      <p><strong>Toplam Durak:</strong> ${THY.waypoints.length}</p>
      <hr style="border-color: rgba(148,163,184,0.15); margin: 8px 0;">
      <p><strong>Güzergah:</strong></p>
    `;
    THY.waypoints.forEach((wp, i) => {
      html += `<p>${i + 1}. 📍 ${wp.name}</p>`;
    });

    body.innerHTML = html;
  };

  // ---- SPLASH SCREEN ----
  window.addEventListener('load', () => {
    setTimeout(() => {
      const splash = document.getElementById('splashScreen');
      if (splash) splash.classList.add('hidden');
    }, 1800);
  });

  // ---- PWA INSTALL ----
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('pwaInstallBanner');
    if (banner) banner.classList.add('visible');
  });

  document.getElementById('btnInstallPwa')?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      THY.toast('THY Route yüklendi! ✈️', 'success');
    }
    deferredPrompt = null;
    document.getElementById('pwaInstallBanner')?.classList.remove('visible');
  });

  document.getElementById('btnDismissPwa')?.addEventListener('click', () => {
    document.getElementById('pwaInstallBanner')?.classList.remove('visible');
  });

  // ---- SERVICE WORKER REGISTRATION ----
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[SW] Registered:', reg.scope))
      .catch(err => console.warn('[SW] Registration failed:', err));
  }

  // ---- PLACES FILTER CHIPS ----
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const placeType = chip.dataset.type;
      if (typeof THY.searchNearbyPlaces === 'function') {
        THY.searchNearbyPlaces(placeType);
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

  console.log('✈️ THY Route App Core initialized');
})();
