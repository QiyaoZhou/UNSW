import React, { useState, useEffect } from 'react';
import { Typography, Avatar, Box, Grid, Button, Accordion, AccordionSummary, AccordionDetails, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Rating from '@mui/material/Rating';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { useLocation, useNavigate } from 'react-router-dom';

function SpotBooking ({ token }) {
  const location = useLocation();
  const [userLocation, setUserLocation] = useState(null);
  const [distances, setDistances] = useState({});
  const carSpace = location.state?.carSpace;
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [openDialog, setOpenDialog] = useState(false); // Dialog state
  const [totalDays, setTotalDays] = useState(0); // Total rental days state
  const [comment, setComment] = useState([]);

  const navigate = useNavigate();
  const providerId = carSpace.userId;
  const carSpaceId = carSpace.carSpaceId;
  const sum = totalDays * carSpace.price;
  const customerId = parseInt(token, 10);

  const today = new Date().toLocaleDateString();

  const handleBooking = (e) => {
    if (!fromTime || !toTime) {
      alert('Please select both start and end dates.');
      return;
    }

    const start = new Date(fromTime);
    const end = new Date(toTime);

    if (end < start) {
      alert('End date cannot be earlier than start date.');
      return;
    }

    setOpenDialog(true); // Open the dialog when booking button is clicked
    const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    setTotalDays(totalDays); // Calculate and set the total number of days
  };

  async function confirmBooking () {
    console.log(fromTime,
      toTime,
      customerId,
      providerId,
      carSpaceId,
      sum);
    await fetch('http://127.0.0.1:8800/order/addOrder', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        fromTime,
        toTime,
        customerId,
        providerId,
        carSpaceId,
        sum,
      }),
    });
    alert('Booked successfilly!');
  }

  const handleCancel = () => {
    navigate('/findaspot');
    // Handle cancel logic
  };

  const handleStartDateChange = (event) => {
    const date = event.target.value;
    // if (date < today) {
    //   alert('Start date cannot be earlier than the current date.');
    //   return;
    // }
    setFromTime(date);
  };

  const handleEndDateChange = (event) => {
    const date = event.target.value;
    setToTime(date);
  };

  const handleDialogClose = () => {
    setOpenDialog(false); // Close the dialog when the close button is clicked
  };

  const handleDialogConfirm = () => {
    confirmBooking();
    // Handle confirm logic, e.g., make API call to book the spot
    setOpenDialog(false); // Close the dialog after confirming
  };

  const handleGeolocationError = (error) => {
    console.error('Error getting geolocation:', error);
  };

  async function getCoordinatesFromAddress (address) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address.replace(/\s+/g, '+')
        )}&key=AIzaSyA-iW-2jlSRzjzw5MJxW3z9oeKS-xgPKuQ`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      } else {
        throw new Error('Unable to geocode the address.');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }
  async function fetchComment () {
    // 从API获取pinglun
    const response = await fetch(`http://127.0.0.1:8800/carspace/searchAllComment/${carSpaceId}`, {
      method: 'GET',
      headers: {
        token: token,
      },
    });
    const data = await response.json();
    setComment(data);
  }

  const handleGeolocationSuccess = (position) => {
    const { latitude, longitude } = position.coords;
    setUserLocation({ lat: latitude, lng: longitude });
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        handleGeolocationSuccess,
        handleGeolocationError
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2); // Return distance in kilometers with 2 decimal places
  };
  fetchComment();
  useEffect(() => {
    const updateDistances = async () => {
      if (userLocation) {
        const updatedDistances = {};
        const { lat: userLat, lng: userLng } = userLocation;
        const { lat: carLat, lng: carLng } = await getCoordinatesFromAddress(
          carSpace.address
        );
        if (carLat && carLng) {
          const distance = calculateDistance(
            userLat,
            userLng,
            carLat,
            carLng
          );
          updatedDistances[carSpace.carSpaceId] = distance;
        }
        setDistances(updatedDistances);
      }
    };
    updateDistances();
  }, [carSpace.address, userLocation]);

  const renderDistance = () => {
    const distance = distances[carSpace.carSpaceId];
    if (distance) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <DirectionsRunIcon
            sx={{
              color: 'rgba(0, 0, 0, 0.6)',
              marginRight: '4px',
              fontSize: '2.0rem',
            }}
          />
          <Typography variant="body2" sx={{ fontSize: '1.5rem' }}>
            {distance} km away
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Grid container spacing={0} sx={{ height: '100vh' }}>
      <Grid item xs={12} sm={2} />
      <Grid item xs={12} sm={8}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="60%"
        >
          <Avatar
            src={carSpace.carspaceimage}
            sx={{
              width: '800px',
              height: '600px',
              marginBottom: '16px',
            }}
            variant="square"
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            padding: '20px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h3">{carSpace.address}</Typography>
            {renderDistance()}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginTop: '8px',
            }}
          >
            <Rating
              name={`carSpace-rating-${carSpace.carSpaceId}`}
              value={carSpace.totalrank}
              precision={0.5}
              readOnly
              sx={{ fontSize: '2.5rem' }}
            />
          </Box>
          <Typography
            variant="body2"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            Number of Ratings: {carSpace.ranknum}
          </Typography>
          <Typography variant="body1">Size: {carSpace.size}</Typography>
          <Typography variant="body1">{carSpace.type}</Typography>
          <Accordion sx={{ marginTop: '16px' }}>
            <AccordionSummary>
              <Typography
                variant="body2"
                sx={{ fontWeight: 'bold' }}
              >
                Comments
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {comment.map((commentItem, index) => (
                <Typography key={index} variant="body2" sx={{ fontStyle: 'italic', marginBottom: '4px' }}>
                  {commentItem}
                </Typography>
              ))}
            </AccordionDetails>
          </Accordion>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '16px',
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: '8px',
                  }}
                >
                  <Typography
                    variant="body2"
                    align="center"
                    sx={{
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Rental start date:&nbsp;&nbsp;
                  </Typography>
                  <TextField
                    type="date"
                    value={fromTime}
                    onChange={handleStartDateChange}
                    variant="outlined"
                    size="large"
                  />
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: '16px',
                  }}
                >
                  <Typography
                    variant="body2"
                    align="center"
                    sx={{
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Rental end date:&nbsp;&nbsp;&nbsp;&nbsp;
                  </Typography>
                  <TextField
                    type="date"
                    value={toTime}
                    onChange={handleEndDateChange}
                    variant="outlined"
                    size="large"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleBooking}
                    sx={{ marginTop: '16px' }}
                  >
                    Book for ${carSpace.price}/hr
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleCancel}
                    sx={{ marginTop: '16px' }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Typography
            variant="body2"
            align="center"
            sx={{ marginTop: '16px' }}
          >
            Date of Today: {today}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} sm={2} />
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          <Typography>
            Rental start date: {fromTime}
          </Typography>
          <Typography>
            Rental end date: {toTime}
          </Typography>
          <Typography>
            Total days: {totalDays}
          </Typography>
          <Typography>
            Total price: ${totalDays * carSpace.price}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogConfirm} color="primary">
            Confirm
          </Button>
          <Button onClick={handleDialogClose} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default SpotBooking;
