import React from 'react';
import { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

export default function Dashboard() {
  const [correct, setCorrect] = useState(0);
  const setCorrectNum = () => {
    fetch('https://cgi.cse.unsw.edu.au/~cs6080/raw/data/score.json')
    .then(response => response.json())
    .then(data => {
      localStorage.setItem('correct', parseInt(data.score));
      setCorrect(parseInt(data.score));
    })
    .catch(error => alert(error));
  }
  if (!localStorage.getItem('correct')) {
    setCorrectNum();
  }
  useEffect(() => {
    const score = localStorage.getItem('correct');
    if (score) {
      setCorrect(parseInt(score));
    }
  }, []);
  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Typography variant="h5" align="center" color="textSecondary" component="p">
        Wins to achieve: {correct}
        <Button color='primary' size='small' onClick={setCorrectNum}>reset</Button>
      </Typography>
      <Typography component="h1" variant="h2" align="center" style={{ color: 'red', fontSize: '4em' }}>
        Let's go!
      </Typography>
    </div>
  );
}
