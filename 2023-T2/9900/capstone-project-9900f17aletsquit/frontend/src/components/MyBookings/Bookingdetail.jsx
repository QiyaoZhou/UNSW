import React, { useState, useEffect } from 'react';
import { Typography, Avatar, Box, Grid, Accordion, AccordionSummary, AccordionDetails, TextField } from '@mui/material';
import Rating from '@mui/material/Rating';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLocation, useNavigate } from 'react-router-dom';
import Fab from '@mui/material/Fab';

function Bookingdetail () {
  const location = useLocation();
  const [userLocation, setUserLocation] = useState(null);
  const [distances, setDistances] = useState({});
  const [carSpace, setCarSpace] = useState({
    totalrank: 0, // Set an initial value for totalrank
  });
  const [curRank, setCurRank] = useState(5);
  const [historyComment, setHistoryComment] = useState('');
  const order = location.state?.order;
  const orderId = order.orderId;
  const [carSpaceId, setCarSpaceId] = useState('');
  const [comment, setComment] = useState([]);

  useEffect(() => {
    // Fetch car space address from the API using the carSpaceId
    const fetchCarSpaceData = async () => {
      const response = await fetch(`http://127.0.0.1:8800/carspace/query/${order.carSpaceId}`);
      const data = await response.json();
      setCarSpace(data);
      setCarSpaceId(data.carSpaceId);
    };
    fetchCarSpaceData();
  }, [order.carSpaceId]);

  const navigate = useNavigate();

  const handleGeolocationError = (error) => {
    console.error('Error getting geolocation:', error);
  };

  async function fetchComment (order) {
    // 从API获取pinglun
    const response = await fetch(`http://127.0.0.1:8800/carspace/searchAllComment/${order.carSpaceId}`, {
      method: 'GET',
      headers: {
      },
    });
    const data = await response.json();
    setComment(data);
  }

  fetchComment(order);

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

  const handleGeolocationSuccess = (position) => {
    const { latitude, longitude } = position.coords;
    setUserLocation({ lat: latitude, lng: longitude });
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleGeolocationSuccess, handleGeolocationError);
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
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2); // Return distance in kilometers with 2 decimal places
  };

  useEffect(() => {
    const updateDistances = async () => {
      if (userLocation) {
        const updatedDistances = {};
        const { lat: userLat, lng: userLng } = userLocation;
        const { lat: carLat, lng: carLng } = await getCoordinatesFromAddress(carSpace.address);
        if (carLat && carLng) {
          const distance = calculateDistance(userLat, userLng, carLat, carLng);
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DirectionsRunIcon sx={{ color: 'rgba(0, 0, 0, 0.6)', marginRight: '4px', fontSize: '2.0rem' }} />
          <Typography variant="body2" sx={{ fontSize: '1.5rem' }}>{distance} km away</Typography>
        </Box>
      );
    }
    return null;
  };

  const handleGoBack = () => {
    navigate('/mybookings');
  };

  const handleRatingChange = (event, newValue) => {
    setCurRank(newValue);
  };

  const handleCommentChange = (event) => {
    setHistoryComment(event.target.value);
  };

  async function handleAddCommentAndRating () {
    const response = await fetch('http://127.0.0.1:8800/order/rankYourOrder', {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        carSpaceId,
        curRank,
        historyComment,
      }),
    });
    const data = await response.text();
    console.log(data);
    alert(data);
  }

  return (
    <Grid container spacing={0} sx={{ height: '100vh' }}>
      <Grid item xs={12} sm={2} />
      <Grid item xs={12} sm={8}>
        <Box display="flex" justifyContent="center" alignItems="center" height="70%">
          <Avatar
            src={carSpace.carspaceimage}
            sx={{ width: '800px', height: '600px', marginBottom: '16px' }}
            variant="square"
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', top: '10%', right: '15%' }}>
            <Fab color="inherit" onClick={handleGoBack} aria-label="back">
              <ArrowBackIcon fontSize="large" />
            </Fab>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '20px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h3">
              {carSpace.address}
            </Typography>
            {renderDistance()}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Rating
              name={`carSpace-rating-${carSpace.carSpaceId}`}
              value={carSpace.totalrank}
              defaultValue={0} // Set the default value here as well
              precision={0.5}
              readOnly
              sx={{ fontSize: '2.5rem' }}
            />
          </Box>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            Number of Ratings: {carSpace.ranknum}
          </Typography>
          <Typography variant="body1">
            Size:{' '}
            {carSpace.size}
          </Typography>
          <Typography variant="body1">
            Type:{' '}
            {carSpace.type}
          </Typography>
          <Typography variant="body1">
            Price:{' '}
            {carSpace.price}
          </Typography>
          {/* Form for submitting comments and ratings */}
          <Box sx={{ marginTop: '16px' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Add Your Comment and Rating
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating
                name={`add-rating-${carSpace.carSpaceId}`}
                value={curRank}
                precision={0.5}
                onChange={handleRatingChange}
              />
              <Typography variant="body2" sx={{ marginLeft: '8px' }}>
                {curRank}
              </Typography>
            </Box>
            <TextField
              label="Your Comment"
              variant="outlined"
              multiline
              rows={4}
              fullWidth
              value={historyComment}
              onChange={handleCommentChange}
              sx={{ marginTop: '8px' }}
            />
            <Fab
              variant="extended"
              color="primary"
              onClick={handleAddCommentAndRating}
              sx={{ marginTop: '16px' }}
            >
              Submit
            </Fab>
          </Box>
          <Accordion sx={{ marginTop: '16px' }}>
            <AccordionSummary>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
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
        </Box>
      </Grid>
      <Grid item xs={12} sm={2} />
    </Grid>
  );
}

export default Bookingdetail;
