import { create } from 'zustand'

export type AuthState = {
  userId?: string
  babyId?: number
  theme: 'light'|'dark'
  units: 'metric'|'imperial'
}

export const useAppStore = create<AuthState & {
  setBabyId: (id:number)=>void
  setTheme: (t:'light'|'dark')=>void
  setUnits: (u:'metric'|'imperial')=>void
  setUserId: (id?:string)=>void
}>((set)=>({
  userId: undefined,
  babyId: undefined,
  theme: 'light',
  units: 'metric',
  setBabyId: (babyId)=> set({ babyId }),
  setTheme: (theme)=> set({ theme }),
  setUnits: (units)=> set({ units }),
  setUserId: (userId)=> set({ userId }),
}))
