import { withAdminAuth } from "@/utils/auth";
import prisma from '@/utils/db';

async function handler(req, res) {

    // check if method is POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {

        // get hide data from request body
        const { contentType, contentId } = req.body;

        // validate input
        if (!contentType || !contentId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // check if content exists
        let content;
        if (contentType === "POST") {
            content = await prisma.post.findUnique({ where: { id: contentId } });
        } 
        else if (contentType === "COMMENT") {
            content = await prisma.comment.findUnique({ where: { id: contentId } });
        }
        else {
            return res.status(400).json({ error: "Invalid content type" });
        }
        if (!content) {
            return res.status(404).json({ error: "Content not found" });
        }

        // check if content is hidden
        if (!content.isHidden) {

            // hide content if it was not hidden
            await prisma[contentType.toLowerCase()].update({
                where: { id: contentId },
                data: { isHidden: true }
            });

            // return success message
            return res.status(200).json({ message: "Content successfully hidden" });
        }
        
        else {

            // unhide content if it was hidden
            await prisma[contentType.toLowerCase()].update({
                where: { id: contentId },
                data: { isHidden: false }
            });

            // return success message
            return res.status(200).json({ message: "Content successfully unhidden" });
        
        }

    }
    catch (error) {

        return res.status(500).json({ error: "An unexpected error occurred while fetching sortedposts and comments" });

    }

}

export default withAdminAuth(handler);