import { useEffect, useState } from 'react'
import { addDiaper, listDiapers, updateDiaper, deleteDiaper } from '../services/local'
import { useAppStore } from '../store/useAppStore'
import { toLocalInputValue, fromLocalInputValue, toLocalDateInputValue, formatTime } from '../utils/datetime'

export function Diaper() {
  const [type, setType] = useState<'wet'|'dirty'|'mixed'>('wet')
  const [notes, setNotes] = useState('')
  const [at, setAt] = useState<string>(toLocalInputValue())
  const [saved, setSaved] = useState('')
  const babyId = useAppStore(s=>s.babyId)
  const [filterDate, setFilterDate] = useState(toLocalDateInputValue())
  const [filterType, setFilterType] = useState<'All'|'wet'|'dirty'|'mixed'>('All')
  const [items, setItems] = useState<any[]>([])
  const [editingItem, setEditingItem] = useState<any|null>(null)

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
      <div className="stack gap">
        {items.map(item => (
          <DiaperRow key={item.id} item={item} onEdit={setEditingItem} onChanged={refresh} />
        ))}
        {items.length===0 && <div className="card">No diaper entries found.</div>}
      </div>

      {editingItem && (
        <EditDiaperModal
          item={editingItem}
          onClose={()=>setEditingItem(null)}
          onSaved={()=>{ setEditingItem(null); refresh() }}
        />
      )}
    </div>
  )
}

function DiaperRow({ item, onEdit, onChanged }: { item:any, onEdit:(it:any)=>void, onChanged:()=>void }){
  const [open, setOpen] = useState(false)
  async function onDelete(){ if(confirm('Delete this diaper entry?')){ await deleteDiaper(item.id); onChanged() } }
  return (
    <div className="feed-entry">
      <div className="feed-entry-main">
        <span className="feed-entry-type">{item.type}</span>
        {item.notes && <span>• {item.notes}</span>}
      </div>
      <div className="feed-entry-time">{formatTime(item.at)}</div>
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

function EditDiaperModal({ item, onClose, onSaved }:{ item:any, onClose:()=>void, onSaved:()=>void }){
  const [type, setType] = useState(item.type as 'wet'|'dirty'|'mixed')
  const [notes, setNotes] = useState<string>(item.notes || '')
  const [at, setAt] = useState<string>(toLocalInputValue(new Date(item.at)))

  async function onSave(e:React.FormEvent){
    e.preventDefault()
    await updateDiaper(item.id, { type, notes, at: fromLocalInputValue(at).toISOString(), synced:false })
    onSaved()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Edit Diaper Entry</h3>
        <form className="stack gap" onSubmit={onSave}>
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
          <div style={{display:'flex', gap:'.5rem'}}>
            <button className="btn" type="submit">Save</button>
            <button type="button" onClick={onClose} style={{padding:'.65rem 1rem', background:'var(--muted)', color:'white', border:'none', borderRadius:'12px'}}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
