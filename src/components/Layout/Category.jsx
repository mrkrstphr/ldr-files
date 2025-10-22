import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { prettyModelName } from '../../lib/prettyModelName';

export function Category({
  defaultExpanded = false,
  name,
  models,
  onSelectModel,
}) {
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
            <div key={model.file}>
              <Link to={`/model/${model.slug}`} onClick={onSelectModel}>
                {prettyModelName(model.file)}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
