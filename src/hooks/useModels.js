import { useEffect, useState } from 'react';

export function useModels() {
  const [models, setModels] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/ldr-files/models.json')
      .then((res) => res.json())
      .then(models => {
        setModels(models);
        setLoading(false);
      });
  }, []);

  return { loading, models };
}
