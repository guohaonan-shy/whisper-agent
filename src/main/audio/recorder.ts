import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore - no types available
import * as record from 'node-record-lpcm16';
import { AUDIO_CONFIG } from '../../shared/constants';
import { ensureDir, getTempAudioPath } from '../utils/helpers';
import { AudioConfig } from '../../shared/types';

export class AudioRecorder {
  private recording: any = null;
  private isRecording: boolean = false;
  private currentFilePath: string | null = null;
  private audioConfig: AudioConfig;

  constructor() {
    this.audioConfig = {
      sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
      channels: AUDIO_CONFIG.CHANNELS,
      encoding: AUDIO_CONFIG.ENCODING
    };
    
    // Ensure audio directory exists
    ensureDir(path.join(process.cwd(), 'data', 'audio'));
  }

  /**
   * Start recording audio
   */
  startRecording(): string {
    if (this.isRecording) {
      console.log('[AudioRecorder] Already recording');
      return this.currentFilePath!;
    }

    this.currentFilePath = getTempAudioPath();
    console.log(`[AudioRecorder] Starting recording to: ${this.currentFilePath}`);

    try {
      const fileStream = fs.createWriteStream(this.currentFilePath, { encoding: 'binary' });

      this.recording = record.record({
        sampleRate: this.audioConfig.sampleRate,
        channels: this.audioConfig.channels,
        recorder: 'sox', // Use 'sox' on Mac/Linux, 'rec' might also work
        threshold: AUDIO_CONFIG.THRESHOLD,
        silence: AUDIO_CONFIG.SILENCE_DURATION.toString(),
      });

      this.recording.stream()
        .on('error', (err: Error) => {
          console.error('[AudioRecorder] Recording error:', err);
          this.isRecording = false;
        })
        .pipe(fileStream);

      this.isRecording = true;
      console.log('[AudioRecorder] Recording started');

      return this.currentFilePath;
    } catch (error) {
      console.error('[AudioRecorder] Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording audio
   */
  stopRecording(): string | null {
    if (!this.isRecording || !this.recording) {
      console.log('[AudioRecorder] Not currently recording');
      return null;
    }

    console.log('[AudioRecorder] Stopping recording...');
    // TODO: Handle the case where the recording is not stopped properly
    // Wav header is not written corrently
    this.recording.stop();
    this.recording = null;
    this.isRecording = false;

    const filePath = this.currentFilePath;
    this.currentFilePath = null;

    console.log(`[AudioRecorder] Recording stopped. File saved to: ${filePath}`);
    return filePath;
  }

  /**
   * Check if currently recording
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get current recording file path
   */
  getCurrentFilePath(): string | null {
    return this.currentFilePath;
  }
}

