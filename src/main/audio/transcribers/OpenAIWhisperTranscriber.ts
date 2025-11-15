import * as fs from 'fs';
import OpenAI from 'openai';
import { WHISPER_CONFIG } from '../../../shared/constants';
import { TranscriptionResult, ITranscriber } from '../../../shared/types';

export class OpenAIWhisperTranscriber implements ITranscriber {
  private openai: OpenAI;
  private model: string;
  private isInitialized: boolean = false;

  constructor(
    apiKey: string = WHISPER_CONFIG.OPENAI_API_KEY,
    model: string = WHISPER_CONFIG.OPENAI_MODEL
  ) {
    this.openai = new OpenAI({
      apiKey: apiKey
    });
    this.model = model;
  }

  getProviderName(): string {
    return 'openai';
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('[OpenAIWhisperTranscriber] Initializing...');

    if (!this.openai.apiKey) {
      throw new Error(
        'OpenAI API key not found. Please set OPENAI_API_KEY environment variable.'
      );
    }

    this.isInitialized = true;
    console.log('[OpenAIWhisperTranscriber] Initialized successfully');
  }

  async transcribe(audioFilePath: string): Promise<TranscriptionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!fs.existsSync(audioFilePath)) {
      throw new Error(`Audio file not found: ${audioFilePath}`);
    }

    console.log(`[OpenAIWhisperTranscriber] Transcribing: ${audioFilePath}`);
    
    try {
      const startTime = Date.now();

      // Create transcription using OpenAI SDK
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: this.model,
        language: WHISPER_CONFIG.LANGUAGE !== 'auto' ? WHISPER_CONFIG.LANGUAGE : undefined,
      });

      const duration = (Date.now() - startTime) / 1000;

      console.log(`[OpenAIWhisperTranscriber] Transcription completed in ${duration.toFixed(2)}s`);
      console.log(`[OpenAIWhisperTranscriber] Result: "${transcription.text}"`);

      return {
        text: transcription.text,
        language: (transcription as any).language,
        duration
      };
    } catch (error) {
      console.error('[OpenAIWhisperTranscriber] Transcription failed:', error);
      throw error;
    }
  }
}

