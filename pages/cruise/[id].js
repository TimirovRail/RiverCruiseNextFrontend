import { useRouter } from 'next/router';
import React from 'react';
import styles from './CruiseDetail.module.css';

const CruiseDetail = () => {
    const { query } = useRouter();
    const { id } = query;

    const cruisePoints = [
        { id: 1, name: 'Круиз по реке Волга', image: '../../images/cruiselistvolga.jpg', description: 'Этот круиз по реке Волга дарит уникальную возможность насладиться красивыми видами природы, историческими памятниками и культовыми местами.' },
        { id: 2, name: 'Круиз по реке Лена', image: '../../images/cruiselistlena.jpg', description: 'Путешествие по реке Лена – это настоящее приключение среди природных ландшафтов, снежных вершин и вечных лесов.' },
        { id: 3, name: 'Круиз по реке Енисей', image: '../../images/cruiselistenisey.jpg', description: 'Енисей открывает двери в мир тайги, уникальной флоры и фауны, а также захватывающих пейзажей Сибири.' },
        { id: 4, name: 'Круиз по реке Амур', image: '../../images/cruiselistamur.jpg', description: 'Этот круиз позволит насладиться величием Амура, исследовать незабываемые виды на его побережье и встретить диких животных.' },
        { id: 5, name: 'Круиз по реке Дон', image: '../../images/cruiselistdon.jpg', description: 'Дон влечет путешественников своим историческим значением и традиционным культурным наследием.' },
        { id: 6, name: 'Круиз по реке Обь', image: '../../images/cruiselistob.jpg', description: 'Река Обь предоставит вам возможность увидеть истинную красоту Сибири и исследовать нетронутые уголки природы.' },
    ];

    const cruise = cruisePoints.find((point) => point.id === parseInt(id));

    if (!cruise) {
        return <p>Круиз не найден.</p>;
    }

    return (
        <div className={styles.cruiseDetail}>
            <h1>{cruise.name}</h1>
            <img src={cruise.image} alt={cruise.name} className={styles.cruiseImage} />
            <div className={styles.description}>
                <p>{cruise.description}</p>
            </div>
            <a href="#" className={styles.backButton} onClick={() => window.history.back()}>
                Назад
            </a>
        </div>
    );
};

export default CruiseDetail;
