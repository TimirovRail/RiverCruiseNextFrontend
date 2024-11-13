'use client';

import React from 'react';
import './MainScreen.css';

const MainScreen = () => {
    return (
        <div className="main-screen">
            <div className="text-content">
                <h1>Круиз по рекам России</h1>
                <p>
                    Откройте для себя незабываемое путешествие по самым красивым и живописным рекам России.
                    Насладитесь прекрасными видами, роскошным отдыхом на борту, а также уникальной культурой каждого региона.
                </p>
                <button className="booking-button">Забронировать билет</button>
            </div>
        </div>
    );
};

export default MainScreen;
