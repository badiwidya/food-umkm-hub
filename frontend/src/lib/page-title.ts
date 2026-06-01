import { useEffect } from 'react'

export const APP_NAME = 'Food & UMKM Hub'

export function formatPageTitle(title: string) {
  return `${title} | ${APP_NAME}`
}

export function titleHead(title: string) {
  return {
    meta: [
      {
        title: formatPageTitle(title),
      },
    ],
  }
}

export function getShortId(id: string) {
  return id.slice(0, 8)
}

export function usePageTitle(title: string | undefined, fallbackTitle: string) {
  useEffect(() => {
    document.title = formatPageTitle(title?.trim() || fallbackTitle)
  }, [fallbackTitle, title])
}
