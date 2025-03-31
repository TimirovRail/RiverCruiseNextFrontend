import styles from '../../pages/admin/dashboard.css';

const EditModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                {children}
                <button onClick={onClose} className={styles.modalCloseButton}>Закрыть</button>
            </div>
        </div>
    );
};

export default EditModal;