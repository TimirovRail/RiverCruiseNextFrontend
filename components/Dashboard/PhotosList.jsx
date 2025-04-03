import styles from '../../pages/admin/adminComponents.module.css';
import { useState, useEffect } from 'react';

const PhotosList = ({ photos, error, formatDate, onDelete }) => {
    const [imageUrls, setImageUrls] = useState({});

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

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Токен отсутствует');
            return;
        }

        const fetchImages = async () => {
            const urls = {};
            for (const photo of photos) {
                try {
                    const response = await fetch(`http://localhost:8000${photo.url}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (!response.ok) {
                        throw new Error(`Не удалось загрузить изображение: ${photo.url}`);
                    }
                    const blob = await response.blob();
                    const imageUrl = URL.createObjectURL(blob);
                    urls[photo.id] = imageUrl;
                } catch (err) {
                    console.error(err.message);
                    urls[photo.id] = '/images/placeholder.jpg';
                }
            }
            setImageUrls(urls);
        };

        if (photos && photos.length > 0) {
            fetchImages();
        }
    }, [photos]);

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
                                    src={imageUrls[photo.id] || '/images/placeholder.jpg'}
                                    alt={`Фото от ${photo.user_name || 'пользователя'}`}
                                    className={styles.photoImage}
                                />
                                <p><strong>ID:</strong> {photo.id || '—'}</p>
                                <p><strong>Пользователь:</strong> {photo.user_name || '—'}</p>
                                <p><strong>Имя файла:</strong> {getFileNameFromUrl(photo.url)}</p>
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