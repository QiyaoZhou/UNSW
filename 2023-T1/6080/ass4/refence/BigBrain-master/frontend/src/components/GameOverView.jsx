import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// MUI components
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Modal from '@mui/material/Modal';

// Own components
// import QuizStart from './QuizStart';
import ShowResultsConfirm from './ShowResultConfirm';
import SessionId from './SessionId';
import { initialValue } from '../AppContext';

const shadow = {
  boxShadow: 'rgba(0, 0, 0, 0.25) 1.95px 1.95px 2.6px'
}

const GameOverView = ({ quiz, token, id, getQuizzes }) => {
  // const [isPopup, setIsPopup] = React.useState(false);
  const [isStarted, setIsStarted] = React.useState(quiz.active);
  const [showResults, setShowResults] = React.useState(false);
  const [questionNo, setQuestionsNo] = React.useState(0);
  const [time, setTime] = React.useState('');
  const [position, setPosition] = React.useState(-1);
  const [sessionId, setSessionId] = React.useState(0);

  const [isAdvance, setIsAdvance] = React.useState(initialValue.isAdvance);

  const navigate = useNavigate();

  const getQuestions = () => {
    const init = {
      mathod: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
    fetch(`http://localhost:5005/admin/quiz/${id}`, init)
      .then(res => res.json())
      .then(data => {
        const questions = data.questions;
        const len = data.questions.length;
        setQuestionsNo(len);
        let tempTotal = 0;
        for (const ques of questions) {
          tempTotal += ques.time;
        }
        const minutes = Math.floor(tempTotal / 60);
        const seconds = tempTotal - minutes * 60;
        setTime(`${minutes} min ${seconds} s`);
      })
  }

  React.useEffect(() => {
    getQuestions();
  }, [])

  React.useEffect(() => {
    getQuizzes();
  }, [isStarted])

  // const handleClosePopup = () => setIsPopup(false);
  // const handleOpenPopup = () => setIsPopup(true);
  const handleCloseResultConfirm = () => setShowResults(false);
  const handleOpenResultConfirm = () => setShowResults(true);

  const handleStart = () => {
    const init = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
    fetch(`http://localhost:5005/admin/quiz/${parseInt(id)}/start`, init)
      .then(res => res.json())
      .then(data => {
        // console.log(data);
        setIsStarted(true);
        handleCloseResultConfirm();
        const init = {
          mathod: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token
          }
        }
        fetch(`http://localhost:5005/admin/quiz/${id}`, init)
          .then(res => res.json())
          .then(data => setSessionId(data.active))
      })
  }
  const handleEnd = () => {
    const init = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
    fetch(`http://localhost:5005/admin/quiz/${parseInt(id)}/end`, init)
      .then(res => res.json())
      .then(data => {
        setIsStarted(false);
        handleOpenResultConfirm();
        setPosition(-1);
      })
  }

  const deleteQuizHandler = () => {
    const init = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
    fetch(`http://localhost:5005/admin/quiz/${parseInt(id)}`, init)
      .then(res => res.json())
      .then(data => {
        getQuizzes();
      })
  }

  const advanceQuestionHandler = () => {
    const init = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
    fetch(`http://localhost:5005/admin/quiz/${parseInt(id)}/advance`, init)
      .then(res => res.json())
      .then(data => {
        setPosition(data.stage);
        setSessionId(quiz.active);
        setIsAdvance(!isAdvance);
      })
  }

  return (
    <Wrapper>
      {/* <img src={quiz.thumbnail} /> */}
      {/* <img src='../logo.svg' /> */}
      <Container>
        <Header>
          <Title>{quiz.name}</Title>
          <Chip label={time} color="primary" size='small' sx={shadow} />
          <Chip label={questionNo === 1 ? (`${questionNo} question`) : (`${questionNo} questions`)} color="primary" size='small' sx={shadow} />
          <Space />
          <DeleteOutlineIcon
            fontSize='medium'
            onClick={deleteQuizHandler}
            sx={{ cursor: 'pointer' }}/>
        </Header>
        <Status>
          {isStarted && (<SessionId sessionId={quiz.active} />)}
          <Btns>
            {isStarted
              ? ((questionNo > (position + 1)) && <Button variant="contained" color='primary' onClick={advanceQuestionHandler}>Advance</Button>)
              : (<Button
                variant="contained"
                onClick={() => navigate(`/edit/${id}`)}>Edit</Button>)
            }
            {isStarted
              ? (<Button variant="outlined" color='primary' onClick={handleEnd}>End</Button>)
              : (
                <Button variant="outlined" color='primary' onClick={handleStart}>Start</Button>
                )}
          </Btns>
          {/* <Modal
            open={isPopup}
            onClose={handleClosePopup}
          >
            <QuizStart quizId={quiz.id} sessionId={quiz.active}/>
          </Modal> */}
          <Modal
            open={showResults}
            onClose={handleCloseResultConfirm}
          >
            <ShowResultsConfirm sessionId={sessionId}/>
          </Modal>
        </Status>
      </Container>
    </Wrapper>

  )
}

GameOverView.propTypes = {
  quiz: PropTypes.any,
  token: PropTypes.any,
  id: PropTypes.any,
  getQuizzes: PropTypes.any,
}

export default GameOverView;

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

const Space = styled.div`
  flex: 1;
`;

const Status = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 1rem;
  gap: 0.5rem;
  align-items: flex-end;
`;

const Btns = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-bottom: 1rem;
  width: 200px;
  height: 50px;
`;

// const SessionBtn = styled(Button)`
//   width: 160px;
// `;
