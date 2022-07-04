import clsx from 'clsx'
import { createContext, FC, useContext } from 'react'
import { useField } from 'remix-validated-form'
import { InputProps } from './input'

type RadioContext = { name: string }
const RadioContext = createContext<RadioContext>({ name: '' })

export const Root: FC<{ name: string; label: string }> = ({
  name,
  label,
  children
}) => {
  const { error } = useField(name)

  return (
    <fieldset>
      <legend>{label}</legend>
      <RadioContext.Provider value={{ name }}>{children}</RadioContext.Provider>
      {error && <p className='text-red-500'>{error}</p>}
    </fieldset>
  )
}

export const Item: FC<Omit<InputProps, 'name'>> = ({
  children,
  className,
  ...props
}) => {
  const { name } = useContext(RadioContext)
  const { getInputProps } = useField(name)

  return (
    <label
      className={clsx('flex items-center mb-3', props.disabled && 'opacity-50')}
    >
      <input
        {...getInputProps(props)}
        type='radio'
        className={clsx(
          className,
          'appearance-none mr-2 w-6 h-6 rounded-full border border-black relative after:absolute after:w-3 after:h-3 after:bg-black after:opacity-0 after:checked:opacity-100 after:transition-all after:rounded-full after:left-1/2 after:-translate-x-1/2 after:top-1/2 after:-translate-y-1/2'
        )}
      />
      {children}
    </label>
  )
}
