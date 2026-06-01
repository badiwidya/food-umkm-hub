import { signUploadUploadSignPost } from '../../../client'

const MAX_PRODUCT_PHOTO_SIZE = 5 * 1024 * 1024
const PRODUCT_PHOTO_CONTENT_TYPES: ReadonlyArray<string> = [
  'image/jpeg',
  'image/png',
]

export function validateProductPhotoFile(file: File) {
  if (!PRODUCT_PHOTO_CONTENT_TYPES.includes(file.type)) {
    return 'Foto produk harus berupa file JPG atau PNG.'
  }

  if (file.size > MAX_PRODUCT_PHOTO_SIZE) {
    return 'Ukuran foto produk maksimal 5MB.'
  }

  return null
}

export async function uploadProductPhoto(file: File) {
  const { data } = await signUploadUploadSignPost({
    body: {
      contentType: file.type,
      context: 'product_photo',
    },
    throwOnError: true,
  })

  await uploadFileToSignedUrl(data.uploadUrl, file)

  return data.publicUrl
}

async function uploadFileToSignedUrl(uploadUrl: string, file: File) {
  const response = await fetch(uploadUrl, {
    body: file,
    headers: {
      'Content-Type': file.type,
    },
    method: 'PUT',
  })

  if (!response.ok) {
    throw new Error('Product photo upload failed.')
  }
}
