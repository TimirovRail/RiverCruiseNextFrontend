'use client';

import { useState } from 'react';
import styles from './LeaveFeedback.module.css';

export default function LeaveFeedback() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [feedback, setFeedback] = useState('');
    const [cruise, setCruise] = useState(''); 
    const [submitted, setSubmitted] = useState(false);
    const [feedbacks, setFeedbacks] = useState([]); 

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!name || !email || !feedback || !cruise) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        setFeedbacks([
            ...feedbacks,
            {
                name,
                email,
                feedback,
                cruise, 
            },
        ]);

        setName('');
        setEmail('');
        setFeedback('');
        setCruise('');
        setSubmitted(true);

        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className='layout'>
            <div className="title">
                <h2 className="h1-title">ОСТАВЬ СВОЙ ОТЗЫВ</h2>
            </div>
            <div className={styles.feedbackContainer}>
                <div className={styles.formWrapper}>
                    {submitted && <div className={styles.successMessage}>Отзыв отправлен!</div>}

                    <form onSubmit={handleSubmit} className={styles.feedbackForm}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="name">Имя</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Электронная почта</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="feedback">Отзыв</label>
                            <textarea
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className={styles.textarea}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="cruise">Выберите круиз</label>
                            <select
                                id="cruise"
                                value={cruise}
                                onChange={(e) => setCruise(e.target.value)}
                                className={styles.input}
                            >
                                <option value="">Выберите круиз</option>
                                <option value="Волга">Волга</option>
                                <option value="Енисей">Енисей</option>
                                <option value="Дон">Дон</option>
                                <option value="Обь">Обь</option>
                                <option value="Амур">Амур</option>
                                <option value="Лена">Лена</option>
                            </select>
                        </div>

                        <button type="submit" className={styles.submitButton}>Отправить</button>
                    </form>

                    <div className={styles.feedbackList}>
                        <h3>Отзывы:</h3>
                        {feedbacks.length > 0 ? (
                            feedbacks.map((item, index) => (
                                <div key={index} className={styles.feedbackItem}>
                                    <p className={styles.feedbackText}>{item.feedback}</p>
                                    <p className={styles.author}>- {item.name} ({item.email})</p>
                                    <p className={styles.cruise}>Круиз: {item.cruise}</p>
                                </div>
                            ))
                        ) : (
                            <p>Пока нет отзывов.</p>
                        )}
                    </div>
                </div>

                <div className={styles.imageWrapper}>
                    <img src="./images/feedback.png" alt="Feedback Image" className={styles.feedbackImage} />
                </div>
            </div>
        </div>
    );
}
