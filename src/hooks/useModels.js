import { useEffect, useState } from 'react';
import { withBasePath } from '../config';

export function useModels() {
  const [models, setModels] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(withBasePath('data/models.json'))
      .then((res) => res.json())
      .then((models) => {
        setModels(models);
        setLoading(false);
      });
  }, []);

  return { loading, models };
}
