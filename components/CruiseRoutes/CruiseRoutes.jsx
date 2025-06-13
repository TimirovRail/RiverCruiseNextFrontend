'use client';
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import styles from './CruiseRoutes.module.css';

// Моковые данные с 9–10 точками для каждого круиза
const MOCK_CRUISE_DATA = [
  {
    id: 1,
    name: "Волга Премиум",
    river: "Волга",
    latitude: 56.3287,
    longitude: 44.002,
    routeCities: [
      { name: "Нижний Новгород", sights: "Кремль, Чкаловская лестница", lat: 56.3287, lng: 44.002 },
      { name: "", lat: 56.2500, lng: 45.0000 }, // Промежуточная точка
      { name: "Чебоксары", sights: "Залив, Введенский собор", lat: 56.1467, lng: 47.2511 },
      { name: "", lat: 56.1000, lng: 47.8000 }, // Промежуточная точка
      { name: "Казань", sights: "Кремль, мечеть Кул-Шариф", lat: 55.7950, lng: 49.1063 },
      { name: "", lat: 55.6000, lng: 50.0000 }, // Промежуточная точка
      { name: "Самара", sights: "Набережная, Жигулёвское пиво", lat: 53.1959, lng: 50.1018 },
      { name: "", lat: 52.8000, lng: 49.4000 }, // Промежуточная точка
      { name: "Волгоград", sights: "Мамаев курган, Родина-мать", lat: 48.7071, lng: 44.5170 },
      { name: "", lat: 49.1000, lng: 44.7000 } // Промежуточная точка
    ],
    description: "Эксклюзивный круиз по Волге."
  },
  {
    id: 2,
    name: "Лена Экспедишн",
    river: "Лена",
    latitude: 62.0283,
    longitude: 129.7325,
    routeCities: [
      { name: "Якутск", sights: "Музей мамонта, Ленские столбы", lat: 62.0283, lng: 129.7325 },
      { name: "", lat: 61.9000, lng: 129.6000 }, // Промежуточная точка
      { name: "Покровск", sights: "Храм Покрова, местный музей", lat: 61.4844, lng: 129.1486 },
      { name: "", lat: 61.3000, lng: 129.0000 }, // Промежуточная точка
      { name: "Олёкминск", sights: "Исторический центр", lat: 60.3742, lng: 120.4262 },
      { name: "", lat: 60.5000, lng: 122.0000 }, // Промежуточная точка
      { name: "Сангар", sights: "Речные виды, местная культура", lat: 63.9241, lng: 127.4736 },
      { name: "", lat: 63.5000, lng: 128.0000 }, // Промежуточная точка
      { name: "", lat: 64.0000, lng: 127.5000 } // Промежуточная точка
    ],
    description: "Экспедиционный круиз по Лене."
  },
  {
    id: 3,
    name: "Дон Классик",
    river: "Дон",
    latitude: 47.2313,
    longitude: 39.7233,
    routeCities: [
      { name: "Ростов-на-Дону", sights: "Набережная, Ростовский собор", lat: 47.2313, lng: 39.7233 },
      { name: "", lat: 47.5000, lng: 40.0000 }, // Промежуточная точка
      { name: "Азов", sights: "Крепость, музей", lat: 47.1078, lng: 39.4163 },
      { name: "", lat: 47.8000, lng: 41.0000 }, // Промежуточная точка
      { name: "Волгоград", sights: "Мамаев курган, Родина-мать", lat: 48.7071, lng: 44.5170 },
      { name: "", lat: 49.0000, lng: 44.2000 }, // Промежуточная точка
      { name: "Воронеж", sights: "Благовещенский собор, набережная", lat: 51.6608, lng: 39.2003 },
      { name: "", lat: 51.4000, lng: 39.5000 }, // Промежуточная точка
      { name: "", lat: 50.8000, lng: 40.0000 } // Промежуточная точка
    ],
    description: "Классический круиз по Дону."
  },
  {
    id: 4,
    name: "Енисей Голд",
    river: "Енисей",
    latitude: 56.0184,
    longitude: 92.8672,
    routeCities: [
      { name: "Красноярск", sights: "Столбы, часовня Параскевы", lat: 56.0184, lng: 92.8672 },
      { name: "", lat: 56.5000, lng: 92.6000 }, // Промежуточная точка
      { name: "Енисейск", sights: "Спасо-Преображенский монастырь", lat: 58.4497, lng: 92.1797 },
      { name: "", lat: 59.0000, lng: 92.0000 }, // Промежуточная точка
      { name: "Игарка", sights: "Музей вечной мерзлоты", lat: 67.4658, lng: 86.5618 },
      { name: "", lat: 66.8000, lng: 86.8000 }, // Промежуточная точка
      { name: "Дудинка", sights: "Таймырский музей", lat: 69.4058, lng: 86.1777 },
      { name: "", lat: 68.5000, lng: 86.3000 }, // Промежуточная точка
      { name: "", lat: 67.0000, lng: 86.5000 }, // Промежуточная точка
      { name: "", lat: 65.5000, lng: 87.0000 } // Промежуточная точка
    ],
    description: "Премиальный круиз по Енисею."
  },
  {
    id: 5,
    name: "Амур Мистери",
    river: "Амур",
    latitude: 48.4802,
    longitude: 135.0719,
    routeCities: [
      { name: "Хабаровск", sights: "Набережная, Спасо-Преображенский собор", lat: 48.4802, lng: 135.0719 },
      { name: "", lat: 48.6000, lng: 135.5000 }, // Промежуточная точка
      { name: "Комсомольск-на-Амуре", sights: "Мемориал Победы", lat: 50.5503, lng: 137.0099 },
      { name: "", lat: 50.8000, lng: 136.8000 }, // Промежуточная точка
      { name: "Амурск", sights: "Набережная Амура", lat: 50.2261, lng: 136.8994 },
      { name: "", lat: 51.0000, lng: 137.2000 }, // Промежуточная точка
      { name: "Николаевск-на-Амуре", sights: "Речной порт", lat: 53.1462, lng: 140.7119 },
      { name: "", lat: 52.8000, lng: 140.5000 }, // Промежуточная точка
      { name: "", lat: 52.3000, lng: 140.0000 } // Промежуточная точка
    ],
    description: "Загадочное путешествие по Амуру."
  },
  {
    id: 6,
    name: "Обь Эксплорер",
    river: "Обь",
    latitude: 55.0111,
    longitude: 82.9346,
    routeCities: [
      { name: "Новосибирск", sights: "Оперный театр, зоопарк", lat: 55.0111, lng: 82.9346 },
      { name: "", lat: 55.5000, lng: 82.5000 }, // Промежуточная точка
      { name: "Томск", sights: "Деревянная архитектура", lat: 56.4886, lng: 84.9523 },
      { name: "", lat: 57.0000, lng: 83.0000 }, // Промежуточная точка
      { name: "Сургут", sights: "Исторический музей", lat: 61.2540, lng: 73.3962 },
      { name: "", lat: 61.8000, lng: 73.0000 }, // Промежуточная точка
      { name: "Салехард", sights: "Обдорский острог", lat: 66.5300, lng: 66.6019 },
      { name: "", lat: 66.0000, lng: 67.0000 }, // Промежуточная точка
      { name: "", lat: 65.5000, lng: 67.5000 }, // Промежуточная точка
      { name: "", lat: 64.8000, lng: 68.0000 } // Промежуточная точка
    ],
    description: "Исследовательский круиз по Оби."
  }
];

