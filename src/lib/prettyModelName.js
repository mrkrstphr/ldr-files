export function prettyModelName(name) {
  return name.replace('.ldr', '').substring(name.lastIndexOf('/') + 1);
}
