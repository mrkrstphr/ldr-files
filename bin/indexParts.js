#!/usr/bin/env node
// Indexes an LDraw parts library into data/map.json, mapping lowercased
// part file names to their path within the library.
//
// Usage: node bin/indexParts.js <path-to-ldraw-library>
import fs from 'fs';
import path from 'path';

const partFolders = ['models', 'p', 'parts'];

function parseDirectory(directory, partsPath) {
  const partMap = {};
  fs.readdirSync(directory).forEach((file) => {
    const filePath = path.join(directory, file);

    if (fs.lstatSync(filePath).isDirectory()) {
      Object.assign(partMap, parseDirectory(filePath, partsPath));
      return;
    }

    if (
      !file.toLowerCase().endsWith('.ldr') &&
      !file.toLowerCase().endsWith('.dat')
    )
      return;

    partMap[file.toLowerCase()] = path.join(
      path.relative(partsPath, directory),
      file,
    );
  });

  return partMap;
}

function main() {
  const [, , partsPath] = process.argv;

  if (!partsPath) {
    console.error('Usage: node bin/indexParts.js <path-to-ldraw-library>');
    process.exit(1);
  }

  const partMap = {};

  partFolders.forEach((folder) => {
    Object.assign(
      partMap,
      parseDirectory(path.join(partsPath, folder), partsPath),
    );
  });

  fs.writeFileSync('data/map.json', JSON.stringify(partMap));
  console.log(`Wrote ${Object.keys(partMap).length} parts to data/map.json`);
}

main();
