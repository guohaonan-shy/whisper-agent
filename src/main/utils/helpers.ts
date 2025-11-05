import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';

/**
 * Ensure directory exists, create if not
 */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${randomBytes(4).toString('hex')}`;
}

/**
 * Get temporary audio file path
 */
export function getTempAudioPath(): string {
  const timestamp = Date.now();
  return path.join(process.cwd(), 'data', 'audio', `recording-${timestamp}.wav`);
}

/**
 * Delete file if exists
 */
export function deleteFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Format duration in seconds to readable string
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

