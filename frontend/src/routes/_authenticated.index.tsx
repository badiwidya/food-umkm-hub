import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/')({
  component: StudentHomeRoute,
})

function StudentHomeRoute() {
  return (
    <main>
      <h1>Student home</h1>
    </main>
  )
}
