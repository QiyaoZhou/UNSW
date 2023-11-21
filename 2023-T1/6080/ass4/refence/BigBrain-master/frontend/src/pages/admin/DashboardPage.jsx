import React from 'react';
import styled from 'styled-components';
import GameOverView from '../../components/GameOverView';

// Own components
import Heading from '../../components/Heading';

// MUI components
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const style = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  alignItems: 'center',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 'rgba(0, 0, 0, 0.80) 1.95px 1.95px 2.6px',
  borderRadius: '10px',
  p: 4,
};

const DashboardPage = () => {
  const [quizList, setQuizList] = React.useState([]);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const token = localStorage.getItem('token');

  const getQuizzes = () => {
    const init = {
      methods: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
    fetch('http://localhost:5005/admin/quiz', init)
      .then(data => data.json())
      .then(res => {
        setQuizList(res.quizzes);
        // console.log(quizList);
      })
  }

  React.useEffect(() => {
    getQuizzes();
  }, [])

  const addQuizHandler = (quizName) => {
    const requestBody = {
      name: quizName
    }
    const init = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify(requestBody)
    }
    fetch('http://localhost:5005/admin/quiz/new', init)
      .then(data => data.json())
      .then(res => {
        getQuizzes();
      })
  }

  const handleAddOpen = () => setIsAddOpen(true);
  const handleAddClose = () => setIsAddOpen(false);
  // console.log(quizList);

  return (
      <Wrapper>
        <Container>
          <Heading />
          <GameCont>
            {quizList.length > 0 && quizList.map(quiz => {
              return (
                <GameOverView
                  key={quiz.id}
                  quiz={quiz}
                  token={token}
                  id={quiz.id}
                  getQuizzes={getQuizzes}
                />
              )
            })}
          </GameCont>
          <Fab
            color="primary"
            aria-label="add"
            sx={{ position: 'fixed', bottom: '1rem', right: '1rem' }}
            onClick={handleAddOpen}>
            <AddIcon />
          </Fab>
          <Modal
            open={isAddOpen}
            onClose={handleAddClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Typography id="modal-modal-title" variant="h6" component="h2">
                Add A New Quiz
              </Typography>
              <TextField id="outlined-basic" label="Quiz Name" variant="outlined" onChange={e => setName(e.target.value)}/>
              <Button
                variant="contained"
                onClick={() => {
                  addQuizHandler(name);
                  setName('');
                  handleAddClose();
                }}>
                  Submit
              </Button>
            </Box>
          </Modal>
        </Container>
      </Wrapper>
  )
}

export default DashboardPage;

const Wrapper = styled.div`
  background-color: #F0F0EF;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rem;
`

const GameCont = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;
