// Type definitions for securityHeaders.js

export function applySecurityHeaders(res: any, options?: {
  origin?: string;
  methods?: string;
  headers?: string;
}): void;
