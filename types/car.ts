export interface Car {
  id: number
  year: number
  title: string
  vin: string
  manufacturer: {
    id: number
    name: string
  }
  model: {
    id: number
    name: string
    manufacturer_id: number
  }
  generation?: {
    id: number
    name: string
    manufacturer_id: number
    model_id: number
  }
  body_type?: any
  color?: {
    name: string
    id: number
  }
  engine?: {
    id: number
    name: string
  }
  transmission?: {
    name: string
    id: number
  }
  drive_wheel?: {
    name: string
    id: number
  }
  vehicle_type?: {
    name: string
    id: number
  }
  fuel?: {
    name: string
    id: number
  }
  cylinders?: number
  lots: Array<{
    id: number
    lot: string
    domain: {
      name: string
      id: number
    }
    external_id?: string
    odometer: {
      km: number
      mi: number
      status: {
        name: string
        id: number
      }
    }
    estimate_repair_price?: number
    pre_accident_price?: number
    clean_wholesale_price?: number
    actual_cash_value?: number
    sale_date?: string | null
    sale_date_updated_at?: string
    bid?: number | null
    bid_updated_at?: string
    buy_now?: number | null
    buy_now_updated_at?: string
    final_bid?: number | null
    final_bid_updated_at?: string | null
    status?: {
      name: string
      id: number
    }
    seller?: {
      id: number
      name: string
      logo?: string
      is_insurance: boolean
      is_rental: boolean
      is_credit_company: boolean
    }
    seller_type?: {
      name: string
      id: number
    }
    title?: {
      id: number
      code?: string | null
      name: string
    }
    detailed_title?: {
      id: number
      code?: string | null
      name: string
    }
    damage?: {
      main?: {
        id: number
        name: string
      }
      second?: any
    }
    keys_available?: boolean
    airbags?: {
      name: string
      id: number
    }
    condition?: {
      name: string
      id: number
    }
    grade_iaai?: number
    images?: {
      id?: number
      small?: any
      normal?: string[]
      big?: string[]
      exterior?: any
      interior?: any
      video?: string
      video_youtube_id?: any
      external_panorama_url?: string
      downloaded?: string[]
    }
    location?: {
      country: {
        iso: string
        name: string
      }
      state: {
        id: number
        code: string
        name: string
      }
      city: {
        id: number
        name: string
      }
      location?: {
        id: number
        name: string
      }
      latitude?: number
      longitude?: number
      postal_code?: string
      is_offsite?: boolean
      raw?: string
      offsite?: any
    }
    tags?: any
    line?: string
    selling_branch?: {
      name: string
      link: string
      number: number
      id: number
      domain_id: number
    }
    created_at?: string
    updated_at?: string
    details?: any
    prices?: any[]
  }>
}

export interface CarListResponse {
  data: Car[]
  links?: {
    first?: string
    last?: string
    prev?: string | null
    next?: string | null
  }
  meta: {
    current_page: number
    from?: number
    last_page: number
    links?: Array<{
      url?: string | null
      label: string
      active: boolean
    }>
    path?: string
    per_page: number
    to?: number
    total: number
  }
}

export interface CarFilters {
  manufacturer_id?: string
  vehicle_type?: string
  country?: string
  minutes?: string
  per_page?: string
  page?: string
  prices_history?: string
}
