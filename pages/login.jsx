import { useState, useEffect } from "react";
import Link from "next/link";
import styles from './login.module.css';
import { useRouter } from 'next/router';
import QRCode from 'qrcode';

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
    const router = useRouter();

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setError(null);
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
            handleVerifyCode
            if (res.ok) {
                if (isLogin) {
                    localStorage.setItem('token', data.access_token);
                    localStorage.setItem('role', data.role);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    setIsAuthenticated(true);

                    // Если есть секретный ключ, отображаем его
                    if (data.user.two_factor_secret) {
                        setTwoFactorSecret(data.user.two_factor_secret);

                        // Генерируем otpauth_url для QR-кода
                        const otpauthUrl = `otpauth://totp/${encodeURIComponent(
                            data.user.email
                        )}?secret=${data.user.two_factor_secret}&issuer=${encodeURIComponent("YourAppName")}`;

                        // Генерируем QR-код на клиенте
                        QRCode.toDataURL(otpauthUrl, (err, url) => {
                            if (err) {
                                console.error('Ошибка генерации QR-кода:', err);
                                return;
                            }
                            setQrCodeUrl(url);
                        });
                    }
                } else {
                    setIsLogin(true);
                    if (data.two_factor_secret) {
                        setTwoFactorSecret(data.two_factor_secret);

                        // Генерируем otpauth_url для QR-кода
                        const otpauthUrl = `otpauth://totp/${encodeURIComponent(
                            data.user.email
                        )}?secret=${data.two_factor_secret}&issuer=${encodeURIComponent("YourAppName")}`;

                        // Генерируем QR-код на клиенте
                        QRCode.toDataURL(otpauthUrl, (err, url) => {
                            if (err) {
                                console.error('Ошибка генерации QR-кода:', err);
                                return;
                            }
                            setQrCodeUrl(url);
                        });
                    }
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
    const handleVerifyCode = async () => {
        const cleanedCode = code.replace(/\s/g, ''); // Удаляем все пробелы
        console.log('Отправляемый код:', cleanedCode);
        try {
            const res = await fetch('http://localhost:8000/api/auth/verify-two-factor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ code: cleanedCode }),
            });

            const data = await res.json();
            console.log('Ответ сервера:', data);

            if (res.ok) {
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
                alert(data.error || 'Неверный код');
            }
        } catch (error) {
            console.error('Ошибка при верификации кода:', error);
            alert('Произошла ошибка при проверке кода');
        }
    };;

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

            {isAuthenticated && !isVerified && twoFactorSecret && (
                <div className={styles.authContainer}>
                    <h2>Двухфакторная аутентификация</h2>
                    <div className={styles.qrCodeWrapper}>
                        <p>Сканируйте QR-код в приложении Google Authenticator или введите ключ вручную:</p>
                        {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
                        <p><strong>Секретный ключ:</strong> {twoFactorSecret}</p>
                        <p>Сохраните этот ключ в надежном месте. Он потребуется для восстановления доступа.</p>
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