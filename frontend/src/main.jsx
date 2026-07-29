import React, { useContext } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import Signup from './pages/Signup'
import Verify from './pages/Verify'
import Events from './pages/Events'
import Relationships from './pages/Relationships'
import Login from './pages/Login'
import Hub from './pages/Hub'
import AuthProvider, { AuthContext } from './AuthContext'
import './styles.css'

function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthContext.Consumer>
          {({ user, logout }) => (
            <nav className="nav">
              {!user ? (
                <>
                  <Link to="/">Signup</Link>
                  <Link to="/login">Login</Link>
                </>
              ) : (
                <>
                  <Link to="/hub">Hub</Link>
                  <button className="btn-ghost" onClick={logout}>Logout</button>
                </>
              )}
            </nav>
          )}
        </AuthContext.Consumer>

        <Routes>
          <Route path="/" element={<Signup/>} />
          <Route path="/verify" element={<Verify/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/hub" element={<Hub/>} />
          <Route path="/events" element={<Events/>} />
          <Route path="/relationships" element={<Relationships/>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function HubRoute(){
  const { user } = useContext(AuthContext)
  if(!user) return <Navigate to="/login" replace />
  // user is authenticated: open the static hub page served from public/hub.html
  window.location.href = '/hub.html'
  return null
}

createRoot(document.getElementById('root')).render(<App />)
