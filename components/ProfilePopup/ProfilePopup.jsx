import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './ProfilePopup.module.css';
import Loading from "@/components/Loading/Loading";

const ProfilePopup = ({ onClose }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Загружаем пользователя из localStorage при монтировании компонента
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            setUser(storedUser);
        } else {
            // Если данных нет, перенаправляем на страницу входа
            window.location.href = '/login';
        }
    }, []);

    const handleLogout = () => {
        // Удаляем данные пользователя и токен из localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    // Если пользователь еще не загружен, показываем индикатор загрузки
    if (!user) {
        return <Loading />;
    }

    // Определяем, куда перенаправлять в зависимости от роли
    let profileLink = '/profile'; // По умолчанию для обычных пользователей
    if (user.role) {
        const role = user.role.toLowerCase();
        if (role === 'admin') {
            profileLink = '/admin/dashboard';
        } else if (role === 'manager') {
            profileLink = '/manager/profile'; // Для менеджера
        }
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <div className={styles.popupHeader}>
                    <h2>Профиль</h2>
                    <button onClick={onClose} className={styles.closeButton}>×</button>
                </div>
                <div className={styles.popupBody}>
                    <p>Имя: {user.name}</p>
                    <p>Email: {user.email}</p>
                    <div className={styles.flexButtons}>
                        <Link href={profileLink}>
                            <button className={styles.viewProfileButton}>Перейти в профиль</button>
                        </Link>
                        <button onClick={handleLogout} className={styles.logoutButton}>Выйти</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePopup;