import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './dashboard.css';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/user', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Ошибка при загрузке данных пользователя');
                }

                const data = await response.json();
                setUserData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchFeedbacks = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/feedbacks', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Ошибка при загрузке отзывов');
                }

                const data = await response.json();
                setFeedbacks(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchUserData();
        fetchFeedbacks();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    if (loading) {
        return <p>Загрузка...</p>;
    }

    if (error) {
        return <p>Ошибка: {error}</p>;
    }

    return (
        <div className="dashboard-container">
            <div className="title">
                <h2 className="h1-title">ПАНЕЛЬ АДМИНИСТРАТОРА</h2>
            </div>
            <div className="user-info">
            <div className="title">
                <h2 className="h1-title">ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ</h2>
            </div>
                <div>
                    <p><strong>Имя:</strong> {userData.name}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Роль:</strong> {userData.role}</p>
                </div>
            </div>
            <button onClick={handleLogout}>Выйти</button>

            <div className="title">
                <h2 className="h1-title">ОТЗЫВЫ</h2>
            </div>
            <table className="feedbacks-table">
                <thead>
                    <tr>
                        <th>Имя</th>
                        <th>Email</th>
                        <th>Отзыв</th>
                        <th>Круиз</th>
                    </tr>
                </thead>
                <tbody>
                    {feedbacks.map((feedback, index) => (
                        <tr key={index}>
                            <td>{feedback.name}</td>
                            <td>{feedback.email}</td>
                            <td>{feedback.feedback}</td>
                            <td>{feedback.cruise}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Dashboard;
