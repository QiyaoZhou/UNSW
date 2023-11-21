import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Own components
import GamePlay from '../../components/GamePlay';
import { initialValue } from '../../AppContext'

toast.configure();

const GamePlayPage = () => {
  const { playerId } = useParams();
  // 0 : waiting to start
  // 1 : active
  // 2 : end
  const [isStarted, setIsStarted] = React.useState(0);
  const [question, setQuestion] = React.useState({});
  const [questionContext, setQuestionContext] = React.useState('');
  const [answersList, setAnswersList] = React.useState([]);
  const [timeLeft, setTimeLeft] = React.useState(0);
  const [media, setMedia] = React.useState([]);
  // const [selectedAnswers,getSelectedAnswers] = React.useState([]);

  const [isAdvance, setIsAdvance] = React.useState(initialValue.isAdvance);
  console.log(setIsAdvance);

  React.useEffect(() => {
    const init = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
    fetch(`http://localhost:5005/play/${playerId}/status`, init)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setIsStarted(2);
        } else {
          getQuestion();
        }
      })
  }, [isAdvance])

  const getQuestion = () => {
    const init = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    fetch(`http://localhost:5005/play/${playerId}/question`, init)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setIsStarted(0)
        } else {
          setIsStarted(1);
          console.log(data);
          setQuestion(data.question);
          setQuestionContext(data.question.question);
          setAnswersList(data.question.answersList);
          setTimeLeft(data.question.time);
          setMedia(data.question.media);
        }
      })
  }
  return (
    <Wrapper>
      <GamePlay
        isStarted={isStarted}
        questionContext={questionContext}
        answersList={answersList}
        timeLeft={timeLeft}
        setTimeLeft={setTimeLeft}
        media={media}
        id={question.id}/>
    </Wrapper>
  );
}

export default GamePlayPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rem;
  background-color: #F0F0EF;
  height: auto;
  min-height: 100vh;
`;
