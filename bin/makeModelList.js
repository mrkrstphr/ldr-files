import fs from 'fs/promises';
import path from 'path';

const models = {};

function slugify(text) {
  return text
    .toLowerCase()
    .substring(0, text.lastIndexOf('.'))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readdir(path) {
  return fs.readdir(path).then((v) => {
    return Promise.all(
      v.map(async (file) => {
        return new Promise(async (resolve) => {
          const filePath = `${path}/${file}`;
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

              models[theme].push({ file: modelFile, slug: slugify(modelFile) });
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
