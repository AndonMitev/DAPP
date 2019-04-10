import React, { Component } from 'react';
import Navbar from './components/shared/Navbar';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './utils/react/router';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <ToastContainer autoClose={4000}/>
        <Navbar />
        <div className="container">
          <AppRoutes />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
