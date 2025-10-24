import { useEffect } from 'react';
import { BsDice5 } from 'react-icons/bs';
import { FiGithub } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const buttonClasses =
  'group !text-gray-900 bg-gray-100 hover:bg-white !no-underline border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:!text-white dark:hover:bg-gray-700 me-2 mb-2 inline-flex items-center gap-2 cursor-pointer';

export function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'LDR Files';
  }, []);

  const handleRandomSetClick = (e) => {
    e.preventDefault();

    fetch('/ldr-files/models.json')
      .then((res) => res.json())
      .then((models) => {
        const flattenedModels = Object.values(models).flat();
        const randomModel =
          flattenedModels[Math.floor(Math.random() * flattenedModels.length)];

        navigate(`/model/${randomModel.slug}`);
      });
  };

  return (
    <div className="p-4 prose dark:prose-invert">
      <h2 className="text-3xl mb-4">LDR Files</h2>
      <p className="mb-3">
        I like building LEGO&reg; sets in{' '}
        <a
          href="https://www.bricklink.com/v3/studio/download.page"
          target="_blank"
          rel="noopener noreferrer"
        >
          BrickLink Studio
        </a>{' '}
        because I neither have the money nor the space to buy and build
        everything I want to build -- which is nearly all of them. So I build
        them on my computer instead. But what to do with them afterward?
      </p>
      <p className="mb-3">
        Why not put them on the internet for others (or no one) to see and
        enjoy?
      </p>
      <p className="mb-3">
        <div className="mb-2">Some Notes:</div>
        <ul className="list-disc ml-6">
          <li className="mb-2">
            Some pieces, especially printed pieces, are not yet available in the{' '}
            <a href="http://www.ldraw.org">LDraw Library</a>. Most of these have
            been replaced with generic pieces.
          </li>
          <li className="mb-2">
            Some models have submodels that can be rendered independently. Look
            for an option at the top of the model page to select these when
            available. By default, all submodels will be shown.
          </li>
          <li className="mb-2">
            Likewise, some models have multiple variations or configurations,
            which can be selected and rendered in the same was as submodels. For
            these, the primary variant will be shown by default.
          </li>
        </ul>
      </p>
      <p className="mb-6 mt-6 text-center">
        <button className={buttonClasses} onClick={handleRandomSetClick}>
          <BsDice5 className="group-hover:animate-spin" />
          <span>View a random set!</span>
        </button>
      </p>
      <p className="mb-3">
        This website would not be possible without all the hard work of the
        LDraw community.
      </p>
      <div className="block w-[320px] mx-auto bg-slate-100 text-sm border border-gray-500 mt-6 p-2 text-center">
        <a href="http://www.ldraw.org">
          <img src="http://www.ldraw.org/uploads/images/Logos-Stamps-Visual-IDs/Stamp290.png" />
        </a>
        <br />
        <a
          href="http://www.ldraw.org/"
          className="dark:!text-indigo-500 dark:hover:!text-indigo-600"
        >
          This software uses the LDraw Parts Library
        </a>
      </div>
      <p className="mt-9 mb-3 text-center">
        <a
          className={buttonClasses}
          href="https://github.com/mrkrstphr/ldr-files"
        >
          <FiGithub />
          <span>View on GitHub</span>
        </a>
      </p>
      <p className="mt-9 mb-3 text-center">
        Made with ❤️ by <a href="https://github.com/mrkrstphr">Kristopher</a>.
      </p>
    </div>
  );
}
