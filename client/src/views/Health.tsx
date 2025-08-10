import { useEffect, useState } from 'react'
import { addMedication, addTemperature, addKetone, listMedications, listTemperatures, listKetones, updateMedication, deleteMedication, updateTemperature, deleteTemperature, updateKetone, deleteKetone } from '../services/local'
import { useAppStore } from '../store/useAppStore'
import { toLocalInputValue, toLocalDateInputValue, fromLocalInputValue, formatTime } from '../utils/datetime'

export function Health(){
  const babyId = useAppStore(s=>s.babyId)
  // Medication
  const [mAt, setMAt] = useState(toLocalInputValue())
  const [mName, setMName] = useState('')
  const [mDose, setMDose] = useState('')
  const [mNotes, setMNotes] = useState('')
  const [savedMed, setSavedMed] = useState('')
  // Temperature
  const [tAt, setTAt] = useState(toLocalInputValue())
  const [tF, setTF] = useState('')
  const [tNotes, setTNotes] = useState('')
  const [savedTemp, setSavedTemp] = useState('')
  // Ketones
  const [kAt, setKAt] = useState(toLocalInputValue())
  const [kLevel, setKLevel] = useState('Negative')
  const [savedKetone, setSavedKetone] = useState('')
  // Lists
  const [filterDate, setFilterDate] = useState(toLocalDateInputValue())
  const [medItems, setMedItems] = useState<any[]>([])
  const [tempItems, setTempItems] = useState<any[]>([])
  const [ketItems, setKetItems] = useState<any[]>([])
  const [editing, setEditing] = useState<{ type:'med'|'temp'|'ket', item:any }|null>(null)

  async function onAddMed(e:React.FormEvent){
    e.preventDefault()
    if(!babyId) return alert('Please create a baby profile in Onboarding')
    await addMedication({ babyId, name: mName, dose: mDose || undefined, notes: mNotes || undefined, at: new Date(mAt).toISOString(), synced:false })
    setMName(''); setMDose(''); setMNotes('')
    setSavedMed('Saved!'); setTimeout(()=> setSavedMed(''), 1200)
  refresh()
  }
  async function onAddTemp(e:React.FormEvent){
    e.preventDefault()
    if(!babyId) return alert('Please create a baby profile in Onboarding')
    const f = parseFloat(tF)
    if(Number.isNaN(f)) return alert('Enter temperature in °F')
    const c = (f - 32) * 5/9
    await addTemperature({ babyId, celsius: c, at: new Date(tAt).toISOString(), notes: tNotes || undefined, synced:false })
    setTF(''); setTNotes('')
    setSavedTemp('Saved!'); setTimeout(()=> setSavedTemp(''), 1200)
  refresh()
  }
  async function onSaveKetone(e: React.FormEvent){
    e.preventDefault()
    if(!babyId) return alert('Please create a baby profile in Onboarding')
    await addKetone({ babyId, level: kLevel as any, at: new Date(kAt).toISOString(), synced:false })
    setSavedKetone('Saved!'); setTimeout(()=> setSavedKetone(''), 1200)
    refresh()
  }

  async function refresh(){
    if(!babyId) return
    const [m,t,k] = await Promise.all([
      listMedications(babyId, { date: filterDate || undefined }),
      listTemperatures(babyId, { date: filterDate || undefined }),
      listKetones(babyId, { date: filterDate || undefined }),
    ])
    setMedItems(m); setTempItems(t); setKetItems(k)
  }
  useEffect(()=>{ refresh() }, [babyId, filterDate])

  return (
    <div className="stack gap">
      <h2>Medication</h2>
      <form className="stack gap" onSubmit={onAddMed}>
        <label>Date/Time<input type="datetime-local" value={mAt} onChange={e=>setMAt(e.target.value)} /></label>
        <label>Medicine<input value={mName} onChange={e=>setMName(e.target.value)} placeholder="Name" /></label>
        <label>Dose<input value={mDose} onChange={e=>setMDose(e.target.value)} placeholder="5ml, 120mg, etc" /></label>
        <label>Notes<input value={mNotes} onChange={e=>setMNotes(e.target.value)} placeholder="Optional" /></label>
        <button className="btn" type="submit">Add</button>
        {savedMed && <span aria-live="polite">{savedMed}</span>}
      </form>

      <h2>Temperature</h2>
      <form className="stack gap" onSubmit={onAddTemp}>
        <label>Date/Time<input type="datetime-local" value={tAt} onChange={e=>setTAt(e.target.value)} /></label>
        <label>Temp (°F)<input value={tF} onChange={e=>setTF(e.target.value)} placeholder="98.6" type="number" step="0.1" /></label>
        <label>Notes<input value={tNotes} onChange={e=>setTNotes(e.target.value)} placeholder="Optional" /></label>
        <button className="btn" type="submit">Add</button>
        {savedTemp && <span aria-live="polite">{savedTemp}</span>}
      </form>

      <h2>Ketones</h2>
      <form className="stack gap" onSubmit={onSaveKetone}>
        <label>Date/Time<input type="datetime-local" value={kAt} onChange={e=>setKAt(e.target.value)} /></label>
        <label>
          Level
          <select value={kLevel} onChange={e=>setKLevel(e.target.value)}>
            <option>Negative</option>
            <option>Trace</option>
            <option>Small</option>
            <option>Moderate</option>
            <option>Large</option>
          </select>
        </label>
        <button className="btn" type="submit">Save</button>
        {savedKetone && <span aria-live="polite">{savedKetone}</span>}
      </form>

      <h3>Filter Date</h3>
      <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} />

      <h3>Recent Medication</h3>
      <div className="stack gap">
        {medItems.map(it => (
          <div key={it.id} className="feed-entry">
            <div className="feed-entry-main">
              <span className="feed-entry-type">Med</span>
              <span>• {it.name}</span>
              {it.dose && <span>• {it.dose}</span>}
              {it.notes && <span>• {it.notes}</span>}
            </div>
            <div className="feed-entry-time">{formatTime(it.at)}</div>
            <Menu onEdit={()=>setEditing({type:'med', item:it})} onDelete={async()=>{ if(confirm('Delete?')){ await deleteMedication(it.id); refresh() } }} />
          </div>
        ))}
        {medItems.length===0 && <div className="card">No medication entries.</div>}
      </div>

  <h3>Recent Temperatures</h3>
      <div className="stack gap">
        {tempItems.map(it => (
          <div key={it.id} className="feed-entry">
            <div className="feed-entry-main">
              <span className="feed-entry-type">Temp</span>
      <span>• {((it.celsius * 9/5) + 32).toFixed(1)} °F</span>
              {it.notes && <span>• {it.notes}</span>}
            </div>
            <div className="feed-entry-time">{formatTime(it.at)}</div>
            <Menu onEdit={()=>setEditing({type:'temp', item:it})} onDelete={async()=>{ if(confirm('Delete?')){ await deleteTemperature(it.id); refresh() } }} />
          </div>
        ))}
        {tempItems.length===0 && <div className="card">No temperature entries.</div>}
      </div>

      <h3>Recent Ketones</h3>
      <div className="stack gap">
        {ketItems.map(it => (
          <div key={it.id} className="feed-entry">
            <div className="feed-entry-main">
              <span className="feed-entry-type">Ketone</span>
              <span>• {it.level}</span>
            </div>
            <div className="feed-entry-time">{formatTime(it.at)}</div>
            <Menu onEdit={()=>setEditing({type:'ket', item:it})} onDelete={async()=>{ if(confirm('Delete?')){ await deleteKetone(it.id); refresh() } }} />
          </div>
        ))}
        {ketItems.length===0 && <div className="card">No ketone entries.</div>}
      </div>

      {editing && (
        <EditHealthModal data={editing} onClose={()=>setEditing(null)} onSaved={()=>{ setEditing(null); refresh() }} />
      )}
    </div>
  )
}

function Menu({ onEdit, onDelete }:{ onEdit:()=>void, onDelete:()=>void }){
  const [open, setOpen] = useState(false)
  return (
    <div className="context-menu">
      <button className="context-menu-btn" onClick={()=>setOpen(!open)} onBlur={()=>setTimeout(()=>setOpen(false),200)}>⋯</button>
      {open && (
        <div className="context-menu-dropdown">
          <button className="context-menu-item" onClick={()=>{ onEdit(); setOpen(false) }}>Edit</button>
          <button className="context-menu-item" onClick={()=>{ onDelete(); setOpen(false) }}>Delete</button>
        </div>
      )}
    </div>
  )
}

function EditHealthModal({ data, onClose, onSaved }:{ data:{type:'med'|'temp'|'ket', item:any}, onClose:()=>void, onSaved:()=>void }){
  if (data.type==='med') return <EditMed it={data.item} onClose={onClose} onSaved={onSaved} />
  if (data.type==='temp') return <EditTemp it={data.item} onClose={onClose} onSaved={onSaved} />
  return <EditKet it={data.item} onClose={onClose} onSaved={onSaved} />
}

function EditMed({ it, onClose, onSaved }:{ it:any, onClose:()=>void, onSaved:()=>void }){
  const [at, setAt] = useState(toLocalInputValue(new Date(it.at)))
  const [name, setName] = useState(it.name)
  const [dose, setDose] = useState(it.dose || '')
  const [notes, setNotes] = useState(it.notes || '')
  async function onSave(e:React.FormEvent){ e.preventDefault(); await updateMedication(it.id,{ at: fromLocalInputValue(at).toISOString(), name, dose: dose||undefined, notes: notes||undefined, synced:false }); onSaved() }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Edit Medication</h3>
        <form className="stack gap" onSubmit={onSave}>
          <label>Date/Time<input type="datetime-local" value={at} onChange={e=>setAt(e.target.value)} /></label>
          <label>Medicine<input value={name} onChange={e=>setName(e.target.value)} /></label>
          <label>Dose<input value={dose} onChange={e=>setDose(e.target.value)} /></label>
          <label>Notes<input value={notes} onChange={e=>setNotes(e.target.value)} /></label>
          <div style={{display:'flex', gap:'.5rem'}}>
            <button className="btn" type="submit">Save</button>
            <button type="button" onClick={onClose} style={{padding:'.65rem 1rem', background:'var(--muted)', color:'white', border:'none', borderRadius:'12px'}}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditTemp({ it, onClose, onSaved }:{ it:any, onClose:()=>void, onSaved:()=>void }){
  const [at, setAt] = useState(toLocalInputValue(new Date(it.at)))
  const initialF = (it.celsius * 9/5) + 32
  const [fahrenheit, setFahrenheit] = useState<number|string>(Number.isFinite(initialF)? Number(initialF.toFixed(1)) : '')
  const [notes, setNotes] = useState(it.notes || '')
  async function onSave(e:React.FormEvent){
    e.preventDefault()
    const f = typeof fahrenheit === 'string' ? parseFloat(fahrenheit) : fahrenheit
    if (Number.isNaN(f)) return
    const c = (f - 32) * 5/9
    await updateTemperature(it.id,{ at: fromLocalInputValue(at).toISOString(), celsius: c, notes: notes||undefined, synced:false })
    onSaved()
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Edit Temperature</h3>
        <form className="stack gap" onSubmit={onSave}>
          <label>Date/Time<input type="datetime-local" value={at} onChange={e=>setAt(e.target.value)} /></label>
          <label>Temp (°F)<input type="number" step="0.1" value={fahrenheit} onChange={e=>setFahrenheit(e.target.value)} /></label>
          <label>Notes<input value={notes} onChange={e=>setNotes(e.target.value)} /></label>
          <div style={{display:'flex', gap:'.5rem'}}>
            <button className="btn" type="submit">Save</button>
            <button type="button" onClick={onClose} style={{padding:'.65rem 1rem', background:'var(--muted)', color:'white', border:'none', borderRadius:'12px'}}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditKet({ it, onClose, onSaved }:{ it:any, onClose:()=>void, onSaved:()=>void }){
  const [at, setAt] = useState(toLocalInputValue(new Date(it.at)))
  const [level, setLevel] = useState(it.level)
  async function onSave(e:React.FormEvent){ e.preventDefault(); await updateKetone(it.id,{ at: fromLocalInputValue(at).toISOString(), level, synced:false }); onSaved() }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Edit Ketone</h3>
        <form className="stack gap" onSubmit={onSave}>
          <label>Date/Time<input type="datetime-local" value={at} onChange={e=>setAt(e.target.value)} /></label>
          <label>Level
            <select value={level} onChange={e=>setLevel(e.target.value)}>
              <option>Negative</option>
              <option>Trace</option>
              <option>Small</option>
              <option>Moderate</option>
              <option>Large</option>
            </select>
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
