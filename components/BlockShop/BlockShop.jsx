'use client';

import React, { useState } from 'react';
import styles from './BlockShop.module.css';

const BlockShop = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const items = [
        { id: 1, title: 'Сувенир 1', description: 'Красочный магнит с видом на Кремль. Он станет прекрасным сувениром и памятью о вашем путешествии в Москву. Этот магнит привнесет частичку российской столицы в ваш дом.', image: './images/souvenir1.jpg', price: '200₽' },
        { id: 2, title: 'Сувенир 2', description: 'Ручная роспись, дерево. Этот сувенир выполнен в лучших традициях народных мастеров и станет уникальным элементом декора вашего дома. Он идеально подходит как подарок.', image: './images/souvenir2.jpg', price: '300₽' },
        { id: 3, title: 'Сувенир 3', description: 'Красивый вид на Эрмитаж. Этот магнит с изображением одного из самых знаменитых музеев мира подарит вам кусочек культурного наследия Санкт-Петербурга, который будет радовать вас каждый день.', image: './images/souvenir3.jpg', price: '250₽' },
        { id: 4, title: 'Сувенир 4', description: 'Забавная ушанка. Этот стильный и теплый аксессуар не только добавит комфорта в зимнее время, но и станет ярким элементом вашего образа. Отличный подарок для друзей и близких.', image: './images/souvenir4.jpg', price: '500₽' },
    ];

    const handleModalOpen = (item) => {
        setSelectedItem(item);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedItem(null);
    };

    return (
        <div className="layout">
            <div className='title'>
                <h2 className='h1-title'>МАГАЗИН</h2>
            </div>
            <div className={styles.cardContainer}>
                {items.map((item) => (
                    <div key={item.id} className={styles.card}>
                        <div className={styles.cardContent}>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            <p className={`${styles.price} ${styles.fadeIn}`}>{item.price}</p>
                            <div className={styles.buttons}>
                                <button className={styles.buyButton}>Купить</button>
                                <button
                                    className={styles.detailsButton}
                                    onClick={() => handleModalOpen(item)}
                                >
                                    Подробнее
                                </button>
                            </div>
                        </div>
                        <div className={styles.cardImage}>
                            <img src={item.image} alt={item.title} />
                        </div>
                    </div>
                ))}
            </div>

            {modalOpen && selectedItem && (
                <div className={`${styles.modalOverlay} ${styles.fadeInOverlay}`} onClick={handleModalClose}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={handleModalClose}>×</button>
                        <h3>{selectedItem.title}</h3>
                        <img src={selectedItem.image} alt={selectedItem.title} className={styles.modalImage} />
                        <p>{selectedItem.description}</p>
                        <p className={`${styles.price} ${styles.modalPrice}`}>{selectedItem.price}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlockShop;
