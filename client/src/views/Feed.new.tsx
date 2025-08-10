import { useEffect, useState } from 'react'
import { addFeed, listFeeds, updateFeed, deleteFeed } from '../services/local'
import { useAppStore } from '../store/useAppStore'
import { toLocalInputValue, fromLocalInputValue, toLocalDateInputValue, formatTime } from '../utils/datetime'

export function Feed() {
  const [type, setType] = useState('bottle')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [at, setAt] = useState<string>(toLocalInputValue())
  const [saved, setSaved] = useState('')
  const babyId = useAppStore(s=>s.babyId)
  const [filterDate, setFilterDate] = useState(toLocalDateInputValue())
  const [filterType, setFilterType] = useState('All')
  const [items, setItems] = useState<any[]>([])
  const [editingItem, setEditingItem] = useState<any | null>(null)

  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    if(!babyId) return alert('Please create a baby profile in Onboarding')
    await addFeed({ 
      babyId, 
      type, 
      amount: amount ? Number(amount) : undefined, 
      notes, 
      at: fromLocalInputValue(at).toISOString(), 
      synced:false 
    })
    setAmount('')
    setNotes('')
    setSaved('Saved!')
    setTimeout(()=> setSaved(''), 1200)
    refresh()
  }

  async function refresh(){
    if(!babyId) return
    const rows = await listFeeds(babyId, { date: filterDate || undefined, type: filterType })
    setItems(rows)
  }
  useEffect(()=>{ refresh() }, [babyId, filterDate, filterType])

  const dailyTotal = items.reduce((sum, f) => sum + (f.amount || 0), 0)

  return (
    <div className="stack gap">
      <h2>Add Feed</h2>
      <form className="stack gap" onSubmit={onSubmit}>
        <label>
          Type
          <select value={type} onChange={e=>setType(e.target.value)}>
            <option value="bottle">Bottle</option>
            <option value="breast">Breast</option>
            <option value="formula">Formula</option>
          </select>
        </label>
        <label>
          Amount (ml)
          <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="120" />
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
      <div className="cards" style={{gridTemplateColumns:'repeat(2, minmax(0,1fr))'}}>
        <label>
          Date
          <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} />
        </label>
        <label>
          Type
          <select value={filterType} onChange={e=>setFilterType(e.target.value)}>
            <option value="All">All</option>
            <option value="bottle">Bottle</option>
            <option value="breast">Breast</option>
            <option value="formula">Formula</option>
          </select>
        </label>
      </div>
      {dailyTotal > 0 && (
        <div className="card">
          <strong>Daily Total: {dailyTotal}ml</strong>
        </div>
      )}
      <div className="stack gap">
        {items.map(item => <FeedEntryItem key={item.id} item={item} onEdit={setEditingItem} onChanged={refresh} />)}
        {items.length===0 && <div className="card">No feed entries found.</div>}
      </div>

      {editingItem && (
        <EditFeedModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={() => { setEditingItem(null); refresh(); }}
        />
      )}
    </div>
  )
}

function FeedEntryItem({ item, onEdit, onChanged }: { item: any, onEdit: (item: any) => void, onChanged: () => void }) {
  const [showMenu, setShowMenu] = useState(false)

  async function onDelete() {
    if (confirm('Delete this feed entry?')) {
      await deleteFeed(item.id)
      onChanged()
    }
  }

  return (
    <div className="feed-entry">
      <div className="feed-entry-main">
        <span className="feed-entry-type">{item.type}</span>
        {item.amount && <span className="feed-entry-amount">{item.amount}ml</span>}
        {item.notes && <span>• {item.notes}</span>}
      </div>
      <div className="feed-entry-time">{formatTime(item.at)}</div>
      <div className="context-menu">
        <button 
          className="context-menu-btn" 
          onClick={() => setShowMenu(!showMenu)}
          onBlur={() => setTimeout(() => setShowMenu(false), 200)}
        >
          ⋯
        </button>
        {showMenu && (
          <div className="context-menu-dropdown">
            <button className="context-menu-item" onClick={() => { onEdit(item); setShowMenu(false); }}>
              Edit
            </button>
            <button className="context-menu-item" onClick={() => { onDelete(); setShowMenu(false); }}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function EditFeedModal({ item, onClose, onSaved }: { item: any, onClose: () => void, onSaved: () => void }) {
  const [type, setType] = useState(item.type)
  const [amount, setAmount] = useState(item.amount?.toString() || '')
  const [notes, setNotes] = useState(item.notes || '')
  const [at, setAt] = useState(toLocalInputValue(new Date(item.at)))

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    await updateFeed(item.id, {
      type,
      amount: amount ? Number(amount) : undefined,
      notes,
      at: fromLocalInputValue(at).toISOString(),
      synced: false
    })
    onSaved()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Edit Feed Entry</h3>
        <form className="stack gap" onSubmit={onSave}>
          <label>
            Type
            <select value={type} onChange={e=>setType(e.target.value)}>
              <option value="bottle">Bottle</option>
              <option value="breast">Breast</option>
              <option value="formula">Formula</option>
            </select>
          </label>
          <label>
            Amount (ml)
            <input value={amount} onChange={e=>setAmount(e.target.value)} />
          </label>
          <label>
            Notes
            <input value={notes} onChange={e=>setNotes(e.target.value)} />
          </label>
          <label>
            Time
            <input type="datetime-local" value={at} onChange={e=>setAt(e.target.value)} />
          </label>
          <div style={{display:'flex', gap:'.5rem'}}>
            <button className="btn" type="submit">Save</button>
            <button type="button" onClick={onClose} style={{padding:'.65rem 1rem', background:'var(--muted)', color:'white', border:'none', borderRadius:'12px'}}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
