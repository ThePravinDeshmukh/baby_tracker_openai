# Baby Tracker (Vite React + Express + MongoDB)

Mobile-friendly PWA to track feeds, diapers, sleep, growth, ketones, vaccinations, and doctor visits. Supports local offline storage (IndexedDB) and optional cloud sync via MongoDB.

## Develop

- Client (Vite): http://localhost:5173
- Server (Express): http://localhost:4000

### Prereqs
- Node.js 18+
- MongoDB running locally or a connection string

### Run
1. Client
```
cd client
npm install
npm run dev
```
2. Server
```
cd server
cp .env.example .env # set MONGO_URI if not local
npm install
npm run dev
```

### PWA install
Open the client URL on your phone and "Add to Home Screen". Works offline; data is cached in IndexedDB and can sync when online.

## Roadmap
- Implement forms saving to IndexedDB with Dexie
- Background sync with the server
- Auth (account or guest)
- Notifications and reminders
- Reports with charts and PDF export
