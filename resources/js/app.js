import './bootstrap';
import L from 'leaflet';
import provincesPolygons from './polygons/provinces.json';

let map = L.map('map').setView([50.8503, 4.3517], 9);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '©OpenStreetMap, ©CartoDB'
}).addTo(map);

const pointToLayer = (
    feature,
    latlng,
) => {
    const label = String(feature.properties.label);

    return new L.CircleMarker(latlng, {
        radius: 1,
    }).bindTooltip(label, {permanent: true, opacity: 1}).openTooltip();
};

const geoJsonProvincesLayer = L.geoJSON(provincesPolygons, { pointToLayer }).addTo(map);

geoJsonProvincesLayer.eachLayer(provinceLayer => {
    provinceLayer.on('click', async () => {
        let filePath = `/geodata/provinces/${provinceLayer.feature.properties.layerName}.json`;
        const { data } = await axios.get(filePath);

        map.removeLayer(geoJsonProvincesLayer);

        const geoJsonLocalityLayer = L.geoJSON(data, { pointToLayer }).addTo(map);

        geoJsonLocalityLayer.eachLayer(localityLayer => {
            localityLayer.on('click', async () => {
                let filePath = `/geodata/localities/${provinceLayer.feature.properties.layerName}/${localityLayer.feature.properties.layerName}.json`;
                const { data } = await axios.get(filePath);

                map.removeLayer(geoJsonLocalityLayer);

                const geoJsonSublocalityLayer = L.geoJSON(data, { pointToLayer }).addTo(map);

                geoJsonSublocalityLayer.eachLayer(sublocalityLayer => {
                    sublocalityLayer.on('click', async () => {
                        console.log(sublocalityLayer.feature.properties.criterion.queryValue);
                    });
                });

                map.fitBounds(L.geoJSON(data).getBounds());
            });
        });

        map.fitBounds(L.geoJSON(data).getBounds());
    });
});



