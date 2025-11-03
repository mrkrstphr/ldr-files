import { useEffect, useState } from 'react';
import { withBasePath } from '../config';
import { getModelMetadata } from '../lib/getModelMetadata';
import type { Metadata, ModelCollection } from '../types';

export type ModelState = {
  contents?: string;
  defaultModel?: string;
  fileName?: string;
  loading: boolean;
  metadata?: Metadata;
  submodels?: string[];
  altModels?: string[];
  title?: string;
};

export function useModel(slug: string) {
  const [data, setData] = useState<ModelState>({ loading: true });

  useEffect(() => {
    fetch(withBasePath('data/models.json'))
      .then((res) => res.json())
      .then((data: ModelCollection) => {
        const model = Object.values(data)
          .flat()
          .find((m) => m.slug === slug);

        if (!model) {
          // TODO: trigger some kind of error condition
          return;
        }

        fetch(withBasePath(`/models/${model.file}`))
          .then((res) => res.text())
          .then((contents) => {
            const title = model.file
              .substring(0, model.file.lastIndexOf('.'))
              .replace('/', ' / ');
            const metadata = getModelMetadata(contents);

            setData({
              loading: false,
              contents,
              defaultModel: metadata._defaultModel,
              fileName: model.file,
              metadata,
              submodels: metadata._submodels,
              altModels: metadata._altModels,
              title,
            });
          });
      });
  }, [slug]);

  return data;
}
