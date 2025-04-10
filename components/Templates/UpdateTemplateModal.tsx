import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Box, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useRouter } from 'next/router';

interface UpdateTemplateModalProps {
  open: boolean;
  onClose: () => void;
  template: {
    id: number;
    title: string;
    code: string;
    language: string;
    explanation: string;
    tags: { name: string }[];
  };
  onUpdate: () => void;
}

export default function UpdateTemplateModal({ open, onClose, template, onUpdate }: UpdateTemplateModalProps) {
  const [title, setTitle] = useState(template.title);
  const [code, setCode] = useState(template.code);
  const [language, setLanguage] = useState(template.language);
  const [explanation, setExplanation] = useState(template.explanation);
  const [tagList, setTagList] = useState(template.tags.map(tag => tag.name).join(', '));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleClose = () => {
    const { edit, ...query } = router.query;
    router.push({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
    onClose();
  };

  const handleSubmit = async () => {
    if (!title || !code || !language || !explanation) return;
    
    setError('');
    setIsSubmitting(true);
  
    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'PUT',
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
          tagList
        }),
      });
  
      const data = await response.json();
      
      if (response.ok) {
        onUpdate();
        handleClose();
      } else {
        setError(data.error || 'Failed to update template');
      }
    } catch (err) {
      setError('Failed to update template');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box sx={{ p: 3 }}>
        <DialogTitle sx={{ p: 0, mb: 3 }}>Update Template</DialogTitle>
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
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={language}
              label="Language"
              onChange={(e) => setLanguage(e.target.value)}
              required
            >
              <MenuItem value="javascript">JavaScript</MenuItem>
              <MenuItem value="python">Python</MenuItem>
              <MenuItem value="java">Java</MenuItem>
              <MenuItem value="cpp">C++</MenuItem>
              <MenuItem value="c">C</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            multiline
            rows={10}
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
            disabled={isSubmitting || !title || !code || !language || !explanation}
          >
            {isSubmitting ? 'Updating...' : 'Update Template'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}