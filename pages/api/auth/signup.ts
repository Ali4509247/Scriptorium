import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../../../lib/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { firstname, lastname, email, phone, password, avatar } = req.body;

    try {
      // Check if the user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash the user's password
      const hashedPassword = await hashPassword(password);

      // Create a new user in the database
      const user = await prisma.user.create({
        data: { firstname, lastname, email, phone, password: hashedPassword, avatar },
      });

      // Respond with success message and user ID
      res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
      // Handle any internal server errors
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    // Handle unsupported HTTP methods
    res.status(405).json({ message: 'Method not allowed' });
  }
}