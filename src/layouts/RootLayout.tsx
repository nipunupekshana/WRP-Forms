import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export default function RootLayout() {
  return (
    <div>
      <header className="app-header">
        <strong>WRP Forms</strong>
        <nav className="app-nav" aria-label="Primary">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/forms">Forms</NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Suspense fallback={<div aria-busy="true">Loading…</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
