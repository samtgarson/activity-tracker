import clsx from 'clsx'
import {
  createContext,
  FC,
  FormEventHandler,
  ReactNode,
  useContext,
  useState
} from 'react'
import { useField } from 'remix-validated-form'
import { InputProps } from './input'

type RadioContext = { name: string; selected?: string }
const RadioContext = createContext<RadioContext>({ name: '' })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isInput = (node: any): node is HTMLInputElement =>
  !!node.hasAttribute('value')

export const Root: FC<{ name: string; label: string }> = ({
  name,
  label,
  children
}) => {
  const { error, defaultValue } = useField(name)
  const [value, setValue] = useState(defaultValue)
  const onChange: FormEventHandler<HTMLFieldSetElement> = (e) => {
    if (!isInput(e.target)) return
    setValue(e.target.value)
  }

  return (
    <fieldset onChange={onChange}>
      <legend>{label}</legend>
      <RadioContext.Provider value={{ name, selected: value }}>
        {children}
      </RadioContext.Provider>
      {error && <p className='text-red-500'>{error}</p>}
    </fieldset>
  )
}

type RadioItemProps = Omit<InputProps, 'name' | 'children'> & {
  children: ReactNode | ((state: { checked: boolean }) => ReactNode)
}

export const Item: FC<RadioItemProps> = ({ children, className, ...props }) => {
  const { name, selected } = useContext(RadioContext)
  const { getInputProps } = useField(name)
  const checked = props.value === selected

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
      {children instanceof Function ? children({ checked }) : children}
    </label>
  )
}
