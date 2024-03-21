import { createLazyFileRoute, Link } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-2 bg-gray-100">
      <h1>Index Page</h1>
      <Link to='/sign'>Go to Sign</Link>
      <h3 className='text-red-400'>Welcome Home!</h3>
    </div>
  )
}