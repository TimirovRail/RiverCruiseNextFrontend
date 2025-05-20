'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import styles from './BuyTicket.module.css';

const BuyTicket = () => {
    const router = useRouter();

    const handleBuyTicket = () => {
        router.push('/BuyTicket');
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: 'easeOut' },
        },
    };

    const textVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
    };

    const buttonVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.4 } },
    };

    return (
        <div className="layout">
            <div className="title">
                <h2 className="h1-title">ПОКУПКА БИЛЕТА</h2>
            </div>
            <motion.div
                className={styles.ticketBlock}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.p
                    className={styles.ticketText}
                    variants={textVariants}
                >
                    Выберите маршрут, заполните данные, оплатите онлайн, и ваш билет готов. Отправляйтесь в незабываемое путешествие по рекам России!
                </motion.p>
                <motion.button
                    className={styles.ticketBtn}
                    onClick={handleBuyTicket}
                    variants={buttonVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Купить билет
                </motion.button>
            </motion.div>
        </div>
    );
};

export default BuyTicket;