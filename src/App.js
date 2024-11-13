import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header/Header';
import MainScreen from './components/MainScreen/MainScreen';
import AboutUs from './components/AboutUs/AboutUs';
import Advantages from './components/Advantages/Advantages';
import CruiseList from './components/CruiseList/CruisesList';
import CabinsList from './components/CabinsList/CabinsList';
import Cabin360View from './components/CabinsList/Cabin360View';
import axios from 'axios';

import Register from './pages/Register';
import Login from './pages/Login';

const App = () => {
    return (
        <Router>
            <Header />
            <Routes>
                <Route
                    path="/"
                    element={
                        <>
                            <MainScreen />
                            <AboutUs />
                            <Advantages />
                            <CruiseList />
                            <CabinsList />
                        </>
                    }
                />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cabin-view/:id" element={<Cabin360View />} /> {/* Добавляем маршрут для 360-градусного просмотра */}
            </Routes>
        </Router>
    );
};

const token = localStorage.getItem('token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default App;
