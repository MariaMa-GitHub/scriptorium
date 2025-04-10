import prisma from '@/utils/db';

export default async function handler(req, res) {

    // check if method is GET
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {

        // get template id from request query
        const { id } = req.query;
        const templateId = parseInt(id);

        // check if template id is provided and valid
        if (isNaN(templateId)) {
            return res.status(400).json({ error: "Invalid template ID" });
        }

        // retrieve the template from the database
        let template = await prisma.template.findUnique({
            where: { id: templateId },
        });

        // check if the template exists
        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        // select the template fields
        template = await prisma.template.findUnique({
            where: { id: templateId },
            select: {
                id: true,
                title: true,
                code: true,
                language: true,
                explanation: true,
                createdAt: true,
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
                posts: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
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
            },
        });

        // return the template
        return res.status(200).json(template);

    }
    catch (error) {

        return res.status(500).json({ error: "An unexpected error occurred while fetching a template" });
    
    }

}