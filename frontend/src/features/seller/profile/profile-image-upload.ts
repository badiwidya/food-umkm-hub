import type { UploadContext } from '../../../client'
import { signUploadUploadSignPost } from '../../../client'

const MAX_AVATAR_SIZE = 2 * 1024 * 1024
const MAX_STORE_IMAGE_SIZE = 5 * 1024 * 1024
const PROFILE_IMAGE_CONTENT_TYPES: ReadonlyArray<string> = [
  'image/jpeg',
  'image/png',
]

export function validateSellerAvatarFile(file: File) {
  return validateImageFile(file, MAX_AVATAR_SIZE, 'Foto profil', '2MB')
}

export function validateStorePhotoFile(file: File) {
  return validateImageFile(file, MAX_STORE_IMAGE_SIZE, 'Foto toko', '5MB')
}

export function validateQrisImageFile(file: File) {
  return validateImageFile(file, MAX_STORE_IMAGE_SIZE, 'QRIS', '5MB')
}

export function uploadSellerAvatar(file: File) {
  return uploadProfileImage(file, 'avatar')
}

export function uploadStorePhoto(file: File) {
  return uploadProfileImage(file, 'store_photo')
}

export function uploadQrisImage(file: File) {
  return uploadProfileImage(file, 'qris_image')
}

function validateImageFile(
  file: File,
  maxSize: number,
  label: string,
  maxSizeLabel: string,
) {
  if (!PROFILE_IMAGE_CONTENT_TYPES.includes(file.type)) {
    return `${label} harus berupa file JPG atau PNG.`
  }

  if (file.size > maxSize) {
    return `Ukuran ${label.toLowerCase()} maksimal ${maxSizeLabel}.`
  }

  return null
}

async function uploadProfileImage(file: File, context: UploadContext) {
  const { data } = await signUploadUploadSignPost({
    body: {
      contentType: file.type,
      context,
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
    throw new Error('Profile image upload failed.')
  }
}
