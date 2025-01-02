'use client';

import { motion } from 'framer-motion';
import { FaVk, FaTelegram, FaOdnoklassniki } from 'react-icons/fa';
import styles from './ContactInfo.module.css';

export default function ContactInfo() {
    return (
        <div className='layout'>
            <div className='title'>
                <h2 className='h1-title'>НАШИ КОНТАКТЫ</h2>
            </div>
            <motion.div
                className={styles.contactInfo}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
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
                    <motion.a
                        href="https://vk.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                        whileHover={{ scale: 1.2 }}
                    >
                        <FaVk size={40} />
                    </motion.a>
                    <motion.a
                        href="https://telegram.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                        whileHover={{ scale: 1.2 }}
                    >
                        <FaTelegram size={40} />
                    </motion.a>
                    <motion.a
                        href="https://ok.ru"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                        whileHover={{ scale: 1.2 }}
                    >
                        <FaOdnoklassniki size={40} />
                    </motion.a>
                </div>
            </motion.div>
        </div>
    );
}
