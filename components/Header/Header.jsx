'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <img src="/images/logo.png" alt="Логотип" />
            </div>
            <nav className={styles.nav}>
                <Link href="/">Главная</Link>
                <Link href="/Cruises">Круизы</Link>
                <Link href="/Restaurant">Услуги</Link>
                <Link href="/Reviews">Отзывы</Link>
                <Link href="/Contacts">Контакты</Link>
                <Link href="/Blog">Блог</Link>
                <Link href="/Shop">Магазин</Link>
            </nav>
            <div className={styles.profile}>
                <Link href="/login">
                    <button>
                        <img src="/images/profile.png" alt="Профиль" />
                    </button>
                </Link>
            </div>
        </header>
    );
};

export default Header;
