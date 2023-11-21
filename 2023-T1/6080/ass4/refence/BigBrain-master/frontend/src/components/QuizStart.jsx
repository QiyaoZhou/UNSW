import React from 'react';
import styled from 'styled-components';
// import { CopyToClipboard } from 'react-copy-to-clipboard';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// MUI components
import Box from '@mui/material/Box';
// import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Button from '@mui/material/Button';

const style = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  alignItems: 'center',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  bgcolor: 'primary.main',
  boxShadow: 'rgba(0, 0, 0, 0.80) 1.95px 1.95px 2.6px',
  borderRadius: '10px',
  p: 4,
};

const QuizStart = ({ quizId, sessionId }) => {
  // const [sessionId, setSessionId] = React.useState(1234);
  const [questions, setQuestions] = React.useState([]);
  const token = localStorage.getItem('token');
  // console.log(quizId);
  const navigate = useNavigate();

  React.useEffect(() => {
    const getQuiz = () => {
      const init = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        }
      }
      fetch(`http://localhost:5005/admin/quiz/${quizId}`, init)
        .then(res => res.json())
        .then(body => {
          setQuestions(body.questions);
        })
    }
    getQuiz();
  }, [])

  const startGameHandler = () => {
    const id = questions[0].id;
    navigate(`/admin/${quizId}/${id}`);
  }
  return (
    <Box sx={style}>
      <Heading>
        <WebName>
          BigBrain!
        </WebName>
      </Heading>
      <TitleName>
        Join Us!
      </TitleName>
      <SessionCard>
        <SessionIdValue value={sessionId}>Session ID: {sessionId}</SessionIdValue>
        {/* <CopyToClipboard text={`http://localhost:3000/player/join/${sessionId}`}><Button variant="contained" ><ContentCopyIcon /></Button></CopyToClipboard> */}
      </SessionCard>
      <JoinedPerson>
      </JoinedPerson>
      <StartButton>
        <Button fullWidth variant="contained" onClick={startGameHandler}><h1 style={{ color: '#F6C324', fontSize: '50px', fontWeight: 'bold', margin: 'auto', borderRadius: '10px' }}>Start!</h1></Button>
      </StartButton>
    </Box>
  );
}

export default QuizStart;

QuizStart.propTypes = {
  quizId: PropTypes.any,
  sessionId: PropTypes.any
}

const Heading = styled.div`
  width: 100%;
  display: flex;
`;

const WebName = styled.h1`
  color: #F6C324;
`;

const TitleName = styled.h1`
  color: #F6C324;
  font-weight: bold;
  margin: auto;
  text-algin: center;
  font-size: 50px;
`;

const SessionCard = styled.div`
  display: flex;
  justify-content: center;
  gap: 5px;
`;

const SessionIdValue = styled.h1`
  color: #F6C324;
  margin: auto;
`;

const JoinedPerson = styled.div`
  width: 100%;
  height: 300px;
  margin-top: 20px;
  background: #4DCFCB;
  border-radius: 10px;
`;

const StartButton = styled.div`
  width: 50%;
`;
