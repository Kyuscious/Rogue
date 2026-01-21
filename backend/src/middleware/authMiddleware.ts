import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

// Middleware to verify JWT token
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  try {
    const user = await AuthService.verifyToken(token);
    if (!user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token verification failed" });
  }
};
