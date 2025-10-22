import { useCallback, useEffect, useState } from 'react';
import { FiInfo, FiX } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useModel } from '../../hooks/useModel';
import { getSubmodel } from '../../lib/getSubmodel';
import Ldr from './Ldr';
import { Metadata } from './Metadata';

export function Model() {
  const { modelSlug } = useParams();
  const { contents, metadata, submodels, altModels, defaultModel, title } =
    useModel(modelSlug);
  const [loading, setLoading] = useState(true);
  const [selectedSubModel, setSelectedSubModel] = useState('');
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [numBuildingSteps, setNumBuildingSteps] = useState(0);
  const [currentBuildingStep, setCurrentBuildingStep] = useState(0);
  const [model, setModel] = useState(null);

  const handleOnModelLoaded = useCallback((model) => {
    setLoading(false);

    setNumBuildingSteps(model.userData.numBuildingSteps || 1);
    setCurrentBuildingStep(model.userData.numBuildingSteps || 0);

    setModel(model);
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
    setLoading(true);
    setSelectedSubModel('');
  }, [modelSlug]);

  useEffect(() => {
    if (defaultModel) setSelectedSubModel(defaultModel);
  }, [defaultModel]);

  useEffect(() => setLoading(true), [contents, selectedSubModel]);

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
                onChange={(e) => setSelectedSubModel(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
      </div>
      {loading && (
        <div className="absolute z-40 top-[50%] left-0 flex items-center justify-center w-full">
          <LoadingSpinner />
        </div>
      )}
      <Ldr
        key={modelSlug + selectedSubModel}
        model={
          selectedSubModel ? getSubmodel(contents, selectedSubModel) : contents
        }
        onModelLoaded={handleOnModelLoaded}
      />
      {numBuildingSteps > 1 && metadata?._stepReady === 'true' && (
        <div className="absolute z-40 bottom-4 left-0 w-full px-8">
          <input
            id="minmax-range"
            type="range"
            min={0}
            max={numBuildingSteps}
            value={currentBuildingStep}
            className="w-full h-2 bg-stone-200 flex-1 rounded-lg appearance-none cursor-pointer dark:bg-stone-700"
            onChange={(e) => setCurrentBuildingStep(Number(e.target.value))}
          />
        </div>
      )}
    </div>
  );
}
