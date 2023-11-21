import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/dashboard/Dashboard';
import EditGame from './components/dashboard/EditGame';
import ManageGame from './components/dashboard/ManageGame';
import SignIn from './components/admin_auth/SignIn';
import Register from './components/admin_auth/Register';
import Navbar from './components/navbar/Navbar';
import Join from './components/game/Join';
import Play from './components/game/Play';
import EditQuestion from './components/dashboard/EditQuestion';

export const UserContext = React.createContext('');

const App = () => {
  const [user, setUser] = React.useState(localStorage.getItem('token') ?? '');

  return (
    <BrowserRouter>
      <div className="app">
        <UserContext.Provider value={{ user: user, setUser: setUser }}>
          <Navbar/>
          <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/dashboard" element={<Dashboard/>}></Route>
            <Route path="/login" element={<SignIn/>}></Route>
            <Route path="/register" element={<Register/>}></Route>
            <Route path="/join" element={<Join/>}></Route>
            <Route path="/join/:gameSession" element={<Join/>}></Route>
            <Route path='/edit/:gameId' element={<EditGame/>}></Route>
            <Route path='/edit/:gameId/:questionId' element={<EditQuestion/>}></Route>
            <Route path='/play/:playerId' element={<Play/>}></Route>
            <Route path='/session/:gameId/:activeId' element={<ManageGame />}></Route>
          </Routes>
        </UserContext.Provider>
      </div>
    </BrowserRouter>
  );
}

export default App;
