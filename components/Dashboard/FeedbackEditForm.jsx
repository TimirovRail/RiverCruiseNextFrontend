import { useState } from 'react';
import styles from '../../pages/admin/dashboard.css';

const FeedbackEditForm = ({ feedback, onSave, onCancel }) => {
    const [formData, setFormData] = useState(feedback);

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
                <p>Пользователь ID</p>
                <input
                    type="number"
                    name="user_id"
                    value={formData.user_id || ''}
                    onChange={handleChange}
                    className={styles.inputField}
                />
            </div>
            <div className={styles.inputGroup}>
                <p>Круиз ID</p>
                <input
                    type="number"
                    name="cruise_id"
                    value={formData.cruise_id || ''}
                    onChange={handleChange}
                    className={styles.inputField}
                />
            </div>
            <div className={styles.inputGroup}>
                <p>Имя</p>
                <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className={styles.inputField}
                />
            </div>
            <div className={styles.inputGroup}>
                <p>Email</p>
                <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className={styles.inputField}
                />
            </div>
            <div className={styles.inputGroup}>
                <p>Отзыв</p>
                <textarea
                    name="feedback"
                    value={formData.feedback || ''}
                    onChange={handleChange}
                    className={styles.textareaField}
                ></textarea>
            </div>
            <button type="submit" className={styles.button}>Сохранить</button>
            <button type="button" onClick={onCancel} className={styles.button}>Отмена</button>
        </form>
    );
};

export default FeedbackEditForm;