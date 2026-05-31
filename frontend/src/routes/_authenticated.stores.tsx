import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/stores')({
  component: StoresRoute,
})

function StoresRoute() {
  return <Outlet />
}
