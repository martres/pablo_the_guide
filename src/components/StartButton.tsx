import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface StartButtonProps {
  onPress: () => void;
  isActive: boolean;
  isLoading?: boolean;
}

export const StartButton: React.FC<StartButtonProps> = ({ 
  onPress, 
  isActive,
  isLoading = false
}) => (
  <TouchableOpacity 
    style={[styles.button, isActive && styles.activeButton]} 
    onPress={onPress}
    disabled={isLoading}
  >
    {isLoading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text style={[styles.text, isActive && styles.activeText]}>
        {isActive ? 'Stop' : 'Start Guide'}
      </Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  activeButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
  },
  activeText: {
    color: '#fff',
  },
}); 