import React from 'react';
import {useState, useEffect} from 'react'; 
import ReactDOM from 'react-dom/client';
import './index.css';

import Login from './Components/SignIn/login';
import reportWebVitals from './reportWebVitals';
import Signup from './Components/SignIn/signup';
import NavAppBar from './Components/homeScreen/navBar';
import SearchBar from './Components/homeScreen/searchBar';

import HotelPage from './Components/hotelPage/hotelPage';

import DisplayHotel from './Components/hotelDisplay/displayHotelCard';
import {BrowserRouter, Routes, Route} from 'react-router-dom'; 
import Bookings from './Components/userBookingPage/userBookings'; 
import axios from 'axios';
import SearchResults from './Components/homeScreen/searchResult';

//Används för att hålla koll på globalt tillstånd i individuella komponenter
export const LoggedinContext = React.createContext<any>(false);
export const UsernameContext = React.createContext<any>("");


const booking = () => {
  return (
    <div>
    <NavAppBar/>
    <Bookings/>
    </div>
  )
}

const Application: React.FC = () => {
  const [loggedin, setLoggedin] = useState(false);
  const [globalUsername, setGlobalUsername] = useState("");

  axios.defaults.withCredentials = true;  
  useEffect(() => {
    const checkSession = async() => {
      //Every time app is rendered, try to authenticate to the server
      //If unsuccessful, set loggedIn-state to false. 

      try{
        const session = await axios.get("http://50.85.47.154:7700/api/user/session");    
        setLoggedin(true); 
      }
      catch {
        setLoggedin(false); 
      }
    }
    checkSession(); 
  }, []);

  //If user is not logged in, render only login and signup pages 
  if(!loggedin) {
    return (
      <div>
        <LoggedinContext.Provider value={{loggedin: loggedin, setLoggedin: setLoggedin}}>
          <UsernameContext.Provider value={{globalUsername, setGlobalUsername}}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/signup" element={<Signup/>}/>
                <Route path="*" element={<Login/>}/>
              </Routes>
            </BrowserRouter>
          </UsernameContext.Provider>
        </LoggedinContext.Provider>
      </div>
    )
  }

  //If user is logged in, render the full application
  else {
    return (
      <div>
      <LoggedinContext.Provider value={{loggedin: loggedin, setLoggedin: setLoggedin}}>
      <UsernameContext.Provider value={{globalUsername, setGlobalUsername}}>
        <BrowserRouter>
        <NavAppBar/>
        <Routes>
            <Route path="/" element={
              <div>
                <SearchBar/>
                <DisplayHotel/>
              </div>}/>
            <Route path="/mybookings" element={<Bookings/>}/>
           <Route path="navapp" element={<NavAppBar/>}/>
           <Route path="/hotelDetail/:hotelId" element={<HotelPage/>}/>
            <Route path="/search-results/*" element={<SearchResults/>}/>
            <Route path="*" element={
              <div>
                <SearchBar/>
                <DisplayHotel/>
              </div>
            }/>
          </Routes>
        </BrowserRouter>
        </UsernameContext.Provider>
        </LoggedinContext.Provider>
      </div>
    )
  }
}; 

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    {/*Ändra på elementet nedan för att rendera din komponent efter att ha importerat den  */}
    {<Application/>}
  </React.StrictMode>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(); 
