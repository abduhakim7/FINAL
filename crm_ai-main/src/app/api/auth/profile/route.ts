import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  imageUrl: z.string().optional()
});

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // In a real application, you would:
    // 1. Verify the session token
    // 2. Get the user ID from the token
    // 3. Fetch the user's profile from your database

    // For now, return mock data
    return NextResponse.json({
      user: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        imageUrl: 'https://github.com/shadcn.png'
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // In a real application, you would:
    // 1. Verify the session token
    // 2. Get the user ID from the token
    // 3. Update the user's profile in your database
    // 4. Return the updated user data

    // For now, we'll just return the updated data as if it was saved
    return NextResponse.json({
      user: {
        id: '1', // In a real app, this would be the actual user ID
        ...validatedData
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
