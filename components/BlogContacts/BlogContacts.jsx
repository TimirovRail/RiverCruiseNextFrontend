'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import styles from './BlogContacts.module.css';

export default function BlogContacts() {
    const [formData, setFormData] = useState({
        cruise_schedule_id: '',
        seats: '',
        cabin_class: '',
        extras: [],
        comment: '',
    });
    const [cruises, setCruises] = useState([]);
    const [services, setServices] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const router = useRouter();

    const cruiseImages = {
        'Круиз по Волге': '/images/cruiselistvolga.jpg',
        'Круиз по Енисею': '/images/cruiselistenisey.jpg',
        'Круиз по Дону': '/images/cruiselistdon.jpg',
        'Круиз по Оби': '/images/cruiselistob.jpg',
        'Круиз по Амуру': '/images/cruiselistamur.jpg',
        'Круиз по Лене': '/images/cruiselistlena.jpg',
    };

    const cabinClassPrices = {
        Эконом: 1,
        Стандарт: 1.5,
        Люкс: 2,
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (token && storedUser) {
            setIsAuthenticated(true);
            setUser(JSON.parse(storedUser));
            fetchCruises(token);
            fetchServices(token);
        } else {
            setIsLoading(false);
            router.push('/login');
        }
    }, [router]);

    const fetchCruises = async (token) => {
        try {
            const res = await fetch('http://localhost:8000/api/cruises', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Ошибка загрузки круизов');
            const data = await res.json();
            console.log('Имена круизов:', data.map(cruise => cruise.name));
            setCruises(data);
        } catch (error) {
            console.error('Ошибка:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchServices = async (token) => {
        try {
            const res = await fetch('http://localhost:8000/api/services', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Ошибка загрузки услуг');
            const data = await res.json();
            setServices(data);
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        calculateTotal({ ...formData, [name]: value });
    };

    const handleScheduleSelect = (scheduleId, cruiseName) => {
        console.log('Выбранный scheduleId:', scheduleId, 'Тип:', typeof scheduleId);
        console.log('Текущий cruise_schedule_id:', formData.cruise_schedule_id, 'Тип:', typeof formData.cruise_schedule_id);
        setFormData((prev) => ({ ...prev, cruise_schedule_id: String(scheduleId) })); // Приводим к строке
        calculateTotal({ ...formData, cruise_schedule_id: String(scheduleId) });
    };

    const handleExtrasChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prevData) => {
            const newExtras = checked
                ? [...prevData.extras, value]
                : prevData.extras.filter((extra) => extra !== value);
            const updatedData = { ...prevData, extras: newExtras };
            calculateTotal(updatedData);
            return updatedData;
        });
    };

    const calculateTotal = (data) => {
        let price = 0;
        const schedule = cruises
            .flatMap((c) => c.schedules || [])
            .find((s) => String(s.id) === String(data.cruise_schedule_id)); // Приводим к строке
        if (schedule && data.seats) {
            const cruise = cruises.find((c) => c.id === schedule.cruise_id);
            const basePrice = cruise.price_per_person * parseInt(data.seats);
            const cabinMultiplier = cabinClassPrices[data.cabin_class] || 1;
            price += basePrice * cabinMultiplier;
        }
        if (data.extras.length > 0) {
            data.extras.forEach((extra) => {
                const service = services.find((s) => s.title === extra);
                if (service) price += parseFloat(service.price);
            });
        }
        setTotalPrice(price);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        console.log('Отправляемые данные:', { ...formData, user_id: user.id });

        if (!token || !user) {
            alert('Токен или данные пользователя отсутствуют. Авторизуйтесь.');
            router.push('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/auth/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    user_id: user.id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Ответ сервера:', data);
                alert('Спасибо за бронирование!');
                setFormData({
                    cruise_schedule_id: '',
                    seats: '',
                    cabin_class: '',
                    extras: [],
                    comment: '',
                });
                setTotalPrice(0);
                fetchCruises(token); // Обновляем данные о круизах
            } else {
                const errorData = await response.json();
                console.log('Ошибка от сервера:', errorData);
                alert(`Ошибка: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Ошибка при отправке:', error);
            alert('Произошла ошибка при бронировании');
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
                {isAuthenticated ? (
                    <div className={styles.formContainer}>
                        {isLoading ? (
                            <p>Загрузка рейсов...</p>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className={styles.cruiseGrid}>
                                    <label>Выберите круиз и дату</label>
                                    <div className={styles.cruiseGridInner}>
                                        {cruises.map((cruise) => (
                                            <div key={cruise.id} className={styles.cruiseCard}>
                                                <h3>{cruise.name}</h3>
                                                <img
                                                    src={cruiseImages[cruise.name] || '/images/ticketback.jpg'}
                                                    alt={cruise.name}
                                                />
                                                <div className={styles.scheduleGrid}>
                                                    {(cruise.schedules || []).map((schedule) => (
                                                        <div
                                                            key={schedule.id}
                                                            className={`${styles.scheduleCard} ${
                                                                String(formData.cruise_schedule_id) === String(schedule.id)
                                                                    ? styles.selected
                                                                    : ''
                                                            }`}
                                                            onClick={() => handleScheduleSelect(schedule.id, cruise.name)}
                                                        >
                                                            <p>Дата: {new Date(schedule.departure_datetime).toLocaleDateString()}</p>
                                                            <p>Время: {new Date(schedule.departure_datetime).toLocaleTimeString()}</p>
                                                            <p>Мест: {schedule.available_places}</p>
                                                            <p>Цена: {cruise.price_per_person} руб./чел.</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="seats">Количество мест</label>
                                    <input
                                        type="number"
                                        id="seats"
                                        name="seats"
                                        min="1"
                                        value={formData.seats}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="cabinClass">Класс каюты</label>
                                    <select
                                        id="cabinClass"
                                        name="cabin_class"
                                        value={formData.cabin_class}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Выберите</option>
                                        <option value="Эконом">Эконом (x1)</option>
                                        <option value="Стандарт">Стандарт (x1.5)</option>
                                        <option value="Люкс">Люкс (x2)</option>
                                    </select>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Дополнительные услуги</label>
                                    <div className={styles.checkboxes}>
                                        {services.map((service) => (
                                            <label key={service.id}>
                                                <input
                                                    type="checkbox"
                                                    value={service.title}
                                                    onChange={handleExtrasChange}
                                                    checked={formData.extras.includes(service.title)}
                                                />
                                                {service.title} ({service.price} руб.)
                                            </label>
                                        ))}
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

                                <button type="submit" className={styles.submitButton}>Забронировать</button>

                                <div className={styles.totalPrice}>
                                    <h3>Итог: {totalPrice.toFixed(2)} руб.</h3>
                                </div>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className={styles.authMessage}>
                        <p>Для бронирования билета необходимо <a href="/login">авторизоваться</a>.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}