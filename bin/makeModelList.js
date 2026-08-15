import fs from 'fs/promises';
import path from 'path';

const models = {};
const modelsJsonPath = path.resolve('data', 'models.json');

const existingDates = {};
try {
  const existing = JSON.parse(await fs.readFile(modelsJsonPath, 'utf-8'));
  for (const entries of Object.values(existing)) {
    for (const entry of entries) {
      if (entry.dateAdded) existingDates[entry.file] = entry.dateAdded;
    }
  }
} catch {
  // No existing models.json yet.
}

function slugify(text) {
  return text
    .toLowerCase()
    .substring(0, text.lastIndexOf('.'))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readdir(dirPath) {
  return fs.readdir(dirPath).then((v) => {
    return Promise.all(
      v.map(async (file) => {
        return new Promise(async (resolve) => {
          const filePath = `${dirPath}/${file}`;
          const stats = await fs.stat(filePath);

          if (file.substring(0, 2) === '._') {
            resolve();
            return;
          }

          if (stats.isDirectory()) {
            await readdir(filePath);
          } else {
            if (filePath.includes('.ldr')) {
              const [theme] = filePath.replace('models/', '').split('/');

              if (!models[theme]) {
                models[theme] = [];
              }

              const modelFile = filePath.replace('models/', '');
              const dateAdded =
                existingDates[modelFile] ?? new Date().toISOString();
              const previewFile = modelFile.replace(/\.ldr$/i, '.png');
              const hasPreview = await fs
                .access(path.join('previews', previewFile))
                .then(() => true)
                .catch(() => false);

              models[theme].push({
                file: modelFile,
                slug: slugify(modelFile),
                dateAdded,
                hasPreview,
              });
            }
          }

          resolve();
        });
      }),
    );
  });
}

try {
  readdir('models').then(async () => {
    const sorted = Object.keys(models)
      .sort()
      .reduce((accumulator, key) => {
        models[key].sort(function (a, b) {
          if (a < b) {
            return -1;
          }

          if (a > b) {
            return 1;
          }

          return 0;
        });

        accumulator[key] = models[key];

        return accumulator;
      }, {});

    await fs.writeFile(
      path.resolve('data', 'models.json'),
      JSON.stringify(sorted),
    );
  });
} catch (e) {
  console.error(e);
}
