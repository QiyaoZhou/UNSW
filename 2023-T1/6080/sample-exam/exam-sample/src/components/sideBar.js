import React from 'react';
import { useNavigate } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import logo from '../assets/logo.png'

export default function SideBar() {
  const navigate = useNavigate();
  return (
    <div style={{ position:'fixed', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', width: '100%', backgroundColor: '#eeeeee' }}>
      <div style={{ display: 'flex', alignItems: 'center'}}>
        <img src={logo} alt='logo' style={{ width: '50px', height: '50px', margin: '15px'  }}/>
      </div>
      <div style={{ display: 'flex', alignItems: 'center'}}>
        <Link variant="button" color="textPrimary" onClick= {() => navigate(`/dashboard`)}>
          Home
        </Link>
        <span style={{ margin: '0 0.5rem' }}>|</span>
        <Link variant="button" color="textPrimary" onClick= {() => navigate(`/blanko`)}>
          Blanko
        </Link>
        <span style={{ margin: '0 0.5rem' }}>|</span>
        <Link variant="button" color="textPrimary" onClick= {() => navigate(`/slido`)}>
          Slido
        </Link>
        <span style={{ margin: '0 0.5rem' }}>|</span>
        <Link variant="button" color="textPrimary" onClick= {() => navigate(`/Tetro`)}>
          Tetro
        </Link>
      </div>
    </div>
  );
}