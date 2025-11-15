import { ITranscriber } from '../../../shared/types';
import { WHISPER_CONFIG } from '../../../shared/constants';
// import { LocalWhisperTranscriber } from './LocalWhisperTranscriber';
import { GroqWhisperTranscriber } from './GroqWhisperTranscriber';
import { OpenAIWhisperTranscriber } from './OpenAIWhisperTranscriber';

export class TranscriberFactory {
  static create(provider?: string): ITranscriber {
    const selectedProvider = provider || WHISPER_CONFIG.PROVIDER;

    console.log(`[TranscriberFactory] Creating transcriber: ${selectedProvider}`);

    switch (selectedProvider) {
      case 'local':
        throw new Error('Local transcriber is disabled. Please use groq or openai.');

      
      case 'groq':
        return new GroqWhisperTranscriber();
      
      case 'openai':
        return new OpenAIWhisperTranscriber();
      
      default:
        console.warn(
          `[TranscriberFactory] Unknown provider: ${selectedProvider}, falling back to local`
        );
        return new GroqWhisperTranscriber();
    }
  }
}

