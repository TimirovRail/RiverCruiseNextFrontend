// import { useState } from 'react';
// import styles from '../../pages/admin/adminComponents.module.css';

// const CreateCruiseForm = ({ onSubmit }) => {
//     const [cruiseData, setCruiseData] = useState({
//         name: '',
//         description: '',
//         river: '',
//         cabins: '',
//         price_per_person: '',
//         total_distance: '',
//         panorama_url: '',
//         cabins_by_class: {
//             luxury: { places: 0 },
//             economy: { places: 0 },
//             standard: { places: 0 },
//         },
//         features: [],
//     });

//     const [featureInput, setFeatureInput] = useState({ name: '', price: '' });
//     const [imageFile, setImageFile] = useState(null);
//     const [cabinImages, setCabinImages] = useState({
//         luxury: null,
//         economy: null,
//         standard: null,
//     });

//     const handleCruiseChange = (e) => {
//         const { name, value } = e.target;
//         setCruiseData({ ...cruiseData, [name]: value });
//     };

//     const handleImageChange = (e) => {
//         setImageFile(e.target.files[0]);
//     };

//     const handleCabinImageChange = (classType) => (e) => {
//         setCabinImages({
//             ...cabinImages,
//             [classType]: e.target.files[0],
//         });
//     };

//     const handleCabinsByClassChange = (e) => {
//         const { name, value } = e.target;
//         const [classType, field] = name.split('.');
//         setCruiseData({
//             ...cruiseData,
//             cabins_by_class: {
//                 ...cruiseData.cabins_by_class,
//                 [classType]: {
//                     ...cruiseData.cabins_by_class[classType],
//                     [field]: field === 'places' ? parseInt(value) || 0 : value,
//                 },
//             },
//         });
//     };

//     const handleFeatureChange = (e) => {
//         const { name, value } = e.target;
//         setFeatureInput({ ...featureInput, [name]: value });
//     };

//     const addFeature = () => {
//         if (featureInput.name && featureInput.price) {
//             setCruiseData({
//                 ...cruiseData,
//                 features: [...cruiseData.features, { name: featureInput.name, price: parseFloat(featureInput.price) || 0 }],
//             });
//             setFeatureInput({ name: '', price: '' });
//         }
//     };

