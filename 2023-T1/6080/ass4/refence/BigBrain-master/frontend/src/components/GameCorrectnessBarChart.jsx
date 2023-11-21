import React from 'react';
import styled from 'styled-components';

// Own components
import BarChart from './BarChart';

const GameCorrectnessBarChart = () => {
  const BarChartData = {
    labels: ['Question 1', 'Question 2', 'Question 3'],
    datasets: [{
      label: 'Num of correct players',
      data: [1, 2, 3],
      backgroundColor: ['#3AA3A0', '#F6C324']
    }]
  };
  return (
    <Wrapper>
      <BarChart chartData={BarChartData} />
    </Wrapper>
  )
}

export default GameCorrectnessBarChart;

const Wrapper = styled.div`
  margin-top: 5rem;
  margin-right: 10rem;
  width: 
`;
