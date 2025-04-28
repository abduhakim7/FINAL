import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // TODO: In a real application, you would verify the token and fetch user data from your database
  const user = {
    id: '1',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    imageUrl: 'https://api.dicebear.com/7.x/avatars/svg?seed=John'
  };

  return NextResponse.json({ user });
}
