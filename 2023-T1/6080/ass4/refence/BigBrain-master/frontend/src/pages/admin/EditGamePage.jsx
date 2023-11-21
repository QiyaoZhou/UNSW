import React from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';

// Own components
import Heading from '../../components/Heading';
import QuestionOverView from '../../components/QuestionOverView';

// MUI components
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EditGamePage = () => {
  const [quiz, setQuiz] = React.useState({});
  const [questions, setQuestions] = React.useState([]);
  const [count, setCount] = React.useState(0);
  const token = localStorage.getItem('token');
  const { gameId } = useParams();
  const navigate = useNavigate();
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
        setQuiz(data);
        setQuestions(data.questions);
        const len = data.questions.length;
        setCount((len === 0) ? 0 : data.questions[len - 1].id);
        // console.log(data);
      })
  }
  React.useEffect(() => {
    getQuiz();
  }, [questions])

  const addQuestion = () => {
    const temp = {
      id: count + 1,
      answersList: [],
      time: 0
    }
    setQuestions(() => questions.push(temp));
  }

  const addHandler = () => {
    addQuestion();
    const requestBody = {
      questions: questions,
      name: quiz.name,
      thumbnail: quiz.thumbnail
    }
    console.log('count');
    console.log(count);
    const init = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify(requestBody)
    }
    fetch(`http://localhost:5005/admin/quiz/${gameId}`, init);
    navigate(`/edit/${gameId}/${count + 1}`)
  }
  // console.log(quiz);
  // console.log(questions);
  return (
    <Wrapper>
      <Container>
        <Heading />
        <Title>{quiz.name}</Title>
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: '1rem', right: '1rem' }}
          onClick={addHandler}>
          <AddIcon />
        </Fab>
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'absolute', top: '6.8rem', left: '2rem' }}
          onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </Fab>
        <Questions>
          {/* <QuestionOverView />
          <QuestionOverView />
          <QuestionOverView />
          <QuestionOverView />
          <QuestionOverView />
          <QuestionOverView />
          <QuestionOverView />
          <QuestionOverView /> */}
          {questions.length > 0 && questions.map((question, index) => {
            return (
              <QuestionOverView key={index} question={question} questions={questions} setQuestions={setQuestions} name={quiz.name} thumbnail={quiz.thumbnail}/>
            )
          })}
        </Questions>
      </Container>
    </Wrapper>
  )
}

export default EditGamePage;

const Wrapper = styled.div`
  background-color: #F0F0EF;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  margin-top: 3rem;
  font-size: 40px;
`;

const Questions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
`;
