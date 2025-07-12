import { createContext, useContext, useState } from 'react';

const MateContext = createContext();

export function MateProvider({ children }) {
  const [mateName, setMateName] = useState('');
  return (
    <MateContext.Provider value={{ mateName, setMateName }}>
      {children}
    </MateContext.Provider>
  );
}

export function useMate() {
  return useContext(MateContext);
}
