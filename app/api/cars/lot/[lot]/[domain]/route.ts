import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lot: string; domain: string }> }
) {
  try {
    // Get environment variables
    const CARSTAT_API_KEY = process.env.CARSTAT_API_KEY
    const CARSTAT_API_URL = process.env.CARSTAT_API_URL

    // Check if required environment variables are set
    if (!CARSTAT_API_KEY || !CARSTAT_API_URL) {
      console.error('Missing required environment variables: CARSTAT_API_KEY or CARSTAT_API_URL')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const { lot, domain } = await params

    // Use the lot search endpoint
    const lotSearchUrl = new URL(`${CARSTAT_API_URL}/search-lot/${lot}/${domain}`)
    lotSearchUrl.searchParams.set('prices_history', '1')
    
    const response = await fetch(lotSearchUrl.toString(), {
      headers: {
        'accept': '*/*',
        'x-api-key': CARSTAT_API_KEY,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Vehicle not found' },
          { status: 404 }
        )
      }
      const errorText = await response.text()
      console.error(`Lot search API error ${response.status}:`, errorText)
      throw new Error(`API responded with status: ${response.status}`)
    }

    const apiResponse = await response.json()
    console.log('Lot search API response:', JSON.stringify(apiResponse, null, 2))
    
    // Extract the car data from the API response
    const carData = apiResponse.data
    return NextResponse.json(carData)
  } catch (error) {
    console.error('Error fetching car details by lot:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle details' },
      { status: 500 }
    )
  }
} 