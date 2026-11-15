import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import RotateHint from './components/RotateHint.jsx'
import Watermark from './components/Watermark.jsx'
import './index.css'
import './styles/gummy.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <RotateHint />
    <Watermark />
  </React.StrictMode>,
)
