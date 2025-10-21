import { useEffect, useState } from 'react';
import { getModelMetadata } from '../lib/getModelMetadata';

export function useModel(slug) {
  const [metadata, setMetadata] = useState({});
  const [submodels, setSubmodels] = useState([]);
  const [contents, setContents] = useState();
  const [title, setTitle] = useState();

  useEffect(() => {
    fetch('/ldr-files/models.json')
      .then((res) => res.json())
      .then((data) => {
        const model = Object.values(data)
          .flat()
          .find((m) => m.slug === slug);

        console.log('🐟 model = ', `models/${model.file}`);

        if (!model) {
          // TODO: trigger some kind of error condition
          return;
        }

        fetch(`/ldr-files/models/${model.file}`)
          .then((res) => res.text())
          .then((text) => {
            setContents(text);
            const title = model.file
              .substring(0, model.file.lastIndexOf('.'))
              .replace('/', ' / ');
            const metadata = getModelMetadata(text);
            const submodels = (metadata._submodels ?? '')
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s.length > 0);

            setMetadata(metadata);
            setSubmodels(submodels);
            setTitle(title);
          });
      });
  }, [slug]);

  return { contents, metadata, submodels, title };
}
