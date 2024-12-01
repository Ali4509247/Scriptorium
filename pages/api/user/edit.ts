import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { verifyRefreshToken } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {

    const user = verifyRefreshToken(req.headers.authorization || '');

    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const { firstname, lastname, email, phone, password, avatar } = req.body as {
      firstname: string;
      lastname: string;
      email: string;
      phone: string;
      password: string;
      avatar: string;
    };

    const currentUser = await prisma.user.findUnique({ where: { id: parseInt(user.userId) } });
    console.log(currentUser);
    console.log(currentUser?.email);
    console.log(firstname);
    console.log(email);
    if (!currentUser || currentUser.email !== email) {
      return res.status(401).json({ message: 'You cannot update your email' });
    }

    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { firstname, lastname, email, phone, password, avatar },
    });

    return res.status(200).json({ updatedUser });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}