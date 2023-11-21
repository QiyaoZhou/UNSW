import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiCall } from '../../functions/ApiCall';
import AlertBox from '../dialog/AlertBox';
import { Box, Container, ThemeProvider, Typography, useTheme } from '@mui/material';
import PendingIcon from '@mui/icons-material/Pending';
import useInterval from '../../functions/UseInterval';
import GameDisplay from './GameDisplay';

export default function Play () {
  const navigate = useNavigate();
  const { playerId } = useParams();

  const [started, setStarted] = React.useState(false);
  const [question, setQuestion] = React.useState(undefined);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [timeRemaining, setTimeRemaining] = React.useState(0);

  const handleAlertOpen = () => {
    setIsAlertOpen(true);
  }
  const handleAlertClose = () => {
    setIsAlertOpen(false);
    navigate('/join');
  }

  useInterval(async () => {
    if (playerId && !started) { // Poll backend to see if the game has been started
      console.log(started);
      apiCall(`play/${playerId}/status`, 'GET', {}).then(function (data) {
        if (data.started === true) {
          setStarted(true);
        }
      }).catch(function (data) {
        setErrorMessage(data);
        handleAlertOpen();
      });
    } else if (playerId && started && timeRemaining === 0) { // Poll backend to see if question has changed
      apiCall(`play/${playerId}/question`, 'GET', {}).then(function (data) {
        if (data.question.id !== question.id) {
          setQuestion(data.question);
          setTimeRemaining(data.question.time);
        }
      }).catch(function (data) {
        setErrorMessage(data);
        handleAlertOpen();
      });
    }
  }, 5000);

  React.useEffect(() => {
    if (started) {
      apiCall(`play/${playerId}/question`, 'GET', {}).then(function (data) {
        setQuestion(data.question);
        setTimeRemaining(data.question.time);
      }).catch(function (data) {
        setErrorMessage(data);
        handleAlertOpen();
      });
    }
  }, [started]);

  React.useEffect(() => {
    if (timeRemaining > 0) {
      setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
    }
  }, [timeRemaining]);

  const theme = useTheme();
  if (started && question) {
    return (
      <ThemeProvider theme={theme}>
        <AlertBox
          isOpen={isAlertOpen}
          severity={'warning'}
          title={'Error'}
          message={errorMessage}
          handleClose={handleAlertClose}
        />
        <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'column', mt: '70px' }}>
          <GameDisplay started={started} playerId={playerId} question={question} timeRemaining={timeRemaining}></GameDisplay>
        </Box>
      </ThemeProvider>
    );
  } else {
    return (
      <ThemeProvider theme={theme}>
        <Container>
          <AlertBox
            isOpen={isAlertOpen}
            severity={'warning'}
            title={'Error'}
            message={errorMessage}
            handleClose={handleAlertClose}
          />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <PendingIcon sx={{ m: 1 }}></PendingIcon>
              <Typography component="h1" variant="h5">Please wait</Typography>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }
}
