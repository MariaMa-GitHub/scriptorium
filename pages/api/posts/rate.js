import { withAuth } from "@/utils/auth";
import prisma from '@/utils/db';

async function handler(req, res) {

    // check if method is POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {

        // get targetId, targetType, and isUpvote from request body
        const { targetId, targetType, isUpvote } = req.body;

        // check if required fields are missing
        if (!targetId || !targetType) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // check if target type is valid
        if (!['POST', 'COMMENT'].includes(targetType)) {
            return res.status(400).json({ error: "Invalid target type" });
        }

        // get voter id
        const voterId = req.user.id;
        const parsedTargetId = parseInt(targetId);

        // check if target exists with its votes
        const target = await prisma[targetType.toLowerCase()].findUnique({
            where: { id: parsedTargetId },
            include: { votes: true }
        });
        if (!target) {
            return res.status(404).json({ error: 'Invalid target type' });
        }

        // check for existing vote
        const existingVote = await prisma.vote.findFirst({
            where: {
                voterId,
                ...(targetType.toLowerCase() === 'post' ? { postId: parsedTargetId } : { commentId: parsedTargetId })
            }
        });

        // update vote
        let vote;
        if (existingVote) {
            if (existingVote.isUpvote === isUpvote) {

                vote = await prisma.vote.delete({
                    where: { id: existingVote.id }
                });

            } 
            else {

                // update vote if different type
                vote =await prisma.vote.update({
                    where: { id: existingVote.id },
                    data: { isUpvote }
                });
            }
        } 
        else {

            // create new vote
            vote = await prisma.vote.create({
                data: {
                    isUpvote,
                    voterId,
                    ...(targetType.toLowerCase() === 'post' ? { postId: parsedTargetId } : { commentId: parsedTargetId })
                },
                select: {
                    id: true,
                    isUpvote: true,
                    voterId: true
                }
            });

        }

        // return vote
        return res.status(200).json({ vote });

    } 
    catch (error) {

        return res.status(500).json({ error: "An unexpected error occurred while processing the vote"});

    }

}

export default withAuth(handler); 