import { atom } from 'nanostores'

// Read default state from localStorage or cookie if client-side
const isServer = typeof window === 'undefined'
const defaultOpen = isServer ? true : (localStorage.getItem('sidebar_open') !== 'false')

export const $sidebarOpen = atom(defaultOpen)

export function toggleSidebar() {
  const next = !$sidebarOpen.get()
  $sidebarOpen.set(next)
  if (typeof window !== 'undefined') {
    localStorage.setItem('sidebar_open', String(next))
  }
}

export function setSidebarOpen(value: boolean) {
  $sidebarOpen.set(value)
  if (typeof window !== 'undefined') {
    localStorage.setItem('sidebar_open', String(value))
  }
}
