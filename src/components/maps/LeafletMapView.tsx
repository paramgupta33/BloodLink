/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getMapTileConfig } from '../../utils/mapConfig';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  type: 'hospital' | 'centre' | 'donor' | 'camp' | 'user';
  status?: 'critical' | 'low' | 'stable' | 'active' | 'notified' | 'accepted' | 'available' | 'unavailable';
  badge?: string;
  popupContent?: React.ReactNode | string;
  isDraggable?: boolean;
}

export interface MapCircle {
  id: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  dashArray?: string;
  label?: string;
}

export interface MapPolyline {
  id: string;
  positions: [number, number][];
  color?: string;
  weight?: number;
  opacity?: number;
  dashArray?: string;
  label?: string;
}

interface LeafletMapViewProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  markers?: MapMarker[];
  selectedMarkerId?: string | null;
  onSelectMarker?: (markerId: string) => void;
  circles?: MapCircle[];
  polylines?: MapPolyline[];
  onMapClick?: (lat: number, lng: number) => void;
  autoFit?: boolean;
  legend?: React.ReactNode;
  attributionPrefix?: string;
  className?: string;
}

// Generate clean SVG custom icons without external asset dependency
function createCustomMarkerIcon(
  type: MapMarker['type'],
  status?: MapMarker['status'],
  isSelected = false
): L.DivIcon {
  let bgColor = '#4cd7f6';
  let textColor = '#003640';
  let iconSvg = '';

  if (type === 'hospital') {
    bgColor = status === 'critical' ? '#ff5451' : '#ffb3ad';
    textColor = '#5c0008';
    // Hospital cross SVG
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
      </svg>`;
  } else if (type === 'centre') {
    bgColor = status === 'critical' ? '#ff5451' : status === 'low' ? '#4cd7f6' : '#4edea3';
    textColor = status === 'critical' ? '#5c0008' : status === 'low' ? '#003640' : '#003824';
    // Blood drop SVG
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
      </svg>`;
  } else if (type === 'donor') {
    bgColor = status === 'accepted' ? '#00a572' : status === 'notified' ? '#4cd7f6' : '#4edea3';
    textColor = '#003824';
    // Person SVG
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>`;
  } else if (type === 'camp') {
    bgColor = '#ffc107';
    textColor = '#3e2723';
    // Event / tent SVG
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
      </svg>`;
  } else if (type === 'user') {
    bgColor = '#4cd7f6';
    textColor = '#003640';
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="6"/>
      </svg>`;
  }

  const pulseRing =
    status === 'critical' || isSelected
      ? `<div style="position: absolute; inset: -6px; border-radius: 9999px; background-color: ${bgColor}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
      : '';

  const scale = isSelected ? 'scale(1.2)' : 'scale(1)';
  const border = isSelected ? '3px solid #ffffff' : '2px solid rgba(15, 19, 29, 0.8)';

  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: ${scale}; transition: transform 0.2s ease;">
      ${pulseRing}
      <div style="width: 34px; height: 34px; border-radius: 50%; background-color: ${bgColor}; color: ${textColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.6); border: ${border};">
        ${iconSvg}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'bloodlink-custom-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });
}

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  center = [19.0544, 72.8402],
  zoom = 12,
  height = '400px',
  markers = [],
  selectedMarkerId = null,
  onSelectMarker,
  circles = [],
  polylines = [],
  onMapClick,
  autoFit = false,
  legend,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);
  const polylinesLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;

    // Check if map already exists on this container
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    mapRef.current = map;

    // Standard OpenStreetMap tile service (No API key required)
    const tileConfig = getMapTileConfig();

    const baseTileLayer = L.tileLayer(tileConfig.tileUrl, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
      minZoom: tileConfig.minZoom,
    });

    baseTileLayer.addTo(map);

    // Create Layer Groups
    circlesLayerRef.current = L.layerGroup().addTo(map);
    polylinesLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Map click handler
    if (onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    // Force map resize after container renders
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Center & Zoom when props change (if not dragging)
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.invalidateSize();
  }, [center, zoom]);

  // Update Circles (e.g. Geofence Rings)
  useEffect(() => {
    if (!circlesLayerRef.current) return;
    circlesLayerRef.current.clearLayers();

    circles.forEach((c) => {
      const circle = L.circle([c.lat, c.lng], {
        radius: c.radiusMeters,
        color: c.color || '#4cd7f6',
        weight: 1.5,
        fillColor: c.fillColor || c.color || '#4cd7f6',
        fillOpacity: c.fillOpacity !== undefined ? c.fillOpacity : 0.08,
        dashArray: c.dashArray || '4, 4',
      });

      if (c.label) {
        circle.bindTooltip(c.label, {
          permanent: false,
          direction: 'top',
          className: 'bloodlink-circle-tooltip',
        });
      }

      circle.addTo(circlesLayerRef.current!);
    });
  }, [circles]);

  // Update Polylines (e.g. Courier Transit Routes)
  useEffect(() => {
    if (!polylinesLayerRef.current) return;
    polylinesLayerRef.current.clearLayers();

    polylines.forEach((p) => {
      if (!p.positions || p.positions.length < 2) return;

      const polyline = L.polyline(p.positions, {
        color: p.color || '#4cd7f6',
        weight: p.weight || 3.5,
        opacity: p.opacity !== undefined ? p.opacity : 0.85,
        dashArray: p.dashArray,
      });

      if (p.label) {
        polyline.bindTooltip(p.label, {
          sticky: true,
          className: 'bloodlink-circle-tooltip',
        });
      }

      polyline.addTo(polylinesLayerRef.current!);
    });
  }, [polylines]);

  // Update Markers
  useEffect(() => {
    if (!markersLayerRef.current || !mapRef.current) return;
    markersLayerRef.current.clearLayers();

    const latLngBounds: L.LatLngExpression[] = [];

    markers.forEach((m) => {
      if (typeof m.lat !== 'number' || typeof m.lng !== 'number' || isNaN(m.lat) || isNaN(m.lng)) {
        return;
      }

      const isSelected = selectedMarkerId === m.id;
      const icon = createCustomMarkerIcon(m.type, m.status, isSelected);

      const marker = L.marker([m.lat, m.lng], {
        icon,
        draggable: !!m.isDraggable,
      });

      latLngBounds.push([m.lat, m.lng]);

      // Click handler
      marker.on('click', () => {
        if (onSelectMarker) {
          onSelectMarker(m.id);
        }
      });

      // Draggable listener for updating centre locations
      if (m.isDraggable && onMapClick) {
        marker.on('dragend', (e) => {
          const newPos = (e.target as L.Marker).getLatLng();
          onMapClick(newPos.lat, newPos.lng);
        });
      }

      // Compact Popup
      const statusBadge =
        m.status === 'critical'
          ? '<span style="color: #ff5451; font-weight: bold; font-size: 10px; background: rgba(255,84,81,0.15); padding: 1px 6px; border-radius: 9999px;">CRITICAL</span>'
          : m.status === 'low'
          ? '<span style="color: #4cd7f6; font-weight: bold; font-size: 10px; background: rgba(76,215,246,0.15); padding: 1px 6px; border-radius: 9999px;">LOW STOCK</span>'
          : m.status === 'accepted'
          ? '<span style="color: #4edea3; font-weight: bold; font-size: 10px; background: rgba(78,222,163,0.15); padding: 1px 6px; border-radius: 9999px;">ACCEPTED</span>'
          : m.badge
          ? `<span style="color: #4cd7f6; font-size: 10px; background: #262a35; padding: 1px 6px; border-radius: 9999px;">${m.badge}</span>`
          : '';

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; min-width: 170px;">
          <div style="display: flex; align-items: start; justify-content: space-between; gap: 8px;">
            <strong style="color: #ffffff; font-size: 13px; font-weight: 700;">${m.title}</strong>
            ${statusBadge}
          </div>
          ${
            m.subtitle
              ? `<div style="color: rgba(223, 226, 241, 0.7); font-size: 11px; margin-top: 3px;">${m.subtitle}</div>`
              : ''
          }
          <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #262a35; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: rgba(223, 226, 241, 0.6); font-family: monospace;">
            <span>${m.lat.toFixed(4)}, ${m.lng.toFixed(4)}</span>
            <span style="color: #4cd7f6;">Click to view</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        autoPan: true,
      });

      if (isSelected) {
        setTimeout(() => {
          marker.openPopup();
        }, 50);
      }

      marker.addTo(markersLayerRef.current!);
    });

    // Auto-fit if requested and markers exist
    if (autoFit && latLngBounds.length > 0 && mapRef.current) {
      try {
        const bounds = L.latLngBounds(latLngBounds);
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch {
        // Safe fallback
      }
    }
  }, [markers, selectedMarkerId, autoFit]);

  // Handle selectedMarkerId changes by panning
  useEffect(() => {
    if (!selectedMarkerId || !mapRef.current) return;
    const targetMarker = markers.find((m) => m.id === selectedMarkerId);
    if (targetMarker && !isNaN(targetMarker.lat) && !isNaN(targetMarker.lng)) {
      mapRef.current.panTo([targetMarker.lat, targetMarker.lng], { animate: true });
    }
  }, [selectedMarkerId]);

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#171b26] border border-[#262a35] overflow-hidden shadow-lg ${className}`}
      style={{ height }}
    >
      <div ref={containerRef} className="w-full h-full" />

      {/* Map Legend (if provided) */}
      {legend && (
        <div className="absolute bottom-2 left-2 right-2 sm:right-auto sm:max-w-md z-[400] bg-[#0f131d]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#262a35] text-xs font-mono">
          {legend}
        </div>
      )}

      {/* Quick Reset View Button */}
      <div className="absolute top-2 right-2 z-[400] flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.setView(center, zoom, { animate: true });
            }
          }}
          title="Reset Map View"
          className="p-1.5 rounded-lg bg-[#171b26]/90 hover:bg-[#262a35] border border-[#262a35] text-[#dfe2f1]/80 hover:text-white shadow-md text-xs cursor-pointer flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[15px]">my_location</span>
          <span className="text-[10px] font-mono hidden sm:inline">Center</span>
        </button>
      </div>
    </div>
  );
};
