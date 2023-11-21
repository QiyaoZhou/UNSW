import React, { useState, useEffect } from 'react';
import { Typography, Avatar, Box, Paper, Grid, Button, TextField, Divider, Select, MenuItem } from '@mui/material';
import Rating from '@mui/material/Rating';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import { useNavigate } from 'react-router-dom';

function FindASpot () {
  const [carSpaces, setCarSpaces] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [distances, setDistances] = useState({});
  const [sortOption, setSortOption] = useState('distance');

  const navigate = useNavigate();

  const distancesUpdatedRef = React.useRef(false);

  useEffect(() => {
    fetchCarSpaces();
  }, []);

  useEffect(() => {
    if (!isGoogleMapsLoaded) {
      loadGoogleMapsAPI().then(() => {
        setIsGoogleMapsLoaded(true);
      });
    }
  }, [isGoogleMapsLoaded]);

  useEffect(() => {
    if (isGoogleMapsLoaded) {
      const map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 10,
      });

      if (userLocation) {
        const userMarker = new window.google.maps.Marker({
          position: userLocation,
          title: 'Your Location',
        });
        userMarker.setMap(map);
        map.setCenter(userLocation);
      }

      carSpaces.forEach(async (carSpace) => {
        const { lat, lng } = await getCoordinatesFromAddress(carSpace.address);

        const marker = new window.google.maps.Marker({
          position: { lat, lng },
          title: carSpace.address,
          map: map,
        });

        const infowindow = new window.google.maps.InfoWindow({
          content: getCarSpaceInfoWindowContent(carSpace),
        });

        marker.addListener('click', () => {
          infowindow.open(map, marker);
        });
      });
    }
  }, [carSpaces, userLocation, isGoogleMapsLoaded]);

  async function fetchCarSpaces () {
    try {
      const response = await fetch('http://127.0.0.1:8800/carspace/queryAll');
      const data = await response.json();
      setCarSpaces(data);
    } catch (error) {
      console.error('Error fetching car spaces:', error);
    }
  }

  async function getCoordinatesFromAddress (address) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address.replace(/\s+/g, '+')
        )}&key=AIzaSyA-iW-2jlSRzjzw5MJxW3z9oeKS-xgPKuQ`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const lat = data.results[0].geometry.location.lat;
        const lng = data.results[0].geometry.location.lng;
        return { lat, lng };
      } else {
        throw new Error('Unable to geocode the address.');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  const loadGoogleMapsAPI = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
      } else {
        const script = document.createElement('script');
        script.src =
          'https://maps.googleapis.com/maps/api/js?key=AIzaSyA-iW-2jlSRzjzw5MJxW3z9oeKS-xgPKuQ&callback=initMap';
        script.async = true;
        script.defer = true;
        script.onerror = reject;
        window.initMap = resolve;
        document.head.appendChild(script);
      }
    });
  };

  const handleGeolocationSuccess = (position) => {
    const { latitude, longitude } = position.coords;
    setUserLocation({ lat: latitude, lng: longitude });
  };

  const handleGeolocationError = (error) => {
    console.error('Error getting geolocation:', error);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleGeolocationSuccess, handleGeolocationError);
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const getCarSpaceInfoWindowContent = (carSpace) => {
    return `
      <div>
        <Typography variant="body1">${carSpace.address}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Button variant="contained" color="primary">
            Book for $${carSpace.price}/hour
          </Button>
        </Box>
      </div>`
    ;
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const filteredCarSpaces = carSpaces.filter((carSpace) =>
    carSpace.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      if (!distancesUpdatedRef.current && userLocation) {
        distancesUpdatedRef.current = true; // Set the flag to prevent further updates
        const updatedDistances = {};
        for (const carSpace of filteredCarSpaces) {
          const { lat: userLat, lng: userLng } = userLocation;
          const { lat: carLat, lng: carLng } = await getCoordinatesFromAddress(carSpace.address);
          if (carLat && carLng) {
            const distance = calculateDistance(userLat, userLng, carLat, carLng);
            updatedDistances[carSpace.carSpaceId] = distance;
          }
        }
        setDistances(updatedDistances);
      }
    };
    updateDistances();
  }, [filteredCarSpaces, userLocation]);

  const renderDistance = (carSpace) => {
    const distance = distances[carSpace.carSpaceId];
    if (distance) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <DirectionsRunIcon sx={{ color: 'rgba(0, 0, 0, 0.6)', marginRight: '4px' }} />
          <Typography variant="body2">{distance} km away</Typography>
        </Box>
      );
    }
    return null;
  };

  const sortedCarSpaces = [...filteredCarSpaces];

  if (sortOption === 'distance') {
    sortedCarSpaces.sort((a, b) => {
      const distanceA = distances[a.carSpaceId];
      const distanceB = distances[b.carSpaceId];
      if (distanceA && distanceB) {
        return distanceA - distanceB;
      } else {
        return 0;
      }
    });
  } else if (sortOption === 'price') {
    sortedCarSpaces.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'rating') {
    sortedCarSpaces.sort((a, b) => b.totalrank - a.totalrank); // Sort by rating (descending)
  }

  return (
    <Grid container spacing={0} sx={{ height: '100vh' }}>
      <Grid item xs={12} sm={5} md={4} lg={3} sx={{ zIndex: 1, overflow: 'auto', maxHeight: '100vh' }}>
        {/* Left Sidebar */}
        <Box sx={{ padding: '20px', height: '100%' }}>
          {/* Search */}
          <Typography variant="body1" sx={{ color: 'rgba(0, 0, 0, 0.6)', marginBottom: '8px' }}>
            FIND PARKING AT
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SearchIcon sx={{ color: 'rgba(0, 0, 0, 0.6)', marginRight: '8px' }} />
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={handleSearch}
              fullWidth
              margin="dense"
            />
          </Box>
          <Divider variant="middle" sx={{ marginY: '20px' }} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Sort By */}
            <Typography variant="body1" sx={{ color: 'rgba(0, 0, 0, 0.6)', marginRight: '8px' }}>
              Sort By:
            </Typography>
            <Select value={sortOption} onChange={handleSortChange} variant="outlined" size="small">
              <MenuItem value="distance">Distance</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="rating">Rating</MenuItem>
            </Select>
          </Box>
          {/* Car Spaces List */}
          <Box sx={{ overflowY: 'auto', maxHeight: 'calc(100vh - 268px)', marginTop: '20px' }}>
            {sortedCarSpaces.map((carSpace) => (
              <Paper
                key={carSpace.carSpaceId}
                elevation={3}
                sx={{
                  padding: '20px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Car Space Image */}
                <Avatar src={carSpace.carspaceimage} sx={{ width: '120px', height: '120px' }} variant="square" />
                <Box sx={{ marginTop: '16px', flexGrow: 1, width: '100%' }}>
                  {/* Car Space Details */}
                  <Typography variant="h6" sx={{ textAlign: 'center' }}>
                    {carSpace.address}
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: 'center', marginBottom: '8px' }}>
                    Size: {carSpace.size}
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: 'center', marginBottom: '8px' }}>
                    {carSpace.type}
                  </Typography>
                  {renderDistance(carSpace)}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  {/* Car Space Ratings */}
                  <Rating
                    name={`carSpace-rating-${carSpace.carSpaceId}`}
                    value={carSpace.totalrank}
                    precision={0.5}
                    readOnly
                    sx={{ marginBottom: '8px' }}
                  />
                  <Typography variant="body2">Number of Ratings: {carSpace.ranknum}</Typography>
                  {/* Book Button */}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      navigate(`/spotbooking/${carSpace.carSpaceId}`, { state: { carSpace } });
                    }}
                    sx={{ marginTop: '8px' }}
                  >
                    Book for ${carSpace.price}/hour
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </Grid>
      <Grid item xs={12} sm={7} md={8} lg={9}>
        {/* Map */}
        <div id="map" style={{ width: '100%', height: '100vh' }} />
      </Grid>
    </Grid>
  );
}

export default FindASpot;
