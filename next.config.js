/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      const secret = process.env.ADMIN_SECRET_PATH;
      return secret
        ? [{ source: `/${secret}`, destination: "/admin" }]
        : [];
    },
  };
  
  module.exports = nextConfig;  