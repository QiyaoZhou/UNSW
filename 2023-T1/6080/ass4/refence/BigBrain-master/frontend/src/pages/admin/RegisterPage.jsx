import React from 'react';
import styled from 'styled-components';

// Own components
import Heading from '../../components/Heading';
import RegisterForm from '../../components/RegisterForm';

const RegisterPage = () => {
  localStorage.removeItem('token');
  return (
    <Wrapper>
      <Heading />
      <RegisterForm />
      <Footer>@BigBrain 2022</Footer>
    </Wrapper>
  )
}

export default RegisterPage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #F0F0EF;
  gap: 2rem;
  height: 100vh;
`;

const Footer = styled.p`
  color: #F6C324;
  position: fixed;
  bottom: 0;
  right: 0;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 1rem;
  margin-right: 1rem;
`;
