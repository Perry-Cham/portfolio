'use server'

import createMicrolink from 'microlink.io'

/**
 * Resolves a preview image URL for a given live URL via the Microlink API.
 * Returns the og:image URL (or null) so it can be used as an image `src`.
 */
export async function getMicrolinkImage(liveUrl: string): Promise<string | null> {
  try {
    const microlink = createMicrolink()
    const metadata = await microlink.screenshot(liveUrl)
    return metadata.url
  } catch {
    return null
  }
}
