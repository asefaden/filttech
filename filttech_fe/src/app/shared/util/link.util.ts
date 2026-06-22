export const URL_PATTERN = /^(https?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:\/?#\[\]@!$&'()*+,;=.]+$/i;

export function isValidUrl(value: string): boolean {
  return URL_PATTERN.test(value.trim());
}
