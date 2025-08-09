import axios from 'axios'
import { db } from '../db/db'
import type Dexie from 'dexie'

// Minimal sync service with push-only behavior for now
const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000'

export async function heartbeat() {
  try {
    const res = await axios.get(API_BASE + '/api/health')
    return res.data
  } catch (e) {
    return { ok: false }
  }
}

async function pushCollection<T extends { id?: number; synced?: boolean }>(
  table: Dexie.Table<T, number>,
  collectionName: string
) {
  const items = await table.filter((r: T) => !r.synced).toArray()
  for (const it of items) {
    try {
      await axios.post(`${API_BASE}/api/${collectionName}`, it)
      if (it.id != null) await table.update(it.id, { synced: true } as any)
    } catch (e) {
      // stop on first failure to avoid hammering
      break
    }
  }
}

export async function pushUnsynced() {
  // Try heartbeat first
  const hb = await heartbeat()
  if (!hb?.ok) return { ok: false }

  await pushCollection(db.babies as any, 'babies')
  await pushCollection(db.feeds as any, 'feeds')
  await pushCollection(db.diapers as any, 'diapers')
  await pushCollection(db.sleeps as any, 'sleeps')
  await pushCollection(db.growth as any, 'growth')
  await pushCollection(db.ketones as any, 'ketones')
  await pushCollection(db.vaccines as any, 'vaccines')
  await pushCollection(db.visits as any, 'visits')

  return { ok: true }
}
