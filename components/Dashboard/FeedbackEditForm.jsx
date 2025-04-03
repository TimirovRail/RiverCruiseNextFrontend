import { useState, useEffect } from 'react';
import styles from '../../pages/admin/adminComponents.module.css';

const FeedbackEditForm = ({ feedback, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        comment: '',
        rating: '',
    });

    useEffect(() => {
        if (feedback) {
            setFormData({
                id: feedback.id,
                comment: feedback.comment || '',
                rating: feedback.rating || '',
            });
        }
    }, [feedback]);

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
                <label>Комментарий</label>
                <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    className={styles.textareaField}
                    required
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Оценка (1-5)</label>
                <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    className={styles.inputField}
                    min="1"
                    max="5"
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

export default FeedbackEditForm;