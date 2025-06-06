import { useState } from 'react'; // Добавляем useState для управления сортировкой
import styles from '../../pages/admin/adminComponents.module.css';

const CruisesList = ({ cruises, cruiseSchedules, error, formatDate, onEdit, onDelete, onEditSchedule, onDeleteSchedule }) => {
    // Состояния для сортировки
    const [cruiseSort, setCruiseSort] = useState({ field: 'name', order: 'asc' });
    const [scheduleSort, setScheduleSort] = useState({ field: 'departure_datetime', order: 'asc' });

    const renderJsonField = (field) => {
        if (!field) return 'Нет данных';
        try {
            if (typeof field === 'string') {
                try {
                    const parsed = JSON.parse(field);
                    return renderJsonField(parsed);
                } catch (e) {
                    return field;
                }
            }
            if (Array.isArray(field)) {
                if (field.every(item => typeof item === 'object' && item !== null && 'name' in item)) {
                    return field.map(item => item.name).join(', ') || 'Нет данных';
                }
                return field.length > 0 ? field.join(', ') : 'Нет данных';
            }
            if (typeof field === 'object' && field !== null) {
                const isFlatObject = Object.values(field).every(value => typeof value !== 'object' || value === null);
                if (isFlatObject) {
                    const result = Object.entries(field).filter(([_, value]) => value === true).map(([key]) => key).join(', ');
                    return result || 'Нет данных';
                }
                return Object.entries(field).map(([key, value]) => {
                    if (typeof value === 'object' && value !== null) {
                        return `${key}: ${Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ')}`;
                    }
                    return `${key}: ${typeof value === 'number' ? value.toFixed(2) : value}`;
                }).join('; ') || 'Нет данных';
            }
            return field.toString();
        } catch (e) {
            console.error('Ошибка при обработке JSON-поля:', e, 'Поле:', field);
            return 'Нет данных';
        }
    };

    const allSchedules = cruiseSchedules?.map(schedule => ({
        ...schedule,
        cruise_name: cruises.find(cruise => cruise.id === schedule.cruise_id)?.name || 'Неизвестный круиз'
    })) || [];

    // Функция сортировки для круизов
    const sortCruises = (cruises) => {
        return [...cruises].sort((a, b) => {
            let fieldA = a[cruiseSort.field];
            let fieldB = b[cruiseSort.field];

            // Обработка числовых полей (например, price_per_person)
            if (cruiseSort.field === 'price_per_person') {
                fieldA = parseFloat(fieldA) || 0;
                fieldB = parseFloat(fieldB) || 0;
            }

            // Обработка дат (например, created_at)
            if (cruiseSort.field === 'created_at') {
                fieldA = new Date(fieldA).getTime();
                fieldB = new Date(fieldB).getTime();
            }

            if (cruiseSort.order === 'asc') {
                return fieldA > fieldB ? 1 : -1;
            } else {
                return fieldA < fieldB ? 1 : -1;
            }
        });
    };

    // Функция сортировки для расписаний
    const sortSchedules = (schedules) => {
        return [...schedules].sort((a, b) => {
            let fieldA = a[scheduleSort.field];
            let fieldB = b[scheduleSort.field];

            // Для поля cruise_name
            if (scheduleSort.field === 'cruise_name') {
                fieldA = fieldA || '';
                fieldB = fieldB || '';
            }

            // Для дат (departure_datetime)
            if (scheduleSort.field === 'departure_datetime') {
                fieldA = new Date(fieldA).getTime();
                fieldB = new Date(fieldB).getTime();
            }

            if (scheduleSort.order === 'asc') {
                return fieldA > fieldB ? 1 : -1;
            } else {
                return fieldA < fieldB ? 1 : -1;
            }
        });
    };

    // Обработчики изменения сортировки
    const handleCruiseSortChange = (e) => {
        const [field, order] = e.target.value.split('-');
        setCruiseSort({ field, order });
    };

    const handleScheduleSortChange = (e) => {
        const [field, order] = e.target.value.split('-');
        setScheduleSort({ field, order });
    };

    // Отсортированные данные
    const sortedCruises = sortCruises(cruises);
    const sortedSchedules = sortSchedules(allSchedules);

    return (
        <div className={styles.componentContainer}>
            {error ? (
                <p className={styles.errorMessage}>Ошибка при загрузке данных</p>
            ) : (
                <>
                    <h2>Круизы</h2>
                    <div className={styles.sortWrapper}>
                        <label>Сортировать по: </label>
                        <select onChange={handleCruiseSortChange} value={`${cruiseSort.field}-${cruiseSort.order}`}>
                            <option value="name-asc">Названию (А-Я)</option>
                            <option value="name-desc">Названию (Я-А)</option>
                            <option value="price_per_person-asc">Цене (по возрастанию)</option>
                            <option value="price_per_person-desc">Цене (по убыванию)</option>
                            <option value="created_at-asc">Дате создания (сначала старые)</option>
                            <option value="created_at-desc">Дате создания (сначала новые)</option>
                        </select>
                    </div>
                    <div className={styles.contentWrapper}>
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
                                {Array.isArray(sortedCruises) && sortedCruises.length > 0 ? (
                                    sortedCruises.map((cruise) => (
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
                                                <button onClick={() => onEdit(cruise)} className={styles.editButton}>Редактировать</button>
                                                <button onClick={() => onDelete(cruise.id)} className={styles.deleteButton}>Удалить</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="13">Круизы отсутствуют</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <h2>Расписания круизов</h2>
                    <div className={styles.sortWrapper}>
                        <label>Сортировать по: </label>
                        <select onChange={handleScheduleSortChange} value={`${scheduleSort.field}-${scheduleSort.order}`}>
                            <option value="departure_datetime-asc">Дате отправления (сначала старые)</option>
                            <option value="departure_datetime-desc">Дате отправления (сначала новые)</option>
                            <option value="cruise_name-asc">Круизу (А-Я)</option>
                            <option value="cruise_name-desc">Круизу (Я-А)</option>
                            <option value="status-asc">Статусу (А-Я)</option>
                            <option value="status-desc">Статусу (Я-А)</option>
                        </select>
                    </div>
                    <div className={styles.contentWrapper}>
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
                                {Array.isArray(sortedSchedules) && sortedSchedules.length > 0 ? (
                                    sortedSchedules.map((schedule) => (
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
                                                <button onClick={() => onEditSchedule(schedule)} className={styles.editButton}>Редактировать</button>
                                                <button onClick={() => onDeleteSchedule(schedule.id)} className={styles.deleteButton}>Удалить</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="16">Расписания отсутствуют</td></tr>
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