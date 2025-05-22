'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './CruiseDetail.module.css';
import Loading from '@/components/Loading/Loading';
import Header from '@/components/Header/Header';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { API_BASE_URL } from '../../src/config';

const CruiseDetail = () => {
    const { query } = useRouter();
    const { id } = query;
    const [cruise, setCruise] = useState(null);
    const [reviews, setReviews] = useState([]); // Состояние для отзывов
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    const fetchUserName = async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/profile?user_id=${userId}`);
            const data = await response.json();
            console.log('User data:', data); // Для отладки
            return data.user?.name || 'Аноним';
        } catch (error) {
            console.error('Ошибка загрузки имени пользователя:', error);
            return 'Аноним';
        }
    };

    useEffect(() => {
        if (!id) return;

        const fetchCruiseData = async () => {
            try {
                // Загружаем данные круиза
                const cruiseResponse = await fetch(`${API_BASE_URL}/api/cruise/${id}`);
                const cruiseData = await cruiseResponse.json();
                setCruise(cruiseData);

                // Загружаем все отзывы и фильтруем на клиенте
                const reviewsResponse = await fetch(`${API_BASE_URL}/api/reviews`);
                const reviewsData = await reviewsResponse.json();
                console.log('All reviews data:', reviewsData); // Для отладки

                // Фильтруем отзывы по cruise_id и is_active
                const filteredReviews = reviewsData.filter(
                    (review) => review.cruise_id === parseInt(id) && review.is_active
                );
                console.log('Filtered reviews:', filteredReviews); // Для отладки

                // Получаем имена пользователей для отзывов
                const userNames = await Promise.all(filteredReviews.map(review => fetchUserName(review.user_id)));
                const reviewsWithNames = filteredReviews.map((review, index) => ({
                    ...review,
                    user_name: userNames[index]
                }));
                setReviews(reviewsWithNames);
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCruiseData();
    }, [id]);

    const openImage = (src) => {
        setSelectedImage(src);
    };

    const closeImage = () => {
        setSelectedImage(null);
    };

    if (loading) return <Loading />;
    if (!cruise) return <p>Круиз не найден.</p>;

    return (
        <div className="layout">
            <Header />
            <div className={styles.cruiseDetail}>
                <div className={styles.cruiseContainer}>
                    <div className={styles.imageSection}>
                        <img src={cruise.image_path} alt={cruise.name} className={styles.cruiseImage} />
                        {cruise.cabins_by_class && (
                            <div className={styles.cabinClasses}>
                                <h3>Классы кают</h3>
                                <div className={styles.cabinClassList}>
                                    {cruise.cabins_by_class.economy && (
                                        <div className={styles.cabinClass}>
                                            <h4>Эконом</h4>
                                            <p>Мест: {cruise.cabins_by_class.economy.places}</p>
                                            {cruise.cabins_by_class.economy.image_path && (
                                                <div
                                                    className={styles.cabinImageWrapper}
                                                    onClick={() => openImage(cruise.cabins_by_class.economy.image_path)}
                                                >
                                                    <img
                                                        src={cruise.cabins_by_class.economy.image_path}
                                                        alt="Эконом каюта"
                                                        className={styles.cabinImage}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {cruise.cabins_by_class.standard && (
                                        <div className={styles.cabinClass}>
                                            <h4>Стандарт</h4>
                                            <p>Мест: {cruise.cabins_by_class.standard.places}</p>
                                            {cruise.cabins_by_class.standard.image_path && (
                                                <div
                                                    className={styles.cabinImageWrapper}
                                                    onClick={() => openImage(cruise.cabins_by_class.standard.image_path)}
                                                >
                                                    <img
                                                        src={cruise.cabins_by_class.standard.image_path}
                                                        alt="Стандарт каюта"
                                                        className={styles.cabinImage}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {cruise.cabins_by_class.luxury && (
                                        <div className={styles.cabinClass}>
                                            <h4>Люкс</h4>
                                            <p>Мест: {cruise.cabins_by_class.luxury.places}</p>
                                            {cruise.cabins_by_class.luxury.image_path && (
                                                <div
                                                    className={styles.cabinImageWrapper}
                                                    onClick={() => openImage(cruise.cabins_by_class.luxury.image_path)}
                                                >
                                                    <img
                                                        src={cruise.cabins_by_class.luxury.image_path}
                                                        alt="Люкс каюта"
                                                        className={styles.cabinImage}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {cruise.features && Array.isArray(cruise.features) && cruise.features.length > 0 && (
                            <div className={styles.features}>
                                <h3>Услуги на борту</h3>
                                <ul>
                                    {cruise.features.map((feature, index) => (
                                        <li key={index}>
                                            {feature.name} <span>({feature.price} ₽)</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {/* Новый блок для отзывов */}
                        <div className={styles.reviews}>
                            <h3>Отзывы о круизе</h3>
                            {reviews.length > 0 ? (
                                <ul>
                                    {reviews.map((review, index) => (
                                        <li key={index}>
                                            <p className={styles.reviewComment}><strong>{review.comment}</strong></p>
                                            <p className={styles.reviewRating}>Оценка: {review.rating}/5</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className={styles.noReviews}>Отзывов пока нет.</p>
                            )}
                        </div>
                    </div>
                    <div className={styles.info}>
                        <h1>{cruise.name}</h1>
                        <div className={styles.infoGrid}>
                            <p><strong>Река:</strong> {cruise.river}</p>
                            <p><strong>Описание:</strong> {cruise.description}</p>
                            <p><strong>Каюты:</strong> {cruise.cabins}</p>
                            <p><strong>Цена за человека:</strong> {cruise.price_per_person} ₽</p>
                            <p>
                                <strong>Длина маршрута:</strong>{' '}
                                {cruise.total_distance ? `${cruise.total_distance} км` : 'Не указано'}
                            </p>
                        </div>

                        {cruise.schedules && cruise.schedules.length > 0 ? (
                            <div className={styles.schedules}>
                                <h3>Расписание</h3>
                                <div className={styles.scheduleList}>
                                    {cruise.schedules.map((schedule) => (
                                        <div key={schedule.id} className={styles.scheduleItem}>
                                            <div className={styles.scheduleDates}>
                                                <p>
                                                    <strong>Отправление:</strong>{' '}
                                                    {format(new Date(schedule.departure_datetime), 'dd MMMM yyyy, HH:mm', {
                                                        locale: ru,
                                                    })}
                                                </p>
                                                <p>
                                                    <strong>Прибытие:</strong>{' '}
                                                    {format(new Date(schedule.arrival_datetime), 'dd MMMM yyyy, HH:mm', {
                                                        locale: ru,
                                                    })}
                                                </p>
                                            </div>
                                            <div className={styles.schedulePlaces}>
                                                <p>
                                                    <strong>Всего мест:</strong> {schedule.total_places}{' '}
                                                    <span>(Доступно: {schedule.available_places})</span>
                                                </p>
                                                <p>
                                                    <strong>Эконом:</strong> {schedule.available_economy_places} /{' '}
                                                    {schedule.economy_places}
                                                </p>
                                                <p>
                                                    <strong>Стандарт:</strong> {schedule.available_standard_places} /{' '}
                                                    {schedule.standard_places}
                                                </p>
                                                <p>
                                                    <strong>Люкс:</strong> {schedule.available_luxury_places} /{' '}
                                                    {schedule.luxury_places}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className={styles.noSchedule}>Расписание не указано</p>
                        )}

                        <a href="#" className={styles.backButton} onClick={() => window.history.back()}>
                            Назад
                        </a>
                    </div>
                </div>
            </div>

            {selectedImage && (
                <div className={styles.modal} onClick={closeImage}>
                    <div className={styles.modalContent}>
                        <img src={selectedImage} alt="Увеличенное изображение" className={styles.modalImage} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default CruiseDetail;