const CruiseRoutes = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const shipMarkerRef = useRef(null);
  const userRouteRef = useRef(null);
  const animationRef = useRef(null);
  const [cruiseData, setCruiseData] = useState(MOCK_CRUISE_DATA);
  const [selectedCruiseId, setSelectedCruiseId] = useState(null);
  const [activeCruise, setActiveCruise] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [userCity, setUserCity] = useState('');
  const [userRouteInfo, setUserRouteInfo] = useState(null);

  const getRiverColor = (river) => {
    const colors = {
      'Волга': '#2A376D',
      'Лена': '#3A6EA5',
      'Дон': '#4B8F8C',
      'Енисей': '#C45B7A',
      'Амур': '#E67E22',
      'Обь': '#16A085'
    };
    return colors[river] || '#2A376D';
  };

  useEffect(() => {
    if (!isMapReady || !mapRef.current || mapInstanceRef.current) return;

    const initMap = () => {
      mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
        center: [61.52401, 105.318756],
        zoom: 4,
        controls: ['zoomControl', 'fullscreenControl']
      });

      const legend = new window.ymaps.control.ListBox({
        data: { title: 'Реки' },
        items: [
          new window.ymaps.control.ListBoxItem({ data: { content: `<span style="color: #2A376D;">Волга</span>` } }),
          new window.ymaps.control.ListBoxItem({ data: { content: `<span style="color: #3A6EA5;">Лена</span>` } }),
          new window.ymaps.control.ListBoxItem({ data: { content: `<span style="color: #4B8F8C;">Дон</span>` } }),
          new window.ymaps.control.ListBoxItem({ data: { content: `<span style="color: #C45B7A;">Енисей</span>` } }),
          new window.ymaps.control.ListBoxItem({ data: { content: `<span style="color: #E67E22;">Амур</span>` } }),
          new window.ymaps.control.ListBoxItem({ data: { content: `<span style="color: #16A085;">Обь</span>` } })
        ]
      });
      mapInstanceRef.current.controls.add(legend, { position: { bottom: 20, right: 20 } });

      initializeMarkers();
    };

    if (window.ymaps) {
      window.ymaps.ready(initMap);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [isMapReady]);

  const initializeMarkers = () => {
    if (!mapInstanceRef.current) return;

    cruiseData.forEach((cruise) => {
      if (!cruise.latitude || !cruise.longitude) return;

      const marker = new window.ymaps.Placemark([cruise.latitude, cruise.longitude], {
        hintContent: cruise.name,
        balloonContent: `
          <strong>${cruise.name}</strong><br>
          Река: ${cruise.river}<br>
          Описание: ${cruise.description}<br>
          Достопримечательности: ${cruise.routeCities.filter(city => city.name).map(city => city.sights).join(', ')}<br>
          <button style="
            margin-top:8px;
            padding:4px 8px;
            background-color:${getRiverColor(cruise.river)};
            color:white;
            border:none;
            border-radius:4px;
            cursor:pointer;
          " onclick="document.getElementById('cruise-select').value='${cruise.id}'; 
            document.getElementById('cruise-select').dispatchEvent(new Event('change'));">
            Показать маршрут
          </button>
        `
      }, {
        iconLayout: 'default#image',
        iconImageHref: '/images/ship-icon.png',
        iconImageSize: [32, 32],
        iconImageOffset: [-16, -16]
      });

      marker.events.add('click', () => {
        focusOnCruise(cruise.id);
        setActiveCruise(cruise);
        setShowPopup(true);
      });

      mapInstanceRef.current.geoObjects.add(marker);
    });
  };

  const focusOnCruise = (cruiseId) => {
    setSelectedCruiseId(cruiseId);
    const cruise = cruiseData.find(c => c.id === parseInt(cruiseId));
    if (cruise && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter([cruise.latitude, cruise.longitude], 6, {
        duration: 1000
      });
      drawRoute(cruise);
    } else if (!cruiseId && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter([61.52401, 105.318756], 4, { duration: 1000 });
      clearMap();
    }
  };

  const drawRoute = (cruise) => {
    if (!mapInstanceRef.current || !cruise.routeCities) return;

    clearMap();

    const points = cruise.routeCities.map(city => [city.lat, city.lng]).filter(point => point[0] && point[1]);

    if (points.length < 1) {
      console.warn('Недостаточно координат для построения маршрута');
      return;
    }

    const routeLine = new window.ymaps.Polyline(points, {
      balloonContent: cruise.name
    }, {
      strokeColor: getRiverColor(cruise.river),
      strokeWidth: 4,
      strokeOpacity: 0.9
    });
    mapInstanceRef.current.geoObjects.add(routeLine);

    cruise.routeCities.forEach((city, index) => {
      if (!city.name) return; // Пропускаем промежуточные точки
      const point = [city.lat, city.lng];
      const marker = new window.ymaps.Placemark(point, {
        hintContent: city.name,
        balloonContent: `
          <strong>${cruise.name}</strong><br>
          Город: ${city.name}<br>
          Достопримечательности: ${city.sights}<br>
          Широта: ${point[0].toFixed(4)}<br>
          Долгота: ${point[1].toFixed(4)}
        `
      }, {
        iconLayout: 'default#imageWithContent',
        iconImageHref: '/images/marker.png',
        iconImageSize: [24, 24],
        iconImageOffset: [-12, -12],
        iconContentLayout: window.ymaps.templateLayoutFactory.createClass(
          `<div style="background-color: ${getRiverColor(cruise.river)}; color: white; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px;">${index + 1}</div>`
        )
      });
      mapInstanceRef.current.geoObjects.add(marker);
    });

    animateShip(points, getRiverColor(cruise.river));
  };

  const animateShip = (route, color) => {
    if (shipMarkerRef.current) {
      mapInstanceRef.current.geoObjects.remove(shipMarkerRef.current);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    shipMarkerRef.current = new window.ymaps.Placemark(route[0], {}, {
      iconLayout: 'default#image',
      iconImageHref: '/images/ship-icon.png',
      iconImageSize: [32, 32],
      iconImageOffset: [-16, -16]
    });
    mapInstanceRef.current.geoObjects.add(shipMarkerRef.current);

    let index = 0;
    const step = () => {
      if (index >= route.length - 1) {
        index = 0;
        shipMarkerRef.current.geometry.setCoordinates(route[0]);
      }

      const start = route[index];
      const end = route[index + 1] || route[0];
      const steps = 300;
      let stepCount = 0;

      const animate = () => {
        if (stepCount >= steps) {
          index++;
          step();
          return;
        }

        const lat = start[0] + (end[0] - start[0]) * (stepCount / steps);
        const lng = start[1] + (end[1] - start[1]) * (stepCount / steps);
        shipMarkerRef.current.geometry.setCoordinates([lat, lng]);
        stepCount++;
        animationRef.current = requestAnimationFrame(animate);
      };

      animate();
    };

    step();
  };

  const clearMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.geoObjects.removeAll();
      initializeMarkers();
    }
    if (shipMarkerRef.current) {
      mapInstanceRef.current.geoObjects.remove(shipMarkerRef.current);
      shipMarkerRef.current = null;
    }
    if (userRouteRef.current) {
      mapInstanceRef.current.geoObjects.remove(userRouteRef.current);
      userRouteRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const buildUserRoute = async () => {
    if (!userCity || !selectedCruiseId || !mapInstanceRef.current) return;

    const cruise = cruiseData.find(c => c.id === parseInt(selectedCruiseId));
    if (!cruise) return;

    try {
      if (userRouteRef.current) {
        mapInstanceRef.current.geoObjects.remove(userRouteRef.current);
      }

      const multiRoute = new window.ymaps.multiRouter.MultiRoute({
        referencePoints: [userCity, cruise.routeCities[0].name],
        params: { routingMode: 'auto', results: 1 }
      }, {
        wayPointStartIconLayout: 'default#image',
        wayPointStartIconImageHref: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23000000"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>',
        wayPointStartIconImageSize: [32, 32],
        wayPointStartIconImageOffset: [-16, -16],
        wayPointFinishIconLayout: 'default#image',
        wayPointFinishIconImageHref: '/images/ship-icon.png',
        wayPointFinishIconImageSize: [32, 32],
        wayPointFinishIconImageOffset: [-16, -16],
        routeActiveStrokeWidth: 4,
        routeActiveStrokeColor: '#DC2626'
      });

      multiRoute.model.events.add('requestsuccess', () => {
        const activeRoute = multiRoute.getActiveRoute();
        if (activeRoute) {
          const duration = activeRoute.properties.get('duration').value;
          const hours = Math.floor(duration / 3600);
          const minutes = Math.floor((duration % 3600) / 60);
          setUserRouteInfo({
            duration: `${hours} ч ${minutes} мин`
          });
          mapInstanceRef.current.geoObjects.add(multiRoute);
          userRouteRef.current = multiRoute;
        } else {
          console.warn('Маршрут не построен');
        }
      });

      multiRoute.model.events.add('requestfail', (error) => {
        console.error('Ошибка построения маршрута:', error);
      });
    } catch (error) {
      console.error('Общая ошибка построения маршрута:', error);
    }
  };

  return (
    <>
      <Script
        src="https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=12c4ddc3-85ba-4f58-8508-3bc9bca108f1"
        strategy="afterInteractive"
        onLoad={() => setIsMapReady(true)}
      />
      <div>
        <div className="title">
          <h2 className="h1-title">КАРТА МАРШРУТОВ</h2>
        </div>
        <div className={styles.cruiseSelector}>
          <label htmlFor="cruise-select" className={styles.selectorLabel}>
            Выберите круиз:
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
        {selectedCruiseId && (
          <div className={styles.userRouteInput}>
            <label htmlFor="user-city" className={styles.selectorLabel}>
              Ваш город отправления:
            </label>
            <input
              id="user-city"
              type="text"
              value={userCity}
              onChange={(e) => setUserCity(e.target.value)}
              placeholder="Введите город"
              className={styles.userCityInput}
            />
            <button
              onClick={buildUserRoute}
              className={styles.showRouteButton}
              style={{ backgroundColor: getRiverColor(cruiseData.find(c => c.id === parseInt(selectedCruiseId))?.river) }}
            >
              Построить маршрут
            </button>
          </div>
        )}
        {userRouteInfo && (
          <div className={styles.userRouteInfo}>
            <h4>Маршрут до круиза</h4>
            <div>
              <p><strong>Транспорт:</strong> Машина</p>
              <p><strong>Время в пути:</strong> {userRouteInfo.duration}</p>
            </div>
          </div>
        )}
        {showPopup && activeCruise && (
          <div className={styles.cruisePopupOverlay} onClick={() => setShowPopup(false)}>
            <div className={styles.cruisePopup} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeButton} onClick={() => setShowPopup(false)}>×</button>
              <h3 style={{ color: getRiverColor(activeCruise.river), marginBottom: '15px' }}>{activeCruise.name}</h3>
              <p><strong>Река:</strong> {activeCruise.river}</p>
              <p><strong>Описание:</strong> {activeCruise.description}</p>
              <div className={styles.routePoints}>
                <h4>Точки маршрута и достопримечательности:</h4>
                <ul>
                  {activeCruise.routeCities?.filter(city => city.name).map((city, index) => (
                    <li key={index}>
                      <strong>Точка {index + 1}:</strong> {city.name}<br />
                      Достопримечательности: {city.sights}
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
    </>
  );
};

export default dynamic(() => Promise.resolve(CruiseRoutes), { ssr: false });