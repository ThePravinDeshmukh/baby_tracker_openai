import { db, type BabyProfile, type FeedEntry, type DiaperEntry, type SleepEntry, type GrowthEntry, type KetoneEntry, type VaccineEntry, type DoctorVisitEntry, type MedicationEntry, type TemperatureEntry } from '../db/db'

export async function createBaby(profile: Omit<BabyProfile,'id'>) {
  const id = await db.babies.add(profile)
  return id
}
export async function listBabies() { return db.babies.toArray() }

export async function addFeed(entry: Omit<FeedEntry,'id'>) {
  return db.feeds.add(entry)
}
export async function updateFeed(id: number, changes: Partial<FeedEntry>) {
  return db.feeds.update(id, changes)
}
export async function deleteFeed(id: number) {
  return db.feeds.delete(id)
}
export async function listFeeds(babyId: number, opts?: { date?: string; type?: string; limit?: number }) {
  // date is YYYY-MM-DD in local time
  let q = db.feeds.where('babyId').equals(babyId)
  const rows = await q.toArray()
  let filtered = rows
  if (opts?.date) {
    const day = opts.date
    filtered = filtered.filter(r => {
      const d = new Date(r.at)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth()+1).padStart(2,'0')
      const dd = String(d.getDate()).padStart(2,'0')
      return `${yyyy}-${mm}-${dd}` === day
    })
  }
  if (opts?.type && opts.type !== 'All') {
    filtered = filtered.filter(r => r.type === opts.type)
  }
  filtered.sort((a,b)=> new Date(b.at).getTime() - new Date(a.at).getTime())
  if (opts?.limit) filtered = filtered.slice(0, opts.limit)
  return filtered
}
export async function addDiaper(entry: Omit<DiaperEntry,'id'>) { return db.diapers.add(entry) }
export async function updateDiaper(id: number, changes: Partial<DiaperEntry>) { return db.diapers.update(id, changes) }
export async function deleteDiaper(id: number) { return db.diapers.delete(id) }
export async function listDiapers(babyId: number, opts?: { date?: string; type?: DiaperEntry['type'] | 'All' }){
  let rows = await db.diapers.where('babyId').equals(babyId).toArray()
  if (opts?.date){
    rows = rows.filter(r=>{
      const d = new Date(r.at); const yyyy=d.getFullYear(); const mm=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0');
      return `${yyyy}-${mm}-${dd}` === opts.date
    })
  }
  if (opts?.type && opts.type!=='All') rows = rows.filter(r=> r.type===opts.type)
  rows.sort((a,b)=> new Date(b.at).getTime() - new Date(a.at).getTime())
  return rows
}
export async function addSleep(entry: Omit<SleepEntry,'id'>) { return db.sleeps.add(entry) }
export async function updateSleep(id: number, changes: Partial<SleepEntry>) { return db.sleeps.update(id, changes) }
export async function deleteSleep(id: number) { return db.sleeps.delete(id) }
export async function listSleeps(babyId: number, opts?: { date?: string }){
  let rows = await db.sleeps.where('babyId').equals(babyId).toArray()
  if (opts?.date){
    rows = rows.filter(r=>{
      const d = new Date(r.start); const yyyy=d.getFullYear(); const mm=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0');
      return `${yyyy}-${mm}-${dd}` === opts.date
    })
  }
  rows.sort((a,b)=> new Date(b.start).getTime() - new Date(a.start).getTime())
  return rows
}
export async function addGrowth(entry: Omit<GrowthEntry,'id'>) { return db.growth.add(entry) }
export async function addKetone(entry: Omit<KetoneEntry,'id'>) { return db.ketones.add(entry) }
export async function addVaccine(entry: Omit<VaccineEntry,'id'>) { return db.vaccines.add(entry) }
export async function addVisit(entry: Omit<DoctorVisitEntry,'id'>) { return db.visits.add(entry) }

// Growth lists & mutations
export async function listGrowth(babyId:number, opts?: { date?: string }){
  let rows = await db.growth.where('babyId').equals(babyId).toArray()
  if (opts?.date){
    rows = rows.filter(r=>{
      const d = new Date(r.at); const yyyy=d.getFullYear(); const mm=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0');
      return `${yyyy}-${mm}-${dd}` === opts.date
    })
  }
  rows.sort((a,b)=> new Date(b.at).getTime() - new Date(a.at).getTime())
  return rows
}
export async function updateGrowth(id:number, changes: Partial<GrowthEntry>){ return db.growth.update(id, changes) }
export async function deleteGrowth(id:number){ return db.growth.delete(id) }

