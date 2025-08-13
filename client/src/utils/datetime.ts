export function toLocalInputValue(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

export function fromLocalInputValue(v: string): Date {
  return new Date(v) // treated as local time
}

export function toLocalDateInputValue(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  return `${yyyy}-${mm}-${dd}`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}

export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  // Example: 4 August
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long'
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  })
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`
}

export function formatTime12(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  // Lowercase am/pm to match mobile style
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
}
