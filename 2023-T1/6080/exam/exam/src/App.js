import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './dashboard';
import Wordcolour from './wordcolour';
import Frogger from './frogger';
import Findaword from './findaword';
import SideBar from './components/sideBar';
import Footer from './components/footer';

function App() {
  return (
    <BrowserRouter id="root">
      <SideBar/>
      <Routes>
        <Route path="/" element={<Dashboard/>}/>
        <Route path='*' element={<Dashboard/>}/>
        <Route path="/home" element={<Dashboard/>}/>
        <Route path="/wordcolour" element={<Wordcolour/>} />
        <Route path="/frogger" element={<Frogger/>}/>
        <Route path="/findaword" element={<Findaword/>} />
      </Routes>
      <Footer/>
    </BrowserRouter>
  );
}

export default App;

