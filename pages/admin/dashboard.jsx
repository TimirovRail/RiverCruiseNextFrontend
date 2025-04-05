import { useEffect, useState, Suspense, lazy } from 'react';
import { useRouter } from 'next/router';
import styles from './dashboard.module.css';
import Loading from "@/components/Loading/Loading";

// Импорт компонентов с ленивой загрузкой
const CollapsibleSection = lazy(() => import('../../components/Dashboard/CollapsibleSection'));
const UserInfo = lazy(() => import('../../components/Dashboard/UserInfo'));
const CruisesList = lazy(() => import('../../components/Dashboard/CruisesList'));
const CreateCruiseForm = lazy(() => import('../../components/Dashboard/CreateCruiseForm'));
const ReviewsList = lazy(() => import('../../components/Dashboard/ReviewsList'));
const BookingsList = lazy(() => import('../../components/Dashboard/BookingsList'));
const PhotosList = lazy(() => import('../../components/Dashboard/PhotosList'));
const EditModal = lazy(() => import('../../components/Dashboard/EditModal'));
const CruiseEditForm = lazy(() => import('../../components/Dashboard/CruiseEditForm'));
const FeedbackEditForm = lazy(() => import('../../components/Dashboard/FeedbackEditForm')); // TODO: Переименовать в ReviewEditForm
const CruiseScheduleEditForm = lazy(() => import('../../components/Dashboard/CruiseScheduleEditForm'));

