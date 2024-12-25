import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import './profile.css'; 

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token'); 
            if (!token) {
                router.push('/login'); 
                return;
            }

            try {
                const res = await fetch('http://localhost:8000/api/user/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    router.push('/login'); 
                }
            } catch (err) {
                console.error(err);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login'); 
    };

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    if (!user) {
        return null; 
    }

    return (
        <div className="profile-container">
            <h1>Профиль пользователя</h1>
            <div className="profile-info">
                <p><strong>Имя:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
            </div>
            <button onClick={handleLogout} className="logout-button">Выйти</button>
        </div>
    );
};

export default ProfilePage;
