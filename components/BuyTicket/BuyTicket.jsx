'use client'; 

import React from 'react';
import { useRouter } from 'next/navigation'; 
import './BuyTicket.css';

const BuyTicket = () => {
    const router = useRouter();

    const handleBuyTicket = () => {
        router.push('/BuyTicket');
    };

    return (
        <div>
            <div className='title'>
                <h2 className='h1-title'>ПОКУПКА БИЛЕТА</h2>
            </div>
            <div className='ticket-block'>
                <p className='ticket-text'>
                    Выберите маршрут, заполните данные, оплатите онлайн, и ваш билет готов. Отправляйтесь в незабываемое путешествие по рекам России!
                </p>
                <button className='ticket-btn' onClick={handleBuyTicket}>
                    Купить билет
                </button>
            </div>
        </div>
    );
};

export default BuyTicket;