'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './BlogContacts.module.css';

export default function BlogContacts() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cruise: '',
        date: '',
        seats: '',
        cabinClass: '',
        extras: [],
        comment: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleExtrasChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            extras: checked
                ? [...prevData.extras, value]
                : prevData.extras.filter((extra) => extra !== value),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                alert(`Спасибо за бронирование, ${formData.name}!`);
                setFormData({
                    name: '',
                    email: '',
                    cruise: '',
                    date: '',
                    seats: '',
                    cabinClass: '',
                    extras: [],
                    comment: '',
                });
            } else {
                const errorData = await response.json();
                alert(`Ошибка: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Ошибка при отправке:', error);
        }
    };

    return (
        <div className='layout'>
            <div className='title'>
                <h2 className='h1-title'>БРОНИРОВАНИЕ БИЛЕТА</h2>
            </div>
            <motion.div
                className={styles.bookingForm}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
            >
                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="name">Имя</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Введите ваше имя"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Электронная почта</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Введите ваш email"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="cruise">Выберите круиз</label>
                            <select
                                id="cruise"
                                name="cruise"
                                value={formData.cruise}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Выберите</option>
                                <option value="Волга">Волга</option>
                                <option value="Енисей">Енисей</option>
                                <option value="Дон">Дон</option>
                                <option value="Обь">Обь</option>
                                <option value="Амур">Амур</option>
                                <option value="Лена">Лена</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="date">Дата отправления</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="seats">Количество мест</label>
                            <input
                                type="number"
                                id="seats"
                                name="seats"
                                min="1"
                                max="10"
                                value={formData.seats}
                                onChange={handleChange}
                                placeholder="Введите количество мест"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="cabinClass">Класс каюты</label>
                            <select
                                id="cabinClass"
                                name="cabinClass"
                                value={formData.cabinClass}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Выберите</option>
                                <option value="Эконом">Эконом</option>
                                <option value="Стандарт">Стандарт</option>
                                <option value="Люкс">Люкс</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Дополнительные услуги</label>
                            <div className={styles.checkboxes}>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Питание"
                                        onChange={handleExtrasChange}
                                    />
                                    Оздоровление
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Экскурсии"
                                        onChange={handleExtrasChange}
                                    />
                                    Рестораны
                                </label>
                                <label>
                                    <input
                                        type="checkbox"
                                        value="Трансфер"
                                        onChange={handleExtrasChange}
                                    />
                                    Развлечение
                                </label>
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="comment">Комментарий</label>
                            <textarea
                                id="comment"
                                name="comment"
                                rows="4"
                                value={formData.comment}
                                onChange={handleChange}
                                placeholder="Ваши пожелания"
                            />
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            Забронировать
                        </button>
                    </form>
                </div>
                <div className={styles.imageContainer}>
                    <img src="./images/ticketback.jpg" alt="О круизах" />
                </div>
            </motion.div>
        </div>
    );
}
