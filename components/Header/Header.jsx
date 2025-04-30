'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import ProfilePopup from '../ProfilePopup/ProfilePopup';

// Компонент шапки сайта с навигацией и профилем пользователя
const Header = () => {
    const [user, setUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Открытие/закрытие попапа профиля
    const handleProfileClick = () => {
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    // Переключение бургер-меню
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Загрузка данных пользователя
    useEffect(() => {
        const storedUser = localStorage.getItem('user');

        if (storedUser && storedUser !== 'undefined') {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Ошибка парсинга данных пользователя:', error);
            }
        } else {
            const token = localStorage.getItem('token');
            if (!token) return; // Игнорируем, если токена нет

            fetch('http://localhost:8000/api/auth/me', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })
                .then((res) => {
                    if (!res.ok) {
                        if (res.status === 401) {
                            return null; // Игнорируем ошибку 401
                        }
                        throw new Error('Ошибка запроса: ' + res.statusText);
                    }
                    return res.json();
                })
                .then((data) => {
                    if (data) {
                        setUser(data);
                        localStorage.setItem('user', JSON.stringify(data));
                    }
                })
                .catch((err) => {
                    if (err.message.includes('401')) {
                        // Игнорируем ошибку 401
                        return;
                    }
                    console.error('Ошибка получения данных пользователя:', err);
                });
        }
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <img src="/images/logo.png" alt="Логотип" />
            </div>

            {/* Кнопка бургер-меню */}
            <button className={styles.burgerMenu} onClick={toggleMenu}>
                <span
                    className={isMenuOpen ? styles.burgerIconOpen : styles.burgerIcon}
                ></span>
            </button>

            {/* Навигация */}
            <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
                <Link href="/">Главная</Link>
                <Link href="/BuyTicket">Купить билет</Link>
                <Link href="/Cruises">Круизы</Link>
                <Link href="/Restaurant">Услуги</Link>
                <Link href="/Reviews">Отзывы</Link>
                <Link href="/Contacts">Контакты</Link>
                <Link href="/Blog">Блог</Link>
            </nav>

            {/* Профиль пользователя */}
            <div className={styles.profile}>
                {user ? (
                    <span onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
                        {user.name}
                    </span>
                ) : (
                    <Link href="/login">
                        <button>
                            <img src="/images/profile.png" alt="Профиль" />
                        </button>
                    </Link>
                )}
            </div>

            {showPopup && <ProfilePopup user={user} onClose={handleClosePopup} />}
        </header>
    );
};

export default Header;