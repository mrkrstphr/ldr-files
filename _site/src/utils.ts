export function baseUrl() {
  console.log('env', process.env.NODE_ENV);
  return process.env.PUBLIC_URL;
}
