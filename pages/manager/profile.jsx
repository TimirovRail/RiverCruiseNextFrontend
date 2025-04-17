import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { QrReader } from 'react-qr-reader';
import styles from './ManagerProfile.module.css';

const ManagerProfile = () => {
    const router = useRouter();
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [ticketStatus, setTicketStatus] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const role = (user?.role || localStorage.getItem('role') || '').trim().toLowerCase();

        if (!token || role !== 'manager') {
            router.push('/login');
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const handleScan = async (data) => {
        console.log('handleScan вызван, данные:', data);
        if (data) {
            setScanResult(data);
            setIsScanning(false);

            try {
                const ticketData = JSON.parse(data);
                console.log('Распарсенные данные билета:', ticketData);
                const token = localStorage.getItem('token');

                const response = await fetch('http://localhost:8000/api/manager/verify-ticket', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(ticketData),
                });

                const result = await response.json();
                console.log('Ответ от сервера:', result);

                if (response.ok) {
                    setTicketStatus(result);
                } else {
                    setError(result.message || 'Ошибка при проверке билета');
                }
            } catch (err) {
                console.error('Ошибка при обработке QR-кода или отправке запроса:', err);
                setError('Ошибка при обработке QR-кода или отправке запроса');
            }
        }
    };

    const handleError = (err) => {
        console.error('Ошибка QrReader:', err);
        setError('Ошибка доступа к камере: ' + err.message);
    };

    const startScanning = () => {
        console.log('Начинаем сканирование');
        setIsScanning(true);
        setScanResult(null);
        setTicketStatus(null);
        setError(null);
    };

    const stopScanning = () => {
        console.log('Останавливаем сканирование');
        setIsScanning(false);
    };

    return (
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
                            style={{ width: '100%' }}
                            facingMode="environment"
                        />
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
                                <p>Дата отправления: {new Date(ticketStatus.ticket.departure_datetime).toLocaleDateString()}</p>
                                <p>Места: Эконом: {ticketStatus.ticket.economy_seats}, Стандарт: {ticketStatus.ticket.standard_seats}, Люкс: {ticketStatus.ticket.luxury_seats}</p>
                            </div>
                        ) : (
                            <p className={styles.invalid}>Билет недействителен: {ticketStatus.message}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerProfile;