import { Audio } from 'expo-av';
import { Recording } from 'expo-av/build/Audio';

export class VoiceRecognitionService {
  private static instance: VoiceRecognitionService;
  private isRecording: boolean = false;
  private recording: Recording | null = null;
  private onRecordingFinished?: (uri: string) => void;

  private constructor() {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
  }

  public static getInstance(): VoiceRecognitionService {
    if (!VoiceRecognitionService.instance) {
      VoiceRecognitionService.instance = new VoiceRecognitionService();
    }
    return VoiceRecognitionService.instance;
  }

  public async startRecording(callback: (uri: string) => void): Promise<void> {
    if (this.isRecording) {
      await this.stopRecording();
    }

    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access microphone was denied');
      }

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      this.isRecording = true;
      this.onRecordingFinished = callback;
      await this.recording.startAsync();
      
      // Arrêt automatique après 10 secondes
      setTimeout(() => {
        if (this.isRecording) {
          this.stopRecording();
        }
      }, 10000);

    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw error;
    }
  }

  public async stopRecording(): Promise<void> {
    if (this.isRecording && this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        this.isRecording = false;
        
        if (uri && this.onRecordingFinished) {
          this.onRecordingFinished(uri);
        }
        
        this.recording = null;
        this.onRecordingFinished = undefined;
      } catch (error) {
        console.error('Error stopping audio recording:', error);
        throw error;
      }
    }
  }

  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  public async destroy(): Promise<void> {
    await this.stopRecording();
  }
} 