const { getUserById } = require("../lib/database");

const jwt = require("jsonwebtoken");
const JWT_SECRET = "SECRET_STRING";

async function requireAuthJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // This is failing
    const user = await getUserById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(403).json({ message: "Invalid token" });
  }
}

module.exports = { requireAuthJWT };
