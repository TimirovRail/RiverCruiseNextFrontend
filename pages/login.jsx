import { useState, useEffect } from "react";
import Link from "next/link";
import styles from './login.module.css';
import { useRouter } from 'next/router';
import QRCode from 'qrcode';
import speakeasy from 'speakeasy';
import base32 from 'base32.js';

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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [secret, setSecret] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [code, setCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            const generateSecret = speakeasy.generateSecret({ length: 20 });
            setSecret(generateSecret.base32);

            QRCode.toDataURL(generateSecret.otpauth_url, (err, url) => {
                if (err) console.error('Ошибка генерации QR-кода:', err);
                setQrCodeUrl(url);
            });
        }
    }, [isAuthenticated]);

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

        const url = isLogin
            ? 'http://localhost:8000/api/login'
            : 'http://localhost:8000/api/register';

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
                if (isLogin) {
                    localStorage.setItem('token', data.access_token);
                    localStorage.setItem('role', data.role);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    setIsAuthenticated(true);

                    const generateSecret = speakeasy.generateSecret({ length: 20 });
                    setSecret(generateSecret.base32);

                    QRCode.toDataURL(generateSecret.otpauth_url, (err, url) => {
                        if (err) console.error('Ошибка генерации QR-кода:', err);
                        setQrCodeUrl(url);
                    });
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

    const handleVerifyCode = () => {
        try {
            if (typeof secret !== 'string' || !secret) {
                throw new Error('Секрет должен быть строкой');
            }
            if (typeof code !== 'string' || !code) {
                throw new Error('Код должен быть строкой');
            }

            const secretBuffer = base32.decode(secret);

            const isValid = speakeasy.totp.verify({
                secret: secretBuffer,
                encoding: 'ascii',
                token: code.trim()
            });

            if (isValid) {
                setIsVerified(true);
                alert('Код подтвержден!');

                const user = JSON.parse(localStorage.getItem('user'));
                const role = (user?.role || localStorage.getItem('role') || '').trim().toLowerCase();

                if (role === 'admin') {
                    router.push('/admin/dashboard');
                } else if (role === 'manager') {
                    router.push('/manager/profile');
                } else {
                    router.push('/');
                }
            } else {
                alert('Неверный код');
            }
        } catch (error) {
            console.error('Ошибка при верификации кода:', error);
            alert('Произошла ошибка при проверке кода');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <div className={styles.switch}>
                    <button
                        onClick={toggleForm}
                        className={isLogin ? styles.active : ''}>
                        Войти
                    </button>
                    <button
                        onClick={toggleForm}
                        className={!isLogin ? styles.active : ''}>
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
                            Нет аккаунта? <button type="button" className={styles.button_login} onClick={toggleForm}>Зарегистрироваться</button>
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
                            Уже есть аккаунт? <button type="button" className={styles.button_register} onClick={toggleForm}>Войти</button>
                        </p>
                    </form>
                )}
            </div>

            {isAuthenticated && !isVerified && (
                <div className={styles.authContainer}>
                    <h2>Двухфакторная аутентификация</h2>
                    <div className={styles.qrCodeWrapper}>
                        <p>Сканируйте QR-код в приложении Google Authenticator</p>
                        {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
                    </div>

                    <div className={styles.codeInputWrapper}>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Введите код из Google Authenticator"
                        />
                        <button onClick={handleVerifyCode} className={styles.verifyButton}>
                            Подтвердить код
                        </button>
                    </div>

                    {isVerified && <p className={styles.successMessage}>Двухфакторная аутентификация пройдена!</p>}
                </div>
            )}
        </div>
    );
};

export default LoginPage;