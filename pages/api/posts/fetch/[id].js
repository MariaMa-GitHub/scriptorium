import prisma from '@/utils/db';

export default async function handler(req, res) {

    // check if method is GET
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {

        // get post id from request query
        const { id } = req.query;
        const postId = parseInt(id);

        // check if post id is provided and valid
        if (isNaN(postId)) {
            return res.status(400).json({ error: "Invalid post ID" });
        }

        // retrieve the post from the database
        let post = await prisma.post.findUnique({
            where: { id: postId },
        });

        // check if the post exists
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // select the post fields
        post = await prisma.post.findUnique({
            where: { id: postId },
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
                        avatar: true,
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
                        parentId: true,
                        isHidden: true,
                        parentId: true,
                        createdAt: true,
                        author: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                        votes: {
                            select: {
                                id: true,
                                isUpvote: true,
                                voterId: true,
                            },
                        },
                        reports: {
                            select: {
                                id: true,
                                reason: true,
                                reporterId: true,
                            },
                        },
                        createdAt: true,
                    },
                },
                votes: {
                    select: {
                        id: true,
                        isUpvote: true,
                        voterId: true,
                    },
                },
                reports: {
                    select: {
                        id: true,
                        reason: true,
                        reporterId: true,
                    },
                },
                createdAt: true,
            },
        });

        // sort comments by ratings (upvotes - downvotes)
        post.comments = post.comments.sort((a, b) => {
            const ratingA = a.votes.reduce((acc, vote) => acc + (vote.isUpvote ? 1 : -1), 0);
            const ratingB = b.votes.reduce((acc, vote) => acc + (vote.isUpvote ? 1 : -1), 0);
            return ratingB - ratingA;
        });

        // return the post
        return res.status(200).json(post);

    }
    catch (error) {

        return res.status(500).json({ error: "An unexpected error occurred while fetching a post"});
    
    }

}