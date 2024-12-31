"use client";

import { useState } from 'react';
import styles from './SliderReviewsClient.module.css';

const testimonials = [
    {
        quote: "Это было невероятное путешествие по Волге! Отличный сервис, красивая природа, и очень вкусная еда. Мы плыли по этому великому водному пути, наслаждаясь уютом на борту и восхищаясь окружающими пейзажами. Незабываемое впечатление на всю жизнь!",
        author: "Иван Петров",
        avatar: "./images/ava1.png",
    },
    {
        quote: "Круиз по Неве оставил незабываемые впечатления. Рекомендую всем, кто хочет расслабиться и насладиться видами. Мосты, здания, всё это выглядит особенно красиво в вечернее время. Отличная организация и обслуживание, как всегда на высоте.",
        author: "Анна Смирнова",
        avatar: "./images/ava2.png",
    },
    {
        quote: "Река Лена открыла мне совершенно новый мир. Организация была на высшем уровне. Спасибо за отличный отдых! Речные просторы, небо, чистый воздух — все это создало идеальные условия для отдыха. Очень рекомендую всем путешественникам!",
        author: "Екатерина Сидорова",
        avatar: "./images/ava3.png",
    },
    {
        quote: "Прекрасное путешествие по рекам России! Вдохновляюще и незабываемо. Плавание по рекам подарило мне массу эмоций. Потрясающая природа, интересные экскурсии и, конечно же, отличное обслуживание. Это было потрясающее приключение!",
        author: "Дмитрий Иванов",
        avatar: "./images/ava4.png",
    },
    {
        quote: "Отличный сервис и маршрут. Мы обязательно вернемся в следующем году. Путешествие по рекам России — это не только отдых, но и возможность узнать культуру и историю наших прекрасных городов и деревень. Всё организовано на высшем уровне.",
        author: "Мария Орлова",
        avatar: "./images/ava5.png",
    },
    {
        quote: "Каждый день был настоящим праздником! Благодарю за профессионализм. Каждый день на борту был насыщен интересными мероприятиями. Прекрасные виды, замечательные люди и великолепный сервис! Это было потрясающее путешествие.",
        author: "Алексей Кузнецов",
        avatar: "./images/ava6.png",
    },
];
export default function Testimonials() {
    const [activeIndex, setActiveIndex] = useState(0);

    const ITEMS_PER_PAGE = 3;

    const nextTestimonial = () => {
        setActiveIndex((prevIndex) =>
            (prevIndex + ITEMS_PER_PAGE) % testimonials.length
        );
    };

    const prevTestimonial = () => {
        setActiveIndex((prevIndex) =>
            (prevIndex - ITEMS_PER_PAGE + testimonials.length) % testimonials.length
        );
    };

    const visibleTestimonials = testimonials.slice(
        activeIndex,
        activeIndex + ITEMS_PER_PAGE
    );

    if (visibleTestimonials.length < ITEMS_PER_PAGE) {
        visibleTestimonials.push(
            ...testimonials.slice(0, ITEMS_PER_PAGE - visibleTestimonials.length)
        );
    }

    return (
        <div className='layout'>
            <div className='title'>
                <h2 className='h1-title'>ОТЗЫВЫ НАШИХ КЛИЕНТОВ</h2>
            </div>
            <div className={styles.slider}>
                <button className={styles.prev} onClick={prevTestimonial}>
                    &lt;
                </button>
                <div className={styles.testimonialWrapper}>
                    {visibleTestimonials.map((testimonial, index) => (
                        <div key={index} className={styles.testimonial}>
                            <img
                                src={testimonial.avatar}
                                alt={testimonial.author}
                                className={styles.avatar}
                            />
                            <blockquote className={styles.quote}>
                                “{testimonial.quote}”
                            </blockquote>
                            <p className={styles.author}>- {testimonial.author}</p>
                        </div>
                    ))}
                </div>
                <button className={styles.next} onClick={nextTestimonial}>
                    &gt;
                </button>
            </div>
        </div>
    );
}
