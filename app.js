document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CORE ALERT SYSTEM (SHIRAZ) ---
    // This handles the blinking emergency lights on your dashboard
    window.triggerShirazAlert = function(eventDetails) {
        const alertModule = document.getElementById('shiraz-alert-module');
        const alertStatusText = document.getElementById('shiraz-status-text');
        
        if (!alertModule) return;

        alertModule.classList.add('attack-alert-active');
        
        if (alertStatusText && eventDetails) {
            alertStatusText.innerHTML = `<strong>ACTIVE EVENT:</strong> ${eventDetails}`;
            alertStatusText.style.color = 'var(--alert-red)';
        }

        // Auto-resets after 10 seconds
        setTimeout(() => {
            alertModule.classList.remove('attack-alert-active');
            if (alertStatusText) {
                alertStatusText.innerHTML = 'Status: Monitoring Normal';
                alertStatusText.style.color = 'var(--text-main)';
            }
        }, 10000); 
    };

    // --- 2. INITIALIZE THE TACTICAL MAP ---
    // Centers the map over the Middle East (focusing heavily on Iran/Gulf region)
    const map = L.map('tactical-map').setView([32.0, 53.0], 5);

    // Dark map tiles to fit the Apple-style glass dashboard aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // --- 3. PLOT MAP POINTERS FROM YOUR DATA ---
    if (typeof baselineMapData !== 'undefined') {
        baselineMapData.forEach(event => {
            // Color-code the tactical dots based on what happened
            let dotColor = '#ff3b30'; // Red for missiles/kinetic
            if(event.eventType === 'intercept') dotColor = '#34c759'; // Green
            if(event.eventType === 'drone') dotColor = '#ffcc00';     // Yellow
            if(event.eventType === 'siren') dotColor = '#af52de';     // Purple

            // Draw the glowing dot on the map
            const marker = L.circleMarker([event.lat, event.lng], {
                radius: 6,
                fillColor: dotColor,
                color: '#fff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map);

            // Create the info bubble when you click a dot
            const popupContent = `
                <div style="font-family: -apple-system, sans-serif;">
                    <strong style="color: ${dotColor};">${event.eventType.toUpperCase()}</strong><br>
                    <b>${event.title}</b><br>
                    <small>${event.location}</small><br>
                    <small style="color: gray;">Source: ${event.source}</small>
                </div>
            `;
            marker.bindPopup(popupContent);
        });
    } else {
        console.error("Map Data missing! Make sure archive.js is linked in your HTML.");
    }

    // --- 4. RENDER DYNAMIC NEWS FEED ---
    const newsGrid = document.getElementById('dynamic-news-grid');
    
    if (newsGrid && typeof baselineNewsData !== 'undefined') {
        newsGrid.innerHTML = ''; 

        // Grab the 6 most recent events so the page doesn't scroll forever
        const latestNews = baselineNewsData.slice(0, 6);

        latestNews.forEach(newsItem => {
            // Format the UNIX timestamp
            const dateObj = new Date(newsItem.timestamp);
            const timeString = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            const dateString = dateObj.toLocaleDateString();

            // Build the glass card HTML for the news feed
            const cardHTML = `
                <div class="glass-panel news-card">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.8em; font-weight: 600; color: #ff3b30;">${newsItem.location}</span>
                        <span style="font-size: 0.8em; color: gray;">${dateString} ${timeString}</span>
                    </div>
                    <h3 style="margin-bottom: 5px; font-size: 1.1em;">${newsItem.title}</h3>
                    
                    ${newsItem.mediaHTML ? newsItem.mediaHTML : ''}
                    ${newsItem.videoSrc ? `
                        <video controls style="width: 100%; border-radius: 8px; margin-top: 10px;">
                            <source src="${newsItem.videoSrc}" type="video/mp4">
                        </video>` : ''
                    }
                    
                    <p style="font-size: 0.85em; margin-top: 10px; color: gray;">Source: ${newsItem.source}</p>
                </div>
            `;
            newsGrid.insertAdjacentHTML('beforeend', cardHTML);
        });
    }
});
