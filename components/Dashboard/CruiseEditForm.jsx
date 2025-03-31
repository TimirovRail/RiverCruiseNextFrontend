import { useState } from 'react';
import styles from '../../pages/admin/dashboard.css';

const CruiseEditForm = ({ cruise, onSave, onCancel }) => {
    const [formData, setFormData] = useState(cruise);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
                <p>Название круиза</p>
                <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className={styles.inputField}
                />
            </div>
            <div className={styles.inputGroup}>
                <p>Описание круиза</p>
                <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    className={styles.textareaField}
                ></textarea>
            </div>
            <div className={styles.inputGroup}>
                <p>Река</p>
                <input
                    type="text"
                    name="river"
                    value={formData.river || ''}
                    onChange={handleChange}
                    className={styles.inputField}
                />
            </div>
            <div className={styles.inputGroup}>
                <p>Количество кают</p>
                <input
                    type="number"
                    name="cabins"
                    value={formData.cabins || 0}
                    onChange={handleChange}
                    className={styles.inputField}
                />
            </div>
            <div className={styles.inputGroup}>
                <p>Длительность (например, "5 дней")</p>
                <input
                    type="text"
                    name="total_duration"
                    value={formData.total_duration || ''}
                    onChange={handleChange}
                    className={styles.inputField}
                />
            </div>
            <div className={styles.inputGroup}>
                <p>Особенности</p>
                <textarea
                    name="features"
                    value={formData.features || ''}
                    onChange={handleChange}
                    className={styles.textareaField}
                ></textarea>
            </div>
            <div className={styles.inputGroup}>
                <p>Изображения (URL)</p>
                <input
                    type="text"
                    name="images"
                    value={formData.images || ''}
                    onChange={handleChange}
                    className={styles.inputField}
                />
            </div>
            <div className={styles.inputGroup}>
                <p>Цена за человека</p>
                <input
                    type="number"
                    name="price_per_person"
                    value={formData.price_per_person || 0}
                    onChange={handleChange}
                    className={styles.inputField}
                />
            </div>
            <button type="submit" className={styles.button}>Сохранить</button>
            <button type="button" onClick={onCancel} className={styles.button}>Отмена</button>
        </form>
    );
};

export default CruiseEditForm;