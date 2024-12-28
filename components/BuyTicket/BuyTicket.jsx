import React from 'react';
import './BuyTicket.css';

const BuyTicket = () => {
    return (
        <div>
            <div className='title'>
                <h2 className='h1-title'>ПОКУПКА БИЛЕТА</h2>
            </div>
            <div className='ticket-block'>
                <p className='ticket-text'>Выберите маршрут, заполните данные, оплатите онлайн, и ваш билет готов. Отправляйтесь в незабываемое путешествие по рекам России!</p>
                <button className='ticket-btn'>Купить билет</button>
                
            </div>

        </div>
    );
};

export default BuyTicket;