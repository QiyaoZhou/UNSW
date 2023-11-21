import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// MUI components
import RemoveIcon from '@mui/icons-material/Remove';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

toast.configure();

const AddAnswer = ({ answer, setAnswersList, answersList, type }) => {
  const [newAnswer, setNewAnswer] = React.useState(answer);

  const answerCorrectHandler = () => {
    const status = newAnswer.correct;
    setAnswersList(() => answersList.map(item => (
      item === answer
        ? ({ ...item, correct: !status })
        : (item)
    )))
    setNewAnswer({ ...newAnswer, correct: !status })
  }

  const changeContentHandler = (e) => {
    setAnswersList(() => answersList.map(item => (
      item === answer
        ? ({ ...item, answerContext: e.target.value })
        : (item)
    )))
    setNewAnswer({ ...newAnswer, answerContext: e.target.value });
  }

  const deleteAnswerHandler = () => {
    setAnswersList(() => answersList.filter(item => item !== answer))
  }

  return (
    <Wrapper>
      <div style={{ width: 'calc(100% - 130px)', borderRadius: '5px', background: 'white', boxShadow: 'rgba(0, 0, 0, 0.50) 1.95px 1.95px 2.6px' }}>
        <TextField fullWidth name='answerContext' label="Answer Context:" onChange={changeContentHandler} value={answer.answerContext}></TextField>
      </div>
      <div style={{ width: '65px' }}>
        {newAnswer.correct
          ? (<CorrectButton variant="Outlined" color='success' onClick={answerCorrectHandler}><RadioButtonCheckedIcon /></CorrectButton>)
          : (<UncorrectButton variant="Outlined" color='success' onClick={answerCorrectHandler}><RadioButtonUncheckedIcon /></UncorrectButton>)
        }
      </div>
      <div style={{ width: '65px' }}>
        <RemoveAnswerButton variant="contained" color='error' onClick={deleteAnswerHandler}><RemoveIcon /></RemoveAnswerButton>
      </div>
    </Wrapper>
  )
}

export default AddAnswer;

AddAnswer.propTypes = {
  answer: PropTypes.any,
  setAnswersList: PropTypes.any,
  answersList: PropTypes.any,
  type: PropTypes.any
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const RemoveAnswerButton = styled(Button)`
  width: 90%;
  height: 100%;
`;

const UncorrectButton = styled(Button)`
  width: 90%;
  height: 100%;
`;

const CorrectButton = styled(Button)`
  width: 90%;
  height: 100%;
`;
