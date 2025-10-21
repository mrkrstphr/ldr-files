function MultilineValue({ prefix, value }) {
  return (
    <div className="ml-4">
      {value.map((line, index) => (
        <div key={`${prefix}-${index}`}>{line}</div>
      ))}
    </div>
  );
}

export function Metadata({ metadata }) {
  const visibleMetadata = Object.entries(metadata).filter(
    ([key, value]) =>
      !key.startsWith('_') &&
      value !== null &&
      value !== undefined &&
      !(Array.isArray(value) && value.length === 0),
  );

  return (
    <div className="flex flex-col gap-0.5">
      {visibleMetadata.map(([key, value]) => (
        <div key={key}>
          <strong>{key.replace(/([a-z])([A-Z])/g, '$1 $2')}: </strong>
          {Array.isArray(value) ? (
            <MultilineValue prefix={key} value={value} />
          ) : (
            value
          )}
        </div>
      ))}
    </div>
  );
}
