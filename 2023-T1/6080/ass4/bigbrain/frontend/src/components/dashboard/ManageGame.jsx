import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Container, CssBaseline, Grid, Paper, ThemeProvider, createTheme } from '@mui/material';
import { apiCall } from '../../functions/ApiCall';
import ShowAllResults from '../../functions/ShowAllResults';

const ManageGame = () => {
  const [activeOrNot, setActive] = React.useState(true);
  const [position, setPosition] = React.useState(-1);
  const [questions, setQuestions] = React.useState([]);
  const [questionNum, setQuestionNum] = React.useState(0);
  const [results, setResults] = React.useState([]);
  const [pointEach, setPointEach] = React.useState([]);
  const [timeEach, setTimeEach] = React.useState([]);
  const [playerTotalPoints, setPlayerTotalPoints] = React.useState([]);
  const [rank, setRank] = React.useState([]);
  const [accuracy, setAccuracy] = React.useState({});
  const [spendTime, setSpendTime] = React.useState({});
  const [averageMark, setAverageMark] = React.useState(0);
  const mdTheme = createTheme();
  const navigate = useNavigate();
  const { gameId, activeId } = useParams();
  const getGameStatus = () => {
    apiCall(`admin/session/${activeId}/status`, 'GET', {}).then(data => {
      setActive(data.results.active);
      setPosition(data.results.position);
      setQuestions(data.results.questions);
      setQuestionNum(data.results.questions.length);
    })
  }

  const advanceQuestion = () => {
    apiCall(`admin/quiz/${gameId}/advance`, 'POST', {}).then(
      setPosition(position + 1)
    )
  }

  const endGame = () => {
    apiCall(`admin/quiz/${gameId}/end`, 'POST', {}).then(() => {
      setActive(false);
    })
  }

  React.useEffect(() => {
    getGameStatus();
  }, [position])

  const getResults = () => {
    if (!activeOrNot) {
      apiCall(`admin/session/${activeId}/results`, 'GET', {}).then(data => {
        setResults(data.results);
      })
    }
  }

  React.useEffect(() => {
    getResults();
  }, [activeOrNot])

  const handleResult = () => {
    const playerPoints = results.map(result => {
      const { name, answers } = result;
      const points = answers.reduce((acc, answer, i) => {
        return answer.correct ? acc + pointEach[i] : acc;
      }, 0);
      return { name, points };
    });
    setPlayerTotalPoints(playerPoints);
    const questionAnswers = {};
    let questionId = 1;
    results.forEach((result) => {
      questionId = 1;
      result.answers.forEach((answer) => {
        questionAnswers[questionId] = questionAnswers[questionId] || {
          totalAnswers: 0,
          totalCorrectAnswers: 0,
          totalTime: 0,
        };
        questionAnswers[questionId].totalAnswers++;
        if (answer.answeredAt !== null && answer.questionStartedAt !== null) {
          const date1 = new Date(answer.questionStartedAt);
          const date2 = new Date(answer.answeredAt);
          const timeDifference = Math.abs(date2.getTime() - date1.getTime());
          const secondsDifference = Math.floor(timeDifference / 1000);
          questionAnswers[questionId].totalTime = questionAnswers[questionId].totalTime + secondsDifference;
        } else {
          questionAnswers[questionId].totalTime = questionAnswers[questionId].totalTime + timeEach[questionId - 1];
        }
        if (answer.correct) {
          questionAnswers[questionId].totalCorrectAnswers++;
        }
        questionId = questionId + 1;
      });
    });
    const questionAccuracy = Object.entries(questionAnswers).map(
      ([questionId, { totalAnswers, totalCorrectAnswers }]) => ({
        questionId,
        accuracy: totalCorrectAnswers / totalAnswers,
      })
    );
    setAccuracy(questionAccuracy);
    let mark = 0;
    for (let i = 0; i < questionAccuracy.length; i++) {
      mark = mark + questionAccuracy[i].accuracy * pointEach[i];
    }
    setAverageMark(mark);
    const questionSpendTime = Object.entries(questionAnswers).map(
      ([questionId, { totalAnswers, totalTime }]) => ({
        questionId,
        spendTime: totalTime / totalAnswers,
      })
    );
    setSpendTime(questionSpendTime);
  }

  React.useEffect(() => {
    console.log(results);
    handleResult();
  }, [results])

  React.useEffect(() => {
    console.log(accuracy);
    if (playerTotalPoints.length >= 5) {
      setRank(playerTotalPoints.sort((a, b) => b.points - a.points).slice(0, 5).map(item => ({ name: item.name, points: item.points })));
    } else {
      setRank(playerTotalPoints.sort((a, b) => b.points - a.points).slice(0, playerTotalPoints.length).map(item => ({ name: item.name, points: item.points })));
    }
  }, [playerTotalPoints])

  React.useEffect(() => {
    console.log(rank);
  }, [rank])

  const getMessage = () => {
    const temp1 = [];
    const temp2 = [];
    for (const question of questions) {
      temp1.push(question.points);
      temp2.push(question.time);
    }
    setPointEach(temp1);
    setTimeEach(temp2);
    console.log(timeEach);
  }

  React.useEffect(() => {
    getMessage();
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
              {activeOrNot && (<Grid container spacing={3}>
                <Grid item xs={12} >
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      height: 240,
                    }}
                  >
                    <h6>{activeId}</h6>
                    {position < questionNum - 1 && (<Button variant="contained" onClick= {() => advanceQuestion()}>Advance</Button>)}
                    {position < questionNum - 1 && (<h3>Question {position + 2}</h3>) }
                    {position === questionNum - 1 && (<Button variant="contained" onClick= {endGame}>End</Button>)}
                  </Paper>
                </Grid>
              </Grid>)}
              {!activeOrNot && (<ShowAllResults averageMark={averageMark} rank={rank} accuracy={accuracy} spendTime={spendTime}/>)}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default ManageGame;
