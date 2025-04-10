import prisma from '@/utils/db';
import { hashPassword } from "@/utils/auth";

// check if email is valid
function isValidEmail(email) {
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
}

// check if password is valid (at least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character)
function isValidPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
}

// check if name is valid (1 to 35 characters)
function isValidName(name) {
    return /^[a-zA-Z\s'-]{1,35}$/.test(name);
}

// check if image url is valid
function isValidImageUrl(url) {

    // an empty string is considered valid
    if (!url) {
        return true;
    }

    // check if url is valid
    try {
        new URL(url); 
        return true;
    } 
    catch (error) {
        return false;
    }

}

export default async function handler(req, res) {

    // check if method is POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {

        // get user data from request body
        const { email, password, firstName, lastName, phoneNumber, avatar, role, adminSecret } = req.body;

        // check if user data is valid
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // check if email is valid
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email" });
        }

        // check if email is unique (not already in use)
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // check if password is valid
        if (!isValidPassword(password)) {
            return res.status(400).json({ error: "Invalid or weak password" });
        }

        // check if name is valid
        if (!isValidName(firstName) || !isValidName(lastName)) {
            return res.status(400).json({ error: "Invalid name(s)" });
        }

        // check if avatar is a valid image url
        if (!isValidImageUrl(avatar)) {
            return res.status(400).json({ error: "Invalid avatar url" });
        }

        // check if role is valid
        if (role && role.toUpperCase() !== "ADMIN" && role.toUpperCase() !== "USER") {
            return res.status(400).json({ error: "Invalid role" });
        }

        // check if user is an admin and if admin secret is valid
        if (role && role.toUpperCase() === "ADMIN" && (!adminSecret || adminSecret !== process.env.ADMIN_SECRET)) {
            return res.status(401).json({ error: "Administrator authentication is required" });
        }

        // hash password
        const hashedPassword = await hashPassword(password);

        // create user in database
        const user = await prisma.user.create({
            data: { 
                email, 
                password: hashedPassword, 
                firstName: firstName.trim(), 
                lastName: lastName.trim(), 
                phoneNumber, 
                avatar, 
                role: role || "USER"
            },
            select: {
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                avatar: true
            },
        });

        // return user data
        res.status(201).json(user);

    } 
    catch (error) {

        res.status(500).json({ error: "An unexpected error occurred during registration:" + error.message });
    
    }

}
