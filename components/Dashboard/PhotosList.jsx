import styles from '../../pages/admin/adminComponents.module.css';

const PhotosList = ({ photos, error, formatDate, onDelete }) => {
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

    return (
        <div className={styles.componentContainer}>
            {error ? (
                <p className={styles.errorMessage}>{error}</p>
            ) : (
                <div className={styles.photosGrid}>
                    {Array.isArray(photos) && photos.length > 0 ? (
                        photos.map((photo) => (
                            <div key={photo.id} className={styles.photoCard}>
                                <img
                                    src={`http://localhost:8000${photo.url}`}
                                    alt={`Фото от ${photo.user_name || 'пользователя'}`}
                                    className={styles.photoImage}
                                    onError={(e) => {
                                        console.error(`Не удалось загрузить изображение: http://localhost:8000${photo.url}`);
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
            )}
        </div>
    );
};

export default PhotosList;