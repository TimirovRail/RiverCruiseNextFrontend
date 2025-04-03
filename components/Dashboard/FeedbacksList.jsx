import styles from '../../pages/admin/adminComponents.module.css';

const FeedbacksList = ({ feedbacks, error, formatDate, onEdit, onDelete }) => {
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
                        {Array.isArray(feedbacks) && feedbacks.length > 0 ? (
                            feedbacks.map((feedback) => (
                                <tr key={feedback.id}>
                                    <td>{feedback.id || '—'}</td>
                                    <td>{feedback.user_name || '—'}</td>
                                    <td>{feedback.user_email || '—'}</td>
                                    <td>{feedback.cruise_name || '—'}</td>
                                    <td>{feedback.comment || '—'}</td>
                                    <td>{feedback.rating || '—'}</td>
                                    <td>{safeFormatDate(feedback.created_at)}</td>
                                    <td>{safeFormatDate(feedback.updated_at)}</td>
                                    <td>
                                        <button onClick={() => onEdit(feedback)} className={styles.editButton}>
                                            Редактировать
                                        </button>
                                        <button onClick={() => onDelete(feedback.id)} className={styles.deleteButton}>
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

export default FeedbacksList;