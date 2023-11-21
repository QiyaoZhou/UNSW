import React, { useState } from 'react';
import { Typography, Avatar, Box, Paper, Grid, Button, TextField } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmailIcon from '@mui/icons-material/Email';

function MyWallet ({ token }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [userImage, setUserImage] = useState('');
  const [walletExtra1, setWalletExtra1] = useState(0.0);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [ccv, setCcv] = useState('');
  const [topup, setTopup] = useState('');
  const [cardNumberError, setCardNumberError] = useState(false);
  const [cardNameError, setCardNameError] = useState(false);
  const [expiryDateError, setExpiryDateError] = useState(false);
  const [ccvError, setCcvError] = useState(false);

  async function getProfile () {
    const response = await fetch('http://127.0.0.1:8800/user/sendProfile', {
      method: 'GET',
      headers: {
        token: token,
      },
    });
    const data = await response.json();
    setEmail(data.email);
    setUsername(data.username);
    setUserImage(data.userimage);
    setWalletExtra1(parseFloat(data.walletExtra));
  }

  React.useEffect(() => {
    getProfile(token);
  }, [token]);

  const topup1 = parseInt(topup, 10);
  const walletExtra = topup1 + walletExtra1;

  async function recharge () {
    await fetch('http://127.0.0.1:8800/user/editProfile', {
      method: 'PUT',
      headers: {
        token: token,
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        walletExtra,
      }),
    });
    getProfile(token);
  }

  const handleRecharge = () => {
    let hasError = false;

    if (!cardNumber || !cardNumber.match(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/)) {
      setCardNumberError(true);
      hasError = true;
    } else {
      setCardNumberError(false);
    }

    if (!cardName || !cardName.match(/^[a-zA-Z\s]+$/)) {
      setCardNameError(true);
      hasError = true;
    } else {
      setCardNameError(false);
    }

    if (!expiryDate || !expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      setExpiryDateError(true);
      hasError = true;
    } else {
      setExpiryDateError(false);
    }

    if (!ccv || !ccv.match(/^\d{3}$/)) {
      setCcvError(true);
      hasError = true;
    } else {
      setCcvError(false);
    }

    if (!hasError) {
      recharge();
      // Perform the recharge logic here
      // You can access the cardNumber, cardName, expiryDate, and ccv values to process the recharge
    }
  };

  const validateCardNumber = (value) => {
    const numericValue = value.replace(/\s/g, '').replace(/\D/g, ''); // Remove spaces and non-digit characters
    let formattedValue = '';
    for (let i = 0; i < numericValue.length; i += 4) {
      formattedValue += numericValue.slice(i, i + 4) + ' ';
    }
    formattedValue = formattedValue.trim(); // Remove trailing space
    setCardNumber(formattedValue);
  };

  const handleExpiryDateChange = (value) => {
    const numericValue = value.replace(/\D/g, ''); // Remove non-digit characters

    let formattedValue = '';

    if (numericValue.length > 0) {
      formattedValue = numericValue.slice(0, 2); // Extract first two digits (MM)

      if (numericValue.length > 2) {
        formattedValue += '/' + numericValue.slice(2, 4); // Add '/' and next two digits (YY)
      }
    }

    setExpiryDate(formattedValue);
  };

  const validateCCV = (value) => {
    const numericValue = value.replace(/\D/g, ''); // Remove non-digit characters
    if (numericValue.length <= 3) {
      setCcv(numericValue);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Paper elevation={3} style={{ padding: '40px', maxWidth: '800px', display: 'flex' }}>
        <Box flex="1">
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
              <AccountBalanceWalletIcon />
            </Grid>
            <Grid item xs={11}>
              <Typography variant="body1"> You have {walletExtra1} remaining.</Typography>
            </Grid>
          </Grid>
        </Box>

        <Box flex="1" marginLeft={2}>
          <Box display="flex" flexDirection="column" alignItems="center" marginBottom={2}>
            <Typography variant="h6">Recharge Wallet</Typography>
            <TextField
              label="$"
              value={topup}
              onChange={(e) => setTopup(e.target.value)}
              margin="normal"
            />
            <TextField
              label="Card Number"
              value={cardNumber}
              onChange={(e) => validateCardNumber(e.target.value)}
              inputProps={{ maxLength: 19 }} // Increased the maximum length to accommodate spaces
              margin="normal"
              error={cardNumberError}
              helperText={cardNumberError && 'Invalid card number'}
            />
            <TextField
              label="Account Name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              margin="normal"
              error={cardNameError}
              helperText={cardNameError && 'Invalid account name'}
            />
            <TextField
              label="Expiry Date"
              value={expiryDate}
              onChange={(e) => handleExpiryDateChange(e.target.value)}
              inputProps={{ maxLength: 5 }} // Maximum length of 5 (MM/YY format)
              margin="normal"
              error={expiryDateError}
              helperText={expiryDateError && 'Invalid expiry date (MM/YY)'}
            />
            <TextField
              label="CCV"
              value={ccv}
              onChange={(e) => validateCCV(e.target.value)}
              inputProps={{ maxLength: 3 }}
              margin="normal"
              error={ccvError}
              helperText={ccvError && 'Invalid CCV'}
            />
            <br />
            <Button variant="contained" color="primary" onClick={handleRecharge}>
              Confirm Recharge
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default MyWallet;
