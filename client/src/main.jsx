import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { GoogleOAuthProvider } from '@react-oauth/google'

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId='921591702552-f0anuebgq7cai85qi8r2pkj33bht2c3v.apps.googleusercontent.com'>
      <App />
  </GoogleOAuthProvider>
)

//! StrictMode Cũ
// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )