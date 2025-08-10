import { useEffect, useState } from 'react'
import { addGrowth, addVaccine, addVisit, listGrowth, listVaccines, listVisits, updateGrowth, deleteGrowth, updateVaccine, deleteVaccine, updateVisit, deleteVisit } from '../services/local'
import { useAppStore } from '../store/useAppStore'
import { toLocalDateInputValue, toLocalInputValue, fromLocalInputValue, formatTime } from '../utils/datetime'

export function Growth(){
  const babyId = useAppStore(s=>s.babyId)
  const [weight, setWeight] = useState<number|''>('')
  const [height, setHeight] = useState<number|''>('')
  const [head, setHead] = useState<number|''>('')
  const [savedGrowth, setSavedGrowth] = useState('')

  const [vDate, setVDate] = useState(toLocalDateInputValue())
  const [vType, setVType] = useState('')
  const [savedVaccine, setSavedVaccine] = useState('')

  const [dDate, setDDate] = useState(toLocalDateInputValue())
  const [dDoc, setDDoc] = useState('')
  const [dNotes, setDNotes] = useState('')
  const [savedVisit, setSavedVisit] = useState('')
  // Lists & filters
  const [filterDate, setFilterDate] = useState(toLocalDateInputValue())
  const [growthItems, setGrowthItems] = useState<any[]>([])
  const [vaxItems, setVaxItems] = useState<any[]>([])
  const [visitItems, setVisitItems] = useState<any[]>([])
  const [editing, setEditing] = useState<{ type:'growth'|'vaccine'|'visit', item:any }|null>(null)

  async function onSaveGrowth(e:React.FormEvent){
    e.preventDefault()
    if(!babyId) return alert('Please create a baby profile in Onboarding')
    await addGrowth({ babyId, weight: weight===''? undefined: Number(weight), height: height===''? undefined: Number(height), head: head===''? undefined: Number(head), at: new Date().toISOString(), synced:false })
    setWeight(''); setHeight(''); setHead('')
    setSavedGrowth('Saved!'); setTimeout(()=> setSavedGrowth(''), 1200)
  refresh()
  }

  async function onAddVaccine(e: React.FormEvent){
    e.preventDefault()
    if(!babyId) return alert('Please create a baby profile in Onboarding')
    await addVaccine({ babyId, type: vType, date: vDate, synced:false })
    setVType(''); setVDate('')
    setSavedVaccine('Saved!'); setTimeout(()=> setSavedVaccine(''), 1200)
  refresh()
  }

  async function onAddVisit(e: React.FormEvent){
    e.preventDefault()
    if(!babyId) return alert('Please create a baby profile in Onboarding')
    await addVisit({ babyId, doctor: dDoc, date: dDate, notes: dNotes, synced:false })
    setDDoc(''); setDDate(''); setDNotes('')
    setSavedVisit('Saved!'); setTimeout(()=> setSavedVisit(''), 1200)
    refresh()
  }

  async function refresh(){
    if(!babyId) return
    const [g,v,vi] = await Promise.all([
      listGrowth(babyId, { date: filterDate || undefined }),
      listVaccines(babyId, { date: filterDate || undefined }),
      listVisits(babyId, { date: filterDate || undefined })
    ])
    setGrowthItems(g); setVaxItems(v); setVisitItems(vi)
  }
  useEffect(()=>{ refresh() }, [babyId, filterDate])

  return (
    <div className="stack gap">
      <h2>Growth</h2>
      <form className="stack gap" onSubmit={onSaveGrowth}>
        <label>Weight (kg)<input value={weight} onChange={e=>setWeight(e.target.value===''? '': Number(e.target.value))} type="number" step="0.01" /></label>
        <label>Height (cm)<input value={height} onChange={e=>setHeight(e.target.value===''? '': Number(e.target.value))} type="number" step="0.1" /></label>
        <label>Head Circ. (cm)<input value={head} onChange={e=>setHead(e.target.value===''? '': Number(e.target.value))} type="number" step="0.1" /></label>
        <button className="btn" type="submit">Save</button>
        {savedGrowth && <span aria-live="polite">{savedGrowth}</span>}
      </form>

      <h2>Vaccinations</h2>
      <form className="stack gap" onSubmit={onAddVaccine}>
        <label>Date<input type="date" value={vDate} onChange={e=>setVDate(e.target.value)} /></label>
        <label>Type<input value={vType} onChange={e=>setVType(e.target.value)} placeholder="Vaccine name" /></label>
        <button className="btn" type="submit">Add</button>
        {savedVaccine && <span aria-live="polite">{savedVaccine}</span>}
      </form>
      <label style={{marginTop:'1rem'}}>Filter Date<input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} /></label>

      <h3>Recent Growth</h3>
      <div className="stack gap">
        {growthItems.map(it => (
          <div key={it.id} className="feed-entry">
            <div className="feed-entry-main">
              <span className="feed-entry-type">Growth</span>
              {it.weight!=null && <span>• {it.weight} kg</span>}
              {it.height!=null && <span>• {it.height} cm</span>}
              {it.head!=null && <span>• head {it.head} cm</span>}
            </div>
            <div className="feed-entry-time">{formatTime(it.at)}</div>
            <Menu onEdit={()=>setEditing({type:'growth', item:it})} onDelete={async()=>{ if(confirm('Delete?')){ await deleteGrowth(it.id); refresh() } }} />
          </div>
        ))}
        {growthItems.length===0 && <div className="card">No growth entries.</div>}
      </div>

      <h3>Vaccination Records</h3>
      <div className="stack gap">
        {vaxItems.map(it => (
          <div key={it.id} className="feed-entry">
            <div className="feed-entry-main">
              <span className="feed-entry-type">Vaccine</span>
              <span>• {it.type}</span>
              <span>• {it.date}</span>
            </div>
            <div className="feed-entry-time">{it.date}</div>
            <Menu onEdit={()=>setEditing({type:'vaccine', item:it})} onDelete={async()=>{ if(confirm('Delete?')){ await deleteVaccine(it.id); refresh() } }} />
          </div>
        ))}
        {vaxItems.length===0 && <div className="card">No vaccines.</div>}
      </div>

      <h2>Doctor Visits</h2>
      <form className="stack gap" onSubmit={onAddVisit}>
        <label>Date<input type="date" value={dDate} onChange={e=>setDDate(e.target.value)} /></label>
        <label>Doctor<input value={dDoc} onChange={e=>setDDoc(e.target.value)} placeholder="Name" /></label>
        <label>Notes<input value={dNotes} onChange={e=>setDNotes(e.target.value)} placeholder="Notes & prescriptions" /></label>
        <button className="btn" type="submit">Add</button>
        {savedVisit && <span aria-live="polite">{savedVisit}</span>}
      </form>
      <h3>Visit Records</h3>
      <div className="stack gap">
        {visitItems.map(it => (
          <div key={it.id} className="feed-entry">
            <div className="feed-entry-main">
              <span className="feed-entry-type">Visit</span>
              <span>• {it.doctor}</span>
              {it.notes && <span>• {it.notes}</span>}
            </div>
            <div className="feed-entry-time">{it.date}</div>
            <Menu onEdit={()=>setEditing({type:'visit', item:it})} onDelete={async()=>{ if(confirm('Delete?')){ await deleteVisit(it.id); refresh() } }} />
          </div>
        ))}
        {visitItems.length===0 && <div className="card">No visits.</div>}
      </div>

      {editing && (
        <EditGrowthModal data={editing} onClose={()=>setEditing(null)} onSaved={()=>{ setEditing(null); refresh() }} />
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

function EditGrowthModal({ data, onClose, onSaved }:{ data:{type:'growth'|'vaccine'|'visit', item:any}, onClose:()=>void, onSaved:()=>void }){
  if (data.type==='growth') return <EditGrowth it={data.item} onClose={onClose} onSaved={onSaved} />
  if (data.type==='vaccine') return <EditVaccine it={data.item} onClose={onClose} onSaved={onSaved} />
  return <EditVisit it={data.item} onClose={onClose} onSaved={onSaved} />
}

function EditGrowth({ it, onClose, onSaved }:{ it:any, onClose:()=>void, onSaved:()=>void }){
  const [weight, setWeight] = useState(it.weight ?? '')
  const [height, setHeight] = useState(it.height ?? '')
  const [head, setHead] = useState(it.head ?? '')
  const [at, setAt] = useState(toLocalInputValue(new Date(it.at)))
  async function onSave(e:React.FormEvent){
    e.preventDefault()
    await updateGrowth(it.id, {
      weight: weight===''? undefined: Number(weight),
      height: height===''? undefined: Number(height),
      head: head===''? undefined: Number(head),
      at: fromLocalInputValue(at).toISOString(),
      synced:false,
    })
    onSaved()
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Edit Growth</h3>
        <form className="stack gap" onSubmit={onSave}>
          <label>Weight (kg)<input value={weight} onChange={e=>setWeight(e.target.value===''? '': Number(e.target.value))} type="number" step="0.01" /></label>
          <label>Height (cm)<input value={height} onChange={e=>setHeight(e.target.value===''? '': Number(e.target.value))} type="number" step="0.1" /></label>
          <label>Head (cm)<input value={head} onChange={e=>setHead(e.target.value===''? '': Number(e.target.value))} type="number" step="0.1" /></label>
          <label>Time<input type="datetime-local" value={at} onChange={e=>setAt(e.target.value)} /></label>
          <div style={{display:'flex', gap:'.5rem'}}>
            <button className="btn" type="submit">Save</button>
            <button type="button" onClick={onClose} style={{padding:'.65rem 1rem', background:'var(--muted)', color:'white', border:'none', borderRadius:'12px'}}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditVaccine({ it, onClose, onSaved }:{ it:any, onClose:()=>void, onSaved:()=>void }){
  const [date, setDate] = useState(it.date)
  const [type, setType] = useState(it.type)
  async function onSave(e:React.FormEvent){ e.preventDefault(); await updateVaccine(it.id,{ date, type, synced:false }); onSaved() }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Edit Vaccine</h3>
        <form className="stack gap" onSubmit={onSave}>
          <label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} /></label>
          <label>Type<input value={type} onChange={e=>setType(e.target.value)} /></label>
          <div style={{display:'flex', gap:'.5rem'}}>
            <button className="btn" type="submit">Save</button>
            <button type="button" onClick={onClose} style={{padding:'.65rem 1rem', background:'var(--muted)', color:'white', border:'none', borderRadius:'12px'}}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditVisit({ it, onClose, onSaved }:{ it:any, onClose:()=>void, onSaved:()=>void }){
  const [date, setDate] = useState(it.date)
  const [doctor, setDoctor] = useState(it.doctor)
  const [notes, setNotes] = useState(it.notes || '')
  async function onSave(e:React.FormEvent){ e.preventDefault(); await updateVisit(it.id,{ date, doctor, notes, synced:false }); onSaved() }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Edit Visit</h3>
        <form className="stack gap" onSubmit={onSave}>
          <label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} /></label>
          <label>Doctor<input value={doctor} onChange={e=>setDoctor(e.target.value)} /></label>
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
