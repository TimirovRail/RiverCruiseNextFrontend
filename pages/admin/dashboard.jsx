import { useEffect, useState, Suspense, lazy } from 'react';
import { useRouter } from 'next/router';
import styles from './dashboard.css';
import Loading from "@/components/Loading/Loading";

// Ленивая загрузка компонентов
const CollapsibleSection = lazy(() => import('../../components/Dashboard/CollapsibleSection'));
const UserInfo = lazy(() => import('../../components/Dashboard/UserInfo'));
const CruisesList = lazy(() => import('../../components/Dashboard/CruisesList'));
const CreateCruiseForm = lazy(() => import('../../components/Dashboard/CreateCruiseForm'));
const FeedbacksList = lazy(() => import('../../components/Dashboard/FeedbacksList'));
const BookingsList = lazy(() => import('../../components/Dashboard/BookingsList'));
const PhotosList = lazy(() => import('../../components/Dashboard/PhotosList'));
const EditModal = lazy(() => import('../../components/Dashboard/EditModal'));
const CruiseEditForm = lazy(() => import('../../components/Dashboard/CruiseEditForm'));
const FeedbackEditForm = lazy(() => import('../../components/Dashboard/FeedbackEditForm'));

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [cruises, setCruises] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const router = useRouter();

    // Состояния для сворачивания/разворачивания блоков
    const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
    const [isCruisesOpen, setIsCruisesOpen] = useState(false);
    const [isCreateCruiseOpen, setIsCreateCruiseOpen] = useState(false);
    const [isFeedbacksOpen, setIsFeedbacksOpen] = useState(false);
    const [isBookingsOpen, setIsBookingsOpen] = useState(false);
    const [isPhotosOpen, setIsPhotosOpen] = useState(false);

    // Состояние для модального окна
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCruise, setEditingCruise] = useState(null);
    const [editingFeedback, setEditingFeedback] = useState(null);

    // Функция для форматирования даты
    const formatDate = (datetime) => {
        if (!datetime || typeof datetime !== 'string') return '—';
        const date = new Date(datetime);
        return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('ru-RU');
    };

    // Загрузка данных
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);

            const urls = [
                { url: 'http://localhost:8000/api/user', setter: setUserData, key: 'user' },
                { url: 'http://localhost:8000/api/feedbacks', setter: setFeedbacks, key: 'feedbacks' },
                { url: 'http://localhost:8000/api/bookings', setter: setBookings, key: 'bookings' },
                { url: 'http://localhost:8000/api/cruises', setter: setCruises, key: 'cruises' },
                { url: 'http://localhost:8000/api/photos', setter: setPhotos, key: 'photos' },
            ];

            try {
                await Promise.all(
                    urls.map(async ({ url, setter, key }) => {
                        const response = await fetch(url, {
                            method: 'GET',
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                                'Content-Type': 'application/json',
                            },
                        });

                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`Ошибка при загрузке данных с ${url}: ${errorText}`);
                        }

                        const data = await response.json();
                        if (key !== 'user' && !Array.isArray(data)) {
                            throw new Error(`Данные с ${url} должны быть массивом`);
                        }
                        if (key === 'user' && (typeof data !== 'object' || Array.isArray(data))) {
                            throw new Error(`Данные с ${url} должны быть объектом`);
                        }
                        setter(data);
                    })
                );
            } catch (err) {
                console.error(err);
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    [err.message]: true,
                }));
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // Удаление фотографии
    const handleDeletePhoto = async (photoId) => {
        if (!photoId) {
            alert('Ошибка: ID фотографии не указан');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/photos/${photoId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при удалении фотографии: ${errorText}`);
            }

            setPhotos(photos.filter(photo => photo.id !== photoId));
            alert('Фотография успешно удалена!');
        } catch (error) {
            console.error(error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    // Создание нового круиза
    const handleCreateCruise = async (newCruise) => {
        try {
            const response = await fetch('http://localhost:8000/api/cruises', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(newCruise),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при создании круиза: ${errorText}`);
            }

            const data = await response.json();
            setCruises([...cruises, data]);
            alert('Круиз успешно добавлен!');
        } catch (error) {
            console.error(error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    // Удаление круиза
    const handleDeleteCruise = async (cruiseId) => {
        if (!cruiseId) {
            alert('Ошибка: ID круиза не указан');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/cruises/${cruiseId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при удалении круиза: ${errorText}`);
            }

            setCruises(cruises.filter(cruise => cruise.id !== cruiseId));
            alert('Круиз успешно удалён!');
        } catch (error) {
            console.error(error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    // Удаление отзыва
    const handleDeleteFeedback = async (feedbackId) => {
        if (!feedbackId) {
            alert('Ошибка: ID отзыва не указан');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/feedbacks/${feedbackId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при удалении отзыва: ${errorText}`);
            }

            setFeedbacks(feedbacks.filter(feedback => feedback.id !== feedbackId));
            alert('Отзыв успешно удалён!');
        } catch (error) {
            console.error(error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    // Открытие модального окна для редактирования круиза
    const handleEditCruiseClick = (cruise) => {
        setEditingCruise(cruise);
        setIsEditModalOpen(true);
    };

    // Открытие модального окна для редактирования отзыва
    const handleEditFeedbackClick = (feedback) => {
        setEditingFeedback(feedback);
        setIsEditModalOpen(true);
    };

    // Сохранение изменений круиза
    const handleSaveCruise = async (updatedData) => {
        try {
            const response = await fetch(`http://localhost:8000/api/cruises/${updatedData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при редактировании круиза: ${errorText}`);
            }

            const data = await response.json();
            setCruises(cruises.map(cruise => cruise.id === updatedData.id ? data : cruise));
            handleCloseModal();
            alert('Круиз успешно обновлён!');
        } catch (error) {
            console.error(error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    // Сохранение изменений отзыва
    const handleSaveFeedback = async (updatedData) => {
        try {
            const response = await fetch(`http://localhost:8000/api/feedbacks/${updatedData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка при редактировании отзыва: ${errorText}`);
            }

            const data = await response.json();
            setFeedbacks(feedbacks.map(feedback => feedback.id === updatedData.id ? data : feedback));
            handleCloseModal();
            alert('Отзыв успешно обновлён!');
        } catch (error) {
            console.error(error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    // Закрытие модального окна и очистка состояния
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setEditingCruise(null);
        setEditingFeedback(null);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className={styles.layout}>
            {/* Модальное окно для редактирования */}
            <Suspense fallback={<Loading />}>
                <EditModal isOpen={isEditModalOpen} onClose={handleCloseModal}>
                    {editingCruise && (
                        <CruiseEditForm
                            cruise={editingCruise}
                            onSave={handleSaveCruise}
                            onCancel={handleCloseModal}
                        />
                    )}
                    {editingFeedback && (
                        <FeedbackEditForm
                            feedback={editingFeedback}
                            onSave={handleSaveFeedback}
                            onCancel={handleCloseModal}
                        />
                    )}
                </EditModal>
            </Suspense>

            <div className={styles.dashboardContainer}>
                <div className={styles.title}>
                    <h2 className={styles.h1Title}>ПАНЕЛЬ АДМИНИСТРАТОРА</h2>
                </div>

                {/* Информация о пользователе */}
                <Suspense fallback={<Loading />}>
                    <CollapsibleSection
                        title="ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ"
                        isOpen={isUserInfoOpen}
                        onToggle={() => setIsUserInfoOpen(!isUserInfoOpen)}
                    >
                        <UserInfo
                            userData={userData}
                            error={errors['Ошибка при загрузке данных с http://localhost:8000/api/user']}
                        />
                    </CollapsibleSection>
                </Suspense>

                <div className={styles.buttonGroup}>
                    <button onClick={() => router.push('/')} className={styles.homeButton}>На главную</button>
                    <button onClick={() => {
                        localStorage.removeItem('token');
                        router.push('/login');
                    }} className={styles.logoutButton}>Выйти</button>
                </div>

                {/* Список круизов */}
                <Suspense fallback={<Loading />}>
                    <CollapsibleSection
                        title="СПИСОК КРУИЗОВ"
                        isOpen={isCruisesOpen}
                        onToggle={() => setIsCruisesOpen(!isCruisesOpen)}
                    >
                        <CruisesList
                            cruises={cruises}
                            error={errors['Ошибка при загрузке данных с http://localhost:8000/api/cruises']}
                            formatDate={formatDate}
                            onEdit={handleEditCruiseClick}
                            onDelete={handleDeleteCruise}
                        />
                    </CollapsibleSection>
                </Suspense>

                {/* Форма для создания круиза */}
                <Suspense fallback={<Loading />}>
                    <CollapsibleSection
                        title="ФОРМА ДЛЯ СОЗДАНИЯ КРУИЗА"
                        isOpen={isCreateCruiseOpen}
                        onToggle={() => setIsCreateCruiseOpen(!isCreateCruiseOpen)}
                    >
                        <CreateCruiseForm onSubmit={handleCreateCruise} />
                    </CollapsibleSection>
                </Suspense>

                {/* Отзывы клиентов */}
                <Suspense fallback={<Loading />}>
                    <CollapsibleSection
                        title="ОТЗЫВЫ КЛИЕНТОВ"
                        isOpen={isFeedbacksOpen}
                        onToggle={() => setIsFeedbacksOpen(!isFeedbacksOpen)}
                    >
                        <FeedbacksList
                            feedbacks={feedbacks}
                            error={errors['Ошибка при загрузке данных с http://localhost:8000/api/feedbacks']}
                            onEdit={handleEditFeedbackClick}
                            onDelete={handleDeleteFeedback}
                        />
                    </CollapsibleSection>
                </Suspense>

                {/* Бронированные билеты */}
                <Suspense fallback={<Loading />}>
                    <CollapsibleSection
                        title="БРОНИРОВАННЫЕ БИЛЕТЫ"
                        isOpen={isBookingsOpen}
                        onToggle={() => setIsBookingsOpen(!isBookingsOpen)}
                    >
                        <BookingsList
                            bookings={bookings}
                            I
                            error={errors['Ошибка при загрузке данных с http://localhost:8000/api/bookings']}
                            formatDate={formatDate}
                        />
                    </CollapsibleSection>
                </Suspense>

                {/* Фотографии пользователей */}
                <Suspense fallback={<Loading />}>
                    <CollapsibleSection
                        title="ФОТОГРАФИИ ПОЛЬЗОВАТЕЛЕЙ"
                        isOpen={isPhotosOpen}
                        onToggle={() => setIsPhotosOpen(!isPhotosOpen)}
                    >
                        <PhotosList
                            photos={photos}
                            error={errors['Ошибка при загрузке данных с http://localhost:8000/api/photos']}
                            onDelete={handleDeletePhoto}
                        />
                    </CollapsibleSection>
                </Suspense>
            </div>
        </div>
    );
};

export default Dashboard;