import React, { useEffect, useState, useContext } from 'react'
import api from '../api'
import { AuthContext } from '../AuthContext'

export default function Events(){
  const auth = useContext(AuthContext)
  const [events, setEvents] = useState([])
  const [name,setName] = useState('')
  const [when,setWhen] = useState('')
  const [why,setWhy] = useState('')
  const [status,setStatus] = useState('active')
  const [message,setMessage] = useState(null)

  useEffect(()=>{
    if(auth?.user){
      fetchEvents()
    }
  },[auth?.user])

  const fetchEvents = async ()=>{
    try{
      const res = await api.get('/event')
      setEvents(res.data)
    }catch(err){
      console.error(err)
    }
  }

  const submit = async (e)=>{
    e.preventDefault()
    try{
      const res = await api.post('/event',{ name, when, why, status, event_type: 1 })
      setMessage(res.data.message)
      setName(''); setWhy(''); setWhen(''); setStatus('active')
      fetchEvents()
    }catch(err){
      setMessage(err.response?.data?.message || err.message)
    }
  }

  if(!auth?.user) return (<div>Please <a href="/login">login</a> to manage events.</div>)

  return (
    <div>
      <h2>Events</h2>
      <form onSubmit={submit}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
        <input placeholder="When (YYYY-MM-DD)" value={when} onChange={e=>setWhen(e.target.value)} />
        <input placeholder="Why" value={why} onChange={e=>setWhy(e.target.value)} />
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="active">active</option>
          <option value="done">done</option>
        </select>
        <button type="submit">Create event</button>
      </form>

      <div className="list">
        {events.map(ev=> (
          <div key={ev.id} className="card">
            <strong>{ev.name}</strong>
            <div>when: {ev.when}</div>
            <div>why: {ev.why}</div>
            <div>status: {ev.status}</div>
          </div>
        ))}
      </div>
      {message && <div className="card">{message}</div>}
    </div>
  )
}
