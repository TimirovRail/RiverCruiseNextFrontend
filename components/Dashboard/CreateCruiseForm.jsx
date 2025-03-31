import { useState } from 'react';
import styles from '../../pages/admin/dashboard.css';

const CreateCruiseForm = ({ onSubmit, initialData = {} }) => {
    const [newCruise, setNewCruise] = useState({
        name: '',
        description: '',
        river: '',
        cabins: 0,
        total_duration: '',
        features: '',
        images: '',
        price_per_person: 0,
        ...initialData,
    });
    const [formErrors, setFormErrors] = useState({});

    const validateForm = () => {
        const errors = {};
        if (!newCruise.name.trim()) errors.name = 'Название круиза обязательно';
        if (!newCruise.river.trim()) errors.river = 'Название реки обязательно';
        if (newCruise.cabins <= 0) errors.cabins = 'Количество кают должно быть больше 0';
        if (newCruise.price_per_person < 0) errors.price_per_person = 'Цена не может быть отрицательной';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(newCruise);
            setNewCruise({
                name: '',
                description: '',
                river: '',
                cabins: 0,
                total_duration: '',
                features: '',
                images: '',
                price_per_person: 0,
            });
            setFormErrors({});
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.inputGroup}>
                <p>Название круиза</p>
                <input
                    type="text"
                    value={newCruise.name}
                    onChange={(e) => setNewCruise({ ...newCruise, name: e.target.value })}
                    className={styles.inputField}
                />
                {formErrors.name && <p className={styles.error}>{formErrors.name}</p>}
            </div>
            <div className={styles.inputGroup}>
                <p>Описание круиза</p>
                <textarea
                    value={newCruise.description}
                    onChange={(e) => setNewCruise({ ...newCruise, description: e.target.value })}
                    className={styles.textareaField}
                ></textarea>
            </div>
            <div className={styles.inputGroup}>
                <p>Название реки</p>
                <input
                    type="text"
                    value={newCruise.river}
                    onChange={(e) => setNewCruise({ ...newCruise, river: e.target.value })}
                    className={styles.inputField}
                />
                {formErrors.river && <p className={styles.error}>{formErrors.river}</p>}
            </div>
            <div className={styles.inputGroup}>
                <p>Количество кают</p>
                <input
                    type="number"
                    value={newCruise.cabins}
                    onChange={(e) => setNewCruise({ ...newCruise, cabins: Number(e.target.value) })}
                    className={styles.inputField}
                />
                {formErrors.cabins && <p className={styles.error}>{formErrors.cabins}</p>}
            </div>
            <div className={styles.inputGroup}>
                <p>Длительность (например, "5 дней")</p>
                <input
                    type="text"
                    value={newCruise.total_duration}
                    onChange={(e) => setNewCruise({ ...newCruise, total_duration: e.target.value })}
                    className={styles.inputField}
                />
            </div>
            <div className={styles.inputGroup}>
                <p>Особенности</p>
                <textarea
                    value={newCruise.features}
                    onChange={(e) => setNewCruise({ ...newCruise, features: e.target.value })}
                    className={styles.textareaField}
                ></textarea>
            </div>
            <div className={styles.inputGroup}>
                <p>Изображения (URL)</p>
                <input
                    type="text"
                    value={newCruise.images}
                    onChange={(e) => setNewCruise({ ...newCruise, images: e.target.value })}
                    className={styles.inputField}
                />
            </div>
            <div className={styles.inputGroup}>
                <p>Цена за человека</p>
                <input
                    type="number"
                    value={newCruise.price_per_person}
                    onChange={(e) => setNewCruise({ ...newCruise, price_per_person: Number(e.target.value) })}
                    className={styles.inputField}
                />
                {formErrors.price_per_person && <p className={styles.error}>{formErrors.price_per_person}</p>}
            </div>
            <button type="submit" className={styles.button}>Добавить круиз</button>
        </form>
    );
};

export default CreateCruiseForm;