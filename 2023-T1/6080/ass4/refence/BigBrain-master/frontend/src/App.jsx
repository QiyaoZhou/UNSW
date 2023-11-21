import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// MUI components
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Own components
import RegisterPage from './pages/admin/RegisterPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import EditGamePage from './pages/admin/EditGamePage';
import HomePage from './pages/admin/HomePage';
import QuestionEditPage from './pages/admin/QuestionEditPage';
import QuestionControlPage from './pages/admin/QuestionControlPage';
import JoinPage from './pages/player/JoinPage';
import GamePlayPage from './pages/player/GamePlayPage';
import PlayerGameResultPage from './pages/player/PlayerGameResultPage';
import AdminGameResultPage from './pages/admin/AdminGameResultPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3AA3A0'
    },
    secondary: {
      main: '#F6C324',
      contrastText: '#3AA3A0'
    },
    last: {
      main: '#6b6d70',
      contrastText: '#ffffff'
    }
  }
});

function App () {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/edit/:gameId' element={<EditGamePage />} />
          <Route path='/edit/:gameId/question-edit' element={<QuestionEditPage />} />
          <Route path='/edit/:gameId/:questionId' element={<QuestionEditPage />} />
          <Route path='/admin/:gameId/:questionId' element={<QuestionControlPage />} />
          <Route path='/player/join/:sessionId' element={<JoinPage />} />
          <Route path='/player/:playerId/:sessionId' element={<GamePlayPage />} />
          <Route path='/player/:sessionId/:playerId/results' element={<PlayerGameResultPage />} />
          <Route path='/admin/:sessionId/results' element={<AdminGameResultPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
