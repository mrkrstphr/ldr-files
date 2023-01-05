const fs = require('fs/promises');

const models = {};

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

              models[theme].push(filePath.replace('models/', ''));
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

    await fs.writeFile('index.json', JSON.stringify(sorted));
  });
} catch (e) {
  console.error(e);
}
