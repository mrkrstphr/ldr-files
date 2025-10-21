export function Skeleton({ className, ...props }) {
  const classes = [
    className,
    'animate-pulse h-4 bg-gray-300/50 dark:bg-gray-600/50 rounded',
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes} {...props} />;
}
