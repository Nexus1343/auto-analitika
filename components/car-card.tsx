"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { MapPin, Gauge, Calendar, Clock, DollarSign, AlertTriangle } from "lucide-react"
import type { Car } from "@/types/car"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface CarCardProps {
  car: Car
}

export function CarCard({ car }: CarCardProps) {
  // Safety check for car data
  if (!car || !car.lots || car.lots.length === 0) {
    return null
  }

  const lot = car.lots[0] // Using first lot for display
  
  // Try multiple image sources with priority: downloaded > normal > big > small
  const getImages = () => {
    if (!lot?.images) {
      console.log(`No images object for car ${car.vin}`)
      return ["/placeholder.svg?height=200&width=300"]
    }
    
    const { downloaded, normal, big, small } = lot.images
    
    if (downloaded && downloaded.length > 0) {
      console.log(`Using downloaded images for car ${car.vin}:`, downloaded.length)
      return downloaded
    }
    if (normal && normal.length > 0) {
      console.log(`Using normal images for car ${car.vin}:`, normal.length)
      return normal
    }
    if (big && big.length > 0) {
      console.log(`Using big images for car ${car.vin}:`, big.length)
      return big
    }
    if (small && small.length > 0) {
      console.log(`Using small images for car ${car.vin}:`, small.length)
      return small
    }
    
    console.log(`No images available for car ${car.vin}, using placeholder`)
    return ["/placeholder.svg?height=200&width=300"]
  }
  
  const images = getImages()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const formatPrice = (price?: number) => {
    if (!price) return "No estimate"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatMileage = (miles: number, km: number) => {
    return `${new Intl.NumberFormat("en-US").format(miles)} miles (${new Intl.NumberFormat("en-US").format(km)} km)`
  }

  const getAuctionPlatform = (domainName?: string) => {
    if (!domainName) return "UNKNOWN"
    return domainName.replace("_", ".").toUpperCase().replace(".COM", "")
  }

  const getDamageCondition = () => {
    const damage = lot.damage?.main?.name || "Unknown"
    const condition = lot.condition?.name?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Unknown"
    return `${damage} | ${condition}`
  }

  const getSellerName = () => {
    return lot.seller?.name || "Unknown"
  }

  const getLocation = () => {
    if (!lot.location) return "Unknown"
    const city = lot.location.city?.name || "Unknown"
    const state = lot.location.state?.code?.toUpperCase() || "Unknown"
    return `${city}, ${state}`
  }

  const getBidInfo = () => {
    if (lot.final_bid) return `Final: ${formatPrice(lot.final_bid)}`
    if (lot.bid) return `Current: ${formatPrice(lot.bid)}`
    if (lot.buy_now) return `Buy Now: ${formatPrice(lot.buy_now)}`
    return "No bid"
  }

  const getStatusBadge = () => {
    const status = lot.status?.name || "unknown"
    switch (status) {
      case "sale":
        return <Badge variant="outline" className="font-normal text-blue-700 border-blue-200">For Sale</Badge>
      case "sold":
        return <Badge variant="outline" className="font-normal text-green-700 border-green-200">Sold</Badge>
      case "upcoming":
        return <Badge variant="outline" className="font-normal text-orange-700 border-orange-200">Upcoming</Badge>
      default:
        return <Badge variant="outline" className="font-normal text-gray-700 border-gray-200">Unknown</Badge>
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col md:flex-row">
        {/* Image Section with Navigation */}
        <div className="relative md:w-1/3 lg:w-1/4">
          <div
            className="relative h-48 md:h-full group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Image
              src={images[currentImageIndex] || "/placeholder.svg"}
              alt={`${car.manufacturer?.name || 'Unknown'} ${car.model?.name || 'Unknown'}`}
              fill
              className="object-cover transition-opacity duration-300"
            />

            {/* Auction Platform Badge */}
            <Badge className="absolute top-2 right-2 bg-red-600 text-white z-10">
              {getAuctionPlatform(lot.domain?.name)}
            </Badge>

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded z-10">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && isHovered && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full transition-all duration-200 z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full transition-all duration-200 z-10"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Image Dots Indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-2 right-2 flex gap-1 z-10">
                {images.map((_: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex ? "bg-white" : "bg-white bg-opacity-50 hover:bg-opacity-75"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          <div className="flex flex-col h-full">
            {/* Header with Title and Price */}
            <div className="flex flex-col md:flex-row justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {car.year} {car.manufacturer?.name || 'Unknown'} {car.model?.name || 'Unknown'}
                </h3>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">VIN:</span> {car.vin || 'Unknown'} • <span className="font-medium">Lot:</span>{" "}
                  {lot.lot || 'Unknown'}
                </p>
              </div>
              <div className="mt-2 md:mt-0 md:text-right">
                <div className="text-xl font-bold text-green-600">{formatPrice(lot.actual_cash_value)}</div>
                <div className="text-sm text-gray-500">Estimated Value</div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm mb-3">
              {/* Mileage */}
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Mileage:</span>
                <span className="font-medium">{formatMileage(lot.odometer?.mi || 0, lot.odometer?.km || 0)}</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{getLocation()}</span>
              </div>

              {/* Year */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Year:</span>
                <span className="font-medium">{car.year}</span>
              </div>

              {/* Seller */}
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Seller:</span>
                <span className="font-medium">{getSellerName()}</span>
              </div>

              {/* Damage */}
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-gray-600">Damage:</span>
                <span className="font-medium">{getDamageCondition()}</span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Status:</span>
                {getStatusBadge()}
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-auto pt-2 border-t">
              <div className="flex justify-between items-center">
                <Badge variant="secondary" className="text-sm">
                  {getBidInfo()}
                </Badge>
                <Link href={`/cars/lot/${lot.lot || 'unknown'}/${lot.domain?.name || 'unknown'}`}>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
