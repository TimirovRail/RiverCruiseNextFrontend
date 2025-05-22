'use client';

import React, { useEffect, useState } from 'react';
import styles from './CruiseCards.module.css';
import Loading from "@/components/Loading/Loading";
import { API_BASE_URL } from '../../src/config';

const CruiseCards = () => {
    const [cruises, setCruises] = useState([]);
    const [sortedCruises, setSortedCruises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('name-asc');

    const fetchCruises = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/cruises`, {
                headers: {
                    'Accept': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (!Array.isArray(data)) {
                throw new Error('Данные с сервера не являются массивом');
            }
            setCruises(data);
            setSortedCruises(data);
            setError(null);
        } catch (error) {
            console.error('Ошибка загрузки круизов:', error);
            setError(error.message || 'Не удалось загрузить круизы. Проверьте соединение и попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCruises();
    }, []);

    useEffect(() => {
        let updatedCruises = [...cruises];

        updatedCruises.sort((a, b) => {
            if (sortOption === 'name-asc') {
                return a.name.localeCompare(b.name);
            } else if (sortOption === 'name-desc') {
                return b.name.localeCompare(a.name);
            } else if (sortOption === 'description-asc') {
                return a.description.localeCompare(b.description);
            } else if (sortOption === 'description-desc') {
                return b.description.localeCompare(a.description);
            } else if (sortOption === 'river-asc') {
                return a.river.localeCompare(b.river);
            } else if (sortOption === 'river-desc') {
                return b.river.localeCompare(a.river);
            } else if (sortOption === 'price-asc') {
                return a.price_per_person - b.price_per_person;
            } else if (sortOption === 'price-desc') {
                return b.price_per_person - a.price_per_person;
            }
            return 0;
        });

        setSortedCruises(updatedCruises);
    }, [sortOption, cruises]);

    if (loading) return <Loading />;

    return (
        <div className='layout'>
            <div className={styles.titleContainer}>
                <div className={styles.titleWrapper}>
                    <h2 className='h1-title'>ВСЕ КРУИЗЫ</h2>
                </div>
                <div className={styles.filterSortContainer}>
                    <div className={styles.filterGroup}>
                        <label>Сортировать по:</label>
                        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                            <option value="name-asc">Название (А-Я)</option>
                            <option value="name-desc">Название (Я-А)</option>
                            <option value="description-asc">Описание (А-Я)</option>
                            <option value="description-desc">Описание (Я-А)</option>
                            <option value="river-asc">Место круиза (А-Я)</option>
                            <option value="river-desc">Место круиза (Я-А)</option>
                            <option value="price-asc">Цена (по возрастанию)</option>
                            <option value="price-desc">Цена (по убыванию)</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    <p>{error}</p>
                    <button
                        onClick={fetchCruises}
                        className={styles.retryButton}
                    >
                        Попробовать снова
                    </button>
                </div>
            )}

            <div className={styles.card_container}>
                {sortedCruises.length > 0 ? (
                    sortedCruises.map((cruise, index) => (
                        <div key={cruise.id} className={styles.card} style={{ animationDelay: `${index * 0.2}s` }}>
                            <div className={styles.meta}>
                                <div className={styles.photo} style={{ backgroundImage: `url(${cruise.image_path})` }}></div>
                            </div>
                            <div className={styles.description}>
                                <h1>{cruise.name}</h1>
                                <p>{cruise.description}</p>
                                <p><strong>Место круиза:</strong> {cruise.river}</p>
                                <p><strong>Цена:</strong> {cruise.price_per_person} руб.</p>
                                <div className={styles.buttons}>
                                    <a href={`/cruise/${cruise.id}`} className={styles.readMore}>Читать больше</a>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    !error && <p>Круизы не найдены.</p>
                )}
            </div>
        </div>
    );
};

export default CruiseCards;