// lib/media-utils.ts
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import type { ImageMetadata } from 'astro'

export interface FullSizeImage extends ImageMetadata {
  src: string
  hash: string
  width: number
  height: number
  blurDataUrl: string
}

export async function getFullSizeImages(
  images: ImageMetadata[],
  albumId: string
): Promise<FullSizeImage[]> {
  console.log(`[getFullSizeImages] Processing ${images.length} images for album: ${albumId}`)
  
  return await Promise.all(
    images.map(async (img, index) => {
      try {
        // Extract filename from the src path
        const fileName = img.src.split('/').pop() || ''
        const hash = fileName.split('.')[0] || `${albumId}-${index}`
        
        console.log(`[getFullSizeImages] Image ${index}:`)
        console.log(`  - src: ${img.src}`)
        console.log(`  - fileName: ${fileName}`)
        console.log(`  - hash: ${hash}`)
        
        // Convert to absolute filesystem path for reading
        const root = fileURLToPath(new URL('../../', import.meta.url))
        // img.src is like "/src/content/media/blender/kitchen-3.png"
        const relativePath = img.src.startsWith('/src/') ? img.src.slice(5) : img.src.slice(1)
        const imagePath = path.join(root, 'src', relativePath)
        
        console.log(`  - filesystem path: ${imagePath}`)
        
        let width = img.width
        let height = img.height
        let blurDataUrl = ''
        
        try {
          // Read file and get actual dimensions
          const buffer = await readFile(imagePath)
          const sharpImg = sharp(buffer)
          const metadata = await sharpImg.metadata()
          
          if (metadata.width && metadata.height) {
            width = metadata.width
            height = metadata.height
          }
          
          // Generate blur placeholder
          const blurBuffer = await sharpImg
            .resize(20, 20, { fit: 'inside' })
            .blur()
            .toBuffer()
          blurDataUrl = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`
          
          console.log(`  - dimensions: ${width}x${height}`)
          console.log(`  - blur placeholder generated`)
        } catch (fileError) {
          console.error(`  - Error reading file:`, fileError)
        }
        
        return {
          ...img,
          src: img.src, // Keep the /src path for Astro's Image component
          width,
          height,
          hash,
          blurDataUrl,
        }
      } catch (error) {
        console.error(`[getFullSizeImages] Error processing image ${index}:`, error)
        // Return a fallback instead of throwing
        return {
          ...img,
          src: img.src,
          hash: `${albumId}-${index}`,
          width: img.width,
          height: img.height,
          blurDataUrl: '',
        }
      }
    })
  )
}

export async function generateBlurPlaceholder(
  buffer: Buffer,
  blurSize = 32,
  blurSigma = 2.5
): Promise<string | undefined> {
  try {
    const { data, info } = await sharp(buffer)
      .resize(blurSize, blurSize, { fit: 'inside' })
      .blur(blurSigma)
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true })
    
    const webpBuffer = await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      },
    })
      .webp({ quality: 60 })
      .toBuffer()
    
    return `data:image/webp;base64,${webpBuffer.toString('base64')}`
  } catch (err) {
    console.warn('[generateBlurPlaceholder] Failed to generate blurred placeholder:', err)
    return undefined
  }
}

export function getAlbums(): string[] {
  console.log('[getAlbums] Scanning for albums...')
  
  const files = import.meta.glob('/src/content/media/*/*.{md,mdx}')
  const albums = new Set<string>()
  
  for (const path of Object.keys(files)) {
    const match = path.match(/\/media\/([^/]+)\//)
    if (match) {
      console.log(`[getAlbums] Found album: ${match[1]}`)
      albums.add(match[1])
    }
  }
  
  console.log(`[getAlbums] Total albums found: ${albums.size}`)
  return [...albums]
}

export async function getAlbumImages(albumId: string): Promise<ImageMetadata[]> {
  console.log(`[getAlbumImages] Loading images for album: ${albumId}`)
  
  try {
    // Load all images from the album directory
    const files = import.meta.glob<ImageMetadata>(
      '/src/content/media/**/*.{webp,png,jpg,jpeg}',
      {
        eager: true,
        import: 'default',
      }
    )
    
    console.log(`[getAlbumImages] Total files scanned: ${Object.keys(files).length}`)
    
    // Filter images for this specific album, excluding banner
    const images = Object.entries(files)
      .filter(([path]) => {
        const inAlbum = path.includes(`/media/${albumId}/`)
        const isBanner = path.match(/banner\.(webp|png|jpg|jpeg)$/i)
        
        if (inAlbum) {
          console.log(`[getAlbumImages] Found: ${path} (banner: ${!!isBanner})`)
        }
        
        return inAlbum && !isBanner
      })
      .map(([path, metadata]) => {
        // Keep the full path starting with /src for Astro's Image component
        console.log(`[getAlbumImages] Image path: ${path}`)
        
        return {
          ...metadata,
          src: path, // Keep the full /src path for Astro Image component
          width: metadata.width || 800,
          height: metadata.height || 600,
        } as ImageMetadata
      })
    
    console.log(`[getAlbumImages] Total images for ${albumId}: ${images.length}`)
    
    // Shuffle images
    images.sort(() => Math.random() - 0.5)
    
    return images
  } catch (error) {
    console.error(`[getAlbumImages] Error loading album images:`, error)
    return []
  }
}

export async function getPhotoCount(albumId: string): Promise<number> {
  console.log(`[getPhotoCount] Counting photos for album: ${albumId}`)
  
  try {
    const files = import.meta.glob('/src/content/media/**/*.{webp,png,jpg,jpeg}', {
      eager: true,
    })
    
    const count = Object.keys(files).filter((path) => {
      const inAlbum = path.includes(`/media/${albumId}/`)
      const isBanner = path.match(/banner\.(webp|png|jpg|jpeg)$/i)
      
      return inAlbum && !isBanner
    }).length
    
    console.log(`[getPhotoCount] Photo count for ${albumId}: ${count}`)
    return count
  } catch (error) {
    console.error(`[getPhotoCount] Error:`, error)
    return 0
  }
}