import Dexie from 'dexie'
import type { Table } from 'dexie'

export interface BabyProfile {
  id?: number
  name: string
  dob: string // ISO date
  gender?: string
  units: 'metric' | 'imperial'
  photoUrl?: string
}

export interface FeedEntry {
  id?: number
  babyId: number
  type: string
  amount?: number
  unit?: 'ml' | 'oz' | 'g'
  side?: 'left' | 'right'
  at: string // ISO datetime
  synced?: boolean
  notes?: string
}

export interface DiaperEntry {
  id?: number
  babyId: number
  type: 'wet' | 'dirty' | 'mixed'
  notes?: string
  photoUrl?: string
  at: string
  synced?: boolean
}

export interface SleepEntry {
  id?: number
  babyId: number
  start: string
  end?: string
  notes?: string
  synced?: boolean
}

export interface GrowthEntry {
  id?: number
  babyId: number
  weight?: number
  height?: number
  head?: number
  at: string
  synced?: boolean
}

export interface KetoneEntry {
  id?: number
  babyId: number
  level: 'Negative'|'Trace'|'Small'|'Moderate'|'Large'
  at: string
  synced?: boolean
}

export interface VaccineEntry {
  id?: number
  babyId: number
  type: string
  date: string
  synced?: boolean
}

export interface DoctorVisitEntry {
  id?: number
  babyId: number
  doctor: string
  date: string
  notes?: string
  photoUrl?: string
  synced?: boolean
}

export interface MedicationEntry {
  id?: number
  babyId: number
  name: string
  dose?: string
  notes?: string
  at: string
  synced?: boolean
}

export interface TemperatureEntry {
  id?: number
  babyId: number
  celsius: number
  at: string
  notes?: string
  synced?: boolean
}

export class BabyDB extends Dexie {
  babies!: Table<BabyProfile, number>
  feeds!: Table<FeedEntry, number>
  diapers!: Table<DiaperEntry, number>
  sleeps!: Table<SleepEntry, number>
  growth!: Table<GrowthEntry, number>
  ketones!: Table<KetoneEntry, number>
  vaccines!: Table<VaccineEntry, number>
  visits!: Table<DoctorVisitEntry, number>
  medications!: Table<MedicationEntry, number>
  temperatures!: Table<TemperatureEntry, number>

  constructor() {
    super('babytracker')
    this.version(1).stores({
      babies: '++id, name, dob',
      feeds: '++id, babyId, at',
      diapers: '++id, babyId, at',
      sleeps: '++id, babyId, start',
      growth: '++id, babyId, at',
      ketones: '++id, babyId, at',
      vaccines: '++id, babyId, date',
      visits: '++id, babyId, date',
    })
    this.version(2).stores({
      medications: '++id, babyId, at',
      temperatures: '++id, babyId, at',
    })
  }
}

export const db = new BabyDB()
