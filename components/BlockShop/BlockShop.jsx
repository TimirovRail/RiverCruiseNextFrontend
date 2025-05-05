'use client';

import React, { useState, useEffect } from 'react';
import styles from './BlockShop.module.css';
import { useRouter } from 'next/navigation';
import Loading from "@/components/Loading/Loading";
import CartModal from './CartModal'; 
import { API_BASE_URL } from '../../src/config';

const BlockShop = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [souvenirs, setSouvenirs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token'); 
        const user = JSON.parse(localStorage.getItem('user')); 

        if (token && user) {
            setIsAuthenticated(true); 
            fetchSouvenirs(); 
        } else {
            router.push('/login'); 
        }
    }, [router]);

    const addToCart = async (souvenirId) => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user) {
            alert('Пожалуйста, авторизуйтесь.');
            router.push('/login');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/cart/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, 
                },
                body: JSON.stringify({
                    souvenir_id: souvenirId,
                    quantity: 1,
                    user_id: user.id, 
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при добавлении товара в корзину');
            }

            alert('Товар добавлен в корзину!');
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    const fetchSouvenirs = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/souvenirs`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке сувениров');
            }

            const data = await response.json();
            setSouvenirs(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleModalOpen = (item) => {
        setSelectedItem(item);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedItem(null);
    };

    if (!isAuthenticated) {
        return (
            <div className="layout">
                <div className="title">
                    <h2 className="h1-title">МАГАЗИН</h2>
                </div>
                <p className={styles.authMessage}>Пожалуйста, авторизуйтесь, чтобы получить доступ к магазину.</p>
            </div>
        );
    }

    if (loading) return <Loading />;

    if (error) {
        return (
            <div className="layout">
                <div className="title">
                    <h2 className="h1-title">МАГАЗИН</h2>
                </div>
                <p className={styles.errorMessage}>Ошибка: {error}</p>
            </div>
        );
    }

    return (
        <div className="layout">
            <div className="title">
                <h2 className="h1-title">МАГАЗИН</h2>
                <button className={styles.cartButton} onClick={() => setIsCartOpen(true)}>
                    Корзина
                </button>
            </div>
            <div className={styles.cardContainer}>
                {souvenirs.map((item) => (
                    <div key={item.id} className={styles.card}>
                        <div className={styles.cardContent}>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            <p className={`${styles.price} ${styles.fadeIn}`}>{item.price}</p>
                            <div className={styles.buttons}>
                                <button className={styles.buyButton} onClick={() => addToCart(item.id)}>
                                    Купить
                                </button>
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

            {/* Модальное окно с деталями товара */}
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

            {/* Модальное окно корзины */}
            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
};

export default BlockShop;