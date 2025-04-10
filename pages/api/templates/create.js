import { withAuth } from "@/utils/auth";
import prisma from '@/utils/db';

async function handler(req, res) {

    // check if request method is POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    try {

        // get template data from request body
        const { title, code, language, explanation, tagList } = req.body;
        
        // check if required fields are provided
        if (!title || !code || !language) {
            return res.status(400).json({ error: "Missing required fields" });
        }
  
        // get author id from request user
        const authorId = req.user.id;
      
        // create template data object
        const templateData = {
            title,
            code,
            language,
            explanation,
            author: { connect: { id: authorId } }
        };
  
        // only process tags if tagList exists and is not empty
        if (tagList) {
            const tagNames = tagList.split(",").map(tag => tag.trim()).filter(Boolean);
        
            if (tagNames.length > 0) {
                const tags = await Promise.all(tagNames.map(async (name) => {
                    return await prisma.tag.upsert({
                        where: { name },
                        update: {},
                        create: { name },
                    });
                }));
  
                templateData.tags = { connect: tags.map(tag => ({ id: tag.id })) };
            }
        }
  
        // create template in database
        const template = await prisma.template.create({
            data: templateData,
            include: {
                tags: true
            }
        });
  
        // update user's templates with the new template
        await prisma.user.update({
            where: { id: authorId },
            data: { templates: { connect: { id: template.id } } },
        });
  
        // return the created template
        return res.status(200).json(template);
  
    } 
    catch (error) {

      return res.status(500).json({ error: "An unexpected error occurred while creating a template" });
    
    }

}

export default withAuth(handler);