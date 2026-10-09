/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Calculate great-circle distance between two coordinates using the Haversine formula.
 * Returns distance in kilometers (approximate straight-line distance).
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Standard demo locations in Mumbai metropolitan area for realistic simulation.
 */
export interface NamedCoordinate {
  name: string;
  lat: number;
  lng: number;
  areaLabel: string;
}

export const PRESET_MUMBAI_AREAS: NamedCoordinate[] = [
  { name: 'Bandra West (Lilavati / Bhabha)', lat: 19.0544, lng: 72.8402, areaLabel: 'Bandra West' },
  { name: 'Andheri West (Lokhandwala / RGIT)', lat: 19.1363, lng: 72.8277, areaLabel: 'Andheri West' },
  { name: 'Parel (KEM / Tata Memorial)', lat: 19.0034, lng: 72.8427, areaLabel: 'Parel' },
  { name: 'Dadar Central', lat: 19.0178, lng: 72.8478, areaLabel: 'Dadar' },
  { name: 'Powai (Hiranandani / IIT)', lat: 19.1176, lng: 72.9060, areaLabel: 'Powai' },
  { name: 'South Mumbai (Fort / CST / Red Cross)', lat: 18.9322, lng: 72.8347, areaLabel: 'Fort, South Mumbai' },
  { name: 'Navi Mumbai (Vashi Sector 14)', lat: 19.0771, lng: 72.9986, areaLabel: 'Vashi, Navi Mumbai' },
];

/**
 * Generates an external directions link without fabricating road geometry or turn times.
 */
export function getExternalDirectionsUrl(
  destinationLat: number,
  destinationLng: number,
  originLat?: number,
  originLng?: number
): string {
  if (originLat !== undefined && originLng !== undefined) {
    return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${originLat}%2C${originLng}%3B${destinationLat}%2C${destinationLng}`;
  }
  return `https://www.openstreetmap.org/?mlat=${destinationLat}&mlon=${destinationLng}#map=16/${destinationLat}/${destinationLng}`;
}

export function getGoogleMapsUrl(lat: number, lng: number, placeName?: string): string {
  const query = placeName ? encodeURIComponent(`${placeName}, Mumbai`) : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
