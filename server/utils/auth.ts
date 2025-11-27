import { H3Event } from "h3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface JWTPayload {
  userId: number;
  username: string;
  role: "ADMIN" | "EMPLOYEE";
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Get user from request
export async function getUserFromEvent(
  event: H3Event
): Promise<JWTPayload | null> {
  const authHeader = getHeader(event, "authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

// Require authentication middleware
export async function requireAuth(event: H3Event): Promise<JWTPayload> {
  const user = await getUserFromEvent(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: "ກະລຸນາເຂົ້າສູ່ລະບົບ",
    });
  }

  return user;
}

// Require admin role
export async function requireAdmin(event: H3Event): Promise<JWTPayload> {
  const user = await requireAuth(event);

  if (user.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      message: "ທ່ານບໍ່ມີສິດເຂົ້າເຖິງ",
    });
  }

  return user;
}

// Generate invoice number
export function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `INV${year}${month}${day}${random}`;
}