//     const removeFeature = (index) => {
//         setCruiseData({
//             ...cruiseData,
//             features: cruiseData.features.filter((_, i) => i !== index),
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         try {
//             const formData = new FormData();
//             formData.append('name', cruiseData.name);
//             formData.append('description', cruiseData.description);
//             formData.append('river', cruiseData.river);
//             formData.append('cabins', parseInt(cruiseData.cabins) || 0);
//             formData.append('price_per_person', parseFloat(cruiseData.price_per_person) || 0);
//             formData.append('total_distance', parseFloat(cruiseData.total_distance) || 0);
//             formData.append('panorama_url', cruiseData.panorama_url || '');

//             if (imageFile) {
//                 formData.append('image', imageFile);
//             }

//             const cabinsByClass = {
//                 luxury: { places: cruiseData.cabins_by_class.luxury.places },
//                 economy: { places: cruiseData.cabins_by_class.economy.places },
//                 standard: { places: cruiseData.cabins_by_class.standard.places },
//             };
//             ['luxury', 'economy', 'standard'].forEach((classType) => {
//                 if (cabinImages[classType]) {
//                     formData.append(`${classType}_image`, cabinImages[classType]);
//                 }
//             });
//             formData.append('cabins_by_class', JSON.stringify(cabinsByClass));

//             formData.append('features', JSON.stringify(cruiseData.features));

//             // Логируем содержимое FormData
//             console.log('Отправляемые данные круиза:');
//             for (let [key, value] of formData.entries()) {
//                 console.log(`${key}: ${value}`);
//             }

//             const cruiseResponse = await fetch(`${API_BASE_URL}/api/cruises`, {
//                 method: 'POST',
//                 body: formData,
//                 mode: 'no-cors',
//             });

//             if (!cruiseResponse.ok) {
//                 const errorText = await cruiseResponse.text();
//                 throw new Error(`Ошибка при создании круиза: ${cruiseResponse.status} - ${errorText}`);
//             }

//             const createdCruise = await cruiseResponse.json();
//             console.log('Созданный круиз:', createdCruise);

//             setCruiseData({
//                 name: '',
//                 description: '',
//                 river: '',
//                 cabins: '',
//                 price_per_person: '',
//                 total_distance: '',
//                 panorama_url: '',
//                 cabins_by_class: {
//                     luxury: { places: 0 },
//                     economy: { places: 0 },
//                     standard: { places: 0 },
//                 },
//                 features: [],
//             });
//             setImageFile(null);
//             setCabinImages({ luxury: null, economy: null, standard: null });

//             onSubmit(createdCruise);
//             alert('Круиз успешно создан! Теперь добавьте расписание через соответствующую форму.');
//         } catch (error) {
//             console.error('Ошибка:', error);
//             alert(error.message);
//         }
//     };

//     return (
//         <div className={styles.componentContainer}>
//             <form onSubmit={handleSubmit} className={styles.formContainer}>
//                 <h3>Создание круиза</h3>

//                 <div className={styles.inputGroup}>
//                     <label>Название</label>
//                     <input
//                         type="text"
//                         name="name"
//                         value={cruiseData.name}
//                         onChange={handleCruiseChange}
//                         className={styles.inputField}
//                         required
//                     />
//                 </div>

//                 <div className={styles.inputGroup}>
//                     <label>Описание</label>
//                     <textarea
//                         name="description"
//                         value={cruiseData.description}
//                         onChange={handleCruiseChange}
//                         className={styles.textareaField}
//                         required
//                     />
//                 </div>

//                 <div className={styles.inputGroup}>
//                     <label>Река</label>
//                     <input
//                         type="text"
//                         name="river"
//                         value={cruiseData.river}
//                         onChange={handleCruiseChange}
//                         className={styles.inputField}
//                         required
//                     />
//                 </div>

//                 <div className={styles.inputGroup}>
//                     <label>Количество кают</label>
//                     <input
//                         type="number"
//                         name="cabins"
//                         value={cruiseData.cabins}
//                         onChange={handleCruiseChange}
//                         className={styles.inputField}
//                         required
//                         min="1"
//                     />
//                 </div>

//                 <div className={styles.inputGroup}>
//                     <label>Цена за человека (руб.)</label>
//                     <input
//                         type="number"
//                         name="price_per_person"
//                         value={cruiseData.price_per_person}
//                         onChange={handleCruiseChange}
//                         className={styles.inputField}
//                         required
//                         min="0"
//                         step="0.01"
//                     />
//                 </div>

//                 <div className={styles.inputGroup}>
//                     <label>Длительность (км)</label>
//                     <input
//                         type="number"
//                         name="total_distance"
//                         value={cruiseData.total_distance}
//                         onChange={handleCruiseChange}
//                         className={styles.inputField}
//                         required
//                         min="0"
//                         step="0.1"
//                     />
//                 </div>

//                 <div className={styles.inputGroup}>
//                     <label>Основное изображение круиза</label>
//                     <input
//                         type="file"
//                         name="image"
//                         onChange={handleImageChange}
//                         className={styles.inputField}
//                         accept="image/*"
//                     />
//                 </div>

//                 <div className={styles.inputGroup}>
//                     <label>URL панорамы</label>
//                     <input
//                         type="text"
//                         name="panorama_url"
//                         value={cruiseData.panorama_url}
//                         onChange={handleCruiseChange}
//                         className={styles.inputField}
//                         required
//                     />
//                 </div>

//                 <div className={styles.inputGroup}>
//                     <label>Особенности</label>
//                     <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
//                         <input
//                             type="text"
//                             name="name"
//                             value={featureInput.name}
//                             onChange={handleFeatureChange}
//                             placeholder="Название особенности"
//                             className={styles.inputField}
//                         />
//                         <input
//                             type="number"
//                             name="price"
//                             value={featureInput.price}
//                             onChange={handleFeatureChange}
//                             placeholder="Цена (руб.)"
//                             className={styles.inputField}
//                             step="0.01"
//                         />
//                         <button type="button" onClick={addFeature} className={styles.button}>
//                             Добавить
//                         </button>
//                     </div>
//                     {cruiseData.features.length > 0 && (
//                         <ul>
//                             {cruiseData.features.map((feature, index) => (
//                                 <li key={index}>
//                                     {feature.name} - {feature.price} руб.
//                                     <button
//                                         type="button"
//                                         onClick={() => removeFeature(index)}
//                                         className={styles.deleteButton}
//                                         style={{ marginLeft: '10px' }}
//                                     >
//                                         Удалить
//                                     </button>
//                                 </li>
//                             ))}
//                         </ul>
//                     )}
//                 </div>

//                 <div className={styles.inputGroup}>
//                     <label>Каюты по классам</label>
//                     {['luxury', 'economy', 'standard'].map((classType) => (
//                         <div key={classType} style={{ marginBottom: '10px' }}>
//                             <h4>{classType.charAt(0).toUpperCase() + classType.slice(1)}</h4>
//                             <div style={{ display: 'flex', gap: '10px' }}>
//                                 <input
//                                     type="number"
//                                     name={`${classType}.places`}
//                                     value={cruiseData.cabins_by_class[classType].places}
//                                     onChange={handleCabinsByClassChange}
//                                     placeholder="Количество мест"
//                                     className={styles.inputField}
//                                     min="0"
//                                 />
//                                 <input
//                                     type="file"
//                                     name={`${classType}_image`}
//                                     onChange={handleCabinImageChange(classType)}
//                                     className={styles.inputField}
//                                     accept="image/*"
//                                 />
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 <button type="submit" className={styles.button}>Создать круиз</button>
//             </form>
//         </div>
//     );
// };

// export default CreateCruiseForm;