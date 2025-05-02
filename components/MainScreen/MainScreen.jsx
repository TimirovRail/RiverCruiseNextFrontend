import React from 'react';
import styles from './MainScreen.module.css';

const Home = () => {
    return (
        <>
            <main className={styles.main}>
                <section className={styles.hero}>
                    <div className={styles.overlay}>
                        <h2 className={styles.subtitle}>ПОКОРИТЕ ВОДНЫЕ ГОРИЗОНТЫ РОССИИ</h2>
                        <h1 className={styles.title}>С РЕЧНЫМ КРУИЗОМ</h1>
                        <div>
                            <button><img src="/images/anchor.png" alt="Якорь"/></button>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Home;