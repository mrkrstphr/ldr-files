export function prettyModelName(name: string) {
  return name.replace('.ldr', '').substring(name.lastIndexOf('/') + 1);
}
