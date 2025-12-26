import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET as string;

// Kita perlu meng-extend interface Request agar TypeScript tidak error saat kita menambah property 'user'
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  // 1. Ambil token dari header 'Authorization' (Format: Bearer <token>)
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // 2. Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };

    // 3. Simpan data user hasil decode ke dalam objek request
    req.user = decoded;
    
    // 4. Lanjut ke fungsi controller berikutnya
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};