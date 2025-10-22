const Break = () => <hr className="text-stone-500/50 pb-1 mt-1" />;

const Attr = ({ label, value }) => (
  <div>
    <b className="text-stone-600 dark:text-stone-200">{label}:</b> {value}
  </div>
);

export function Debug({
  info,
  numBuildingSteps,
  currentBuildingStep,
  selectedSubModel,
  isPlaying,
  looping,
  direction,
  playSpeed,
}) {
  const { metadata, submodels, altModels } = info;

  return (
    <div className="mt-4 mr-4 bg-stone-200/50 dark:bg-stone-950/50 p-2 inline-block text-xs text-left">
      <div className="font-bold mb-2">Debug Info</div>
      <div className="flex flex-col gap-0.5">
        <Attr label="Number of Steps" value={numBuildingSteps} />
        <Attr label="Current Step" value={currentBuildingStep} />
        <Attr
          label="Step Through Ready"
          value={metadata?._stepReady ? 'Yes' : 'No'}
        />

        <Break />

        <Attr label="Submodel Count" value={submodels?.length || 0} />
        <Attr label="Alternate Model Count" value={altModels?.length || 0} />

        {(submodels?.length > 0 || altModels?.length > 0) && (
          <Attr
            label="Selected Sub/Alt Model"
            value={selectedSubModel || 'N/A'}
          />
        )}

        {metadata?._stepReady && (
          <>
            <Break />
            <Attr label="Is Playing" value={isPlaying ? 'Yes' : 'No'} />
            {isPlaying && (
              <>
                <Attr label="Is Looping" value={looping ? 'Yes' : 'No'} />
                <Attr
                  label="Play Direction"
                  value={direction === 1 ? 'Forward' : 'Backward'}
                />
                <Attr label="Play Speed" value={`${playSpeed}x`} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
