import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { MongoClient, ObjectId } from 'mongodb'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017'
const dbName = process.env.DB_NAME || 'babytracker'

let db
let client
let mongoConnected = false

async function connectMongo() {
  try {
    client = new MongoClient(mongoUri)
    await client.connect()
    db = client.db(dbName)
    mongoConnected = true
    console.log('Connected to MongoDB', mongoUri, dbName)
  } catch (err) {
    mongoConnected = false
    console.warn('MongoDB not available, API will run without DB. Error:', err.message)
  }
}

app.get('/api/health', (req, res) => res.json({ ok: true, mongo: mongoConnected }))

// Basic upsert endpoints for baby profiles and entries (minimal for now)
app.post('/api/babies', async (req, res) => {
  if (!mongoConnected || !db) return res.status(503).json({ ok:false, error:'db_unavailable' })
  const baby = req.body
  const r = await db.collection('babies').insertOne({ ...baby, createdAt: new Date() })
  res.json({ id: r.insertedId })
})

app.get('/api/babies', async (req, res) => {
  if (!mongoConnected || !db) return res.status(503).json({ ok:false, error:'db_unavailable' })
  const list = await db.collection('babies').find({}).toArray()
  res.json(list)
})

// Generic save of entries under collection name
app.post('/api/:collection', async (req, res) => {
  if (!mongoConnected || !db) return res.status(503).json({ ok:false, error:'db_unavailable' })
  const { collection } = req.params
  const entry = req.body
  const r = await db.collection(collection).insertOne({ ...entry, createdAt: new Date() })
  res.json({ id: r.insertedId })
})

app.get('/api/:collection', async (req, res) => {
  if (!mongoConnected || !db) return res.status(503).json({ ok:false, error:'db_unavailable' })
  const { collection } = req.params
  const list = await db.collection(collection).find({}).sort({ createdAt: -1 }).limit(200).toArray()
  res.json(list)
})

const port = process.env.PORT || 4000
connectMongo().finally(() => {
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`))
})
