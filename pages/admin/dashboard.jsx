import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './dashboard.css';
import Loading from "@/components/Loading/Loading";

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [cruises, setCruises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const router = useRouter();
    const [newCruise, setNewCruise] = useState({
        name: '',
        description: '',
        river: '',
        total_places: 0,
        cabins: 0,
        start_date: '',
        end_date: '',
        price_per_person: 0,
        available_places: 0,
    });
    const handleCreateCruise = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/cruises', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(newCruise),
            });

            if (!response.ok) {
                throw new Error('Ошибка при создании круиза');
            }

            const data = await response.json();
            setCruises([...cruises, data]);
            alert('Круиз успешно добавлен!');
        } catch (error) {
            console.error(error);
            alert('Ошибка: не удалось создать круиз');
        }
    };
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
    const goToHome = () => {
        router.push('/');
    };

    if (loading) {
        return <Loading />;
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
                <div className="button-group">
                    <button onClick={goToHome} className="home-button">На главный экран</button>
                    <button onClick={handleLogout} className="logout-button">Выйти</button>
                </div>

                {errors['http://localhost:8000/api/cruises'] ? (
                    <p>Ошибка при загрузке круизов</p>
                ) : (
                    <>
                        <h2>СПИСОК КРУИЗОВ</h2>
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
                                        <td>{cruise.total_places}/{cruise.total_places}</td>
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

                <h2>ФОРМА ДЛЯ СОЗДАНИЯ КРУИЗА</h2>

                <form onSubmit={(e) => { e.preventDefault(); handleCreateCruise(); }} className="form-container">
                    <div className="input-group">
                        <p>Введите название круиза</p>
                        <input
                            type="text"
                            value={newCruise.name}
                            onChange={(e) => setNewCruise({ ...newCruise, name: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    <div className="input-group">
                        <p>Описание круиза</p>
                        <textarea
                            value={newCruise.description}
                            onChange={(e) => setNewCruise({ ...newCruise, description: e.target.value })}
                            className="textarea-field"
                        ></textarea>
                    </div>

                    <div className="input-group">
                        <p>Название реки</p>
                        <input
                            type="text"
                            value={newCruise.river}
                            onChange={(e) => setNewCruise({ ...newCruise, river: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    <div className="input-group">
                        <p>Общее количество мест</p>
                        <input
                            type="number"
                            value={newCruise.total_places}
                            onChange={(e) => setNewCruise({ ...newCruise, total_places: Number(e.target.value) })}
                            className="input-field"
                        />
                    </div>

                    <div className="input-group">
                        <p>Количество кают</p>
                        <input
                            type="number"
                            value={newCruise.cabins}
                            onChange={(e) => setNewCruise({ ...newCruise, cabins: Number(e.target.value) })}
                            className="input-field"
                        />
                    </div>

                    <div className="input-group">
                        <p>Начало круиза</p>
                        <input
                            type="date"
                            value={newCruise.start_date}
                            onChange={(e) => setNewCruise({ ...newCruise, start_date: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    <div className="input-group">
                        <p>Конец круиза</p>
                        <input
                            type="date"
                            value={newCruise.end_date}
                            onChange={(e) => setNewCruise({ ...newCruise, end_date: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    <div className="input-group">
                        <p>Цена за человека</p>
                        <input
                            type="number"
                            value={newCruise.price_per_person}
                            onChange={(e) => setNewCruise({ ...newCruise, price_per_person: Number(e.target.value) })}
                            className="input-field"
                        />
                    </div>

                    <div className="input-group">
                        <p>Доступные места</p>
                        <input
                            type="number"
                            value={newCruise.available_places}
                            onChange={(e) => setNewCruise({ ...newCruise, available_places: Number(e.target.value) })}
                            className="input-field"
                        />
                    </div>

                    <button type="submit" className="button">Добавить круиз</button>
                </form>
                {errors['http://localhost:8000/api/feedbacks'] ? (
                    <p>Ошибка при загрузке отзывов</p>
                ) : (
                    <>
                        <h2>ОТЗЫВЫ КЛИЕНТОВ</h2>
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
                        <h2>БРОНИРОВАННЫЕ БИЛЕТЫ</h2>
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
