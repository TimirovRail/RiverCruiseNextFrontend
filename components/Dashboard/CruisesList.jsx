import styles from '../../pages/admin/adminComponents.module.css';

const CruisesList = ({ cruises, cruiseSchedules, error, formatDate, onEdit, onDelete, onEditSchedule, onDeleteSchedule }) => {
    const renderJsonField = (field) => {
        if (!field) return 'Нет данных';

        try {
            // Если поле — строка, пытаемся её распарсить как JSON
            if (typeof field === 'string') {
                try {
                    const parsed = JSON.parse(field);
                    return renderJsonField(parsed);
                } catch (e) {
                    console.error('Ошибка парсинга JSON строки:', field, e);
                    return field;
                }
            }

            // Если поле — массив
            if (Array.isArray(field)) {
                // Проверяем, состоит ли массив из объектов с полем name (как в features)
                if (field.every(item => typeof item === 'object' && item !== null && 'name' in item)) {
                    // Извлекаем только поле name из каждого объекта
                    return field.map(item => item.name).join(', ') || 'Нет данных';
                }
                // Для других массивов (например, просто список строк)
                return field.length > 0 ? field.join(', ') : 'Нет данных';
            }

            // Если поле — объект (например, price_per_person или cabins_by_class)
            if (typeof field === 'object' && field !== null) {
                // Проверяем, является ли объект "плоским" (все значения — не объекты)
                const isFlatObject = Object.values(field).every(
                    value => typeof value !== 'object' || value === null
                );

                if (isFlatObject) {
                    // Для плоских объектов выводим только ключи, если значения — true
                    const result = Object.entries(field)
                        .filter(([key, value]) => typeof value === 'boolean' && value === true)
                        .map(([key]) => key)
                        .join(', ');

                    return result || 'Нет данных';
                }

                // Для вложенных объектов
                return Object.entries(field)
                    .map(([key, value]) => {
                        if (typeof value === 'object' && value !== null) {
                            return `${key}: ${Object.entries(value)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(', ')}`;
                        }
                        return `${key}: ${typeof value === 'number' ? value.toFixed(2) : value}`;
                    })
                    .join('; ') || 'Нет данных';
            }

            return field.toString();
        } catch (e) {
            console.error('Ошибка при обработке JSON-поля:', e, 'Поле:', field);
            return 'Нет данных';
        }
    };

    // Привязываем расписания к круизам
    const allSchedules = cruiseSchedules?.map(schedule => ({
        ...schedule,
        cruise_name: cruises.find(cruise => cruise.id === schedule.cruise_id)?.name || 'Неизвестный круиз'
    })) || [];

    return (
        <div className={styles.componentContainer}>
            {error ? (
                <p className={styles.errorMessage}>Ошибка при загрузке данных</p>
            ) : (
                <>
                    {/* Таблица круизов */}
                    <h2>Круизы</h2>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Название</th>
                                    <th>Описание</th>
                                    <th>Река</th>
                                    <th>Каюты</th>
                                    <th>Цена за человека</th>
                                    <th>Длительность</th>
                                    <th>Особенности</th>
                                    <th>Изображение</th>
                                    <th>Каюты по классам</th>
                                    <th>Создан</th>
                                    <th>Обновлён</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(cruises) && cruises.length > 0 ? (
                                    cruises.map((cruise) => (
                                        <tr key={cruise.id}>
                                            <td>{cruise.id || 'Нет данных'}</td>
                                            <td>{cruise.name || 'Нет данных'}</td>
                                            <td>{cruise.description || 'Нет данных'}</td>
                                            <td>{cruise.river || 'Нет данных'}</td>
                                            <td>{cruise.cabins || 'Нет данных'}</td>
                                            <td>{renderJsonField(cruise.price_per_person)}</td>
                                            <td>{cruise.total_distance || 'Нет данных'}</td>
                                            <td>{renderJsonField(cruise.features)}</td>
                                            <td>{cruise.image_path || 'Нет данных'}</td>
                                            <td>{renderJsonField(cruise.cabins_by_class)}</td>
                                            <td>{formatDate(cruise.created_at) || 'Нет данных'}</td>
                                            <td>{formatDate(cruise.updated_at) || 'Нет данных'}</td>
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
                    </div>

                    {/* Таблица расписаний */}
                    <h2>Расписания круизов</h2>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Круиз</th>
                                    <th>Отправление</th>
                                    <th>Прибытие</th>
                                    <th>Места</th>
                                    <th>Доступно</th>
                                    <th>Эконом</th>
                                    <th>Стандарт</th>
                                    <th>Люкс</th>
                                    <th>Доступно эконом</th>
                                    <th>Доступно стандарт</th>
                                    <th>Доступно люкс</th>
                                    <th>Статус</th>
                                    <th>Создан</th>
                                    <th>Обновлён</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(allSchedules) && allSchedules.length > 0 ? (
                                    allSchedules.map((schedule) => (
                                        <tr key={schedule.id}>
                                            <td>{schedule.id || 'Нет данных'}</td>
                                            <td>{schedule.cruise_name || 'Нет данных'}</td>
                                            <td>{formatDate(schedule.departure_datetime) || 'Нет данных'}</td>
                                            <td>{formatDate(schedule.arrival_datetime) || 'Нет данных'}</td>
                                            <td>{schedule.total_places || 'Нет данных'}</td>
                                            <td>{schedule.available_places || 'Нет данных'}</td>
                                            <td>{schedule.economy_places || 'Нет данных'}</td>
                                            <td>{schedule.standard_places || 'Нет данных'}</td>
                                            <td>{schedule.luxury_places || 'Нет данных'}</td>
                                            <td>{schedule.available_economy_places || 'Нет данных'}</td>
                                            <td>{schedule.available_standard_places || 'Нет данных'}</td>
                                            <td>{schedule.available_luxury_places || 'Нет данных'}</td>
                                            <td>{schedule.status || 'Нет данных'}</td>
                                            <td>{formatDate(schedule.created_at) || 'Нет данных'}</td>
                                            <td>{formatDate(schedule.updated_at) || 'Нет данных'}</td>
                                            <td>
                                                <button onClick={() => onEditSchedule(schedule)} className={styles.editButton}>
                                                    Редактировать
                                                </button>
                                                <button onClick={() => onDeleteSchedule(schedule.id)} className={styles.deleteButton}>
                                                    Удалить
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="16">Расписания отсутствуют</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default CruisesList;