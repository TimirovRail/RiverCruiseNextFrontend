'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import './CruisesList.css';

const CruisesList = () => {
    const router = useRouter();

    const cruises = [
        {
            slug: 'volga',
            title: 'Круиз по реке Волга',
            excerpt: 'Уникальное путешествие по живописным берегам реки Волга, с остановками в исторических городах. Природные красоты и богатая культура региона делают это путешествие незабываемым.',
            img: './images/cruiselistvolga.jpg',
            type: 'Исторический маршрут',
        },
        {
            slug: 'lena',
            title: 'Круиз по реке Лена',
            excerpt: 'Прекрасное путешествие по одному из самых красивых и диких уголков России. Здесь вы встретите нетронутую природу, уникальные виды и получите незабываемые впечатления от встречи с местными жителями.',
            img: './images/cruiselistlena.jpg',
            type: 'Дикая природа',
        },
        {
            slug: 'enisey',
            title: 'Круиз по реке Енисей',
            excerpt: 'Путешествие по сибирской реке Енисей, среди величественных гор и древних поселений. Здесь вы сможете увидеть потрясающие природные пейзажи и узнать больше о жизни на реке в этом регионе.',
            img: './images/cruiselistenisey.jpg',
            type: 'Сибирская экспедиция',
        },
        {
            slug: 'amur',
            title: 'Круиз по реке Амур',
            excerpt: 'Путешествие по одной из самых красивых рек Восточной Сибири с потрясающими природными пейзажами. На протяжении маршрута можно насладиться видами уникальной флоры и фауны, а также исследовать местные традиции и культуру.',
            img: './images/cruiselistamur.jpg',
            type: 'Природный тур',
        },
        {
            slug: 'ob',
            title: 'Круиз по реке Обь',
            excerpt: 'Исследование природы Сибири с остановками в небольших деревнях и древних городах. Узнайте больше о культуре и традициях этих мест, наслаждайтесь уникальными природными пейзажами и отдыхайте на берегу величественной реки.',
            img: './images/cruiselistob.jpg',
            type: 'Культурное путешествие',
        },
        {
            slug: 'don',
            title: 'Круиз по реке Дон',
            excerpt: 'Путешествие по спокойной реке Дон с уникальной флорой и фауной. Этот маршрут привлекает путешественников, желающих насладиться природой и тишиной, а также исследовать старинные крепости и деревни вдоль реки.',
            img: './images/cruiselistdon.jpg',
            type: 'Спокойный отдых',
        },
    ];

    const handleCardClick = (slug) => {
        router.push(`/Cruises`);
    };

    return (
        <div id="cruises-list" className="layout">
            <div className="title">
                <h2 className="h1-title">ПОПУЛЯРНЫЕ МАРШРУТЫ</h2>
            </div>
            <section className="cards">
                {cruises.map((cruise, index) => (
                    <article
                        key={cruise.slug}
                        className={`${index === 0 || index === 4 ? 'horizontal' : 'vertical'} card`}
                        onClick={() => handleCardClick(cruises)}
                        style={{ cursor: 'pointer' }}
                    >
                        <img className="card__img" src={cruise.img} alt={cruise.title} />
                        <div className="card__content">
                            <div className="card__type">{cruise.type}</div>
                            <div className="card__title">{cruise.title}</div>
                            <div className="card__excerpt">{cruise.excerpt}</div>
                        </div>
                    </article>
                ))}
            </section>
        </div>
    );
};

export default CruisesList;