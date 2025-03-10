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

    // Состояние для модального окна
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCruise, setEditingCruise] = useState(null);
    const [editingFeedback, setEditingFeedback] = useState(null);

    // Состояние для создания нового круиза
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

    // Загрузка данных
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

    // Создание нового круиза
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

    // Удаление круиза
    const handleDeleteCruise = async (cruiseId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/cruises/${cruiseId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении круиза');
            }

            setCruises(cruises.filter(cruise => cruise.id !== cruiseId));
            alert('Круиз успешно удалён!');
        } catch (error) {
            console.error(error);
            alert('Ошибка: не удалось удалить круиз');
        }
    };

    // Удаление отзыва
    const handleDeleteFeedback = async (feedbackId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/feedbacks/${feedbackId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении отзыва');
            }

            setFeedbacks(feedbacks.filter(feedback => feedback.id !== feedbackId));
            alert('Отзыв успешно удалён!');
        } catch (error) {
            console.error(error);
            alert('Ошибка: не удалось удалить отзыв');
        }
    };

    // Открытие модального окна для редактирования круиза
    const handleEditCruiseClick = (cruise) => {
        setEditingCruise(cruise);
        setIsEditModalOpen(true);
    };

    // Открытие модального окна для редактирования отзыва
    const handleEditFeedbackClick = (feedback) => {
        setEditingFeedback(feedback);
        setIsEditModalOpen(true);
    };

    // Сохранение изменений круиза
    const handleSaveCruise = async (updatedData) => {
        try {
            const response = await fetch(`http://localhost:8000/api/cruises/${updatedData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error('Ошибка при редактировании круиза');
            }

            const data = await response.json();
            setCruises(cruises.map(cruise => cruise.id === updatedData.id ? data : cruise));
            handleCloseModal(); // Закрываем модальное окно и очищаем состояние
            alert('Круиз успешно обновлён!');
        } catch (error) {
            console.error(error);
            alert('Ошибка: не удалось обновить круиз');
        }
    };

    // Сохранение изменений отзыва
    const handleSaveFeedback = async (updatedData) => {
        try {
            const response = await fetch(`http://localhost:8000/api/feedbacks/${updatedData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error('Ошибка при редактировании отзыва');
            }

            const data = await response.json();
            setFeedbacks(feedbacks.map(feedback => feedback.id === updatedData.id ? data : feedback));
            handleCloseModal(); // Закрываем модальное окно и очищаем состояние
            alert('Отзыв успешно обновлён!');
        } catch (error) {
            console.error(error);
            alert('Ошибка: не удалось обновить отзыв');
        }
    };

    // Закрытие модального окна и очистка состояния
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setEditingCruise(null);
        setEditingFeedback(null);
    };

    // Компонент модального окна
    const EditModal = ({ isOpen, onClose, children }) => {
        if (!isOpen) return null;

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    {children}
                    <button onClick={onClose} className="modal-close-button">Закрыть</button>
                </div>
            </div>
        );
    };

    // Форма редактирования круиза
    const CruiseEditForm = ({ cruise, onSave, onCancel }) => {
        const [formData, setFormData] = useState(cruise);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            onSave(formData);
        };

        return (
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <p>Название круиза</p>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field"
                    />
                </div>
                <div className="input-group">
                    <p>Описание круиза</p>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="textarea-field"
                    ></textarea>
                </div>
                {/* Добавьте остальные поля для редактирования */}
                <button type="submit" className="button">Сохранить</button>
                <button type="button" onClick={onCancel} className="button">Отмена</button>
            </form>
        );
    };

    // Форма редактирования отзыва
    const FeedbackEditForm = ({ feedback, onSave, onCancel }) => {
        const [formData, setFormData] = useState(feedback);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData({ ...formData, [name]: value });
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            onSave(formData);
        };

        return (
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <p>Имя</p>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field"
                    />
                </div>
                <div className="input-group">
                    <p>Email</p>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field"
                    />
                </div>
                <div className="input-group">
                    <p>Отзыв</p>
                    <textarea
                        name="feedback"
                        value={formData.feedback}
                        onChange={handleChange}
                        className="textarea-field"
                    ></textarea>
                </div>
                <button type="submit" className="button">Сохранить</button>
                <button type="button" onClick={onCancel} className="button">Отмена</button>
            </form>
        );
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="layout">
            {/* Модальное окно для редактирования */}
            <EditModal isOpen={isEditModalOpen} onClose={handleCloseModal}>
                {editingCruise && (
                    <CruiseEditForm
                        cruise={editingCruise}
                        onSave={handleSaveCruise}
                        onCancel={handleCloseModal}
                    />
                )}
                {editingFeedback && (
                    <FeedbackEditForm
                        feedback={editingFeedback}
                        onSave={handleSaveFeedback}
                        onCancel={handleCloseModal}
                    />
                )}
            </EditModal>

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
                    <button onClick={() => router.push('/')} className="home-button">На главный экран</button>
                    <button onClick={() => {
                        localStorage.removeItem('token');
                        router.push('/login');
                    }} className="logout-button">Выйти</button>
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
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cruises.map((cruise, index) => (
                                    <tr key={index}>
                                        <td>{cruise.name}</td>
                                        <td>{cruise.description}</td>
                                        <td>{cruise.river}</td>
                                        <td>{cruise.total_places}/{cruise.available_places}</td>
                                        <td>{cruise.cabins}</td>
                                        <td>{cruise.start_date}</td>
                                        <td>{cruise.end_date}</td>
                                        <td>{cruise.price_per_person}</td>
                                        <td>
                                            <button onClick={() => handleEditCruiseClick(cruise)} className="edit-button">
                                                Редактировать
                                            </button>
                                            <button onClick={() => handleDeleteCruise(cruise.id)} className="delete-button">
                                                Удалить
                                            </button>
                                        </td>
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
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feedbacks.map((feedback, index) => (
                                    <tr key={index}>
                                        <td>{feedback.name}</td>
                                        <td>{feedback.email}</td>
                                        <td>{feedback.feedback}</td>
                                        <td>{feedback.cruise}</td>
                                        <td>
                                            <button onClick={() => handleEditFeedbackClick(feedback)} className="edit-button">
                                                Редактировать
                                            </button>
                                            <button onClick={() => handleDeleteFeedback(feedback.id)} className="delete-button">
                                                Удалить
                                            </button>
                                        </td>
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