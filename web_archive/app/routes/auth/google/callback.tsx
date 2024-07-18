import { authenticator } from '@/app/services/auth/auth.server'
import { LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = ({ request }) => {
  return authenticator.authenticate('google', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  })
}
