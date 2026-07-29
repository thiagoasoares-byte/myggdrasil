import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../AuthContext'
import api from '../api'

export default function Hub(){
  const { user, fetchMe, logout } = useContext(AuthContext)
  const [events, setEvents] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [form, setForm] = useState({ title:'', when:'', category:'1', why:'', parent:'' })
  const [profileForm, setProfileForm] = useState({ name:'', email:'', birth_dt:'', password:'' })

  useEffect(()=>{ loadEvents(); if(user) setProfileForm({ name: user.name||'', email: user.email||'', birth_dt: user.birth_dt ? new Date(user.birth_dt).toISOString().slice(0,10) : '', password: '' }) },[user])

  async function loadEvents(){
    try{
      const res = await api.get('/event/event')
      // backend sometimes returns array or object
      const data = Array.isArray(res.data) ? res.data : (res.data.events || res.data || [])
      setEvents(data)
      if(data.length) setSelectedId(data[data.length-1].id || data[data.length-1].event_id || null)
    }catch(e){
      console.warn('loadEvents failed', e.message)
    }
  }

  function childrenOf(id){
    return events.filter(d => (d.childOf === id) || (d.parent === id) || (d.parent_id === id) || (d.child_of === id))
  }

  function escapeHtml(s){ return s ? String(s).replace(/[&<>\"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])) : '' }

  function selectNode(id){ setSelectedId(id) }

  function openModal(preselect){
    setForm(f=>({ ...f, parent: preselect || '' }))
    setModalOpen(true)
  }
  function closeModal(){ setModalOpen(false) }

  async function createEvent(){
    const payload = {
      name: form.title,
      event_type: parseInt(form.category) || 1,
      when: form.when ? new Date(form.when).toISOString() : new Date().toISOString(),
      why: form.why,
      status: 'active'
    }
    try{
      await api.post('/event/event/create', payload)
      closeModal()
      await loadEvents()
    }catch(e){ alert('Erro ao criar evento: ' + (e.response?.data?.message || e.message)) }
  }

  // profile
  function openProfile(){ setAuthMode('profile'); setAuthModalOpen(true) }
  function closeAuthModal(){ setAuthModalOpen(false) }

  async function updateProfile(){
    try{
      await api.put('/user/profile/update', { name: profileForm.name || undefined, email: profileForm.email || undefined, birth_dt: profileForm.birth_dt ? new Date(profileForm.birth_dt).toISOString() : undefined })
      if(profileForm.password){
        try{ await api.post('/user/change-password', { password: profileForm.password }) }catch(_){ /* ignore if unsupported */ }
      }
      alert('Perfil atualizado')
      await fetchMe()
      closeAuthModal()
    }catch(e){ alert('Erro ao atualizar perfil: '+(e.response?.data?.message||e.message)) }
  }

  async function handleDeleteAccount(){
    const ok = confirm('Deseja realmente deletar sua conta? Essa ação é irreversível.')
    if(!ok) return
    const password = prompt('Digite sua senha para confirmar:')
    if(!password) return alert('Senha requerida')
    try{
      await api.delete('/user/profile/delete', { data: { password } })
      alert('Conta deletada')
      await logout()
    }catch(e){ alert('Erro ao deletar conta: '+(e.response?.data?.message||e.message)) }
  }

  return (
    <div>
      <header>
        <div className="logo">Myggdrasil</div>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <div className="status-pill"><span className="status-dot"></span>{events.length} decisões</div>
          {user ? (
            <button className="btn-new" onClick={openProfile}>{user.name || 'Perfil'}</button>
          ) : (
            <button className="btn-new" onClick={()=>{ setAuthMode('login'); setAuthModalOpen(true) }}>Entrar</button>
          )}
        </div>
      </header>

      <main>
        <p className="eyebrow">hub</p>
        <h1 className="page-title">Sua árvore de decisões</h1>
        <p className="page-sub">A linha do tempo completa das suas decisões. Toque em qualquer nó para ver os detalhes e ligar consequências a ele.</p>

        <div className="layout">
          <div className="timeline-wrap">
            <div className="trunk-line-bg"></div>
            <ul className="nodes">
              {events.map(d => {
                const id = d.id || d.event_id
                const date = (d.when||d.date||'').slice ? (d.when||d.date).slice(0,7) : ''
                const title = d.name || d.title || '—'
                const excerpt = d.why || d.excerpt || ''
                const category = (d.event_type && (d.event_type.name || d.event_type)) || d.category || '—'
                const childOf = d.childOf || d.child_of || d.parent || d.parent_id || null
                const isChild = !!childOf
                return (
                  <li key={id} className={`node ${isChild? 'is-child' : ''} ${id === selectedId ? 'is-active' : ''}`}>
                    <span className="node-dot"></span>
                    <button className="node-card" onClick={()=>selectNode(id)}>
                      <div className="node-meta"><span className="node-date">{date}</span><span className="tag">{category}</span></div>
                      <p className="node-title">{title}</p>
                      <p className="node-excerpt">{excerpt}</p>
                      {isChild && <div className="branch-hint">↳ consequência de "{(events.find(p=> (p.id||p.event_id)===childOf)||{}).name || '—'}"</div>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <aside className="detail-panel">
            {selectedId ? (
              (()=>{
                const d = events.find(x => (x.id||x.event_id) === selectedId)
                if(!d) return <div><p className="detail-eyebrow">Nenhuma decisão</p></div>
                const kids = childrenOf(selectedId)
                return (
                  <div>
                    <p className="detail-eyebrow">decisão selecionada</p>
                    <p className="detail-title">{d.name||d.title}</p>
                    <p className="detail-date">{(d.when||d.date||'').slice(0,10)} · {(d.event_type && d.event_type.name) || d.category || ''}</p>
                    <p className="detail-body">{d.why||d.body||''}</p>
                    <p className="consequences-label">// consequências ({kids.length})</p>
                    {kids.length ? kids.map(k => <div key={k.id||k.event_id} className="consequence-chip">{k.name||k.title}</div>) : <p className="no-consequences">Nenhuma consequência vinculada ainda.</p>}
                    <button className="btn-link" onClick={()=>openModal(selectedId)}>Adicionar consequência</button>
                  </div>
                )
              })()
            ) : (
              <div><p className="detail-eyebrow">Nenhuma decisão selecionada</p><p className="detail-body">Selecione um nó para ver detalhes.</p></div>
            )}
          </aside>
        </div>
      </main>

      <button className="fab" onClick={()=>openModal(null)}>+</button>

      {/* create modal */}
      <div className={`modal-overlay ${modalOpen? 'open' : ''}`}>
        <div className="modal">
          <p className="modal-title">Nova decisão</p>
          <p className="modal-sub">Registre uma decisão ou evento na sua árvore.</p>
          <div className="field"><label>Título</label><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} /></div>
          <div className="field"><label>Data</label><input type="date" value={form.when} onChange={e=>setForm(f=>({...f,when:e.target.value}))} /></div>
          <div className="field"><label>Categoria</label><select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}><option value="1">Carreira</option><option value="2">Estudo</option><option value="3">Projeto pessoal</option><option value="4">Financeiro</option><option value="5">Pessoal</option></select></div>
          <div className="field"><label>Descrição</label><textarea value={form.why} onChange={e=>setForm(f=>({...f,why:e.target.value}))} /></div>
          <div className="field"><label>Vincular como consequência de (opcional)</label><select value={form.parent} onChange={e=>setForm(f=>({...f,parent:e.target.value}))}><option value="">Nenhuma — decisão independente</option>{events.map(ev=><option key={ev.id||ev.event_id} value={ev.id||ev.event_id}>{ev.name||ev.title}</option>)}</select></div>
          <div className="modal-actions"><button className="btn-ghost" onClick={closeModal}>Cancelar</button><button className="btn-primary" onClick={createEvent}>Salvar decisão</button></div>
        </div>
      </div>

      {/* auth/profile modal */}
      <div className={`modal-overlay ${authModalOpen? 'open' : ''}`}>
        <div className="modal">
          <p className="modal-title">{authMode==='profile'? 'Perfil' : (authMode==='login'? 'Entrar' : 'Criar conta')}</p>
          <p className="modal-sub">{authMode==='profile'? 'Atualize seus dados' : 'Acesse sua conta'}</p>
          {authMode==='profile' ? (
            <div>
              <div className="field"><label>Nome</label><input value={profileForm.name} onChange={e=>setProfileForm(p=>({...p,name:e.target.value}))} /></div>
              <div className="field"><label>Email</label><input value={profileForm.email} onChange={e=>setProfileForm(p=>({...p,email:e.target.value}))} /></div>
              <div className="field"><label>Data de Nascimento</label><input type="date" value={profileForm.birth_dt} onChange={e=>setProfileForm(p=>({...p,birth_dt:e.target.value}))} /></div>
              <div className="field"><label>Nova senha (opcional)</label><input type="password" value={profileForm.password} onChange={e=>setProfileForm(p=>({...p,password:e.target.value}))} /></div>
              <div className="modal-actions"><button className="btn-ghost" onClick={closeAuthModal}>Cancelar</button><button className="btn-primary" onClick={updateProfile}>Salvar perfil</button></div>
              <div style={{marginTop:12,display:'flex',gap:8}}><button className="btn-ghost" onClick={logout}>Logout</button><button className="btn-ghost" onClick={handleDeleteAccount} style={{color:'#f88',borderColor:'rgba(255,100,100,0.12)'}}>Deletar conta</button></div>
            </div>
          ) : authMode==='login' ? (
            <div>
              {/* simple login form that calls context login */}
              <LoginForm onSuccess={()=>{ closeAuthModal(); loadEvents(); }} />
            </div>
          ) : (
            <div>
              <SignupForm onSuccess={()=>{ setAuthMode('login') }} />
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

function LoginForm({ onSuccess }){
  const { login } = useContext(AuthContext)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  async function doLogin(){
    try{ await login({ name, email, password }); onSuccess && onSuccess() }catch(e){ alert('Erro no login: '+(e.response?.data?.message||e.message)) }
  }
  return (
    <div>
      <div className="field"><label>Nome</label><input value={name} onChange={e=>setName(e.target.value)} /></div>
      <div className="field"><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} /></div>
      <div className="field"><label>Senha</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
      <div className="modal-actions"><button className="btn-ghost" onClick={()=>{}}>Fechar</button><button className="btn-primary" onClick={doLogin}>Entrar</button></div>
    </div>
  )
}

function SignupForm({ onSuccess }){
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [birth,setBirth] = useState('')
  async function doSignup(){
    try{ await api.post('/user/signup', { name, email, password, birth_dt: birth? new Date(birth).toISOString() : undefined }); alert('Conta criada, faça login'); onSuccess && onSuccess() }catch(e){ alert('Erro no cadastro: '+(e.response?.data?.message||e.message)) }
  }
  return (
    <div>
      <div className="field"><label>Nome</label><input value={name} onChange={e=>setName(e.target.value)} /></div>
      <div className="field"><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} /></div>
      <div className="field"><label>Senha</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
      <div className="field"><label>Data de Nascimento</label><input type="date" value={birth} onChange={e=>setBirth(e.target.value)} /></div>
      <div className="modal-actions"><button className="btn-ghost" onClick={()=>{}}>Fechar</button><button className="btn-primary" onClick={doSignup}>Criar conta</button></div>
    </div>
  )
}
