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
        <NavLink to="/">Home</NavLink>
        <NavLink to="/feed">Feed</NavLink>
        <NavLink to="/diaper">Diaper</NavLink>
        <NavLink to="/sleep">Sleep</NavLink>
        <NavLink to="/growth">Growth</NavLink>
  <NavLink to="/health">Health</NavLink>
      </nav>
    </div>
  )
}
