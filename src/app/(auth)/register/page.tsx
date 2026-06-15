import { redirect } from 'next/navigation'

// Registration is disabled — NexOps is a private single-admin tool.
// To create the admin account, use Supabase Dashboard > Authentication > Users
export default function RegisterPage() {
  redirect('/login')
}
