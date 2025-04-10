import { withAdminAuth } from "@/utils/auth";
import prisma from '@/utils/db';

async function handler(req, res) {

    // check if method is GET
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        
        // get pagination parameters
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Get total counts first
        const totalPosts = await prisma.post.count();
        const totalComments = await prisma.comment.count();

        // get posts from database
        const posts = await prisma.post.findMany({
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                title: true,
                description: true,
                isHidden: true,
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                tags: {
                    select: {
                        name: true,
                    },
                },
                reports: {
                    select: {
                        id: true,
                    },
                },
                createdAt: true,
            },
        });

        // get comments from database
        const comments = await prisma.comment.findMany({
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                content: true,
                isHidden: true,
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                postId: true,
                reports: {
                    select: {
                        id: true,
                    },
                },
                createdAt: true,
            },
        });

        // calculate report counts for each post
        posts.forEach(post => {
            post.reportCount = post.reports.length;
        });

        // calculate report counts for each comment
        comments.forEach(comment => {
            comment.reportCount = comment.reports.length;
        });

        // sort posts by report count then by creation date
        posts.sort((a, b) => {
            if (b.reportCount === a.reportCount) {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return b.reportCount - a.reportCount;
        });

        // sort comments by report count then by creation date
        comments.sort((a, b) => {
            if (b.reportCount === a.reportCount) {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return b.reportCount - a.reportCount;
        });
        
        // calculate total pages
        const totalPagesPosts = Math.ceil(totalPosts / limit);
        const totalPagesComments = Math.ceil(totalComments / limit);

        // return posts and comments
        return res.status(200).json({ 
            posts, 
            comments, 
            totalPosts, 
            totalComments, 
            totalPagesPosts, 
            totalPagesComments 
        });
        
    }
    catch (error) {

        return res.status(500).json({ error: "An unexpected error occurred while fetching sortedposts and comments" });

    }

}

export default withAdminAuth(handler);