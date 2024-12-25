import React from 'react';
import styles from './AboutUs.module.css';

const AboutUs = () => {
    return (
        <div>
            <div className={styles['title']}> 
                <img src="/images/title.png" alt="" />
                <h2 className={styles['h1-title']}>О нас</h2>
            </div>
            <div className={styles['about-us']}>
                <div className={styles['about-content']}>
                    <p className={styles['about-description']}>
                        Мы — команда любителей приключений и страстных путешественников, которые хотят поделиться
                        лучшими речными круизами России с вами! Наши круизы — это уникальное сочетание комфорта,
                        драйва и знакомства с культурой, природой и историей нашей удивительной страны. Присоединяйтесь к нам,
                        и откройте для себя захватывающие путешествия, незабываемые эмоции и новые впечатления!
                    </p>
                    <button className={styles['learn-more-button']}>Читать больше</button>
                </div>
                <div className={styles['about-image']}>
                    <img src="/images/aboutus.png" alt="River Cruise" />
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
