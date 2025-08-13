import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { db } from '../db/db'
import { useAppStore } from '../store/useAppStore'
import { pushUnsynced } from '../services/sync'

export function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [babies, setBabies] = useState<{id:number; name:string}[]>([])
  const babyId = useAppStore(s=>s.babyId)
  const setBabyId = useAppStore(s=>s.setBabyId)
  const title = (() => {
    if (pathname === '/') return 'Dashboard'
    const t = pathname.slice(1)
    return t.charAt(0).toUpperCase() + t.slice(1)
  })()

  // Load babies on mount
  useEffect(()=>{ (async()=>{
    const list = await db.babies.toArray()
    setBabies(list.map(b=>({ id: b.id!, name: b.name })))
    if (!babyId && list.length>0) setBabyId(list[0].id!)
    if (list.length===0 && pathname !== '/onboarding') navigate('/onboarding')
  })() }, [])

  // Periodic background sync
  useEffect(()=>{
    const id = setInterval(()=>{ pushUnsynced() }, 60000)
    return ()=> clearInterval(id)
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="brand">👶 Baby Tracker</Link>
        <select aria-label="Select baby" value={babyId ?? ''} onChange={e=>setBabyId(Number(e.target.value))}>
          {babies.map(b=> <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <div className="spacer" />
        <NavLink to="/settings">⚙️</NavLink>
      </header>
      <main className="app-main">
        <div className="container">
          <h1 className="page-title">{title}</h1>
          <Outlet />
        </div>
      </main>
      <nav className="bottom-nav">
        <NavLink to="/" aria-label="Home">
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </NavLink>
        <NavLink to="/feed" aria-label="Feed">
          <span className="nav-icon">🍼</span>
          <span className="nav-label">Feed</span>
        </NavLink>
        <NavLink to="/diaper" aria-label="Diaper">
          <span className="nav-icon">🧷</span>
          <span className="nav-label">Diaper</span>
        </NavLink>
        <NavLink to="/sleep" aria-label="Sleep">
          <span className="nav-icon">😴</span>
          <span className="nav-label">Sleep</span>
        </NavLink>
        <NavLink to="/growth" aria-label="Growth">
          <span className="nav-icon">📈</span>
          <span className="nav-label">Growth</span>
        </NavLink>
        <NavLink to="/health" aria-label="Health">
          <span className="nav-icon">🩺</span>
          <span className="nav-label">Health</span>
        </NavLink>
      </nav>
    </div>
  )
}
