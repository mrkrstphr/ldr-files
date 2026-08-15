import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import {
  FiCamera,
  FiDownload,
  FiInfo,
  FiMaximize,
  FiMinimize,
  FiPause,
  FiPlay,
} from 'react-icons/fi';
import { TbRepeat, TbRepeatOff } from 'react-icons/tb';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useModel } from '../../hooks/useModel';
import { getSubmodel } from '../../lib/getSubmodel';
import { prettyModelName } from '../../lib/prettyModelName';
import { splitPlus } from '../../lib/splitPlus';
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
    submodels && submodels.length > 0 ? 'Submodels' : 'Alt. Build';

  const [fallbackNum, ...fallbackRest] = fileName
    ? splitPlus(prettyModelName(fileName), ' ', 2)
    : [];
  const setNumber = metadata?.SetNumber || fallbackNum;
  const setName = metadata?.Name || fallbackRest.join(' ') || title;
  const isIncomplete = (metadata?.Labels ?? []).includes('incomplete');
  const buildProgress =
    numBuildingSteps > 0 ? (currentBuildingStep / numBuildingSteps) * 100 : 0;

  return (
    <div
      className="h-full relative"
      ref={containerRef}
      style={{
        background:
          'radial-gradient(circle at 25% 15%, color-mix(in srgb, var(--accent-purple) 16%, transparent), transparent 55%), radial-gradient(circle at 80% 85%, color-mix(in srgb, var(--accent-blue) 14%, transparent), transparent 55%), var(--surface-2)',
      }}
    >
      <div className="absolute z-40 top-4 left-4 right-4 flex flex-col gap-2.5">
        <div className="glass-panel flex flex-wrap items-center gap-3 px-3.5 py-2.5">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            {setNumber && (
              <span
                className="code flex-shrink-0 rounded-md border px-1.5 py-0.5 text-[11px]"
                style={{
                  color: 'var(--text-faint)',
                  borderColor: 'var(--border)',
                  background: 'var(--surface-2)',
                }}
              >
                #{setNumber}
              </span>
            )}
            <span className="display truncate text-[15px] font-bold">
              {setName}
            </span>
            {isIncomplete && (
              <span className="pill-badge warn flex-shrink-0">
                Incomplete
              </span>
            )}
          </div>

          {(modelSelection ?? []).length > 0 && (
            <select
              onChange={handleSelectSubModel}
              className="stage-select"
              title={modelSelectionLabel}
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
          )}

          <div className="flex items-center gap-1">
            <button
              className={`icon-btn ${metadataOpen ? 'on' : ''}`}
              onClick={() => dispatch({ type: 'TOGGLE_METADATA' })}
              title="Details"
            >
              <FiInfo />
            </button>
            <button
              className="icon-btn"
              onClick={handleToggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <FiMinimize /> : <FiMaximize />}
            </button>
            <button
              className="icon-btn"
              onClick={handleTakeScreenshot}
              title="Take Screenshot"
            >
              <FiCamera />
            </button>
            <button
              className="icon-btn"
              onClick={handleDownloadModel}
              title="Download LDR File"
            >
              <FiDownload />
            </button>
          </div>
        </div>

        {metadataOpen && metadata && (
          <div className="glass-panel p-3.5">
            <Metadata metadata={metadata} />
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
        <div className="glass-panel absolute z-40 bottom-4 left-4 right-4 flex items-center gap-2.5 px-3.5 py-2.5">
          <button className="icon-btn flex-shrink-0" title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
              <FiPause onClick={handlePauseClick} />
            ) : (
              <FiPlay onClick={handlePlayClick} />
            )}
          </button>

          <input
            id="minmax-range"
            type="range"
            min={0}
            max={numBuildingSteps}
            value={currentBuildingStep}
            className="stage-range flex-1"
            style={{
              background: `linear-gradient(to right, var(--accent-red) ${buildProgress}%, var(--border) ${buildProgress}%)`,
            }}
            onChange={(e) =>
              dispatch({
                type: 'SET_BUILDING_STEP',
                payload: Number(e.target.value),
              })
            }
          />

          <div
            className="code flex-shrink-0 text-[11.5px]"
            style={{ color: 'var(--text-faint)' }}
          >
            {currentBuildingStep} / {numBuildingSteps}
          </div>

          <PlaybackSpeed
            playSpeed={playSpeed}
            setPlaySpeed={(speed) =>
              dispatch({ type: 'SET_PLAY_SPEED', payload: speed })
            }
          />

          <button
            className={`icon-btn flex-shrink-0 ${looping ? 'on' : ''}`}
            title={looping ? 'Looping On' : 'Looping Off'}
          >
            {looping ? (
              <TbRepeat onClick={() => dispatch({ type: 'TOGGLE_LOOPING' })} />
            ) : (
              <TbRepeatOff
                onClick={() => dispatch({ type: 'TOGGLE_LOOPING' })}
              />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
