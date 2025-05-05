import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from './ServiceDetail.module.css';
import Loading from "@/components/Loading/Loading";
import Header from '@/components/Header/Header';
import Link from 'next/link';
import { API_BASE_URL } from '../../src/config';

const ServiceDetail = () => {
    const router = useRouter();
    const { id } = router.query;
    const [service, setService] = useState(null);
    const [relatedServices, setRelatedServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            // Загрузка данных текущей услуги
            fetch(`${API_BASE_URL}/api/services/${id}`)
                .then((response) => response.json())
                .then((data) => {
                    setService(data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Ошибка загрузки услуги:', error);
                    setLoading(false);
                });

            // Загрузка похожих услуг
            fetch(`${API_BASE_URL}/api/services`)
                .then((response) => response.json())
                .then((data) => {
                    const filteredServices = data
                        .filter((item) => item.id !== parseInt(id))
                        .slice(0, 3); // Берем максимум 3 услуги, исключая текущую
                    setRelatedServices(filteredServices);
                })
                .catch((error) => {
                    console.error('Ошибка загрузки похожих услуг:', error);
                });
        }
    }, [id]);

    const handleShare = () => {
        const shareUrl = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: service.title,
                text: `Посмотрите услугу: ${service.title}`,
                url: shareUrl,
            });
        } else {
            navigator.clipboard.writeText(shareUrl);
            alert('Ссылка скопирована в буфер обмена!');
        }
    };

    if (loading) return <Loading />;
    if (!service) return <p>Услуга не найдена.</p>;

    return (
        <div className='layout'>
            <Header />
            <div className={styles.serviceDetail}>
                <div className={styles.content}>
                    <img src={service.img} alt={service.title} className={styles.serviceImage} />
                    <div className={styles.info}>
                        <h1 className={styles.fadeIn}>{service.title}</h1>
                        <h2 className={styles.fadeIn}>{service.subtitle}</h2>
                        <p className={styles.fadeIn}>{service.description}</p>
                        <p className={styles.fadeIn}>
                            <span className={styles.priceIcon}>Цена:</span>
                            <strong>{service.price}</strong> руб.
                        </p>
                        <div className={styles.buttonGroup}>
                            <button onClick={() => router.back()} className={styles.backButton}>
                                Назад
                            </button>
                            <button onClick={handleShare} className={styles.shareButton}>
                                Поделиться
                            </button>
                        </div>
                    </div>
                </div>

                {/* Раздел с похожими услугами */}
                {relatedServices.length > 0 && (
                    <div className={styles.relatedServices}>
                        <h2>Похожие услуги</h2>
                        <div className={styles.relatedGrid}>
                            {relatedServices.map((item) => (
                                <div key={item.id} className={styles.relatedCard}>
                                    <img src={item.img} alt={item.title} className={styles.relatedImage} />
                                    <h3>{item.title}</h3>
                                    <p>{item.price} руб.</p>
                                    <Link href={`/service/${item.id}`} passHref>
                                        <button className={styles.relatedButton}>Подробнее</button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceDetail;