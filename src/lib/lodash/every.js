export default function every(arr, fn) { return Array.isArray(arr) ? arr.every(typeof fn === 'function' ? fn : (x => x?.[fn])) : true; }
