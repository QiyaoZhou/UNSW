import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// MUI components
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

const PlayerResult = ({ num, isCorrect }) => {
  return (
    <Wrapper>
      <Title>{`Question ${num}`}</Title>
      <Performance>
        { isCorrect
          ? (<CheckIcon color='primary' fontSize='large'/>)
          : (<ClearIcon color='primary' fontSize='large'/>)
        }
      </Performance>
    </Wrapper>
  )
}

export default PlayerResult;

PlayerResult.propTypes = {
  num: PropTypes.any,
  isCorrect: PropTypes.any
}

const Wrapper = styled.div`
  display: flex;
  gap: 2rem;
  width: 80vw;
  height: 60px;
  background-color: #F6C324;
  box-shadow: rgba(0, 0, 0, 0.50) 1.95px 1.95px 2.6px;
  border-radius: 5px;
`;

const Title = styled.h2`
  margin: auto;
  margin-left: 2rem;
  color: #3AA3A0;
`;

const Performance = styled.div`
  margin: auto;
  margin-right: 2rem;
`;
