import { useCallback, useEffect, useRef, useState } from 'react';
import { FiDownload, FiInfo, FiPause, FiPlay, FiX } from 'react-icons/fi';
import { TbRepeat, TbRepeatOff } from 'react-icons/tb';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useModel } from '../../hooks/useModel';
import { getSubmodel } from '../../lib/getSubmodel';
import { Debug } from './Debug';
import Ldr from './Ldr';
import { Metadata } from './Metadata';
import { PlaybackSpeed } from './PlaybackSpeed';

export function Model() {
  const { modelSlug } = useParams();
  const info = useModel(modelSlug);
  const {
    contents,
    fileName,
    metadata,
    submodels,
    altModels,
    defaultModel,
    title,
    loading: modelLoading,
    error: modelError,
  } = info;

  // TODO: FIXME: holy state, batman... maybe use useReducer?
  const [loading, setLoading] = useState(true);
  const [selectedSubModel, setSelectedSubModel] = useState('');
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [numBuildingSteps, setNumBuildingSteps] = useState(0);
  const [currentBuildingStep, setCurrentBuildingStep] = useState(0);
  const [model, setModel] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [looping, setLooping] = useState(false);
  const [direction, setDirection] = useState(1);

  const handleOnModelLoaded = useCallback((model) => {
    setLoading(false);

    setNumBuildingSteps(model.userData.numBuildingSteps || 1);
    setCurrentBuildingStep(model.userData.numBuildingSteps || 1);

    setModel(model);
  }, []);

  const handlePlayClick = () => {
    setIsPlaying(true);
    if (currentBuildingStep >= numBuildingSteps) {
      setCurrentBuildingStep(0);
    }
  };

  const handleSelectSubModel = (e) => {
    setSelectedSubModel(e.target.value);
    setIsPlaying(false);
    setLoading(true);
  };

  const handlePauseClick = () => {
    setIsPlaying(false);
  };

  const handleDownloadModel = () => {
    const baseName = fileName.substr(0, fileName.lastIndexOf('.'));
    const extension = fileName.substr(fileName.lastIndexOf('.'));
    const modelFileName = selectedSubModel
      ? `${baseName} - ${selectedSubModel}${extension}`
      : fileName;

    const element = document.createElement('a');
    const file = new Blob(
      [selectedSubModel ? getSubmodel(contents, selectedSubModel) : contents],
      { type: 'text/plain' },
    );

    element.href = URL.createObjectURL(file);
    element.download = modelFileName;

    document.body.appendChild(element);

    element.click();
  };

  useEffect(() => {
    if (model) {
      model.traverse((c) => {
        if (c.isLineSegments) {
          c.visible = true;
        } else if (c.isGroup) {
          c.visible = c.userData.buildingStep <= currentBuildingStep;
        }
      });
    }
  }, [currentBuildingStep, model]);

  useEffect(() => {
    // maybe should use helmet or something?
    if (title) {
      const titlePart = title?.split(' / ');
      document.title = `${titlePart[titlePart.length - 1]} :: LDR Viewer`;
    }
  }, [title]);

  useEffect(() => {
    setLoading(true);
    setSelectedSubModel('');
    setIsPlaying(false);

    window.goatcounter?.count({
      path: `${window.location.pathname}${window.location.search}`,
    });
  }, [modelSlug]);

  useEffect(() => {
    if (defaultModel) setSelectedSubModel(defaultModel);
  }, [defaultModel]);

  useEffect(() => setLoading(true), [contents]);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentBuildingStep((step) => {
          if (step === numBuildingSteps) {
            if (looping) {
              setDirection(-1);
              return step + direction * -1;
            }

            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsPlaying(false);
            return step;
          } else if (step === 0 && direction === -1) {
            setDirection(1);
            return step + 1;
          }

          return Math.min(step + direction, numBuildingSteps);
        });
      }, 150 / playSpeed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [direction, isPlaying, looping, numBuildingSteps, playSpeed]);

  const modelSelection =
    submodels && submodels.length > 0 ? submodels : altModels;
  const modelSelectionLabel =
    submodels && submodels.length > 0 ? 'Submodels' : 'Alternative Models';

  return (
    <div className="h-full relative">
      <div className="absolute z-40 w-full">
        <div className="bg-stone-300/50 dark:bg-stone-950/50 p-2 lg:rounded-tl-lg">
          <div className="flex items-center gap-2">
            <div>{title}</div>
            {(metadata?.Labels ?? []).includes('incomplete') && (
              <div className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-sm dark:bg-red-900 dark:text-red-300">
                Incomplete
              </div>
            )}
            <div
              className="cursor-pointer"
              onClick={() => setMetadataOpen(!metadataOpen)}
            >
              {metadataOpen ? <FiX /> : <FiInfo />}
            </div>
            <div
              className="ml-auto cursor-pointer inline-flex items-center gap-1 mr-2 text-sm"
              onClick={handleDownloadModel}
            >
              <FiDownload />
              <span className="hidden md:block">Download Model</span>
            </div>
          </div>
          <div className={`mt-2 ${metadataOpen ? 'block' : 'hidden'}`}>
            {metadata && <Metadata metadata={metadata} />}
          </div>
        </div>
        {(modelSelection ?? []).length > 0 && (
          <div className="flex justify-end w-full">
            <div className="inline-flex items-center gap-2 m-4">
              <div>{modelSelectionLabel}:</div>
              <select
                onChange={handleSelectSubModel}
                className="bg-stone-50 border border-stone-300 text-stone-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-stone-700 dark:border-stone-600 dark:placeholder-stone-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                {!defaultModel && <option value="">-- Full Model --</option>}
                {modelSelection.map((subModel) => (
                  <option
                    key={subModel}
                    value={subModel}
                    selected={subModel === selectedSubModel}
                  >
                    {subModel}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {!loading && import.meta.env.DEV && (
          <div className="text-right">
            <Debug
              info={info}
              numBuildingSteps={numBuildingSteps}
              currentBuildingStep={currentBuildingStep}
              selectedSubModel={selectedSubModel}
              isPlaying={isPlaying}
              looping={looping}
              direction={direction}
              playSpeed={playSpeed}
            />
          </div>
        )}
      </div>
      {(loading || modelLoading) && !modelError && (
        <div className="absolute z-40 top-[50%] left-0 flex items-center justify-center w-full">
          <LoadingSpinner />
        </div>
      )}
      {modelError && (
        <div className="absolute z-40 top-[50%] left-0 flex items-center justify-center w-full px-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/50 dark:border-red-700 dark:text-red-200 max-w-md">
            <div className="font-bold mb-2">Error Loading Model</div>
            <div>{modelError}</div>
          </div>
        </div>
      )}
      {!modelLoading && !modelError && (
        <Ldr
          key={modelSlug + selectedSubModel}
          model={
            selectedSubModel
              ? getSubmodel(contents, selectedSubModel)
              : contents
          }
          onModelLoaded={handleOnModelLoaded}
        />
      )}
      {numBuildingSteps > 1 && metadata?._stepReady === 'true' && (
        <div className="absolute z-40 bottom-4 left-0 w-full px-8 flex gap-2 items-center">
          <input
            id="minmax-range"
            type="range"
            min={0}
            max={numBuildingSteps}
            value={currentBuildingStep}
            className="w-full h-2 bg-stone-200 flex-1 rounded-lg appearance-none cursor-pointer dark:bg-stone-700"
            onChange={(e) => setCurrentBuildingStep(Number(e.target.value))}
          />
          <div className="border cursor-pointer border-stone-200 dark:border-stone-700 rounded p-1">
            {isPlaying ? (
              <FiPause onClick={handlePauseClick} />
            ) : (
              <FiPlay onClick={handlePlayClick} />
            )}
          </div>

          <PlaybackSpeed playSpeed={playSpeed} setPlaySpeed={setPlaySpeed} />

          <div className="border cursor-pointer border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 rounded p-1">
            {looping ? (
              <TbRepeat onClick={() => setLooping(false)} />
            ) : (
              <TbRepeatOff onClick={() => setLooping(true)} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
