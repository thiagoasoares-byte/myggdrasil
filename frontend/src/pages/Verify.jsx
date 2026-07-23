import React, { useState } from 'react'
import api from '../api'

export default function Verify(){
  const [token,setToken] = useState('')
  const [message,setMessage] = useState(null)

  const submit = async (e)=>{
    e.preventDefault()
    try{
      const res = await api.post('/user/verify-email',{ token })
      setMessage(res.data.message)
    }catch(err){
      setMessage(err.response?.data?.message || err.message)
    }
  }

  return (
    <div>
      <h2>Verify Email</h2>
      <form onSubmit={submit}>
        <input placeholder="Token" value={token} onChange={e=>setToken(e.target.value)} required />
        <button type="submit">Verify</button>
      </form>
      {message && <div className="card">{message}</div>}
    </div>
  )
}
