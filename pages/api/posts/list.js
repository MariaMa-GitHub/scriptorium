import prisma from '@/utils/db';

export default async function handler(req, res) {

    // check if method is GET
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        
        // get pagination parameters
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // validate page number
        if (page < 1) {
            return res.status(400).json({ error: "Invalid page number" });
        }

        // get posts from database
        const [total, posts] = await Promise.all([
            prisma.post.count({
                where: {
                    isHidden: false
                }
            }),
            prisma.post.findMany({
                where: {
                    isHidden: false
                },
                skip: parseInt(skip),
                take: parseInt(limit),
                select: {
                    id: true,
                    title: true,
                    description: true,
                    isHidden: true,
                    author: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    },
                    tags: {
                        select: {
                            name: true,
                        },
                    },
                    votes: {
                        select: {
                            id: true,
                            isUpvote: true,
                        },
                    },
                    comments: true,
                    createdAt: true
                },
            })
        ]);

        // calculate ratings (upvotes - downvotes) for each post
        posts.forEach(post => {
            post.rating = post.votes.reduce((acc, vote) => acc + (vote.isUpvote ? 1 : -1), 0);
        });

        // sort posts by ratings in descending order
        posts.sort((a, b) => b.rating - a.rating);

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