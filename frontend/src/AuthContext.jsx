import React, { createContext, useEffect, useState } from 'react'
import api from './api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = async ()=>{
    try{
      const res = await api.get('/auth/me')
      setUser(res.data.user ?? null)
    }catch(e){
      setUser(null)
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ fetchMe() },[])

  const login = async (credentials)=>{
    await api.post('/auth/login', credentials)
    await fetchMe()
  }
  const logout = async ()=>{
    await api.post('/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
