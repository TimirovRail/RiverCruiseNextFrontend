// components/Dashboard/CruiseScheduleEditForm.jsx
import { useState } from 'react';
import styles from '../../pages/admin/adminComponents.module.css';

const CruiseScheduleEditForm = ({ schedule, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        id: schedule.id,
        departure_datetime: schedule.departure_datetime,
        arrival_datetime: schedule.arrival_datetime,
        total_places: schedule.total_places,
        available_places: schedule.available_places,
        economy_places: schedule.economy_places,
        standard_places: schedule.standard_places,
        luxury_places: schedule.luxury_places,
        available_economy_places: schedule.available_economy_places,
        available_standard_places: schedule.available_standard_places,
        available_luxury_places: schedule.available_luxury_places,
        status: schedule.status,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <h3>Редактировать расписание</h3>

            <div className={styles.inputGroup}>
                <label>
                    Отправление:
                    <input
                        type="datetime-local"
                        name="departure_datetime"
                        value={formData.departure_datetime}
                        onChange={handleChange}
                        required
                        className={styles.inputField}
                    />
                </label>
            </div>

            <div className={styles.inputGroup}>
                <label>
                    Прибытие:
                    <input
                        type="datetime-local"
                        name="arrival_datetime"
                        value={formData.arrival_datetime}
                        onChange={handleChange}
                        required
                        className={styles.inputField}
                    />
                </label>
            </div>

            <div className={styles.inputGroup}>
                <label>
                    Общее количество мест:
                    <input
                        type="number"
                        name="total_places"
                        value={formData.total_places}
                        onChange={handleChange}
                        required
                        min="0"
                        className={styles.inputField}
                    />
                </label>
            </div>

            <div className={styles.inputGroup}>
                <label>
                    Доступно мест:
                    <input
                        type="number"
                        name="available_places"
                        value={formData.available_places}
                        onChange={handleChange}
                        required
                        min="0"
                        className={styles.inputField}
                    />
                </label>
            </div>

            <div className={styles.inputGroup}>
                <label>
                    Места эконом:
                    <input
                        type="number"
                        name="economy_places"
                        value={formData.economy_places}
                        onChange={handleChange}
                        required
                        min="0"
                        className={styles.inputField}
                    />
                </label>
            </div>

            <div className={styles.inputGroup}>
                <label>
                    Места стандарт:
                    <input
                        type="number"
                        name="standard_places"
                        value={formData.standard_places}
                        onChange={handleChange}
                        required
                        min="0"
                        className={styles.inputField}
                    />
                </label>
            </div>

            <div className={styles.inputGroup}>
                <label>
                    Места люкс:
                    <input
                        type="number"
                        name="luxury_places"
                        value={formData.luxury_places}
                        onChange={handleChange}
                        required
                        min="0"
                        className={styles.inputField}
                    />
                </label>
            </div>

            <div className={styles.inputGroup}>
                <label>
                    Доступно мест эконом:
                    <input
                        type="number"
                        name="available_economy_places"
                        value={formData.available_economy_places}
                        onChange={handleChange}
                        required
                        min="0"
                        className={styles.inputField}
                    />
                </label>
            </div>

            <div className={styles.inputGroup}>
                <label>
                    Доступно мест стандарт:
                    <input
                        type="number"
                        name="available_standard_places"
                        value={formData.available_standard_places}
                        onChange={handleChange}
                        required
                        min="0"
                        className={styles.inputField}
                    />
                </label>
            </div>

            <div className={styles.inputGroup}>
                <label>
                    Доступно мест люкс:
                    <input
                        type="number"
                        name="available_luxury_places"
                        value={formData.available_luxury_places}
                        onChange={handleChange}
                        required
                        min="0"
                        className={styles.inputField}
                    />
                </label>
            </div>

            <div className={styles.inputGroup}>
                <label>
                    Статус:
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className={styles.inputField}
                    >
                        <option value="planned">Запланирован</option>
                        <option value="active">Активен</option>
                        <option value="completed">Завершён</option>
                        <option value="canceled">Отменён</option>
                    </select>
                </label>
            </div>

            <div className={styles.buttonGroup}>
                <button type="submit" className={styles.button}>Сохранить</button>
                <button type="button" onClick={onCancel} className={styles.deleteButton}>Отмена</button>
            </div>
        </form>
    );
};

export default CruiseScheduleEditForm;