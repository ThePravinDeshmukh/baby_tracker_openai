import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { SummaryCards } from '../components/SummaryCards'
import { db } from '../db/db'
import { useAppStore } from '../store/useAppStore'
import { formatDate, formatDateTime, formatTime } from '../utils/datetime'

type Activity = {
  id: string
  kind: 'feed'|'diaper'|'sleep'|'growth'|'ketone'|'vaccine'|'visit'
  when: string
  title: string
  subtitle?: string
  icon: string
}

export function Dashboard() {
  const babyId = useAppStore(s=>s.babyId)
  const [recent, setRecent] = useState<Activity[]>([])

  useEffect(()=>{ if (!babyId) return; (async()=>{
    const [feeds, diapers, sleeps, growth, ketones, vaccines, visits] = await Promise.all([
      db.feeds.where('babyId').equals(babyId).toArray(),
      db.diapers.where('babyId').equals(babyId).toArray(),
      db.sleeps.where('babyId').equals(babyId).toArray(),
      db.growth.where('babyId').equals(babyId).toArray(),
      db.ketones.where('babyId').equals(babyId).toArray(),
      db.vaccines.where('babyId').equals(babyId).toArray(),
      db.visits.where('babyId').equals(babyId).toArray(),
    ])

    const items: Activity[] = []
    for (const f of feeds) items.push({
      id: `feed-${f.id}`,
      kind: 'feed',
      when: f.at,
      title: `Feed • ${f.type}${typeof f.amount === 'number' ? ` • ${f.amount}ml` : ''}`,
      subtitle: f.notes,
      icon: '🍶'
    })
    for (const d of diapers) items.push({
      id: `diaper-${d.id}`,
      kind: 'diaper',
      when: d.at,
      title: `Diaper • ${d.type}`,
      subtitle: d.notes,
      icon: '🧷'
    })
    for (const s of sleeps) items.push({
      id: `sleep-${s.id}`,
      kind: 'sleep',
      when: s.start,
      title: `Sleep • ${formatDateTime(s.start)} → ${s.end ? formatDateTime(s.end) : '-'}`,
      subtitle: s.notes,
      icon: '😴'
    })
    for (const g of growth) items.push({
      id: `growth-${g.id}`,
      kind: 'growth',
      when: g.at,
      title: `Growth${g.weight!=null?` • W: ${g.weight} kg`:''}${g.height!=null?` • H: ${g.height} cm`:''}${g.head!=null?` • HC: ${g.head} cm`:''}`,
      icon: '📈'
    })
    for (const k of ketones) items.push({
      id: `ketone-${k.id}`,
      kind: 'ketone',
      when: k.at,
      title: `Ketone • ${k.level}`,
      icon: '🧪'
    })
    for (const v of vaccines) items.push({
      id: `vaccine-${v.id}`,
      kind: 'vaccine',
      when: v.date,
      title: `Vaccine • ${v.type}`,
      icon: '💉'
    })
    for (const vis of visits) items.push({
      id: `visit-${vis.id}`,
      kind: 'visit',
      when: vis.date,
      title: `Doctor Visit • ${vis.doctor}`,
      subtitle: vis.notes,
      icon: '🩺'
    })

    items.sort((a,b)=> new Date(b.when).getTime() - new Date(a.when).getTime())
    setRecent(items.slice(0, 20))
  })() }, [babyId])

  return (
    <div className="stack gap">
      <SummaryCards />

      <section className="quick-actions">
        <Link className="btn" to="/feed">+ Feed</Link>
        <Link className="btn" to="/diaper">+ Diaper</Link>
        <Link className="btn" to="/sleep">+ Sleep</Link>
        <Link className="btn" to="/growth">+ Growth</Link>
      </section>

      <section>
        <h3>Timeline</h3>
        <div className="stack gap">
          {(() => {
            if (recent.length === 0) return <div className="card">No recent activity.</div>
            const groups: { date: string; items: Activity[] }[] = []
            let last: string | null = null
            for (const r of recent) {
              const key = formatDate(r.when)
              if (key !== last) { groups.push({ date: key, items: [r] }); last = key }
              else groups[groups.length-1].items.push(r)
            }
            return groups.map(g => (
              <div key={g.date} className="activity-group">
                <div className="activity-date">{g.date}</div>
                <div className="stack gap">
                  {g.items.map(r => (
                    <div key={r.id} className="activity-entry">
                      <div style={{fontSize:'1.2rem'}}>{r.icon}</div>
                      <div className="activity-entry-main">
                        <div><strong>{r.title}</strong>{r.subtitle? ` • ${r.subtitle}`: ''}</div>
                      </div>
                      <div className="activity-entry-time">{formatTime(r.when)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          })()}
        </div>
      </section>

      <section>
        <h3>Upcoming</h3>
        <p>Next feed or medicine reminders.</p>
        <button className="btn" onClick={() => { (window as any).deferredPrompt?.prompt?.() }}>Install App</button>
      </section>
    </div>
  )
}
