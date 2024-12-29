'use client';

import React from 'react';
import styles from './CruiseCards.module.css';

const CruiseCards = () => {
    const cruisePoints = [
        { name: 'Круиз по реке Волга', image: './images/cruiselistvolga.jpg', description: 'Этот круиз по реке Волга дарит уникальную возможность насладиться красивыми видами природы, историческими памятниками и культовыми местами.' },
        { name: 'Круиз по реке Лена', image: './images/cruiselistlena.jpg', description: 'Путешествие по реке Лена – это настоящее приключение среди природных ландшафтов, снежных вершин и вечных лесов.' },
        { name: 'Круиз по реке Енисей', image: './images/cruiselistenisey.jpg', description: 'Енисей открывает двери в мир тайги, уникальной флоры и фауны, а также захватывающих пейзажей Сибири.' },
        { name: 'Круиз по реке Амур', image: './images/cruiselistamur.jpg', description: 'Этот круиз позволит насладиться величием Амура, исследовать незабываемые виды на его побережье и встретить диких животных.' },
        { name: 'Круиз по реке Дон', image: './images/cruiselistdon.jpg', description: 'Дон влечет путешественников своим историческим значением и традиционным культурным наследием.' },
        { name: 'Круиз по реке Обь', image: './images/cruiselistob.jpg', description: 'Река Обь предоставит вам возможность увидеть истинную красоту Сибири и исследовать нетронутые уголки природы.' },
    ];

    return (
        <div className='layout'>
            <div className='title'>
                <h2 className='h1-title'>ВСЕ КРУИЗЫ</h2>
            </div>
            <div className={styles.card_container}>
                {cruisePoints.map((point, index) => (
                    <div key={index} className={styles.card}>
                        <div className={styles.meta}>
                            <div className={styles.photo} style={{ backgroundImage: `url(${point.image})` }}></div>
                        </div>
                        <div className={styles.description}>
                            <h1>{point.name}</h1>
                            <p>{point.description}</p>
                            <p className={styles.readMore}>
                                <a href="#">Читать больше</a>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CruiseCards;
