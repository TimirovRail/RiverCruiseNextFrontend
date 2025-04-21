import { useState } from 'react'; // Добавляем useState для управления сортировкой
import styles from '../../pages/admin/adminComponents.module.css';

const BookingsList = ({ bookings, error, formatDate }) => {
    // Состояние для сортировки
    const [sort, setSort] = useState({ field: 'created_at', order: 'desc' });

    const safeFormatDate = (datetime) => {
        if (typeof formatDate === 'function') return formatDate(datetime);
        return datetime ? new Date(datetime).toLocaleDateString('ru-RU') : '—';
    };

    const truncateComment = (text, maxLength = 100) => {
        if (!text) return '—';
        if (text.length <= maxLength) return text;
        return `${text.substring(0, maxLength)}...`;
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'подтверждено': return styles.statusConfirmed;
            case 'отменено': return styles.statusCancelled;
            case 'в ожидании': return styles.statusPending;
            default: return '';
        }
    };

    // Функция сортировки бронирований
    const sortBookings = (bookings) => {
        return [...bookings].sort((a, b) => {
            let fieldA, fieldB;

            // Определяем поля для сортировки
            if (sort.field === 'created_at') {
                fieldA = new Date(a.created_at).getTime();
                fieldB = new Date(b.created_at).getTime();
            } else if (sort.field === 'status') {
                fieldA = a.status || '';
                fieldB = b.status || '';
            } else if (sort.field === 'cruise_name') {
                fieldA = a.cruise_name || '';
                fieldB = b.cruise_name || '';
            }

            if (sort.order === 'asc') {
                return fieldA > fieldB ? 1 : -1;
            } else {
                return fieldA < fieldB ? 1 : -1;
            }
        });
    };

    // Обработчик изменения сортировки
    const handleSortChange = (e) => {
        const [field, order] = e.target.value.split('-');
        setSort({ field, order });
    };

    // Отсортированные бронирования
    const sortedBookings = sortBookings(bookings);

    return (
        <div className={styles.componentContainer}>
            {error ? (
                <p className={styles.errorMessage}>Ошибка при загрузке бронирований</p>
            ) : (
                <div className={styles.contentWrapper}>
                    <div className={styles.sortWrapper}>
                        <label>Сортировать по: </label>
                        <select onChange={handleSortChange} value={`${sort.field}-${sort.order}`}>
                            <option value="created_at-desc">Дате создания (сначала новые)</option>
                            <option value="created_at-asc">Дате создания (сначала старые)</option>
                            <option value="status-asc">Статусу (А-Я)</option>
                            <option value="status-desc">Статусу (Я-А)</option>
                            <option value="cruise_name-asc">Круизу (А-Я)</option>
                            <option value="cruise_name-desc">Круизу (Я-А)</option>
                        </select>
                    </div>
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
                            {Array.isArray(sortedBookings) && sortedBookings.length > 0 ? (
                                sortedBookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>{booking.id || '—'}</td>
                                        <td>{booking.user_name || '—'}</td>
                                        <td>{booking.user_email || '—'}</td>
                                        <td>{booking.cruise_name || '—'}</td>
                                        <td>{booking.seats || 0}</td>
                                        <td title={booking.comment || ''}>{truncateComment(booking.comment)}</td>
                                        <td><span className={getStatusClass(booking.status)}>{booking.status || '—'}</span></td>
                                        <td>{safeFormatDate(booking.created_at)}</td>
                                        <td>{safeFormatDate(booking.updated_at)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="9">Бронирования отсутствуют</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BookingsList;