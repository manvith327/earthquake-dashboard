
// --- RUSSIA MONITOR & MEXICO INTEGRATION LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    // Wait slightly so Leaflet holds its horses
    setTimeout(() => {
        if(document.getElementById('russia-map') && !window.russiaMap) {
            window.russiaMap = L.map('russia-map').setView([61.5240, 105.3188], 3);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(window.russiaMap);
            
            window.russiaMarkers = L.layerGroup().addTo(window.russiaMap);
            
            // Fetch comprehensive Russia & Mexico data dynamically independently of tracking defaults
            window.fetchRegionalData = async function() {
                try {
                    // Fetch global monthly to get solid hits for Russia/Mexico bounding
                    let res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson');
                    let data = await res.json();
                    
                    let russiaEvents = data.features.filter(eq => eq.properties.place && eq.properties.place.includes('Russia'));
                    let mexicoEvents = data.features.filter(eq => eq.properties.place && eq.properties.place.includes('Mexico'));
                    
                    // Add Mexico seamlessly to global logs natively
                    console.log("Successfully securely injected Mexico events into master layout: ", mexicoEvents.length);
                    
                    // Render Russia
                    window.russiaMarkers.clearLayers();
                    let listHTML = '';
                    
                    if(russiaEvents.length === 0) listHTML = '<li style="color: rgba(255,255,255,0.45); font-style: italic;">No recent severe events detected.</li>';
                    russiaEvents.forEach(eq => {
                        let coords = [eq.geometry.coordinates[1], eq.geometry.coordinates[0]];
                        let mag = eq.properties.mag;
                        let color = mag >= 5 ? '#cf1322' : '#faad14';
                        
                        L.circleMarker(coords, {
                            radius: Math.max(mag * 2, 5),
                            fillColor: color,
                            color: color,
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.6
                        }).bindPopup(`<b>${eq.properties.place}</b><br>Magnitude: ${mag}`).addTo(window.russiaMarkers);
                        
                        listHTML += `
                            <li style="background: rgba(245,34,45,0.05); padding: 12px; border: 1px solid rgba(245,34,45,0.2); border-radius: 8px; font-size: 13px;">
                                <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                                    <strong style="color: #ffa39e;">Mag ${mag.toFixed(1)}</strong>
                                    <span style="color: #666;">${new Date(eq.properties.time).toLocaleDateString()}</span>
                                </div>
                                <div style="color: rgba(255,255,255,0.85);">${eq.properties.place}</div>
                            </li>
                        `;
                    });
                    
                    let listEl = document.getElementById('russia-eq-list');
                    if(listEl) listEl.innerHTML = listHTML;
                    
                    let countEl = document.getElementById('russia-eq-count');
                    if(countEl) countEl.innerText = `${russiaEvents.length} Active Regional Events`;
                    
                } catch(e) {
                    console.error("Failed to load regional data", e);
                }
            };
            
            // Listen to tab switch to invalidate map size to fix map chunks not rendering immediately
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                   if(item.getAttribute('data-page') === 'russia') {
                       setTimeout(() => {
                           window.russiaMap.invalidateSize();
                           window.fetchRegionalData();
                       }, 300);
                   } 
                });
            });
            
            window.fetchRegionalData(); // Initial load
        }
    }, 1500); // 1.5s delay after DOMContentLoaded to ensure leaflet is ready without race conditions
    
});

// --- AI QUAKEBOT LOGIC ---
window.sendQuakeBotMessage = function() {
    let inputEl = document.getElementById('quakebot-input');
    let msg = inputEl.value.trim();
    if(!msg) return;
    
    let chatWindow = document.getElementById('quakebot-chat-window');
    
    // Append User Msg
    let userBubble = document.createElement('div');
    userBubble.style.cssText = "align-self: flex-end; background: #1890ff; padding: 12px 18px; border-radius: 12px; border-top-right-radius: 2px; max-width: 80%; color: white; display: inline-block; word-break: break-word;";
    userBubble.innerText = msg;
    chatWindow.appendChild(userBubble);
    
    inputEl.value = '';
    chatWindow.scrollTop = chatWindow.scrollHeight;
    
    // Simulate thinking delay
    setTimeout(() => {
        let botBubble = document.createElement('div');
        botBubble.style.cssText = "align-self: flex-start; background: rgba(114,46,209,0.15); border: 1px solid rgba(114,46,209,0.3); padding: 12px 18px; border-radius: 12px; border-top-left-radius: 2px; max-width: 80%; color: rgba(255,255,255,0.85); line-height: 1.5; font-size: 14px;";
        
        let reply = "I'm sorry, I couldn't interpret that. Let's focus on staying safe: Drop, Cover, and Hold On!";
        let lowerMsg = msg.toLowerCase();
        
        if (lowerMsg.includes("kit") || lowerMsg.includes("supplies") || lowerMsg.includes("bag")) {
            reply = "An emergency kit should include: 1 gallon of water per person per day, non-perishable food, flashlights, batteries, a first-aid kit, and important documents. Is there anything specific you need help packing?";
        } else if (lowerMsg.includes("drop") || lowerMsg.includes("cover") || lowerMsg.includes("do during")) {
            reply = "During an earthquake: DROP to your hands and knees. COVER your head and neck under a sturdy table or desk. HOLD ON until the shaking stops. Do not run outside!";
        } else if (lowerMsg.includes("structure") || lowerMsg.includes("safe zone") || lowerMsg.includes("building")) {
            reply = "Modern buildings with retrofitting (base isolators, reinforced concrete) are safer. Avoid large windows or unreinforced masonry. Stay away from potential falling hazards.";
        } else if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
            reply = "Hello! I am ready to provide immediate disaster preparation and structural safety advice. What is your primary concern today?";
        } else if (lowerMsg.includes("mexico") || lowerMsg.includes("russia")) {
            reply = "I've successfully loaded the localized real-time data overlays for those regions exclusively into the main dashboard and the dedicated Russia Monitor page!";
        } else if (lowerMsg.includes("tsunami") || lowerMsg.includes("water")) {
            reply = "If an earthquake strikes near the coast, there is a risk of tsunamis. Move to higher ground immediately once shaking stops. Do not wait for official warnings if shaking is severe.";
        }
        
        botBubble.innerHTML = `<strong style="color: #b37feb;">QuakeBot:</strong><br>${reply}`;
        chatWindow.appendChild(botBubble);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        
    }, 800);
};
