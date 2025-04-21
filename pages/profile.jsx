import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import QRCode from "qrcode";
import './profile.css';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Loading from '../components/Loading/Loading';

const stripePromise = loadStripe('pk_test_51R7tDn07BVvEjWueRJTSYfrtHZ7UqTy3A8RQ3KUTtNVSnT9czvcX2GZCbaOOeHEMB2E3QWndHxLwhvX6FJopxB2G00s7rcz8mh');

const PaymentForm = ({ booking, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
            });

            if (error) throw error;

            await axios.post(`http://localhost:8000/api/bookings/${booking.id}/mark-as-paid`, {});
            alert('Оплата успешно выполнена!');
            onClose();
        } catch (error) {
            console.error("Ошибка оплаты:", error);
            alert(`Ошибка оплаты: ${error.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
            <button type="submit" className="pay-now-button" disabled={!stripe}>
                Оплатить {booking.total_price || 0} руб.
            </button>
            <button type="button" onClick={onClose} className="close-button">
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

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const [profileRes, dataRes, bookingsRes] = await Promise.all([
                axios.get("http://localhost:8000/api/auth/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get("http://localhost:8000/api/all-data", {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get("http://localhost:8000/api/bookings", {
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

            QRCode.toDataURL(qrData, { width: 128 }, (err, url) => {
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

    const handlePaymentClick = useCallback(async (booking) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:8000/api/cruise-schedule/${booking.cruise_schedule_id}/seats`,
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
                `http://localhost:8000/api/bookings/${selectedBooking.id}/reserve-seats`,
                { seats: selectedSeats },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updatedBooking = data.booking;
            setShowPayment(true);

            // Обновление QR-кода
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

            // Обновление списка бронирований
            const { data: newBookings } = await axios.get(
                "http://localhost:8000/api/bookings",
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

    if (error) return <p className="error-message">{error}</p>;
    if (loading || !user || !bookings) return <Loading />;

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
                                <div>
                                    <h4>QR-код билета</h4>
                                    {qrCodes[b.id] ? (
                                        <>
                                            <img src={qrCodes[b.id]} alt="QR Code" style={{ width: 128, height: 128 }} />
                                            <p>Данные QR-кода:</p>
                                            <pre>
                                                {JSON.stringify(
                                                    {
                                                        booking_id: b.id,
                                                        user_id: b.user_id,
                                                        cruise_schedule_id: b.cruise_schedule_id,
                                                        economy_seats: b.economy_seats,
                                                        standard_seats: b.standard_seats,
                                                        luxury_seats: b.luxury_seats,
                                                    },
                                                    null,
                                                    2
                                                )}
                                            </pre>
                                        </>
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
                            Оплата для {selectedBooking.cruise_name || "Неизвестный круиз"}
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