// ============================================
// THY Route - Google Maps Engine (map.js)
// Map, Routes, Waypoints, Places, Markers
// ============================================

// Google Maps callback — called by the API script
function initMap() {
  'use strict';

  const THY = window.THY || {};
  window.THY = THY;

  // ---- State ----
  let map = null;
  let placesService = null;
  let drawMode = false;
  let routePolyline = null;
  let waypointMarkers = [];
  let placeMarkers = [];
  let infoWindow = null;
  let activeNoteIndex = null;
  const noteModal = document.getElementById('noteModal');
  const noteTxt = document.getElementById('noteTxt');
  const noteTargetName = document.getElementById('noteModalTargetName');

  THY.waypoints = [];

  // ---- Initialize Map ----
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 35.6762, lng: 139.6503 }, // Tokyo
    zoom: 13,
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy'
  });

  // Initialize services
  placesService = new google.maps.places.PlacesService(map);
  infoWindow = new google.maps.InfoWindow();

  // ---- Custom Marker SVG ----
  function createWaypointIcon(index) {
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
          <defs>
            <filter id="s" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.5"/>
            </filter>
          </defs>
          <path d="M18 0 C8 0 0 8 0 18 C0 30 18 46 18 46 C18 46 36 30 36 18 C36 8 28 0 18 0Z" fill="#E31837" filter="url(#s)"/>
          <circle cx="18" cy="17" r="11" fill="white"/>
          <text x="18" y="22" text-anchor="middle" font-family="Inter,sans-serif" font-weight="700" font-size="13" fill="#E31837">${index}</text>
        </svg>
      `),
      scaledSize: new google.maps.Size(36, 46),
      anchor: new google.maps.Point(18, 46)
    };
  }

  function createPlaceIcon(emoji) {
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="15" fill="#1A2235" stroke="#C8A951" stroke-width="2"/>
          <text x="16" y="22" text-anchor="middle" font-size="15">${emoji}</text>
        </svg>
      `),
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 16)
    };
  }

  // ---- Waypoint Management ----
  THY.addWaypoint = (lat, lng, name, note = '') => {
    const wp = { lat, lng, name: name || `Nokta ${THY.waypoints.length + 1}`, note: note || '' };
    THY.waypoints.push(wp);

    // Add marker
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: map,
      icon: createWaypointIcon(THY.waypoints.length),
      title: wp.name,
      animation: google.maps.Animation.DROP,
      zIndex: 100
    });

    marker.addListener('click', () => {
      const currentWp = THY.waypoints.find(w => w.lat === lat && w.lng === lng) || wp;
      const noteHtml = currentWp.note ? `<div style="font-size:11px;color:#C8A951;margin-bottom:6px;font-style:italic;">📝 ${currentWp.note}</div>` : '';
      infoWindow.setContent(`
        <div style="background:#1A2235;color:#F1F5F9;padding:10px 14px;border-radius:8px;font-family:Inter,sans-serif;min-width:140px;">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;">📍 ${currentWp.name}</div>
          ${noteHtml}
          <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#94A3B8;">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
        </div>
      `);
      infoWindow.open(map, marker);
    });

    waypointMarkers.push(marker);
    updatePolyline();
    updateWaypointUI();
    THY.updateEmailPreview();
  };

  THY.removeWaypoint = (index) => {
    THY.waypoints.splice(index, 1);
    waypointMarkers[index].setMap(null);
    waypointMarkers.splice(index, 1);

    // Re-index marker icons
    waypointMarkers.forEach((m, i) => {
      m.setIcon(createWaypointIcon(i + 1));
    });

    updatePolyline();
    updateWaypointUI();
    THY.updateEmailPreview();
  };

  THY.clearRoute = () => {
    THY.waypoints = [];
    waypointMarkers.forEach(m => m.setMap(null));
    waypointMarkers = [];
    if (routePolyline) {
      routePolyline.setMap(null);
      routePolyline = null;
    }
    updateWaypointUI();
    THY.updateEmailPreview();
  };

  // ---- Polyline ----
  function updatePolyline() {
    if (routePolyline) {
      routePolyline.setMap(null);
    }

    if (THY.waypoints.length < 2) return;

    const path = THY.waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng }));

    routePolyline = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#E31837',
      strokeOpacity: 0.9,
      strokeWeight: 3,
      icons: [{
        icon: {
          path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
          scale: 3,
          strokeColor: '#C8A951',
          strokeWeight: 2
        },
        offset: '50%',
        repeat: '120px'
      }],
      map: map
    });
  }

  // ---- Waypoint UI ----
  function updateWaypointUI() {
    const list = document.getElementById('waypointList');
    const emptyState = document.getElementById('emptyRouteState');
    if (!list) return;

    list.innerHTML = '';

    if (THY.waypoints.length === 0) {
      list.innerHTML = `
        <div class="empty-state" id="emptyRouteState">
          <div class="empty-state__icon">🌍</div>
          <div class="empty-state__title">Rota Boş</div>
          <div class="empty-state__text">Haritaya tıklayarak veya "Rota Çiz" modunu açarak nokta ekleyin.</div>
        </div>
      `;
      return;
    }

    THY.waypoints.forEach((wp, i) => {
      // Connector
      if (i > 0) {
        const connector = document.createElement('div');
        connector.className = 'waypoint-connector';
        list.appendChild(connector);
      }

      const item = document.createElement('div');
      item.className = 'waypoint-item';
      item.innerHTML = `
        <div class="waypoint-marker">${i + 1}</div>
        <div class="waypoint-info">
          <div class="waypoint-name">${wp.name}</div>
          ${wp.note ? `<div class="waypoint-note">📝 Not: ${wp.note}</div>` : ''}
          <div class="waypoint-coords">${wp.lat.toFixed(5)}, ${wp.lng.toFixed(5)}</div>
        </div>
        <div class="waypoint-actions" style="display: flex; gap: 6px; align-items: center;">
          <button class="waypoint-note-btn" data-index="${i}" title="Not Ekle/Düzenle">📝</button>
          <button class="waypoint-remove" data-index="${i}" title="Kaldır">✕</button>
        </div>
      `;
      list.appendChild(item);
    });

    // Remove handlers
    list.querySelectorAll('.waypoint-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        THY.removeWaypoint(idx);
      });
    });

    // Note handlers
    list.querySelectorAll('.waypoint-note-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(e.currentTarget.dataset.index);
        activeNoteIndex = idx;
        if (noteTargetName) noteTargetName.textContent = `📍 ${THY.waypoints[idx].name}`;
        if (noteTxt) noteTxt.value = THY.waypoints[idx].note || '';
        noteModal?.classList.add('active');
      });
    });
  }

  // ---- Draw Mode ----
  const btnDraw = document.getElementById('btnDrawRoute');
  if (btnDraw) {
    btnDraw.addEventListener('click', () => {
      drawMode = !drawMode;
      btnDraw.classList.toggle('active', drawMode);
      map.setOptions({ draggableCursor: drawMode ? 'crosshair' : null });
      THY.toast(drawMode ? 'Rota çizim modu AÇ — Haritaya tıklayın' : 'Rota çizim modu KAPALI', 'info');
    });
  }

  // Map click to add waypoint or handle POI click
  map.addListener('click', (e) => {
    // If they clicked on a default Google Maps Point of Interest (POI)
    if (e.placeId) {
      e.stop(); // Prevent the default Google Maps info window popup

      const request = {
        placeId: e.placeId,
        fields: ['name', 'geometry', 'vicinity', 'rating', 'user_ratings_total']
      };

      placesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          const ratingHtml = place.rating 
            ? `<div style="color:#C8A951;font-size:12px;margin-bottom:6px;">${renderStars(place.rating)} ${place.rating} (${place.user_ratings_total || 0})</div>` 
            : '';

          // Custom InfoWindow container element
          const contentDiv = document.createElement('div');
          contentDiv.style.background = '#1A2235';
          contentDiv.style.color = '#F1F5F9';
          contentDiv.style.padding = '10px 14px';
          contentDiv.style.borderRadius = '8px';
          contentDiv.style.fontFamily = 'Inter,sans-serif';
          contentDiv.style.minWidth = '180px';
          contentDiv.innerHTML = `
            <div style="font-weight:700;font-size:13px;margin-bottom:4px;">📍 ${place.name}</div>
            <div style="font-size:11px;color:#94A3B8;margin-bottom:6px;">${place.vicinity || ''}</div>
            ${ratingHtml}
            <button id="btnPoiAddToRoute" style="background:#E31837;color:white;border:none;padding:6px 12px;font-size:11px;font-weight:700;border-radius:4px;cursor:pointer;width:100%;transition:background 0.2s;">Rotaya Ekle</button>
          `;

          // Add click listener to the button
          contentDiv.querySelector('#btnPoiAddToRoute').addEventListener('click', () => {
            THY.addWaypoint(lat, lng, place.name);
            THY.toast(`"${place.name}" rotaya eklendi!`, 'success');
            infoWindow.close();
          });

          infoWindow.setContent(contentDiv);
          infoWindow.setPosition(place.geometry.location);
          infoWindow.open(map);
        }
      });
      return;
    }

    // Default map click to add waypoint (only in Draw Mode)
    if (!drawMode) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    // Reverse geocode for name
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      let name = `Nokta ${THY.waypoints.length + 1}`;
      if (status === 'OK' && results[0]) {
        // Try to get a short meaningful name
        const components = results[0].address_components;
        const poi = components.find(c => c.types.includes('point_of_interest'));
        const neighborhood = components.find(c => c.types.includes('neighborhood') || c.types.includes('sublocality'));
        const locality = components.find(c => c.types.includes('locality'));
        name = (poi || neighborhood || locality || components[0])?.long_name || name;
      }
      THY.addWaypoint(lat, lng, name);
    });
  });

  // Clear route button
  document.getElementById('btnClearRoute')?.addEventListener('click', () => {
    if (THY.waypoints.length === 0) {
      THY.toast('Temizlenecek rota yok!', 'info');
      return;
    }
    THY.clearRoute();
    THY.toast('Rota temizlendi!', 'success');
  });

  // My location
  document.getElementById('btnMyLocation')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      THY.toast('Tarayıcınız konum desteği sunmuyor.', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.panTo(loc);
        map.setZoom(15);
        THY.toast('Konumunuza gidiliyor...', 'info');
      },
      () => {
        THY.toast('Konum alınamadı.', 'error');
      }
    );
  });

  // ---- PLACES ----
  function getPlaceEmoji(types) {
    if (!types) return '📍';
    if (types.includes('restaurant') || types.includes('food')) return '🍜';
    if (types.includes('lodging')) return '🏨';
    if (types.includes('tourist_attraction')) return '🏯';
    if (types.includes('cafe')) return '☕';
    if (types.includes('shopping_mall') || types.includes('store')) return '🛍️';
    if (types.includes('museum')) return '🏛️';
    if (types.includes('park')) return '🌳';
    if (types.includes('bar')) return '🍸';
    if (types.includes('temple') || types.includes('place_of_worship')) return '⛩️';
    return '📍';
  }

  function renderStars(rating) {
    if (!rating) return '';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
  }

  function displayPlaces(places) {
    const list = document.getElementById('placesList');
    if (!list) return;

    // Clear old markers
    placeMarkers.forEach(m => m.setMap(null));
    placeMarkers = [];

    if (!places || places.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">😔</div>
          <div class="empty-state__title">Sonuç Bulunamadı</div>
          <div class="empty-state__text">Farklı bir filtre veya arama terimi deneyin.</div>
        </div>
      `;
      return;
    }

    list.innerHTML = '';

    places.forEach((place) => {
      const emoji = getPlaceEmoji(place.types);
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      // Card
      const card = document.createElement('div');
      card.className = 'place-card';
      card.innerHTML = `
        <div class="place-icon">${emoji}</div>
        <div class="place-info">
          <div class="place-name">${place.name}</div>
          <div class="place-address">${place.vicinity || place.formatted_address || ''}</div>
          ${place.rating ? `
            <div class="place-rating">
              <span class="place-stars">${renderStars(place.rating)}</span>
              <span class="place-rating-text">${place.rating} (${place.user_ratings_total || 0})</span>
            </div>
          ` : ''}
        </div>
        <button class="place-add-btn" title="Rotaya Ekle">+</button>
      `;

      // Click card to pan
      card.querySelector('.place-info').addEventListener('click', () => {
        map.panTo({ lat, lng });
        map.setZoom(17);
      });

      // Add to route
      card.querySelector('.place-add-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        THY.addWaypoint(lat, lng, place.name);
        THY.toast(`"${place.name}" rotaya eklendi!`, 'success');
      });

      list.appendChild(card);

      // Map marker
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        icon: createPlaceIcon(emoji),
        title: place.name,
        zIndex: 50
      });

      marker.addListener('click', () => {
        infoWindow.setContent(`
          <div style="background:#1A2235;color:#F1F5F9;padding:12px 16px;border-radius:8px;font-family:Inter,sans-serif;min-width:160px;">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${emoji} ${place.name}</div>
            <div style="font-size:11px;color:#94A3B8;margin-bottom:6px;">${place.vicinity || ''}</div>
            ${place.rating ? `<div style="color:#C8A951;font-size:12px;">${renderStars(place.rating)} ${place.rating}</div>` : ''}
          </div>
        `);
        infoWindow.open(map, marker);
      });

      placeMarkers.push(marker);
    });
  }

  THY.searchNearbyPlaces = (type, customCenter = null) => {
    if (!placesService) {
      THY.toast('Yer arama servisi henüz hazır değil.', 'error');
      return;
    }
    let latLng;
    if (customCenter) {
      latLng = customCenter;
    } else {
      const center = map.getCenter();
      if (!center) {
        THY.toast('Harita merkezi alınamadı.', 'error');
        return;
      }
      latLng = { lat: center.lat(), lng: center.lng() };
    }
    const request = {
      location: latLng,
      radius: 2000,
      type: type
    };

    THY.toast(`${type} aranıyor...`, 'info');

    placesService.nearbySearch(request, (results, status) => {
      console.log('Nearby Search Status:', status, 'Results:', results);
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        displayPlaces(results);
        THY.toast(`${results.length} yer bulundu!`, 'success');
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        displayPlaces([]);
        THY.toast('Bu bölgede eşleşen yer bulunamadı.', 'info');
      } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
        displayPlaces([]);
        THY.toast('Hata: API Anahtarında Places API izni veya faturalandırma etkin değil. (REQUEST_DENIED)', 'error');
      } else {
        displayPlaces([]);
        THY.toast(`Arama başarısız oldu. Hata Kodu: ${status}`, 'error');
      }
    });
  };

  THY.textSearchPlaces = (query) => {
    if (!placesService) {
      THY.toast('Yer arama servisi hazır değil.', 'error');
      return;
    }
    const center = map.getCenter();
    const request = {
      query: query,
      location: center ? { lat: center.lat(), lng: center.lng() } : null,
      radius: 3000
    };

    THY.toast(`"${query}" aranıyor...`, 'info');

    placesService.textSearch(request, (results, status) => {
      console.log('Text Search Status:', status, 'Results:', results);
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        displayPlaces(results);
        THY.toast(`${results.length} sonuç bulundu!`, 'success');
      } else if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
        displayPlaces([]);
        THY.toast('Hata: API Anahtarında Places API izni yok. (REQUEST_DENIED)', 'error');
      } else {
        displayPlaces([]);
        THY.toast(`Arama başarısız oldu. Hata Kodu: ${status}`, 'error');
      }
    });
  };

  // Search nearby on button
  document.getElementById('btnSearchPlaces')?.addEventListener('click', () => {
    const activeChip = document.querySelector('.filter-chip.active');
    const type = activeChip?.dataset?.type || 'restaurant';
    THY.searchNearbyPlaces(type);
  });

  // ---- AUTO ITINERARY RECOMMENDER ----
  THY.planAutoItinerary = (destAp, days) => {
    // Recommended sights database for major cities
    const sightsDatabase = {
      FCO: [ // Rome
        { name: "Kolezyum (Colosseum)", lat: 41.8902, lng: 12.4922 },
        { name: "Trevi Aşk Çeşmesi (Trevi Fountain)", lat: 41.9009, lng: 12.4833 },
        { name: "Panteon (Pantheon)", lat: 41.8986, lng: 12.4769 },
        { name: "Vatikan Müzeleri (Vatican)", lat: 41.9070, lng: 12.4535 },
        { name: "Aziz Petrus Bazilikası", lat: 41.9022, lng: 12.4539 },
        { name: "İspanyol Merdivenleri", lat: 41.9060, lng: 12.4828 },
        { name: "Navona Meydanı", lat: 41.8989, lng: 12.4731 },
        { name: "Kutsal Melek Kalesi", lat: 41.9031, lng: 12.4663 }
      ],
      NRT: [ // Tokyo Narita
        { name: "Senso-ji Tapınağı", lat: 35.7148, lng: 139.7967 },
        { name: "Shibuya Yaya Geçidi", lat: 35.6595, lng: 139.7005 },
        { name: "Meiji Jingu Tapınağı", lat: 35.6764, lng: 139.6993 },
        { name: "Tokyo Kulesi", lat: 35.6586, lng: 139.7454 },
        { name: "Shinjuku Parkı", lat: 35.6852, lng: 139.7101 },
        { name: "Ueno Parkı", lat: 35.7154, lng: 139.7740 },
        { name: "Akihabara Elektrik Şehri", lat: 35.6997, lng: 139.7715 }
      ],
      HND: [ // Tokyo Haneda
        { name: "Senso-ji Tapınağı", lat: 35.7148, lng: 139.7967 },
        { name: "Shibuya Yaya Geçidi", lat: 35.6595, lng: 139.7005 },
        { name: "Meiji Jingu Tapınağı", lat: 35.6764, lng: 139.6993 },
        { name: "Tokyo Kulesi", lat: 35.6586, lng: 139.7454 },
        { name: "Shinjuku Parkı", lat: 35.6852, lng: 139.7101 },
        { name: "Ueno Parkı", lat: 35.7154, lng: 139.7740 }
      ],
      CDG: [ // Paris
        { name: "Eyfel Kulesi", lat: 48.8584, lng: 2.2945 },
        { name: "Louvre Müzesi", lat: 48.8606, lng: 2.3376 },
        { name: "Notre Dame Katedrali", lat: 48.8530, lng: 2.3499 },
        { name: "Zafer Takı", lat: 48.8738, lng: 2.2950 },
        { name: "Ressamlar Tepesi (Montmartre)", lat: 48.8867, lng: 2.3431 },
        { name: "Lüksemburg Bahçesi", lat: 48.8462, lng: 2.3372 }
      ],
      LHR: [ // London
        { name: "British Museum", lat: 51.5194, lng: -0.1270 },
        { name: "Londra Kalesi", lat: 51.5081, lng: -0.0759 },
        { name: "London Eye", lat: 51.5033, lng: -0.1195 },
        { name: "Buckingham Sarayı", lat: 51.5014, lng: -0.1419 },
        { name: "Big Ben & Westminster", lat: 51.5007, lng: -0.1246 },
        { name: "Hyde Park", lat: 51.5073, lng: -0.1657 }
      ],
      JFK: [ // New York
        { name: "Times Meydanı", lat: 40.7580, lng: -73.9855 },
        { name: "Central Park", lat: 40.7829, lng: -73.9654 },
        { name: "Özgürlük Anıtı", lat: 40.6892, lng: -74.0445 },
        { name: "Empire State Binası", lat: 40.7484, lng: -73.9857 },
        { name: "Brooklyn Köprüsü", lat: 40.7061, lng: -73.9969 },
        { name: "Metropolitan Sanat Müzesi", lat: 40.7794, lng: -73.9632 }
      ]
    };

    const sights = sightsDatabase[destAp.code] || [];
    
    // Clear old route first
    THY.clearRoute();

    if (sights.length > 0) {
      // 1. Pan map to city center (first sight in sightsDatabase, e.g. Colosseum for Rome) instead of far-away airport
      const destinationCenter = { lat: sights[0].lat, lng: sights[0].lng };
      map.panTo(destinationCenter);
      map.setZoom(13);

      const takeCount = Math.min(sights.length, days * 2);
      THY.toast(`${destAp.city} için ${days} günlük seyahat planı hazırlanıyor...`, 'info');
      
      sights.slice(0, takeCount).forEach((s, idx) => {
        setTimeout(() => {
          THY.addWaypoint(s.lat, s.lng, s.name);
        }, idx * 300);
      });

      // 2. Automatically update Places tab to search for local places (restaurants) around city center
      setTimeout(() => {
        const activeChip = document.querySelector('.filter-chip.active');
        const type = activeChip?.dataset?.type || 'restaurant';
        THY.searchNearbyPlaces(type, destinationCenter);
      }, 500);

    } else {
      // Dynamic fallback via Google Places Nearby Search around the airport
      THY.toast(`${destAp.city} civarı keşfediliyor...`, 'info');
      const request = {
        location: { lat: destAp.lat, lng: destAp.lng },
        radius: 6000,
        type: 'tourist_attraction'
      };

      placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          // Pan to first tourist attraction found
          const firstLoc = results[0].geometry.location;
          const dynamicCenter = { lat: firstLoc.lat(), lng: firstLoc.lng() };
          map.panTo(dynamicCenter);
          map.setZoom(13);

          const takeCount = Math.min(results.length, days * 2);
          results.slice(0, takeCount).forEach((place, idx) => {
            const loc = place.geometry.location;
            setTimeout(() => {
              THY.addWaypoint(loc.lat(), loc.lng(), place.name);
            }, idx * 300);
          });

          // Automatically update Places tab to search around the new dynamic center
          setTimeout(() => {
            const activeChip = document.querySelector('.filter-chip.active');
            const type = activeChip?.dataset?.type || 'restaurant';
            THY.searchNearbyPlaces(type, dynamicCenter);
          }, 500);

        } else {
          // Fallback to airport coordinates
          map.panTo({ lat: destAp.lat, lng: destAp.lng });
          map.setZoom(13);
          THY.addWaypoint(destAp.lat, destAp.lng, `${destAp.city} Havalimanı`);

          // Update Places tab around the airport
          setTimeout(() => {
            const activeChip = document.querySelector('.filter-chip.active');
            const type = activeChip?.dataset?.type || 'restaurant';
            THY.searchNearbyPlaces(type, { lat: destAp.lat, lng: destAp.lng });
          }, 500);
        }
      });
    }
  };

  // ---- Initial Places Load ----
  // Load restaurants around Tokyo on start
  setTimeout(() => {
    THY.searchNearbyPlaces('restaurant');
  }, 1500);

  // ---- Splash hide ----
  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) splash.classList.add('hidden');
  }, 2000);

  // ---- Custom Note Modal Logic ----
  function closeNoteModal() {
    noteModal?.classList.remove('active');
    activeNoteIndex = null;
  }

  document.getElementById('btnCloseNoteModal')?.addEventListener('click', closeNoteModal);
  document.getElementById('btnCancelNote')?.addEventListener('click', closeNoteModal);

  document.getElementById('btnSaveNote')?.addEventListener('click', () => {
    if (activeNoteIndex !== null && activeNoteIndex >= 0 && activeNoteIndex < THY.waypoints.length) {
      THY.waypoints[activeNoteIndex].note = noteTxt.value.trim();
      updateWaypointUI();
      THY.updateEmailPreview();
    }
    closeNoteModal();
  });

  document.getElementById('btnDeleteNote')?.addEventListener('click', () => {
    if (activeNoteIndex !== null && activeNoteIndex >= 0 && activeNoteIndex < THY.waypoints.length) {
      THY.waypoints[activeNoteIndex].note = '';
      updateWaypointUI();
      THY.updateEmailPreview();
    }
    closeNoteModal();
  });

  console.log('🗺️ THY Route Map Engine initialized — Tokyo loaded');
}
