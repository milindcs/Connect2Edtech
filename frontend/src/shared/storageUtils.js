import { useState, useEffect } from 'react'

/**
 * localStorage utilities for caching dashboard data with TTL support.
 */

export function getCachedData(key, ttlMs = 5 * 60 * 1000) {
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    const parsed = JSON.parse(cached)
    const now = Date.now()
    if (now - parsed.timestamp > ttlMs) {
      localStorage.removeItem(key)
      return null
    }
    return parsed.data
  } catch {
    return null
  }
}

export function setCachedData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({
      timestamp: Date.now(),
      data
    }))
  } catch (e) {
    console.warn(`Failed to cache data for key "${key}":`, e)
  }
}

export function removeCachedData(key) {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.warn(`Failed to remove cached data for key "${key}":`, e)
  }
}

export function useOnlineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOffline
}