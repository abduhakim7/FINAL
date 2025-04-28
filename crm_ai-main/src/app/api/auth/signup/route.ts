import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sign } from '@/lib/auth/jwt';

// In a real app, you would use a database
let users: any[] = [];

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = signupSchema.parse(body);

    // Check if user already exists
    if (users.find((u) => u.email === email)) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      password: hashedPassword
    };

    users.push(user);

    // Create JWT token
    const token = await sign({ userId: user.id });

    // Set JWT token in HTTP-only cookie
    const response = NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name
      },
      { status: 201 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 1 day
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
