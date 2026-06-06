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

              const isEn = THY.currentLanguage === 'en';
              const partnerHtml = `
                <div style="background: linear-gradient(135deg, #E31837 0%, #B01026 100%); color: white; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(227,24,55,0.3); max-width: 220px; white-space: normal;">
                  <span>✈️ ${isEn ? 'THY Partner Offer' : 'THY Partner Avantajı'}:</span>
                  <span style="font-weight: 500;">${THY.t(partnerInfo.offer)}</span>
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
                <button id="btnPromoMarkerAddToRoute" style="background:#E31837;color:white;border:none;padding:6px 12px;font-size:11px;font-weight:700;border-radius:4px;cursor:pointer;width:100%;transition:background 0.2s;">${isEn ? 'Add to Route' : 'Rotaya Ekle'}</button>
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
    const isEn = THY.currentLanguage === 'en';
    const defaultName = isEn ? `Stop ${dayWpCount + 1}` : `Nokta ${dayWpCount + 1}`;

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
        
        const isEn = THY.currentLanguage === 'en';
        let partnerHtml = '';
        const wpPartner = getPartnerMatch(currentWp.name, currentWp.place_id);
        if (wpPartner && THY.showPartners) {
          partnerHtml = `
            <div style="background: linear-gradient(135deg, #E31837 0%, #B01026 100%); color: white; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 6px rgba(227,24,55,0.3); max-width: 220px; white-space: normal;">
              <span>✈️ ${isEn ? 'THY Partner Offer' : 'THY Partner Avantajı'}:</span>
              <span style="font-weight: 500;">${THY.t(wpPartner.offer)}</span>
            </div>
          `;
        }

        infoWindow.setContent(`
          <div style="background:#1A2235;color:#F1F5F9;padding:10px 14px;border-radius:8px;font-family:Inter,sans-serif;min-width:140px;">
            ${partnerHtml}
            <div style="font-weight:700;font-size:13px;margin-bottom:4px;">📍 ${currentWp.name} (${isEn ? `Day ${wpDay}` : `${wpDay}. Gün`})</div>
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
    list.classList.remove('timeline');

    const showAll = (THY.activeDay === 0);
    const isEn = THY.currentLanguage === 'en';

    // Filter waypoints for active selection
    const activeWaypoints = THY.waypoints
      .map((wp, originalIndex) => ({ ...wp, originalIndex }))
      .filter(wp => showAll || (wp.day || 1) === (THY.activeDay || 1));

    if (activeWaypoints.length === 0) {
      const titleText = isEn 
        ? (showAll ? 'Route is Empty' : `Day ${THY.activeDay || 1} is Empty`)
        : (showAll ? 'Rota Boş' : `${THY.activeDay || 1}. Gün Boş`);
      const emptyText = isEn
        ? (showAll 
            ? 'You can add points by clicking on the map or activating "Draw Route" mode.' 
            : 'No route stops added to this day yet. You can add points by clicking on the map or activating "Draw Route" mode.')
        : (showAll 
            ? 'Haritaya tıklayarak veya "Rota Çiz" modunda ekleyebilirsiniz.' 
            : 'Bu güne henüz rota noktası eklenmemiş. Haritaya tıklayarak veya "Rota Çiz" modunda ekleyebilirsiniz.');
      list.innerHTML = `
        <div class="empty-state" id="emptyRouteState">
          <div class="empty-state__icon">📅</div>
          <div class="empty-state__title">${titleText}</div>
          <div class="empty-state__text">${emptyText}</div>
        </div>
      `;
      return;
    }

    list.classList.add('timeline');
    let lastRenderedDay = null;

    activeWaypoints.forEach((wp, i) => {
      const wpDay   = wp.day || 1;
      const wpColor = THY.dayColors[(wpDay - 1) % THY.dayColors.length] || '#E31837';
      const isLast  = (i === activeWaypoints.length - 1);
      const isFlight = wp.type === 'flight'; // Domestic / international connecting flight

      // ── Day separator (Tam Rota view only, on day change) ──────────
      if (showAll && wpDay !== lastRenderedDay) {
        lastRenderedDay = wpDay;
        const sep = document.createElement('div');
        sep.className = 'timeline-day-sep';
        const dayLabel = isEn ? `Day ${wpDay}` : `${wpDay}. Gün`;
        sep.innerHTML = `
          <div class="timeline-day-sep__line"></div>
          <span class="timeline-day-sep__label" style="border-color:${wpColor}55;color:${wpColor};">${dayLabel}</span>
          <div class="timeline-day-sep__line"></div>
        `;
        list.appendChild(sep);
      }

      // ── Day badge (inside card, only in showAll mode) ──────────────
      let dayBadgeHtml = '';
      if (showAll && !isFlight) {
        const contrastColor = getContrastColor(wpColor);
        dayBadgeHtml = `<span class="timeline-day-badge" style="background:${wpColor};color:${contrastColor};">${isEn ? `Day ${wpDay}` : `${wpDay}. Gün`}</span>`;
      }

      // ── Rail: gray-dashed on cross-day boundary ────────────────────
      const nextWp     = activeWaypoints[i + 1];
      const isCrossDay = showAll && nextWp && (nextWp.day || 1) !== wpDay;
      const railColor  = isFlight ? '#0053A5' : (isCrossDay ? '#475569' : wpColor);

      // ── Build timeline item ────────────────────────────────────────
      const item = document.createElement('div');
      item.className = `timeline-item${isFlight ? ' flight-leg' : ''}`;
      item.style.animationDelay = `${i * 55}ms`;

      if (isFlight) {
        // ── FLIGHT LEG CARD (Boarding Pass Style) ───────────────────
        const fromCode = (wp.from || 'IST').toUpperCase().substring(0, 3);
        const toCode   = (wp.to   || 'DST').toUpperCase().substring(0, 3);
        const flightNo = wp.flightNumber || 'TK';
        const flightLabel = isEn ? 'DOMESTIC FLIGHT' : 'İÇ HAT UÇUŞU';
        item.innerHTML = `
          <div class="timeline-left">
            <div class="timeline-node"
                 style="background: radial-gradient(circle at 38% 32%, #0053A5ee, #0053A599);
                        box-shadow: 0 0 14px #0053A555, inset 0 1px 0 rgba(255,255,255,0.18);
                        font-size:10px;">
              ✈
            </div>
            ${!isLast ? `<div class="timeline-rail${isCrossDay ? ' cross-day' : ''}"
                 style="background: linear-gradient(180deg, ${railColor}bb 0%, ${railColor}22 100%);"></div>` : ''}
          </div>
          <div class="timeline-card">
            <div class="flight-leg-card">
              <div class="flight-leg-airports">
                <span class="flight-leg-iata">${fromCode}</span>
                <div class="flight-leg-arrow">
                  <div class="flight-leg-arrow-line"></div>
                  <div class="flight-leg-label">${flightLabel}</div>
                </div>
                <span class="flight-leg-iata dest">${toCode}</span>
              </div>
              <span class="flight-leg-badge">${flightNo}</span>
            </div>
            <div class="waypoint-actions" style="display:flex;gap:6px;align-items:center;margin-top:6px;">
              <button class="waypoint-remove" data-index="${wp.originalIndex}" title="${isEn ? 'Remove' : 'Kaldır'}" style="margin-left:auto;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
        `;
      } else {
        // ── REGULAR WAYPOINT CARD ────────────────────────────────────
        // Transit navigation links
        let transitHtml = '';
        if (i > 0) {
          const prevWp = activeWaypoints[i - 1];
          if (!prevWp.type || prevWp.type !== 'flight') {
            const gMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${prevWp.lat},${prevWp.lng}&destination=${wp.lat},${wp.lng}&travelmode=transit`;
            const aMapsUrl = `https://maps.apple.com/?saddr=${prevWp.lat},${prevWp.lng}&daddr=${wp.lat},${wp.lng}&dirflg=r`;
            const yMapsUrl = `https://yandex.com/maps/?rtext=${prevWp.lat},${prevWp.lng}~${wp.lat},${wp.lng}&rtt=mt`;
            transitHtml = `
              <div class="waypoint-card-transit">
                <span class="transit-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                  ${isEn ? 'NAVIGATE:' : 'ULAŞIM:'}
                </span>
                <div class="transit-links">
                  <a href="${gMapsUrl}" target="_blank" class="transit-link google">Google</a>
                  <a href="${aMapsUrl}" target="_blank" class="transit-link apple">Apple</a>
                  <a href="${yMapsUrl}" target="_blank" class="transit-link yandex">Yandex</a>
                </div>
              </div>
            `;
          }
        }

        item.innerHTML = `
          <div class="timeline-left">
            <div class="timeline-node"
                 style="background: radial-gradient(circle at 38% 32%, ${wpColor}ee, ${wpColor}99);
                        box-shadow: 0 0 14px ${wpColor}55, inset 0 1px 0 rgba(255,255,255,0.18);">
              ${i + 1}
            </div>
            ${!isLast ? `<div class="timeline-rail${isCrossDay ? ' cross-day' : ''}"
                 style="background: linear-gradient(180deg, ${railColor}bb 0%, ${railColor}22 100%);"></div>` : ''}
          </div>
          <div class="timeline-card">
            <div class="timeline-card__header">
              <div class="waypoint-name">${wp.name}</div>
              ${dayBadgeHtml}
            </div>
            ${wp.note ? `
              <div class="waypoint-note">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="note-svg-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <span>${wp.note}</span>
              </div>` : ''}
            <div class="waypoint-coords">${wp.lat.toFixed(5)}, ${wp.lng.toFixed(5)}</div>
            ${transitHtml}
            <div class="waypoint-actions" style="display: flex; gap: 6px; align-items: center;">
              <button class="waypoint-note-btn" data-index="${wp.originalIndex}" title="${isEn ? 'Add/Edit Note' : 'Not Ekle/Düzenle'}">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path></svg>
              </button>
              <button class="waypoint-remove" data-index="${wp.originalIndex}" title="${isEn ? 'Remove' : 'Kaldır'}">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
        `;

        const card = item.querySelector('.timeline-card');
        card.addEventListener('click', (e) => {
          if (!e.target.closest('.waypoint-note-btn') && !e.target.closest('.waypoint-remove') && !e.target.closest('.transit-link')) {
            card.classList.toggle('active-tap');
          }
        });
      }

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

  // ── Auto City-Split / Domestic Flights ──────────────────────────
  (function initAutoCitySplit() {
    const btnOpen = document.getElementById('btnCitySplit');
    if (!btnOpen) return;

    // City segments per country — keyed by country name from AIRPORTS
    const countrySegments = {
      'Türkiye': [
        { code: 'IST', city: 'İstanbul', lat: 41.0082, lng: 28.9784, sights: [
          { name: 'Ayasofya', lat: 41.0086, lng: 28.9802 },
          { name: 'Topkapı Sarayı', lat: 41.0115, lng: 28.9833 },
          { name: 'Sultanahmet Camii', lat: 41.0054, lng: 28.9768 },
          { name: 'Kapalıçarşı', lat: 41.0107, lng: 28.9680 },
          { name: 'Galata Kulesi', lat: 41.0256, lng: 28.9741 },
          { name: 'Dolmabahçe Sarayı', lat: 41.0391, lng: 29.0005 },
          { name: 'Kız Kulesi Sahili', lat: 41.0210, lng: 29.0041 },
          { name: 'Balat Mahallesi', lat: 41.0292, lng: 28.9476 }
        ]},
        { code: 'AYT', city: 'Antalya', lat: 36.8969, lng: 30.7133, sights: [
          { name: 'Kaleiçi', lat: 36.8841, lng: 30.7056 },
          { name: 'Düden Şelalesi', lat: 36.8617, lng: 30.7419 },
          { name: 'Konyaaltı Plajı', lat: 36.8680, lng: 30.6380 },
          { name: 'Antalya Müzesi', lat: 36.8795, lng: 30.6722 },
          { name: 'Perge Antik Kenti', lat: 36.9611, lng: 30.8540 },
          { name: 'Aspendos', lat: 36.9389, lng: 31.1725 }
        ]},
        { code: 'ESB', city: 'Ankara', lat: 39.9334, lng: 32.8597, sights: [
          { name: 'Anıtkabir', lat: 39.9255, lng: 32.8369 },
          { name: 'Ankara Kalesi', lat: 39.9408, lng: 32.8639 },
          { name: 'Anadolu Medeniyetleri Müzesi', lat: 39.9378, lng: 32.8594 },
          { name: 'Kocatepe Camii', lat: 39.9200, lng: 32.8586 },
          { name: 'Gençlik Parkı', lat: 39.9346, lng: 32.8490 }
        ]},
        { code: 'ADB', city: 'İzmir', lat: 38.4192, lng: 27.1287, sights: [
          { name: 'Saat Kulesi (Konak)', lat: 38.4186, lng: 27.1286 },
          { name: 'Kemeraltı Çarşısı', lat: 38.4199, lng: 27.1318 },
          { name: 'Kordon Boyu', lat: 38.4350, lng: 27.1440 },
          { name: 'Asansör', lat: 38.4131, lng: 27.1330 },
          { name: 'Efes Antik Kenti', lat: 37.9395, lng: 27.3417 },
          { name: 'Alaçatı', lat: 38.2807, lng: 26.3756 }
        ]},
        { code: 'NAV', city: 'Kapadokya', lat: 38.6431, lng: 34.8289, sights: [
          { name: 'Göreme Açık Hava Müzesi', lat: 38.6431, lng: 34.8289 },
          { name: 'Uçhisar Kalesi', lat: 38.6281, lng: 34.8056 },
          { name: 'Derinkuyu Yeraltı Şehri', lat: 38.3741, lng: 34.7344 },
          { name: 'Paşabağ Peribacaları', lat: 38.6550, lng: 34.8538 }
        ]},
        { code: 'TZX', city: 'Trabzon', lat: 41.0027, lng: 39.7168, sights: [
          { name: 'Sümela Manastırı', lat: 40.6917, lng: 39.6592 },
          { name: 'Uzungöl', lat: 40.6203, lng: 40.2914 },
          { name: 'Atatürk Köşkü', lat: 41.0047, lng: 39.7363 },
          { name: 'Trabzon Kalesi', lat: 41.0020, lng: 39.7201 }
        ]},
        { code: 'BJV', city: 'Bodrum', lat: 37.0344, lng: 27.4305, sights: [
          { name: 'Bodrum Kalesi', lat: 37.0316, lng: 27.4305 },
          { name: 'Sualtı Arkeoloji Müzesi', lat: 37.0320, lng: 27.4310 },
          { name: 'Gümbet Plajı', lat: 37.0318, lng: 27.4083 }
        ]},
        { code: 'GZT', city: 'Gaziantep', lat: 37.0662, lng: 37.3833, sights: [
          { name: 'Zeugma Mozaik Müzesi', lat: 37.0698, lng: 37.3837 },
          { name: 'Gaziantep Kalesi', lat: 37.0620, lng: 37.3750 },
          { name: 'Bakırcılar Çarşısı', lat: 37.0600, lng: 37.3730 }
        ]}
      ],
      'İtalya': [
        { code: 'FCO', city: 'Roma', lat: 41.9028, lng: 12.4964, sights: [
          { name: 'Kolezyum (Colosseum)', lat: 41.8902, lng: 12.4922 },
          { name: 'Trevi Çeşmesi', lat: 41.9009, lng: 12.4833 },
          { name: 'Panteon', lat: 41.8986, lng: 12.4769 },
          { name: 'Vatikan Müzeleri', lat: 41.9070, lng: 12.4535 },
          { name: 'İspanyol Merdivenleri', lat: 41.9060, lng: 12.4828 },
          { name: 'Navona Meydanı', lat: 41.8989, lng: 12.4731 }
        ]},
        { code: 'MXP', city: 'Milano', lat: 45.4642, lng: 9.1900, sights: [
          { name: 'Duomo di Milano', lat: 45.4641, lng: 9.1919 },
          { name: 'Galleria Vittorio Emanuele', lat: 45.4657, lng: 9.1900 },
          { name: 'Sforza Kalesi', lat: 45.4706, lng: 9.1794 },
          { name: 'Santa Maria delle Grazie', lat: 45.4654, lng: 9.1711 },
          { name: 'Navigli Kanalları', lat: 45.4494, lng: 9.1797 }
        ]},
        { code: 'VCE', city: 'Venedik', lat: 45.4408, lng: 12.3155, sights: [
          { name: 'San Marco Meydanı', lat: 45.4343, lng: 12.3388 },
          { name: 'Rialto Köprüsü', lat: 45.4380, lng: 12.3360 },
          { name: 'Doge Sarayı', lat: 45.4337, lng: 12.3401 },
          { name: 'Murano Adası', lat: 45.4586, lng: 12.3528 },
          { name: 'Burano Adası', lat: 45.4853, lng: 12.4167 }
        ]},
        { code: 'NAP', city: 'Napoli', lat: 40.8518, lng: 14.2681, sights: [
          { name: 'Pompeii Antik Kenti', lat: 40.7508, lng: 14.4869 },
          { name: 'Amalfi Kıyısı', lat: 40.6340, lng: 14.6027 },
          { name: 'Napoli Ulusal Arkeoloji Müzesi', lat: 40.8533, lng: 14.2503 },
          { name: 'Castel dell\'Ovo', lat: 40.8283, lng: 14.2478 }
        ]},
        { code: 'BLQ', city: 'Floransa/Bolonya', lat: 43.7696, lng: 11.2558, sights: [
          { name: 'Floransa Duomo', lat: 43.7731, lng: 11.2560 },
          { name: 'Uffizi Galerisi', lat: 43.7677, lng: 11.2553 },
          { name: 'Ponte Vecchio', lat: 43.7680, lng: 11.2531 },
          { name: 'Piazzale Michelangelo', lat: 43.7629, lng: 11.2650 }
        ]}
      ],
      'Fransa': [
        { code: 'CDG', city: 'Paris', lat: 48.8566, lng: 2.3522, sights: [
          { name: 'Eyfel Kulesi', lat: 48.8584, lng: 2.2945 },
          { name: 'Louvre Müzesi', lat: 48.8606, lng: 2.3376 },
          { name: 'Notre Dame', lat: 48.8530, lng: 2.3499 },
          { name: 'Zafer Takı', lat: 48.8738, lng: 2.2950 },
          { name: 'Montmartre', lat: 48.8867, lng: 2.3431 },
          { name: 'Lüksemburg Bahçesi', lat: 48.8462, lng: 2.3372 }
        ]},
        { code: 'NCE', city: 'Nice', lat: 43.7102, lng: 7.2620, sights: [
          { name: 'Promenade des Anglais', lat: 43.6947, lng: 7.2653 },
          { name: 'Vieille Ville (Eski Şehir)', lat: 43.6970, lng: 7.2767 },
          { name: 'Castle Hill', lat: 43.6952, lng: 7.2816 },
          { name: 'Matisse Müzesi', lat: 43.7198, lng: 7.2756 }
        ]},
        { code: 'LYS', city: 'Lyon', lat: 45.7640, lng: 4.8357, sights: [
          { name: 'Fourvière Bazilikası', lat: 45.7623, lng: 4.8225 },
          { name: 'Vieux Lyon', lat: 45.7600, lng: 4.8270 },
          { name: 'Place Bellecour', lat: 45.7578, lng: 4.8320 },
          { name: 'Parc de la Tête d\'Or', lat: 45.7772, lng: 4.8556 }
        ]}
      ],
      'İspanya': [
        { code: 'MAD', city: 'Madrid', lat: 40.4168, lng: -3.7038, sights: [
          { name: 'Prado Müzesi', lat: 40.4138, lng: -3.6921 },
          { name: 'Kraliyet Sarayı', lat: 40.4180, lng: -3.7143 },
          { name: 'Plaza Mayor', lat: 40.4154, lng: -3.7074 },
          { name: 'Retiro Parkı', lat: 40.4153, lng: -3.6845 },
          { name: 'Puerta del Sol', lat: 40.4169, lng: -3.7035 }
        ]},
        { code: 'BCN', city: 'Barselona', lat: 41.3874, lng: 2.1686, sights: [
          { name: 'Sagrada Familia', lat: 41.4036, lng: 2.1744 },
          { name: 'Park Güell', lat: 41.4145, lng: 2.1527 },
          { name: 'La Rambla', lat: 41.3809, lng: 2.1734 },
          { name: 'Casa Batlló', lat: 41.3916, lng: 2.1650 },
          { name: 'Barceloneta Plajı', lat: 41.3784, lng: 2.1924 }
        ]}
      ],
      'İngiltere': [
        { code: 'LHR', city: 'Londra', lat: 51.5074, lng: -0.1278, sights: [
          { name: 'British Museum', lat: 51.5194, lng: -0.1270 },
          { name: 'Tower of London', lat: 51.5081, lng: -0.0759 },
          { name: 'London Eye', lat: 51.5033, lng: -0.1195 },
          { name: 'Buckingham Sarayı', lat: 51.5014, lng: -0.1419 },
          { name: 'Big Ben & Westminster', lat: 51.5007, lng: -0.1246 },
          { name: 'Hyde Park', lat: 51.5073, lng: -0.1657 }
        ]},
        { code: 'MAN', city: 'Manchester', lat: 53.4808, lng: -2.2426, sights: [
          { name: 'Old Trafford', lat: 53.4631, lng: -2.2913 },
          { name: 'Manchester Müzesi', lat: 53.4785, lng: -2.2307 },
          { name: 'Northern Quarter', lat: 53.4848, lng: -2.2340 }
        ]},
        { code: 'EDI', city: 'Edinburgh', lat: 55.9533, lng: -3.1883, sights: [
          { name: 'Edinburgh Kalesi', lat: 55.9486, lng: -3.1999 },
          { name: 'Royal Mile', lat: 55.9505, lng: -3.1883 },
          { name: 'Arthur\'s Seat', lat: 55.9441, lng: -3.1618 },
          { name: 'Calton Hill', lat: 55.9553, lng: -3.1822 }
        ]}
      ],
      'Almanya': [
        { code: 'BER', city: 'Berlin', lat: 52.5200, lng: 13.4050, sights: [
          { name: 'Brandenburg Kapısı', lat: 52.5163, lng: 13.3777 },
          { name: 'Berlin Duvarı Anıtı', lat: 52.5352, lng: 13.3900 },
          { name: 'Müze Adası', lat: 52.5210, lng: 13.3965 },
          { name: 'Reichstag', lat: 52.5186, lng: 13.3762 },
          { name: 'Checkpoint Charlie', lat: 52.5076, lng: 13.3904 }
        ]},
        { code: 'MUC', city: 'Münih', lat: 48.1351, lng: 11.5820, sights: [
          { name: 'Marienplatz', lat: 48.1374, lng: 11.5755 },
          { name: 'Nymphenburg Sarayı', lat: 48.1583, lng: 11.5033 },
          { name: 'İngiliz Bahçesi', lat: 48.1642, lng: 11.6053 },
          { name: 'BMW Müzesi', lat: 48.1770, lng: 11.5594 }
        ]},
        { code: 'FRA', city: 'Frankfurt', lat: 50.1109, lng: 8.6821, sights: [
          { name: 'Römerberg', lat: 50.1106, lng: 8.6820 },
          { name: 'Palmengarten', lat: 50.1231, lng: 8.6567 },
          { name: 'Städel Müzesi', lat: 50.1048, lng: 8.6724 }
        ]}
      ],
      'Yunanistan': [
        { code: 'ATH', city: 'Atina', lat: 37.9838, lng: 23.7275, sights: [
          { name: 'Akropolis', lat: 37.9715, lng: 23.7267 },
          { name: 'Parthenon', lat: 37.9715, lng: 23.7267 },
          { name: 'Plaka Mahallesi', lat: 37.9723, lng: 23.7298 },
          { name: 'Akropolis Müzesi', lat: 37.9685, lng: 23.7284 },
          { name: 'Monastiraki Meydanı', lat: 37.9763, lng: 23.7259 }
        ]}
      ],
      'ABD': [
        { code: 'JFK', city: 'New York', lat: 40.7128, lng: -74.0060, sights: [
          { name: 'Times Meydanı', lat: 40.7580, lng: -73.9855 },
          { name: 'Central Park', lat: 40.7829, lng: -73.9654 },
          { name: 'Özgürlük Anıtı', lat: 40.6892, lng: -74.0445 },
          { name: 'Empire State', lat: 40.7484, lng: -73.9857 },
          { name: 'Brooklyn Köprüsü', lat: 40.7061, lng: -73.9969 },
          { name: 'Metropolitan Müzesi', lat: 40.7794, lng: -73.9632 }
        ]},
        { code: 'LAX', city: 'Los Angeles', lat: 34.0522, lng: -118.2437, sights: [
          { name: 'Hollywood Yazısı', lat: 34.1341, lng: -118.3215 },
          { name: 'Santa Monica Pier', lat: 34.0094, lng: -118.4973 },
          { name: 'Griffith Gözlemevi', lat: 34.1184, lng: -118.3004 },
          { name: 'Venice Beach', lat: 33.9850, lng: -118.4695 }
        ]},
        { code: 'SFO', city: 'San Francisco', lat: 37.7749, lng: -122.4194, sights: [
          { name: 'Golden Gate Köprüsü', lat: 37.8199, lng: -122.4783 },
          { name: 'Fisherman\'s Wharf', lat: 37.8080, lng: -122.4177 },
          { name: 'Alcatraz Adası', lat: 37.8267, lng: -122.4230 },
          { name: 'Chinatown', lat: 37.7941, lng: -122.4078 }
        ]},
        { code: 'MIA', city: 'Miami', lat: 25.7617, lng: -80.1918, sights: [
          { name: 'South Beach', lat: 25.7826, lng: -80.1341 },
          { name: 'Art Deco Bölgesi', lat: 25.7814, lng: -80.1312 },
          { name: 'Wynwood Walls', lat: 25.8012, lng: -80.1995 },
          { name: 'Vizcaya Müzesi', lat: 25.7444, lng: -80.2107 }
        ]},
        { code: 'ORD', city: 'Chicago', lat: 41.8781, lng: -87.6298, sights: [
          { name: 'Millennium Park', lat: 41.8827, lng: -87.6233 },
          { name: 'Willis Tower', lat: 41.8789, lng: -87.6359 },
          { name: 'Navy Pier', lat: 41.8917, lng: -87.6063 },
          { name: 'Art Institute of Chicago', lat: 41.8796, lng: -87.6237 }
        ]}
      ],
      'Japonya': [
        { code: 'NRT', city: 'Tokyo', lat: 35.6762, lng: 139.6503, sights: [
          { name: 'Senso-ji Tapınağı', lat: 35.7148, lng: 139.7967 },
          { name: 'Shibuya Yaya Geçidi', lat: 35.6595, lng: 139.7005 },
          { name: 'Meiji Jingu', lat: 35.6764, lng: 139.6993 },
          { name: 'Tokyo Kulesi', lat: 35.6586, lng: 139.7454 },
          { name: 'Akihabara', lat: 35.6997, lng: 139.7715 }
        ]}
      ],
      'BAE': [
        { code: 'DXB', city: 'Dubai', lat: 25.2048, lng: 55.2708, sights: [
          { name: 'Burj Khalifa', lat: 25.1972, lng: 55.2744 },
          { name: 'Dubai Mall', lat: 25.1985, lng: 55.2796 },
          { name: 'Palmiye Adası', lat: 25.1124, lng: 55.1390 },
          { name: 'Dubai Marina', lat: 25.0805, lng: 55.1403 },
          { name: 'Gold Souk', lat: 25.2867, lng: 55.2972 }
        ]}
      ]
    };

    // Detect destination country from the flight search inputs
    function getDestinationCountry() {
      const destInput = document.getElementById('flightDestinationInput');
      const destCode = destInput?.dataset?.code || '';
      if (!destCode || !window.AIRPORTS) return null;
      const ap = window.AIRPORTS.find(a => a.code === destCode);
      return ap ? { code: ap.code, city: ap.city, country: ap.country } : null;
    }

    // Pick top N cities based on total days, distribute days among them
    function splitIntoCities(segments, totalDays) {
      let numCities = Math.max(2, Math.min(Math.floor(totalDays / 3), segments.length));
      const cities = segments.slice(0, numCities);

      const daysPerCity = [];
      let remaining = totalDays;
      for (let i = 0; i < cities.length; i++) {
        if (i === 0) {
          const d = Math.max(3, Math.round(totalDays * 0.35));
          daysPerCity.push(d);
          remaining -= d;
        } else if (i === cities.length - 1) {
          daysPerCity.push(Math.max(2, remaining));
        } else {
          const d = Math.max(2, Math.round(remaining / (cities.length - i)));
          daysPerCity.push(d);
          remaining -= d;
        }
      }

      return cities.map((c, i) => ({ ...c, days: daysPerCity[i] }));
    }

    // Build waypoints with domestic flights between segments
    function buildSplitWaypoints(segments) {
      const allWaypoints = [];
      let currentDay = 1;

      segments.forEach((seg, segIdx) => {
        const sightsToUse = seg.sights.slice(0, Math.min(seg.sights.length, seg.days * 2));
        const totalSights = sightsToUse.length;
        const segDays = seg.days;

        // Distribute sights evenly across all days of this segment
        sightsToUse.forEach((sight, si) => {
          // Map sight index to day: spread evenly across segDays
          const dayOffset = Math.floor((si / totalSights) * segDays);
          const wpDay = currentDay + Math.min(dayOffset, segDays - 1);
          allWaypoints.push({
            lat: sight.lat, lng: sight.lng,
            name: sight.name, note: '', day: wpDay
          });
        });

        const lastDayOfSegment = currentDay + segDays - 1;
        currentDay += segDays;

        if (segIdx < segments.length - 1) {
          const nextSeg = segments[segIdx + 1];
          const tkNum = 'TK ' + (2000 + Math.floor(Math.random() * 900));
          allWaypoints.push({
            name: `${seg.code} → ${nextSeg.code}`,
            lat: (seg.lat + nextSeg.lat) / 2,
            lng: (seg.lng + nextSeg.lng) / 2,
            day: lastDayOfSegment,
            type: 'flight',
            from: seg.code,
            to: nextSeg.code,
            flightNumber: tkNum,
            note: `THY iç hat seferi ${tkNum}`
          });
        }
      });

      return allWaypoints;
    }

    btnOpen.addEventListener('click', () => {
      const isEn = THY.currentLanguage === 'en';
      const totalDays = THY.maxDays || 7;

      if (totalDays < 5) {
        THY.toast(isEn
          ? 'At least 5 days needed for city split (currently ' + totalDays + ' days)'
          : 'Şehirlere bölmek için en az 5 gün gerekli (şu an ' + totalDays + ' gün)', 'error');
        return;
      }

      // Detect destination country
      const dest = getDestinationCountry();
      const destCountry = dest?.country || 'Türkiye';
      const availableSegments = countrySegments[destCountry];

      if (!availableSegments || availableSegments.length === 0) {
        THY.toast(isEn
          ? `City split not available for ${destCountry} yet`
          : `${destCountry} için şehir bölme henüz mevcut değil`, 'error');
        return;
      }

      // If destination city is in segments, put it first
      const destCode = dest?.code || '';
      let orderedSegments = [...availableSegments];
      const destIdx = orderedSegments.findIndex(s => s.code === destCode);
      if (destIdx > 0) {
        const [destSeg] = orderedSegments.splice(destIdx, 1);
        orderedSegments.unshift(destSeg);
      }

      // Split and build
      const segments = splitIntoCities(orderedSegments, totalDays);
      const newWaypoints = buildSplitWaypoints(segments);
      const newMaxDays = segments.reduce((sum, s) => sum + s.days, 0);

      const summary = segments.map(s => `${s.city} (${s.days}g)`).join(' → ');

      if (typeof THY.playSplitFlapSound === 'function') {
        THY.playSplitFlapSound(12);
      }

      THY.maxDays = newMaxDays;
      THY.activeDay = 0;
      if (typeof THY.updateDayTabs === 'function') {
        THY.updateDayTabs();
      }
      THY.updateTripInFirestore({ maxDays: newMaxDays, waypoints: newWaypoints });

      if (newWaypoints.length > 0) {
        map.panTo({ lat: newWaypoints[0].lat, lng: newWaypoints[0].lng });
        map.setZoom(12);
      }

      THY.toast(isEn
        ? `✈ ${destCountry} route split: ${summary}`
        : `✈ ${destCountry} rotası bölündü: ${summary}`, 'success');
    });
  })();

  // ---- Draw Mode ----
  const btnDraw = document.getElementById('btnDrawRoute');
  if (btnDraw) {
    btnDraw.addEventListener('click', () => {
      drawMode = !drawMode;
      btnDraw.classList.toggle('active', drawMode);
      map.setOptions({ draggableCursor: drawMode ? 'crosshair' : null });
      const isEn = THY.currentLanguage === 'en';
      THY.toast(drawMode 
        ? (isEn ? 'Route drawing mode ON — Click on the map' : 'Rota çizim modu AÇ — Haritaya tıklayın') 
        : (isEn ? 'Route drawing mode OFF' : 'Rota çizim modu KAPALI'), 'info');
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
          const isEn = THY.currentLanguage === 'en';
          contentDiv.innerHTML = `
            ${photoHtml}
            <div style="font-weight:700;font-size:13px;margin-bottom:4px;">📍 ${place.name}</div>
            <div style="font-size:11px;color:#94A3B8;margin-bottom:6px;">${place.vicinity || ''}</div>
            ${ratingHtml}
            <button id="btnPoiAddToRoute" style="background:#E31837;color:white;border:none;padding:6px 12px;font-size:11px;font-weight:700;border-radius:4px;cursor:pointer;width:100%;transition:background 0.2s;">${isEn ? 'Add to Route' : 'Rotaya Ekle'}</button>
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
      const isEn = THY.currentLanguage === 'en';
      let name = isEn ? `Stop ${THY.waypoints.length + 1}` : `Nokta ${THY.waypoints.length + 1}`;
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

  function getPlaceSVG(types) {
    if (!types) return '<svg class="place-svg default-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--thy-red)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
    if (types.includes('restaurant') || types.includes('food')) {
      return '<svg class="place-svg restaurant-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--thy-red-light)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v7c0 2.2 1.8 4 4 4v9h2v-9c2.2 0 4-1.8 4-4V2M6 2v4M8 2v4M18 2c-2.2 0-4 1.8-4 4v16h2V12h2v10h2V6c0-2.2-1.8-4-4-4z"></path></svg>';
    }
    if (types.includes('lodging')) {
      return '<svg class="place-svg lodging-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--thy-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16M2 11h20M22 4v16M18 11v8M12 11v8M6 11V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"></path></svg>';
    }
    if (types.includes('tourist_attraction') || types.includes('museum') || types.includes('temple') || types.includes('place_of_worship')) {
      return '<svg class="place-svg tourist-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--thy-blue)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>';
    }
    if (types.includes('cafe')) {
      return '<svg class="place-svg cafe-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--thy-gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"></path></svg>';
    }
    if (types.includes('shopping_mall') || types.includes('store')) {
      return '<svg class="place-svg shopping-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--text-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"></path></svg>';
    }
    return '<svg class="place-svg default-svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--thy-red)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>';
  }

  function renderStars(rating) {
    if (!rating) return '';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    
    let starsHtml = '<div class="star-rating-row" style="display: inline-flex; gap: 2px; align-items: center; vertical-align: middle;">';
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        starsHtml += `<svg viewBox="0 0 24 24" width="10" height="10" fill="var(--thy-gold)" stroke="var(--thy-gold)" stroke-width="1" style="display: block;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
      } else if (i === full && half) {
        starsHtml += `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--thy-gold)" stroke-width="1.5" style="display: block;"><defs><linearGradient id="halfGrad"><stop offset="50%" stop-color="var(--thy-gold)"/><stop offset="50%" stop-color="transparent" stop-opacity="1"/></linearGradient></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#halfGrad)"></polygon></svg>`;
      } else {
        starsHtml += `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--border-subtle)" stroke-width="1.5" style="display: block;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
      }
    }
    starsHtml += '</div>';
    return starsHtml;
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
          <div class="empty-state__icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div class="empty-state__title">Sonuç Bulunamadı</div>
          <div class="empty-state__text">Farklı bir filtre veya arama terimi deneyin.</div>
        </div>
      `;
      return;
    }

    list.innerHTML = '';

    places.forEach((place) => {
      const emoji = getPlaceEmoji(place.types);
      const svgIcon = getPlaceSVG(place.types);
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
        <div class="place-icon">${svgIcon}</div>
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
        const isEn = THY.currentLanguage === 'en';
        contentDiv.innerHTML = `
          ${photoHtml}
          ${partnerHtml}
          <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${emoji} ${place.name}</div>
          <div style="font-size:11px;color:#94A3B8;margin-bottom:6px;">${place.vicinity || ''}</div>
          ${ratingHtml}
          <button id="btnPlaceMarkerAddToRoute" style="background:#E31837;color:white;border:none;padding:6px 12px;font-size:11px;font-weight:700;border-radius:4px;cursor:pointer;width:100%;transition:background 0.2s;">${isEn ? 'Add to Route' : 'Rotaya Ekle'}</button>
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

  THY.clearPlaces = () => {
    lastSearchResults = [];
    placeMarkers.forEach(m => m.setMap(null));
    placeMarkers = [];
    const list = document.getElementById('placesList');
    if (list) {
      const isEn = (window.THY && window.THY.currentLanguage === 'en') || (localStorage.getItem('thy_lang') || 'tr') === 'en';
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📌</div>
          <div class="empty-state__title" id="lblPlacesEmptyTitle">${isEn ? 'Discover Places' : 'Yer Keşfet'}</div>
          <div class="empty-state__text" id="lblPlacesEmptyText">${isEn ? 'Discover nearby places by clicking filters or searching.' : 'Filtrelere tıklayarak veya arama yaparak etraftaki yerleri keşfedin.'}</div>
        </div>
      `;
    }
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(c => c.classList.remove('active'));
  };

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
    if (typeof THY.clearPlaces === 'function') {
      THY.clearPlaces();
    }
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
        if (activeChip) {
          const type = activeChip.dataset.type;
          THY.searchNearbyPlaces(type, destinationCenter);
        }
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
            if (activeChip) {
              const type = activeChip.dataset.type;
              THY.searchNearbyPlaces(type, dynamicCenter);
            }
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
            if (activeChip) {
              const type = activeChip.dataset.type;
              THY.searchNearbyPlaces(type, { lat: destAp.lat, lng: destAp.lng });
            }
          }, 500);
        }
      }
    }
  };

  // ---- Initial Places Load & Firebase Hydration Trigger ----
  // No initial places are searched automatically, waiting for user category selection.

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
  // Global auth failure handler
  window.gm_authFailure = () => {
    const isEn = window.THY && window.THY.currentLanguage === 'en';
    if (window.THY && typeof window.THY.toast === 'function') {
      window.THY.toast(
        isEn ? 'Google Maps authentication failed! Please check your API key restrictions.' : 'Google Maps yetkilendirme hatası! Lütfen API anahtarı kısıtlamalarını kontrol edin.',
        'error',
        6000
      );
    }
  };

  const handleScriptError = () => {
    const isEn = window.THY && window.THY.currentLanguage === 'en';
    if (window.THY && typeof window.THY.toast === 'function') {
      window.THY.toast(
        isEn ? 'Google Maps could not be loaded. Switched to offline map fallback mode.' : 'Google Haritalar yüklenemedi. Çevrimdışı harita moduna geçildi.',
        'error',
        6000
      );
    }
    // Visually notify user on the map container
    const mapEl = document.getElementById('map');
    if (mapEl) {
      mapEl.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; width:100%; background:#12161A; color:#EF4444; padding:20px; text-align:center;">
          <span style="font-size:40px; margin-bottom:10px;">📡</span>
          <h3 style="margin-bottom:8px; color:white; font-family:'Inter', sans-serif;">${isEn ? 'Google Maps Connection Error' : 'Harita Bağlantı Hatası'}</h3>
          <p style="font-size:12px; color:#8E9AA6; max-width:320px; line-height:1.5; font-family:'Inter', sans-serif;">
            ${isEn ? 'Google Maps API script could not be loaded. Please check your internet connection or API restrictions.' : 'Google Haritalar yüklenemedi. Lütfen internet bağlantınızı veya API yetkilerini kontrol edin.'}
          </p>
        </div>
      `;
    }
  };

  try {
    const res = await fetch('/api/maps-key');
    if (!res.ok) {
      throw new Error(`Maps key API returned ${res.status}`);
    }
    const data = await res.json();
    const key = data.key;
    if (!key) {
      throw new Error('Backend returned an empty API key');
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = handleScriptError;
    document.head.appendChild(script);
    console.log("🗺️ Google Maps API script loaded dynamically from backend key.");
  } catch (err) {
    console.error("❌ Failed to load Google Maps API key from serverless backend:", err);
    handleScriptError();
  }
}

// Trigger Google Maps dynamic loading now that all JS functions are declared
loadGoogleMapsScript();
