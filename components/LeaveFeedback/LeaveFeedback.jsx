'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LeaveFeedback.module.css';
import { API_BASE_URL } from '../../src/config';
import Loading from "@/components/Loading/Loading";

export default function LeaveFeedback() {
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState('5');
    const [cruiseId, setCruiseId] = useState('');
    const [bookingId, setBookingId] = useState('');
    const [cruises, setCruises] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setIsAuthenticated(true);
            setUser(JSON.parse(storedUser));
            fetchAvailableCruises(token);
        } else {
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    }, []);

    const fetchAvailableCruises = async (token) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/available-cruises`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || `Ошибка сервера: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            if (!Array.isArray(data)) {
                throw new Error('Данные с сервера не являются массивом');
            }
            setCruises(data);
            setError(null);
        } catch (error) {
            console.error('Ошибка загрузки круизов:', error);
            setError(error.message || 'Не удалось загрузить доступные круизы. Попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCruiseChange = (e) => {
        const selectedCruise = cruises.find(cruise => cruise.cruise_id === parseInt(e.target.value));
        if (selectedCruise) {
            setCruiseId(selectedCruise.cruise_id);
            setBookingId(selectedCruise.booking_id);
        } else {
            setCruiseId('');
            setBookingId('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!isAuthenticated) {
            setError('Для отправки отзыва необходимо авторизоваться');
            return;
        }

        if (!comment || !cruiseId || !bookingId) {
            setError('Пожалуйста, заполните все поля');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/auth/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    cruise_id: cruiseId,
                    booking_id: bookingId,
                    comment,
                    rating,
                    user_id: user.id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Ошибка сервера: ${response.status} ${response.statusText}`);
            }

            const newReview = await response.json();
            setComment('');
            setRating('5');
            setCruiseId('');
            setBookingId('');
            setSubmitted(true);
            setError(null);
            setTimeout(() => setSubmitted(false), 3000);

            // Обновляем список доступных круизов после отправки отзыва
            fetchAvailableCruises(token);
        } catch (error) {
            console.error('Ошибка отправки отзыва:', error);
            setError(error.message || 'Не удалось отправить отзыв. Попробуйте снова.');
        }
    };

    return (
        <div className="layout">
            <div className="title">
                <h2 className="h1-title">ОСТАВЬ СВОЙ ОТЗЫВ</h2>
            </div>
            <div className={styles.feedbackContainer}>
                <div className={styles.formWrapper}>
                    {isLoading ? (
                        <Loading />
                    ) : (
                        <>
                            {submitted && <div className={styles.successMessage}>Отзыв отправлен!</div>}
                            {error && (
                                <div className={styles.errorMessage}>
                                    <p>{error}</p>
                                    {error.includes('авторизоваться') && (
                                        <button
                                            onClick={() => router.push('/login')}
                                            className={styles.loginButton}
                                        >
                                            Авторизоваться
                                        </button>
                                    )}
                                </div>
                            )}
                            {!isAuthenticated ? (
                                <div className={styles.noAuthMessage}>
                                    <p>Чтобы оставить отзыв, пожалуйста, авторизуйтесь.</p>
                                    <button
                                        onClick={() => router.push('/login')}
                                        className={styles.loginButton}
                                    >
                                        Войти
                                    </button>
                                </div>
                            ) : cruises.length === 0 ? (
                                <p className={styles.noCruisesMessage}>
                                    У вас нет завершённых круизов, о которых можно оставить отзыв.
                                    Убедитесь, что круиз завершён, билет оплачен, и менеджер отметил ваше участие.
                                </p>
                            ) : (
                                <form onSubmit={handleSubmit} className={styles.feedbackForm}>
                                    <div className={styles.inputGroup}>
                                        <label htmlFor="cruiseId">Выберите круиз</label>
                                        <select
                                            id="cruiseId"
                                            value={cruiseId}
                                            onChange={handleCruiseChange}
                                            className={styles.input}
                                            required
                                        >
                                            <option value="">Выберите круиз</option>
                                            {cruises.map((cruise) => (
                                                <option key={cruise.cruise_id} value={cruise.cruise_id}>
                                                    {cruise.cruise_name} (Дата: {new Date(cruise.departure_datetime).toLocaleDateString()})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label htmlFor="comment">Отзыв</label>
                                        <textarea
                                            id="comment"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className={styles.textarea}
                                            required
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label htmlFor="rating">Оценка</label>
                                        <select
                                            id="rating"
                                            value={rating}
                                            onChange={(e) => setRating(e.target.value)}
                                            className={styles.input}
                                        >
                                            {[1, 2, 3, 4, 5].map((r) => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button type="submit" className={styles.submitButton}>Отправить</button>
                                </form>
                            )}
                        </>
                    )}
                </div>
                <div className={styles.imageWrapper}>
                    <img src="./images/feedback.png" alt="Feedback Image" className={styles.feedbackImage} />
                </div>
            </div>
        </div>
    );
}