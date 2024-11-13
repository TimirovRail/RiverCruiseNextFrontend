'use client'; 
import React from 'react';
import './CabinsList.css';
import cabins from './CabinsListData';
import { useRouter } from 'next/navigation';

const CabinsList = () => {
    const router = useRouter();

    return (
        <div className="cabin-container">
            <h2 className="h1-title">Выбор кают</h2>
            <div className="cabin-cards-wrapper">
                {cabins.map((cabin) => (
                    <div key={cabin.id} className="cabin-card">
                        <div className="cabin-info">
                            <h3 className="cabin-name">{cabin.title}</h3>
                        </div>
                        <button 
                            className="view-button" 
                            onClick={() => router.push(`/cabin-view/${cabin.id}`)}  // Правильный путь
                        >
                            360° Просмотр каюты
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CabinsList;
