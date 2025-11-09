const PROJECT_ROOT = process.cwd();
import * as path from 'path';
import * as os from 'os';

// Audio configuration
export const AUDIO_CONFIG = {
  SAMPLE_RATE: 16000,  // Whisper requires 16kHz
  CHANNELS: 1,         // Mono
  ENCODING: 'signed-integer',
  THRESHOLD: 0.5,
  SILENCE_DURATION: 1.5
};

// Shortcuts
export const SHORTCUTS = {
  START_RECORDING: 'CommandOrControl+Shift+Space',
  STOP_RECORDING: 'CommandOrControl+Shift+Space'
};

// Paths
export const DATA_DIR = path.join(PROJECT_ROOT, 'data');
export const AUDIO_DIR = path.join(DATA_DIR, 'audio');
export const MODELS_DIR = path.join(PROJECT_ROOT, 'models');
export const CONFIG_PATH = path.join(DATA_DIR, 'config.json');
export const DB_PATH = path.join(DATA_DIR, 'conversations.db');

// Whisper configuration
export const WHISPER_CONFIG = {
  MODEL_NAME: 'base',  // tiny, base, small, medium, large, large-v3-turbo
  LANGUAGE: 'auto',    // auto-detect or specify language code
};

