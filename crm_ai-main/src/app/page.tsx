import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) {
    return redirect('/auth/sign-in');
  }

  // If we have a token, redirect to dashboard
  return redirect('/dashboard/overview');
}
