import fs from 'fs/promises';
import path from 'path';
import { findReferencedParts, readdir } from './utils.js';

// recursively find all models
const queue = await readdir('./models');
const processed = [];

while (queue.length > 0) {
  const fileName = queue.shift();

  if (processed.includes(path.basename(fileName))) {
    continue;
  }

  const parts = await findReferencedParts(fileName);
  // console.log(parts);
  const unprocessedParts = parts.filter((p) => !processed.includes(path.basename(p)));

  for (const part of unprocessedParts) {
    const dir = path.dirname(part.replace('ldraw/', ''));
    // console.log(dir);
    queue.push(part);
    // move it?

    if (['p', 'parts'].includes(dir)) {
      // console.log(`MOVE: [${part}] -> [_site/public/ldraw/${path.basename(part)}]`);
      await fs.copyFile(part, `_site/public/ldraw/${path.basename(part)}`);
      // console.log(`FOUND: ${candidate}`);
    } else {
      const subdir = dir.replace('parts/', '').replace('p/', '');
      // console.log(`MOVE: [${part}] -> [_site/public/ldraw/${subdir}/${path.basename(part)}]`);
      await fs.copyFile(part, `_site/public/ldraw/${subdir}/${path.basename(part)}`);
    }
  }

  processed.push(path.basename(fileName));
}

// loop each model, get file contents
// find all parts referenced within model
// copy part to destination dir
// get part file contents
// find all parts referenced within the part
// copy part to destination dir
