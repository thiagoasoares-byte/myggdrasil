import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Signup(){
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [birth,setBirth] = useState('')
  const [message,setMessage] = useState(null)
  const navigate = useNavigate()

  const submit = async (e)=>{
    e.preventDefault()
    try{
      const payload = { name, email, password }
      if(birth) payload.birth_dt = new Date(birth).toISOString()
      const res = await api.post('/user/signup', payload)
      setMessage(res.data.message)
      // redirect user to login page after successful signup
      navigate('/login')
    }catch(err){
      setMessage(err.response?.data?.message || err.message)
    }
  }

  return (
    <div>
      <header className="logo">Myggdrasil</header>
      <h2>Signup</h2>
      <form onSubmit={submit}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <input placeholder="Data de nascimento (opcional)" type="date" value={birth} onChange={e=>setBirth(e.target.value)} />
        <button className="btn-primary" type="submit">Create account</button>
      </form>
      {message && <div className="card">{message}</div>}
    </div>
  )
}
