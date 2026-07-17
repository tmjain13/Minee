import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface City {
  name: string;
  lat: number;
  lng: number;
  region: string;
  country: string;
}

export const DELHI_DEFAULT: City = {
  name: "Delhi",
  lat: 28.6139,
  lng: 77.2090,
  region: "Delhi",
  country: "India"
};

interface LocationContextType {
  activeCity: City;
  setActiveCity: (city: City) => void;
  isDefault: boolean;
  setDefaultCity: (city: City) => void;
  showLocationModal: boolean;
  setShowLocationModal: (show: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [activeCity, setActiveCityState] = useState<City>(() => {
    const savedPanchang = localStorage.getItem('panchangDefaultCity');
    if (savedPanchang) {
      try {
        const parsed = JSON.parse(savedPanchang);
        if (parsed && parsed.name && parsed.lat && parsed.lng) {
          return parsed;
        }
      } catch (e) {}
    }
    const savedDefault = localStorage.getItem('default-location');
    if (savedDefault) {
      try {
        const parsed = JSON.parse(savedDefault);
        if (parsed && parsed.name && parsed.lat && parsed.lng) {
          return {
            name: parsed.name.split(',')[0],
            lat: parsed.lat,
            lng: parsed.lng,
            region: parsed.name.split(',')[1]?.trim() || '',
            country: parsed.name.split(',')[2]?.trim() || 'India'
          };
        }
      } catch (e) {}
    }
    return DELHI_DEFAULT;
  });

  const [isDefault, setIsDefault] = useState<boolean>(() => {
    const savedPanchang = localStorage.getItem('panchangDefaultCity');
    if (savedPanchang) {
      try {
        const parsed = JSON.parse(savedPanchang);
        return parsed.name === DELHI_DEFAULT.name && parsed.lat === DELHI_DEFAULT.lat;
      } catch (e) {}
    }
    return true;
  });

  const [showLocationModal, setShowLocationModal] = useState(false);

  const setActiveCity = (city: City) => {
    setActiveCityState(city);
    // Sync with legacy 'default-location'
    localStorage.setItem('default-location', JSON.stringify({
      lat: city.lat,
      lng: city.lng,
      name: `${city.name}, ${city.region}, ${city.country}`
    }));

    // Check if it's default
    const savedPanchang = localStorage.getItem('panchangDefaultCity');
    if (savedPanchang) {
      try {
        const parsed = JSON.parse(savedPanchang);
        setIsDefault(parsed.name === city.name && parsed.lat === city.lat);
      } catch (e) {
        setIsDefault(city.name === DELHI_DEFAULT.name && city.lat === DELHI_DEFAULT.lat);
      }
    } else {
      setIsDefault(city.name === DELHI_DEFAULT.name && city.lat === DELHI_DEFAULT.lat);
    }
  };

  const setDefaultCity = (city: City) => {
    localStorage.setItem('panchangDefaultCity', JSON.stringify(city));
    setIsDefault(true);
    setActiveCity(city);
  };

  return (
    <LocationContext.Provider value={{
      activeCity,
      setActiveCity,
      isDefault,
      setDefaultCity,
      showLocationModal,
      setShowLocationModal
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
