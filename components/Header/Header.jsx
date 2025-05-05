'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import ProfilePopup from '../ProfilePopup/ProfilePopup';
import { API_BASE_URL } from '../../src/config';

const Header = () => {
    const [user, setUser] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [prevScrollPos, setPrevScrollPos] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset;
            setIsVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
            setPrevScrollPos(currentScrollPos);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [prevScrollPos]);

    const handleProfileClick = () => {
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

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
            if (!token) return;

            fetch(`${API_BASE_URL}/api/auth/me`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })
                .then((res) => {
                    if (!res.ok) {
                        if (res.status === 401) {
                            return null;
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
                        return;
                    }
                    console.error('Ошибка получения данных пользователя:', err);
                });
        }
    }, []);

    return (
        <header className={`${styles.header} ${!isVisible ? styles.hidden : ''}`}>
            <div className={styles.logo}>
                <img src="/images/logo.png" alt="Логотип" />
            </div>

            <button className={styles.burgerMenu} onClick={toggleMenu}>
                <span
                    className={isMenuOpen ? styles.burgerIconOpen : styles.burgerIcon}
                ></span>
            </button>

            <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
                <Link href="/">Главная</Link>
                <Link href="/BuyTicket">Купить билет</Link>
                <Link href="/Cruises">Круизы</Link>
                <Link href="/Restaurant">Услуги</Link>
                <Link href="/Reviews">Отзывы</Link>
                <Link href="/Contacts">Контакты</Link>
                <Link href="/Blog">Блог</Link>
            </nav>

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