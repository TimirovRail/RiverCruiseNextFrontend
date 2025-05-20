'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import styles from './BlogContacts.module.css';
import { API_BASE_URL } from '../../src/config';
import Loading from "@/components/Loading/Loading";

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
    const [bookings, setBookings] = useState([]);
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
            fetchInitialData(token);
        } else {
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    }, []);

    const fetchInitialData = async (token) => {
        try {
            const [cruisesRes, bookingsRes, servicesRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/cruises`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/api/bookings`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(`${API_BASE_URL}/api/services`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
            ]);

            if (!cruisesRes.ok) throw new Error(`Ошибка загрузки круизов: ${cruisesRes.status} ${cruisesRes.statusText}`);
            if (!bookingsRes.ok) throw new Error(`Ошибка загрузки бронирований: ${bookingsRes.status} ${bookingsRes.statusText}`);
            if (!servicesRes.ok) throw new Error(`Ошибка загрузки услуг: ${servicesRes.status} ${servicesRes.statusText}`);

            const [cruisesData, bookingsData, servicesData] = await Promise.all([
                cruisesRes.json(),
                bookingsRes.json(),
                servicesRes.json(),
            ]);

            if (!Array.isArray(cruisesData)) throw new Error('Данные о круизах не являются массивом');
            if (!Array.isArray(bookingsData)) throw new Error('Данные о бронированиях не являются массивом');
            if (!Array.isArray(servicesData)) throw new Error('Данные об услугах не являются массивом');

            setCruises(cruisesData);
            setBookings(bookingsData);
            setServices(servicesData);
            setError(null);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            setError(error.message || 'Не удалось загрузить данные. Попробуйте позже.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null); // Clear error on input change
        calculateTotal({ ...formData, [name]: value });
    };

    const handleScheduleSelect = (scheduleId, cruiseName) => {
        const scheduleIdStr = String(scheduleId);
        setFormData((prev) => ({ ...prev, cruise_schedule_id: scheduleIdStr }));
        setError(null); // Clear error on schedule select
        calculateTotal({ ...formData, cruise_schedule_id: scheduleIdStr });
    };

    const handleExtrasChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prevData) => {
            const newExtras = checked
                ? [...prevData.extras, value]
                : prevData.extras.filter((extra) => extra !== value);
            const updatedData = { ...prevData, extras: newExtras };
            setError(null); // Clear error on extras change
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
        if (!isAuthenticated) {
            setError('Для бронирования билета необходимо авторизоваться');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token || !user) {
            setError('Токен или данные пользователя отсутствуют. Пожалуйста, авторизуйтесь.');
            return;
        }

        const schedule = cruises
            .flatMap((c) => c.schedules || [])
            .find((s) => String(s.id) === String(formData.cruise_schedule_id));

        if (!schedule) {
            setError('Выберите рейс');
            return;
        }

        const economySeats = parseInt(formData.economy_seats) || 0;
        const standardSeats = parseInt(formData.standard_seats) || 0;
        const luxurySeats = parseInt(formData.luxury_seats) || 0;
        const totalSeats = parseInt(formData.total_seats) || 0;

        const sumOfSeats = economySeats + standardSeats + luxurySeats;
        if (sumOfSeats !== totalSeats) {
            setError(`Сумма мест по классам (${sumOfSeats}) должна совпадать с общим количеством мест (${totalSeats})`);
            return;
        }
        if (economySeats > schedule.available_economy_places) {
            setError(`Недостаточно мест для класса "Эконом". Доступно: ${schedule.available_economy_places}`);
            return;
        }
        if (standardSeats > schedule.available_standard_places) {
            setError(`Недостаточно мест для класса "Стандарт". Доступно: ${schedule.available_standard_places}`);
            return;
        }
        if (luxurySeats > schedule.available_luxury_places) {
            setError(`Недостаточно мест для класса "Люкс". Доступно: ${schedule.available_luxury_places}`);
            return;
        }

        const userBookings = bookings.filter(b => b.user_id === user.id && b.is_paid) || [];
        const totalBookedSeats = {
            economy: userBookings.reduce((sum, b) => sum + (b.economy_seats || 0), 0),
            standard: userBookings.reduce((sum, b) => sum + (b.standard_seats || 0), 0),
            luxury: userBookings.reduce((sum, b) => sum + (b.luxury_seats || 0), 0),
        };

        const maxSeatsPerCategory = 5;
        if (
            (totalBookedSeats.economy + economySeats > maxSeatsPerCategory) ||
            (totalBookedSeats.standard + standardSeats > maxSeatsPerCategory) ||
            (totalBookedSeats.luxury + luxurySeats > maxSeatsPerCategory)
        ) {
            setError('Вы превысили максимальное количество мест (5 мест на категорию).');
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
            const response = await fetch(`${API_BASE_URL}/api/auth/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                setError(null);
                alert('Благодарим за бронирование! 🎉 Все ваши билеты ждут вас в личном профиле.');
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
                fetchInitialData(token);
            } else {
                const errorData = await response.json();
                setError(errorData.error || `Ошибка сервера: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Ошибка при бронировании:', error);
            setError(error.message || 'Произошла ошибка при бронировании. Попробуйте снова.');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: 'easeOut' },
        },
    };

    const formVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const inputVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const errorVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
    };

    return (
        <div className="layout">
            <div className="title">
                <h2 className="h1-title">БРОНИРОВАНИЕ БИЛЕТА</h2>
            </div>
            <motion.div
                className={styles.bookingForm}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {isLoading ? (
                    <Loading />
                ) : !isAuthenticated ? (
                    <div className={styles.noAuthMessage}>
                        <p>Чтобы забронировать билет, пожалуйста, авторизуйтесь.</p>
                        <button
                            onClick={() => router.push('/login')}
                            className={styles.loginButton}
                        >
                            Войти
                        </button>
                    </div>
                ) : (
                    <motion.div
                        className={styles.formContainer}
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {error && (
                            <motion.div
                                className={styles.errorMessage}
                                variants={errorVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <p>{error}</p>
                            </motion.div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <motion.div className={styles.cruiseGrid} variants={inputVariants}>
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
                            </motion.div>

                            <motion.div className={styles.inputGroup} variants={inputVariants}>
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
                            </motion.div>

                            <motion.div className={styles.inputGroup} variants={inputVariants}>
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
                            </motion.div>

                            <motion.div className={styles.inputGroup} variants={inputVariants}>
                                <label>Дополнительные услуги</label>
                                <div className={styles.checkboxes}>
                                    {services.map((service) => (
                                        <div key={service.id} className={styles.serviceItem}>
                                            <label className={styles.serviceLabel}>
                                                <input
                                                    type="checkbox"
                                                    value={service.title}
                                                    onChange={handleExtrasChange}
                                                    checked={formData.extras.includes(service.title)}
                                                />
                                                {service.title} ({service.price} руб.)
                                            </label>
                                            <div className={styles.serviceTooltip}>
                                                <img
                                                    src={service.img || '/images/default-service.jpg'}
                                                    alt={service.title}
                                                    className={styles.tooltipImage}
                                                />
                                                <div className={styles.tooltipContent}>
                                                    <h4>{service.title}</h4>
                                                    <p>{service.description}</p>
                                                    <p className={styles.tooltipPrice}>
                                                        Цена: {service.price} руб.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div className={styles.inputGroup} variants={inputVariants}>
                                <label htmlFor="comment">Комментарий</label>
                                <textarea
                                    id="comment"
                                    name="comment"
                                    rows="4"
                                    value={formData.comment}
                                    onChange={handleChange}
                                    placeholder="Ваши пожелания"
                                />
                            </motion.div>

                            <motion.button
                                type="submit"
                                className={styles.submitButton}
                                variants={inputVariants}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Забронировать
                            </motion.button>

                            <motion.div className={styles.totalPrice} variants={inputVariants}>
                                <h3>Итог: {totalPrice.toFixed(2)} руб.</h3>
                            </motion.div>
                        </form>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}