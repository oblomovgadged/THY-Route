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

  THY.waypoints = [];

  // ---- Custom Map Style ("Sky-High" above the clouds) ----
  const skyHighMapStyle = [
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#FAF9F5' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#CFD8E3' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6B7A8C' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#CFD8E3' }]
    },
    {
      featureType: 'poi',
      elementType: 'all',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'road',
      elementType: 'all',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'all',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#2C3E50' }]
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#FAF9F5' }, { weight: 3 }]
    },
    {
      featureType: 'administrative.country',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#A0B2C6' }, { weight: 1.2 }]
    },
    {
      featureType: 'administrative.country',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#4A5568' }]
    },
    {
      featureType: 'administrative.country',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#FAF9F5' }]
    },
    {
      featureType: 'administrative.province',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#E2E8F0' }]
    }
  ];

  // ---- Initialize Map ----
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 35.6762, lng: 139.6503 }, // Tokyo
    zoom: 11,
    styles: skyHighMapStyle,
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy',
    backgroundColor: '#FAF9F5'
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
  THY.addWaypoint = (lat, lng, name) => {
    const wp = { lat, lng, name: name || `Nokta ${THY.waypoints.length + 1}` };
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
      infoWindow.setContent(`
        <div style="background:#1A2235;color:#F1F5F9;padding:10px 14px;border-radius:8px;font-family:Inter,sans-serif;min-width:140px;">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;">📍 ${wp.name}</div>
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
          <div class="waypoint-coords">${wp.lat.toFixed(5)}, ${wp.lng.toFixed(5)}</div>
        </div>
        <button class="waypoint-remove" data-index="${i}" title="Kaldır">✕</button>
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

  // Map click to add waypoint
  map.addListener('click', (e) => {
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

  THY.searchNearbyPlaces = (type) => {
    if (!placesService) return;
    const center = map.getCenter();
    const request = {
      location: center,
      radius: 2000,
      type: type
    };

    THY.toast(`${type} aranıyor...`, 'info');

    placesService.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        displayPlaces(results);
        THY.toast(`${results.length} yer bulundu!`, 'success');
      } else {
        displayPlaces([]);
        THY.toast('Yer bulunamadı.', 'info');
      }
    });
  };

  THY.textSearchPlaces = (query) => {
    if (!placesService) return;
    const center = map.getCenter();
    const request = {
      query: query,
      location: center,
      radius: 3000
    };

    THY.toast(`"${query}" aranıyor...`, 'info');

    placesService.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        displayPlaces(results);
        THY.toast(`${results.length} sonuç bulundu!`, 'success');
      } else {
        displayPlaces([]);
        THY.toast('Sonuç bulunamadı.', 'info');
      }
    });
  };

  // Search nearby on button
  document.getElementById('btnSearchPlaces')?.addEventListener('click', () => {
    const activeChip = document.querySelector('.filter-chip.active');
    const type = activeChip?.dataset?.type || 'restaurant';
    THY.searchNearbyPlaces(type);
  });

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

  console.log('🗺️ THY Route Map Engine initialized — Tokyo loaded');
}
