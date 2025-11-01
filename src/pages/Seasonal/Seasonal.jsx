import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { withBasePath } from '../../config';

function titleCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function Seasonal() {
  const { season } = useParams();
  const [description, setDescription] = useState('');
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(withBasePath(`data/seasonal/${season}.json`))
      .then((res) => res.json())
      .then((data) => {
        setDescription(data.description);
        setSets(data.sets);
        setLoading(false);

        document.title = `${
          season ? titleCase(season) : 'Seasonal'
        } Sets - LDR Files`;
      })
      .catch(() => setLoading(false));
  }, [season]);

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-3xl mb-4">Loading...</h2>
      </div>
    );
  }

  if (!loading && !sets.length) {
    return (
      <div className="p-4">
        <h2 className="text-3xl mb-4">Page Not Found</h2>
        <p className="max-w-3xl mb-4">
          Seems like you've deviated from the instruction manual. Normally we'd
          encourage this, but unfortunately it means we don't know what to show
          you here...
        </p>
        <p>
          <Link to="/">Go back to the homepage</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-3xl mb-4">
        {season ? titleCase(season) : 'Seasonal'} Sets
      </h2>
      <p className="mb-4">{description}</p>
      <ul className="list-disc list-inside ml-2">
        {sets.sort().map((set) => (
          <li key={set.link} className="mb-2">
            <Link to={set.link}>{set.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
