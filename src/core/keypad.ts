/** Next value after a key press. Pure, so it is easy to test. */
export function pressKey(value: string, key: string, zeroDecimal: boolean): string {
  if (key === 'del') return value.slice(0, -1);
  if (key === '.') {
    if (zeroDecimal || value.includes('.')) return value;
    return (value || '0') + '.';
  }
  if (key === '000') return value && !value.includes('.') && value.length <= 7 ? value + '000' : value;
  if (!/^\d$/.test(key)) return value;
  const [whole, frac] = value.split('.');
  if (value.includes('.')) return (frac ?? '').length >= 2 ? value : value + key;
  if ((whole ?? '').length >= (zeroDecimal ? 12 : 8)) return value;
  if (value === '0') return key;
  return value + key;
}

/** "12.5" -> "12.5" with thousands separators in the locale's style, so the typed amount reads like money. */
export function formatTyped(value: string, locale: string): string {
  const [whole = '', frac] = value.split('.');
  const group = locale === 'id' || locale === 'es' ? '.' : ',';
  const dec = locale === 'id' || locale === 'es' ? ',' : '.';
  const w = (whole || '0').replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return frac === undefined ? w : `${w}${dec}${frac}`;
}
