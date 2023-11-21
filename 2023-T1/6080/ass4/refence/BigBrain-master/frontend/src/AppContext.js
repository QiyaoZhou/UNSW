import React, { createContext } from 'react';

export const initialValue = {
  isAdvance: false
}

export const Context = createContext(initialValue);
export const AppContext = React.useContext;
