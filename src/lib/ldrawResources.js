// Shared, module-level caches for LDraw resources that are identical across
// every model load (parts file map, color materials). A new LDrawLoader is
// constructed per model/submodel/dark-mode change, so without this cache
// these would otherwise be re-fetched (and re-parsed) on every such change.

export const LDRAW_PARTS_LIBRARY_PATH =
  'https://raw.githubusercontent.com/mrkrstphr/ldraw-parts/main/';

let fileMapPromise;
let materialsTextPromise;

export function getPartsFileMap(mapUrl) {
  if (!fileMapPromise) {
    fileMapPromise = fetch(mapUrl)
      .then(async (response) => {
        if (!response.ok) return {};

        const partsMap = await response.json();

        // The map has paths with leading slashes like "/parts/3001.dat"
        // but the loader expects paths without leading slashes like "parts/3001.dat"
        const normalizedMap = {};
        for (const [key, value] of Object.entries(partsMap)) {
          normalizedMap[key] = value.replace(/^\//, '');
        }

        return normalizedMap;
      })
      .catch((error) => {
        fileMapPromise = undefined;
        throw error;
      });
  }

  return fileMapPromise;
}

export function getLdrawMaterialsText() {
  if (!materialsTextPromise) {
    materialsTextPromise = fetch(`${LDRAW_PARTS_LIBRARY_PATH}LDCfgalt.ldr`)
      .then((response) => response.text())
      .catch((error) => {
        materialsTextPromise = undefined;
        throw error;
      });
  }

  return materialsTextPromise;
}
