import { useState, useEffect } from 'react';
import styles from '../../pages/admin/adminComponents.module.css';

const CruiseScheduleEditForm = ({ schedule, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        id: '',
        departure_datetime: '',
        arrival_datetime: '',
        economy_places: '',
        standard_places: '',
        luxury_places: '',
        total_places: '',
        available_places: '',
        status: 'planned',
    });

    useEffect(() => {
        if (schedule) {
            const totalPlaces = (Number(schedule.economy_places) || 0) + 
                              (Number(schedule.standard_places) || 0) + 
                              (Number(schedule.luxury_places) || 0);
            setFormData({
                id: schedule.id || '',
                departure_datetime: schedule.departure_datetime ? schedule.departure_datetime.slice(0, 16) : '',
                arrival_datetime: schedule.arrival_datetime ? schedule.arrival_datetime.slice(0, 16) : '',
                economy_places: schedule.economy_places || '',
                standard_places: schedule.standard_places || '',
                luxury_places: schedule.luxury_places || '',
                total_places: totalPlaces || '',
                available_places: schedule.available_places || totalPlaces || '',
                status: schedule.status || 'planned',
            });
        }
    }, [schedule]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updatedFormData = { ...prev, [name]: value };

            // Автоматически вычисляем total_places при изменении мест
            if (['economy_places', 'standard_places', 'luxury_places'].includes(name)) {
                const totalPlaces = 
                    (Number(updatedFormData.economy_places) || 0) +
                    (Number(updatedFormData.standard_places) || 0) +
                    (Number(updatedFormData.luxury_places) || 0);
                updatedFormData.total_places = totalPlaces;
                // Если available_places не задано вручную, устанавливаем его равным total_places
                if (!updatedFormData.available_places || updatedFormData.available_places > totalPlaces) {
                    updatedFormData.available_places = totalPlaces;
                }
            }

            return updatedFormData;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Убедимся, что все числовые поля отправляются как числа
        const payload = {
            ...formData,
            economy_places: Number(formData.economy_places) || 0,
            standard_places: Number(formData.standard_places) || 0,
            luxury_places: Number(formData.luxury_places) || 0,
            total_places: Number(formData.total_places) || 0,
            available_places: Number(formData.available_places) || 0,
        };
        onSave(payload);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.inputGroup}>
                <label>Дата и время отправления</label>
                <input
                    type="datetime-local"
                    name="departure_datetime"
                    value={formData.departure_datetime}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Дата и время прибытия</label>
                <input
                    type="datetime-local"
                    name="arrival_datetime"
                    value={formData.arrival_datetime}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Места эконом</label>
                <input
                    type="number"
                    name="economy_places"
                    value={formData.economy_places}
                    onChange={handleChange}
                    required
                    min="0"
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Места стандарт</label>
                <input
                    type="number"
                    name="standard_places"
                    value={formData.standard_places}
                    onChange={handleChange}
                    required
                    min="0"
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Места люкс</label>
                <input
                    type="number"
                    name="luxury_places"
                    value={formData.luxury_places}
                    onChange={handleChange}
                    required
                    min="0"
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Общее количество мест</label>
                <input
                    type="number"
                    name="total_places"
                    value={formData.total_places}
                    readOnly // Поле только для чтения, так как вычисляется автоматически
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Доступные места</label>
                <input
                    type="number"
                    name="available_places"
                    value={formData.available_places}
                    onChange={handleChange}
                    required
                    min="0"
                    max={formData.total_places} // Не больше общего количества мест
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Статус</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="planned">Запланирован</option>
                    <option value="active">Активен</option>
                    <option value="completed">Завершён</option>
                    <option value="canceled">Отменён</option>
                </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className={styles.button}>Сохранить</button>
                <button type="button" onClick={onCancel} className={styles.deleteButton}>Отмена</button>
            </div>
        </form>
    );
};

export default CruiseScheduleEditForm;