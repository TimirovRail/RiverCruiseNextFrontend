import { useEffect, useState, Suspense, lazy } from 'react';
import { useRouter } from 'next/router';
import styles from './dashboard.module.css';
import Loading from "@/components/Loading/Loading";

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
    const [cruiseSchedules, setCruiseSchedules] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [users, setUsers] = useState([]); // Добавляем состояние для пользователей
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
    const [isCruisesOpen, setIsCruisesOpen] = useState(false);
    const [isCreateCruiseOpen, setIsCreateCruiseOpen] = useState(false);
    const [isFeedbacksOpen, setIsFeedbacksOpen] = useState(false);
    const [isBookingsOpen, setIsBookingsOpen] = useState(false);
    const [isPhotosOpen, setIsPhotosOpen] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCruise, setEditingCruise] = useState(null);
    const [editingFeedback, setEditingFeedback] = useState(null);

    const router = useRouter();

    const formatDate = (datetime) => {
        if (!datetime || typeof datetime !== 'string') return '—';
        const date = new Date(datetime);
        return isNaN(date.getTime()) ? '—' : date.toLocaleDateString('ru-RU');
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);

            const urls = [
                { url: 'http://localhost:8000/api/user', setter: setUserData, key: 'user' },
                { url: 'http://localhost:8000/api/feedbacks', setter: setFeedbacks, key: 'feedbacks' },
                { url: 'http://localhost:8000/api/bookings', setter: setBookings, key: 'bookings' },
                { url: 'http://localhost:8000/api/cruises', setter: setCruises, key: 'cruises' },
                { url: 'http://localhost:8000/api/cruise_schedules', setter: setCruiseSchedules, key: 'cruise_schedules' },
                { url: 'http://localhost:8000/api/photos', setter: setPhotos, key: 'photos' },
                { url: 'http://localhost:8000/api/users', setter: setUsers, key: 'users' }, // Добавляем загрузку пользователей
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
                    console.log(`Данные с ${url}:`, data); // Отладка
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

    // Функции для связывания данных
    const getUserById = (userId) => {
        return users.find(user => user.id === userId) || null;
    };

    const getCruiseById = (cruiseId) => {
        return cruises.find(cruise => cruise.id === cruiseId) || null;
    };

    const getCruiseSchedules = (cruiseId) => {
        return cruiseSchedules.filter(schedule => schedule.cruise_id === cruiseId);
    };

    // Обновляем круизы, добавляя к ним расписания
    const cruisesWithSchedules = cruises.map(cruise => ({
        ...cruise,
        schedules: getCruiseSchedules(cruise.id),
    }));

    // Обновляем отзывы, добавляя данные о пользователе и круизе
    const feedbacksWithDetails = feedbacks.map(feedback => {
        const user = getUserById(feedback.user_id);
        const cruise = getCruiseById(feedback.cruise_id);
        return {
            ...feedback,
            user_name: user ? user.name : '—',
            user_email: user ? user.email : '—',
            cruise_name: cruise ? cruise.name : '—',
        };
    });

    // Обновляем бронирования, добавляя данные о пользователе и круизе
    const bookingsWithDetails = bookings.map(booking => {
        const user = getUserById(booking.user_id);
        const cruise = getCruiseById(booking.cruise_id);
        return {
            ...booking,
            user_name: user ? user.name : '—',
            user_email: user ? user.email : '—',
            cruise_name: cruise ? cruise.name : '—',
        };
    });

    // Обновляем фотографии, добавляя данные о пользователе
    const photosWithDetails = photos.map(photo => {
        const user = getUserById(photo.user_id);
        return {
            ...photo,
            user_name: user ? user.name : '—',
        };
    });

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

    const handleDeleteFeedback = async (feedbackId) => {
        if (!feedbackId) return alert('Ошибка: ID отзыва не указан');
        try {
            const response = await fetch(`http://localhost:8000/api/feedbacks/${feedbackId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (!response.ok) throw new Error('Ошибка при удалении отзыва');
            setFeedbacks(feedbacks.filter(feedback => feedback.id !== feedbackId));
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

    const handleEditFeedbackClick = (feedback) => {
        setEditingFeedback(feedback);
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
            if (!response.ok) throw new Error('Ошибка при редактировании отзыва');
            const data = await response.json();
            setFeedbacks(feedbacks.map(feedback => feedback.id === updatedData.id ? data : feedback));
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
        setEditingFeedback(null);
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
                            error={errors['http://localhost:8000/api/cruises']}
                            formatDate={formatDate}
                            onEdit={handleEditCruiseClick}
                            onDelete={handleDeleteCruise}
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
                        isOpen={isFeedbacksOpen}
                        onToggle={() => setIsFeedbacksOpen(!isFeedbacksOpen)}
                    >
                        <FeedbacksList
                            feedbacks={feedbacksWithDetails}
                            error={errors['http://localhost:8000/api/feedbacks']}
                            formatDate={formatDate} // Добавляем formatDate
                            onEdit={handleEditFeedbackClick}
                            onDelete={handleDeleteFeedback}
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
                            formatDate={formatDate} // Добавляем formatDate
                            onDelete={handleDeletePhoto}
                        />
                    </CollapsibleSection>
                </Suspense>
            </div>
        </div>
    );
};

export default Dashboard;