'use client';

import { useEffect, useState } from 'react';
import styles from './BlockRestaurant.module.css';
import Link from 'next/link';

const BlockRestaurant = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/services');
                if (!response.ok) {
                    throw new Error('Ошибка при загрузке данных');
                }
                const data = await response.json();
                setServices(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>Ошибка: {error}</p>;

    return (
        <div className='layout'>
            <div className='title'>
                <h2 className='h1-title'>УСЛУГИ</h2>
            </div>
            <div className={styles.wrapper}>
                {services.map((item) => (
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
                ))}
            </div>
        </div>
    );
};

export default BlockRestaurant;
