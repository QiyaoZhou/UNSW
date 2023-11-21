import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { IconButton, Avatar, Box, MenuItem, Select, InputLabel } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ImageIcon from '@mui/icons-material/Image';
import { useLocation, useNavigate } from 'react-router-dom';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

function EditSpot () {
  const location = useLocation();
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [size, setSize] = useState('');
  const [type, setType] = useState(0); // Updated: Initialize type with 0
  const [carspaceimage, setCarspaceimage] = useState(null);
  const carSpace = location.state?.carSpace;
  const carSpaceId = carSpace.carSpaceId;

  const navigate = useNavigate();

  async function editSpot () {
    await fetch('http://127.0.0.1:8800/carspace/update', {
      method: 'PUT',
      headers: {
        token: 1,
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        carSpaceId,
        price,
        address,
        size,
        type,
        carspaceimage,
      }),
    });
  }

  const handlePrice = (e) => {
    setPrice(e.target.value);
  };

  const handleAddress = (e) => {
    setAddress(e.target.value);
  };

  const handleSize = (e) => {
    setSize(e.target.value);
  };

  const handleType = (e) => {
    setType(e.target.value);
  };

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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    fileToDataUrl(file).then((base64Str) => {
      setCarspaceimage(base64Str);
      console.log(`:pspsps${base64Str}`);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    editSpot();
    console.log({
      price,
      address,
      size,
      type,
      carspaceimage,
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
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
              {carspaceimage
                ? (
                  <Avatar src={carspaceimage} />
                )
                : (
                  <ImageIcon fontSize="large" />
                )}
              <AddPhotoAlternateIcon />
            </IconButton>
          </label>
        </Box>

        <OutlinedInput
          id="outlined-adornment-amount"
          startAdornment={<InputAdornment position="start">$</InputAdornment>}
          label="Price"
          value={price}
          onChange={handlePrice}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
          }}
        />

        <TextField
          label="Address"
          variant="outlined"
          type="text"
          value={address}
          onChange={handleAddress}
          fullWidth
          margin="normal"
        />

        <Box
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
          marginBottom={2}
        >
          <TextField
            label="Size"
            variant="outlined"
            type="text"
            value={size}
            onChange={handleSize}
            margin="normal"
          />

          <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>

          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            onChange={handleType}
            style={{ minWidth: '100px', marginLeft: '8px' }}
            margin="normal"
          >
            <MenuItem value={0}>Type1</MenuItem>
            <MenuItem value={1}>Type2</MenuItem>
            <MenuItem value={2}>Type3</MenuItem>
          </Select>
        </Box>

        <Button type="submit" variant="contained" color="primary">
          Save
        </Button>{' '}
        &nbsp;&nbsp;&nbsp;
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={() => {
            navigate('/myspot');
          }}
        >
          Cancel
        </Button>
      </form>
    </>
  );
}

export default EditSpot;
