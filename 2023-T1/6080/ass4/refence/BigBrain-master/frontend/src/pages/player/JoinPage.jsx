import React from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// MUI components
import Button from '@mui/material/Button';
// import { TextField } from '@mui/material';

const theme = {
  boxShadow: 'rgba(0, 0, 0, 0.25) 1.95px 1.95px 2.6px',
  fontWeight: 'bold',
  width: '60%',
  minWidth: '300px',
  borderRadius: '20px',
  marginTop: '1rem',
}

toast.configure();

const JoinPage = () => {
  const [playerName, setPlayerName] = React.useState('');
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const joinGameHandler = () => {
    const requestBody = {
      name: playerName
    }

    const init = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    }

    fetch(`http://localhost:5005/play/join/${sessionId}`, init)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.log(data.error);
          toast.error(data.error, {
            autoClose: 2000,
            position: toast.POSITION.TOP_CENTER
          })
        } else {
          const playerId = data.playerId;
          navigate(`/player/${playerId}/${sessionId}`)
        }
      })
  }
  return (
    <Wrapper>
      <Container>
        <Title>BigBrain!</Title>
        <InfoCont>
          {/* <Info>
            <InfoTitle>Session Id</InfoTitle>
            <InfoInput />
          </Info> */}
          <Info>
            <InfoTitle>Name</InfoTitle>
            <InfoInput onChange={(e) => setPlayerName(e.target.value)} />
          </Info>
        </InfoCont>
        <Button
          color='secondary'
          variant="contained"
          sx={theme}
          size='large'
          onClick={joinGameHandler}
        >
          <h1 style={{ margin: 'auto' }}>Join!</h1>
        </Button>
      </Container>
    </Wrapper>
  )
}

export default JoinPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: cneter;
  background: #3AA3A0;
  height: 100vh;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin: auto;
  margin-top: 5rem;
  width: 60vw;
  height: 50vh;
`;

const InfoCont = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -3rem;
  align-items: left;
  width: 60%;
`
const Info = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InfoTitle = styled.p`
  font-size: 2rem;
  font-weight: semibold;
  color: #F6C324;
`;

const InfoInput = styled.input`
  background: #F6C324;
  text-color: #3AA3A0;
  margin-top: -1rem;
  border-radius: 5px;
  height: 40px;
  width: 150px;
  border: none;
`

const Title = styled.h1`
  font-size: 80px;
  color: #F6C324;
`;
