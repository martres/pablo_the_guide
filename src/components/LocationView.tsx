import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LocationService, LocationData } from '../services/LocationService';

interface LocationViewProps {
  isActive: boolean;
}

export const LocationView: React.FC<LocationViewProps> = ({ isActive }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const locationService = LocationService.getInstance();

  useEffect(() => {
    let mounted = true;

    const handleLocation = async () => {
      if (isActive) {
        try {
          await locationService.startLocationUpdates((newLocation) => {
            if (mounted) {
              setLocation(newLocation);
            }
          });
        } catch (error) {
          console.error('Location error:', error);
        }
      } else {
        locationService.stopLocationUpdates();
      }
    };

    handleLocation();

    return () => {
      mounted = false;
      locationService.stopLocationUpdates();
    };
  }, [isActive]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location</Text>
      <Text style={styles.coordinates}>
        {location 
          ? `${location.latitude.toFixed(6)}°N\n${location.longitude.toFixed(6)}°E`
          : isActive ? 'Waiting for location...' : 'Location tracking stopped'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E1EFFE',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 16,
    color: '#1E40AF',
    fontWeight: '500',
  },
}); 