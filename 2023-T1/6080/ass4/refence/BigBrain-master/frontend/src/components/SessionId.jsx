import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import styled from 'styled-components';
import PropTypes from 'prop-types';

// MUI components
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const SessionId = ({ sessionId }) => {
  return (
    <Wrapper>
      <SessionBtn
        variant="contained"
        color='secondary'
        sx={{ fontWeight: 800 }}
      >
        {`Session ID: ${sessionId}`}
      </SessionBtn>
      <CopyToClipboard text={`http://localhost:3000/player/join/${sessionId}`}>
        <Button variant="contained" >
          <ContentCopyIcon fontSize='small' />
        </Button>
      </CopyToClipboard>
    </Wrapper>
  )
}

export default SessionId;

SessionId.propTypes = {
  sessionId: PropTypes.any
}

const Wrapper = styled.div`
  display: flex;
  gap: 0.3rem;
  width: 200px;
  height: 50px;
`;

const SessionBtn = styled(Button)`
  width: 160px;
`;
