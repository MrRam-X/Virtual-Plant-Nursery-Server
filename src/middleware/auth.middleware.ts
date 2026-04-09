import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser, User } from "../models/user.model";

// 1. Extend the Express Request to include our User object
export interface AuthRequest extends Request {
  user?: IUser | null;
}

// 2. Define the expected shape of our decoded JWT payload
interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as JwtPayload;

      // Find user and attach to the custom AuthRequest object
      req.user = (await User.findById(decoded.id).select(
        "-password",
      )) as IUser | null;

      next(); // Move to the controller
    } catch (error) {
      console.error(error);
      res
        .status(401)
        .json({ message: "Not authorized, token failed or expired" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};
