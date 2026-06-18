const BASE = process.env.NEXT_PUBLIC_ASSETS_URL ?? ''

/**
 * Resolves a local asset path to its CDN URL.
 * Files are stored at the bucket root, so /projects/foo.webm → {BASE}/foo.webm.
 * Paths that are already absolute are returned unchanged.
 * Falls back to the local path when NEXT_PUBLIC_ASSETS_URL is not set.
 */
export const assetUrl = (path: string): string => {
  if (path.startsWith('http')) return path
  if (!BASE) return path
  const filename = path.replace(/^\/projects\//, '')
  return `${BASE}/${filename}`
}
