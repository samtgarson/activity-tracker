import { useIsSubmitting } from 'remix-validated-form'

export const Submit = () => {
  const isSubmitting = useIsSubmitting()
  return (
    <button type='submit' disabled={isSubmitting}>
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </button>
  )
}
