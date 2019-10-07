import React from 'react';
import logo from './logo.svg';
import './App.css';
import Example from './components/Example';
import Login from './components/Login';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/">
          <Example />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
