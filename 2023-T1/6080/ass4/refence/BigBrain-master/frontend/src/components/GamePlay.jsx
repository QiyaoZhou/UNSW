import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';

// Own components
import AnswerSelection from './AnswerSelection';
import ShowAnswers from './ShowAnswers';

// MUI components
import Fab from '@mui/material/Fab';
// import { Button } from '@mui/material';

const GamePlay = ({ isStarted, questionContext, answersList, timeLeft, setTimeLeft, media, id }) => {
  const { playerId, sessionId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = React.useState(false);
  const [selectedAnswers, setSelectedAnswers] = React.useState([]);

  React.useEffect(() => {
    isStarted === 2 && (navigate(`/player/${sessionId}/${playerId}/results`))
    // isStarted === 2 && (console.log('error'))
    isStarted === 0 && setStatus(false)
    isStarted === 1 && setStatus(true)
  }, [isStarted])
  React.useEffect(() => {
    if (timeLeft > 0) {
      const interval = window.setInterval(() => {
        setTimeLeft(s => s - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeLeft]);
  React.useEffect(() => {
    const requestBody = {
      answerIds: selectedAnswers
    }

    const init = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
    fetch(`http://localhost:5005/play/${playerId}/answer`, init)
      .then(res => res.json())
      .then(data => {
        console.log(data);
      })
  }, [selectedAnswers])

  return status
    ? (
    <Wrapper>
      <Logo>BigBrain!</Logo>
      <WebName>
        {`Question ${id}`}
      </WebName>
      <div>
        <Fab
          color="primary"
          aria-label="timeLeft"
          sx={{ width: '80px', height: '80px', position: 'fixed', right: '2rem', top: '3rem' }}
        >
          <p style={{ fontSize: '50px', margin: 'auto' }}>{timeLeft}</p>
        </Fab>
      </div>
      <QuestionArea>
        <QuestionContext>{questionContext}</QuestionContext>
      </QuestionArea>
      {media.length !== 0 && (<MediaArea><img src={media} alt="optinal image" /></MediaArea>)}
      <AnswerArea>
        {
          answersList && answersList.map((answer, index) => {
            if (timeLeft === 0) {
              return (answer.correct
                ? (
                    <ShowAnswers key={index} answer={answer} color={'secondary'} />
                  )
                : (
                    <ShowAnswers key={index} answer={answer} color={'last'} />
                  ));
            } else {
              return (
                <AnswerSelection
                  key={index}
                  answer={answer}
                  color={'primary'}
                  selectedAnswers={selectedAnswers}
                  setSelectedAnswers={setSelectedAnswers}
                  id={index}/>
              );
            }
          })
        }
      </AnswerArea>
    </Wrapper>
      )
    : (<Waiting>Start Soon...Please Wait...</Waiting>)
}

export default GamePlay;

GamePlay.propTypes = {
  isStarted: PropTypes.any,
  questionContext: PropTypes.any,
  answersList: PropTypes.any,
  timeLeft: PropTypes.any,
  setTimeLeft: PropTypes.any,
  media: PropTypes.any,
  id: PropTypes.any
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin: auto;
  margin-bottom: 50px;
  margin-top: 10rem;
  width: 75%;
`;

const Logo = styled.h1`
  position: absolute;
  top: 1rem;
  left: 2rem;
  color: #F6C324;
  cursor: pointer;
`;

const WebName = styled.h1`
  margin-left: 10px;
  font-size: 50px;
`;

const QuestionArea = styled.div`
  background: white;
  width: 90%;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.50) 1.95px 1.95px 2.6px;
  margin-top: 25px;
`;

const QuestionContext = styled.p`
  width: 95%;
  margin-left: auto;
  margin-right: auto;
  font-size: 25px;
  text-align: center;
`;

const MediaArea = styled.div`
  width: 90%;
  height: 300px;
  margin: auto;
  box-shadow: rgba(0, 0, 0, 0.50) 1.95px 1.95px 2.6px;
  border-radius: 5px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const AnswerArea = styled.div`
  margin-top: 20px;
  margin-bottom: 50px;
  width: 90%;
  border-radius: 5px;
  display: flex;
  flex-flow: row wrap;
`;

// const AnswerCard = styled.div`
// width: 45%;
// min-width: 200px;
// border-radius: 5px;
// margin: auto;
// margin-top: 5px;
// margin-bottom: 5px;
// box-shadow: rgba(0, 0, 0, 0.50) 1.95px 1.95px 2.6px;
// `;

// const AnswerContext = styled.p`
//   width: 90%;
//   margin-left: auto;
//   margin-right: auto;
//   margin-top: 5px;
//   margin-bottom: 5px;
//   font-size: 20px;
//   text-align: center;
// `;

const Waiting = styled.h1`
  margin: auto;
  color: #3AA3A0;
`;
