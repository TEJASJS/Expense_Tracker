import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    let user = await db.getUserByEmail(email);
    
    if (user) {
      // Login existing user
      const isValidPassword = await db.verifyPassword(password, user.hashed_password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
    } else if (name) {
      // Create new user (signup)
      user = await db.createUser({ name, email, password });
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at
    };
    
    res.status(200).json({ user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}