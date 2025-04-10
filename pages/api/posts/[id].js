import { withAuth } from "@/utils/auth";
import prisma from '@/utils/db';

async function handler(req, res) {

    // check if method is PUT
    if (req.method === "PUT") {

        try {

            // get post id from request query
            const { id } = req.query;
            const postId = parseInt(id);

            // check if post id is provided and valid
            if (isNaN(postId)) {
                return res.status(400).json({ error: "Invalid post ID" });
            }

            // get post data from request body
            const { title, description, content, tagList, templateList } = req.body;

            // check if required fields are missing
            if (!title || !content) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            // retrieve the post from the database
            const existingPost = await prisma.post.findUnique({
                where: { id: postId },
                include: { tags: true, templates: true }
            });
            if (!existingPost) {
                return res.status(404).json({ error: "Post not found" });
            }

            // check post ownership
            if (existingPost.authorId !== req.user.id) {
                return res.status(403).json({ error: "You don't have permission to modify this post" });
            }

            // disconnect all existing connections
            await prisma.post.update({
                where: { id: postId },
                data: {
                    tags: { disconnect: existingPost.tags.map(tag => ({ id: tag.id })) },
                    templates: { disconnect: existingPost.templates.map(template => ({ id: template.id })) }
                }
            });

            // get new tags from database
            const tagNames = tagList ? tagList.split(",").map(tag => tag.trim()).filter(Boolean) : [];
            const tags = await Promise.all(tagNames.map(async (name) => {
                return await prisma.tag.upsert({
                    where: { name },
                    update: {},
                    create: { name },
                });
            }));

            // get new templates from database
            const templateIds = Array.isArray(templateList) ? templateList.map(id => parseInt(id)).filter(id => !isNaN(id)) : [];
            const templates = await prisma.template.findMany({
                where: { id: { in: templateIds } }
            });

            // check if all template ids are valid，if any id is invalid, return 400
            const existingIds = templates.map(template => template.id);
            const missingIds = [];
            for (const id of templateIds) {
                if (!existingIds.includes(id)) {
                    missingIds.push(id);
                }
            }
            if (missingIds.length > 0) {
                return res.status(400).json({ error: `The following template IDs do not exist: ${missingIds.join(", ")}` });
            }

            // update post
            const updatedPost = await prisma.post.update({
                where: { id: postId },
                data: {
                    title,
                    description,
                    content,
                    authorId: existingPost.authorId,
                    tags: { connect: tags.map(tag => ({ id: tag.id })) },
                    templates: { connect: templates.map(template => ({ id: template.id })) }
                }
            });

            // return post
            return res.status(200).json(updatedPost);

        } 
        catch (error) {

            return res.status(500).json({ error: "An unexpected error occurred while updating the post" });
        
        }

    }
    // check if method is DELETE
    else if (req.method === "DELETE") {

        try {

            // get post id from request query
            const { id } = req.query;
            const postId = parseInt(id);
            
            // check if post id is provided and valid
            if (isNaN(postId)) {
                return res.status(400).json({ error: "Invalid post ID" });
            }

            // check if post exists
            const post = await prisma.post.findUnique({
                where: { id: postId },
                include: { tags: true, templates: true, comments: true, reports: true, votes: true }
            });
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }

            // check post ownership
            if (post.authorId !== req.user.id) {
                return res.status(403).json({ error: "You don't have permission to delete this post" });
            }

            // delete comments associated with the post
            await prisma.comment.deleteMany({
                where: { postId: postId }
            });

            // delete votes associated with the post
            await prisma.vote.deleteMany({
                where: { postId: postId }
            });

            // delete reports associated with the post
            await prisma.report.deleteMany({
                where: { postId: postId }
            });

            // disconnect tags and templates from the post
            await prisma.post.update({
                where: { id: postId },
                data: {
                    tags: { disconnect: post.tags?.map(tag => ({ id: tag.id })) || [] },
                    templates: { disconnect: post.templates?.map(template => ({ id: template.id })) || [] }
                }
            });

            // delete post
            await prisma.post.delete({ where: { id: postId } });

            // return success response
            return res.status(200).json({ message: "Post deleted successfully" });

        } 
        catch (error) {

            return res.status(500).json({ error: "An unexpected error occurred while deleting the post" });
        
        }
    } 
    else {
        return res.status(405).json({ error: "Method not allowed" });
    }

}

export default withAuth(handler);
