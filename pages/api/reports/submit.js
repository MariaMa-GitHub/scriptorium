import { withAuth } from "@/utils/auth";
import prisma from "@/utils/db";

async function handler(req, res) {

    // check if method is POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {

        // get report data from request body
        const { contentType, contentId, reason } = req.body;

        // get reporter id from request user
        const reporterId = req.user.id;

        // validate input
        if (!contentType || !contentId || !reason) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // check if content exists
        let content;
        if (contentType === "POST") {
            content = await prisma.post.findUnique({ where: { id: contentId } });
        } else if (contentType === "COMMENT") {
            content = await prisma.comment.findUnique({ where: { id: contentId } });
        } else {
            return res.status(400).json({ error: "Invalid content type" });
        }
        if (!content) {
            return res.status(404).json({ error: "Content not found" });
        }

        // check if reporter has already reported this content
        const existingReport = await prisma.report.findFirst({
            where: { reporterId, [contentType.toLowerCase()]: { id: contentId } },
        });
        if (existingReport) {
            return res.status(400).json({ error: "You have already reported this content" });
        }

        // create report
        const report = await prisma.report.create({
            data: {
                reason,
                reporter: { connect: { id: reporterId } },
                [contentType.toLowerCase()]: { connect: { id: contentId } },
            },
        });

        // add the report to the content
        await prisma[contentType.toLowerCase()].update({
            where: { id: contentId },
            data: { reports: { connect: { id: report.id } } },
        });

        // return report
        return res.status(200).json({ report });

    } 
    catch (error) {
        
        return res.status(500).json({ error: "An unexpected error occurred while submitting the report"});

    }

}

export default withAuth(handler);