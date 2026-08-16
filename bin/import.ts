#!/usr/bin/env node
// Imports a source .ldr file into models/<theme>/, normalizing its header
// (name/set number/theme/etc.), remapping known part number substitutions,
// optionally tagging submodels and marking the model step-ready, warning
// about referenced parts missing from data/map.json, and regenerating
// data/models.json.
//
// Usage: node bin/import.ts <source-file.ldr> <theme>
import { checkbox, confirm } from '@inquirer/prompts';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

// Kept in sync with bin/cleanup.sh's part number substitutions.
const PART_NUMBER_MAP: Record<string, string> = {
  '98138pb072': '98138pz0',
  '93552pb03': '93552p03',
};

function normalizeLineEndings(contents: string): string {
  return contents.replace(/\r\n/g, '\n');
}

function stripBrackets(fileName: string): string {
  const ext = path.extname(fileName);
  const base = fileName.slice(0, -ext.length);

  const cleaned = base
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return `${cleaned}${ext}`;
}

function remapPartNumbers(contents: string): string {
  let result = contents;
  for (const [from, to] of Object.entries(PART_NUMBER_MAP)) {
    result = result.split(from).join(to);
  }
  return result;
}

function findSubmodelNames(contents: string): string[] {
  const names: string[] = [];

  for (const line of contents.split('\n')) {
    const match = line.match(/^0 FILE (.+)$/i);
    if (!match) continue;

    const name = match[1].trim();
    if (name && !names.includes(name)) names.push(name);
  }

  return names;
}

function findReferencedParts(contents: string): string[] {
  const parts: string[] = [];

  for (const line of contents.split('\n')) {
    // Type 1 line: 1 <color> x y z a b c d e f g h i <file>
    const match = line.match(/^1\s+\S+(?:\s+\S+){12}\s+(.+?)\s*$/);
    if (!match) continue;

    const name = match[1].trim();
    if (name && !parts.includes(name)) parts.push(name);
  }

  return parts;
}

async function reportMissingParts(
  contents: string,
  submodels: string[],
): Promise<void> {
  const partsMap: Record<string, string> = JSON.parse(
    await readFile('data/map.json', 'utf-8'),
  );
  const knownParts = new Set(Object.keys(partsMap).map((p) => p.toLowerCase()));
  const ownSubmodels = new Set(submodels.map((s) => s.toLowerCase()));

  const referenced = findReferencedParts(contents);
  const missing = referenced.filter(
    (part) =>
      !knownParts.has(part.toLowerCase()) && !ownSubmodels.has(part.toLowerCase()),
  );

  if (missing.length > 0) {
    console.warn(
      `Missing parts (not in data/map.json and not a submodel): ${missing.join(', ')}`,
    );
  }
}

async function promptForSubmodels(candidates: string[]): Promise<string[]> {
  if (candidates.length === 0) return [];

  if (!process.stdin.isTTY) {
    console.warn(
      `Skipping submodel prompt (not a TTY). Found but did not tag: ${candidates.join(', ')}`,
    );
    return [];
  }

  return checkbox({
    message: 'Which should be listed as _submodels?',
    choices: candidates.map((name) => ({ name, value: name })),
  });
}

async function promptForStepReady(): Promise<boolean> {
  if (!process.stdin.isTTY) {
    console.warn('Skipping step-ready prompt (not a TTY). Defaulting to no.');
    return false;
  }

  return confirm({ message: 'Is this model step ready?', default: false });
}

function normalizeHeader(
  contents: string,
  submodels: string[],
  stepReady: boolean,
): string {
  const lines = contents.split('\n');

  let headerEnd = 0;
  while (headerEnd < lines.length && lines[headerEnd].startsWith('0 ')) {
    headerEnd++;
  }

  const headerLines = lines.slice(0, headerEnd);
  const bodyLines = lines.slice(headerEnd);

  let name = '';
  let numOfBricks: string | null = null;
  let explicitSetNumber = '';
  let theme = '';
  let releaseYear = '';

  for (const line of headerLines) {
    const match = line.match(/^0 ([^:]+):\s*(.*)$/);
    if (!match) continue;

    const [, key, value] = match;
    if (key === 'Name') name = value.trim();
    else if (key === 'NumOfBricks') numOfBricks = value.trim();
    else if (key === 'SetNumber') explicitSetNumber = value.trim();
    else if (key === 'Theme') theme = value.trim();
    else if (key === 'ReleaseYear') releaseYear = value.trim();
  }

  const nameMatch = name.match(/^(\d+\S*)\s+(.*)$/);
  const setNumber = explicitSetNumber || (nameMatch ? nameMatch[1] : '');
  const modelName = explicitSetNumber ? name : nameMatch ? nameMatch[2] : name;

  const normalizedHeader = [
    `0 FILE ${setNumber} ${modelName}`.trim(),
    `0 ${setNumber} ${modelName}`.trim(),
    setNumber ? `0 SetNumber: ${setNumber}` : null,
    `0 Name: ${modelName}`,
    `0 Theme: ${theme}`,
    `0 ReleaseYear: ${releaseYear}`,
    `0 NumOfBricks:  ${numOfBricks ?? ''}`,
    submodels.length > 0 ? `0 _submodels: ${submodels.join(', ')}` : null,
    stepReady ? `0 _stepReady: true` : null,
  ].filter((line): line is string => line !== null);

  return [...normalizedHeader, ...bodyLines].join('\n');
}

async function main() {
  const [, , sourcePath, theme] = process.argv;

  if (!sourcePath || !theme) {
    console.error('Usage: node bin/import.ts <source-file.ldr> <theme>');
    process.exit(1);
  }

  const raw = await readFile(sourcePath, 'utf-8');
  const lineEndingsNormalized = normalizeLineEndings(raw);

  const submodelCandidates = findSubmodelNames(lineEndingsNormalized);
  const submodels = await promptForSubmodels(submodelCandidates);
  const stepReady = await promptForStepReady();

  const normalized = remapPartNumbers(
    normalizeHeader(lineEndingsNormalized, submodels, stepReady),
  );

  await reportMissingParts(normalized, submodelCandidates);

  const fileName = stripBrackets(path.basename(sourcePath));

  const destDir = path.join('models', theme);
  const destPath = path.join(destDir, fileName);

  const isNewModel = !existsSync(destPath);

  await mkdir(destDir, { recursive: true });
  await writeFile(destPath, normalized, 'utf-8');

  console.log(
    isNewModel
      ? `Imported '${sourcePath}' -> '${destPath}'`
      : `Reimported '${sourcePath}' -> '${destPath}' (replaced existing file)`,
  );

  await execFileAsync('node', ['bin/makeModelList.js']);
  console.log('Updated data/models.json');
}

main();
