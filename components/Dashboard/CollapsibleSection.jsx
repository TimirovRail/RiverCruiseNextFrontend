import styles from '../../pages/admin/adminComponents.module.css';

const CollapsibleSection = ({ title, isOpen, onToggle, children }) => {
    return (
        <div className={styles.collapsibleSection}>
            <h2 className={styles.sectionTitle} onClick={onToggle}>
                {title}
                <span className={`${styles.toggleIcon} ${isOpen ? styles.open : ''}`}>
                    ▼
                </span>
            </h2>
            {isOpen && <div className={styles.fade}>{children}</div>}
        </div>
    );
};

export default CollapsibleSection;