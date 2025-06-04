import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    
    // Get query parameters with defaults
    const minutes = searchParams.get('minutes') || '10'
    const per_page = searchParams.get('per_page') || '50'
    const prices_history = searchParams.get('prices_history') || '1'
    const page = searchParams.get('page') || '1'
    const manufacturer_id = searchParams.get('manufacturer_id')
    const vehicle_type = searchParams.get('vehicle_type')
    const country = searchParams.get('country') || 'US'

    // Build the API URL with parameters
    const apiUrl = new URL(`${CARSTAT_API_URL}/cars`)
    apiUrl.searchParams.set('minutes', minutes)
    apiUrl.searchParams.set('per_page', per_page)
    apiUrl.searchParams.set('prices_history', prices_history)
    apiUrl.searchParams.set('page', page)
    apiUrl.searchParams.set('country', country)
    
    if (manufacturer_id) {
      apiUrl.searchParams.set('manufacturer_id', manufacturer_id)
    }
    if (vehicle_type) {
      apiUrl.searchParams.set('vehicle_type', vehicle_type)
    }

    // Fetch data from the external API
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'accept': '*/*',
        'x-api-key': CARSTAT_API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching car data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch car data' },
      { status: 500 }
    )
  }
} 