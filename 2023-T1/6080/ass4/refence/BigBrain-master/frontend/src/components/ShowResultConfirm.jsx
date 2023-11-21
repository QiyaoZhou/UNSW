import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// MUI components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const style = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  alignItems: 'center',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  boxShadow: 'rgba(0, 0, 0, 0.80) 1.95px 1.95px 2.6px',
  borderRadius: '10px',
  p: 4,
};

const showResultsConfirm = ({ sessionId }) => {
  const navigate = useNavigate();
  return (
    <Box sx={style}>
      <h1>Would you like to view the results?</h1>
      <div>
        <Button
          variant="contained"
          color='primary'
          style={{ margin: '2px' }}
          onClick={() => navigate(`/admin/${sessionId}/results`)}>Yes</Button>
      </div>
    </Box>
  );
}

export default showResultsConfirm;

showResultsConfirm.propTypes = {
  sessionId: PropTypes.any
}
