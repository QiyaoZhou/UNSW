import React from 'react';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import ViewListIcon from '@mui/icons-material/ViewList';
import WalletIcon from '@mui/icons-material/Wallet';
// import Diversity3Icon from '@mui/icons-material/Diversity3';
import AppsIcon from '@mui/icons-material/Apps';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

function Site ({ setToken }) {
  const location = useLocation();
  const navigate = useNavigate();

  async function Logout () {
    await fetch('http://localhost:8800/user/logout', {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        token: localStorage.getItem('token'),
      },
    });
    console.log(155555);
    console.log(localStorage.getItem('token'));
    setToken(null);
    localStorage.removeItem('token');
    navigate('signin');
  }

  const [state, setState] = React.useState({
    left: false
  });

  const icons = [DirectionsCarIcon, AccountCircleIcon, LocalParkingIcon, ViewListIcon, WalletIcon];
  const pageName = ['Find a Spot', 'My Profile', 'My Spot', 'My Bookings', 'My wallet', 'Invite a Friend', 'Edit My Profile', 'Admin Signin', 'Add Spot', 'Spot Booking'];
  let currentPageName = location.pathname.split('/').filter((part) => part !== '').join(' ');

  const normalizedCurrentPageName = currentPageName.toLowerCase().replace(/\s+/g, '');

  const matchedPageName = pageName.find(name =>
    normalizedCurrentPageName.includes(name.toLowerCase().replace(/\s+/g, ''))
  );

  if (matchedPageName) {
    currentPageName = matchedPageName;
  }

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const handleNavigation = (path) => {
    navigate(path);
    setState({ ...state, left: false });
  };

  const list = (anchor) => (
    <Box
      sx={{ width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        {['Find a Spot', 'My Profile', 'My Spot', 'My Bookings', 'My wallet'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={() => handleNavigation(`/${text.replace(/\s+/g, '').toLowerCase()}`)}>
              <ListItemIcon>
                {React.createElement(icons[index])}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      {/* <List>
        {['Invite a Friend'].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={() => handleNavigation(`/${text.replace(/\s+/g, '').toLowerCase()}`)}>
              <ListItemIcon>
                {React.createElement(Diversity3Icon)}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List> */}
    </Box>
  );

  return (<>
    <header>
      {!['/signup', '/signin', '/adminsignin'].includes(location.pathname)
        ? (
          <>
            <AppBar position="static">
              <Toolbar>
                {['left'].map((anchor) => (
                  <React.Fragment key={anchor}>
                    <Button onClick={toggleDrawer(anchor, true)} color="inherit">
                      <AppsIcon />
                    </Button>
                    <Drawer
                      anchor={anchor}
                      open={state[anchor]}
                      onClose={toggleDrawer(anchor, false)}
                    >
                      {list(anchor)}
                    </Drawer>
                  </React.Fragment>
                ))}
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                  {currentPageName}
                </Typography>
                <Button color="inherit" onClick={Logout}>
                  Logout
                </Button>
              </Toolbar>
            </AppBar>
          </>
        )
        : (
          <div></div>
        )}
    </header>
    <br/>
    <main>
      <Outlet />
    </main>
  </>)
}

export default Site;
