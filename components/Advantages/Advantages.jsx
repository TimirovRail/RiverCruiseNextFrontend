import React from 'react';
import styles from './Advantages.module.css'; 
import { FaAnchor, FaCompass, FaCocktail, FaLeaf } from 'react-icons/fa';

const Advantages = () => {
    return (
        <div className='layout'>
            <div className='title'>
                <h2 className='h1-title'>НАШИ ПРЕИМУЩЕСТВА</h2>
            </div>
            <div className={styles['advantages']}>
                <div className={styles['advantages-cards']}>
                    <div className={styles['advantage-card']}>
                        <FaAnchor className={styles['advantage-icon']} />
                        <h3 className={styles['advantage-card-title']}>Уникальные маршруты</h3>
                        <p className={styles['advantage-card-description']}>
                            Откройте для себя уникальные и захватывающие маршруты по рекам России. Путешествия, которые никого не оставят равнодушным.
                        </p>
                    </div>
                    <div className={styles['advantage-card']}>
                        <FaCompass className={styles['advantage-icon']} />
                        <h3 className={styles['advantage-card-title']}>Комфортабельные условия</h3>
                        <p className={styles['advantage-card-description']}>
                            Наша команда создает идеальные условия для отдыха. Наслаждайтесь комфортом и уютом, словно на роскошной яхте.
                        </p>
                    </div>
                    <div className={styles['advantage-card']}>
                        <FaCocktail className={styles['advantage-icon']} />
                        <h3 className={styles['advantage-card-title']}>Развлекательная программа</h3>
                        <p className={styles['advantage-card-description']}>
                            Вечеринки, коктейльные мероприятия и незабываемые шоу — мы знаем, как сделать ваш отдых насыщенным и интересным.
                        </p>
                    </div>
                    <div className={styles['advantage-card']}>
                        <FaLeaf className={styles['advantage-icon']} />
                        <h3 className={styles['advantage-card-title']}>Экологический туризм</h3>
                        <p className={styles['advantage-card-description']}>
                            Мы заботимся о природе и предлагаем экологически чистые путешествия, оставляющие после себя только воспоминания.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Advantages;
