'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './CruiseDetail.module.css';
import Loading from "@/components/Loading/Loading";

const CruiseDetail = () => {
    const { query } = useRouter();
    const { id } = query;
    const [cruise, setCruise] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchCruise = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/cruise/${id}`);
                const data = await response.json();
                setCruise(data);
            } catch (error) {
                console.error('Ошибка загрузки круиза:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCruise();
    }, [id]);

    if (loading) return <Loading />;;
    if (!cruise) return <p>Круиз не найден.</p>;

    return (
        <div className='layout'>
            <div className={styles.cruiseDetail}>
                <div className={styles.cruiseContainer}>
                    <img src={cruise.image_path} alt={cruise.name} className={styles.cruiseImage} />
                    <div className={styles.info}>
                        <h1>{cruise.name}</h1>
                        <p><strong>Река:</strong> {cruise.river}</p>
                        <p><strong>Описание:</strong> {cruise.description}</p>
                        <p><strong>Доступные места:</strong> {cruise.available_places} / {cruise.total_places}</p>
                        <p><strong>Каюты:</strong> {cruise.cabins}</p>
                        <p><strong>Дата начала:</strong> {cruise.start_date}</p>
                        <p><strong>Дата окончания:</strong> {cruise.end_date}</p>
                        <p><strong>Цена за человека:</strong> {cruise.price_per_person} ₽</p>
                        <p><strong>Общая длина маршрута:</strong> {cruise.total_distance ? `${cruise.total_distance} км` : 'Не указано'}</p>
                        {cruise.features && (
                            <p><strong>Особенности:</strong> {
                                Array.isArray(cruise.features)
                                    ? cruise.features.join(', ')
                                    : typeof cruise.features === 'string'
                                        ? (() => {
                                            try {
                                                const parsed = JSON.parse(cruise.features);
                                                return Array.isArray(parsed) ? parsed.join(', ') : 'Нет данных';
                                            } catch (e) {
                                                return 'Нет данных';
                                            }
                                        })()
                                        : 'Нет данных'
                            }</p>
                        )}
                        <a href="#" className={styles.backButton} onClick={() => window.history.back()}>
                            Назад
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CruiseDetail;
