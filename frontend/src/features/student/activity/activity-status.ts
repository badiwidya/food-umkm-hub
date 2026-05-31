import type { OrderStatus } from '../../../client'

export type ActivityStatusFilter = OrderStatus | undefined

export function parseActivityStatus(value: unknown): ActivityStatusFilter {
  switch (value) {
    case 'pending':
    case 'waiting_for_confirmation':
    case 'in_process':
    case 'ready_to_pickup':
    case 'rejected':
    case 'failed':
    case 'completed':
      return value
    default:
      return undefined
  }
}
