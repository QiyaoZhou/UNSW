import React from 'react';
import { Box, Button, Container, CssBaseline, Grid, Paper, ThemeProvider, createTheme, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
// import { UserContext } from '../../App';
import { apiCall } from '../../functions/ApiCall';
import GameOverView from '../../functions/GameOverView';

const Dashboard = () => {
  // const { user, setUser } = useContext(UserContext);
  const [quizList, setQuizList] = React.useState([]);
  const [name, setName] = React.useState('');
  const mdTheme = createTheme();
  // console.log(1);
  // console.log(user, setUser);
  // console.log(2);
  // console.log(quizList);
  const getQuizzes = () => {
    apiCall('admin/quiz', 'GET', {}).then(function (data) {
      setQuizList(data.quizzes);
    });
  }

  React.useEffect(() => {
    getQuizzes();
  }, [])

  const addQuizHandler = (quizName) => {
    const payload = {
      name: quizName
    }
    apiCall('admin/quiz/new', 'POST', payload).then(function (data) {
      getQuizzes(data.quizzes);
    })
  }

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
            <Grid container spacing={3}>
              {/* Games */}
              {quizList.length > 0 && quizList.map(quiz => {
                return (
                  <GameOverView
                    key={quiz.id}
                    quiz={quiz}
                    id={quiz.id}
                    getQuizzes={getQuizzes}
                  />
                )
              })}
              {/* Active games */}
              <Grid item xs={12} md={4} lg={3}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 260,
                  }}
                >
                  <Typography id="modal-modal-title" variant="h6" component="h2">
                  Create A New Game
                  </Typography>
                  <TextField id="game-name" label="Name Of The Game" onChange={e => setName(e.target.value)}/>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={() => {
                      addQuizHandler(name);
                      setName('');
                    }}>
                      Submit
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default Dashboard;
