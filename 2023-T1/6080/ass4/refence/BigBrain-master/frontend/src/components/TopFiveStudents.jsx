import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// Own components
import StudentPoints from './StudentPoints'

const TopFiveStudents = ({ questions, results }) => {
  const [points, setPoints] = React.useState([]);
  const [playerPoints, setPlayerPoints] = React.useState([]);
  const [topFive, setTopFive] = React.useState([]);

  // get each question's point
  React.useEffect(() => {
    const tempPoints = [];
    for (const question of questions) {
      tempPoints.push(question.points)
    }
    setPoints(tempPoints);
  }, [questions])

  // calculate each player's total points
  React.useEffect(() => {
    const tempPlayerPoints = [];
    let player = {
      name: '',
      points: 0
    }
    for (const result of results) {
      player = { ...player, name: result.name }
      const answers = result.answers;
      let totalPoints = 0;
      for (let i = 0; i < answers.length; i++) {
        answers[i].correct && (totalPoints += points[i])
      }
      player = { ...player, points: totalPoints }
      tempPlayerPoints.push(player);
    }
    setPlayerPoints(tempPlayerPoints);
  }, [points])
  // console.log(playerPoints);

  // Find Top 5 students
  React.useEffect(() => {
    let totalPoints = [];
    for (const player of playerPoints) {
      totalPoints.push(player.points);
    }
    const tempTopFive = [];
    let student = {
      name: '',
      points: 0
    }

    for (let i = 0; i < 5; i++) {
      // console.log(totalPoints);
      let max = 0;
      totalPoints.forEach((element) => {
        if (max < element) {
          max = element
        }
      })
      totalPoints = totalPoints.filter(item => item !== parseInt(max));
      student = { ...student, points: max }
      const tempName = playerPoints.filter(player => player.points === max);
      if (tempName.length > 0) {
        student = { ...student, name: tempName[0].name, points: max }
        // console.log(student);
        tempTopFive.push(student);
        // console.log(tempTopFive);
      }
    }
    setTopFive(tempTopFive);
  }, [playerPoints])

  // console.log(topFive);
  return (
    <Wrapper>
      <Title>Top 5</Title>
      {topFive.length > 0 && topFive.map((item, index) => (
        <StudentPoints key={index} name={item.name} points={item.points}/>
      ))}
    </Wrapper>
  )
}

export default TopFiveStudents;

TopFiveStudents.propTypes = {
  questions: PropTypes.any,
  results: PropTypes.any
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-left: 4rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: #3AA3A0;
  margin: auto;
  margin-top: 3rem;
`;
