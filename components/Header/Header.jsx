import React from 'react';
import Link from 'next/link'; 
import './Header.css';

const Header = () => {
    return (
        <header className="header">
            <div className="logo">Круиз по рекам России</div>
            <nav className="nav">
                <ul>
                    <li><Link href="/">Главная</Link></li> 
                    <li><Link href="/cruises">Круизы</Link></li>
                    <li><Link href="/reviews">Отзывы</Link></li>
                    <li><Link href="/contacts">Контакты</Link></li>
                    <li><Link href="/login">Войти</Link></li>
                    <li><Link href="/register">Регистрация</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
