import { useState, useEffect  } from 'react'
import './App.css'
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Switch  } from "react-router-dom";
import FormABV1 from "./Component/FormABV1/FormABV1";
import LeeABV from "./Component/LeeABV/LeeABV";

function App() {

  
  return (
    <div className="container">
    <Router>
     <Switch>
        <Route exact path="/">
          <FormABV1 />
        </Route>
        <Route exact path="/FormABV1">
          <FormABV1 />
        </Route>
        <Route exact path="/datastorage">
          <LeeABV />
        </Route>
     </Switch>
     </Router>
    </div>
  )
}

export default App
