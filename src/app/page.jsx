import { redirect } from 'next/navigation'

// Home → redirect to Work for now.
// Replace with a landing page later if needed.
export default function Home() {
  redirect('/work')
}
