import React from 'react';
import { Alert, AlertTitle, Dialog } from '@mui/material';

const AlertBox = ({ isOpen, severity, title, message, handleClose }) => {
  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
      >
        <Alert
          severity={severity}
          onClose={handleClose}
        >
          <AlertTitle>{title}</AlertTitle>
          {message}
        </Alert>
      </Dialog>
    </>
  );
}

export default AlertBox;
