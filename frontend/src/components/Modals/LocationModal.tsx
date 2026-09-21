import React, { useState } from 'react';
import { MapPin, Search, Navigation, X, Check, Globe } from 'lucide-react';
import { LocationInfo } from '../../types/weather';
import { geocodeCityOnline } from '../../services/weatherService';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
}

const POPULAR_CITIES: LocationInfo[] = [
  { name: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567 },
  { name: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777 },
  { name: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090 },
  { name: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York', state: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708 },
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation
}) => {
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setIsSearching(true);
    setGeoError(null);
    const result = await geocodeCityOnline(search.trim());
    setIsSearching(false);

    if (result) {
      setSearchResults([result]);
    } else {
      setSearchResults([]);
      setGeoError(`Could not find "${search}". Please try another city.`);
    }
  };

  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsSearching(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        // Default to GPS coordinates
        const gpsLoc: LocationInfo = {
          name: 'My Location',
          latitude: lat,
          longitude: lon,
          state: 'GPS'
        };
        setIsSearching(false);
        onSelectLocation(gpsLoc);
        onClose();
      },
      (err) => {
        setIsSearching(false);
        setGeoError(`Location access error: ${err.message}`);
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-[#242424] border border-white/10 rounded-3xl p-5 max-w-md w-full shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Select Weather Location</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8e8ea0] hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="mt-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#1c1c1c] border border-white/10 focus-within:border-cyan-500/50">
            <Search className="w-4 h-4 text-[#8e8ea0]" />
            <input
              type="text"
              placeholder="Search any city worldwide (e.g. Pune, London)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-[#8e8ea0] outline-none"
            />
            {isSearching && (
              <span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>
            )}
          </div>
        </form>

        {/* GPS Button */}
        <button
          onClick={handleUseCurrentGPS}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-semibold text-xs transition-colors"
        >
          <Navigation className="w-4 h-4 text-cyan-400" />
          <span>Use Current GPS Coordinates</span>
        </button>

        {geoError && (
          <p className="text-xs text-red-400 mt-2 font-medium">{geoError}</p>
        )}

        {/* Search Result if found */}
        {searchResults.length > 0 && (
          <div className="mt-3">
            <span className="text-[11px] font-semibold text-[#8e8ea0] uppercase tracking-wider">
              Search Result
            </span>
            <div className="mt-1 space-y-1">
              {searchResults.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectLocation(loc);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#2a2a2a] hover:bg-[#343434] text-left text-xs text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{loc.name}, {loc.state || ''} {loc.country}</span>
                  </div>
                  <Check className="w-4 h-4 text-cyan-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Presets */}
        <div className="mt-4">
          <span className="text-[11px] font-semibold text-[#8e8ea0] uppercase tracking-wider">
            Popular Cities
          </span>
          <div className="grid grid-cols-2 gap-1.5 mt-1.5 max-h-48 overflow-y-auto pr-1">
            {POPULAR_CITIES.map((city, idx) => {
              const isSelected = city.name === currentLocation.name;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectLocation(city);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'bg-[#1e1e1e] hover:bg-[#282828] text-gray-200 border border-white/5'
                  }`}
                >
                  <span className="truncate">{city.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
