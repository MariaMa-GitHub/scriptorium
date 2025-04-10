import { useState } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';

interface PostFormProps {
  initialData?: {
    title: string;
    content: string;
    description: string;
    tagList: string;
  };
  onSubmit: (data: {
    title: string;
    content: string;
    description: string;
    tagList: string;
  }) => Promise<void>;
  buttonText: string;
}

export default function PostForm({ initialData, onSubmit, buttonText }: PostFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    description: initialData?.description || '',
    tagList: initialData?.tagList || '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError('Failed to save post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
        multiline
        rows={2}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Content"
        name="content"
        value={formData.content}
        onChange={handleChange}
        required
        multiline
        rows={10}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Tags (comma-separated)"
        name="tagList"
        value={formData.tagList}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        fullWidth
      >
        {isSubmitting ? 'Saving...' : buttonText}
      </Button>
    </Box>
  );
} 