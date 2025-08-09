import { useEffect, useState } from 'react'
import { addSleep, listSleeps, updateSleep, deleteSleep } from '../services/local'
import { useAppStore } from '../store/useAppStore'
import { toLocalInputValue, fromLocalInputValue, toLocalDateInputValue } from '../utils/datetime'

export function Sleep() {
  const [start, setStart] = useState<string>(toLocalInputValue())
  const [end, setEnd] = useState<string>('')
  const [notes, setNotes] = useState('')
  const babyId = useAppStore(s=>s.babyId)
  const [saved, setSaved] = useState('')
  const [filterDate, setFilterDate] = useState(toLocalDateInputValue())
  const [items, setItems] = useState<any[]>([])

  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    if(!babyId) return alert('Please create a baby profile in Onboarding')
  await addSleep({ babyId, start: fromLocalInputValue(start).toISOString(), end: end? fromLocalInputValue(end).toISOString(): undefined, notes, synced:false })
  setNotes('')
    setSaved('Saved!')
  setTimeout(()=> setSaved(''), 1200)
  refresh()
  }

  async function refresh(){
    if(!babyId) return
    const rows = await listSleeps(babyId, { date: filterDate || undefined })
    setItems(rows)
  }
  useEffect(()=>{ refresh() }, [babyId, filterDate])

  return (
    <div className="stack gap">
      <h2>Add Sleep</h2>
      <form className="stack gap" onSubmit={onSubmit}>
        <label>
          Start Time
          <input type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} />
        </label>
        <label>
          End Time
          <input type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)} />
        </label>
        <label>
          Notes
          <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Nap, nighttime, etc." />
        </label>
  <button className="btn" type="submit">Save</button>
  {saved && <span aria-live="polite">{saved}</span>}
      </form>

      <h3>Analytics</h3>
      <div className="cards" style={{gridTemplateColumns:'repeat(2, minmax(0,1fr))'}}>
        <label>Date
          <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} />
        </label>
      </div>
      <ul className="stack gap" style={{listStyle:'none', padding:0, margin:0}}>
        {items.map(s => <SleepItem key={s.id} item={s} onChanged={refresh} />)}
        {items.length===0 && <li>No sleep entries found.</li>}
      </ul>
    </div>
  )
}

function SleepItem({ item, onChanged }: { item:any, onChanged: ()=>void }){
  const [editing, setEditing] = useState(false)
  const [start, setStart] = useState(toLocalInputValue(new Date(item.start)))
  const [end, setEnd] = useState(item.end? toLocalInputValue(new Date(item.end)) : '')
  const [notes, setNotes] = useState(item.notes || '')

  async function onSave(){
    await updateSleep(item.id, {
      start: fromLocalInputValue(start).toISOString(),
      end: end? fromLocalInputValue(end).toISOString(): undefined,
      notes,
      synced:false,
    })
    setEditing(false)
    onChanged()
  }
  async function onDelete(){ await deleteSleep(item.id); onChanged() }

  if (!editing) return (
    <li className="card">
      <div><strong>{fmtRange(item.start, item.end)}</strong></div>
      {item.notes && <div>{item.notes}</div>}
      <div className="stack" style={{flexDirection:'row', gap:'.4rem', marginTop:'.5rem'}}>
        <IconBtn onClick={()=>setEditing(true)} title="Edit">✏️</IconBtn>
        <IconBtn onClick={onDelete} title="Delete">🗑️</IconBtn>
      </div>
    </li>
  )
  return (
    <li className="card">
      <label>Start
        <input type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} />
      </label>
      <label>End
        <input type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)} />
      </label>
      <label>Notes
        <input value={notes} onChange={e=>setNotes(e.target.value)} />
      </label>
      <div className="stack" style={{flexDirection:'row', gap:'.4rem', marginTop:'.5rem'}}>
        <IconBtn onClick={onSave} title="Save">💾</IconBtn>
        <IconBtn onClick={()=>setEditing(false)} title="Cancel">↩️</IconBtn>
      </div>
    </li>
  )
}

function fmtRange(startIso: string, endIso?: string){
  const s = new Date(startIso)
  const e = endIso? new Date(endIso): undefined
  const sStr = s.toLocaleString()
  const eStr = e? e.toLocaleString(): '-'
  return `${sStr} → ${eStr}`
}

function IconBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { title?: string, children: React.ReactNode }){
  return <button className="btn" style={{padding:'.4rem .6rem'}} {...props}>{props.children}</button>
}
