import styles from '../../pages/admin/adminComponents.module.css';

const UserInfo = ({ userData, error }) => {
    return (
        <div className={styles.componentContainer}>
            {error ? (
                <p className={styles.errorMessage}>Ошибка при загрузке данных пользователя</p>
            ) : userData ? (
                <div className={styles.userInfo}>
                    <p><strong>Имя:</strong> {userData.name || '—'}</p>
                    <p><strong>Email:</strong> {userData.email || '—'}</p>
                    <p><strong>Роль:</strong> {userData.role || '—'}</p>
                </div>
            ) : (
                <p className={styles.errorMessage}>Данные пользователя отсутствуют</p>
            )}
        </div>
    );
};

export default UserInfo;