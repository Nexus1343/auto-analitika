'use client'

import { CarCard } from "@/components/car-card"
import { Badge } from "@/components/ui/badge"
import { Car, Search, Filter, Loader2 } from "lucide-react"
import type { CarListResponse, CarFilters } from "@/types/car"
import { useState, useEffect } from "react"
import { cache } from "@/lib/cache"

export default function CarsListPage() {
  const [carData, setCarData] = useState<CarListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CarFilters>({
    per_page: '20',
    minutes: '10',
    prices_history: '1',
    country: 'US',
    vehicle_type: '1'
  })

  const fetchCars = async (currentFilters: CarFilters = filters, forceRefresh: boolean = false) => {
    try {
      setLoading(true)
      setError(null)
      
      // Check cache first (unless force refresh is requested)
      if (!forceRefresh) {
        const cachedData = cache.getCarsListCache(currentFilters)
        if (cachedData) {
          console.log('Using cached cars data')
          setCarData(cachedData)
          setLoading(false)
          return
        }
      }

      console.log('Fetching fresh cars data')
      const searchParams = new URLSearchParams()
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) {
          searchParams.set(key, value)
        }
      })

      const response = await fetch(`/api/cars?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cars: ${response.status}`)
      }

      const data: CarListResponse = await response.json()
      
      // Cache the data
      cache.setCarsListCache(data, currentFilters)
      setCarData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCars()
  }, [])

  const handleFilterChange = (newFilters: Partial<CarFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    fetchCars(updatedFilters)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading cars...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Cars</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchCars()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { data: cars, meta } = carData || { data: [], meta: { current_page: 1, last_page: 1, per_page: 20, total: 0 } }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Car className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Car Auctions</h1>
                <p className="text-gray-600">Browse available vehicles from auction platforms</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Badge variant="secondary" className="text-sm w-fit">
                {meta.total} {meta.total === 1 ? "Vehicle" : "Vehicles"} Found
              </Badge>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Search className="w-4 h-4" />
                  Search
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-4">
            <select 
              value={filters.per_page || '20'}
              onChange={(e) => handleFilterChange({ per_page: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>

            <select 
              value={filters.manufacturer_id || ''}
              onChange={(e) => handleFilterChange({ manufacturer_id: e.target.value || undefined })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Manufacturers</option>
              <option value="16">BMW</option>
              <option value="14">Mercedes-Benz</option>
              <option value="15">Audi</option>
              <option value="1">Toyota</option>
              <option value="2">Honda</option>
              <option value="3">Ford</option>
            </select>

            <button 
              onClick={() => fetchCars(filters, true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Refresh
            </button>

            <button 
              onClick={() => {
                cache.clear()
                console.log('Cache cleared')
                fetchCars(filters, true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </div>

      {/* Car List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cars.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cars found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}

        {/* Pagination Info */}
        {meta.total > meta.per_page && (
          <div className="mt-8 flex justify-center">
            <div className="text-sm text-gray-600">
              Showing page {meta.current_page} of {meta.last_page} ({meta.total} total vehicles)
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
