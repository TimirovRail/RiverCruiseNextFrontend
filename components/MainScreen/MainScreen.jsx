import React from 'react';
import styles from './MainScreen.module.css';
import Header from '../Header/Header';

const Home = () => {
    return (
        <>
            <Header />
            <main className={styles.main}>
                <section className={styles.hero}>
                    <div className={styles.overlay}>
                        <h1 className={styles.title}>КРУИЗ ПО РЕКАМ РОССИИ</h1>
                        <button className={styles.ctaButton}>Забронировать круиз</button>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Home;
