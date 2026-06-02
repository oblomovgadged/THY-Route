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
  THY.showPartners = false;
  let lastSearchResults = [];

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

  // ---- THY Partners Toggle Control ----
  const partnerBtn = document.createElement('button');
  partnerBtn.className = 'thy-partners-toggle-btn';
  partnerBtn.id = 'btnThyPartnersToggle';
  partnerBtn.innerHTML = '<span class="btn-icon"></span>THY Partnerleri';
  
  partnerBtn.addEventListener('click', () => {
    THY.showPartners = !THY.showPartners;
    partnerBtn.classList.toggle('active', THY.showPartners);
    
    // Re-render waypoint markers on map
    if (typeof THY.renderTripState === 'function') {
      THY.renderTripState({
        waypoints: THY.waypoints,
        maxDays: THY.maxDays
      }, false);
    }
    
    // Re-render search result markers on map
    if (typeof THY.reRenderPlaceMarkers === 'function') {
      THY.reRenderPlaceMarkers();
    }

    // Toggle promotional pins based on showPartners state
    if (THY.showPartners) {
      showNearbyPartnerPromo();
    } else {
      clearPartnerPromoMarkers();
    }
    
    THY.toast(
      THY.showPartners ? 'THY Partner Ayrıcalıkları Haritada Gösteriliyor!' : 'Partner Ayrıcalıkları Gizlendi',
      'info'
    );
  });

  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(partnerBtn);

  // Update promo pins when map is dragged/moved and showPartners is active
  map.addListener('idle', () => {
    if (THY.showPartners) {
      showNearbyPartnerPromo();
    }
  });

  // ---- Custom Marker SVG & Partner Icons ----
  function createWaypointIcon(index, color = '#E31837') {
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
          <defs>
            <filter id="s" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.5"/>
            </filter>
          </defs>
          <path d="M18 0 C8 0 0 8 0 18 C0 30 18 46 18 46 C18 46 36 30 36 18 C36 8 28 0 18 0Z" fill="${color}" filter="url(#s)"/>
          <circle cx="18" cy="17" r="11" fill="white"/>
          <text x="18" y="22" text-anchor="middle" font-family="Inter,sans-serif" font-weight="700" font-size="13" fill="${color}">${index}</text>
        </svg>
      `),
      scaledSize: new google.maps.Size(36, 46),
      anchor: new google.maps.Point(18, 46)
    };
  }

  function createPlaceIcon(emoji) {
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46">
          <defs>
            <filter id="s" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.5"/>
            </filter>
          </defs>
          <path d="M18 0 C8 0 0 8 0 18 C0 30 18 46 18 46 C18 46 36 30 36 18 C36 8 28 0 18 0Z" fill="#1A2235" stroke="#C8A951" stroke-width="2" filter="url(#s)"/>
          <circle cx="18" cy="17" r="11" fill="white"/>
          <text x="18" y="22" text-anchor="middle" font-size="15">${emoji}</text>
        </svg>
      `),
      scaledSize: new google.maps.Size(36, 46),
      anchor: new google.maps.Point(18, 46)
    };
  }

  function createPartnerIcon() {
    return {
      url: 'icons/icon-512.svg',
      scaledSize: new google.maps.Size(36, 36),
      anchor: new google.maps.Point(18, 18)
    };
  }

  const THY_PARTNERS = [
    {
      brands: ['avis'],
      offer: 'Avis araç kiralamalarında %30 İndirim + 500 Mil Hediye!',
      type: 'Car Rental',
      iconEmoji: '🚗'
    },
    {
      brands: ['hilton', 'rixos', 'marriott', 'sheraton'],
      offer: 'THY İş Ortaklığı ile konaklamalarda 3 Kat Mil Kazanma Fırsatı!',
      type: 'Hotel Partnership',
      iconEmoji: '🏨'
    }
  ];

  const PARTNER_PLACE_IDS = {
    // İstanbul Avis & Bali Hotels / Avis place_ids (Known mock/sample place ids)
    'ChIJuRzNKeG5hxQR5eM5_J3i4S0': { brands: ['avis'], offer: 'Avis araç kiralamalarında %30 İndirim + 500 Mil Hediye!', type: 'Car Rental', iconEmoji: '🚗' },
    'ChIJ55aT6hC-zS0RjA13Lp6j9nE': { brands: ['hilton'], offer: 'THY İş Ortaklığı ile konaklamalarda 3 Kat Mil Kazanma Fırsatı!', type: 'Hotel Partnership', iconEmoji: '🏨' }
  };

  function getPartnerMatch(name, placeId) {
    if (placeId && PARTNER_PLACE_IDS[placeId]) {
      return PARTNER_PLACE_IDS[placeId];
    }
    if (!name) return null;
    const lowerName = name.toLowerCase();
    for (const partner of THY_PARTNERS) {
      for (const brand of partner.brands) {
        if (lowerName.includes(brand)) {
          return partner;
        }
      }
    }
    return null;
  }

  // ---- THY Partner Promo Pins (Automatic Sponsored Pins) ----
  let partnerPromoMarkers = [];

  function clearPartnerPromoMarkers() {
    partnerPromoMarkers.forEach(m => m.setMap(null));
    partnerPromoMarkers = [];
  }

  function showNearbyPartnerPromo() {
    clearPartnerPromoMarkers();
    if (!THY.showPartners || !placesService) return;

    const center = map.getCenter();
    if (!center) return;

    // Search for "Avis", "Hilton", "Sheraton", "Marriott", "Rixos" around the center
    const searchTerms = ['Avis', 'Hilton', 'Sheraton', 'Marriott', 'Rixos'];
    searchTerms.forEach(term => {
      placesService.textSearch({
        location: center,
        radius: 8000, // 8km radius for better density
        query: term
      }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // Take top 3 results per brand to avoid map clutter
          results.slice(0, 3).forEach(place => {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            // Avoid adding if already in waypoint list to prevent duplicate icons
            const isDuplicate = THY.waypoints.some(wp => Math.abs(wp.lat - lat) < 0.0001 && Math.abs(wp.lng - lng) < 0.0001);
            if (isDuplicate) return;

            const partnerInfo = getPartnerMatch(place.name, place.place_id);
            if (!partnerInfo) return;

            const marker = new google.maps.Marker({
              position: { lat, lng },
              map: map,
              icon: createPartnerIcon(),
              title: place.name,
              zIndex: 140
            });

            marker.addListener('click', () => {
              let photoHtml = '';
              if (place.photos && place.photos.length > 0) {
                const photoUrl = place.photos[0].getUrl({ maxWidth: 240, maxHeight: 120 });
                photoHtml = `<img src="${photoUrl}" style="width:100%;height:100px;object-fit:cover;border-radius:6px;margin-bottom:8px;box-shadow:0 2px 4px rgba(0,0,0,0.3);" alt="${place.name}">`;
              }

              const ratingHtml = place.rating 
                ? `<div style="color:#C8A951;font-size:12px;margin-bottom:6px;">${renderStars(place.rating)} ${place.rating} (${place.user_ratings_total || 0})</div>` 
                : '';

              const partnerHtml = `
                <div style="background: linear-gradient(135deg, #E31837 0%, #B01026 100%); color: white; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(227,24,55,0.3); max-width: 220px; white-space: normal;">
                  <span>✈️ THY Partner Avantajı:</span>
                  <span style="font-weight: 500;">${partnerInfo.offer}</span>
                </div>
              `;

              const contentDiv = document.createElement('div');
              contentDiv.style.background = '#1A2235';
              contentDiv.style.color = '#F1F5F9';
              contentDiv.style.padding = '10px 14px';
              contentDiv.style.borderRadius = '8px';
              contentDiv.style.fontFamily = 'Inter,sans-serif';
              contentDiv.style.minWidth = '180px';
              contentDiv.innerHTML = `
                ${photoHtml}
                ${partnerHtml}
                <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${partnerInfo.iconEmoji} ${place.name}</div>
                <div style="font-size:11px;color:#94A3B8;margin-bottom:6px;">${place.formatted_address || place.vicinity || ''}</div>
                ${ratingHtml}
                <button id="btnPromoMarkerAddToRoute" style="background:#E31837;color:white;border:none;padding:6px 12px;font-size:11px;font-weight:700;border-radius:4px;cursor:pointer;width:100%;transition:background 0.2s;">Rotaya Ekle</button>
              `;

              contentDiv.querySelector('#btnPromoMarkerAddToRoute').addEventListener('click', () => {
                THY.addWaypoint(lat, lng, place.name);
                THY.toast(`"${place.name}" rotaya eklendi!`, 'success');
                infoWindow.close();
              });

              infoWindow.setContent(contentDiv);
              infoWindow.open(map, marker);
            });

            partnerPromoMarkers.push(marker);
          });
        }
      });
    });
  }

  // ---- Waypoint Management (Firestore Operations) ----
  THY.addWaypoint = (lat, lng, name, note = '') => {
    if (typeof THY.playSplitFlapSound === 'function') {
      THY.playSplitFlapSound(4);
    }
    
    const targetDay = THY.activeDay === 0 ? THY.maxDays : (THY.activeDay || 1);
    
    // Find how many waypoints are already in this day to make a friendly default label
    const dayWpCount = THY.waypoints.filter(wp => (wp.day || 1) === targetDay).length;
    const defaultName = `Nokta ${dayWpCount + 1}`;

    const wp = { 
      lat, 
      lng, 
      name: name || defaultName, 
      note: note || '',
      day: targetDay
    };
    const updated = [...THY.waypoints, wp];
    THY.updateTripInFirestore({ waypoints: updated });
  };

  THY.removeWaypoint = (index) => {
    if (typeof THY.playSplitFlapSound === 'function') {
      THY.playSplitFlapSound(6);
    }
    const updated = [...THY.waypoints];
    updated.splice(index, 1);
    THY.updateTripInFirestore({ waypoints: updated });
  };

  THY.clearRoute = () => {
    if (typeof THY.playSplitFlapSound === 'function') {
      THY.playSplitFlapSound(8);
    }
    if (THY.activeDay === 0) {
      // Clear entire trip
      THY.updateTripInFirestore({ waypoints: [] });
    } else {
      // Delete waypoints of active day only, keeping other days intact
      const updated = THY.waypoints.filter(wp => (wp.day || 1) !== THY.activeDay);
      THY.updateTripInFirestore({ waypoints: updated });
    }
  };

  // ---- Centralized Collaborative State Renderer ----
  let firstRenderDone = false;

  THY.resetFirstRender = () => {
    firstRenderDone = false;
  };

  function getContrastColor(hex) {
    if (!hex) return '#FFFFFF';
    const color = hex.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 150) ? '#0F2C59' : '#FFFFFF';
  }

  THY.renderTripState = (data, fitBounds = false) => {
    // 1. Clear old markers
    waypointMarkers.forEach(m => m.setMap(null));
    waypointMarkers = [];

    // 2. Hydrate local waypoints
    THY.waypoints = data.waypoints || [];
    THY.waypoints.forEach(wp => {
      if (!wp.day) wp.day = 1;
    });

    // Keep track of index per day for marker labels
    const dayIndexCounters = {};

    // 3. Create new markers (only show the active day's markers, or all if activeDay is 0)
    THY.waypoints.forEach((wp, idx) => {
      const wpDay = wp.day || 1;
      if (!dayIndexCounters[wpDay]) {
        dayIndexCounters[wpDay] = 0;
      }
      dayIndexCounters[wpDay]++;
      const dailyIdx = dayIndexCounters[wpDay];

      // Filter markers by activeDay
      if (THY.activeDay !== 0 && wpDay !== THY.activeDay) {
        return;
      }

      const lat = wp.lat;
      const lng = wp.lng;
      const dayColor = THY.dayColors[(wpDay - 1) % THY.dayColors.length] || '#E31837';

      const isPartner = THY.showPartners && getPartnerMatch(wp.name, wp.place_id);
      const markerIcon = isPartner ? createPartnerIcon() : createWaypointIcon(dailyIdx, dayColor);

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        icon: markerIcon,
        title: wp.name,
        zIndex: isPartner ? 150 : 100
      });

      marker.addListener('click', () => {
        const currentWp = THY.waypoints[idx] || wp;
        const noteHtml = currentWp.note ? `<div style="font-size:11px;color:#C8A951;margin-bottom:6px;font-style:italic;">📝 ${currentWp.note}</div>` : '';
        
        let partnerHtml = '';
        const wpPartner = getPartnerMatch(currentWp.name, currentWp.place_id);
        if (wpPartner && THY.showPartners) {
          partnerHtml = `
            <div style="background: linear-gradient(135deg, #E31837 0%, #B01026 100%); color: white; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(227,24,55,0.3); max-width: 220px; white-space: normal;">
              <span>✈️ THY Partner Avantajı:</span>
              <span style="font-weight: 500;">${wpPartner.offer}</span>
            </div>
          `;
        }

        infoWindow.setContent(`
          <div style="background:#1A2235;color:#F1F5F9;padding:10px 14px;border-radius:8px;font-family:Inter,sans-serif;min-width:140px;">
            ${partnerHtml}
            <div style="font-weight:700;font-size:13px;margin-bottom:4px;">📍 ${currentWp.name} (${wpDay}. Gün)</div>
            ${noteHtml}
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#94A3B8;">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
          </div>
        `);
        infoWindow.open(map, marker);
      });

      waypointMarkers.push(marker);
    });

    // 4. Fit map bounds on first load or when user explicitly switched day
    if ((fitBounds || !firstRenderDone) && waypointMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      waypointMarkers.forEach(m => bounds.extend(m.getPosition()));
      map.fitBounds(bounds);

      // Prevent zooming in too close
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) map.setZoom(15);
        google.maps.event.removeListener(listener);
      });
      firstRenderDone = true;
    } else if (!firstRenderDone && THY.waypoints.length > 0) {
      // Fallback center for first load if no markers were visible
      const firstWp = THY.waypoints[0];
      map.setCenter(new google.maps.LatLng(firstWp.lat, firstWp.lng));
      map.setZoom(13);
      firstRenderDone = true;
    }

    // 5. Update local polyline and UI lists
    updatePolyline();
    updateWaypointUI();
    if (typeof THY.updateEmailPreview === 'function') {
      THY.updateEmailPreview();
    }
  };

  // ---- Polyline ----
  let routePolylines = [];
  let globalRoutePolyline = null;

  function updatePolyline() {
    // Clear old polylines
    routePolylines.forEach(p => p.setMap(null));
    routePolylines = [];

    if (globalRoutePolyline) {
      globalRoutePolyline.setMap(null);
      globalRoutePolyline = null;
    }

    if (THY.waypoints.length < 2) return;

    // 1. Draw global dashed background line (only in Tam Rota mode)
    if (THY.activeDay === 0) {
      const globalPath = THY.waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng }));
      globalRoutePolyline = new google.maps.Polyline({
        path: globalPath,
        geodesic: true,
        strokeColor: '#94A3B8',
        strokeOpacity: 0,
        icons: [{
          icon: {
            path: 'M 0,-1 0,1',
            strokeOpacity: 0.5,
            scale: 2,
            strokeColor: '#94A3B8',
            strokeWeight: 2
          },
          offset: '0',
          repeat: '12px'
        }],
        map: map
      });
    }

    // 2. Group waypoints by day
    const waypointsByDay = {};
    THY.waypoints.forEach(wp => {
      const d = wp.day || 1;
      if (!waypointsByDay[d]) {
        waypointsByDay[d] = [];
      }
      waypointsByDay[d].push(wp);
    });

    // Draw a polyline for each day
    Object.keys(waypointsByDay).forEach(dStr => {
      const dayNum = parseInt(dStr);
      
      // Filter by activeDay
      if (THY.activeDay !== 0 && dayNum !== THY.activeDay) {
        return;
      }

      const dayWps = waypointsByDay[dayNum];
      if (dayWps.length < 2) return;

      const path = dayWps.map(wp => ({ lat: wp.lat, lng: wp.lng }));
      const color = THY.dayColors[(dayNum - 1) % THY.dayColors.length] || '#E31837';

      const polyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 0.9,
        strokeWeight: 3.5,
        icons: [{
          icon: {
            path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
            scale: 2.5,
            strokeColor: '#FFFFFF',
            strokeWeight: 1.5
          },
          offset: '50%',
          repeat: '100px'
        }],
        map: map
      });

      routePolylines.push(polyline);
    });
  }

  // ---- Waypoint UI ----
  function updateWaypointUI() {
    const list = document.getElementById('waypointList');
    if (!list) return;

    list.innerHTML = '';

    const showAll = (THY.activeDay === 0);

    // Filter waypoints for active selection
    const activeWaypoints = THY.waypoints
      .map((wp, originalIndex) => ({ ...wp, originalIndex }))
      .filter(wp => showAll || (wp.day || 1) === (THY.activeDay || 1));

    if (activeWaypoints.length === 0) {
      const titleText = showAll ? 'Rota Boş' : `${THY.activeDay || 1}. Gün Boş`;
      const emptyText = showAll 
        ? 'Haritaya tıklayarak veya "Rota Çiz" modunda ekleyebilirsiniz.' 
        : 'Bu güne henüz rota noktası eklenmemiş. Haritaya tıklayarak veya "Rota Çiz" modunda ekleyebilirsiniz.';
      list.innerHTML = `
        <div class="empty-state" id="emptyRouteState">
          <div class="empty-state__icon">📅</div>
          <div class="empty-state__title">${titleText}</div>
          <div class="empty-state__text">${emptyText}</div>
        </div>
      `;
      return;
    }

    activeWaypoints.forEach((wp, i) => {
      const wpColor = THY.dayColors[((wp.day || 1) - 1) % THY.dayColors.length] || '#E31837';

      // Connector
      if (i > 0) {
        const connector = document.createElement('div');
        connector.className = 'waypoint-connector';
        
        let connColor = wpColor;
        if (showAll) {
          const prevWp = activeWaypoints[i - 1];
          if (prevWp.day !== wp.day) {
            connColor = '#94A3B8'; // gray for cross-day connections
          } else {
            connColor = THY.dayColors[((wp.day || 1) - 1) % THY.dayColors.length] || '#E31837';
          }
        }
        
        connector.style.backgroundColor = connColor;
        list.appendChild(connector);
      }

      const item = document.createElement('div');
      item.className = 'waypoint-item';
      
      let dayBadgeHtml = '';
      if (showAll) {
        const contrastColor = getContrastColor(wpColor);
        dayBadgeHtml = `<span style="font-size: 10px; padding: 2px 6px; background: ${wpColor}; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: ${contrastColor}; font-weight: 700; margin-left: 6px; display: inline-block; vertical-align: middle;">${wp.day}. Gün</span>`;
      }

      item.innerHTML = `
        <div class="waypoint-marker" style="background-color: ${wpColor}">${i + 1}</div>
        <div class="waypoint-info">
          <div class="waypoint-name">${wp.name} ${dayBadgeHtml}</div>
          ${wp.note ? `<div class="waypoint-note" style="color: var(--thy-gold-light)">📝 Not: ${wp.note}</div>` : ''}
          <div class="waypoint-coords">${wp.lat.toFixed(5)}, ${wp.lng.toFixed(5)}</div>
        </div>
        <div class="waypoint-actions" style="display: flex; gap: 6px; align-items: center;">
          <button class="waypoint-note-btn" data-index="${wp.originalIndex}" title="Not Ekle/Düzenle">📝</button>
          <button class="waypoint-remove" data-index="${wp.originalIndex}" title="Kaldır">✕</button>
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
        fields: ['name', 'geometry', 'vicinity', 'rating', 'user_ratings_total', 'photos']
      };

      placesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          const ratingHtml = place.rating 
            ? `<div style="color:#C8A951;font-size:12px;margin-bottom:6px;">${renderStars(place.rating)} ${place.rating} (${place.user_ratings_total || 0})</div>` 
            : '';

          let photoHtml = '';
          if (place.photos && place.photos.length > 0) {
            const photoUrl = place.photos[0].getUrl({ maxWidth: 240, maxHeight: 120 });
            photoHtml = `<img src="${photoUrl}" style="width:100%;height:100px;object-fit:cover;border-radius:6px;margin-bottom:8px;box-shadow:0 2px 4px rgba(0,0,0,0.3);" alt="${place.name}">`;
          }

          // Custom InfoWindow container element
          const contentDiv = document.createElement('div');
          contentDiv.style.background = '#1A2235';
          contentDiv.style.color = '#F1F5F9';
          contentDiv.style.padding = '10px 14px';
          contentDiv.style.borderRadius = '8px';
          contentDiv.style.fontFamily = 'Inter,sans-serif';
          contentDiv.style.minWidth = '180px';
          contentDiv.innerHTML = `
            ${photoHtml}
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

  THY.reRenderPlaceMarkers = () => {
    displayPlaces(lastSearchResults);
  };

  function displayPlaces(places) {
    lastSearchResults = places || [];
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

      // Check for partner match
      const placePartner = THY.showPartners ? getPartnerMatch(place.name, place.place_id) : null;
      let cardStyle = '';
      let partnerBadge = '';
      if (placePartner) {
        cardStyle = 'border: 1px solid rgba(227, 24, 55, 0.4); background: rgba(227, 24, 55, 0.03);';
        partnerBadge = `<span style="font-size: 9px; padding: 2px 6px; background: #E31837; border-radius: 4px; color: white; font-weight: 700; margin-left: 6px; display: inline-block; vertical-align: middle;">✈️ Partner</span>`;
      }

      // Card
      const card = document.createElement('div');
      card.className = 'place-card';
      if (cardStyle) {
        card.style = cardStyle;
      }
      card.innerHTML = `
        <div class="place-icon">${emoji}</div>
        <div class="place-info">
          <div class="place-name">${place.name} ${partnerBadge}</div>
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
      const isPartner = THY.showPartners && getPartnerMatch(place.name, place.place_id);
      const markerIcon = isPartner ? createPartnerIcon() : createPlaceIcon(emoji);

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        icon: markerIcon,
        title: place.name,
        zIndex: isPartner ? 150 : 50
      });

      marker.addListener('click', () => {
        let photoHtml = '';
        if (place.photos && place.photos.length > 0) {
          const photoUrl = place.photos[0].getUrl({ maxWidth: 240, maxHeight: 120 });
          photoHtml = `<img src="${photoUrl}" style="width:100%;height:100px;object-fit:cover;border-radius:6px;margin-bottom:8px;box-shadow:0 2px 4px rgba(0,0,0,0.3);" alt="${place.name}">`;
        }

        const ratingHtml = place.rating 
          ? `<div style="color:#C8A951;font-size:12px;margin-bottom:6px;">${renderStars(place.rating)} ${place.rating} (${place.user_ratings_total || 0})</div>` 
          : '';

        // Partner offer html
        let partnerHtml = '';
        const currentPlacePartner = getPartnerMatch(place.name, place.place_id);
        if (currentPlacePartner && THY.showPartners) {
          partnerHtml = `
            <div style="background: linear-gradient(135deg, #E31837 0%, #B01026 100%); color: white; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(227,24,55,0.3); max-width: 220px; white-space: normal;">
              <span>✈️ THY Partner Avantajı:</span>
              <span style="font-weight: 500;">${currentPlacePartner.offer}</span>
            </div>
          `;
        }

        const contentDiv = document.createElement('div');
        contentDiv.style.background = '#1A2235';
        contentDiv.style.color = '#F1F5F9';
        contentDiv.style.padding = '10px 14px';
        contentDiv.style.borderRadius = '8px';
        contentDiv.style.fontFamily = 'Inter,sans-serif';
        contentDiv.style.minWidth = '180px';
        contentDiv.innerHTML = `
          ${photoHtml}
          ${partnerHtml}
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${emoji} ${place.name}</div>
          <div style="font-size:11px;color:#94A3B8;margin-bottom:6px;">${place.vicinity || ''}</div>
          ${ratingHtml}
          <button id="btnPlaceMarkerAddToRoute" style="background:#E31837;color:white;border:none;padding:6px 12px;font-size:11px;font-weight:700;border-radius:4px;cursor:pointer;width:100%;transition:background 0.2s;">Rotaya Ekle</button>
        `;

        contentDiv.querySelector('#btnPlaceMarkerAddToRoute').addEventListener('click', () => {
          THY.addWaypoint(lat, lng, place.name);
          THY.toast(`"${place.name}" rotaya eklendi!`, 'success');
          infoWindow.close();
        });

        infoWindow.setContent(contentDiv);
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
    const center = customCenter || map.getCenter();
    if (!center) {
      THY.toast('Harita merkezi alınamadı.', 'error');
      return;
    }

    if (type === 'local') {
      const request = {
        location: center,
        radius: 12000, // 12km search radius
        query: 'local favorite restaurant cafe hidden gem authentic'
      };

      placesService.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          // Filter: Rating >= 4.3, reviews between 25 and 900 to find "hidden gems" preferred by locals
          const localSpots = results.filter(place => {
            const rating = place.rating || 0;
            const reviews = place.user_ratings_total || 0;
            return rating >= 4.3 && reviews >= 25 && reviews <= 900;
          });
          const finalResults = localSpots.length > 0 ? localSpots : results;
          displayPlaces(finalResults);
        } else {
          displayPlaces([]);
          THY.toast('Bu bölgede yerel lezzet yok.', 'info');
        }
      });
      return;
    }

    const request = {
      location: center,
      radius: 8000, // Increased default search radius to 8km
      type: type
    };

    THY.toast(`${type} aranıyor...`, 'info');

    placesService.nearbySearch(request, (results, status) => {
      console.log('Nearby Search Status:', status, 'Results:', results);
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        displayPlaces(results);
        THY.toast(`${results.length} yer bulundu!`, 'success');
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        // Fallback: If 8km returned nothing, try 30km radius (wider city limits)
        if (request.radius < 30000) {
          console.log('Zero results for radius 8km, retrying with radius 30km...');
          request.radius = 30000;
          placesService.nearbySearch(request, (fallbackResults, fallbackStatus) => {
            if (fallbackStatus === google.maps.places.PlacesServiceStatus.OK) {
              displayPlaces(fallbackResults);
              THY.toast(`${fallbackResults.length} yer bulundu! (30km yarıçapında)`, 'success');
            } else {
              displayPlaces([]);
              THY.toast('Bu bölgede eşleşen yer bulunamadı.', 'info');
            }
          });
        } else {
          displayPlaces([]);
          THY.toast('Bu bölgede eşleşen yer bulunamadı.', 'info');
        }
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
      radius: 25000 // Increased default bias radius to 25km
    };

    THY.toast(`"${query}" aranıyor...`, 'info');

    placesService.textSearch(request, (results, status) => {
      console.log('Text Search Status:', status, 'Results:', results);
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        displayPlaces(results);
        THY.toast(`${results.length} sonuç bulundu!`, 'success');
      } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS && request.location) {
        // Fallback: Retry globally without location/radius constraints (in case they search for another city/country)
        console.log('Zero results near map center. Retrying globally...');
        const globalRequest = { query: query };
        placesService.textSearch(globalRequest, (globalResults, globalStatus) => {
          if (globalStatus === google.maps.places.PlacesServiceStatus.OK) {
            displayPlaces(globalResults);
            THY.toast(`${globalResults.length} sonuç bulundu! (Küresel arama)`, 'success');
          } else {
            displayPlaces([]);
            THY.toast('Bu bölgede veya küresel olarak eşleşen yer bulunamadı.', 'info');
          }
        });
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
    if (typeof THY.playSplitFlapSound === 'function') {
      THY.playSplitFlapSound(15);
    }
    
    // Set local states
    THY.maxDays = days;
    THY.activeDay = 0; // Default to Tam Rota view so they see the entire trip first!
    if (typeof THY.updateDayTabs === 'function') {
      THY.updateDayTabs();
    }

    // Helper for smart distribution
    function distributeWaypointsCount(W, D) {
      const counts = new Array(D).fill(0);
      if (W <= 0) return counts;
      if (W <= D) {
        for (let i = 0; i < W; i++) {
          counts[i] = 1;
        }
        return counts;
      }

      const weights = [];
      if (D === 2) {
        weights.push(0.6, 0.4);
      } else if (D === 3) {
        weights.push(0.4, 0.4, 0.2);
      } else if (D === 4) {
        weights.push(0.3, 0.4, 0.2, 0.1);
      } else {
        weights.push(0.25, 0.35, 0.2, 0.15, 0.05);
        while (weights.length < D) {
          weights.push(0.02);
        }
      }

      const sum = weights.reduce((a,b) => a+b, 0);
      const normWeights = weights.map(w => w / sum);

      for (let d = 0; d < D; d++) {
        counts[d] = 1;
      }

      const remaining = W - D;
      const ideals = normWeights.map(w => w * remaining);
      const floors = ideals.map(v => Math.floor(v));
      let floorSum = floors.reduce((a,b) => a+b, 0);
      
      for (let d = 0; d < D; d++) {
        counts[d] += floors[d];
      }

      let stillRemaining = remaining - floorSum;
      if (stillRemaining > 0) {
        const fractions = ideals.map((v, idx) => ({ idx, frac: v - floors[idx] }));
        fractions.sort((a, b) => b.frac - a.frac);
        for (let i = 0; i < stillRemaining; i++) {
          counts[fractions[i].idx]++;
        }
      }

      return counts;
    }

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
    
    if (sights.length > 0) {
      // 1. Pan map to city center (first sight in sightsDatabase, e.g. Colosseum for Rome) instead of far-away airport
      const destinationCenter = { lat: sights[0].lat, lng: sights[0].lng };
      map.panTo(destinationCenter);
      map.setZoom(13);

      const takeCount = Math.min(sights.length, days * 2);
      THY.toast(`${destAp.city} için ${days} günlük seyahat planı hazırlanıyor...`, 'info');
      
      const dayCounts = distributeWaypointsCount(takeCount, days);
      let currentDay = 1;
      let currentDayAssigned = 0;

      const newWaypoints = sights.slice(0, takeCount).map((s, index) => {
        const wp = {
          lat: s.lat,
          lng: s.lng,
          name: s.name,
          note: '',
          day: currentDay
        };
        currentDayAssigned++;
        if (currentDayAssigned >= dayCounts[currentDay - 1]) {
          currentDay++;
          currentDayAssigned = 0;
        }
        return wp;
      });

      // Batch write auto-itinerary to Firestore
      THY.updateTripInFirestore({ maxDays: days, waypoints: newWaypoints });

      // 2. Automatically update Places tab to search for local places (restaurants) around city center
      setTimeout(() => {
        const activeChip = document.querySelector('.filter-chip.active');
        const type = activeChip?.dataset?.type || 'restaurant';
        THY.searchNearbyPlaces(type, destinationCenter);
      }, 500);

    } else {
      // Dynamic fallback via Google Places Nearby Search around the airport
      THY.toast(`${destAp.city} civarı keşfediliyor...`, 'info');
      
      // Use text search for city name to find city-center attractions (airports are often far from city)
      const textRequest = {
        query: `${destAp.city} tourist attractions`,
        location: { lat: destAp.lat, lng: destAp.lng },
        radius: 50000
      };

      placesService.textSearch(textRequest, (textResults, textStatus) => {
        const results = (textStatus === google.maps.places.PlacesServiceStatus.OK && textResults && textResults.length > 0)
          ? textResults
          : null;

        // If text search failed, fallback to nearby search with large radius
        if (!results) {
          const nearbyRequest = {
            location: { lat: destAp.lat, lng: destAp.lng },
            radius: 20000,
            type: 'tourist_attraction'
          };
          placesService.nearbySearch(nearbyRequest, (nearbyResults, nearbyStatus) => {
            handleDynamicResults(nearbyResults, nearbyStatus);
          });
          return;
        }

        handleDynamicResults(results, textStatus);
      });

      function handleDynamicResults(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          // Pan to first tourist attraction found
          const firstLoc = results[0].geometry.location;
          const dynamicCenter = { lat: firstLoc.lat(), lng: firstLoc.lng() };
          map.panTo(dynamicCenter);
          map.setZoom(13);

          const takeCount = Math.min(results.length, days * 2);
          const dayCounts = distributeWaypointsCount(takeCount, days);
          let currentDay = 1;
          let currentDayAssigned = 0;

          const newWaypoints = results.slice(0, takeCount).map((place, index) => {
            const loc = place.geometry.location;
            const wp = {
              lat: loc.lat(),
              lng: loc.lng(),
              name: place.name,
              note: '',
              day: currentDay
            };
            currentDayAssigned++;
            if (currentDayAssigned >= dayCounts[currentDay - 1]) {
              currentDay++;
              currentDayAssigned = 0;
            }
            return wp;
          });

          // Batch write auto-itinerary waypoints to Firestore
          THY.updateTripInFirestore({ maxDays: days, waypoints: newWaypoints });

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
          
          THY.updateTripInFirestore({
            maxDays: days,
            waypoints: [{
              lat: destAp.lat,
              lng: destAp.lng,
              name: `${destAp.city} Havalimanı`,
              note: '',
              day: 1
            }]
          });

          // Update Places tab around the airport
          setTimeout(() => {
            const activeChip = document.querySelector('.filter-chip.active');
            const type = activeChip?.dataset?.type || 'restaurant';
            THY.searchNearbyPlaces(type, { lat: destAp.lat, lng: destAp.lng });
          }, 500);
        }
      }
    }
  };

  // ---- Initial Places Load & Firebase Hydration Trigger ----
  // If we are not joining a shared trip, load default places around current map center (Tokyo)
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.get('tripId')) {
    setTimeout(() => {
      THY.searchNearbyPlaces('restaurant');
    }, 1500);
  }

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
      const updated = [...THY.waypoints];
      updated[activeNoteIndex].note = noteTxt.value.trim();
      THY.updateTripInFirestore({ waypoints: updated });
    }
    closeNoteModal();
  });

  document.getElementById('btnDeleteNote')?.addEventListener('click', () => {
    if (activeNoteIndex !== null && activeNoteIndex >= 0 && activeNoteIndex < THY.waypoints.length) {
      const updated = [...THY.waypoints];
      updated[activeNoteIndex].note = '';
      THY.updateTripInFirestore({ waypoints: updated });
    }
    closeNoteModal();
  });

  // ---- Flag Map Engine as Ready & Hydrate buffered sync data ----
  THY.mapReady = true;
  if (THY.pendingSyncData) {
    console.log("⚙️ Map ready! Hydrating buffered Firestore updates.");
    THY.renderTripState(THY.pendingSyncData);
    delete THY.pendingSyncData;
  }

  console.log('🗺️ THY Route Map Engine initialized — Real-time Firestore sync active');
}

// ---- DYNAMIC GOOGLE MAPS API LOADER ----
async function loadGoogleMapsScript() {
  try {
    const res = await fetch('/api/maps-key');
    if (!res.ok) {
      throw new Error(`Maps key API returned ${res.status}`);
    }
    const data = await res.json();
    const key = data.key || 'AIzaSyCTFajPJSFiTgXvDdK5AKp6aMwjrRRGhCg';
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    console.log("🗺️ Google Maps API script loaded dynamically from backend key.");
  } catch (err) {
    console.error("❌ Failed to fetch dynamically. Loading static fallback key:", err);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCTFajPJSFiTgXvDdK5AKp6aMwjrRRGhCg&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}

// Trigger Google Maps dynamic loading now that all JS functions are declared
loadGoogleMapsScript();
