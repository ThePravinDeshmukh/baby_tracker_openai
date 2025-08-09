import { useEffect, useState } from 'react'
import { addDiaper, listDiapers, updateDiaper, deleteDiaper } from '../services/local'
import { useAppStore } from '../store/useAppStore'
import { toLocalInputValue, fromLocalInputValue, toLocalDateInputValue } from '../utils/datetime'

export function Diaper() {
  const [type, setType] = useState<'wet'|'dirty'|'mixed'>('wet')
  const [notes, setNotes] = useState('')
  const [at, setAt] = useState<string>(toLocalInputValue())
  const [saved, setSaved] = useState('')
  const babyId = useAppStore(s=>s.babyId)
  const [filterDate, setFilterDate] = useState(toLocalDateInputValue())
  const [filterType, setFilterType] = useState<'All'|'wet'|'dirty'|'mixed'>('All')
  const [items, setItems] = useState<any[]>([])

  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    if(!babyId) return alert('Please create a baby profile in Onboarding')
  await addDiaper({ babyId, type, notes, at: fromLocalInputValue(at).toISOString(), synced:false })
  setNotes('')
  setSaved('Saved!')
  setTimeout(()=> setSaved(''), 1200)
    refresh()
  }

  async function refresh(){
    if(!babyId) return
    const rows = await listDiapers(babyId, { date: filterDate || undefined, type: filterType })
    setItems(rows)
  }
  useEffect(()=>{ refresh() }, [babyId, filterDate, filterType])

  return (
    <div className="stack gap">
      <h2>Add Diaper Change</h2>
      <form className="stack gap" onSubmit={onSubmit}>
        <label>
          Type
          <select value={type} onChange={e=>setType(e.target.value as any)}>
            <option value="wet">Wet</option>
            <option value="dirty">Dirty</option>
            <option value="mixed">Mixed</option>
          </select>
        </label>
        <label>
          Color & Notes
          <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional notes" />
        </label>
        <label>
          Time
          <input type="datetime-local" value={at} onChange={e=>setAt(e.target.value)} />
        </label>
  <button className="btn" type="submit">Save</button>
  {saved && <span aria-live="polite">{saved}</span>}
      </form>

      <h3>Recent</h3>
      <div className="cards" style={{gridTemplateColumns:'repeat(2, minmax(0,1fr))'}}>
        <label>
          Date
          <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} />
        </label>
        <label>
          Type
          <select value={filterType} onChange={e=>setFilterType(e.target.value as any)}>
            <option value="All">All</option>
            <option value="wet">Wet</option>
            <option value="dirty">Dirty</option>
            <option value="mixed">Mixed</option>
          </select>
        </label>
      </div>
      <ul className="stack gap" style={{listStyle:'none', padding:0, margin:0}}>
        {items.map(d => <DiaperItem key={d.id} item={d} onChanged={refresh} />)}
        {items.length===0 && <li>No diaper entries found.</li>}
      </ul>
    </div>
  )
}

function IconBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { title?: string, children: React.ReactNode }){
  return <button className="btn" style={{padding:'.4rem .6rem'}} {...props}>{props.children}</button>
}

function DiaperItem({ item, onChanged }: { item: any, onChanged: ()=>void }){
  const [editing, setEditing] = useState(false)
  const [type, setType] = useState(item.type as 'wet'|'dirty'|'mixed')
  const [notes, setNotes] = useState<string>(item.notes || '')
  const [at, setAt] = useState<string>(toLocalInputValue(new Date(item.at)))

  async function onSave(){
    await updateDiaper(item.id, { type, notes, at: fromLocalInputValue(at).toISOString(), synced:false })
    setEditing(false)
    onChanged()
  }
  async function onDelete(){ await deleteDiaper(item.id); onChanged() }

  if (!editing) return (
    <li className="card">
      <div><strong>{item.type}</strong></div>
      {item.notes && <div>{item.notes}</div>}
      <div style={{color:'var(--muted)'}}>{new Date(item.at).toLocaleString()}</div>
      <div className="stack" style={{flexDirection:'row', gap:'.4rem', marginTop:'.5rem'}}>
        <IconBtn onClick={()=>setEditing(true)} title="Edit">✏️</IconBtn>
        <IconBtn onClick={onDelete} title="Delete">🗑️</IconBtn>
      </div>
    </li>
  )
  return (
    <li className="card">
      <label>Type
        <select value={type} onChange={e=>setType(e.target.value as any)}>
          <option value="wet">Wet</option>
          <option value="dirty">Dirty</option>
          <option value="mixed">Mixed</option>
        </select>
      </label>
      <label>Notes
        <input value={notes} onChange={e=>setNotes(e.target.value)} />
      </label>
      <label>Time
        <input type="datetime-local" value={at} onChange={e=>setAt(e.target.value)} />
      </label>
      <div className="stack" style={{flexDirection:'row', gap:'.4rem', marginTop:'.5rem'}}>
        <IconBtn onClick={onSave} title="Save">💾</IconBtn>
        <IconBtn onClick={()=>setEditing(false)} title="Cancel">↩️</IconBtn>
      </div>
    </li>
  )
}
