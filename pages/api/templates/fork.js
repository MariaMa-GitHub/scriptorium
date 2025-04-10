import { withAuth } from "@/utils/auth";
import prisma from '@/utils/db';

async function handler(req, res) {

    // check if method is POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {

        // get fork data from request body
        const { originalId } = req.body;
        
        // check if post data is provided
        if (!originalId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // get author id from request user
        const authorId = req.user.id;

        // get the original template from the database
        const originalTemplate = await prisma.template.findUnique({
            where: { id: originalId },
            include: { tags: true },
        });

        // check if original template exists
        if (!originalTemplate) {
            return res.status(404).json({ error: "Original template not found" });
        }

        // get tag names from original template
        const tagNames = Array.isArray(originalTemplate.tags) ? originalTemplate.tags.map(tag => tag.name) : [];

        // get tags from database
        const tags = await Promise.all(tagNames.map(async (name) => {
            return await prisma.tag.upsert({
                where: { name },
                update: {},
                create: { name },
            });
        }));

        // get tag ids
        const tagIds = tags.map(tag => tag.id);

        // create template
        const template = await prisma.template.create({
            data: { 
                title: `${originalTemplate.title} (forked)`, 
                code: originalTemplate.code, 
                language: originalTemplate.language, 
                explanation: originalTemplate.explanation, 
                isFork: true,
                originalId: originalId,
                author: { connect: { id: authorId } },
                tags: { connect: tagIds.map(id => ({ id })) },
            }
        });

        // update the templates field for the current user
        await prisma.user.update({
            where: { id: authorId },
            data: { templates: { connect: { id: template.id } } },
        });

        // update the templates field for each tag
        await Promise.all(tags.map(async (tag) => {
            await prisma.tag.update({
                where: { id: tag.id },
                data: { templates: { connect: { id: template.id } } },
            });
        }));

        // return template
        return res.status(200).json(template);

    }
    catch (error) {

        return res.status(500).json({ error: "An unexpected error occurred while forking a template"});

    }

}

export default withAuth(handler);