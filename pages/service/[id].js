import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from './ServiceDetail.module.css';

const ServiceDetail = () => {
    const router = useRouter();
    const { id } = router.query;
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetch(`http://127.0.0.1:8000/api/services/${id}`)
                .then((response) => response.json())
                .then((data) => {
                    setService(data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Ошибка загрузки услуги:', error);
                    setLoading(false);
                });
        }
    }, [id]);

    if (loading) return <p>Загрузка...</p>;
    if (!service) return <p>Услуга не найдена.</p>;

    return (
        <div className='layout'>
            <div className={styles.serviceDetail}>
                <div className={styles.content}>
                    <img src={service.img} alt={service.title} className={styles.serviceImage} />
                    <div className={styles.info}>
                        <h1>{service.title}</h1>
                        <h2>{service.subtitle}</h2>
                        <p>{service.description}</p>
                        <p><strong>{service.price}</strong> руб.</p>
                        <button onClick={() => router.back()} className={styles.backButton}>
                            Назад
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetail;
