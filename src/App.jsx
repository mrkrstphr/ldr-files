import { useEffect, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import Ldr from './Ldr';

function prettyModelName(name) {
  return name.replace('.ldr', '').substring(name.lastIndexOf('/') + 1);
}

function Category({ defaultExpanded = false, name, models, onSelectModel }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-1">
      <div
        className="font-semibold cursor-pointer flex gap-1 items-start"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <FiChevronUp className="inline shrink-0 mt-1" />
        ) : (
          <FiChevronDown className="inline shrink-0 mt-1" />
        )}
        <span>
          {name} ({models.length})
        </span>
      </div>
      {expanded && (
        <div className="ml-5">
          {models.map((model) => (
            <div key={model}>
              <a
                href={`?model=${encodeURIComponent(model)}`}
                onClick={(e) => {
                  e.preventDefault();
                  const url = new URL(window.location.href);
                  url.searchParams.set('model', encodeURIComponent(model));
                  window.history.replaceState({}, '', url);
                  onSelectModel(model);
                }}
              >
                {prettyModelName(model)}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [selectedModel, setSelectedModel] = useState(
    new URLSearchParams(window.location.search).get('model'),
  );
  const [models, setModels] = useState({});

  useEffect(() => {
    fetch('/ldr-files/models.json')
      .then((res) => res.json())
      .then((data) => {
        setModels(data);
        // pick a random model to start with
        const categories = Object.keys(data);
        if (categories.length > 0) {
          const firstCategory = categories[0];
          if (data[firstCategory] && data[firstCategory].length > 0) {
            setSelectedModel((value) => value ?? data[firstCategory][0]);
          }
        }
      });
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="h-24 p-4 bg-stone-50 dark:bg-stone-950 text-4xl">
        LDR Files
      </div>
      <div className="h-full flex">
        <div className="w-64 p-4 bg-stone-50 dark:bg-stone-950 overflow-scroll">
          <div className="text-lg font-bold mb-1">Models</div>

          {Object.keys(models).map((category, index) => (
            <Category
              key={category}
              name={category}
              models={models[category]}
              defaultExpanded={index === 0}
              onSelectModel={setSelectedModel}
            />
          ))}
        </div>
        <div className="flex-1">
          {selectedModel && (
            <Ldr key={selectedModel} modelFile={selectedModel} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
