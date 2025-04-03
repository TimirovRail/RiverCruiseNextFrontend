import styles from '../../pages/admin/adminComponents.module.css';

const BookingsList = ({ bookings, error, formatDate }) => {
    const safeFormatDate = (datetime) => {
        if (typeof formatDate === 'function') {
            return formatDate(datetime);
        }
        return datetime ? new Date(datetime).toLocaleDateString('ru-RU') : '—';
    };

    const truncateComment = (text, maxLength = 100) => {
        if (!text) return '—';
        if (text.length <= maxLength) return text;
        return `${text.substring(0, maxLength)}...`;
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'подтверждено':
                return styles.statusConfirmed;
            case 'отменено':
                return styles.statusCancelled;
            case 'в ожидании':
                return styles.statusPending;
            default:
                return '';
        }
    };

    return (
        <div className={styles.componentContainer}>
            {error ? (
                <p className={styles.errorMessage}>Ошибка при загрузке бронирований</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Пользователь</th>
                            <th>Email</th>
                            <th>Круиз</th>
                            <th>Места</th>
                            <th>Комментарий</th>
                            <th>Статус</th>
                            <th>Создан</th>
                            <th>Обновлён</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(bookings) && bookings.length > 0 ? (
                            bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>{booking.id || '—'}</td>
                                    <td>{booking.user_name || '—'}</td>
                                    <td>{booking.user_email || '—'}</td>
                                    <td>{booking.cruise_name || '—'}</td>
                                    <td>{booking.seats || 0}</td>
                                    <td title={booking.comment || ''}>
                                        {truncateComment(booking.comment, 100)}
                                    </td>
                                    <td>
                                        <span className={getStatusClass(booking.status)}>
                                            {booking.status || '—'}
                                        </span>
                                    </td>
                                    <td>{safeFormatDate(booking.created_at)}</td>
                                    <td>{safeFormatDate(booking.updated_at)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9">Бронирования отсутствуют</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default BookingsList;