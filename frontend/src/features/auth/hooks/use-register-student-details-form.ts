import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { registerStudentAuthStudentRegisterPostMutation } from '../../../client/@tanstack/react-query.gen'
import {
  clearRegistrationDraft,
  getRegistrationDraft,
} from '../lib/registration-draft'

const registerStudentDetailsFormSchema = z.object({
  department: z.string().min(1, 'Departemen wajib diisi.'),
  faculty: z.string().min(1, 'Fakultas wajib diisi.'),
  nim: z.string().min(1, 'NIM wajib diisi.'),
})

type RegisterStudentDetailsFormValues = z.infer<
  typeof registerStudentDetailsFormSchema
>

export function useRegisterStudentDetailsForm() {
  const navigate = useNavigate()
  const draft = useMemo(() => getRegistrationDraft('student'), [])
  const [formError, setFormError] = useState<string | null>(
    draft ? null : 'Lengkapi data akun mahasiswa terlebih dahulu.',
  )
  const form = useForm<RegisterStudentDetailsFormValues>({
    defaultValues: {
      department: '',
      faculty: '',
      nim: '',
    },
  })
  const registerMutation = useMutation(
    registerStudentAuthStudentRegisterPostMutation(),
  )

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null)

    if (!draft) {
      setFormError('Lengkapi data akun mahasiswa terlebih dahulu.')
      return
    }

    const parsedValues = registerStudentDetailsFormSchema.safeParse(values)

    if (!parsedValues.success) {
      for (const issue of parsedValues.error.issues) {
        const fieldName = issue.path[0]

        if (
          fieldName === 'department' ||
          fieldName === 'faculty' ||
          fieldName === 'nim'
        ) {
          form.setError(fieldName, {
            message: issue.message,
            type: 'validate',
          })
        }
      }

      return
    }

    try {
      await registerMutation.mutateAsync({
        body: {
          department: parsedValues.data.department,
          email: draft.email,
          faculty: parsedValues.data.faculty,
          fullName: draft.fullName,
          nim: parsedValues.data.nim,
          password: draft.password,
          phoneNumber: draft.phoneNumber,
        },
      })
      clearRegistrationDraft()
      void navigate({
        search: { email: draft.email },
        to: '/register/check-email',
      })
    } catch {
      setFormError('Pendaftaran mahasiswa gagal. Periksa kembali data Anda.')
    }
  })

  return {
    form,
    formError,
    isPending: registerMutation.isPending,
    onSubmit,
  }
}
