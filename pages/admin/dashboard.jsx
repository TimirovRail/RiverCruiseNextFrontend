import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './dashboard.css';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [bookings, setBookings] = useState([]);
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

        const fetchBookings = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/bookings', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Ошибка при загрузке данных о бронированиях');
                }

                const data = await response.json();
                setBookings(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchUserData();
        fetchFeedbacks();
        fetchBookings();
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
        <div className='layout'>
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

                <div className="title">
                    <h2 className="h1-title">БРОНИРОВАННЫЕ БИЛЕТЫ</h2>
                </div>
                <table className="bookings-table">
                    <thead>
                        <tr>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Круиз</th>
                            <th>Дата</th>
                            <th>Количество мест</th>
                            <th>Комментарий</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking, index) => (
                            <tr key={index}>
                                <td>{booking.name}</td>
                                <td>{booking.email}</td>
                                <td>{booking.cruise}</td>
                                <td>{booking.date}</td>
                                <td>{booking.seats}</td>
                                <td>{booking.comment}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
