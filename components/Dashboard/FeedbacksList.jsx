import styles from '../../pages/admin/dashboard.css';

const FeedbacksList = ({ feedbacks, error, formatDate, onEdit, onDelete }) => {
    return (
        <>
            {error ? (
                <p>Ошибка при загрузке отзывов</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Пользователь ID</th>
                            <th>Круиз ID</th>
                            <th>Имя</th>
                            <th>Email</th>
                            <th>Отзыв</th>
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
                                    <td>{feedback.user_id || '—'}</td>
                                    <td>{feedback.cruise_id || '—'}</td>
                                    <td>{feedback.name || '—'}</td>
                                    <td>{feedback.email || '—'}</td>
                                    <td>{feedback.feedback || '—'}</td>
                                    <td>{formatDate(feedback.created_at)}</td>
                                    <td>{formatDate(feedback.updated_at)}</td>
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
        </>
    );
};

export default FeedbacksList;