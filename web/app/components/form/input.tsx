import { ComponentProps, FC, ReactNode } from 'react'
import { useField } from 'remix-validated-form'

export type InputProps = ComponentProps<'input'> & {
  name: string
  children: ReactNode
}

export const Input: FC<InputProps> = ({ name, children, ...props }) => {
  const { getInputProps, error } = useField(name)

  return (
    <label>
      {children}
      <input {...getInputProps({ ...props })} />
      {error && <p className='text-red-500'>{error}</p>}
    </label>
  )
}
