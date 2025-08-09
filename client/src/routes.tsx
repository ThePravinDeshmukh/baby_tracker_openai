import type { RouteObject } from 'react-router-dom'
import { AppLayout } from './ui/AppLayout'
import { Dashboard } from './views/Dashboard'
import { Onboarding } from './views/Onboarding'
import { Feed } from './views/Feed'
import { Diaper } from './views/Diaper'
import { Sleep } from './views/Sleep'
import { GrowthHealth } from './views/GrowthHealth'
import { Reports } from './views/Reports'
import { Settings } from './views/Settings'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'onboarding', element: <Onboarding /> },
      { path: 'feed', element: <Feed /> },
      { path: 'diaper', element: <Diaper /> },
      { path: 'sleep', element: <Sleep /> },
      { path: 'growth', element: <GrowthHealth /> },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]
