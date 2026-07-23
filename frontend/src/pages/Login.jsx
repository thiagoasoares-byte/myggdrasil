import React, { useState, useContext } from 'react'
import api from '../api'
import { AuthContext } from '../AuthContext'

export default function Login(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [loading,setLoading] = useState(false)
  const [message,setMessage] = useState(null)
  const auth = useContext(AuthContext)

  const submit = async (e)=>{
    e.preventDefault()
    setLoading(true)
    try{
      await auth.login({ email, password })
      setMessage('Logged in')
    }catch(err){
      setMessage(err.response?.data?.message || err.message)
    }finally{ setLoading(false) }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
      </form>
      {message && <div className="card">{message}</div>}
    </div>
  )
}
