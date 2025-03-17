'use client';
import { useState, useEffect } from 'react';
import styles from './BlogGallery.module.css';

export default function PhotoGallery() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [userPhotos, setUserPhotos] = useState([]);
    const [newPhotos, setNewPhotos] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (token && user) {
            setIsAuthenticated(true);
            setUserId(user.id);
        }
    }, []);

    const serviceImages = [
        { src: './images/blog1.jpg', alt: 'Photo 1' },
        { src: './images/blog2.jpg', alt: 'Photo 2' },
        { src: './images/blog3.jpg', alt: 'Photo 3' },
        { src: './images/blog4.jpg', alt: 'Photo 4' },
        { src: './images/blog5.jpg', alt: 'Photo 5' },
        { src: './images/blog6.jpg', alt: 'Photo 6' },
        { src: './images/blog7.jpg', alt: 'Photo 7' },
        { src: './images/blog8.jpg', alt: 'Photo 8' },
        { src: './images/blog9.jpg', alt: 'Photo 9' },
    ];

    const openImage = (src) => {
        setSelectedImage(src);
    };

    const closeImage = () => {
        setSelectedImage(null);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + newPhotos.length <= 5) {
            setNewPhotos([...newPhotos, ...files]);
        } else {
            alert('Максимум 5 фотографий');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            alert('Для загрузки фотографий необходимо авторизоваться');
            return;
        }

        if (!userId || isNaN(userId)) {
            alert('Ошибка: user_id не определен или некорректен');
            return;
        }

        const formData = new FormData();
        newPhotos.forEach((photo) => {
            formData.append('photos[]', photo);
        });
        formData.append('user_id', userId);

        try {
            const response = await fetch('http://localhost:8000/api/upload-photos', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Фотографии успешно загружены:', data);
                setUserPhotos([...userPhotos, ...data.photos]);
                setNewPhotos([]);
            } else {
                console.error('Ошибка при загрузке:', await response.text());
            }
        } catch (error) {
            console.error('Ошибка при загрузке:', error);
        }
    };

    return (
        <div className='layout'>
            <div className='title'>
                <h2 className='h1-title'>ФОТОГАЛЕРЕЯ</h2>
            </div>
            <div className={styles.galleryContainer}>
                <div className={styles.column}>
                    <h3>Фотки из сервиса</h3>
                    <div className={styles.images}>
                        {serviceImages.map((image, index) => (
                            <div
                                key={index}
                                className={styles.imageWrapper}
                                onClick={() => openImage(image.src)}
                            >
                                <img src={image.src} alt={image.alt} className={styles.image} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.column}>
                    <h3>Фотки пользователей</h3>
                    {!isAuthenticated ? (
                        <p>Для загрузки фотографий необходимо <a href="/login">авторизоваться</a>.</p>
                    ) : (
                        <form onSubmit={handleSubmit} className={styles.uploadForm}>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <div className={styles.fileList}>
                                {newPhotos.map((photo, index) => (
                                    <span key={index}>{photo.name}</span>
                                ))}
                            </div>
                            <button type="submit">Загрузить</button>
                        </form>
                    )}
                    <div className={styles.images}>
                        {userPhotos.map((photo, index) => (
                            <div key={index} className={styles.imageWrapper}>
                                <img
                                    src={`http://localhost:8000${photo.url}`} 
                                    alt={photo.name || `User photo ${index}`}
                                    className={styles.image}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedImage && (
                <div className={styles.modal} onClick={closeImage}>
                    <div className={styles.modalContent}>
                        <img src={selectedImage} alt="Selected" className={styles.modalImage} />
                    </div>
                </div>
            )}
        </div>
    );
}