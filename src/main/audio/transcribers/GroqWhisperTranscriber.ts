import * as fs from 'fs';
import Groq from 'groq-sdk';
import { WHISPER_CONFIG } from '../../../shared/constants';
import { TranscriptionResult, ITranscriber } from '../../../shared/types';

export class GroqWhisperTranscriber implements ITranscriber {
  private groq: Groq;
  private model: string;
  private isInitialized: boolean = false;

  constructor(
    apiKey: string = WHISPER_CONFIG.GROQ_API_KEY,
    model: string = WHISPER_CONFIG.GROQ_MODEL
  ) {
    this.groq = new Groq({
      apiKey: apiKey
    });
    this.model = model;
  }

  getProviderName(): string {
    return 'groq';
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('[GroqWhisperTranscriber] Initializing...');

    if (!this.groq.apiKey) {
      throw new Error(
        'Groq API key not found. Please set GROQ_API_KEY environment variable.'
      );
    }

    this.isInitialized = true;
    console.log('[GroqWhisperTranscriber] Initialized successfully');
  }

  async transcribe(audioFilePath: string): Promise<TranscriptionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    console.log(`[GroqWhisperTranscriber] Transcribing: ${audioFilePath}`);
    
    try {
      const startTime = Date.now();

      // Create transcription using Groq SDK
      const transcription = await this.groq.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: this.model,
        language: WHISPER_CONFIG.LANGUAGE !== 'auto' ? WHISPER_CONFIG.LANGUAGE : undefined,
        response_format: 'json',
      });

      const duration = (Date.now() - startTime) / 1000;

      console.log(`[GroqWhisperTranscriber] Transcription completed in ${duration.toFixed(2)}s`);
      console.log(`[GroqWhisperTranscriber] Result: "${transcription.text}"`);

      return {
        text: transcription.text,
        language: (transcription as any).language,
        duration
      };
    } catch (error) {
      console.error('[GroqWhisperTranscriber] Transcription failed:', error);
      throw error;
    }
  }
}

