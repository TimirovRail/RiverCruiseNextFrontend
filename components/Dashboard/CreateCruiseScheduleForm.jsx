import { useState, useEffect } from 'react';
import styles from '../../pages/admin/adminComponents.module.css';

const CreateCruiseScheduleForm = ({ cruises, onSubmit }) => {
    const [formData, setFormData] = useState({
        cruise_id: '',
        departure_datetime: '',
        economy_places: '',
        standard_places: '',
        luxury_places: '',
        status: 'planned',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const totalPlaces =
            (parseInt(formData.economy_places) || 0) +
            (parseInt(formData.standard_places) || 0) +
            (parseInt(formData.luxury_places) || 0);
        const newSchedule = {
            ...formData,
            economy_places: parseInt(formData.economy_places) || 0,
            standard_places: parseInt(formData.standard_places) || 0,
            luxury_places: parseInt(formData.luxury_places) || 0,
            total_places: totalPlaces,
            available_places: totalPlaces,
        };
        onSubmit(newSchedule);
        // Сбрасываем форму после отправки
        setFormData({
            cruise_id: '',
            departure_datetime: '',
            economy_places: '',
            standard_places: '',
            luxury_places: '',
            status: 'planned',
        });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.inputGroup}>
                <label>Выберите круиз</label>
                <select
                    name="cruise_id"
                    value={formData.cruise_id}
                    onChange={handleChange}
                    required
                >
                    <option value="">-- Выберите круиз --</option>
                    {cruises.map((cruise) => (
                        <option key={cruise.id} value={cruise.id}>
                            {cruise.name}
                        </option>
                    ))}
                </select>
            </div>
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
                <label>Места эконом-класса</label>
                <input
                    type="number"
                    name="economy_places"
                    value={formData.economy_places}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Места стандарт-класса</label>
                <input
                    type="number"
                    name="standard_places"
                    value={formData.standard_places}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Места люкс-класса</label>
                <input
                    type="number"
                    name="luxury_places"
                    value={formData.luxury_places}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Статус</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="planned">Запланирован</option>
                    <option value="cancelled">Отменён</option>
                    <option value="completed">Завершён</option>
                </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className={styles.button}>Создать расписание</button>
            </div>
        </form>
    );
};

export default CreateCruiseScheduleForm;