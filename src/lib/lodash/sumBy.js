export default function sumBy(arr, iter) { if (!arr) return 0; const fn = typeof iter === 'function' ? iter : (x => x?.[iter]); return arr.reduce((sum, item) => sum + (Number(fn(item)) || 0), 0); }
