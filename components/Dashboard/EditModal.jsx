import styles from '../../pages/admin/adminComponents.module.css';

const EditModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContainer}>
                <div className={styles.modalScrollableContent}>
                    {children}
                </div>
                <button onClick={onClose} className={styles.modalCloseButton}>
                    Закрыть
                </button>
            </div>
        </div>
    );
};

export default EditModal;