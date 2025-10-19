import { useEffect, useState } from 'react';
import { FiChevronDown, FiChevronUp, FiMenu, FiX } from 'react-icons/fi';
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

function Menu({ models, onSelectModel }) {
  return (
    <div>
      {Object.keys(models).map((category, index) => (
        <Category
          key={category}
          name={category}
          models={models[category]}
          defaultExpanded={index === 0}
          onSelectModel={onSelectModel}
        />
      ))}
    </div>
  );
}

function App() {
  const model = new URLSearchParams(window.location.search).get('model');
  const [selectedModel, setSelectedModel] = useState(
    model ? decodeURIComponent(model) : null,
  );
  const [models, setModels] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="relative h-dvh">
      <div
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } absolute top-0 left-0 p-4 w-full h-dvh bg-gray-50 dark:bg-stone-950 z-50`}
      >
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-2xl font-bold flex-1">Models</h2>
          <div
            className="text-2xl cursor-pointer lg:hidden bg-stone-200/50 hover:bg-stone-200 text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400  dark:bg-stone-900/50 dark:hover:bg-stone-900 rounded p-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <FiX />
          </div>
        </div>
        <Menu
          models={models}
          onSelectModel={(model) => {
            setSelectedModel(model);
            setMobileMenuOpen(false);
          }}
        />
      </div>
      <div className="grid grid-rows-[auto_1fr_auto] grid-cols-[auto_1fr] h-dvh min-h-0">
        <div className="h-24 flex items-center gap-2 p-4 bg-stone-50 dark:bg-stone-950 col-start-1 col-end-4">
          <h1 className="text-4xl flex-1">LDR Files</h1>
          <div
            className="text-2xl cursor-pointer lg:hidden bg-stone-200/50 hover:bg-stone-200 text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400  dark:bg-stone-900/50 dark:hover:bg-stone-900 rounded p-2"
            onClick={() => setMobileMenuOpen(true)}
          >
            <FiMenu />
          </div>
        </div>
        <div className="w-64 p-4 bg-stone-50 dark:bg-stone-950 overflow-auto col-start-1 col-end-2 hidden lg:block">
          <div className="text-lg font-bold mb-1">Models</div>
          <Menu models={models} onSelectModel={setSelectedModel} />
        </div>
        <div className="col-start-2 col-end-4 min-h-0">
          {selectedModel && (
            <Ldr key={selectedModel} modelFile={selectedModel} />
          )}
        </div>
        <div className="col-start-1 col-end-4 p-4 lg:pl-64 bg-stone-50 text-center dark:bg-stone-950">
          Models are &copy; The LEGO Group. This softare uses the{' '}
          <a href="https://ldraw.org">LDraw Parts Library</a>.
        </div>
      </div>
    </div>
  );
}

export default App;
