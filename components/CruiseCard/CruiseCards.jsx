'use client';

import React, { useEffect, useState } from 'react';
import styles from './CruiseCards.module.css';
import Loading from "@/components/Loading/Loading";

const CruiseCards = () => {
    const [cruises, setCruises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCruises = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/cruises');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCruises(data);
            } catch (error) {
                console.error('Ошибка загрузки круизов:', error);
                setError('Не удалось загрузить круизы. Попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };
        fetchCruises();
    }, []);

    if (loading) return <Loading />;
    if (error) return <p className={styles.errorMessage}>{error}</p>;

    return (
        <div className='layout'>
            <div className='title'>
                <h2 className='h1-title'>ВСЕ КРУИЗЫ</h2>
            </div>
            <div className={styles.card_container}>
                {cruises.map((cruise, index) => (
                    <div key={cruise.id} className={styles.card} style={{ animationDelay: `${index * 0.2}s` }}>
                        <div className={styles.meta}>
                            <div className={styles.photo} style={{ backgroundImage: `url(${cruise.image_path})` }}></div>
                        </div>
                        <div className={styles.description}>
                            <h1>{cruise.name}</h1>
                            <p>{cruise.description}</p>
                            <div className={styles.buttons}>
                                <a href={`/cruise/${cruise.id}`} className={styles.readMore}>Читать больше</a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CruiseCards;