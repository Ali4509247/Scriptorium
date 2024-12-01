import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { generateAccessToken, generateRefreshToken, comparePassword } from '../../../lib/auth';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials1' });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials2' });
      }
      console.log("WORKING");
      const accessToken = generateAccessToken(`${user.id}`);
      const refreshToken = generateRefreshToken(`${user.id}`);
      console.log("WORKING2");
      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}