import prisma from '@/utils/db';
import { withAuth } from '@/utils/auth';

// helper function: update post's comments order
async function updatePostCommentRanking(postId) {

    try {

        // get all comments of the post
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                comments: {
                    include: {
                        votes: true,
                        author: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            }
                        }
                    }
                }
            }
        });

        // check if post and comments exist
        if (!post || !post.comments) {
            throw new Error('Post or comments not found');
        }

        // calculate comment scores and sort by rating (upvotes - downvotes)
        const sortedComments = post.comments.sort((a, b) => {
            const ratingA = a.votes.reduce((acc, vote) => acc + (vote.isUpvote ? 1 : -1), 0);
            const ratingB = b.votes.reduce((acc, vote) => acc + (vote.isUpvote ? 1 : -1), 0);
            return ratingB - ratingA;
        });

        // update post's comments order
        await prisma.post.update({
            where: { id: postId },
            data: {
                comments: {
                    set: sortedComments.map(comment => ({
                        id: comment.id
                    }))
                }
            }
        });

        // return sorted comments
        return sortedComments;

    } 
    catch (error) {

        throw error;

    }

}

// helper function: calculate comment depth
async function getCommentDepth(commentId, prisma) {

    try {

        // initialize depth
        let depth = 0;

        // get the comment
        let currentComment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { parentId: true }
        });

        // calculate the depth
        while (currentComment?.parentId) {
            depth++;
            currentComment = await prisma.comment.findUnique({
                where: { id: currentComment.parentId },
                select: { parentId: true }
            });
        }

        // return the depth
        return depth;

    } 
    catch (error) {

        throw error;

    }

}

async function handler(req, res) {

    // check if method is POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {

        // get comment data from request body
        const { content, postId, parentId } = req.body;

        // check if post exists
        const postExists = await prisma.post.findUnique({
            where: { id: postId },
            select: { id: true }
        });
        if (!postExists) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // check if parent comment is in the same post
        if (parentId) {

            // get the parent comment
            const parentComment = await prisma.comment.findFirst({
                where: {
                    id: parentId,
                    postId: postId  
                }
            });

            // check if parent comment exists
            if (!parentComment) {
                return res.status(400).json({ 
                    message: 'Parent comment not found or does not belong to this post' 
                });
            }

            // check reply depth, can not reply to more than 7 levels
            const depth = await getCommentDepth(parentId, prisma);
            if (depth >= 7) { 
                return res.status(400).json({ 
                    message: 'Maximum reply depth (8 levels) reached' 
                });
            }

        }

        // create new comment
        const comment = await prisma.comment.create({
            data: {
                content,
                author: {
                    connect: { id: req.user.id }
                },
                post: {
                    connect: { id: postId }
                },
                parentId: parentId || null
            },
            select: {
                id: true,
                content: true,
                parentId: true,
                isHidden: true,
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                    }
                },
                votes: true
            }
        });

        // update post's comments order
        await updatePostCommentRanking(postId);

        // return comment
        return res.status(200).json(comment);

    } 
    catch (error) {
        
        return res.status(500).json({ message: 'An unexpected error occurred while creating a comment' });

    }
    
}

export default withAuth(handler);
