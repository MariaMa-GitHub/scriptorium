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

        // get templates from database
        const [total, templates] = await Promise.all([
            prisma.template.count(),
            prisma.template.findMany({
                skip: parseInt(skip),
                take: parseInt(limit),
                select: {
                    id: true,
                    title: true,
                    language: true,
                    explanation: true,
                    tags: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
        ]);

        // return templates
        return res.status(200).json({ 
            templates,
            total,
            totalPages: Math.ceil(total / parseInt(limit))
        });

    }
    catch (error) {
        
        return res.status(500).json({ error: "An unexpected error occurred while fetching templates" });

    }
}