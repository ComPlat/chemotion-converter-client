import React from "react"
import App from "./components/App.js"
import ReactDOM from "react-dom";



document.addEventListener('DOMContentLoaded', () => {
  const domElement = document.getElementById('root');
  if (domElement) ReactDOM.render(<App />, domElement);
});