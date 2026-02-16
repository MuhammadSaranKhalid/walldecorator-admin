/**
 * World Cities Coordinates Database
 * Contains major cities worldwide with their geographic coordinates
 * Format: [longitude, latitude] (react-simple-maps format, NOT Google Maps format)
 * Data compiled from GeoNames and SimpleMaps databases
 */

export interface CityCoordinate {
  city: string;
  country: string; // ISO 3166-1 alpha-2 code
  latitude: number;
  longitude: number;
  population?: number; // Optional: for future use in sizing markers
}

export const citiesCoordinates: CityCoordinate[] = [
  // United States
  { city: "New York", country: "US", latitude: 40.7128, longitude: -74.0060, population: 8336817 },
  { city: "Los Angeles", country: "US", latitude: 34.0522, longitude: -118.2437, population: 3979576 },
  { city: "Chicago", country: "US", latitude: 41.8781, longitude: -87.6298, population: 2693976 },
  { city: "Houston", country: "US", latitude: 29.7604, longitude: -95.3698, population: 2320268 },
  { city: "Phoenix", country: "US", latitude: 33.4484, longitude: -112.0740, population: 1680992 },
  { city: "Philadelphia", country: "US", latitude: 39.9526, longitude: -75.1652, population: 1584064 },
  { city: "San Antonio", country: "US", latitude: 29.4241, longitude: -98.4936, population: 1547253 },
  { city: "San Diego", country: "US", latitude: 32.7157, longitude: -117.1611, population: 1423851 },
  { city: "Dallas", country: "US", latitude: 32.7767, longitude: -96.7970, population: 1343573 },
  { city: "San Jose", country: "US", latitude: 37.3382, longitude: -121.8863, population: 1021795 },
  { city: "Austin", country: "US", latitude: 30.2672, longitude: -97.7431, population: 978908 },
  { city: "Jacksonville", country: "US", latitude: 30.3322, longitude: -81.6557, population: 911507 },
  { city: "San Francisco", country: "US", latitude: 37.7749, longitude: -122.4194, population: 881549 },
  { city: "Seattle", country: "US", latitude: 47.6062, longitude: -122.3321, population: 753675 },
  { city: "Denver", country: "US", latitude: 39.7392, longitude: -104.9903, population: 727211 },
  { city: "Boston", country: "US", latitude: 42.3601, longitude: -71.0589, population: 692600 },
  { city: "Miami", country: "US", latitude: 25.7617, longitude: -80.1918, population: 467963 },
  { city: "Atlanta", country: "US", latitude: 33.7490, longitude: -84.3880, population: 498715 },
  { city: "Las Vegas", country: "US", latitude: 36.1699, longitude: -115.1398, population: 641903 },
  { city: "Portland", country: "US", latitude: 45.5152, longitude: -122.6784, population: 654741 },

  // United Kingdom
  { city: "London", country: "GB", latitude: 51.5074, longitude: -0.1278, population: 8982000 },
  { city: "Birmingham", country: "GB", latitude: 52.4862, longitude: -1.8904, population: 1141816 },
  { city: "Manchester", country: "GB", latitude: 53.4808, longitude: -2.2426, population: 547627 },
  { city: "Leeds", country: "GB", latitude: 53.8008, longitude: -1.5491, population: 793139 },
  { city: "Glasgow", country: "GB", latitude: 55.8642, longitude: -4.2518, population: 633120 },
  { city: "Edinburgh", country: "GB", latitude: 55.9533, longitude: -3.1883, population: 524930 },
  { city: "Liverpool", country: "GB", latitude: 53.4084, longitude: -2.9916, population: 494814 },
  { city: "Bristol", country: "GB", latitude: 51.4545, longitude: -2.5879, population: 463377 },

  // Canada
  { city: "Toronto", country: "CA", latitude: 43.6532, longitude: -79.3832, population: 2930000 },
  { city: "Montreal", country: "CA", latitude: 45.5017, longitude: -73.5673, population: 1780000 },
  { city: "Vancouver", country: "CA", latitude: 49.2827, longitude: -123.1207, population: 675218 },
  { city: "Calgary", country: "CA", latitude: 51.0447, longitude: -114.0719, population: 1336000 },
  { city: "Ottawa", country: "CA", latitude: 45.4215, longitude: -75.6972, population: 994837 },
  { city: "Edmonton", country: "CA", latitude: 53.5461, longitude: -113.4938, population: 981280 },

  // Australia
  { city: "Sydney", country: "AU", latitude: -33.8688, longitude: 151.2093, population: 5312163 },
  { city: "Melbourne", country: "AU", latitude: -37.8136, longitude: 144.9631, population: 5078193 },
  { city: "Brisbane", country: "AU", latitude: -27.4698, longitude: 153.0251, population: 2560720 },
  { city: "Perth", country: "AU", latitude: -31.9505, longitude: 115.8605, population: 2125114 },
  { city: "Adelaide", country: "AU", latitude: -34.9285, longitude: 138.6007, population: 1345777 },

  // Germany
  { city: "Berlin", country: "DE", latitude: 52.5200, longitude: 13.4050, population: 3769495 },
  { city: "Hamburg", country: "DE", latitude: 53.5511, longitude: 9.9937, population: 1899160 },
  { city: "Munich", country: "DE", latitude: 48.1351, longitude: 11.5820, population: 1487708 },
  { city: "Cologne", country: "DE", latitude: 50.9375, longitude: 6.9603, population: 1085664 },
  { city: "Frankfurt", country: "DE", latitude: 50.1109, longitude: 8.6821, population: 753056 },

  // France
  { city: "Paris", country: "FR", latitude: 48.8566, longitude: 2.3522, population: 2161000 },
  { city: "Marseille", country: "FR", latitude: 43.2965, longitude: 5.3698, population: 869815 },
  { city: "Lyon", country: "FR", latitude: 45.7640, longitude: 4.8357, population: 513275 },
  { city: "Toulouse", country: "FR", latitude: 43.6047, longitude: 1.4442, population: 471941 },
  { city: "Nice", country: "FR", latitude: 43.7102, longitude: 7.2620, population: 340017 },

  // Spain
  { city: "Madrid", country: "ES", latitude: 40.4168, longitude: -3.7038, population: 3223334 },
  { city: "Barcelona", country: "ES", latitude: 41.3851, longitude: 2.1734, population: 1620343 },
  { city: "Valencia", country: "ES", latitude: 39.4699, longitude: -0.3763, population: 791413 },
  { city: "Seville", country: "ES", latitude: 37.3891, longitude: -5.9845, population: 688711 },
  { city: "Bilbao", country: "ES", latitude: 43.2630, longitude: -2.9350, population: 345821 },

  // Italy
  { city: "Rome", country: "IT", latitude: 41.9028, longitude: 12.4964, population: 2872800 },
  { city: "Milan", country: "IT", latitude: 45.4642, longitude: 9.1900, population: 1395274 },
  { city: "Naples", country: "IT", latitude: 40.8518, longitude: 14.2681, population: 959470 },
  { city: "Turin", country: "IT", latitude: 45.0703, longitude: 7.6869, population: 870952 },
  { city: "Florence", country: "IT", latitude: 43.7696, longitude: 11.2558, population: 382258 },

  // Japan
  { city: "Tokyo", country: "JP", latitude: 35.6762, longitude: 139.6503, population: 13960000 },
  { city: "Osaka", country: "JP", latitude: 34.6937, longitude: 135.5023, population: 2725006 },
  { city: "Yokohama", country: "JP", latitude: 35.4437, longitude: 139.6380, population: 3748071 },
  { city: "Nagoya", country: "JP", latitude: 35.1815, longitude: 136.9066, population: 2320361 },
  { city: "Kyoto", country: "JP", latitude: 35.0116, longitude: 135.7681, population: 1475183 },
  { city: "Fukuoka", country: "JP", latitude: 33.5904, longitude: 130.4017, population: 1592657 },

  // China
  { city: "Beijing", country: "CN", latitude: 39.9042, longitude: 116.4074, population: 21540000 },
  { city: "Shanghai", country: "CN", latitude: 31.2304, longitude: 121.4737, population: 27058000 },
  { city: "Guangzhou", country: "CN", latitude: 23.1291, longitude: 113.2644, population: 15300000 },
  { city: "Shenzhen", country: "CN", latitude: 22.5431, longitude: 114.0579, population: 12528300 },
  { city: "Chengdu", country: "CN", latitude: 30.5728, longitude: 104.0668, population: 16581000 },
  { city: "Hangzhou", country: "CN", latitude: 30.2741, longitude: 120.1551, population: 10360000 },
  { city: "Chongqing", country: "CN", latitude: 29.4316, longitude: 106.9123, population: 15872000 },

  // India
  { city: "Mumbai", country: "IN", latitude: 19.0760, longitude: 72.8777, population: 20411000 },
  { city: "Delhi", country: "IN", latitude: 28.7041, longitude: 77.1025, population: 30291000 },
  { city: "Bangalore", country: "IN", latitude: 12.9716, longitude: 77.5946, population: 12765000 },
  { city: "Hyderabad", country: "IN", latitude: 17.3850, longitude: 78.4867, population: 10004000 },
  { city: "Chennai", country: "IN", latitude: 13.0827, longitude: 80.2707, population: 10971000 },
  { city: "Kolkata", country: "IN", latitude: 22.5726, longitude: 88.3639, population: 14850000 },
  { city: "Pune", country: "IN", latitude: 18.5204, longitude: 73.8567, population: 6629000 },

  // Brazil
  { city: "São Paulo", country: "BR", latitude: -23.5505, longitude: -46.6333, population: 12325000 },
  { city: "Rio de Janeiro", country: "BR", latitude: -22.9068, longitude: -43.1729, population: 6748000 },
  { city: "Brasília", country: "BR", latitude: -15.8267, longitude: -47.9218, population: 3055000 },
  { city: "Salvador", country: "BR", latitude: -12.9714, longitude: -38.5014, population: 2900319 },
  { city: "Fortaleza", country: "BR", latitude: -3.7172, longitude: -38.5433, population: 2686612 },

  // Mexico
  { city: "Mexico City", country: "MX", latitude: 19.4326, longitude: -99.1332, population: 21581000 },
  { city: "Guadalajara", country: "MX", latitude: 20.6597, longitude: -103.3496, population: 5268642 },
  { city: "Monterrey", country: "MX", latitude: 25.6866, longitude: -100.3161, population: 5341171 },
  { city: "Puebla", country: "MX", latitude: 19.0414, longitude: -98.2063, population: 3250000 },
  { city: "Tijuana", country: "MX", latitude: 32.5149, longitude: -117.0382, population: 1922523 },

  // Russia
  { city: "Moscow", country: "RU", latitude: 55.7558, longitude: 37.6173, population: 12506468 },
  { city: "Saint Petersburg", country: "RU", latitude: 59.9311, longitude: 30.3609, population: 5383890 },
  { city: "Novosibirsk", country: "RU", latitude: 55.0084, longitude: 82.9357, population: 1625631 },
  { city: "Yekaterinburg", country: "RU", latitude: 56.8389, longitude: 60.6057, population: 1483119 },

  // South Korea
  { city: "Seoul", country: "KR", latitude: 37.5665, longitude: 126.9780, population: 9776000 },
  { city: "Busan", country: "KR", latitude: 35.1796, longitude: 129.0756, population: 3414950 },
  { city: "Incheon", country: "KR", latitude: 37.4563, longitude: 126.7052, population: 2954955 },
  { city: "Daegu", country: "KR", latitude: 35.8714, longitude: 128.6014, population: 2447023 },

  // Argentina
  { city: "Buenos Aires", country: "AR", latitude: -34.6037, longitude: -58.3816, population: 15180000 },
  { city: "Córdoba", country: "AR", latitude: -31.4201, longitude: -64.1888, population: 1613000 },
  { city: "Rosario", country: "AR", latitude: -32.9468, longitude: -60.6393, population: 1276000 },

  // South Africa
  { city: "Johannesburg", country: "ZA", latitude: -26.2041, longitude: 28.0473, population: 5635127 },
  { city: "Cape Town", country: "ZA", latitude: -33.9249, longitude: 18.4241, population: 4430367 },
  { city: "Durban", country: "ZA", latitude: -29.8587, longitude: 31.0218, population: 3442361 },
  { city: "Pretoria", country: "ZA", latitude: -25.7479, longitude: 28.2293, population: 2921488 },

  // Egypt
  { city: "Cairo", country: "EG", latitude: 30.0444, longitude: 31.2357, population: 20901000 },
  { city: "Alexandria", country: "EG", latitude: 31.2001, longitude: 29.9187, population: 5200000 },
  { city: "Giza", country: "EG", latitude: 30.0131, longitude: 31.2089, population: 8800000 },

  // Turkey
  { city: "Istanbul", country: "TR", latitude: 41.0082, longitude: 28.9784, population: 15462000 },
  { city: "Ankara", country: "TR", latitude: 39.9334, longitude: 32.8597, population: 5663000 },
  { city: "Izmir", country: "TR", latitude: 38.4237, longitude: 27.1428, population: 4367000 },

  // Saudi Arabia
  { city: "Riyadh", country: "SA", latitude: 24.7136, longitude: 46.6753, population: 7676654 },
  { city: "Jeddah", country: "SA", latitude: 21.4858, longitude: 39.1925, population: 4697000 },
  { city: "Mecca", country: "SA", latitude: 21.3891, longitude: 39.8579, population: 2078766 },

  // UAE
  { city: "Dubai", country: "AE", latitude: 25.2048, longitude: 55.2708, population: 3331420 },
  { city: "Abu Dhabi", country: "AE", latitude: 24.4539, longitude: 54.3773, population: 1482816 },

  // Singapore
  { city: "Singapore", country: "SG", latitude: 1.3521, longitude: 103.8198, population: 5685807 },

  // Indonesia
  { city: "Jakarta", country: "ID", latitude: -6.2088, longitude: 106.8456, population: 10562088 },
  { city: "Surabaya", country: "ID", latitude: -7.2575, longitude: 112.7521, population: 2874699 },
  { city: "Bandung", country: "ID", latitude: -6.9175, longitude: 107.6191, population: 2575478 },

  // Philippines
  { city: "Manila", country: "PH", latitude: 14.5995, longitude: 120.9842, population: 1780148 },
  { city: "Quezon City", country: "PH", latitude: 14.6760, longitude: 121.0437, population: 2960048 },
  { city: "Davao City", country: "PH", latitude: 7.1907, longitude: 125.4553, population: 1776949 },

  // Thailand
  { city: "Bangkok", country: "TH", latitude: 13.7563, longitude: 100.5018, population: 10539000 },
  { city: "Chiang Mai", country: "TH", latitude: 18.7883, longitude: 98.9853, population: 174235 },

  // Vietnam
  { city: "Ho Chi Minh City", country: "VN", latitude: 10.8231, longitude: 106.6297, population: 9000000 },
  { city: "Hanoi", country: "VN", latitude: 21.0285, longitude: 105.8542, population: 8053663 },

  // Malaysia
  { city: "Kuala Lumpur", country: "MY", latitude: 3.1390, longitude: 101.6869, population: 1768000 },

  // New Zealand
  { city: "Auckland", country: "NZ", latitude: -36.8485, longitude: 174.7633, population: 1657200 },
  { city: "Wellington", country: "NZ", latitude: -41.2865, longitude: 174.7762, population: 415000 },

  // Netherlands
  { city: "Amsterdam", country: "NL", latitude: 52.3676, longitude: 4.9041, population: 872680 },
  { city: "Rotterdam", country: "NL", latitude: 51.9225, longitude: 4.4792, population: 651446 },
  { city: "The Hague", country: "NL", latitude: 52.0705, longitude: 4.3007, population: 545163 },

  // Belgium
  { city: "Brussels", country: "BE", latitude: 50.8503, longitude: 4.3517, population: 1208542 },

  // Switzerland
  { city: "Zurich", country: "CH", latitude: 47.3769, longitude: 8.5417, population: 421878 },
  { city: "Geneva", country: "CH", latitude: 46.2044, longitude: 6.1432, population: 201818 },

  // Sweden
  { city: "Stockholm", country: "SE", latitude: 59.3293, longitude: 18.0686, population: 975904 },

  // Norway
  { city: "Oslo", country: "NO", latitude: 59.9139, longitude: 10.7522, population: 697010 },

  // Denmark
  { city: "Copenhagen", country: "DK", latitude: 55.6761, longitude: 12.5683, population: 794128 },

  // Poland
  { city: "Warsaw", country: "PL", latitude: 52.2297, longitude: 21.0122, population: 1793579 },
  { city: "Krakow", country: "PL", latitude: 50.0647, longitude: 19.9450, population: 779966 },

  // Austria
  { city: "Vienna", country: "AT", latitude: 48.2082, longitude: 16.3738, population: 1920949 },

  // Czech Republic
  { city: "Prague", country: "CZ", latitude: 50.0755, longitude: 14.4378, population: 1324277 },

  // Portugal
  { city: "Lisbon", country: "PT", latitude: 38.7223, longitude: -9.1393, population: 504718 },
  { city: "Porto", country: "PT", latitude: 41.1579, longitude: -8.6291, population: 231962 },

  // Greece
  { city: "Athens", country: "GR", latitude: 37.9838, longitude: 23.7275, population: 664046 },

  // Chile
  { city: "Santiago", country: "CL", latitude: -33.4489, longitude: -70.6693, population: 7026000 },

  // Colombia
  { city: "Bogotá", country: "CO", latitude: 4.7110, longitude: -74.0721, population: 11167392 },
  { city: "Medellín", country: "CO", latitude: 6.2442, longitude: -75.5812, population: 2569007 },

  // Peru
  { city: "Lima", country: "PE", latitude: -12.0464, longitude: -77.0428, population: 10719188 },

  // Nigeria
  { city: "Lagos", country: "NG", latitude: 6.5244, longitude: 3.3792, population: 14862000 },
  { city: "Abuja", country: "NG", latitude: 9.0579, longitude: 7.4951, population: 3652000 },

  // Kenya
  { city: "Nairobi", country: "KE", latitude: -1.2921, longitude: 36.8219, population: 4397073 },

  // Pakistan
  { city: "Karachi", country: "PK", latitude: 24.8607, longitude: 67.0011, population: 15741000 },
  { city: "Lahore", country: "PK", latitude: 31.5204, longitude: 74.3587, population: 11126285 },
  { city: "Islamabad", country: "PK", latitude: 33.6844, longitude: 73.0479, population: 1095064 },

  // Bangladesh
  { city: "Dhaka", country: "BD", latitude: 23.8103, longitude: 90.4125, population: 21005860 },

  // Israel
  { city: "Tel Aviv", country: "IL", latitude: 32.0853, longitude: 34.7818, population: 460613 },
  { city: "Jerusalem", country: "IL", latitude: 31.7683, longitude: 35.2137, population: 936425 },

  // Iran
  { city: "Tehran", country: "IR", latitude: 35.6892, longitude: 51.3890, population: 9134000 },

  // Iraq
  { city: "Baghdad", country: "IQ", latitude: 33.3152, longitude: 44.3661, population: 7216000 },
];

/**
 * Find city coordinates by city name and country code
 */
export function findCityCoordinates(cityName: string, countryCode: string): CityCoordinate | undefined {
  return citiesCoordinates.find(
    city => city.city.toLowerCase() === cityName.toLowerCase() && city.country === countryCode
  );
}

/**
 * Get all cities for a specific country
 */
export function getCitiesByCountry(countryCode: string): CityCoordinate[] {
  return citiesCoordinates.filter(city => city.country === countryCode);
}

/**
 * Get countries that have city data available
 */
export function getAvailableCountries(): string[] {
  return Array.from(new Set(citiesCoordinates.map(city => city.country))).sort();
}
