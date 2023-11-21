import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './dashboard';
import Blanko from './blanko';
import Slido from './slido';
import Tetro from './tetro';
import SideBar from './components/sideBar';
import Footer from './components/footer';

function App() {
  return (
    <BrowserRouter>
      <SideBar/>
      <Routes>
        <Route path="/" element={<Dashboard/>}/>
        <Route path='*' element={<Dashboard/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/blanko" element={<Blanko/>} />
        <Route path="/slido" element={<Slido/>}/>
        <Route path="/tetro" element={<Tetro/>} />
      </Routes>
      <Footer/>
    </BrowserRouter>
  );
}

export default App;
