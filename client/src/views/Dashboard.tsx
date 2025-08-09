import { Link } from 'react-router-dom'
import { SummaryCards } from '../components/SummaryCards'

export function Dashboard() {
  return (
    <div className="stack gap">
  <SummaryCards />

      <section className="quick-actions">
        <Link className="btn" to="/feed">+ Feed</Link>
        <Link className="btn" to="/diaper">+ Diaper</Link>
        <Link className="btn" to="/sleep">+ Sleep</Link>
        <Link className="btn" to="/growth">+ Growth</Link>
      </section>

      <section>
        <h3>Timeline</h3>
        <p>Recent activities will appear here.</p>
      </section>

      <section>
        <h3>Upcoming</h3>
        <p>Next feed or medicine reminders.</p>
        <button className="btn" onClick={() => {
          // suggest install if PWA prompt available
          (window as any).deferredPrompt?.prompt?.()
        }}>Install App</button>
      </section>
    </div>
  )
}
