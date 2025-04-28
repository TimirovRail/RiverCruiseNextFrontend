'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import styles from './BlogContacts.module.css';

export default function BlogContacts() {
    const [formData, setFormData] = useState({
        cruise_schedule_id: '',
        total_seats: '',
        economy_seats: '',
        standard_seats: '',
        luxury_seats: '',
        extras: [],
        comment: '',
    });
    const [cruises, setCruises] = useState([]);
    const [services, setServices] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [totalPrice, setTotalPrice] = useState(0);
    const [error, setError] = useState(null);
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
        'Эконом': 1,
        'Стандарт': 1.5,
        'Люкс': 2,
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
            setCruises(data);
            setError(null);
        } catch (error) {
            console.error('Ошибка:', error);
            setError('Не удалось загрузить данные о круизах');
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
            setError('Не удалось загрузить данные об услугах');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        calculateTotal({ ...formData, [name]: value });
    };

    const handleScheduleSelect = (scheduleId, cruiseName) => {
        const scheduleIdStr = String(scheduleId);
        setFormData((prev) => ({ ...prev, cruise_schedule_id: scheduleIdStr }));
        calculateTotal({ ...formData, cruise_schedule_id: scheduleIdStr });
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
            .find((s) => String(s.id) === String(data.cruise_schedule_id));
        if (schedule) {
            const cruise = cruises.find((c) => c.id === schedule.cruise_id);
            const economySeats = parseInt(data.economy_seats) || 0;
            const standardSeats = parseInt(data.standard_seats) || 0;
            const luxurySeats = parseInt(data.luxury_seats) || 0;

            price += economySeats * cruise.price_per_person * cabinClassPrices['Эконом'];
            price += standardSeats * cruise.price_per_person * cabinClassPrices['Стандарт'];
            price += luxurySeats * cruise.price_per_person * cabinClassPrices['Люкс'];
        }
        if (data.extras && data.extras.length > 0) {
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
        if (!token || !user) {
            alert('Токен или данные пользователя отсутствуют. Авторизуйтесь.');
            router.push('/login');
            return;
        }

        const schedule = cruises
            .flatMap((c) => c.schedules || [])
            .find((s) => String(s.id) === String(formData.cruise_schedule_id));

        if (!schedule) {
            alert('Выберите рейс');
            return;
        }

        const economySeats = parseInt(formData.economy_seats) || 0;
        const standardSeats = parseInt(formData.standard_seats) || 0;
        const luxurySeats = parseInt(formData.luxury_seats) || 0;
        const totalSeats = parseInt(formData.total_seats) || 0;

        const sumOfSeats = economySeats + standardSeats + luxurySeats;
        if (sumOfSeats !== totalSeats) {
            alert(`Сумма мест по классам (${sumOfSeats}) должна совпадать с общим количеством мест (${totalSeats})`);
            return;
        }
        if (economySeats > schedule.available_economy_places) {
            alert(`Недостаточно мест для класса "Эконом". Доступно: ${schedule.available_economy_places}`);
            return;
        }
        if (standardSeats > schedule.available_standard_places) {
            alert(`Недостаточно мест для класса "Стандарт". Доступно: ${schedule.available_standard_places}`);
            return;
        }
        if (luxurySeats > schedule.available_luxury_places) {
            alert(`Недостаточно мест для класса "Люкс". Доступно: ${schedule.available_luxury_places}`);
            return;
        }

        const payload = {
            cruise_schedule_id: formData.cruise_schedule_id,
            total_seats: totalSeats,
            economy_seats: economySeats,
            standard_seats: standardSeats,
            luxury_seats: luxurySeats,
            extras: formData.extras,
            comment: formData.comment,
            user_id: user.id,
        };

        try {
            const response = await fetch('http://localhost:8000/api/auth/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                alert('Спасибо за бронирование!');
                setFormData({
                    cruise_schedule_id: '',
                    total_seats: '',
                    economy_seats: '',
                    standard_seats: '',
                    luxury_seats: '',
                    extras: [],
                    comment: '',
                });
                setTotalPrice(0);
                fetchCruises(token);
            } else {
                const errorData = await response.json();
                alert(`Ошибка: ${errorData.error || errorData.message}`);
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
                        ) : error ? (
                            <p className={styles.error}>{error}</p>
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
                                                            className={`${styles.scheduleCard} ${String(formData.cruise_schedule_id) === String(schedule.id)
                                                                ? styles.selected
                                                                : ''
                                                                }`}
                                                            onClick={() => handleScheduleSelect(schedule.id, cruise.name)}
                                                        >
                                                            <p>Дата: {new Date(schedule.departure_datetime).toLocaleDateString()}</p>
                                                            <p>Время: {new Date(schedule.departure_datetime).toLocaleTimeString()}</p>
                                                            <p>Всего мест: {schedule.available_places}</p>
                                                            <p>Эконом: {schedule.available_economy_places}</p>
                                                            <p>Стандарт: {schedule.available_standard_places}</p>
                                                            <p>Люкс: {schedule.available_luxury_places}</p>
                                                            <p>Цена: {cruise.price_per_person} руб./чел.</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="total_seats">Общее количество мест</label>
                                    <input
                                        type="number"
                                        id="total_seats"
                                        name="total_seats"
                                        min="1"
                                        value={formData.total_seats}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Классы кают</label>
                                    <div className={styles.cabinClassGroup}>
                                        <div className={styles.cabinClassInput}>
                                            <label htmlFor="economy_seats">Эконом (x1)</label>
                                            <input
                                                type="number"
                                                id="economy_seats"
                                                name="economy_seats"
                                                min="0"
                                                value={formData.economy_seats}
                                                onChange={handleChange}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className={styles.cabinClassInput}>
                                            <label htmlFor="standard_seats">Стандарт (x1.5)</label>
                                            <input
                                                type="number"
                                                id="standard_seats"
                                                name="standard_seats"
                                                min="0"
                                                value={formData.standard_seats}
                                                onChange={handleChange}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className={styles.cabinClassInput}>
                                            <label htmlFor="luxury_seats">Люкс (x2)</label>
                                            <input
                                                type="number"
                                                id="luxury_seats"
                                                name="luxury_seats"
                                                min="0"
                                                value={formData.luxury_seats}
                                                onChange={handleChange}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
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