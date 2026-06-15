import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const strapiUrl =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === 'development';

function isLocalStrapiUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

let strapiPattern: { protocol: 'http' | 'https'; hostname: string; port?: string; pathname: string };

try {
  const parsed = new URL(strapiUrl);
  strapiPattern = {
    protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
    hostname: parsed.hostname,
    ...(parsed.port ? { port: parsed.port } : {}),
    pathname: '/uploads/**',
  };
} catch {
  strapiPattern = {
    protocol: 'http',
    hostname: 'localhost',
    port: '1337',
    pathname: '/uploads/**',
  };
}

const nextConfig: NextConfig = {
  turbopack: {
    root: configDir,
  },
  images: {
    // Next.js 16 blocks localhost/private IPs by default (SSRF protection).
    // Required for Strapi media during local development.
    dangerouslyAllowLocalIP: isDev || isLocalStrapiUrl(strapiUrl),
    remotePatterns: [strapiPattern],
  },
  env: {
    NEXT_PUBLIC_STRAPI_URL: strapiUrl,
  },
};

export default nextConfig;
