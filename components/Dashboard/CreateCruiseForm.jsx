import { useState } from 'react';
import styles from '../../pages/admin/adminComponents.module.css';

const CreateCruiseForm = ({ onSubmit }) => {
    // Состояние для данных круиза
    const [cruiseData, setCruiseData] = useState({
        name: '',
        description: '',
        river: '',
        cabins: '',
        price_per_person: '',
        total_distance: '',
        image_path: '',
        panorama_url: '',
        cabins_by_class: {
            luxury: { places: 0, image_path: '' },
            economy: { places: 0, image_path: '' },
            standard: { places: 0, image_path: '' },
        },
        features: [],
    });

    // Состояние для данных расписания
    const [scheduleData, setScheduleData] = useState({
        departure_datetime: '',
        arrival_datetime: '',
        total_places: '',
        available_places: '',
        economy_places: '',
        standard_places: '',
        luxury_places: '',
        available_economy_places: '',
        available_standard_places: '',
        available_luxury_places: '',
        status: 'planned',
    });

    // Состояние для управления списком особенностей
    const [featureInput, setFeatureInput] = useState({ name: '', price: '' });

    const handleCruiseChange = (e) => {
        const { name, value } = e.target;
        setCruiseData({ ...cruiseData, [name]: value });
    };

    const handleScheduleChange = (e) => {
        const { name, value } = e.target;
        setScheduleData({ ...scheduleData, [name]: value });
    };

    const handleCabinsByClassChange = (e) => {
        const { name, value } = e.target;
        const [classType, field] = name.split('.'); // Например, "luxury.places" или "economy.image_path"
        setCruiseData({
            ...cruiseData,
            cabins_by_class: {
                ...cruiseData.cabins_by_class,
                [classType]: {
                    ...cruiseData.cabins_by_class[classType],
                    [field]: value,
                },
            },
        });
    };

    const handleFeatureChange = (e) => {
        const { name, value } = e.target;
        setFeatureInput({ ...featureInput, [name]: value });
    };

    const addFeature = () => {
        if (featureInput.name && featureInput.price) {
            setCruiseData({
                ...cruiseData,
                features: [...cruiseData.features, { name: featureInput.name, price: parseFloat(featureInput.price) }],
            });
            setFeatureInput({ name: '', price: '' });
        }
    };

    const removeFeature = (index) => {
        setCruiseData({
            ...cruiseData,
            features: cruiseData.features.filter((_, i) => i !== index),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 1. Формируем данные круиза
            const cruisePayload = {
                name: cruiseData.name,
                description: cruiseData.description,
                river: cruiseData.river,
                cabins: parseInt(cruiseData.cabins),
                price_per_person: parseFloat(cruiseData.price_per_person),
                total_distance: parseFloat(cruiseData.total_distance),
                image_path: cruiseData.image_path || null,
                panorama_url: cruiseData.panorama_url || null,
                cabins_by_class: JSON.stringify(cruiseData.cabins_by_class),
                features: JSON.stringify(cruiseData.features),
            };

            // 2. Отправляем запрос на создание круиза
            const cruiseResponse = await fetch('http://localhost:8000/api/cruises', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(cruisePayload),
            });

            if (!cruiseResponse.ok) {
                throw new Error('Ошибка при создании круиза');
            }

            const createdCruise = await cruiseResponse.json();

            // 3. Формируем данные расписания
            const schedulePayload = {
                cruise_id: createdCruise.id,
                departure_datetime: scheduleData.departure_datetime,
                arrival_datetime: scheduleData.arrival_datetime,
                total_places: parseInt(scheduleData.total_places),
                available_places: parseInt(scheduleData.available_places),
                economy_places: parseInt(scheduleData.economy_places),
                standard_places: parseInt(scheduleData.standard_places),
                luxury_places: parseInt(scheduleData.luxury_places),
                available_economy_places: parseInt(scheduleData.available_economy_places),
                available_standard_places: parseInt(scheduleData.available_standard_places),
                available_luxury_places: parseInt(scheduleData.available_luxury_places),
                status: scheduleData.status,
            };

            // 4. Отправляем запрос на создание расписания
            const scheduleResponse = await fetch('http://localhost:8000/api/cruise_schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(schedulePayload),
            });

            if (!scheduleResponse.ok) {
                throw new Error('Ошибка при создании расписания');
            }

            // 5. Очищаем форму после успешного создания
            setCruiseData({
                name: '',
                description: '',
                river: '',
                cabins: '',
                price_per_person: '',
                total_distance: '',
                image_path: '',
                panorama_url: '',
                cabins_by_class: {
                    luxury: { places: 0, image_path: '' },
                    economy: { places: 0, image_path: '' },
                    standard: { places: 0, image_path: '' },
                },
                features: [],
            });
            setScheduleData({
                departure_datetime: '',
                arrival_datetime: '',
                total_places: '',
                available_places: '',
                economy_places: '',
                standard_places: '',
                luxury_places: '',
                available_economy_places: '',
                available_standard_places: '',
                available_luxury_places: '',
                status: 'planned',
            });

            // 6. Вызываем onSubmit для обновления списка круизов
            onSubmit(createdCruise);
            alert('Круиз и расписание успешно созданы!');
        } catch (error) {
            console.error(error);
            alert('Ошибка при создании круиза или расписания');
        }
    };

    return (
        <div className={styles.componentContainer}>
            <form onSubmit={handleSubmit} className={styles.formContainer}>
                <h3>Создание круиза</h3>

                <div className={styles.inputGroup}>
                    <label>Название</label>
                    <input
                        type="text"
                        name="name"
                        value={cruiseData.name}
                        onChange={handleCruiseChange}
                        className={styles.inputField}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Описание</label>
                    <textarea
                        name="description"
                        value={cruiseData.description}
                        onChange={handleCruiseChange}
                        className={styles.textareaField}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Река</label>
                    <input
                        type="text"
                        name="river"
                        value={cruiseData.river}
                        onChange={handleCruiseChange}
                        className={styles.inputField}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Количество кают</label>
                    <input
                        type="number"
                        name="cabins"
                        value={cruiseData.cabins}
                        onChange={handleCruiseChange}
                        className={styles.inputField}
                        required
                        min="1"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Цена за человека (руб.)</label>
                    <input
                        type="number"
                        name="price_per_person"
                        value={cruiseData.price_per_person}
                        onChange={handleCruiseChange}
                        className={styles.inputField}
                        required
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Длительность (дней)</label>
                    <input
                        type="number"
                        name="total_distance"
                        value={cruiseData.total_distance}
                        onChange={handleCruiseChange}
                        className={styles.inputField}
                        required
                        min="0"
                        step="0.1"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Путь к изображению</label>
                    <input
                        type="text"
                        name="image_path"
                        value={cruiseData.image_path}
                        onChange={handleCruiseChange}
                        className={styles.inputField}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>URL панорамы</label>
                    <input
                        type="text"
                        name="panorama_url"
                        value={cruiseData.panorama_url}
                        onChange={handleCruiseChange}
                        className={styles.inputField}
                    />
                </div>

                {/* Форма для особенностей */}
                <div className={styles.inputGroup}>
                    <label>Особенности</label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input
                            type="text"
                            name="name"
                            value={featureInput.name}
                            onChange={handleFeatureChange}
                            placeholder="Название особенности"
                            className={styles.inputField}
                        />
                        <input
                            type="number"
                            name="price"
                            value={featureInput.price}
                            onChange={handleFeatureChange}
                            placeholder="Цена (руб.)"
                            className={styles.inputField}
                            step="0.01"
                        />
                        <button type="button" onClick={addFeature} className={styles.button}>
                            Добавить
                        </button>
                    </div>
                    {cruiseData.features.length > 0 && (
                        <ul>
                            {cruiseData.features.map((feature, index) => (
                                <li key={index}>
                                    {feature.name} - {feature.price} руб.
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(index)}
                                        className={styles.deleteButton}
                                        style={{ marginLeft: '10px' }}
                                    >
                                        Удалить
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Форма для кают по классам */}
                <div className={styles.inputGroup}>
                    <label>Каюты по классам</label>
                    {['luxury', 'economy', 'standard'].map((classType) => (
                        <div key={classType} style={{ marginBottom: '10px' }}>
                            <h4>{classType.charAt(0).toUpperCase() + classType.slice(1)}</h4>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="number"
                                    name={`${classType}.places`}
                                    value={cruiseData.cabins_by_class[classType].places}
                                    onChange={handleCabinsByClassChange}
                                    placeholder="Количество мест"
                                    className={styles.inputField}
                                    min="0"
                                />
                                <input
                                    type="text"
                                    name={`${classType}.image_path`}
                                    value={cruiseData.cabins_by_class[classType].image_path}
                                    onChange={handleCabinsByClassChange}
                                    placeholder="Путь к изображению"
                                    className={styles.inputField}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <h3>Создание расписания</h3>

                <div className={styles.inputGroup}>
                    <label>Дата и время отправления</label>
                    <input
                        type="datetime-local"
                        name="departure_datetime"
                        value={scheduleData.departure_datetime}
                        onChange={handleScheduleChange}
                        className={styles.inputField}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Дата и время прибытия</label>
                    <input
                        type="datetime-local"
                        name="arrival_datetime"
                        value={scheduleData.arrival_datetime}
                        onChange={handleScheduleChange}
                        className={styles.inputField}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Общее количество мест</label>
                    <input
                        type="number"
                        name="total_places"
                        value={scheduleData.total_places}
                        onChange={handleScheduleChange}
                        className={styles.inputField}
                        required
                        min="0"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Доступно мест</label>
                    <input
                        type="number"
                        name="available_places"
                        value={scheduleData.available_places}
                        onChange={handleScheduleChange}
                        className={styles.inputField}
                        required
                        min="0"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Места эконом-класса</label>
                    <input
                        type="number"
                        name="economy_places"
                        value={scheduleData.economy_places}
                        onChange={handleScheduleChange}
                        className={styles.inputField}
                        required
                        min="0"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Места стандарт-класса</label>
                    <input
                        type="number"
                        name="standard_places"
                        value={scheduleData.standard_places}
                        onChange={handleScheduleChange}
                        className={styles.inputField}
                        required
                        min="0"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Места люкс-класса</label>
                    <input
                        type="number"
                        name="luxury_places"
                        value={scheduleData.luxury_places}
                        onChange={handleScheduleChange}
                        className={styles.inputField}
                        required
                        min="0"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Доступно мест эконом-класса</label>
                    <input
                        type="number"
                        name="available_economy_places"
                        value={scheduleData.available_economy_places}
                        onChange={handleScheduleChange}
                        className={styles.inputField}
                        required
                        min="0"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Доступно мест стандарт-класса</label>
                    <input
                        type="number"
                        name="available_standard_places"
                        value={scheduleData.available_standard_places}
                        onChange={handleScheduleChange}
                        className={styles.inputField}
                        required
                        min="0"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Доступно мест люкс-класса</label>
                    <input
                        type="number"
                        name="available_luxury_places"
                        value={scheduleData.available_luxury_places}
                        onChange={handleScheduleChange}
                        className={styles.inputField}
                        required
                        min="0"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Статус</label>
                    <select
                        name="status"
                        value={scheduleData.status}
                        onChange={handleScheduleChange}
                        className={styles.inputField}
                        required
                    >
                        <option value="planned">Запланирован</option>
                        <option value="active">Активен</option>
                        <option value="completed">Завершён</option>
                        <option value="canceled">Отменён</option>
                    </select>
                </div>

                <button type="submit" className={styles.button}>Создать круиз и расписание</button>
            </form>
        </div>
    );
};

export default CreateCruiseForm;