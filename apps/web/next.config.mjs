/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: true
  },
  reactStrictMode: true,
  output: 'standalone'
};

export default nextConfig;


