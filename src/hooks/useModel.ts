import { useEffect, useState } from 'react';
import { withBasePath } from '../config';
import { getModelMetadata } from '../lib/getModelMetadata';
import type { Metadata, ModelCollection } from '../types';

export type ModelState = {
  contents?: string;
  defaultModel?: string;
  fileName?: string;
  loading: boolean;
  error?: string;
  metadata?: Metadata;
  submodels?: string[];
  altModels?: string[];
  title?: string;
};

export function useModel(slug: string) {
  const [data, setData] = useState<ModelState>({ loading: true });

  useEffect(() => {
    let cancelled = false;

    const loadModel = async () => {
      try {
        setData({ loading: true });

        const modelsResponse = await fetch(withBasePath('data/models.json'));
        if (!modelsResponse.ok) {
          throw new Error(
            `Failed to load model index: ${modelsResponse.status} ${modelsResponse.statusText}`,
          );
        }

        const modelCollection: ModelCollection = await modelsResponse.json();
        const model = Object.values(modelCollection)
          .flat()
          .find((m) => m.slug === slug);

        if (!model) {
          throw new Error(`Model not found: ${slug}`);
        }

        const modelResponse = await fetch(withBasePath(`/models/${model.file}`));
        if (!modelResponse.ok) {
          throw new Error(
            `Failed to load model file: ${modelResponse.status} ${modelResponse.statusText}`,
          );
        }

        const contents = await modelResponse.text();
        const title = model.file
          .substring(0, model.file.lastIndexOf('.'))
          .replace('/', ' / ');
        const metadata = getModelMetadata(contents);

        if (!cancelled) {
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
        }
      } catch (error) {
        if (!cancelled) {
          const errorMessage =
            error instanceof Error ? error.message : 'An unknown error occurred';
          setData({
            loading: false,
            error: errorMessage,
          });
          console.error('Error loading model:', error);
        }
      }
    };

    loadModel();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return data;
}
