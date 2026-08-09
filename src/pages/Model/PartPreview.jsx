import { useEffect, useRef, useState } from 'react';
import * as three from 'three';
import { LDrawConditionalLineMaterial } from 'three/addons/materials/LDrawConditionalLineMaterial';
import { withBasePath } from '../../config';
import { usePrefersDarkMode } from '../../hooks/usePrefersDarkMode';
import { LDrawLoader } from '../../lib/LDrawLoaderCustom';

let sharedLoader = null;
let loaderInitPromise = null;

async function getLoader() {
  if (sharedLoader) return sharedLoader;

  if (loaderInitPromise) return loaderInitPromise;

  loaderInitPromise = (async () => {
    const loader = new LDrawLoader();
    loader.setConditionalLineMaterial(LDrawConditionalLineMaterial);
    loader.setPartsLibraryPath(
      'https://raw.githubusercontent.com/mrkrstphr/ldraw-parts/main/',
    );

    try {
      const partsMapResponse = await fetch(withBasePath('data/map.json'));
      if (partsMapResponse.ok) {
        const partsMap = await partsMapResponse.json();
        const normalizedMap = {};
        for (const [key, value] of Object.entries(partsMap)) {
          normalizedMap[key] = value.replace(/^\//, '');
        }
        loader.setFileMap(normalizedMap);
      }
    } catch (err) {
      console.warn('Failed to load parts map:', err);
    }

    await loader.preloadMaterials(
      'https://raw.githubusercontent.com/mrkrstphr/ldraw-parts/main/LDCfgalt.ldr',
    );

    sharedLoader = loader;
    return loader;
  })();

  return loaderInitPromise;
}

export function PartPreview({ partId, colorCode }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(false);
  const cleanupRef = useRef(null);
  const isDarkMode = usePrefersDarkMode();

  useEffect(() => {
    // Wait until we know dark mode preference before rendering
    if (isDarkMode === undefined) return;
    if (!containerRef.current) return;

    let cancelled = false;
    let scene, camera, renderer, model;

    (async () => {
      try {
        const container = containerRef.current;
        if (!container || cancelled) return;

        scene = new three.Scene();
        scene.background = new three.Color(isDarkMode ? 0x1c1917 : 0xffffff);

        camera = new three.PerspectiveCamera(45, 1, 1, 1000);

        renderer = new three.WebGLRenderer({ antialias: true });
        renderer.setSize(48, 48);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const ambientLight = new three.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new three.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        const loader = await getLoader();
        if (cancelled) return;

        const partContent = `0 Part Preview
1 ${colorCode} 0 0 0 1 0 0 0 1 0 0 0 1 ${partId}.dat`;

        loader.parse(
          partContent,
          (group) => {
            if (cancelled) return;

            model = group;
            model.rotation.x = Math.PI;
            scene.add(model);

            const bbox = new three.Box3().setFromObject(model);
            const center = bbox.getCenter(new three.Vector3());
            const size = bbox.getSize(new three.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 1.2;

            camera.position.set(
              center.x + cameraDistance * 0.5,
              center.y + cameraDistance * 0.5,
              center.z + cameraDistance * 0.7,
            );
            camera.lookAt(center);

            renderer.render(scene, camera);
          },
          undefined,
          (err) => {
            if (!cancelled) {
              console.error('Failed to load part preview:', partId, err);
              setError(true);
            }
          },
        );
      } catch (err) {
        if (!cancelled) {
          console.error('Part preview error:', err);
          setError(true);
        }
      }
    })();

    cleanupRef.current = () => {
      cancelled = true;

      if (model) {
        scene?.remove(model);
      }

      if (scene) {
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
        scene.clear();
      }

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };

    return cleanupRef.current;
  }, [partId, colorCode, isDarkMode]);

  if (error) {
    return (
      <div
        className="w-12 h-12 rounded border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-xs text-red-600 dark:text-red-400"
        title={`Failed to load: ${partId}`}
      >
        ?
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-12 h-12 rounded border-2 border-stone-200 dark:border-stone-600 shadow-sm overflow-hidden"
      title={`Part: ${partId}, Color: ${colorCode}`}
    />
  );
}
