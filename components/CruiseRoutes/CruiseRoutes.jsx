'use client';
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import styles from './CruiseRoutes.module.css';

// Моковые данные для круизов
const MOCK_CRUISE_DATA = [
    {
        id: 1,
        name: "Волга Премиум",
        river: "Волга",
        latitude: 56.3287,
        longitude: 44.002,
        route: [
            [56.3287, 44.002], // Нижний Новгород
            [56.7339, 37.5874], // Дубна
            [57.6299, 39.8737], // Ярославль
            [58.5215, 31.2755], // Великий Новгород
            [57.7678, 40.9269], // Кострома
            [57.1522, 65.5272], // Тюмень
            [55.7963, 49.1088], // Казань
            [53.1959, 50.1002], // Самара
            [48.7194, 44.5018], // Волгоград
            [47.2313, 39.7233], // Ростов-на-Дону
        ],
        description: "Эксклюзивный круиз по всей длине Волги - от истока до устья. Посещение 10 исторических городов России с богатым культурным наследием."
    },
    {
        id: 2,
        name: "Лена Экспедишн",
        river: "Лена",
        latitude: 62.0283,
        longitude: 129.7325,
        route: [
            [62.0283, 129.7325], // Якутск
            [60.7253, 129.8830], // Покровск
            [60.7416, 135.3166], // Хандыга
            [61.6763, 135.3342], // Джебарики-Хая
            [63.0496, 129.4405], // Сангар
            [64.5635, 129.8034], // Жиганск
            [66.7697, 123.3710], // Джарджан
            [68.7506, 123.3710], // Кюсюр
            [70.6869, 127.3969], // Тит-Ары
            [72.3696, 126.5928], // Быков Мыс
        ],
        description: "Экспедиционный круиз по реке Лена с посещением самых отдаленных уголков Якутии. Уникальная возможность увидеть природу Сибири и традиции местных народов."
    },
    {
        id: 3,
        name: "Дон Классик",
        river: "Дон",
        latitude: 47.2313,
        longitude: 39.7233,
        route: [
            [47.2313, 39.7233], // Ростов-на-Дону
            [47.5163, 40.2163], // Новочеркасск
            [48.7194, 44.5018], // Волгоград
            [49.7937, 43.6565], // Серафимович
            [50.0961, 40.7863], // Павловск
            [51.0966, 39.0356], // Воронеж
            [52.4252, 37.6063], // Елец
            [53.9486, 37.5269], // Тула
            [54.1930, 37.6177], // Ясная Поляна
            [55.5306, 37.5184], // Москва (канал им. Москвы)
        ],
        description: "Классический круиз по Дону с посещением казачьих станиц и исторических мест. Включает экскурсии по местам, связанным с историей донского казачества."
    },
    {
        id: 4,
        name: "Енисей Голд",
        river: "Енисей",
        latitude: 56.0184,
        longitude: 92.8672,
        route: [
            [56.0184, 92.8672], // Красноярск
            [58.4431, 92.1514], // Енисейск
            [60.3726, 93.2638], // Лесосибирск
            [61.5992, 90.1236], // Туруханск
            [63.1934, 87.9617], // Игарка
            [66.5295, 86.5733], // Дудинка
            [67.6478, 86.1566], // Норильск
            [69.3333, 88.2167], // Диксон
            [71.9806, 102.4711], // Хатанга
            [72.3696, 126.5928], // Усть-Оленёк
        ],
        description: "Премиальный круиз по Енисею с заходом в арктические порты. В программе: наблюдение за северным сиянием, посещение плато Путорана и знакомство с культурой северных народов."
    },
    {
        id: 5,
        name: "Амур Мистери",
        river: "Амур",
        latitude: 48.4802,
        longitude: 135.0719,
        route: [
            [48.4802, 135.0719], // Хабаровск
            [49.0670, 135.0523], // Комсомольск-на-Амуре
            [50.2639, 136.8787], // Николаевск-на-Амуре
            [52.0333, 141.5167], // Де-Кастри
            [52.9389, 140.2903], // Советская Гавань
            [53.1403, 140.7222], // Ванино
            [54.7293, 142.0544], // Александровск-Сахалинский
            [55.1667, 142.0167], // Оха
            [56.9167, 142.0667], // Ноглики
            [59.5500, 150.8000], // Магадан
        ],
        description: "Загадочное путешествие по Амуру с выходом в Охотское море. Уникальная возможность увидеть дикую природу Дальнего Востока и познакомиться с культурой коренных народов."
    },
    {
        id: 6,
        name: "Обь Эксплорер",
        river: "Обь",
        latitude: 55.0111,
        longitude: 82.9346,
        route: [
            [55.0111, 82.9346], // Новосибирск
            [56.1124, 82.9346], // Колпашево
            [57.1522, 65.5272], // Тюмень
            [58.0105, 65.5272], // Ханты-Мансийск
            [60.9500, 76.5667], // Нижневартовск
            [61.2500, 73.4167], // Сургут
            [63.7167, 72.4333], // Салехард
            [66.5295, 66.5295], // Лабытнанги
            [67.4667, 86.5667], // Игарка
            [69.3333, 88.2167], // Дудинка
        ],
        description: "Исследовательский круиз по Оби с посещением нефтяных месторождений Западной Сибири. В программе: экскурсии на месторождения, знакомство с культурой хантов и манси, рыбалка на сибирскую рыбу."
    }
];

