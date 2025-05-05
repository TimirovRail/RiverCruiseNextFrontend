import { useState, useEffect } from 'react';
import styles from '../../pages/admin/adminComponents.module.css';
import { API_BASE_URL } from '../../src/config';

const EditCruiseForm = ({ cruise, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        river: '',
        cabins: '',
        total_distance: '',
        features: [],
        price_per_person: '',
        cabins_by_class: {
            luxury: { places: '', image_path: '' },
            economy: { places: '', image_path: '' },
            standard: { places: '', image_path: '' },
        },
        image_path: '',
    });

    useEffect(() => {
        if (cruise) {
            setFormData({
                name: cruise.name || '',
                description: cruise.description || '',
                river: cruise.river || '',
                cabins: cruise.cabins || '',
                total_distance: cruise.total_distance || '',
                features: cruise.features || [],
                price_per_person: cruise.price_per_person || '',
                cabins_by_class: {
                    luxury: {
                        places: cruise.cabins_by_class?.luxury?.places || '',
                        image_path: cruise.cabins_by_class?.luxury?.image_path || '',
                    },
                    economy: {
                        places: cruise.cabins_by_class?.economy?.places || '',
                        image_path: cruise.cabins_by_class?.economy?.image_path || '',
                    },
                    standard: {
                        places: cruise.cabins_by_class?.standard?.places || '',
                        image_path: cruise.cabins_by_class?.standard?.image_path || '',
                    },
                },
                image_path: cruise.image_path || '',
            });
        }
    }, [cruise]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('cabins_by_class')) {
            const [field, subField, subProperty] = name.split('.');
            setFormData({
                ...formData,
                [field]: {
                    ...formData[field],
                    [subField]: {
                        ...formData[field][subField],
                        [subProperty]: value,
                    },
                },
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFeatureChange = (index, key, value) => {
        const updatedFeatures = [...formData.features];
        updatedFeatures[index] = { ...updatedFeatures[index], [key]: value };
        setFormData({ ...formData, features: updatedFeatures });
    };

    const addFeature = () => {
        setFormData({
            ...formData,
            features: [...formData.features, { name: '', price: '' }],
        });
    };

    const removeFeature = (index) => {
        setFormData({
            ...formData,
            features: formData.features.filter((_, i) => i !== index),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updatedCruise = {
            ...formData,
            cabins: parseInt(formData.cabins) || 0,
            total_distance: parseFloat(formData.total_distance) || 0,
            price_per_person: parseFloat(formData.price_per_person) || 0,
            cabins_by_class: {
                luxury: {
                    places: parseInt(formData.cabins_by_class.luxury.places) || 0,
                    image_path: formData.cabins_by_class.luxury.image_path || '',
                },
                economy: {
                    places: parseInt(formData.cabins_by_class.economy.places) || 0,
                    image_path: formData.cabins_by_class.economy.image_path || '',
                },
                standard: {
                    places: parseInt(formData.cabins_by_class.standard.places) || 0,
                    image_path: formData.cabins_by_class.standard.image_path || '',
                },
            },
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/cruises/${cruise.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedCruise),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при обновлении круиза: ${response.status} - ${errorText}`);
            }

            const updatedCruiseData = await response.json();
            // Проверяем, является ли onSubmit функцией перед вызовом
            if (typeof onSubmit === 'function') {
                onSubmit(updatedCruiseData);
            } else {
                console.warn('onSubmit is not a function. Skipping onSubmit call.');
            }
            alert('Круиз успешно обновлён!');
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        }
    };

    return (
        <div className={styles.componentContainer}>
            <div className={styles.formHeader}>
                <h3>Редактирование круиза</h3>
            </div>
            <form onSubmit={handleSubmit} className={styles.formContainer}>
                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                        <span className={styles.icon}>🚢</span> Название
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={styles.inputField}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                        <span className={styles.icon}>📝</span> Описание
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className={styles.textareaField}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                        <span className={styles.icon}>🌊</span> Река
                    </label>
                    <input
                        type="text"
                        name="river"
                        value={formData.river}
                        onChange={handleChange}
                        className={styles.inputField}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                        <span className={styles.icon}>🛏️</span> Каюты
                    </label>
                    <input
                        type="number"
                        name="cabins"
                        value={formData.cabins}
                        onChange={handleChange}
                        className={styles.inputField}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                        <span className={styles.icon}>📏</span> Длительность (км)
                    </label>
                    <input
                        type="number"
                        name="total_distance"
                        value={formData.total_distance}
                        onChange={handleChange}
                        className={styles.inputField}
                        required
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                        <span className={styles.icon}>💰</span> Цена за человека (руб.)
                    </label>
                    <input
                        type="number"
                        name="price_per_person"
                        value={formData.price_per_person}
                        onChange={handleChange}
                        className={styles.inputField}
                        required
                        step="0.01"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                        <span className={styles.icon}>🖼️</span> Путь к изображению
                    </label>
                    <input
                        type="text"
                        name="image_path"
                        value={formData.image_path}
                        onChange={handleChange}
                        className={styles.inputField}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                        <span className={styles.icon}>⭐</span> Особенности
                    </label>
                    {formData.features.map((feature, index) => (
                        <div key={index} className={styles.featureRow}>
                            <input
                                type="text"
                                value={feature.name}
                                onChange={(e) => handleFeatureChange(index, 'name', e.target.value)}
                                placeholder="Название"
                                className={styles.inputField}
                            />
                            <input
                                type="number"
                                value={feature.price}
                                onChange={(e) => handleFeatureChange(index, 'price', e.target.value)}
                                placeholder="Цена"
                                step="0.01"
                                className={styles.inputField}
                            />
                            <button
                                type="button"
                                onClick={() => removeFeature(index)}
                                className={styles.deleteButton}
                            >
                                Удалить
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={addFeature} className={styles.button}>
                        Добавить особенность
                    </button>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>
                        <span className={styles.icon}>🏨</span> Каюты по классам
                    </label>
                    {['luxury', 'economy', 'standard'].map((classType) => (
                        <div key={classType} className={styles.cabinClass}>
                            <h4>{classType.charAt(0).toUpperCase() + classType.slice(1)}</h4>
                            <input
                                type="number"
                                name={`cabins_by_class.${classType}.places`}
                                value={formData.cabins_by_class[classType].places}
                                onChange={handleChange}
                                placeholder="Количество мест"
                                className={styles.inputField}
                                required
                            />
                            <input
                                type="text"
                                name={`cabins_by_class.${classType}.image_path`}
                                value={formData.cabins_by_class[classType].image_path}
                                onChange={handleChange}
                                placeholder="Путь к изображению"
                                className={styles.inputField}
                            />
                        </div>
                    ))}
                </div>

                <div className={styles.buttonContainer}>
                    <button type="submit" className={styles.button}>Сохранить изменения</button>
                </div>
            </form>
        </div>
    );
};

export default EditCruiseForm;