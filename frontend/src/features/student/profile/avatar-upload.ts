import { signUploadUploadSignPost } from '../../../client'

const MAX_AVATAR_SIZE = 2 * 1024 * 1024
const AVATAR_CONTENT_TYPES: ReadonlyArray<string> = ['image/jpeg', 'image/png']

export function validateAvatarFile(file: File) {
  if (!AVATAR_CONTENT_TYPES.includes(file.type)) {
    return 'Foto profil harus berupa file JPG atau PNG.'
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return 'Ukuran foto profil maksimal 2MB.'
  }

  return null
}

export async function uploadAvatar(file: File) {
  const { data } = await signUploadUploadSignPost({
    body: {
      contentType: file.type,
      context: 'avatar',
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
    throw new Error('Avatar upload failed.')
  }
}
