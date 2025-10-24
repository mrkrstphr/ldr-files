// GitHUb pages, where I host this site, does not support single-page apps well, and will
// throw a 404 if you refresh on a page or link directly to a page.
// To workaround this, we're going to copy index.html to every single model page in dist
// so that the app works as normal, even though its kind of gross.

import fs from 'fs';
import path from 'path';

const distDir = path.resolve(import.meta.dirname, '..', 'dist');

fs.mkdirSync(`${distDir}/model`, { recursive: true });

const models = Object.values(
  JSON.parse(
    fs.readFileSync(
      path.resolve(import.meta.dirname, '..', 'dist/models.json'),
      'utf-8',
    ),
  ),
).flat();

for (const model of models) {
  fs.mkdirSync(path.resolve(distDir, 'model', model.slug), { recursive: true });
  fs.copyFileSync(
    path.resolve(distDir, 'index.html'),
    path.resolve(distDir, 'model', model.slug, 'index.html'),
  );
}
