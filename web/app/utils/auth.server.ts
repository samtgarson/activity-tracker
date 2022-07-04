import { redirect } from '@remix-run/node'
import { User } from '../models/user'
import { authenticator } from '../services/auth/auth.server'
import { UserFinder } from '../services/users/finder'

const userFinder = new UserFinder()

export const getUser = async (
  request: Request,
  deps = { authenticator, userFinder, redirect }
): Promise<User> => {
  const { userId } = await deps.authenticator.isAuthenticated(request, {
    failureRedirect: '/'
  })
  const { data, error } = await deps.userFinder.call(userId)
  if (error !== undefined) throw deps.redirect('/')
  return data
}
