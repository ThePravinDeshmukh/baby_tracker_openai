import { useEffect, useState } from 'react'
import { getLastFeed, getLastDiaper, getLastSleep } from '../services/local'
import { useAppStore } from '../store/useAppStore'

export function SummaryCards(){
  const babyId = useAppStore(s=>s.babyId)
  const [lastFeed, setLastFeed] = useState<string>('-')
  const [lastDiaper, setLastDiaper] = useState<string>('-')
  const [lastSleep, setLastSleep] = useState<string>('-')

  useEffect(()=>{ (async()=>{
    if(!babyId) return
    const f = await getLastFeed(babyId)
    const d = await getLastDiaper(babyId)
    const s = await getLastSleep(babyId)
    setLastFeed(f? new Date(f.at).toLocaleString(): '-')
    setLastDiaper(d? new Date(d.at).toLocaleString(): '-')
    setLastSleep(s? new Date(s.start).toLocaleString(): '-')
  })() }, [babyId])

  return (
    <section className="cards">
      <div className="card"><h3>Last Feed</h3><p>{lastFeed}</p></div>
      <div className="card"><h3>Last Diaper</h3><p>{lastDiaper}</p></div>
      <div className="card"><h3>Last Sleep</h3><p>{lastSleep}</p></div>
      <div className="card"><h3>Today Meds</h3><p>-</p></div>
    </section>
  )
}
