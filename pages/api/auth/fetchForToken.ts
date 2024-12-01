import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { verifyRefreshToken } from "../../../lib/auth";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { token } = req.body;

    const user = verifyRefreshToken(token);

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(user.userId, 10) },
    });
    res.status(200).json(currentUser);
  }
}
