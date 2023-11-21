import React, { useState, useEffect } from 'react';
import { Typography, Avatar, Box, Grid, Accordion, AccordionSummary, AccordionDetails, TextField } from '@mui/material';
import Rating from '@mui/material/Rating';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import { useLocation, useNavigate } from 'react-router-dom';
import Fab from '@mui/material/Fab';

function MySpotDetail () {
  const location = useLocation();
  const [userLocation, setUserLocation] = useState(null);
  const [distances, setDistances] = useState({});
  const carSpace = location.state?.carSpace;
  const [comment, setComment] = useState([]);

  const navigate = useNavigate();

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
    navigate('/myspot');
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({
    address: carSpace.address,
    carSpaceImage: carSpace.carspaceimage,
    size: carSpace.size,
    type: carSpace.type,
    price: carSpace.price
  });

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditData({
      address: carSpace.address,
      carSpaceImage: carSpace.carspaceimage,
      size: carSpace.size,
      type: carSpace.type,
      price: carSpace.price
    });
  };

  const handleSave = async () => {
    const { address, carSpaceImage, size, type, price } = editData;
    await fetch('http://127.0.0.1:8800/carspace/update', {
      method: 'PUT',
      headers: {
        token: 1,
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        carSpaceId: carSpace.carSpaceId,
        price,
        address,
        size,
        type,
        carspaceimage: carSpaceImage,
      }),
    });
    setIsEditMode(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  async function fetchComment (carspace) {
    // 从API获取pinglun
    const response = await fetch(`http://127.0.0.1:8800/carspace/searchAllComment/${carspace.carSpaceId}`, {
      method: 'GET',
      headers: {
      },
    });
    const data = await response.json();
    setComment(data);
  }
  fetchComment(carSpace);

  function fileToDataUrl (file) {
    const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const valid = validFileTypes.find((type) => type === file.type);
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    fileToDataUrl(file).then((base64Str) => {
      setEditData((prevData) => ({
        ...prevData,
        carSpaceImage: base64Str,
      }));
      console.log(`:pspsps${base64Str}`);
    });
  };

  return (
    <Grid container spacing={0} sx={{ height: '100vh' }}>
      <Grid item xs={12} sm={2} />
      <Grid item xs={12} sm={8}>
        <Box display="flex" justifyContent="center" alignItems="center" height="70%">
          <Avatar
            src={isEditMode ? editData.carSpaceImage : carSpace.carspaceimage}
            sx={{ width: '800px', height: '600px', marginBottom: '16px' }}
            variant="square"
          />
          {!isEditMode && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', top: '10%', right: '15%', marginLeft: '100px' }}>
              <Fab color="primary" aria-label="back" onClick={handleGoBack}>
                <ArrowBackIcon fontSize="large" />
              </Fab><br/>
              <Fab color="primary" aria-label="edit" onClick={handleEdit}>
                <EditIcon fontSize="large" />
              </Fab>
            </Box>
          )}
          {isEditMode && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', top: '10%', right: '15%', marginLeft: '100px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label htmlFor="carSpaceImage">
                  <input
                    type="file"
                    accept="image/*"
                    id="carSpaceImage"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  <Fab sx={{ backgroundColor: 'rgb(37,108,226)' }} aria-label="upload" component="span">
                    <EditIcon fontSize="large" />
                    <input
                      type="file"
                      accept="image/*"
                      id="carSpaceImage"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                  </Fab>
                </label><br/>
                <Fab sx={{ backgroundColor: 'rgb(79,223,83)' }} aria-label="save" onClick={handleSave}>
                  <CheckIcon fontSize="large" />
                </Fab><br/>
                <Fab sx={{ backgroundColor: 'rgb(243,43,62)' }} aria-label="cancel" onClick={handleCancel}>
                  <CancelIcon fontSize="large" />
                </Fab>
              </Box>
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', padding: '20px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h3">
              {isEditMode
                ? (
                  <TextField
                    name="address"
                    value={editData.address}
                    onChange={handleInputChange}
                    size="small"
                    multiline
                    rows={2}
                    fullWidth
                  />
                )
                : (
                  carSpace.address
                )}
            </Typography>
            {renderDistance()}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Rating
              name={`carSpace-rating-${carSpace.carSpaceId}`}
              value={carSpace.totalrank}
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
            {isEditMode
              ? (
                <TextField
                  name="size"
                  value={editData.size}
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                />
              )
              : (
                carSpace.size
              )}
          </Typography>
          <Typography variant="body1">
            Type:{' '}
            {isEditMode
              ? (
                <TextField
                  name="type"
                  value={editData.type}
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                />
              )
              : (
                carSpace.type
              )}
          </Typography>
          <Typography variant="body1">
            Price:{' '}
            {isEditMode
              ? (
                <TextField
                  name="price"
                  value={editData.price}
                  onChange={handleInputChange}
                  size="small"
                  fullWidth
                />
              )
              : (
                carSpace.price
              )}
          </Typography>
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

export default MySpotDetail;
