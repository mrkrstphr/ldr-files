import { useEffect, useState } from 'react';
import { withBasePath } from '../config';
import { ModelCollection } from '../types';

export function useModels() {
  const [models, setModels] = useState<ModelCollection>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch(withBasePath('data/models.json'))
      .then((res) => res.json())
      .then((models: ModelCollection) => {
        setModels(models);
        setLoading(false);
      });
  }, []);

  return { loading, models };
}
