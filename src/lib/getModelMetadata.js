import { splitPlus } from './splitPlus.js';

export function getModelMetadata(contents) {
  const metadata = {};
  const lines = contents.trim().split('\n');

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine.startsWith('0 ')) break;

    const parts = splitPlus(cleanLine.substring(2), ':', 2);
    if (parts.length < 2) continue;

    const key = parts[0].trim();
    const value = parts[1].trim();

    if (key in metadata) {
      if (Array.isArray(metadata[key])) {
        metadata[key].push(value);
      } else {
        metadata[key] = [metadata[key], value];
      }
    } else {
      metadata[key] = value;
    }
  }

  return metadata;
}
