/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  transpilePackages: ["@streamshare/database"],
  output: "standalone",
};

export default nextConfig;
