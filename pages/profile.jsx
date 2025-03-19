import { useEffect, useState } from "react";
import { useRouter } from "next/router"; // Используем useRouter из Next.js
import Loading from "@/components/Loading/Loading";
import axios from "axios";
import './profile.css'; // Подключение стилей

export default function Profile() {
    const [user, setUser] = useState(null);  // Данные текущего пользователя
    const [data, setData] = useState(null);  // Все бронирования и отзывы
    const [userPhotos, setUserPhotos] = useState([]); // Фотографии пользователя
    const [error, setError] = useState(null);
    const router = useRouter(); // Хук для навигации в Next.js

    useEffect(() => {
        // Загружаем текущего пользователя
        axios.get("http://localhost:8000/api/user/profile", {
            withCredentials: true,
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(response => {
                setUser(response.data.user);
            })
            .catch(error => {
                console.error("Ошибка загрузки профиля", error);
                setError("Ошибка загрузки данных пользователя");
            });

        // Загружаем все данные
        axios.get("http://localhost:8000/api/all-data", {
            withCredentials: true,
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error("Ошибка загрузки данных", error);
                setError("Ошибка загрузки данных");
            });
    }, []);

    useEffect(() => {
        // Загружаем фотографии пользователя
        if (user) {
            axios.get(`http://localhost:8000/api/user/photos/${user.id}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            })
                .then(response => {
                    setUserPhotos(response.data.photos);
                })
                .catch(error => {
                    console.error("Ошибка загрузки фотографий", error);
                });
        }
    }, [user]); // Загружаем фотографии при изменении user

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!user || !data) {
        return <Loading />;
    }

    // Фильтруем отзывы и бронирования текущего пользователя
    const userFeedbacks = data.feedbacks?.filter(fb => fb.user_id === user.id) || [];
    const userBookings = data.bookings?.filter(b => b.user_id === user.id) || [];

    return (
        <div className="container">
            <header>
                <h1>{user.name}</h1>
                <h2>{user.email}</h2>
                {/* Кнопка для возврата на главное меню */}
                <button
                    onClick={() => router.push("/")} // Переход на главную страницу
                    className="back-button"
                >
                    На главную
                </button>
            </header>

            <div className="section-content">
                <h3 className="section-title">Мои отзывы</h3>
                {userFeedbacks.length > 0 ? (
                    <ul>
                        {userFeedbacks.map((fb) => (
                            <li key={fb.id}>
                                <p><strong>{fb.feedback}</strong></p>
                                <p><small>Круиз: {fb.cruise}</small></p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="error-message">У вас пока нет отзывов</p>
                )}
            </div>

            <div className="section-content">
                <h3 className="section-title">Мои бронирования</h3>
                {userBookings.length > 0 ? (
                    <ul>
                        {userBookings.map((b) => (
                            <li key={b.id}>
                                <p><strong>{b.cruise}</strong></p>
                                <p><small>Дата: {b.date} — {b.seats} мест</small></p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="error-message">У вас пока нет бронирований</p>
                )}
            </div>

            <div className="section-content">
                <h3 className="section-title">Мои фотографии</h3>
                {userPhotos.length > 0 ? (
                    <div className="user-photos">
                        {userPhotos.map((photo) => (
                            <div key={photo.id} className="photo-wrapper">
                                <img
                                    src={`http://localhost:8000${photo.url}`} // Используем URL из сервера
                                    alt={photo.name || `User photo ${photo.id}`}
                                    className="photo"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="error-message">У вас пока нет фотографий</p>
                )}
            </div>

            <footer>
                <p>Круиз по рекам России</p>
            </footer>
        </div>
    );
}