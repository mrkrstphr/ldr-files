import { splitPlus } from './splitPlus.js';

export function getSubmodel(contents: string, submodelName: string): string {
  const lines = contents.split('\n');
  let isInSubmodel = false;
  const submodelLines: string[] = [];

  const startString = '0 FILE ' + submodelName;

  for (const line of lines) {
    if (line.toLowerCase().trim() === startString.toLowerCase().trim()) {
      isInSubmodel = true;
      submodelLines.push(line);
      continue;
    }
    if (
      isInSubmodel &&
      (line.toLowerCase().trim() === '0 nofile' ||
        line.toLowerCase().trim().startsWith('0 file '))
    ) {
      break;
    }

    if (isInSubmodel) submodelLines.push(line);
  }

  const foundModel = submodelLines.join('\n');
  const submodels = findAllSubmodels(contents, foundModel);

  return [foundModel, submodels].join('\n');
}

function findAllSubmodels(fullContents: string, model: string): string {
  const modelLines = model.split('\n');

  const submodels: string[] = [];

  for (const modelLine of modelLines) {
    const cleanLine = modelLine.trim().toLowerCase();
    const parts = splitPlus(cleanLine, ' ', 15);

    if (parts.length < 15) continue;

    const submodelName = parts[14];

    if (!submodelName.endsWith('.dat')) {
      const submodelContents = getSubmodel(fullContents, submodelName);
      submodels.push(submodelContents);
    }
  }

  return submodels.join('\n');
}
