import React from 'react';
import Router from './core/router';
import useScrollRestore from './hooks/useScrollRestore';

function App() {
  useScrollRestore();

  return (
    <Router />
  
  )
}

export default App;