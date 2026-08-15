function formatKey(key) {
  return key.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function Metadata({ metadata }) {
  const entries = Object.entries(metadata).filter(
    ([key, value]) =>
      !key.startsWith('_') &&
      key !== 'Name' &&
      key !== 'Notes' &&
      value !== null &&
      value !== undefined &&
      !(Array.isArray(value) && value.length === 0),
  );

  const notes = metadata.Notes;
  const hasNotes = Array.isArray(notes) && notes.length > 0;

  if (entries.length === 0 && !hasNotes) return null;

  return (
    <div>
      {entries.length > 0 && (
        <div
          className={`grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3 ${
            hasNotes ? 'mb-3' : ''
          }`}
        >
          {entries.map(([key, value]) => (
            <div key={key}>
              <div
                className="code mb-0.5 text-[10px] tracking-[0.08em] uppercase"
                style={{ color: 'var(--text-faint)' }}
              >
                {formatKey(key)}
              </div>
              <div className="display text-base font-bold">
                {Array.isArray(value) ? value.join(', ') : value}
              </div>
            </div>
          ))}
        </div>
      )}
      {hasNotes && (
        <div
          className="flex gap-2 rounded-[9px] border px-2.5 py-2 text-[12.5px] leading-relaxed"
          style={{
            color: 'var(--text-dim)',
            background: 'color-mix(in srgb, var(--accent-yellow) 12%, transparent)',
            borderColor: 'color-mix(in srgb, var(--accent-yellow) 28%, transparent)',
          }}
        >
          <span>⚠️</span>
          <div>
            <b style={{ color: 'var(--text)' }}>Notes:</b> {notes.join(' ')}
          </div>
        </div>
      )}
    </div>
  );
}
