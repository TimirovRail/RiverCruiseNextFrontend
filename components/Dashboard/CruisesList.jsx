import styles from '../../pages/admin/dashboard.css';

const CruisesList = ({ cruises, error, formatDate, onEdit, onDelete }) => {
    return (
        <>
            {error ? (
                <p>Ошибка при загрузке круизов</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Описание</th>
                            <th>Река</th>
                            <th>Каюты</th>
                            <th>Длительность</th>
                            <th>Особенности</th>
                            <th>Изображения</th>
                            <th>Цена</th>
                            <th>Создан</th>
                            <th>Обновлён</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(cruises) && cruises.length > 0 ? (
                            cruises.map((cruise) => (
                                <tr key={cruise.id}>
                                    <td>{cruise.id || '—'}</td>
                                    <td>{cruise.name || '—'}</td>
                                    <td>{cruise.description || '—'}</td>
                                    <td>{cruise.river || '—'}</td>
                                    <td>{cruise.cabins || 0}</td>
                                    <td>{cruise.total_duration || '—'}</td>
                                    <td>{cruise.features || '—'}</td>
                                    <td>{cruise.images || '—'}</td>
                                    <td>{cruise.price_per_person || 0}</td>
                                    <td>{formatDate(cruise.created_at)}</td>
                                    <td>{formatDate(cruise.updated_at)}</td>
                                    <td>
                                        <button onClick={() => onEdit(cruise)} className={styles.editButton}>
                                            Редактировать
                                        </button>
                                        <button onClick={() => onDelete(cruise.id)} className={styles.deleteButton}>
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="12">Круизы отсутствуют</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </>
    );
};

export default CruisesList;