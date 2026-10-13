import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_fvJo1S2tRmna@ep-gentle-grass-b3d3x7jh-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    DIRECT_URL:
      process.env.DIRECT_URL ||
      "postgresql://neondb_owner:npg_fvJo1S2tRmna@ep-gentle-grass-b3d3x7jh.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
};

export default nextConfig;
