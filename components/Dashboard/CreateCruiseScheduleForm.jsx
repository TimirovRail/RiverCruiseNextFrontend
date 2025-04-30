import { useState } from 'react';
import styles from '../../pages/admin/adminComponents.module.css';

const CreateCruiseScheduleForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        cruise_id: '',
        departure_datetime: '',
        arrival_datetime: '',
        economy_places: '',
        standard_places: '',
        luxury_places: '',
        status: 'planned',
    });

    // Статичный список круизов (6 круизов)
    const cruises = [
        { id: 1, name: 'Круиз по Волге' },
        { id: 2, name: 'Круиз по Дону' },
        { id: 3, name: 'Круиз по Оке' },
        { id: 4, name: 'Круиз по Каме' },
        { id: 5, name: 'Круиз по Енисею' },
        { id: 6, name: 'Круиз по Лене' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const totalPlaces =
                (parseInt(formData.economy_places) || 0) +
                (parseInt(formData.standard_places) || 0) +
                (parseInt(formData.luxury_places) || 0);

            const newSchedule = {
                cruise_id: parseInt(formData.cruise_id),
                departure_datetime: formData.departure_datetime,
                arrival_datetime: formData.arrival_datetime,
                economy_places: parseInt(formData.economy_places) || 0,
                standard_places: parseInt(formData.standard_places) || 0,
                luxury_places: parseInt(formData.luxury_places) || 0,
                total_places: totalPlaces,
                available_places: totalPlaces,
                available_economy_places: parseInt(formData.economy_places) || 0,
                available_standard_places: parseInt(formData.standard_places) || 0,
                available_luxury_places: parseInt(formData.luxury_places) || 0,
                status: formData.status,
            };

            console.log('Отправляемые данные расписания:', newSchedule);

            const response = await fetch(`http://localhost:8000/api/cruises/${formData.cruise_id}/schedules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newSchedule),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при создании расписания: ${response.status} - ${errorText}`);
            }

            const createdSchedule = await response.json();
            console.log('Созданное расписание:', createdSchedule);

            setFormData({
                cruise_id: '',
                departure_datetime: '',
                arrival_datetime: '',
                economy_places: '',
                standard_places: '',
                luxury_places: '',
                status: 'planned',
            });

            onSubmit(createdSchedule);
            alert('Расписание успешно создано!');
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        }
    };

    return (
        <div className={styles.componentContainer}>
            <div className={styles.formHeader}>
                <h3>Создание расписания круиза</h3>
            </div>
            <form onSubmit={handleSubmit} className={styles.formContainer}>
                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                        <span className={styles.icon}></span> Выберите круиз
                    </label>
                    <select
                        name="cruise_id"
                        value={formData.cruise_id}
                        onChange={handleChange}
                        className={styles.inputField}
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
                    <label className={styles.inputLabel}>
                        <span className={styles.icon}></span> Дата и время отправления
                    </label>
                    <input
                        type="datetime-local"
                        name="departure_datetime"
                        value={formData.departure_datetime}
                        onChange={handleChange}
                        className={styles.inputField}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                        <span className={styles.icon}></span> Дата и время прибытия
                    </label>
                    <input
                        type="datetime-local"
                        name="arrival_datetime"
                        value={formData.arrival_datetime}
                        onChange={handleChange}
                        className={styles.inputField}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                        <span className={styles.icon}></span> Места эконом-класса
                    </label>
                    <input
                        type="number"
                        name="economy_places"
                        value={formData.economy_places}
                        onChange={handleChange}
                        min="0"
                        className={styles.inputField}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                        <span className={styles.icon}></span> Места стандарт-класса
                    </label>
                    <input
                        type="number"
                        name="standard_places"
                        value={formData.standard_places}
                        onChange={handleChange}
                        min="0"
                        className={styles.inputField}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                        <span className={styles.icon}></span> Места люкс-класса
                    </label>
                    <input
                        type="number"
                        name="luxury_places"
                        value={formData.luxury_places}
                        onChange={handleChange}
                        min="0"
                        className={styles.inputField}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                        <span className={styles.icon}></span> Статус
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className={styles.inputField}
                    >
                        <option value="planned">Запланирован</option>
                        <option value="cancelled">Отменён</option>
                        <option value="completed">Завершён</option>
                    </select>
                </div>

                <div className={styles.buttonContainer}>
                    <button type="submit" className={styles.button}>Создать расписание</button>
                </div>
            </form>
        </div>
    );
};

export default CreateCruiseScheduleForm;