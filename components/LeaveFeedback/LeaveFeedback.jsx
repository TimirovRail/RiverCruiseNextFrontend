'use client';

import { useState, useEffect } from 'react';
import styles from './LeaveFeedback.module.css';

export default function LeaveFeedback() {
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState('5');
    const [cruiseId, setCruiseId] = useState('');
    const [cruises, setCruises] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
            fetchCruises(token);
        }
    }, []);

    const fetchCruises = async (token) => {
        const res = await fetch('http://localhost:8000/api/cruises', {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        setCruises(data);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!isAuthenticated) {
            alert('Для отправки отзыва необходимо авторизоваться');
            return;
        }

        if (!comment || !cruiseId) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    cruise_id: cruiseId,
                    comment,
                    rating,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }

            const newReview = await response.json();
            setComment('');
            setRating('5');
            setCruiseId('');
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="layout">
            <div className="title">
                <h2 className="h1-title">ОСТАВЬ СВОЙ ОТЗЫВ</h2>
            </div>
            <div className={styles.feedbackContainer}>
                <div className={styles.formWrapper}>
                    {submitted && <div className={styles.successMessage}>Отзыв отправлен!</div>}
                    {!isAuthenticated ? (
                        <p>Для отправки отзыва необходимо <a href="/login">авторизоваться</a>.</p>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.feedbackForm}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="cruiseId">Выберите круиз</label>
                                <select
                                    id="cruiseId"
                                    value={cruiseId}
                                    onChange={(e) => setCruiseId(e.target.value)}
                                    className={styles.input}
                                >
                                    <option value="">Выберите круиз</option>
                                    {cruises.map((cruise) => (
                                        <option key={cruise.id} value={cruise.id}>
                                            {cruise.name}
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
                </div>
                <div className={styles.imageWrapper}>
                    <img src="./images/feedback.png" alt="Feedback Image" className={styles.feedbackImage} />
                </div>
            </div>
        </div>
    );
}