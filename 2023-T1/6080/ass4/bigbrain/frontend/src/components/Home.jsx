import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

const Home = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/join');
    } else {
      navigate('/dashboard');
    }
  });

  return (
    <div>
    </div>
  )
}

export default Home;
