import { withAuth } from "@/utils/auth";
import prisma from '@/utils/db';

async function handler(req, res) {

    // check if method is GET
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {

        // get page and limit from query
        const { page = 1, limit = 9 } = req.query;
        const skip = (page - 1) * limit;

        // validate page number
        if (page < 1) {
            return res.status(400).json({ error: "Invalid page number" });
        }

        // get author id from request user
        const authorId = req.user.id;

        // get posts of current user from database
        const [total, posts] = await Promise.all([
            prisma.post.count({
                where: { authorId }
            }),
            prisma.post.findMany({
                where: { authorId },
                skip: parseInt(skip),
                take: parseInt(limit),
                select: {
                    id: true,
                    title: true,
                    description: true,
                    content: true,
                    isHidden: true,
                    author: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    tags: {
                        select: {
                            name: true,
                        },
                    },
                    templates: {
                        select: {
                            id: true,
                            title: true,
                            code: true,
                            language: true,
                            explanation: true,
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
                        },
                    },
                    comments: {
                        select: {
                            id: true,
                            content: true,
                            isHidden: true,
                            author: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                            votes: {
                                select: {
                                    id: true,
                                    isUpvote: true,
                                },
                            },
                        },
                    },
                    votes: {
                        select: {
                            id: true,
                            isUpvote: true,
                        },
                    },
                    reports: {
                        select: {
                            id: true,
                            reason: true,
                        },
                    },
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
        ]);

        // return posts
        return res.status(200).json({ 
            posts,
            total,
            totalPages: Math.ceil(total / parseInt(limit))
        });

    }
    catch (error) {

        return res.status(500).json({ error: "An unexpected error occurred while fetching posts" });

    }

}

export default withAuth(handler);