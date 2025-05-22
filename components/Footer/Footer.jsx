import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <div>
            <div className='footer-block'>
                <img className='footer-logo' src="/images/whole_logo.png" alt="" />
                <p className='footer-text'>КРУИЗ ПО РЕКАМ РОССИИ, 2025 ® </p>
                <p className='footer-text'>Все права защищены ©</p>
            </div>
        </div>
    );
};

export default Footer;