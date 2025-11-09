import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore - no types available
import * as record from 'node-record-lpcm16';
// @ts-ignore - no types available
import * as wav from 'node-wav';
import { AUDIO_CONFIG } from '../../shared/constants';
import { ensureDir, getTempAudioPath } from '../utils/helpers';
import { AudioConfig } from '../../shared/types';

export class AudioRecorder {
  private recording: any = null;
  private isRecording: boolean = false;
  private currentFilePath: string | null = null;
  private audioConfig: AudioConfig;
  private audioChunks: Buffer[] = [];

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
   * Collects PCM data to memory buffer instead of writing to file directly
   */
  startRecording(): string {
    if (this.isRecording) {
      console.log('[AudioRecorder] Already recording');
      return this.currentFilePath!;
    }

    this.currentFilePath = getTempAudioPath();
    this.audioChunks = []; // Clear audio buffer
    console.log(`[AudioRecorder] Starting recording to: ${this.currentFilePath}`);

    try {
      this.recording = record.record({
        sampleRate: this.audioConfig.sampleRate,
        channels: this.audioConfig.channels,
        recorder: 'sox',
        threshold: AUDIO_CONFIG.THRESHOLD,
        silence: AUDIO_CONFIG.SILENCE_DURATION.toString(),
      });

      // Collect PCM data to memory buffer
      this.recording.stream()
        .on('data', (chunk: Buffer) => {
          this.audioChunks.push(chunk);
        })
        .on('error', (err: Error) => {
          console.error('[AudioRecorder] Recording error:', err);
          this.isRecording = false;
        });

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
   * Converts collected PCM data to WAV format using node-wav
   */
  stopRecording(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (!this.isRecording || !this.recording) {
        console.log('[AudioRecorder] Not currently recording');
        resolve(null);
        return;
      }

      console.log('[AudioRecorder] Stopping recording...');
      
      const filePath = this.currentFilePath;
      const stream = this.recording.stream();
      
      // Wait for stream to end (sox process closes stdout)
      stream.once('end', () => {
        console.log('[AudioRecorder] Stream ended, processing audio data...');
        this.processAndSaveAudio(filePath, resolve, reject);
      });
      
      stream.once('error', (err: Error) => {
        console.error('[AudioRecorder] Stream error:', err);
        reject(err);
      });

      // Stop the sox process (this will trigger stream 'end' event)
      this.recording.stop();
      
      // Clean up state
      this.recording = null;
      this.isRecording = false;
      this.currentFilePath = null;
    });
  }

  /**
   * Process collected PCM data and save as WAV file
   */
  private processAndSaveAudio(
    filePath: string | null,
    resolve: (value: string | null) => void,
    reject: (reason: any) => void
  ): void {
    try {
      if (!filePath) {
        resolve(null);
        return;
      }

      // Check if we have collected any audio data
      if (this.audioChunks.length === 0) {
        console.warn('[AudioRecorder] No audio data collected');
        resolve(null);
        return;
      }

      // Concatenate all PCM chunks
      const pcmBuffer = Buffer.concat(this.audioChunks);
      console.log(`[AudioRecorder] Collected ${pcmBuffer.length} bytes of PCM data`);

      // Convert 16-bit PCM to Float32Array (normalized to -1.0 ~ 1.0)
      // sox outputs 16-bit signed integer PCM
      const samples = pcmBuffer.length / 2; // 16-bit = 2 bytes per sample
      const floatArray = new Float32Array(samples);
      
      for (let i = 0; i < samples; i++) {
        const int16 = pcmBuffer.readInt16LE(i * 2);
        // Normalize: -32768~32767 → -1.0~1.0
        floatArray[i] = int16 < 0 ? int16 / 32768 : int16 / 32767;
      }

      console.log(`[AudioRecorder] Converted ${samples} samples to Float32Array`);

      // Encode as WAV using node-wav
      // channelData is an array of channels, we have mono so it's [floatArray]
      const wavBuffer = wav.encode([floatArray as any], {
        sampleRate: this.audioConfig.sampleRate,
        float: false,      // Output as integer PCM, not floating point
        bitDepth: 16       // 16-bit output
      });

      console.log(`[AudioRecorder] Encoded WAV buffer: ${wavBuffer.length} bytes`);

      // Write to file
      fs.writeFileSync(filePath, wavBuffer);
      
      const fileSizeKB = (wavBuffer.length / 1024).toFixed(2);
      console.log(`[AudioRecorder] Recording stopped. File saved to: ${filePath}`);
      console.log(`[AudioRecorder] File size: ${fileSizeKB} KB`);

      // Clear buffer
      this.audioChunks = [];
      
      resolve(filePath);
    } catch (error) {
      console.error('[AudioRecorder] Failed to process and save audio:', error);
      reject(error);
    }
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

