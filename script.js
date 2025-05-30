const map = L.map('map').setView([-19.0154, 29.1549], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const searchInput = document.getElementById('searchInput');
const resultsList = document.getElementById('results');
const filter = document.getElementById('typeFilter');

let markersGroup = L.layerGroup().addTo(map);

searchInput.addEventListener('input', searchPhoton);
filter.addEventListener('change', searchPhoton);

function searchPhoton() {
  const query = searchInput.value.trim();
  const selectedType = filter.value.trim();

  if (!query) {
    resultsList.innerHTML = '';
    markersGroup.clearLayers();
    return;
  }

  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lang=en`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      resultsList.innerHTML = '';
      markersGroup.clearLayers();

      const filtered = data.features.filter(f => {
        const val = f.properties.osm_value || '';
        return !selectedType || val.includes(selectedType);
      });

      if (filtered.length === 0) {
        resultsList.innerHTML = '<li>No results found.</li>';
        return;
      }

      filtered.forEach(feature => {
        const name = feature.properties.name || '[Unnamed]';
        const osmType = feature.properties.osm_value || '';
        const display = `${name} (${osmType})`;
        const [lon, lat] = feature.geometry.coordinates;

        const li = document.createElement('li');
        li.textContent = display;
        li.onclick = () => {
          map.setView([lat, lon], 16);
          markersGroup.clearLayers();
          L.marker([lat, lon]).addTo(markersGroup).bindPopup(display).openPopup();
          resultsList.innerHTML = '';
          searchInput.value = '';
        };

        resultsList.appendChild(li);
      });
    })
    .catch(() => {
      resultsList.innerHTML = '<li>Error fetching data</li>';
    });
}
