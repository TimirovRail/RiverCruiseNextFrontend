'use client';

import { useEffect, useState } from 'react';
import styles from './BlockRestaurant.module.css';
import Link from 'next/link';
import Loading from "@/components/Loading/Loading";
import { API_BASE_URL } from '../../src/config';

const BlockRestaurant = () => {
    const [services, setServices] = useState([]);
    const [sortedServices, setSortedServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('title-asc');

    const fetchServices = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/services`, {
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
            setServices(data);
            setSortedServices(data);
            setError(null);
        } catch (err) {
            console.error('Ошибка загрузки услуг:', err);
            setError(err.message || 'Не удалось загрузить услуги. Проверьте соединение и попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    useEffect(() => {
        let updatedServices = [...services];

        updatedServices.sort((a, b) => {
            if (sortOption === 'title-asc') {
                return a.title.localeCompare(b.title);
            } else if (sortOption === 'title-desc') {
                return b.title.localeCompare(a.title);
            } else if (sortOption === 'description-asc') {
                return a.description.localeCompare(b.description);
            } else if (sortOption === 'description-desc') {
                return b.description.localeCompare(a.description);
            } else if (sortOption === 'price-asc') {
                return a.price - b.price;
            } else if (sortOption === 'price-desc') {
                return b.price - a.price;
            }
            return 0;
        });

        setSortedServices(updatedServices);
    }, [sortOption, services]);

    if (loading) return <Loading />;

    return (
        <div className='layout'>
            <div className={styles.titleContainer}>
                <h2 className='h1-title'>УСЛУГИ</h2>
                <div className={styles.filterSortContainer}>
                    <div className={styles.filterGroup}>
                        <label>Сортировать по:</label>
                        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                            <option value="title-asc">Название (А-Я)</option>
                            <option value="title-desc">Название (Я-А)</option>
                            <option value="description-asc">Описание (А-Я)</option>
                            <option value="description-desc">Описание (Я-А)</option>
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
                        onClick={fetchServices}
                        className={styles.retryButton}
                    >
                        Попробовать снова
                    </button>
                </div>
            )}

            <div className={styles.wrapper}>
                {sortedServices.length > 0 ? (
                    sortedServices.map((item) => (
                        <div key={item.id} className={styles.card}>
                            <div className={styles.productImg}>
                                <img src={item.img} alt={item.title} />
                            </div>
                            <div className={styles.productInfo}>
                                <div className={styles.productText}>
                                    <h1>{item.title}</h1>
                                    <h2>{item.subtitle}</h2>
                                    <p>{item.description}</p>
                                </div>
                                <div className={styles.productPriceBtn}>
                                    <p>
                                        <span>{item.price}</span> руб.
                                    </p>
                                    <Link href={`/service/${item.id}`} passHref>
                                        <button type="button">Читать больше</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    !error && <p>Услуги не найдены.</p>
                )}
            </div>
        </div>
    );
};

export default BlockRestaurant;