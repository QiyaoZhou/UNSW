import React from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom';

// MUI components
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

toast.configure();

const RegisterForm = () => {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const navigate = useNavigate();

  const clickHandler = async () => {
    password !== confirmPassword && (
      toast.error('Sorry! Two Passwords are different! Please check again', {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER
      }))
    if (email && name && password && confirmPassword && password === confirmPassword) {
      const requestBody = {
        email: email,
        password: password,
        name: name
      }
      const init = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }

      const output = await fetch('http://localhost:5005/admin/auth/register', init);
      output.json().then(res => {
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
      })
    } else if (!email) {
      toast.error('Sorry! Email can not be empty!', {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER
      });
    } else if (!name) {
      toast.error('Sorry! Name can not be empty!', {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER
      });
    } else if (!password) {
      toast.error('Sorry! Password can not be empty!', {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER
      });
    } else if (!confirmPassword) {
      toast.error('Sorry! Confirm Password can not be empty!', {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER
      });
    }
  }

  return (
    <Wrapper>
        <Title>Register</Title>
        <InputCont>
          <TextField id="registerEmail" label="Email" variant="standard" onChange={e => setEmail(e.target.value)}/>
          <TextField id="registerName" label="Name" variant="standard" onChange={e => setName(e.target.value)} />
          <TextField id="registerPassword" label="Password" type='password' variant="standard" onChange={e => setPassword(e.target.value)}/>
          <TextField id="registerPassword2" label="Confirm Password" type='password' variant="standard" onChange={e => setConfirmPassword(e.target.value)} />
      </InputCont>
      <Cont>
        <Submit>
          <RegisterButton variant="contained" color='primary' onClick={clickHandler}>Submit</RegisterButton>
        </Submit>
        <Link to='/login'>
          <Text>Already have an account?</Text>
        </Link>
      </Cont>
    </Wrapper>
  )
}

export default RegisterForm;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background-color: white;
  box-shadow: rgba(0, 0, 0, 0.50) 1.95px 1.95px 2.6px;
  margin: auto;
  width: 30vw;
  height: 65vh;
  min-width: 350px;
  min-height: 300px;
  border-radius: 5px;
`;

const Title = styled.h1`
  margin: auto;
  margin-top: 3rem;
  height: 30px;
`;

const InputCont = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 80%;
  margin: auto;
  margin-top: 1rem;
  flex-grow: 2;
`;

const Cont = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
`;

const Submit = styled.div`
  display: flex;
  margin: auto;
  margin-top: 0.5rem;
`;

const RegisterButton = styled(Button)`
  width: 170px;
`;

const Text = styled.p`
  color: #3AA3A0;
  text-decoration: underline;
  margin: auto;
  margin-bottom: 4rem;
  height: 10px;
`;
