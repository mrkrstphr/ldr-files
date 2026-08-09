type PartInfo = {
  partId: string;
  colorCode: string;
  colorName: string;
  count: number;
};

type PartsListData = {
  parts: PartInfo[];
  totalParts: number;
  uniqueParts: number;
};

const COLOR_MAP: Record<string, string> = {
  '0': 'Black',
  '1': 'Blue',
  '2': 'Green',
  '3': 'Dark Turquoise',
  '4': 'Red',
  '5': 'Dark Pink',
  '6': 'Brown',
  '7': 'Light Gray',
  '8': 'Dark Gray',
  '9': 'Light Blue',
  '10': 'Bright Green',
  '11': 'Light Turquoise',
  '12': 'Salmon',
  '13': 'Pink',
  '14': 'Yellow',
  '15': 'White',
  '16': 'Current Color',
  '17': 'Light Green',
  '18': 'Light Yellow',
  '19': 'Tan',
  '20': 'Light Violet',
  '21': 'Glow In Dark Opaque',
  '22': 'Purple',
  '23': 'Dark Blue Violet',
  '24': 'Edge Color',
  '25': 'Orange',
  '26': 'Magenta',
  '27': 'Lime',
  '28': 'Dark Tan',
  '29': 'Bright Pink',
  '30': 'Medium Lavender',
  '31': 'Lavender',
  '32': 'Trans Clear',
  '33': 'Trans Blue',
  '34': 'Trans Green',
  '35': 'Trans Red',
  '36': 'Trans Dark Pink',
  '37': 'Trans Neon Orange',
  '40': 'Trans Black',
  '41': 'Trans Medium Blue',
  '42': 'Trans Neon Green',
  '43': 'Trans Light Blue',
  '44': 'Trans Bright Reddish Lilac',
  '45': 'Trans Pink',
  '46': 'Trans Yellow',
  '47': 'Trans Clear',
  '54': 'Trans Neon Yellow',
  '57': 'Trans Neon Orange',
  '70': 'Reddish Brown',
  '71': 'Light Bluish Gray',
  '72': 'Dark Bluish Gray',
  '73': 'Medium Blue',
  '74': 'Medium Green',
  '77': 'Light Pink',
  '78': 'Light Nougat',
  '84': 'Medium Nougat',
  '85': 'Dark Purple',
  '86': 'Dark Nougat',
  '89': 'Reddish Lilac',
  '92': 'Nougat',
  '100': 'Light Salmon',
  '115': 'Medium Lime',
  '191': 'Bright Light Orange',
  '212': 'Bright Light Blue',
  '216': 'Rust',
  '226': 'Bright Light Yellow',
  '232': 'Sky Blue',
  '272': 'Dark Blue',
  '288': 'Dark Green',
  '308': 'Dark Brown',
  '320': 'Dark Red',
  '321': 'Dark Azure',
  '322': 'Medium Azure',
  '323': 'Light Aqua',
  '326': 'Yellowish Green',
  '330': 'Olive Green',
  '334': 'Gold',
  '335': 'Sand Red',
  '366': 'Earth Orange',
  '373': 'Sand Purple',
  '375': 'Sand Green',
  '378': 'Sand Blue',
  '379': 'Fabuland Brown',
  '450': 'Fabuland Orange',
  '462': 'Medium Orange',
  '484': 'Dark Orange',
  '493': 'Trans Very Light Blue',
  '494': 'Trans Light Purple',
  '503': 'Very Light Bluish Gray',
};

function getColorName(colorCode: string): string {
  return COLOR_MAP[colorCode] || `Color ${colorCode}`;
}

export function parsePartsList(ldrContent: string): PartsListData {
  const lines = ldrContent.trim().split('\n');
  const partCounts = new Map<string, PartInfo>();

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed.startsWith('1 ')) continue;

    const parts = trimmed.split(/\s+/);
    if (parts.length < 15) continue;

    const colorCode = parts[1];
    const partFile = parts[14];

    // Skip subfiles
    if (
      partFile.startsWith('s/') ||
      partFile.startsWith('48/') ||
      partFile.startsWith('8/')
    ) {
      continue;
    }

    // Skip submodels
    if (!partFile.toLowerCase().endsWith('.dat')) {
      continue;
    }

    const key = `${partFile}:${colorCode}`;

    if (partCounts.has(key)) {
      const existing = partCounts.get(key)!;
      existing.count++;
    } else {
      partCounts.set(key, {
        partId: partFile.replace('.dat', ''),
        colorCode,
        colorName: getColorName(colorCode),
        count: 1,
      });
    }
  }

  const parts = Array.from(partCounts.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.partId.localeCompare(b.partId);
  });

  const totalParts = parts.reduce((sum, part) => sum + part.count, 0);

  return {
    parts,
    totalParts,
    uniqueParts: parts.length,
  };
}
