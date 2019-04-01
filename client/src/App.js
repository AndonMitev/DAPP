import React, { Component } from 'react';
import Navbar from './components/shared/Navbar';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './utils/react/router';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Navbar />
        <div className="container">
          <AppRoutes />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
