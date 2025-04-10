// utils/pathHelper.ts - FIXED
import { fileURLToPath } from "url";
import { dirname } from "path";

/**
 * Helper function to create __filename in ES modules
 * @param metaUrl - import.meta.url from the calling module
 * @returns The file path
 */
export function getFilename(metaUrl: string): string {
  return fileURLToPath(metaUrl);
}

/**
 * Helper function to create __dirname in ES modules
 * @param metaUrl - import.meta.url from the calling module
 * @returns The directory path
 */
export function getDirname(metaUrl: string): string {
  return dirname(fileURLToPath(metaUrl));
}

// For backward compatibility
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);
