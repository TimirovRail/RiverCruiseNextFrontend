import styles from '../../pages/admin/dashboard.css';

const CollapsibleSection = ({ title, children, isOpen, onToggle }) => {
    return (
        <div className={styles.collapsibleSection}>
            <h2
                onClick={onToggle}
                className={styles.sectionTitle}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onToggle()}
            >
                {title} {isOpen ? '▲' : '▼'}
            </h2>
            {isOpen && <div className={styles.sectionContent}>{children}</div>}
        </div>
    );
};

export default CollapsibleSection;