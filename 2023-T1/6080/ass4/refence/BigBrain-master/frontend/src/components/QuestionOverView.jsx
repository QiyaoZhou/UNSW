import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';

// MUI components
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

const shadow = {
  boxShadow: 'rgba(0, 0, 0, 0.25) 1.95px 1.95px 2.6px'
}

const QuestionOverView = ({ question, questions, setQuestions, name, thumbnail }) => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const token = localStorage.getItem('token');

  const deleteQuestionHandler = () => {
    const newList = questions.filter(item => item.id !== question.id);
    const requestBody = {
      questions: newList,
      name: name,
      thumbnail: thumbnail
    }

    const init = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify(requestBody)
    }

    fetch(`http://localhost:5005/admin/quiz/${gameId}`, init)
      .then(res => res.json())
      .then(data => {
        setQuestions(newList);
      })
  }

  const time = `${question.time} s`;
  return (
    <Wrapper>
      <Container>
        <Header>
          <Title>{`Question ${question.id}`}</Title>
          <Chip label={time} color="primary" size='small' sx={shadow} />
        </Header>
        <Content>{question.question}</Content>
      </Container>
      <Btns>
        <Button
          variant="contained"
          onClick={() => navigate(`/edit/${gameId}/${question.id}`)}>Edit</Button>
        <Button variant="outlined" onClick={deleteQuestionHandler}>Delete</Button>
      </Btns>
    </Wrapper>
  )
}

QuestionOverView.propTypes = {
  question: PropTypes.any,
  setQuestions: PropTypes.any,
  questions: PropTypes.any,
  name: PropTypes.any,
  thumbnail: PropTypes.any
}

export default QuestionOverView;

const Wrapper = styled.div`
  display: flex;
  gap: 2rem;
  width: 80vw;
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.50) 1.95px 1.95px 2.6px;
  border-radius: 5px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-right: 1rem;
`;

const Title = styled.h2`
  margin-left: 1rem;
`;

const Content = styled.span`
  margin-left: 5rem;
  font-size: 20px;
  margin-bottom: 2rem;
`;

const Btns = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: flex-end;
  margin-right: 2rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
  width: 200px;
`;
