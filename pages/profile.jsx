import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import QRCode from "qrcode";
import './profile.css';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Loading from '../components/Loading/Loading';

const stripePromise = loadStripe('pk_test_51J...');

const PaymentForm = ({ booking, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: elements.getElement(CardElement),
        });

        if (error) {
            console.error("Ошибка оплаты:", error);
        } else {
            await axios.post(`http://localhost:8000/api/bookings/${booking.id}/mark-as-paid`, {});
            alert('Оплата успешно выполнена (тестовый режим)');
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
            <button type="submit" className="pay-now-button" disabled={!stripe}>
                Оплатить {booking.total_price} руб.
            </button>
            <button onClick={onClose} className="close-button">
                Закрыть
            </button>
        </form>
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

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log("Token from localStorage:", token);

        if (!token) {
            setError("Токен отсутствует. Пожалуйста, войдите в систему.");
            router.push("/login");
            return;
        }

        const config = {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
        };

        setLoading(true);

        Promise.all([
            axios.get("http://localhost:8000/api/auth/profile", config)
                .then(response => {
                    setUser(response.data.user);
                    console.log("Profile data:", response.data);
                })
                .catch(error => {
                    console.error("Ошибка загрузки профиля:", error.response?.data || error.message);
                    setError("Ошибка загрузки профиля. Возможно, токен недействителен.");
                }),

            axios.get("http://localhost:8000/api/all-data", config)
                .then(response => {
                    setData(response.data);
                    console.log("Data from /api/all-data:", response.data);
                })
                .catch(error => {
                    console.error("Ошибка загрузки данных:", error.response?.data || error.message);
                    setError("Ошибка загрузки данных");
                }),

            axios.get("http://localhost:8000/api/bookings", config)
                .then(response => {
                    setBookings(response.data);
                    console.log("Bookings response:", response.data);
                })
                .catch(error => {
                    console.error("Ошибка загрузки бронирований:", error.response?.data || error.message);
                    setError("Ошибка загрузки бронирований");
                })
        ])
            .finally(() => setLoading(false));
    }, [router]);

    // Генерация QR-кодов после получения bookings и user
    useEffect(() => {
        if (bookings && user) {
            const purchasedTickets = bookings.filter(b => b.user_id === user.id && b.is_paid) || [];
            console.log("Purchased tickets after filter:", purchasedTickets);

            purchasedTickets.forEach(b => {
                const qrData = JSON.stringify({
                    booking_id: b.id,
                    user_id: b.user_id,
                    cruise_schedule_id: b.cruise_schedule_id,
                    economy_seats: b.economy_seats,
                    standard_seats: b.standard_seats,
                    luxury_seats: b.luxury_seats,
                });
                console.log("Generating QR for booking:", b.id, "with data:", qrData);
                QRCode.toDataURL(qrData, { width: 128 }, (err, url) => {
                    if (err) {
                        console.error("QRCode generation error for booking", b.id, ":", err);
                    } else {
                        console.log("QRCode generated for booking", b.id, ":", url);
                        setQrCodes(prev => ({ ...prev, [b.id]: url }));
                    }
                });
            });
        }
    }, [bookings, user]);

    useEffect(() => {
        if (user) {
            const token = localStorage.getItem("token");
            axios.get(`http://localhost:8000/api/user/photos/${user.id}`, {
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

    const handlePaymentClick = (booking) => {
        console.log("Selected booking:", booking);
        setSelectedBooking(booking);
        setSelectedSeats({ economy: [], standard: [], luxury: [] });
        setSeatError(null);
        const token = localStorage.getItem("token");
        axios.get(`http://localhost:8000/api/cruise-schedule/${booking.cruise_schedule_id}/seats`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setSelectedBooking({ ...booking, seats: response.data });
                console.log("Seats data:", response.data);
            })
            .catch(error => console.error("Ошибка загрузки мест:", error.response?.data || error.message));
    };

    const toggleSeat = (category, seatNumber) => {
        setSelectedSeats(prev => {
            const seats = prev[category];
            const available = selectedBooking.seats[category].available;
            if (seats.includes(seatNumber)) {
                return { ...prev, [category]: seats.filter(s => s !== seatNumber) };
            } else if (seats.length < available && !selectedBooking.seats[category].taken.includes(seatNumber)) {
                return { ...prev, [category]: [...seats, seatNumber] };
            }
            return prev;
        });
    };

    const confirmSeats = () => {
        const selectedEconomy = selectedSeats.economy.length;
        const selectedStandard = selectedSeats.standard.length;
        const selectedLuxury = selectedSeats.luxury.length;

        const bookedEconomy = selectedBooking.economy_seats || 0;
        const bookedStandard = selectedBooking.standard_seats || 0;
        const bookedLuxury = selectedBooking.luxury_seats || 0;

        console.log("Выбрано:", { economy: selectedEconomy, standard: selectedStandard, luxury: selectedLuxury });
        console.log("Забронировано:", { economy: bookedEconomy, standard: bookedStandard, luxury: bookedLuxury });

        if (
            selectedEconomy !== bookedEconomy ||
            selectedStandard !== bookedStandard ||
            selectedLuxury !== bookedLuxury
        ) {
            setSeatError(
                `Количество выбранных мест не совпадает с забронированными. ` +
                `Ожидается: Эконом: ${bookedEconomy}, Стандарт: ${bookedStandard}, Люкс: ${bookedLuxury}. ` +
                `Выбрано: Эконом: ${selectedEconomy}, Стандарт: ${selectedStandard}, Люкс: ${selectedLuxury}.`
            );
            return;
        }

        const token = localStorage.getItem("token");
        setLoading(true);
        axios.post(`http://localhost:8000/api/bookings/${selectedBooking.id}/reserve-seats`, {
            seats: selectedSeats
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setSelectedBooking(response.data.booking);
                setShowPayment(true);
                axios.get("http://localhost:8000/api/bookings", {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(response => {
                    setBookings(response.data);
                    console.log("Updated bookings:", response.data);
                    const qrData = JSON.stringify({
                        booking_id: response.data.id,
                        user_id: response.data.user_id,
                        cruise_schedule_id: response.data.cruise_schedule_id,
                        economy_seats: response.data.economy_seats,
                        standard_seats: response.data.standard_seats,
                        luxury_seats: response.data.luxury_seats,
                    });
                    QRCode.toDataURL(qrData, { width: 128 }, (err, url) => {
                        if (err) console.error("QRCode generation error:", err);
                        setQrCodes(prev => ({ ...prev, [response.data.id]: url }));
                    });
                });
            })
            .catch(error => console.error("Ошибка сохранения мест:", error.response?.data || error.message))
            .finally(() => setLoading(false));
    };

    if (error) return <p className="error-message">{error}</p>;
    if (loading) return <Loading />;

    const userReviews = data?.reviews?.filter(fb => fb.user_id === user.id) || [];
    const userBookings = bookings?.filter(b => b.user_id === user.id && !b.is_paid) || [];
    const purchasedTickets = bookings?.filter(b => b.user_id === user.id && b.is_paid) || [];

    console.log("Current qrCodes state:", qrCodes);

    return (
        <div className="container">
            <header>
                <h1>{user.name}</h1>
                <h2>{user.email}</h2>
                <button onClick={() => router.push("/")} className="back-button">
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
                                <p>
                                    <strong>
                                        {b.cruise_schedule && b.cruise_schedule.cruise && b.cruise_schedule.cruise.name
                                            ? b.cruise_schedule.cruise.name
                                            : "Название круиза не указано"}
                                    </strong>
                                </p>
                                <p>
                                    <small>
                                        Дата: {b.cruise_schedule?.departure_datetime
                                            ? new Date(b.cruise_schedule.departure_datetime).toLocaleDateString()
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
                                <button onClick={() => handlePaymentClick(b)} className="pay-button">
                                    Перейти к оплате
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="error-message">У вас пока нет бронирований</p>
                )}
            </div>

            <div className="section-content">
                <h3 className="section-title">Купленные билеты</h3>
                {purchasedTickets.length > 0 ? (
                    <ul>
                        {purchasedTickets.map((b) => (
                            <li key={b.id}>
                                <p>
                                    <strong>
                                        {b.cruise_schedule && b.cruise_schedule.cruise && b.cruise_schedule.cruise.name
                                            ? b.cruise_schedule.cruise.name
                                            : "Название круиза не указано"}
                                    </strong>
                                </p>
                                <p>
                                    <small>
                                        Дата: {b.cruise_schedule?.departure_datetime
                                            ? new Date(b.cruise_schedule.departure_datetime).toLocaleDateString()
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
                                <div>
                                    <h4>QR-код билета</h4>
                                    {qrCodes[b.id] ? (
                                        <img src={qrCodes[b.id]} alt="QR Code" style={{ width: 128, height: 128 }} />
                                    ) : (
                                        <p>Generating QR code...</p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="error-message">У вас пока нет купленных билетов</p>
                )}
            </div>

            {selectedBooking && !showPayment && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>
                            Выбор мест для {selectedBooking.cruise_schedule && selectedBooking.cruise_schedule.cruise && selectedBooking.cruise_schedule.cruise.name
                                ? selectedBooking.cruise_schedule.cruise.name
                                : "Неизвестный круиз"}
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
                                <button
                                    onClick={confirmSeats}
                                    className="confirm-button"
                                    disabled={!Object.values(selectedSeats).some(seats => seats.length > 0) || loading}
                                >
                                    {loading ? 'Загрузка...' : 'Подтвердить выбор'}
                                </button>
                                <button onClick={() => setSelectedBooking(null)} className="close-button" disabled={loading}>
                                    Закрыть
                                </button>
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
                            Оплата для {selectedBooking.cruise_schedule && selectedBooking.cruise_schedule.cruise && selectedBooking.cruise_schedule.cruise.name
                                ? selectedBooking.cruise_schedule.cruise.name
                                : "Неизвестный круиз"}
                        </h3>
                        <Elements stripe={stripePromise}>
                            <PaymentForm booking={selectedBooking} onClose={() => {
                                setSelectedBooking(null);
                                setShowPayment(false);
                                const token = localStorage.getItem("token");
                                axios.get("http://localhost:8000/api/bookings", {
                                    headers: { Authorization: `Bearer ${token}` }
                                }).then(response => setBookings(response.data));
                            }} />
                        </Elements>
                    </div>
                </div>
            )}

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