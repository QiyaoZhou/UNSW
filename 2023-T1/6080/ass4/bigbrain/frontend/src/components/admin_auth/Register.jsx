import React, { useContext, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, Button, Container, Grid, IconButton, InputAdornment, Link, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { apiCall } from '../../functions/ApiCall';
import { setToken } from '../../functions/TokenFunctions';
import { UserContext } from '../../App';
import AlertBox from '../dialog/AlertBox';

export default function Register () {
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  });

  const navigate = useNavigate();
  const [input, setInput] = React.useState({
    name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = React.useState({
    name: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const handleAlertOpen = () => {
    setIsAlertOpen(true);
  }
  const handleAlertClose = () => {
    setIsAlertOpen(false);
  }
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (error.name.length || error.email.length || error.password.length || error.confirm_password.length) {
      return;
    }
    if (!input.name.length || !input.email.length || !input.password.length || !input.confirm_password.length) {
      return;
    }

    const data = new FormData(e.currentTarget);
    const payload = {
      name: data.get('name'),
      email: data.get('email'),
      password: data.get('password')
    }

    apiCall('admin/auth/register', 'POST', payload).then(function (data) {
      setToken(data.token);
      setUser(data.token);
      navigate('/dashboard');
    }).catch(function (data) {
      setErrorMessage(data);
      handleAlertOpen();
    });
  }

  const handleClickShowPassword = (e) => {
    e.preventDefault();

    setShowPassword(!showPassword);
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

      if (name === 'name') {
        if (!value) {
          stateObject[name] = 'Please enter a name';
        }
      } else if (name === 'email') {
        if (!value) {
          stateObject[name] = 'Please enter an email.';
        }
      } else if (name === 'password') {
        if (!value) {
          stateObject[name] = 'Please enter a password.';
        }
      } else if (name === 'confirm_password') {
        if (!value) {
          stateObject[name] = 'Please confirm your password.';
        } else if (input.password.length && input.password !== value) {
          stateObject[name] = 'Your passwords do not match.';
        }
      }

      return stateObject;
    });
  }

  const theme = createTheme();
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
          <SchoolIcon sx={{ m: 1 }}></SchoolIcon>
          <Typography component="h1" variant="h5">
            Register
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
            <TextField
              id="email"
              name="email"
              label="Email address"
              margin="normal"
              autoComplete="email"
              value={input.email}
              fullWidth
              onChange={handleInputChange}
              onBlur={validateInput}
              error={error.email.length > 0}
              helperText={error.email}
            />
            <TextField
              id="password"
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              autoComplete="new-password"
              value={input.password}
              fullWidth
              onChange={handleInputChange}
              onBlur={validateInput}
              error={error.password.length > 0}
              helperText={error.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                    >
                      {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              id="confirm_password"
              name="confirm_password"
              label="Confirm password"
              type='password'
              margin="normal"
              value={input.confirm_password}
              fullWidth
              onChange={handleInputChange}
              onBlur={validateInput}
              error={error.confirm_password.length > 0}
              helperText={error.confirm_password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Register
            </Button>
            <Grid container justifyContent={'center'}>
              <Grid item>
                <Typography display="inline" variant="body1">Already have an account?&nbsp;</Typography>
                <Link to="/login" component={RouterLink} display="inline" variant="body1">{'Log in'}</Link>
              </Grid>
            </Grid>
            <Grid container justifyContent={'center'} sx={{ mt: 1 }}>
              <Grid item>
                <Typography display="inline" variant="body1">Have a game code? Join&nbsp;</Typography>
                <Link to="/join" component={RouterLink} display="inline" variant="body1">{'here'}</Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
