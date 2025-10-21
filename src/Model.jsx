import { useEffect, useState } from 'react';
import { FiInfo, FiX } from 'react-icons/fi';
import { Metadata } from './components/Metadata.jsx';
import Ldr from './Ldr';
import { getModelMetadata } from './lib/getModelMetadata.js';
import { getSubmodel } from './lib/getSubmodel.js';

export function Model({ modelFile }) {
  const [fileContents, setFileContents] = useState();
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState({});
  const [subModels, setSubModels] = useState([]);
  const [selectedSubModel, setSelectedSubModel] = useState('');
  const [metadataOpen, setMetadataOpen] = useState(false);

  useEffect(() => {
    if (!modelFile) return;
    fetch(`models/${modelFile}`)
      .then((res) => res.text())
      .then((text) => {
        setFileContents(text);
        const metadata = getModelMetadata(text);
        setMetadata(metadata);
        const submodels = (metadata._submodels ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        setSubModels(submodels);
      });
  }, [modelFile]);

  useEffect(() => {
    setLoading(true);
  }, [selectedSubModel]);

  const decodedModel = decodeURIComponent(modelFile);
  const prettyModelName = decodedModel
    .substring(0, decodedModel.lastIndexOf('.'))
    .replace('/', ' / ');

  const handleOnModelLoaded = () => setLoading(false);

  return (
    <div className="h-full relative">
      <div className="absolute z-40 w-full">
        <div className="bg-stone-300/50 dark:bg-stone-950/50 p-2">
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
        {subModels.length > 0 && (
          <div className="flex justify-end w-full">
            <div className="inline-flex items-center gap-2 m-4">
              <div>Submodels:</div>
              <select
                onChange={(e) => setSelectedSubModel(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="">-- Full Model --</option>
                {subModels.map((subModel) => (
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
        <div className="absolute z-40 top-[50%] left-0 text-center w-full">
          <span className="bg-stone-300/50 dark:bg-stone-950/50 p-4">
            Loading...
          </span>
        </div>
      )}
      <Ldr
        model={
          selectedSubModel
            ? getSubmodel(fileContents, selectedSubModel)
            : fileContents
        }
        onModelLoaded={handleOnModelLoaded}
      />
    </div>
  );
}
