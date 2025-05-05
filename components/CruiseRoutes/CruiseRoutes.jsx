'use client';
import { API_BASE_URL } from '../../src/config';
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import styles from './CruiseRoutes.module.css';


// Компонент для карты
const CruiseRoutes = () => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef({}); // Для хранения маркеров
    const [cruiseData, setCruiseData] = useState([]);
    const [selectedCruiseId, setSelectedCruiseId] = useState(null); // Для отслеживания выбранного круиза
    const [error, setError] = useState(null);

    // Функция для получения данных с бэкенда
    const fetchCruiseLocations = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cruise-locations`, {
                headers: {
                    'Accept': 'application/json',
                },
            });
            if (!response.ok) {
                setCruiseData([]); // Устанавливаем пустой массив
                return; // Завершаем выполнение функции
            }
            const data = await response.json();
            // Проверяем, что data — это массив
            if (!Array.isArray(data)) {
                setCruiseData([]);
                return;
            }
            // Преобразуем координаты в числа
            const parsedData = data.map(point => ({
                ...point,
                latitude: parseFloat(point.latitude),
                longitude: parseFloat(point.longitude),
            }));
            setCruiseData(parsedData);
            setError(null);
        } catch (error) {
            setCruiseData([]);
        }
    };

    // Функция для обновления координат через API
    const updateCruiseLocations = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/update-cruise-locations`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                return; // Игнорируем ошибку
            }
            await fetchCruiseLocations();
        } catch (error) {
            // Игнорируем ошибку
        }
    };

    // Функция для плавного перемещения маркера
    const animateMarker = (marker, startLatLng, endLatLng, duration = 2000) => {
        if (startLatLng[0] === endLatLng[0] && startLatLng[1] === endLatLng[1]) {
            return;
        }

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
        const intervalFetch = setInterval(fetchCruiseLocations, 5000);
        const intervalUpdate = setInterval(updateCruiseLocations, 5000);

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
            <div className={styles.cruiseSelector}>
                <label htmlFor="cruise-select" className={styles.selectorLabel}>
                    Выберите круиз для отслеживания:
                </label>
                <select
                    id="cruise-select"
                    value={selectedCruiseId || ''}
                    onChange={(e) => focusOnCruise(parseInt(e.target.value))}
                    className={styles.cruiseSelect}
                >
                    <option value="">Все круизы</option>
                    {cruiseData.length > 0 ? (
                        cruiseData.map(cruise => (
                            <option key={cruise.id} value={cruise.id}>
                                {cruise.name} ({cruise.river})
                            </option>
                        ))
                    ) : (
                        <option value="">Нет доступных круизов</option>
                    )}
                </select>
            </div>
            <div className="layout">
                <div style={{ height: '500px', width: '100%' }} ref={mapRef}></div>
            </div>
        </div>
    );
};

export default dynamic(() => Promise.resolve(CruiseRoutes), { ssr: false });