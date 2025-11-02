export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  const classes = [
    className,
    'animate-pulse h-4 bg-gray-300/50 dark:bg-gray-600/50 rounded',
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes} {...props} />;
}
