"use client";

import React, { useState } from 'react';
import styles from './FAQquestions.module.css';

const FAQquestions = () => {
    const [openIndexes, setOpenIndexes] = useState([]);

    const faqData = [
        {
            question: 'Какие реки России популярны для круизов?',
            answer: 'Популярные реки для круизов в России включают Волгу, Дон, Неву, Лену, Енисей и Обь. Каждая из них предлагает уникальные пейзажи и культурные достопримечательности.',
        },
        {
            question: 'Как выбрать подходящий круиз?',
            answer: 'Выбор круиза зависит от ваших предпочтений: продолжительность, маршрут, уровень комфорта и бюджет. Рекомендуем изучить отзывы и проконсультироваться с туроператором.',
        },
        {
            question: 'Что включено в стоимость круиза?',
            answer: 'Обычно в стоимость круиза включены проживание, питание, экскурсии и развлекательная программа. Уточняйте детали у туроператора.',
        },
        {
            question: 'Нужна ли виза для круиза по России?',
            answer: 'Для граждан России виза не требуется. Если вы иностранец, уточните визовые требования в посольстве РФ.',
        },
        {
            question: 'Какие сезоны лучше всего для круизов?',
            answer: 'Лучшее время для круизов — с мая по сентябрь, когда погода наиболее комфортна, а реки свободны ото льда.',
        },
        {
            question: 'Есть ли ограничения по возрасту для круизов?',
            answer: 'Ограничений по возрасту нет, но для детей и пожилых людей рекомендуется выбирать круизы с комфортными условиями.',
        },
        {
            question: 'Можно ли взять с собой животных?',
            answer: 'Большинство круизных компаний не разрешают брать животных на борт. Уточните у туроператора.',
        },
        {
            question: 'Какие развлечения доступны на борту?',
            answer: 'На борту обычно есть рестораны, бары, кинотеатры, экскурсии и развлекательные программы.',
        },
        {
            question: 'Как забронировать круиз?',
            answer: 'Вы можете забронировать круиз через туроператора, на сайте круизной компании или в турагентстве.',
        },
        {
            question: 'Можно ли отменить бронирование?',
            answer: 'Условия отмены зависят от политики компании. Обычно можно отменить бронирование с возвратом части средств.',
        },
    ];

    const toggleAnswer = (index) => {
        if (openIndexes.includes(index)) {
            setOpenIndexes(openIndexes.filter((i) => i !== index));
        } else {
            setOpenIndexes([...openIndexes, index]);
        }
    };

    return (
        <div className="layout">
            <div className="title">
                <h2 className="h1-title">ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ</h2>
            </div>
            <div className={styles.faqContainer}>
                {faqData.map((item, index) => (
                    <div key={index} className={styles.faqItem}>
                        <div
                            className={styles.faqQuestion}
                            onClick={() => toggleAnswer(index)}
                        >
                            {item.question}
                            <span className={styles.arrow}>
                                {openIndexes.includes(index) ? '▲' : '▼'}
                            </span>
                        </div>
                        {openIndexes.includes(index) && (
                            <div className={styles.faqAnswer}>{item.answer}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQquestions;