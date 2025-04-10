import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Alert,
  Chip,
  Autocomplete,
  Paper
} from '@mui/material';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

type Template = {
  id: number;
  title: string;
};

export default function CreatePost() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch available templates on component mount
  useEffect(() => {

    if (!router.isReady) return;
  
    if (user === null) {
        router.push('/login');
        return;
    }

    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates/list');
        const data = await response.json();
        if (response.ok) {
          setAvailableTemplates(data.templates);
        }
      } catch (err) {
        setError('Failed to fetch templates');
      }
    };

    fetchTemplates();
  }, [user, router]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          title,
          description,
          content,
          tagList: tags.join(','),
          templateList: templates.map(t => t.id)
        }),
      });

      const data = await response.json();
      if (response.ok) {
        router.push('/my-posts');
      } else {
        setError(data.error || 'Failed to create post');
      }
    } catch (err) {
      setError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
          Create New Post
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper 
        sx={{ 
            p: 3,
            border: '1px solid #e0e0e0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }}
        >
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />

            <TextField
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              multiline
              rows={10}
              required
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                label="Add Tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button onClick={handleAddTag}>Add Tag</Button>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                />
              ))}
            </Box>

            <Autocomplete
              multiple
              options={availableTemplates}
              getOptionLabel={(option) => option.title}
              value={templates}
              onChange={(_, newValue) => setTemplates(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Link Templates"
                  placeholder="Search templates"
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ alignSelf: 'flex-start' }}
            >
              Create Post
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}