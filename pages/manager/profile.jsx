import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { Html5Qrcode } from 'html5-qrcode';
import styles from './ManagerProfile.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { API_BASE_URL } from '../../src/config';

class ErrorBoundary extends React.Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return {
            error: error?.message?.toString() || 'Неизвестная ошибка'
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught error:', error, errorInfo);
    }

    render() {
        if (this.state.error) {
            return (
                <div className={styles.error}>
                    <h3>Произошла ошибка:</h3>
                    <pre>{this.state.error}</pre>
                    <button onClick={() => this.setState({ error: null })}>
                        Попробовать снова
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const ManagerProfile = () => {
    const router = useRouter();
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [ticketStatus, setTicketStatus] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const html5QrCodeRef = useRef(null);

    const startScanning = async () => {
        console.log('Начало нового сканирования');
        setIsScanning(true);
        setScanResult(null);
        setTicketStatus(null);
        setError(null);

        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices.length === 0) {
                setError('Камера не найдена на устройстве.');
                setIsScanning(false);
                return;
            }

            html5QrCodeRef.current = new Html5Qrcode('qr-reader');
            await html5QrCodeRef.current.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                    handleScan(decodedText);
                },
                (err) => {
                    console.warn('Ошибка сканирования:', err);
                }
            );
        } catch (err) {
            handleError(err);
        }
    };

    const stopScanning = () => {
        console.log('Остановка сканирования');
        if (html5QrCodeRef.current) {
            html5QrCodeRef.current
                .stop()
                .then(() => {
                    html5QrCodeRef.current = null;
                    setIsScanning(false);
                })
                .catch(err => {
                    console.error('Ошибка при остановке сканирования:', err);
                    setError('Не удалось остановить сканирование');
                    setIsScanning(false);
                });
        }
    };

    const handleScan = async (data) => {
        if (data) {
            stopScanning();
            let ticketData;

            try {
                ticketData = JSON.parse(data);
                console.log('Parsed QR Data:', ticketData);
            } catch (err) {
                setError('Невалидный формат QR-кода: неверный JSON');
                console.error('JSON Parse Error:', err);
                return;
            }

            const requiredFields = ['booking_id', 'user_id', 'cruise_schedule_id'];
            if (!requiredFields.every(field => ticketData[field] != null)) {
                setError('В QR-коде отсутствуют обязательные данные');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/manager/verify-ticket`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        booking_id: Number(ticketData.booking_id),
                        user_id: Number(ticketData.user_id),
                        cruise_schedule_id: Number(ticketData.cruise_schedule_id),
                        economy_seats: ticketData.economy_seats || 0,
                        standard_seats: ticketData.standard_seats || 0,
                        luxury_seats: ticketData.luxury_seats || 0,
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    setError(result.message || `Ошибка HTTP: ${response.status}`);
                    setTicketStatus(null);
                    setScanResult(null);
                    return;
                }

                setError(null);
                setTicketStatus(result);
                setScanResult(JSON.stringify(result, null, 2));
            } catch (err) {
                console.error('Ошибка обработки:', err);
                setError(err.message || 'Ошибка обработки данных. Попробуйте снова.');
                setTicketStatus(null);
                setScanResult(null);
            }
        }
    };

    const handleMarkAsAttended = async () => {
        if (!ticketStatus || !ticketStatus.valid) return;

        const ticketData = JSON.parse(scanResult);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/manager/mark-as-attended`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    booking_id: Number(ticketData.ticket.booking_id),
                    user_id: Number(ticketData.ticket.user_id),
                    cruise_schedule_id: Number(ticketData.ticket.cruise_schedule_id),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.message || `Ошибка HTTP: ${response.status}`);
                return;
            }

            setError(null);
            setTicketStatus({
                ...ticketStatus,
                ticket: {
                    ...ticketStatus.ticket,
                    attended: true,
                },
            });
            setScanResult(JSON.stringify({ ...ticketStatus, ticket: { ...ticketStatus.ticket, attended: true } }, null, 2));
            alert('Участие в круизе успешно отмечено!');
        } catch (err) {
            console.error('Ошибка при отметке участия:', err);
            setError(err.message || 'Ошибка при отметке участия. Попробуйте снова.');
        }
    };

    const handleError = (err) => {
        console.error('Ошибка сканирования:', err);
        if (err.name === 'NotAllowedError') {
            setError('Доступ к камере запрещен. Разрешите доступ в настройках браузера.');
        } else if (err.name === 'NotFoundError') {
            setError('Камера не найдена на устройстве.');
        } else if (err.name === 'NotSupportedError') {
            setError('Браузер не поддерживает доступ к камере.');
        } else {
            setError(err.message || 'Ошибка сканирования QR-кода');
        }
        setIsScanning(false);
        stopScanning();
    };

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    return (
        <ErrorBoundary>
            <Header onBack={() => router.push('/')} />
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Профиль менеджера</h1>
                    <button className={styles.logoutButton} onClick={handleLogout}>
                        Выйти
                    </button>
                </div>

                <div className={styles.scanSection}>
                    <h2>Сканирование билетов</h2>
                    <p className={styles.welcomeMessage}>Используйте камеру для проверки билетов</p>

                    <div className={styles.buttonGroup}>
                        <button
                            className={styles.scanButton}
                            onClick={startScanning}
                            disabled={isScanning}
                        >
                            {isScanning ? 'Сканирование...' : 'Начать сканирование'}
                        </button>
                        {isScanning && (
                            <button className={styles.stopButton} onClick={stopScanning}>
                                Остановить
                            </button>
                        )}
                    </div>

                    {isScanning && (
                        <div className={styles.qrReader}>
                            <div id="qr-reader" style={{ width: '100%', maxWidth: '400px' }} />
                        </div>
                    )}

                    {error && <p className={styles.error}>{error}</p>}

                    {ticketStatus && (
                        <div className={styles.ticketStatus}>
                            <h3>Статус билета</h3>
                            {ticketStatus.valid ? (
                                <div className={styles.valid}>
                                    <p><strong>Статус:</strong> {ticketStatus.message}</p>
                                    <p>
                                        <strong>Участие:</strong>{' '}
                                        {ticketStatus.ticket.attended ? 'Посетил круиз' : 'Не посетил круиз'}
                                    </p>
                                    <h4>Информация о пользователе</h4>
                                    <p><strong>Имя:</strong> {ticketStatus.user.name}</p>
                                    <p><strong>Email:</strong> {ticketStatus.user.email}</p>
                                    <h4>Информация о билете</h4>
                                    <p><strong>Круиз:</strong> {ticketStatus.ticket.cruise_name}</p>
                                    <p>
                                        <strong>Дата отправления:</strong>{' '}
                                        {new Date(ticketStatus.ticket.departure_datetime).toLocaleString()}
                                    </p>
                                    <p>
                                        <strong>Места:</strong> Эконом: {ticketStatus.ticket.economy_seats},{' '}
                                        Стандарт: {ticketStatus.ticket.standard_seats},{' '}
                                        Люкс: {ticketStatus.ticket.luxury_seats}
                                    </p>
                                    <p>
                                        <strong>Стоимость:</strong> {ticketStatus.ticket.total_price} руб.
                                    </p>
                                    {ticketStatus.ticket.comment && (
                                        <p><strong>Комментарий:</strong> {ticketStatus.ticket.comment}</p>
                                    )}
                                    {ticketStatus.ticket.extras &&
                                        ticketStatus.ticket.extras.length > 0 && (
                                            <p>
                                                <strong>Доп. услуги:</strong>{' '}
                                                {ticketStatus.ticket.extras.join(', ')}
                                            </p>
                                        )}
                                    {!ticketStatus.ticket.attended && (
                                        <button
                                            className={styles.attendButton}
                                            onClick={handleMarkAsAttended}
                                        >
                                            Отметить участие
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p className={styles.invalid}>
                                    Билет недействителен: {ticketStatus.message}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </ErrorBoundary>
    );
};

export default ManagerProfile;