import { ComponentProps, FC, ReactNode } from 'react'
import { useField } from 'remix-validated-form'

export type InputProps = ComponentProps<'input'> & {
  name: string
  children: ReactNode
}

export const Input: FC<InputProps> = ({ name, ...props }) => {
  const { getInputProps } = useField(name)

  return <input {...getInputProps(props)} />
}
