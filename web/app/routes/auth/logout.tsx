import { authenticator } from '@/app/services/auth.server'
import { LoaderFunction } from '@remix-run/node'

export const loader: LoaderFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: '/' })
}
