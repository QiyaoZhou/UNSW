import React from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';

// Own components
import TopFiveStudents from '../../components/TopFiveStudents';
// import GameCorrectnessBarChart from '../../components/GameCorrectnessBarChart';

const AdminGameResultPage = () => {
  const { sessionId } = useParams();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [results, setResults] = React.useState([]);
  const [quizInfo, setQuizInfo] = React.useState({});
  const [questions, setQuestions] = React.useState([]);
  // console.log(results);
  console.log(quizInfo);
  // console.log(questions);

  const getResults = () => {
    const init = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
    fetch(`http://localhost:5005/admin/session/${sessionId}/results`, init)
      .then(res => res.json())
      .then(data => {
        setResults(data.results);
      })
  }

  const getSessionStatus = () => {
    const init = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    }
    fetch(`http://localhost:5005/admin/session/${sessionId}/status`, init)
      .then(res => res.json())
      .then(data => {
        setQuizInfo(data.results);
        setQuestions(data.results.questions);
      })
  }

  React.useEffect(() => {
    getResults();
    getSessionStatus();
  }, [])

  return (
    <Wrapper>
      <Logo onClick={() => navigate('/dashboard')}>BigBrain!</Logo>
      <StatisticsCont>
        <TopFiveStudents questions={questions} results={results}/>
        <Space />
        {/* <GameCorrectnessBarChart /> */}
      </StatisticsCont>
    </Wrapper>
  )
}

export default AdminGameResultPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.div`
  font-size: 40px;
  font-weight: bold;
  color: #F6C324;
  position: absolute;
  top: 1rem;
  left: 2rem;
  cursor: pointer;
`;

const StatisticsCont = styled.div`
  display: flex;
  width: 80vw;
  gap: 3rem;
  align-items: center;
  margin: auto;
  margin-top: 7rem;
`;

const Space = styled.div`
  flex:1;
`;
