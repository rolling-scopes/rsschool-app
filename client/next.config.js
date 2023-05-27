/* eslint-disable @typescript-eslint/no-var-requires */
const prodConfig = require('./next.config.prod');
const { withSentryConfig } = require('@sentry/nextjs');

const isProd = process.env.NODE_ENV === 'production';

const server = process.env.SERVER_HOST || 'http://localhost:3001';
const nestjs = process.env.NESTJS_HOST || 'http://localhost:3002';

const nextConfig = {
  ...prodConfig,
  rewrites: () =>
    isProd
      ? []
      : [
          { source: '/certificate/:path*', destination: `${nestjs}/certificate/:path*` },
          { source: '/swagger', destination: `${nestjs}/swagger/` },
          { source: '/swagger-json', destination: `${nestjs}/swagger-json` },
          { source: '/swagger:path', destination: `${nestjs}/swagger/swagger:path` },
          { source: '/api/v2/:path*', destination: `${nestjs}/:path*` },
          { source: '/api/:path*', destination: `${server}/:path*` },
        ],
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: true,
};
module.exports = withSentryConfig(
  nextConfig,
  {
    // Suppresses source map uploading logs during build
    silent: true,

    org: 'rs-school',
    project: 'rs-app',
  },
  {
    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: false,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: '/monitoring',

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  },
);

// Injected content via Sentry wizard below
