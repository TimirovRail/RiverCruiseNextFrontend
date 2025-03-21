'use client';

import React, { useState, useEffect } from 'react';
import styles from './CartModal.module.css';
import { useRouter } from 'next/navigation';

const CartModal = ({ isOpen, onClose }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            fetchCart();
        }
    }, [isOpen]);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/cart', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке корзины');
            }

            const data = await response.json();
            setCartItems(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (cartId, action) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/cart/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    cart_id: cartId,
                    action: action, // 'increase' или 'decrease'
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении количества');
            }

            const data = await response.json();
            // Обновляем только измененный элемент
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === cartId ? { ...item, quantity: data.quantity } : item
                )
            );
        } catch (error) {
            setError(error.message);
        }
    };

    const removeItem = async (cartId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/cart/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    cart_id: cartId,
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении товара');
            }

            // Удаляем элемент из состояния
            setCartItems(prevItems => prevItems.filter(item => item.id !== cartId));
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCheckout = () => {
        onClose(); // Закрываем модальное окно корзины
        router.push('/checkout'); // Перенаправляем на страницу оформления заказа
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>×</button>
                <h2>Корзина</h2>
                {loading ? (
                    <p>Загрузка...</p>
                ) : error ? (
                    <p className={styles.errorMessage}>{error}</p>
                ) : cartItems.length === 0 ? (
                    <p>Корзина пуста</p>
                ) : (
                    <>
                        <div className={styles.cartItems}>
                            {cartItems.map((item) => (
                                <div key={item.id} className={styles.cartItem}>
                                    <img src={item.souvenir.image} alt={item.souvenir.title} />
                                    <div className={styles.itemDetails}>
                                        <h3>{item.souvenir.title}</h3>
                                        <p>Цена: {item.souvenir.price} руб.</p>
                                        <div className={styles.quantityControl}>
                                            <button
                                                onClick={() => updateQuantity(item.id, 'decrease')}
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 'increase')}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            className={styles.removeButton}
                                            onClick={() => removeItem(item.id)}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.cartFooter}>
                            <button
                                className={styles.checkoutButton}
                                onClick={handleCheckout}
                            >
                                Перейти к оформлению заказа
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CartModal;