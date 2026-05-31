import { signUploadUploadSignPost } from '../../../client'

const MAX_PAYMENT_PROOF_SIZE = 5 * 1024 * 1024
const PAYMENT_PROOF_CONTENT_TYPES: ReadonlyArray<string> = [
  'image/jpeg',
  'image/png',
]

export function validatePaymentProofFile(file: File) {
  if (!PAYMENT_PROOF_CONTENT_TYPES.includes(file.type)) {
    return 'Bukti pembayaran harus berupa file JPG atau PNG.'
  }

  if (file.size > MAX_PAYMENT_PROOF_SIZE) {
    return 'Ukuran bukti pembayaran maksimal 5MB.'
  }

  return null
}

export async function uploadPaymentProof(file: File) {
  const { data } = await signUploadUploadSignPost({
    body: {
      contentType: file.type,
      context: 'payment_proof',
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
    throw new Error('Payment proof upload failed.')
  }
}
