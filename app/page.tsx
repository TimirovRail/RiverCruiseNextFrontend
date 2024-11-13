import MainScreen from '../components/MainScreen/MainScreen';
import Header from '../components/Header/Header';
import AboutUs from '../components/AboutUs/AboutUs';
import Advantages from '../components/Advantages/Advantages';
import CruiseList from '../components/CruiseList/CruisesList';
import CabinsList from '../components/CabinsList/CabinsList';

export default function Home() {
    return (
        <>
            <Header />
            <MainScreen />
            <AboutUs />
            <Advantages />
            <CruiseList />
            <CabinsList />
        </>
    );
}
