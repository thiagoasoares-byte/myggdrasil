import React, { useEffect, useState, useContext } from 'react'
import api from '../api'
import { AuthContext } from '../AuthContext'

export default function Relationships(){
  const auth = useContext(AuthContext)
  const [parentId,setParentId] = useState('')
  const [childId,setChildId] = useState('')
  const [relationship,setRelationship] = useState('')
  const [eventId,setEventId] = useState('')
  const [relations,setRelations] = useState([])
  const [message,setMessage] = useState(null)

  const create = async (e)=>{
    e.preventDefault()
    try{
      const res = await api.post('/event/relationship',{ parentId: Number(parentId), childId: Number(childId), relationship })
      setMessage('Relation created')
    }catch(err){
      setMessage(err.response?.data?.message || err.message)
    }
  }

  const fetch = async (e)=>{
    e.preventDefault()
    try{
      const res = await api.get(`/event/${eventId}/relationships`)
      setRelations(res.data)
    }catch(err){
      setMessage(err.response?.data?.message || err.message)
    }
  }

  const remove = async (id)=>{
    try{
      await api.delete(`/event/relationship/${id}`)
      setRelations(relations.filter(r=>r.id !== id))
    }catch(err){
      setMessage(err.response?.data?.message || err.message)
    }
  }

  if(!auth?.user) return (<div>Please <a href="/login">login</a> to manage relationships.</div>)

  return (
    <div>
      <h2>Manage Relationships</h2>
      <form onSubmit={create}>
        <input placeholder="Parent ID" value={parentId} onChange={e=>setParentId(e.target.value)} required />
        <input placeholder="Child ID" value={childId} onChange={e=>setChildId(e.target.value)} required />
        <input placeholder="Relationship label" value={relationship} onChange={e=>setRelationship(e.target.value)} />
        <button type="submit">Create relation</button>
      </form>

      <hr />

      <form onSubmit={fetch}>
        <input placeholder="Event ID to list relations" value={eventId} onChange={e=>setEventId(e.target.value)} required />
        <button type="submit">List relations</button>
      </form>

      <div className="list">
        {relations.map(r=> (
          <div key={r.id} className="card">
            <div>id: {r.id}</div>
            <div>parent: {r.parent?.id} - {r.parent?.name}</div>
            <div>child: {r.child?.id} - {r.child?.name}</div>
            <div>label: {r.relationship}</div>
            <button onClick={()=>remove(r.id)}>Delete</button>
          </div>
        ))}
      </div>

      {message && <div className="card">{message}</div>}
    </div>
  )
}
