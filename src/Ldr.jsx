import { useEffect, useRef, useState } from 'react';
import { FiInfo, FiX } from 'react-icons/fi';
import * as three from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { LDrawLoader } from 'three/addons/loaders/LDrawLoader.js';
import { LDrawConditionalLineMaterial } from 'three/addons/materials/LDrawConditionalLineMaterial.js';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { Metadata } from './components/Metadata.jsx';
import { usePrefersDarkMode } from './hooks/usePrefersDarkMode.js';
import { getModelMetadata } from './lib/getModelMetadata.js';
import { getRootSubmodels } from './lib/getRootSubmodels.js';
import { getSubmodel } from './lib/getSubmodel.js';

const Ldr = ({ modelFile }) => {
  const isDarkMode = usePrefersDarkMode();
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [fileContents, setFileContents] = useState();
  const [metadata, setMetadata] = useState({});
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [subModels, setSubModels] = useState([]);
  const [selectedSubModel, setSelectedSubModel] = useState('');

  useEffect(() => {
    if (!modelFile) return;
    fetch(`models/${modelFile}`)
      .then((res) => res.text())
      .then((text) => {
        setFileContents(text);
        setMetadata(getModelMetadata(text));
        const submodels = getRootSubmodels(text);
        console.log('submodels', submodels);
        setSubModels(submodels);
      });
  }, [modelFile]);

  function onError(error) {
    setErrored(true);
    console.error(error);
  }

  useEffect(() => {
    // wait until we know dark mode preference before trying to render anything to prevent flickering
    if (isDarkMode === undefined) return;
    if (!containerRef.current) return;
    const container = containerRef.current;

    let camera, scene, renderer, controls;
    let model;

    function animate() {
      controls.update();
      render();
    }

    function render() {
      renderer.render(scene, camera);
    }

    if (!fileContents) return;

    (async () => {
      // if container has a child element of canvas, destroy it
      if (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      camera = new three.PerspectiveCamera(
        75,
        container.offsetWidth / container.offsetHeight,
        1,
        10000,
      );

      renderer = new three.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);

      renderer.setSize(container.offsetWidth, container.offsetHeight);
      renderer.setAnimationLoop(animate);
      renderer.toneMapping = three.ACESFilmicToneMapping;
      container.appendChild(renderer.domElement);

      const pmremGenerator = new three.PMREMGenerator(renderer);

      scene = new three.Scene();
      scene.background = new three.Color(isDarkMode ? 0x1c1917 : 0xffffff);
      scene.environment = pmremGenerator.fromScene(
        new RoomEnvironment(),
      ).texture;

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      const lDrawLoader = new LDrawLoader();
      lDrawLoader.setConditionalLineMaterial(LDrawConditionalLineMaterial);
      lDrawLoader.setPartsLibraryPath(
        'https://raw.githubusercontent.com/mrkrstphr/ldraw-parts/main/',
      );
      await lDrawLoader.preloadMaterials(
        'https://raw.githubusercontent.com/mrkrstphr/ldraw-parts/main/LDCfgalt.ldr',
      );
      lDrawLoader.smoothNormals = true;

      lDrawLoader.parse(
        selectedSubModel
          ? getSubmodel(fileContents, selectedSubModel)
          : fileContents,
        function (group2) {
          setLoading(false);
          if (model) {
            scene.remove(model);
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

          if (subModels.length > 1) {
            const gui = new GUI({ container: containerRef.current });
            gui
              .add({ 'Sub Model': selectedSubModel }, 'Sub Model', [
                '',
                ...subModels,
              ])
              .onChange((value) => setSelectedSubModel(value));
          }
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

    // window.removeEventListener('resize', onWindowResize);
    window.addEventListener('resize', onWindowResize);

    return () => window.removeEventListener('resize', onWindowResize);
  }, [containerRef, fileContents, isDarkMode, selectedSubModel, subModels]);

  useEffect(() => {}, [loading]);

  const decodedModel = decodeURIComponent(modelFile);
  const prettyModelName = decodedModel
    .substring(0, decodedModel.lastIndexOf('.'))
    .replace('/', ' / ');

  return (
    <div className="h-full relative">
      <div className="absolute z-40 w-full bg-stone-300/50 dark:bg-stone-950/50 p-2">
        <div className="flex items-center gap-2">
          <div>{prettyModelName}</div>
          <div
            className="cursor-pointer"
            onClick={() => setMetadataOpen(!metadataOpen)}
          >
            {metadataOpen ? <FiX /> : <FiInfo />}
          </div>
        </div>
        <div className={`mt-2 ${metadataOpen ? 'block' : 'hidden'}`}>
          <Metadata metadata={metadata} />
        </div>
      </div>
      {loading && (
        <div className="absolute z-40 top-[50%] left-0 text-center w-full">
          <span className="bg-stone-300/50 dark:bg-stone-950/50 p-4">
            Loading...
          </span>
        </div>
      )}
      {errored && (
        <div className="absolute bg-stone-300/50 dark:bg-stone-950/50 p-2 z-40 bottom-0 left-0 text-center w-full">
          Filed to load model...
        </div>
      )}
      <div
        id="container"
        ref={containerRef}
        className="w-full h-full relative z-10"
      ></div>
    </div>
  );
};

export default Ldr;
