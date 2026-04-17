/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  output: isGitHubPages ? 'export' : 'standalone',
  basePath: isGitHubPages ? '/EnnLabel' : '',
  assetPrefix: isGitHubPages ? '/EnnLabel/' : '',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    NEXT_PUBLIC_DEMO_MODE: isGitHubPages ? 'true' : 'false',
    NEXT_PUBLIC_BASE_PATH: isGitHubPages ? '/EnnLabel' : '',
  },
};

module.exports = nextConfig;
