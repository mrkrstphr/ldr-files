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
  return (
    <div className="flex flex-col gap-0.5">
      {Object.entries(metadata).map(([key, value]) => (
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
