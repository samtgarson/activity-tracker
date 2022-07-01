import React from 'react'
import { useAuth } from '../__authed'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div>
      <h1>Welcome to Remix, {user?.givenName}</h1>
    </div>
  )
}
