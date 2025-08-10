import { useEffect, useState } from 'react'
import { addSleep, listSleeps, updateSleep, deleteSleep } from '../services/local'
import { useAppStore } from '../store/useAppStore'
import { toLocalInputValue, fromLocalInputValue, toLocalDateInputValue, formatTime } from '../utils/datetime'

export function Sleep() {
  const [start, setStart] = useState<string>(toLocalInputValue())
  const [end, setEnd] = useState<string>('')
  const [notes, setNotes] = useState('')
  const babyId = useAppStore(s=>s.babyId)
  const [saved, setSaved] = useState('')
  const [filterDate, setFilterDate] = useState(toLocalDateInputValue())
  const [items, setItems] = useState<any[]>([])
  const [editingItem, setEditingItem] = useState<any|null>(null)

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
      <div className="stack gap">
        {items.map(item => (
          <SleepRow key={item.id} item={item} onEdit={setEditingItem} onChanged={refresh} />
        ))}
        {items.length===0 && <div className="card">No sleep entries found.</div>}
      </div>

      {editingItem && (
        <EditSleepModal
          item={editingItem}
          onClose={()=>setEditingItem(null)}
          onSaved={()=>{ setEditingItem(null); refresh() }}
        />
      )}
    </div>
  )
}

function SleepRow({ item, onEdit, onChanged }:{ item:any, onEdit:(it:any)=>void, onChanged:()=>void }){
  const [open, setOpen] = useState(false)
  async function onDelete(){ if(confirm('Delete this sleep entry?')){ await deleteSleep(item.id); onChanged() } }
  return (
    <div className="feed-entry">
      <div className="feed-entry-main">
        <span className="feed-entry-type">Sleep</span>
        <span>• {formatTime(item.start)} - {item.end? formatTime(item.end): '-'}</span>
        {item.notes && <span>• {item.notes}</span>}
      </div>
      <div className="feed-entry-time">{formatTime(item.start)}</div>
      <div className="context-menu">
        <button className="context-menu-btn" onClick={()=>setOpen(!open)} onBlur={()=>setTimeout(()=>setOpen(false),200)}>⋯</button>
        {open && (
          <div className="context-menu-dropdown">
            <button className="context-menu-item" onClick={()=>{ onEdit(item); setOpen(false) }}>Edit</button>
            <button className="context-menu-item" onClick={()=>{ onDelete(); setOpen(false) }}>Delete</button>
          </div>
        )}
      </div>
    </div>
  )
}

function EditSleepModal({ item, onClose, onSaved }:{ item:any, onClose:()=>void, onSaved:()=>void }){
  const [start, setStart] = useState(toLocalInputValue(new Date(item.start)))
  const [end, setEnd] = useState(item.end? toLocalInputValue(new Date(item.end)) : '')
  const [notes, setNotes] = useState(item.notes || '')

  async function onSave(e:React.FormEvent){
    e.preventDefault()
    await updateSleep(item.id, {
      start: fromLocalInputValue(start).toISOString(),
      end: end? fromLocalInputValue(end).toISOString(): undefined,
      notes,
      synced:false,
    })
    onSaved()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Edit Sleep Entry</h3>
        <form className="stack gap" onSubmit={onSave}>
          <label>Start
            <input type="datetime-local" value={start} onChange={e=>setStart(e.target.value)} />
          </label>
          <label>End
            <input type="datetime-local" value={end} onChange={e=>setEnd(e.target.value)} />
          </label>
          <label>Notes
            <input value={notes} onChange={e=>setNotes(e.target.value)} />
          </label>
          <div style={{display:'flex', gap:'.5rem'}}>
            <button className="btn" type="submit">Save</button>
            <button type="button" onClick={onClose} style={{padding:'.65rem 1rem', background:'var(--muted)', color:'white', border:'none', borderRadius:'12px'}}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
