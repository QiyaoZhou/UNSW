import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Container, CssBaseline, Grid, Paper, ThemeProvider, createTheme } from '@mui/material';
import { apiCall } from '../../functions/ApiCall';
import QuestionShow from '../../functions/QuestionShow';

const EditGame = () => {
  const [gameDetail, setGameDetail] = React.useState({});
  const { gameId } = useParams();
  const navigate = useNavigate();
  const mdTheme = createTheme();
  const [num, setNum] = React.useState(0);
  const [questions, setQuestions] = React.useState([]);

  const getGame = () => {
    apiCall(`admin/quiz/${gameId}`, 'GET', {}).then(data => {
      setGameDetail(data);
      setQuestions(data.questions);
      setNum(data.questions.length);
    })
  }

  const addQuestion = () => {
    const process = {
      id: num + 1,
      answersList: [],
      time: 0
    }
    setQuestions(() => questions.push(process));
    console.log(questions);
    const payload = {
      questions: questions,
      name: gameDetail.name,
      thumbnail: gameDetail.thumbnail
    }
    apiCall(`admin/quiz/${gameId}`, 'PUT', payload);
    navigate(`/edit/${gameId}/${num + 1}`)
  }

  React.useEffect(() => {
    getGame();
  }, [questions])

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: 'flex', mt: '50px' }}>
        <CssBaseline />
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Button variant="outlined" onClick= {() => navigate(-1)}>Back to dashboard</Button>
            <h2 style= {{ textAlign: 'center' }} >{gameDetail.name}</h2>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={() => addQuestion()}>
                Add a question
            </Button>
            {questions.length > 0
              ? (questions.map((question, index) => (
                <QuestionShow
                  key={index}
                  index={index}
                  question={question}
                  questions={questions}
                  name={gameDetail.name}
                  thumbnail={gameDetail.thumbnail}
                />
                )))
              : (<Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      height: 240,
                    }}
                  >
                    <p>No questions to display.</p>
                  </Paper>
                </Grid>
              </Grid>
                )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default EditGame;
