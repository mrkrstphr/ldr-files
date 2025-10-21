import { FiRefreshCw } from 'react-icons/fi';

export function LoadingSpinner({ className, ...props }) {
  const classes = [
    className,
    'bg-gray-100 dark:bg-stone-800 text-gray-400 dark:text-stone-950 rounded-full size-16 p-4 animate-spin',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="size-16 rounded-full">
      <FiRefreshCw className={classes} {...props} />
    </div>
  );
}
