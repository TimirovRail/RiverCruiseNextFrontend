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
                <a href="#home">Главная</a>
                <a href="#cruises">Круизы</a>
                <a href="#restaurant">Ресторан</a>
                <a href="#reviews">Отзывы</a>
                <a href="#contacts">Контакты</a>
            </nav>
            <div className={styles.profile}>
                <Link href="/login">
                    <button><img src="/images/profile.png" alt="" /></button>
                </Link>
            </div>
        </header>
    );
};

export default Header;