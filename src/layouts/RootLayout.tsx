import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import ModeToggle from '../theme/mode-toggle'

export default function RootLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
          <strong className="text-base">WRP Forms</strong>
          <div className="flex items-center gap-3">
            <nav className="flex flex-wrap gap-3 text-sm" aria-label="Primary">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'underline underline-offset-4' : 'hover:underline'
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/sub-hauler-form"
              className={({ isActive }) =>
                isActive ? 'underline underline-offset-4' : 'hover:underline'
              }
            >
              Sub-Hauler Form
            </NavLink>
            <NavLink
              to="/workforce-checklist"
              className={({ isActive }) =>
                isActive ? 'underline underline-offset-4' : 'hover:underline'
              }
            >
              Workforce Checklist
            </NavLink>
            </nav>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Suspense fallback={<div aria-busy="true">Loading…</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
