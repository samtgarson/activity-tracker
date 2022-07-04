import { Calendar, ServiceResult } from '@/app/types'
import { useLoaderData } from '@remix-run/react'

export default function Dashboard() {
  const res = useLoaderData<ServiceResult<Calendar[]>>()

  return (
    <div>
      {res.error ? <p>{res.error}</p> : null}
      {res.data ? <p>{res.data.length} calendars</p> : null}
    </div>
  )
}
