import React from 'react';
import {BrowserRouter,Route} from "react-router-dom";

//css
import "./assets/cssReset/cssReset_v1.css"
import "./assets/fonts/fonts.css"
import './assets/bootstrap/css/bootstrap.css'


import Navbar from "./components/Navbar/Navbar";

function App() {
  return (
    <>
      <BrowserRouter>
        <Route exact path='/' component={Navbar}/>
      </BrowserRouter>
    </>
  );
}

export default App;
