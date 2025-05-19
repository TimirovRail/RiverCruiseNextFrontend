'use client';

import { useState, useEffect } from 'react';
import styles from './CruiseSchedules.module.css'; // Создай CSS-модуль
import { API_BASE_URL } from './../src/config';

export default function CruiseSchedules() {
    const [cruises, setCruises] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
            fetchCruises(token);
        }
    }, []);

    const fetchCruises = async (token) => {
        const res = await fetch(`${API_BASE_URL}/api/cruises`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        setCruises(data);
    };

    return (
        <div className="layout">
            <div className="title">
                <h2 className="h1-title">СПИСОК РЕЙСОВ</h2>
            </div>
            <div className={styles.schedulesContainer}>
                {cruises.map((cruise) => (
                    <div key={cruise.id} className={styles.cruise}>
                        <h3>{cruise.name}</h3>
                        <ul>
                            {cruise.schedules.map((schedule) => (
                                <li key={schedule.id} className={styles.schedule}>
                                    <p>Отправление: {new Date(schedule.departure_datetime).toLocaleString()}</p>
                                    <p>Прибытие: {new Date(schedule.arrival_datetime).toLocaleString()}</p>
                                    <p>Свободных мест: {schedule.available_places}</p>
                                    {isAuthenticated && (
                                        <a href="/bookings" className={styles.bookLink}>Забронировать</a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
                {!isAuthenticated && (
                    <p>Для бронирования рейса необходимо <a href="/login">авторизоваться</a>.</p>
                )}
            </div>
        </div>
    );
}