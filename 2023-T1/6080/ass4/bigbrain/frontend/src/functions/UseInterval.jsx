import React, { useEffect } from 'react';

// Custom hook used to periodically perform an operation
export default function useInterval (callback, delay) {
  const savedCallback = React.useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick () {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => {
        clearInterval(id);
      }
    }
  }, [callback, delay]);
}
