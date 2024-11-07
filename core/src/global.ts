import { initCapacitorGlobal } from './runtime';

export const Capacitor = /*#__PURE__*/ initCapacitorGlobal(
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
          ? global
          : {},
);

export const registerPlugin = Capacitor.registerPlugin;