"use client";

import { useState, useEffect } from "react";
import styles from "./SliderReviewsClient.module.css";
import { API_BASE_URL } from '../../src/config';
import Loading from "@/components/Loading/Loading";

export default function SliderReviewsClient() {
    const [reviews, setReviews] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(3);

    // Определяем количество элементов на основе ширины экрана
    useEffect(() => {
        const updateItemsPerPage = () => {
            if (window.innerWidth <= 479) {
                setItemsPerPage(1);
            } else if (window.innerWidth <= 767) {
                setItemsPerPage(1);
            } else if (window.innerWidth <= 1023) {
                setItemsPerPage(2);
            } else {
                setItemsPerPage(3);
            }
        };

        updateItemsPerPage();
        window.addEventListener("resize", updateItemsPerPage);

        return () => window.removeEventListener("resize", updateItemsPerPage);
    }, []);

    // Загружаем отзывы из /api/reviews
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/reviews`)
            .then((response) => response.json())
            .then((data) => {
                setReviews(data);
            })
            .catch((error) => {
                console.error("Ошибка загрузки отзывов:", error);
            });
    }, []);

    const nextTestimonial = () => {
        if (activeIndex + itemsPerPage < reviews.length) {
            setActiveIndex((prevIndex) => prevIndex + itemsPerPage);
        }
    };

    const prevTestimonial = () => {
        if (activeIndex - itemsPerPage >= 0) {
            setActiveIndex((prevIndex) => prevIndex - itemsPerPage);
        }
    };

    const visibleReviews = reviews.slice(activeIndex, activeIndex + itemsPerPage);

    return (
        <div className="layout">
            <div className="title">
                <h2 className="h1-title">ОТЗЫВЫ НАШИХ КЛИЕНТОВ</h2>
            </div>
            {reviews.length === 0 ? (
                <Loading />
            ) : (
                <div className={styles.slider}>
                    <button
                        className={styles.prev}
                        onClick={prevTestimonial}
                        disabled={activeIndex === 0}
                    >
                        &lt;
                    </button>
                    <div className={styles.testimonialWrapper}>
                        {visibleReviews.map((review) => (
                            <div key={review.id} className={styles.testimonial}>
                                <blockquote className={styles.quote}>
                                    “{review.comment}”
                                </blockquote>
                                <p className={styles.author}>- {review.user?.name || 'Аноним'}</p>
                                <p className={styles.cruise}>{review.cruise?.name || 'Неизвестный круиз'}</p>
                                <p className={styles.rating}>Оценка: {review.rating}/5</p>
                            </div>
                        ))}
                    </div>
                    <button
                        className={styles.next}
                        onClick={nextTestimonial}
                        disabled={activeIndex + itemsPerPage >= reviews.length}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
}