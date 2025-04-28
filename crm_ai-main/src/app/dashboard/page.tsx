import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) {
    return redirect('/auth/sign-in');
  }

  // If we have a token, redirect to overview
  return redirect('/dashboard/overview');
}
