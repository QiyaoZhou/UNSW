import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Heading = () => {
  const token = localStorage.getItem('token');

  const navigate = useNavigate()
  const logoutHandler = () => {
    localStorage.removeItem('token');
    navigate('/login');
  }

  const homePageHandler = () => {
    localStorage.removeItem('token');
    navigate('/');
  }
  return (
    <Wrapper>
      <WebName onClick={homePageHandler}>
        BigBrain!
      </WebName>
      {token && (
        <>
          <Space />
          <Logout onClick={logoutHandler}>Log out</Logout>
        </>
      )}
    </Wrapper>
  )
}

export default Heading;

const WebName = styled.h1`
  color: #F6C324;
  margin-left: 2rem;
  cursor: pointer;
`;

const Wrapper = styled.div`
  display: flex;
  background: white;
  width: 100vw;
  height: 65px;
  box-shadow: rgba(0, 0, 0, 0.50) 1.95px 1.95px 2.6px;
  align-items: center;
  border-radius: 0 0 15px 15px;
`;

const Space = styled.div`
  flex: 1;
`;

const Logout = styled.p`
  color: #F6C324;
  margin-right: 2rem;
  font-weight: bold;
  font-size: 20px;
  cursor: pointer;
`;
