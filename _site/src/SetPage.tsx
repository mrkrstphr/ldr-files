// @ts-nocheck
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router';

import './ldr/colors.js';
import './ldr/CopyShader.js';
import './ldr/EffectComposer.js';
import './ldr/LDRColorMaterials.js';
import './ldr/LDRGenerator.js';
import './ldr/LDRGeometries.js';
import './ldr/LDRLoader.js';
import './ldr/LDRShaders.js';
import './ldr/LDRStuds.js';
import './ldr/MaskPass.js';
import './ldr/OrbitControls.js';
import './ldr/OutlinePass.js';
import './ldr/Pass.js';
import './ldr/RenderPass.js';
import './ldr/ShaderPass.js';
import './ldr/StudioTexmap.js';

import { Color, Group, OrthographicCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { EffectComposer } from './ldr/EffectComposer.js';
import { LDRLoader } from './ldr/LDRLoader.js';
import { OrbitControls } from './ldr/OrbitControls.js';
import { RenderPass } from './ldr/RenderPass.js';

type Params = {
  theme: string;
  slug: string;
};

function setupCanvas(modelPath: string, target: HTMLElement, canvas: HTMLCanvasElement) {
  let startTime = new Date();

  let model = '/models/' + modelPath;

  const title = modelPath.substring(modelPath.lastIndexOf('/') + 1).replace('.ldr', '');

  document.title = title;

  // Set up camera:
  let camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 1000000);

  // Set up scene:
  let scene = new Scene();
  scene.background = new Color(0xffffff);

  let baseObject = new Group(),
    opaqueObject = new Group(),
    sixteenObject = new Group();
  const transObject = new Group();
  baseObject.add(opaqueObject);
  baseObject.add(sixteenObject);
  baseObject.add(transObject);
  scene.add(baseObject); // Draw non-trans before trans.
  let mc = new LDR.MeshCollector(opaqueObject, sixteenObject, transObject);

  // Set up renderer:
  let composer = null;
  let renderer = new WebGLRenderer({ antialias: true, canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  target.appendChild(renderer.domElement);

  let render = () => (composer === null ? renderer.render(scene, camera) : composer.render());

  function onWindowResize() {
    const w = target.offsetWidth;
    const h = target.offsetHeight;

    camera.left = -(camera.right = w);
    camera.bottom = -(camera.top = h);
    camera.updateProjectionMatrix();

    renderer.setSize(w, h);

    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    if (!mc.attachGlowPasses(w, h, scene, camera, composer)) {
      composer = null; // Nothing glows - just render directly.
    }
    render();
  }

  // React to user input:
  let controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener('change', render);
  window.addEventListener('resize', onWindowResize, false);

  // Three.js loader for LDraw models:
  let ldrLoader;

  let onLoad = function () {
    ldrLoader.generate(14, mc);

    // Find center of drawn model:
    let b = mc.boundingBox;

    let elementCenter = new Vector3();
    b.getCenter(elementCenter);
    baseObject.position.set(-elementCenter.x, -elementCenter.y, -elementCenter.z);

    let size = b.min.distanceTo(b.max);
    camera.position.set(size, 0.7 * size, size);
    camera.lookAt(new Vector3());
    camera.far = 2 * size;
    camera.zoom = (1.5 * target.offsetWidth) / size;
    onWindowResize();

    console.log('Model rendered in ' + (new Date() - startTime) + 'ms.');
  };

  LDR.Studs.makeGenerators('', 0, 1);
  ldrLoader = new LDRLoader(onLoad, null, {
    cleanUpPrimitivesAndSubParts: false,
    onFileLoadedd: (file, contents) => {
      if (file === model) {
        parseHeaders(contents);
      }
    },
  });
  ldrLoader.load(model);

  function parseHeaders(contents) {
    const headers = [];

    contents.split('\n').forEach((line) => {
      if (line.trim().substring(0, 1) === '0') {
        headers.push(line.trim());
      }
    });
  }

  return () => {
    window.removeEventListener('resize', onWindowResize, false);
  };
}

export default function SetPage() {
  const { theme, slug } = useParams<Params>();
  const canvasRef = useRef(null);
  const targetRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      const cleanup = setupCanvas(
        `${theme?.replace('_', ' ')}/${slug!.replace('_', ' ')}.ldr`,
        targetRef.current,
        canvasRef.current,
      );

      return cleanup;
    }
  }, [canvasRef, theme, slug]);

  return (
    <div className="flex flex-col h-full space-y-4">
      <h2 className="text-2xl">
        {theme.replace('_', ' ')} / {slug.replace('_', ' ')}
      </h2>
      <div ref={targetRef} className="flex-1">
        <canvas ref={canvasRef}></canvas>
      </div>
      <p>
        Rendering code from{' '}
        <a href="https://github.com/LasseD/buildinginstructions.js/">buildinginstructions.js</a>.
        Part models provided by the <a href="https://www.ldraw.org/">LDraw project</a>.
      </p>
    </div>
  );
}
