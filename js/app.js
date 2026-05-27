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

  // ---- SHAREABLE ROUTE SERIALIZATION & DECODING (Base64url) ----
  THY.sharedRouteData = null;
  
  THY.generateShareUrl = () => {
    const flightCode = document.getElementById('flightCode')?.textContent || 'TK 1982';
    const dep = document.getElementById('flightDep')?.textContent || 'IST';
    const arr = document.getElementById('flightArr')?.textContent || 'NRT';
    const gate = document.getElementById('flightGate')?.textContent || 'A7';
    const tripId = THY.currentTripId;
    
    const statusTextEl = document.getElementById('statusText');
    const statusText = statusTextEl ? statusTextEl.textContent : 'KALKIŞ HAZIR';
    
    // Compact coordinates to 5 decimal places (~1.1m precision) and strip keys to shorten URL length
    const waypoints = THY.waypoints.map(wp => [
      parseFloat(wp.lat.toFixed(5)),
      parseFloat(wp.lng.toFixed(5)),
      wp.name,
      wp.note || ''
    ]);

    // Compact format: [version_tag, tripId, flightCode, dep, arr, gate, waypoints, statusText]
    const compactData = ['v3', tripId, flightCode, dep, arr, gate, waypoints, statusText];

    try {
      const jsonStr = JSON.stringify(compactData);
      // UTF-8 safe base64 encoding
      const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
      // URL-safe base64 characters
      const safeBase64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      
      return `${window.location.origin}${window.location.pathname}?importRoute=${safeBase64}`;
    } catch (err) {
      console.error('Failed to generate sharing URL:', err);
      return window.location.href;
    }
  };

  // ---- DYNAMIC URL SHORTENER (is.gd CORS API) ----
  THY.getShortenedUrl = async (longUrl) => {
    try {
      const res = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      if (data && data.shorturl) {
        return data.shorturl;
      }
      throw new Error(data.errormessage || 'Response error');
    } catch (err) {
      console.warn('[Shortener] API connection failed, using local fallback:', err);
      return longUrl;
    }
  };

  const parseSharedRoute = () => {
    const params = new URLSearchParams(window.location.search);
    const importRoute = params.get('importRoute');
    if (!importRoute) return;

    try {
      let base64 = importRoute.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      const jsonStr = decodeURIComponent(escape(atob(base64)));
      const decodedData = JSON.parse(jsonStr);

      let data = {};

      if (Array.isArray(decodedData)) {
        // Hydrate from compact array format
        const [version, tripId, flightCode, dep, arr, gate, wps, statusTextVal] = decodedData;
        if (version === 'v2' || version === 'v3') {
          data = {
            tripId,
            flightCode,
            dep,
            arr,
            gate,
            statusText: statusTextVal || 'KALKIŞ HAZIR',
            waypoints: wps.map(w => ({
              lat: w[0],
              lng: w[1],
              name: w[2],
              note: w[3] || ''
            }))
          };
        }
      } else {
        // Hydrate from legacy verbose object format (v1 backward compatibility)
        data = decodedData;
      }

      if (data && data.waypoints && Array.isArray(data.waypoints)) {
        THY.sharedRouteData = data;
        THY.currentTripId = data.tripId || THY.generateTripId();
        
        document.addEventListener('DOMContentLoaded', () => {
          const boardNo = document.getElementById('flightCode');
          const boardDep = document.getElementById('flightDep');
          const boardArr = document.getElementById('flightArr');
          const boardGate = document.getElementById('flightGate');
          const tripBadge = document.getElementById('tripIdBadge');

          if (boardNo) boardNo.textContent = data.flightCode || 'TK 1982';
          if (boardDep) boardDep.textContent = data.dep || 'IST';
          if (boardArr) boardArr.textContent = data.arr || 'NRT';
          if (boardGate) boardGate.textContent = data.gate || 'A7';
          if (tripBadge) tripBadge.textContent = THY.currentTripId;

          // Clear status rotation interval to preserve shared flight status
          if (statusIntervalId) {
            clearInterval(statusIntervalId);
            statusIntervalId = null;
          }

          const statusText = document.getElementById('statusText');
          const statusBadge = document.getElementById('statusBadge');
          if (statusText && statusBadge && data.statusText) {
            statusText.textContent = data.statusText;
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
            statusBadge.style.borderColor = color;
          }

          // Skip landing page and go straight to map
          document.getElementById('landingScreen')?.classList.add('hidden');
          document.getElementById('mapScreen')?.classList.remove('hidden');
        });
      }
    } catch (err) {
      console.error('Failed to decode shared route details:', err);
    }
  };
  parseSharedRoute();

  // ---- AIRPORT DATABASE & GLOBAL DATA ----
  const AIRPORTS = [
    // Türkiye - Domestic
    { code: "IST", city: "İstanbul", name: "İstanbul Havalimanı", country: "Türkiye", lat: 41.275, lng: 28.751 },
    { code: "SAW", city: "İstanbul", name: "Sabiha Gökçen Havalimanı", country: "Türkiye", lat: 40.898, lng: 29.309 },
    { code: "ESB", city: "Ankara", name: "Esenboğa Havalimanı", country: "Türkiye", lat: 40.128, lng: 32.995 },
    { code: "ADB", city: "İzmir", name: "Adnan Menderes Havalimanı", country: "Türkiye", lat: 38.292, lng: 27.156 },
    { code: "AYT", city: "Antalya", name: "Antalya Havalimanı", country: "Türkiye", lat: 36.900, lng: 30.792 },
    { code: "ADA", city: "Adana", name: "Adana Şakirpaşa Havalimanı", country: "Türkiye", lat: 36.982, lng: 35.280 },
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
    { code: "AMS", city: "Amsterdam", name: "Schiphol Havalimanı", country: "Hollanda", lat: 52.313, lng: 4.764 },
    { code: "MAD", city: "Madrid", name: "Barajas Havalimanı", country: "İspanya", lat: 40.490, lng: -3.567 },
    { code: "BCN", city: "Barselona", name: "Barselona Havalimanı", country: "İspanya", lat: 41.297, lng: 2.078 },
    { code: "LIS", city: "Lizbon", name: "Humberto Delgado Havalimanı", country: "Portekiz", lat: 38.774, lng: -9.135 },
    { code: "ATH", city: "Atina", name: "Elefterios Venizelos", country: "Yunanistan", lat: 37.936, lng: 23.944 },
    { code: "MUC", city: "Münih", name: "Münih Havalimanı", country: "Almanya", lat: 48.353, lng: 11.786 },
    { code: "FRA", city: "Frankfurt", name: "Frankfurt Havalimanı", country: "Almanya", lat: 50.033, lng: 8.570 },
    { code: "BER", city: "Berlin", name: "Brandenburg Havalimanı", country: "Almanya", lat: 52.362, lng: 13.501 },
    { code: "DUS", city: "Düsseldorf", name: "Düsseldorf Havalimanı", country: "Almanya", lat: 51.289, lng: 6.766 },
    { code: "VIE", city: "Viyana", name: "Viyana Uluslararası Havalimanı", country: "Avusturya", lat: 48.110, lng: 16.569 },
    { code: "ZRH", city: "Zürih", name: "Zürih Havalimanı", country: "İsviçre", lat: 47.458, lng: 8.548 },
    { code: "GVA", city: "Cenevre", name: "Cenevre Havalimanı", country: "İsviçre", lat: 46.238, lng: 6.109 },
    { code: "BRU", city: "Brüksel", name: "Brüksel Havalimanı", country: "Belçika", lat: 50.901, lng: 4.484 },
    { code: "BUD", city: "Budapeşte", name: "Ferenc Liszt", country: "Macaristan", lat: 47.439, lng: 19.261 },
    { code: "PRG", city: "Prag", name: "Vaclav Havel", country: "Çekya", lat: 50.100, lng: 14.260 },
    { code: "WAW", city: "Varşova", name: "Chopin Havalimanı", country: "Polonya", lat: 52.165, lng: 20.967 },
    { code: "OTP", city: "Bükreş", name: "Henri Coanda", country: "Romanya", lat: 44.572, lng: 26.084 },
    { code: "CPH", city: "Kopenhag", name: "Kopenhag Havalimanı", country: "Danimarka", lat: 55.618, lng: 12.656 },
    { code: "ARN", city: "Stokholm", name: "Arlanda Havalimanı", country: "İsveç", lat: 59.651, lng: 17.918 },
    { code: "OSL", city: "Oslo", name: "Gardermoen Havalimanı", country: "Norveç", lat: 60.193, lng: 11.100 },
    { code: "DUB", city: "Dublin", name: "Dublin Havalimanı", country: "İrlanda", lat: 53.421, lng: -6.270 },
    { code: "VKO", city: "Moskova", name: "Vnukovo Havalimanı", country: "Rusya", lat: 55.591, lng: 37.261 },
    { code: "LED", city: "St. Petersburg", name: "Pulkovo Havalimanı", country: "Rusya", lat: 59.800, lng: 30.262 },

    // Americas
    { code: "JFK", city: "New York", name: "John F. Kennedy Havalimanı", country: "ABD", lat: 40.641, lng: -73.778 },
    { code: "ORD", city: "Şikago", name: "O'Hare Havalimanı", country: "ABD", lat: 41.974, lng: -87.907 },
    { code: "LAX", city: "Los Angeles", name: "Los Angeles Havalimanı", country: "ABD", lat: 33.941, lng: -118.408 },
    { code: "SFO", city: "San Francisco", name: "San Francisco Havalimanı", country: "ABD", lat: 37.621, lng: -122.378 },
    { code: "MIA", city: "Miami", name: "Miami Uluslararası Havalimanı", country: "ABD", lat: 25.795, lng: -80.287 },
    { code: "BOS", city: "Boston", name: "Logan Havalimanı", country: "ABD", lat: 42.365, lng: -71.009 },
    { code: "IAD", city: "Washington", name: "Dulles Havalimanı", country: "ABD", lat: 38.944, lng: -77.456 },
    { code: "IAH", city: "Houston", name: "George Bush Havalimanı", country: "ABD", lat: 29.980, lng: -95.339 },
    { code: "ATL", city: "Atlanta", name: "Hartsfield-Jackson", country: "ABD", lat: 33.640, lng: -84.427 },
    { code: "YYZ", city: "Toronto", name: "Pearson Havalimanı", country: "Kanada", lat: 43.677, lng: -79.624 },
    { code: "YUL", city: "Montreal", name: "Trudeau Havalimanı", country: "Kanada", lat: 45.470, lng: -73.740 },
    { code: "MEX", city: "Meksika", name: "Benito Juarez", country: "Meksika", lat: 19.436, lng: -99.072 },
    { code: "GRU", city: "Sao Paulo", name: "Guarulhos Havalimanı", country: "Brezilya", lat: -23.435, lng: -46.473 },
    { code: "EZE", city: "Buenos Aires", name: "Ezeiza Havalimanı", country: "Arjantin", lat: -34.822, lng: -58.535 },

    // Middle East, Africa & Asia-Pacific
    { code: "DXB", city: "Dubai", name: "Dubai Uluslararası Havalimanı", country: "BAE", lat: 25.253, lng: 55.364 },
    { code: "GYD", city: "Bakü", name: "Haydar Aliyev Havalimanı", country: "Azerbaycan", lat: 40.467, lng: 50.432 },
    { code: "TAS", city: "Taşkent", name: "Taşkent Havalimanı", country: "Özbekistan", lat: 41.257, lng: 69.281 },
    { code: "ALA", city: "Almati", name: "Almati Havalimanı", country: "Kazakistan", lat: 43.352, lng: 77.040 },
    { code: "IKA", city: "Tahran", name: "İmam Humeyni Havalimanı", country: "İran", lat: 35.416, lng: 51.152 },
    { code: "RUH", city: "Riyad", name: "Kral Halid Havalimanı", country: "Suudi Arabistan", lat: 24.957, lng: 46.698 },
    { code: "JED", city: "Cidde", name: "Kral Abdülaziz Havalimanı", country: "Suudi Arabistan", lat: 21.679, lng: 39.156 },
    { code: "MED", city: "Medine", name: "Prens Muhammed Havalimanı", country: "Suudi Arabistan", lat: 24.553, lng: 39.705 },
    { code: "DOH", city: "Doha", name: "Hamad Havalimanı", country: "Katar", lat: 25.273, lng: 51.608 },
    { code: "MCT", city: "Maskat", name: "Maskat Uluslararası Havalimanı", country: "Umman", lat: 23.593, lng: 58.281 },
    { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji", country: "Hindistan", lat: 19.089, lng: 72.868 },
    { code: "DEL", city: "Yeni Delhi", name: "Indira Gandhi", country: "Hindistan", lat: 28.566, lng: 77.103 },
    { code: "BKK", city: "Bangkok", name: "Suvarnabhumi Havalimanı", country: "Tayland", lat: 13.690, lng: 100.750 },
    { code: "HKT", city: "Phuket", name: "Phuket Havalimanı", country: "Tayland", lat: 8.113, lng: 98.306 },
    { code: "SIN", city: "Singapur", name: "Changi Havalimanı", country: "Singapur", lat: 1.364, lng: 103.991 },
    { code: "KUL", city: "Kuala Lumpur", name: "Kuala Lumpur Havalimanı", country: "Malezya", lat: 2.745, lng: 101.709 },
    { code: "CGK", city: "Cakarta", name: "Soekarno-Hatta", country: "Endonezya", lat: -6.125, lng: 106.655 },
    { code: "DPS", city: "Bali", name: "Ngurah Rai Havalimanı", country: "Endonezya", lat: -8.748, lng: 115.167 },
    { code: "MNL", city: "Manila", name: "Ninoy Aquino", country: "Filipinler", lat: 14.508, lng: 121.019 },
    { code: "NRT", city: "Tokyo Narita", name: "Narita Uluslararası Havalimanı", country: "Japonya", lat: 35.772, lng: 140.392 },
    { code: "HND", city: "Tokyo Haneda", name: "Haneda Havalimanı", country: "Japonya", lat: 35.549, lng: 139.779 },
    { code: "ICN", city: "Seul", name: "Incheon Havalimanı", country: "Güney Kore", lat: 37.460, lng: 126.440 },
    { code: "PEK", city: "Pekin", name: "Pekin Başkent Havalimanı", country: "Çin", lat: 40.080, lng: 116.584 },
    { code: "PVG", city: "Şanghay", name: "Pudong Havalimanı", country: "Çin", lat: 31.144, lng: 121.808 },
    { code: "CAN", city: "Guangzhou", name: "Guangzhou Baiyun", country: "Çin", lat: 23.392, lng: 113.299 },
    { code: "HKG", city: "Hong Kong", name: "Hong Kong Havalimanı", country: "Hong Kong", lat: 22.308, lng: 113.914 },
    { code: "TPE", city: "Taipei", name: "Taoyuan Havalimanı", country: "Tayvan", lat: 25.079, lng: 121.234 },

    { code: "CAI", city: "Kahire", name: "Kahire Uluslararası Havalimanı", country: "Mısır", lat: 30.121, lng: 31.405 },
    { code: "JNB", city: "Johannesburg", name: "O.R. Tambo Havalimanı", country: "Güney Afrika", lat: -26.139, lng: 28.246 },
    { code: "CPT", city: "Cape Town", name: "Cape Town Havalimanı", country: "Güney Afrika", lat: -33.978, lng: 18.601 },
    { code: "CMN", city: "Kazablanka", name: "Mohammed V Havalimanı", country: "Fas", lat: 33.367, lng: -7.589 },
    { code: "TUN", city: "Tunus", name: "Tunus-Kartaca Havalimanı", country: "Tunus", lat: 36.851, lng: 10.227 },
    { code: "ALG", city: "Cezayir", name: "Houari Boumediene", country: "Cezayir", lat: 36.691, lng: 3.215 },
    { code: "NBO", city: "Nairobi", name: "Jomo Kenyatta", country: "Kenya", lat: -1.319, lng: 36.927 }
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

  // ---- INITIALIZE BOOKING DATES & TRIP TYPE ----
  const today = new Date();
  const returnDate = new Date(today);
  returnDate.setDate(returnDate.getDate() + 4);

  const formatDateLocal = (date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const depDateInput = document.getElementById('flightDepartureDate');
  const retDateInput = document.getElementById('flightReturnDate');
  if (depDateInput) depDateInput.value = formatDateLocal(today);
  if (retDateInput) retDateInput.value = formatDateLocal(returnDate);

  let currentTripType = 'round-trip';
  const btnRoundTrip = document.getElementById('btnRoundTrip');
  const btnOneWay = document.getElementById('btnOneWay');
  const returnDateGroup = document.getElementById('returnDateGroup');

  if (btnRoundTrip && btnOneWay) {
    btnRoundTrip.addEventListener('click', () => {
      currentTripType = 'round-trip';
      btnRoundTrip.classList.add('active');
      btnOneWay.classList.remove('active');
      returnDateGroup?.classList.remove('hidden-date');
      if (retDateInput) {
        retDateInput.removeAttribute('disabled');
        const defaultRet = new Date();
        defaultRet.setDate(defaultRet.getDate() + 4);
        retDateInput.value = formatDateLocal(defaultRet);
      }
    });

    btnOneWay.addEventListener('click', () => {
      currentTripType = 'one-way';
      btnOneWay.classList.add('active');
      btnRoundTrip.classList.remove('active');
      returnDateGroup?.classList.add('hidden-date');
      if (retDateInput) {
        retDateInput.setAttribute('disabled', 'true');
        retDateInput.value = '';
      }
    });
  }

  // ---- TURKISH AIRLINES LIVE API INTEGRATION ----
  async function fetchThyLiveFlights(fromCode, toCode, date, cabin) {
    const thySettings = JSON.parse(localStorage.getItem('thy_api_settings') || '{}');
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

  // ---- AVIATIONSTACK LIVE FLIGHT API INTEGRATION ----
  async function fetchAviationstackFlights(fromCode, toCode, date) {
    const accessKey = '7b44b2dfa6bc8aae041fc12c67e7cee8';
    
    // Use CORS proxy to bypass HTTP-only restriction on Aviationstack free tier
    const targetUrl = encodeURIComponent(`http://api.aviationstack.com/v1/flights?access_key=${accessKey}&airline_iata=TK&dep_iata=${fromCode}&arr_iata=${toCode}`);
    const proxyUrl = `https://api.allorigins.win/raw?url=${targetUrl}`;
    
    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) {
        throw new Error('Aviationstack proxy call failed: ' + res.statusText);
      }
      
      const data = await res.json();
      
      if (data.error) {
        throw new Error('Aviationstack API response error: ' + data.error.message);
      }
      
      const flights = [];
      if (data.data && data.data.length > 0) {
        data.data.forEach(item => {
          // Verify carrier is Turkish Airlines (THY/TK) strictly
          const carrier = item.airline?.iata || item.airline?.icao;
          const matchesCarrier = carrier === 'TK' || carrier === 'THY' || item.flight?.iata?.startsWith('TK');
          
          if (matchesCarrier) {
            const depTimeRaw = item.departure?.scheduled;
            const arrTimeRaw = item.arrival?.scheduled;
            
            if (depTimeRaw && arrTimeRaw) {
              // Format to HH:MM Local
              const depTime = new Date(depTimeRaw).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
              const arrTime = new Date(arrTimeRaw).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
              const flightNo = item.flight?.iata || `TK ${item.flight?.number || '1862'}`;
              const gate = item.departure?.gate || 'A' + Math.floor(Math.random() * 10 + 1);
              const delay = item.departure?.delay || 0;
              const status = item.flight_status || 'scheduled';
              flights.push({ dep: depTime, arr: arrTime, flightNo, gate, delay, status });
            }
          }
        });
      }
      
      if (flights.length > 0) {
        THY.toast('Aviationstack Canlı Uçuşları Yüklendi! ✈️', 'success');
        return flights;
      }
      return null;
      
    } catch (err) {
      console.warn('Aviationstack proxy call failed, checking direct HTTPS as fallback...', err);
      try {
        const directUrl = `https://api.aviationstack.com/v1/flights?access_key=${accessKey}&airline_iata=TK&dep_iata=${fromCode}&arr_iata=${toCode}`;
        const res = await fetch(directUrl);
        if (res.ok) {
          const data = await res.json();
          if (data && data.data) {
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
                  const flightNo = item.flight?.iata || `TK ${item.flight?.number || '1862'}`;
                  const gate = item.departure?.gate || 'A' + Math.floor(Math.random() * 10 + 1);
                  const delay = item.departure?.delay || 0;
                  const status = item.flight_status || 'scheduled';
                  flights.push({ dep: depTime, arr: arrTime, flightNo, gate, delay, status });
                }
              }
            });
            if (flights.length > 0) return flights;
          }
        }
      } catch (directErr) {
        console.warn('Aviationstack direct HTTPS fallback failed:', directErr);
      }
      
      // Notify fallback to simulator
      THY.toast('Aviationstack Canlı Bağlantı Kısıtlaması. Dinamik Simülasyon Devreye Alındı.', 'info', 4500);
      return null;
    }
  }

  // ---- AVIATIONSTACK FLIGHT BY CODE LOOKUP ----
  async function fetchFlightByCode(flightCode) {
    const accessKey = '7b44b2dfa6bc8aae041fc12c67e7cee8';
    let cleanCode = flightCode.replace(/\s+/g, '').toUpperCase();
    if (!cleanCode.startsWith('TK') && !cleanCode.startsWith('THY')) {
      cleanCode = 'TK' + cleanCode;
    }
    
    const targetUrl = encodeURIComponent(`http://api.aviationstack.com/v1/flights?access_key=${accessKey}&airline_iata=TK&flight_iata=${cleanCode}`);
    const proxyUrl = `https://api.allorigins.win/raw?url=${targetUrl}`;

    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('Aviationstack call failed: ' + res.statusText);
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
    
    // Pick departure and destination randomly from AIRPORTS (e.g. IST to standard destinations)
    const departure = AIRPORTS[0]; // IST
    const destination = AIRPORTS.find(a => a.code === 'NRT') || AIRPORTS[1]; 
    
    const depTime = '13:45';
    const arrTime = '19:20';
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
  document.getElementById('btnSearchFlights')?.addEventListener('click', () => {
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
    
    let depCode = depInput.dataset.code;
    let destCode = destInput.dataset.code;
    const depDate = document.getElementById('flightDepartureDate')?.value;
    const retDate = document.getElementById('flightReturnDate')?.value;
    const cabin = document.getElementById('flightCabinClass')?.value;
    
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
 
    function renderFlights(direction) {
      // 1. Fade out current content
      listContainer.classList.add('fade-out');
      listContainer.style.pointerEvents = 'none'; // Disable clicks during transition
 
      setTimeout(async () => {
        listContainer.innerHTML = '';
        
        const isOutbound = direction === 'outbound';
        
        // Update Step Progress Indicators
        const stepsContainer = document.getElementById('bookingSteps');
        const stepOutbound = document.getElementById('stepOutbound');
        const stepInbound = document.getElementById('stepInbound');
 
        if (currentTripType === 'one-way' || isFlightCodeSearch) {
          if (stepsContainer) stepsContainer.style.display = 'none';
        } else {
          if (stepsContainer) stepsContainer.style.display = 'flex';
          if (isOutbound) {
            stepOutbound?.classList.add('active');
            stepOutbound?.classList.remove('completed');
            stepInbound?.classList.remove('active');
            stepInbound?.classList.remove('completed');
            stepsContainer?.classList.remove('step-2-active');
          } else {
            stepOutbound?.classList.remove('active');
            stepOutbound?.classList.add('completed');
            stepInbound?.classList.add('active');
            stepsContainer?.classList.add('step-2-active');
          }
        }

        // Show loading spinner
        listContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state__icon">✈️</div>
            <div class="empty-state__title">Uçuşlar Sorgulanıyor</div>
            <div class="empty-state__text">Aviationstack canlı uçuş veritabanına bağlanılıyor...</div>
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
            THY.toast('Aviationstack Canlı Uçuş Veritabanı Sorunu. Simülasyon Çalıştırıldı.', 'info', 4500);
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
            flightOptions = await fetchThyLiveFlights(fromCode, toCode, searchDate, cabin);
            if (!flightOptions) {
              flightOptions = await fetchAviationstackFlights(fromCode, toCode, searchDate);
            }
          } catch (e) {
            console.warn('Live fetch error:', e);
          }
        }

        const fromCode = isOutbound ? depCode : destCode;
        const toCode = isOutbound ? destCode : depCode;
        const routeLabel = isOutbound ? `Gidiş Uçuşu Seçin (${fromCode} ➔ ${toCode})` : `Dönüş Uçuşu Seçin (${fromCode} ➔ ${toCode})`;
        document.getElementById('resultsRouteLabel').textContent = routeLabel;
 
        const bannerText = isOutbound 
          ? `🛫 GİDİŞ UÇUŞU SEÇİN (${fromCode} ➔ ${toCode})` 
          : `🛬 DÖNÜŞ UÇUŞU SEÇİN (${fromCode} ➔ ${toCode})`;
        const bannerEl = document.getElementById('resultsRouteBanner');
        if (bannerEl) bannerEl.textContent = bannerText;

        listContainer.innerHTML = '';

        // Calculate dynamic flight duration using Haversine coordinates distance
        const depAp = AIRPORTS.find(a => a.code === fromCode);
        const destAp = AIRPORTS.find(a => a.code === toCode);
        let flightDurationMinutes = 200; // default 3h 20m
        if (depAp && destAp) {
          const dist = getDistance(depAp.lat, depAp.lng, destAp.lat, destAp.lng);
          // speed 800 km/h: distance * 0.075 + 30 mins overhead
          flightDurationMinutes = Math.max(45, Math.round(dist * 0.075 + 30));
        }
        const durationHoursStr = `${Math.floor(flightDurationMinutes / 60)}sa ${flightDurationMinutes % 60}dk`;

        if (!flightOptions) {
          // Dynamic Simulator Engine (Generates different hours/nos based on Date seed & City Pair distance)
          const dateSeed = new Date(searchDate).getDate() || today.getDate();
          const baseHours = isOutbound ? [8, 13, 18] : [9, 15, 20];
          
          flightOptions = baseHours.map((hour, idx) => {
            const offsetMinutes = ((dateSeed * 7 + idx * 13) % 45); // offset between 0 and 45 minutes
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
        
        flightOptions.forEach((fo, idx) => {
          const baseVal = cabin === 'business' ? 14900 : 3400;
          const price = baseVal + idx * 800 + Math.floor(Math.random() * 300);
          
          // Generate delay and gate HTML
          const delayHtml = fo.delay > 0 
            ? `<span style="color: #FF8C00; font-size: 11px; font-weight: 600; margin-left: 8px;">⚠️ Rötar: ${fo.delay} dk</span>` 
            : `<span style="color: #22C55E; font-size: 11px; font-weight: 600; margin-left: 8px;">🟢 Zamanında</span>`;
          const gateHtml = `<span style="color: var(--text-muted); font-size: 11px; margin-left: 8px;">🚪 Kapı: ${fo.gate}</span>`;

          const item = document.createElement('div');
          item.className = 'flight-item';
          item.innerHTML = `
            <span class="flight-type-badge ${isOutbound ? 'outbound-badge' : 'inbound-badge'}">
              ${isOutbound ? '🛫 GİDİŞ UÇUŞU' : '🛬 DÖNÜŞ UÇUŞU'}
            </span>
            <div class="flight-carrier">
              <div class="flight-logo-small">
                <svg viewBox="0 0 100 100">
                  <path d="M50 5 C50 5, 85 25, 85 55 C85 75, 70 95, 50 95 C30 95, 15 75, 15 55 C15 25, 50 5, 50 5Z" fill="white"/>
                  <path d="M50 20 L55 45 L78 45 L59 58 L66 82 L50 67 L34 82 L41 58 L22 45 L45 45 Z" fill="#E31837"/>
                </svg>
              </div>
              <span class="flight-no">${fo.flightNo}</span>
              ${delayHtml}
              ${gateHtml}
            </div>
            <div class="flight-schedule">
              <div class="schedule-block">
                <span class="schedule-time">${fo.dep}</span>
                <span class="schedule-code">${fromCode}</span>
              </div>
              <div class="flight-duration-path">
                <span class="duration-text">${durationHoursStr}</span>
                <div class="duration-line">
                  <span class="duration-plane">✈️</span>
                </div>
                <span class="duration-text">Direkt</span>
              </div>
              <div class="schedule-block">
                <span class="schedule-time">${fo.arr}</span>
                <span class="schedule-code">${toCode}</span>
              </div>
            </div>
            <div class="flight-price-action">
              <div class="price-tag">
                <span class="price-amount">${Math.floor(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</span>
                <span class="price-currency">TRY</span>
              </div>
              <button class="btn btn-primary btn-select-flight" 
                data-no="${fo.flightNo}" 
                data-dep="${fromCode}" 
                data-arr="${toCode}"
                data-gate="${fo.gate}"
                data-delay="${fo.delay || 0}"
                data-status="${fo.status || 'scheduled'}">Seç</button>
            </div>
          `;
          listContainer.appendChild(item);
        });
  
        // Attach event listeners to new buttons
        listContainer.querySelectorAll('.btn-select-flight').forEach(btn => {
          btn.addEventListener('click', () => {
            // Cooldown check (ignore click within 800ms of render)
            if (Date.now() - lastTransitionTime < 800) {
              console.log('[Debounce] Click ignored due to cooldown.');
              return;
            }

            // Immediately lock and fade all buttons
            listContainer.querySelectorAll('.btn-select-flight').forEach(b => {
              b.disabled = true;
              b.style.pointerEvents = 'none';
              b.style.opacity = '0.4';
            });

            // Make the clicked button green and set to selected
            btn.textContent = 'Seçildi ✓';
            btn.style.opacity = '1';
            btn.style.background = '#22C55E';
            btn.style.borderColor = '#22C55E';
            btn.style.color = 'white';

            const no = btn.dataset.no;
            const dep = btn.dataset.dep;
            const arr = btn.dataset.arr;
            const gate = btn.dataset.gate;
            const delay = parseInt(btn.dataset.delay) || 0;
            const status = btn.dataset.status || 'scheduled';
            
            // Introduce a 600ms visual delay so user sees selected state before loading
            setTimeout(() => {
              if (isOutbound) {
                selectedOutbound = { no, dep, arr, gate, delay, status };
                if (currentTripType === 'one-way' || isFlightCodeSearch) {
                  completeBooking();
                } else {
                  THY.toast('Gidiş uçuşu seçildi! Şimdi dönüş uçuşunuzu seçin. ✈️', 'success');
                  renderFlights('inbound');
                }
              } else {
                selectedInbound = { no, dep, arr, gate, delay, status };
                completeBooking();
              }
            }, 600);
          });
        });
 
        function completeBooking() {
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

            statusText.textContent = statusStr;
            statusText.style.color = color;
            statusBadge.style.borderColor = color;
          }
          
          const destAp = AIRPORTS.find(a => a.code === selectedOutbound.arr);
          
          let days = 3; // Default 3 days for one-way flight route
          if (currentTripType === 'round-trip' && depDate && retDate) {
            days = Math.max(1, Math.ceil((new Date(retDate) - new Date(depDate)) / (1000 * 60 * 60 * 24)));
          }
          
          if (currentTripType === 'one-way') {
            THY.toast('Tek Yön Uçuş: 3 Günlük Rota Planlanıyor... ✈️', 'success');
          } else {
            THY.toast('Biniş Kartlarınız Hazırlanıyor... ✈️', 'success');
            if (stepInbound) {
              stepInbound.classList.remove('active');
              stepInbound.classList.add('completed');
            }
          }
          
          setTimeout(() => {
            document.getElementById('landingScreen').classList.add('hidden');
            document.getElementById('mapScreen').classList.remove('hidden');
            
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
      statusText.textContent = statuses[statusIndex].text;
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

  // ---- SETTINGS (EmailJS & THY API) ----
  function loadSettings() {
    let settings = JSON.parse(localStorage.getItem('thy_emailjs_settings') || '{}');
    
    // Auto-populate custom EmailJS credentials
    if (!settings.serviceId || settings.serviceId === 'service_xxxxx' || settings.serviceId === '') {
      settings = {
        serviceId: 'service_8oc4sw9',
        templateId: 'template_y1ch11o',
        publicKey: 'Cwjj37r4vlqMA8F83'
      };
      localStorage.setItem('thy_emailjs_settings', JSON.stringify(settings));
    }

    const sid = document.getElementById('settingServiceId');
    const tid = document.getElementById('settingTemplateId');
    const pk = document.getElementById('settingPublicKey');
    if (sid) sid.value = settings.serviceId || '';
    if (tid) tid.value = settings.templateId || '';
    if (pk) pk.value = settings.publicKey || '';

    const thySettings = JSON.parse(localStorage.getItem('thy_api_settings') || '{}');
    const tcid = document.getElementById('settingThyClientId');
    const tcsec = document.getElementById('settingThyClientSecret');
    if (tcid) tcid.value = thySettings.clientId || '';
    if (tcsec) tcsec.value = thySettings.clientSecret || '';
    return { emailjs: settings, thy: thySettings };
  }

  function saveSettings() {
    const settings = {
      serviceId: document.getElementById('settingServiceId')?.value?.trim() || '',
      templateId: document.getElementById('settingTemplateId')?.value?.trim() || '',
      publicKey: document.getElementById('settingPublicKey')?.value?.trim() || ''
    };
    localStorage.setItem('thy_emailjs_settings', JSON.stringify(settings));

    const thySettings = {
      clientId: document.getElementById('settingThyClientId')?.value?.trim() || '',
      clientSecret: document.getElementById('settingThyClientSecret')?.value?.trim() || ''
    };
    localStorage.setItem('thy_api_settings', JSON.stringify(thySettings));

    THY.toast('Ayarlar kaydedildi!', 'success');
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
        lng: wp.lng,
        note: wp.note || ''
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
          THY.addWaypoint(wp.lat, wp.lng, wp.name, wp.note || '');
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
        lng: wp.lng,
        note: wp.note || ''
      }))
    };
    localStorage.setItem('thy_saved_trips', JSON.stringify(trips));
    THY.toast(`Trip "${THY.currentTripId}" kaydedildi!`, 'success');
  });

  // ---- EMAIL SENDING ----
  document.getElementById('btnSendEmail')?.addEventListener('click', async () => {
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

    THY.toast('Uçuş Özeti Hazırlanıyor...', 'info');

    // Build route summary as a Captain's Logbook brochure
    let routeSummary = 'Henüz rota oluşturulmadı.';
    if (THY.waypoints && THY.waypoints.length > 0) {
      const flightCode = document.getElementById('flightCode')?.textContent || 'TK 1982';
      const depCode = document.getElementById('flightDep')?.textContent || 'IST';
      const arrCode = document.getElementById('flightArr')?.textContent || 'NRT';
      const dateStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

    // Generate and shorten invite link (defined outside waypoints check so inviteLink is always populated)
    const longUrl = THY.generateShareUrl();
    const inviteLink = await THY.getShortenedUrl(longUrl);

    // Build route summary as a Captain's Logbook brochure
    let routeSummary = 'Henüz rota oluşturulmadı.';
    if (THY.waypoints && THY.waypoints.length > 0) {
      const flightCode = document.getElementById('flightCode')?.textContent || 'TK 1982';
      const depCode = document.getElementById('flightDep')?.textContent || 'IST';
      const arrCode = document.getElementById('flightArr')?.textContent || 'NRT';
      const dateStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

      let listStr = THY.waypoints.map((wp, i) => {
        let wpStr = `[DURAK ${i + 1}] 📍 ${wp.name}\n`;
        wpStr += `   Koordinat: ${wp.lat.toFixed(5)}°N, ${wp.lng.toFixed(5)}°E\n`;
        if (wp.note) {
          wpStr += `   📝 Kaptan Pilot Notu: "${wp.note}"\n`;
        }
        return wpStr;
      }).join('\n───────────────────────────────────\n\n');

      routeSummary = `
===================================================
      🛫 TURKISH AIRLINES - KAPTANIN SEYİR DEFTERİ 🛫
===================================================
Defter Kayıt ID : ${THY.currentTripId}
Kayıt Tarihi    : ${dateStr}
Canlı Uçuş Kodu : ${flightCode}
Uçuş Güzergahı  : ${depCode} ➔ ${arrCode}
Kontrol Noktası : ${THY.waypoints.length} Durak
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

    emailjs.send(settings.serviceId, settings.templateId, templateParams, settings.publicKey)
      .then(() => {
        THY.toast('Seyahat raporu ve davet bağlantısı başarıyla gönderildi! ✈️', 'success');
      })
      .catch((err) => {
        console.error('EmailJS Error:', err);
        THY.toast('E-posta gönderilemedi. Ayarları kontrol edin.', 'error');
      });
  });

  // ---- COPY INVITE LINK ----
  document.getElementById('btnCopyInviteLink')?.addEventListener('click', async () => {
    if (!THY.waypoints || THY.waypoints.length === 0) {
      THY.toast('Davet linki oluşturmak için önce rotaya nokta ekleyin!', 'error');
      return;
    }
    THY.toast('Davet bağlantısı kısaltılıyor...', 'info');
    const longUrl = THY.generateShareUrl();
    const shareUrl = await THY.getShortenedUrl(longUrl);
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      if (shareUrl !== longUrl) {
        THY.toast('Kısa davet linki kopyalandı! 🔗', 'success');
      } else {
        THY.toast('Davet linki kopyalandı! (Kısaltma servisi çevrimdışı, standart link kullanıldı) 🔗', 'info');
      }
      if (typeof THY.playSplitFlapSound === 'function') {
        THY.playSplitFlapSound(5);
      }
    }).catch(err => {
      console.error('Failed to copy link:', err);
      THY.toast('Link kopyalanamadı, lütfen manuel kopyalayın.', 'error');
    });
  });

  // ---- EMAIL PREVIEW UPDATE ----
  THY.updateEmailPreview = () => {
    const body = document.getElementById('emailPreviewBody');
    if (!body) return;

    if (!THY.waypoints || THY.waypoints.length === 0) {
      body.innerHTML = '<p style="opacity:0.5; text-align: center; padding: 20px 0;">Rota oluşturulduktan sonra Kaptan Pilotun Seyir Defteri burada hazırlanacak.</p>';
      return;
    }

    const flightCode = document.getElementById('flightCode')?.textContent || 'TK 1982';
    const depCode = document.getElementById('flightDep')?.textContent || 'IST';
    const arrCode = document.getElementById('flightArr')?.textContent || 'NRT';
    const dateStr = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

    let routeHtml = '';
    THY.waypoints.forEach((wp, i) => {
      const isFirst = i === 0;
      const isLast = i === THY.waypoints.length - 1;
      
      routeHtml += `
        <div style="position: relative; padding-left: 28px; margin-bottom: 12px;">
          <!-- Vertical timeline line -->
          ${!isLast ? `<div style="position: absolute; left: 8px; top: 16px; bottom: -16px; width: 1px; background: rgba(200, 169, 81, 0.3); border-left: 1px dashed var(--thy-gold);"></div>` : ''}
          
          <!-- Node Dot -->
          <div style="position: absolute; left: 2px; top: 2px; width: 14px; height: 14px; border-radius: 50%; background: ${isFirst || isLast ? 'var(--thy-red)' : 'var(--bg-primary)'}; border: 2px solid var(--thy-gold); display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; color: white;">
            ${isFirst ? '🛫' : (isLast ? '🛬' : '')}
          </div>
          
          <!-- Stop Detail -->
          <div style="font-weight: 600; font-size: 13px; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
            <span>Nokta ${i + 1}: ${wp.name}</span>
          </div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-muted); margin-top: 1px;">
            COORD: ${wp.lat.toFixed(5)}°N, ${wp.lng.toFixed(5)}°E
          </div>
          ${wp.note ? `
            <div style="margin-top: 4px; padding: 6px 10px; background: rgba(200, 169, 81, 0.05); border-left: 2px solid var(--thy-gold); font-size: 11px; color: var(--thy-gold-light); font-style: italic; border-radius: 0 4px 4px 0;">
              📝 Kaptan Notu: "${wp.note}"
            </div>
          ` : ''}
        </div>
      `;
    });

    let html = `
      <div style="font-family: 'Inter', sans-serif; color: var(--text-primary); background: #0E131F; border: 1px solid rgba(200, 169, 81, 0.2); border-radius: 8px; padding: 16px; box-shadow: var(--shadow-md);">
        
        <!-- Header Banner -->
        <div style="text-align: center; border-bottom: 2px double rgba(200, 169, 81, 0.3); padding-bottom: 12px; margin-bottom: 16px;">
          <div style="font-size: 9px; font-weight: 800; color: var(--thy-gold); letter-spacing: 3px; text-transform: uppercase;">Turkish Airlines | Flight Log</div>
          <h4 style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 4px 0; letter-spacing: 1px;">📋 KAPTAN PİLOTUN SEYİR DEFTERİ</h4>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-muted);">${THY.currentTripId}</div>
        </div>

        <!-- Metadata Grid -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 11px;">
          <tr>
            <td style="padding: 4px 0; color: var(--text-secondary);"><strong>UÇUŞ KODU:</strong></td>
            <td style="padding: 4px 0; text-align: right; color: var(--thy-gold-light); font-family: 'JetBrains Mono', monospace;"><strong>${flightCode}</strong></td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: var(--text-secondary);"><strong>GÜZERGAH:</strong></td>
            <td style="padding: 4px 0; text-align: right; color: var(--text-primary);"><strong>${depCode} ➔ ${arrCode}</strong></td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: var(--text-secondary);"><strong>SEYİR TARİHİ:</strong></td>
            <td style="padding: 4px 0; text-align: right; color: var(--text-primary);">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: var(--text-secondary);"><strong>KONTROL NOKTASI:</strong></td>
            <td style="padding: 4px 0; text-align: right; color: var(--text-primary);">${THY.waypoints.length} Durak</td>
          </tr>
        </table>

        <!-- Log Entry Area -->
        <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px;">
          <div style="font-size: 10px; font-weight: 700; color: var(--thy-gold); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">Seyir Güzergah Raporu</div>
          <div style="margin-bottom: 16px;">
            ${routeHtml}
          </div>
        </div>

        <!-- Collaboration Link Area -->
        <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px; margin-top: 16px; word-break: break-all;">
          <div style="font-size: 10px; font-weight: 700; color: var(--thy-gold); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px;">🔗 Düzenleme ve Davet Bağlantısı</div>
          <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">
            Bağlantı kopyalandığında veya e-posta gönderildiğinde otomatik olarak kısaltılacaktır (örn: <span style="color: var(--thy-gold-light); font-weight: 600;">https://is.gd/...</span>).
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px dashed rgba(148, 163, 184, 0.15); margin-top: 20px; padding-top: 12px; text-align: center; font-size: 10px; color: var(--text-muted); font-style: italic;">
          "Gökyüzünde güvenle planlandı. İyi uçuşlar dileriz."
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

  // ---- LOAD LIVE FLIGHT TO COCKPIT BOARD ----
  THY.loadLiveFlightBoard = async () => {
    const accessKey = '7b44b2dfa6bc8aae041fc12c67e7cee8';
    const targetUrl = encodeURIComponent(`http://api.aviationstack.com/v1/flights?access_key=${accessKey}&airline_iata=TK&limit=10`);
    const proxyUrl = `https://api.allorigins.win/raw?url=${targetUrl}`;

    try {
      console.log('📡 Fetching live THY flight board feed via CORS proxy...');
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('Proxy call failed');
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
            statusText.textContent = statusTextStr;
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

  // ---- SERVICE WORKER REGISTRATION ----
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js?v=2.2')
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
