import fs from 'fs/promises';

const checkDirs = ['p', 'p/48', 'p/8', 'parts', 'parts/s'];

export const fileExists = async (file) => {
  try {
    await fs.access(file, fs.R_OK);
    return true;
  } catch (e) {
    return false;
  }
};

export async function readdir(path) {
  const models = [];

  const files = await fs.readdir(path);

  for (const file of files) {
    const filePath = `${path}/${file}`;
    const stats = await fs.stat(filePath);

    if (file.substring(0, 2) === '._') {
      continue;
    }

    if (stats.isDirectory()) {
      const subModels = await readdir(filePath);
      models.push(...subModels);
    } else {
      if (filePath.includes('.ldr')) {
        models.push(filePath);
      }
    }
  }

  return models;
}

export async function findPartPath(fileName) {
  for (const checkDir of checkDirs) {
    const candidate = `ldraw/${checkDir}/${fileName}`;

    if (await fileExists(candidate)) {
      return candidate;
    }
  }
}

export async function findReferencedParts(fileName) {
  const contents = await (await fs.readFile(fileName)).toString();
  const matches = contents.match(/([a-z0-9-_\/]+)\.dat/g);

  const parts = [];

  for (const match of matches) {
    const pathName = await findPartPath(match);

    if (pathName) {
      parts.push(pathName);
    } else {
      console.error(`Failed to find part: [${fileName}/${match}]`);
    }
  }

  return parts;
}
