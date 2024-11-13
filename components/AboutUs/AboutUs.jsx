import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
    return (
        <div className="about-us">
            <div className="about-content">
                <h2 className="h1-title">О нас</h2>
                <p className="about-description">
                    Мы — команда любителей приключений и страстных путешественников, которые хотят поделиться
                    лучшими речными круизами России с вами! Наши круизы — это уникальное сочетание комфорта,
                    драйва и знакомства с культурой, природой и историей нашей удивительной страны. Присоединяйтесь к нам,
                    и откройте для себя захватывающие путешествия, незабываемые эмоции и новые впечатления!
                </p>
                <button className="learn-more-button">Узнать больше</button>
            </div>
            <div className="about-image">
                <img src="/images/aboutus.png" alt="River Cruise" />
            </div>
        </div>
    );
};

export default AboutUs;
