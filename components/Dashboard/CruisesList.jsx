import styles from '../../pages/admin/adminComponents.module.css';

const CruisesList = ({ cruises, error, formatDate, onEdit, onDelete }) => {
    // Функция для обработки JSON-полей
    const renderJsonField = (field) => {
        if (!field) return '—';

        try {
            // Если поле уже является строкой, возвращаем его
            if (typeof field === 'string') return field;

            // Если поле — объект или массив, преобразуем в читаемый формат
            if (typeof field === 'object') {
                if (Array.isArray(field)) {
                    // Для массивов (например, images)
                    return field.length > 0 ? field.join(', ') : '—';
                } else {
                    // Для объектов (например, features, price_per_person)
                    if (field.name && field.price) {
                        // Специально для price_per_person
                        return `${field.name}: ${field.price}`;
                    }
                    // Для features — отображаем только значения
                    if (Object.keys(field).length > 0) {
                        return Object.values(field).join(', ') || '—';
                    }
                    return '—';
                }
            }
            return '—';
        } catch (e) {
            console.error('Ошибка при обработке JSON-поля:', e);
            return '—';
        }
    };

    // Функция для отображения расписания
    const renderSchedules = (schedules) => {
        if (!schedules || schedules.length === 0) return '—';

        return schedules.map(schedule => (
            <div key={schedule.id}>
                Отправление: {formatDate(schedule.departure_datetime)}<br />
                Прибытие: {formatDate(schedule.arrival_datetime)}<br />
                Статус: {schedule.status || '—'}
            </div>
        ));
    };

    return (
        <div className={styles.componentContainer}>
            {error ? (
                <p className={styles.errorMessage}>Ошибка при загрузке круизов</p>
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
                            <th>Расписание</th>
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
                                    <td>{renderJsonField(cruise.features)}</td>
                                    <td>{renderJsonField(cruise.images)}</td>
                                    <td>{renderJsonField(cruise.price_per_person)}</td>
                                    <td>{renderSchedules(cruise.schedules)}</td>
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
                                <td colSpan="13">Круизы отсутствуют</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CruisesList;