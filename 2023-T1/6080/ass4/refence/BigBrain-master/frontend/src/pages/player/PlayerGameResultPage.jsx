import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

// Own components
import PlayerResult from '../../components/PlayerResult';

const PlayerGameResultPage = () => {
  const { playerId } = useParams();
  const [answers, setAnswers] = React.useState([]);

  React.useEffect(() => {
    const init = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    fetch(`http://localhost:5005/play/${playerId}/results`, init)
      .then(res => res.json())
      .then(data => {
        setAnswers(data);
      })
  }, [])
  return (
    <Wrapper>
      <Title>Results</Title>
      {answers.length > 0 && answers.map((answer, index) => (
        <PlayerResult key={index} isCorrect={answer.correct} num={index + 1} />
      ))}
    </Wrapper>
  )
}

export default PlayerGameResultPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #3AA3A0;
  margin: auto;
  margin-top: 3rem;
`;
