import React from 'react';
import styles from './AboutUs.module.css';

const AboutUs = () => {
    return (
        <div className='layout'>
            <div className='title'>
                <h2 className='h1-title'>О НАС</h2>
            </div>
            <div className={styles['about-us']}>
                <div className={styles['about-content']}>
                    <div className={styles['about-description']}>
                        <p>
                            Мы — команда профессионалов, объединённых любовью к путешествиям и уникальным водным маршрутам России.
                        </p>
                        <p>
                            Наша цель — предоставить вам незабываемые круизы по величественным рекам страны, где каждый маршрут предлагает что-то новое: от живописных пейзажей до исторических достопримечательностей и культурных богатств. Каждое путешествие наполнено комфортом, теплом и заботой, чтобы вы могли насладиться отдыхом в полной мере.
                        </p>
                    </div>
                    <div className={styles['about-icon']}>
                        <div className={styles['about-icon1']}>
                            <img src="/images/aboutusicon.png" alt="" />
                            <p className={styles['about-icon-text']}>10 лет по рекам </p>
                        </div>
                        <div className={styles['about-icon2']}>
                            <img src="/images/aboutusicon.png" alt="" />
                            <p className={styles['about-icon-text']}>+90.000 км проплыли </p>
                        </div>
                        <div className={styles['about-icon3']}>
                            <img src="/images/aboutusicon.png" alt="" />
                            <p className={styles['about-icon-text']}>+10.000 гостей  </p>
                        </div>
                    </div>
                </div>
                <div className={styles['about-image']}>
                    <img src="/images/aboutus.jpg" alt="River Cruise" />
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
