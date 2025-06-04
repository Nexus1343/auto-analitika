"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Gauge, DollarSign, AlertTriangle, Settings, Hash, Eye, BarChart3, ArrowLeft, Loader2 } from "lucide-react"
import { useState, useEffect, use } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { Car as CarType } from "@/types/car"
import { cache } from "@/lib/cache"

function ImageGallery({ images }: { images: string[] }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden group">
        <Image src={images[currentImageIndex] || "/placeholder.svg"} alt="Car image" fill className="object-cover" />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative h-16 w-24 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                index === currentImageIndex ? "border-blue-500" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image src={image} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CarDetailPage({ params }: { params: Promise<{ lot: string; domain: string }> }) {
  const { lot, domain } = use(params)
  const [car, setCar] = useState<CarType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Check cache first
        const cachedData = cache.getCarDetailsCache(lot, domain)
        if (cachedData) {
          console.log('Using cached car details')
          setCar(cachedData)
          setLoading(false)
          return
        }

        console.log('Fetching fresh car details')
        const response = await fetch(`/api/cars/lot/${lot}/${domain}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Vehicle not found')
          }
          throw new Error(`Failed to fetch vehicle details: ${response.status}`)
        }

        const carData: CarType = await response.json()
        console.log('Received car data:', carData)
        
        // Cache the data
        cache.setCarDetailsCache(lot, domain, carData)
        setCar(carData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchCarDetails()
  }, [lot, domain])

  const formatPrice = (price?: number | null) => {
    if (!price) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatMileage = (miles: number) => {
    return new Intl.NumberFormat("en-US").format(miles)
  }

  const getAuctionPlatform = (domainName: string) => {
    return domainName.replace("_", ".").toUpperCase().replace(".COM", "")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading vehicle details...</p>
          <p className="text-sm text-gray-500">Lot: {lot} | Domain: {domain}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Vehicle Details</h2>
            <p className="text-red-600 mb-2">{error}</p>
            <p className="text-sm text-gray-600 mb-4">Lot: {lot} | Domain: {domain}</p>
            <div className="space-x-2">
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
              <Link href="/cars">
                <Button variant="outline">
                  Back to Listings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!car) {
    return null
  }

  if (!car.lots || car.lots.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">No Lot Information</h2>
            <p className="text-yellow-600 mb-4">This vehicle doesn't have lot information available.</p>
            <Link href="/cars">
              <Button variant="outline">
                Back to Listings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const lot_info = car.lots[0]
  // Prefer the downloaded images, then normal images, then fall back to placeholder
  const images = lot_info.images?.downloaded || lot_info.images?.normal || ["/placeholder.svg"]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/cars">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Listings
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {car.year} {car.manufacturer.name} {car.model.name}
                </h1>
                <p className="text-gray-600">VIN: {car.vin} | Lot: {lot_info.lot}</p>
              </div>
            </div>
            <Badge className="bg-red-600 text-white">{getAuctionPlatform(lot_info.domain.name)}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-6">
                <ImageGallery images={images} />
              </CardContent>
            </Card>

            {/* Vehicle Specifications */}
            {(car.engine || car.transmission || car.drive_wheel || car.fuel || car.cylinders || car.color) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Vehicle Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {car.engine && (
                      <div>
                        <p className="text-sm text-gray-600">Engine</p>
                        <p className="font-medium">{car.engine.name}</p>
                      </div>
                    )}
                    {car.transmission && (
                      <div>
                        <p className="text-sm text-gray-600">Transmission</p>
                        <p className="font-medium capitalize">{car.transmission.name}</p>
                      </div>
                    )}
                    {car.drive_wheel && (
                      <div>
                        <p className="text-sm text-gray-600">Drive Wheel</p>
                        <p className="font-medium capitalize">{car.drive_wheel.name}</p>
                      </div>
                    )}
                    {car.fuel && (
                      <div>
                        <p className="text-sm text-gray-600">Fuel Type</p>
                        <p className="font-medium capitalize">{car.fuel.name}</p>
                      </div>
                    )}
                    {car.cylinders && (
                      <div>
                        <p className="text-sm text-gray-600">Cylinders</p>
                        <p className="font-medium">{car.cylinders}</p>
                      </div>
                    )}
                    {car.color && (
                      <div>
                        <p className="text-sm text-gray-600">Color</p>
                        <p className="font-medium capitalize">{car.color.name}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Condition & Damage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Condition & Damage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Primary Damage</p>
                    <p className="font-medium">{lot_info.damage?.main?.name || "None reported"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Secondary Damage</p>
                    <p className="font-medium">{lot_info.damage?.second?.name || "None reported"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Condition</p>
                    <p className="font-medium capitalize">{lot_info.condition?.name?.replace(/_/g, " ") || "Unknown"}</p>
                  </div>
                  {lot_info.keys_available !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600">Keys Available</p>
                      <p className="font-medium">{lot_info.keys_available ? "Yes" : "No"}</p>
                    </div>
                  )}
                  {lot_info.airbags && (
                    <div>
                      <p className="text-sm text-gray-600">Airbags</p>
                      <p className="font-medium capitalize">{lot_info.airbags.name}</p>
                    </div>
                  )}
                  {lot_info.grade_iaai && (
                    <div>
                      <p className="text-sm text-gray-600">IAAI Grade</p>
                      <p className="font-medium">{lot_info.grade_iaai}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pricing and Details */}
          <div className="space-y-6">
            {/* Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lot_info.actual_cash_value && (
                  <div>
                    <p className="text-sm text-gray-600">Actual Cash Value</p>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(lot_info.actual_cash_value)}</p>
                  </div>
                )}
                {lot_info.pre_accident_price && lot_info.pre_accident_price > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Pre-Accident Price</p>
                    <p className="text-lg font-semibold text-blue-600">{formatPrice(lot_info.pre_accident_price)}</p>
                  </div>
                )}
                {lot_info.clean_wholesale_price && (
                  <div>
                    <p className="text-sm text-gray-600">Clean Wholesale Price</p>
                    <p className="text-lg font-semibold text-purple-600">{formatPrice(lot_info.clean_wholesale_price)}</p>
                  </div>
                )}
                {lot_info.estimate_repair_price && (
                  <div>
                    <p className="text-sm text-gray-600">Estimated Repair Cost</p>
                    <p className="text-lg font-semibold text-red-600">{formatPrice(lot_info.estimate_repair_price)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Current Bid</p>
                  <p className="font-medium">{formatPrice(lot_info.bid)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Buy Now Price</p>
                  <p className="font-medium">{formatPrice(lot_info.buy_now)}</p>
                </div>
                {lot_info.final_bid && (
                  <div>
                    <p className="text-sm text-gray-600">Final Bid</p>
                    <p className="font-medium text-blue-600">{formatPrice(lot_info.final_bid)}</p>
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Eye className="w-4 h-4 mr-2" />
                    Watch This Auction
                  </Button>
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analyze
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Auction Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Auction Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Lot Number</p>
                  <p className="font-medium">{lot_info.lot}</p>
                </div>
                {lot_info.seller && (
                  <div>
                    <p className="text-sm text-gray-600">Seller</p>
                    <p className="font-medium">{lot_info.seller.name}</p>
                  </div>
                )}
                {lot_info.seller_type && (
                  <div>
                    <p className="text-sm text-gray-600">Seller Type</p>
                    <p className="font-medium capitalize">{lot_info.seller_type.name}</p>
                  </div>
                )}
                {lot_info.title && (
                  <div>
                    <p className="text-sm text-gray-600">Title</p>
                    <p className="font-medium">{lot_info.title.name}</p>
                  </div>
                )}
                {lot_info.detailed_title && (
                  <div>
                    <p className="text-sm text-gray-600">Detailed Title</p>
                    <p className="font-medium">{lot_info.detailed_title.name}</p>
                  </div>
                )}
                {lot_info.status && (
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant="outline" className="capitalize">
                      {lot_info.status.name}
                    </Badge>
                  </div>
                )}
                {lot_info.tags && lot_info.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Tags</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {lot_info.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Information */}
            {lot_info.location && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lot_info.selling_branch && (
                    <div>
                      <p className="text-sm text-gray-600">Branch</p>
                      <p className="font-medium capitalize">{lot_info.selling_branch.name}</p>
                    </div>
                  )}
                  {lot_info.location.location && (
                    <div>
                      <p className="text-sm text-gray-600">Auction Location</p>
                      <p className="font-medium capitalize">{lot_info.location.location.name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">City, State</p>
                    <p className="font-medium capitalize">
                      {lot_info.location.city?.name || "Unknown"}, {lot_info.location.state?.name || "Unknown"}
                    </p>
                  </div>
                  {lot_info.location.postal_code && (
                    <div>
                      <p className="text-sm text-gray-600">Postal Code</p>
                      <p className="font-medium">{lot_info.location.postal_code}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Country</p>
                    <p className="font-medium">{lot_info.location.country?.name || "Unknown"}</p>
                  </div>
                  {lot_info.location.latitude && lot_info.location.longitude && (
                    <div>
                      <p className="text-sm text-gray-600">Coordinates</p>
                      <p className="font-medium text-xs">{lot_info.location.latitude}, {lot_info.location.longitude}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Vehicle Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="w-5 h-5" />
                  Vehicle Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Mileage</p>
                  <p className="font-medium">{formatMileage(lot_info.odometer.mi)} miles</p>
                  <p className="text-sm text-gray-500">{formatMileage(lot_info.odometer.km)} km</p>
                </div>
                {lot_info.odometer.status && (
                  <div>
                    <p className="text-sm text-gray-600">Odometer Status</p>
                    <p className="font-medium capitalize">{lot_info.odometer.status.name}</p>
                  </div>
                )}
                {car.vehicle_type && (
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Type</p>
                    <p className="font-medium capitalize">{car.vehicle_type.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Year</p>
                  <p className="font-medium">{car.year}</p>
                </div>
                {car.generation && (
                  <div>
                    <p className="text-sm text-gray-600">Generation</p>
                    <p className="font-medium">{car.generation.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 