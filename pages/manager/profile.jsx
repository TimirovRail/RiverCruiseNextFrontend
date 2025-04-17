import { useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './ManagerProfile.module.css';

const ManagerProfile = () => {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const role = (user?.role || localStorage.getItem('role') || '').trim().toLowerCase();

        if (!token || role !== 'manager') {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className={styles.container}>
            <h1>Профиль менеджера</h1>
            <p>Добро пожаловать в профиль менеджера!</p>
        </div>
    );
};

export default ManagerProfile;