export default function mapValues(obj, fn) { if (!obj) return {}; const res = {}; for (const k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) res[k] = fn(obj[k], k, obj); } return res; }
