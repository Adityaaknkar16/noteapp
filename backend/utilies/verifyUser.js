import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  let token = req.cookies?.access_token;

  // If cookie is not present or blocked cross-site, check Authorization header
  if (!token && req.headers?.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Also check x-auth-token fallback
  if (!token && req.headers?.["x-auth-token"]) {
    token = req.headers["x-auth-token"];
  }

  if (!token) {
    return next(errorHandler(401, "Unauthorized - No access token provided"));
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("CRITICAL: JWT_SECRET environment variable is missing!");
    return next(errorHandler(500, "Server configuration error: missing JWT_SECRET"));
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return next(errorHandler(403, "Forbidden - Invalid or expired token"));
    }
    req.user = user;
    next();
  });
};