import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

function titleCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const sesonalSets = {
  spooky: [
    { link: '/model/brickheadz-40351-ghost', name: '40351 Ghost (BrickHeadz)' },
    {
      link: '/model/brickheadz-40422-frankenstein',
      name: '40422 Frankenstein (BrickHeadz)',
    },
    { link: '/model/brickheadz-40272-witch', name: '40272 Witch (BrickHeadz)' },
    {
      link: '/model/other-40697-halloween-pumpkin',
      name: '40697 Halloween Pumpkin',
    },
    { link: '/model/other-40721-halloween-barn', name: '40721 Halloween Barn' },
    {
      link: '/model/seasonal-40013-halloween-ghost',
      name: '40013 Halloween Ghost',
    },
    {
      link: '/model/other-40822-jack-o-lantern-pickup-truck',
      name: '40822 Jack-o-Lantern Pickup Truck',
    },
  ],
  festive: [
    {
      link: '/model/brickheadz-40274-mr-mrs-claus',
      name: '40274 Mr. & Mrs. Claus (BrickHeadz)',
    },
    {
      link: '/model/other-30692-christmas-chimney-fun-with-santa',
      name: '30692 Christmas Chimney Fun with Santa',
    },
  ],
};

const seasonalDescriptions = {
  spooky:
    'Here are some of our favorite spooky sets to get you into the Halloween spirit!',
  festive:
    'Here are some of our favorite festive sets to get you into the holiday spirit!',
};

export function Seasonal() {
  const { season } = useParams();
  useEffect(() => {
    document.title = `${
      season ? titleCase(season) : 'Seasonal'
    } Sets - LDR Files`;
  }, [season]);

  if (!(season in sesonalSets)) {
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
      <p className="mb-4">{seasonalDescriptions[season]}</p>
      <ul className="list-disc list-inside ml-2">
        {sesonalSets[season].map((set) => (
          <li key={set.link} className="mb-2">
            <Link to={set.link}>{set.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
