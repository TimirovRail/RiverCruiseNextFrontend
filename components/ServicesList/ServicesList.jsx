import React from'react';
import './ServicesList.css';

const ServicesList = () => {
    return (
        <div className="layout">
            <div className='title'>
                <h2 className='h1-title'>СЕРВИСЫ НА БОРТУ</h2>
            </div>
            <div className="services-list">
                <div>
                    <img className='services-img' src="./images/recovery.jpg" alt="" />
                    <h2 className='services-text'>Оздоровление</h2>
                    <p className='services-description'>Массаж, spa, фитнес, йога</p>
                </div>
                <div>
                    <img className='services-img' src="./images/restaurant.jpg" alt="" />
                    <h2 className='services-text'>Рестораны</h2>
                    <p className='services-description'>Блюда русской и европейской кухни</p>
                </div>
                <div>
                    <img className='services-img' src="./images/entertainment.jpg" alt="" />
                    <h2 className='services-text'>Развлечение</h2>
                    <p className='services-description'>Музыканты, мастер-классы</p>
                </div>
            </div>
        </div>
    );
};

export default ServicesList;
