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
    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [twoFactorSecret, setTwoFactorSecret] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [code, setCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [showTwoFactorInput, setShowTwoFactorInput] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const router = useRouter();

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.(?:[a-zA-Z]{2,})$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { name: "", email: "", password: "", password_confirmation: "" };

        if (!formData.email) {
            newErrors.email = "Электронная почта обязательна";
            isValid = false;
        } else if (!validateEmail(formData.email)) {
            newErrors.email = "Введите корректный email адрес (например, user@domain.com)";
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = "Пароль обязателен";
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = "Пароль должен содержать минимум 8 символов";
            isValid = false;
        }

        if (!isLogin) {
            if (!formData.name) {
                newErrors.name = "Имя обязательно";
                isValid = false;
            }
            if (!formData.password_confirmation) {
                newErrors.password_confirmation = "Подтверждение пароля обязательно";
                isValid = false;
            } else if (formData.password !== formData.password_confirmation) {
                newErrors.password_confirmation = "Пароли не совпадают";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setErrors({ name: "", email: "", password: "", password_confirmation: "" });
        setSuccessMessage(null);
        setFormData({ name: "", email: "", password: "", password_confirmation: "" });
        setTwoFactorSecret('');
        setQrCodeUrl('');
        setCode('');
        setIsAuthenticated(false);
        setShowTwoFactorInput(false);
        setIsVerified(false);
        setShowPassword(false);
        setShowPasswordConfirmation(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        // Clear error for the field being edited
        setErrors({
            ...errors,
            [name]: "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setLoading(true);
        setErrors({ name: "", email: "", password: "", password_confirmation: "" });
        setSuccessMessage(null);

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

            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Сервер вернул некорректный ответ. Попробуйте позже.');
            }

            const data = await res.json();
            console.log(`Ответ ${isLogin ? '/api/login' : '/api/register'}:`, data);

            if (res.ok) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('user', JSON.stringify(data.user));
                console.log('Сохранённый токен:', data.access_token);

                setIsAuthenticated(true);

                if (isLogin) {
                    if (data.user.two_factor_secret) {
                        setShowTwoFactorInput(true);
                    } else {
                        const role = (data.user?.role || data.role || '').trim().toLowerCase();
                        redirectBasedOnRole(role);
                    }
                } else {
                    if (data.two_factor_secret) {
                        setTwoFactorSecret(data.two_factor_secret);
                        const otpauthUrl = `otpauth://totp/${encodeURIComponent(
                            data.user.email
                        )}?secret=${data.two_factor_secret}&issuer=${encodeURIComponent("YourAppName")}`;

                        QRCode.toDataURL(otpauthUrl, (err, url) => {
                            if (err) {
                                console.error('Ошибка генерации QR-кода:', err);
                                setErrors({ ...errors, general: 'Не удалось сгенерировать QR-код. Попробуйте снова.' });
                                return;
                            }
                            setQrCodeUrl(url);
                        });
                        setSuccessMessage('Регистрация успешна! Сканируйте QR-код или сохраните секретный ключ в Google Authenticator, затем нажмите "Перейти к авторизации".');
                    } else {
                        setSuccessMessage('Регистрация успешна! Войдите, используя ваши данные.');
                        setIsLogin(true);
                    }
                }
            } else {
                if (data.message) {
                    setErrors({ ...errors, general: data.message });
                } else if (data.errors) {
                    const errorMessages = Object.values(data.errors).flat().join(', ');
                    setErrors({ ...errors, general: errorMessages });
                } else if (data.email) {
                    setErrors({ ...errors, email: data.email.join(', ') });
                } else {
                    setErrors({ ...errors, general: isLogin ? 'Не удалось войти. Проверьте email и пароль.' : 'Не удалось зарегистрироваться. Проверьте введенные данные.' });
                }
            }
        } catch (err) {
            console.error('Ошибка запроса:', err);
            setErrors({ ...errors, general: err.message || 'Не удалось подключиться к серверу. Проверьте ваше интернет-соединение и попробуйте снова.' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        const cleanedCode = code.replace(/\s/g, '');
        if (!cleanedCode) {
            setErrors({ ...errors, code: 'Пожалуйста, введите код из Google Authenticator.' });
            return;
        }

        setErrors({ ...errors, code: "" });
        try {
            const token = localStorage.getItem('token');
            console.log('Токен для 2FA:', token);
            if (!token) {
                setErrors({ ...errors, general: 'Токен отсутствует. Пожалуйста, войдите заново.' });
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
            console.log('Ответ /api/auth/verify-two-factor:', data);

            if (res.ok) {
                setIsVerified(true);
                setErrors({ ...errors, code: "" });
                alert('Код подтвержден!');

                const user = JSON.parse(localStorage.getItem('user'));
                const role = (user?.role || localStorage.getItem('role') || '').trim().toLowerCase();
                redirectBasedOnRole(role);
            } else {
                if (data.message === 'Unauthenticated.') {
                    setErrors({ ...errors, general: 'Не удалось аутентифицировать запрос. Пожалуйста, войдите заново.' });
                    setIsAuthenticated(false);
                    setShowTwoFactorInput(false);
                } else if (data.error === 'Invalid two-factor code') {
                    setErrors({ ...errors, code: 'Неверный код двухфакторной аутентификации. Попробуйте снова.' });
                } else if (data.error === 'Two-factor authentication not enabled') {
                    setErrors({ ...errors, general: 'Двухфакторная аутентификация не включена для этого пользователя.' });
                } else {
                    setErrors({ ...errors, code: data.message || 'Не удалось подтвердить код. Попробуйте снова.' });
                }
            }
        } catch (error) {
            console.error('Ошибка при верификации кода:', error);
            setErrors({ ...errors, code: 'Не удалось подключиться к серверу для проверки кода. Проверьте интернет-соединение.' });
        }
    };

    const handleProceedToLogin = () => {
        setIsLogin(true);
        setSuccessMessage('Войдите, используя код из Google Authenticator.');
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

                {errors.general && <div className={styles.error}>{errors.general}</div>}
                {successMessage && <div className={styles.success}>{successMessage}</div>}

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
                            {errors.email && <div className={styles.fieldError}>{errors.email}</div>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Пароль</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Введите ваш пароль"
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && <div className={styles.fieldError}>{errors.password}</div>}
                        </div>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Загружается...' : 'Войти'}
                        </button>
                        <p className={styles.toggleText}>
                            Нет аккаунта? <button type="button" className={styles.toggleButton} onClick={toggleForm}>Зарегистрироваться</button>
                        </p>
                        <Link href="/" className={styles.backButton}>
                            Назад
                        </Link>
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
                            {errors.name && <div className={styles.fieldError}>{errors.name}</div>}
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
                            {errors.email && <div className={styles.fieldError}>{errors.email}</div>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Пароль</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Введите ваш пароль"
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && <div className={styles.fieldError}>{errors.password}</div>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Подтвердите пароль</label>
                            <div className={styles.passwordWrapper}>
                                <input
                                    type={showPasswordConfirmation ? "text" : "password"}
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    placeholder="Подтвердите ваш пароль"
                                />
                                <button
                                    type="button"
                                    className={styles.eyeButton}
                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                >
                                    {showPasswordConfirmation ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password_confirmation && <div className={styles.fieldError}>{errors.password_confirmation}</div>}
                        </div>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Загружается...' : 'Зарегистрироваться'}
                        </button>
                        <p className={styles.toggleText}>
                            Уже есть аккаунт? <button type="button" className={styles.toggleButton} onClick={toggleForm}>Войти</button>
                        </p>
                        <Link href="/" className={styles.backButton}>
                            Назад
                        </Link>
                    </form>
                )}
            </div>

            {isAuthenticated && !isVerified && (
                <div className={styles.authContainer}>
                    <h2>Двухфакторная аутентификация</h2>
                    {errors.general && <div className={styles.error}>{errors.general}</div>}
                    {!isLogin && twoFactorSecret && (
                        <div className={styles.qrCodeWrapper}>
                            <p>Сканируйте QR-код в п риложении Google Authenticator или введите ключ вручную:</p>
                            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
                            <p><strong>Секретный ключ:</strong> {twoFactorSecret}</p>
                            <p>Сохраните этот ключ в надежном месте. Он потребуется для восстановления доступа.</p>
                            <button onClick={handleProceedToLogin} className={styles.verifyButton}>
                                Сохранил ключ, перейти к авторизации
                            </button>
                        </div>
                    )}
                    {isLogin && showTwoFactorInput && (
                        <div className={styles.codeInputWrapper}>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Введите код из Google Authenticator"
                            />
                            {errors.code && <div className={styles.fieldError}>{errors.code}</div>}
                            <button onClick={handleVerifyCode} className={styles.verifyButton}>
                                Подтвердить код
                            </button>
                        </div>
                    )}
                    {isVerified && <p className={styles.successMessage}>Двухфакторная аутентификация пройдена!</p>}
                </div>
            )}
        </div>
    );
};

export default LoginPage;