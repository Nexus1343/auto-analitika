// Simple cache utility for prototype app using sessionStorage
const CACHE_KEYS = {
  CARS_LIST: 'cars_list',
  CAR_DETAILS: 'car_details',
} as const

const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes in milliseconds

interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class SessionCache {
  private isClient = typeof window !== 'undefined'

  private generateKey(baseKey: string, params?: Record<string, any>): string {
    if (!params) return baseKey
    const paramsString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`)
      .join('|')
    return `${baseKey}_${paramsString}`
  }

  set<T>(key: string, data: T, params?: Record<string, any>): void {
    if (!this.isClient) return

    const cacheKey = this.generateKey(key, params)
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION,
    }

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(item))
    } catch (error) {
      console.warn('Failed to cache data:', error)
    }
  }

  get<T>(key: string, params?: Record<string, any>): T | null {
    if (!this.isClient) return null

    const cacheKey = this.generateKey(key, params)
    
    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (!cached) return null

      const item: CacheItem<T> = JSON.parse(cached)

      // Check if expired
      if (Date.now() > item.expiresAt) {
        this.remove(key, params)
        return null
      }

      return item.data
    } catch (error) {
      console.warn('Failed to read from cache:', error)
      return null
    }
  }

  remove(key: string, params?: Record<string, any>): void {
    if (!this.isClient) return

    const cacheKey = this.generateKey(key, params)
    try {
      sessionStorage.removeItem(cacheKey)
    } catch (error) {
      console.warn('Failed to remove from cache:', error)
    }
  }

  clear(): void {
    if (!this.isClient) return

    try {
      // Remove only our cache items
      Object.values(CACHE_KEYS).forEach(key => {
        const keysToRemove = Object.keys(sessionStorage).filter(k => k.startsWith(key))
        keysToRemove.forEach(k => sessionStorage.removeItem(k))
      })
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }
  }

  // Cache cars list with filters as params
  setCarsListCache(data: any, filters: Record<string, any>): void {
    this.set(CACHE_KEYS.CARS_LIST, data, filters)
  }

  getCarsListCache(filters: Record<string, any>): any {
    return this.get(CACHE_KEYS.CARS_LIST, filters)
  }

  // Cache individual car details
  setCarDetailsCache(lot: string, domain: string, data: any): void {
    this.set(CACHE_KEYS.CAR_DETAILS, data, { lot, domain })
  }

  getCarDetailsCache(lot: string, domain: string): any {
    return this.get(CACHE_KEYS.CAR_DETAILS, { lot, domain })
  }
}

export const cache = new SessionCache()
export { CACHE_KEYS } 