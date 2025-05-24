import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import QRCode from "qrcode";
import './profile.css';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Loading from '../components/Loading/Loading';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { API_BASE_URL } from '../src/config';

const stripePromise = loadStripe('pk_test_51R7tDn07BVvEjWueRJTSYfrtHZ7UqTy3A8RQ3KUTtNVSnT9czvcX2GZCbaOOeHEMB2E3QWndHxLwhvX6FJopxB2G00s7rcz8mh');

const PaymentForm = ({ booking, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
            });

            if (error) throw error;

            await axios.post(`${API_BASE_URL}/api/bookings/${booking.id}/mark-as-paid`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            alert('Оплата успешно выполнена!');
            onClose();
        } catch (error) {
            console.error("Ошибка оплаты:", error);
            alert(`Ошибка оплаты: ${error.message}`);
        }
    };

    return (
        <div className="payment-form">
            <form onSubmit={handlePaymentSubmit}>
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#333',
                            '::placeholder': { color: '#777' }
                        }
                    }
                }} />
                <div className="button-group">
                    <button
                        type="submit"
                        className="action-button pay-now-button"
                        disabled={!stripe}
                    >
                        Оплатить {booking.total_price || 0} руб.
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="action-button close-button"
                    >
                        Закрыть
                    </button>
                </div>
            </form>
        </div>
    );
};

