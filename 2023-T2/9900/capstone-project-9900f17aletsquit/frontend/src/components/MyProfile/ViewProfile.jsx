import React, { useState } from 'react';
import { Typography, IconButton, Avatar, Box, TextField, Paper, Grid } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmailIcon from '@mui/icons-material/Email';
import HttpsIcon from '@mui/icons-material/Https';
import { useNavigate } from 'react-router-dom';

function ViewMyProfile ({ token }) {
  const [email, setEmail] = useState('');
  const [upassword, setUpassword] = useState('');
  const [username, setUsername] = useState('');
  const [birthday, setBirthday] = useState('');
  const [userImage, setUserImage] = useState('');
  const [walletExtra, setWalletExtra] = useState(0.0);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  async function getProfile (token) {
    try {
      const response = await fetch('http://127.0.0.1:8800/user/sendProfile', {
        method: 'GET',
        headers: {
          token: token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmail(data.email);
        setUpassword(data.upassword);
        setUsername(data.username);
        setBirthday(data.birthday?.split('T')[0] || ''); // Use optional chaining
        setUserImage(data.userimage);
        setWalletExtra(parseFloat(data.walletExtra));
      } else {
        console.error('Failed to fetch profile:', response.status);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  // 在组件加载时调用 getProfile 函数以初始化变量的值
  React.useEffect(() => {
    getProfile(token);
  }, [token]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Paper elevation={3} style={{ padding: '40px', maxWidth: '400px' }}>
        <Box textAlign="right">
          <IconButton
            aria-label="edit"
            color="primary"
            onClick={() => {
              navigate('/editmyprofile');
            }}
          >
            <EditIcon />
          </IconButton>
        </Box>

        <Box display="flex" flexDirection="column" alignItems="center" marginBottom={2}>
          <Avatar src={`${userImage}`} sx={{ width: '120px', height: '120px' }}>
            {!userImage && <AccountCircleIcon fontSize="large" />}
          </Avatar>
          <Typography variant="h5" marginTop="10px">
            {username}
          </Typography>
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={1}>
            <EmailIcon />
          </Grid>
          <Grid item xs={11}>
            <Typography variant="body1">{email}</Typography>
          </Grid>

          <Grid item xs={1}>
            <HttpsIcon />
          </Grid>
          <Grid item xs={11}>
            <TextField
              type={showPassword ? 'text' : 'password'}
              value={upassword}
              fullWidth
              readOnly
              onClick={() => {}}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleTogglePasswordVisibility} onMouseDown={(e) => e.preventDefault()}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
              margin="none"
            />
          </Grid>

          <Grid item xs={1}>
            <CalendarMonthIcon />
          </Grid>
          <Grid item xs={11}>
            <Typography variant="body1">{birthday}</Typography>
          </Grid>

          <Grid item xs={1}>
            <AccountBalanceWalletIcon />
          </Grid>
          <Grid item xs={11}>
            <Typography variant="body1">{walletExtra}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default ViewMyProfile;
