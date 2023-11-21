import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// MUI components
import { Button } from '@mui/material';

const ShowAnswers = ({ answer, color }) => {
  return (
    <AnswerCard>
      <Button fullWidth variant="contained" color={color} ><AnswerContext>{answer.answerContext}</AnswerContext></Button>
    </AnswerCard>
  )
}

export default ShowAnswers;

ShowAnswers.propTypes = {
  answer: PropTypes.any,
  color: PropTypes.any
}

const AnswerCard = styled.div`
width: 45%;
min-width: 200px;
border-radius: 5px;
margin: auto;
margin-top: 5px;
margin-bottom: 5px;
box-shadow: rgba(0, 0, 0, 0.50) 1.95px 1.95px 2.6px;
`;

const AnswerContext = styled.p`
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 5px;
  margin-bottom: 5px;
  font-size: 20px;
  text-align: center;
`;
