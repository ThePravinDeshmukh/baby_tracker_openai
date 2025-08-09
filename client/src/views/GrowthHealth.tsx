import { useState } from 'react'
import { addGrowth, addKetone, addVaccine, addVisit } from '../services/local'
import { useAppStore } from '../store/useAppStore'
import { toLocalInputValue, toLocalDateInputValue } from '../utils/datetime'

export function GrowthHealth() {
  const babyId = useAppStore(s=>s.babyId)
  // Growth
  const [weight, setWeight] = useState<number|''>('')
  const [height, setHeight] = useState<number|''>('')
  const [head, setHead] = useState<number|''>('')
  // Ketones
  const [kAt, setKAt] = useState<string>(toLocalInputValue())
  const [kLevel, setKLevel] = useState('Negative')
  // Vaccination
  const [vDate, setVDate] = useState(toLocalDateInputValue())
  const [vType, setVType] = useState('')
  // Visit
  const [dDate, setDDate] = useState(toLocalDateInputValue())
  const [dDoc, setDDoc] = useState('')
  const [dNotes, setDNotes] = useState('')

  const [savedGrowth, setSavedGrowth] = useState('')
  const [savedKetone, setSavedKetone] = useState('')
  const [savedVaccine, setSavedVaccine] = useState('')
  const [savedVisit, setSavedVisit] = useState('')

  async function onSaveGrowth(e: React.FormEvent){
    e.preventDefault()
    if(!babyId) return alert('Please create a baby profile in Onboarding')
    await addGrowth({ babyId, weight: weight===''? undefined: Number(weight), height: height===''? undefined: Number(height), head: head===''? undefined: Number(head), at: new Date().toISOString(), synced:false })
    setWeight(''); setHeight(''); setHead('')
    setSavedGrowth('Saved!'); setTimeout(()=> setSavedGrowth(''), 1200)
  }
  async function onSaveKetone(e: React.FormEvent){
    e.preventDefault()
    if(!babyId) return alert('Please create a baby profile in Onboarding')
    await addKetone({ babyId, level: kLevel as any, at: new Date(kAt).toISOString(), synced:false })
    setSavedKetone('Saved!'); setTimeout(()=> setSavedKetone(''), 1200)
  }
  async function onAddVaccine(e: React.FormEvent){
    e.preventDefault()
    if(!babyId) return alert('Please create a baby profile in Onboarding')
    await addVaccine({ babyId, type: vType, date: vDate, synced:false })
    setVType(''); setVDate('')
    setSavedVaccine('Saved!'); setTimeout(()=> setSavedVaccine(''), 1200)
  }
  async function onAddVisit(e: React.FormEvent){
    e.preventDefault()
    if(!babyId) return alert('Please create a baby profile in Onboarding')
    await addVisit({ babyId, doctor: dDoc, date: dDate, notes: dNotes, synced:false })
    setDDoc(''); setDDate(''); setDNotes('')
    setSavedVisit('Saved!'); setTimeout(()=> setSavedVisit(''), 1200)
  }

  return (
    <div className="stack gap">
      <h2>Growth</h2>
      <form className="stack gap" onSubmit={onSaveGrowth}>
        <label>Weight<input value={weight} onChange={e=>setWeight(e.target.value===''? '': Number(e.target.value))} type="number" step="0.01" /></label>
        <label>Height<input value={height} onChange={e=>setHeight(e.target.value===''? '': Number(e.target.value))} type="number" step="0.1" /></label>
        <label>Head Circ.<input value={head} onChange={e=>setHead(e.target.value===''? '': Number(e.target.value))} type="number" step="0.1" /></label>
  <button className="btn" type="submit">Save</button>
  {savedGrowth && <span aria-live="polite">{savedGrowth}</span>}
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

      <h2>Vaccinations</h2>
      <form className="stack gap" onSubmit={onAddVaccine}>
        <label>Date<input type="date" value={vDate} onChange={e=>setVDate(e.target.value)} /></label>
        <label>Type<input value={vType} onChange={e=>setVType(e.target.value)} placeholder="Vaccine name" /></label>
  <button className="btn" type="submit">Add</button>
  {savedVaccine && <span aria-live="polite">{savedVaccine}</span>}
      </form>

      <h2>Doctor Visits</h2>
      <form className="stack gap" onSubmit={onAddVisit}>
        <label>Date<input type="date" value={dDate} onChange={e=>setDDate(e.target.value)} /></label>
        <label>Doctor<input value={dDoc} onChange={e=>setDDoc(e.target.value)} placeholder="Name" /></label>
        <label>Notes<input value={dNotes} onChange={e=>setDNotes(e.target.value)} placeholder="Notes & prescriptions" /></label>
  <button className="btn" type="submit">Add</button>
  {savedVisit && <span aria-live="polite">{savedVisit}</span>}
      </form>
    </div>
  )
}
