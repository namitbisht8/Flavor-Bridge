/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Global application configuration
// API_MODE controls whether the app displays 'sample' data or connects to 'live' Foodoscope APIs.
export type ApiMode = 'sample' | 'live';

const rawApiMode =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_MODE) ||
  (typeof process !== 'undefined' && process.env?.VITE_API_MODE);

export const API_MODE: ApiMode = (rawApiMode as ApiMode) === 'live' ? 'live' : 'sample';
