import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// MUI components
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const TypeSelector = ({ type, setType }) => {
  return (
    <Wrapper>
      <InputLabel>Question Type</InputLabel>
      <FormControl fullWidth>
      <Select
        style={{ background: 'white' }}
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <MenuItem value= {'Single Choice'} >Single Choice</MenuItem>
        <MenuItem value= {'Multiple Choice'}>Multiple Choice</MenuItem>
      </Select>
      </FormControl>
    </Wrapper>
  )
}

export default TypeSelector;

TypeSelector.propTypes = {
  type: PropTypes.any,
  setType: PropTypes.any
}

const Wrapper = styled.div`
  width: 45%;
  margin: 5px;
  minWidth: 165px;
`;
