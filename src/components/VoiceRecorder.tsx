import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { VoiceRecognitionService } from '../services/VoiceRecognitionService';
import { LocationService, LocationData } from '../services/LocationService';

export const VoiceRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    const locationService = LocationService.getInstance();
    locationService.startLocationUpdates(setLocation).catch((err) => {
      setError('Failed to get location updates');
      console.error(err);
    });

    return () => {
      locationService.stopLocationUpdates();
    };
  }, []);

  const toggleRecording = async () => {
    const voiceService = VoiceRecognitionService.getInstance();
    
    if (!isRecording) {
      try {
        await voiceService.startListening((text) => {
          setSpeechText(text);
        });
        setIsRecording(true);
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } catch (err) {
        setError('Failed to start recording');
        console.error(err);
      }
    } else {
      try {
        await voiceService.stopListening();
        setIsRecording(false);
      } catch (err) {
        setError('Failed to stop recording');
        console.error(err);
      }
    }
  };

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {location && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>
            Latitude: {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Longitude: {location.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={toggleRecording}
        style={styles.recordButtonContainer}
      >
        <Animated.View
          style={[
            styles.recordButton,
            isRecording && styles.recordingButton,
            { transform: [{ scale: scaleAnim }] },
          ]}
        />
      </TouchableOpacity>

      {speechText ? (
        <View style={styles.speechContainer}>
          <Text style={styles.speechText}>{speechText}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  locationContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 4,
  },
  recordButtonContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3B30',
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
    opacity: 0.8,
  },
  speechContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    width: '100%',
  },
  speechText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 10,
  },
}); 