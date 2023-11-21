import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Grid, Paper, Chip, Button } from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { apiCall } from './ApiCall';

const QuestionShow = ({ index, question, questions, name, thumbnail }) => {
  const navigate = useNavigate();
  const { gameId } = useParams();

  const deleteQuestion = () => {
    const updateList = [];
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].id !== question.id) {
        updateList.push(questions[i]);
      }
    }
    const payload = {
      questions: updateList,
      name: name,
      thumbnail: thumbnail
    }
    apiCall(`admin/quiz/${gameId}`, 'put', payload);
  }

  const editQuestion = () => {
    navigate(`/edit/${gameId}/${question.id}`)
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} >
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 210,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexGrow: 1 }}>
              <h1>{`Question ${index + 1}`}</h1>
              <Chip label={`${question.time} seconds`} color="primary" size='small' />
            </div>
            <DeleteRoundedIcon fontSize='small' onClick={deleteQuestion} sx={{ cursor: 'pointer' }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{question.question}</h2>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              style={{ width: '30%' }}
              onClick={() => editQuestion()}>
                Edit question
            </Button>
          </div>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default QuestionShow;
