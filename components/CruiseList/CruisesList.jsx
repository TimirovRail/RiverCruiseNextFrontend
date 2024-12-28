import React from 'react';
import './CruisesList.css';

const CruisesList = () => {
    return (
        <div className="layout">
            <div className='title'>
                <h2 className='h1-title'>ПОПУЛЯРНЫЕ МАРШРУТЫ</h2>
            </div>
            <section className="cards">
                <article className="horizontal card">
                    <img className="card__img" src="./images/cruiselistvolga.jpg" alt="Cruise" />
                    <div className="card__content">
                        <div className="card__type">Популярное</div>
                        <div className="card__title">Круиз по реке Волга</div>
                        <div className="card__date">Продолжительность круиза: 14 марта 2024 · 5 дней</div>
                        <div className="card__excerpt">
                            Уникальное путешествие по живописным берегам реки Волга, с остановками в исторических городах. Природные красоты и богатая культура региона делают это путешествие незабываемым. 
                        </div>
                    </div>
                </article>

                <article className="vertical card">
                    <img className="card__img" src="./images/cruiselistlena.jpg" alt="Cruise" />
                    <div className="card__content">
                        <div className="card__type">Популярное</div>
                        <div className="card__title">Круиз по реке Лена</div>
                        <div className="card__date">Продолжительность круиза: 16 апреля 2024 · 7 дней</div>
                        <div className="card__excerpt">
                            Прекрасное путешествие по одному из самых красивых и диких уголков России. Здесь вы встретите нетронутую природу, уникальные виды и получите незабываемые впечатления от встречи с местными жителями.
                        </div>
                    </div>
                </article>

                <article className="vertical card">
                    <img className="card__img" src="./images/cruiselistenisey.jpg" alt="Cruise" />
                    <div className="card__content">
                        <div className="card__type">Популярное</div>
                        <div className="card__title">Круиз по реке Енисей</div>
                        <div className="card__date">Продолжительность круиза: 5 мая 2024 · 6 дней</div>
                        <div className="card__excerpt">
                            Путешествие по сибирской реке Енисей, среди величественных гор и древних поселений. Здесь вы сможете увидеть потрясающие природные пейзажи и узнать больше о жизни на реке в этом регионе.
                        </div>
                    </div>
                </article>

                <article className="vertical card">
                    <img className="card__img" src="./images/cruiselistamur.jpg" alt="Cruise" />
                    <div className="card__content">
                        <div className="card__type">Популярное</div>
                        <div className="card__title">Круиз по реке Амур</div>
                        <div className="card__date">Продолжительность круиза: 20 июня 2024 · 8 дней</div>
                        <div className="card__excerpt">
                            Путешествие по одной из самых красивых рек Восточной Сибири с потрясающими природными пейзажами. На протяжении маршрута можно насладиться видами уникальной флоры и фауны, а также исследовать местные традиции и культуру.
                        </div>
                    </div>
                </article>

                <article className="horizontal card">
                    <img className="card__img" src="./images/cruiselistob.jpg" alt="Cruise" />
                    <div className="card__content">
                        <div className="card__type">Популярное</div>
                        <div className="card__title">Круиз по реке Обь</div>
                        <div className="card__date">Продолжительность круиза: 12 июля 2024 · 9 дней</div>
                        <div className="card__excerpt">
                            Исследование природы Сибири с остановками в небольших деревнях и древних городах. Узнайте больше о культуре и традициях этих мест, наслаждайтесь уникальными природными пейзажами и отдыхайте на берегу величественной реки.
                        </div>
                    </div>
                </article>

                <article className="vertical card">
                    <img className="card__img" src="./images/cruiselistdon.jpg" alt="Cruise" />
                    <div className="card__content">
                        <div className="card__type">Популярное</div>
                        <div className="card__title">Круиз по реке Дон</div>
                        <div className="card__date">Продолжительность круиза: 30 августа 2024 · 6 дней</div>
                        <div className="card__excerpt">
                            Путешествие по спокойной реке Дон с уникальной флорой и фауной. Этот маршрут привлекает путешественников, желающих насладиться природой и тишиной, а также исследовать старинные крепости и деревни вдоль реки.
                        </div>
                    </div>
                </article>

            </section>
        </div>
    );
};

export default CruisesList;