export default function Profile() {
    const [user, setUser] = useState(null);
    const [data, setData] = useState(null);
    const [bookings, setBookings] = useState(null);
    const [userPhotos, setUserPhotos] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState({ economy: [], standard: [], luxury: [] });
    const [showPayment, setShowPayment] = useState(false);
    const [seatError, setSeatError] = useState(null);
    const [qrCodes, setQrCodes] = useState({});
    const [showQrCode, setShowQrCode] = useState({});
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [openSection, setOpenSection] = useState(null);

    // Refs для измерения высоты секций
    const sectionRefs = {
        user: useRef(null),
        reviews: useRef(null),
        bookings: useRef(null),
        tickets: useRef(null),
        photos: useRef(null),
    };

    const router = useRouter();

    const toggleSection = (section) => {
        const newSection = openSection === section ? null : section;
        setOpenSection(newSection);

        // Динамически устанавливаем max-height для открытой секции
        Object.keys(sectionRefs).forEach((key) => {
            const ref = sectionRefs[key].current;
            if (ref) {
                if (key === newSection) {
                    // Устанавливаем max-height равным scrollHeight для открытой секции
                    ref.style.maxHeight = `${ref.scrollHeight}px`;
                } else {
                    // Сбрасываем max-height для закрытых секций
                    ref.style.maxHeight = '0';
                }
            }
        });
    };

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const [profileRes, dataRes, bookingsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/api/all-data`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/api/bookings`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setUser(profileRes.data.user);
            setData(dataRes.data);
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
            setError(error.response?.data?.message || "Ошибка загрузки данных");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const generateQrCodes = useCallback((bookingsList) => {
        const newQrCodes = {};
        bookingsList.forEach(b => {
            const qrData = JSON.stringify({
                booking_id: b.id,
                user_id: b.user_id,
                cruise_schedule_id: b.cruise_schedule_id,
                economy_seats: b.economy_seats || 0,
                standard_seats: b.standard_seats || 0,
                luxury_seats: b.luxury_seats || 0,
            });

            QRCode.toDataURL(qrData, { width: 256 }, (err, url) => {
                if (!err) newQrCodes[b.id] = url;
            });
        });
        setQrCodes(prev => ({ ...prev, ...newQrCodes }));
    }, []);

    useEffect(() => {
        if (bookings && user) {
            const purchasedTickets = bookings.filter(b =>
                b.user_id === user.id && b.is_paid
            );
            generateQrCodes(purchasedTickets);
        }
    }, [bookings, user, generateQrCodes]);

    useEffect(() => {
        if (user) {
            const token = localStorage.getItem("token");
            axios.get(`${API_BASE_URL}/api/user/photos/${user.id}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(response => {
                    setUserPhotos(response.data.photos);
                    console.log("User photos:", response.data);
                })
                .catch(error => console.error("Ошибка загрузки фотографий:", error.response?.data || error.message));
        }
    }, [user]);

    const handlePaymentClick = useCallback(async (booking) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `${API_BASE_URL}/api/cruise-schedule/${booking.cruise_schedule_id}/seats`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSelectedBooking({
                ...booking,
                seats: response.data
            });
            setSelectedSeats({ economy: [], standard: [], luxury: [] });
            setSeatError(null);
        } catch (error) {
            console.error("Ошибка загрузки мест:", error);
            setError("Не удалось загрузить информацию о местах");
        }
    }, []);

    const toggleSeat = useCallback((category, seatNumber) => {
        setSelectedSeats(prev => {
            const seats = prev[category];
            const available = selectedBooking?.seats?.[category]?.available || 0;

            if (seats.includes(seatNumber)) {
                return { ...prev, [category]: seats.filter(s => s !== seatNumber) };
            }

            if (seats.length < available) {
                return { ...prev, [category]: [...seats, seatNumber] };
            }

            return prev;
        });
    }, [selectedBooking]);

    const confirmSeats = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const { data } = await axios.post(
                `${API_BASE_URL}/api/bookings/${selectedBooking.id}/reserve-seats`,
                { seats: selectedSeats },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updatedBooking = data.booking;
            setShowPayment(true);

            const qrData = JSON.stringify({
                booking_id: updatedBooking.id,
                user_id: updatedBooking.user_id,
                cruise_schedule_id: updatedBooking.cruise_schedule_id,
                economy_seats: updatedBooking.economy_seats || 0,
                standard_seats: updatedBooking.standard_seats || 0,
                luxury_seats: updatedBooking.luxury_seats || 0,
            });

            QRCode.toDataURL(qrData, { width: 128 }, (err, url) => {
                if (!err) {
                    setQrCodes(prev => ({ ...prev, [updatedBooking.id]: url }));
                }
            });

            const { data: newBookings } = await axios.get(
                `${API_BASE_URL}/api/bookings`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBookings(newBookings);
        } catch (error) {
            console.error("Ошибка сохранения мест:", error);
            setError(error.response?.data?.message || "Ошибка сохранения мест");
        } finally {
            setLoading(false);
        }
    }, [selectedBooking, selectedSeats]);

    const handleLogout = () => {
        if (window.confirm("Вы точно хотите выйти?")) {
            localStorage.clear();
            router.push('/login');
        }
    };

    const handleCancelReview = async (reviewId) => {
        if (window.confirm("Вы точно хотите удалить этот отзыв?")) {
            const token = localStorage.getItem("token");
            try {
                await axios.delete(`${API_BASE_URL}/api/reviews/${reviewId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(prev => ({
                    ...prev,
                    reviews: prev.reviews.filter(r => r.id !== reviewId)
                }));
                alert('Отзыв успешно удален!');
            } catch (error) {
                console.error("Ошибка удаления отзыва:", error);
                alert('Ошибка при удалении отзыва');
            }
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (window.confirm("Вы точно хотите отменить эту бронь?")) {
            const token = localStorage.getItem("token");
            try {
                const booking = bookings.find(b => b.id === bookingId);
                if (!booking) {
                    throw new Error("Бронирование не найдено");
                }

                if (booking.is_paid) {
                    alert("Это оплаченный билет. Отмена может потребовать возврата средств. Пожалуйста, свяжитесь с поддержкой.");
                    return;
                }

                await axios.delete(`${API_BASE_URL}/api/bookings/${bookingId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setBookings(prev => prev.filter(b => b.id !== bookingId));
                await fetchData();
                alert('Бронь успешно отменена!');
            } catch (error) {
                console.error("Ошибка отмены брони:", error.response?.data || error.message);
                alert(`Ошибка при отмене брони: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    const handleCancelPhoto = async (photoId) => {
        if (window.confirm("Вы точно хотите удалить эту фотографию?")) {
            const token = localStorage.getItem("token");
            try {
                await axios.delete(`${API_BASE_URL}/api/photos/${photoId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserPhotos(prev => prev.filter(p => p.id !== photoId));
                alert('Фотография успешно удалена!');
            } catch (error) {
                console.error("Ошибка удаления фотографии:", error.response?.data || error.message);
                alert('Ошибка при удалении фотографии');
            }
        }
    };

    const toggleQrCode = (bookingId) => {
        setShowQrCode(prev => ({ ...prev, [bookingId]: !prev[bookingId] }));
    };

    const handlePhotoClick = (photo) => {
        setSelectedPhoto(photo);
    };

    const closePhotoModal = () => {
        setSelectedPhoto(null);
    };

    if (error) return <p className="error-message">{error}</p>;
    if (loading || !user || !bookings) return <Loading />;

    const userReviews = data?.reviews?.filter(fb => fb.user_id === user.id) || [];
    const userBookings = bookings?.filter(b => b.user_id === user.id && !b.is_paid) || [];
    const purchasedTickets = bookings?.filter(b => b.user_id === user.id && b.is_paid) || [];

    return (
        <>
            <Header user={user} onBack={() => router.push("/")} />

            <div className="container">
                <div className="title">
                    <h2 className="h1-title">ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ</h2>
                </div>
                <div className={`section-title ${openSection === 'user' ? 'open' : ''}`} onClick={() => toggleSection('user')}>
                    Информация о пользователе
                </div>
                <div className={`section-content ${openSection === 'user' ? 'open' : ''}`} ref={sectionRefs.user}>
                    {user ? (
                        <div className="user-info fade-in">
                            <p><strong>Имя:</strong> {user.name || "Не указано"}</p>
                            <p><strong>Email:</strong> {user.email || "Не указано"}</p>
                            <button onClick={handleLogout} className="action-button logout-button">
                                Выйти
                            </button>
                        </div>
                    ) : (
                        <p className="error-message fade-in">Информация о пользователе недоступна</p>
                    )}
                </div>

                <div className={`section-title ${openSection === 'reviews' ? 'open' : ''}`} onClick={() => toggleSection('reviews')}>
                    Мои отзывы
                </div>
                <div className={`section-content ${openSection === 'reviews' ? 'open' : ''}`} ref={sectionRefs.reviews}>
                    {userReviews.length > 0 ? (
                        <ul className="fade-in">
                            {userReviews.map((fb) => (
                                <li key={fb.id}>
                                    <p><strong>{fb.comment}</strong></p>
                                    <p><small>Круиз: {fb.cruise}</small></p>
                                    <p><small>Оценка: {fb.rating}/5</small></p>
                                    <button
                                        onClick={() => handleCancelReview(fb.id)}
                                        className="action-button cancel-button"
                                    >
                                        Отменить отзыв
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="error-message fade-in">У вас пока нет отзывов</p>
                    )}
                </div>

                <div className={`section-title ${openSection === 'bookings' ? 'open' : ''}`} onClick={() => toggleSection('bookings')}>
                    Мои бронирования
                </div>
                <div className={`section-content ${openSection === 'bookings' ? 'open' : ''}`} ref={sectionRefs.bookings}>
                    {userBookings.length > 0 ? (
                        <ul className="fade-in">
                            {userBookings.map((b) => (
                                <li key={b.id}>
                                    <p>
                                        <strong>
                                            {b.cruise_name || "Название круиза не указано"}
                                        </strong>
                                    </p>
                                    <p>
                                        <small>
                                            Дата отправления: {b.departure_datetime
                                                ? new Date(b.departure_datetime).toLocaleDateString()
                                                : "Дата не указана"}
                                        </small>
                                    </p>
                                    <p>
                                        <small>
                                            Места: Эконом: {b.economy_seats || 0}, Стандарт: {b.standard_seats || 0}, Люкс: {b.luxury_seats || 0}
                                        </small>
                                    </p>
                                    <p><small>Стоимость: {b.total_price || 0} руб.</small></p>
                                    {Array.isArray(b.extras) && b.extras.length > 0 && (
                                        <p><small>Доп. услуги: {b.extras.join(', ')}</small></p>
                                    )}
                                    {b.comment && <p><small>Комментарий: {b.comment}</small></p>}
                                    <div className="button-group">
                                        <button
                                            onClick={() => handlePaymentClick(b)}
                                            className="action-button pay-button"
                                        >
                                            Перейти к оплате
                                        </button>
                                        <button
                                            onClick={() => handleCancelBooking(b.id)}
                                            className="action-button cancel-button"
                                        >
                                            Отмена брони
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="error-message fade-in">У вас пока нет бронирований</p>
                    )}
                </div>

                <div className={`section-title ${openSection === 'tickets' ? 'open' : ''}`} onClick={() => toggleSection('tickets')}>
                    Купленные билеты
                </div>
                <div className={`section-content ${openSection === 'tickets' ? 'open' : ''}`} ref={sectionRefs.tickets}>
                    {purchasedTickets.length > 0 ? (
                        <ul className="fade-in">
                            {purchasedTickets.map((b) => (
                                <li key={b.id}>
                                    <p>
                                        <strong>
                                            {b.cruise_name || "Название круиза не указано"}
                                        </strong>
                                    </p>
                                    <p>
                                        <small>
                                            Дата отправления: {b.departure_datetime
                                                ? new Date(b.departure_datetime).toLocaleDateString()
                                                : "Дата не указана"}
                                        </small>
                                    </p>
                                    <p>
                                        <small>
                                            Места: Эконом: {b.economy_seats || 0}, Стандарт: {b.standard_seats || 0}, Люкс: {b.luxury_seats || 0}
                                        </small>
                                    </p>
                                    <p><small>Стоимость: {b.total_price || 0} руб.</small></p>
                                    {Array.isArray(b.extras) && b.extras.length > 0 && (
                                        <p><small>Доп. услуги: {b.extras.join(', ')}</small></p>
                                    )}
                                    {b.comment && <p><small>Комментарий: {b.comment}</small></p>}
                                    <button
                                        onClick={() => toggleQrCode(b.id)}
                                        className="action-button qr-button"
                                    >
                                        {showQrCode[b.id] ? 'Скрыть QR-код' : 'Показать QR-код'}
                                    </button>
                                    {showQrCode[b.id] && (
                                        <div className="qr-code">
                                            {qrCodes[b.id] ? (
                                                <img src={qrCodes[b.id]} alt="QR Code" className="qr-image" />
                                            ) : (
                                                <p>Генерация QR-кода...</p>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="error-message fade-in">У вас пока нет купленных билетов</p>
                    )}
                </div>

                <div className={`section-title ${openSection === 'photos' ? 'open' : ''}`} onClick={() => toggleSection('photos')}>
                    Мои фотографии
                </div>
                <div className={`section-content ${openSection === 'photos' ? 'open' : ''}`} ref={sectionRefs.photos}>
                    {userPhotos.length > 0 ? (
                        <div className="user-photos fade-in">
                            {userPhotos.map((photo) => (
                                <div key={photo.id} className="photo-wrapper">
                                    <img
                                        src={`${API_BASE_URL}${photo.url}`}
                                        alt={photo.name || `User photo ${photo.id}`}
                                        className="photo"
                                        onClick={() => handlePhotoClick(photo)}
                                    />
                                    <button
                                        onClick={() => handleCancelPhoto(photo.id)}
                                        className="action-button cancel-button"
                                    >
                                        Отменить фото
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="error-message fade-in">У вас пока нет фотографий</p>
                    )}
                </div>

                {selectedBooking && !showPayment && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>
                                Выбор мест для {selectedBooking.cruise_name || "Неизвестный круиз"}
                            </h3>
                            {selectedBooking.seats ? (
                                <div className="seats-container">
                                    {['economy', 'standard', 'luxury'].map(category => (
                                        <div key={category} className="seat-category">
                                            <h4>{category === 'economy' ? 'Эконом' : category === 'standard' ? 'Стандарт' : 'Люкс'}</h4>
                                            <p>Требуется выбрать: {selectedBooking[`${category}_seats`] || 0}</p>
                                            <div className="seats-grid">
                                                {Array.from({ length: selectedBooking.seats[category].total }, (_, i) => {
                                                    const seatNumber = i + 1;
                                                    const isTaken = selectedBooking.seats[category].taken.includes(seatNumber);
                                                    const isSelected = selectedSeats[category].includes(seatNumber);
                                                    return (
                                                        <div
                                                            key={seatNumber}
                                                            className={`seat ${isSelected ? 'selected' : isTaken ? 'taken' : ''}`}
                                                            onClick={() => !isTaken && toggleSeat(category, seatNumber)}
                                                        >
                                                            {seatNumber}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <p>Доступно: {selectedBooking.seats[category].available}</p>
                                        </div>
                                    ))}
                                    {seatError && <p className="error-message">{seatError}</p>}
                                    <div className="button-group">
                                        <button
                                            onClick={confirmSeats}
                                            className="action-button confirm-button"
                                            disabled={!Object.values(selectedSeats).some(seats => seats.length > 0) || loading}
                                        >
                                            {loading ? 'Загрузка...' : 'Подтвердить выбор'}
                                        </button>
                                        <button
                                            onClick={() => setSelectedBooking(null)}
                                            className="action-button close-button"
                                            disabled={loading}
                                        >
                                            Закрыть
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p>Загрузка мест...</p>
                            )}
                        </div>
                    </div>
                )}

                {selectedBooking && showPayment && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>
                                Оплата для {selectedBooking.cruise_name || "Неизвестный круиз"}
                            </h3>
                            <Elements stripe={stripePromise}>
                                <PaymentForm
                                    booking={selectedBooking}
                                    onClose={() => {
                                        setSelectedBooking(null);
                                        setShowPayment(false);
                                        fetchData();
                                    }}
                                />
                            </Elements>
                        </div>
                    </div>
                )}

                {selectedPhoto && (
                    <div className="modal">
                        <div className="modal-content photo-modal">
                            <img
                                src={`${API_BASE_URL}${selectedPhoto.url}`}
                                alt={selectedPhoto.name || `User photo ${selectedPhoto.id}`}
                                className="enlarged-photo"
                            />
                            <button
                                onClick={closePhotoModal}
                                className="action-button close-button"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}
