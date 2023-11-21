import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Container, TextField, ThemeProvider, Typography, useTheme } from '@mui/material';
import AlertBox from '../dialog/AlertBox';
import { apiCall } from '../../functions/ApiCall';
import HowToRegIcon from '@mui/icons-material/HowToReg';

export default function Join () {
  const navigate = useNavigate();
  const { gameSession } = useParams();

  const [input, setInput] = React.useState({
    session_id: gameSession ?? '',
    name: ''
  });
  const [error, setError] = React.useState({
    session_id: '',
    name: ''
  });

  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleAlertOpen = () => {
    setIsAlertOpen(true);
  }
  const handleAlertClose = () => {
    setIsAlertOpen(false);
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInput(prev => ({
      ...prev,
      [name]: value
    }));
    validateInput(e);
  }

  const validateInput = (e) => {
    const { name, value } = e.target;
    setError(prev => {
      const stateObject = { ...prev, [name]: '' };

      if (name === 'session_id') {
        if (!value) {
          stateObject[name] = 'Please enter a game session ID';
        }
      } else if (name === 'name') {
        if (!value) {
          stateObject[name] = 'Please enter a name';
        }
      }
      return stateObject;
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (error.session_id.length || error.name.length) {
      return;
    }
    if (!input.session_id.length || !input.name.length) {
      return;
    }

    const data = new FormData(e.currentTarget);

    const session = data.get('session_id');
    const payload = {
      name: data.get('name')
    }

    apiCall(`play/join/${session}`, 'POST', payload).then(function (data) {
      navigate(`/play/${data.playerId}`);
    }).catch(function (data) {
      setErrorMessage(data);
      handleAlertOpen();
    });
  }

  const theme = useTheme();

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
          <HowToRegIcon sx={{ m: 1 }}></HowToRegIcon>
          <Typography component="h1" variant="h5">
            Join a game
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              id="session_id"
              name="session_id"
              label="Game session ID"
              margin="normal"
              autoComplete="one-time-code"
              value={input.session_id}
              fullWidth
              onChange={handleInputChange}
              onBlur={validateInput}
              error={error.session_id.length > 0}
              helperText={error.session_id}
            />
            <TextField
              id="name"
              name="name"
              label="Name"
              margin="normal"
              autoComplete="username"
              value={input.name}
              fullWidth
              onChange={handleInputChange}
              onBlur={validateInput}
              error={error.name.length > 0}
              helperText={error.name}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Join
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
