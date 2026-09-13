export default function find(arr, fn) { return Array.isArray(arr) ? arr.find(typeof fn === 'function' ? fn : (x => x?.[fn])) : undefined; }
