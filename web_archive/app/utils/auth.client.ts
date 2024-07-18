import { useOutletContext } from '@remix-run/react'
import { User } from '../models/user'

export const useAuth = () => {
  return useOutletContext<{ user: User }>()
}
