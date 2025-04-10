import { withAuth } from "@/utils/auth";
import prisma from '@/utils/db';

async function handler(req, res) {

    // check if method is PUT
    if (req.method === "PUT") {

        try {

            // get template id from request query
            const { id } = req.query;
            const templateId = parseInt(id);

            // check if template id is provided and valid
            if (isNaN(templateId)) {
                return res.status(400).json({ error: "Invalid template ID" });
            }

            // get template data from request body
            const { title, code, language, explanation, tagList } = req.body;

            // check if template data is provided
            if (!title || !code || !language) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            // retrieve the template from the database
            const template = await prisma.template.findUnique({
                where: { id: templateId },
                include: { tags: true },
            });
            if (!template) {
                return res.status(404).json({ error: "Template not found" });
            }

            // check template ownership
            if (template.authorId !== req.user.id) {
                return res.status(403).json({ error: "You don't have permission to modify this template" });
            }

            // get tags of the template
            const previousTags = template.tags;

            // remove the template from the templates field of each tag
            await Promise.all(previousTags.map(async (tag) => {
                await prisma.tag.update({
                    where: { id: tag.id },
                    data: { templates: { disconnect: { id: templateId } } },
                });
            }));

            // check if the template exists
            if (!template) {
                return res.status(404).json({ error: "Template not found" });
            }

            // verify the current user is the owner/creator of the template
            if (template.authorId !== req.user.id) {
                return res.status(403).json({ error: "You do not have permission to update this template" });
            }

            // extract tags from comma separated string
            const tagNames = tagList.split(",").map(tag => tag.trim());

            // get tags from database (if they don't exist, create them)
            const tags = await Promise.all(tagNames.map(async (name) => {
                return await prisma.tag.upsert({
                    where: { name },
                    update: {},
                    create: { name },
                });
            }));

            // get tag ids
            const tagIds = tags.map(tag => tag.id);

            // update the template with new data
            const updatedTemplate = await prisma.template.update({
                where: { id: templateId },
                data: {
                    title: title,
                    code: code,
                    language: language,
                    explanation: explanation,
                    tags: { connect: tagIds.map(id => ({ id })) },
                },
            });

            // update the templates field for each tag
            await Promise.all(tags.map(async (tag) => {
                await prisma.tag.update({
                    where: { id: tag.id },
                    data: { templates: { connect: { id: updatedTemplate.id } } },
                });
            }));

            // return template
            return res.status(200).json(updatedTemplate);

        }
        catch (error) {

            return res.status(500).json({ error: "An unexpected error occurred while updating a template"});
        
        }

    }
    // check if method is DELETE
    else if (req.method === "DELETE") {

        try {

            // get template id from request query
            const { id } = req.query;
            const templateId = parseInt(id);

            // check if template id is provided and valid
            if (isNaN(templateId)) {
                return res.status(400).json({ error: "Invalid template ID" });
            }

            // check if the template exists
            const template = await prisma.template.findUnique({
                where: { id: templateId },
                include: { tags: true, posts: true }
            });
            if (!template) {
                return res.status(404).json({ error: "Template not found" });
            }

            // check template ownership
            if (template.authorId !== req.user.id) {
                return res.status(403).json({ error: "You don't have permission to delete this template" });
            }

            // disconnect tags and posts from the template
            await prisma.template.update({
                where: { id: templateId },
                data: {
                    tags: {
                        disconnect: template.tags.map(tag => ({ id: tag.id }))
                    },
                    posts: {
                        disconnect: template.posts.map(post => ({ id: post.id }))
                    }
                }
            });

            // delete the template
            await prisma.template.delete({ where: { id: templateId } });

            // return success response
            return res.status(200).json({ message: "Template deleted successfully" });

        }
        catch (error) {

            return res.status(500).json({ error: "An unexpected error occurred while deleting a template" });
        
        }

    }
    else {
        return res.status(405).json({ error: "Method not allowed" });
    }

}

export default withAuth(handler);