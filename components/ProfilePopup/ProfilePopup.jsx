import React from 'react';
import Link from 'next/link';
import styles from './ProfilePopup.module.css';

const ProfilePopup = ({ user, onClose }) => {
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

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
                        <Link href="/profile">
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
