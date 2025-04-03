import { useState, useEffect } from 'react';
import styles from '../../pages/admin/adminComponents.module.css';

const CruiseEditForm = ({ cruise, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        river: '',
        cabins: '',
        total_duration: '',
        features: '',
        price_per_person: '',
    });

    useEffect(() => {
        if (cruise) {
            setFormData({
                id: cruise.id,
                name: cruise.name || '',
                description: cruise.description || '',
                river: cruise.river || '',
                cabins: cruise.cabins || '',
                total_duration: cruise.total_duration || '',
                features: cruise.features || '',
                price_per_person: cruise.price_per_person || '',
            });
        }
    }, [cruise]);

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
            <div className={styles.inputGroup}>
                <label>Название</label>
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
                <label>Описание</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={styles.textareaField}
                    required
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Река</label>
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
                <label>Каюты</label>
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
                <label>Длительность (дней)</label>
                <input
                    type="number"
                    name="total_duration"
                    value={formData.total_duration}
                    onChange={handleChange}
                    className={styles.inputField}
                    required
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Особенности</label>
                <input
                    type="text"
                    name="features"
                    value={formData.features}
                    onChange={handleChange}
                    className={styles.inputField}
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Цена за человека (руб.)</label>
                <input
                    type="number"
                    name="price_per_person"
                    value={formData.price_per_person}
                    onChange={handleChange}
                    className={styles.inputField}
                    required
                />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className={styles.button}>Сохранить</button>
                <button type="button" onClick={onCancel} className={styles.deleteButton}>Отмена</button>
            </div>
        </form>
    );
};

export default CruiseEditForm;