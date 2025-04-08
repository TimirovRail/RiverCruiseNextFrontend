import { useState, useEffect } from 'react';
import styles from '../../pages/admin/adminComponents.module.css';

const CruiseEditForm = ({ cruise, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        river: '',
        cabins: '',
        total_distance: '',
        features: [],
        price_per_person: '', // Теперь одно число
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
                id: cruise.id || '',
                name: cruise.name || '',
                description: cruise.description || '',
                river: cruise.river || '',
                cabins: cruise.cabins || '',
                total_distance: cruise.total_distance || '',
                features: Array.isArray(cruise.features) ? cruise.features : [],
                price_per_person: cruise.price_per_person || '', // Ожидаем число
                cabins_by_class: cruise.cabins_by_class || {
                    luxury: { places: '', image_path: '' },
                    economy: { places: '', image_path: '' },
                    standard: { places: '', image_path: '' },
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedData = {
            ...formData,
            cabins: parseInt(formData.cabins) || 0,
            total_distance: parseFloat(formData.total_distance) || 0,
            price_per_person: parseFloat(formData.price_per_person) || 0, // Отправляем как число
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
        onSave(updatedData);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.inputGroup}>
                <label>Название</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
                <label>Описание</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
                <label>Река</label>
                <input type="text" name="river" value={formData.river} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
                <label>Каюты</label>
                <input type="number" name="cabins" value={formData.cabins} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
                <label>Длительность (км)</label>
                <input type="number" name="total_distance" value={formData.total_distance} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
                <label>Цена за человека (руб.)</label>
                <input
                    type="number"
                    name="price_per_person"
                    value={formData.price_per_person}
                    onChange={handleChange}
                    required
                    step="0.01"
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Путь к изображению</label>
                <input type="text" name="image_path" value={formData.image_path} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
                <label>Особенности</label>
                {formData.features.map((feature, index) => (
                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input
                            type="text"
                            value={feature.name}
                            onChange={(e) => handleFeatureChange(index, 'name', e.target.value)}
                            placeholder="Название"
                        />
                        <input
                            type="number"
                            value={feature.price}
                            onChange={(e) => handleFeatureChange(index, 'price', e.target.value)}
                            placeholder="Цена"
                            step="0.01"
                        />
                        <button type="button" onClick={() => removeFeature(index)} className={styles.deleteButton}>
                            Удалить
                        </button>
                    </div>
                ))}
                <button type="button" onClick={addFeature} className={styles.button}>
                    Добавить особенность
                </button>
            </div>
            <div className={styles.inputGroup}>
                <label>Каюты по классам</label>
                {['luxury', 'economy', 'standard'].map((classType) => (
                    <div key={classType} style={{ marginBottom: '10px' }}>
                        <h4>{classType.charAt(0).toUpperCase() + classType.slice(1)}</h4>
                        <input
                            type="number"
                            name={`cabins_by_class.${classType}.places`}
                            value={formData.cabins_by_class[classType].places}
                            onChange={handleChange}
                            placeholder="Количество мест"
                            required
                        />
                        <input
                            type="text"
                            name={`cabins_by_class.${classType}.image_path`}
                            value={formData.cabins_by_class[classType].image_path}
                            onChange={handleChange}
                            placeholder="Путь к изображению"
                        />
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className={styles.button}>Сохранить</button>
                <button type="button" onClick={onCancel} className={styles.deleteButton}>Отмена</button>
            </div>
        </form>
    );
};

export default CruiseEditForm;