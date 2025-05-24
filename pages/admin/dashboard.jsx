import { useEffect, useState, Suspense, lazy } from 'react';
import { useRouter } from 'next/router';
import styles from './dashboard.module.css';
import Loading from "@/components/Loading/Loading";
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { API_BASE_URL } from '../../src/config';

const CollapsibleSection = lazy(() => import('../../components/Dashboard/CollapsibleSection'));
const UserInfo = lazy(() => import('../../components/Dashboard/UserInfo'));
const CruisesList = lazy(() => import('../../components/Dashboard/CruisesList'));
// const CreateCruiseForm = lazy(() => import('../../components/Dashboard/CreateCruiseForm'));
const CreateCruiseScheduleForm = lazy(() => import('../../components/Dashboard/CreateCruiseScheduleForm')); // Новый импорт
const ReviewsList = lazy(() => import('../../components/Dashboard/ReviewsList'));
const BookingsList = lazy(() => import('../../components/Dashboard/BookingsList'));
const PhotosList = lazy(() => import('../../components/Dashboard/PhotosList'));
const EditModal = lazy(() => import('../../components/Dashboard/EditModal'));
const CruiseEditForm = lazy(() => import('../../components/Dashboard/CruiseEditForm'));
const CruiseScheduleEditForm = lazy(() => import('../../components/Dashboard/CruiseScheduleEditForm'));

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [cruises, setCruises] = useState([]);
    const [cruiseSchedules, setCruiseSchedules] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
    const [isCruisesOpen, setIsCruisesOpen] = useState(false);
    const [isCreateCruiseOpen, setIsCreateCruiseOpen] = useState(false);
    const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false); // Новое состояние
    const [isReviewsOpen, setIsReviewsOpen] = useState(false);
    const [isBookingsOpen, setIsBookingsOpen] = useState(false);
    const [isPhotosOpen, setIsPhotosOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCruise, setEditingCruise] = useState(null);
    const [editingSchedule, setEditingSchedule] = useState(null);

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
                { url: `${API_BASE_URL}/api/user`, setter: setUserData, key: 'user', requiresAuth: true },
                { url: `${API_BASE_URL}/api/reviews`, setter: setReviews, key: 'reviews', requiresAuth: false },
                { url: `${API_BASE_URL}/api/bookings`, setter: setBookings, key: 'bookings', requiresAuth: true },
                { url: `${API_BASE_URL}/api/cruises`, setter: setCruises, key: 'cruises', requiresAuth: false },
                { url: `${API_BASE_URL}/api/cruise_schedules`, setter: setCruiseSchedules, key: 'cruise_schedules', requiresAuth: false },
                { url: `${API_BASE_URL}/api/photos`, setter: setPhotos, key: 'photos', requiresAuth: false },
            ];

            const fetchPromises = urls.map(async ({ url, setter, key, requiresAuth }) => {
                try {
                    const headers = { 'Content-Type': 'application/json' };
                    if (requiresAuth) {
                        headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
                    }

                    const response = await fetch(url, { method: 'GET', headers });
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
                    setErrors((prevErrors) => ({ ...prevErrors, [url]: err.message }));
                    setter(key === 'user' ? null : []);
                }
            });

            await Promise.all(fetchPromises);
            setLoading(false);
        };

        fetchAllData();
    }, []);

    const cruisesWithSchedules = cruises.map(cruise => ({
        ...cruise,
        schedules: cruiseSchedules.filter(schedule => schedule.cruise_id === cruise.id),
    }));

    const reviewsWithDetails = reviews;
    const bookingsWithDetails = bookings;
    const photosWithDetails = photos;

    const handleDeletePhoto = async (photoId) => {
        if (!photoId) return alert('Ошибка: ID фотографии не указан');
        try {
            const response = await fetch(`${API_BASE_URL}/api/photos/${photoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Ошибка при удалении фотографии');
            }
            setPhotos(photos.filter(photo => photo.id !== photoId));
            alert('Фотография успешно удалена!');
        } catch (error) {
            console.error(error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    const handleCreateCruise = async (newCruise) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cruises`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCruise),
            });
            if (!response.ok) throw new Error('Ошибка при создании круиза');
            const data = await response.json();
            setCruises([...cruises, data]);
            alert('Круиз успешно добавлен! Теперь создайте расписание для этого круиза.');
        } catch (error) {
            console.error(error);
            alert('Ошибка: не удалось создать круиз');
        }
    };

    const handleCreateSchedule = async (newSchedule) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cruise_schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSchedule),
            });
            if (!response.ok) throw new Error('Ошибка при создании расписания');
            const data = await response.json();
            setCruiseSchedules([...cruiseSchedules, data]);
            alert('Расписание успешно добавлено!');
        } catch (error) {
            console.error(error);
            alert('Ошибка: не удалось создать расписание');
        }
    };

    const handleDeleteCruise = async (cruiseId) => {
        if (!cruiseId) return alert('Ошибка: ID круиза не указан');
        const hasSchedules = cruiseSchedules.some(schedule => schedule.cruise_id === cruiseId);
        if (hasSchedules && !confirm('У этого круиза есть расписания. Удаление приведёт к удалению всех связанных расписаний. Продолжить?')) {
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/cruises/${cruiseId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Ошибка при удалении круиза');
            }
            setCruises(cruises.filter(cruise => cruise.id !== cruiseId));
            setCruiseSchedules(cruiseSchedules.filter(schedule => schedule.cruise_id !== cruiseId));
            alert('Круиз и связанные расписания успешно удалены!');
        } catch (error) {
            console.error(error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    const handleEditScheduleClick = (schedule) => {
        setEditingSchedule(schedule);
        setIsEditModalOpen(true);
    };

    const handleSaveSchedule = async (updatedData) => {
        try {
            const totalPlaces = Number(updatedData.economy_places) + Number(updatedData.standard_places) + Number(updatedData.luxury_places);
            const payload = {
                ...updatedData,
                economy_places: Number(updatedData.economy_places) || 0,
                standard_places: Number(updatedData.standard_places) || 0,
                luxury_places: Number(updatedData.luxury_places) || 0,
                total_places: totalPlaces,
                available_places: totalPlaces,
            };
            const response = await fetch(`${API_BASE_URL}/api/cruises/schedules/${updatedData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Ошибка при редактировании расписания');
            }
            const data = await response.json();
            setCruiseSchedules(cruiseSchedules.map(schedule => schedule.id === updatedData.id ? data : schedule));
            handleCloseModal();
            alert('Расписание успешно обновлено!');
        } catch (error) {
            console.error(error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (!scheduleId) return alert('Ошибка: ID расписания не указан');
        try {
            const response = await fetch(`${API_BASE_URL}/api/cruises/schedules/${scheduleId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Ошибка при удалении расписания');
            }
            setCruiseSchedules(cruiseSchedules.filter(schedule => schedule.id !== scheduleId));
            alert('Расписание успешно удалено!');
        } catch (error) {
            console.error(error);
            alert(`Ошибка: ${error.message}`);
        }
    };

    const handleCancelReview = async (reviewId) => {
        if (!reviewId) return alert('Ошибка: ID отзыва не указан');
        try {
            const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error('Ошибка при отмене отзыва');
            setReviews(reviews.map(review => review.id === reviewId ? { ...review, is_active: false } : review));
            alert('Отзыв успешно отменён!');
        } catch (error) {
            console.error(error);
            alert('Ошибка: не удалось отменить отзыв');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!reviewId) return alert('Ошибка: ID отзыва не указан');
        try {
            const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
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

    const handleSaveCruise = async (updatedData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cruises/${updatedData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            const responseText = await response.text();
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status} - ${responseText}`);
            }
            const data = await JSON.parse(responseText);
            setCruises(cruises.map(cruise => cruise.id === updatedData.id ? data : cruise));
            handleCloseModal();
            alert('Круиз успешно обновлён!');
        } catch (error) {
            console.error('Ошибка:', error);
            alert(error.message);
        }
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setEditingCruise(null);
        setEditingSchedule(null);
    };

    if (loading) return <Loading />;

    return (
        <>
            <Header user={userData} onBack={() => router.push('/')} />

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
                                error={errors[`${API_BASE_URL}/api/user`]}
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
                                error={errors[`${API_BASE_URL}/api/cruises`]}
                                formatDate={formatDate}
                                onEdit={handleEditCruiseClick}
                                onDelete={handleDeleteCruise}
                                onEditSchedule={handleEditScheduleClick}
                                onDeleteSchedule={handleDeleteSchedule}
                            />
                        </CollapsibleSection>
                    </Suspense>

                    {/* <Suspense fallback={<Loading />}>
                        <CollapsibleSection
                            title="ФОРМА ДЛЯ СОЗДАНИЯ КРУИЗА"
                            isOpen={isCreateCruiseOpen}
                            onToggle={() => setIsCreateCruiseOpen(!isCreateCruiseOpen)}
                        >
                            <CreateCruiseForm onSubmit={handleCreateCruise} />
                        </CollapsibleSection>
                    </Suspense> */}

                    <Suspense fallback={<Loading />}>
                        <CollapsibleSection
                            title="ФОРМА ДЛЯ СОЗДАНИЯ РАСПИСАНИЯ КРУИЗА"
                            isOpen={isCreateScheduleOpen}
                            onToggle={() => setIsCreateScheduleOpen(!isCreateScheduleOpen)}
                        >
                            <CreateCruiseScheduleForm cruises={cruises} onSubmit={handleCreateSchedule} />
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
                                error={errors[`${API_BASE_URL}/api/reviews`]}
                                formatDate={formatDate}
                                onCancel={handleCancelReview}
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
                                error={errors[`${API_BASE_URL}/api/bookings`]}
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
                                error={errors[`${API_BASE_URL}/api/photos`]}
                                formatDate={formatDate}
                                onDelete={handleDeletePhoto}
                            />
                        </CollapsibleSection>
                    </Suspense>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Dashboard;