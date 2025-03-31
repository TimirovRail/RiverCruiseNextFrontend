'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './BlogGallery.module.css';

export default function PhotoGallery() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [userPhotos, setUserPhotos] = useState([]);
    const [newPhotos, setNewPhotos] = useState([]);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

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

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (token && user) {
            setIsAuthenticated(true);
            setUserId(user.id);
            setUserName(user.name);
            fetchUserPhotos(user.id);
        } else {
            setIsLoading(false);
            router.push('/login');
        }
    }, [router]);

    const fetchUserPhotos = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8000/api/user/photos/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error('Ошибка загрузки фотографий пользователя');
            const data = await res.json();
            setUserPhotos(data.photos || []);
            console.log('Загруженные фотографии:', data.photos);
        } catch (error) {
            console.error('Ошибка:', error);
        } finally {
            setIsLoading(false);
        }
    };

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
            router.push('/login');
            return;
        }

        if (!userId || isNaN(userId)) {
            alert('Ошибка: user_id не определен или некорректен');
            return;
        }

        const token = localStorage.getItem('token');
        const formData = new FormData();
        newPhotos.forEach((photo) => {
            formData.append('photos[]', photo);
        });
        formData.append('user_id', userId);

        for (let pair of formData.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }

        try {
            const response = await fetch('http://localhost:8000/api/auth/upload-photos', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Фотографии успешно загружены:', data);
                setUserPhotos([...userPhotos, ...data.photos]);
                setNewPhotos([]);
                fetchUserPhotos(userId);
            } else {
                const errorData = await response.json();
                console.error('Ошибка при загрузке:', errorData);
                alert(`Ошибка: ${errorData.error || 'Неизвестная ошибка'}`);
            }
        } catch (error) {
            console.error('Ошибка при загрузке:', error);
            alert('Произошла ошибка при загрузке фотографий.');
        }
    };

    return (
        <div className='layout'>
            <div className='title'>
                <h2 className='h1-title'>ФОТОГАЛЕРЕЯ</h2>
            </div>
            {isLoading ? (
                <p>Загрузка...</p>
            ) : (
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
                            <>
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
                                {userPhotos.length > 0 ? (
                                    <div>
                                        <p>
                                            {userName || 'Пользователь'} оставил {userPhotos.length} фотографий
                                        </p>
                                        <div className={styles.images}>
                                            {userPhotos.map((photo, index) => {
                                                const imageUrl = `http://localhost:8000${photo.url}`;
                                                console.log(`Попытка загрузить изображение: ${imageUrl}`);
                                                return (
                                                    <div
                                                        key={index}
                                                        className={styles.imageWrapper}
                                                        onClick={() => openImage(imageUrl)}
                                                    >
                                                        <img
                                                            src={imageUrl}
                                                            alt={photo.name || `User photo ${index}`}
                                                            className={styles.image}
                                                            onError={() => console.error(`Не удалось загрузить изображение: ${imageUrl}`)}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <p>Вы ещё не загрузили фотографии.</p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

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