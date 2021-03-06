import React from 'react';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import TimeLine from './components/TimeLine';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/rooms/:roomId">
          <Home />
        </Route>
        <Route path="/git-time-line">
          <TimeLine />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
