import { City } from './types';
import { INDIA_CITIES } from './india';
import { USA_CITIES } from './usa';
import { CANADA_CITIES } from './canada';
import { UK_CITIES } from './uk';
import { EUROPE_CITIES } from './europe';
import { ASIA_CITIES } from './asia';
import { AFRICA_CITIES } from './africa';
import { SOUTH_AMERICA_CITIES } from './southAmerica';
import { OCEANIA_CITIES } from './oceania';
import { MIDDLE_EAST_CITIES } from './middleEast';
import { OTHER_CITIES } from './other';

export const OFFLINE_CITIES: City[] = [
  ...INDIA_CITIES,
  ...USA_CITIES,
  ...CANADA_CITIES,
  ...UK_CITIES,
  ...EUROPE_CITIES,
  ...ASIA_CITIES,
  ...AFRICA_CITIES,
  ...SOUTH_AMERICA_CITIES,
  ...OCEANIA_CITIES,
  ...MIDDLE_EAST_CITIES,
  ...OTHER_CITIES,
];

// Sort alphabetically by city name
export const SORTED_CITIES: City[] = [...OFFLINE_CITIES].sort((a, b) =>
  a.name.localeCompare(b.name)
);

export const TOTAL_CITIES = OFFLINE_CITIES.length;

export function getCityByName(name: string): City | undefined {
  const normalized = name.toLowerCase().trim();
  return OFFLINE_CITIES.find(
    (city) => city.name.toLowerCase() === normalized
  );
}

export function searchCities(query: string, limit = 8): City[] {
  const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
  if (!normalized) return [];

  const results: City[] = [];
  
  for (const city of OFFLINE_CITIES) {
    const nameLower = city.name.toLowerCase();
    const regionLower = city.region.toLowerCase();
    const countryLower = city.country.toLowerCase();

    if (
      nameLower.includes(normalized) || 
      regionLower.includes(normalized) || 
      countryLower.includes(normalized)
    ) {
      results.push(city);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}
