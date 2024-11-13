// src/pages/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // Импортируем стили

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/register', formData);
            localStorage.setItem('token', response.data.token);
            alert('Регистрация прошла успешно');
        } catch (error) {
            console.error('Registration error:', error);
        }
    };

    return (
        <div className="register-container">
            <h2 className="register-title">Создать аккаунт</h2>
            <form onSubmit={handleSubmit} className="register-form">
                <input type="text" name="name" onChange={handleChange} placeholder="Имя" required className="register-input" />
                <input type="email" name="email" onChange={handleChange} placeholder="Email" required className="register-input" />
                <input type="password" name="password" onChange={handleChange} placeholder="Пароль" required className="register-input" />
                <input type="password" name="password_confirmation" onChange={handleChange} placeholder="Подтвердите пароль" required className="register-input" />
                <button type="submit" className="register-button">Регистрация</button>
            </form>
        </div>
    );
};

export default Register;
