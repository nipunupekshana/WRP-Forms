import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import RootLayout from '../layouts/RootLayout'
import ErrorPage from '../pages/ErrorPage'

const HomePage = lazy(() => import('../pages/HomePage'))
const FormsPage = lazy(() => import('../pages/FormsPage'))
const WorkforceChecklistPage = lazy(() => import('../pages/WorkforceChecklistPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'sub-hauler-form',
        element: <FormsPage />,
      },
      {
        path: 'workforce-checklist',
        element: <WorkforceChecklistPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
