export default function some(arr, fn) { return Array.isArray(arr) ? arr.some(typeof fn === 'function' ? fn : (x => x?.[fn])) : false; }
