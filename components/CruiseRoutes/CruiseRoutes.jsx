'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './CruiseRoutes.module.css';

const cruiseIcon = new L.Icon({
    iconUrl: '/images/ship-icon.png',
    iconSize: [32, 32],
});

const CruiseRoutes = () => {
    const cruisePoints = [
        { coords: [57.6260744, 39.8844708], name: 'Ярославль', river: 'Волга' },
        { coords: [62.02762, 129.73257], name: 'Якутск', river: 'Лена' },
        { coords: [55.35565, 89.46031], name: 'Красноярск', river: 'Енисей' },
        { coords: [52.033973, 113.500282], name: 'Благовещенск', river: 'Амур' },
        { coords: [47.222531, 39.718705], name: 'Ростов-на-Дону', river: 'Дон' },
        { coords: [56.49771, 84.97437], name: 'Томск', river: 'Обь' },
    ];

    return (
        <div>
            <div className='title'>
                <h2 className='h1-title'>КАРТА МАРШРУТОВ</h2>
            </div>
            <div className='layout'>
                <div className={styles.mapContainer}>
                    <MapContainer
                        center={[61.52401, 105.318756]} 
                        zoom={4}
                        style={{ height: '500px', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {cruisePoints.map((point, index) => (
                            <Marker key={index} position={point.coords} icon={cruiseIcon}>
                                <Popup>
                                    <strong>{point.name}</strong> <br />
                                    Река: {point.river}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default CruiseRoutes;
