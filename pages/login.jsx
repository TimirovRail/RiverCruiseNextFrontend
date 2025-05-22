import { useState, useEffect } from "react";
import Link from "next/link";
import styles from './login.module.css';
import { useRouter } from 'next/router';
import QRCode from 'qrcode';
import { API_BASE_URL } from '../src/config';

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
    const [twoFactorSecret, setTwoFactorSecret] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [code, setCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [showTwoFactorInput, setShowTwoFactorInput] = useState(false);
    const router = useRouter();

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setError(null);
        setFormData({ name: "", email: "", password: "", password_confirmation: "" });
        setTwoFactorSecret('');
        setQrCodeUrl('');
        setCode('');
        setIsAuthenticated(false);
        setShowTwoFactorInput(false);
        setIsVerified(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const url = isLogin
            ? `${API_BASE_URL}/api/login`
            : `${API_BASE_URL}/api/register`;

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

            // Проверяем, является ли ответ JSON
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Сервер вернул некорректный ответ. Попробуйте позже.');
            }

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('user', JSON.stringify(data.user));

                setIsAuthenticated(true);

                if (isLogin) {
                    // При логине: показываем поле для 2FA, если оно включено
                    if (data.user.two_factor_secret) {
                        setShowTwoFactorInput(true);
                    } else {
                        // Если 2FA не включена, перенаправляем
                        const role = (data.user?.role || data.role || '').trim().toLowerCase();
                        redirectBasedOnRole(role);
                    }
                } else {
                    // При регистрации: показываем QR-код и поле для 2FA
                    if (data.two_factor_secret) {
                        setTwoFactorSecret(data.two_factor_secret);
                        const otpauthUrl = `otpauth://totp/${encodeURIComponent(
                            data.user.email
                        )}?secret=${data.two_factor_secret}&issuer=${encodeURIComponent("YourAppName")}`;

                        QRCode.toDataURL(otpauthUrl, (err, url) => {
                            if (err) {
                                console.error('Ошибка генерации QR-кода:', err);
                                setError('Не удалось сгенерировать QR-код. Попробуйте снова.');
                                return;
                            }
                            setQrCodeUrl(url);
                        });
                        setShowTwoFactorInput(true);
                    } else {
                        setIsLogin(true); // Переключаем на форму логина после регистрации
                    }
                }
            } else {
                if (data.message) {
                    setError(data.message);
                } else if (data.errors) {
                    const errorMessages = Object.values(data.errors).flat().join(', ');
                    setError(errorMessages);
                } else {
                    setError(isLogin ? 'Не удалось войти. Проверьте email и пароль.' : 'Не удалось зарегистрироваться. Проверьте введенные данные.');
                }
            }
        } catch (err) {
            console.error('Ошибка запроса:', err);
            setError(err.message || 'Не удалось подключиться к серверу. Проверьте ваше интернет-соединение и попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        const cleanedCode = code.replace(/\s/g, '');
        if (!cleanedCode) {
            setError('Пожалуйста, введите код из Google Authenticator.');
            return;
        }

        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Токен отсутствует. Пожалуйста, войдите заново.');
                setIsAuthenticated(false);
                setShowTwoFactorInput(false);
                return;
            }

            const res = await fetch(`${API_BASE_URL}/api/auth/verify-two-factor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ code: cleanedCode }),
            });

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Сервер вернул некорректный ответ. Попробуйте позже.');
            }

            const data = await res.json();

            if (res.ok) {
                setIsVerified(true);
                setError(null);
                alert('Код подтвержден!');

                const user = JSON.parse(localStorage.getItem('user'));
                const role = (user?.role || localStorage.getItem('role') || '').trim().toLowerCase();
                redirectBasedOnRole(role);
            } else {
                if (data.message === 'Unauthenticated.') {
                    setError('Не удалось аутентифицировать запрос. Пожалуйста, войдите заново.');
                    setIsAuthenticated(false);
                    setShowTwoFactorInput(false);
                } else if (data.error === 'Invalid two-factor code') {
                    setError('Неверный код двухфакторной аутентификации. Попробуйте снова.');
                } else if (data.error === 'Two-factor authentication not enabled') {
                    setError('Двухфакторная аутентификация не включена для этого пользователя.');
                } else {
                    setError(data.message || 'Не удалось подтвердить код. Попробуйте снова.');
                }
            }
        } catch (error) {
            console.error('Ошибка при верификации кода:', error);
            setError('Не удалось подключиться к серверу для проверки кода. Проверьте интернет-соединение.');
        }
    };

    const redirectBasedOnRole = (role) => {
        if (role === 'admin') {
            router.push('/admin/dashboard');
        } else if (role === 'manager') {
            router.push('/manager/profile');
        } else {
            router.push('/');
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

            {isAuthenticated && !isVerified && showTwoFactorInput && (
                <div className={styles.authContainer}>
                    <h2>Двухфакторная аутентификация</h2>
                    {error && <div className={styles.error}>{error}</div>}
                    {!isLogin && twoFactorSecret && (
                        <div className={styles.qrCodeWrapper}>
                            <p>Сканируйте QR-код в приложении Google Authenticator или введите ключ вручную:</p>
                            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
                            <p><strong>Секретный ключ:</strong> {twoFactorSecret}</p>
                            <p>Сохраните этот ключ в надежном месте. Он потребуется для восстановления доступа.</p>
                        </div>
                    )}
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