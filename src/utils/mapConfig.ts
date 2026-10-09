/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MapTileConfig {
  tileUrl: string;
  fallbackUrl?: string;
  attribution: string;
  subdomains?: string;
  maxZoom: number;
  minZoom: number;
  hasCustomKey?: boolean;
  providerName?: string;
}

/**
 * Standard OpenStreetMap tile service configuration for Leaflet.
 * Uses the official OpenStreetMap tile endpoint without requiring any API key.
 */
export const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * Retrieves the Leaflet tile layer configuration.
 * Uses the standard OpenStreetMap tile service with zero API key requirements.
 */
export function getMapTileConfig(): MapTileConfig {
  return {
    tileUrl: OSM_TILE_URL,
    fallbackUrl: OSM_TILE_URL,
    attribution: OSM_ATTRIBUTION,
    maxZoom: 19,
    minZoom: 3,
    hasCustomKey: false,
    providerName: 'OpenStreetMap',
  };
}

