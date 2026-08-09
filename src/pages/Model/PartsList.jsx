import { useEffect, useState } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Dialog } from '../../components/Dialog';
import { PartPreview } from './PartPreview';

export function PartsList({ partsData, onClose }) {
  const [colorSectionOpen, setColorSectionOpen] = useState(false);
  const [detailedListOpen, setDetailedListOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give the dialog time to mount and start loading 3D previews
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!partsData) return null;

  const { parts, totalParts, uniqueParts } = partsData;

  const colorSummary = parts.reduce((acc, part) => {
    if (!acc[part.colorName]) {
      acc[part.colorName] = 0;
    }
    acc[part.colorName] += part.count;
    return acc;
  }, {});

  const colorEntries = Object.entries(colorSummary).sort((a, b) => b[1] - a[1]);

  return (
    <Dialog title="Parts List" onClose={onClose}>
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-stone-800/80 flex items-center justify-center z-20 rounded-lg">
          <LoadingSpinner />
        </div>
      )}

      <div className="p-4 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Total Parts:</span> {totalParts}
          </div>
          <div>
            <span className="font-semibold">Unique Parts:</span> {uniqueParts}
          </div>
        </div>
      </div>

      <div className="border-b border-stone-200 dark:border-stone-700">
        <h3
          className="font-semibold p-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700/50 flex items-center gap-2"
          onClick={() => setColorSectionOpen(!colorSectionOpen)}
        >
          {colorSectionOpen ? <FiChevronDown /> : <FiChevronRight />}
          By Color
        </h3>
        {colorSectionOpen && (
          <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {colorEntries.map(([color, count]) => (
              <div key={color} className="flex justify-between">
                <span>{color}:</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <h3
          className="font-semibold p-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-700/50 flex items-center gap-2 sticky top-0 bg-white dark:bg-stone-800 z-10"
          onClick={() => setDetailedListOpen(!detailedListOpen)}
        >
          {detailedListOpen ? <FiChevronDown /> : <FiChevronRight />}
          Detailed List
        </h3>
        {detailedListOpen && (
          <div className="px-4 pb-4">
            <table className="w-full text-sm">
              <thead className="sticky top-14 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 z-10">
                <tr className="text-left">
                  <th className="pb-2 pt-2">Preview</th>
                  <th className="pb-2 pt-2">Qty</th>
                  <th className="pb-2 pt-2">Part ID</th>
                  <th className="pb-2 pt-2">Color</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part, idx) => (
                  <tr
                    key={`${part.partId}-${part.colorCode}-${idx}`}
                    className="border-b border-stone-100 dark:border-stone-700"
                  >
                    <td className="py-2">
                      <PartPreview
                        partId={part.partId}
                        colorCode={part.colorCode}
                      />
                    </td>
                    <td className="py-2 font-medium">{part.count}×</td>
                    <td className="py-2 font-mono text-xs">{part.partId}</td>
                    <td className="py-2">{part.colorName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Dialog>
  );
}
