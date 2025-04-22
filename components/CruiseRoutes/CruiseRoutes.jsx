'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Компонент для карты
const CruiseRoutes = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({}); // Для хранения маркеров
  const [cruiseData, setCruiseData] = useState([]);
  const [selectedCruiseId, setSelectedCruiseId] = useState(null); // Для отслеживания выбранного круиза

  // Функция для получения данных с бэкенда
  const fetchCruiseLocations = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/cruise-locations', {
        headers: {
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Преобразуем координаты в числа
      const parsedData = data.map(point => ({
        ...point,
        latitude: parseFloat(point.latitude),
        longitude: parseFloat(point.longitude),
      }));
      console.log('Fetched cruise locations:', parsedData);
      setCruiseData(parsedData);
    } catch (error) {
      console.error('Error fetching cruise locations:', error);
    }
  };

  // Функция для обновления координат через API
  const updateCruiseLocations = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/update-cruise-locations', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('Cruise locations updated');
      // После обновления сразу запрашиваем новые данные
      await fetchCruiseLocations();
    } catch (error) {
      console.error('Error updating cruise locations:', error);
    }
  };

  // Функция для плавного перемещения маркера
  const animateMarker = (marker, startLatLng, endLatLng, duration = 2000) => {
    if (startLatLng[0] === endLatLng[0] && startLatLng[1] === endLatLng[1]) {
      console.log('Coordinates unchanged, skipping animation');
      return;
    }

    console.log('Animating marker from', startLatLng, 'to', endLatLng);
    const startTime = performance.now();
    const startLat = startLatLng[0];
    const startLng = startLatLng[1];
    const deltaLat = endLatLng[0] - startLat;
    const deltaLng = endLatLng[1] - startLng;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const newLat = startLat + deltaLat * progress;
      const newLng = startLng + deltaLng * progress;

      marker.setLatLng([newLat, newLng]);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  // Функция для фокусировки на выбранном круизе
  const focusOnCruise = (cruiseId) => {
    setSelectedCruiseId(cruiseId);
    const cruise = cruiseData.find(c => c.id === cruiseId);
    if (cruise && cruise.latitude && cruise.longitude && mapInstance.current) {
      mapInstance.current.flyTo([cruise.latitude, cruise.longitude], 10, {
        duration: 1,
      });
    }
  };

  useEffect(() => {
    const initializeMap = async () => {
      const L = (await import('leaflet')).default;

      if (mapRef.current && !mapInstance.current) {
        mapInstance.current = L.map(mapRef.current, {
          center: [61.52401, 105.318756],
          zoom: 4,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance.current);
      }
    };

    initializeMap();

    // Запускаем периодический опрос и обновление (каждые 10 секунд)
    fetchCruiseLocations();
    const intervalFetch = setInterval(fetchCruiseLocations, 1000);
    const intervalUpdate = setInterval(updateCruiseLocations, 1000);

    return () => {
      clearInterval(intervalFetch);
      clearInterval(intervalUpdate);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    const initializeMarkers = async () => {
      const L = (await import('leaflet')).default;

      const cruiseIcon = L.icon({
        iconUrl: '/images/ship-icon.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      // Обновляем или создаём маркеры
      cruiseData.forEach((point) => {
        if (!point.latitude || !point.longitude) {
          console.log(`Skipping marker for ${point.name}: no coordinates`);
          return;
        }

        const coords = [point.latitude, point.longitude];

        if (markersRef.current[point.id]) {
          // Если маркер существует, анимируем его перемещение
          const marker = markersRef.current[point.id];
          const currentLatLng = marker.getLatLng();
          animateMarker(marker, [currentLatLng.lat, currentLatLng.lng], coords);

          // Если этот круиз выбран, фокусируемся на нём
          if (selectedCruiseId === point.id) {
            mapInstance.current.flyTo(coords, 10, { duration: 1 });
          }
        } else {
          // Создаём новый маркер
          console.log(`Creating marker for ${point.name} at`, coords);
          markersRef.current[point.id] = L.marker(coords, { icon: cruiseIcon })
            .addTo(mapInstance.current)
            .bindPopup(`<strong>${point.name}</strong><br />Река: ${point.river}`);
        }
      });
    };

    initializeMarkers();
  }, [cruiseData, selectedCruiseId]);

  return (
    <div>
      <div className="title">
        <h2 className="h1-title">КАРТА МАРШРУТОВ</h2>
      </div>
      <div className="cruiseSelector">
        <label htmlFor="cruise-select">Выберите круиз для отслеживания: </label>
        <select
          id="cruise-select"
          value={selectedCruiseId || ''}
          onChange={(e) => focusOnCruise(parseInt(e.target.value))}
          className="cruiseSelect"
        >
          <option value="">Все круизы</option>
          {cruiseData.map(cruise => (
            <option key={cruise.id} value={cruise.id}>
              {cruise.name} ({cruise.river})
            </option>
          ))}
        </select>
      </div>
      <div className="layout">
        <div style={{ height: '500px', width: '100%' }} ref={mapRef}></div>
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(CruiseRoutes), { ssr: false });