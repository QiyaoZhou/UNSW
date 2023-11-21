import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// MUI components
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const PointsSelector = ({ points, setPoints }) => {
  return (
    <Wrapper>
      <InputLabel>Points</InputLabel>
      <FormControl fullWidth>
      <Select
        style={{ background: 'white' }}
        value={points}
        onChange={(e) => setPoints(e.target.value)}>
        <MenuItem value= {1} >1</MenuItem>
        <MenuItem value= {2}>2</MenuItem>
        <MenuItem value= {5}>5</MenuItem>
        <MenuItem value= {10}>10</MenuItem>
        <MenuItem value= {20}>20</MenuItem>
        <MenuItem value= {50}>50</MenuItem>
      </Select>
      </FormControl>
    </Wrapper>
  )
}

export default PointsSelector;

PointsSelector.propTypes = {
  points: PropTypes.any,
  setPoints: PropTypes.any
}

const Wrapper = styled.div`
  width: 45%;
  margin: 5px;
  minWidth: 165px;
`;
