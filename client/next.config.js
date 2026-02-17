/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['utfs.io', 'api.slingacademy.com', 'res.cloudinary.com']
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  }
};

module.exports = nextConfig;
