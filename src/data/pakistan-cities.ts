/**
 * Pakistan Cities Coordinates Database
 * Comprehensive list of major cities in Pakistan with geographic coordinates
 * Format: [longitude, latitude] for react-simple-maps
 */

export interface PakistanCity {
  name: string;
  latitude: number;
  longitude: number;
  province: string;
  population?: number;
}

export const pakistanCities: PakistanCity[] = [
  // Punjab Province (Most populous)
  { name: "Lahore", latitude: 31.5204, longitude: 74.3587, province: "Punjab", population: 11126285 },
  { name: "Faisalabad", latitude: 31.4504, longitude: 73.1350, province: "Punjab", population: 3203846 },
  { name: "Rawalpindi", latitude: 33.5651, longitude: 73.0169, province: "Punjab", population: 2098231 },
  { name: "Multan", latitude: 30.1575, longitude: 71.5249, province: "Punjab", population: 1871843 },
  { name: "Gujranwala", latitude: 32.1877, longitude: 74.1945, province: "Punjab", population: 2027001 },
  { name: "Sialkot", latitude: 32.4972, longitude: 74.5361, province: "Punjab", population: 655852 },
  { name: "Bahawalpur", latitude: 29.3956, longitude: 71.6722, province: "Punjab", population: 762111 },
  { name: "Sargodha", latitude: 32.0836, longitude: 72.6711, province: "Punjab", population: 659862 },
  { name: "Sheikhupura", latitude: 31.7167, longitude: 73.9850, province: "Punjab", population: 473129 },
  { name: "Jhang", latitude: 31.2681, longitude: 72.3181, province: "Punjab", population: 414131 },
  { name: "Gujrat", latitude: 32.5742, longitude: 74.0789, province: "Punjab", population: 390533 },
  { name: "Sahiwal", latitude: 30.6704, longitude: 73.1080, province: "Punjab", population: 308574 },
  { name: "Kasur", latitude: 31.1167, longitude: 74.4500, province: "Punjab", population: 314617 },
  { name: "Rahim Yar Khan", latitude: 28.4202, longitude: 70.2952, province: "Punjab", population: 353203 },
  { name: "Okara", latitude: 30.8081, longitude: 73.4450, province: "Punjab", population: 302274 },
  { name: "Dera Ghazi Khan", latitude: 30.0489, longitude: 70.6345, province: "Punjab", population: 464742 },
  { name: "Chiniot", latitude: 31.7292, longitude: 72.9781, province: "Punjab", population: 219254 },
  { name: "Jhelum", latitude: 32.9425, longitude: 73.7257, province: "Punjab", population: 188803 },
  { name: "Mandi Bahauddin", latitude: 32.5861, longitude: 73.4917, province: "Punjab", population: 157352 },
  { name: "Khanewal", latitude: 30.3017, longitude: 71.9321, province: "Punjab", population: 163368 },
  { name: "Hafizabad", latitude: 32.0709, longitude: 73.6879, province: "Punjab", population: 165936 },
  { name: "Muzaffargarh", latitude: 30.0703, longitude: 71.1933, province: "Punjab", population: 163268 },
  { name: "Khanpur", latitude: 28.6467, longitude: 70.6556, province: "Punjab", population: 160308 },
  { name: "Gojra", latitude: 31.1492, longitude: 72.6833, province: "Punjab", population: 157863 },
  { name: "Mianwali", latitude: 32.5853, longitude: 71.5436, province: "Punjab", population: 156716 },
  { name: "Chakwal", latitude: 32.9328, longitude: 72.8630, province: "Punjab", population: 113524 },
  { name: "Attock", latitude: 33.7669, longitude: 72.3600, province: "Punjab", population: 107606 },

  // Sindh Province
  { name: "Karachi", latitude: 24.8607, longitude: 67.0011, province: "Sindh", population: 15741000 },
  { name: "Hyderabad", latitude: 25.3960, longitude: 68.3578, province: "Sindh", population: 1732693 },
  { name: "Sukkur", latitude: 27.7052, longitude: 68.8574, province: "Sindh", population: 499900 },
  { name: "Larkana", latitude: 27.5590, longitude: 68.2123, province: "Sindh", population: 490508 },
  { name: "Nawabshah", latitude: 26.2442, longitude: 68.4100, province: "Sindh", population: 229504 },
  { name: "Mirpur Khas", latitude: 25.5276, longitude: 69.0111, province: "Sindh", population: 236961 },
  { name: "Jacobabad", latitude: 28.2769, longitude: 68.4514, province: "Sindh", population: 200815 },
  { name: "Shikarpur", latitude: 27.9556, longitude: 68.6383, province: "Sindh", population: 155621 },
  { name: "Dadu", latitude: 26.7309, longitude: 67.7759, province: "Sindh", population: 151500 },
  { name: "Khairpur", latitude: 27.5295, longitude: 68.7592, province: "Sindh", population: 231016 },
  { name: "Thatta", latitude: 24.7471, longitude: 67.9245, province: "Sindh", population: 220000 },
  { name: "Badin", latitude: 24.6559, longitude: 68.8371, province: "Sindh", population: 136000 },
  { name: "Tando Adam", latitude: 25.7697, longitude: 68.6633, province: "Sindh", population: 109312 },
  { name: "Sanghar", latitude: 26.0465, longitude: 68.9481, province: "Sindh", population: 140300 },

  // Khyber Pakhtunkhwa
  { name: "Peshawar", latitude: 34.0151, longitude: 71.5249, province: "Khyber Pakhtunkhwa", population: 1970042 },
  { name: "Mardan", latitude: 34.1958, longitude: 72.0447, province: "Khyber Pakhtunkhwa", population: 358604 },
  { name: "Mingora", latitude: 34.7794, longitude: 72.3600, province: "Khyber Pakhtunkhwa", population: 331091 },
  { name: "Abbottabad", latitude: 34.1495, longitude: 73.1995, province: "Khyber Pakhtunkhwa", population: 148587 },
  { name: "Kohat", latitude: 33.5869, longitude: 71.4414, province: "Khyber Pakhtunkhwa", population: 151427 },
  { name: "Dera Ismail Khan", latitude: 31.8314, longitude: 70.9017, province: "Khyber Pakhtunkhwa", population: 236093 },
  { name: "Mansehra", latitude: 34.3300, longitude: 73.1967, province: "Khyber Pakhtunkhwa", population: 109000 },
  { name: "Swabi", latitude: 34.1201, longitude: 72.4697, province: "Khyber Pakhtunkhwa", population: 104420 },
  { name: "Nowshera", latitude: 34.0153, longitude: 71.9747, province: "Khyber Pakhtunkhwa", population: 89428 },
  { name: "Bannu", latitude: 32.9889, longitude: 70.6056, province: "Khyber Pakhtunkhwa", population: 74875 },
  { name: "Charsadda", latitude: 34.1483, longitude: 71.7308, province: "Khyber Pakhtunkhwa", population: 105414 },
  { name: "Haripur", latitude: 33.9944, longitude: 72.9347, province: "Khyber Pakhtunkhwa", population: 62617 },

  // Balochistan
  { name: "Quetta", latitude: 30.1798, longitude: 66.9750, province: "Balochistan", population: 1001205 },
  { name: "Turbat", latitude: 26.0041, longitude: 63.0438, province: "Balochistan", population: 198418 },
  { name: "Khuzdar", latitude: 27.8119, longitude: 66.6428, province: "Balochistan", population: 141227 },
  { name: "Hub", latitude: 25.1153, longitude: 66.7572, province: "Balochistan", population: 58000 },
  { name: "Sibi", latitude: 29.5430, longitude: 67.8772, province: "Balochistan", population: 52100 },
  { name: "Gwadar", latitude: 25.1264, longitude: 62.3225, province: "Balochistan", population: 85096 },
  { name: "Chaman", latitude: 30.9236, longitude: 66.4519, province: "Balochistan", population: 107660 },
  { name: "Zhob", latitude: 31.3417, longitude: 69.4486, province: "Balochistan", population: 88356 },
  { name: "Dera Murad Jamali", latitude: 28.5469, longitude: 68.2181, province: "Balochistan", population: 82828 },
  { name: "Loralai", latitude: 30.3703, longitude: 68.5978, province: "Balochistan", population: 59369 },

  // Islamabad Capital Territory
  { name: "Islamabad", latitude: 33.6844, longitude: 73.0479, province: "Islamabad Capital Territory", population: 1095064 },

  // Azad Jammu & Kashmir
  { name: "Muzaffarabad", latitude: 34.3700, longitude: 73.4711, province: "Azad Kashmir", population: 147600 },
  { name: "Mirpur", latitude: 33.1456, longitude: 73.7517, province: "Azad Kashmir", population: 124352 },
  { name: "Rawalakot", latitude: 33.8578, longitude: 73.7606, province: "Azad Kashmir", population: 60200 },
  { name: "Kotli", latitude: 33.5181, longitude: 73.9019, province: "Azad Kashmir", population: 54480 },

  // Gilgit-Baltistan
  { name: "Gilgit", latitude: 35.9208, longitude: 74.3144, province: "Gilgit-Baltistan", population: 216760 },
  { name: "Skardu", latitude: 35.2976, longitude: 75.6333, province: "Gilgit-Baltistan", population: 25000 },
  { name: "Chilas", latitude: 35.4211, longitude: 74.0961, province: "Gilgit-Baltistan", population: 15000 },
];

/**
 * Find city by name (case-insensitive)
 */
export function findPakistanCity(cityName: string): PakistanCity | undefined {
  const normalized = cityName.toLowerCase().trim();
  return pakistanCities.find(city => city.name.toLowerCase() === normalized);
}

/**
 * Get cities by province
 */
export function getCitiesByProvince(province: string): PakistanCity[] {
  return pakistanCities.filter(city => city.province === province);
}

/**
 * Get all provinces
 */
export function getAllProvinces(): string[] {
  return Array.from(new Set(pakistanCities.map(city => city.province))).sort();
}

/**
 * Get top N cities by population
 */
export function getTopCitiesByPopulation(limit: number = 10): PakistanCity[] {
  return [...pakistanCities]
    .filter(city => city.population)
    .sort((a, b) => (b.population || 0) - (a.population || 0))
    .slice(0, limit);
}
