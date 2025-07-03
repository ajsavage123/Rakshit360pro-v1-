
import { supabase } from './supabase'
import { geoapifyService, Location, Hospital } from './geoapify'

export interface EnhancedHospital extends Hospital {
  specialty: string[]
  opening_hours: string
  location?: { lat: number; lng: number }
  source: 'supabase' | 'geoapify'
}

class HospitalService {
  // Calculate distance between two points using Haversine formula
  private calculateDistance(point1: Location, point2: Location): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = point1.lat * Math.PI / 180
    const φ2 = point2.lat * Math.PI / 180
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  private formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`
    } else {
      return `${(meters / 1000).toFixed(1)}km`
    }
  }

  async searchNearbyHospitals(location: Location, specialty?: string, radius: number = 25000): Promise<EnhancedHospital[]> {
    const hospitals: EnhancedHospital[] = []

    try {
      // 1. First, get hospitals from Supabase database using PostGIS
      let query = supabase
        .from('hospitals')
        .select('*')
        .not('location', 'is', null)

      // Add specialty filter if provided
      if (specialty) {
        query = query.contains('specialty', [specialty])
      }

      const { data: supabaseHospitals, error } = await query.limit(50)

      if (error) {
        console.warn('Supabase query failed:', error)
      } else if (supabaseHospitals) {
        // Calculate distances client-side and filter
        supabaseHospitals.forEach(hospital => {
          // Extract coordinates from PostGIS data if available
          let hospitalLat = 0;
          let hospitalLng = 0;
          
          if (hospital.location) {
            try {
              // Try to parse coordinates from location field
              const locationStr = hospital.location.toString();
              const coords = locationStr.match(/POINT\(([^)]+)\)/);
              if (coords) {
                const [lng, lat] = coords[1].split(' ').map(Number);
                hospitalLat = lat;
                hospitalLng = lng;
              }
            } catch (e) {
              console.warn('Could not parse location for hospital:', hospital.name);
            }
          }
          
          // Use stored lat/lng if available
          if (hospital.latitude && hospital.longitude) {
            hospitalLat = hospital.latitude;
            hospitalLng = hospital.longitude;
          }
          
          if (hospitalLat !== 0 && hospitalLng !== 0) {
            const distance = this.calculateDistance(location, { lat: hospitalLat, lng: hospitalLng });
            
            // Only include hospitals within radius
            if (distance <= radius) {
              hospitals.push({
                id: hospital.id.toString(),
                name: hospital.name,
                address: hospital.address,
                phone: hospital.phone || 'Phone not available',
                rating: hospital.rating || 0,
                distance: this.formatDistance(distance),
                specialty: hospital.specialty || ['General Medicine'],
                opening_hours: hospital.opening_hours || 'Hours not available',
                location: { lat: hospitalLat, lng: hospitalLng },
                source: 'supabase'
              });
            }
          }
        });
      }

      // 2. If we have fewer than 5 hospitals from Supabase, supplement with Geoapify
      if (hospitals.length < 5) {
        try {
          const geoapifyHospitals = await geoapifyService.searchHospitals(location, specialty)
          
          geoapifyHospitals.forEach(geoHospital => {
            // Avoid duplicates by checking if hospital already exists
            const isDuplicate = hospitals.some(existing => 
              existing.name.toLowerCase() === geoHospital.name.toLowerCase() ||
              existing.address.toLowerCase() === geoHospital.address.toLowerCase()
            )

            if (!isDuplicate) {
              hospitals.push({
                ...geoHospital,
                specialty: specialty ? [specialty] : ['General Medicine'],
                opening_hours: 'Hours not available',
                location: { lat: 0, lng: 0 }, // Will be geocoded if needed
                source: 'geoapify'
              })
            }
          })
        } catch (error) {
          console.warn('Geoapify search failed:', error)
        }
      }

      // Sort by distance and return
      return hospitals
        .sort((a, b) => {
          const distanceA = parseFloat(a.distance?.replace(/[^\d.]/g, '') || '0')
          const distanceB = parseFloat(b.distance?.replace(/[^\d.]/g, '') || '0')
          return distanceA - distanceB
        })
        .slice(0, 20) // Limit to 20 results

    } catch (error) {
      console.error('Hospital search failed:', error)
      // Fallback to Geoapify only
      const geoapifyHospitals = await geoapifyService.searchHospitals(location, specialty)
      return geoapifyHospitals.map(hospital => ({
        ...hospital,
        specialty: specialty ? [specialty] : ['General Medicine'],
        opening_hours: 'Hours not available',
        location: { lat: 0, lng: 0 },
        source: 'geoapify' as const
      }))
    }
  }

  async addHospital(hospitalData: {
    name: string
    address: string
    phone: string
    specialty: string[]
    opening_hours: string
    latitude: number
    longitude: number
    rating?: number
  }) {
    // Use direct INSERT with PostGIS point creation
    const { data, error } = await supabase
      .from('hospitals')
      .insert({
        name: hospitalData.name,
        address: hospitalData.address,
        phone: hospitalData.phone,
        specialty: hospitalData.specialty,
        opening_hours: hospitalData.opening_hours,
        latitude: hospitalData.latitude,
        longitude: hospitalData.longitude,
        rating: hospitalData.rating || 4.0
      })
      .select()

    if (error) {
      throw new Error(`Failed to add hospital: ${error.message}`)
    }

    return data
  }
}

export const hospitalService = new HospitalService()
