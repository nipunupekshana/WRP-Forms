import { Link, useLocation } from 'react-router-dom'

export default function NotFoundPage() {
  const location = useLocation()

  return (
    <section>
      <h1>Not Found</h1>
      <p>
        No route matches <code>{location.pathname}</code>.
      </p>
      <p>
        Go back <Link to="/">home</Link>.
      </p>
    </section>
  )
}
