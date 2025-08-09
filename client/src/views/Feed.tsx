import React, { useEffect, useState } from 'react'
import { addFeed, listFeeds, updateFeed, deleteFeed } from '../services/local'
import { useAppStore } from '../store/useAppStore'
import { toLocalInputValue, fromLocalInputValue, toLocalDateInputValue } from '../utils/datetime'

export function Feed() {
  const [type, setType] = useState('Bottle - Formula')
  const [amount, setAmount] = useState<number | ''>('')
  const [at, setAt] = useState<string>(toLocalInputValue())
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState<string>('')
  const babyId = useAppStore(s=>s.babyId)
  const [filterDate, setFilterDate] = useState<string>(toLocalDateInputValue())
  const [filterType, setFilterType] = useState<string>('All')
  const [feeds, setFeeds] = useState<any[]>([])
  const [total, setTotal] = useState<number>(0)

  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    if(!babyId) return alert('Please create a baby profile in Onboarding')
  await addFeed({ babyId, type, amount: amount? Number(amount): undefined, at: fromLocalInputValue(at).toISOString(), notes, synced:false })
  setAmount('')
  setNotes('')
  setSaved('Saved!')
  setTimeout(()=> setSaved(''), 1200)
    refreshList()
  }

  async function refreshList(){
    if(!babyId) return
    const items = await listFeeds(babyId, { date: filterDate || undefined, type: filterType })
    setFeeds(items)
    // compute total amount for the filtered set if amounts exist
    setTotal(items.reduce((acc, r)=> acc + (typeof r.amount === 'number' ? r.amount : 0), 0))
  }

  // initial load and on filters change
  useEffect(()=>{ refreshList() }, [babyId, filterDate, filterType])

  return (
    <div className="stack gap">
      <h2>Add Feed</h2>
      <form className="stack gap" onSubmit={onSubmit}>
        <label>
          Type
          <select value={type} onChange={e=>setType(e.target.value)}>
            <option>Bottle - Formula</option>
            <option>Bottle - Milk</option>
            <option>Breastfeeding - Left</option>
            <option>Breastfeeding - Right</option>
            <option>Semi-Solids / Puree</option>
            <option>Solid Food</option>
          </select>
        </label>
        <label>
          Amount (ml/oz)
          <input value={amount} onChange={e=>setAmount(e.target.value === '' ? '' : Number(e.target.value))} type="number" min={0} />
        </label>
        <label>
          Notes
          <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional notes" />
        </label>
        <label>
          Time
          <input type="datetime-local" value={at} onChange={e=>setAt(e.target.value)} />
        </label>
  <button className="btn" type="submit">Save</button>
  {saved && <span aria-live="polite">{saved}</span>}
      </form>

      <h3>Past Feeds</h3>
      <div className="stack gap">
        <div className="cards" style={{gridTemplateColumns:'repeat(2, minmax(0,1fr))'}}>
          <label>
            Date
            <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} />
          </label>
          <label>
            Type
            <select value={filterType} onChange={e=>setFilterType(e.target.value)}>
              <option>All</option>
              <option>Bottle - Formula</option>
              <option>Bottle - Milk</option>
              <option>Breastfeeding - Left</option>
              <option>Breastfeeding - Right</option>
              <option>Semi-Solids / Puree</option>
              <option>Solid Food</option>
            </select>
          </label>
        </div>
        <div className="card">
          <strong>Total amount:</strong> {total}
        </div>
        <ul className="stack gap" style={{listStyle:'none', padding:0, margin:0}}>
          {feeds.map(f => (
            <FeedListItem key={f.id} feed={f} onChanged={refreshList} />
          ))}
          {feeds.length===0 && <li>No feeds found.</li>}
        </ul>
      </div>
    </div>
  )
}

function FeedListItem({ feed, onChanged }: { feed: any, onChanged: ()=>void }){
  const [editing, setEditing] = useState(false)
  const [type, setType] = useState(feed.type as string)
  const [amount, setAmount] = useState<number | ''>(typeof feed.amount==='number'? feed.amount: '')
  const [at, setAt] = useState<string>(toLocalInputValue(new Date(feed.at)))
  const [notes, setNotes] = useState<string>(feed.notes || '')

  async function onSave(){
    await updateFeed(feed.id, {
      type,
      amount: amount===''? undefined: Number(amount),
      at: fromLocalInputValue(at).toISOString(),
      notes,
      synced: false,
    })
    setEditing(false)
    onChanged()
  }
  async function onDelete(){
    await deleteFeed(feed.id)
    onChanged()
  }
  if (!editing) return (
    <li className="card">
      <div><strong>{feed.type}</strong> {typeof feed.amount==='number'? `- ${feed.amount}`: ''}</div>
      {feed.notes && <div>{feed.notes}</div>}
      <div style={{color:'var(--muted)'}}>{new Date(feed.at).toLocaleString()}</div>
      <div className="stack" style={{flexDirection:'row', gap:'.5rem', marginTop:'.5rem'}}>
        <button className="btn" onClick={()=>setEditing(true)}>Edit</button>
        <button className="btn" onClick={onDelete}>Delete</button>
      </div>
    </li>
  )
  return (
    <li className="card">
      <label>
        Type
        <select value={type} onChange={e=>setType(e.target.value)}>
          <option>Bottle - Formula</option>
          <option>Bottle - Milk</option>
          <option>Breastfeeding - Left</option>
          <option>Breastfeeding - Right</option>
          <option>Semi-Solids / Puree</option>
          <option>Solid Food</option>
        </select>
      </label>
      <label>
        Amount
        <input type="number" value={amount} onChange={e=>setAmount(e.target.value===''? '': Number(e.target.value))} />
      </label>
      <label>
        Notes
        <input value={notes} onChange={e=>setNotes(e.target.value)} />
      </label>
      <label>
        Time
        <input type="datetime-local" value={at} onChange={e=>setAt(e.target.value)} />
      </label>
      <div className="stack" style={{flexDirection:'row', gap:'.5rem', marginTop:'.5rem'}}>
        <button className="btn" onClick={onSave}>Save</button>
        <button className="btn" onClick={()=>setEditing(false)}>Cancel</button>
      </div>
    </li>
  )
}
