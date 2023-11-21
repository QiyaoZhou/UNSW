import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

// Own components
import Heading from '../../components/Heading';
import QuestionForm from '../../components/QuestionForm';

const QuestionEditPage = () => {
  const { gameId, questionId } = useParams();
  const [quizInfo, setQuizInfo] = React.useState([]);
  const [haveQuestions, setHaveQuestions] = React.useState([]);
  const token = localStorage.getItem('token');

  React.useEffect(() => {
    const getQuiz = () => {
      const init = {
        mathod: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        }
      }
      fetch(`http://localhost:5005/admin/quiz/${gameId}`, init)
        .then(res => res.json())
        .then(data => {
          setQuizInfo(data);
          setHaveQuestions(data.questions);
          // console.log(data);
        })
    }
    getQuiz();
  }, [])

  return (
    <Wrapper>
        <Heading />
        <QuestionForm
          quizInfo={quizInfo}
          questionId={questionId}
          haveQuestions={haveQuestions}/>
    </Wrapper>
  );
}

export default QuestionEditPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rem;
  background-color: #F0F0EF;
  height: auto;
  min-height: 100vh;
`;
