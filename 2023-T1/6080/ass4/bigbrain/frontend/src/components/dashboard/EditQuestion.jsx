import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Select, MenuItem, Box, Button, Container, CssBaseline, Grid, Paper, ThemeProvider, TextField, createTheme, InputLabel } from '@mui/material';
import { apiCall } from '../../functions/ApiCall';
import AddChoice from '../../functions/AddChoice';

const EditQuestion = () => {
  const [gameDetail, setGameDetail] = React.useState({});
  const [questions, setQuestions] = React.useState([]);
  const [questionStem, setQuestionStem] = React.useState('');
  const [imgUrl, setImgUrl] = React.useState('');
  const [videoUrl, setVideoUrl] = React.useState('');
  const [media, setMedia] = React.useState('');
  const [questionType, setQuestionType] = React.useState('S');
  const [questionTime, setQuestionTime] = React.useState(5);
  const [questionPoint, setQuestionPoint] = React.useState(1);
  const [choiceList, setChoiceList] = React.useState([]);
  const [updateList, setUpdateList] = React.useState([]);
  const mdTheme = createTheme();
  const { gameId, questionId } = useParams();
  const navigate = useNavigate();

  const getGame = () => {
    apiCall(`admin/quiz/${gameId}`, 'GET', {}).then(data => {
      setGameDetail(data);
      setQuestions(data.questions);
    })
  }

  React.useEffect(() => {
    getGame();
  }, [])

  const getQuestion = () => {
    const check = questions.find(item => parseInt(item.id) === parseInt(questionId));
    if (check) {
      setUpdateList(questions);
      setQuestionStem(check.question);
      setQuestionType(check.type);
      setQuestionTime(check.time);
      setQuestionPoint(check.points);
      setChoiceList(check.answersList);
    }
  }
  const updateQuestions = () => {
    if (videoUrl !== '') {
      setMedia(videoUrl);
    } else if (videoUrl === '' && imgUrl !== '') {
      setMedia(imgUrl);
    } else {
      setMedia('');
    }
    const newUpdateList = [];
    for (let i = 0; i < updateList.length; i++) {
      const item = updateList[i];
      if (parseInt(item.id) === parseInt(questionId)) {
        const newItem = {
          ...item,
          question: questionStem,
          type: questionType,
          media: media,
          time: questionTime,
          points: questionPoint,
          answersList: choiceList
        };
        newUpdateList.push(newItem);
      } else {
        newUpdateList.push(item);
      }
    }
    setUpdateList(newUpdateList);
  }

  React.useEffect(() => {
    updateQuestions();
  }, [questionStem, questionType, videoUrl, imgUrl, questionTime, questionPoint, choiceList])

  React.useEffect(() => {
    getQuestion();
  }, [questions])
  const handleImgUrlChange = (event) => {
    setImgUrl(event.target.value);
  };
  const handleVideoUrlChange = (event) => {
    setVideoUrl(event.target.value);
  };
  const ChangeQuestionType = (event) => {
    setQuestionType(event.target.value);
  };
  const ChangeQuestionTime = (event) => {
    setQuestionTime(event.target.value);
  };
  const ChangeQuestionPoint = (event) => {
    setQuestionPoint(event.target.value);
  };
  const addChoice = () => {
    if (choiceList.length < 6 && choiceList.length >= 0) {
      const process = {
        answerContext: '',
        correct: false
      }
      setChoiceList(prevList => prevList.concat(process));
    }
  };

  const checkChoice = () => {
    const num = choiceList.filter(item => item.correct === true).length;
    console.log(num);
    if (questionType === 'S' && num === 1) {
      return true;
    }
    if (questionType === 'M' && num > 1) {
      return true;
    }
    return false;
  }

  const updateQuestion = () => {
    const status = choiceList.filter(item => item.answerContext === '');
    if (status.length === 0) {
      if (checkChoice()) {
        const payload = {
          questions: updateList,
          name: gameDetail.name,
          thumbnail: gameDetail.thumbnail
        }
        apiCall(`admin/quiz/${gameId}`, 'put', payload).then(navigate(-1));
      } else {
        alert('Type does not match');
      }
    } else {
      alert('Stem cannot be empty');
    }
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
            height: '200vh',
            overflow: 'auto',
          }}
        >
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <h2 style= {{ textAlign: 'center' }} >Question {questionId}</h2>
            <Grid container spacing={3} columns={2} >
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 100,
                  }}
                >
                  <TextField label={'Question Content'} value={questionStem} onChange={(e) => setQuestionStem(e.target.value)} />
                </Paper>
              </Grid>
            </Grid>
            <Grid container spacing={3} columns={2} >
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 200,
                  }}
                >
                  <InputLabel>Question Enhancement(Please choose at most one kind below):</InputLabel>
                  <input accept="image/*" type="file" label="upload a photo" value={imgUrl} onChange={handleImgUrlChange}/>
                  <TextField type="url" label="URL to a youtube video" value={videoUrl} onChange={handleVideoUrlChange}/>
                </Paper>
              </Grid>
            </Grid>
            <Grid container spacing={1} columns={2} >
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 350,
                  }}
                >
                  <InputLabel>Type of question:</InputLabel>
                  <Select value={questionType} onChange={ChangeQuestionType}>
                    <MenuItem value={'S'}>Single Choice</MenuItem>
                    <MenuItem value={'M'}>Multiple Choice</MenuItem>
                  </Select>
                  <InputLabel>Time limit of question:</InputLabel>
                  <Select value={questionTime} onChange={ChangeQuestionTime}>
                    <MenuItem value= {5} >5 s</MenuItem>
                    <MenuItem value= {10}>10 s</MenuItem>
                    <MenuItem value= {30}>30 s</MenuItem>
                    <MenuItem value= {60}>1 min</MenuItem>
                    <MenuItem value= {120}>2 min</MenuItem>
                    <MenuItem value= {300}>5 min</MenuItem>
                  </Select>
                  <InputLabel>Point of question:</InputLabel>
                  <Select value={questionPoint} onChange={ChangeQuestionPoint}>
                    <MenuItem value= {1} >1</MenuItem>
                    <MenuItem value= {2}>2</MenuItem>
                    <MenuItem value= {5}>5</MenuItem>
                    <MenuItem value= {10}>10</MenuItem>
                    <MenuItem value= {20}>20</MenuItem>
                    <MenuItem value= {50}>50</MenuItem>
                  </Select>
                </Paper>
              </Grid>
            </Grid>
            <Grid container spacing={3} columns={2} >
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 450,
                  }}
                >
                  <Button variant="outlined" color='primary' onClick={addChoice}>Add choice</Button>
                  { choiceList.length > 0 && choiceList.map((choice, index) => {
                    return (
                      <AddChoice
                        key={index}
                        choice={choice}
                        choiceList={choiceList}
                        setChoiceList={setChoiceList}/>
                    )
                  })}
                </Paper>
              </Grid>
            </Grid>
            <Grid container spacing={3} columns={2} >
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    height: 100,
                  }}
                >
                  <Button variant="outlined" color='primary' onClick={updateQuestion}>Save</Button>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default EditQuestion;
