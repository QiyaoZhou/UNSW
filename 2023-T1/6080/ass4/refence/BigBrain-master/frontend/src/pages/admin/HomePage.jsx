import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

// MUI components
import Button from '@mui/material/Button';

const theme = {
  boxShadow: 'rgba(0, 0, 0, 0.25) 1.95px 1.95px 2.6px',
  fontWeight: 'bold',
  width: '200px'
}

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <Wrapper>
      <Container>
        <Title>BigBrain!</Title>
        <Button
          color='secondary'
          variant="contained"
          sx={theme}
          size='large'
          onClick={() => navigate('/login')}
        >
          Log In
        </Button>
        <Button
          color='secondary'
          variant="contained"
          sx={theme}
          size='large'
          onClick={() => navigate('/register')}
        >
          Register
        </Button>
      </Container>
    </Wrapper>
  )
}

export default HomePage;

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
  width: 60vw;
  height: 50vh;
`;

const Title = styled.h1`
  font-size: 80px;
  color: #F6C324;
`;
