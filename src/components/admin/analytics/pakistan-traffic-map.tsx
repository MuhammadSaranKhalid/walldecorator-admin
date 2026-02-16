"use client";

import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import { scaleSqrt } from "d3-scale";

// Pakistan TopoJSON (we'll use world map but zoom to Pakistan)
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Pakistan's ISO numeric code for highlighting
const PAKISTAN_ISO_NUMERIC = "586";

export interface CityTrafficData {
  city: string;
  latitude: number;
  longitude: number;
  sessions: number;
  province?: string;
}

interface PakistanTrafficMapProps {
  cityData: CityTrafficData[];
  showCities?: boolean;
}

export function PakistanTrafficMap({ cityData = [], showCities = true }: PakistanTrafficMapProps) {
  const [position, setPosition] = useState({
    coordinates: [69.3451, 30.3753] as [number, number], // Center of Pakistan
    zoom: 1
  });
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number } | null>(null);
  const [citiesVisible, setCitiesVisible] = useState(showCities);

  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleMoveEnd = (position: { coordinates: [number, number], zoom: number }) => {
    setPosition(position);
  };

  // City marker size scale
  const cityRadiusScale = useMemo(() => {
    if (cityData.length === 0) return scaleSqrt<number>().domain([0, 1]).range([0, 0]);
    const maxSessions = Math.max(1, ...cityData.map(d => d.sessions));
    return scaleSqrt<number>()
      .domain([0, maxSessions])
      .range([3, 15]); // Larger markers for better visibility
  }, [cityData]);

  // Sort cities by sessions for better visibility (largest on top)
  const sortedCities = useMemo(() => {
    if (!citiesVisible || cityData.length === 0) return [];
    return [...cityData].sort((a, b) => a.sessions - b.sessions); // Draw smallest first, largest last
  }, [cityData, citiesVisible]);

  return (
    <div className="w-full h-[400px] overflow-hidden bg-[#f8f9fa] rounded-xl border border-border relative font-sans">
      {/* Realtime Overview Header */}
      <div className="absolute top-6 left-6 z-10">
        <h2 className="text-xl font-medium text-gray-800 tracking-tight">Realtime overview</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-sm text-gray-500">Updating live</span>
        </div>
      </div>

      {/* Active Users Card */}
      <div className="absolute bottom-6 left-6 z-10 bg-white p-5 rounded-lg shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 w-[320px]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Active users in last 30 minutes</div>
            <div className="text-4xl font-light text-gray-900">
              {cityData.reduce((acc, curr) => acc + curr.sessions, 0).toLocaleString()}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mt-4 mb-1">Active users per minute</div>
            <div className="h-8 flex items-end gap-[2px] mt-2">
              {/* Fake bar chart for visual likeness */}
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-1 bg-blue-100 h-full rounded-t-sm relative overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 w-full bg-blue-500 rounded-t-sm"
                    style={{ height: `${Math.random() * 100}%` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <button
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-600 transition-colors"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-600 transition-colors"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 2500, // Adjusted scale
          center: [71, 30], // Centered slightly better
        }}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#f8f9fa" // Light background
        }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies && geographies.map((geo) => {
                const isPakistan = geo.id === PAKISTAN_ISO_NUMERIC;

                // Render all countries for context, but style Pakistan distinctly if needed
                // For "Google Maps" look, usually land is uniformly colored.
                // We'll highlight Pakistan borders slightly or just keep it uniform.

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#e5e7eb" // gray-200 for land
                    stroke="#ffffff" // white borders
                    strokeWidth={1}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        fill: "#d1d5db", // slightly darker on hover
                        outline: "none",
                      },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* City Markers */}
          {sortedCities.map((city, idx) => {
            // Simplified sizing: Active cities get emphasis
            const isSignificant = city.sessions > 10; // Threshold for visual emphasis
            const radius = 6;

            return (
              <Marker
                key={`${city.city}-${idx}`}
                coordinates={[city.longitude, city.latitude]}
                onMouseEnter={(event) => {
                  setHoveredCity(`${city.city}-${idx}`);
                  const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
                  setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top });
                }}
                onMouseLeave={() => {
                  setHoveredCity(null);
                  setTooltipPosition(null);
                }}
              >
                {/* Pulse Effect for significant traffic */}
                <circle
                  r={radius * 2}
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  className="animate-pulse"
                />

                {/* Main Dot */}
                <circle
                  r={radius}
                  fill="#3b82f6" // Blue-500
                  stroke="#ffffff"
                  strokeWidth={2}
                />

                {/* City Label - Similar to Google Maps styling */}
                <text
                  textAnchor="middle"
                  y={radius + 15} // Position below the marker
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fill: "#374151", // gray-700
                    fontSize: "11px",
                    fontWeight: "600",
                    textShadow: "0px 1px 2px rgba(255,255,255,1)", // halo effect for readability
                    pointerEvents: "none",
                  }}
                >
                  {city.city}
                </text>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* City Tooltip */}
      {hoveredCity && tooltipPosition && (() => {
        const city = sortedCities.find((c, idx) => `${c.city}-${idx}` === hoveredCity);
        if (!city) return null;

        return (
          <div
            className="absolute z-20 bg-white text-gray-800 border border-gray-100 rounded-lg shadow-xl px-4 py-3 pointer-events-none min-w-[150px]"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y - 10}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div className="font-semibold text-sm">{city.city}</div>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
              <span>Active users</span>
              <span className="font-medium text-gray-900">{city.sessions}</span>
            </div>
            {city.province && (
              <div className="text-[10px] text-gray-400 mt-1 pt-1 border-t border-gray-50 uppercase tracking-wide">
                {city.province}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
