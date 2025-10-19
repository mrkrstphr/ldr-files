import { existsSync, readFileSync } from 'fs';

export function loadTestFile(filename) {
  // eslint-disable-next-line no-undef
  const path = `${__dirname}/${filename}.ldr`;

  if (!existsSync(path)) {
    throw new Error(`Test file not found: ${path}`);
  }

  return readFileSync(path, 'utf-8').toString();
}
