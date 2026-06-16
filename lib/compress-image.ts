const MAX_WIDTH = 1200
const JPEG_QUALITY = 0.82
export const MAX_TOTAL_UPLOAD_BYTES = 12 * 1024 * 1024

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image load failed'))
    }
    img.src = url
  })
}

/** Resize and compress a photo for upload (client-side only). */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file
  }

  try {
    const img = await loadImageFromFile(file)
    const scale = Math.min(1, MAX_WIDTH / img.width)
    const width = Math.round(img.width * scale)
    const height = Math.round(img.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return file
    }

    ctx.drawImage(img, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    })

    if (!blob) {
      return file
    }

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo'
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' })
  } catch {
    return file
  }
}

export function getTotalFileSize(files: File[]): number {
  return files.reduce((sum, file) => sum + file.size, 0)
}
