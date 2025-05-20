'use client';

import { motion } from 'framer-motion';
import { FaVk, FaTelegram, FaOdnoklassniki } from 'react-icons/fa';
import styles from './ContactInfo.module.css';

export default function ContactInfo() {
    const containerVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.8, ease: 'easeOut' },
        },
    };

    const iconVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.2, duration: 0.5, ease: 'easeOut' },
        }),
    };

    return (
        <div className="layout">
            <div className="title">
                <h2 className="h1-title">НАШИ КОНТАКТЫ</h2>
            </div>
            <motion.div
                className={styles.contactInfo}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <p>
                    <strong>Адрес:</strong> Москва, ул. Речная, 12. Наш офис находится в деловом центре на третьем этаже.
                </p>
                <p>
                    <strong>Телефон:</strong> +7 (999) 123-45-67. Звоните с 9:00 до 21:00 по московскому времени.
                </p>
                <p>
                    <strong>Email:</strong> info@russiancruises.ru. Ответим на любые вопросы в течение рабочего дня.
                </p>
                <p>
                    <strong>Часы работы:</strong> Понедельник – Пятница: 9:00 – 18:00, Суббота: 10:00 – 16:00, Воскресенье – выходной.
                </p>
                <p>
                    Мы более 10 лет организуем речные круизы, соединяя комфорт, безопасность и уникальные маршруты.
                </p>
                <div className={styles.socials}>
                    {[
                        { href: 'https://vk.com/rail_tim22', Icon: FaVk },
                        { href: 'https://telegram.org/rail_timiirov', Icon: FaTelegram },
                        { href: 'https://ok.ru', Icon: FaOdnoklassniki },
                    ].map((social, index) => (
                        <motion.a
                            key={index}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialLink}
                            variants={iconVariants}
                            initial="hidden"
                            animate="visible"
                            custom={index}
                            whileHover={{ scale: 1.2, rotate: 5 }}
                        >
                            <social.Icon size={40} />
                        </motion.a>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}