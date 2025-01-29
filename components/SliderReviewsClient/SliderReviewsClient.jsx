"use client";

import { useState, useEffect } from "react";
import styles from "./SliderReviewsClient.module.css";

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const ITEMS_PER_PAGE = 3;

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
        if (activeIndex + ITEMS_PER_PAGE < testimonials.length) {
            setActiveIndex((prevIndex) => prevIndex + ITEMS_PER_PAGE);
        }
    };

    const prevTestimonial = () => {
        if (activeIndex - ITEMS_PER_PAGE >= 0) {
            setActiveIndex((prevIndex) => prevIndex - ITEMS_PER_PAGE);
        }
    };

    const visibleTestimonials = testimonials.slice(
        activeIndex,
        activeIndex + ITEMS_PER_PAGE
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
                        disabled={activeIndex + ITEMS_PER_PAGE >= testimonials.length}
                    >
                        &gt;
                    </button>
                </div>
            )}
        </div>
    );
}
