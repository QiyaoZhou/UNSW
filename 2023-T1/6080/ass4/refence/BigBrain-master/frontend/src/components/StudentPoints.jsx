import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StudentPoints = ({ name, points }) => {
  return (
    <Wrapper>
      <Name>{name}</Name>
      <Points>{`${points} Points`}</Points>
    </Wrapper>
  )
}

export default StudentPoints;

StudentPoints.propTypes = {
  name: PropTypes.any,
  points: PropTypes.any
}

const Wrapper = styled.div`
  display: flex;
  gap: 2rem;
  width: 20rem;
  height: 60px;
  background-color: #F6C324;
  box-shadow: rgba(0, 0, 0, 0.50) 1.95px 1.95px 2.6px;
  border-radius: 5px;
`;

const Name = styled.h2`
  margin: auto;
  margin-left: 2rem;
  color: #3AA3A0;
`;

const Points = styled.div`
  margin: auto;
  margin-right: 2rem;
  color: #3AA3A0;
  font-weight: bold;
  font-size: 20px;
`;
