import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Signup from './pages/Signup'
import Verify from './pages/Verify'
import Events from './pages/Events'
import Relationships from './pages/Relationships'
import Login from './pages/Login'
import AuthProvider, { AuthContext } from './AuthContext'
import './styles.css'

function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthContext.Consumer>
          {({ user, logout }) => (
            <nav className="nav">
              <Link to="/">Signup</Link>
              <Link to="/verify">Verify Email</Link>
              <Link to="/events">Events</Link>
              <Link to="/relationships">Relationships</Link>
              {user ? (
                <>
                  <span>Hi, {user.username}</span>
                  <button onClick={logout}>Logout</button>
                </>
              ) : (
                <Link to="/login">Login</Link>
              )}
            </nav>
          )}
        </AuthContext.Consumer>

        <Routes>
          <Route path="/" element={<Signup/>} />
          <Route path="/verify" element={<Verify/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/events" element={<Events/>} />
          <Route path="/relationships" element={<Relationships/>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')).render(<App />)
