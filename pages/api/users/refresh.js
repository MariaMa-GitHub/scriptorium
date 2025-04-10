import { generateAccessToken, verifyRefreshToken } from "@/utils/auth";
import { ACCESS_TOKEN_EXPIRES_IN } from "./login";

export default function handler(req, res) {

    // check if method is POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {

        // get refresh token from request body
        const { refreshToken } = req.body;

        // check if refresh token is provided
        if (!refreshToken) {
            return res.status(400).json({ error: "Missing refresh token" });
        }

        // verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // check if refresh token is valid
        if (!decoded) {
            return res.status(401).json({ error: "Invalid refresh token" });
        }

        // new access token payload
        const accessTokenPayload = { id: decoded.id, role: decoded.role, email: decoded.email, firstName: decoded.firstName, lastName: decoded.lastName, expiresAt: Date.now() + ACCESS_TOKEN_EXPIRES_IN };

        // generate new access token
        const accessToken = generateAccessToken(accessTokenPayload);

        // return access token
        return res.status(200).json({ accessToken });

    }
    catch (err) {

        return res.status(500).json({ error: "An unexpected error occurred during refresh" });

    }

}