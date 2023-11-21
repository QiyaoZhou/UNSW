import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// MUI components
import Fab from '@mui/material/Fab';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Button } from '@mui/material';

toast.configure();

const QuestionControl = ({ questionContext, answersList, timeLeft, media, setTimeLeft, questions }) => {
  const [isEnd, setIsEnd] = React.useState(false);
  const { gameId, questionId } = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (timeLeft > 0) {
      const interval = window.setInterval(() => {
        setTimeLeft(s => s - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeLeft]);

  // React.useEffect(() => {
  //   if (timeLeft === 0) {
  //     window.setTimeout(() => {
  //       showBox();
  //     }, 2000);
  //   }
  // }, [timeLeft]);

  const toNextQuestionHandler = () => {
    let status = 0;
    for (let i = 0; i + 1 < questions.length; i++) {
      if (parseInt(questions[i].id) === parseInt(questionId)) {
        const id = questions[i + 1].id;
        status = 1;
        navigate(`/admin/${gameId}/${id}`);
      }
    }
    (status === 0) && (setIsEnd(true))
  }

  const backToDashBoardHandler = () => {
    navigate('/dashboard');
  }

  return (
    <Wrapper>
      <Logo onClick={backToDashBoardHandler}>BigBrain!</Logo>
      <WebName>
        Question {questionId}
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
      <MediaArea><img src={media} alt="optinal image" /></MediaArea>
      <AnswerArea>
        {
          answersList.map((answer, index) => {
            if (timeLeft === 0) {
              return (answer.correct
                ? (
                    <AnswerCard key={index}>
                      <Button fullWidth variant="contained" color='secondary'><AnswerContext>{answer.answerContext}</AnswerContext></Button>
                    </AnswerCard>
                  )
                : (
                    <AnswerCard key={index}>
                      <Button fullWidth variant="contained"><AnswerContext>{answer.answerContext}</AnswerContext></Button>
                    </AnswerCard>
                  ));
            } else {
              return (
                    <AnswerCard key={index}>
                      <Button fullWidth variant="contained"><AnswerContext>{answer.answerContext}</AnswerContext></Button>
                    </AnswerCard>
              );
            }
          })
        }
      </AnswerArea>
      <EndButton>
        <Button fullWidth variant="contained" color='error'>End</Button>
      </EndButton>
      {!isEnd && (
        <Fab
          color="primary"
          aria-label="nextQuestion"
          sx={{ position: 'fixed', top: '50%', right: '2%', width: '50px', height: '50px' }}
          onClick={toNextQuestionHandler}
        >
          <NavigateNextIcon />
        </Fab>
      )}
    </Wrapper>
  );
}

export default QuestionControl;

QuestionControl.propTypes = {
  questionContext: PropTypes.any,
  answersList: PropTypes.any,
  timeLeft: PropTypes.any,
  media: PropTypes.any,
  setTimeLeft: PropTypes.any,
  questions: PropTypes.any,
  setMedia: PropTypes.any
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

const AnswerCard = styled.div`
width: 45%;
min-width: 200px;
border-radius: 5px;
margin: auto;
margin-top: 5px;
margin-bottom: 5px;
box-shadow: rgba(0, 0, 0, 0.50) 1.95px 1.95px 2.6px;
`;

const AnswerContext = styled.p`
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 5px;
  margin-bottom: 5px;
  font-size: 20px;
  text-align: center;
`;

const EndButton = styled.div`
  width: 50%;
  margin-bottom: 50px;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.50) 1.95px 1.95px 2.6px;
`;
