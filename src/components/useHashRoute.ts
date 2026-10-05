import { useSyncExternalStore } from 'react'

export type Route = 'home' | 'diagnosis' | 'action'

function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

function getSnapshot(): Route {
  const path = window.location.hash.replace(/^#\/?/, '')
  if (path === 'diagnosis' || path === 'action') return path
  return 'home'
}

export function useHashRoute(): Route {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'home')
}
