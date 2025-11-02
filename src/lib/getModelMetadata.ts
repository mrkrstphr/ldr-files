import type { Metadata } from '../types.js';
import { splitPlus } from './splitPlus.js';

const allowedMetadataKeys = [
  'Author',
  'Labels',
  'Name',
  'Notes',
  'ReleaseYear',
  'SetNumber',
  'Theme',
  '_altModels',
  '_stepReady',
  '_submodels',
];

const multiValueKeys = ['Notes'];
const splittableMultiValueKeys = ['Labels', '_altModels', '_submodels'];

export function getModelMetadata(contents: string): Metadata {
  const metadata: Metadata = {};
  const lines = contents.trim().split('\n');

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine.startsWith('0 ')) break;

    const parts = splitPlus(cleanLine.substring(2), ':', 2);
    if (parts.length < 2) continue;

    const key = parts[0].trim() as keyof Metadata;
    const value = parts[1].trim() as string;

    if (!allowedMetadataKeys.includes(key)) {
      console.warn(`Ignoring unknown metadata: ${key}: ${value}`);
      continue;
    }

    if (splittableMultiValueKeys.includes(key)) {
      // @ts-ignore I don't know how to make TS understand this
      metadata[key] = value.split(',').map((val) => val.trim());
    } else if (multiValueKeys.includes(key)) {
      if (!(key in metadata)) {
        // @ts-ignore I don't know how to make TS understand this
        metadata[key] = [];
      }
      // @ts-ignore I don't know how to make TS understand this
      metadata[key].push(value);
    } else {
      // @ts-ignore I don't know how to make TS understand this
      metadata[key] = value;
    }
  }

  return metadata;
}
