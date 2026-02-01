import { useEffect, useRef, useState } from 'react';
import * as three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment';
import { LDrawConditionalLineMaterial } from 'three/addons/materials/LDrawConditionalLineMaterial';
import { withBasePath } from '../../config';
import { usePrefersDarkMode } from '../../hooks/usePrefersDarkMode';
import { LDrawLoader } from '../../lib/LDrawLoaderCustom';

const Ldr = ({
  model: modelContents,
  onModelLoaded,
  canvasRef,
  sceneRef,
  rendererRef,
  cameraRef,
}) => {
  const isDarkMode = usePrefersDarkMode();
  const containerRef = useRef(null);
  const [errored, setErrored] = useState(false);

  function onError(error) {
    setErrored(true);
    console.error(error);
  }

  useEffect(() => {
    // wait until we know dark mode preference before trying to render anything to prevent flickering
    if (isDarkMode === undefined) return;
    if (!containerRef.current) return;
    const container = containerRef.current;

    let camera, scene, renderer, controls, pmremGenerator, envTexture;
    let model;

    function animate() {
      controls.update();
      render();
    }

    function render() {
      renderer.render(scene, camera);
    }

    // Helper function to dispose of Three.js objects recursively
    function disposeObject(obj) {
      if (!obj) return;

      // Dispose geometry
      if (obj.geometry) {
        obj.geometry.dispose();
      }

      // Dispose material(s)
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((material) => {
            disposeMaterial(material);
          });
        } else {
          disposeMaterial(obj.material);
        }
      }

      // Recursively dispose children
      if (obj.children) {
        obj.children.forEach((child) => disposeObject(child));
      }
    }

    function disposeMaterial(material) {
      if (!material) return;

      // Dispose textures
      if (material.map) material.map.dispose();
      if (material.lightMap) material.lightMap.dispose();
      if (material.bumpMap) material.bumpMap.dispose();
      if (material.normalMap) material.normalMap.dispose();
      if (material.specularMap) material.specularMap.dispose();
      if (material.envMap) material.envMap.dispose();
      if (material.alphaMap) material.alphaMap.dispose();
      if (material.aoMap) material.aoMap.dispose();
      if (material.displacementMap) material.displacementMap.dispose();
      if (material.emissiveMap) material.emissiveMap.dispose();
      if (material.gradientMap) material.gradientMap.dispose();
      if (material.metalnessMap) material.metalnessMap.dispose();
      if (material.roughnessMap) material.roughnessMap.dispose();

      material.dispose();
    }

    if (!modelContents) return;

    (async () => {
      camera = new three.PerspectiveCamera(
        75,
        container.offsetWidth / container.offsetHeight,
        1,
        10000,
      );

      renderer = new three.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true,
        alpha: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);

      renderer.setSize(container.offsetWidth, container.offsetHeight);
      renderer.setAnimationLoop(animate);
      renderer.toneMapping = three.ACESFilmicToneMapping;
      container.appendChild(renderer.domElement);

      pmremGenerator = new three.PMREMGenerator(renderer);

      scene = new three.Scene();
      scene.background = new three.Color(isDarkMode ? 0x1c1917 : 0xffffff);

      if (canvasRef) {
        canvasRef.current = renderer.domElement;
      }
      if (sceneRef) {
        sceneRef.current = scene;
      }
      if (rendererRef) {
        rendererRef.current = renderer;
      }
      if (cameraRef) {
        cameraRef.current = camera;
      }

      envTexture = pmremGenerator.fromScene(new RoomEnvironment()).texture;
      scene.environment = envTexture;

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      const lDrawLoader = new LDrawLoader();
      lDrawLoader.setConditionalLineMaterial(LDrawConditionalLineMaterial);
      lDrawLoader.setPartsLibraryPath(
        'https://raw.githubusercontent.com/mrkrstphr/ldraw-parts/main/',
      );

      // Load the parts map to eliminate 404s when resolving part paths
      const partsMapResponse = await fetch(withBasePath('data/map.json'));
      if (partsMapResponse.ok) {
        const partsMap = await partsMapResponse.json();

        // The map has paths with leading slashes like "/parts/3001.dat"
        // but the loader expects paths without leading slashes like "parts/3001.dat"
        const normalizedMap = {};
        for (const [key, value] of Object.entries(partsMap)) {
          normalizedMap[key] = value.replace(/^\//, '');
        }

        lDrawLoader.setFileMap(normalizedMap);
      }

      await lDrawLoader.preloadMaterials(
        'https://raw.githubusercontent.com/mrkrstphr/ldraw-parts/main/LDCfgalt.ldr',
      );
      lDrawLoader.smoothNormals = true;

      lDrawLoader.parse(
        modelContents,
        function (group2) {
          if (model) {
            scene.remove(model);
            disposeObject(model);
          }
          model = group2;
          model.rotation.x = Math.PI;

          scene.add(model);

          const bbox = new three.Box3().setFromObject(model);
          const size = bbox.getSize(new three.Vector3());
          const radius = Math.max(size.x, Math.max(size.y, size.z)) * 0.5;

          controls.target0.copy(bbox.getCenter(new three.Vector3()));
          controls.position0
            .set(-2.3, 1, 2)
            .multiplyScalar(radius)
            .add(controls.target0);
          controls.reset();

          onModelLoaded?.(model);
        },
        undefined,
        onError,
      );
    })();

    function onWindowResize() {
      const container = containerRef.current;
      if (!container) return;

      camera.aspect = container.offsetWidth / container.offsetHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(container.offsetWidth, container.offsetHeight);
    }

    window.addEventListener('resize', onWindowResize);

    return () => {
      // Cleanup function to prevent memory leaks
      window.removeEventListener('resize', onWindowResize);

      // Stop animation loop
      if (renderer) {
        renderer.setAnimationLoop(null);
      }

      // Dispose of controls
      if (controls) {
        controls.dispose();
      }

      // Dispose of the scene and all its objects
      if (scene) {
        scene.traverse((object) => {
          disposeObject(object);
        });
        scene.clear();
      }

      // Dispose of environment texture
      if (envTexture) {
        envTexture.dispose();
      }

      // Dispose of PMREMGenerator
      if (pmremGenerator) {
        pmremGenerator.dispose();
      }

      // Dispose of renderer
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, [containerRef, modelContents, isDarkMode, onModelLoaded]);

  return (
    <>
      {errored && (
        <div className="absolute bg-stone-300/50 dark:bg-stone-950/50 p-2 z-40 bottom-0 left-0 text-center w-full">
          Failed to load model...
        </div>
      )}
      <div
        id="container"
        ref={containerRef}
        className="w-full h-full relative z-10"
      ></div>
    </>
  );
};

export default Ldr;
