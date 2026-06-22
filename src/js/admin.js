import React from "react"
import AdminApp from "./components/admin/AdminApp.js"
import ReactDOM from "react-dom";



document.addEventListener('DOMContentLoaded', () => {
  const domElement = document.getElementById('root');
  if (domElement) ReactDOM.render(<AdminApp />, domElement);
});