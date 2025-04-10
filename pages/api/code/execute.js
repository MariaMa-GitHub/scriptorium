import { executeCode } from '@/utils/docker';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, language, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { stdout, stderr } = await executeCode(code, language, input);
    return res.status(200).json({ stdout, stderr });

  } catch (error) {
    return res.status(500).json({ 
      error: 'An error occurred during code execution' 
    });
  }
}