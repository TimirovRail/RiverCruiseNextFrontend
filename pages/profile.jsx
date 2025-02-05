import { useEffect, useState } from "react";
import Loading from "@/components/Loading/Loading";
import axios from "axios";
import './profile.css'; // Подключение стилей

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:8000/api/user/profile", {
            withCredentials: true,  // Для Sanctum
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } // Для JWT
        })
            .then(response => {
                setProfile(response.data);
            })
            .catch(error => {
                console.error("Ошибка загрузки профиля", error);
                setError("Ошибка загрузки данных");
            });
    }, []);

    if (error) {
        return <p className="error-message">Ошибка загрузки данных</p>;
    }

    if (!profile) {
        return <Loading/>;
    }

    return (
        <div className="container">
            <header>
                <h1>{profile.user?.name}</h1>
                <h2>{profile.user?.email}</h2>
            </header>

            <div className="section-content">
                <h3 className="section-title">История отзывов</h3>
                {profile.feedbacks?.length > 0 ? (
                    <ul>
                        {profile.feedbacks.map((fb) => (
                            <li key={fb.id}>
                                <p><strong>{fb.feedback}</strong></p>
                                <p><small>Круиз: {fb.cruise}</small></p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="error-message">Отзывов пока нет</p>
                )}
            </div>

            <div className="section-content">
                <h3 className="section-title">История бронирований</h3>
                {profile.bookings?.length > 0 ? (
                    <ul>
                        {profile.bookings.map((b) => (
                            <li key={b.id}>
                                <p><strong>{b.cruise}</strong></p>
                                <p><small>Дата: {b.date} — {b.seats} мест</small></p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="error-message">Бронирований пока нет</p>
                )}
            </div>

            <footer>
                <p>Круиз по рекам России</p>
            </footer>
        </div>
    );
}