// Ketones
export async function listKetones(babyId:number, opts?: { date?: string }){
  let rows = await db.ketones.where('babyId').equals(babyId).toArray()
  if (opts?.date){
    rows = rows.filter(r=>{
      const d = new Date(r.at); const yyyy=d.getFullYear(); const mm=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0');
      return `${yyyy}-${mm}-${dd}` === opts.date
    })
  }
  rows.sort((a,b)=> new Date(b.at).getTime() - new Date(a.at).getTime())
  return rows
}
export async function updateKetone(id:number, changes: Partial<KetoneEntry>){ return db.ketones.update(id, changes) }
export async function deleteKetone(id:number){ return db.ketones.delete(id) }

// Vaccines
export async function listVaccines(babyId:number, opts?: { date?: string }){
  let rows = await db.vaccines.where('babyId').equals(babyId).toArray()
  if (opts?.date){ rows = rows.filter(r=> r.date === opts.date) }
  rows.sort((a,b)=> b.date.localeCompare(a.date))
  return rows
}
export async function updateVaccine(id:number, changes: Partial<VaccineEntry>){ return db.vaccines.update(id, changes) }
export async function deleteVaccine(id:number){ return db.vaccines.delete(id) }

// Visits
export async function listVisits(babyId:number, opts?: { date?: string }){
  let rows = await db.visits.where('babyId').equals(babyId).toArray()
  if (opts?.date){ rows = rows.filter(r=> r.date === opts.date) }
  rows.sort((a,b)=> b.date.localeCompare(a.date))
  return rows
}
export async function updateVisit(id:number, changes: Partial<DoctorVisitEntry>){ return db.visits.update(id, changes) }
export async function deleteVisit(id:number){ return db.visits.delete(id) }

// Health
export async function addMedication(entry: Omit<MedicationEntry,'id'>){ return db.medications.add(entry) }
export async function listMedications(babyId:number, opts?: { date?: string }){
  let rows = await db.medications.where('babyId').equals(babyId).toArray()
  if (opts?.date){
    rows = rows.filter(r=>{
      const d = new Date(r.at); const yyyy=d.getFullYear(); const mm=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0');
      return `${yyyy}-${mm}-${dd}` === opts.date
    })
  }
  rows.sort((a,b)=> new Date(b.at).getTime() - new Date(a.at).getTime())
  return rows
}
export async function updateMedication(id:number, changes: Partial<MedicationEntry>){ return db.medications.update(id, changes) }
export async function deleteMedication(id:number){ return db.medications.delete(id) }
export async function addTemperature(entry: Omit<TemperatureEntry,'id'>){ return db.temperatures.add(entry) }
export async function listTemperatures(babyId:number, opts?: { date?: string }){
  let rows = await db.temperatures.where('babyId').equals(babyId).toArray()
  if (opts?.date){
    rows = rows.filter(r=>{
      const d = new Date(r.at); const yyyy=d.getFullYear(); const mm=String(d.getMonth()+1).padStart(2,'0'); const dd=String(d.getDate()).padStart(2,'0');
      return `${yyyy}-${mm}-${dd}` === opts.date
    })
  }
  rows.sort((a,b)=> new Date(b.at).getTime() - new Date(a.at).getTime())
  return rows
}
export async function updateTemperature(id:number, changes: Partial<TemperatureEntry>){ return db.temperatures.update(id, changes) }
export async function deleteTemperature(id:number){ return db.temperatures.delete(id) }

export async function getLastFeed(babyId:number){ return db.feeds.where({babyId}).reverse().sortBy('at').then(arr=>arr.at(-1)) }
export async function getLastDiaper(babyId:number){ return db.diapers.where({babyId}).reverse().sortBy('at').then(arr=>arr.at(-1)) }
export async function getLastSleep(babyId:number){ return db.sleeps.where({babyId}).reverse().sortBy('start').then(arr=>arr.at(-1)) }
