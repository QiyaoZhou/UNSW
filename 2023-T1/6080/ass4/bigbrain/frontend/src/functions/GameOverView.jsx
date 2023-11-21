import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { apiCall } from './ApiCall';
import { Box, Grid, Paper, Chip, Button, Modal } from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'background.paper',
  padding: '20px',
  borderRadius: '4px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  maxWidth: '500px',
  width: '100%',
};

const GameOverView = ({ quiz, id, getQuizzes }) => {
  // const [gameState, setGameState] = React.useState(quiz.active);
  const [time, setTime] = React.useState('');
  const [questionNum, setQuestionsNum] = React.useState(0);
  const [activeOrNot, setActive] = React.useState(quiz.active);
  const [activeId, setActiveId] = React.useState(0);
  const [showModal, setShowModal] = React.useState(false);
  const navigate = useNavigate();
  // setGameState(quiz.active);

  const getQuestions = () => {
    apiCall(`admin/quiz/${id}`, 'GET', {}).then(function (data) {
      setQuestionsNum(data.questions.length);
      setActiveId(data.active);
      let timeTotal = 0;
      for (let i = 0; i < data.questions.length; i++) {
        timeTotal = timeTotal + data.questions[i].time;
      }
      const minutes = Math.floor(timeTotal / 60);
      const seconds = timeTotal % 60;
      setTime(`${minutes} minute ${seconds} second`);
    });
  }

  const handleClose = () => setShowModal(false);
  const handleWatch = () => navigate(`/session/${id}/${activeId}`);

  React.useEffect(() => {
    getQuestions();
  }, [])

  const deleteGame = () => {
    apiCall(`admin/quiz/${parseInt(id)}`, 'DELETE', {}).then(getQuizzes())
  }
  // React.useEffect(() => {
  //   getQuizzes();
  // }, [gameState])

  const startGame = () => {
    apiCall(`admin/quiz/${parseInt(id)}/start`, 'POST', {}).then(() => {
      setActive(true);
      apiCall(`admin/quiz/${id}`, 'GET', {}).then(data => setActiveId(data.active))
    })
  }

  const endGame = () => {
    apiCall(`admin/quiz/${parseInt(id)}/end`, 'POST', {}).then(() => {
      setActive(false);
      setShowModal(true);
    })
  }

  const copyClick = () => {
    navigator.clipboard.writeText(activeId);
  };
  return (
    <Grid item xs={12} md={8} lg={9}>
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          height: 260,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h2>{quiz.name}</h2>
          <Chip label={time} color="primary" size='small' />
          <Chip label={`${questionNum} ${questionNum <= 1 ? 'question' : 'questions'}`} color="primary" size='small' />
          <DeleteRoundedIcon fontSize='small' onClick={deleteGame} sx={{ cursor: 'pointer' }}/>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {activeOrNot && (<h2>{activeId}</h2>)}
          {activeOrNot && (<Button startIcon={<FileCopyOutlinedIcon />} style={{ width: '30%' }} onClick={copyClick}>Copy</Button>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {activeOrNot
            ? (<Button variant="contained" style={{ width: '30%' }} onClick= {() => navigate(`/session/${id}/${activeId}`)}>Manage</Button>)
            : (
              <Button variant="outlined" style={{ width: '30%' }} onClick= {() => navigate(`/edit/${id}`)}>Edit</Button>
              )}
          {activeOrNot
            ? (<Button variant="contained" style={{ width: '30%' }} color='primary' onClick={endGame}>End</Button>)
            : (
              <Button variant="outlined" style={{ width: '30%' }} color='primary' onClick={startGame}>Start</Button>
              )}
        </div>
        <Modal open={showModal}>
          <Box sx={style}>
            <h2>Would you like to view the results?</h2>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button variant="secondary" onClick={handleClose}>
                NO
              </Button>
              <Button variant="primary" onClick={handleWatch}>
                YES
              </Button>
            </div>
          </Box>
        </Modal>
      </Paper>
    </Grid>

  )
}

GameOverView.propTypes = {
  quiz: PropTypes.any,
  id: PropTypes.any,
  getQuizzes: PropTypes.any,
}

export default GameOverView;
