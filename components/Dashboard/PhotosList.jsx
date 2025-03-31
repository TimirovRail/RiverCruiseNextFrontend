import styles from '../../pages/admin/dashboard.css';

const PhotosList = ({ photos, error, formatDate, onDelete }) => {
    return (
        <>
            {error ? (
                <p>{error}</p>
            ) : (
                <div className={styles.photosGrid}>
                    {Array.isArray(photos) && photos.length > 0 ? (
                        photos.map((photo) => (
                            <div key={photo.id} className={styles.photoCard}>
                                <img
                                    src={`http://localhost:8000${photo.url}`}
                                    alt={photo.name || `Фото ${photo.user_id || '—'}`}
                                    className={styles.photoImage}
                                />
                                <p><strong>ID:</strong> {photo.id || '—'}</p>
                                <p><strong>Пользователь ID:</strong> {photo.user_id || '—'}</p>
                                <p><strong>Название:</strong> {photo.name || '—'}</p>
                                <p><strong>Создано:</strong> {formatDate(photo.created_at)}</p>
                                <p><strong>Обновлено:</strong> {formatDate(photo.updated_at)}</p>
                                <div className={styles.photoActions}>
                                    <button onClick={() => onDelete(photo.id)}>Удалить</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Фотографии отсутствуют</p>
                    )}
                </div>
            )}
        </>
    );
};

export default PhotosList;