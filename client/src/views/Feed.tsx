import { useEffect, useState } from 'react'
import { addFeed, listFeeds, updateFeed, deleteFeed } from '../services/local'
import { useAppStore } from '../store/useAppStore'
import { toLocalInputValue, fromLocalInputValue, toLocalDateInputValue, formatTime12, formatDateLong } from '../utils/datetime'

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
    const showAmount = type !== 'solid'
    await addFeed({
      babyId,
      type,
      amount: showAmount && amount ? Number(amount) : undefined,
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
          <select
            value={type}
            onChange={e=>{
              const v = e.target.value
              setType(v)
              if (v === 'solid') setAmount('')
            }}
          >
            <option value="bottle">Bottle</option>
            <option value="breast">Breast</option>
            <option value="formula">Formula</option>
            <option value="semi-solid">Semi solid</option>
            <option value="solid">Solid</option>
          </select>
        </label>
        {type !== 'solid' && (
          <label>
            Amount (ml)
            <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="120" />
          </label>
        )}
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
            <option value="semi-solid">Semi solid</option>
            <option value="solid">Solid</option>
          </select>
        </label>
      </div>
      {dailyTotal > 0 && (
        <div className="card">
          <strong>Daily Total: {dailyTotal}ml</strong>
        </div>
      )}
      <div className="stack gap">
        {(() => {
          if (items.length===0) return <div className="card">No feed entries found.</div>
          // Group by date header like "4 August"
          const groups: { date: string; rows: any[] }[] = []
          let last: string | null = null
          for (const it of items) {
            const key = formatDateLong(it.at)
            if (key !== last) { groups.push({ date: key, rows: [it] }); last = key }
            else groups[groups.length-1].rows.push(it)
          }
          return groups.map(g => (
            <div key={g.date} className="activity-group">
              <div className="activity-date">{g.date}</div>
              <div className="stack gap">
                {g.rows.map((item, idx) => (
                  <FeedEntryRow
                    key={item.id}
                    item={item}
                    prevAt={g.rows[idx-1]?.at}
                    onEdit={setEditingItem}
                    onChanged={refresh}
                  />
                ))}
              </div>
            </div>
          ))
        })()}
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

function FeedEntryRow({ item, prevAt, onEdit, onChanged }: { item: any, prevAt?: string, onEdit: (item: any) => void, onChanged: () => void }) {
  const [showMenu, setShowMenu] = useState(false)

  async function onDelete() {
    if (confirm('Delete this feed entry?')) {
      await deleteFeed(item.id)
      onChanged()
    }
  }

  // Compute gap from previous entry within the same date group (in minutes/hours)
  let gap: string | null = null
  if (prevAt) {
    const ms = Math.max(0, new Date(item.at).getTime() - new Date(prevAt).getTime())
    const mins = Math.round(ms / 60000)
    if (mins >= 60) gap = `${Math.floor(mins/60)}h ${mins%60}m`
    else if (mins > 0) gap = `${mins}m`
  }

  const icon = item.type === 'solid' || item.type === 'semi-solid' ? '🥣' : '🍼'

  return (
    <div className="feed-entry">
      <div className="icon-badge">{icon}</div>
      <div className="feed-entry-main">
        <strong>{formatTime12(item.at)}</strong>
        <span>, {item.type}</span>
        {item.amount && <span>, {item.amount} ml</span>}
        {item.notes && <span>, {item.notes}</span>}
      </div>
      <div className="feed-entry-time" style={{minWidth:'3ch', textAlign:'right'}}>{gap ?? ''}</div>
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
    const showAmount = type !== 'solid'
    await updateFeed(item.id, {
      type,
      amount: showAmount && amount ? Number(amount) : undefined,
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
            <select
              value={type}
              onChange={e=>{
                const v = e.target.value
                setType(v)
                if (v === 'solid') setAmount('')
              }}
            >
              <option value="bottle">Bottle</option>
              <option value="breast">Breast</option>
              <option value="formula">Formula</option>
              <option value="semi-solid">Semi solid</option>
              <option value="solid">Solid</option>
            </select>
          </label>
          {type !== 'solid' && (
            <label>
              Amount (ml)
              <input value={amount} onChange={e=>setAmount(e.target.value)} />
            </label>
          )}
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
