import { Skeleton } from '../Skeleton';
import { Category } from './Category';

export function Menu({ models, onSelectModel }) {
  return (
    <div>
      {models ? (
        Object.keys(models).map((category, index) => (
          <Category
            key={category}
            name={category}
            models={models[category]}
            defaultExpanded={index === 0}
            onSelectModel={onSelectModel}
          />
        ))
      ) : (
        <div className="flex flex-col gap-2">
          <Skeleton /> <Skeleton className="max-w-[75%]" />
          <Skeleton className="max-w-[85%]" />
          <Skeleton />
          <Skeleton className="max-w-[60%]" />
        </div>
      )}
    </div>
  );
}
