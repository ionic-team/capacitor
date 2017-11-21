

export function log(...args: any[]) {
  console.log('\x1b[32m[avocado]\x1b[0m', ...args);
}

export function logError(...args: any[]) {
  console.error('\x1b[31m[avocado]\x1b[0m', ...args);
}
