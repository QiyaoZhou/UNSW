import React from 'react';
import { Button, Grid, Typography } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { apiCall } from '../../functions/ApiCall';
import AlertBox from '../dialog/AlertBox';

export default function GameDisplay (props) {
  const playerId = props.playerId;
  const question = props.question;
  const answers = question.answersList;
  const questionType = question.type;
  const timeRemaining = props.timeRemaining;
  const started = props.started;

  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [playerAnswer, setPlayerAnswer] = React.useState([]);
  const [answer, setAnswer] = React.useState();

  const handleAlertOpen = () => {
    setIsAlertOpen(true);
  }
  const handleAlertClose = () => {
    setIsAlertOpen(false);
  }

  const handleClick = (e) => {
    e.preventDefault();
    const choice = e.currentTarget.value;
    if (questionType === 'S') {
      setPlayerAnswer([choice]);
      const payload = {
        answerIds: [choice]
      }
      apiCall(`play/${playerId}/answer`, 'PUT', payload).then(function () {
      }).catch(function (data) {
        setErrorMessage(data);
        handleAlertOpen();
      })
    } else {
      // deez
    }
  }

  React.useEffect(() => {
    if (timeRemaining === 0 && started) {
      apiCall(`play/${playerId}/answer`, 'GET', {}).then(function (data) {
        setAnswer(data.answerIds);
      }).catch(function (data) {
        setErrorMessage(data);
        handleAlertOpen();
      });
    }
  }, [timeRemaining]);

  const theme = createTheme();
  const colours = {
    0: theme.palette.error.light,
    1: theme.palette.warning.light,
    2: theme.palette.secondary.light,
    3: theme.palette.primary.light,
    4: theme.palette.info.light,
    5: theme.palette.success.light
  };

  return (
    <>
      <AlertBox
        isOpen={isAlertOpen}
        severity={'warning'}
        title={'Error'}
        message={errorMessage}
        handleClose={handleAlertClose}
      />
      <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
        {`Question: ${question.question}`}
      </Typography>
      <Grid container rowSpacing={3} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        {answers.map((answer, index) =>
          <Grid
            item
            key={index}
            xs={12}
            sm={6}
          >
            <Button
              variant='contained'
              value={answer.answerContext}
              onClick={handleClick}
              fullWidth
              disabled={timeRemaining === 0}
              sx={{ backgroundColor: colours[index], minHeight: '75px' }}
            >
              {answer.answerContext}
            </Button>
          </Grid>
        )}
      </Grid>
      <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
        {`${timeRemaining} seconds remaining`}
      </Typography>
      {playerAnswer.length > 0 && (<Typography component="h1" variant="h5" sx={{ mt: 2 }}>
        {`You've answered: ${playerAnswer.toString()}`}
      </Typography>)}
      {timeRemaining === 0 && answer && (<Typography component="h1" variant="h5" sx={{ mt: 2 }}>
        {`Correct answer: ${answer.toString()}`}
      </Typography>)}
    </>
  );
}
