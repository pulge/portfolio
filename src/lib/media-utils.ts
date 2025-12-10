// lib/media-utils.ts
import sharp from "sharp";
import type { ImageMetadata } from "astro";

export interface FullSizeImage {
  src: ImageMetadata;
  hash: string;
  width: number;
  height: number;
  blurDataUrl: string;
}

export async function getFullSizeImages(
  images: ImageMetadata[],
  albumId: string
): Promise<FullSizeImage[]> {
  return await Promise.all(
    images.map(async (img, index) => {
      try {
        const fileUrl = img.src; // public URL only, never a file path
        const hash = fileUrl.split("/").pop()?.split(".")[0] ?? `${albumId}-${index}`;

        // Default metadata (Astro provides width/height automatically)
        const width = (img as any).width || 800;
        const height = (img as any).height || 600;

        // Try generating a blur placeholder from the ORIGINAL asset (only works in dev)
        const blurDataUrl = await tryGenerateBlur(img);

        return {
          src: img,
          width,
          height,
          hash,
          blurDataUrl,
        };
      } catch (err) {
        console.error(`[getFullSizeImages] Failed on image #${index}`, err);

        return {
          src: img,
          hash: `${albumId}-${index}`,
          width: (img as any).width || 800,
          height: (img as any).height || 600,
          blurDataUrl: "",
        };
      }
    })
  );
}

/**
 * Attempt to create a blur placeholder from a real file.
 * Works only in dev — in Vercel prod we return '' safely.
 */
async function tryGenerateBlur(img: ImageMetadata): Promise<string> {
  try {
    // Astro dev gives a valid local path: /@fs/.../image.jpg
    const devPath = (img as any).src?.replace("/@fs/", "");

    if (!devPath || devPath.startsWith("http")) {
      // In production: skip blur generation (no file access)
      return "";
    }

    const buffer = await fetch(devPath).then((r) => r.arrayBuffer());
    const sharpImg = sharp(Buffer.from(buffer));

    const resized = await sharpImg
      .resize(24, 24, { fit: "inside" })
      .blur()
      .toBuffer();

    return `data:image/jpeg;base64,${resized.toString("base64")}`;
  } catch {
    return "";
  }
}

// -------------------------------
// ALBUM LOADING / SCANNING (unchanged except cleanup)
// -------------------------------

export function getAlbums(): string[] {
  const files = import.meta.glob("/src/content/media/*/*.{md,mdx}");
  const albums = new Set<string>();

  for (const path of Object.keys(files)) {
    const match = path.match(/\/media\/([^/]+)\//);
    if (match) albums.add(match[1]);
  }

  return [...albums];
}

export async function getAlbumImages(albumId: string): Promise<ImageMetadata[]> {
  const imageImports = import.meta.glob(
    "/src/content/media/**/*.{webp,png,jpg,jpeg}"
  );

  const imagePromises = Object.entries(imageImports)
    .filter(([path]) => {
      const inAlbum = path.includes(`/media/${albumId}/`);
      const isBanner = /banner\.(webp|png|jpg|jpeg)$/i.test(path);
      return inAlbum && !isBanner;
    })
    .map(async ([, importFn]) => {
      const module = (await importFn()) as any;
      return module.default as ImageMetadata;
    });

  const images = await Promise.all(imagePromises);

  // Shuffle
  return images.sort(() => Math.random() - 0.5);
}

export async function getPhotoCount(albumId: string): Promise<number> {
  const files = import.meta.glob("/src/content/media/**/*.{webp,png,jpg,jpeg}");

  return Object.keys(files).filter((path) => {
    const inAlbum = path.includes(`/media/${albumId}/`);
    const isBanner = /banner\.(webp|png|jpg|jpeg)$/i.test(path);
    return inAlbum && !isBanner;
  }).length;
}
