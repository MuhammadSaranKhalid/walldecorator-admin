import { findPakistanCity, pakistanCities } from "@/data/pakistan-cities";
import type { CityTrafficData } from "@/components/admin/analytics/pakistan-traffic-map";

export interface CityTrafficFromDB {
  city: string;
  sessions: number;
}

/**
 * Merges city traffic data from database with geographic coordinates for Pakistan cities
 * Only includes cities that have coordinates in our Pakistan cities database
 *
 * @param dbCityData - City traffic data from the database (Pakistan only)
 * @returns Array of city traffic data with coordinates
 */
export function mergePakistanCityData(
  dbCityData: CityTrafficFromDB[]
): CityTrafficData[] {
  const mergedData: CityTrafficData[] = [];
  const unmatched: CityTrafficFromDB[] = [];

  for (const cityData of dbCityData) {
    // Find coordinates for this city
    const cityInfo = findPakistanCity(cityData.city);

    if (cityInfo) {
      mergedData.push({
        city: cityData.city,
        latitude: cityInfo.latitude,
        longitude: cityInfo.longitude,
        sessions: cityData.sessions,
        province: cityInfo.province,
      });
    } else {
      // Try fuzzy match for common variations
      const fuzzyMatch = findFuzzyPakistanCityMatch(cityData.city);
      if (fuzzyMatch) {
        mergedData.push({
          city: cityData.city,
          latitude: fuzzyMatch.latitude,
          longitude: fuzzyMatch.longitude,
          sessions: cityData.sessions,
          province: fuzzyMatch.province,
        });
      } else {
        unmatched.push(cityData);
      }
    }
  }

  // Log unmatched cities for debugging (only in development)
  if (process.env.NODE_ENV === 'development' && unmatched.length > 0) {
    console.log('⚠️ Pakistan cities without coordinate data:', unmatched.slice(0, 10));
    console.log(`📊 Match rate: ${mergedData.length}/${dbCityData.length} (${Math.round(mergedData.length / dbCityData.length * 100)}%)`);
  }

  return mergedData;
}

/**
 * Attempts to find a fuzzy match for Pakistan city names
 * Handles common variations like:
 * - "Dera Ghazi Khan" vs "D.G. Khan"
 * - "Islamabad" vs "Islamabad City"
 * - Case variations
 */
function findFuzzyPakistanCityMatch(cityName: string) {
  const normalized = normalizeCityName(cityName);

  // Common aliases
  const aliases: { [key: string]: string } = {
    'dgkhan': 'Dera Ghazi Khan',
    'dikhan': 'Dera Ismail Khan',
    'rwp': 'Rawalpindi',
    'khi': 'Karachi',
    'lhe': 'Lahore',
    'isl': 'Islamabad',
    'isb': 'Islamabad',
    'peshwar': 'Peshawar',
  };

  // Check aliases first
  if (aliases[normalized]) {
    return findPakistanCity(aliases[normalized]);
  }

  // Try partial match
  for (const city of pakistanCities) {
    const cityNormalized = normalizeCityName(city.name);

    // Check if either contains the other
    if (
      cityNormalized.includes(normalized) ||
      normalized.includes(cityNormalized)
    ) {
      return city;
    }
  }

  return undefined;
}

/**
 * Normalizes city names for comparison
 * Removes special characters, dots, and converts to lowercase
 */
function normalizeCityName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, '') // Remove dots
    .replace(/[-\s]/g, '') // Remove hyphens and spaces
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .trim();
}

/**
 * Gets statistics about the Pakistan city data merge
 */
export function getPakistanCityStats(dbCityData: CityTrafficFromDB[], mergedData: CityTrafficData[]) {
  const totalCities = dbCityData.length;
  const matchedCities = mergedData.length;
  const unmatchedCities = totalCities - matchedCities;
  const matchRate = totalCities > 0 ? (matchedCities / totalCities) * 100 : 0;

  const totalSessions = dbCityData.reduce((sum, city) => sum + city.sessions, 0);
  const matchedSessions = mergedData.reduce((sum, city) => sum + city.sessions, 0);
  const sessionCoverage = totalSessions > 0 ? (matchedSessions / totalSessions) * 100 : 0;

  // Get top cities
  const topCities = [...mergedData]
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5)
    .map(c => ({ city: c.city, sessions: c.sessions, province: c.province }));

  return {
    totalCities,
    matchedCities,
    unmatchedCities,
    matchRate: Math.round(matchRate * 10) / 10,
    totalSessions,
    matchedSessions,
    unmatchedSessions: totalSessions - matchedSessions,
    sessionCoverage: Math.round(sessionCoverage * 10) / 10,
    topCities,
  };
}
