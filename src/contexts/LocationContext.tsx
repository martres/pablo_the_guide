import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocationObject } from 'expo-location';
import { LocationService } from '../services/LocationService';

interface LocationContextType {
  location: LocationObject | null;
  isTracking: boolean;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const locationService = LocationService.getInstance();

  useEffect(() => {
    return () => {
      locationService.stopLocationTracking();
    };
  }, []);

  const startTracking = async () => {
    const success = await locationService.startLocationTracking();
    if (success) {
      setIsTracking(true);
      // Initial location
      setLocation(locationService.getLastLocation());
    }
  };

  const stopTracking = () => {
    locationService.stopLocationTracking();
    setIsTracking(false);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        isTracking,
        startTracking,
        stopTracking,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}; 