const Dashboard = () => {
    // Состояния для данных
    const [userData, setUserData] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [cruises, setCruises] = useState([]);
    const [cruiseSchedules, setCruiseSchedules] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    // Состояния для управления открытием секций
    const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
    const [isCruisesOpen, setIsCruisesOpen] = useState(false);
    const [isCreateCruiseOpen, setIsCreateCruiseOpen] = useState(false);
    const [isReviewsOpen, setIsReviewsOpen] = useState(false);
    const [isBookingsOpen, setIsBookingsOpen] = useState(false);
    const [isPhotosOpen, setIsPhotosOpen] = useState(false);

    // Состояния для управления модальным окном редактирования
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCruise, setEditingCruise] = useState(null);
    const [editingReview, setEditingReview] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);

    const router = useRouter();

    // Форматирование даты
    const formatDate = (datetime) => {
        if (!datetime || typeof datetime !== 'string') return '—';
        const date = new Date(datetime);
        return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('ru-RU');
    };

    // Загрузка всех данных при монтировании компонента
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);

            const urls = [
                { url: 'http://localhost:8000/api/user', setter: setUserData, key: 'user' },
                { url: 'http://localhost:8000/api/reviews', setter: setReviews, key: 'reviews' },
                { url: 'http://localhost:8000/api/bookings', setter: setBookings, key: 'bookings' },
                { url: 'http://localhost:8000/api/cruises', setter: setCruises, key: 'cruises' },
                { url: 'http://localhost:8000/api/cruise_schedules', setter: setCruiseSchedules, key: 'cruise_schedules' },
                { url: 'http://localhost:8000/api/photos', setter: setPhotos, key: 'photos' },
            ];

            const fetchPromises = urls.map(async ({ url, setter, key }) => {
                try {
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
                    console.log(`Данные с ${url}:`, data);
                    if (key !== 'user' && !Array.isArray(data)) {
                        throw new Error(`Данные с ${url} должны быть массивом`);
                    }
                    if (key === 'user' && (typeof data !== 'object' || Array.isArray(data))) {
                        throw new Error(`Данные с ${url} должны быть объектом`);
                    }
                    setter(data);
                } catch (err) {
                    console.error(err.message);
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        [url]: err.message,
                    }));
                    setter(key === 'user' ? null : []);
                }
            });

            await Promise.all(fetchPromises);
            setLoading(false);
        };

        fetchAllData();
    }, []);

    // Обогащаем круизы данными о расписаниях
    const cruisesWithSchedules = cruises.map(cruise => ({
        ...cruise,
        schedules: cruiseSchedules.filter(schedule => schedule.cruise_id === cruise.id),
    }));

    // Убираем избыточное обогащение для reviews и bookings, так как данные уже приходят из API
    const reviewsWithDetails = reviews;
    const bookingsWithDetails = bookings;

    // Обогащаем фотографии (пользователь здесь не нужен)
    const photosWithDetails = photos;

    // Функции для управления CRUD
    const handleDeletePhoto = async (photoId) => {
        if (!photoId) return alert('Ошибка: ID фотографии не указан');
        try {
            const response = await fetch(`http://localhost:8000/api/photos/${photoId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!response.ok) throw new Error('Ошибка при удалении фотографии');
            setPhotos(photos.filter(photo => photo.id !== photoId));
            alert('Фотография успешно удалена!');
        } catch (error) {
            console.error(error);
            alert('Ошибка: не удалось удалить фотографию');
        }
    };

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
            if (!response.ok) throw new Error('Ошибка при создании круиза');
            const data = await response.json();
            setCruises([...cruises, data]);
            alert('Круиз успешно добавлен!');
        } catch (error) {
            console.error(error);
            alert('Ошибка: не удалось создать круиз');
        }
    };

    const handleDeleteCruise = async (cruiseId) => {
        if (!cruiseId) return alert('Ошибка: ID круиза не указан');
        try {
            const response = await fetch(`http://localhost:8000/api/cruises/${cruiseId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!response.ok) throw new Error('Ошибка при удалении круиза');
            setCruises(cruises.filter(cruise => cruise.id !== cruiseId));
            alert('Круиз успешно удалён!');
        } catch (error) {
            console.error(error);
            alert('Ошибка: не удалось удалить круиз');
        }
    };

    const handleEditScheduleClick = (schedule) => {
        setEditingSchedule(schedule);
        setIsEditModalOpen(true);
    };

    const handleSaveSchedule = async (updatedData) => {
        try {
            const response = await fetch(`http://localhost:8000/api/cruises/schedules/${updatedData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) throw new Error('Ошибка при редактировании расписания');
            const data = await response.json();
            setCruiseSchedules(cruiseSchedules.map(schedule => schedule.id === updatedData.id ? data : schedule));
            handleCloseModal();
            alert('Расписание успешно обновлено!');
        } catch (error) {
            console.error(error);
            alert('Ошибка: не удалось обновить расписание');
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (!scheduleId) return alert('Ошибка: ID расписания не указан');
        try {
            const response = await fetch(`http://localhost:8000/api/cruises/schedules/${scheduleId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!response.ok) throw new Error('Ошибка при удалении расписания');
            setCruiseSchedules(cruiseSchedules.filter(schedule => schedule.id !== scheduleId));
            alert('Расписание успешно удалено!');
        } catch (error) {
            console.error(error);
            alert('Ошибка: не удалось удалить расписание');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!reviewId) return alert('Ошибка: ID отзыва не указан');
        try {
            const response = await fetch(`http://localhost:8000/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!response.ok) throw new Error('Ошибка при удалении отзыва');
            setReviews(reviews.filter(review => review.id !== reviewId));
            alert('Отзыв успешно удалён!');
        } catch (error) {
            console.error(error);
            alert('Ошибка: не удалось удалить отзыв');
        }
    };

    const handleEditCruiseClick = (cruise) => {
        setEditingCruise(cruise);
        setIsEditModalOpen(true);
    };

    const handleEditReviewClick = (review) => {
        setEditingReview(review);
        setIsEditModalOpen(true);
    };

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
            if (!response.ok) throw new Error('Ошибка при редактировании круиза');
            const data = await response.json();
            setCruises(cruises.map(cruise => cruise.id === updatedData.id ? data : cruise));
            handleCloseModal();
            alert('Круиз успешно обновлён!');
        } catch (error) {
            console.error(error);
            alert('Ошибка: не удалось обновить круиз');
        }
    };

    const handleSaveReview = async (updatedData) => {
        try {
            const response = await fetch(`http://localhost:8000/api/reviews/${updatedData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) throw new Error('Ошибка при редактировании отзыва');
            const data = await response.json();
            setReviews(reviews.map(review => review.id === updatedData.id ? data : review));
            handleCloseModal();
            alert('Отзыв успешно обновлён!');
        } catch (error) {
            console.error(error);
            alert('Ошибка: не удалось обновить отзыв');
        }
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setEditingCruise(null);
        setEditingReview(null);
        setEditingSchedule(null);
    };

    if (loading) return <Loading />;

    return (
        <div className={styles.layout}>
            <Suspense fallback={<Loading />}>
                <EditModal isOpen={isEditModalOpen} onClose={handleCloseModal}>
                    {editingCruise && (
                        <CruiseEditForm
                            cruise={editingCruise}
                            onSave={handleSaveCruise}
                            onCancel={handleCloseModal}
                        />
                    )}
                    {editingReview && (
                        <FeedbackEditForm // TODO: Переименовать в ReviewEditForm
                            feedback={editingReview}
                            onSave={handleSaveReview}
                            onCancel={handleCloseModal}
                        />
                    )}
                    {editingSchedule && (
                        <CruiseScheduleEditForm
                            schedule={editingSchedule}
                            onSave={handleSaveSchedule}
                            onCancel={handleCloseModal}
                        />
                    )}
                </EditModal>
            </Suspense>

            <div className={styles.dashboardContainer}>
                <div className={styles.title}>
                    <h2 className={styles.h1Title}>ПАНЕЛЬ АДМИНИСТРАТОРА</h2>
                </div>

                <Suspense fallback={<Loading />}>
                    <CollapsibleSection
                        title="ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ"
                        isOpen={isUserInfoOpen}
                        onToggle={() => setIsUserInfoOpen(!isUserInfoOpen)}
                    >
                        <UserInfo
                            userData={userData}
                            error={errors['http://localhost:8000/api/user']}
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

                <Suspense fallback={<Loading />}>
                    <CollapsibleSection
                        title="СПИСОК КРУИЗОВ"
                        isOpen={isCruisesOpen}
                        onToggle={() => setIsCruisesOpen(!isCruisesOpen)}
                    >
                        <CruisesList
                            cruises={cruisesWithSchedules}
                            cruiseSchedules={cruiseSchedules}
                            error={errors['http://localhost:8000/api/cruises']}
                            formatDate={formatDate}
                            onEdit={handleEditCruiseClick}
                            onDelete={handleDeleteCruise}
                            onEditSchedule={handleEditScheduleClick}
                            onDeleteSchedule={handleDeleteSchedule}
                        />
                    </CollapsibleSection>
                </Suspense>

                <Suspense fallback={<Loading />}>
                    <CollapsibleSection
                        title="ФОРМА ДЛЯ СОЗДАНИЯ КРУИЗА"
                        isOpen={isCreateCruiseOpen}
                        onToggle={() => setIsCreateCruiseOpen(!isCreateCruiseOpen)}
                    >
                        <CreateCruiseForm onSubmit={handleCreateCruise} />
                    </CollapsibleSection>
                </Suspense>

                <Suspense fallback={<Loading />}>
                    <CollapsibleSection
                        title="ОТЗЫВЫ КЛИЕНТОВ"
                        isOpen={isReviewsOpen}
                        onToggle={() => setIsReviewsOpen(!isReviewsOpen)}
                    >
                        <ReviewsList
                            reviews={reviewsWithDetails}
                            error={errors['http://localhost:8000/api/reviews']}
                            formatDate={formatDate}
                            onEdit={handleEditReviewClick}
                            onDelete={handleDeleteReview}
                        />
                    </CollapsibleSection>
                </Suspense>

                <Suspense fallback={<Loading />}>
                    <CollapsibleSection
                        title="БРОНИРОВАННЫЕ БИЛЕТЫ"
                        isOpen={isBookingsOpen}
                        onToggle={() => setIsBookingsOpen(!isBookingsOpen)}
                    >
                        <BookingsList
                            bookings={bookingsWithDetails}
                            error={errors['http://localhost:8000/api/bookings']}
                            formatDate={formatDate}
                        />
                    </CollapsibleSection>
                </Suspense>

                <Suspense fallback={<Loading />}>
                    <CollapsibleSection
                        title="ФОТОГРАФИИ ПОЛЬЗОВАТЕЛЕЙ"
                        isOpen={isPhotosOpen}
                        onToggle={() => setIsPhotosOpen(!isPhotosOpen)}
                    >
                        <PhotosList
                            photos={photosWithDetails}
                            error={errors['http://localhost:8000/api/photos']}
                            formatDate={formatDate}
                            onDelete={handleDeletePhoto}
                        />
                    </CollapsibleSection>
                </Suspense>
            </div>
        </div>
    );
};

export default Dashboard;