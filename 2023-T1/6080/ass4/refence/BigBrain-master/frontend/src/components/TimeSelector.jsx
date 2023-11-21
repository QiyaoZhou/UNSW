import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// MUI components
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const TimeSerlector = ({ setTime, time }) => {
  return (
    <Wrapper>
      <InputLabel>Time Limit</InputLabel>
      <FormControl fullWidth>
      <Select
        style={{ background: 'white' }}
        value={time}
        onChange={(e) => setTime(e.target.value)}
      >
        <MenuItem value= {5} >5 s</MenuItem>
        <MenuItem value= {10}>10 s</MenuItem>
        <MenuItem value= {20}>20 s</MenuItem>
        <MenuItem value= {30}>30 s</MenuItem>
        <MenuItem value= {60}>1 min</MenuItem>
        <MenuItem value= {90}>1 min 30 s</MenuItem>
        <MenuItem value= {120}>2 min</MenuItem>
        <MenuItem value= {240}>4 min</MenuItem>
      </Select>
      </FormControl>
    </Wrapper>
  )
}

export default TimeSerlector;

TimeSerlector.propTypes = {
  time: PropTypes.any,
  setTime: PropTypes.any
}

const Wrapper = styled.div`
  width: 45%;
  margin: 5px;
  minWidth: 165px;
`;
