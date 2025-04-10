import prisma from '@/utils/db';
import { hashPassword } from "@/utils/auth";
import { withAuth } from "@/utils/auth";

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

async function handler(req, res) {

    // check if method is POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        
        // get user data from request body
        const { email, password, firstName, lastName, phoneNumber, avatar } = req.body;
        const userId = req.user.id;

        // check if user is authenticated
        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        // check if user data is valid
        if (!email && !password && !firstName && !lastName && !phoneNumber && !avatar) {
            return res.status(400).json({ error: "No fields to update" });
        }

        // prepare update data
        const updateData = {};

        // update email
        if (email) {

            if (!isValidEmail(email)) {
                return res.status(400).json({ error: "Invalid email" });
            }

            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ error: "Email already in use" });
            }

            updateData.email = email;

        }

        // update password
        if (password) {
            
            if (!isValidPassword(password)) {
                return res.status(400).json({ error: "Invalid or weak password" });
            }

            updateData.password = await hashPassword(password);

        }

        // update first name
        if (firstName) {
            
            if (!isValidName(firstName)) {
                return res.status(400).json({ error: "Invalid first name" });
            }

            updateData.firstName = firstName.trim();

        }

        // update last name
        if (lastName) {
            
            if (!isValidName(lastName)) {
                return res.status(400).json({ error: "Invalid last name" });
            }

            updateData.lastName = lastName.trim();

        }

        // update avatar
        if (avatar) {

            if (!isValidImageUrl(avatar)) {
                return res.status(400).json({ error: "Invalid avatar url" });
            }

            updateData.avatar = avatar;

        }

        // update phone number
        if (phoneNumber) {

            updateData.phoneNumber = phoneNumber;

        }

        // convert userId to number
        const userIdNumber = parseInt(userId, 10);
        if (isNaN(userIdNumber)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        // update user in database
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                avatar: true,
            },
        });

        // return updated user data
        res.status(200).json(updatedUser);

    } 
    catch (error) {

        res.status(500).json({ error: "An unexpected error occurred while updating profile" });
    
    }

}

export default withAuth(handler);