import MainScreen from '../components/MainScreen/MainScreen';
import Header from '../components/Header/Header';
import AboutUs from '../components/AboutUs/AboutUs';
import Advantages from '../components/Advantages/Advantages';
import CruiseList from '../components/CruiseList/CruisesList';
import BuyTicket from '../components/BuyTicket/BuyTicket';
import ServicesList from '../components/ServicesList/ServicesList';
import CruiseRoutes from '../components/CruiseRoutes/CruiseRoutes';
import Footer from '../components/Footer/Footer';


export default function Home() {
    return (
        <>
            <Header />
            <MainScreen />
            <AboutUs />
            <Advantages />
            <CruiseList />
            <BuyTicket />
            <ServicesList />
            <CruiseRoutes />
            <Footer />
        </>
    );
}
