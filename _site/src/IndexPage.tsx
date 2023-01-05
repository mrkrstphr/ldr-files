import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type SetList = Record<string, string[]>;

function IndexPage() {
  const [sets, setSets] = useState<SetList | null>();

  useEffect(() => {
    fetch('index.json')
      .then((response) => response.json())
      .then((data) => {
        setSets(data);
      });
  }, []);

  if (!sets) {
    return null;
  }

  return (
    <div>
      {Object.entries(sets).map(([theme, sets]) => (
        <div key={`theme-${theme}`} className="mb-4">
          <h2 className="text-2xl mb-2">{theme}</h2>

          <ol className="list-decimal list-outside">
            {sets.map((set) => (
              <li key={`set-${theme}-${set}`} className="ml-12">
                <Link
                  to={`/set/${set.replace('.ldr', '').replace(' ', '_')}`}
                  className="text-blue-500 hover:text-purple-500"
                >
                  {set.replace(`${theme}/`, '')}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

export default IndexPage;
