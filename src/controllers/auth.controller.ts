import jwt from "jsonwebtoken";
import axios from "axios";
import bcrypt from "bcrypt";
import { Types } from "mongoose";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/user.model";

const jwtSecret = process.env.JWT_SECRET || "";

// Initialize Google Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: Generate JWT Token
const generateToken = (id: Types.ObjectId) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: "7d" });
};

// 1. LOCAL SIGNUP
export const registerLocal = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      password,
      authProvider: "local",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 2. LOCAL LOGIN
export const loginLocal = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Important: Prevent Google/Github users from logging in with a blank password
    if (user && user.authProvider !== "local" && !user.password) {
      return res.status(400).json({
        message: `Please login using your ${user.authProvider} account.`,
      });
    }

    const isMatch =
      user && user.password
        ? await bcrypt.compare(password, user.password)
        : false;

    if (user && isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// 3. GOOGLE LOGIN
export const loginGoogle = async (req: Request, res: Response) => {
  try {
    const { token } = req.body; // Token sent by React frontend

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    });

    // Get the payload without destructuring yet
    const payload = ticket.getPayload();

    // Add a safety check! If it's undefined, stop here.
    if (!payload) {
      return res.status(400).json({ message: "Invalid Google token payload" });
    }

    const { sub: googleId, name, email, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if they don't exist
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        authProvider: "google",
      });
    } else if (!user.googleId) {
      // Link Google account to existing email/password account
      user.googleId = googleId;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid Google Token", error });
  }
};

// 4. GITHUB LOGIN
export const loginGithub = async (req: Request, res: Response) => {
  try {
    const { code } = req.body; // Code sent by React frontend after GitHub redirect

    // Step 1: Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      },
    );

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Get user profile from GitHub
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubUser = userResponse.data;
    let email = githubUser.email;

    // Step 3: If email is private, fetch primary email explicitly
    if (!email) {
      const emailResponse = await axios.get(
        "https://api.github.com/user/emails",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      email = emailResponse.data.find(
        (e: { primary: boolean; verified: boolean; email: string }) =>
          e.primary && e.verified,
      ).email;
    }

    // Step 4: Find or Create User
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: githubUser.name || githubUser.login,
        email,
        githubId: githubUser.id,
        avatar: githubUser.avatar_url,
        authProvider: "github",
      });
    } else if (!user.githubId) {
      // Account linking
      user.githubId = githubUser.id;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(401).json({ message: "GitHub authentication failed", error });
  }
};
