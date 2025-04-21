import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { BrowserQRCodeReader } from '@zxing/library';
import styles from './ManagerProfile.module.css';

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
    const videoRef = useRef(null);
    const codeReader = useRef(null);
    const streamRef = useRef(null);
    const isMounted = useRef(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const role = (user?.role || localStorage.getItem('role') || '').trim().toLowerCase();

        if (!token || role !== 'manager') {
            router.push('/login');
        }
    }, [router]);

    const stopScanner = useCallback(async () => {
        try {
            if (codeReader.current) {
                await codeReader.current.reset();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                    track.enabled = false;
                });
                streamRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        } catch (err) {
            console.error('Ошибка остановки сканера:', err);
        }
    }, []);

    useEffect(() => {
        codeReader.current = new BrowserQRCodeReader();

        const startScanning = async () => {
            if (!isScanning || !isMounted.current) return;

            try {
                await stopScanner();
                const devices = await codeReader.current.getVideoInputDevices();

                if (devices.length === 0) {
                    throw new Error('Камеры не обнаружены');
                }

                streamRef.current = await codeReader.current.decodeFromVideoDevice(
                    devices[0].deviceId,
                    videoRef.current,
                    async (result, err) => {
                        if (!isMounted.current) return;

                        try {
                            if (result?.text) {
                                setIsScanning(false);
                                let ticketData;

                                try {
                                    ticketData = JSON.parse(result.text);
                                } catch (err) {
                                    setError('Невалидный формат QR-кода');
                                    return;
                                }

                                // Валидация данных
                                const requiredFields = [
                                    'booking_id',
                                    'user_id',
                                    'cruise_schedule_id'
                                ];

                                if (!requiredFields.every(field => ticketData[field])) {
                                    setError('В QR-коде отсутствуют обязательные данные');
                                    return;
                                }

                                const token = localStorage.getItem('token');
                                const response = await fetch('http://localhost:8000/api/manager/verify-ticket', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                        booking_id: Number(ticketData.booking_id),
                                        user_id: Number(ticketData.user_id),
                                        cruise_schedule_id: Number(ticketData.cruise_schedule_id),
                                    }),
                                });

                                const responseText = await response.text();
                                const result = responseText ? JSON.parse(responseText) : {};

                                if (isMounted.current) {
                                    if (response.ok) {
                                        setTicketStatus(result);
                                        setScanResult(result.text);
                                    } else {
                                        setError(result.message || 'Ошибка верификации билета');
                                    }
                                }
                            }

                            if (err && !['NotFoundException', 'ChecksumException'].includes(err.name)) {
                                console.error('Ошибка сканирования:', err);
                                setError(err.message || 'Ошибка сканирования');
                            }
                        } catch (err) {
                            console.error('Ошибка обработки:', err);
                            setError(err.message || 'Ошибка обработки данных');
                        }
                    }
                );
            } catch (err) {
                console.error('Ошибка инициализации:', err);
                setError(err.message);
                setIsScanning(false);
            }
        };

        if (isScanning) startScanning();

        return () => {
            stopScanner();
        };
    }, [isScanning, stopScanner]);

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
        stopScanner(); // Сбрасываем перед новым сканированием
    };

    const stopScanning = () => {
        console.log('Остановка сканирования');
        setIsScanning(false);
        stopScanner();
    };

    return (
        <ErrorBoundary>
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
                            <video ref={videoRef} style={{ width: '100%', objectFit: 'cover' }} />
                        </div>
                    )}

                    {error && <p className={styles.error}>{error}</p>}

                    {scanResult && (
                        <div className={styles.result}>
                            <h3>Данные билета</h3>
                            <pre>{scanResult}</pre>
                        </div>
                    )}

                    {ticketStatus && (
                        <div className={styles.ticketStatus}>
                            <h3>Статус билета</h3>
                            {ticketStatus.valid ? (
                                <div className={styles.valid}>
                                    <p>Билет действителен: {ticketStatus.message}</p>
                                    <p>Круиз: {ticketStatus.ticket.cruise_name}</p>
                                    <p>
                                        Дата отправления:{' '}
                                        {new Date(ticketStatus.ticket.departure_datetime).toLocaleDateString()}
                                    </p>
                                    <p>
                                        Места: Эконом: {ticketStatus.ticket.economy_seats}, Стандарт:{' '}
                                        {ticketStatus.ticket.standard_seats}, Люкс:{' '}
                                        {ticketStatus.ticket.luxury_seats}
                                    </p>
                                </div>
                            ) : (
                                <p className={styles.invalid}>Билет недействителен: {ticketStatus.message}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default ManagerProfile;