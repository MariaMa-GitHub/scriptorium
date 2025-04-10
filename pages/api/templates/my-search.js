import prisma from '@/utils/db';
import { withAuth } from '@/utils/auth';

async function handler(req, res) {

    // check if method is GET
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {

        // get search query, sort options, and pagination parameters from request
        const { query, sortByTitle, sortByTags, sortByContent, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // get author id from request
        const authorId = req.user.id;

        // validate input
        if (!query) {
            return res.status(400).json({ error: "Search query is required" });
        }

        // validate page number
        if (page < 1) {
            return res.status(400).json({ error: "Invalid page number" });
        }

        let templates = [];
        let total = 0;

        if (sortByTitle.toLowerCase() === 'true') {
            [templates, total] = await Promise.all([
                prisma.template.findMany({
                    where: { 
                        authorId,
                        title: { contains: query.toLowerCase() } 
                    },
                    skip: parseInt(skip),
                    take: parseInt(limit),
                    select: {
                        id: true,
                        title: true,
                        language: true,
                        explanation: true,
                        tags: {
                            select: { name: true },
                        },
                    },
                }),
                prisma.template.count({
                    where: { 
                        authorId,
                        title: { contains: query.toLowerCase() } 
                    }
                })
            ]);
        } 
        else if (sortByTags.toLowerCase() === 'true') {
            [templates, total] = await Promise.all([
                prisma.template.findMany({
                    where: { 
                        authorId,
                        tags: { 
                            some: { name: { contains: query.toLowerCase() } }
                        }
                    },
                    skip: parseInt(skip),
                    take: parseInt(limit),
                    select: {
                        id: true,
                        title: true,
                        language: true,
                        explanation: true,
                        tags: {
                            select: { name: true },
                        },
                    },
                }),
                prisma.template.count({
                    where: { 
                        authorId,
                        tags: { 
                            some: { name: { contains: query.toLowerCase() } }
                        }
                    }
                })
            ]);
        } 
        else if (sortByContent.toLowerCase() === 'true') {
            [templates, total] = await Promise.all([
                prisma.template.findMany({
                    where: { 
                        authorId,
                        code: { contains: query.toLowerCase() }
                    },
                    skip: parseInt(skip),
                    take: parseInt(limit),
                    select: {
                        id: true,
                        title: true,
                        language: true,
                        explanation: true,
                        tags: {
                            select: { name: true },
                        },
                    },
                }),
                prisma.template.count({
                    where: { 
                        authorId,
                        code: { contains: query.toLowerCase() }
                    }
                })
            ]);
        }
        else {
            
            return res.status(400).json({ error: "Invalid sort criteria" });
       
        }

        // return found templates
        return res.status(200).json({ 
            templates,
            total,
            totalPages: Math.ceil(total / parseInt(limit))
        });

    }
    catch (error) {

        return res.status(500).json({ error: "An unexpected error occurred while searching for templates" });

    }

}

export default withAuth(handler);