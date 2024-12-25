import { useState } from "react";
import Link from "next/link";
import styles from './login.module.css';
import { useRouter } from 'next/router';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setError(null); 
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!isLogin && formData.password !== formData.password_confirmation) {
            setError('Пароли не совпадают');
            setLoading(false);
            return;
        }

        const url = isLogin
            ? 'http://localhost:8000/api/auth/login'
            : 'http://localhost:8000/api/auth/register';

        const body = JSON.stringify({
            email: formData.email,
            password: formData.password,
            ...(isLogin ? {} : { name: formData.name, password_confirmation: formData.password_confirmation }),
        });

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body,
            });

            const data = await res.json();

            if (res.ok) {
                console.log('Успешный ответ:', data);

                if (isLogin) {
                    localStorage.setItem('token', data.access_token);
                    router.push('/profile');
                } else {
                    setIsLogin(true);
                }
            } else {
                setError(data.message || 'Произошла ошибка');
            }
        } catch (err) {
            console.error('Ошибка запроса:', err);
            setError('Произошла ошибка при отправке запроса');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <div className={styles.switch}>
                    <button
                        onClick={toggleForm}
                        className={isLogin ? styles.active : ''}
                    >
                        Войти
                    </button>
                    <button
                        onClick={toggleForm}
                        className={!isLogin ? styles.active : ''}
                    >
                        Регистрация
                    </button>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {isLogin ? (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <h2>Войти</h2>
                        <div className={styles.inputGroup}>
                            <label>Электронная почта</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Введите ваш email"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Пароль</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Введите ваш пароль"
                            />
                        </div>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Загружается...' : 'Войти'}
                        </button>
                        <p className={styles.toggleText}>
                            Нет аккаунта? <button type="button" onClick={toggleForm}>Зарегистрироваться</button>
                        </p>
                    </form>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <h2>Регистрация</h2>
                        <div className={styles.inputGroup}>
                            <label>Имя</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Введите ваше имя"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Электронная почта</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Введите ваш email"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Пароль</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Введите ваш пароль"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Подтвердите пароль</label>
                            <input
                                type="password"
                                name="password_confirmation"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                placeholder="Подтвердите ваш пароль"
                            />
                        </div>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Загружается...' : 'Зарегистрироваться'}
                        </button>
                        <p className={styles.toggleText}>
                            Уже есть аккаунт? <button type="button" onClick={toggleForm}>Войти</button>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginPage;
