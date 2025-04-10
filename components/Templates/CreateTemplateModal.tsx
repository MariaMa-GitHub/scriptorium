import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button,
  Alert,
  Box
} from '@mui/material';
import { useRouter } from 'next/router';

interface CreateTemplateModalProps {
  open: boolean;
  onClose: () => void;
  code: string;
  language: string;
}

export default function CreateTemplateModal({ open, onClose, code, language }: CreateTemplateModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [explanation, setExplanation] = useState('');
  const [tagList, setTagList] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !explanation) return;
    
    setError('');
    setIsSubmitting(true);
  
    try {
      const response = await fetch('/api/templates/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          title,
          code,
          language,
          explanation,
          tagList: tagList.trim() || undefined
        }),
      });
  
      const data = await response.json();
      
      if (response.ok) {
        router.push('/my-templates');
      } else {
        setError(data.error || 'Failed to create template');
        console.error('Template creation failed:', data);
      }
    } catch (err) {
      console.error('Template creation error:', err);
      setError('Failed to create template. Please check the console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ p: 3 }}>
        <DialogTitle sx={{ p: 0, mb: 3 }}>Save as Template</DialogTitle>
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
            label="Explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            required
            multiline
            rows={4}
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
            disabled={isSubmitting || !title || !explanation}
          >
            {isSubmitting ? 'Saving...' : 'Save Template'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}