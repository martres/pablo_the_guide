import { Audio } from 'expo-av';
import { Recording } from 'expo-av/build/Audio';

export class AudioStreamService {
  private static instance: AudioStreamService;
  private recording: Recording | null = null;
  private isRecording: boolean = false;
  private onAudioData: ((data: Uint8Array) => void) | null = null;

  private constructor() {}

  public static getInstance(): AudioStreamService {
    if (!AudioStreamService.instance) {
      AudioStreamService.instance = new AudioStreamService();
    }
    return AudioStreamService.instance;
  }

  /**
   * Set callback for audio data
   * @param callback - Function to call when audio data is available
   */
  public setAudioDataCallback(callback: (data: Uint8Array) => void) {
    this.onAudioData = callback;
  }

  /**
   * Start recording and streaming audio
   * @returns Promise<boolean> - true if recording started successfully
   */
  public async startStreaming(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access microphone was denied');
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;

      // Start periodic audio data collection
      this.startAudioDataCollection();

      return true;
    } catch (error) {
      console.error('Error starting audio stream:', error);
      return false;
    }
  }

  private startAudioDataCollection() {
    // This is a placeholder for actual audio data collection
    // In a real implementation, you would use the recording's onRecordingStatusUpdate
    // to get audio data and send it to the callback
    if (this.recording) {
      this.recording.setOnRecordingStatusUpdate((status) => {
        if (this.onAudioData && status.isRecording) {
          // Convert audio data to Uint8Array and send to callback
          // This is a simplified example - actual implementation would depend on your needs
          const audioData = new Uint8Array(1024); // Placeholder
          this.onAudioData(audioData);
        }
      });
    }
  }

  /**
   * Stop recording and streaming
   * @returns Promise<string | null> - URI of the recorded audio or null if failed
   */
  public async stopStreaming(): Promise<string | null> {
    if (!this.recording) return null;

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      this.isRecording = false;
      return uri;
    } catch (error) {
      console.error('Error stopping audio stream:', error);
      return null;
    }
  }

  /**
   * Check if currently streaming
   * @returns boolean
   */
  public isCurrentlyStreaming(): boolean {
    return this.isRecording;
  }
} 