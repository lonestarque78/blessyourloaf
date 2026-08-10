import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Bless Your Loaf',
    short_name: 'Bless Your Loaf',
    description: 'Grow your starter, bake real bread, and never waste a drop of discard.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fdf6f0',
    theme_color: '#c9956c',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
