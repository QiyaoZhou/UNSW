import React, { useContext } from 'react';
import { AppBar, Button, IconButton, Toolbar, Typography } from '@mui/material';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import { UserContext } from '../../App';
import { apiCall } from '../../functions/ApiCall';
import { forgetToken } from '../../functions/TokenFunctions';
import { useNavigate } from 'react-router-dom';

function Navbar () {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  const handleLogoutClick = (e) => {
    if (user.length) {
      apiCall('admin/auth/logout', 'POST', {}).then(function (data) {
        forgetToken();
        setUser('');
        navigate('/login');
      });
    } else {
      navigate('/login');
    }
  }
  return (
    <AppBar position="absolute">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          href="/"
          sx={{ mr: 2 }}
        >
          <PsychologyAltIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          noWrap
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          BigBrain
        </Typography>
        <Button color="inherit" onClick={() => { navigate('/join') }}>
          {'Join a game'}
        </Button>
        <Button color="inherit" onClick={handleLogoutClick}>
          {user.length ? 'Logout' : 'Admin Login'}
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
