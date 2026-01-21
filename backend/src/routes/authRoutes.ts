import { Router, Request, Response } from "express";
import { AuthService } from "../services/authService.js";

const router = Router();

// Register new account
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ error: "Email, password, and username are required" });
    }

    const result = await AuthService.register(email, password, username);
    res.json(result);
  } catch (error) {
    res
      .status(400)
      .json({ error: error instanceof Error ? error.message : "Registration failed" });
  }
});

// Login with email/password
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Login failed" });
  }
});

// Anonymous login (no credentials)
router.post("/login-anonymous", async (req: Request, res: Response) => {
  try {
    const result = await AuthService.loginAnonymous();
    res.json(result);
  } catch (error) {
    res
      .status(400)
      .json({ error: error instanceof Error ? error.message : "Anonymous login failed" });
  }
});

export default router;
