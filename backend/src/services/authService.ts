import { supabase } from "../db/supabase.js";
import { v4 as uuidv4 } from "uuid";

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
}

export class AuthService {
  // Register a new user with email/password
  static async register(
    email: string,
    password: string,
    username: string
  ): Promise<{ user: AuthUser; token: string }> {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm to allow immediate login
    });

    if (authError || !authData.user) {
      throw new Error(`Registration failed: ${authError?.message}`);
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: authData.user.id,
        username,
      });

    if (profileError) {
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    // Generate a session token
    const token = this.generateToken(authData.user.id, username);

    return {
      user: {
        id: authData.user.id,
        username,
        email,
      },
      token,
    };
  }

  // Login with email/password
  static async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      throw new Error(`Login failed: ${error?.message}`);
    }

    // Get user profile to fetch username
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("username")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      throw new Error(`Failed to fetch user profile: ${profileError.message}`);
    }

    const token = this.generateToken(data.user.id, profile.username);

    return {
      user: {
        id: data.user.id,
        username: profile.username,
        email,
      },
      token,
    };
  }

  // Create anonymous session (no credentials required)
  static async loginAnonymous(): Promise<{ user: AuthUser; token: string }> {
    const anonId = uuidv4();
    const anonUsername = `player_${anonId.slice(0, 8)}`;

    // Create anon user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: `${anonId}@anon.local`,
      password: uuidv4(), // Random password, won't be used
      email_confirm: true,
      user_metadata: {
        is_anonymous: true,
      },
    });

    if (authError || !authData.user) {
      throw new Error(`Anonymous login failed: ${authError?.message}`);
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: authData.user.id,
        username: anonUsername,
      });

    if (profileError) {
      throw new Error(`Failed to create anonymous profile: ${profileError.message}`);
    }

    const token = this.generateToken(authData.user.id, anonUsername);

    return {
      user: {
        id: authData.user.id,
        username: anonUsername,
      },
      token,
    };
  }

  // Verify token and return user info
  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      // In a real app, verify JWT signature
      const decoded = this.decodeToken(token);
      if (!decoded) return null;

      // Fetch fresh user data
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", decoded.userId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        username: data.username,
      };
    } catch {
      return null;
    }
  }

  // Utility: Generate a simple JWT-like token (you should use a proper JWT library in production)
  private static generateToken(userId: string, username: string): string {
    const payload = {
      userId,
      username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    };
    // In production, use: import jwt from 'jsonwebtoken';
    // return jwt.sign(payload, process.env.JWT_SECRET!);
    // For now, return base64 encoded (not secure for production)
    return Buffer.from(JSON.stringify(payload)).toString("base64");
  }

  // Utility: Decode token
  private static decodeToken(
    token: string
  ): { userId: string; username: string } | null {
    try {
      const decoded = JSON.parse(Buffer.from(token, "base64").toString());
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        return null; // Token expired
      }
      return { userId: decoded.userId, username: decoded.username };
    } catch {
      return null;
    }
  }
}
