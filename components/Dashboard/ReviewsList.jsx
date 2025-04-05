import styles from '../../pages/admin/adminComponents.module.css';

const ReviewsList = ({ reviews, error, formatDate, onEdit, onDelete }) => {
    const safeFormatDate = (datetime) => {
        if (typeof formatDate === 'function') {
            return formatDate(datetime);
        }
        return datetime ? new Date(datetime).toLocaleDateString('ru-RU') : '—';
    };

    return (
        <div className={styles.componentContainer}>
            {error ? (
                <p className={styles.errorMessage}>Ошибка при загрузке отзывов</p>
            ) : (
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
                        {Array.isArray(reviews) && reviews.length > 0 ? (
                            reviews.map((review) => (
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
                                        <button onClick={() => onEdit(review)} className={styles.editButton}>
                                            Редактировать
                                        </button>
                                        <button onClick={() => onDelete(review.id)} className={styles.deleteButton}>
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9">Отзывы отсутствуют</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ReviewsList;