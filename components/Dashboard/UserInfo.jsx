import styles from '../../pages/admin/dashboard.css';

const UserInfo = ({ userData, error }) => {
    return (
        <div className={styles.userInfo}>
            {error ? (
                <p>Ошибка при загрузке данных пользователя</p>
            ) : (
                <>
                    <p><strong>ID:</strong> {userData?.id || '—'}</p>
                    <p><strong>Имя:</strong> {userData?.name || '—'}</p>
                    <p><strong>Email:</strong> {userData?.email || '—'}</p>
                    <p><strong>Роль:</strong> {userData?.role || '—'}</p>
                    <p><strong>Email подтверждён:</strong> {userData?.email_verified_at ? new Date(userData.email_verified_at).toLocaleString() : '—'}</p>
                    <p><strong>Создан:</strong> {userData?.created_at ? new Date(userData.created_at).toLocaleString() : '—'}</p>
                    <p><strong>Обновлён:</strong> {userData?.updated_at ? new Date(userData.updated_at).toLocaleString() : '—'}</p>
                </>
            )}
        </div>
    );
};

export default UserInfo;