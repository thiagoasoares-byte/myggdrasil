import React, { useState } from 'react'
import api from '../api'

export default function Signup(){
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [message,setMessage] = useState(null)

  const submit = async (e)=>{
    e.preventDefault()
    try{
      const res = await api.post('/user/signup',{ name, email, password })
      setMessage(res.data.message)
    }catch(err){
      setMessage(err.response?.data?.message || err.message)
    }
  }

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={submit}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit">Create account</button>
      </form>
      {message && <div className="card">{message}</div>}
    </div>
  )
}
