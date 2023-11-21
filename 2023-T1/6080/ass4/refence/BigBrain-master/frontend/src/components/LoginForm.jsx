import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// MUI components
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

toast.configure();

const LoginForm = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const navigate = useNavigate();

  const submitHandler = async () => {
    if (email && password) {
      const requestBody = {
        email: email,
        password: password
      }
      const init = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
      const output = await fetch('http://localhost:5005/admin/auth/login', init);
      // get token
      output.json()
        .then(res => {
          if (res.token) {
            localStorage.setItem('token', res.token);
            navigate('/dashboard');
            toast('Welcome to BigBrain!', {
              icon: '🎉',
              position: toast.POSITION.TOP_CENTER,
              autoClose: 2000
            });
          } else {
            toast.error(res.error, {
              autoClose: 2000,
              position: toast.POSITION.TOP_CENTER
            })
          }
        });
    } else if (!email) {
      toast.error('Sorry! Email can not be empty!', {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER
      });
    } else if (!password) {
      toast.error('Sorry! Password can not be empty!', {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER
      });
    }
  }

  return (
    <Wrapper>
      <Title>Log In</Title>
      <InputCont>
        <TextField id="logInEmail" label="Email" variant="standard" onChange={e => setEmail(e.target.value)}/>
        <TextField id="logInPassword" label="Password" type='password' variant="standard" onChange={e => setPassword(e.target.value)} />
      </InputCont>
      <Cont>
        <Submit>
          <LogInButton variant="contained" color='primary' onClick={submitHandler}>Submit</LogInButton>
        </Submit>
        <Link to='/register'>
          <Text>New? Join us here</Text>
        </Link>
      </Cont>
    </Wrapper>
  )
}

export default LoginForm;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.50) 1.95px 1.95px 2.6px;
  margin: auto;
  width: 30vw;
  height: 55vh;
  min-width: 350px;
  min-height: 300px;
  border-radius: 5px;
`;

const Title = styled.h1`
  margin: auto;
  margin-top: 2rem;
  height: 30px;
`;

const InputCont = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 80%;
  margin: auto;
  margin-top: 2.5rem;
  flex-grow: 2;
`;

const Submit = styled.div`
  display: flex;
  margin: auto;
  megin-bottom: 1rem;
`;

const LogInButton = styled(Button)`
  width: 170px;
`;

const Cont = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

const Text = styled.p`
  color: #3AA3A0;
  text-decoration: underline;
  margin: auto;
  margin-bottom: 6rem;
`;
