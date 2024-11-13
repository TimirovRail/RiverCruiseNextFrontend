import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

export async function getStaticProps() {
    // Получите данные, если они нужны для статической генерации
    return {
        props: {
            // Данные
        }
    };
}

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/login', formData);
            localStorage.setItem('token', response.data.token);
            alert('Вход выполнен');
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Вход в аккаунт</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <input type="email" name="email" onChange={handleChange} placeholder="Email" required className="login-input" />
                <input type="password" name="password" onChange={handleChange} placeholder="Пароль" required className="login-input" />
                <button type="submit" className="login-button">Войти</button>
            </form>
        </div>
    );
};

export default Login;
