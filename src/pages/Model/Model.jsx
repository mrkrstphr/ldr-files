import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  FiCamera,
  FiDownload,
  FiInfo,
  FiMaximize,
  FiMinimize,
  FiPause,
  FiPlay,
  FiX,
} from 'react-icons/fi';
import { TbRepeat, TbRepeatOff } from 'react-icons/tb';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useModel } from '../../hooks/useModel';
import { getSubmodel } from '../../lib/getSubmodel';
import { Debug } from './Debug';
import Ldr from './Ldr';
import { Metadata } from './Metadata';
import { initialState, modelReducer } from './modelReducer';
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

  const [state, dispatch] = useReducer(modelReducer, initialState);
  const {
    loading,
    metadataOpen,
    selectedSubModel,
    model,
    numBuildingSteps,
    currentBuildingStep,
    isPlaying,
    playSpeed,
    looping,
    direction,
  } = state;

  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const containerRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleOnModelLoaded = useCallback((model) => {
    dispatch({
      type: 'MODEL_LOADED',
      payload: {
        model,
        numBuildingSteps: model.userData.numBuildingSteps || 1,
      },
    });
  }, []);

  const handlePlayClick = () => {
    dispatch({ type: 'PLAY' });
  };

  const handleSelectSubModel = (e) => {
    dispatch({ type: 'SELECT_SUBMODEL', payload: e.target.value });
  };

  const handlePauseClick = () => {
    dispatch({ type: 'PAUSE' });
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

  const handleTakeScreenshot = () => {
    if (
      !canvasRef.current ||
      !sceneRef.current ||
      !rendererRef.current ||
      !cameraRef.current
    ) {
      console.error('Screenshot resources not available');
      return;
    }

    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const baseName = fileName?.substr(0, fileName.lastIndexOf('.')) || 'model';
    const screenshotName = selectedSubModel
      ? `${baseName} - ${selectedSubModel}.png`
      : `${baseName}.png`;

    try {
      const originalBackground = scene.background;
      scene.background = null;

      renderer.render(scene, camera);

      canvas.toBlob(
        (blob) => {
          scene.background = originalBackground;

          if (!blob) {
            console.error('Failed to create blob from canvas');
            return;
          }

          const url = URL.createObjectURL(blob);
          const element = document.createElement('a');
          element.href = url;
          element.download = screenshotName;
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
          URL.revokeObjectURL(url);
        },
        'image/png',
        1.0,
      );
    } catch (error) {
      console.error('Screenshot failed:', error);
    }
  };

  const handleToggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen failed:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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
    dispatch({ type: 'RESET_FOR_NEW_MODEL' });

    window.goatcounter?.count({
      path: `${window.location.pathname}${window.location.search}`,
    });
  }, [modelSlug]);

  useEffect(() => {
    if (defaultModel) {
      dispatch({ type: 'SET_DEFAULT_SUBMODEL', payload: defaultModel });
    }
  }, [defaultModel]);

  useEffect(() => {
    dispatch({ type: 'START_LOADING' });
  }, [contents]);

  const intervalRef = useRef(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 150 / playSpeed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, playSpeed]);

  const modelSelection =
    submodels && submodels.length > 0 ? submodels : altModels;
  const modelSelectionLabel =
    submodels && submodels.length > 0 ? 'Submodels' : 'Alternative Models';

  return (
    <div className="h-full relative" ref={containerRef}>
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
              onClick={() => dispatch({ type: 'TOGGLE_METADATA' })}
            >
              {metadataOpen ? <FiX /> : <FiInfo />}
            </div>
            <div className="ml-auto inline-flex items-center gap-4 mr-2 text-sm">
              <div
                className="cursor-pointer inline-flex items-center gap-1"
                onClick={handleToggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <FiMinimize /> : <FiMaximize />}
                <span className="hidden md:inline">
                  {isFullscreen ? 'Exit' : 'Fullscreen'}
                </span>
              </div>
              <div
                className="cursor-pointer inline-flex items-center gap-1"
                onClick={handleTakeScreenshot}
                title="Take Screenshot"
              >
                <FiCamera />
                <span className="hidden md:inline">Screenshot</span>
              </div>
              <div
                className="cursor-pointer inline-flex items-center gap-1"
                onClick={handleDownloadModel}
                title="Download LDR File"
              >
                <FiDownload />
                <span className="hidden md:inline">Download</span>
              </div>
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
          canvasRef={canvasRef}
          sceneRef={sceneRef}
          rendererRef={rendererRef}
          cameraRef={cameraRef}
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
            onChange={(e) =>
              dispatch({
                type: 'SET_BUILDING_STEP',
                payload: Number(e.target.value),
              })
            }
          />
          <div className="border cursor-pointer border-stone-200 dark:border-stone-700 rounded p-1">
            {isPlaying ? (
              <FiPause onClick={handlePauseClick} />
            ) : (
              <FiPlay onClick={handlePlayClick} />
            )}
          </div>

          <PlaybackSpeed
            playSpeed={playSpeed}
            setPlaySpeed={(speed) =>
              dispatch({ type: 'SET_PLAY_SPEED', payload: speed })
            }
          />

          <div className="border cursor-pointer border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 rounded p-1">
            {looping ? (
              <TbRepeat onClick={() => dispatch({ type: 'TOGGLE_LOOPING' })} />
            ) : (
              <TbRepeatOff
                onClick={() => dispatch({ type: 'TOGGLE_LOOPING' })}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
