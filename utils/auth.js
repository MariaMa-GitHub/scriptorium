import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS);
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

export async function hashPassword(password) {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

export function generateAccessToken(obj) {
    return jwt.sign(obj, JWT_ACCESS_SECRET, {
        expiresIn: JWT_ACCESS_EXPIRES_IN,
    });
}

export function generateRefreshToken(obj) {
    return jwt.sign(obj, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
}

export function verifyToken(token) {
    if (!token?.startsWith("Bearer ")) {
        return null;
    }

    token = token.split(" ")[1];

    try {
        return jwt.verify(token, JWT_ACCESS_SECRET);
    } 
    catch (err) {
        return null;
    }
}

export function verifyAdminToken(token) {
    if (!token?.startsWith("Bearer ")) {
        return null;
    }

    token = token.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
        if (decoded.role !== "ADMIN") {
            return null;
        }
        return decoded;
    } 
    catch (err) {
        return null;
    }
}

export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    }
    catch (err) {
        return null;
    }
}

export function withAuth(handler) {
    return async (req, res) => {
        const user = verifyToken(req.headers.authorization);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = user;
        return handler(req, res);
    };
}

export function withAdminAuth(handler) {
    return async (req, res) => {
        const user = verifyAdminToken(req.headers.authorization);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = user;
        return handler(req, res);
    };
}
