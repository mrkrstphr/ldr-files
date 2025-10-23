import { useEffect, useState } from 'react';
import { getModelMetadata } from '../lib/getModelMetadata';

export function useModel(slug) {
  const [data, setData] = useState({ loading: true });

  useEffect(() => {
    setData({ loading: true });

    fetch('/ldr-files/models.json')
      .then((res) => res.json())
      .then((data) => {
        const model = Object.values(data)
          .flat()
          .find((m) => m.slug === slug);

        if (!model) {
          // TODO: trigger some kind of error condition
          return;
        }

        fetch(`/ldr-files/models/${model.file}`)
          .then((res) => res.text())
          .then((contents) => {
            // setContents(contents);
            const title = model.file
              .substring(0, model.file.lastIndexOf('.'))
              .replace('/', ' / ');
            const metadata = getModelMetadata(contents);
            const submodels = (metadata._submodels ?? '')
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
            const altModels = (metadata._altModels ?? '')
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s.length > 0);

            metadata.Labels = (metadata.Labels ?? '')
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s.length > 0);

            setData({
              loading: false,
              contents,
              defaultModel: metadata._defaultModel,
              fileName: model.file,
              metadata,
              submodels,
              altModels,
              title,
            });
          });
      });
  }, [slug]);

  return data;
}
