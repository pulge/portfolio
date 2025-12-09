// lib/media-utils.ts
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import type { ImageMetadata } from 'astro'

export interface FullSizeImage extends ImageMetadata {
  src: string | ImageMetadata
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
        // Get the source path for file operations
        let srcPath = ''
        if (typeof img === 'string') {
          srcPath = img
        } else if (typeof img.src === 'string') {
          srcPath = img.src
        } else if (img.src && typeof img.src === 'object' && 'src' in img.src) {
          srcPath = img.src.src
        }
        
        const fileName = srcPath.split('/').pop()?.split('?')[0] || ''
        const hash = fileName.split('.')[0] || `${albumId}-${index}`
        
        console.log(`[getFullSizeImages] Image ${index}:`)
        console.log(`  - srcPath: ${srcPath}`)
        console.log(`  - fileName: ${fileName}`)
        console.log(`  - hash: ${hash}`)
        
        let width = img.width || 800
        let height = img.height || 600
        let blurDataUrl = ''
        
        try {
          // Convert to absolute filesystem path for reading
          const root = fileURLToPath(new URL('../../', import.meta.url))
          
          // Clean up the path - remove query params and /@fs/ prefix
          let cleanPath = srcPath.split('?')[0]
          if (cleanPath.includes('/@fs/')) {
            cleanPath = cleanPath.split('/@fs/')[1]
          } else if (cleanPath.startsWith('/src/')) {
            cleanPath = path.join(root, cleanPath.slice(1))
          } else if (cleanPath.startsWith('/')) {
            cleanPath = path.join(root, 'src', cleanPath.slice(1))
          }
          
          console.log(`  - filesystem path: ${cleanPath}`)
          
          // Read file and get actual dimensions
          const buffer = await readFile(cleanPath)
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
          src: img, // Pass the entire image object as src
          width,
          height,
          hash,
          blurDataUrl,
        }
      } catch (error) {
        console.error(`[getFullSizeImages] Error processing image ${index}:`, error)
        return {
          ...img,
          src: img,
          hash: `${albumId}-${index}`,
          width: img.width || 800,
          height: img.height || 600,
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

// Type for the glob import result
type ImageImport = () => Promise<{ default: ImageMetadata }>

export async function getAlbumImages(albumId: string): Promise<ImageMetadata[]> {
  console.log(`[getAlbumImages] Loading images for album: ${albumId}`)
  
  try {
    // Load all images from the album directory as dynamic imports
    const imageImports = import.meta.glob<ImageImport>(
      '/src/content/media/**/*.{webp,png,jpg,jpeg}'
    )
    
    console.log(`[getAlbumImages] Total files scanned: ${Object.keys(imageImports).length}`)
    
    // Filter and load images for this specific album
    const imagePromises = Object.entries(imageImports)
      .filter(([path]) => {
        const inAlbum = path.includes(`/media/${albumId}/`)
        const isBanner = path.match(/banner\.(webp|png|jpg|jpeg)$/i)
        
        if (inAlbum) {
          console.log(`[getAlbumImages] Found: ${path} (banner: ${!!isBanner})`)
        }
        
        return inAlbum && !isBanner
      })
      .map(async ([path, importFn]) => {
        const module = await importFn()
        console.log(`[getAlbumImages] Loaded image from ${path}`)
        return module.default
      })
    
    const images = await Promise.all(imagePromises)
    
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
    const files = import.meta.glob('/src/content/media/**/*.{webp,png,jpg,jpeg}')
    
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