'use client';

import { useState } from 'react';
import styles from './BlogGallery.module.css';

export default function PhotoGallery() {
    const [selectedImage, setSelectedImage] = useState(null);

    const images = [
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

    return (
        <div className='layout'>
            <div className='title'>
                <h2 className='h1-title'>ФОТОГАЛЕРЕЯ</h2>
            </div>
            <div className={styles.gallery}>
                <div className={styles.images}>
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className={styles.imageWrapper}
                            onClick={() => openImage(image.src)}
                        >
                            <img src={image.src} alt={image.alt} className={styles.image} />
                        </div>
                    ))}
                </div>

                {selectedImage && (
                    <div className={styles.modal} onClick={closeImage}>
                        <div className={styles.modalContent}>
                            <img src={selectedImage} alt="Selected" className={styles.modalImage} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
