import { useRouter } from 'next/router';
import styles from './ServiceDetail.module.css'; 

const ServiceDetail = () => {
    const { query } = useRouter();
    const { id } = query;

    const data = [
        {
            id: 1,
            title: 'Ресторан «Волжские Огни»',
            subtitle: 'Изысканная кухня на борту',
            description:
                'Побалуйте себя блюдами русской и европейской кухни с видом на живописные берега Волги. Шеф-повар использует только свежие ингредиенты.',
            price: 2500,
            img: '../../images/blockrestaurant1.jpg',
        },
        {
            id: 2,
            title: 'Гастрономический фестиваль',
            subtitle: 'Дегустация местных деликатесов',
            description:
                'Попробуйте уникальные блюда из регионов, через которые проходит круиз: вологодское масло, казанский чак-чак и уха по-астрахански.',
            price: 2000,
            img: '../../images/blockrestaurant2.jpg',
        },
        {
            id: 3,
            title: 'Оздоровительный комплекс',
            subtitle: 'Здоровье и отдых',
            description:
                'Финская сауна, кедровая бочка и бассейн помогут расслабиться и восстановить силы во время путешествия.',
            price: 4000,
            img: '../../images/blockrestaurant3.jpg',
        },
        {
            id: 4,
            title: 'Массажный кабинет',
            subtitle: 'Расслабляющий массаж',
            description:
                'Профессиональные массажисты предлагают классический, спортивный и антистрессовый массаж для полного расслабления.',
            price: 2500,
            img: '../../images/blockrestaurant4.jpg',
        },
        {
            id: 5,
            title: 'Развлекательная программа',
            subtitle: 'Шоу и живая музыка',
            description:
                'Вечера на борту наполнены живой музыкой, тематическими вечеринками и выступлениями артистов.',
            price: 1500,
            img: '../../images/blockrestaurant5.jpg',
        },
        {
            id: 6,
            title: 'Кинозал на борту',
            subtitle: 'Просмотр фильмов',
            description:
                'Насладитесь классическими и современными фильмами в уютном кинозале с комфортными креслами.',
            price: 1750,
            img: '../../images/blockrestaurant6.jpg',
        },
    ];

    const service = data.find((item) => item.id === parseInt(id));

    if (!service) {
        return <p>Услуга не найдена.</p>;
    }

    return (
        <div className={styles.serviceDetail}>
            <h1>{service.title}</h1>
            <img src={service.img} alt={service.title} className={styles.serviceImage} />
            <div className={styles.description}>
                <h2>{service.subtitle}</h2>
                <p>{service.description}</p>
                <p><strong>{service.price}</strong> руб.</p>
            </div>
            <button onClick={() => window.history.back()} className={styles.backButton}>
                Назад
            </button>
        </div>
    );
};

export default ServiceDetail;
