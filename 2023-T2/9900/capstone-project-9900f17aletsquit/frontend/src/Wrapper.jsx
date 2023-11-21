import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import Site from './components/Site';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import MyBookings from './components/MyBookings/MyBookings';
import MyProfile from './components/MyProfile/MyProfile';
import FindASpot from './components/FindASpot/FindASpot';
import MySpot from './components/MySpot/MySpot';
import InviteFriend from './components/IAF/InviteFriend';
import MyWallet from './components/MyWallet/MyWallet';
import AdminSignIn from './components/AdminLogin';
import ViewMyProfile from './components/MyProfile/ViewProfile';
import AddSpot from './components/MySpot/AddSpot';
import SpotBooking from './components/SpotDetail/SpotBooking'
import MySpotDetail from './components/MySpot/MySpotDetail';
import Bookingdetail from './components/MyBookings/Bookingdetail';

function Wrapper () {
  // const [page, setPage] = React.useState('signup');
  const [token, setToken] = React.useState(null);
  const [globalLoad, setGlobalLoad] = React.useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  console.log(token);

  function manageTokenSet (token) {
    setToken(token);
    localStorage.setItem('token', token);
  }

  React.useEffect(function () {
    if (localStorage.getItem('token')) {
      setToken(localStorage.getItem('token'));
      if (['/signup', '/signin'].includes(location.pathname)) {
        navigate('/');
      }
    } else {
      if (!['/signup', '/signin'].includes(location.pathname)) {
        navigate('signin');
      }
    }
    setGlobalLoad(false);
  }, []);

  if (globalLoad) {
    return <>Loading...</>
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Site setToken = {setToken} />}>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn onSuccess = {manageTokenSet} />} />
          <Route path="/adminsignin" element={<AdminSignIn onSuccess = {manageTokenSet} />} />
          <Route path="/mybookings" element={<MyBookings token = {token}/>} />
          <Route path="/editmyprofile" element={<MyProfile token = {token}/>} />
          <Route path="/myprofile" element={<ViewMyProfile token = {token}/>} />
          <Route path="/myspot" element={<MySpot token = {token}/>} />
          <Route path="/inviteafriend" element={<InviteFriend />} />
          <Route path="/mywallet" element={<MyWallet token = {token}/>} />
          <Route path="/findaspot" element={<FindASpot />} />
          <Route path="/addspot" element={<AddSpot token = {token}/>} />
          <Route path="/spotbooking/:carSpaceId" element={<SpotBooking token = {token}/>} />
          <Route path="/myspotdetail/:carSpaceId" element={<MySpotDetail />} />
          <Route path="/bookingdetail/:orderId" element={<Bookingdetail />} />
        </Route>
      </Routes>
    </>
  );
}

export default Wrapper;
