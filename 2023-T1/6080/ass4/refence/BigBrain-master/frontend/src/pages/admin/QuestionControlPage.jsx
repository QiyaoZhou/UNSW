import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

// Own components
import QuestionControl from '../../components/QuestionControl';

const QuestionControlPage = () => {
  const [questions, setQuestions] = React.useState([]);
  const [questionContext, setQuestionContext] = React.useState('');
  const [answersList, setAnswersList] = React.useState([]);
  const [timeLeft, setTimeLeft] = React.useState(0);
  const [media, setMedia] = React.useState('');
  const token = localStorage.getItem('token');
  const { gameId, questionId } = useParams();

  React.useEffect(() => {
    const getQuiz = () => {
      const init = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        }
      }
      fetch(`http://localhost:5005/admin/quiz/${gameId}`, init)
        .then(res => res.json())
        .then(body => {
          if (body.error) {
            console.log(body.error);
          } else {
            setQuestions(body.questions);
            const question = body.questions.filter(item => parseInt(item.id) === parseInt(questionId));
            setQuestionContext(question[0].question);
            setAnswersList(question[0].answersList);
            setTimeLeft(question[0].time);
            setMedia(question[0].media);
          }
        })
    }
    getQuiz();
  }, [questionId])
  return (
    <Wrapper>
        <QuestionControl
          questionContext={questionContext}
          answersList={answersList}
          timeLeft={timeLeft}
          media={media}
          setTimeLeft={setTimeLeft}
          questions={questions}/>
    </Wrapper>
  );
}

export default QuestionControlPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rem;
  background-color: #F0F0EF;
  height: auto;
  min-height: 100vh;
`;
