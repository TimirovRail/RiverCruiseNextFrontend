'use client';
import React from 'react';
import styles from './MainScreen.module.css';

const Home = () => {
    const handleScrollToCruises = () => {
        const cruisesSection = document.getElementById('cruises-list');
        if (cruisesSection) {
            cruisesSection.scrollIntoView({ behavior: 'smooth' });
        }
    };
    return (
        <>
            <main className={styles.main}>
                <section className={styles.hero}>
                    <div className={styles.overlay}>
                        <h2 className={styles.subtitle}>ПОКОРИТЕ ВОДНЫЕ ГОРИЗОНТЫ РОССИИ</h2>
                        <h1 className={styles.title}>С РЕЧНЫМ КРУИЗОМ</h1>
                        <div>
                            <button onClick={handleScrollToCruises}><img src="/images/anchor.png" alt="Якорь" /></button>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Home;