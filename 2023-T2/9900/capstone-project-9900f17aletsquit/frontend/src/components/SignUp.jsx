import React from 'react';
import TextField from '@mui/material/TextField';
import { Link, useNavigate } from 'react-router-dom';
import { IconButton, Avatar, Box } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import Button from './Buttons';

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
};

const styles2 = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  marginTop: '10px',
};

function SignUp () {
  const [email, setEmail] = React.useState('');
  const [upassword, setUpassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [userimage, setUserimage] = React.useState(null);
  const [birthday, setBirthday] = React.useState('');
  const [invited, setInvited] = React.useState(null);

  const navigate = useNavigate();

  async function register () {
    await fetch('http://localhost:8800/user/register', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        upassword,
        userimage,
        birthday,
        invited,
      }),
    });
    navigate('/signin');
  }

  function fileToDataUrl (file) {
    const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg']
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
      throw Error('provided file is not a png, jpg or jpeg image.');
    }
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve, reject) => {
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    fileToDataUrl(file).then((base64Str) => {
      setUserimage(base64Str);
      console.log(`:pspsps${base64Str}`);
    })
  };

  const handleBirthdayChange = (e) => {
    setBirthday(e.target.value);
  };

  const validatePassword = () => {
    // Check if passwords match
    if (upassword !== confirmPassword) {
      alert("Passwords don't match");
      return false;
    }

    // Check if password meets requirements
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    if (!passwordRegex.test(upassword)) {
      alert(
        'Password must contain at least 6 characters, including one uppercase letter, one lowercase letter, and one digit.'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate passwords
    const isValidPassword = validatePassword();

    if (isValidPassword) {
      // Continue with registration
      register();
    }
  };

  return (
    <>
      <div style={styles2}><h2>Car Space Renting</h2></div>
      <div style={styles.container}>
        <Box display="flex" justifyContent="center" marginBottom={2}>
          <label htmlFor="photo-upload">
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
            <IconButton component="span">
              {userimage
                ? (
                  <Avatar src={userimage} />
                )
                : (
                  <AccountCircleIcon fontSize="large" />
                )}
              <AddPhotoAlternateIcon />
            </IconButton>
          </label>
        </Box>
        <TextField
          required
          id="outlined-required"
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.textField}
        />
        <TextField
          required
          id="outlined-password-input"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={upassword}
          onChange={(e) => setUpassword(e.target.value)}
          style={styles.textField}
        />
        <TextField
          required
          id="outlined-confirm-password-input"
          label="Confirm Password"
          type="password"
          autoComplete="current-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={styles.textField}
        />
        <TextField
          required
          id="outlined-required"
          label="Name"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.textField}
        />
        <TextField
          id="outlined-required"
          label="Your Friend's Email Address"
          variant="outlined"
          value={invited}
          onChange={(e) => setInvited(e.target.value)}
          style={styles.textField}
        />
        <TextField
          label="Birthday"
          variant="outlined"
          type="date"
          value={birthday}
          onChange={handleBirthdayChange}
          required
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            inputProps: { max: new Date().toISOString().split('T')[0] },
          }}
        />
        <Button variant="outlined" onClick={handleSubmit} style={styles.button}>
          Sign up
        </Button>
        <hr />
        <Link to="/signin">Already a user? Sign in now</Link>
      </div>
    </>
  );
}

export default SignUp;
