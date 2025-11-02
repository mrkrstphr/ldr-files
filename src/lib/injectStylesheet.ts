export function injectStyleSheet(url: string) {
  const sheet = document.createElement('link');
  sheet.rel = 'stylesheet';
  sheet.href = url;
  sheet.type = 'text/css';
  document.head.appendChild(sheet);
}
