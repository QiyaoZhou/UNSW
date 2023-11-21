import React from 'react';
import MUIButton from '@mui/material/Button';

function Button (props) {
  return <MUIButton
    sx = {{
      paddingTop: '10px',
      paddingBottom: '10px',
      margin: '10px'
    }}
    {...props}
  >
    {props.children}
  </MUIButton>
}

export default Button;
