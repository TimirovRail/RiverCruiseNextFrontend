import { useState } from 'react'; // Добавляем useState для управления сортировкой
import styles from '../../pages/admin/adminComponents.module.css';
import { API_BASE_URL } from '../../src/config';

const PhotosList = ({ photos, error, formatDate, onDelete }) => {
    // Состояние для сортировки
    const [sort, setSort] = useState({ field: 'created_at', order: 'desc' });

    const safeFormatDate = (datetime) => {
        if (typeof formatDate === 'function') {
            return formatDate(datetime);
        }
        return datetime ? new Date(datetime).toLocaleDateString('ru-RU') : '—';
    };

    const getFileNameFromUrl = (url) => {
        if (!url) return '—';
        const parts = url.split('/');
        return parts[parts.length - 1] || '—';
    };

    // Функция сортировки фотографий
    const sortPhotos = (photos) => {
        return [...photos].sort((a, b) => {
            let fieldA, fieldB;

            // Определяем поля для сортировки
            if (sort.field === 'created_at') {
                fieldA = new Date(a.created_at).getTime();
                fieldB = new Date(b.created_at).getTime();
            } else if (sort.field === 'user_name') {
                fieldA = a.user_name || '';
                fieldB = b.user_name || '';
            } else if (sort.field === 'name') {
                fieldA = a.name || getFileNameFromUrl(a.url);
                fieldB = b.name || getFileNameFromUrl(b.url);
            }

            if (sort.order === 'asc') {
                return fieldA > fieldB ? 1 : -1;
            } else {
                return fieldA < fieldB ? 1 : -1;
            }
        });
    };

    // Обработчик изменения сортировки
    const handleSortChange = (e) => {
        const [field, order] = e.target.value.split('-');
        setSort({ field, order });
    };

    // Отсортированные фотографии
    const sortedPhotos = sortPhotos(photos);

    return (
        <div className={styles.componentContainer}>
            {error ? (
                <p className={styles.errorMessage}>{error}</p>
            ) : (
                <div>
                    <div className={styles.sortWrapper}>
                        <label>Сортировать по: </label>
                        <select onChange={handleSortChange} value={`${sort.field}-${sort.order}`}>
                            <option value="created_at-desc">Дате создания (сначала новые)</option>
                            <option value="created_at-asc">Дате создания (сначала старые)</option>
                            <option value="user_name-asc">Пользователю (А-Я)</option>
                            <option value="user_name-desc">Пользователю (Я-А)</option>
                            <option value="name-asc">Имени файла (А-Я)</option>
                            <option value="name-desc">Имени файла (Я-А)</option>
                        </select>
                    </div>
                    <div className={styles.photosGrid}>
                        {Array.isArray(sortedPhotos) && sortedPhotos.length > 0 ? (
                            sortedPhotos.map((photo) => (
                                <div key={photo.id} className={styles.photoCard}>
                                    <img
                                        src={`${API_BASE_URL}${photo.url}`}
                                        alt={`Фото от ${photo.user_name || 'пользователя'}`}
                                        className={styles.photoImage}
                                        onError={(e) => {
                                            console.error(`Не удалось загрузить изображение: ${API_BASE_URL}${photo.url}`);
                                            e.target.src = '/images/placeholder.jpg';
                                        }}
                                    />
                                    <p><strong>ID:</strong> {photo.id || '—'}</p>
                                    <p><strong>Пользователь:</strong> {photo.user_name || '—'}</p>
                                    <p><strong>Имя файла:</strong> {photo.name || getFileNameFromUrl(photo.url)}</p>
                                    <p><strong>Создано:</strong> {safeFormatDate(photo.created_at)}</p>
                                    <p><strong>Обновлено:</strong> {safeFormatDate(photo.updated_at)}</p>
                                    <div className={styles.photoActions}>
                                        <button onClick={() => onDelete(photo.id)} className={styles.deleteButton}>
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={styles.errorMessage}>Фотографии отсутствуют</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotosList;