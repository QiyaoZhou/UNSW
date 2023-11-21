import React from 'react';
import { TextField, IconButton, Button } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

const AddChoice = ({ choice, choiceList, setChoiceList }) => {
  const [newChoice, setNewChoice] = React.useState(choice);

  const handleChange = () => {
    const index = choiceList.findIndex(item => item === choice);
    if (index >= 0) {
      const newChoiceList = [...choiceList];
      const newChoice = { ...newChoiceList[index], correct: !newChoiceList[index].correct };
      newChoiceList.splice(index, 1, newChoice);
      setChoiceList(newChoiceList);
      setNewChoice(newChoice);
    }
  };

  const choiceEdit = (e) => {
    const { value } = e.target;
    setChoiceList(
      choiceList.map(item => item === choice ? { ...item, answerContext: value } : item)
    );
    setNewChoice(prevState => ({ ...prevState, answerContext: value }));
  }

  const handleRemove = () => {
    const index = choiceList.indexOf(choice);
    if (index !== -1) {
      const newChoiceList = [...choiceList];
      newChoiceList.splice(index, 1);
      setChoiceList(newChoiceList);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <TextField label="Choice Context:" onChange={choiceEdit} value={choice.answerContext}></TextField>
      {newChoice.correct
        ? (<Button variant="Outlined" color='success' onClick={handleChange}><RadioButtonCheckedIcon /></Button>)
        : (<Button variant="Outlined" color='success' onClick={handleChange}><RadioButtonUncheckedIcon /></Button>)
      }
      <IconButton onClick={handleRemove}>
        <RemoveIcon />
      </IconButton>
    </div>
  )
}

export default AddChoice;
