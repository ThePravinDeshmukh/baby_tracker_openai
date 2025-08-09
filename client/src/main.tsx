import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './style.css'
import { routes } from './routes'

const router = createBrowserRouter(routes)
const queryClient = new QueryClient()

// PWA install prompt capture
window.addEventListener('beforeinstallprompt', (e: any) => {
  e.preventDefault()
  ;(window as any).deferredPrompt = e
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
)
