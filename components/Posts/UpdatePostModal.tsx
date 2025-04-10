import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Box, 
  Alert
} from '@mui/material';
import { useRouter } from 'next/router';

interface UpdatePostModalProps {
  open: boolean;
  onClose: () => void;
  post: {
    id: number;
    title: string;
    content: string;
    description: string;
    tags: { name: string }[];
  };
  onUpdate: () => void;
}

export default function UpdatePostModal({ open, onClose, post, onUpdate }: UpdatePostModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [description, setDescription] = useState(post.description);
  const [tagList, setTagList] = useState(post.tags.map(tag => tag.name).join(', '));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    const { edit, ...query } = router.query;
    router.push({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          title,
          description,
          content,
          tagList
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        onUpdate();
        handleClose();
      } else {
        setError(data.error || 'Failed to update post');
      }
    } catch (err) {
      setError('Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box sx={{ p: 3 }}>
        <DialogTitle sx={{ p: 0, mb: 3 }}>Update Post</DialogTitle>
        <DialogContent sx={{ p: 0, mb: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            multiline
            rows={10}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            value={tagList}
            onChange={(e) => setTagList(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 0 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={isSubmitting || !title || !content}
          >
            {isSubmitting ? 'Updating...' : 'Update Post'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}