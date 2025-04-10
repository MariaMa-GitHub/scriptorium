import prisma from '@/utils/db';
import { comparePassword, generateAccessToken, generateRefreshToken } from "@/utils/auth";

export const ACCESS_TOKEN_EXPIRES_IN = 15 * 60 * 1000;
export const REFRESH_TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; 

export default async function handler(req, res) {

    // check if method is POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {

        // get user data from request body
        const { email, password } = req.body;

        // check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        // compare password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // access token payload
        const accessTokenPayload = { id: user.id, role: user.role, email: user.email, firstName: user.firstName, lastName: user.lastName, phoneNumber: user.phoneNumber, avatar: user.avatar, expiresAt: Date.now() + ACCESS_TOKEN_EXPIRES_IN };

        // refresh token payload
        const refreshTokenPayload = { id: user.id, role: user.role, email: user.email, firstName: user.firstName, lastName: user.lastName, phoneNumber: user.phoneNumber, avatar: user.avatar, expiresAt: Date.now() + REFRESH_TOKEN_EXPIRES_IN };

        // generate access token
        const accessToken = generateAccessToken(accessTokenPayload);

        // generate refresh token
        const refreshToken = generateRefreshToken(refreshTokenPayload);

        // return token
        return res.status(200).json({ "accessToken": accessToken, "refreshToken": refreshToken });

    } 
    catch (error) {
        
        return res.status(500).json({ error: "An unexpected error occurred during login" });
    
    }

}