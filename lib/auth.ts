import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt";

const BCRYPT_SALT_ROUNDS: number = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
const ACCESS_SECRET: string = process.env.ACCESS_SECRET || '';
const REFRESH_SECRET: string = process.env.REFRESH_SECRET || '';
const ACCESS_EXPIRE: string = process.env.ACCESS_EXPIRES_IN || '1h';
const REFRESH_EXPIRE: string = process.env.REFRESH_EXPIRES_IN || '7d';

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRE });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRE });
};

export const verifyAccessToken = (token: string): jwt.JwtPayload | null => {
  try {
    return jwt.verify(token, ACCESS_SECRET) as jwt.JwtPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): jwt.JwtPayload | null => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as jwt.JwtPayload;
  } catch {
    return null;
  }
};

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
