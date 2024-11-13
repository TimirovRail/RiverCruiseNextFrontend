// CruisesList.jsx

import React from 'react';
import './CruisesList.css';
import cruises from './CruisesListData';

const CruisesList = () => {
    return (
        <div className="container">
            <h2 className="h1-title">Список круизов</h2>
            <div className="cards-wrapper">
                {cruises.map((cruise) => (
                    <div key={cruise.id} className="card">
                        <div className="info">
                            <h3 className="cruise-title">{cruise.title}</h3>
                            <p className="detail"><strong>Дата:</strong> {cruise.date}</p>
                            <p className="detail"><strong>Стоимость:</strong> {cruise.price}</p>
                            <p className="detail"><strong>Продолжительность:</strong> {cruise.duration}</p>
                        </div>
                        <button className="buy-button">Купить билет</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CruisesList;
