import React from 'react';
import TextField from '@mui/material/TextField';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { Box } from '@mui/system';
import { IconButton, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocalParkingIcon from '@mui/icons-material/LocalParking';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  textField: {
    marginBottom: '10px',
  },
  button: {
    marginBottom: '20px',
  },
  linkContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
    marginLeft: '5px',
  },
};

const styles2 = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  marginTop: '10px',
};

function SignIn ({ onSuccess }) {
  const [username, setUsername] = React.useState('');
  const [upassword, setUpassword] = React.useState('');
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  async function login () {
    try {
      const response = await fetch('http://localhost:8800/user/login', {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          upassword,
          username,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        onSuccess(data.token);
        console.log(`token:${data.token}`);
        navigate('/findaspot');
      } else {
        setError(data.message);
      }
    } catch (error) {
      if (error.message.includes('Login failed')) {
        setError('Incorrect Password!');
      } else {
        setError('Unknown Error!');
      }
    }
  }

  return (
    <>
      <div style={styles2}>
        <Typography variant="h4" component="div">
          <Box display="flex" alignItems="center">
            <LocalParkingIcon style={styles.titleIcon} />
            Car Space Renting
          </Box>
        </Typography>
      </div>
      <div style={styles.container}>
        <TextField
          id="outlined-basic"
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.textField}
        />
        <TextField
          id="outlined-password-input"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={upassword}
          onChange={(e) => setUpassword(e.target.value)}
          style={styles.textField}
          error={error === 'Incorrect Password!'}
          helperText={error === 'Incorrect Password!' ? 'Incorrect Password!' : null}
        />
        <Button variant="outlined" onClick={login} style={styles.button}>
          Sign in
        </Button>
        <Box style={styles.linkContainer}>
          <span>Not yet a user?</span>
          <Link to="/signup" style={styles.link}>
            Sign up now
          </Link>
        </Box>
      </div>
      <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
        <IconButton component={Link} to="/adminsignin" color="inherit">
          <PersonIcon />
        </IconButton>
      </Box>
    </>
  );
}

export default SignIn;
