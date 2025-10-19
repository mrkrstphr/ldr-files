import { splitPlus } from './splitPlus.js';

export function getRootSubmodels(contents) {
  const submodels = [];
  const stepIndex = contents
    .split('\n')
    .findIndex((line) => line.trim().toLowerCase().startsWith('0 step'));

  if (stepIndex !== -1) {
    const lines = contents.split('\n');

    for (let i = stepIndex + 1; i < lines.length; i++) {
      const cleanLine = lines[i].trim().toLowerCase();

      if (Number(cleanLine.substring(0, 1)) > 1) continue;
      if (
        cleanLine.endsWith('.dat') ||
        cleanLine.startsWith('0 step') ||
        cleanLine.startsWith('0 nofile') ||
        cleanLine.startsWith('0 file')
      ) {
        break;
      }

      const parts = splitPlus(cleanLine, ' ', 15);

      if (parts.length < 15) continue;

      submodels.push(parts[14]);
    }
  }

  return submodels;
}
