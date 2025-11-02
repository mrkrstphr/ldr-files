export type Model = {
  file: string;
  slug: string;
};

export type ModelCollection = {
  [key: string]: Model[];
};

export type SeasonalSet = {
  name: string;
  slug: string;
};

export type SeasonalData = {
  description: string;
  sets: SeasonalSet[];
};

export type Metadata = {
  Author?: string;
  Labels?: string[];
  Name?: string;
  Notes?: string[];
  ReleaseYear?: number;
  SetNumber?: string;
  Theme?: string;
  _altModels?: string[];
  _defaultModel?: string;
  _stepReady?: boolean;
  _submodels?: string[];
};
