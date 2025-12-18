import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <section>
      <h1>Home</h1>
      <p>
        This project now uses React Router. Use the navigation above, or go to{' '}
        <Link to="/forms">Forms</Link>.
      </p>
    </section>
  )
}
