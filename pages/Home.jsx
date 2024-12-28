import React from 'react';
import MainScreen from '../components/MainScreen/MainScreen';
import AboutUs from '../components/AboutUs/AboutUs';
import Advantages from '../components/Advantages/Advantages';
import CruiseList from '../components/CruiseList/CruisesList';

const Home = () => {
    return (
        <>
            <MainScreen />
            <AboutUs />
            <Advantages />
            <CruiseList />
        </>
    );
};

export default Home;
