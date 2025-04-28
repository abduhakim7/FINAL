import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // TODO: Replace this with your actual authentication logic
    // This is just a simple example - you should implement proper password hashing and validation
    if (email === 'user@example.com' && password === 'password') {
      // Generate a session token - in production use a proper token generation method
      const token = Buffer.from(Date.now().toString()).toString('base64');

      // Create response with the user data
      const response = NextResponse.json({
        user: {
          id: '1',
          email: email,
          firstName: 'John',
          lastName: 'Doe',
          imageUrl: 'https://api.dicebear.com/7.x/avatars/svg?seed=John'
        }
      });

      // Set the session token in a secure HTTP-only cookie
      response.cookies.set('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        // Set an expiration time appropriate for your app
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
