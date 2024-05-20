// Inicializar o mapa
const map = L.map('map').setView([0, 0], 2);

// Adicionar a camada de mapa do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

let satelliteMarker = null;

async function showRandomSatellite() {
    try {
        // Obter dados TLE de um satélite aleatório
        const response = await axios.get('https://tle.ivanstanojevic.me/api/tle');
        const satData = response.data.member[Math.floor(Math.random() * response.data.member.length)];
        
        // Extrair as linhas TLE
        const tleLine1 = satData.line1;
        const tleLine2 = satData.line2;
        
        // Calcular a posição atual do satélite
        const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
        const now = new Date();
        const positionAndVelocity = satellite.propagate(satrec, now);
        const positionEci = positionAndVelocity.position;
        
        const gmst = satellite.gstime(now);
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        
        const latitude = satellite.radiansToDegrees(positionGd.latitude);
        const longitude = satellite.radiansToDegrees(positionGd.longitude);
        
        // Atualizar o mapa com a nova posição
        if (satelliteMarker) {
            satelliteMarker.setLatLng([latitude, longitude]);
        } else {
            satelliteMarker = L.marker([latitude, longitude]).addTo(map);
        }
        
        map.setView([latitude, longitude], 4);
    } catch (error) {
        console.error('Erro ao obter dados do satélite:', error);
    }
}
