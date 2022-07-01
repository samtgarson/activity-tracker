import { authenticator } from '@/app/services/auth.server'
import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node'

export const loader: LoaderFunction = () => redirect('/')

export const action: ActionFunction = ({ request }) => {
  return authenticator.authenticate('google', request, {
    successRedirect: '/dashboard',
    failureRedirect: '/'
  })
}
