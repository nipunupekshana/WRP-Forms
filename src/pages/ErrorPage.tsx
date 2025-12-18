import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'

type ErrorLike = {
  message?: string
}

export default function ErrorPage() {
  const error = useRouteError()

  let title = 'Something went wrong'
  let details: string | undefined

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`
    details = typeof error.data === 'string' ? error.data : undefined
  } else if (error instanceof Error) {
    details = error.message
  } else if (typeof error === 'string') {
    details = error
  } else if (error && typeof error === 'object') {
    details = (error as ErrorLike).message
  }

  return (
    <section>
      <h1>{title}</h1>
      {details ? <p>{details}</p> : null}
      <p>
        Go back <Link to="/">home</Link>.
      </p>
    </section>
  )
}
