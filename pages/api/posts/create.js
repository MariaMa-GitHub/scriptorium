import { withAuth } from "@/utils/auth";
import prisma from '@/utils/db';

async function handler(req, res) {

    // check if method is POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        
        // get post data from request body
        const { title, description, content, tagList, templateList } = req.body;

        // check if post data is provided
        if (!title || !content) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // get author id from request user
        const authorId = req.user.id;

        // get tags from database
        const tagNames = tagList ? tagList.split(",").map(tag => tag.trim()).filter(Boolean) : [];
        const tags = await Promise.all(tagNames.map(async (name) => {
            return await prisma.tag.upsert({
                where: { name },
                update: {},
                create: { name },
            });
        }));

        // get templates from database
        const templateIds = Array.isArray(templateList) ? templateList.map(id => parseInt(id)).filter(id => !isNaN(id)) : [];
        const templates = await prisma.template.findMany({
            where: { id: { in: templateIds } }
        });

        // check if all template ids exist
        const existingIds = templates.map(template => template.id);
        const missingIds = [];
        for (const id of templateIds) {
            if (!existingIds.includes(id)) {
                missingIds.push(id);
            }
        }
        if (missingIds.length > 0) {
            return res.status(400).json({ error: "Some templates do not exist" });
        }

        // create post
        const post = await prisma.post.create({
            data: {
                title,
                description,
                content,
                authorId, 
                tags: { connect: tags.map(tag => ({ id: tag.id })) },
                templates: { connect: templates.map(template => ({ id: template.id })) }
            },
            include: {
                tags: true,
                templates: true
            }
        });

        // update the posts field for each template being referenced
        await Promise.all(templates.map(async (template) => {
            await prisma.template.update({
                where: { id: template.id },
                data: {
                    posts: {
                        connect: { id: post.id }
                    }
                }
            });
        }));

        // return post
        return res.status(200).json({ post });

    }
    catch (error) {

        return res.status(500).json({ error: "An unexpected error occurred while creating a post" });

    }

}

export default withAuth(handler);
