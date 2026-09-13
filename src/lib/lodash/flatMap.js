export default function flatMap(arr, fn) { return Array.isArray(arr) ? arr.flatMap(fn) : []; }
