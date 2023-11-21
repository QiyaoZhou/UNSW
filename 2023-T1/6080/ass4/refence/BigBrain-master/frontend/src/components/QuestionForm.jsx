import React from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

// Own components
import AddAnswer from './AddAnswer';
// import UploadFile from './UploadFile';
import TimeSerlector from './TimeSelector';
import TypeSelector from './TypeSelector';
import PointsSelector from './PointsSelector';

// MUI components
import TextField from '@mui/material/TextField';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InputLabel from '@mui/material/InputLabel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import { toast } from 'react-toastify';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import IconButton from '@mui/material/IconButton';

toast.configure();

const Input = styled('input')({
  display: 'none',
});

const QuestionForm = ({ quizInfo, questionId, haveQuestions }) => {
  const { gameId } = useParams();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [question, setQuestion] = React.useState('');
  const [type, setType] = React.useState('');
  const [time, setTime] = React.useState(0);
  const [points, setPoints] = React.useState(0);
  const [answersList, setAnswersList] = React.useState([]);
  const [media, setMedia] = React.useState([]);
  const [changeList, setChangeList] = React.useState([]);

  React.useEffect(() => {
    const getInfo = () => {
      if (questionId !== undefined) {
        const status = haveQuestions.filter(item => parseInt(item.id) === parseInt(questionId));
        setChangeList(haveQuestions);
        // console.log(status);
        if (status.length === 1) {
          setQuestion(status[0].question);
          setType(status[0].type);
          setTime(status[0].time);
          setPoints(status[0].points);
          setAnswersList(status[0].answersList);
        }
      }
    }
    getInfo();
  }, [haveQuestions])

  React.useEffect(() => {
    updateQuestions();
  }, [question, type, media, time, points, answersList])

  console.log(setMedia);

  const handleAddAnswerFiled = () => {
    if (answersList.length >= 6) {
      toast.error('Sorry! 6 is the Max number of Choices', {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER
      });
    } else if (answersList.length < 6 && answersList.length >= 0) {
      const temp = {
        answerContext: '',
        correct: false
      }
      setAnswersList([...answersList, temp])
    }
  };

  const updateQuestions = () => {
    setChangeList(() => changeList.map(item => (
      (parseInt(item.id) === parseInt(questionId))
        ? ({
            ...item,
            question: question,
            type: type,
            media: media,
            time: time,
            points: points,
            answersList: answersList
          })
        : (item)
    )))
  }

  const checkCorrectAnswers = () => {
    const num = answersList.filter(item => item.correct === true);
    console.log(num);
    if (type === 'Single Choice') {
      if (num.length === 1) {
        return true;
      } else {
        return false
      }
    }
    return true
  }

  const updateQuizQuestionHandler = () => {
    // check whether has empty answer
    const status = answersList.filter(item => item.answerContext === '');
    if (status.length === 0) {
      if (checkCorrectAnswers()) {
        console.log(changeList);
        const requestBody = {
          questions: changeList,
          name: quizInfo.name,
          thumbnail: quizInfo.thumbnail
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
          .then(body => {
            if (body.error) {
              toast.error(body.error, {
                autoClose: 2000,
                position: toast.POSITION.TOP_CENTER
              })
            } else {
              navigate(-1);
            }
          })
      } else {
        toast.error('Single Choice only can have ONE correct answer', {
          autoClose: false,
          position: toast.POSITION.TOP_CENTER
        });
      }
    } else if (status.length > 0) {
      toast.error('Sorry, can not have empty fileds', {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER
      })
    }
  }
  return (
    <Wrapper>
      <BackIcon>
        <Fab
          color="primary"
          aria-label="exit"
          sx={{ position: 'absolute', left: '1rem', top: '5rem' }}
          onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </Fab>
      </BackIcon>
      <QuestionContext>
        <TextField style={{ margin: 20 }} label={questionId ? `Question ${questionId}` : 'Question Content'} value={question} onChange={(e) => setQuestion(e.target.value)} />
      </QuestionContext>
      <MediaArea>
        <div style={{ margin: 'auto', textAlign: 'center' }} >
          <label htmlFor="icon-button-file">
            <Input accept="image/*" id="icon-button-file" type="file" />
            <IconButton color="primary" aria-label="upload picture" component="span">
              <PhotoCamera fontSize='large'/>
            </IconButton>
          </label>
          <p>Upload Image/Media</p>
          {/* <UploadFile /> */}
        </div>
      </MediaArea>
      <SelectionArea>
        <TypeSelector type={type} setType={setType} />
        <TimeSerlector time={time} setTime={setTime}/>
        <PointsSelector points={points} setPoints={setPoints} />
        <div style={{ width: '45%', margin: '5px', minWidth: '165px' }}>
          <InputLabel>Add Answer</InputLabel>
          <AddAnswersButton
            variant="contained"
            color='primary'
            onClick={handleAddAnswerFiled}
          >
            <AddIcon />
          </AddAnswersButton>
        </div>
      </SelectionArea>
      <AnswerArea>
      { answersList.length > 0 && answersList.map((answer, index) => {
        return (
          <AddAnswer
            key={index}
            answer={answer}
            answersList={answersList}
            setAnswersList={setAnswersList}
            type={type}/>
        )
      })}
      </AnswerArea>
      <SaveBtnArea>
          <SaveButton variant="contained" color='primary' onClick={updateQuizQuestionHandler}>Save</SaveButton>
      </SaveBtnArea>
    </Wrapper>
  );
}

export default QuestionForm;

QuestionForm.propTypes = {
  quizInfo: PropTypes.any,
  questionId: PropTypes.any,
  haveQuestions: PropTypes.any
}

const Wrapper = styled.div`
  width: 99%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  top: 10rem;
  gap: 2rem;
  height: auto;
`;

const BackIcon = styled.div`
    width: 99%;
`;

const QuestionContext = styled.div`
  background-color: white;
  width: 90%;
  margin: auto;
  box-shadow: rgba(0, 0, 0, 0.50) 1.95px 1.95px 2.6px;
  border-radius: 5px;
  align-item: center;
  display: flex;
  flex-direction: column;
`;

const MediaArea = styled.div`
  width: 80%;
  height: 300px;
  margin: auto;
  box-shadow: rgba(0, 0, 0, 0.50) 1.95px 1.95px 2.6px;
  border-radius: 5px;
  background-color: white;
  display: flex;
  flex-direction: column;
`;

const SelectionArea = styled.div`
    width: 90%;
    margin: auto;
    display: flex;
    flex-flow: row wrap;
    algin-item: center;
    justify-content: center;
`;

const AnswerArea = styled.div`
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: auto;
    margin-bottom: 20px;
`;

const AddAnswersButton = styled(Button)`
  width: 100%;
  height: 69%;
`;

// const RemoveAnswerButton = styled(Button)`
//   width: 90%;
//   height: 100%;
// `;

// const UncorrectButton = styled(Button)`
//   width: 90%;
//   height: 100%;
// `;

// const CorrectButton = styled(Button)`
//   width: 90%;
//   height: 100%;
// `;

const SaveBtnArea = styled.div`
  width: 50%;
  margin: auto;
  display: flex;
  flex-direction: column;
  margin-bottom: 40px;
`;

const SaveButton = styled(Button)`
    width: 100%;
    height: 50px;
`;
