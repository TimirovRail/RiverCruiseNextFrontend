import { useState } from 'react'; // Добавляем useState для управления сортировкой
import styles from '../../pages/admin/adminComponents.module.css';

const ReviewsList = ({ reviews, error, formatDate, onCancel, onDelete }) => {
    // Состояние для сортировки
    const [sort, setSort] = useState({ field: 'created_at', order: 'desc' });

    const safeFormatDate = (datetime) => {
        if (typeof formatDate === 'function') return formatDate(datetime);
        return datetime ? new Date(datetime).toLocaleDateString('ru-RU') : '—';
    };

    // Функция сортировки отзывов
    const sortReviews = (reviews) => {
        return [...reviews].sort((a, b) => {
            let fieldA, fieldB;

            // Определяем поля для сортировки
            if (sort.field === 'rating') {
                fieldA = parseFloat(a.rating) || 0;
                fieldB = parseFloat(b.rating) || 0;
            } else if (sort.field === 'created_at') {
                fieldA = new Date(a.created_at).getTime();
                fieldB = new Date(b.created_at).getTime();
            } else if (sort.field === 'cruise.name') {
                fieldA = a.cruise ? a.cruise.name : '';
                fieldB = b.cruise ? b.cruise.name : '';
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

    // Отсортированные отзывы
    const sortedReviews = sortReviews(reviews);

    return (
        <div className={styles.componentContainer}>
            {error ? (
                <p className={styles.errorMessage}>Ошибка при загрузке отзывов</p>
            ) : (
                <div className={styles.contentWrapper}>
                    <div className={styles.sortWrapper}>
                        <label>Сортировать по: </label>
                        <select onChange={handleSortChange} value={`${sort.field}-${sort.order}`}>
                            <option value="created_at-desc">Дате создания (сначала новые)</option>
                            <option value="created_at-asc">Дате создания (сначала старые)</option>
                            <option value="rating-desc">Оценке (по убыванию)</option>
                            <option value="rating-asc">Оценке (по возрастанию)</option>
                            <option value="cruise.name-asc">Круизу (А-Я)</option>
                            <option value="cruise.name-desc">Круизу (Я-А)</option>
                        </select>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Пользователь</th>
                                <th>Email</th>
                                <th>Круиз</th>
                                <th>Комментарий</th>
                                <th>Оценка</th>
                                <th>Создан</th>
                                <th>Обновлён</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(sortedReviews) && sortedReviews.length > 0 ? (
                                sortedReviews.map((review) => (
                                    <tr key={review.id}>
                                        <td>{review.id || '—'}</td>
                                        <td>{review.user ? review.user.name : '—'}</td>
                                        <td>{review.user ? review.user.email : '—'}</td>
                                        <td>{review.cruise ? review.cruise.name : '—'}</td>
                                        <td>{review.comment || '—'}</td>
                                        <td>{review.rating || '—'}</td>
                                        <td>{safeFormatDate(review.created_at)}</td>
                                        <td>{safeFormatDate(review.updated_at)}</td>
                                        <td>
                                            <button onClick={() => onCancel(review.id)} className={styles.cancelButton}>Отменить</button>
                                            <button onClick={() => onDelete(review.id)} className={styles.deleteButton}>Удалить</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="9">Отзывы отсутствуют</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ReviewsList;