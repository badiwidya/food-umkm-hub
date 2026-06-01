import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/seller/profile')({
  component: SellerProfileRoute,
})

function SellerProfileRoute() {
  return <Outlet />
}
