'use client';

import React, { useState } from 'react';
import styles from './Checkout.module.css';
import { useRouter } from 'next/navigation';

const Checkout = () => {
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!address) {
            alert('Пожалуйста, введите адрес доставки.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    address,
                    payment_method: paymentMethod,
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка при оформлении заказа');
            }

            alert('Заказ успешно оформлен!');
            router.push('/'); // Перенаправляем на главную страницу
        } catch (error) {
            setError(error.message);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.checkoutContainer}>
            <h2>Оформление заказа</h2>
            <form onSubmit={handleSubmit} className={styles.checkoutForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="address">Адрес доставки:</label>
                    <input
                        type="text"
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="paymentMethod">Способ оплаты:</label>
                    <select
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <option value="card">Карта</option>
                        <option value="cash">Наличные</option>
                    </select>
                </div>

                {error && <p className={styles.errorMessage}>{error}</p>}

                <button type="submit" disabled={loading} className={styles.submitButton}>
                    {loading ? 'Оформление...' : 'Подтвердить заказ'}
                </button>
            </form>
        </div>
    );
};

export default Checkout;