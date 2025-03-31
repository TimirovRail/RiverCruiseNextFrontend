import styles from '../../pages/admin/dashboard.css';

const BookingsList = ({ bookings, error, formatDate }) => {
    return (
        <>
            {error ? (
                <p>Ошибка при загрузке бронирований</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Пользователь ID</th>
                            <th>Круиз ID</th>
                            <th>Имя</th>
                            <th>Email</th>
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
                                    <td>{booking.user_id || '—'}</td>
                                    <td>{booking.cruise_id || '—'}</td>
                                    <td>{booking.name || '—'}</td>
                                    <td>{booking.email || '—'}</td>
                                    <td>{booking.seats || 0}</td>
                                    <td>{booking.comment || '—'}</td>
                                    <td>{booking.status || '—'}</td>
                                    <td>{formatDate(booking.created_at)}</td>
                                    <td>{formatDate(booking.updated_at)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10">Бронирования отсутствуют</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </>
    );
};

export default BookingsList;