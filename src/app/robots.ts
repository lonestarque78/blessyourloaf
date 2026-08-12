import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/dashboard/',
        '/api/',
        '/auth/',
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/checkout-success',
        '/checkout-cancel',
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
