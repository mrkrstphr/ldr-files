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
