import type { MetaFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from '@remix-run/react'
import type { LinksFunction } from '@remix-run/node'
import styles from './styles/index.css'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Activity Tracker',
  viewport: 'width=device-width,initial-scale=1'
})

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export default function App() {
  return (
    <html lang='en'>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
