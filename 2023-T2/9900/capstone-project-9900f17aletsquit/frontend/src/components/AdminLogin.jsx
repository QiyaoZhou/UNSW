import React from 'react';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';

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

function AdminSignIn ({ onSuccess }) {
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
        <h2>Admin Sign In</h2>
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
        <Button variant="outlined" onClick={() => {
          navigate('/signin');
        }} style={styles.button}>
          Back to User Sign In
        </Button>
      </div>
    </>
  );
}

export default AdminSignIn;
