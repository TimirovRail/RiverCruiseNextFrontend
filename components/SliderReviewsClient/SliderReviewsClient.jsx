"use client";

import { useState, useEffect } from "react";
import styles from "./SliderReviewsClient.module.css";

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(3); // Начальное значение для больших экранов

    // Определяем количество элементов на основе ширины экрана
    useEffect(() => {
        const updateItemsPerPage = () => {
            if (window.innerWidth <= 479) {
                setItemsPerPage(1); // Смартфоны (320px и меньше)
            } else if (window.innerWidth <= 767) {
                setItemsPerPage(1); // Смартфоны (480px)
            } else if (window.innerWidth <= 1023) {
                setItemsPerPage(2); // Планшеты (768px)
            } else {
                setItemsPerPage(3); // Большие экраны (1024px и выше)
            }
        };

        updateItemsPerPage(); // Вызываем при монтировании
        window.addEventListener("resize", updateItemsPerPage); // Обновляем при изменении размера окна

        return () => window.removeEventListener("resize", updateItemsPerPage); // Очищаем слушатель
    }, []);

    // Загружаем отзывы
    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/feedbacks")
            .then((response) => response.json())
            .then((data) => {
                setTestimonials(data);
            })
            .catch((error) => {
                console.error("Ошибка загрузки отзывов:", error);
            });
    }, []);

    const nextTestimonial = () => {
        if (activeIndex + itemsPerPage < testimonials.length) {
            setActiveIndex((prevIndex) => prevIndex + itemsPerPage);
        }
    };

    const prevTestimonial = () => {
        if (activeIndex - itemsPerPage >= 0) {
            setActiveIndex((prevIndex) => prevIndex - itemsPerPage);
        }
    };

    const visibleTestimonials = testimonials.slice(
        activeIndex,
        activeIndex + itemsPerPage
    );

    return (
        <div className="layout">
            <div className="title">
                <h2 className="h1-title">ОТЗЫВЫ НАШИХ КЛИЕНТОВ</h2>
            </div>
            {testimonials.length === 0 ? (
                <p>Загрузка отзывов...</p>
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
                        {visibleTestimonials.map((testimonial) => (
                            <div key={testimonial.id} className={styles.testimonial}>
                                <blockquote className={styles.quote}>
                                    “{testimonial.feedback}”
                                </blockquote>
                                <p className={styles.author}>- {testimonial.name}</p>
                                <p className={styles.cruise}>{testimonial.cruise}</p>
                            </div>
                        ))}
                    </div>
                    <button
                        className={styles.next}
                        onClick={nextTestimonial}
                        disabled={activeIndex + itemsPerPage >= testimonials.length}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
}