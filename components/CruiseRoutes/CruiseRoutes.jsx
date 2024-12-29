'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css'; 
import L from 'leaflet'; 

const CruiseRoutes = () => {
  const mapRef = useRef(null); 
  const mapInstance = useRef(null); 

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        center: [61.52401, 105.318756], 
        zoom: 4, 
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
      }).addTo(mapInstance.current);

      const cruisePoints = [
        { coords: [57.6260744, 39.8844708], name: 'Ярославль', river: 'Волга' },
        { coords: [62.02762, 129.73257], name: 'Якутск', river: 'Лена' },
        { coords: [55.35565, 89.46031], name: 'Красноярск', river: 'Енисей' },
        { coords: [52.033973, 113.500282], name: 'Благовещенск', river: 'Амур' },
        { coords: [47.222531, 39.718705], name: 'Ростов-на-Дону', river: 'Дон' },
        { coords: [56.49771, 84.97437], name: 'Томск', river: 'Обь' },
      ];

      const cruiseIcon = L.icon({
        iconUrl: '/images/ship-icon.png', 
        iconSize: [32, 32], 
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      cruisePoints.forEach(point => {
        const marker = L.marker(point.coords, { icon: cruiseIcon }).addTo(mapInstance.current);
        marker.bindPopup(`<strong>${point.name}</strong><br />Река: ${point.river}`);
      });
    }
  }, []); 

  return (
    <div>
      <div className="title">
        <h2 className="h1-title">КАРТА МАРШРУТОВ</h2>
      </div>
      <div className="layout">
        <div style={{ height: '500px', width: '100%' }} ref={mapRef}></div>
      </div>
    </div>
  );
};

export default CruiseRoutes;
