// ============================================================================
// Inline delay
// ============================================================================
// Usage:
// async function sleep(fn, ...args) {
//   await timeout(3000);
//   return fn(...args);
// }
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
