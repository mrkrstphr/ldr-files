export function splitPlus(str: string, sep: string, limit?: number) {
  const parts = str.split(sep);

  if (!limit || parts.length <= limit) return parts;

  const result = parts.slice(0, limit - 1);
  result.push(parts.slice(limit - 1).join(sep));

  return result;
}
