import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// Initialize next-intl plugin with request config path
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);