const CruiseRoutes = () => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef({});
    const polylinesRef = useRef({});
    const routeMarkersRef = useRef({});
    const [cruiseData, setCruiseData] = useState(MOCK_CRUISE_DATA);
    const [selectedCruiseId, setSelectedCruiseId] = useState(null);
    const [activeCruise, setActiveCruise] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    // Функция для фокусировки на выбранном круизе
    const focusOnCruise = (cruiseId) => {
        setSelectedCruiseId(cruiseId);
        const cruise = cruiseData.find(c => c.id === cruiseId);
        if (cruise && cruise.latitude && cruise.longitude && mapInstance.current) {
            mapInstance.current.flyTo([cruise.latitude, cruise.longitude], 6, {
                duration: 1,
            });
            drawCruiseRoute(cruise);
        } else if (!cruiseId && mapInstance.current) {
            // Сброс при выборе "Все круизы"
            mapInstance.current.flyTo([61.52401, 105.318756], 4, { duration: 1 });
            clearAllRoutes();
        }
    };

    // Функция для отрисовки маршрута круиза
    const drawCruiseRoute = (cruise) => {
        if (!mapInstance.current || !cruise.route) return;

        const L = window.L;
        
        // Удаляем предыдущий маршрут, если есть
        if (polylinesRef.current[cruise.id]) {
            mapInstance.current.removeLayer(polylinesRef.current[cruise.id]);
        }

        // Удаляем маркеры точек маршрута для этого круиза
        if (routeMarkersRef.current[cruise.id]) {
            routeMarkersRef.current[cruise.id].forEach(marker => {
                mapInstance.current.removeLayer(marker);
            });
            routeMarkersRef.current[cruise.id] = [];
        }

        // Создаем новую линию маршрута
        polylinesRef.current[cruise.id] = L.polyline(cruise.route, {
            color: getRiverColor(cruise.river),
            weight: 4,
            opacity: 0.9,
            dashArray: '5, 5'
        }).addTo(mapInstance.current);

        // Добавляем маркеры для точек маршрута
        routeMarkersRef.current[cruise.id] = [];
        cruise.route.forEach((point, index) => {
            const marker = L.marker(point, {
                icon: L.divIcon({
                    className: 'route-point-marker',
                    html: `<div style="background-color: ${getRiverColor(cruise.river)}">${index + 1}</div>`,
                    iconSize: [24, 24]
                })
            }).addTo(mapInstance.current);
            
            marker.bindPopup(`
                <strong>${cruise.name}</strong><br>
                Точка маршрута ${index + 1}<br>
                Широта: ${point[0].toFixed(4)}<br>
                Долгота: ${point[1].toFixed(4)}<br>
                <small>${getLocationName(cruise.id, index)}</small>
            `);
            
            routeMarkersRef.current[cruise.id].push(marker);
        });
    };

    // Функция для получения цвета в зависимости от реки
    const getRiverColor = (river) => {
        const colors = {
            'Волга': '#2A376D',
            'Лена': '#3A6EA5',
            'Дон': '#4B8F8C',
            'Енисей': '#C45BAA',
            'Амур': '#E67E22',
            'Обь': '#16A085'
        };
        return colors[river] || '#2A376D';
    };

    // Функция для получения названия локации
    const getLocationName = (cruiseId, pointIndex) => {
        const cruise = cruiseData.find(c => c.id === cruiseId);
        if (!cruise) return '';
        
        const defaultNames = {
            1: ['Нижний Новгород', 'Дубна', 'Ярославль', 'Великий Новгород', 'Кострома', 'Тюмень', 'Казань', 'Самара', 'Волгоград', 'Ростов-на-Дону'],
            2: ['Якутск', 'Покровск', 'Хандыга', 'Джебарики-Хая', 'Сангар', 'Жиганск', 'Джарджан', 'Кюсюр', 'Тит-Ары', 'Быков Мыс'],
            3: ['Ростов-на-Дону', 'Новочеркасск', 'Волгоград', 'Серафимович', 'Павловск', 'Воронеж', 'Елец', 'Тула', 'Ясная Поляна', 'Москва'],
            4: ['Красноярск', 'Енисейск', 'Лесосибирск', 'Туруханск', 'Игарка', 'Дудинка', 'Норильск', 'Диксон', 'Хатанга', 'Усть-Оленёк'],
            5: ['Хабаровск', 'Комсомольск-на-Амуре', 'Николаевск-на-Амуре', 'Де-Кастри', 'Советская Гавань', 'Ванино', 'Александровск-Сахалинский', 'Оха', 'Ноглики', 'Магадан'],
            6: ['Новосибирск', 'Колпашево', 'Тюмень', 'Ханты-Мансийск', 'Нижневартовск', 'Сургут', 'Салехард', 'Лабытнанги', 'Игарка', 'Дудинка']
        };
        
        return defaultNames[cruiseId]?.[pointIndex] || `Точка ${pointIndex + 1}`;
    };

    // Функция для очистки всех маршрутов
    const clearAllRoutes = () => {
        Object.values(polylinesRef.current).forEach(polyline => {
            if (mapInstance.current && polyline) {
                mapInstance.current.removeLayer(polyline);
            }
        });
        polylinesRef.current = {};
        
        Object.values(routeMarkersRef.current).forEach(markers => {
            markers.forEach(marker => {
                if (mapInstance.current && marker) {
                    mapInstance.current.removeLayer(marker);
                }
            });
        });
        routeMarkersRef.current = {};
    };

    // Функция для показа попапа с информацией
    const showCruiseInfo = (cruise) => {
        setActiveCruise(cruise);
        setShowPopup(true);
    };

    useEffect(() => {
        const initializeMap = async () => {
            const L = await import('leaflet');
            
            if (mapRef.current && !mapInstance.current) {
                mapInstance.current = L.map(mapRef.current, {
                    center: [61.52401, 105.318756],
                    zoom: 4,
                    maxBounds: [[40, 60], [80, 180]], // Ограничения для России
                    maxBoundsViscosity: 1.0
                });

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                }).addTo(mapInstance.current);

                // Добавляем легенду
                const legend = L.control({ position: 'bottomright' });
                legend.onAdd = function(map) {
                    const div = L.DomUtil.create('div', 'info legend');
                    div.style.backgroundColor = 'white';
                    div.style.padding = '10px';
                    div.style.borderRadius = '5px';
                    div.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
                    
                    const rivers = ['Волга', 'Лена', 'Дон', 'Енисей', 'Амур', 'Обь'];
                    let html = '<h4 style="margin:0 0 10px 0; text-align:center;">Реки</h4>';
                    
                    rivers.forEach(river => {
                        html += `
                            <div style="display:flex; align-items:center; margin-bottom:5px;">
                                <div style="width:20px; height:20px; background-color:${getRiverColor(river)}; margin-right:8px;"></div>
                                <span>${river}</span>
                            </div>
                        `;
                    });
                    
                    div.innerHTML = html;
                    return div;
                };
                legend.addTo(mapInstance.current);

                // Инициализация маркеров
                initializeMarkers();
            }
        };

        const initializeMarkers = () => {
            const L = window.L;
            if (!L || !mapInstance.current) return;

            // Создаем маркеры для каждого круиза
            cruiseData.forEach((cruise) => {
                if (!cruise.latitude || !cruise.longitude) return;

                const coords = [cruise.latitude, cruise.longitude];
                const cruiseIcon = L.icon({
                    iconUrl: '/images/ship-icon.png',
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32],
                });
                
                markersRef.current[cruise.id] = L.marker(coords, { 
                    icon: cruiseIcon,
                    riseOnHover: true
                })
                    .addTo(mapInstance.current)
                    .on('click', () => {
                        focusOnCruise(cruise.id);
                        showCruiseInfo(cruise);
                    })
                    .bindPopup(`
                        <strong>${cruise.name}</strong><br>
                        Река: ${cruise.river}<br>
                        <button style="
                            margin-top:8px;
                            padding:4px 8px;
                            background-color:${getRiverColor(cruise.river)};
                            color:white;
                            border:none;
                            border-radius:4px;
                            cursor:pointer;
                        " onclick="event.stopPropagation(); 
                            document.getElementById('cruise-select').value='${cruise.id}'; 
                            document.getElementById('cruise-select').dispatchEvent(new Event('change'));
                        ">
                            Показать маршрут
                        </button>
                    `);
            });
        };

        initializeMap();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [cruiseData]);

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
                    onChange={(e) => focusOnCruise(e.target.value ? parseInt(e.target.value) : null)}
                    className={styles.cruiseSelect}
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
                <div style={{ height: '600px', width: '100%', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} ref={mapRef}></div>
            </div>

            {/* Попап с информацией о круизе */}
            {showPopup && activeCruise && (
                <div className={styles.cruisePopupOverlay} onClick={() => setShowPopup(false)}>
                    <div className={styles.cruisePopup} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={() => setShowPopup(false)}>×</button>
                        <h3 style={{ color: getRiverColor(activeCruise.river), marginBottom: '15px' }}>{activeCruise.name}</h3>
                        <p><strong>Река:</strong> {activeCruise.river}</p>
                        <p><strong>Описание:</strong> {activeCruise.description}</p>
                        <div className={styles.routePoints}>
                            <h4>Точки маршрута:</h4>
                            <ul>
                                {activeCruise.route?.map((point, index) => (
                                    <li key={index}>
                                        <strong>Точка {index + 1}:</strong> {getLocationName(activeCruise.id, index)}<br />
                                        Координаты: {point[0].toFixed(4)}, {point[1].toFixed(4)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button 
                            className={styles.showRouteButton}
                            style={{ backgroundColor: getRiverColor(activeCruise.river) }}
                            onClick={() => {
                                focusOnCruise(activeCruise.id);
                                setShowPopup(false);
                            }}
                        >
                            Показать на карте
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default dynamic(() => Promise.resolve(CruiseRoutes), { ssr: false });