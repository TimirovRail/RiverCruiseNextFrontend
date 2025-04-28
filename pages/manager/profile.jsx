import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import QrReader from 'react-qr-reader';
import styles from './ManagerProfile.module.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

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

    const handleScan = async (data) => {
        if (data) {
            setIsScanning(false);
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
                const token = localStorage.getItem('token') || ''; // Используем пустой токен, если токена нет
                const response = await fetch('http://localhost:8000/api/manager/verify-ticket', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Отправляем токен, если он есть
                    },
                    body: JSON.stringify({
                        booking_id: Number(ticketData.booking_id),
                        user_id: Number(ticketData.user_id),
                        cruise_schedule_id: Number(ticketData.cruise_schedule_id),
                    }),
                });

                const result = await response.json();

                if (response.ok) {
                    setTicketStatus(result);
                    setScanResult(JSON.stringify(result, null, 2));
                } else if (response.status === 401 || response.status === 403) {
                    // Игнорируем ошибки аутентификации, показываем результат, если он есть
                    console.warn('Ошибка аутентификации, но продолжаем обработку:', result.message);
                    if (result.valid !== undefined) {
                        setTicketStatus(result);
                        setScanResult(JSON.stringify(result, null, 2));
                    } else {
                        setError('Не удалось верифицировать билет. Попробуйте снова.');
                    }
                } else {
                    setError(result.message || 'Ошибка верификации билета');
                }
            } catch (err) {
                console.error('Ошибка обработки:', err);
                setError('Ошибка обработки данных. Попробуйте снова.');
            }
        }
    };

    const handleError = (err) => {
        console.error('Ошибка сканирования:', err);
        if (err.name === 'NotAllowedError') {
            setError('Доступ к камере запрещен. Разрешите доступ в настройках браузера.');
        } else if (err.name === 'NotFoundError') {
            setError('Камера не найдена на устройстве.');
        } else {
            setError(err.message || 'Ошибка сканирования QR-кода');
        }
        setIsScanning(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const startScanning = () => {
        console.log('Начало нового сканирования');
        setIsScanning(true);
        setScanResult(null);
        setTicketStatus(null);
        setError(null);
    };

    const stopScanning = () => {
        console.log('Остановка сканирования');
        setIsScanning(false);
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
                        <button className={styles.scanButton} onClick={startScanning} disabled={isScanning}>
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
                            <QrReader
                                delay={300}
                                onError={handleError}
                                onScan={handleScan}
                                style={{ width: '100%', maxWidth: '400px' }}
                            />
                        </div>
                    )}

                    {error && <p className={styles.error}>{error}</p>}

                    {ticketStatus && (
                        <div className={styles.ticketStatus}>
                            <h3>Статус билета</h3>
                            {ticketStatus.valid ? (
                                <div className={styles.valid}>
                                    <p><strong>Статус:</strong> {ticketStatus.message}</p>
                                    <h4>Информация о пользователе</h4>
                                    <p><strong>Имя:</strong> {ticketStatus.user.name}</p>
                                    <p><strong>Email:</strong> {ticketStatus.user.email}</p>
                                    <h4>Информация о билете</h4>
                                    <p><strong>Круиз:</strong> {ticketStatus.ticket.cruise_name}</p>
                                    <p><strong>Дата отправления:</strong> {new Date(ticketStatus.ticket.departure_datetime).toLocaleString()}</p>
                                    <p><strong>Места:</strong> Эконом: {ticketStatus.ticket.economy_seats}, Стандарт: {ticketStatus.ticket.standard_seats}, Люкс: {ticketStatus.ticket.luxury_seats}</p>
                                    <p><strong>Стоимость:</strong> {ticketStatus.ticket.total_price} руб.</p>
                                    {ticketStatus.ticket.comment && <p><strong>Комментарий:</strong> {ticketStatus.ticket.comment}</p>}
                                    {ticketStatus.ticket.extras && ticketStatus.ticket.extras.length > 0 && (
                                        <p><strong>Доп. услуги:</strong> {ticketStatus.ticket.extras.join(', ')}</p>
                                    )}
                                </div>
                            ) : (
                                <p className={styles.invalid}>Билет недействителен: {ticketStatus.message}</p>
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