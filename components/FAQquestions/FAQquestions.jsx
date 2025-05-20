"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './FAQquestions.module.css';

const FAQquestions = () => {
    const [openIndex, setOpenIndex] = useState(null); // Храним только один активный индекс

    const faqData = [
        {
            question: 'Какие реки России популярны для круизов?',
            answer: 'Популярные реки для круизов в России включают Волгу, Дон, Амуру, Лену, Енисей и Обь. Каждая из них предлагает уникальные пейзажи и культурные достопримечательности.',
        },
        {
            question: 'Как выбрать подходящий круиз?',
            answer: 'Выбор круиза зависит от ваших предпочтений: продолжительность, маршрут, уровень комфорта и бюджет. Рекомендуем изучить отзывы и проконсультироваться с туроператором по номеру +7 (937) 521-52-62',
        },
        {
            question: 'Что включено в стоимость круиза?',
            answer: 'Обычно в стоимость круиза включены проживание, питание, экскурсии и развлекательная программа. Уточняйте детали у туроператора по номеру +7 (937) 521-52-62',
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
            answer: 'Большинство круизных компаний не разрешают брать животных на борт. Уточните у туроператора по номеру +7 (937) 521-52-62',
        },
        {
            question: 'Какие развлечения доступны на борту?',
            answer: 'На борту обычно есть рестораны, массаж, кинотеатры, экскурсии и развлекательные программы.',
        },
        {
            question: 'Как забронировать круиз?',
            answer: 'Вы можете забронировать круиз у нас на сайте и оплатить билет у себя в профиле.',
        },
        {
            question: 'Можно ли отменить бронирование?',
            answer: 'Отменить бронирование можно у себя в профиле.',
        },
    ];

    const toggleAnswer = (index) => {
        if (openIndex === index) {
            setOpenIndex(null);
        } else {
            setOpenIndex(index);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.8, ease: 'easeOut' },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
        }),
    };

    const answerVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: {
            opacity: 1,
            height: 'auto',
            transition: { duration: 0.3, ease: 'easeInOut' },
        },
    };

    return (
        <div className="layout">
            <div className="title">
                <h2 className="h1-title">ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ</h2>
            </div>
            <motion.div
                className={styles.faqContainer}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {faqData.map((item, index) => (
                    <motion.div
                        key={index}
                        className={styles.faqItem}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index}
                    >
                        <div
                            className={`${styles.faqQuestion} ${openIndex === index ? styles.active : ''}`}
                            onClick={() => toggleAnswer(index)}
                        >
                            {item.question}
                            <span className={styles.arrow}>
                                {openIndex === index ? '▲' : '▼'}
                            </span>
                        </div>
                        {openIndex === index && (
                            <motion.div
                                className={styles.faqAnswer}
                                variants={answerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {item.answer}
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default FAQquestions;