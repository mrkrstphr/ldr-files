const styles = [
  'text-2xl',
  'bg-stone-200/50 hover:bg-stone-200 dark:bg-stone-900/50 dark:hover:bg-stone-900',
  'text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400',
  'cursor-pointer lg:hidden rounded p-2',
].join(' ');

export function MenuToggle({ className, children, ...props }) {
  const classes = [styles, className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
