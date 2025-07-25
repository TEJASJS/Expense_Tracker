import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Step 1: Get the access token from the backend
    const tokenResponse = await fetch(`${API_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: email,
        password: password,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      return NextResponse.json({ error: errorData.detail || 'Failed to authenticate' }, { status: tokenResponse.status });
    }

    const { access_token } = await tokenResponse.json();

    // Step 2: Use the access token to get user details
    const userResponse = await fetch(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      return NextResponse.json({ error: errorData.detail || 'Failed to fetch user details' }, { status: userResponse.status });
    }

    const user = await userResponse.json();

    // Step 3: Return the user details to the frontend
    return NextResponse.json({ user });

  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
