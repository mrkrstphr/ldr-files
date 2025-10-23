import { useEffect, useRef, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Skeleton } from '../Skeleton';
import { Category } from './Category';

const searchModels = (models, searchTerm) =>
  Object.fromEntries(
    Object.entries(models)
      .map(([category, models]) => [
        category,
        models.filter((m) =>
          m.file.toLowerCase().trim().includes(searchTerm.toLowerCase().trim()),
        ),
      ])
      .filter(([, models]) => models.length > 0),
  );

export function Menu({ models, onSelectModel }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredModels, setFilteredModels] = useState(models);

  const intervalRef = useRef(null);
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!searchTerm || searchTerm.trim() === '') setFilteredModels(models);

    intervalRef.current = setTimeout(() => {
      intervalRef.current = null;

      setFilteredModels(searchModels(models, searchTerm));
    }, 500);
  }, [models, searchTerm, setFilteredModels]);

  const hasResults = Object.keys(filteredModels ?? {}).length > 0;

  return (
    <div>
      <div className="mt-2 mb-4">
        <label htmlFor="modelSearch" className="sr-only">
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <FiSearch
              className="size-4 text-stone-500 dark:text-stone-400"
              aria-hidden="true"
            />
          </div>
          <input
            id="modelSearch"
            type="search"
            className="block w-full p-2 ps-10 text-sm text-stone-900 rounded-lg border border-stone-300 focus:border-stone-400 bg-stone-50 focus:outline-none dark:bg-stone-900 dark:border-stone-800 dark:focus:border-stone-700 dark:placeholder-stone-500 dark:text-gray-100"
            placeholder="Search sets..."
            required
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {hasResults ? (
        Object.keys(filteredModels).map((category, index) => (
          <Category
            key={category}
            name={category}
            models={filteredModels[category]}
            defaultExpanded={index === 0}
            onSelectModel={onSelectModel}
          />
        ))
      ) : !hasResults && searchTerm?.length > 0 ? (
        <div>No results found</div>
      ) : (
        <div className="flex flex-col gap-2">
          <Skeleton />
          <Skeleton className="max-w-[75%]" />
          <Skeleton className="max-w-[85%]" />
          <Skeleton />
          <Skeleton className="max-w-[60%]" />
        </div>
      )}
    </div>
  );
}
