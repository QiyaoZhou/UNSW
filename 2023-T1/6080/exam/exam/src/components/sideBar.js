import React from 'react';
import { useNavigate } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import useMediaQuery from '@mui/material/useMediaQuery';
import logo from '../assets/logo.png';

export default function SideBar() {
  const navigate = useNavigate();
  const matchL = useMediaQuery('(min-width:1400px)');
  const matchM = useMediaQuery('(min-width:800px)');
  return (
    <div>
      {matchL &&<div style={{ width: '80px', position: 'fixed', top: 0, left: 0, bottom: 0, backgroundColor: 'rgb(200, 200, 220)', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logo} alt='logo' style={{ width: '54px', height: '54px', margin: '8px' }}/>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <Link variant="button" color="textPrimary" onClick= {() => navigate(`/home`)} style={{ textTransform: 'none', fontSize: '0.8em' }}>
            Home
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <Link variant="button" color="textPrimary" onClick= {() => navigate(`/wordcolour`)} style={{ textTransform: 'none', fontSize: '0.8em' }}>
            Wordcolour
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <Link variant="button" color="textPrimary" onClick= {() => navigate(`/frogger`)} style={{ textTransform: 'none', fontSize: '0.8em' }}>
            Frogger
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <Link variant="button" color="textPrimary" onClick= {() => navigate(`/findaword`)} style={{ textTransform: 'none', fontSize: '0.8em' }}>
            Findaword
            </Link>
          </div>
        </div>
      </div>}
      {matchM && !matchL &&<div style={{ width: '60px', position: 'fixed', top: 0, left: 0, bottom: 0, backgroundColor: 'rgb(200, 200, 220)', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logo} alt='logo' style={{ width: '40px', height: '40px', margin: '6px' }}/>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <Link variant="button" color="textPrimary" onClick= {() => navigate(`/home`)} style={{ textTransform: 'none', fontSize: '0.7em' }}>
            H
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <Link variant="button" color="textPrimary" onClick= {() => navigate(`/wordcolour`)} style={{ textTransform: 'none', fontSize: '0.7em' }}>
            W
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <Link variant="button" color="textPrimary" onClick= {() => navigate(`/frogger`)} style={{ textTransform: 'none', fontSize: '0.7em' }}>
            Fr
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <Link variant="button" color="textPrimary" onClick= {() => navigate(`/findaword`)} style={{ textTransform: 'none', fontSize: '0.7em' }}>
            Fi
            </Link>
          </div>
        </div>
      </div>}
      {!matchM &&<div style={{ width: '30px', position: 'fixed', top: 0, left: 0, bottom: 0, backgroundColor: 'rgb(200, 200, 220)', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <Link variant="button" color="textPrimary" onClick= {() => navigate(`/home`)} style={{ textTransform: 'none', fontSize: '0.7em' }}>
            H
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <Link variant="button" color="textPrimary" onClick= {() => navigate(`/wordcolour`)} style={{ textTransform: 'none', fontSize: '0.7em' }}>
            W
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <Link variant="button" color="textPrimary" onClick= {() => navigate(`/frogger`)} style={{ textTransform: 'none', fontSize: '0.7em' }}>
            Fr
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center'}}>
            <Link variant="button" color="textPrimary" onClick= {() => navigate(`/findaword`)} style={{ textTransform: 'none', fontSize: '0.7em' }}>
            Fi
            </Link>
          </div>
        </div>
      </div>}
    </div>
  );
}
