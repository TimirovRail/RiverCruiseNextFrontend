import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/Loading/Loading";
import axios from "axios";
import './profile.css';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [data, setData] = useState(null);
    const [userPhotos, setUserPhotos] = useState([]);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        axios.get("http://localhost:8000/api/auth/profile", {
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
    }, [user]);

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!user || !data) {
        return <Loading />;
    }

    const userReviews = data.reviews?.filter(fb => fb.user_id === user.id) || [];
    const userBookings = data.bookings?.filter(b => b.user_id === user.id) || [];

    return (
        <div className="container">
            <header>
                <h1>{user.name}</h1>
                <h2>{user.email}</h2>
                <button
                    onClick={() => router.push("/")}
                    className="back-button"
                >
                    На главную
                </button>
            </header>

            <div className="section-content">
                <h3 className="section-title">Мои отзывы</h3>
                {userReviews.length > 0 ? (
                    <ul>
                        {userReviews.map((fb) => (
                            <li key={fb.id}>
                                <p><strong>{fb.comment}</strong></p>
                                <p><small>Круиз: {fb.cruise}</small></p>
                                <p><small>Оценка: {fb.rating}/5</small></p>
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
                                <p>
                                    <small>
                                        Дата: {new Date(b.date).toLocaleDateString()}
                                    </small>
                                </p>
                                <p>
                                    <small>
                                        Места: Эконом: {b.economy_seats}, Стандарт: {b.standard_seats}, Люкс: {b.luxury_seats}
                                    </small>
                                </p>
                                <p><small>Стоимость: {b.total_price} руб.</small></p>
                                {Array.isArray(b.extras) && b.extras.length > 0 && (
                                    <p><small>Доп. услуги: {b.extras.join(', ')}</small></p>
                                )}
                                {b.comment && (
                                    <p><small>Комментарий: {b.comment}</small></p>
                                )}
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
                                    src={`http://localhost:8000${photo.url}`}
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