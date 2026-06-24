import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import JobFitApp from '@/components/JobFitApp'

export default async function Home() {
  const session = await getServerSession()
  if (!session) redirect('/login')
  return <JobFitApp />
}
