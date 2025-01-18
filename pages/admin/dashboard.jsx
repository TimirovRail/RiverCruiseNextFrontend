import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './dashboard.css';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [cruises, setCruises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const router = useRouter();

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);

            const urls = [
                { url: 'http://localhost:8000/api/user', setter: setUserData },
                { url: 'http://localhost:8000/api/feedbacks', setter: setFeedbacks },
                { url: 'http://localhost:8000/api/bookings', setter: setBookings },
                { url: 'http://localhost:8000/api/cruises', setter: setCruises },
            ];

            try {
                await Promise.all(
                    urls.map(async ({ url, setter }) => {
                        const response = await fetch(url, {
                            method: 'GET',
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                            },
                        });

                        if (!response.ok) {
                            throw new Error(`Ошибка при загрузке данных с ${url}`);
                        }

                        const data = await response.json();
                        setter(data);
                    })
                );
            } catch (err) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [err.message]: true,
                }));
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    if (loading) {
        return <p>Загрузка...</p>;
    }

    return (
        <div className="layout">
            <div className="dashboard-container">
                <div className="title">
                    <h2 className="h1-title">ПАНЕЛЬ АДМИНИСТРАТОРА</h2>
                </div>
                {errors['http://localhost:8000/api/user'] ? (
                    <p>Ошибка при загрузке данных пользователя</p>
                ) : (
                    <div className="user-info">
                        <h2>ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ</h2>
                        <p><strong>Имя:</strong> {userData?.name}</p>
                        <p><strong>Email:</strong> {userData?.email}</p>
                        <p><strong>Роль:</strong> {userData?.role}</p>
                    </div>
                )}
                <button onClick={handleLogout}>Выйти</button>

                {errors['http://localhost:8000/api/cruises'] ? (
                    <p>Ошибка при загрузке круизов</p>
                ) : (
                    <>
                        <h2>КРУИЗЫ</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Название</th>
                                    <th>Описание</th>
                                    <th>Река</th>
                                    <th>Места</th>
                                    <th>Каюты</th>
                                    <th>Начало</th>
                                    <th>Конец</th>
                                    <th>Цена</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cruises.map((cruise, index) => (
                                    <tr key={index}>
                                        <td>{cruise.name}</td>
                                        <td>{cruise.description}</td>
                                        <td>{cruise.river}</td>
                                        <td>{cruise.available_places}/{cruise.total_places}</td>
                                        <td>{cruise.cabins}</td>
                                        <td>{cruise.start_date}</td>
                                        <td>{cruise.end_date}</td>
                                        <td>{cruise.price_per_person}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {errors['http://localhost:8000/api/feedbacks'] ? (
                    <p>Ошибка при загрузке отзывов</p>
                ) : (
                    <>
                        <h2>ОТЗЫВЫ</h2>
                        <table>
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
                    </>
                )}

                {errors['http://localhost:8000/api/bookings'] ? (
                    <p>Ошибка при загрузке бронирований</p>
                ) : (
                    <>
                        <h2>БРОНИРОВАНИЯ</h2>
                        <table>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
